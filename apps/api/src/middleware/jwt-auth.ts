/**
 * 围物为心 — JWT 认证中间件
 *
 * 从 Authorization: Bearer <token> header 读取 JWT，
 * 验证后挂载 req.user。支持与 X-Device-Id 匿名认证共存：JWT 优先。
 */

import { FastifyRequest, FastifyReply } from 'fastify';

interface AuthUser {
  id: string;
  handle: string;
  deviceId: string;
  isAuthenticated: boolean;
}

/**
 * 扩展 FastifyRequest 以支持认证用户
 */
declare module 'fastify' {
  interface FastifyRequest {
    authUser?: AuthUser;
  }
}

/**
 * 统一认证中间件 — JWT 优先，降级到 device-auth。
 * 结果挂载到 req.authUser（避免与 @fastify/jwt 的 req.user 冲突）
 */
export async function jwtAuthMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const authHeader = req.headers['authorization'] as string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = req.server.jwt.verify<{
        sub: string;
        handle: string;
      }>(token);

      const user = await req.server.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, handle: true, deviceId: true },
      });

      if (!user) {
        return reply.code(401).send({ error: '用户不存在' });
      }

      req.authUser = {
        id: user.id,
        handle: user.handle,
        deviceId: user.deviceId ?? '',
        isAuthenticated: true,
      };
      return;
    } catch {
      // JWT 无效/过期，降级到 device-auth
    }
  }

  // 降级：使用 device-auth
  const deviceId = req.headers['x-device-id'] as string | undefined;

  if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
    return reply.code(401).send({ error: '需要 Authorization 令牌或 X-Device-Id 头' });
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

  req.authUser = {
    id: user.id,
    handle: user.handle,
    deviceId,
    isAuthenticated: false,
  };
}