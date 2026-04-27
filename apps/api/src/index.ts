/**
 * 围物为心 — Fastify 服务器入口
 */

import 'dotenv/config';
import { buildApp } from './app';

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? '0.0.0.0';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 围物为心 API 启动成功 — http://${HOST}:${PORT}`);
    app.log.info(`📖 API 文档 — http://${HOST}:${PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();