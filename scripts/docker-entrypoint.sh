#!/usr/bin/env bash
# ============================================================
#  围物为心 — Docker 入口脚本
#  职责: prisma db push → 启动 Fastify API
# ============================================================
set -euo pipefail

echo "[docker-entrypoint] Pushing database schema..."
(cd /app/apps/api && npx prisma db push --skip-generate 2>/dev/null) || {
    echo "[docker-entrypoint] Retry with prisma generate..."
    (cd /app/apps/api && npx prisma generate && npx prisma db push)
}

echo "[docker-entrypoint] Starting API server..."
exec node /app/apps/api/dist/index.js
