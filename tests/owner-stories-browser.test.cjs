/* Real-browser QA for the local-only OWNER STORIES card studio.
 * Run after: npm install --no-save --no-package-lock playwright@1.56.1
 *             npx playwright install chromium webkit
 *             python3 -m http.server 4173 --bind 127.0.0.1
 *             node --test tests/owner-stories-browser.test.cjs
 * Screenshot evidence is generated locally, without real car photos.
 * Browser WebKit is NOT the same as a physical iPhone Safari test.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require('playwright');

const origin = process.env.TOHESAR_QA_ORIGIN || 'http://127.0.0.1:4173';
const url = origin + '/owner-stories/story-card/';
const output = path.join(process.cwd(), 'test-artifacts', 'owner-stories-browser');
const widths = [320, 390, 768, 1024];
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLTTAAAAABJRU5ErkJggg==', 'base64');
fs.mkdirSync(output, { recursive: true });

function attachErrors(page, found) {
  page.on('pageerror', error => found.push('pageerror: ' + error.message));
  page.on('response', response => {
    if (response.url().startsWith(origin) && response.status() >= 400)
      found.push('HTTP ' + response.status() + ': ' + response.url());
  });
}

for (const [engine, launcher] of [['chromium', chromium], ['webkit', webkit]]) {
  test(engine + ': four viewport sizes, both visual modes, photo export and fallback', { timeout: 180000 }, async () => {
    const browser = await launcher.launch({ headless: true });
    try {
      for (const width of widths) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          deviceScaleFactor: 1,
          acceptDownloads: true,
          reducedMotion: 'reduce'
        });
        const page = await context.newPage();
        const errors = [];
        attachErrors(page, errors);
        const response = await page.goto(url, { waitUntil: 'load', timeout: 20000 });
        assert.equal(response.status(), 200, 'studio HTML must load');

        await page.locator('#story-canvas').waitFor({ state: 'visible' });
        assert.equal(await page.locator('#save').count(), 1);
        assert.equal(await page.locator('#share').count(), 1);

        for (const style of ['gallery', 'cinema']) {
          await page.locator('#car-layout').selectOption(style);
          // Allow the requestAnimationFrame preview to paint before capturing.
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          assert.ok(overflow <= 1, engine + ' ' + width + 'px ' + style + ': horizontal overflow ' + overflow + 'px');
          await page.screenshot({
            path: path.join(output, engine + '-' + width + '-' + style + '.png'),
            fullPage: true,
            animations: 'disabled'
          });
        }
        if (width === 390) {
          await page.locator('#car-layout').selectOption('gallery');
          await page.locator('#car-name').fill('TOHEŞAR TEST CAR');
          await page.locator('#car-caption').fill('Local-only test photograph, not a real owner submission.');
          await page.locator('#car-photo').setInputFiles({
            name: 'qa-pixel.png', mimeType: 'image/png', buffer: png
          });
          await page.waitForFunction(() => document.getElementById('card-status').textContent.includes('사진을 불러왔어요.'), { timeout: 10000 });
          const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 15000 }),
            page.locator('#save').click()
          ]);
          const saved = fs.readFileSync(await download.path());
          assert.equal(saved.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'PNG signature');
          assert.equal(saved.readUInt32BE(16), 1080, 'export width');
          assert.equal(saved.readUInt32BE(20), 1920, 'export height');

          // The photo-picker accept attribute is not a security boundary.
          await page.locator('#car-photo').setInputFiles({
            name: 'disguised.jpg', mimeType: 'image/svg+xml',
            buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')
          });
          assert.match(await page.locator('#card-status').textContent(), /지원되는 사진 파일/);
          const nativeShareAvailable = await page.evaluate(() =>
            typeof navigator.share === 'function' && typeof navigator.canShare === 'function');
          if (!nativeShareAvailable) {
            await page.locator('#share').click();
            assert.match(await page.locator('#card-status').textContent(), /직접 공유를 지원하지/);
          }
          // Native iOS share sheet needs a physical device; it is not tested here.
        }
        assert.deepEqual(errors, [], engine + ' ' + width + 'px browser errors');
        await context.close();
      }
    } finally {
      await browser.close();
    }
  });
}
