// TOHEŞAR 029. BASE_URL=http://127.0.0.1:8000 node tests/living-icons029.cjs
// Requires a local Playwright installation and Chromium; never claims physical Safari coverage.
const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8000';
(async () => {
  for (const [name,engine] of [['chromium',chromium],['webkit',webkit]]) {
    if (process.env.TEST_ENGINE && process.env.TEST_ENGINE !== name) continue;
    let browser;
    try { browser = await engine.launch(name === 'chromium' ? {
      executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',
      args:['--no-sandbox']
    } : {}); } catch (error) {
      console.log('SKIP ' + name + ': ' + error.message.split('\n')[0]); continue;
    }
    for (const width of [390, 1440]) {
      const page = await browser.newPage({viewport:{width,height:844}});
      const errors = [];
      page.on('pageerror',e => errors.push(e.message));
      await page.goto(base + '/journal/f40/');
      const runner = page.locator('.thz-icons029-car');
      await runner.waitFor();
      assert.equal(await runner.count(),1);
      assert.match(await runner.locator('.thz-icons029-current').getAttribute('src'), /f40\.svg/);
      await page.waitForTimeout(7200);
      assert.equal(await page.locator('.thz-icons029.is-visible').count(),1,'perimeter car should appear');
      await runner.evaluate(el => el.click());
      await page.waitForTimeout(550);
      assert.match(await runner.locator('.thz-icons029-current').getAttribute('src'), /countach\.svg/);
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForTimeout(120);
      assert.equal(await page.locator('.thz-icons029.is-visible').count(),0,'reduced motion hides the car');
      await page.goto(base + '/');
      await page.locator('.home-feature-image').scrollIntoViewIfNeeded();
      assert.equal(await page.locator('.thz-icons029').count(),1);
      await page.locator('.home-feature-image').click();
      await page.waitForURL('**/journal/f40/');
      await page.locator('.article-return026 a[href="/"]').click();
      await page.waitForURL(base+'/');
      assert.equal(await page.locator('.home-editorial').count(),1);
      assert.deepEqual(errors,[]);
      console.log('PASS ' + name + ' ' + width);
      await page.close();
    }
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
