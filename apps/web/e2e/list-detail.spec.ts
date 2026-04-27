import { test, expect } from '@playwright/test';

/**
 * E2E 测试：榜单详情页
 * 覆盖 /zh/list/demo-list-1 的排名表格、共识度面板、评论区域、情感筛选、置信度
 */

test.describe('榜单详情页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh/list/demo-list-1');
  });

  test('页面应正确加载', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('排名表格应可见', async ({ page }) => {
    // 排名表格应包含条目（mock 数据含 React, Vue 等条目）
    const rankingTable = page.locator(
      'table, [class*="ranking"], [class*="Ranking"]'
    );
    if (await rankingTable.isVisible()) {
      // 验证条目名称可见
      await expect(page.getByText('React').first()).toBeVisible({ timeout: 10_000 });
    } else {
      // 排名可能以列表/卡片形式展示 — 验证条目名可见
      await expect(page.getByText('React').first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test('共识度面板应可见', async ({ page }) => {
    // 共识度面板由 ConfidencePanel 组件渲染
    // 中文标签「共识度」应在页面中出现
    await expect(page.getByText('共识度').first()).toBeVisible({ timeout: 10_000 });
  });

  test('评论区域应可见', async ({ page }) => {
    // 评论区由 CommentSection 组件渲染
    await expect(page.getByText('评论').first()).toBeVisible({ timeout: 10_000 });
  });

  test('情感筛选按钮应可见', async ({ page }) => {
    // 情感筛选按钮：全部 / 正向 / 负向
    await expect(page.getByText('全部').first()).toBeVisible({ timeout: 10_000 });
  });

  test('置信度数值应可见', async ({ page }) => {
    // 共识度数值（mock 数据中 confidence=72）
    await expect(page.getByText('72').first()).toBeVisible({ timeout: 10_000 });
  });

  test('榜单标题和副标题应可见', async ({ page }) => {
    // mock 数据标题「2024年度最佳前端框架」
    await expect(
      page.getByText('2024年度最佳前端框架').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('底部操作栏按钮应可见', async ({ page }) => {
    // 导出分享卡按钮
    await expect(page.getByText(/导出分享卡|Export/).first()).toBeVisible({ timeout: 10_000 });
  });
});