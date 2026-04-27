/**
 * 围物为心 — 设备认证 API 测试
 *
 * 环境变量 DISABLE_REDIS=1 和 REDIS_URL='' 在 vitest.config.ts 中配置，
 * 确保在模块加载前生效，让 CacheService 跳过 Redis 初始化。
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import Fastify from 'fastify';
import { prismaPlugin } from '../plugins/prisma';
import { listRoutes } from '../routes/lists';
import { deviceAuthMiddleware } from '../middleware/device-auth';

// ── 启动临时 PostgreSQL ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-require-imports
const EmbeddedPostgres = require('embedded-postgres').default;

const PG_PORT = 15434 + Math.floor(Math.random() * 100);
const pgDataDir = path.join(tmpdir(), `pg-auth-test-${randomUUID()}`);

const pg = new EmbeddedPostgres({
  database: 'postgres',
  port: PG_PORT,
  dataDir: pgDataDir,
  user: 'testuser',
  password: 'testpass',
  persistent: false,
});

const TEST_DB = 'weiwuweixin_auth_test';
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

  // ⚠️ 必须在 PrismaClient 构造之前设置 DATABASE_URL
  process.env.DATABASE_URL = CONNECTION_URL;

  // 手动构建最小化 Fastify app（避免 Redis 等插件干扰测试）
  app = Fastify();

  await app.register(prismaPlugin);

  // 写操作认证
  app.addHook('preHandler', async (req: any, reply: any) => {
    const method = req.method.toUpperCase();
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return deviceAuthMiddleware(req, reply);
    }
  });

  await app.register(listRoutes, { prefix: '/api/lists' });

  await app.ready();
}, 90_000);

afterAll(async () => {
  if (app) {
    await app.close();
  }
  await pg.stop();
});

describe('Device Auth + List Creation', () => {
  it('X-Device-Id=A 创建榜单 → author.handle 以 anon- 开头', async () => {
    const deviceIdA = 'device-aaaa-bbbb-cccc';

    const response = await app.inject({
      method: 'POST',
      url: '/api/lists',
      headers: {
        'x-device-id': deviceIdA,
        'Content-Type': 'application/json',
      },
      payload: {
        title: '设备A的榜单',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.author).toBeDefined();
    expect(body.author.handle).toMatch(/^anon-/);
  });

  it('X-Device-Id=B 创建榜单 → 两个 author.id 不同', async () => {
    const deviceIdA = 'device-aaaa-bbbb-cccc';
    const deviceIdB = 'device-dddd-eeee-ffff';

    const resA = await app.inject({
      method: 'POST',
      url: '/api/lists',
      headers: {
        'x-device-id': deviceIdA,
        'Content-Type': 'application/json',
      },
      payload: {
        title: '设备A的榜单2',
      },
    });

    const resB = await app.inject({
      method: 'POST',
      url: '/api/lists',
      headers: {
        'x-device-id': deviceIdB,
        'Content-Type': 'application/json',
      },
      payload: {
        title: '设备B的榜单',
      },
    });

    expect(resA.statusCode).toBe(201);
    expect(resB.statusCode).toBe(201);

    const bodyA = resA.json();
    const bodyB = resB.json();

    expect(bodyA.author.id).not.toBe(bodyB.author.id);
    expect(bodyA.author.handle).toMatch(/^anon-/);
    expect(bodyB.author.handle).toMatch(/^anon-/);
  });

  it('缺少 X-Device-Id 时写操作应返回 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/lists',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: {
        title: '无人榜单',
      },
    });

    expect(response.statusCode).toBe(401);
  });
});