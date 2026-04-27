/**
 * 围物为心 — Anti-cheat 集成测试
 *
 * 验证：不同设备打分互不影响（无 duplicate-device），
 * 同设备重复打分应触发 duplicate-device flag。
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import Fastify from 'fastify';
import { prismaPlugin } from '../plugins/prisma';
import { listRoutes } from '../routes/lists';
import { scoreRoutes } from '../routes/scores';
import { deviceAuthMiddleware } from '../middleware/device-auth';

// ── 启动临时 PostgreSQL ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-require-imports
const EmbeddedPostgres = require('embedded-postgres').default;

const PG_PORT = 15435 + Math.floor(Math.random() * 100);
const pgDataDir = path.join(tmpdir(), `pg-ac-test-${randomUUID()}`);

const pg = new EmbeddedPostgres({
  database: 'postgres',
  port: PG_PORT,
  dataDir: pgDataDir,
  user: 'testuser',
  password: 'testpass',
  persistent: false,
});

const TEST_DB = 'weiwuweixin_ac_test';
const CONNECTION_URL = `postgresql://testuser:testpass@localhost:${PG_PORT}/${TEST_DB}`;

let app: any;

beforeAll(async () => {
  await pg.initialise();
  await pg.start();

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Client } = require('pg');
  const adminClient = new Client({
    host: 'localhost',
    port: PG_PORT,
    user: 'testuser',
    password: 'testpass',
    database: 'postgres',
  });
  await adminClient.connect();
  await adminClient.query(`CREATE DATABASE "${TEST_DB}"`);
  await adminClient.end();

  execSync('npx prisma db push --accept-data-loss', {
    cwd: path.join(__dirname, '..', '..'),
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: CONNECTION_URL },
  });

  process.env.DATABASE_URL = CONNECTION_URL;

  app = Fastify();

  await app.register(prismaPlugin);

  app.addHook('preHandler', async (req: any, reply: any) => {
    const method = req.method.toUpperCase();
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return deviceAuthMiddleware(req, reply);
    }
  });

  await app.register(listRoutes, { prefix: '/api/lists' });
  await app.register(scoreRoutes, { prefix: '/api/lists' });

  await app.ready();
}, 90_000);

afterAll(async () => {
  if (app) {
    await app.close();
  }
  await pg.stop();
});

/** 创建一个含 1 个 item 的榜单，返回 { listId, itemId } */
async function createListWithItem(deviceId: string) {
  const res = await app.inject({
    method: 'POST',
    url: '/api/lists',
    headers: {
      'x-device-id': deviceId,
      'Content-Type': 'application/json',
    },
    payload: {
      title: '测试榜单-anti-cheat',
      items: [{ name: '测试项目-AC', rank: 1 }],
    },
  });
  expect(res.statusCode).toBe(201);
  const body = res.json();
  return {
    listId: body.id,
    itemId: body.items[0].id,
  };
}

describe('Anti-cheat: voterFingerprint 过滤', () => {
  it('fingerprint A 打分 → weight≈1, flags 不含 duplicate-device', async () => {
    const fingerprintA = `ac-fp-A-${randomUUID().slice(0, 8)}`;
    const { listId, itemId } = await createListWithItem(`dev-${fingerprintA}`);

    const res = await app.inject({
      method: 'POST',
      url: `/api/lists/${listId}/scores`,
      headers: {
        'x-device-id': `dev-${fingerprintA}`,
        'Content-Type': 'application/json',
      },
      payload: {
        itemId,
        value: 5,
        deviceId: fingerprintA,
        durationMs: 5000,  // > 3s，避免 too-fast
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.antiCheat.flags).not.toContain('duplicate-device');
    expect(body.antiCheat.weight).toBeGreaterThan(0);
  });

  it('fingerprint B 打分同 item → weight≈1, flags 不含 duplicate-device', async () => {
    const fingerprintA = `ac-fp-AB-A-${randomUUID().slice(0, 8)}`;
    const fingerprintB = `ac-fp-AB-B-${randomUUID().slice(0, 8)}`;
    const { listId, itemId } = await createListWithItem(`dev-${fingerprintA}`);

    // A 先打分
    const resA = await app.inject({
      method: 'POST',
      url: `/api/lists/${listId}/scores`,
      headers: {
        'x-device-id': `dev-${fingerprintA}`,
        'Content-Type': 'application/json',
      },
      payload: {
        itemId,
        value: 5,
        deviceId: fingerprintA,
        durationMs: 5000,
      },
    });
    expect(resA.statusCode).toBe(201);
    const bodyA = resA.json();
    expect(bodyA.antiCheat.flags).not.toContain('duplicate-device');

    // B 打分同一个 item
    const resB = await app.inject({
      method: 'POST',
      url: `/api/lists/${listId}/scores`,
      headers: {
        'x-device-id': `dev-${fingerprintB}`,
        'Content-Type': 'application/json',
      },
      payload: {
        itemId,
        value: 5,
        deviceId: fingerprintB,
        durationMs: 5000,
      },
    });
    expect(resB.statusCode).toBe(201);
    const bodyB = resB.json();
    expect(bodyB.antiCheat.weight).toBeGreaterThan(0);
    expect(bodyB.antiCheat.flags).not.toContain('duplicate-device');
  });

  it('fingerprint A 再次打分同 item → flags 含 duplicate-device', async () => {
    const fingerprintA = `ac-fp-dup-A-${randomUUID().slice(0, 8)}`;
    const { listId, itemId } = await createListWithItem(`dev-${fingerprintA}`);

    // A 第一次打分
    const resA1 = await app.inject({
      method: 'POST',
      url: `/api/lists/${listId}/scores`,
      headers: {
        'x-device-id': `dev-${fingerprintA}`,
        'Content-Type': 'application/json',
      },
      payload: {
        itemId,
        value: 5,
        deviceId: fingerprintA,
        durationMs: 5000,
      },
    });
    expect(resA1.statusCode).toBe(201);
    const bodyA1 = resA1.json();
    expect(bodyA1.antiCheat.flags).not.toContain('duplicate-device');

    // A 第二次打分同一个 item（24小时内）
    const resA2 = await app.inject({
      method: 'POST',
      url: `/api/lists/${listId}/scores`,
      headers: {
        'x-device-id': `dev-${fingerprintA}`,
        'Content-Type': 'application/json',
      },
      payload: {
        itemId,
        value: 3,
        deviceId: fingerprintA,
        durationMs: 5000,
      },
    });
    expect(resA2.statusCode).toBe(201);
    const bodyA2 = resA2.json();
    // 同设备 24h 内再次打分应被标记为 duplicate-device
    expect(bodyA2.antiCheat.flags).toContain('duplicate-device');
  });
});