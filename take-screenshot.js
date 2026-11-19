const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const htmlPath = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
  await page.goto(htmlPath);
  await page.screenshot({ path: path.resolve(__dirname, 'screenshot-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.resolve(__dirname, 'screenshot-mobile.png'), fullPage: true });
  await browser.close();
  console.log('Screenshots saved successfully');
})();
