/**
 * 围物为心 — deviceId 自启动验证
 *
 * 验证 Bug 3 修复：首次访问时 ensureDeviceId() 应自动
 * 将 uuid v4 写入 localStorage（wwx-device-id）和 Zustand store。
 * 不需要手动点击任何按钮。
 */
import { test, expect } from '@playwright/test';

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('首次访问自动生成 wwx-device-id（uuid v4）', async ({ page, context }) => {
  // 清除所有 localStorage/cookie，模拟全新浏览器
  await context.clearCookies();

  // 访问首页（使用 load 避免 networkidle 超时）
  await page.goto('/', { waitUntil: 'load', timeout: 30000 });

  // 等待 ThemeProvider 的 useEffect 调用 ensureDeviceId
  // React hydration + useEffect 需要一些时间
  await page.waitForTimeout(5000);

  // 断言 localStorage 中存在 wwx-device-id 且为 UUID v4 格式
  const deviceId = await page.evaluate(() => {
    return localStorage.getItem('wwx-device-id');
  });

  expect(deviceId).not.toBeNull();
  expect(deviceId!).toMatch(UUID_V4_RE);

  // 断言 Zustand store 中 deviceId 也已写入
  const storeDeviceId = await page.evaluate(() => {
    // Zustand persist 默认将 store 序列化到 localStorage 的 wwx-user key
    const raw = localStorage.getItem('wwx-user');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed?.state?.deviceId ?? null;
    } catch {
      return null;
    }
  });

  expect(storeDeviceId).not.toBeNull();
  expect(storeDeviceId).toBe(deviceId);
});

test('刷新后 wwx-device-id 保持不变', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(5000);

  const firstId = await page.evaluate(() => localStorage.getItem('wwx-device-id'));
  expect(firstId).not.toBeNull();

  // 刷新
  await page.reload({ waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(5000);

  const secondId = await page.evaluate(() => localStorage.getItem('wwx-device-id'));

  // 同一浏览器会话刷新后 ID 应保持不变
  expect(secondId).toBe(firstId);
});