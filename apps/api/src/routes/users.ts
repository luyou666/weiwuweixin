/**
 * 围物为心 — 用户路由
 *
 * PATCH /api/users/me        — 更新当前用户（昵称、头像、简介）
 * GET  /api/users/:handle    — 用户 profile（含榜单列表、徽章、统计）
 * GET  /api/users/:handle/badges — 用户徽章
 */

import { FastifyPluginAsync } from 'fastify';
import { cache, CacheKeys, CACHE_TTL } from '../services/cache';

export const userRoutes: FastifyPluginAsync = async (app) => {
  // ── PATCH /users/me — 更新当前用户 ──────────────────
  // 受全局 device-auth preHandler 保护（PATCH 方法）
  app.patch('/me', {
    schema: {
      body: {
        type: 'object',
        properties: {
          nickname: { type: 'string', minLength: 1, maxLength: 30 },
          avatarUrl: { type: 'string' },
          bio: { type: 'string', maxLength: 200 },
        },
      },
    },
  }, async (req, _reply) => {
    const body = req.body as {
      nickname?: string;
      avatarUrl?: string;
      bio?: string;
    };

    const userId = req.user!.id;

    try {
      const updated = await app.prisma.user.update({
        where: { id: userId },
        data: body,
        select: { id: true, handle: true, nickname: true, avatarUrl: true, bio: true },
      });

      // 失效用户 profile 缓存
      await cache.del(CacheKeys.profile(updated.handle));

      return updated;
    } catch (err: any) {
      if (err.code === 'P2025') {
        return _reply.code(404).send({ error: 'User not found' });
      }
      throw err;
    }
  });

  // ── GET /users/:handle — 用户 Profile ─────────────────
  app.get<{ Params: { handle: string } }>('/:handle', async (req, _reply) => {
    const { handle } = req.params;

    const result = await cache.withCache(
      CacheKeys.profile(handle),
      async () => {
        const user = await app.prisma.user.findUnique({
          where: { handle },
          include: {
            badges: true,
            lists: {
              where: { visibility: 'PUBLIC' },
              orderBy: { createdAt: 'desc' },
              take: 10,
              select: {
                id: true,
                title: true,
                subtitle: true,
                visibility: true,
                viewCount: true,
                voteCount: true,
                createdAt: true,
                _count: { select: { items: true, comments: true } },
              },
            },
            _count: {
              select: {
                lists: true,
                comments: true,
                authorScores: true,
                communityScores: true,
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        type StatsResult = {
          listCount: number;
          commentCount: number;
          authorScoreCount: number;
          communityScoreCount: number;
        };

        const stats: StatsResult = {
          listCount: user._count.lists,
          commentCount: user._count.comments,
          authorScoreCount: user._count.authorScores,
          communityScoreCount: user._count.communityScores,
        };

        return {
          ...user,
          stats,
        };
      },
      CACHE_TTL.PROFILE,
    );

    if (!result) {
      return _reply.code(404).send({ error: 'User not found' });
    }

    return result;
  });

  // ── GET /users/:handle/badges — 用户徽章 ─────────────
  app.get<{ Params: { handle: string } }>('/:handle/badges', async (req, _reply) => {
    const { handle } = req.params;

    const user = await app.prisma.user.findUnique({
      where: { handle },
      select: { id: true },
    });

    if (!user) {
      return _reply.code(404).send({ error: 'User not found' });
    }

    const badges = await app.prisma.badge.findMany({
      where: { userId: user.id },
      orderBy: { earnedAt: 'asc' },
    });

    return badges;
  });

  // ── GET /users/:handle/lists — 用户的公开榜单 ────────
  app.get<{
    Params: { handle: string };
    Querystring: { page?: number; pageSize?: number };
  }>('/:handle/lists', async (req, _reply) => {
    const { handle } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    const user = await app.prisma.user.findUnique({
      where: { handle },
      select: { id: true },
    });

    if (!user) {
      return _reply.code(404).send({ error: 'User not found' });
    }

    const [data, total] = await Promise.all([
      app.prisma.list.findMany({
        where: { authorId: user.id, visibility: 'PUBLIC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { items: true, comments: true } },
          dimensions: { select: { id: true, name: true } },
        },
      }),
      app.prisma.list.count({ where: { authorId: user.id, visibility: 'PUBLIC' } }),
    ]);

    return { data, total, page, pageSize };
  });

  // ── GET /users/:handle/rapports — 用户的同好关系 ──
  app.get<{ Params: { handle: string } }>('/:handle/rapports', async (req, _reply) => {
    const { handle } = req.params;

    const user = await app.prisma.user.findUnique({
      where: { handle },
      select: { id: true },
    });

    if (!user) {
      return _reply.code(404).send({ error: 'User not found' });
    }

    const rapports = await app.prisma.rapport.findMany({
      where: { userId: user.id },
      orderBy: { similarity: 'desc' },
      take: 50,
      include: {
        targetUser: {
          select: { id: true, nickname: true, handle: true, avatarUrl: true },
        },
      },
    });

    return rapports;
  });
};