import { test, expect } from '@playwright/test';

test('首页冒烟测试 — 页面包含「围物为心」', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('围物为心')).toBeVisible();
});