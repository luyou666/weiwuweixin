/**
 * 围物为心 — 榜单 CRUD 路由
 */

import { FastifyPluginAsync } from 'fastify';
import { Visibility } from '@prisma/client';
import { cache, CacheKeys, CACHE_TTL } from '../services/cache';
import { computeListConfidence } from '../services/confidence';
import { validateSensitive } from '../services/sensitiveFilter';
import type { ConfidenceParams } from '@weiwuweixin/scoring';

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
          sort: { type: 'string', enum: ['latest', 'popular', 'confidence', 'diverse'] },
          search: { type: 'string' },
          categories: { type: 'array', items: { type: 'string' } },
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
      categories?: string[];
    };

    const {
      page = 1,
      pageSize = 20,
      visibility,
      authorId,
      sort = 'latest',
      search,
      categories,
    } = query;

    const where: Record<string, unknown> = {};
    if (visibility) where.visibility = visibility;
    if (authorId) where.authorId = authorId;

    // 搜索 — 支持多关键词 OR 匹配
    if (search) {
      const keywords = search.split(/\s+/).filter(k => k.length > 0);
      if (keywords.length === 1) {
        where.OR = [
          { title: { contains: keywords[0], mode: 'insensitive' } },
          { subtitle: { contains: keywords[0], mode: 'insensitive' } },
        ];
      } else if (keywords.length > 1) {
        // 多关键词 OR: 每个关键词在 title 或 subtitle 中匹配
        where.OR = keywords.flatMap(kw => [
          { title: { contains: kw, mode: 'insensitive' } },
          { subtitle: { contains: kw, mode: 'insensitive' } },
        ]);
      }
    }

    // 分类筛选: 英文ID→中文关键词映射(与前端 explore 的 categoryKeywordMap 对齐)
    if (categories && categories.length > 0) {
      const CATEGORY_KW: Record<string, string[]> = {
        movie: ['影视', '电影', '动画', '日剧', '纪录片'],
        music: ['音乐', '华语', '古典', '专辑'],
        food: ['美食', '冰饮', '咖啡', '纪录片'],
        travel: ['旅行', '京都', '散步', '红叶'],
        tech: ['科技', '前端', 'AI', '深度学习', '技术', '框架'],
        book: ['读书', '推理', '宋词', '诗词', '书籍', '文学'],
        sports: ['运动', '跑步', '健身', '居家'],
      };
      const flatKeywords = categories.flatMap(c => CATEGORY_KW[c] ?? [c]);
      if (flatKeywords.length > 0) {
        const catOr = flatKeywords.map(kw => [
          { title: { contains: kw, mode: 'insensitive' } },
          { subtitle: { contains: kw, mode: 'insensitive' } },
        ]).flat();
        // 如果已有搜索条件，合并; 否则直接赋值
        if (where.OR) {
          where.OR = [...(where.OR as any[]), ...catOr];
        } else {
          where.OR = catOr;
        }
      }
    }

    // 排序
    let orderBy: Record<string, string>;
    switch (sort) {
      case 'popular':
        orderBy = { voteCount: 'desc' };
        break;
      case 'confidence':
        // confidence 是计算值(0-1)，无对应字段；用评分参与人数近似排序
        orderBy = { viewCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // 为探索/瀑布流统一计算置信度（与 enrichList 公式一致）
    // 使用更短的 TTL，确保缓存不会让旧数据污染置信度
    const cacheKey = `lists:v2:${JSON.stringify(query)}:${page}:${pageSize}`;

    const result = await cache.withCache(
      cacheKey,
      async () => {
        const [data, total] = await Promise.all([
          app.prisma.list.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy,
            select: {
              id: true,
              title: true,
              subtitle: true,
              algorithmId: true,
              voteCount: true,
              viewCount: true,
              upvoteCount: true,
              downvoteCount: true,
              createdAt: true,
              updatedAt: true,
              coverUrl: true,
              note: true,
              scale: true,
              visibility: true,
              author: { select: { id: true, nickname: true, handle: true, avatarUrl: true } },
              _count: { select: { items: true, comments: true, communityScores: true } },
              dimensions: { select: { id: true, name: true, weight: true } },
            },
          }),
          app.prisma.list.count({ where }),
        ]);

        // 后端统一计算置信度（与 explore calcConfidence / enrichList 完全一致）
        const enriched = data.map(item => {
          const scoreCount = item._count.communityScores ?? 0;
          const upvotes = item.upvoteCount ?? 0;
          const downvotes = item.downvoteCount ?? 0;
          const totalVotes = upvotes + downvotes;
          const voteRatio = totalVotes > 0 ? upvotes / totalVotes : 0;
          const base = scoreCount > 0 ? 0.2 : 0.05;
          const participationBoost = Math.min(0.4, (scoreCount / 30) * 0.2);
          const consensusBoost = totalVotes > 0 ? Math.min(0.3, voteRatio * 0.3) : 0;
          const confidence = Math.min(0.99, Math.max(0.05, base + participationBoost + consensusBoost));
          return { ...item, confidence };
        });

        return { data: enriched, total, page, pageSize };
      },
      CACHE_TTL.LIST,
    );

    return result;
  });

  // ── GET /lists/:id — 榜单详情 ───────────────────────
  app.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
  }, async (req, _reply) => {
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

    // 🔒 IDOR 防御：检查榜单可见性
    const currentUserId = (req as any).user?.id;
    if (list.visibility === 'PRIVATE') {
      if (currentUserId !== list.authorId || currentUserId === undefined) {
        return _reply.code(404).send({ error: 'List not found' });
      }
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

    // 榜单级投票共识度: upvoteRatio = upvotes / (upvotes + downvotes)
    const totalListVotes = list.upvoteCount + list.downvoteCount;
    const voteConsensus = totalListVotes > 0 ? list.upvoteCount / totalListVotes : 0;

    // 探索页一致置信度（0-1，与 calcConfidence/enrichList 同公式）
    const scoreCount = list.communityScores.length;
    const exploreBase = scoreCount > 0 ? 0.2 : 0.05;
    const exploreParticipationBoost = Math.min(0.4, (scoreCount / 30) * 0.2);
    const exploreConsensusBoost = totalListVotes > 0 ? Math.min(0.3, voteConsensus * 0.3) : 0;
    const exploreConfidence = Math.min(0.99, Math.max(0.05,
      exploreBase + exploreParticipationBoost + exploreConsensusBoost
    ));

    // 引擎置信度（0-100，由 scoring 引擎计算，保留用于 confidence-panel 因子展示）
    let engineConfidence: number | null = null;
    let engineParams: ConfidenceParams | null = null;
    try {
      const result = await computeListConfidence(app.prisma, id, true);
      engineConfidence = result.confidence;
      engineParams = result.params;
    } catch {
      // confidence 计算失败不影响列表返回
    }

    return {
      ...list,
      // 探索页一致置信度（0-1，与话题聚合/瀑布流同公式）
      confidence: exploreConfidence,
      // 引擎置信度（0-100，scoring 引擎 sigmoid 公式，保留用于详情分析）
      engineConfidence,
      confidenceParams: engineParams ?? null,
      voteConsensus,
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
          authorScores: { type: 'array', items: { type: 'array', items: { type: 'number' } } },
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
      authorScores?: number[][];
    };

    // 🔒 敏感词检测（标题+副标题+备注）
    const check = validateSensitive({
      title: body.title,
      subtitle: body.subtitle ?? '',
      note: body.note ?? '',
    });
    if (!check.valid) {
      return _reply.code(400).send({ error: check.message });
    }

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
      include: { author: { select: { id: true, nickname: true, handle: true, avatarUrl: true } }, dimensions: true, items: { include: { authorScores: true } } },
    });

    // 创建作者的评分记录（如果有）
    if (body.authorScores && list.items.length > 0 && list.dimensions.length > 0) {
      const authorScoreData = [];
      for (let itemIdx = 0; itemIdx < list.items.length; itemIdx++) {
        for (let dimIdx = 0; dimIdx < list.dimensions.length; dimIdx++) {
          const value = body.authorScores[itemIdx]?.[dimIdx];
          if (value != null && value > 0) {
            authorScoreData.push({
              value,
              userId: authorId,
              listId: list.id,
              dimensionId: list.dimensions[dimIdx].id,
              itemId: list.items[itemIdx].id,
            });
          }
        }
      }
      if (authorScoreData.length > 0) {
        await app.prisma.authorScore.createMany({ data: authorScoreData });
      }
    }

    // Invalidate list caches
    await cache.delPattern('lists:*');

    // 如果有评分记录，重新查询以包含它们
    if (body.authorScores) {
      const listWithScores = await app.prisma.list.findUnique({
        where: { id: list.id },
        include: { author: { select: { id: true, nickname: true, handle: true, avatarUrl: true } }, dimensions: true, items: { include: { authorScores: true } } },
      });
      return _reply.code(201).send(listWithScores);
    }

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

    // 检查是否是作者
    const existing = await app.prisma.list.findUnique({ where: { id }, select: { authorId: true } });
    if (!existing) return _reply.code(404).send({ error: 'List not found' });
    const userId = (req as any).user?.id ?? (req as any).authUser?.id;
    if (!userId || userId !== existing.authorId) {
      return _reply.code(403).send({ error: '只有作者可以编辑此榜单' });
    }

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

    // 验证是作者
    const existing = await app.prisma.list.findUnique({ where: { id }, select: { authorId: true } });
    if (!existing) return _reply.code(404).send({ error: 'List not found' });
    const userId = (req as any).user?.id ?? (req as any).authUser?.id;
    if (!userId || userId !== existing.authorId) {
      return _reply.code(403).send({ error: '只有作者可以删除此榜单' });
    }

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