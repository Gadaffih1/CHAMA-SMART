/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { INITIAL_CHAMAS } from '../data/initialData.ts';
import { Chama, Member, ChamaRegistrationApplication } from '../types/index.ts';

const DATA_DIR = path.resolve(process.env.CHAMASMART_DATA_DIR || process.cwd());
const DB_DIR = path.join(DATA_DIR, 'database');
export const DUMP_DIR = path.join(DATA_DIR, 'export_sql_dump');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(DUMP_DIR)) {
  fs.mkdirSync(DUMP_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'chamasmart.db');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS chamas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      tagline TEXT,
      county TEXT NOT NULL,
      country TEXT NOT NULL,
      registration_number TEXT,
      formed_date TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'KSh',
      plan_tier TEXT NOT NULL,
      monthly_subscription_ksh INTEGER NOT NULL DEFAULT 500,
      mpesa_paybill_or_till TEXT,
      account_number TEXT,
      raw_data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      chama_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      email TEXT,
      membership_number TEXT NOT NULL,
      joined_date TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      total_savings REAL NOT NULL DEFAULT 0,
      shares_count INTEGER NOT NULL DEFAULT 0,
      active_loan_balance REAL NOT NULL DEFAULT 0,
      credit_score INTEGER NOT NULL DEFAULT 700,
      attendance_rate REAL NOT NULL DEFAULT 100,
      status TEXT NOT NULL DEFAULT 'active',
      next_of_kin_name TEXT,
      next_of_kin_relationship TEXT,
      next_of_kin_phone TEXT,
      FOREIGN KEY (chama_id) REFERENCES chamas (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS registration_applications (
      id TEXT PRIMARY KEY,
      chama_name TEXT NOT NULL,
      category TEXT NOT NULL,
      tagline TEXT,
      county TEXT NOT NULL,
      country TEXT NOT NULL,
      registration_number TEXT,
      applicant_chairperson_name TEXT NOT NULL,
      applicant_phone TEXT NOT NULL,
      applicant_email TEXT,
      initial_member_count INTEGER NOT NULL DEFAULT 15,
      plan_tier TEXT NOT NULL DEFAULT 'Basic',
      status TEXT NOT NULL DEFAULT 'pending_approval',
      submitted_at TEXT NOT NULL,
      reviewed_at TEXT,
      rejection_reason TEXT,
      super_admin_notes TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      chama_id TEXT NOT NULL,
      reference TEXT NOT NULL,
      mpesa_receipt TEXT,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      fund_type TEXT NOT NULL,
      member_id TEXT,
      member_name TEXT,
      initiated_by TEXT,
      status TEXT NOT NULL DEFAULT 'confirmed',
      payment_method TEXT NOT NULL,
      FOREIGN KEY (chama_id) REFERENCES chamas (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      chama_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT,
      severity TEXT NOT NULL DEFAULT 'info',
      FOREIGN KEY (chama_id) REFERENCES chamas (id) ON DELETE CASCADE
    );
  `);

  // Seed default chamas if empty
  const countStmt = db.prepare('SELECT COUNT(*) as cnt FROM chamas');
  const { cnt } = countStmt.get() as { cnt: number };

  if (cnt === 0) {
    const insertChama = db.prepare(`
      INSERT INTO chamas (id, name, category, tagline, county, country, registration_number, formed_date, currency, plan_tier, monthly_subscription_ksh, mpesa_paybill_or_till, account_number, raw_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMember = db.prepare(`
      INSERT INTO members (id, chama_id, name, phone_number, email, membership_number, joined_date, role, total_savings, shares_count, active_loan_balance, credit_score, attendance_rate, status, next_of_kin_name, next_of_kin_relationship, next_of_kin_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTx = db.prepare(`
      INSERT INTO transactions (id, chama_id, reference, mpesa_receipt, date, type, amount, description, fund_type, member_id, member_name, initiated_by, status, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (id, chama_id, timestamp, actor_name, actor_role, action, module, details, severity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      for (const chama of INITIAL_CHAMAS) {
        insertChama.run(
          chama.id,
          chama.name,
          chama.category,
          chama.tagline,
          chama.county,
          chama.country,
          chama.registrationNumber,
          chama.formedDate,
          chama.currency,
          chama.planTier,
          chama.monthlySubscriptionKsh,
          chama.mpesaPaybillOrTill,
          chama.accountNumber,
          JSON.stringify(chama)
        );

        for (const m of chama.members) {
          insertMember.run(
            m.id,
            chama.id,
            m.name,
            m.phoneNumber,
            m.email,
            m.membershipNumber,
            m.joinedDate,
            m.role,
            m.totalSavings,
            m.sharesCount,
            m.activeLoanBalance,
            m.creditScore,
            m.attendanceRate,
            m.status,
            m.nextOfKin?.name || '',
            m.nextOfKin?.relationship || '',
            m.nextOfKin?.phone || ''
          );
        }

        for (const t of chama.transactions) {
          insertTx.run(
            t.id,
            chama.id,
            t.reference,
            t.mpesaReceipt || null,
            t.date,
            t.type,
            t.amount,
            t.description,
            t.fundType,
            t.memberId || null,
            t.memberName || null,
            t.initiatedBy,
            t.status,
            t.paymentMethod
          );
        }

        for (const a of chama.auditLogs) {
          insertAudit.run(
            a.id,
            chama.id,
            a.timestamp,
            a.actorName,
            a.actorRole,
            a.action,
            a.module,
            a.details,
            a.severity
          );
        }
      }

      // Initial applications
      const insertApp = db.prepare(`
        INSERT INTO registration_applications (id, chama_name, category, tagline, county, country, registration_number, applicant_chairperson_name, applicant_phone, applicant_email, initial_member_count, plan_tier, status, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertApp.run(
        'app-101',
        'Kilimani Green Urban Farmers Syndicate',
        'investment',
        'High-tech hydroponic vertical farming and green export syndicate',
        'Nairobi City County',
        'Kenya',
        'SHG/NRB/2026/8819',
        'Eng. Dennis Kibet Kosgei',
        '+254719882233',
        'dennis.kibet@greenurban.ke',
        18,
        'Growth',
        'pending_approval',
        '2026-11-08 14:30'
      );

      insertApp.run(
        'app-102',
        'Eldoret Women Grains & Dairy Table Banking',
        'table_banking',
        'Empowering North Rift smallholder dairy and maize women traders',
        'Uasin Gishu County',
        'Kenya',
        'SHG/UG/2025/3910',
        'Janet Jepkemoi Chelagat',
        '+254728556677',
        'janet.chelagat@eldoretwomen.org',
        25,
        'Basic',
        'pending_approval',
        '2026-11-09 08:15'
      );
    });

    tx();
  }

  // Generate initial SQL dump file
  generateSqlDump();
}

/**
 * Generate full database export SQL dump into export_sql_dump/
 */
export function generateSqlDump(): { filePath: string; sqlContent: string; stats: any } {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `chamasmart_dump_${timestamp}.sql`;
  const latestFilename = 'chamasmart_dump_latest.sql';
  const dumpFilePath = path.join(DUMP_DIR, filename);
  const latestFilePath = path.join(DUMP_DIR, latestFilename);

  let sql = `-- ========================================================\n`;
  sql += `-- ChamaSmart Enterprise SQL Database Dump\n`;
  sql += `-- Export Generated At: ${new Date().toISOString()}\n`;
  sql += `-- Engine: Relational SQLite / PostgreSQL Compatible Schema\n`;
  sql += `-- ========================================================\n\n`;

  sql += `BEGIN TRANSACTION;\n\n`;

  // 1. Schema Definitions
  sql += `-- Table: chamas\n`;
  sql += `CREATE TABLE IF NOT EXISTS chamas (\n`;
  sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
  sql += `  name VARCHAR(255) NOT NULL,\n`;
  sql += `  category VARCHAR(64) NOT NULL,\n`;
  sql += `  tagline TEXT,\n`;
  sql += `  county VARCHAR(128) NOT NULL,\n`;
  sql += `  country VARCHAR(64) NOT NULL DEFAULT 'Kenya',\n`;
  sql += `  registration_number VARCHAR(128),\n`;
  sql += `  formed_date DATE NOT NULL,\n`;
  sql += `  currency VARCHAR(16) NOT NULL DEFAULT 'KSh',\n`;
  sql += `  plan_tier VARCHAR(64) NOT NULL,\n`;
  sql += `  monthly_subscription_ksh NUMERIC(12,2) NOT NULL DEFAULT 500,\n`;
  sql += `  mpesa_paybill_or_till VARCHAR(128),\n`;
  sql += `  account_number VARCHAR(128),\n`;
  sql += `  raw_data TEXT NOT NULL,\n`;
  sql += `  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `-- Table: members\n`;
  sql += `CREATE TABLE IF NOT EXISTS members (\n`;
  sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
  sql += `  chama_id VARCHAR(64) NOT NULL,\n`;
  sql += `  name VARCHAR(255) NOT NULL,\n`;
  sql += `  phone_number VARCHAR(32) NOT NULL,\n`;
  sql += `  email VARCHAR(255),\n`;
  sql += `  membership_number VARCHAR(64) NOT NULL,\n`;
  sql += `  joined_date DATE NOT NULL,\n`;
  sql += `  role VARCHAR(64) NOT NULL DEFAULT 'member',\n`;
  sql += `  total_savings NUMERIC(14,2) NOT NULL DEFAULT 0.00,\n`;
  sql += `  shares_count INT NOT NULL DEFAULT 0,\n`;
  sql += `  active_loan_balance NUMERIC(14,2) NOT NULL DEFAULT 0.00,\n`;
  sql += `  credit_score INT NOT NULL DEFAULT 700,\n`;
  sql += `  attendance_rate NUMERIC(5,2) NOT NULL DEFAULT 100.00,\n`;
  sql += `  status VARCHAR(32) NOT NULL DEFAULT 'active',\n`;
  sql += `  next_of_kin_name VARCHAR(255),\n`;
  sql += `  next_of_kin_relationship VARCHAR(64),\n`;
  sql += `  next_of_kin_phone VARCHAR(32),\n`;
  sql += `  FOREIGN KEY (chama_id) REFERENCES chamas (id) ON DELETE CASCADE\n`;
  sql += `);\n\n`;

  sql += `-- Table: registration_applications\n`;
  sql += `CREATE TABLE IF NOT EXISTS registration_applications (\n`;
  sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
  sql += `  chama_name VARCHAR(255) NOT NULL,\n`;
  sql += `  category VARCHAR(64) NOT NULL,\n`;
  sql += `  tagline TEXT,\n`;
  sql += `  county VARCHAR(128) NOT NULL,\n`;
  sql += `  country VARCHAR(64) NOT NULL,\n`;
  sql += `  registration_number VARCHAR(128),\n`;
  sql += `  applicant_chairperson_name VARCHAR(255) NOT NULL,\n`;
  sql += `  applicant_phone VARCHAR(32) NOT NULL,\n`;
  sql += `  applicant_email VARCHAR(255),\n`;
  sql += `  initial_member_count INT NOT NULL DEFAULT 15,\n`;
  sql += `  plan_tier VARCHAR(64) NOT NULL DEFAULT 'Basic',\n`;
  sql += `  status VARCHAR(32) NOT NULL DEFAULT 'pending_approval',\n`;
  sql += `  submitted_at TIMESTAMP NOT NULL,\n`;
  sql += `  reviewed_at TIMESTAMP,\n`;
  sql += `  rejection_reason TEXT,\n`;
  sql += `  super_admin_notes TEXT,\n`;
  sql += `  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `-- Table: transactions\n`;
  sql += `CREATE TABLE IF NOT EXISTS transactions (\n`;
  sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
  sql += `  chama_id VARCHAR(64) NOT NULL,\n`;
  sql += `  reference VARCHAR(64) NOT NULL,\n`;
  sql += `  mpesa_receipt VARCHAR(64),\n`;
  sql += `  date TIMESTAMP NOT NULL,\n`;
  sql += `  type VARCHAR(64) NOT NULL,\n`;
  sql += `  amount NUMERIC(14,2) NOT NULL,\n`;
  sql += `  description TEXT,\n`;
  sql += `  fund_type VARCHAR(64) NOT NULL,\n`;
  sql += `  member_id VARCHAR(64),\n`;
  sql += `  member_name VARCHAR(255),\n`;
  sql += `  initiated_by VARCHAR(255),\n`;
  sql += `  status VARCHAR(32) NOT NULL DEFAULT 'confirmed',\n`;
  sql += `  payment_method VARCHAR(64) NOT NULL,\n`;
  sql += `  FOREIGN KEY (chama_id) REFERENCES chamas (id) ON DELETE CASCADE\n`;
  sql += `);\n\n`;

  sql += `-- Table: audit_logs\n`;
  sql += `CREATE TABLE IF NOT EXISTS audit_logs (\n`;
  sql += `  id VARCHAR(64) PRIMARY KEY,\n`;
  sql += `  chama_id VARCHAR(64) NOT NULL,\n`;
  sql += `  timestamp TIMESTAMP NOT NULL,\n`;
  sql += `  actor_name VARCHAR(255) NOT NULL,\n`;
  sql += `  actor_role VARCHAR(64) NOT NULL,\n`;
  sql += `  action VARCHAR(128) NOT NULL,\n`;
  sql += `  module VARCHAR(128) NOT NULL,\n`;
  sql += `  details TEXT,\n`;
  sql += `  severity VARCHAR(32) NOT NULL DEFAULT 'info',\n`;
  sql += `  FOREIGN KEY (chama_id) REFERENCES chamas (id) ON DELETE CASCADE\n`;
  sql += `);\n\n`;

  // 2. Data Insertion Dumps
  const chamas = db.prepare('SELECT * FROM chamas').all() as any[];
  for (const c of chamas) {
    const rawEscaped = (c.raw_data || '').replace(/'/g, "''");
    const nameEscaped = (c.name || '').replace(/'/g, "''");
    const taglineEscaped = (c.tagline || '').replace(/'/g, "''");
    sql += `INSERT INTO chamas (id, name, category, tagline, county, country, registration_number, formed_date, currency, plan_tier, monthly_subscription_ksh, mpesa_paybill_or_till, account_number, raw_data)\n`;
    sql += `VALUES ('${c.id}', '${nameEscaped}', '${c.category}', '${taglineEscaped}', '${c.county}', '${c.country}', '${c.registration_number}', '${c.formed_date}', '${c.currency}', '${c.plan_tier}', ${c.monthly_subscription_ksh}, '${c.mpesa_paybill_or_till}', '${c.account_number}', '${rawEscaped}');\n`;
  }
  sql += `\n`;

  const members = db.prepare('SELECT * FROM members').all() as any[];
  for (const m of members) {
    const nameEscaped = (m.name || '').replace(/'/g, "''");
    const kinEscaped = (m.next_of_kin_name || '').replace(/'/g, "''");
    sql += `INSERT INTO members (id, chama_id, name, phone_number, email, membership_number, joined_date, role, total_savings, shares_count, active_loan_balance, credit_score, attendance_rate, status, next_of_kin_name, next_of_kin_relationship, next_of_kin_phone)\n`;
    sql += `VALUES ('${m.id}', '${m.chama_id}', '${nameEscaped}', '${m.phone_number}', '${m.email || ''}', '${m.membership_number}', '${m.joined_date}', '${m.role}', ${m.total_savings}, ${m.shares_count}, ${m.active_loan_balance}, ${m.credit_score}, ${m.attendance_rate}, '${m.status}', '${kinEscaped}', '${m.next_of_kin_relationship || ''}', '${m.next_of_kin_phone || ''}');\n`;
  }
  sql += `\n`;

  const apps = db.prepare('SELECT * FROM registration_applications').all() as any[];
  for (const a of apps) {
    const nameEsc = (a.chama_name || '').replace(/'/g, "''");
    const tagEsc = (a.tagline || '').replace(/'/g, "''");
    const chairEsc = (a.applicant_chairperson_name || '').replace(/'/g, "''");
    sql += `INSERT INTO registration_applications (id, chama_name, category, tagline, county, country, registration_number, applicant_chairperson_name, applicant_phone, applicant_email, initial_member_count, plan_tier, status, submitted_at)\n`;
    sql += `VALUES ('${a.id}', '${nameEsc}', '${a.category}', '${tagEsc}', '${a.county}', '${a.country}', '${a.registration_number || ''}', '${chairEsc}', '${a.applicant_phone}', '${a.applicant_email || ''}', ${a.initial_member_count}, '${a.plan_tier}', '${a.status}', '${a.submitted_at}');\n`;
  }
  sql += `\n`;

  const txs = db.prepare('SELECT * FROM transactions').all() as any[];
  for (const t of txs) {
    const descEsc = (t.description || '').replace(/'/g, "''");
    const memberEsc = (t.member_name || '').replace(/'/g, "''");
    sql += `INSERT INTO transactions (id, chama_id, reference, mpesa_receipt, date, type, amount, description, fund_type, member_id, member_name, initiated_by, status, payment_method)\n`;
    sql += `VALUES ('${t.id}', '${t.chama_id}', '${t.reference}', '${t.mpesa_receipt || ''}', '${t.date}', '${t.type}', ${t.amount}, '${descEsc}', '${t.fund_type}', '${t.member_id || ''}', '${memberEsc}', '${t.initiated_by}', '${t.status}', '${t.payment_method}');\n`;
  }
  sql += `\n`;

  const audits = db.prepare('SELECT * FROM audit_logs').all() as any[];
  for (const al of audits) {
    const detEsc = (al.details || '').replace(/'/g, "''");
    sql += `INSERT INTO audit_logs (id, chama_id, timestamp, actor_name, actor_role, action, module, details, severity)\n`;
    sql += `VALUES ('${al.id}', '${al.chama_id}', '${al.timestamp}', '${al.actor_name}', '${al.actor_role}', '${al.action}', '${al.module}', '${detEsc}', '${al.severity}');\n`;
  }
  sql += `\nCOMMIT;\n`;

  fs.writeFileSync(dumpFilePath, sql, 'utf8');
  fs.writeFileSync(latestFilePath, sql, 'utf8');

  return {
    filePath: dumpFilePath,
    sqlContent: sql,
    stats: {
      chamasCount: chamas.length,
      membersCount: members.length,
      applicationsCount: apps.length,
      transactionsCount: txs.length,
      auditLogsCount: audits.length,
      bytes: sql.length,
    },
  };
}
