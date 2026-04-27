/**
 * 围物为心 — 评论路由
 *
 * GET  /api/lists/:id/comments — 获取评论列表（支持 sentiment 筛选）
 * POST /api/lists/:id/comments — 创建评论（自动 sentiment 分析）
 */

import { FastifyPluginAsync } from 'fastify';
import { analyzeSentiment } from '@weiwuweixin/shared';

export const commentRoutes: FastifyPluginAsync = async (app) => {
  // ── GET /lists/:id/comments — 评论列表 ───────────────
  app.get<{
    Params: { id: string };
    Querystring: {
      page?: number;
      pageSize?: number;
      sentiment?: string; // 'positive' | 'neutral' | 'negative' | 'all'
    };
  }>('/:id/comments', async (req, _reply) => {
    const { id: listId } = req.params;
    const { page = 1, pageSize = 50, sentiment = 'all' } = req.query;

    // 检查榜单存在
    const list = await app.prisma.list.findUnique({
      where: { id: listId },
      select: { id: true },
    });

    if (!list) {
      return _reply.code(404).send({ error: 'List not found' });
    }

    const where: Record<string, unknown> = { listId };

    // Sentiment 过滤
    if (sentiment === 'positive') {
      where.sentiment = { gt: 0.3 };
    } else if (sentiment === 'negative') {
      where.sentiment = { lt: -0.3 };
    } else if (sentiment === 'neutral') {
      where.AND = [
        { sentiment: { gte: -0.3 } },
        { sentiment: { lte: 0.3 } },
      ];
    }

    const [comments, total] = await Promise.all([
      app.prisma.comment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, nickname: true, handle: true, avatarUrl: true } },
        },
      }),
      app.prisma.comment.count({ where }),
    ]);

    // 统计各分类数量
    const counts = await app.prisma.comment.aggregate({
      where: { listId },
      _count: true,
    });

    const positiveCount = await app.prisma.comment.count({
      where: { listId, sentiment: { gt: 0.3 } },
    });
    const negativeCount = await app.prisma.comment.count({
      where: { listId, sentiment: { lt: -0.3 } },
    });

    return {
      data: comments,
      total,
      page,
      pageSize,
      sentimentCounts: {
        all: counts._count,
        positive: positiveCount,
        neutral: counts._count - positiveCount - negativeCount,
        negative: negativeCount,
      },
    };
  });

  // ── POST /lists/:id/comments — 创建评论 ──────────────
  app.post<{
    Params: { id: string };
    Body: { content: string };
  }>('/:id/comments', {
    schema: {
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 1000 },
        },
      },
    },
  }, async (req, _reply) => {
    const { id: listId } = req.params;
    const { content } = req.body;

    // 由 device-auth 中间件注入
    const authorId = req.user!.id;

    // 检查榜单存在
    const list = await app.prisma.list.findUnique({
      where: { id: listId },
      select: { id: true },
    });

    if (!list) {
      return _reply.code(404).send({ error: 'List not found' });
    }

    // 自动 sentiment 分析
    const sentiment = analyzeSentiment(content);

    const comment = await app.prisma.comment.create({
      data: {
        content,
        sentiment: parseFloat(sentiment.toFixed(4)),
        listId,
        authorId,
      },
      include: {
        author: { select: { id: true, nickname: true, handle: true, avatarUrl: true } },
      },
    });

    return _reply.code(201).send(comment);
  });
};