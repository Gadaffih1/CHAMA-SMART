/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { db, initDatabase, generateSqlDump, DUMP_DIR } from './src/server/db.ts';
import {
  allChamas, allMembers, attachSession, authenticateMember, authenticateSuperAdmin, clearSessionCookie,
  createSession, currentSessionToken, destroySession, findMemberById, hashPassword, initAuthTables, initSuperAdminCredential,
  migrateEmbeddedPasswordHashes, normalizePhone, removeOrphanCredentials, requireAuth, requireSuperAdmin,
  resetFailureTracking, revokeAllSessions, roleInChama, sameOriginGuard, setCredential, setCredentialWithHash, setSessionCookie,
  stripSecrets, validatePassword,
} from './src/server/auth.ts';
import type { Chama, Member } from './src/types/index.ts';

const APP_ROOT = process.cwd();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize DB and default seeds
  initDatabase();
  initAuthTables();
  migrateEmbeddedPasswordHashes();
  initSuperAdminCredential();

  app.use('/api', sameOriginGuard, attachSession);

  app.get('/api/health', (_req, res) => {
    try {
      db.prepare('SELECT 1').get();
      res.json({ status: 'ok', database: 'sqlite' });
    } catch (error) {
      console.error('Database health check failed:', error);
      res.status(503).json({ status: 'error', database: 'sqlite' });
    }
  });

  // ----------------------------------------------------
  // REST DATABASE API ENDPOINTS (Strict Server Storage)
  // ----------------------------------------------------

  // ----------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------

  const throttleKey = (req: express.Request, subject: unknown) =>
    `${req.ip}|${typeof subject === 'string' ? subject.trim().toLowerCase().slice(0, 100) : ''}`;

  app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body ?? {};
    const key = throttleKey(req, identifier);
    const member = authenticateMember(identifier, password, key);
    if (!member) {
      return res.status(401).json({ error: 'Invalid credentials, or the account is locked or inactive. Contact your Chama administrator.' });
    }
    const chama = allChamas().find(c => c.id === member.chamaId);
    if (chama && chama.status && chama.status !== 'active') {
      return res.status(403).json({
        error: `Your Chama workspace (${chama.name}) is currently ${chama.status.toUpperCase()} by Platform Super Admin. Reason: ${chama.statusReason || 'Subscription / compliance hold'}. Please contact platform administration.`
      });
    }
    setSessionCookie(req, res, createSession({ kind: 'member', memberId: member.id }));
    const { passwordHash: _passwordHash, ...safe } = member;
    res.json({ role: 'member', member: safe });
  });

  app.post('/api/auth/super-admin/login', (req, res) => {
    if (!authenticateSuperAdmin(req.body?.password, throttleKey(req, 'super-admin'))) {
      return res.status(401).json({ error: 'Invalid operator security password.' });
    }
    setSessionCookie(req, res, createSession({ kind: 'super_admin' }));
    res.json({ role: 'super_admin' });
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = currentSessionToken(req);
    if (token) destroySession(token);
    clearSessionCookie(res);
    res.json({ success: true });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const session = req.session!;
    if (session.kind === 'super_admin') return res.json({ role: 'super_admin' });
    const entry = findMemberById(session.memberId)!;
    const { passwordHash: _passwordHash, ...safe } = entry.member;
    res.json({ role: 'member', member: safe });
  });

  // Secretary / Chama Admin (own chama) or Super Admin set and reset passwords.
  app.put('/api/auth/members/:memberId/password', requireAuth, (req, res) => {
    const target = findMemberById(req.params.memberId);
    if (!target) return res.status(404).json({ error: 'User account not found.' });
    const actorRole = roleInChama(req.session!, target.chama);
    const isSelf = req.session!.kind === 'member' && req.session!.memberId === target.member.id;
    const canManage = actorRole === 'super_admin' || actorRole === 'secretary' || actorRole === 'chairperson';
    if (!canManage) return res.status(403).json({ error: 'Only the Super Admin, Secretary, or Chama Admin can set or reset passwords.' });
    if (actorRole !== 'super_admin' && !isSelf) {
      const protectedRole = target.member.role === 'chairperson' ||
        (target.member.role === 'secretary' && actorRole !== 'chairperson');
      if (protectedRole) return res.status(403).json({ error: 'You cannot reset the password of a user with equal or higher authority.' });
    }
    const problem = validatePassword(req.body?.password);
    if (problem) return res.status(400).json({ error: problem });
    setCredential(target.member.id, req.body.password);
    res.json({ success: true });
  });

  // Onboard a member with an initial password.
  app.post('/api/db/chamas/:chamaId/members', requireAuth, (req, res) => {
    try {
      const chama = allChamas().find(item => item.id === req.params.chamaId);
      if (!chama) return res.status(404).json({ error: 'Chama workspace not found.' });
      const actorRole = roleInChama(req.session!, chama);
      if (actorRole !== 'super_admin' && actorRole !== 'secretary' && actorRole !== 'chairperson') {
        return res.status(403).json({ error: 'Only the Super Admin, Secretary, or Chama Admin can onboard member accounts.' });
      }

      const { password, ...data } = req.body ?? {};
      const str = (value: unknown, max = 200) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
      const name = str(data.name);
      const phoneNumber = str(data.phoneNumber, 20);
      const email = str(data.email);
      const membershipNumber = str(data.membershipNumber, 50);
      const role = data.role ?? 'member';
      if (!name || !phoneNumber || !membershipNumber) {
        return res.status(400).json({ error: 'Name, phone number, and membership number are required.' });
      }
      if (!['member', 'chairperson', 'treasurer', 'secretary', 'loan_officer'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role.' });
      }
      if (role !== 'member' && actorRole !== 'super_admin' && actorRole !== 'chairperson') {
        return res.status(403).json({ error: 'Only the Super Admin or Chama Admin can assign officer roles.' });
      }
      const problem = validatePassword(password);
      if (problem) return res.status(400).json({ error: problem });

      const duplicate = allMembers().find(({ member }) =>
        normalizePhone(member.phoneNumber) === normalizePhone(phoneNumber) ||
        member.membershipNumber.toLowerCase() === membershipNumber.toLowerCase() ||
        (!!email && member.email?.toLowerCase() === email.toLowerCase()));
      if (duplicate) return res.status(409).json({ error: 'A user account already exists with that phone, email, or membership number.' });

      const member: Member = {
        id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        chamaId: chama.id,
        name,
        phoneNumber,
        email,
        membershipNumber,
        joinedDate: str(data.joinedDate, 30) || new Date().toISOString().slice(0, 10),
        role,
        totalSavings: 0,
        sharesCount: 0,
        activeLoanBalance: 0,
        creditScore: 720,
        nextOfKin: {
          name: str(data.nextOfKin?.name),
          relationship: str(data.nextOfKin?.relationship),
          phone: str(data.nextOfKin?.phone, 20),
        },
        kycVerified: true,
        attendanceRate: 100,
        status: 'active',
      };
      const updated: Chama = { ...chama, members: [...chama.members, member] };
      saveChamaRow(updated);
      setCredential(member.id, password);
      generateSqlDump();
      res.status(201).json(member);
    } catch (err: any) {
      console.error('Error onboarding member:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // CHAMA DATA
  // ----------------------------------------------------

  const upsertChama = db.prepare(`
    INSERT INTO chamas (id, name, category, tagline, county, country, registration_number, formed_date, currency, plan_tier, monthly_subscription_ksh, mpesa_paybill_or_till, account_number, raw_data, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      tagline = excluded.tagline,
      county = excluded.county,
      plan_tier = excluded.plan_tier,
      monthly_subscription_ksh = excluded.monthly_subscription_ksh,
      raw_data = excluded.raw_data,
      updated_at = CURRENT_TIMESTAMP
  `);

  function saveChamaRow(chama: Chama) {
    const clean = stripSecrets(chama);
    upsertChama.run(
      clean.id,
      clean.name,
      clean.category,
      clean.tagline || '',
      clean.county,
      clean.country || 'Kenya',
      clean.registrationNumber || '',
      clean.formedDate || new Date().toISOString().slice(0, 10),
      clean.currency || 'KSh',
      clean.planTier || 'Basic',
      clean.monthlySubscriptionKsh || 500,
      clean.mpesaPaybillOrTill || '',
      clean.accountNumber || '',
      JSON.stringify(clean)
    );
  }

  const isChamaPayload = (chama: any): chama is Chama =>
    !!chama && typeof chama.id === 'string' && typeof chama.name === 'string' && Array.isArray(chama.members);

  // Non-super-admin writers may not add/remove accounts or change login identities;
  // only the Chama Admin may change roles, and only officials may change status.
  function mergeMemberChanges(existing: Chama, incoming: Chama, actorRole: string): Chama {
    const incomingById = new Map(incoming.members.map(member => [member.id, member]));
    const members = existing.members.map(current => {
      const proposed = incomingById.get(current.id);
      if (!proposed) return current;
      return {
        ...proposed,
        id: current.id,
        chamaId: current.chamaId,
        phoneNumber: current.phoneNumber,
        email: current.email,
        membershipNumber: current.membershipNumber,
        role: actorRole === 'chairperson' ? proposed.role : current.role,
        status: actorRole === 'chairperson' || actorRole === 'secretary' ? proposed.status : current.status,
      } as Member;
    });
    return { ...incoming, id: existing.id, members };
  }

  app.get('/api/db/chamas', requireAuth, (req, res) => {
    try {
      const chamas = allChamas()
        .filter(chama => roleInChama(req.session!, chama) !== null)
        .map(stripSecrets);
      res.json(chamas);
    } catch (err: any) {
      console.error('Error fetching chamas:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Provision a Chama (Super Admin only)
  app.post('/api/db/chamas', requireSuperAdmin, (req, res) => {
    try {
      const payload = req.body ?? {};
      const { chairpersonPassword, ...chama } = payload;
      if (!chama || !chama.id || !chama.name) {
        return res.status(400).json({ error: 'Invalid chama payload' });
      }
      saveChamaRow(chama);
      const chairMember = chama.members?.find((m: any) => m.role === 'chairperson') || chama.members?.[0];
      if (chairMember && chairpersonPassword) {
        const problem = validatePassword(chairpersonPassword);
        if (!problem) {
          setCredential(chairMember.id, chairpersonPassword);
        }
      }
      generateSqlDump();
      res.json({ success: true, chamaId: chama.id });
    } catch (err: any) {
      console.error('Error saving chama to DB:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Batch sync, scoped by the caller's role in each chama.
  app.post('/api/db/chamas/sync', requireAuth, (req, res) => {
    try {
      const chamas = req.body;
      if (!Array.isArray(chamas)) {
        return res.status(400).json({ error: 'Payload must be array of chamas' });
      }
      const session = req.session!;
      const existingById = new Map(allChamas().map(chama => [chama.id, chama]));
      let saved = 0;

      db.transaction(() => {
        for (const incoming of chamas) {
          if (!isChamaPayload(incoming)) continue;
          if (session.kind === 'super_admin') {
            saveChamaRow(incoming);
            saved++;
            continue;
          }
          const existing = existingById.get(incoming.id);
          const actorRole = existing ? roleInChama(session, existing) : null;
          if (!existing || !actorRole) continue;
          saveChamaRow(mergeMemberChanges(existing, incoming, actorRole));
          saved++;
        }
        if (session.kind === 'super_admin') removeOrphanCredentials();
      })();

      generateSqlDump();
      res.json({ success: true, count: saved });
    } catch (err: any) {
      console.error('Error syncing chamas:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Delete a Chama workspace (Super Admin only)
  app.delete('/api/db/chamas/:id', requireSuperAdmin, (req, res) => {
    try {
      const { id } = req.params;
      db.prepare('DELETE FROM chamas WHERE id = ?').run(id);
      db.prepare('DELETE FROM members WHERE chama_id = ?').run(id);
      db.prepare('DELETE FROM transactions WHERE chama_id = ?').run(id);
      db.prepare('DELETE FROM audit_logs WHERE chama_id = ?').run(id);
      removeOrphanCredentials();
      generateSqlDump();
      res.json({ success: true, message: `Chama ${id} deleted` });
    } catch (err: any) {
      console.error('Error deleting chama:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Settings endpoints (e.g. system_till_number, subscription_tiers)
  app.get('/api/db/settings/:key', (_req, res) => {
    try {
      const row = db.prepare('SELECT value FROM system_settings WHERE key = ?').get(req.params.key) as { value: string } | undefined;
      res.json(row ? JSON.parse(row.value) : null);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/db/settings/:key', requireSuperAdmin, (req, res) => {
    try {
      const { key } = req.params;
      db.prepare(`
        INSERT INTO system_settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(key, JSON.stringify(req.body));
      generateSqlDump();
      res.json({ success: true, key });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/db/categories', (_req, res) => {
    try {
      const row = db.prepare("SELECT value FROM system_settings WHERE key = 'chama_categories'").get() as { value: string } | undefined;
      res.json(row ? JSON.parse(row.value) : []);
    } catch (err: any) {
      console.error('Error fetching chama categories:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/db/categories', requireSuperAdmin, (req, res) => {
    try {
      const categories = req.body;
      if (
        !Array.isArray(categories) ||
        categories.length === 0 ||
        categories.length > 50 ||
        categories.some(category =>
          typeof category !== 'string' ||
          category.length > 64 ||
          !/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(category)
        ) ||
        new Set(categories).size !== categories.length
      ) {
        return res.status(400).json({ error: 'Categories must be unique lowercase slugs, with 1 to 50 entries.' });
      }

      db.prepare(`
        INSERT INTO system_settings (key, value) VALUES ('chama_categories', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(JSON.stringify(categories));
      generateSqlDump();
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error saving chama categories:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Fetch Registration Applications
  app.get('/api/db/applications', requireSuperAdmin, (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM registration_applications ORDER BY submitted_at DESC').all() as any[];
      const apps = rows.map(r => ({
        id: r.id,
        chamaName: r.chama_name,
        category: r.category,
        tagline: r.tagline,
        county: r.county,
        country: r.country,
        registrationNumber: r.registration_number,
        applicantChairpersonName: r.applicant_chairperson_name,
        applicantPhone: r.applicant_phone,
        applicantEmail: r.applicant_email,
        initialMemberCount: r.initial_member_count,
        planTier: r.plan_tier,
        status: r.status,
        hasPassword: !!r.applicant_password_hash,
        submittedAt: r.submitted_at,
        reviewedAt: r.reviewed_at,
        rejectionReason: r.rejection_reason,
        superAdminNotes: r.super_admin_notes,
      }));
      res.json(apps);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Submit Registration Application (public; always created as pending)
  app.post('/api/db/applications', (req, res) => {
    try {
      const appData = req.body ?? {};
      const text = (value: unknown, max = 200) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
      const id = text(appData.id, 64);
      const chamaName = text(appData.chamaName);
      const category = text(appData.category, 64);
      const county = text(appData.county);
      const applicantChairpersonName = text(appData.applicantChairpersonName);
      const applicantPhone = text(appData.applicantPhone, 20);
      if (!id || !chamaName || !category || !county || !applicantChairpersonName || !applicantPhone) {
        return res.status(400).json({ error: 'Missing required application fields.' });
      }

      let applicantPasswordHash: string | null = null;
      const rawPassword = appData.password ?? appData.applicantPassword;
      if (rawPassword) {
        const problem = validatePassword(rawPassword);
        if (problem) {
          return res.status(400).json({ error: problem });
        }
        applicantPasswordHash = hashPassword(rawPassword);
      }

      const initialMemberCount = Math.min(Math.max(Number(appData.initialMemberCount) || 15, 1), 100000);

      const result = db.prepare(`
        INSERT OR IGNORE INTO registration_applications (id, chama_name, category, tagline, county, country, registration_number, applicant_chairperson_name, applicant_phone, applicant_email, initial_member_count, plan_tier, status, applicant_password_hash, submitted_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', ?, ?, CURRENT_TIMESTAMP)
      `).run(
        id,
        chamaName,
        category,
        text(appData.tagline, 500),
        county,
        text(appData.country) || 'Kenya',
        text(appData.registrationNumber, 100),
        applicantChairpersonName,
        applicantPhone,
        text(appData.applicantEmail),
        initialMemberCount,
        ['Starter', 'Basic', 'Growth', 'Professional', 'Enterprise'].includes(appData.planTier) ? appData.planTier : 'Basic',
        applicantPasswordHash,
        text(appData.submittedAt, 40) || new Date().toISOString().replace('T', ' ').substring(0, 16)
      );
      if (result.changes === 0) return res.status(409).json({ error: 'Application already exists.' });

      generateSqlDump();
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Update Application Status (Super Admin Review)
  app.patch('/api/db/applications/:id', requireSuperAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const { status, reviewedAt, rejectionReason, superAdminNotes, chairpersonMemberId, chairpersonPassword } = req.body ?? {};

      const stmt = db.prepare(`
        UPDATE registration_applications 
        SET status = ?, reviewed_at = ?, rejection_reason = ?, super_admin_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(status, reviewedAt || null, rejectionReason || null, superAdminNotes || null, id);

      // If approved and chairpersonMemberId provided, activate the chairperson's credentials
      if (status === 'approved' && chairpersonMemberId) {
        if (chairpersonPassword) {
          const problem = validatePassword(chairpersonPassword);
          if (!problem) {
            setCredential(chairpersonMemberId, chairpersonPassword);
          }
        } else {
          const row = db.prepare('SELECT applicant_password_hash FROM registration_applications WHERE id = ?').get(id) as { applicant_password_hash?: string | null } | undefined;
          if (row?.applicant_password_hash) {
            setCredentialWithHash(chairpersonMemberId, row.applicant_password_hash);
          }
        }
      }

      generateSqlDump();
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Generate & Download SQL Dump Export
  app.get('/api/db/export-sql-dump', requireSuperAdmin, (req, res) => {
    try {
      const result = generateSqlDump();
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(result.filePath)}"`);
      res.send(result.sqlContent);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. List all available dumps in export_sql_dump folder
  app.get('/api/db/dumps', requireSuperAdmin, (req, res) => {
    try {
      if (!fs.existsSync(DUMP_DIR)) {
        return res.json([]);
      }
      const files = fs.readdirSync(DUMP_DIR).filter(f => f.endsWith('.sql'));
      const list = files.map(filename => {
        const filePath = path.join(DUMP_DIR, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          sizeBytes: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      });
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8b. Download specific SQL dump file directly
  app.get('/api/db/dumps/:filename', requireSuperAdmin, (req, res) => {
    try {
      const { filename } = req.params;
      const DUMP_DIR = path.resolve(__dirname, 'export_sql_dump');
      const safeFilename = path.basename(filename);
      const filePath = path.join(DUMP_DIR, safeFilename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).send('SQL dump file not found');
      }

      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Reset DB to seed defaults
  app.post('/api/db/reset', requireSuperAdmin, (req, res) => {
    try {
      revokeAllSessions();
      resetFailureTracking();
      db.prepare('DELETE FROM chamas').run();
      db.prepare('DELETE FROM members').run();
      db.prepare('DELETE FROM registration_applications').run();
      db.prepare('DELETE FROM transactions').run();
      db.prepare('DELETE FROM audit_logs').run();
      db.prepare("DELETE FROM system_settings WHERE key = 'chama_categories'").run();

      initDatabase();
      res.json({ success: true, message: 'Database reset to default seed records' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.join(APP_ROOT, 'dist');
    const indexPath = path.join(distDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error(`Production build not found at ${indexPath}; run npm run build first`);
    }
    app.use(express.static(distDir));
    app.get('*', (_req, res) => res.sendFile(indexPath));
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChamaSmart Full-Stack Database Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start ChamaSmart server:', error);
  process.exitCode = 1;
});
