/**
 * 围物为心 — 热度排行榜路由
 *
 * GET /api/leaderboard — 实时热度排行榜 Top 20
 * 热度公式: upvoteCount×3 + communityScoreCount×2 + commentCount×1.5 + viewCount×0.1
 * Redis 缓存 60 秒，保证实时性
 */

import { FastifyPluginAsync } from 'fastify';
import { cache } from '../services/cache';

/** 排行榜缓存 TTL — 60秒保证实时反应 */
const LEADERBOARD_TTL = 60;

export const leaderboardRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (_req, _reply) => {
    return cache.withCache(
      'leaderboard:top20',
      async () => {
        const lists = await app.prisma.list.findMany({
          where: { visibility: 'PUBLIC' },
          select: {
            id: true,
            title: true,
            subtitle: true,
            upvoteCount: true,
            downvoteCount: true,
            viewCount: true,
            voteCount: true,
            createdAt: true,
            algorithmId: true,
            coverUrl: true,
            author: {
              select: { id: true, nickname: true, handle: true, avatarUrl: true },
            },
            _count: {
              select: { items: true, communityScores: true, comments: true },
            },
          },
        });

        // 计算热度并排序
        const ranked = lists
          .map((list) => {
            const hotness =
              (list.upvoteCount ?? 0) * 3 +
              (list._count.communityScores ?? 0) * 2 +
              (list._count.comments ?? 0) * 1.5 +
              (list.viewCount ?? 0) * 0.1;

            return {
              ...list,
              hotness: Math.round(hotness * 10) / 10,
            };
          })
          .sort((a, b) => b.hotness - a.hotness)
          .slice(0, 20);

        return {
          leaderboard: ranked,
          generatedAt: new Date().toISOString(),
        };
      },
      LEADERBOARD_TTL,
    );
  });
};
