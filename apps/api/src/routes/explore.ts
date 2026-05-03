/**
 * 围物为心 — 发现页路由
 *
 * GET /api/explore — 发现页数据（话题聚合 + 分类浏览）
 */

import { FastifyPluginAsync } from 'fastify';
import { cache, CACHE_TTL } from '../services/cache';

/** 分类定义（与前端 mock-data.ts 对齐） */
const CATEGORIES = [
  { id: 'movie', label: '影视', icon: '🎬' },
  { id: 'music', label: '音乐', icon: '🎵' },
  { id: 'food', label: '美食', icon: '🍜' },
  { id: 'travel', label: '旅行', icon: '🗺️' },
  { id: 'tech', label: '科技', icon: '💻' },
  { id: 'book', label: '读书', icon: '📖' },
  { id: 'sports', label: '运动', icon: '⚽' },
] as const;

/** 分类与标签（subtitle 关键词）的映射 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  movie: ['影视', '电影', '动画', '日剧', '纪录片'],
  music: ['音乐', '华语', '古典', '专辑'],
  food: ['美食', '冰饮', '咖啡', '纪录片'],
  travel: ['旅行', '京都', '散步', '红叶'],
  tech: ['科技', '前端', 'AI', '深度学习', '技术', '框架'],
  book: ['读书', '推理', '宋词', '诗词', '书籍', '文学'],
  sports: ['运动', '跑步', '健身', '居家'],
};

/**
 * 计算置信度（0-1），与前端 enrichList() 保持完全一致
 * 公式: base(0.2/0.05) + participationBoost(≤0.4) + consensusBoost(≤0.3)
 */
function calcConfidence(item: {
  _count: { communityScores: number };
  upvoteCount?: number | null;
  downvoteCount?: number | null;
}): number {
  const scoreCount = item._count.communityScores ?? 0;
  const upvotes = item.upvoteCount ?? 0;
  const downvotes = item.downvoteCount ?? 0;
  const totalVotes = upvotes + downvotes;
  const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0;

  const base = scoreCount > 0 ? 0.2 : 0.05;
  const participationBoost = Math.min(0.4, (scoreCount / 30) * 0.2);
  const consensusBoost = totalVotes > 0 ? Math.min(0.3, voteRatio * 0.3) : 0;

  return Math.min(0.99, Math.max(0.05, base + participationBoost + consensusBoost));
}

export const exploreRoutes: FastifyPluginAsync = async (app) => {
  // ── GET /explore — 发现页 ────────────────────────────
  app.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {},
      },
    },
  }, async (req, _reply) => {
    const result = await cache.withCache(
      'explore:home',
      async () => {
        // 1. 全量公开榜单（用于话题聚合 + 分类浏览）
        const allLists = await app.prisma.list.findMany({
          where: { visibility: 'PUBLIC' },
          orderBy: { voteCount: 'desc' },
          take: 100,
          select: {
            id: true,
            title: true,
            subtitle: true,
            voteCount: true,
            upvoteCount: true,
            downvoteCount: true,
            viewCount: true,
            createdAt: true,
            algorithmId: true,
            coverUrl: true,
            author: { select: { id: true, nickname: true, handle: true, avatarUrl: true } },
            _count: { select: { items: true, communityScores: true, comments: true } },
            dimensions: { select: { id: true, name: true, weight: true } },
          },
        });

        // 2. 热门榜单（按投票数/浏览数排序）
        const hotLists = allLists.slice(0, 10);

        // 3. 最新榜单
        const latestLists = await app.prisma.list.findMany({
          where: { visibility: 'PUBLIC' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            subtitle: true,
            createdAt: true,
            viewCount: true,
            voteCount: true,
            upvoteCount: true,
            downvoteCount: true,
            algorithmId: true,
            coverUrl: true,
            author: { select: { id: true, nickname: true, handle: true, avatarUrl: true } },
            _count: { select: { items: true, communityScores: true, comments: true } },
            dimensions: { select: { id: true, name: true, weight: true } },
          },
        });

        // 4. 分类浏览：根据关键词映射分组
        const categoryLists: Record<string, typeof allLists> = {};
        for (const cat of CATEGORIES) {
          const keywords = CATEGORY_KEYWORDS[cat.id] ?? [];
          categoryLists[cat.id] = allLists.filter(list => {
            const text = `${list.title} ${list.subtitle}`.toLowerCase();
            return keywords.some(kw => text.includes(kw.toLowerCase()));
          });
        }

        // 5. 话题聚合（使用 calcConfidence 与前端 enrichList 保持一致）
        const topicMap = new Map<string, typeof allLists>();
        for (const list of allLists) {
          const key = list.title.trim();
          if (!topicMap.has(key)) {
            topicMap.set(key, []);
          }
          topicMap.get(key)!.push(list);
        }

        const topicAggregations = [...topicMap.entries()]
          .filter(([, items]) => items.length >= 1)
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 20)
          .map(([topic, items]) => ({
            topicName: topic,
            mergedCount: items.length,
            items: items.slice(0, 5).map(item => ({
              id: item.id,
              title: item.title,
              confidence: calcConfidence(item),
              authorName: item.author.nickname,
              authorHandle: item.author.handle,
              itemCount: item._count.items,
              // 传递原始投票数据给前端用于乐观重算
              upvoteCount: item.upvoteCount ?? 0,
              downvoteCount: item.downvoteCount ?? 0,
              scoreCount: item._count.communityScores,
            })),
          }));

        // 6. 热门搜索关键词
        const wordCount = new Map<string, number>();
        for (const list of allLists) {
          const words = list.title.split(/[\s·：:，,、]+/).filter(w => w.length > 1);
          for (const w of words) {
            wordCount.set(w, (wordCount.get(w) ?? 0) + 1);
          }
        }
        const hotSearches = [...wordCount.entries()]
          .sort((a, b) => b[1] - a[1]!)
          .slice(0, 10)
          .map(([word]) => word);

        return {
          hotLists,
          latestLists,
          categories: CATEGORIES.map(cat => ({
            ...cat,
            lists: (categoryLists[cat.id] ?? []).slice(0, 5),
          })),
          topicAggregations,
          hotSearches,
        };
      },
      CACHE_TTL.EXPLORE,
    );

    return result;
  });
};
