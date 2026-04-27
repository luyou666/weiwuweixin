/**
 * 围物为心 — 设备引导 E2E 测试
 *
 * 验证 Bug 3 修复：首次访问时 deviceId 自动写入 localStorage，
 * 不需要用户点击任何按钮。
 */
import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test.describe('Device bootstrap', () => {
  test('首次访问时 wwx-device-id 自动生成（uuid v4 格式）', async ({ browser }) => {
    // 使用全新的浏览器上下文（无缓存）
    const context = await browser.newContext();
    const page = await context.newPage();

    // 访问首页（跟随重定向）
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // 不点击任何按钮，直接检查 localStorage
    const deviceId = await page.evaluate(() => {
      return localStorage.getItem('wwx-device-id');
    });

    // 断言：deviceId 已自动生成，且是 uuid v4 格式
    expect(deviceId).not.toBeNull();
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(deviceId).toMatch(uuidV4Regex);

    // 同时验证 Zustand store 中的 deviceId 也已设置
    const storeDeviceId = await page.evaluate(() => {
      const raw = localStorage.getItem('wwx-user');
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return parsed?.state?.deviceId ?? null;
      } catch {
        return null;
      }
    });
    expect(storeDeviceId).toBe(deviceId);

    // 刷新一次后再检查——deviceId 应该保持不变（幂等）
    await page.reload({ waitUntil: 'networkidle' });
    const deviceIdAfterRefresh = await page.evaluate(() => {
      return localStorage.getItem('wwx-device-id');
    });
    expect(deviceIdAfterRefresh).toBe(deviceId);

    await context.close();
  });

  test('不同浏览器上下文生成不同 deviceId', async ({ browser }) => {
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const id1 = await page1.evaluate(() => localStorage.getItem('wwx-device-id'));

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const id2 = await page2.evaluate(() => localStorage.getItem('wwx-device-id'));

    expect(id1).not.toBeNull();
    expect(id2).not.toBeNull();
    expect(id1).not.toBe(id2); // 不同上下文应生成不同 ID

    await context1.close();
    await context2.close();
  });
});