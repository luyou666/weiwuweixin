#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
# 阿鹿赫尔战队 — 生产级 API 启动脚本
# ═══════════════════════════════════════════════════════════
# 用法: ./start-api.sh [start|stop|restart|status|watch]
#   start   — 先构建再启动 API + 看门狗
#   watch   — 仅启动看门狗（API 已运行）
#   stop    — 停止 API + 看门狗
#   restart — 重启 API + 看门狗
#   status  — 查看运行状态
# ═══════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_DIR/apps/api"
API_PORT="${API_PORT:-3001}"
PID_FILE="$API_DIR/.api.pid"
WATCHDOG_PID_FILE="$API_DIR/.watchdog.pid"
LOG_DIR="$API_DIR/logs"

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[API]${NC} $*"; }
log_ok()    { echo -e "${GREEN}[API]${NC} $*"; }
log_err()   { echo -e "${RED}[API]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[API]${NC} $*"; }

mkdir -p "$LOG_DIR"

# ── 停止 API ──────────────────────────────────────────────
stop_api() {
  log_info "正在停止 API ..."

  # 杀掉 API 进程
  if [[ -f "$PID_FILE" ]]; then
    local pid=$(cat "$PID_FILE" 2>/dev/null || true)
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      sleep 2
      kill -9 "$pid" 2>/dev/null || true
      log_ok "API 进程 PID=$pid 已终止"
    fi
    rm -f "$PID_FILE"
  fi

  # 杀掉看门狗
  if [[ -f "$WATCHDOG_PID_FILE" ]]; then
    local wpid=$(cat "$WATCHDOG_PID_FILE" 2>/dev/null || true)
    if [[ -n "$wpid" ]] && kill -0 "$wpid" 2>/dev/null; then
      kill "$wpid" 2>/dev/null || true
      log_ok "看门狗 PID=$wpid 已终止"
    fi
    rm -f "$WATCHDOG_PID_FILE"
  fi

  # 强制释放端口
  local port_pid=$(lsof -ti:"$API_PORT" 2>/dev/null | head -1 || true)
  if [[ -n "$port_pid" ]]; then
    kill -9 "$port_pid" 2>/dev/null || true
    log_warn "释放端口 $API_PORT 进程 PID=$port_pid"
  fi

  log_ok "✅ 所有进程已停止"
}

# ── 构建 ──────────────────────────────────────────────────
build_api() {
  log_info "构建 API (pnpm --filter @weiwuweixin/api build) ..."
  cd "$PROJECT_DIR"

  if pnpm --filter @weiwuweixin/api build 2>&1 | tail -5; then
    log_ok "构建完成"
  else
    log_err "构建失败！"
    return 1
  fi
}

# ── 启动 API ──────────────────────────────────────────────
start_api() {
  # 检查是否已在运行
  if [[ -f "$PID_FILE" ]]; then
    local pid=$(cat "$PID_FILE" 2>/dev/null || true)
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      log_warn "API 已在运行 PID=$pid — 先停止再重启"
    fi
  fi

  # 跳过 tsc 编译（项目有跨包 TS 路径配置问题），直接用 tsx 运行
  cd "$API_DIR"

  # 启动 API
  log_info "启动 API (http://localhost:$API_PORT) ..."
  nohup npx tsx src/index.ts \
    >> "$LOG_DIR/api.log" 2>&1 &

  local pid=$!
  echo "$pid" > "$PID_FILE"
  log_ok "API 启动 PID=$pid"

  # 等待就绪
  log_info "等待 API 就绪 ..."
  for i in $(seq 1 15); do
    local code=$(curl -sSo /dev/null -w '%{http_code}' --max-time 2 "http://localhost:$API_PORT/health" 2>/dev/null || echo "0")
    if [[ "$code" == "200" ]]; then
      log_ok "✅ API 就绪! http://localhost:$API_PORT"
      break
    fi
    if [[ $i -eq 15 ]]; then
      log_err "❌ API 启动超时"
      return 1
    fi
    sleep 1
  done
}

# ── 启动物理狗 ────────────────────────────────────────────
start_watchdog() {
  if [[ -f "$WATCHDOG_PID_FILE" ]]; then
    local wpid=$(cat "$WATCHDOG_PID_FILE" 2>/dev/null || true)
    if [[ -n "$wpid" ]] && kill -0 "$wpid" 2>/dev/null; then
      log_warn "看门狗已在运行 PID=$wpid"
      return 0
    fi
  fi

  log_info "启动看门狗 (每 10s 检查健康) ..."
  bash "$SCRIPT_DIR/watchdog.sh" \
    >> "$LOG_DIR/watchdog.log" 2>&1 &

  local wpid=$!
  echo "$wpid" > "$WATCHDOG_PID_FILE"
  log_ok "看门狗启动 PID=$wpid 🐕"
}

# ── 状态查询 ──────────────────────────────────────────────
show_status() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo " 阿鹿赫尔战队 — API 运行状态"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # API 进程
  if [[ -f "$PID_FILE" ]]; then
    local pid=$(cat "$PID_FILE" 2>/dev/null || true)
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      echo -e "  API 进程:   ${GREEN}运行中${NC} (PID=$pid)"
    else
      echo -e "  API 进程:   ${RED}已停止${NC}"
    fi
  else
    echo -e "  API 进程:   ${RED}未启动${NC}"
  fi

  # 看门狗
  if [[ -f "$WATCHDOG_PID_FILE" ]]; then
    local wpid=$(cat "$WATCHDOG_PID_FILE" 2>/dev/null || true)
    if [[ -n "$wpid" ]] && kill -0 "$wpid" 2>/dev/null; then
      echo -e "  看门狗:     ${GREEN}守护中${NC} (PID=$wpid) 🐕"
    else
      echo -e "  看门狗:     ${YELLOW}已停止${NC}"
    fi
  else
    echo -e "  看门狗:     ${YELLOW}未启动${NC}"
  fi

  # 健康检查
  local code=$(curl -sSo /dev/null -w '%{http_code}' --max-time 3 "http://localhost:$API_PORT/health" 2>/dev/null || echo "0")
  if [[ "$code" == "200" ]]; then
    echo -e "  健康检查:   ${GREEN}$code OK${NC}"
  else
    echo -e "  健康检查:   ${RED}$code${NC}"
  fi

  # 最近日志
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo " 最近 10 行日志:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  tail -10 "$LOG_DIR/api.log" 2>/dev/null || echo "  无日志"
  echo ""
}

# ── 命令路由 ──────────────────────────────────────────────
case "${1:-start}" in
  start)
    log_info "════════════════════════════════"
    log_info " 阿鹿赫尔战队 — API 启动"
    log_info "════════════════════════════════"
    stop_api
    start_api
    start_watchdog
    show_status
    ;;
  watch)
    log_info "仅启动看门狗 ..."
    start_watchdog
    show_status
    ;;
  stop)
    stop_api
    ;;
  restart)
    log_info "重启 API + 看门狗 ..."
    stop_api
    start_api
    start_watchdog
    show_status
    ;;
  status)
    show_status
    ;;
  *)
    echo "用法: $0 {start|stop|restart|status|watch}"
    echo ""
    echo "  start   — 构建 + 启动 API + 看门狗"
    echo "  watch   — 仅启动看门狗（API 已运行）"
    echo "  stop    — 停止所有进程"
    echo "  restart — 重启 API + 看门狗"
    echo "  status  — 查看运行状态"
    exit 1
    ;;
esac
