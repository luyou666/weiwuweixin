#!/usr/bin/env bash
# ============================================================
#  围物为心 (WeiWuWeiXin) — 一键安装脚本
#  MIT License © 2026 围物为心 WeiWuWeiXin
# ============================================================
# 安装完成后只需一个命令: ./start.sh
# 不需要 Docker！PostgreSQL 使用嵌入式版本，Redis 可选。
# ============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="$SOURCE_DIR"

# ── Banner ──────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║        🏮  围物为心 WeiWuWeiXin  安装程序       ║${NC}"
echo -e "${BOLD}║         把心中的排序具象化 · 算法化             ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── 0. 选择安装路径 ──────────────────────────────────────
echo -e "${BLUE}━━━ [0/5] 选择安装路径 ━━━${NC}"
echo ""
echo -e "  默认安装路径: ${BOLD}${INSTALL_DIR}${NC}"
echo ""
printf "  ${YELLOW}请输入安装路径 (直接回车使用默认): ${NC}"
read -r USER_PATH

if [ -n "$USER_PATH" ]; then
    INSTALL_DIR="${USER_PATH/#~/$HOME}"
    if [ "$INSTALL_DIR" != "$SOURCE_DIR" ]; then
        echo ""
        echo -e "  ${YELLOW}正在复制项目文件到: ${BOLD}${INSTALL_DIR}${NC}"
        if [ -d "$INSTALL_DIR" ]; then
            echo -e "  ${YELLOW}⚠️  目标路径已存在，将覆盖现有文件。${NC}"
            printf "  ${YELLOW}确认覆盖? [y/N]: ${NC}"
            read -r OVERWRITE
            if [ "$OVERWRITE" != "y" ] && [ "$OVERWRITE" != "Y" ]; then
                echo -e "  ${RED}❌ 安装已取消。${NC}"; exit 1
            fi
        fi
        mkdir -p "$INSTALL_DIR"
        rsync -a --info=progress2 \
            --exclude='node_modules' --exclude='.next' --exclude='.next.bak' --exclude='.next_old' \
            --exclude='.git' --exclude='.pg-data' --exclude='redis-data' --exclude='minio-data' \
            --exclude='*.pid' --exclude='playwright-report' --exclude='storybook-static' \
            --exclude='test-results' --exclude='coverage' --exclude='dist' --exclude='out' \
            --exclude='build' --exclude='dump.rdb' --exclude='scripts/logs' \
            --exclude='field_inventory.json' --exclude='data' \
            --exclude='_check*' --exclude='check-*' --exclude='step5*' \
            --exclude='clear_cache*' --exclude='test-pg*' --exclude='setup_test*' \
            --exclude='reset_test*' --exclude='cleanup*' --exclude='verify*' \
            --exclude='update-i18n*' --exclude='setup-db*' --exclude='start-pg*' \
            --exclude='create-test-user*' --exclude='undefined:*' \
            --exclude='lighthouse.*' --exclude='*.test.ts' \
            "$SOURCE_DIR/" "$INSTALL_DIR/" 2>/dev/null || \
        cp -a "$SOURCE_DIR/"* "$SOURCE_DIR"/.[!.]* "$INSTALL_DIR/" 2>/dev/null || true
        echo -e "  ${GREEN}✅ 项目文件已复制完成${NC}"
    fi
fi

ENV_TARGET="$INSTALL_DIR/apps/api/.env"
cd "$INSTALL_DIR"
echo ""
echo -e "  ${GREEN}📍 安装路径: ${BOLD}${INSTALL_DIR}${NC}"
echo ""

# ── 1. 前置条件检查 ──────────────────────────────────────
echo -e "${BLUE}━━━ [1/5] 检查前置条件 ━━━${NC}"
echo ""

check_cmd() {
    local name="$1" cmd="$2" version_arg="${3:---version}"
    printf "  %-28s " "$name …"
    if ! command -v "$cmd" &>/dev/null; then
        echo -e "${RED}❌ 未安装${NC}"; return 1
    fi
    local ver; ver=$("$cmd" $version_arg 2>&1 | head -1 | grep -oE '[0-9]+(\.[0-9]+)*' | head -1) || true
    echo -e "${GREEN}✅${ver:+ $ver}${NC}"; return 0
}

FAIL=0
check_cmd "Node.js >= 18" node --version || FAIL=1
check_cmd "pnpm >= 8"  pnpm --version || FAIL=1

# 检查 openssl（生成 JWT_SECRET 用）
if command -v openssl &>/dev/null; then
    echo -e "  openssl                    ${GREEN}✅${NC}"
else
    echo -e "  openssl                    ${YELLOW}⚠️  未安装 (JWT_SECRET 将用备用方案生成)${NC}"
fi

# Redis 是可选的
if command -v redis-server &>/dev/null || [ -x ~/.local/bin/redis-server ]; then
    echo -e "  redis-server               ${GREEN}✅ (推荐，非必须)${NC}"
else
    echo -e "  redis-server               ${YELLOW}⚠️  未安装 (API 将降级运行，功能不受影响)${NC}"
fi

echo ""
echo -e "  ${GREEN}🚀 不需要 Docker！PostgreSQL 使用嵌入式版本 (npm 包)${NC}"

if [ "$FAIL" -eq 1 ]; then
    echo ""
    echo -e "${RED}⚠️  请先安装 Node.js 和 pnpm，然后重新运行本脚本。${NC}"
    echo -e "  Node.js: https://nodejs.org/"
    echo -e "  pnpm:    npm install -g pnpm"
    exit 1
fi
echo ""

# ── 2. 配置环境变量 ──────────────────────────────────────
echo -e "${BLUE}━━━ [2/5] 配置环境变量 ━━━${NC}"
echo ""

if [ -f "$ENV_TARGET" ]; then
    echo -e "  ${YELLOW}⚠️  $ENV_TARGET 已存在，跳过创建。${NC}"
else
    if [ ! -f "$INSTALL_DIR/.env.example" ]; then
        echo -e "${RED}❌ 未找到 .env.example，请确保安装包完整。${NC}"; exit 1
    fi
    cp "$INSTALL_DIR/.env.example" "$ENV_TARGET"
    echo -e "  ${GREEN}✅ 已从 .env.example 创建 .env${NC}"
fi

# 生成 JWT_SECRET
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom 2>/dev/null | head -c 32 | xxd -p 2>/dev/null || date +%s | sha256sum | cut -d' ' -f1)
if grep -q 'JWT_SECRET=changeme' "$ENV_TARGET" 2>/dev/null; then
    sed -i "s/JWT_SECRET=changeme/JWT_SECRET=$JWT_SECRET/" "$ENV_TARGET"
    echo -e "  ${GREEN}✅ 已生成随机 JWT_SECRET${NC}"
else
    echo -e "  ${YELLOW}⚠️  JWT_SECRET 已配置，跳过${NC}"
fi

# 修正 DATABASE_URL 密码 — 生成随机密码，提示用户保存
DB_PASSWORD=$(openssl rand -base64 12 2>/dev/null | tr -d '=+/' | head -c 16 || echo "changeme")
sed -i "s|DATABASE_URL=\"postgresql://weiwuweixin:changeme@localhost:5432/|DATABASE_URL=\"postgresql://weiwuweixin:${DB_PASSWORD}@localhost:5432/|" "$ENV_TARGET"
sed -i "s/PG_PASSWORD=changeme/PG_PASSWORD=${DB_PASSWORD}/" "$ENV_TARGET"
echo -e "  ${GREEN}✅ 已生成随机数据库密码${NC}"

# 管理员账号
echo ""
echo -e "  ${YELLOW}配置管理员账号${NC}"
printf "  管理员邮箱 ${BLUE}[admin@example.com]${NC}: "
read -r ADMIN_EMAIL; ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
printf "  管理员密码 ${BLUE}[留空则随机生成]${NC}: "
read -rs ADMIN_PASSWORD; echo ""
if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD=$(openssl rand -base64 12 2>/dev/null | tr -d '=+/' | head -c 16 || echo "changeme123")
    echo -e "  ${GREEN}已随机生成管理员密码${NC}"
fi
sed -i "s/ADMIN_EMAIL=.*/ADMIN_EMAIL=$ADMIN_EMAIL/" "$ENV_TARGET"
sed -i "s/ADMIN_PASSWORD=.*/ADMIN_PASSWORD=$ADMIN_PASSWORD/" "$ENV_TARGET"
echo -e "  ${GREEN}✅ 管理员账号已配置${NC}"
echo ""

# ── 3. 安装依赖 ──────────────────────────────────────────
echo -e "${BLUE}━━━ [3/5] 安装依赖 (pnpm install) ━━━${NC}"
echo ""
echo -e "  ${YELLOW}这可能需要 1-3 分钟，请耐心等待 ...${NC}"
echo ""

if pnpm install 2>&1 | tail -5; then
    echo ""
    echo -e "  ${GREEN}✅ pnpm install 完成${NC}"
else
    echo ""
    echo -e "${RED}❌ pnpm install 失败，请检查网络连接${NC}"; exit 1
fi
echo ""

# ── 4. 初始化数据库 ──────────────────────────────────────
echo -e "${BLUE}━━━ [4/5] 初始化数据库 ━━━${NC}"
echo ""

echo -e "  ${YELLOW}生成 Prisma Client ...${NC}"
cd "$INSTALL_DIR/apps/api"
npx prisma generate 2>&1 | tail -3
echo ""

echo -e "  ${YELLOW}推送数据库 Schema ...${NC}"
if npx prisma db push 2>&1 | tail -3; then
    echo -e "  ${GREEN}✅ 数据库 Schema 已就绪${NC}"
else
    echo -e "  ${YELLOW}⚠️  数据库推送失败 — start.sh 启动时会自动重试${NC}"
fi

cd "$INSTALL_DIR"
echo ""

# ── 5. 演示数据 (可选) ────────────────────────────────────
echo -e "${BLUE}━━━ [5/5] 演示数据 (可选) ━━━${NC}"
echo ""
printf "  ${YELLOW}是否填充演示数据？(5 用户 / 20 榜单 / 300 评分) [y/N]: ${NC}"
read -r SEED_DEMO
if [ "$SEED_DEMO" = "y" ] || [ "$SEED_DEMO" = "Y" ]; then
    pnpm seed:demo && echo -e "  ${GREEN}✅ 演示数据已填充${NC}" || echo -e "  ${YELLOW}⚠️  演示数据填充失败${NC}"
else
    echo -e "  ${YELLOW}⏭️  跳过演示数据${NC}"
fi
echo ""

# ── 6. 桌面快捷方式 ─────────────────────────────────────────
echo -e "${BLUE}━━━ [6/6] 桌面快捷方式 ━━━${NC}"
echo ""

# 检测 Windows 用户名
WIN_USER=""
for dir in /mnt/c/Users/*; do
    name=$(basename "$dir")
    case "$name" in Default|Public|"All Users"|defaultuser0) continue ;; esac
    [ -d "$dir/Desktop" ] && [ -d "$dir/Documents" ] && { WIN_USER="$name"; break; }
done

DESKTOP_DIR=""
[ -n "$WIN_USER" ] && DESKTOP_DIR="/mnt/c/Users/$WIN_USER/Desktop"

if [ -n "$DESKTOP_DIR" ] && [ -d "$DESKTOP_DIR" ]; then
    # ── 复制图标到项目目录 ──
    ICON_SRC="$INSTALL_DIR/assets/icon.ico"
    if [ ! -f "$ICON_SRC" ]; then
        [ -f "$SOURCE_DIR/assets/icon.ico" ] && cp "$SOURCE_DIR/assets/icon.ico" "$ICON_SRC" 2>/dev/null || true
    fi

    # ── 把 Linux 路径转为 Windows UNC ──
    WIN_DIR="$INSTALL_DIR"
    case "$WIN_DIR" in
        /home/*) WIN_DIR="\\\\wsl\$\\Ubuntu${WIN_DIR}" ;;
        /mnt/c/*) WIN_DIR="C:${WIN_DIR#/mnt/c}" ;;
    esac
    WIN_DIR=$(echo "$WIN_DIR" | sed 's|/|\\|g')
    WIN_ICO="${WIN_DIR}\\assets\\icon.ico"

    LNK="$DESKTOP_DIR\\WeiWuWeiXin.lnk"
    WSL_ARGS="-d Ubuntu -- bash -c \"cd $INSTALL_DIR && ./start.sh\""

    # ── 用 PowerShell 创建 .lnk（带自定义图标）──
    PS_EXE=/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe
    if [ -f "$PS_EXE" ]; then
        "$PS_EXE" -NoProfile -ExecutionPolicy Bypass -Command "
\$w = New-Object -ComObject WScript.Shell
\$l = \$w.CreateShortcut('$LNK')
\$l.TargetPath = 'C:\\Windows\\System32\\wsl.exe'
\$l.Arguments = '$WSL_ARGS'
\$l.WorkingDirectory = '$WIN_DIR'
\$l.IconLocation = '$WIN_ICO'
\$l.Description = 'WeiWuWeiXin'
\$l.Save()
Write-Output 'OK'
" 2>/dev/null && {
            echo -e "  ${GREEN}✅ 桌面快捷方式已创建 (带图标)${NC}"
            echo -e "  ${BLUE}桌面双击「WeiWuWeiXin」即可启动${NC}"
        } || {
            echo -e "  ${YELLOW}⚠️  快捷方式创建失败${NC}"
        }
    else
        echo -e "  ${YELLOW}⚠️  未找到 PowerShell，跳过快捷方式${NC}"
    fi

    # ── 同时创建 .url（服务运行时可直接打开网站）──
    cat > "$DESKTOP_DIR/WeiWuWeiXin.url" << URLEOF
[InternetShortcut]
URL=http://localhost:3000/zh/
URLEOF

    echo -e "    ${BLUE}${DESKTOP_DIR}/WeiWuWeiXin.lnk${NC}"
    echo ""
else
    echo -e "  ${YELLOW}⚠️  Desktop not detected, skipping shortcut${NC}"
fi
echo ""

# ── 完成 ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         🎉  围物为心 安装完成！                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}🚀 一键启动:${NC}"
echo -e "    ${BLUE}cd $INSTALL_DIR && ./start.sh${NC}"

if [ -n "$DESKTOP_DIR" ] && [ -f "$DESKTOP_DIR/WeiWuWeiXin.lnk" ]; then
    echo -e "    ${GREEN}💡 桌面双击「WeiWuWeiXin」图标即可${NC}"
fi
echo ""
echo -e "  ${BOLD}🛑 一键停止:${NC}"
echo -e "    ${BLUE}cd $INSTALL_DIR && ./stop.sh${NC}"
echo ""
echo -e "  ${BOLD}访问地址:${NC}"
echo -e "    ${BLUE}前端: http://localhost:3000/zh/${NC}"
echo -e "    ${BLUE}后端: http://localhost:3001${NC}"
echo ""
echo -e "  ${BOLD}管理员账号:${NC}"
echo -e "    邮箱: ${BLUE}$ADMIN_EMAIL${NC}"
echo -e "    密码: (已写入 .env 的 ADMIN_PASSWORD)"
echo ""
echo -e "  ${BOLD}初始化管理员:${NC}"
echo -e "    ${BLUE}cd $INSTALL_DIR/apps/api && npx tsx prisma/seed-admin.ts${NC}"
echo ""
echo -e "   ${GREEN}✨ 不再需要 Docker！PostgreSQL 会自动随 start.sh 启动${NC}"
echo ""
