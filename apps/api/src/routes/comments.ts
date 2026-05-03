/**
 * 围物为心 — 评论路由
 *
 * GET  /api/lists/:id/comments — 获取评论列表（支持 sentiment 筛选）
 * POST /api/lists/:id/comments — 创建评论（自动 sentiment 分析）
 */

import { FastifyPluginAsync } from 'fastify';
import { analyzeSentiment } from '@weiwuweixin/shared';
import { validateSensitive } from '../services/sensitiveFilter';

export const commentRoutes: FastifyPluginAsync = async (app) => {
  // ── GET /lists/:id/comments — 评论列表 ───────────────
  app.get<{
    Params: { id: string };
    Querystring: {
      page?: number;
      pageSize?: number;
      sentiment?: string; // 'positive' | 'neutral' | 'negative' | 'all'
    };
  }>('/:id/comments', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'all'] },
        },
      },
    },
  }, async (req, _reply) => {
    const { id: listId } = req.params;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 50;
    const sentiment = req.query.sentiment ?? 'all';

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
    Body: { content: string; sentiment?: string };
  }>('/:id/comments', {
    schema: {
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 1000 },
          sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
        },
      },
    },
  }, async (req, _reply) => {
    const { id: listId } = req.params;
    const { content, sentiment: userSentiment } = req.body;

    // 由 device-auth 中间件注入
    const authorId = req.user!.id;

    // 🔒 敏感词检测
    const check = validateSensitive({ content });
    if (!check.valid) {
      return _reply.code(400).send({ error: check.message });
    }

    // 检查榜单存在
    const list = await app.prisma.list.findUnique({
      where: { id: listId },
      select: { id: true },
    });

    if (!list) {
      return _reply.code(404).send({ error: 'List not found' });
    }

    // 优先使用用户指定的 sentiment，否则自动分析
    const rawSentiment = userSentiment || analyzeSentiment(content);
    let sentiment: number;
    if (typeof rawSentiment === 'number') {
      sentiment = parseFloat(rawSentiment.toFixed(4));
    } else if (rawSentiment === 'positive') {
      sentiment = 1.0;
    } else if (rawSentiment === 'negative') {
      sentiment = -1.0;
    } else {
      // neutral 或自动分析的数值
      sentiment = parseFloat(String(rawSentiment)) || 0;
    }

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

  // ── DELETE /lists/:id/comments/:commentId — 删除评论 ──
  app.delete<{
    Params: { id: string; commentId: string };
  }>('/:id/comments/:commentId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          commentId: { type: 'string' },
        },
        required: ['id', 'commentId'],
      },
    },
  }, async (req, _reply) => {
    const { id: listId, commentId } = req.params;
    const userId = (req as any).authUser?.id;
    const userRole = (req as any).authUser?.role;

    // 查找评论
    const comment = await app.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true, listId: true },
    });

    if (!comment) {
      return _reply.code(404).send({ error: 'Comment not found' });
    }

    // 验证评论属于该榜单
    if (comment.listId !== listId) {
      return _reply.code(404).send({ error: 'Comment not found' });
    }

    // 仅评论作者或 ADMIN 可删除
    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      return _reply.code(403).send({ error: '只有评论作者或管理员可以删除此评论' });
    }

    await app.prisma.comment.delete({
      where: { id: commentId },
    });

    return { success: true };
  });
};