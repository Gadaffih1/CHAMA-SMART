import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { test } from 'node:test';

test('production server serves the built app and database API', { timeout: 30000 }, async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), 'chamasmart-test-'));
  const reservation = net.createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const { port } = reservation.address();
  await new Promise((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()));

  const server = spawn(process.execPath, ['dist-server/server.js'], {
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port), CHAMASMART_DATA_DIR: dataDir, SUPER_ADMIN_PASSWORD: 'Test-Admin-Pass-1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  server.stdout.on('data', chunk => { output += chunk; });
  server.stderr.on('data', chunk => { output += chunk; });

  try {
    const base = `http://127.0.0.1:${port}`;
    let response;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null || server.signalCode !== null) {
        throw new Error(`Server exited before listening: ${output}`);
      }
      try {
        response = await fetch(`${base}/api/health`);
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    assert.ok(response, `Server did not start: ${output}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok', database: 'sqlite' });

    const json = (body) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const login = async (path, body) => {
      const res = await fetch(`${base}${path}`, { method: 'POST', ...json(body) });
      const cookie = res.headers.get('set-cookie')?.split(';')[0];
      return { res, headers: cookie ? { Cookie: cookie } : {} };
    };

    // Protected endpoints reject anonymous callers.
    for (const route of ['/api/db/chamas', '/api/db/applications', '/api/db/dumps', '/api/db/export-sql-dump', '/api/auth/me']) {
      assert.equal((await fetch(`${base}${route}`)).status, 401, route);
    }
    assert.equal((await fetch(`${base}/api/db/chamas/sync`, { method: 'POST', ...json([]) })).status, 401);
    assert.equal((await fetch(`${base}/api/db/reset`, { method: 'POST' })).status, 401);
    assert.equal((await fetch(`${base}/api/db/categories`, { method: 'PUT', ...json(['x']) })).status, 401);

    // Super admin login
    assert.equal((await login('/api/auth/super-admin/login', { password: 'wrong' })).res.status, 401);
    const standardAdmin = await login('/api/auth/super-admin/login', { password: 'Arabella@0258' });
    assert.equal(standardAdmin.res.status, 200);
    const admin = await login('/api/auth/super-admin/login', { password: 'Test-Admin-Pass-1' });
    assert.equal(admin.res.status, 200);
    assert.match(admin.res.headers.get('set-cookie'), /HttpOnly/);
    assert.equal((await fetch(`${base}/api/auth/me`, { headers: admin.headers })).status, 200);

    const chamasResponse = await fetch(`${base}/api/db/chamas`, { headers: admin.headers });
    assert.equal(chamasResponse.status, 200);
    const chamas = await chamasResponse.json();
    assert.ok(chamas.length > 1);
    assert.ok(chamas.every(chama => chama.members.every(member => !('passwordHash' in member))));
    const chama = chamas[0];
    const otherChama = chamas[1];

    // Onboarding with a password, then member login.
    const newMember = {
      name: 'Test Member', phoneNumber: '+254700111222', email: 'test.member@example.com',
      membershipNumber: 'CS-TEST-001', role: 'member', joinedDate: '2026-01-01',
      nextOfKin: { name: 'Kin', relationship: 'Sibling', phone: '+254700333444' }, password: 'short',
    };
    const onboard = (password, headers = admin.headers, chamaId = chama.id) =>
      fetch(`${base}/api/db/chamas/${chamaId}/members`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newMember, password }) });
    assert.equal((await onboard('short')).status, 400);
    const created = await onboard('Member-Pass-1');
    assert.equal(created.status, 201);
    const member = await created.json();
    assert.ok(!('passwordHash' in member));
    assert.equal((await onboard('Member-Pass-1')).status, 409);

    assert.equal((await login('/api/auth/login', { identifier: newMember.phoneNumber, password: 'nope-nope' })).res.status, 401);
    const memberLogin = await login('/api/auth/login', { identifier: newMember.phoneNumber, password: 'Member-Pass-1' });
    assert.equal(memberLogin.res.status, 200);

    // Plain members are scoped to their own chama and cannot manage accounts.
    const memberChamas = await (await fetch(`${base}/api/db/chamas`, { headers: memberLogin.headers })).json();
    assert.deepEqual(memberChamas.map(item => item.id), [chama.id]);
    assert.equal((await fetch(`${base}/api/db/applications`, { headers: memberLogin.headers })).status, 403);
    assert.equal((await fetch(`${base}/api/db/dumps`, { headers: memberLogin.headers })).status, 403);
    assert.equal((await onboard('Member-Pass-2', memberLogin.headers)).status, 403);
    assert.equal((await fetch(`${base}/api/auth/members/${member.id}/password`, { method: 'PUT', headers: { ...memberLogin.headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'Another-Pass-1' }) })).status, 403);

    // A member cannot promote themselves or overwrite other chamas through sync.
    const tampered = memberChamas.map(item => ({ ...item, members: item.members.map(m => m.id === member.id ? { ...m, role: 'chairperson' } : m) }));
    const syncResponse = await fetch(`${base}/api/db/chamas/sync`, { method: 'POST', headers: { ...memberLogin.headers, 'Content-Type': 'application/json' }, body: JSON.stringify([...tampered, { ...otherChama, name: 'Hijacked' }]) });
    assert.equal(syncResponse.status, 200);
    const afterSync = await (await fetch(`${base}/api/db/chamas`, { headers: admin.headers })).json();
    assert.equal(afterSync.find(item => item.id === chama.id).members.find(m => m.id === member.id).role, 'member');
    assert.equal(afterSync.find(item => item.id === otherChama.id).name, otherChama.name);

    // Super admin resets the password, which revokes existing sessions.
    const reset = await fetch(`${base}/api/auth/members/${member.id}/password`, { method: 'PUT', headers: { ...admin.headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'Fresh-Pass-123' }) });
    assert.equal(reset.status, 200);
    assert.equal((await fetch(`${base}/api/auth/me`, { headers: memberLogin.headers })).status, 401);
    assert.equal((await login('/api/auth/login', { identifier: newMember.phoneNumber, password: 'Fresh-Pass-123' })).res.status, 200);

    // Logout invalidates the session.
    await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: admin.headers });
    assert.equal((await fetch(`${base}/api/auth/me`, { headers: admin.headers })).status, 401);
    const adminAgain = await login('/api/auth/super-admin/login', { password: 'Test-Admin-Pass-1' });

    // Repeated failures lock the account out even with the right password.
    for (let attempt = 0; attempt < 5; attempt++) {
      await login('/api/auth/login', { identifier: newMember.phoneNumber, password: `bad-password-${attempt}` });
    }
    assert.equal((await login('/api/auth/login', { identifier: newMember.phoneNumber, password: 'Fresh-Pass-123' })).res.status, 401);

    // Public routes stay open; applications are always created as pending.
    const categoriesResponse = await fetch(`${base}/api/db/categories`);
    assert.equal(categoriesResponse.status, 200);
    const initialCategories = await categoriesResponse.json();
    assert.ok(initialCategories.includes('table_banking'));

    const application = { id: 'app-test-1', chamaName: 'Test Chama', category: 'table_banking', county: 'Nairobi', applicantChairpersonName: 'Chair Jane', applicantPhone: '+254700999888', password: 'Applicant-Pass-1', status: 'approved' };
    assert.equal((await fetch(`${base}/api/db/applications`, { method: 'POST', ...json(application) })).status, 200);
    const applications = await (await fetch(`${base}/api/db/applications`, { headers: adminAgain.headers })).json();
    const submittedApp = applications.find(item => item.id === 'app-test-1');
    assert.equal(submittedApp.status, 'pending_approval');
    assert.equal(submittedApp.hasPassword, true);

    // SuperAdmin approves application and activates chairperson credentials
    const chairMemberId = 'mem-chair-test-1';
    const approveResp = await fetch(`${base}/api/db/applications/app-test-1`, {
      method: 'PATCH',
      headers: { ...adminAgain.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved', chairpersonMemberId: chairMemberId }),
    });
    assert.equal(approveResp.status, 200);

    // Save newly provisioned Chama so member can be authenticated
    const newChamaPayload = {
      id: 'chama-app-1',
      name: 'Test Chama',
      category: 'table_banking',
      county: 'Nairobi',
      formedDate: '2026-01-01',
      members: [{
        id: chairMemberId,
        chamaId: 'chama-app-1',
        name: 'Chair Jane',
        phoneNumber: '+254700999888',
        email: 'chair.jane@example.com',
        membershipNumber: 'CS-001',
        role: 'chairperson',
        joinedDate: '2026-01-01',
        status: 'active',
        attendanceRate: 100,
        totalSavings: 0,
        sharesCount: 0,
        activeLoanBalance: 0,
        creditScore: 800,
      }],
      funds: [],
      loanProducts: [],
      loans: [],
      contributions: [],
      transactions: [],
      pendingWithdrawals: [],
      investments: [],
      meetings: [],
      elections: [],
      auditLogs: [],
    };
    assert.equal((await fetch(`${base}/api/db/chamas`, { method: 'POST', headers: { ...adminAgain.headers, 'Content-Type': 'application/json' }, body: JSON.stringify(newChamaPayload) })).status, 200);

    // The approved chairperson can now login immediately with the password they set during onboarding!
    const chairLogin = await login('/api/auth/login', { identifier: '+254700999888', password: 'Applicant-Pass-1' });
    assert.equal(chairLogin.res.status, 200);

    const categoryUpdate = await fetch(`${base}/api/db/categories`, { method: 'PUT', headers: { ...adminAgain.headers, 'Content-Type': 'application/json' }, body: JSON.stringify([...initialCategories, 'community_savings']) });
    assert.equal(categoryUpdate.status, 200);
    assert.ok((await (await fetch(`${base}/api/db/categories`)).json()).includes('community_savings'));

    const invalidCategoryUpdate = await fetch(`${base}/api/db/categories`, { method: 'PUT', headers: { ...adminAgain.headers, 'Content-Type': 'application/json' }, body: JSON.stringify(['Invalid Category']) });
    assert.equal(invalidCategoryUpdate.status, 400);

    const home = await fetch(base);
    assert.equal(home.status, 200);
    const html = await home.text();
    assert.match(html, /\/assets\/[^"]+\.js/);
    const asset = html.match(/\/assets\/[^"]+\.js/)[0];
    assert.equal((await fetch(`${base}${asset}`)).status, 200);
    assert.equal((await fetch(`${base}/some/client/route`)).status, 200);

    const dumps = await fetch(`${base}/api/db/dumps`, { headers: adminAgain.headers });
    assert.equal(dumps.status, 200);
    assert.ok((await dumps.json()).some(dump => dump.filename === 'chamasmart_dump_latest.sql'));
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      server.kill('SIGTERM');
      await once(server, 'exit');
    }
    await rm(dataDir, { recursive: true, force: true });
  }
});
