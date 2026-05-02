/**
 * 围物为心 — 作者评分路由
 *
 * POST /api/lists/:id/author-scores — 作者提交榜单内 item 的维度评分
 */

import { FastifyPluginAsync } from 'fastify';
import { cache, CacheKeys } from '../services/cache';

export const authorScoreRoutes: FastifyPluginAsync = async (app) => {
  // ── POST /lists/:id/author-scores — 作者提交评分 ──────
  app.post<{
    Params: { id: string };
    Body: {
      scores: Array<{ itemId: string; dimensionId: string; value: number }>;
      durationMs?: number;
      deviceId?: string;
    };
  }>('/:id/author-scores', {
    schema: {
      body: {
        type: 'object',
        required: ['scores'],
        properties: {
          scores: {
            type: 'array',
            items: {
              type: 'object',
              required: ['itemId', 'dimensionId', 'value'],
              properties: {
                itemId: { type: 'string' },
                dimensionId: { type: 'string' },
                value: { type: 'number', minimum: 0 },
              },
            },
          },
          durationMs: { type: 'number' },
          deviceId: { type: 'string' },
        },
      },
    },
  }, async (req, _reply) => {
    const { id: listId } = req.params;
    const userId: string | undefined = req.user?.id;
    const { scores } = req.body;

    if (!userId) {
      return _reply.code(401).send({ error: '请先登录' });
    }

    // ── 验证榜单存在且当前用户是作者 ──────────────────
    const list = await app.prisma.list.findUnique({
      where: { id: listId },
      select: { id: true, authorId: true },
    });

    if (!list) {
      return _reply.code(404).send({ error: 'List not found' });
    }

    if (userId !== list.authorId) {
      return _reply.code(403).send({ error: '只有作者可以提交作者评分' });
    }

    // ── 收集所有 itemId 和 dimensionId，批量验证归属 ──
    const itemIds = [...new Set(scores.map(s => s.itemId))];
    const dimensionIds = [...new Set(scores.map(s => s.dimensionId))];

    const [items, dimensions] = await Promise.all([
      app.prisma.item.findMany({
        where: { id: { in: itemIds } },
        select: { id: true, listId: true },
      }),
      app.prisma.dimension.findMany({
        where: { id: { in: dimensionIds } },
        select: { id: true, listId: true },
      }),
    ]);

    const validItemIds = new Set(items.filter(i => i.listId === listId).map(i => i.id));
    const validDimensionIds = new Set(dimensions.filter(d => d.listId === listId).map(d => d.id));

    // 过滤出无效的 id
    const invalidItemIds = Array.from(itemIds).filter(id => !validItemIds.has(id));
    const invalidDimensionIds = Array.from(dimensionIds).filter(id => !validDimensionIds.has(id));

    if (invalidItemIds.length > 0 || invalidDimensionIds.length > 0) {
      const errors: string[] = [];
      if (invalidItemIds.length > 0) {
        errors.push(`以下 itemId 不属于此榜单: ${invalidItemIds.join(', ')}`);
      }
      if (invalidDimensionIds.length > 0) {
        errors.push(`以下 dimensionId 不属于此榜单: ${invalidDimensionIds.join(', ')}`);
      }
      return _reply.code(400).send({ error: errors.join('; ') });
    }

    // ── 批量 upsert 作者评分 ──────────────────────────
    const upsertResults = await Promise.all(
      scores.map(({ itemId, dimensionId, value }) =>
        app.prisma.authorScore.upsert({
          where: {
            userId_dimensionId_itemId: { userId, dimensionId, itemId },
          },
          create: {
            value,
            confidence: 1.0, // 作者自评，置信度默认 1.0
            userId,
            listId,
            dimensionId,
            itemId,
          },
          update: {
            value,
            confidence: 1.0,
          },
        })
      )
    );

    // ── 失效缓存 ──────────────────────────────────────
    await cache.del(CacheKeys.confidence(listId));
    await cache.del(CacheKeys.scoreStats(listId));
    await cache.del(CacheKeys.listDetail(listId));

    return _reply.code(201).send({ scores: upsertResults });
  });
};
