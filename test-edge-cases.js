const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const filePath = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
  await page.goto(filePath);

  console.log('--- TEST 1: Filter to cloud ---');
  await page.click('button[data-filter="cloud"]');
  const h3Visible = await page.isVisible('text=Open-Source Engineering & Software');
  const visibleCards = await page.locator('.service-card:visible').count();
  console.log('Visible cards under cloud filter:', visibleCards);
  console.log('Is OSS Section header visible with 0 OSS cards visible?:', h3Visible);

  console.log('--- TEST 2: Filter to oss ---');
  await page.click('button[data-filter="oss"]');
  const ossCardsCount = await page.locator('.service-card:visible').count();
  console.log('Visible cards under oss filter:', ossCardsCount);

  console.log('--- TEST 3: Search with no results ---');
  await page.fill('#serviceSearch', 'nonexistentquery12345');
  const zeroCards = await page.locator('.service-card:visible').count();
  console.log('Visible cards for nonexistentquery12345:', zeroCards);
  const noResultsMsg = await page.isVisible('text=No matching services');
  console.log('Is there a No matching services message?:', noResultsMsg);

  console.log('--- TEST 4: Clipboard write failure test ---');
  // Overwrite navigator.clipboard to reject
  await page.evaluate(() => {
    navigator.clipboard.writeText = () => Promise.reject(new Error('Permission denied'));
    copyVlessProfile('direct');
  });
  const toastText = await page.textContent('#toastMsg');
  console.log('Toast message on failure:', toastText);

  await browser.close();
})();
