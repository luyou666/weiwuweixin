/**
 * 围物为心 — 健康检查路由（含连接池诊断）
 */

import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  /** 基础存活检测 — 进程还活着 */
  app.get('/', async (_req, _reply) => {
    return {
      status: 'ok',
      service: 'weiwuweixin-api',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  });

  /** 深度就绪检测 — DB + Redis 真实连通性 */
  app.get('/ready', async (req, _reply) => {
    const checks: { db: string; redis: string; memory: string } = {
      db: 'unknown',
      redis: 'unknown',
      memory: 'ok',
    };

    // ── 数据库连通性 ──
    try {
      const start = Date.now();
      await req.server.prisma.$queryRaw`SELECT 1`;
      checks.db = `connected (${Date.now() - start}ms)`;
    } catch {
      checks.db = 'disconnected';
    }

    // ── Redis 连通性 ──
    try {
      const start = Date.now();
      if (req.server.redis && req.server.redis.status === 'ready') {
        await req.server.redis.ping();
        checks.redis = `connected (${Date.now() - start}ms)`;
      } else {
        checks.redis = 'not_available';
      }
    } catch {
      checks.redis = 'disconnected';
    }

    // ── 内存压力 ──
    const mem = process.memoryUsage();
    const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
    if (heapUsedMB > 450) {
      checks.memory = `warning (heap: ${heapUsedMB}MB)`;
    }

    // ── 综合判定 ──
    const isHealthy = checks.db !== 'disconnected';
    const status = isHealthy ? 'ready' : 'degraded';

    return {
      status,
      checks,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  });

  /** 数据库连接池统计 */
  app.get('/db-stats', async (req, _reply) => {
    try {
      // Prisma 不直接暴露连接池指标，通过 pg_stat_activity 查询
      const connections: any[] = await req.server.prisma.$queryRaw`
        SELECT state, count(*)::int AS count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `;

      const total = connections.reduce((sum: number, r: any) => sum + r.count, 0);

      return {
        total,
        byState: Object.fromEntries(connections.map((r: any) => [r.state ?? 'unknown', r.count])),
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        error: 'Failed to query connection stats',
        message: err.message,
        timestamp: new Date().toISOString(),
      };
    }
  });
};
