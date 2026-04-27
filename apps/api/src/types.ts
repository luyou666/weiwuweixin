/**
 * 围物为心 — Fastify 类型扩展
 *
 * 将 prisma / redis / jwt / authenticate 装饰器添加到 FastifyInstance 类型
 * 覆盖 @fastify/jwt 默认的 user 类型为我们的认证用户类型
 */

import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    redis: Redis;
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      handle: string;
    };
  }
}