#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
# 阿鹿赫尔战队 — API 看门狗 (watchdog)
# ═══════════════════════════════════════════════════════════
# 每 10 秒轮询健康检查端点，连续 3 次失败后自动重启 API。
# ═══════════════════════════════════════════════════════════

set -euo pipefail

# ── 配置 ──────────────────────────────────────────────────
API_PORT="${API_PORT:-3001}"
HEALTH_URL="${HEALTH_URL:-http://localhost:${API_PORT}/health/ready}"
CHECK_INTERVAL="${CHECK_INTERVAL:-10}"
MAX_FAILURES="${MAX_FAILURES:-3}"
API_DIR="${API_DIR:-$(dirname "$(readlink -f "$0")")/../apps/api}"
PID_FILE="${API_DIR}/.api.pid"
LOG_DIR="${API_DIR}/logs"
LOG_FILE="${LOG_DIR}/watchdog.log"
API_LOG="${LOG_DIR}/api.log"

# ── 初始化 ────────────────────────────────────────────────
mkdir -p "$LOG_DIR"

log() {
  echo "[watchdog] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

# ── 检查 API 是否存活 ────────────────────────────────────
check_health() {
  # 用 curl 发送 GET，超时 5 秒
  local resp
  resp=$(curl -sS --max-time 5 -o /dev/null -w '%{http_code}' "$HEALTH_URL" 2>/dev/null || echo "000")

  if [[ "$resp" == "2"* ]]; then
    return 0  # 健康
  else
    log "❌ 健康检查失败 HTTP($resp)"
    return 1  # 不健康
  fi
}

# ── 杀掉现有进程 ──────────────────────────────────────────
kill_api() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid=$(cat "$PID_FILE" 2>/dev/null || true)
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      log "🛑 正在终止 API 进程 PID=$pid ..."
      kill "$pid" 2>/dev/null || true
      # 等 5 秒让它优雅退出
      sleep 5
      # 还没死就强杀
      if kill -0 "$pid" 2>/dev/null; then
        log "💀 强杀 API 进程 PID=$pid"
        kill -9 "$pid" 2>/dev/null || true
        sleep 1
      fi
      log "✅ API 进程 PID=$pid 已终止"
    else
      log "⚠️  PID 文件中的进程 $pid 已不存在"
    fi
    rm -f "$PID_FILE"
  fi

  # 确保端口已释放
  local port_pid
  port_pid=$(lsof -ti:"$API_PORT" 2>/dev/null | head -1 || true)
  if [[ -n "$port_pid" ]]; then
    log "💀 清理端口占用进程 PID=$port_pid"
    kill -9 "$port_pid" 2>/dev/null || true
    sleep 1
  fi
}

# ── 重启 API ──────────────────────────────────────────────
restart_api() {
  log "🔄 正在重启 API ..."

  kill_api

  cd "$API_DIR"

  # 启动 API（使用 tsx 开发模式，跳过 tsc 编译）
  nohup npx tsx src/index.ts \
    >> "$API_LOG" 2>&1 &

  local new_pid=$!
  echo "$new_pid" > "$PID_FILE"

  log "🚀 API 已启动 PID=$new_pid"

  # 等 5 秒让服务就绪
  sleep 5
}

# ── 主循环 ─────────────────────────────────────────────────
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🔍 看门狗启动 — 每 ${CHECK_INTERVAL}s 检查 $HEALTH_URL"
log "   最大连续失败: $MAX_FAILURES 次"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

failures=0
restart_count=0

while true; do
  sleep "$CHECK_INTERVAL"

  if check_health; then
    # 健康 — 重置失败计数
    if [[ $failures -gt 0 ]]; then
      log "💚 API 恢复健康 (之前失败 $failures 次)"
    fi
    failures=0
  else
    failures=$((failures + 1))
    log "⚠️  连续失败 $failures/$MAX_FAILURES"

    if [[ $failures -ge $MAX_FAILURES ]]; then
      restart_count=$((restart_count + 1))
      log "🚨 连续失败 ${failures} 次，触发第 ${restart_count} 次自动重启！"
      restart_api
      failures=0

      # 重启后立即验证一次
      sleep 2
      if check_health; then
        log "✅ 重启后 API 恢复健康！"
      else
        log "❌ 重启后仍然不健康，将在下个周期重试"
        failures=1
      fi
    fi
  fi
done
