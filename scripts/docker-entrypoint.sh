#!/usr/bin/env bash
# ============================================================
#  围物为心 — Docker 入口脚本
#  职责: prisma db push → 启动 Fastify API
# ============================================================
set -euo pipefail

echo "[docker-entrypoint] Generating Prisma Client..."
(cd /app/apps/api && npx prisma generate) || true

echo "[docker-entrypoint] Pushing database schema..."
(cd /app/apps/api && npx prisma db push --skip-generate 2>/dev/null) || {
    echo "[docker-entrypoint] db push failed or skipped, continuing..."
}

echo "[docker-entrypoint] Starting API server..."
cd /app/apps/api
exec npx tsx src/index.ts
