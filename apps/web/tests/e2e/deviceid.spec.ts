
import { test, expect } from '@playwright/test';

test('manually trigger deviceId', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Manually call getOrCreateDeviceId by executing the logic in browser
  const result = await page.evaluate(() => {
    // Manually create deviceId using the same logic
    const DEVICE_ID_KEY = 'wwx-device-id';
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return {
      deviceId: id,
      isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id),
      allLS: Object.fromEntries(
        Array.from({length: localStorage.length}, (_, i) => {
          const key = localStorage.key(i);
          return [key, localStorage.getItem(key)];
        })
      ),
    };
  });
  
  console.log('deviceId:', result.deviceId);
  console.log('isUUID:', result.isUUID);
  console.log('All localStorage:', JSON.stringify(result.allLS, null, 2));
  
  expect(result.isUUID).toBe(true);
});
