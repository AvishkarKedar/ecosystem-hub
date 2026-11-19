const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  console.log('Starting comprehensive ecosystem hub verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
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
  assert(title.includes('Avishkar Kedar') && title.includes('Ecosystem'));

  // 2. Count Cards & Dynamic Badges
  const totalCards = await page.locator('.service-card').count();
  console.log('✓ Total Service Cards:', totalCards);
  assert.strictEqual(totalCards, 12, 'Expected exactly 12 service and project cards');

  const tabCountText = await page.locator('#allTabCount').textContent();
  console.log('✓ Dynamic All tab count:', tabCountText);
  assert.strictEqual(tabCountText.trim(), '(12)');

  // 3. Category Filter Tests
  console.log('Testing category filters...');

  // 3a. Cloud Filter
  await page.click('button[data-filter="cloud"]');
  const cloudCards = await page.locator('.service-card:visible').count();
  const ossHeaderCloud = await page.locator('#ossSection').isVisible();
  console.log(`✓ Cloud filter: ${cloudCards} cards visible, OSS header visible: ${ossHeaderCloud}`);
  assert.strictEqual(cloudCards, 3, 'Expected 3 cloud services');
  assert.strictEqual(ossHeaderCloud, false, 'OSS section header must be hidden when 0 OSS cards visible');

  // 3b. Web Filter
  await page.click('button[data-filter="web"]');
  const webCards = await page.locator('.service-card:visible').count();
  console.log(`✓ Web filter: ${webCards} cards visible`);
  assert.strictEqual(webCards, 4, 'Expected 4 web apps');

  // 3c. Network Filter
  await page.click('button[data-filter="network"]');
  const netCards = await page.locator('.service-card:visible').count();
  const ossHeaderNet = await page.locator('#ossSection').isVisible();
  console.log(`✓ Network filter: ${netCards} cards visible, OSS header visible: ${ossHeaderNet}`);
  assert.strictEqual(netCards, 2, 'Expected 2 network services');
  assert.strictEqual(ossHeaderNet, false, 'OSS section header must be hidden');

  // 3d. OSS Filter
  await page.click('button[data-filter="oss"]');
  const ossCards = await page.locator('.service-card:visible').count();
  const ossHeaderOss = await page.locator('#ossSection').isVisible();
  console.log(`✓ OSS filter: ${ossCards} cards visible, OSS header visible: ${ossHeaderOss}`);
  assert.strictEqual(ossCards, 5, 'Expected 5 open-source projects');
  assert.strictEqual(ossHeaderOss, true, 'OSS section header must be visible');

  // 3e. All Filter restore
  await page.click('button[data-filter="all"]');
  const allCards = await page.locator('.service-card:visible').count();
  console.log(`✓ All filter restored: ${allCards} cards visible`);
  assert.strictEqual(allCards, 12);

  // 4. Search Functionality Tests
  console.log('Testing search filtering...');
  const searchInput = page.locator('#serviceSearch');
  const clearBtn = page.locator('#clearSearch');

  // 4a. Specific search
  await searchInput.fill('Immich');
  const immichCards = await page.locator('.service-card:visible').count();
  console.log(`✓ Search "Immich": ${immichCards} card visible`);
  assert.strictEqual(immichCards, 1);
  assert(await clearBtn.isVisible(), 'Clear button should appear when text is typed');

  // 4b. Clear button test
  await clearBtn.click();
  const afterClearCards = await page.locator('.service-card:visible').count();
  console.log(`✓ Cleared search via (X) button: ${afterClearCards} cards restored`);
  assert.strictEqual(afterClearCards, 12);

  // 4c. Non-existent query & Empty State test
  await searchInput.fill('xyznonexistentquery999');
  const zeroCards = await page.locator('.service-card:visible').count();
  const emptyStateVisible = await page.locator('#noResultsState').isVisible();
  const queryDisplay = await page.locator('#searchQueryDisplay').textContent();
  console.log(`✓ Non-existent search: ${zeroCards} cards visible, Empty state visible: ${emptyStateVisible}, Display query: ${queryDisplay}`);
  assert.strictEqual(zeroCards, 0);
  assert.strictEqual(emptyStateVisible, true);
  assert(queryDisplay.includes('xyznonexistentquery999'));

  // 4d. Reset button on empty state
  await page.click('#resetSearchBtn');
  const resetCards = await page.locator('.service-card:visible').count();
  const emptyStateAfterReset = await page.locator('#noResultsState').isVisible();
  console.log(`✓ Reset via empty-state button: ${resetCards} cards visible, Empty state: ${emptyStateAfterReset}`);
  assert.strictEqual(resetCards, 12);
  assert.strictEqual(emptyStateAfterReset, false);

  // 5. Modal Tests
  console.log('Testing VPN config modal...');
  // 5a. Open via card button
  await page.click('button:has-text("View Config Details")');
  const modalActive = await page.locator('#vpnModal.active').count();
  console.log('✓ Modal opened via card button:', modalActive === 1);
  assert.strictEqual(modalActive, 1);

  // 5b. Close via backdrop
  await page.mouse.click(10, 10); // Click outside modal window on backdrop
  const modalAfterBackdrop = await page.locator('#vpnModal.active').count();
  console.log('✓ Modal closed via backdrop click:', modalAfterBackdrop === 0);
  assert.strictEqual(modalAfterBackdrop, 0);

  // 5c. Open and close via Escape
  await page.evaluate(() => openVpnModal());
  await page.keyboard.press('Escape');
  const modalAfterEsc = await page.locator('#vpnModal.active').count();
  console.log('✓ Modal closed via Escape key:', modalAfterEsc === 0);
  assert.strictEqual(modalAfterEsc, 0);

  // 6. Clipboard & Toast Tests
  console.log('Testing copy to clipboard and toast notification...');
  // Click copy button on card
  await page.click('button:has-text("Copy 5G VLESS Link")');
  await page.waitForSelector('#toast.show', { timeout: 3000 });
  const toastText = await page.locator('#toastMsg').textContent();
  console.log(`✓ Toast shown with message: "${toastText}"`);
  assert(toastText.includes('VLESS profile copied'));

  // 7. Robust fallback test when clipboard API throws
  console.log('Testing robust fallback when clipboard API is restricted...');
  await page.evaluate(async () => {
    navigator.clipboard.writeText = () => Promise.reject(new Error('Permission denied'));
    copyVlessProfile('domain');
  });
  await page.waitForSelector('#toast.show', { timeout: 3000 });
  const fallbackToastText = await page.locator('#toastMsg').textContent();
  console.log(`✓ Fallback copy succeeded with message: "${fallbackToastText}"`);
  assert(fallbackToastText.includes('VLESS profile copied'));

  // 8. Link & Security Auditing
  console.log('Auditing all anchor elements and security attributes...');
  const linkDetails = await page.$$eval('a[href]', anchors => anchors.map(a => ({
    href: a.getAttribute('href'),
    target: a.getAttribute('target'),
    rel: a.getAttribute('rel')
  })));
  console.log(`✓ Total anchor links audited: ${linkDetails.length}`);
  
  for (const link of linkDetails) {
    assert(link.href && link.href !== '#' && !link.href.startsWith('javascript:'), `Invalid href: ${link.href}`);
    if (link.href.startsWith('http') && !link.href.includes('avishkarkedar.com') && !link.href.includes('portfolio.avishkarkedar.com')) {
      assert.strictEqual(link.target, '_blank', `External link missing target="_blank": ${link.href}`);
      assert(link.rel && link.rel.includes('noopener'), `External link missing rel="noopener": ${link.href}`);
    }
  }

  // 9. Mobile Viewport Auditing
  console.log('Testing mobile responsiveness...');
  await page.setViewportSize({ width: 375, height: 667 });
  const isHeaderVisible = await page.locator('header').isVisible();
  const isSearchVisible = await page.locator('#serviceSearch').isVisible();
  const isFeaturedVisible = await page.locator('.service-card.featured').isVisible();
  console.log(`✓ Mobile viewport: Header: ${isHeaderVisible}, Search: ${isSearchVisible}, Featured Card: ${isFeaturedVisible}`);
  assert(isHeaderVisible && isSearchVisible && isFeaturedVisible);

  // 10. Console Error Verification
  const errors = consoleLogs.filter(l => l.type === 'error');
  console.log(`✓ Total browser console errors: ${errors.length}`);
  assert.strictEqual(errors.length, 0, `Unexpected console errors: ${JSON.stringify(errors)}`);

  await browser.close();
  console.log('\n========================================');
  console.log(' ALL 10 TEST SUITES PASSED FLAWLESSLY!');
  console.log('========================================\n');
})();
