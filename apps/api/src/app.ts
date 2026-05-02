/**
 * 围物为心 — Fastify 应用配置
 */

import Fastify, { FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { prismaPlugin } from './plugins/prisma';
import { redisPlugin } from './plugins/redis';
import { healthRoutes } from './routes/health';
import { listRoutes } from './routes/lists';
import { scoreRoutes } from './routes/scores';
import { commentRoutes } from './routes/comments';
import { userRoutes } from './routes/users';
import { exploreRoutes } from './routes/explore';
import { authRoutes } from './routes/auth';
import { voteRoutes } from './routes/votes';
import { leaderboardRoutes } from './routes/leaderboard';
import { authorScoreRoutes } from './routes/author-scores';
import { jwtAuthMiddleware } from './middleware/jwt-auth';

export async function buildApp(opts: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
    ...opts, // 允许调用方覆盖连接限制、keepAlive 等
  });

  // ── JWT ──────────────────────────────────────────────
  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  });

  // ── CORS ──────────────────────────────────────────────
  await app.register(cors, {
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Device-Id', 'Authorization', 'X-Request-Id'],
  });

  // ── Rate Limit ────────────────────────────────────────
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // ── Swagger / OpenAPI ─────────────────────────────────
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: '围物为心 API',
        description: '围物为心 — 群体智慧榜单平台的 OpenAPI 文档',
        version: '0.0.1',
      },
      servers: [
        { url: 'http://localhost:3001', description: '本地开发' },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });

  // ── Plugins ───────────────────────────────────────────
  await app.register(prismaPlugin);
  await app.register(redisPlugin);

  // ── 认证装饰器 ────────────────────────────────────────
  app.decorate('authenticate', async (req: any, reply: any) => {
    return jwtAuthMiddleware(req, reply);
  });

  // ── 写操作认证（JWT 优先，降级到 device-auth）──────
  app.addHook('preHandler', async (req, reply) => {
    const method = req.method.toUpperCase();
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return;

    // 认证路由免认证
    if (req.url.startsWith('/api/auth/')) return;

    return jwtAuthMiddleware(req, reply);
  });

  // ── Routes ─────────────────────────────────────────────
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(listRoutes, { prefix: '/api/lists' });
  await app.register(scoreRoutes, { prefix: '/api/lists' });
  await app.register(commentRoutes, { prefix: '/api/lists' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(exploreRoutes, { prefix: '/api/explore' });
  await app.register(voteRoutes, { prefix: '/api/lists' });
  await app.register(leaderboardRoutes, { prefix: '/api/leaderboard' });
  await app.register(authorScoreRoutes, { prefix: '/api/lists' });

  // ── 全局错误处理：P2002 唯一约束冲突 → 409 ──────────
  app.setErrorHandler((error, _request, reply) => {
    if ((error as any).code === 'P2002') {
      return reply.code(409).send({ error: '资源已存在' });
    }
    reply.send(error);
  });

  return app;
}
