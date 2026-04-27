/**
 * 围物为心 — Seed 脚本
 *
 * 运行方式：pnpm seed:demo
 * (实际执行 tsx packages/shared/seed.ts)
 *
 * 生成：
 *  - 5 个用户：handle u01..u05，昵称"墨客一"到"墨客五"
 *  - 20 份榜单：均匀分给 5 用户，分类轮询[电影,书籍,游戏,美食,音乐]
 *    每份 8 条 item，3 个维度（权重 0.5/0.3/0.2，刻度 1-10）
 *    algorithmId 在 5 种算法里轮询
 *    作者打分 Math.random()*9+1 两位小数
 *  - 300 条 CommunityScore：按 listId 均匀分布
 *    voterFingerprint 用 "fp-" + 序号
 *    score 与作者分相关性中等（在作者分基础上 ±2 随机抖动并 clamp 到 1..10）
 */

import { PrismaClient, Visibility } from '@prisma/client';

const prisma = new PrismaClient();

// ── 固定种子数据 ──────────────────────────────────────

const USERNAMES = ['u01', 'u02', 'u03', 'u04', 'u05'] as const;
const NICKNAMES = ['墨客一', '墨客二', '墨客三', '墨客四', '墨客五'] as const;
const CATEGORIES = ['电影', '书籍', '游戏', '美食', '音乐'] as const;
const ALGORITHMS = ['weighted-mean', 'geometric-mean', 'borda-count', 'topsis', 'bayesian-shrinkage'] as const;
const DIMENSION_NAMES = ['维度一', '维度二', '维度三'] as const;
const DIMENSION_WEIGHTS = [0.5, 0.3, 0.2] as const;
const NUM_USERS = 5;
const NUM_LISTS = 20;
const NUM_ITEMS_PER_LIST = 8;
const NUM_COMMUNITY_SCORES = 300;

// ── 工具函数 ─────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function randomScore(): number {
  return parseFloat((Math.random() * 9 + 1).toFixed(2));
}

// ── 主流程 ──────────────────────────────────────────

async function seed() {
  console.log('🌱 开始种子数据注入...');

  // 清理旧数据（按依赖顺序）
  await prisma.communityScore.deleteMany();
  await prisma.authorScore.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.rapport.deleteMany();
  await prisma.item.deleteMany();
  await prisma.dimension.deleteMany();
  await prisma.list.deleteMany();
  await prisma.user.deleteMany();

  // ── 1. 创建 5 个用户 ──────────────────────────────
  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const user = await prisma.user.create({
      data: {
        handle: USERNAMES[i],
        nickname: NICKNAMES[i],
      },
    });
    users.push(user);
    console.log(`  ✅ 用户: ${user.nickname} @${user.handle} (${user.id})`);
  }

  // ── 2. 创建 20 份榜单 ──────────────────────────────
  const lists: {
    id: string;
    authorId: string;
    scale: string;
    dimensions: { id: string; name: string; weight: number; scale: number | null }[];
    items: { id: string; name: string; rank: number | null }[];
  }[] = [];

  // 存储作者分以用于社区评分关联
  const authorScoreMap: Map<string, number> = new Map();

  for (let i = 0; i < NUM_LISTS; i++) {
    const author = users[i % NUM_USERS];
    const category = CATEGORIES[i % CATEGORIES.length];
    const algorithmId = ALGORITHMS[i % ALGORITHMS.length];

    const list = await prisma.list.create({
      data: {
        title: `${category}榜单${i + 1}`,
        subtitle: `${category}领域精选`,
        algorithmId,
        scale: '1-10',
        visibility: Visibility.PUBLIC,
        authorId: author.id,
        dimensions: {
          create: DIMENSION_NAMES.map((name, dIdx) => ({
            name: name,
            weight: DIMENSION_WEIGHTS[dIdx],
            scale: 10,
          })),
        },
        items: {
          create: Array.from({ length: NUM_ITEMS_PER_LIST }, (_, itemIdx) => ({
            name: `${category}条目${itemIdx + 1}`,
            rank: itemIdx + 1,
          })),
        },
      },
      include: { dimensions: true, items: true },
    });

    lists.push(list);
    console.log(`  📋 榜单: ${list.title} (${list.id})`);

    // ── 3. 作者打分（每 item × 每维度一条）────
    for (const item of list.items) {
      let itemScoreSum = 0;
      for (const dim of list.dimensions) {
        const value = randomScore();
        itemScoreSum += value;
        await prisma.authorScore.create({
          data: {
            value,
            userId: author.id,
            listId: list.id,
            dimensionId: dim.id,
            itemId: item.id,
          },
        });
      }
      const meanAuthorScore = itemScoreSum / list.dimensions.length;
      authorScoreMap.set(`${list.id}__${item.id}`, meanAuthorScore);
    }
  }

  console.log(`  📋 榜单: ${lists.length} 份`);
  console.log(`  📝 作者评分: ${lists.reduce((s, l) => s + l.items.length * l.dimensions.length, 0)} 条`);

  // ── 4. 创建 300 条社区评分 ────────────────────────
  // voterFingerprint 用 "fp-" + 序号，score 在作者分基础上 ±2 抖动
  const allListItems: { listId: string; itemId: string }[] = [];
  for (const list of lists) {
    for (const item of list.items) {
      allListItems.push({ listId: list.id, itemId: item.id });
    }
  }

  let totalScoresCreated = 0;
  for (let i = 0; i < NUM_COMMUNITY_SCORES; i++) {
    const target = allListItems[i % allListItems.length];
    const key = `${target.listId}__${target.itemId}`;
    const baseline = authorScoreMap.get(key) ?? 5.5;
    const jitter = (Math.random() - 0.5) * 4; // ±2
    const scoreValue = parseFloat(clamp(baseline + jitter, 1, 10).toFixed(2));

    await prisma.communityScore.create({
      data: {
        value: scoreValue,
        confidence: parseFloat((Math.random() * 0.69 + 0.3).toFixed(2)),
        voteCount: Math.floor(Math.random() * 28) + 2,
        voterFingerprint: `fp-${i + 1}`,
        listId: target.listId,
        itemId: target.itemId,
      },
    });

    totalScoresCreated++;
  }

  console.log(`  🗳️  社区评分: ${totalScoresCreated} 条`);

  console.log('\n✅ 种子数据注入完成！');
  console.log(`  👥 用户: ${users.length}`);
  console.log(`  📋 榜单: ${lists.length}`);
  console.log(`  🗳️  社区评分: ${totalScoresCreated} 条`);
}

seed()
  .catch((e) => {
    console.error('❌ 种子数据注入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });