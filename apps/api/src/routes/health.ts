/**
 * 围物为心 — 健康检查路由
 */

import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (_req, _reply) => {
    return { status: 'ok', service: 'weiwuweixin-api', timestamp: new Date().toISOString() };
  });

  app.get('/ready', async (req, _reply) => {
    // 检查数据库连接
    try {
      await req.server.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', db: 'connected' };
    } catch {
      return { status: 'degraded', db: 'disconnected' };
    }
  });
};