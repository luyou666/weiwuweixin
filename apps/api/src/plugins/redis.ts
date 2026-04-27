/**
 * 围物为心 — Redis 连接 Fastify 插件
 * 开发模式下 Redis 不可用时不阻塞启动
 */

import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import Redis from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export const redisPlugin: FastifyPluginAsync = fp(async (app) => {
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) return null; // 停止重试
      const delay = Math.min(times * 200, 2000);
      return delay;
    },
  });

  redis.on('error', (err) => {
    app.log.error({ err }, 'Redis 连接错误');
  });

  redis.on('connect', () => {
    app.log.info('Redis 连接成功');
  });

  // 尝试连接，失败时仅打日志不影响启动
  try {
    await Promise.race([
      redis.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis连接超时')), 3000)),
    ]);
  } catch (err) {
    app.log.warn({ err }, 'Redis 连接失败，将使用降级模式');
  }

  app.decorate('redis', redis);

  app.addHook('onClose', async () => {
    redis.disconnect();
  });
});