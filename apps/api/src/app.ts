/**
 * 围物为心 — Fastify 应用配置
 *
 * 🔒 安全加固 v2 (2026-05-03)：JWT强制、helmet、CORS白名单、路由级限速
 */

import Fastify, { FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import helmet from 'helmet';
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

/** 🔒 CORS 白名单（H6） */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://weiwuweixin.com',
  'https://www.weiwuweixin.com',
];

export async function buildApp(opts: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
    ...opts, // 允许调用方覆盖连接限制、keepAlive 等
  });

  // ── JWT 🔒 C2 — 强制强密钥，拒绝硬编码 fallback ──────
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'dev-secret-change-me' || jwtSecret === 'dev-secret-change-in-production') {
    throw new Error('JWT_SECRET 环境变量必须设置且不能使用默认值。生产环境请使用 openssl rand -hex 64 生成强密钥。');
  }
  await app.register(jwt, {
    secret: jwtSecret,
  });

  // ── Security Headers (H5) — helmet v7 (Fastify 4 兼容) ─
  const helmetMiddleware = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:3001', 'https://weiwuweixin.com'],
        fontSrc: ["'self'", 'https:', 'data:'],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
  app.addHook('onRequest', async (req, reply) => {
    return new Promise<void>((resolve, next) => {
      helmetMiddleware(req.raw, reply.raw, (err?: Error) => {
        if (err) reply.send(err);
        resolve();
      });
    });
  });

  // ── CORS 🔒 H6 — 白名单化 ─────────────────────────────
  await app.register(cors, {
    origin: (origin, cb) => {
      // 允许无 origin 的请求（服务器间调用、curl 等）
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      // 本地开发：localhost 子域名也放行
      if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) return cb(null, true);
      cb(new Error('不允许的跨域来源'), false);
    },
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

  // ── 写操作强制 JWT 认证 🔒 C4 ───────────────────────
  app.addHook('preHandler', async (req, reply) => {
    const method = req.method.toUpperCase();
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return;

    // 认证路由免认证（登录/注册/刷新）
    if (req.url.startsWith('/api/auth/')) return;

    await jwtAuthMiddleware(req, reply);

    // 中间件已发送 401 响应则停止
    if (reply.sent) return;

    // 拒绝纯 device-auth 匿名用户执行写操作
    const authUser = (req as any).authUser;
    if (!authUser || !authUser.isAuthenticated) {
      return reply.code(401).send({ error: '写操作需要 JWT 登录认证，请先登录' });
    }
  });

  // ── H1: 登录/注册路由级限速 (5/min/IP) ─────────────────
  // 注意：Fastify rate-limit 通过 keyGenerator 实现 IP 维度限速
  // 此处我们在 auth 路由内部做更细粒度的控制，见 auth.ts

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
