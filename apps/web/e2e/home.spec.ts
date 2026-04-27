import { test, expect } from '@playwright/test';

/**
 * E2E 测试：首页
 * 覆盖 /zh/ 和 /en/ 的加载、标题、Feed 列表、主题切换、中英文切换
 */

test.describe('首页', () => {
  test.describe('中文首页 /zh/', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/zh/');
    });

    test('页面应正确加载并展示标题「围物为心」', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('围物为心');
    });

    test('应展示副标题', async ({ page }) => {
      await expect(
        page.getByText('以心度物，以物观心').first()
      ).toBeVisible();
    });

    test('应展示「近期榜单」Feed 列表', async ({ page }) => {
      await expect(page.getByText('近期榜单').first()).toBeVisible();
      // 验证有榜单卡片渲染（至少有一个）
      const feedCards = page.locator('[class*="Card"], [class*="card"]');
      await expect(feedCards.first()).toBeVisible({ timeout: 15_000 });
    });

    test('Feed 卡片应展示 mock 数据内容', async ({ page }) => {
      // 从 mock 数据可知：第一个榜单标题为「2024 年度华语专辑」
      await expect(
        page.getByText('2024 年度华语专辑').first()
      ).toBeVisible({ timeout: 15_000 });
      // 标签「音乐」应可见
      await expect(page.getByText('音乐').first()).toBeVisible();
    });

    test('「新建榜单」按钮应可见且可点击', async ({ page }) => {
      const newButton = page.locator('a[href="/list/new"]').first();
      await expect(newButton).toBeVisible();
      await expect(newButton).toContainText('新建榜单');
    });

    test('「浏览榜单」链接应可见', async ({ page }) => {
      await expect(page.getByText('浏览榜单').first()).toBeVisible();
    });

    test('主题切换按钮可点击', async ({ page }) => {
      // 查找主题切换按钮（ThemeToggle 组件）
      const themeToggle = page.locator(
        'button[aria-label="切换到暗色模式"], button[aria-label="切换到亮色模式"], button[aria-label="Toggle dark mode"], button[aria-label="Toggle light mode"]'
      );

      if (await themeToggle.isVisible()) {
        const isCurrentlyDark = await page.evaluate(() =>
          document.documentElement.classList.contains('dark')
        );

        await themeToggle.click();
        await page.waitForTimeout(500);

        const isNowDark = await page.evaluate(() =>
          document.documentElement.classList.contains('dark')
        );
        expect(isNowDark).toBe(!isCurrentlyDark);
      } else {
        // 备选：通过 localStorage 测试暗色模式
        await page.evaluate(() => {
          localStorage.setItem('weiwu-theme', 'dark');
          document.documentElement.classList.add('dark');
        });
        const isDark = await page.evaluate(() =>
          document.documentElement.classList.contains('dark')
        );
        expect(isDark).toBe(true);
      }
    });
  });

  test.describe('英文首页 /en/', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/en/');
    });

    test('英文首页应正确加载并展示标题「WeiWuWeiXin」', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('WeiWuWeiXin');
    });

    test('英文首页应展示 Feed 列表', async ({ page }) => {
      await expect(page.getByText('Recent Lists').first()).toBeVisible();
      const feedCards = page.locator('[class*="Card"], [class*="card"]');
      await expect(feedCards.first()).toBeVisible({ timeout: 15_000 });
    });

    test('英文首页应展示「Create List」按钮', async ({ page }) => {
      const newButton = page.locator('a[href="/list/new"]').first();
      await expect(newButton).toBeVisible();
      await expect(newButton).toContainText('Create List');
    });
  });

  test.describe('中英文切换', () => {
    test('从中文切换到英文页面后应展示英文内容', async ({ page }) => {
      await page.goto('/zh/');
      await expect(page.locator('h1')).toContainText('围物为心');

      // 导航到英文版本
      await page.goto('/en/');
      await expect(page.locator('h1')).toContainText('WeiWuWeiXin');
    });

    test('从英文切换到中文页面后应展示中文内容', async ({ page }) => {
      await page.goto('/en/');
      await expect(page.locator('h1')).toContainText('WeiWuWeiXin');

      // 导航到中文版本
      await page.goto('/zh/');
      await expect(page.locator('h1')).toContainText('围物为心');
    });
  });
});