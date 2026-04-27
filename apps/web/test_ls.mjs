
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/zhuwankai/.local/bin/chrome-wrapper',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait a bit for client-side hydration
  await page.waitForTimeout(3000);
  
  // Check localStorage for deviceId
  const result = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const allKeys = {};
    for (const key of keys) {
      allKeys[key] = localStorage.getItem(key)?.substring(0, 100);
    }
    return allKeys;
  });
  
  console.log('All localStorage keys:', JSON.stringify(result, null, 2));
  
  await browser.close();
})();
