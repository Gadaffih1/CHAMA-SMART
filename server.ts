/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { db, initDatabase, generateSqlDump, DUMP_DIR } from './src/server/db.ts';

const APP_ROOT = process.cwd();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize DB and default seeds
  initDatabase();

  // ----------------------------------------------------
  // REST DATABASE API ENDPOINTS (Strict Server Storage)
  // ----------------------------------------------------

  // 1. Fetch all Chamas from DB
  app.get('/api/db/chamas', (req, res) => {
    try {
      const rows = db.prepare('SELECT raw_data FROM chamas ORDER BY updated_at DESC').all() as { raw_data: string }[];
      const chamas = rows.map(r => JSON.parse(r.raw_data));
      res.json(chamas);
    } catch (err: any) {
      console.error('Error fetching chamas:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Save / Update Chama in DB
  app.post('/api/db/chamas', (req, res) => {
    try {
      const chama = req.body;
      if (!chama || !chama.id || !chama.name) {
        return res.status(400).json({ error: 'Invalid chama payload' });
      }

      const stmt = db.prepare(`
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

      stmt.run(
        chama.id,
        chama.name,
        chama.category,
        chama.tagline || '',
        chama.county,
        chama.country || 'Kenya',
        chama.registrationNumber || '',
        chama.formedDate,
        chama.currency || 'KSh',
        chama.planTier || 'Basic',
        chama.monthlySubscriptionKsh || 500,
        chama.mpesaPaybillOrTill || '',
        chama.accountNumber || '',
        JSON.stringify(chama)
      );

      // Re-generate dump
      generateSqlDump();

      res.json({ success: true, chamaId: chama.id });
    } catch (err: any) {
      console.error('Error saving chama to DB:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Batch save/sync all chamas
  app.post('/api/db/chamas/sync', (req, res) => {
    try {
      const chamas = req.body;
      if (!Array.isArray(chamas)) {
        return res.status(400).json({ error: 'Payload must be array of chamas' });
      }

      const upsert = db.prepare(`
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

      const syncTx = db.transaction(() => {
        for (const chama of chamas) {
          upsert.run(
            chama.id,
            chama.name,
            chama.category,
            chama.tagline || '',
            chama.county,
            chama.country || 'Kenya',
            chama.registrationNumber || '',
            chama.formedDate,
            chama.currency || 'KSh',
            chama.planTier || 'Basic',
            chama.monthlySubscriptionKsh || 500,
            chama.mpesaPaybillOrTill || '',
            chama.accountNumber || '',
            JSON.stringify(chama)
          );
        }
      });

      syncTx();
      generateSqlDump();
      res.json({ success: true, count: chamas.length });
    } catch (err: any) {
      console.error('Error syncing chamas:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Fetch Registration Applications
  app.get('/api/db/applications', (req, res) => {
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

  // 5. Submit Registration Application
  app.post('/api/db/applications', (req, res) => {
    try {
      const appData = req.body;
      const stmt = db.prepare(`
        INSERT INTO registration_applications (id, chama_name, category, tagline, county, country, registration_number, applicant_chairperson_name, applicant_phone, applicant_email, initial_member_count, plan_tier, status, submitted_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          reviewed_at = excluded.reviewed_at,
          rejection_reason = excluded.rejection_reason,
          super_admin_notes = excluded.super_admin_notes,
          updated_at = CURRENT_TIMESTAMP
      `);

      stmt.run(
        appData.id,
        appData.chamaName,
        appData.category,
        appData.tagline || '',
        appData.county,
        appData.country || 'Kenya',
        appData.registrationNumber || '',
        appData.applicantChairpersonName,
        appData.applicantPhone,
        appData.applicantEmail || '',
        appData.initialMemberCount || 15,
        appData.planTier || 'Basic',
        appData.status || 'pending_approval',
        appData.submittedAt
      );

      generateSqlDump();
      res.json({ success: true, id: appData.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Update Application Status (Super Admin Review)
  app.patch('/api/db/applications/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { status, reviewedAt, rejectionReason, superAdminNotes } = req.body;

      const stmt = db.prepare(`
        UPDATE registration_applications 
        SET status = ?, reviewed_at = ?, rejection_reason = ?, super_admin_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(status, reviewedAt || null, rejectionReason || null, superAdminNotes || null, id);
      generateSqlDump();
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Generate & Download SQL Dump Export
  app.get('/api/db/export-sql-dump', (req, res) => {
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
  app.get('/api/db/dumps', (req, res) => {
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

  // 9. Reset DB to seed defaults
  app.post('/api/db/reset', (req, res) => {
    try {
      db.prepare('DELETE FROM chamas').run();
      db.prepare('DELETE FROM members').run();
      db.prepare('DELETE FROM registration_applications').run();
      db.prepare('DELETE FROM transactions').run();
      db.prepare('DELETE FROM audit_logs').run();

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
