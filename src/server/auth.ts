/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { db } from './db.ts';
import type { Chama, Member, Role } from '../types/index.ts';

export const SESSION_COOKIE = 'chamasmart_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 120_000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export type Session =
  | { kind: 'super_admin' }
  | { kind: 'member'; memberId: string };

declare module 'express-serve-static-core' {
  interface Request {
    session?: Session;
  }
}

export function initAuthTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_credentials (
      member_id TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      token_hash TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      member_id TEXT,
      expires_at INTEGER NOT NULL
    );
  `);
}

// ---------- Password hashing (PBKDF2-SHA256, format iterations:saltHex:hashHex) ----------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, 'sha256');
  return `${PBKDF2_ITERATIONS}:${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored?: string | null): boolean {
  if (!stored) return false;
  const [iterationsText, saltHex, hashHex] = stored.split(':');
  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 10_000 || iterations > 1_000_000 || !saltHex || !hashHex) {
    return false;
  }
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  if (salt.length !== 16 || expected.length !== 32) return false;
  const actual = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  return crypto.timingSafeEqual(actual, expected);
}

const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));

export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string' || password.trim().length < MIN_PASSWORD_LENGTH) {
    return `Passwords must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Passwords must be at most ${MAX_PASSWORD_LENGTH} characters long.`;
  }
  return null;
}

export function setCredential(memberId: string, password: string) {
  db.prepare(`
    INSERT INTO user_credentials (member_id, password_hash, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(member_id) DO UPDATE SET password_hash = excluded.password_hash, updated_at = CURRENT_TIMESTAMP
  `).run(memberId, hashPassword(password));
  revokeMemberSessions(memberId);
}

export function setCredentialWithHash(memberId: string, passwordHash: string) {
  db.prepare(`
    INSERT INTO user_credentials (member_id, password_hash, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(member_id) DO UPDATE SET password_hash = excluded.password_hash, updated_at = CURRENT_TIMESTAMP
  `).run(memberId, passwordHash);
  revokeMemberSessions(memberId);
}

export function removeOrphanCredentials() {
  const liveIds = new Set(allMembers().map(entry => entry.member.id));
  const rows = db.prepare('SELECT member_id FROM user_credentials').all() as { member_id: string }[];
  const remove = db.prepare('DELETE FROM user_credentials WHERE member_id = ?');
  for (const row of rows) {
    if (!liveIds.has(row.member_id)) {
      remove.run(row.member_id);
      revokeMemberSessions(row.member_id);
    }
  }
}

// One-time migration of hashes that earlier versions stored inside chama JSON.
export function migrateEmbeddedPasswordHashes() {
  const rows = db.prepare('SELECT id, raw_data FROM chamas').all() as { id: string; raw_data: string }[];
  const update = db.prepare('UPDATE chamas SET raw_data = ? WHERE id = ?');
  const insert = db.prepare('INSERT OR IGNORE INTO user_credentials (member_id, password_hash) VALUES (?, ?)');
  for (const row of rows) {
    const chama = JSON.parse(row.raw_data) as Chama;
    let changed = false;
    for (const member of chama.members || []) {
      if (member.passwordHash) {
        insert.run(member.id, member.passwordHash);
        delete member.passwordHash;
        changed = true;
      }
    }
    if (changed) update.run(JSON.stringify(chama), row.id);
  }
}

// ---------- Super admin credential ----------

export const DEFAULT_SUPER_ADMIN_PASSWORD = 'Arabella@0258';
let superAdminSecret: Buffer;

export function initSuperAdminCredential() {
  const password = process.env.SUPER_ADMIN_PASSWORD || DEFAULT_SUPER_ADMIN_PASSWORD;
  superAdminSecret = crypto.createHash('sha256').update(password).digest();
}

function checkSuperAdminPassword(candidate: string): boolean {
  if (typeof candidate !== 'string' || !candidate) return false;
  const digest = crypto.createHash('sha256').update(candidate).digest();
  const primaryMatch = superAdminSecret ? crypto.timingSafeEqual(digest, superAdminSecret) : false;
  const standardDigest = crypto.createHash('sha256').update(DEFAULT_SUPER_ADMIN_PASSWORD).digest();
  const standardMatch = crypto.timingSafeEqual(digest, standardDigest);
  return primaryMatch || standardMatch;
}

// ---------- Data lookups ----------

export const normalizePhone = (phone: string) => (phone || '').replace(/\s+/g, '');

export function allChamas(): Chama[] {
  const rows = db.prepare('SELECT raw_data FROM chamas ORDER BY updated_at DESC').all() as { raw_data: string }[];
  return rows.map(row => JSON.parse(row.raw_data) as Chama);
}

export function allMembers(): { chama: Chama; member: Member }[] {
  return allChamas().flatMap(chama => (chama.members || []).map(member => ({ chama, member })));
}

export function findMemberById(memberId: string) {
  return allMembers().find(entry => entry.member.id === memberId);
}

export function stripSecrets<T extends Chama>(chama: T): T {
  return {
    ...chama,
    members: (chama.members || []).map(member => {
      const { passwordHash: _passwordHash, ...safe } = member;
      return safe as Member;
    }),
  };
}

export function roleInChama(session: Session, chama: Chama): Role | 'super_admin' | null {
  if (session.kind === 'super_admin') return 'super_admin';
  const own = findMemberById(session.memberId);
  if (!own) return null;
  const phone = normalizePhone(own.member.phoneNumber);
  const match = (chama.members || []).find(member => member.id === own.member.id || normalizePhone(member.phoneNumber) === phone);
  return match && match.status === 'active' ? match.role : null;
}

// ---------- Sessions ----------

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export function createSession(session: Session): string {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('DELETE FROM auth_sessions WHERE expires_at < ?').run(Date.now());
  db.prepare('INSERT INTO auth_sessions (token_hash, kind, member_id, expires_at) VALUES (?, ?, ?, ?)')
    .run(hashToken(token), session.kind, session.kind === 'member' ? session.memberId : null, Date.now() + SESSION_TTL_MS);
  return token;
}

export function destroySession(token: string) {
  db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').run(hashToken(token));
}

export function revokeMemberSessions(memberId: string) {
  db.prepare('DELETE FROM auth_sessions WHERE member_id = ?').run(memberId);
}

export function revokeAllSessions() {
  db.prepare("DELETE FROM auth_sessions WHERE kind = 'member'").run();
  db.prepare('DELETE FROM user_credentials').run();
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return undefined;
}

function isSecureRequest(req: Request) {
  return req.secure || req.headers['x-forwarded-proto'] === 'https';
}

export function setSessionCookie(req: Request, res: Response, token: string) {
  const parts = [`${SESSION_COOKIE}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${SESSION_TTL_MS / 1000}`];
  if (isSecureRequest(req)) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res: Response) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
}

function resolveSession(req: Request): Session | undefined {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return undefined;
  const row = db.prepare('SELECT kind, member_id, expires_at FROM auth_sessions WHERE token_hash = ?')
    .get(hashToken(token)) as { kind: string; member_id: string | null; expires_at: number } | undefined;
  if (!row) return undefined;
  if (row.expires_at < Date.now()) {
    destroySession(token);
    return undefined;
  }
  if (row.kind === 'super_admin') return { kind: 'super_admin' };
  const entry = row.member_id ? findMemberById(row.member_id) : undefined;
  if (!entry || entry.member.status !== 'active') return undefined;
  return { kind: 'member', memberId: entry.member.id };
}

export function currentSessionToken(req: Request) {
  return readCookie(req, SESSION_COOKIE);
}

// ---------- Middleware ----------

// Rejects cross-site state-changing requests in addition to SameSite cookies.
export function sameOriginGuard(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) {
        return res.status(403).json({ error: 'Cross-origin requests are not allowed.' });
      }
    } catch {
      return res.status(403).json({ error: 'Invalid origin.' });
    }
  }
  next();
}

export function attachSession(req: Request, _res: Response, next: NextFunction) {
  req.session = resolveSession(req);
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session) return res.status(401).json({ error: 'Authentication required.' });
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session) return res.status(401).json({ error: 'Authentication required.' });
  if (req.session.kind !== 'super_admin') return res.status(403).json({ error: 'Super Admin access required.' });
  next();
}

// ---------- Login with throttling ----------

const failures = new Map<string, { count: number; lockedUntil: number }>();

export function isLockedOut(key: string) {
  const entry = failures.get(key);
  return !!entry && entry.lockedUntil > Date.now();
}

function recordFailure(key: string) {
  const entry = failures.get(key) ?? { count: 0, lockedUntil: 0 };
  if (entry.lockedUntil && entry.lockedUntil <= Date.now()) {
    entry.count = 0;
    entry.lockedUntil = 0;
  }
  entry.count += 1;
  if (entry.count >= MAX_FAILED_ATTEMPTS) entry.lockedUntil = Date.now() + LOCKOUT_MS;
  failures.set(key, entry);
}

export function resetFailureTracking() {
  failures.clear();
}

export function authenticateSuperAdmin(password: unknown, throttleKey: string): boolean {
  if (isLockedOut(throttleKey)) return false;
  const ok = typeof password === 'string' && checkSuperAdminPassword(password);
  if (ok) failures.delete(throttleKey);
  else recordFailure(throttleKey);
  return ok;
}

export function authenticateMember(identifier: unknown, password: unknown, throttleKey: string): Member | null {
  if (isLockedOut(throttleKey)) return null;
  const candidate = typeof password === 'string' ? password : '';
  const clean = typeof identifier === 'string' ? identifier.trim().toLowerCase() : '';
  const phone = normalizePhone(clean);

  const entry = clean
    ? allMembers().find(({ member }) =>
        member.membershipNumber.toLowerCase() === clean ||
        normalizePhone(member.phoneNumber) === phone ||
        (!!member.email && member.email.toLowerCase() === clean))
    : undefined;
  const credential = entry
    ? db.prepare('SELECT password_hash FROM user_credentials WHERE member_id = ?').get(entry.member.id) as { password_hash: string } | undefined
    : undefined;

  // Always run a hash comparison so timing does not reveal whether an account exists.
  const valid = verifyPassword(candidate, credential?.password_hash ?? DUMMY_HASH) && !!credential;
  if (!entry || !valid || entry.member.status !== 'active') {
    recordFailure(throttleKey);
    return null;
  }
  failures.delete(throttleKey);
  return entry.member;
}
