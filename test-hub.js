const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log('Starting minimal monochrome directory verification...');
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

  // 2. Count Cards
  const totalCards = await page.locator('.project-card').count();
  console.log('✓ Total Public Project Cards:', totalCards);
  assert.strictEqual(totalCards, 9, 'Expected exactly 9 public projects');

  // 3. Category Filter Tests
  console.log('Testing category filters...');

  // Hosted Filter
  await page.click('button[data-filter="hosted"]');
  const hostedCards = await page.locator('.project-card:visible').count();
  console.log(`✓ Hosted filter: ${hostedCards} cards visible`);
  assert.strictEqual(hostedCards, 3, 'Expected 3 hosted apps');

  // Cloud Filter
  await page.click('button[data-filter="cloud"]');
  const cloudCards = await page.locator('.project-card:visible').count();
  console.log(`✓ Cloud filter: ${cloudCards} cards visible`);
  assert.strictEqual(cloudCards, 2, 'Expected 2 cloud services');

  // OSS Filter
  await page.click('button[data-filter="oss"]');
  const ossCards = await page.locator('.project-card:visible').count();
  console.log(`✓ OSS filter: ${ossCards} cards visible`);
  assert.strictEqual(ossCards, 4, 'Expected 4 OSS tools');

  // Reset to All
  await page.click('button[data-filter="all"]');
  const allCards = await page.locator('.project-card:visible').count();
  console.log(`✓ All filter restored: ${allCards} cards visible`);
  assert.strictEqual(allCards, 9);

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
  assert.strictEqual(resetCount, 9);

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
  assert.strictEqual(restoredFromEmpty, 9);

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
  await page.setViewportSize({ width: 1440, height: 1100 });
  const desktopShot = 'C:/Users/Dell/.gemini/antigravity/brain/b6e56e02-45e8-46aa-91b9-42706c517b2c/screenshot-desktop.png';
  await page.screenshot({ path: desktopShot, fullPage: true });
  console.log('✓ Captured desktop screenshot to:', desktopShot);

  // 8. Capture Mobile Screenshot
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileShot = 'C:/Users/Dell/.gemini/antigravity/brain/b6e56e02-45e8-46aa-91b9-42706c517b2c/screenshot-mobile.png';
  await page.screenshot({ path: mobileShot, fullPage: true });
  console.log('✓ Captured mobile screenshot to:', mobileShot);

  // 9. Check Console Errors
  const errors = consoleLogs.filter(l => l.type === 'error');
  console.log(`✓ Total console errors: ${errors.length}`);
  assert.strictEqual(errors.length, 0, 'No console errors expected');

  await browser.close();
  console.log('\n========================================');
  console.log(' ALL SUITES PASSED! MINIMAL MONOCHROME VERIFIED');
  console.log('========================================\n');
})();
