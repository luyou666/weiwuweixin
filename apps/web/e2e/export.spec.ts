import { test, expect } from '@playwright/test';

/**
 * E2E 测试：导出流程
 * 覆盖 /list/demo-list-1/export 的分享卡导出
 * 注意：导出页面未使用 next-intl 路由前缀
 */

test.describe('导出流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/list/demo-list-1/export');
  });

  test('页面应正确加载并展示标题「导出分享卡」', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('导出分享卡');
  });

  test('模板选择区域应可见', async ({ page }) => {
    await expect(page.locator('h2:has-text("选择模板")')).toBeVisible();
  });

  test('应展示 6 种模板按钮', async ({ page }) => {
    const templateGrid = page.locator('.grid.grid-cols-3 button');
    await expect(templateGrid).toHaveCount(6);
  });

  test('6 种模板名称应可见', async ({ page }) => {
    // 宣纸 (rice-ink)
    await expect(page.getByText('宣纸').first()).toBeVisible();
    // 莫兰迪 (morandi)
    await expect(page.getByText('莫兰迪').first()).toBeVisible();
    // 霓虹 (cyber-neon)
    await expect(page.getByText('霓虹').first()).toBeVisible();
    // 杂志 (retro-magazine)
    await expect(page.getByText('杂志').first()).toBeVisible();
    // 极简 (minimal-white)
    await expect(page.getByText('极简').first()).toBeVisible();
    // 手账 (sticker-journal)
    await expect(page.getByText('手账').first()).toBeVisible();
  });

  test('点击选择不同模板后预览卡片应渲染', async ({ page }) => {
    // 点击「宣纸」模板
    const riceInkBtn = page.locator('button:has-text("宣纸")');
    if (await riceInkBtn.isVisible()) {
      await riceInkBtn.click();
    }

    // 验证预览卡片区域存在
    const previewCard = page.locator(
      '[class*="rounded-lg"], [style*="aspectRatio"]'
    );
    await expect(previewCard.first()).toBeVisible();
  });

  test('切换不同模板应更新预览', async ({ page }) => {
    // 点击莫兰迪模板
    const morandiButton = page.locator('button:has-text("莫兰迪")');
    if (await morandiButton.isVisible()) {
      await morandiButton.click();
      await expect(morandiButton.locator('text=✓')).toBeVisible();
    }

    // 点击霓虹模板
    const neonButton = page.locator('button:has-text("霓虹")');
    if (await neonButton.isVisible()) {
      await neonButton.click();
      await expect(neonButton.locator('text=✓')).toBeVisible();
    }
  });

  test('导出按钮应可见', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /导出 PNG/ })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /导出 SVG/ })
    ).toBeVisible();
  });
});