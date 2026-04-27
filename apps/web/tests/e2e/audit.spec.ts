import { test, expect } from '@playwright/test';

test.describe('Accessibility & Performance Audit', () => {
  test('homepage audit', async ({ page }) => {
    await page.goto('http://localhost:3000/zh', { waitUntil: 'networkidle' });

    // Performance metrics
    const perfMetrics = await page.evaluate(() => {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const navEntry = navEntries.length > 0 ? navEntries[0] : null;
      return {
        domContentLoaded: navEntry ? Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime) : null,
        loadComplete: navEntry ? Math.round(navEntry.loadEventEnd - navEntry.startTime) : null,
        domSize: document.querySelectorAll('*').length,
        htmlLang: document.documentElement.lang,
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content'),
        viewportMeta: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
      };
    });
    console.log('=== Performance Metrics ===');
    console.log(JSON.stringify(perfMetrics, null, 2));

    // Accessibility checks
    const a11yResults = await page.evaluate(() => {
      const issues: { rule: string; impact: string; desc: string }[] = [];

      // Check lang attribute
      const htmlLang = document.documentElement.lang;
      if (!htmlLang) issues.push({ rule: 'html-has-lang', impact: 'serious', desc: 'html元素缺少lang属性' });

      // Check title
      if (!document.title || document.title.trim() === '') issues.push({ rule: 'document-title', impact: 'serious', desc: '缺少页面title' });

      // Check images alt
      const imgs = Array.from(document.querySelectorAll('img'));
      const imgsWithoutAlt = imgs.filter(img => !img.hasAttribute('alt'));
      if (imgsWithoutAlt.length > 0) {
        issues.push({ rule: 'image-alt', impact: 'critical', desc: imgsWithoutAlt.length + '个img缺少alt属性' });
      }

      // Check heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
      let prevLevel = 0;
      const headingIssues: string[] = [];
      headings.forEach(h => {
        const level = parseInt(h.tagName[1]);
        if (prevLevel > 0 && level > prevLevel + 1) {
          headingIssues.push('h' + prevLevel + '→h' + level + ' 跳级');
        }
        prevLevel = level;
      });
      if (headingIssues.length > 0) {
        issues.push({ rule: 'heading-order', impact: 'moderate', desc: '标题层级跳级: ' + headingIssues.join('; ') });
      }

      // Check buttons have accessible names
      const buttons = Array.from(document.querySelectorAll('button'));
      const unnamedButtons = buttons.filter(b => !b.textContent?.trim() && !b.getAttribute('aria-label') && !b.getAttribute('aria-labelledby'));
      if (unnamedButtons.length > 0) {
        issues.push({ rule: 'button-name', impact: 'critical', desc: unnamedButtons.length + '个按钮缺少可访问名称' });
      }

      // Check links have accessible names
      const links = Array.from(document.querySelectorAll('a'));
      const unnamedLinks = links.filter(a => !a.textContent?.trim() && !a.getAttribute('aria-label') && !a.getAttribute('aria-labelledby') && !a.getAttribute('title'));
      if (unnamedLinks.length > 0) {
        issues.push({ rule: 'link-name', impact: 'serious', desc: unnamedLinks.length + '个链接缺少可访问名称' });
      }

      // Check form inputs have labels
      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])'));
      const unlabeledInputs = inputs.filter(inp => {
        const id = inp.getAttribute('id');
        const hasLabel = id ? !!document.querySelector('label[for="' + id + '"]') : false;
        const hasAriaLabel = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby');
        const hasTitle = inp.getAttribute('title');
        return !hasLabel && !hasAriaLabel && !hasTitle;
      });
      if (unlabeledInputs.length > 0) {
        issues.push({ rule: 'label', impact: 'critical', desc: unlabeledInputs.length + '个表单输入缺少label' });
      }

      // Check for main landmark
      const mainLandmark = document.querySelector('main, [role="main"]');
      if (!mainLandmark) {
        issues.push({ rule: 'landmark-one-main', impact: 'moderate', desc: '缺少main地标' });
      }

      // Check aria-hidden on body
      if (document.body.getAttribute('aria-hidden') === 'true') {
        issues.push({ rule: 'aria-hidden-body', impact: 'critical', desc: 'body有aria-hidden=true' });
      }

      return {
        totalImages: imgs.length,
        totalHeadings: headings.length,
        totalButtons: buttons.length,
        totalLinks: links.length,
        totalInputs: inputs.length,
        issues
      };
    });
    console.log('=== Accessibility Audit ===');
    console.log(JSON.stringify(a11yResults, null, 2));

    // Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise<{ lcp?: number; cls?: number }>((resolve) => {
        const result: { lcp?: number; cls?: number } = {};

        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1] as PerformanceEntry;
            result.lcp = Math.round((lastEntry as any).renderTime || (lastEntry as any).startTime);
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch(e) {}

        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
          result.cls = Math.round(clsValue * 1000) / 1000;
        } catch(e) {}

        setTimeout(() => resolve(result), 3000);
      });
    });
    console.log('=== Web Vitals ===');
    console.log(JSON.stringify(webVitals, null, 2));

    // Summary
    const seriousCritical = a11yResults.issues.filter(
      i => i.impact === 'serious' || i.impact === 'critical'
    );
    console.log('\n=== Summary ===');
    console.log('Serious/Critical violations: ' + seriousCritical.length);
    console.log('Total issues: ' + a11yResults.issues.length);

    // Basic assertions
    expect(perfMetrics.htmlLang).toBeTruthy();
    expect(perfMetrics.title).toBeTruthy();
  });

  test('/list/new audit', async ({ page }) => {
    await page.goto('http://localhost:3000/zh/list/new', { waitUntil: 'networkidle' });

    const perfMetrics = await page.evaluate(() => {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const navEntry = navEntries.length > 0 ? navEntries[0] : null;
      return {
        domContentLoaded: navEntry ? Math.round(navEntry.domContentLoadedEventEnd - navEntry.startTime) : null,
        loadComplete: navEntry ? Math.round(navEntry.loadEventEnd - navEntry.startTime) : null,
        domSize: document.querySelectorAll('*').length,
        htmlLang: document.documentElement.lang,
        title: document.title,
      };
    });
    console.log('=== /list/new Performance ===');
    console.log(JSON.stringify(perfMetrics, null, 2));
  });
});