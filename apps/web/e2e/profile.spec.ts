import { test, expect } from '@playwright/test';

/**
 * E2E 测试：个人主页
 * 覆盖 /zh/u/moke 的个人信息、徽章区域、榜单列表
 */

test.describe('个人主页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh/u/moke');
  });

  test('页面应正确加载', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('个人信息应可见（昵称、handle）', async ({ page }) => {
    // Mock 数据中 handle='moke', nickname='墨客'
    await expect(page.getByText('墨客').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('moke').first()).toBeVisible({ timeout: 10_000 });
  });

  test('徽章区域应可见', async ({ page }) => {
    // 徽章区域标题「徽章」
    await expect(page.getByText('徽章').first()).toBeVisible({ timeout: 10_000 });
  });

  test('至少一个徽章应可见', async ({ page }) => {
    // Mock 数据中包含「初心」已解锁徽章
    const badgeVisible =
      (await page.getByText('初心').count()) > 0 ||
      (await page.getByText('First Step').count()) > 0;
    expect(badgeVisible).toBe(true);
  });

  test('榜单列表区域应可见', async ({ page }) => {
    // 榜单区域标题「榜单」
    await expect(page.getByText('榜单').first()).toBeVisible({ timeout: 10_000 });
  });

  test('个人简介应可见', async ({ page }) => {
    // Mock 数据 bio: '以心度物，以物观心。品茗弄墨，不亦快哉。'
    const bioVisible =
      (await page.getByText('以心度物').count()) > 0 ||
      (await page.getByText('品茗弄墨').count()) > 0;
    expect(bioVisible).toBe(true);
  });

  test('统计数据应可见', async ({ page }) => {
    // 统计区：榜单数、同好数、被收藏数
    // Mock 数据: listCount=3, rapportCount=12, bookmarkedCount=48
    const hasStats =
      (await page.getByText('3').count()) > 0 ||
      (await page.getByText('12').count()) > 0 ||
      (await page.getByText('48').count()) > 0;
    expect(hasStats).toBe(true);
  });
});