/**
* 围物为心 — 评分路由
*
* POST /api/lists/:id/scores — 提交社区评分（含 anti-cheat 检测）
* GET  /api/lists/:id/scores — 获取评分汇总
*/

import { FastifyPluginAsync } from 'fastify';
import { detectSuspiciousScore, computeWeight } from '@weiwuweixin/scoring';
import type { AntiCheatInput, AntiCheatResult } from '@weiwuweixin/scoring';
import { cache, CacheKeys, CACHE_TTL } from '../services/cache';

export const scoreRoutes: FastifyPluginAsync = async (app) => {
  // ── POST /lists/:id/scores — 提交社区评分 ────────────
  app.post<{
    Params: { id: string };
    Body: {
      itemId: string;
      value: number;
      /** 当前设备 ID（anonymous voting） */
      deviceId?: string;
      /** 评分耗时（毫秒） */
      durationMs?: number;
      /** 所有维度评分（用于 anti-cheat 检测） */
      scores?: number[];
    };
  }>('/:id/scores', {
    schema: {
      body: {
        type: 'object',
        required: ['itemId', 'value'],
        properties: {
          itemId: { type: 'string' },
          value: { type: 'number', minimum: 0 },
          deviceId: { type: 'string' },
          durationMs: { type: 'number' },
          scores: { type: 'array', items: { type: 'number' } },
        },
      },
    },
  }, async (req, _reply) => {
    const { id: listId } = req.params;
    const body = req.body;

    // 由 device-auth 中间件注入
    const userId: string | undefined = req.user?.id;
    const deviceId = body.deviceId ?? '';

    // ── Anti-cheat 检测 ────────────────────────────────
    const list = await app.prisma.list.findUnique({
      where: { id: listId },
      select: { id: true, scale: true, voteCount: true },
    });

    if (!list) {
      return _reply.code(404).send({ error: 'List not found' });
    }

    // 获取同设备同榜单的24h评分数
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sameDeviceVotes24h = deviceId
      ? await app.prisma.communityScore.count({
          where: {
            listId,
            voterFingerprint: deviceId,
            createdAt: { gte: since24h },
          },
        })
      : 0;

    const maxScale = list.scale === '0-100' ? 100 : list.scale === '1-10' ? 10 : 5;
    const minScale = list.scale === '0-100' ? 0 : 1;

    const antiCheatInput: AntiCheatInput = {
      durationMs: body.durationMs ?? 5000,
      deviceId,
      listId,
      scores: body.scores ?? [body.value],
      maxScale,
      minScale,
      sameDeviceListVotes24h: sameDeviceVotes24h + 1,
    };

    const antiCheatResult: AntiCheatResult = detectSuspiciousScore(antiCheatInput);
    const weight = computeWeight(antiCheatResult, list.voteCount);

    // 创建/更新社区评分 — 按 voterFingerprint 区分不同投票者
    const voterFingerprint = deviceId ? deviceId : (userId ?? 'anon');
    const score = await app.prisma.communityScore.upsert({
      where: {
        listId_itemId_voterFingerprint: { listId, itemId: body.itemId, voterFingerprint },
      },
      create: {
        listId,
        itemId: body.itemId,
        voterFingerprint,
        userId,
        value: body.value * weight,
        confidence: weight,
        voteCount: 1,
      },
      update: {
        value: body.value * weight,
        confidence: weight,
        voteCount: { increment: 1 },
      },
    });

    // 增加榜单的投票计数
    await app.prisma.list.update({
      where: { id: listId },
      data: { voteCount: { increment: 1 } },
    });

    // 失效缓存
    await cache.del(CacheKeys.confidence(listId));
    await cache.del(CacheKeys.scoreStats(listId));

    return _reply.code(201).send({
      ...score,
      antiCheat: {
        isSuspicious: antiCheatResult.isSuspicious,
        flags: antiCheatResult.flags,
        weight,
      },
    });
  });

  // ── GET /lists/:id/scores — 获取评分汇总 ─────────────
  app.get<{
    Params: { id: string };
    Querystring: { page?: number; pageSize?: number };
  }>('/:id/scores', async (req, _reply) => {
    const { id: listId } = req.params;
    const { page = 1, pageSize = 50 } = req.query;

    const cacheKey = CacheKeys.scoreStats(listId);

    const result = await cache.withCache(
      cacheKey,
      async () => {
        // 检查榜单是否存在
        const list = await app.prisma.list.findUnique({
          where: { id: listId },
          select: { id: true, title: true, scale: true, voteCount: true },
        });

        if (!list) {
          return null;
        }

        const [scores, total] = await Promise.all([
          app.prisma.communityScore.findMany({
            where: { listId },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { value: 'desc' },
            include: {
              item: { select: { id: true, name: true, rank: true } },
            },
          }),
          app.prisma.communityScore.count({ where: { listId } }),
        ]);

        // 聚合统计
        const aggregate = await app.prisma.communityScore.aggregate({
          where: { listId },
          _avg: { value: true, confidence: true },
          _sum: { voteCount: true },
          _count: true,
        });

        // 独立用户数
        const uniqueUsers = await app.prisma.communityScore.findMany({
          where: { listId, userId: { not: null } },
          select: { userId: true },
          distinct: ['userId'],
        });

        return {
          list: { id: list.id, title: list.title, scale: list.scale },
          scores,
          total,
          page,
          pageSize,
          stats: {
            avgValue: aggregate._avg.value ?? 0,
            avgConfidence: aggregate._avg.confidence ?? 0,
            totalVotes: aggregate._sum.voteCount ?? 0,
            totalScores: aggregate._count,
            uniqueUsers: uniqueUsers.length,
          },
        };
      },
      CACHE_TTL.SCORE_STATS,
    );

    if (!result) {
      return _reply.code(404).send({ error: 'List not found' });
    }

    return result;
  });
};