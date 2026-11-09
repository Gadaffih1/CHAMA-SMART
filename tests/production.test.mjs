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
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port), CHAMASMART_DATA_DIR: dataDir },
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
        response = await fetch(`${base}/api/db/chamas`);
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    assert.ok(response, `Server did not start: ${output}`);
    assert.equal(response.status, 200);
    assert.ok((await response.json()).length > 0);

    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok', database: 'sqlite' });

    const home = await fetch(base);
    assert.equal(home.status, 200);
    const html = await home.text();
    assert.match(html, /\/assets\/[^"]+\.js/);
    const asset = html.match(/\/assets\/[^"]+\.js/)[0];
    assert.equal((await fetch(`${base}${asset}`)).status, 200);
    assert.equal((await fetch(`${base}/some/client/route`)).status, 200);

    const dumps = await fetch(`${base}/api/db/dumps`);
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
