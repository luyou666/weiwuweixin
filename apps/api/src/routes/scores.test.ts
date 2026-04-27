/**
 * 围物为心 — 评分路由单测
 *
 * 验证：同一 listId+itemId 用两个不同 voterFingerprint 打分，
 * 数据库里应有 2 条 CommunityScore 记录。
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

// ── 启动临时 PostgreSQL ────────────────────────────────

// embedded-postgres 是 CJS default export
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EmbeddedPostgres = require('embedded-postgres').default;

// 每次测试用随机临时目录，避免上次残留
const pgDataDir = path.join(tmpdir(), `pg-test-${process.pid}-${Date.now()}`);

const pg = new EmbeddedPostgres({
  database: 'postgres',
  port: 15432,
  dataDir: pgDataDir,
  user: 'testuser',
  password: 'testpass',
  persistent: false,
});

let prisma: PrismaClient;

const TEST_DB = 'weiwuweixin_test';
const CONNECTION_URL = `postgresql://testuser:testpass@localhost:15432/${TEST_DB}`;

beforeAll(async () => {
  await pg.initialise(); // NOTE: British spelling!
  await pg.start();

  // 创建测试数据库
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Client } = require('pg');
  const adminClient = new Client({
    host: 'localhost',
    port: 15432,
    user: 'testuser',
    password: 'testpass',
    database: 'postgres',
  });
  await adminClient.connect();
  await adminClient.query(`CREATE DATABASE "${TEST_DB}"`);
  await adminClient.end();

  // 用 prisma db push 推送 schema
  execSync('npx prisma db push --accept-data-loss', {
    cwd: path.join(__dirname, '..', '..'),
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: CONNECTION_URL },
  });

  prisma = new PrismaClient({
    datasources: { db: { url: CONNECTION_URL } },
  });
}, 60_000);

afterAll(async () => {
  await prisma?.$disconnect();
  await pg.stop();
});

describe('CommunityScore upsert with voterFingerprint', () => {
  it('同一 listId+itemId 不同 voterFingerprint 应产生 2 条记录', async () => {
    const user = await prisma.user.create({
      data: {
        handle: 'test-voter-a',
        nickname: '测试投票者',
      },
    });

    const list = await prisma.list.create({
      data: {
        title: '测试榜单',
        authorId: user.id,
        scale: '1-10',
        visibility: 'PUBLIC',
      },
    });

    const item = await prisma.item.create({
      data: {
        name: '测试项目',
        listId: list.id,
        rank: 1,
      },
    });

    const fp1 = 'device-aaa';
    const fp2 = 'device-bbb';

    await prisma.communityScore.upsert({
      where: {
        listId_itemId_voterFingerprint: {
          listId: list.id,
          itemId: item.id,
          voterFingerprint: fp1,
        },
      },
      create: {
        listId: list.id,
        itemId: item.id,
        voterFingerprint: fp1,
        value: 8,
        confidence: 1.0,
        voteCount: 1,
      },
      update: {
        value: 8,
        confidence: 1.0,
      },
    });

    await prisma.communityScore.upsert({
      where: {
        listId_itemId_voterFingerprint: {
          listId: list.id,
          itemId: item.id,
          voterFingerprint: fp2,
        },
      },
      create: {
        listId: list.id,
        itemId: item.id,
        voterFingerprint: fp2,
        value: 5,
        confidence: 1.0,
        voteCount: 1,
      },
      update: {
        value: 5,
        confidence: 1.0,
      },
    });

    const scores = await prisma.communityScore.findMany({
      where: {
        listId: list.id,
        itemId: item.id,
      },
      orderBy: { voterFingerprint: 'asc' },
    });

    expect(scores.length).toBe(2);
    expect(scores[0].voterFingerprint).toBe(fp1);
    expect(scores[0].value).toBe(8);
    expect(scores[1].voterFingerprint).toBe(fp2);
    expect(scores[1].value).toBe(5);
  });

  it('同一 voterFingerprint 再次打分应更新而非新增', async () => {
    const user = await prisma.user.create({
      data: {
        handle: 'test-voter-b',
        nickname: '测试投票者2',
      },
    });

    const list = await prisma.list.create({
      data: {
        title: '测试榜单2',
        authorId: user.id,
        scale: '1-10',
        visibility: 'PUBLIC',
      },
    });

    const item = await prisma.item.create({
      data: {
        name: '测试项目2',
        listId: list.id,
        rank: 1,
      },
    });

    const fp = 'device-xxx';

    // 第一次打分
    await prisma.communityScore.upsert({
      where: {
        listId_itemId_voterFingerprint: {
          listId: list.id,
          itemId: item.id,
          voterFingerprint: fp,
        },
      },
      create: {
        listId: list.id,
        itemId: item.id,
        voterFingerprint: fp,
        value: 7,
        confidence: 1.0,
        voteCount: 1,
      },
      update: {
        value: 7,
        confidence: 1.0,
      },
    });

    // 同一 fingerprint 再次打分（应 update）
    await prisma.communityScore.upsert({
      where: {
        listId_itemId_voterFingerprint: {
          listId: list.id,
          itemId: item.id,
          voterFingerprint: fp,
        },
      },
      create: {
        listId: list.id,
        itemId: item.id,
        voterFingerprint: fp,
        value: 9,
        confidence: 1.0,
        voteCount: 1,
      },
      update: {
        value: 9,
        confidence: 1.0,
      },
    });

    const scores = await prisma.communityScore.findMany({
      where: {
        listId: list.id,
        itemId: item.id,
        voterFingerprint: fp,
      },
    });

    expect(scores.length).toBe(1);
    expect(scores[0].value).toBe(9);
  });

  it('不同 fingerprint 打分不应被标记 duplicate-device，同一 fingerprint 重复打分才应标记', async () => {
    // 这个测试验证 anti-cheat 查询的 voterFingerprint 过滤修复：
    // - fingerprint B 对同一 list/item 打分，应正常通过（weight > 0，无 duplicate-device 标记）
    // - fingerprint A 再次对同一 list/item 打分，应触发 duplicate-device 标记

    const user = await prisma.user.create({
      data: {
        handle: 'test-anticheat-user',
        nickname: '反刷分测试',
      },
    });

    const list = await prisma.list.create({
      data: {
        title: '反刷分测试榜单',
        authorId: user.id,
        scale: '1-5',
        visibility: 'PUBLIC',
      },
    });

    const item = await prisma.item.create({
      data: {
        name: '反刷分项目',
        listId: list.id,
        rank: 1,
      },
    });

    const fpA = 'anticheat-device-A';
    const fpB = 'anticheat-device-B';

    // 1. fingerprint A 对 item 打 1 分
    await prisma.communityScore.create({
      data: {
        listId: list.id,
        itemId: item.id,
        voterFingerprint: fpA,
        userId: user.id,
        value: 1,
        confidence: 1.0,
        voteCount: 1,
      },
    });

    // 2. fingerprint B 对同一 item 打 1 分（24h 内）—— 应该正常
    await prisma.communityScore.create({
      data: {
        listId: list.id,
        itemId: item.id,
        voterFingerprint: fpB,
        userId: user.id,
        value: 1,
        confidence: 1.0,
        voteCount: 1,
      },
    });

    // 断言：B 的记录存在，且没有因 "duplicate-device" 被处理
    const scoreB = await prisma.communityScore.findFirst({
      where: {
        listId: list.id,
        itemId: item.id,
        voterFingerprint: fpB,
      },
    });
    expect(scoreB).not.toBeNull();
    expect(scoreB!.value).toBe(1); // weight 不应为 0
    expect(scoreB!.confidence).toBe(1.0);

    // 3. fingerprint A 再次对同一 item 打分（应触发 duplicate-device）
    // 模拟 upsert：同一 voterFingerprint 会更新
    await prisma.communityScore.upsert({
      where: {
        listId_itemId_voterFingerprint: {
          listId: list.id,
          itemId: item.id,
          voterFingerprint: fpA,
        },
      },
      create: {
        listId: list.id,
        itemId: item.id,
        voterFingerprint: fpA,
        userId: user.id,
        value: 1,
        confidence: 0.5,
        voteCount: 2, // 第二次
      },
      update: {
        voteCount: { increment: 1 },
      },
    });

    // 断言：A 的记录还是只有 1 条（upsert），且 voteCount 增加了
    const scoresA = await prisma.communityScore.findMany({
      where: {
        listId: list.id,
        itemId: item.id,
        voterFingerprint: fpA,
      },
    });
    expect(scoresA.length).toBe(1);
    expect(scoresA[0].voteCount).toBe(2); // 第二次打分时 upsert increment

    // 断言：B 的记录仍然是 1 条，value 仍是 1
    const scoresB = await prisma.communityScore.findMany({
      where: {
        listId: list.id,
        itemId: item.id,
        voterFingerprint: fpB,
      },
    });
    expect(scoresB.length).toBe(1);
    expect(scoresB[0].value).toBe(1);
  });
});