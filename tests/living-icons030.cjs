// BASE_URL=http://127.0.0.1:8000 node tests/living-icons030.cjs
// Tests browser engines, not physical iPhone Safari.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium, webkit} = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8000';
(async () => {
  let engines = 0;
  for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
    if (process.env.TEST_ENGINE && process.env.TEST_ENGINE !== name) continue;
    let browser;
    try {
      const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
      browser = await type.launch(name === 'chromium' ? {executablePath, args:['--no-sandbox']} : {});
    } catch (error) {
      if (!process.env.ALLOW_BROWSER_SKIP) throw error;
      console.log(`SKIP ${name}: ${error.message.split('\n')[0]}`); continue;
    }
    engines++;
    for (const viewport of [{width:390,height:844},{width:1180,height:820},{width:1440,height:900}]) {
      const page = await browser.newPage({viewport});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => { window.__thzIcons030Test = {delay:0, speed:4}; });
      await page.goto(base + '/journal/f40/');
      const car = page.locator('.thz-icons030-car');
      await car.waitFor();
      await page.waitForSelector('.thz-icons030.is-visible');
      assert.match(await car.locator('.thz-icons030-current').getAttribute('src'), /f40\.webp/);
      await page.waitForFunction(() => !document.querySelector('.thz-icons030-car').classList.contains('is-obscured'));
      // Sample the actual transformed hit target during a lap, including corners.
      const samples = await page.evaluate(async () => {
        const el = document.querySelector('.thz-icons030-car'), points = [];
        for (let i=0; i<70; i++) {
          const r=el.getBoundingClientRect();
          points.push({x:r.x,y:r.y,right:r.right,bottom:r.bottom,visible:document.querySelector('.thz-icons030').classList.contains('is-visible'),
            puff:document.querySelectorAll('.thz-icons030-puff').length, tracks:document.querySelectorAll('.thz-icons030-track').length});
          await new Promise(resolve => setTimeout(resolve, 70));
        }
        return points;
      });
      for (const r of samples.filter(r => r.visible)) assert(r.x >= -1 && r.y >= -1 && r.right <= viewport.width+1 && r.bottom <= viewport.height+1, JSON.stringify(r));
      assert(samples.some((p,i) => i && Math.abs(p.y-samples[0].y)>100), 'car should travel around a corner');
      assert(samples.some(p => p.puff > 0), 'brief exhaust appears while driving');
      if (viewport.width === 390) assert(samples.some(p => p.tracks >= 2), 'paired tire traces appear in a bend');
      await page.waitForFunction(() => document.querySelector('.thz-icons030.is-visible') && !document.querySelector('.thz-icons030-car').classList.contains('is-obscured'));
      const prior = await car.locator('.thz-icons030-current').getAttribute('src');
      await car.click({force:true});
      await page.waitForFunction(src => document.querySelector('.thz-icons030-current')?.getAttribute('src') !== src, prior, {timeout:3000});
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(() => !document.querySelector('.thz-icons030.is-visible'), null, {timeout:3000});
      assert.equal(await page.locator('.thz-icons030.is-visible').count(),0);
      assert.equal(await page.locator('.thz-icons030-effects > *').count(),0, 'effects are cleared when motion is reduced');
      await page.goto(base + '/');
      await page.locator('.home-feature-image').scrollIntoViewIfNeeded();
      assert.equal(await page.locator('.thz-icons030').count(),1);
      await page.locator('.home-feature-image').click();
      await page.waitForURL('**/journal/f40/');
      await page.goBack(); await page.waitForURL(base+'/');
      assert.equal(await page.locator('.thz-icons030').count(),1);
      assert.deepEqual(errors, []);
      console.log(`PASS ${name} ${viewport.width}x${viewport.height}: path, tap, reduced motion, history`);
      await page.close();
    }
    for (const [url, model] of [['/journal/design/giulia/','giulia'],['/journal/design/type-01/','etype']]) {
      const page = await browser.newPage();
      await page.addInitScript(() => { window.__thzIcons030Test={delay:0}; });
      await page.goto(base+url);
      await page.waitForSelector('.thz-icons030.is-visible');
      assert.match(await page.locator('.thz-icons030-current').getAttribute('src'), new RegExp(model+'\\.webp'));
      await page.close();
    }
    await browser.close();
  }
  assert(engines > 0, 'at least one browser engine must run');
})().catch(error => { console.error(error); process.exit(1); });
