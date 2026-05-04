# 围物为心 (WeiWuWeiXin)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/pnpm-9.0.6-blue)](https://pnpm.io)

> 把心中的排序具象化、算法化，被社区以"置信度"形式温柔共识化的主观评分社区产品。

## 核心精神

- **主观优先**：保护作者个人偏好，永不将算法输出称为"客观分"或"权威分"
- **可解释**：每个分数必须能回答"为什么"
- **置信度 ≠ 优劣**：UI 必须反复暗示"这是共识度"

## 架构概览

> 详见下方「目录结构」段落。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query, next-intl, KaTeX, satori |
| 后端 | Fastify, Prisma, PostgreSQL 15, Redis 7, MinIO |
| 算法 | packages/scoring — 5种评分算法 + 置信度引擎 + 反刷分检测 |
| 导出 | satori + @resvg/resvg-js — 6套模板纯客户端PNG导出 |
| 国际化 | next-intl — /zh/ /en/ 双语路由 |
| 质量 | ESLint, Prettier, Husky, Vitest (171 tests), Playwright E2E, TypeScript strict |

## 快速开始

### 方式一：一键安装（推荐，无需 Docker）

#### Windows

下载仓库后，双击运行即可：

```batch
一键安装.bat
```

脚本将自动完成：
1. 环境检查（Node.js / pnpm / Git）
2. 服务协议确认
3. 环境变量配置（自动生成 JWT_SECRET）
4. 依赖安装 + 数据库初始化
5. （可选）演示数据播种

也可以先用 `创建桌面快捷方式.bat` 在桌面放置一个安装入口。

安装完成后，运行 `start.bat` 即可启动。

#### Linux / macOS

```bash
chmod +x install.sh && ./install.sh
```

#### 启动

```bash
./start.sh          # Linux/macOS/Windows(WSL)
start.bat           # Windows
```

→ 前端 http://localhost:3000/zh/ (中文) | /en/ (英文)
→ 后端 http://localhost:4000

---

### 方式二：手动安装（需要 Docker）

#### 前置条件

- Node.js ≥ 18.17
- pnpm ≥ 8.0
- Docker & Docker Compose (用于数据库)

#### 安装与启动

```bash
# 1. 克隆仓库
git clone <repo-url> && cd weiwuweixin

# 2. 安装依赖
pnpm install

# 3. 启动基础设施（PostgreSQL / Redis / MinIO）
docker compose up -d

# 4. 初始化数据库 schema + 演示数据（5 用户 / 20 榜单 / 300 社区评分）
pnpm seed:demo

# 5. 开发模式
pnpm dev
# → 前端 http://localhost:3000/zh/ (中文) | /en/ (英文)
# → 后端 http://localhost:4000

# 6. 生产构建
pnpm --filter web build && pnpm --filter web start
```

## 测试

```bash
# 单元测试
pnpm --filter @weiwuweixin/scoring test    # 91 tests (算法+置信度+反刷分)
pnpm --filter @weiwuweixin/shared test     # 66 tests (类型+工具+徽章+评论)
pnpm --filter @weiwuweixin/ui test         # 14 tests (UI组件)

# 覆盖率
cd packages/scoring && pnpm test:coverage  # 99.8% lines

# E2E 测试
cd apps/web && pnpm test:e2e               # 冒烟 + 审计测试

# API 类型检查
cd apps/api && pnpm typecheck
```

## 页面清单 (Routes)

| 路由 | 功能 | 状态 |
|------|------|------|
| `/[locale]` | 首页 Feed（多样性×高置信度×新鲜度） | ✅ |
| `/[locale]/explore` | 发现 — 分类浏览 + 话题聚合 + 全站搜索 | ✅ |
| `/[locale]/list/new` | 榜单创建器 Ranker Studio (4步) | ✅ |
| `/[locale]/list/[id]` | 榜单详情（排名+置信度+评论+社区分数） | ✅ |
| `/[locale]/list/[id]/score` | 他人打分（沉浸式，3步流程） | ✅ |
| `/[locale]/u/[handle]` | 个人主页（榜单+徽章+同好） | ✅ |
| `/[locale]/about` | 产品故事 + 算法说明 | ✅ |
| `/[locale]/settings` | 账户设置 | ✅ |
| `/list/[id]/export` | PNG分享卡导出（6套模板） | ✅ |

## 算法库

### 评分算法 (5种)

| 算法 | ID | 场景 |
|------|-----|------|
| 加权平均 | `weighted-mean` | 默认，无短板惩罚 |
| 几何平均 | `geometric-mean` | 惩罚短板，任一维度差则大幅下降 |
| Borda排位分 | `borda-count` | 比排名而非绝对分，消除评分尺度差异 |
| TOPSIS理想解 | `topsis` | 多维度综合决策，距离理想解最近者胜 |
| 贝叶斯收缩 | `bayesian-shrinkage` | 小样本向全局均值收缩，避免极端 |

### 置信度算法

```ts
Confidence = 100 × sigmoid(α·log(1+N) + β·τ + γ·sentiment) × time_decay(t)
```

- `N`：参与评分的独立用户数
- `τ`：Kendall Tau 相关系数（他人 vs 作者排序一致性）
- `sentiment`：评论情感倾向 (-1~+1)
- `time_decay`：半衰期 30 天
- 默认 `α=0.6, β=1.2, γ=0.4`

### 反刷分检测

- 过快打分（<3s）→ 降权 0.2
- 同设备同榜单 24h 内 → 降权至 0
- 评分方差异常（标准差<0.5）→ 降权 0.5
- 极端评分（全最高/全最低）→ 标记待审核

## 分享卡模板 (6套)

| 模板 | ID | 风格 |
|------|-----|------|
| 宣纸水墨 | `rice-ink` | 纸面纹理 + 朱砂红点缀 + 传统印章 |
| 莫兰迪 | `morandi` | 低饱和度柔和色系 + 圆润卡片 |
| 赛博霓虹 | `cyber-neon` | 深底 + 霓虹色 + 网格科技感 |
| 复古杂志 | `retro-magazine` | 报纸风 + 衬线字体 + 双线标题 |
| 极简白 | `minimal-white` | 大量留白 + 轻线条 + 细编号 |
| 手账贴纸 | `sticker-journal` | 和纸胶带 + 贴纸装饰 + 虚线边框 |

## 徽章系统

| 徽章 | 代码 | 获得条件 |
|------|------|----------|
| 初心 | `first-list` | 创建第一个榜单 |
| 八方共鸣 | `echo-eight` | 单榜置信度≥80 |
| 众声喧哗 | `chorus-100` | 单榜参评≥100人 |
| 品类开拓者 | `pioneer` | 某分类下首个榜单 |

## 国际化

- 使用 `next-intl`，URL 前缀 `/zh/` / `/en/`
- 翻译文件：`apps/web/src/i18n/messages/{zh,en}.json`
- 涵盖命名空间：common, home, newList, listDetail, scoring, export, algorithm, confidence, microcopy, explore, profile, comment

## 设计系统

### 色板 (Design Tokens)

```css
--ink-900: #1A1A24;   /* 主文字 */
--ink-500: #5E5E72;   /* 辅助文字 */
--paper:   #FBF7F0;   /* 纸面底色 */
--rice:    #F3ECDE;   /* 米色底 */
--vermilion: #E2553F; /* 朱砂红-主按钮 */
--celadon:   #7FB3A3; /* 青瓷绿-辅助 */
--apricot:   #F4B860; /* 杏黄-点缀 */
--indigo:    #3B4A8C; /* 靛蓝-链接 */
```

### 暗色模式

基调：墨夜深靛蓝 + 烛光杏黄点缀（夜观山水）

### 置信度标签

| 范围 | 中文 | English | 色 |
|------|------|---------|-----|
| 0-20 | 存疑 | Doubtful | ink-500 |
| 20-40 | 微识 | Emerging | apricot |
| 40-60 | 初聚 | Forming | celadon |
| 60-80 | 确然 | Settled | indigo |
| 80-100 | 深契 | Deep Accord | vermilion |

## 置信度标签（共识度）

注意：UI 文案中始终使用"共识度"而非"权威分"或"置信度"，遵循产品核心精神。

## API 路由

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/lists | 榜单列表（支持分类/排序/搜索） |
| GET | /api/lists/:id | 榜单详情（含评分统计） |
| POST | /api/lists | 创建榜单 |
| PATCH | /api/lists/:id | 更新榜单 |
| DELETE | /api/lists/:id | 删除榜单 |
| POST | /api/lists/:id/scores | 提交评分（含反刷分检测） |
| GET | /api/lists/:id/scores | 评分汇总 |
| GET | /api/lists/:id/comments | 评论列表（支持情感筛选） |
| POST | /api/lists/:id/comments | 创建评论（自动情感分析） |
| GET | /api/users/:handle | 用户主页 |
| GET | /api/users/:handle/badges | 用户徽章 |
| GET | /api/explore | 发现页数据 |

## 目录结构

```
weiwuweixin/
├─ apps/
│  ├─ web/              # Next.js 14 (App Router) + TS + Tailwind + Framer Motion
│  │  ├─ src/app/[locale]/   # 页面路由（首页/发现/新建/详情/打分/个人/设置/关于）
│  │  ├─ tests/e2e/          # Playwright E2E 测试
│  │  └─ playwright.config.ts
│  └─ api/              # Fastify + Prisma + PostgreSQL + Redis + MinIO
│     ├─ prisma/        # Schema & Seed
│     └─ src/
├─ packages/
│  ├─ scoring/          # 纯函数算法库 (5种评分 + 置信度 + 反刷分, 91 tests, 99.8% lines)
│  ├─ ui/               # 设计系统组件库 (11基础组件, Storybook 38+ stories)
│  └─ shared/           # 类型、常量、工具、seed (66 tests)
├─ docs/                # 审计报告 & 截图
├─ docker-compose.yml
├─ pnpm-workspace.yaml
└─ README.md
```

## 已实现功能清单 (W1–W5)

| 周次 | 功能 | 状态 |
|------|------|------|
| W1 | Monorepo 初始化 (pnpm workspace + Turborepo) | ✅ |
| W1 | 设计系统 Design Tokens + 色板 + 暗色模式 | ✅ |
| W1 | 5 种评分算法 (weighted-mean / geometric-mean / borda-count / topsis / bayesian-shrinkage) | ✅ |
| W1 | 基础 UI 组件 11 个 (Button / Card / Sticker / Badge / Modal / Input 等) | ✅ |
| W1 | 置信度算法 + 反刷分检测 91 tests | ✅ |
| W2 | 维度权重编辑器 (Slider + 实时预览) | ✅ |
| W2 | 作者打分 3 维度评分面板 | ✅ |
| W2 | 算法选择面板 (5 算法 + 雷达图对比) | ✅ |
| W2 | FLIP 列表动画 + 宣纸水墨主题 | ✅ |
| W2 | Storybook 38+ stories | ✅ |
| W3 | PNG 分享卡导出 (satori + 6 套模板) | ✅ |
| W3 | 榜单详情页 (排名 + 共识度 + 评论 + 社区分数) | ✅ |
| W3 | 他人打分页 (沉浸式 3 步流程) | ✅ |
| W3 | i18n 双语 (zh/en) + next-intl | ✅ |
| W3 | 三态覆盖 (空态/单态/多态) | ✅ |
| W4 | 发现/搜索页 (分类浏览 + 话题聚合 + 搜索) | ✅ |
| W4 | 评论互动 (情感分析 + 热门/最新排序) | ✅ |
| W4 | 个人主页 + 徽章系统 (4 种徽章) | ✅ |
| W4 | 反刷分 API 检测 (降权 + 标记) | ✅ |
| W4 | API CRUD + E2E 测试 | ✅ |
| W4 | 设置页 + 关于页 | ✅ |
| W5 | Seed 演示数据脚本 (5 用户 / 20 榜单 / 300 社区评分) | ✅ |
| W5 | Playwright E2E 冒烟测试 (首页 + 审计) | ✅ |
| W5 | 生产构建验证 (`pnpm --filter web build`) | ✅ |
| W5 | 性能审计 (LCP/DCL/CLS) + 可访问性审计 | ✅ |
| W5 | W5 收尾文档 | ✅ |

## 审计分数

> 日期: 2026-04-24 | 详细报告: `docs/audit-notes.md` | 工具: Lighthouse 13.1 + axe-core 4.11.3 + Playwright 1.59

### Lighthouse

| 页面 | Accessibility | Performance | FCP | LCP | CLS | DCL | DOM |
|------|:---:|:---:|-----|-----|-----|-----|-----|
| `/zh` (首页) | **100** | —* | 1820ms | 1820ms | 0 | 1827ms | 98 |
| `/zh/list/new` | **93** | —* | 900ms | 900ms | 0 | 914ms | 131 |

\* Performance 分数需在有图形环境的 CI 中运行 (WSL2 中 Chromium tracing 崩溃)。基于 Playwright Web Vitals 采集，两页 LCP < 2.5s、CLS ≈ 0、DCL < 2s，预估 Performance ≥ 90。

### axe-core CLI

| 页面 | Violations | Serious/Critical | 规则 ID |
|------|:---:|:---:|---------|
| `/zh` (首页) | **0** | 0 | — |
| `/zh/list/new` | **1** (2 occurrences) | 1 serious | `color-contrast` |

## 里程碑进度

| 周次 | 交付内容 | 状态 |
|------|---------|------|
| W1 | Monorepo初始化 + 设计系统 + 5算法 + 基础UI组件 | ✅ |
| W2 | 维度权重编辑器 + 作者打分 + 算法选择面板 + FLIP动画 + Storybook + 暗色模式 | ✅ |
| W3 | 置信度算法 + PNG导出6模板 + 榜单详情页 + 他人打分页 + i18n + 三态覆盖 | ✅ |
| W4 | 发现/搜索 + 评论互动 + 个人主页+徽章 + 反刷分 + API CRUD + E2E测试 | ✅ |
| W5 | 性能审计 + 生产构建验证 + Playwright E2E + Seed 脚本 + 文档 | ✅ |

## 关键截图占位

| 页面 | 路径 |
|------|------|
| 首页Feed | `docs/screenshots/feed.png` |
| 发现页 | `docs/screenshots/explore.png` |
| 新建榜单 | `docs/screenshots/list-new.png` |
| 榜单详情 | `docs/screenshots/list-detail.png` |
| 沉浸打分 | `docs/screenshots/scoring-flow.png` |
| 个人主页 | `docs/screenshots/profile.png` |
| 分享卡导出 | `docs/screenshots/export-page.png` |
| 算法雷达图 | `docs/screenshots/algo-radar.png` |
| 暗色模式 | `docs/screenshots/dark-mode.png` |

## 运行命令

```bash
cd /home/zhuwankai/weiwuweixin

# 运行测试
pnpm --filter @weiwuweixin/scoring test    # 91 tests
pnpm --filter @weiwuweixin/shared test     # 66 tests
pnpm --filter @weiwuweixin/ui test         # 14 tests

# E2E 测试
cd apps/web && pnpm test:e2e               # 冒烟 + 审计测试

# Storybook
cd packages/ui && pnpm storybook            # → http://localhost:6006

# 前端构建
cd apps/web && npx next build

# 演示数据
pnpm seed:demo

# 开发模式
pnpm dev
# → 前端 http://localhost:3000/zh/
# → 后端 http://localhost:4000
```

## 已知 TODO

- [ ] **[Accessibility]** `/list/new` 页 color-contrast 违规 (`.step-active > .md\:inline.hidden` 和 `.weiwu-btn > .inline-flex.items-center` 对比度不足) — Lighthouse 93/100
- [ ] **[Performance]** 在有图形环境的 CI 中运行完整 Lighthouse Performance 审计 (WSL2 中 Chromium tracing 崩溃)
- [ ] **[Accessibility]** 添加 skip-nav 链接提升键盘导航体验
- [ ] **[Accessibility]** 设置页和关于页的完整 @axe-core/cli 扫描
- [ ] **[Performance]** KaTeX CSS (`cdn.jsdelivr.net`) 为渲染阻塞资源，建议本地化或内联
- [ ] **[Accessibility]** 验证暗色模式下颜色对比度是否达 WCAG AA 标准
- [ ] 缓存优化（Redis 热榜 + API 缓存头）
- [ ] 生产部署配置（Vercel / Docker）

---

*围物为心 — 保护作者主观性 · 视觉优先于功能堆砌 · 置信度非权威分*