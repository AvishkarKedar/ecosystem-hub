const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const filePath = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'load' });

  console.log('--- TEST 1: Filter to web ---');
  await page.click('button[data-filter="web"]');
  const webCards = await page.locator('.project-card:visible').count();
  console.log('Visible cards under web filter:', webCards);
  assert.strictEqual(webCards, 2);

  console.log('--- TEST 2: Filter to cloud ---');
  await page.click('button[data-filter="cloud"]');
  const cloudCards = await page.locator('.project-card:visible').count();
  console.log('Visible cards under cloud filter:', cloudCards);
  assert.strictEqual(cloudCards, 2);

  console.log('--- TEST 3: Search with no results ---');
  await page.fill('#searchInput', 'nonexistentquery12345');
  const zeroCards = await page.locator('.project-card:visible').count();
  console.log('Visible cards for nonexistentquery12345:', zeroCards);
  assert.strictEqual(zeroCards, 0);
  const emptyVisible = await page.locator('#emptyState').isVisible();
  console.log('Is empty state visible?:', emptyVisible);
  assert.strictEqual(emptyVisible, true);

  console.log('--- TEST 4: Keyboard shortcut / to focus ---');
  await page.keyboard.press('Escape');
  await page.keyboard.press('/');
  const isFocused = await page.evaluate(() => document.activeElement.id === 'searchInput');
  console.log('Is search input focused on / shortcut?:', isFocused);
  assert.strictEqual(isFocused, true);

  await browser.close();
  console.log('Edge case test suite passed successfully!');
})();
