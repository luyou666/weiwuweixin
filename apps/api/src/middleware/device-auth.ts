/**
 * 围物为心 — 设备认证中间件（原始版，仅作为内部工具使用）
 *
 * 项目已升级为 JWT 认证系统，此模块保留作为参考。
 * 新的认证流程请使用 jwt-auth.ts
 */

import { FastifyRequest, FastifyReply } from 'fastify';

export async function deviceAuthMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const deviceId = req.headers['x-device-id'] as string | undefined;

  if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
    return reply.code(401).send({ error: 'Missing X-Device-Id header' });
  }

  const handle = `anon-${deviceId.slice(0, 32)}`;

  const user = await req.server.prisma.user.upsert({
    where: { deviceId },
    update: {},
    create: {
      handle,
      nickname: handle,
      deviceId,
    },
  });

  (req as any).user = {
    id: user.id,
    handle: user.handle,
    deviceId,
    isAuthenticated: false,
  };
}