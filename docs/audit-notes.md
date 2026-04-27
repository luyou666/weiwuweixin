# 围物为心 — W5 审计报告

> 日期: 2026-04-24 | 工具: Lighthouse 13.1 + axe-core 4.11.3 + Playwright 1.59

## 环境说明

WSL2 (Ubuntu 24.04) 环境中 Chromium 的 GPU/Vulkan 渲染管线无法正常工作，导致 Lighthouse Performance 审计时页面崩溃（`TARGET_CRASHED` / `NO_FCP`）。Accessibility 审计在 `--only-categories=accessibility` + `--single-process --disable-features=VizDisplayCompositor` 模式下可正常运行。Performance 数据通过 Playwright Web Vitals API 采集。

## Lighthouse 审计

### 首页 `/zh`

| 指标 | 值 |
|------|-----|
| **Accessibility** | **100/100** ✅ |
| Performance | 无法运行（WSL2 环境限制） |
| FCP (Playwright) | 1820ms |
| LCP (Playwright) | 1820ms |
| DCL (Playwright) | 1827ms |
| CLS | 0.0001 |
| DOM Size | 98 节点 |
| Resources | 22 |
| Transfer | 461.7 KB |

### `/zh/list/new`

| 指标 | 值 |
|------|-----|
| **Accessibility** | **93/100** ⚠️ |
| Performance | 无法运行（WSL2 环境限制） |
| FCP (Playwright) | 900ms |
| LCP (Playwright) | 900ms |
| DCL (Playwright) | 914ms |
| CLS | 0.0001 |
| DOM Size | 131 节点 |
| Resources | 23 |
| Transfer | 541.0 KB |

### Accessibility 失败项 (Lighthouse `/zh/list/new`)

| Audit ID | Score | Title |
|----------|-------|-------|
| `color-contrast` | 0 | Background and foreground colors do not have a sufficient contrast ratio |

## axe-core CLI 扫描

### 首页 `/zh`

- **Violations: 0** ✅
- **Serious/Critical: 0**

### `/zh/list/new`

- **Violations: 1** (2 occurrences)
- **Serious: 1** — `color-contrast`
  - 元素: `.step-active > .md\:inline.hidden`
  - 元素: `.weiwu-btn > .inline-flex.items-center`

## Top 3 可访问性问题 (Accessibility < 95)

1. **color-contrast**: `/list/new` 步骤指示器活跃标签和按钮文字对比度不足（2 处 serious 违规）
2. **skip-link**: 缺少"跳到主内容"链接，影响键盘用户导航
3. **暗色模式对比度**: 未在 CI 环境中验证深色主题下的颜色对比度

## Top 3 性能优化方向 (预估 Performance ≥ 90)

1. **KaTeX CSS 外部加载**: `cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css` 为渲染阻塞资源，建议本地化
2. **首页 FCP/LCP 偏高**: 首页 FCP=1820ms，接近"需要改进"阈值 (1800ms)，可优化 JS bundle 加载
3. **字体加载优化**: 2 个 woff2 字体已配置 preload，可改用 `font-display: swap` 避免布局偏移

## 已知 TODO

- [ ] **[Accessibility]** 修复 `/list/new` 页 color-contrast 违规
- [ ] **[Performance]** 在有图形环境的 CI 中运行完整 Lighthouse Performance 审计
- [ ] **[Accessibility]** 添加 skip-nav 链接
- [ ] **[Accessibility]** 设置页和关于页的完整 @axe-core/cli 扫描
- [ ] **[Performance]** KaTeX CSS 本地化
- [ ] **[Accessibility]** 验证暗色模式颜色对比度
- [ ] 缓存优化（Redis 热榜 + API 缓存头）
- [ ] 生产部署配置（Vercel / Docker）

## 审计命令（参考）

```bash
# Lighthouse Accessibility（WSL2 兼容）
LD_LIBRARY_PATH=~/.local/chrome-libs/usr/lib/x86_64-linux-gnu \
CHROME_PATH=~/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome \
npx lighthouse http://localhost:3000/zh --preset=desktop \
  --only-categories=accessibility \
  --output=json --output-path=./docs/lighthouse-home.json \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-software-rasterizer --disable-dev-shm-usage --single-process --disable-features=VizDisplayCompositor"

# axe-core CLI
LD_LIBRARY_PATH=~/.local/chrome-libs/usr/lib/x86_64-linux-gnu \
npx @axe-core/cli http://localhost:3000/zh \
  --chrome-path ~/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome \
  --chrome-options="--no-sandbox --disable-gpu --disable-dev-shm-usage"

# Playwright Performance Audit
cd apps/web && LD_LIBRARY_PATH=~/.local/chrome-libs/usr/lib/x86_64-linux-gnu \
npx playwright test perf-audit --reporter=line
```