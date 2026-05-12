/**
 * 围物为心 — Redis 连接 Fastify 插件 (已废弃)
 * 此文件保留为空操作以确保兼容，所有缓存已迁移至内存层。
 */
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

export const redisPlugin: FastifyPluginAsync = fp(async (_app) => {
  // Redis 已移除，所有缓存使用进程内存 Map 实现
  // 参见 services/cache.ts
});
