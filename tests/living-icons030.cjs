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
    for (const viewport of [{width:390,height:844},{width:1180,height:820},{width:1440,height:900}].filter(size => !process.env.TEST_WIDTH || size.width === Number(process.env.TEST_WIDTH))) {
      const page = await browser.newPage({viewport});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(width => { window.__thzIcons030Test = {delay:0, speed:width === 390 ? 2 : 4}; }, viewport.width);
      await page.goto(base + '/journal/f40/');
      const car = page.locator('.thz-icons030-car');
      await car.waitFor();
      await page.waitForSelector('.thz-icons030.is-visible');
      assert.match(await car.locator('.thz-icons030-current').getAttribute('src'), /f40\.webp/);
      await page.waitForFunction(() => !document.querySelector('.thz-icons030-car').classList.contains('is-obscured'));
      // A car crossing an article link may lose pointer events, but must NOT fade.
      // Reproduce the old mobile flicker caused by toggling is-obscured.
      await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.thz-icons030-car')).opacity) > .98);
      const overlap = await car.evaluate(el => {
        const oldTransition = el.style.transition, wasBlocked = el.classList.contains('is-obscured');
        el.style.transition = 'none';
        el.classList.add('is-obscured');
        const css = getComputedStyle(el), result = {opacity:Number(css.opacity),hit:css.pointerEvents};
        if (!wasBlocked) el.classList.remove('is-obscured');
        el.style.transition = oldTransition;
        return result;
      });
      assert.equal(overlap.opacity,1, 'car must not disappear while crossing text or links');
      assert.equal(overlap.hit,'none', 'car must not steal link taps');
      if (viewport.width === 390) {
        // iPhone browser chrome changes the available visual viewport height.
        await page.setViewportSize({width:390,height:760});
        await page.waitForTimeout(100);
        assert.equal(await car.evaluate(el => Number(getComputedStyle(el).opacity)), 1, 'mobile toolbar resize must not flash car');
        await page.setViewportSize(viewport);
      }
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
      if (viewport.width === 390) {
        await page.waitForFunction(() => document.querySelectorAll('.thz-icons030-track').length >= 2, null, {timeout:13000});
        const mark = await page.locator('.thz-icons030-track').first().elementHandle();
        await page.waitForTimeout(2100);
        assert(await mark.evaluate(node => node.isConnected && Number(getComputedStyle(node).opacity) > 0), 'tire traces remain visible');
      }
      await page.waitForFunction(() => document.querySelector('.thz-icons030.is-visible') && !document.querySelector('.thz-icons030-car').classList.contains('is-obscured'));
      if (viewport.width === 390) {
        const beforeDrag = await car.locator('.thz-icons030-current').getAttribute('src');
        const rect = await car.boundingBox();
        await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
        await page.mouse.down();
        await page.mouse.move(viewport.width / 2, viewport.height / 2, {steps:10});
        const dragged = await car.boundingBox();
        assert(Math.abs(dragged.x + dragged.width / 2 - viewport.width / 2) < 12, 'car follows the pointer');
        await page.mouse.up();
        await page.waitForTimeout(900);
        const returned = await car.boundingBox();
        const x = returned.x + returned.width / 2, y = returned.y + returned.height / 2;
        assert(Math.min(x, viewport.width-x, y, viewport.height-y) < 65, 'car returns to the perimeter');
        assert.equal(await car.locator('.thz-icons030-current').getAttribute('src'), beforeDrag, 'dragging must not trigger a tap transformation');
        await page.waitForFunction(() => !document.querySelector('.thz-icons030-car').classList.contains('is-obscured'));
      }
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
      if (viewport.width === 390) {
        await page.emulateMedia({reducedMotion:'no-preference'});
        await page.locator('.home-feature-image').scrollIntoViewIfNeeded();
        await page.waitForSelector('.thz-icons030.is-visible', {timeout:5000});
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForFunction(() => document.querySelector('.thz-icons030.is-cover-hidden'));
        assert.equal(await page.locator('.thz-icons030').evaluate(el => getComputedStyle(el).visibility), 'hidden');
        await page.locator('.home-feature-image').scrollIntoViewIfNeeded();
        await page.waitForSelector('.thz-icons030.is-visible', {timeout:5000});
        assert.equal(await page.locator('.thz-icons030').evaluate(el => getComputedStyle(el).visibility), 'visible');
      }
      assert.deepEqual(errors, []);
      console.log(`PASS ${name} ${viewport.width}x${viewport.height}: path, tap, reduced motion, history`);
      await page.close();
    }
    // Safari may take time to decode a newly selected miniature. Keep the
    // current car solid until the next WebP is ready to crossfade.
    const decodePage = await browser.newPage({viewport:{width:390,height:844}});
    const decodeErrors = [];
    decodePage.on('pageerror', error => decodeErrors.push(error.message));
    await decodePage.addInitScript(() => {
      window.__thzIcons030Test = {delay:0};
      const nativeDecode = HTMLImageElement.prototype.decode;
      HTMLImageElement.prototype.decode = function() {
        if ((this.src || '').includes('/countach.webp'))
          return new Promise((resolve, reject) => setTimeout(() => nativeDecode.call(this).then(resolve, reject), 1200));
        return nativeDecode.call(this);
      };
    });
    await decodePage.goto(base + '/journal/f40/');
    await decodePage.waitForSelector('.thz-icons030.is-visible');
    const changingCar = decodePage.locator('.thz-icons030-car');
    assert.match(await changingCar.locator('.thz-icons030-current').getAttribute('src'), /f40\.webp/);
    // This check targets asynchronous image decoding; pointer safety is tested above.
    // A forced pointer click can hit an underlying link when the car is obscured.
    await changingCar.dispatchEvent('click');
    await decodePage.waitForTimeout(200);
    assert.match(await changingCar.locator('.thz-icons030-current').getAttribute('src'),
      /f40\.webp/, 'old image remains while next is decoding');
    assert.equal(await changingCar.evaluate(el => el.classList.contains('is-transforming')),
      false, 'do not crossfade to an undecoded image');
    await decodePage.waitForFunction(() =>
      (document.querySelector('.thz-icons030-current')?.getAttribute('src') || '').includes('countach.webp'),
      null, {timeout:6000});
    assert.deepEqual(decodeErrors, []);
    await decodePage.close();

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
