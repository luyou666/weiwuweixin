
import { test, expect } from '@playwright/test';

test('check deviceId in localStorage', async ({ page }) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const deviceId = await page.evaluate(() => {
    return localStorage.getItem('wwx-device-id');
  });
  
  console.log('wwx-device-id:', deviceId);
  
  const zustandState = await page.evaluate(() => {
    return localStorage.getItem('wwx-user');
  });
  console.log('wwx-user:', zustandState);
  
  // Verify deviceId is a UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  expect(deviceId).toMatch(uuidRegex);
});
