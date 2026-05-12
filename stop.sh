#!/usr/bin/env bash
# ============================================================
#  围物为心 (WeiWuWeiXin) — 一键停止脚本 v2
#  用法: ./stop.sh
# ============================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo ""
echo -e "🛑 停止所有围物为心服务 ..."

# 1. 杀死 pnpm dev 相关进程（进程组）
pkill -f "pnpm.*dev" 2>/dev/null && echo -e "  ${GREEN}✅ pnpm dev 已停止${NC}" || echo -e "  ${YELLOW}⏭️  pnpm dev 未在运行${NC}"
pkill -f "next dev" 2>/dev/null || true
pkill -f "tsx.*watch" 2>/dev/null || true
pkill -f "tsx.*src/index" 2>/dev/null || true

# 2. 释放端口
for p in 3000 3001; do
    ppid=$(lsof -ti:"$p" 2>/dev/null | head -1 || true)
    if [ -n "$ppid" ]; then
        kill -9 "$ppid" 2>/dev/null || true
        echo -e "  ${GREEN}✅ 端口 $p 已释放${NC}"
    fi
done

# 3. 停止 PostgreSQL (嵌入式)
if [ -f "$PROJECT_DIR/.pg-port" ]; then
    pgpid=$(lsof -ti:5432 2>/dev/null | head -1 || true)
    if [ -n "$pgpid" ]; then
        kill "$pgpid" 2>/dev/null || true
        sleep 1
        # 强制 kill
        kill -9 "$pgpid" 2>/dev/null || true
        echo -e "  ${GREEN}✅ PostgreSQL 已停止 (PID=$pgpid)${NC}"
    fi
    rm -f "$PROJECT_DIR/.pg-port"
else
    echo -e "  ${YELLOW}⏭️  PostgreSQL 未在运行${NC}"
fi

# 4. 清理 PID 文件
rm -f "$PROJECT_DIR/.pg-port" "$PROJECT_DIR/apps/api/.api.pid" "$PROJECT_DIR/apps/api/.watchdog.pid"

echo ""
echo -e "${GREEN}✅ 所有服务已停止${NC}"
echo ""
