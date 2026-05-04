#!/usr/bin/env node
/**
 * 围物为心 — 开发服务器协调器
 * 替代 bash 脚本，用 Node.js 管理 PG + Redis + pnpm dev 生命周期
 */

import { spawn, execSync } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const DIR = join(fileURLToPath(import.meta.url), '..', '..');
const PG_PORT = 5432;
const API_PORT = 3001;
const WEB_PORT = 3000;
const REDIS_PORT = 6379;
const PG_PORT_FILE = join(DIR, '.pg-port');

const GREEN = '\x1b[32m', YELLOW = '\x1b[33m', BLUE = '\x1b[34m', RED = '\x1b[31m', NC = '\x1b[0m';

function log(color, msg) { console.log(`${color}${msg}${NC}`); }

function run(cmd, args, opts = {}) {
  return spawn(cmd, args, { stdio: 'inherit', ...opts });
}

function kill(pid, sig = 'SIGTERM') {
  try { process.kill(pid, sig); } catch {}
}

async function checkPort(port, timeout = 2000) {
  return new Promise(resolve => {
    const req = http.get(`http://localhost:${port}`, { timeout }, res => {
      res.resume(); resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

async function waitForPort(port, maxSec = 30) {
  for (let i = 1; i <= maxSec; i++) {
    if (await checkPort(port)) return i;
    await new Promise(r => setTimeout(r, 1000));
  }
  return -1;
}

// ── Cleanup ──
function cleanupAll() {
  console.log(`\n${YELLOW}Stopping all services...${NC}`);
  try { execSync('pkill -f postgres', { stdio: 'ignore' }); } catch {}
  try { execSync('pkill -f "next dev"', { stdio: 'ignore' }); } catch {}
  try { execSync('pkill -f "tsx.*index"', { stdio: 'ignore' }); } catch {}
  try { execSync('pkill -f tsup', { stdio: 'ignore' }); } catch {}
  try { execSync('pkill -f esbuild', { stdio: 'ignore' }); } catch {}
  try { execSync('redis-cli shutdown', { stdio: 'ignore' }); } catch {}
  try { unlinkSync(PG_PORT_FILE); } catch {}
  log(GREEN, 'Bye!');
}

process.on('SIGINT', () => { cleanupAll(); process.exit(0); });
process.on('SIGTERM', () => { cleanupAll(); process.exit(0); });
process.on('exit', cleanupAll);

// ── Main ──
async function main() {
  console.log('');
  log(BLUE, '=== WeiWuWeiXin ===');
  console.log('');

  // 1. Clean old processes
  log(YELLOW, 'Cleaning...');
  cleanupAll();
  await new Promise(r => setTimeout(r, 1500));
  log(GREEN, 'Ready');

  // 2. Start PostgreSQL
  log(BLUE, '--- PostgreSQL ---');
  if (!existsSync(PG_PORT_FILE) || !await checkPort(PG_PORT)) {
    try { unlinkSync(PG_PORT_FILE); } catch {}
    const pg = run('node', ['packages/shared/start-pg.cjs'], { cwd: DIR, stdio: 'pipe' });
    pg.stdout.pipe(process.stdout);
    pg.stderr.pipe(process.stderr);

    const started = await waitForPort(PG_PORT, 25);
    if (started === -1) {
      log(RED, `PG failed to start! Check data/pg/logfile`);
      process.exit(1);
    }
    log(GREEN, `PG started (${started}s)`);
  } else {
    log(GREEN, 'PG already running');
  }

  // 3. DB Schema (idempotent)
  log(BLUE, '--- DB Schema ---');
  try {
    execSync('npx prisma db push --skip-generate', { cwd: join(DIR, 'apps/api'), stdio: 'pipe' });
    log(GREEN, 'Schema ready');
  } catch {
    try { execSync('npx prisma generate', { cwd: join(DIR, 'apps/api'), stdio: 'pipe' }); } catch {}
    try { execSync('npx prisma db push', { cwd: join(DIR, 'apps/api'), stdio: 'pipe' }); } catch {}
  }

  // 4. Redis (optional)
  log(BLUE, '--- Redis ---');
  try { execSync('redis-cli ping', { stdio: 'pipe' }); log(GREEN, 'Redis running'); } catch {
    try { execSync('redis-server --daemonize yes --port 6379', { stdio: 'pipe' }); log(GREEN, 'Redis started'); } catch {
      log(YELLOW, 'Redis unavailable, API degraded');
    }
  }

  // 5. Start pnpm dev
  log(BLUE, '--- Dev Server ---');
  console.log(`  API:  http://localhost:${API_PORT}`);
  console.log(`  Web:  http://localhost:${WEB_PORT}/zh/`);
  console.log('');

  const dev = run('pnpm', ['dev'], { cwd: DIR, stdio: 'pipe' });
  dev.stdout.pipe(process.stdout);
  dev.stderr.pipe(process.stderr);

  // 6. Wait for services
  log(YELLOW, 'Waiting for services...');
  const apiTime = await waitForPort(API_PORT, 30);
  if (apiTime === -1) log(YELLOW, 'API not responding');
  else log(GREEN, `API ready (${apiTime}s)`);

  const webTime = await waitForPort(WEB_PORT, 30);
  if (webTime === -1) log(YELLOW, 'Web not responding');
  else log(GREEN, `Web ready (${webTime}s)`);

  // 7. Open browser
  try { execSync('xdg-open http://localhost:3000/zh/', { stdio: 'ignore' }); } catch {}
  try { execSync('open http://localhost:3000/zh/', { stdio: 'ignore' }); } catch {}
  try { execSync('sensible-browser http://localhost:3000/zh/', { stdio: 'ignore' }); } catch {}

  console.log('');
  log(GREEN, '============================================');
  log(GREEN, '  WeiWuWeiXin is running!');
  log(GREEN, '============================================');
  console.log(`\n  Web:  http://localhost:${WEB_PORT}/zh/`);
  console.log(`  API:  http://localhost:${API_PORT}`);
  console.log(`\n  Press Ctrl+C to stop\n`);

  // Keep alive
  dev.on('exit', code => {
    console.log(`\n${YELLOW}Dev server exited (code=${code})${NC}`);
    process.exit(code || 0);
  });
}

main().catch(e => {
  console.error(RED, e.message);
  process.exit(1);
});
