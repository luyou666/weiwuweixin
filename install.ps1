# ============================================================
#  围物为心 (WeiWuWeiXin) — Windows 一键安装脚本 (PowerShell)
#  MIT License © 2026 围物为心 WeiWuWeiXin
# ============================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# ── 路径 ──────────────────────────────────────────────────
$SourceDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallDir  = $SourceDir

# ── 辅助函数 ──────────────────────────────────────────────
function Write-Step { param([string]$Title) Write-Host "━━━ $Title ━━━" -ForegroundColor Blue; Write-Host "" }
function Write-Ok   { param([string]$Msg) Write-Host "  ✅ $Msg" -ForegroundColor Green }
function Write-Warn { param([string]$Msg) Write-Host "  ⚠️  $Msg" -ForegroundColor Yellow }
function Write-Err  { param([string]$Msg) Write-Host "  ❌ $Msg" -ForegroundColor Red }

function Check-Cmd { param([string]$Name, [string]$DisplayName = $Name)
    if (Get-Command $Name -ErrorAction SilentlyContinue) { Write-Ok "$DisplayName 已安装"; return $true }
    else { Write-Err "$DisplayName 未安装"; return $false }
}

# ── Banner ────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🏮  围物为心 WeiWuWeiXin  安装程序 (Win) ║" -ForegroundColor Cyan
Write-Host "║         把心中的排序具象化 · 算法化             ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── 0. 选择安装路径 ──────────────────────────────────────
Write-Step "[0/7] 选择安装路径"

Write-Host "  默认安装路径: $InstallDir" -ForegroundColor White
Write-Host ""
$userPath = Read-Host "  请输入安装路径 (直接回车使用默认)"

if ($userPath) {
    $userPath = $userPath.Trim('"').Trim("'")
    $InstallDir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($userPath)

    if ($InstallDir -ne $SourceDir) {
        Write-Host ""
        Write-Warn "正在将项目文件复制到: $InstallDir"

        if (Test-Path $InstallDir) {
            Write-Warn "目标路径已存在，将覆盖现有文件。"
            $overwrite = Read-Host "  确认覆盖? [y/N]"
            if ($overwrite -ne "y" -and $overwrite -ne "Y") {
                Write-Err "安装已取消。"
                Read-Host "按 Enter 退出"
                exit 1
            }
        }

        New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

    # 复制项目文件（只复制项目源码，排除所有构建产物/调试文件/Docker数据）
    $exclude = @("node_modules", ".next", ".next.bak", ".next_old", ".git",
                 "pg-data", "redis-data", "minio-data",
                 "playwright-report", "storybook-static", "test-results",
                 "coverage", "dist", "out", "build",
                 "dump.rdb", "field_inventory.json", ".api.pid",
                 "data")

    Get-ChildItem $SourceDir -Force | Where-Object {
        $n = $_.Name
        ($n -notin $exclude) -and
        ($n -notmatch '\.pid$') -and
        ($n -notmatch '^_check') -and
        ($n -notmatch '^check-') -and
        ($n -notmatch '^(step5|clear_cache)') -and
        ($n -notmatch '^(test-pg|reset_test|setup_test|cleanup|verify)') -and
        ($n -notmatch '^(update-i18n|setup-db|start-pg|create-test-user)') -and
        ($n -notmatch '^undefined:')
    } | ForEach-Object {
            $target = Join-Path $InstallDir $_.Name
            Copy-Item $_.FullName $target -Recurse -Force
        }

        Write-Ok "项目文件已复制完成"

        # 更新快捷方式创建脚本路径
        $shortcutScript = Join-Path $InstallDir "创建桌面快捷方式.bat"
        if (Test-Path $shortcutScript) {
            $scContent = Get-Content $shortcutScript -Encoding UTF8 -Raw
            $scContent = $scContent -replace [regex]::Escape($SourceDir), $InstallDir
            Set-Content $shortcutScript -Value $scContent -Encoding UTF8 -NoNewline
        }
    }
}

$TermsFile   = Join-Path $InstallDir "docs\legal\TERMS_OF_SERVICE.md"
$PrivacyFile = Join-Path $InstallDir "docs\legal\PRIVACY_POLICY.md"
$EnvExample  = Join-Path $InstallDir ".env.example"
$EnvTarget   = Join-Path $InstallDir "apps\api\.env"

Set-Location $InstallDir
Write-Host ""
Write-Ok "安装路径: $InstallDir"
Write-Host ""

# ── 1. 前置条件检查 ──────────────────────────────────────
Write-Step "[1/7] 检查前置条件"

# 自动安装辅助函数
function Install-Winget {
    param([string]$PackageId, [string]$DisplayName)
    Write-Host "  正在用 winget 安装 $DisplayName …" -ForegroundColor Yellow
    $res = winget install --id $PackageId --accept-package-agreements --accept-source-agreements 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "$DisplayName 安装成功"
        # 刷新 PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                    [System.Environment]::GetEnvironmentVariable("Path", "User")
        return $true
    }
    Write-Err "$DisplayName 安装失败: $res"
    return $false
}

function Invoke-InstallHelper {
    param(
        [string]$Title,
        [string]$PackageId,      # winget 包名
        [string[]]$CheckCmds,    # 安装后验证命令
        [string]$ManualNote      # winget 失败时的手动提示
    )
    $choice = Read-Host "  ⚡ 是否为你自动安装 $Title ？[Y/n]"
    if ($choice -eq "" -or $choice -eq "y" -or $choice -eq "Y") {
        if (-not (Get-Command "winget" -ErrorAction SilentlyContinue)) {
            Write-Err "winget 不可用（需 Windows 10 1809+ / 11），请手动安装："
            Write-Host "    $ManualNote" -ForegroundColor Yellow
            return $false
        }
        if (Install-Winget $PackageId $Title) {
            foreach ($cmd in $CheckCmds) {
                if (Get-Command $cmd -ErrorAction SilentlyContinue) { Write-Ok "$cmd 可用" }
                else { Write-Warn "$cmd 可能未加入 PATH，请重启终端后尝试" }
            }
            return $true
        }
        Write-Warn "自动安装失败。请手动安装："
        Write-Host "    $ManualNote" -ForegroundColor Yellow
        return $false
    }
    return $false
}

$allOk = $true

# ── Docker 检查 ──
if (Get-Command "docker" -ErrorAction SilentlyContinue) {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) { Write-Ok "Docker 正在运行" }
    else { Write-Err "Docker 已安装但未运行，请启动 Docker Desktop。"; $allOk = $false }
} else {
    Write-Err "Docker 未安装"
    if (Invoke-InstallHelper -Title "Docker Desktop" `
            -PackageId "Docker.DockerDesktop" `
            -CheckCmds @("docker") `
            -ManualNote "https://www.docker.com/products/docker-desktop/") {
        Write-Warn "Docker Desktop 已安装，但需要重启后生效。请重新运行本脚本。"
        Read-Host "按 Enter 退出"
        exit 0
    }
    $allOk = $false
}

# ── Node.js 检查 ──
$nodeGood = $false
if (Get-Command "node" -ErrorAction SilentlyContinue) {
    try {
        $nodeVer = (node --version 2>&1) -replace "v", ""
        $nodeMajor = [int]($nodeVer.Split(".")[0])
        if ($nodeMajor -ge 18) { Write-Ok "Node.js v$nodeVer >= 18"; $nodeGood = $true }
        else { Write-Err "Node.js v$nodeVer (需要 >= 18)" }
    } catch { Write-Err "无法检测 Node.js 版本" }
} else { Write-Err "Node.js 未安装" }

if (-not $nodeGood) {
    if (Invoke-InstallHelper -Title "Node.js LTS" `
            -PackageId "OpenJS.NodeJS.LTS" `
            -CheckCmds @("node", "npm") `
            -ManualNote "https://nodejs.org/ (下载 LTS 版本)") {
        # winget 安装后刷新 PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                    [System.Environment]::GetEnvironmentVariable("Path", "User")
        if (Get-Command "node" -ErrorAction SilentlyContinue) {
            $nodeVer = (node --version 2>&1) -replace "v", ""
            $nodeMajor = [int]($nodeVer.Split(".")[0])
            if ($nodeMajor -ge 18) { Write-Ok "Node.js v$nodeVer 已就绪"; $nodeGood = $true }
            else { Write-Err "刚安装的 Node.js 版本不符合要求" }
        } else { Write-Err "Node.js 安装后未在 PATH 中找到，请重启终端重试" }
    }
    if (-not $nodeGood) { $allOk = $false }
}

# ── pnpm 检查 ──
if (-not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
    Write-Err "pnpm 未安装"
    $pnpmChoice = Read-Host "  ⚡ 是否为你自动安装 pnpm (npm install -g pnpm)？[Y/n]"
    if ($pnpmChoice -eq "" -or $pnpmChoice -eq "y" -or $pnpmChoice -eq "Y") {
        if (Get-Command "npm" -ErrorAction SilentlyContinue) {
            Write-Host "  npm install -g pnpm …" -ForegroundColor Yellow
            npm install -g pnpm 2>&1
            if ($LASTEXITCODE -eq 0) { Write-Ok "pnpm 安装成功" }
            else { Write-Err "pnpm 安装失败"; $allOk = $false }
        } else {
            Write-Err "npm 不可用，无法安装 pnpm（Node.js 未正确安装）"
            $allOk = $false
        }
    } else { $allOk = $false }
} else { Write-Ok "pnpm 已安装" }

# ── Git 检查 ──
if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-Err "Git 未安装"
    if (-not (Invoke-InstallHelper -Title "Git" `
            -PackageId "Git.Git" `
            -CheckCmds @("git") `
            -ManualNote "https://git-scm.com/download/win")) {
        $allOk = $false
    }
} else { Write-Ok "Git 已安装" }

# ── 最终判断 ──
if (-not $allOk) {
    Write-Host ""
    Write-Warn "仍有前置条件未满足（见上方 ❌ 标记）。"
    Write-Host ""
    Write-Host "  手动下载链接:" -ForegroundColor Yellow
    Write-Host "    Docker Desktop: https://www.docker.com/products/docker-desktop/"
    Write-Host "    Node.js:        https://nodejs.org/ (下载 LTS 版本)"
    Write-Host "    Git:            https://git-scm.com/download/win"
    Write-Host "    pnpm:           npm install -g pnpm (需先装 Node.js)"
    Write-Host ""
    Read-Host "按 Enter 退出"
    exit 1
}

Write-Host ""
Write-Ok "所有前置条件满足！"
Write-Host ""

# ── 2. 协议确认 ──────────────────────────────────────────
Write-Step "[2/7] 用户服务协议与隐私政策"

if (Test-Path $TermsFile) {
    Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Yellow
    Get-Content $TermsFile -Encoding UTF8 | Select-Object -First 80 | ForEach-Object { Write-Host $_ }
    Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  完整协议: $TermsFile" -ForegroundColor Blue
} else { Write-Warn "未找到服务协议文件" }

if (Test-Path $PrivacyFile) { Write-Host "  隐私政策: $PrivacyFile" -ForegroundColor Blue }

Write-Host ""
Write-Host "  安装和使用围物为心即表示你已阅读并同意上述协议。" -ForegroundColor White
Write-Host ""
$agreement = Read-Host "  请输入「同意」继续安装，输入其他内容将退出"

if ($agreement -ne "同意") {
    Write-Host ""
    Write-Err "你未同意服务协议，安装已取消。"
    Read-Host "按 Enter 退出"
    exit 1
}

Write-Host ""
Write-Ok "已同意用户服务协议和隐私政策"
Write-Host ""

# ── 3. 配置环境变量 ──────────────────────────────────────
Write-Step "[3/7] 配置环境变量"

if (Test-Path $EnvTarget) { Write-Warn "$EnvTarget 已存在，跳过创建。" }
else {
    if (-not (Test-Path $EnvExample)) { Write-Err "未找到 .env.example，请确保安装包完整。"; pause; exit 1 }
    Copy-Item $EnvExample $EnvTarget
    Write-Ok "已从 .env.example 创建 $EnvTarget"
}

$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
$envContent = Get-Content $EnvTarget -Encoding UTF8 -Raw
if ($envContent -match "JWT_SECRET=changeme") {
    $envContent = $envContent -replace "JWT_SECRET=changeme", "JWT_SECRET=$jwtSecret"
    Set-Content $EnvTarget -Value $envContent -Encoding UTF8 -NoNewline
    Write-Ok "已生成随机 JWT_SECRET"
} else { Write-Warn "JWT_SECRET 已配置，跳过" }

Write-Host ""
Write-Warn "配置管理员账号（用于 seed-admin.ts 初始化）"

$adminEmail = Read-Host "  管理员邮箱 [admin@example.com]"
if ([string]::IsNullOrWhiteSpace($adminEmail)) { $adminEmail = "admin@example.com" }

$adminPassword = Read-Host "  管理员密码 [留空则随机生成]" -AsSecureString
if ($adminPassword.Length -eq 0) {
    $adminPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object { [char]$_ })
    Write-Ok "已随机生成管理员密码"
} else {
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassword)
    $adminPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

$envContent = Get-Content $EnvTarget -Encoding UTF8 -Raw
$envContent = $envContent -replace "ADMIN_EMAIL=.*", "ADMIN_EMAIL=$adminEmail"
$envContent = $envContent -replace "ADMIN_PASSWORD=.*", "ADMIN_PASSWORD=$adminPassword"
Set-Content $EnvTarget -Value $envContent -Encoding UTF8 -NoNewline
Write-Ok "管理员账号已配置"
Write-Host ""

# ── 4. 启动 Docker 基础设施 ──────────────────────────────
Write-Step "[4/7] 启动基础设施 (Docker)"

try {
    docker compose -f "$InstallDir\docker-compose.yml" up -d
    Write-Ok "Docker 容器已启动"
} catch {
    Write-Err "Docker 启动失败。请确保 Docker Desktop 正在运行且有足够内存 (建议 ≥ 4GB)。"
    pause
    exit 1
}
Write-Host ""

# ── 5. 等待 PostgreSQL 就绪 ──────────────────────────────
Write-Step "[5/7] 等待 PostgreSQL 就绪"

$maxWait = 30; $waited = 0
while ($waited -lt $maxWait) {
    docker exec weiwuweixin-postgres pg_isready -U weiwuweixin 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Ok "PostgreSQL 已就绪 (${waited}s)"; break }
    Start-Sleep -Seconds 2; $waited += 2
    Write-Host ("  ⏳ 等待中 ... ${waited}s / ${maxWait}s" + "`r") -NoNewline
}
if ($waited -ge $maxWait) {
    Write-Host ""
    Write-Err "PostgreSQL 在 ${maxWait}s 内未就绪。"
    Write-Warn "可以运行 'docker compose logs postgres' 查看日志排查问题。"
    pause
    exit 1
}
Write-Host ""

# ── 6. 安装依赖 & 初始化数据库 ──────────────────────────
Write-Step "[6/7] 安装依赖和初始化数据库"

Write-Host "  pnpm install …" -ForegroundColor Yellow
try { pnpm install; Write-Ok "pnpm install 完成" } catch { Write-Err "pnpm install 失败"; pause; exit 1 }
Write-Host ""

Set-Location (Join-Path $InstallDir "apps\api")
Write-Host "  prisma generate …" -ForegroundColor Yellow
try { npx prisma generate; Write-Ok "prisma generate 完成" } catch { Write-Err "prisma generate 失败"; pause; exit 1 }
Write-Host ""

Write-Host "  prisma db push …" -ForegroundColor Yellow
try { npx prisma db push; Write-Ok "prisma db push 完成" } catch { Write-Err "prisma db push 失败"; pause; exit 1 }

Set-Location $InstallDir
Write-Host ""
Write-Ok "依赖安装和数据库初始化完成"
Write-Host ""

# ── 7. 演示数据 (可选) ────────────────────────────────────
Write-Step "[7/7] 演示数据 (可选)"

$seedDemo = Read-Host "  是否填充演示数据？(5 用户 / 20 榜单 / 300 评分) [y/N]"
if ($seedDemo -eq "y" -or $seedDemo -eq "Y") {
    try { pnpm seed:demo; Write-Ok "演示数据已填充" }
    catch { Write-Warn "演示数据填充失败（不影响基本使用）" }
} else { Write-Warn "跳过演示数据" }
Write-Host ""

# ── 完成 ──────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         🎉  围物为心 安装完成！                 ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "  安装路径: $InstallDir" -ForegroundColor Blue
Write-Host ""
Write-Host "  启动开发服务器:" -ForegroundColor White
Write-Host "    cd $InstallDir && pnpm dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "  访问地址:" -ForegroundColor White
Write-Host "    前端:  http://localhost:3000/zh/" -ForegroundColor Blue
Write-Host "    后端:  http://localhost:3001" -ForegroundColor Blue
Write-Host "    MinIO: http://localhost:9001" -ForegroundColor Blue
Write-Host ""
Write-Host "  管理员账号:" -ForegroundColor White
Write-Host "    邮箱: $adminEmail" -ForegroundColor Blue
Write-Host "    密码: (已写入 $EnvTarget 的 ADMIN_PASSWORD)" -ForegroundColor Blue
Write-Host ""
Write-Host "  初始化管理员 (可选):" -ForegroundColor White
Write-Host "    cd apps\api && npx tsx prisma\seed-admin.ts" -ForegroundColor Yellow
Write-Host ""
Write-Warn "⚠️  重要: 生产部署前请修改 $EnvTarget 中的所有默认密码和密钥！"
Write-Host ""
Read-Host "按 Enter 退出"
