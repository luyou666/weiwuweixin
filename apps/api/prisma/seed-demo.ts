/**
 * 围物为心 — 种子数据脚本
 *
 * 运行方式：pnpm seed:demo
 *
 * 生成：5 位用户、20 份榜单、及相关维度/条目/评分数据
 */

import { PrismaClient, Visibility } from '@prisma/client';

const prisma = new PrismaClient();

// ── 工具函数 ─────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

// ── 种子数据 ──────────────────────────────────────────

const USERS = [
  { nickname: '墨客', avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=moke' },
  { nickname: '竹影', avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=zhuying' },
  { nickname: '清风', avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=qingfeng' },
  { nickname: '云归', avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=yungui' },
  { nickname: '望舒', avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=wangshu' },
];

const VISIBILITIES: Visibility[] = [Visibility.PUBLIC, Visibility.PUBLIC, Visibility.PUBLIC, Visibility.LINK_ONLY, Visibility.PRIVATE];

const ALGORITHMS = ['weighted-mean', 'geometric-mean', 'borda-count', 'topsis', 'bayesian-shrinkage'];
const SCALES = ['1-5', '1-10', '0-100'];

const LIST_TITLES = [
  { title: '2024 年度华语专辑', subtitle: '以心度耳，聆听这一年的回响', tags: ['音乐', '华语'] },
  { title: '咖啡器具入门指南', subtitle: '从手冲到意式，找到属于你的那杯', tags: ['咖啡', '器具'] },
  { title: '京都红叶名所', subtitle: '光影之间，秋色如墨', tags: ['旅行', '京都'] },
  { title: '前端框架对决', subtitle: '工欲善其事，必先利其器', tags: ['技术', '前端'] },
  { title: '独立游戏推荐', subtitle: '在小众中发现大世界', tags: ['游戏', '独立'] },
  { title: '诗词选本：宋词三百首外', subtitle: '不拘一格，偏取冷门佳作', tags: ['文学', '宋词'] },
  { title: '便携耳机排行', subtitle: '出门随身，隔音为上', tags: ['数码', '耳机'] },
  { title: '春日散步路线', subtitle: '城市角落，花开无声', tags: ['生活', '散步'] },
  { title: '推理小说必读榜', subtitle: '真相不止一个，好读不止一本', tags: ['书籍', '推理'] },
  { title: '周末烘焙工具清单', subtitle: '一炉暖香，满屋期待', tags: ['生活', '烘焙'] },
  { title: '国产动画电影推荐', subtitle: '大银幕上的中国韵味', tags: ['电影', '动画'] },
  { title: '考研英语词汇书排行', subtitle: '记忆之术，日积月累', tags: ['教育', '考研'] },
  { title: '夏日冰饮配方', subtitle: '一杯清凉，胜似千言', tags: ['美食', '冰饮'] },
  { title: '极简主义家居好物', subtitle: '少即是多，物尽其用', tags: ['生活', '设计'] },
  { title: '跑步装备入门', subtitle: '从第一步开始，跑向远方', tags: ['运动', '跑步'] },
  { title: '植物养护指南', subtitle: '叶落知秋，花开见春', tags: ['生活', '植物'] },
  { title: '深度学习框架排行', subtitle: '炼丹炉里的利器', tags: ['技术', 'AI'] },
  { title: '古典音乐入门唱片', subtitle: '从巴赫到马勒，打开耳朵的旅程', tags: ['音乐', '古典'] },
  { title: '手帐文具清单', subtitle: '笔尖上的仪式感', tags: ['生活', '文具'] },
  { title: '深夜食堂纪录片推荐', subtitle: '人间烟火气，最抚凡人心', tags: ['美食', '纪录片'] },
];

const DIMENSION_POOLS: Record<string, string[][]> = {
  '音乐': [['旋律感', '编曲', '歌词', '人声', '制作'], ['原创性', '旋律感', '情感', '制作水平']],
  '咖啡': [['萃取质量', '易用性', '价格', '外观设计'], ['口感', '性价比', '便携性']],
  '旅行': [['景观质量', '交通便利', '文化氛围', '性价比'], ['人流量', '拍照指数', '历史底蕴']],
  '技术': [['性能', '生态', '学习曲线', '社区活跃度'], ['开发效率', '稳定性', '文档']],
  '游戏': [['玩法深度', '美术', '剧情', '音乐', '性价比'], ['创意', '重玩价值', '操作手感']],
  '文学': [['文字功底', '情感深度', '思想性', '可读性'], ['选编质量', '代表性强']],
  '数码': [['音质', '舒适度', '降噪', '续航', '价格'], ['性价比', '品控', '外观']],
  '生活': [['体验感', '便利度', '性价比', '氛围'], ['独特性', '可重复']],
  '书籍': [['推理逻辑', '伏笔设计', '人物塑造', '节奏感'], ['翻译质量', '氛围营造']],
  '教育': [['词汇覆盖', '记忆方法', '编排逻辑', '例句质量'], ['附带练习', '便携性']],
  '美食': [['口感', '颜值', '易制作', '成本'], ['独特性', '解暑效果']],
  '设计': [['美观度', '实用性', '价格', '材质'], ['极简程度', '环保']],
  '运动': [['缓震', '透气', '支撑', '价格', '颜值'], ['轻量', '耐久']],
  '电影': [['画面', '剧情', '配乐', '文化表达'], ['情感深度', '创新性']],
  'AI': [['易用性', '性能', '生态', '文档'], ['社区', '部署便捷', '可扩展性']],
  '文具': [['书写体验', '颜值', '价格', '独特性'], ['纸张质感', '装订工艺']],
  '纪录片': [['画面质量', '故事性', '文化深度', '节奏感'], ['声音设计', '人文关怀']],
};

function getDimensionsForTags(tags: string[]): string[] {
  for (const tag of tags) {
    const pool = DIMENSION_POOLS[tag];
    if (pool) return pickRandom(pool);
  }
  return ['综合评分', '性价比'];
}

// ── 主流程 ──────────────────────────────────────────

async function seed() {
  console.log('🌱 开始种子数据注入...');

  // 清理旧数据（按依赖顺序）
  await prisma.comment.deleteMany();
  await prisma.communityScore.deleteMany();
  await prisma.authorScore.deleteMany();
  await prisma.rapport.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.item.deleteMany();
  await prisma.dimension.deleteMany();
  await prisma.list.deleteMany();
  await prisma.user.deleteMany();

  // ── 创建用户 ──────────────────────────────────────
  const users = [];
  for (const u of USERS) {
    const user = await prisma.user.create({ data: u });
    users.push(user);
    console.log(`  ✅ 用户: ${user.nickname} (${user.id})`);
  }

  // ── 创建榜单 ──────────────────────────────────────
  const lists = [];
  for (let i = 0; i < LIST_TITLES.length; i++) {
    const listData = LIST_TITLES[i];
    const author = users[i % users.length];
    const dims = getDimensionsForTags(listData.tags);
    const algorithmId = ALGORITHMS[i % ALGORITHMS.length];
    const scale = SCALES[i % SCALES.length];
    const visibility = VISIBILITIES[i % VISIBILITIES.length];

    const list = await prisma.list.create({
      data: {
        title: listData.title,
        subtitle: listData.subtitle,
        algorithmId,
        scale,
        visibility,
        viewCount: randomInt(10, 600),
        voteCount: randomInt(1, 50),
        authorId: author.id,
        dimensions: {
          create: dims.map((name, idx) => ({
            name,
            weight: parseFloat((1 / dims.length * (dims.length - idx)).toFixed(2)),
            scale: scale === '1-5' ? 5 : scale === '1-10' ? 10 : 100,
          })),
        },
        items: {
          create: Array.from({ length: randomInt(4, 12) }, (_, itemIdx) => ({
            name: `${listData.tags[0]}条目-${itemIdx + 1}`,
            note: itemIdx % 3 === 0 ? `关于第${itemIdx + 1}条目的备注` : undefined,
          })),
        },
      },
      include: { dimensions: true, items: true },
    });

    lists.push(list);
    console.log(`  📋 榜单: ${list.title} (${list.id})`);
  }

  // ── 创建社区评分（约 300 条） ──────────────────────
  let scoreCount = 0;
  const targetScores = 300;

  while (scoreCount < targetScores) {
    const list = pickRandom(lists);
    if (list.items.length === 0) continue;

    const item = pickRandom(list.items);
    const dimension = list.dimensions.length > 0 ? pickRandom(list.dimensions) : null;
    if (!dimension) continue;

    const user = pickRandom(users);
    const maxScore = list.scale === '0-100' ? 100 : list.scale === '1-10' ? 10 : 5;
    const scoreValue = randomFloat(maxScore * 0.3, maxScore);

    try {
      await prisma.communityScore.create({
        data: {
          value: scoreValue,
          confidence: randomFloat(0.3, 0.99),
          voteCount: randomInt(1, 30),
          listId: list.id,
          itemId: item.id,
          userId: user.id,
        },
      });
      scoreCount++;
    } catch {
      // 可能遇到唯一约束冲突（listId+itemId），跳过
    }
  }
  console.log(`  🗳️  社区评分: ${scoreCount} 条`);

  // ── 创建作者评分 ────────────────────────────────────
  for (const list of lists) {
    if (list.items.length === 0 || list.dimensions.length === 0) continue;
    for (const item of list.items.slice(0, 3)) {
      for (const dim of list.dimensions) {
        await prisma.authorScore.create({
          data: {
            value: randomFloat(list.scale === '0-100' ? 40 : list.scale === '1-10' ? 4 : 2, list.scale === '0-100' ? 95 : list.scale === '1-10' ? 9.5 : 4.5),
            confidence: randomFloat(0.5, 0.99),
            userId: list.authorId,
            listId: list.id,
            dimensionId: dim.id,
            itemId: item.id,
          },
        });
      }
    }
  }
  console.log(`  📝 作者评分: 已创建`);

  // ── 创建同好关系 ────────────────────────────────────
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      await prisma.rapport.create({
        data: {
          userId: users[i].id,
          targetUserId: users[j].id,
          similarity: randomFloat(0.2, 0.95),
          overlapCount: randomInt(1, 15),
        },
      });
    }
  }
  console.log(`  🤝 同好关系: ${users.length * (users.length - 1) / 2} 对`);

  // ── 创建徽章 ────────────────────────────────────────
  const BADGE_DEFS = [
    { code: 'first-list', name: '初榜', description: '创建了第一份榜单' },
    { code: 'echo-eight', name: '回声八人', description: '你的榜单收到了8人以上的社区评分' },
    { code: 'chorus-100', name: '百人合唱', description: '你的榜单收到了100人以上的社区评分' },
    { code: 'pioneer', name: '先驱', description: '在产品公测期间加入' },
  ];

  // 每个用户 1-2 个徽章
  for (const user of users) {
    const badge1 = pickRandom(BADGE_DEFS);
    await prisma.badge.create({
      data: { code: badge1.code, name: badge1.name, description: badge1.description, userId: user.id },
    });
    if (Math.random() > 0.4) {
      const remaining = BADGE_DEFS.filter(b => b.code !== badge1.code);
      const badge2 = pickRandom(remaining);
      try {
        await prisma.badge.create({
          data: { code: badge2.code, name: badge2.name, description: badge2.description, userId: user.id },
        });
      } catch {
        // unique constraint
      }
    }
  }
  console.log(`  🏅 徽章: 已创建`);

  // ── 创建评论 ────────────────────────────────────────
  const COMMENTS = [
    '见解独到，收藏了！',
    '同意楼上的判断，这个维度确实重要。',
    '我觉得评分偏低了，值得更高。',
    '第一次看到这样的榜单，很有意思。',
    '数据说话，比主观感受靠谱多了。',
    '期待作者更新！',
    '这个排名和我心目中的差不多。',
    '维度设置很合理，学习了。',
  ];

  for (const list of lists) {
    const commentCount = randomInt(0, 5);
    for (let c = 0; c < commentCount; c++) {
      await prisma.comment.create({
        data: {
          content: pickRandom(COMMENTS),
          listId: list.id,
          authorId: pickRandom(users).id,
        },
      });
    }
  }
  console.log(`  💬 评论: 已创建`);

  console.log('\n✅ 种子数据注入完成！');
  console.log(`  👥 用户: ${users.length}`);
  console.log(`  📋 榜单: ${lists.length}`);
  console.log(`  🗳️  社区评分: ${targetScores}+ 条`);
}

seed()
  .catch((e) => {
    console.error('❌ 种子数据注入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });