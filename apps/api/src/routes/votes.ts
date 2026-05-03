/**
* 围物为心 — 榜单投票路由
*
* POST /api/lists/:id/vote    — 点赞或点踩榜单（影响置信度）
* GET  /api/lists/:id/votes   — 获取榜单投票状态
*
* 每个投票者对每个榜单只能投一票（up 或 down），再次投票则更新方向，
* 切换方向时自动调整 upvoteCount/downvoteCount 计数。
*/

import { FastifyPluginAsync } from 'fastify';
import { cache, CacheKeys, CACHE_TTL } from '../services/cache';

export const voteRoutes: FastifyPluginAsync = async (app) => {
  // ── POST /lists/:id/vote — 点赞/点踩榜单 ────────────
  app.post<{
    Params: { id: string };
    Body: {
      direction: 'up' | 'down';
      deviceId?: string;
    };
  }>('/:id/vote', {
    schema: {
      body: {
        type: 'object',
        required: ['direction'],
        properties: {
          direction: { type: 'string', enum: ['up', 'down'] },
          deviceId: { type: 'string' },
        },
      },
    },
  }, async (req, _reply) => {
    const { id: listId } = req.params;
    const { direction, deviceId } = req.body;
    const userId: string | undefined = req.user?.id;

    // 验证榜单存在
    const list = await app.prisma.list.findUnique({
      where: { id: listId },
      select: { id: true, upvoteCount: true, downvoteCount: true },
    });

    if (!list) {
      return _reply.code(404).send({ error: 'List not found' });
    }

    // 投票者指纹：已登录用户用 userId，匿名用户用 deviceId
    const voterFingerprint = userId || deviceId || 'anon';

    // 查找已有投票
    const existingVote = await app.prisma.listVote.findUnique({
      where: { listId_voterFingerprint: { listId, voterFingerprint } },
    });

    if (existingVote) {
      if (existingVote.direction === direction) {
        // 再次点击同一方向 → 取消投票
        await app.prisma.listVote.delete({
          where: { id: existingVote.id },
        });

        // 更新计数
        const updateData = direction === 'up'
          ? { upvoteCount: { decrement: 1 } }
          : { downvoteCount: { decrement: 1 } };

        await app.prisma.list.update({
          where: { id: listId },
          data: updateData,
        });

        // 失效缓存（投票影响置信度，需同时失效 listDetail、confidence、explore、lists）
        await Promise.all([
          cache.del(CacheKeys.listDetail(listId)),
          cache.del(CacheKeys.confidence(listId)),
          cache.del('explore:home'),
          cache.delPattern('lists:v2:*'),
        ]);

        const updatedList = await app.prisma.list.findUnique({
          where: { id: listId },
          select: { upvoteCount: true, downvoteCount: true },
        });

        return _reply.send({
          direction: null,
          upvoteCount: updatedList!.upvoteCount,
          downvoteCount: updatedList!.downvoteCount,
        });
      } else {
        // 切换方向（up → down 或 down → up）
        await app.prisma.listVote.update({
          where: { id: existingVote.id },
          data: { direction },
        });

        // 调整计数：旧方向-1，新方向+1
        const updateData = direction === 'up'
          ? { upvoteCount: { increment: 1 }, downvoteCount: { decrement: 1 } }
          : { downvoteCount: { increment: 1 }, upvoteCount: { decrement: 1 } };

        await app.prisma.list.update({
          where: { id: listId },
          data: updateData,
        });

        // 失效缓存（投票影响置信度，需同时失效 listDetail、confidence、explore、lists）
        await Promise.all([
          cache.del(CacheKeys.listDetail(listId)),
          cache.del(CacheKeys.confidence(listId)),
          cache.del('explore:home'),
          cache.delPattern('lists:v2:*'),
        ]);

        const updatedList = await app.prisma.list.findUnique({
          where: { id: listId },
          select: { upvoteCount: true, downvoteCount: true },
        });

        return _reply.send({
          direction,
          upvoteCount: updatedList!.upvoteCount,
          downvoteCount: updatedList!.downvoteCount,
        });
      }
    }

    // 新投票
    await app.prisma.listVote.create({
      data: {
        listId,
        direction,
        voterFingerprint,
        userId: userId || null,
      },
    });

    // 更新计数
    const updateData = direction === 'up'
      ? { upvoteCount: { increment: 1 } }
      : { downvoteCount: { increment: 1 } };

    await app.prisma.list.update({
      where: { id: listId },
      data: updateData,
    });

    // 失效缓存（投票影响置信度，需同时失效 listDetail、confidence、explore、lists）
    await Promise.all([
      cache.del(CacheKeys.listDetail(listId)),
      cache.del(CacheKeys.confidence(listId)),
      cache.del('explore:home'),
      cache.delPattern('lists:v2:*'),
    ]);

    const updatedList = await app.prisma.list.findUnique({
      where: { id: listId },
      select: { upvoteCount: true, downvoteCount: true },
    });

    return _reply.send({
      direction,
      upvoteCount: updatedList!.upvoteCount,
      downvoteCount: updatedList!.downvoteCount,
    });
  });

  // ── GET /lists/:id/votes — 获取榜单投票状态 ──────────
  app.get<{
    Params: { id: string };
    Querystring: { deviceId?: string };
  }>('/:id/votes', {
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
          deviceId: { type: 'string' },
        },
      },
    },
  }, async (req, _reply) => {
    const { id: listId } = req.params;
    const { deviceId } = req.query;
    // POST /vote 经过 auth middleware，匿名用户的 voterFingerprint 是 user.id（device-auth upsert 生成）
    // GET 请求不经过 auth middleware，需要自己解析认证信息
    let voterFingerprint: string;

    // 1) 检查 global preHandler 挂载的 user（JWT 或 device-auth 已经解析过）
    const userId = (req as any).user?.id || (req as any).authUser?.id;
    if (userId) {
      voterFingerprint = userId;
    }
    // 2) 没有 preHandler 时，手动尝试 JWT（前端 GET 请求也带 Authorization header）
    else {
      const authHeader = req.headers['authorization'] as string | undefined;
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const decoded = app.jwt.verify<{ sub: string }>(authHeader.slice(7));
          voterFingerprint = decoded.sub;
        } catch {
          voterFingerprint = '';
        }
      }
      // 3) 降级到 deviceId 查找用户
      else if (deviceId) {
        const anonUser = await app.prisma.user.findUnique({
          where: { deviceId },
          select: { id: true },
        });
        voterFingerprint = anonUser?.id || deviceId;
      } else {
        voterFingerprint = '';
      }
    }

    const list = await app.prisma.list.findUnique({
      where: { id: listId },
      select: { upvoteCount: true, downvoteCount: true },
    });

    if (!list) {
      return _reply.code(404).send({ error: 'List not found' });
    }

    // 获取当前用户的投票状态
    let myVote: string | null = null;
    if (voterFingerprint) {
      const vote = await app.prisma.listVote.findUnique({
        where: { listId_voterFingerprint: { listId, voterFingerprint } },
        select: { direction: true },
      });
      myVote = vote?.direction ?? null;
    }

    return {
      upvoteCount: list.upvoteCount,
      downvoteCount: list.downvoteCount,
      myVote,
    };
  });
};