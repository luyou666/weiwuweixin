#!/usr/bin/env bash
# WeiWuWeiXin — 可靠启动 v8
# 修复: 端口3002 (3000被Windows svchost占用) + cd apps/web解决i18n路径
set -uo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"

# PowerShell 桥接 — 杀Windows侧端口占用
ps_win() {
    powershell.exe -NoProfile -Command "$1" 2>/dev/null
}

port_win_kill() {
    local port=$1
    local pid
    pid=$(ps_win "Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Select-Object -First 1")
    if [ -n "$pid" ] && [ "$pid" != "0" ]; then
        echo "  (killing Windows PID $pid on port $port)"
        ps_win "Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue" || true
        taskkill //F //PID "$pid" 2>/dev/null || true
    fi
}

port_kill_all() {
    local port=$1 count=${2:-15}
    # 先杀 Windows 侧
    for ((i=0; i<3; i++)); do
        port_win_kill "$port"
        sleep 0.5
    done
    # 再杀 Linux 侧
    for ((i=0; i<count; i++)); do
        fuser -k "${port}/tcp" 2>/dev/null || true
        sleep 0.3
    done
}

cleanup() {
    echo; echo "Stopping..."
    for sid in "${SIDS[@]:-}"; do
        kill -TERM -- -"$sid" 2>/dev/null || true
    done
    sleep 1.5
    for sid in "${SIDS[@]:-}"; do
        kill -KILL -- -"$sid" 2>/dev/null || true
    done
    for p in 5432 3002 3001 6379; do
        port_kill_all "$p" 5
    done
    rm -f "$DIR/.pg-port" "$DIR/data/pg/postmaster.pid" 2>/dev/null || true
    echo "Bye"
}
trap cleanup EXIT INT TERM

SIDS=()
run_setsid() {
    setsid "$@" &
    local pid=$!
    SIDS+=("$pid")
    echo "$pid"
}

echo "============================================"
echo "  WeiWuWeiXin — Starting v8"
echo "============================================"

# ── 0. 清场 (跨WSL边界) ──
echo "[0] Cleaning old processes..."
for p in 5432 3002 3001 6379; do
    port_kill_all "$p" 20
done
rm -f "$DIR/.pg-port" "$DIR/data/pg/postmaster.pid" 2>/dev/null || true
sleep 2
echo "  OK"

# ── 验证清场结果 ──
echo "  Verifying ports..."
for p in 3002 3001 5432 6379; do
    if timeout 1 bash -c "echo >/dev/tcp/127.0.0.1/$p" 2>/dev/null; then
        echo "  ⚠️  Port $p still BUSY (Windows?)"
        port_win_kill "$p"
        sleep 1
    else
        echo "  ✅ Port $p FREE"
    fi
done

# ── 1. PostgreSQL ──
echo "[1/4] PostgreSQL..."
node "$DIR/packages/shared/start-pg.cjs" &
PG_PID=$!
for i in $(seq 1 30); do
    [ -f "$DIR/.pg-port" ] && { echo "  OK (${i}s)"; break; }
    kill -0 "$PG_PID" 2>/dev/null || { echo "  FAILED"; exit 1; }
    sleep 1
done

# ── 2. Schema ──
echo "[2/4] Database Schema..."
(cd "$DIR/apps/api" && npx prisma db push --skip-generate) 2>/dev/null || {
    (cd "$DIR/apps/api" && npx prisma generate >/dev/null 2>&1 && npx prisma db push)
}
echo "  OK"

# ── 3. Redis ──
echo "[3/4] Redis..."
if timeout 2 redis-cli -p 6379 ping 2>/dev/null | grep -q PONG; then
    echo "  OK (already running)"
else
    port_kill_all 6379 10
    redis-server --daemonize yes --port 6379 2>/dev/null || true
    sleep 0.5
    timeout 2 redis-cli -p 6379 ping 2>/dev/null | grep -q PONG && echo "  OK" || echo "  Skip (degraded)"
fi

# ── 4a. API ──
echo "[4a] API :3001..."
API_OK=false
for api_try in 1 2; do
    port_kill_all 3001 15
    sleep 0.5
    HOST=127.0.0.1 PORT=3001 run_setsid npx tsx "$DIR/apps/api/src/index.ts"
    API_PID=${SIDS[-1]}
    for i in $(seq 1 25); do
        curl -sSo /dev/null --max-time 2 "http://127.0.0.1:3001/health" 2>/dev/null && { API_OK=true; break; }
        kill -0 "$API_PID" 2>/dev/null || break
        sleep 1
    done
    [ "$API_OK" = true ] && { echo "  OK (${i}s)"; break; }
    echo "  Retry $api_try..."
    kill -KILL -- -"$API_PID" 2>/dev/null || true
done
[ "$API_OK" = true ] || { echo "  FAILED"; exit 1; }

# ── 4b. Web — 先清Windows端口, 再直接启动 ──
echo "[4b] Web :3002..."

WEB_OK=false
for web_try in $(seq 1 5); do
    # 双边界清理
    port_kill_all 3002 20
    sleep 1

    HOSTNAME=127.0.0.1 run_setsid bash -c "cd \"$DIR/apps/web\" && npx next dev -p 3002 -H 127.0.0.1"
    WEB_PID=${SIDS[-1]}

    for i in $(seq 1 50); do
        code=$(curl -sSo /dev/null -w '%{http_code}' --max-time 2 "http://127.0.0.1:3002" 2>/dev/null || echo "0")
        case "$code" in
            200|307|308|304) WEB_OK=true; break ;;
        esac
        if ! kill -0 "$WEB_PID" 2>/dev/null; then
            wait "$WEB_PID" 2>/dev/null
            break
        fi
        sleep 1
    done

    [ "$WEB_OK" = true ] && { echo "  OK (${i}s)"; break; }
    echo "  Try ${web_try}: EADDRINUSE (Windows port holder?), retrying..."
    kill -KILL -- -"$WEB_PID" 2>/dev/null || true
    port_kill_all 3002 25
    sleep 3
done

[ "$WEB_OK" = true ] || { echo "  FAILED after 5 retries"; exit 1; }

# ── 完成 ──
echo ""
echo "Opening browser..."
xdg-open "http://localhost:3002/zh/" 2>/dev/null &

echo ""
echo "============================================"
echo "  WeiWuWeiXin is running!"
echo "  http://localhost:3002/zh/"
echo "  Ctrl+C to stop"
echo "============================================"
echo ""
wait
