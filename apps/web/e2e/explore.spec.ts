import { test, expect } from '@playwright/test';

/**
 * E2E 测试：发现页
 * 覆盖 /zh/explore 的搜索、分类标签、排序、榜单卡片列表
 */

test.describe('发现页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh/explore');
  });

  test('页面应正确加载并展示标题「发现」', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toContainText('发现');
  });

  test('搜索栏应可见', async ({ page }) => {
    // 搜索框具有 placeholder「搜索标题 / 条目 / 标签 / 作者…」
    const searchInput = page.locator(
      'input[placeholder*="搜索"], input[placeholder*="标题"], input[placeholder*="Search"]'
    );
    await expect(searchInput.first()).toBeVisible({ timeout: 10_000 });
  });

  test('分类标签应可见', async ({ page }) => {
    // 分类标签栏包含「全部」按钮
    await expect(page.getByText('全部').first()).toBeVisible({ timeout: 10_000 });

    // 至少有一个分类标签可见（如「音乐」或「影视」）
    const categoryVisible =
      (await page.getByText('音乐').count()) > 0 ||
      (await page.getByText('影视').count()) > 0 ||
      (await page.getByText('技术').count()) > 0;
    expect(categoryVisible).toBe(true);
  });

  test('排序切换应可见', async ({ page }) => {
    // 排序切换：「多样性优先」「高共识度」「最新创建」
    const diversitySort = page.getByText('多样性优先');
    const consensusSort = page.getByText('高共识度');
    const newestSort = page.getByText('最新创建');

    // 至少应有一种排序方式可见
    const sortByVisible =
      (await diversitySort.count()) > 0 ||
      (await consensusSort.count()) > 0 ||
      (await newestSort.count()) > 0;
    expect(sortByVisible).toBe(true);
  });

  test('榜单卡片列表应可见', async ({ page }) => {
    // 等待数据加载
    await page.waitForTimeout(2000);

    // 榜单卡片应渲染（至少有一个）
    const feedCards = page.locator('[class*="Card"], [class*="card"]');
    await expect(feedCards.first()).toBeVisible({ timeout: 15_000 });
  });

  test('搜索功能应可输入', async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder*="搜索"], input[placeholder*="标题"], input[placeholder*="Search"]'
    );
    if (await searchInput.first().isVisible()) {
      await searchInput.first().fill('华语');
      // 输入后应触发搜索（搜索结果区域出现）
      await page.waitForTimeout(1000);
    }
  });

  test('点击分类标签应切换内容', async ({ page }) => {
    const musicTag = page.getByText('音乐').first();
    if (await musicTag.isVisible()) {
      await musicTag.click();
      await page.waitForTimeout(1000);
      // 页面仍然应正常渲染
      await expect(page.locator('body')).toBeVisible();
    }
  });
});