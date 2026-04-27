/**
 * 围物为心 — 榜单 CRUD 路由
 */

import { FastifyPluginAsync } from 'fastify';
import { Visibility } from '@prisma/client';
import { cache, CacheKeys, CACHE_TTL } from '../services/cache';

export const listRoutes: FastifyPluginAsync = async (app) => {
  // ── GET /lists — 榜单列表（支持 category, sort, search）──────────
  app.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          visibility: { type: 'string', enum: ['PUBLIC', 'LINK_ONLY', 'PRIVATE'] },
          authorId: { type: 'string' },
          sort: { type: 'string', enum: ['latest', 'popular', 'confidence'] },
          search: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array' },
            total: { type: 'integer' },
            page: { type: 'integer' },
            pageSize: { type: 'integer' },
          },
        },
      },
    },
  }, async (req, _reply) => {
    const query = req.query as {
      page?: number;
      pageSize?: number;
      visibility?: string;
      authorId?: string;
      sort?: string;
      search?: string;
    };

    const {
      page = 1,
      pageSize = 20,
      visibility,
      authorId,
      sort = 'latest',
      search,
    } = query;

    const where: Record<string, unknown> = {};
    if (visibility) where.visibility = visibility;
    if (authorId) where.authorId = authorId;

    // 搜索
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 排序
    let orderBy: Record<string, string>;
    switch (sort) {
      case 'popular':
        orderBy = { voteCount: 'desc' };
        break;
      case 'confidence':
        orderBy = { voteCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const cacheKey = `lists:${JSON.stringify(query)}:${page}:${pageSize}`;

    const result = await cache.withCache(
      cacheKey,
      async () => {
        const [data, total] = await Promise.all([
          app.prisma.list.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy,
            include: {
              author: { select: { id: true, nickname: true, handle: true, avatarUrl: true } },
              _count: { select: { items: true, comments: true, communityScores: true } },
              dimensions: { select: { id: true, name: true, weight: true } },
            },
          }),
          app.prisma.list.count({ where }),
        ]);
        return { data, total, page, pageSize };
      },
      CACHE_TTL.LIST,
    );

    return result;
  });

  // ── GET /lists/:id — 榜单详情 ───────────────────────
  app.get('/:id', async (req, _reply) => {
    const { id } = req.params as { id: string };

    const list = await app.prisma.list.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, nickname: true, handle: true, avatarUrl: true } },
        dimensions: { orderBy: { weight: 'desc' } },
        items: {
          orderBy: { rank: 'asc' },
          include: {
            authorScores: {
              select: { id: true, value: true, confidence: true, userId: true, dimensionId: true },
            },
            communityScores: {
              select: { id: true, value: true, confidence: true, voteCount: true },
            },
          },
        },
        communityScores: {
          select: { id: true, value: true, confidence: true, voteCount: true },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { author: { select: { id: true, nickname: true, avatarUrl: true } } },
        },
      },
    });

    if (!list) {
      return _reply.code(404).send({ error: 'List not found' });
    }

    // 增加浏览量（异步，不阻塞响应）
    app.prisma.list.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => { /* ignore */ });

    // 计算社区评分统计
    const communityStats = {
      totalVotes: list.communityScores.reduce((sum, s) => sum + s.voteCount, 0),
      uniqueItems: list.communityScores.length,
      avgValue: list.communityScores.length > 0
        ? list.communityScores.reduce((sum, s) => sum + s.value, 0) / list.communityScores.length
        : 0,
      avgConfidence: list.communityScores.length > 0
        ? list.communityScores.reduce((sum, s) => sum + s.confidence, 0) / list.communityScores.length
        : 0,
    };

    // 计算作者评分统计
    const authorScoresFlat = list.items.flatMap(item => item.authorScores);
    const authorStats = {
      total: authorScoresFlat.length,
      avgValue: authorScoresFlat.length > 0
        ? authorScoresFlat.reduce((sum, s) => sum + s.value, 0) / authorScoresFlat.length
        : 0,
    };

    return {
      ...list,
      stats: {
        community: communityStats,
        author: authorStats,
      },
    };
  });

  // ── POST /lists — 创建榜单 ──────────────────────────
  app.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 30 },
          subtitle: { type: 'string', maxLength: 60 },
          algorithmId: { type: 'string' },
          scale: { type: 'string' },
          visibility: { type: 'string', enum: ['PUBLIC', 'LINK_ONLY', 'PRIVATE'] },
          note: { type: 'string', maxLength: 140 },
          dimensions: { type: 'array' },
          items: { type: 'array' },
        },
      },
    },
  }, async (req, _reply) => {
    const body = req.body as {
      title: string;
      subtitle?: string;
      algorithmId?: string;
      scale?: string;
      visibility?: string;
      note?: string;
      dimensions?: { name: string; weight?: number; scale?: number }[];
      items?: { name: string; note?: string; url?: string; rank?: number }[];
    };

    // 由 device-auth 中间件注入
    const authorId = req.user!.id;

    const list = await app.prisma.list.create({
      data: {
        title: body.title,
        subtitle: body.subtitle ?? '',
        algorithmId: body.algorithmId ?? 'weighted-mean',
        scale: body.scale ?? '1-5',
        visibility: (body.visibility as Visibility) ?? Visibility.PUBLIC,
        note: body.note,
        authorId,
        dimensions: body.dimensions
          ? { create: body.dimensions.map(d => ({ name: d.name, weight: d.weight ?? 1.0, scale: d.scale })) }
          : undefined,
        items: body.items
          ? { create: body.items.map((item, idx) => ({ name: item.name, note: item.note, url: item.url, rank: item.rank ?? idx + 1 })) }
          : undefined,
      },
      include: { author: { select: { id: true, nickname: true, handle: true, avatarUrl: true } }, dimensions: true, items: true },
    });

    // Invalidate list caches
    await cache.delPattern('lists:*');

    return _reply.code(201).send(list);
  });

  // ── PATCH /lists/:id — 更新榜单 ──────────────────────
  app.patch('/:id', {
    schema: {
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 30 },
          subtitle: { type: 'string', maxLength: 60 },
          visibility: { type: 'string', enum: ['PUBLIC', 'LINK_ONLY', 'PRIVATE'] },
          note: { type: 'string', maxLength: 140 },
        },
      },
    },
  }, async (req, _reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as Record<string, unknown>;

    // TODO: 检查是否是作者

    try {
      const list = await app.prisma.list.update({
        where: { id },
        data: body,
      });

      // 缓存失效
      await cache.del(CacheKeys.confidence(id));
      await cache.delPattern('lists:*');

      return list;
    } catch (err: any) {
      if (err.code === 'P2025') {
        return _reply.code(404).send({ error: 'List not found' });
      }
      throw err;
    }
  });

  // ── DELETE /lists/:id — 删除榜单（仅作者）────────────
  app.delete('/:id', async (req, _reply) => {
    const { id } = req.params as { id: string };

    // TODO: 验证是作者 (request.user.id === list.authorId)

    try {
      await app.prisma.list.delete({ where: { id } });

      // 缓存失效
      await cache.del(CacheKeys.confidence(id));
      await cache.delPattern('lists:*');

      return { success: true };
    } catch (err: any) {
      if (err.code === 'P2025') {
        return _reply.code(404).send({ error: 'List not found' });
      }
      throw err;
    }
  });
};