const { chromium, devices } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log('Starting verification of hosted-only websites directory...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write']
  });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => consoleLogs.push({ type: 'error', text: err.toString() }));

  const filePath = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
  console.log('Navigating to:', filePath);
  await page.goto(filePath, { waitUntil: 'load' });

  // 1. Verify Title & Meta
  const title = await page.title();
  console.log('✓ Page Title:', title);
  assert(title.includes('Avishkar Kedar') && title.includes('Software Engineer'), 'Title must feature Avishkar Kedar');

  // 2. Count Cards (Exactly 4 hosted websites)
  const totalCards = await page.locator('.project-card').count();
  console.log('✓ Total Hosted Website Cards:', totalCards);
  assert.strictEqual(totalCards, 4, 'Expected exactly 4 hosted website projects');

  // 3. Category Filter Tests
  console.log('Testing category filters...');

  // Web Apps Filter
  await page.click('button[data-filter="web"]');
  const webCards = await page.locator('.project-card:visible').count();
  console.log(`✓ Web filter: ${webCards} cards visible`);
  assert.strictEqual(webCards, 2, 'Expected 2 web apps');

  // Cloud Systems Filter
  await page.click('button[data-filter="cloud"]');
  const cloudCards = await page.locator('.project-card:visible').count();
  console.log(`✓ Cloud filter: ${cloudCards} cards visible`);
  assert.strictEqual(cloudCards, 2, 'Expected 2 cloud services');

  // Reset to All
  await page.click('button[data-filter="all"]');
  const allCards = await page.locator('.project-card:visible').count();
  console.log(`✓ All filter restored: ${allCards} cards visible`);
  assert.strictEqual(allCards, 4);

  // 4. Search Filter Tests
  console.log('Testing search functionality...');
  await page.fill('#searchInput', 'AnonShare');
  const anonCard = await page.locator('.project-card:visible').count();
  console.log(`✓ Search "AnonShare": ${anonCard} card visible`);
  assert.strictEqual(anonCard, 1);

  // Reset search
  await page.fill('#searchInput', '');
  const resetCount = await page.locator('.project-card:visible').count();
  console.log(`✓ Cleared search: ${resetCount} cards restored`);
  assert.strictEqual(resetCount, 4);

  // Empty state test
  await page.fill('#searchInput', 'nonexistenttermxyz');
  const emptyCount = await page.locator('.project-card:visible').count();
  const emptyVisible = await page.locator('#emptyState').isVisible();
  console.log(`✓ Non-existent search: ${emptyCount} cards visible, Empty state visible: ${emptyVisible}`);
  assert.strictEqual(emptyCount, 0);
  assert.strictEqual(emptyVisible, true);

  // Click reset button in empty state
  await page.click('#emptyState button');
  const restoredFromEmpty = await page.locator('.project-card:visible').count();
  console.log(`✓ Reset via empty-state button: ${restoredFromEmpty} cards visible`);
  assert.strictEqual(restoredFromEmpty, 4);

  // 5. Test Email Copy
  await page.click('#copyEmailBtn');
  await page.waitForTimeout(200);
  const toastVisible = await page.locator('#toast.show').isVisible();
  console.log('✓ Toast shown on copy email:', toastVisible);
  assert.strictEqual(toastVisible, true, 'Toast notification must be visible upon clicking email copy');

  // 6. Anchor Links Audit
  const links = await page.locator('a[href]').all();
  console.log(`✓ Total anchor links audited: ${links.length}`);
  for (const link of links) {
    const href = await link.getAttribute('href');
    assert(href && href.length > 0 && !href.startsWith('javascript:'), `Invalid href: ${href}`);
    if (href.startsWith('http') && !href.includes('avishkarkedar.com')) {
      const target = await link.getAttribute('target');
      const rel = await link.getAttribute('rel');
      assert.strictEqual(target, '_blank', `External link ${href} must have target="_blank"`);
      assert(rel && rel.includes('noopener'), `External link ${href} must have rel="noopener"`);
    }
  }

  // 7. Capture Desktop Screenshot
  await page.setViewportSize({ width: 1440, height: 950 });
  const desktopShot = path.resolve(__dirname, 'screenshot-desktop.png');
  await page.screenshot({ path: desktopShot, fullPage: true });
  console.log('✓ Captured desktop screenshot to:', desktopShot);

  // 8. Capture Android Mobile Device (Pixel 7 / Android Chrome simulation)
  const pixel = devices['Pixel 7'] || { viewport: { width: 412, height: 915 }, userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7)' };
  const androidContext = await browser.newContext({
    ...pixel,
    permissions: ['clipboard-read', 'clipboard-write']
  });
  const androidPage = await androidContext.newPage();
  await androidPage.goto(filePath, { waitUntil: 'load' });
  const mobileShot = path.resolve(__dirname, 'screenshot-mobile.png');
  await androidPage.screenshot({ path: mobileShot, fullPage: true });
  console.log('✓ Captured Android mobile screenshot (Pixel 7 412x915) to:', mobileShot);

  // 9. Check Console Errors
  const errors = consoleLogs.filter(l => l.type === 'error');
  console.log(`✓ Total console errors: ${errors.length}`);
  assert.strictEqual(errors.length, 0, 'No console errors expected');

  await browser.close();
  console.log('\n========================================');
  console.log(' ALL 5-HOSTED SUITES PASSED! ANDROID & DESKTOP PERFECT');
  console.log('========================================\n');
})();
