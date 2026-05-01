/**
 * 围物为心 — Fastify 服务器入口（含连接限制 + keepAlive 防卡死 + 优雅关闭）
 */

import 'dotenv/config';
import { buildApp } from './app';

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? '0.0.0.0';

async function main() {
  const app = await buildApp({
    pluginTimeout: 10_000,
  });

  // ── 连接限制 + keepAlive 防卡死（在底层 HTTP Server 上设置）──
  app.addHook('onReady', () => {
    const server: any = app.server;
    server.maxConnections = Number(process.env.MAX_CONNECTIONS ?? 200);
    server.keepAliveTimeout = 61_000;   // 61秒后关闭空闲连接
    server.requestTimeout = 30_000;      // 30秒后超时
    app.log.info('连接限制已设置: maxConnections=%d keepAlive=%dms',
      server.maxConnections, server.keepAliveTimeout);
  });

  // ── 全局信号处理 ──────────────────────────────────────
  let isShuttingDown = false;

  async function gracefulShutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    app.log.warn(`收到 ${signal} 信号，正在优雅关闭...`);

    try {
      await app.close();
      app.log.info('服务器已安全关闭');
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, '关闭过程出错');
      process.exit(1);
    }
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // ── 未捕获异常不直接崩溃，记录后尝试恢复 ──
  process.on('uncaughtException', (err) => {
    app.log.error({ err }, '未捕获异常');
    if (!isShuttingDown) {
      setTimeout(() => process.exit(1), 5000);
    }
  });

  process.on('unhandledRejection', (reason) => {
    app.log.error({ reason }, '未处理的 Promise 拒绝');
  });

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 围物为心 API 启动成功 — http://${HOST}:${PORT}`);
    app.log.info(`📖 API 文档 — http://${HOST}:${PORT}/docs`);
    app.log.info(`💚 健康检查 — http://${HOST}:${PORT}/health`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
