/* Run against a static server rooted at the repository. Requires Playwright.
   BASE_URL=http://127.0.0.1:8100 node scripts/verify_recovery015.cjs */
const {chromium, webkit, devices} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.BASE_URL || 'http://127.0.0.1:8100';
const out = path.resolve(__dirname, '../docs/recovery-015');
const routes = ['/', '/journal/', '/edition/', '/edition/news/', '/edition/archive/',
  '/edition/story/f40/', '/edition/story/911/', '/edition/story/mission-s/'];
const widths = [320, 375, 390, 430, 768, 1024, 1194, 1440];
const report = {base, responsive: [], interactions: [], noJavaScript: [], errors: []};

async function waitImages(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(async img => {
      img.loading = 'eager';
      try { await img.decode(); } catch { /* Report the failing URL below. */ }
    }));
  });
}
async function journey(browser, engine) {
  const ctx = await browser.newContext({...devices['iPhone 13'], deviceScaleFactor: 1});
  const p = await ctx.newPage();
  p.on('pageerror', e => report.errors.push(`${engine}: ${e.message}`));
  await p.goto(base + '/');
  const coverStart = await p.locator('.photograph').boundingBox();
  await p.evaluate(() => scrollTo(0, innerHeight * .8));
  await p.waitForTimeout(350);
  const coverFramed = await p.locator('.photograph').boundingBox();
  assert(coverFramed.width < coverStart.width && coverFramed.height < coverStart.height, 'Cover must shrink into its frame');
  await p.locator('.journal-link').click();
  await p.waitForURL('**/journal/');
  await p.locator('.header-journal').click();
  await p.waitForURL('**/edition/');
  await p.locator('.nav-journal').click();
  await p.waitForURL('**/journal/');
  await p.goBack();
  assert(new URL(p.url()).pathname === '/edition/');
  await p.waitForTimeout(180);
  assert(!await p.locator('html').evaluate(el => el.classList.contains('travel-leaving')), 'Back must clear the transition');
  await p.getByRole('button', {name: '메뉴 열기', exact: true}).click();
  assert(await p.locator('#mobile-menu').isVisible());
  await p.keyboard.press('Escape');
  assert(!await p.locator('#mobile-menu').isVisible());
  await p.getByRole('button', {name: '검색 열기', exact: true}).click();
  await p.locator('#search-field').fill('F40');
  await p.locator('#search-results a').first().click();
  await p.waitForURL('**/edition/story/f40/');
  await p.locator('[data-save]').click();
  await p.reload();
  assert.equal(await p.locator('[data-save]').getAttribute('aria-pressed'), 'true');
  await p.locator('[data-saved-open]').click();
  assert.equal(await p.locator('#saved-items a').count(), 1);
  await p.locator('#saved-items button').click();
  assert.equal(await p.locator('#saved-items a').count(), 0);
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('[data-save]').getAttribute('aria-pressed'), 'false');
  assert.equal(await p.locator('.article-toc a').count(), 2);
  await p.locator('.article-toc a').last().click();
  await p.waitForTimeout(250);
  assert(await p.evaluate(() => scrollY > 0));
  assert(await p.locator('#reading-progress').getAttribute('style'));
  assert(await p.locator('.article-source a').count() > 0);

  await p.goto(base + '/edition/news/');
  await p.waitForFunction(() => document.querySelectorAll('#wire-list .wire-card').length > 0);
  assert.equal(await p.locator('#wire-list .wire-card').count(), 12);
  await p.locator('#wire-load-more').click();
  assert.equal(await p.locator('#wire-list .wire-card').count(), 24);
  await p.locator('#wire-publisher').selectOption('autoblog');
  assert((await p.locator('#wire-list .wire-card small').allTextContents()).every(s => s.includes('Autoblog')));
  await p.locator('#wire-query').fill('unlikelynoresults');
  assert((await p.locator('#wire-list').innerText()).includes('조건에 맞는'));
  await p.locator('#wire-reset').click();
  assert.equal(await p.locator('#wire-query').inputValue(), '');
  assert.equal(await p.locator('#wire-publisher').inputValue(), 'all');
  assert.equal(await p.locator('#wire-topic').inputValue(), 'all');
  assert.equal(await p.locator('#wire-list .wire-card').count(), 12);
  const source = p.locator('#wire-list a').first();
  assert((await source.getAttribute('href')).startsWith('https://'));
  assert.equal(await source.getAttribute('target'), '_blank');
  await p.locator('.feed-health-detail summary').click();
  assert(await p.locator('#feed-health').isVisible());
  await p.goto(base + '/edition/news/?topic=motorsport');
  assert.equal(await p.locator('#wire-topic').inputValue(), 'motorsport');
  await p.waitForFunction(() => !document.getElementById('wire-state').textContent.includes('수집 기록 확인 중'));
  await p.locator('#wire-reset').click();
  assert(!new URL(p.url()).searchParams.has('topic'));
  await p.getByRole('button', {name: '검색 열기', exact: true}).click();
  await p.locator('#search-field').fill('Toyota');
  await p.waitForFunction(() => document.querySelectorAll('#search-results a').length > 0);
  await p.keyboard.press('Escape');

  await p.goto(base + '/edition/archive/');
  await p.locator('#archive-query').fill('F40');
  assert.equal(await p.locator('[data-archive-item]:visible').count(), 1);
  await p.locator('#archive-query').fill('unlikelynoresults');
  assert(await p.locator('#archive-empty').isVisible());
  await p.locator('#archive-reset').click();
  assert.equal(await p.locator('[data-archive-item]:visible').count(), 3);
  await p.locator('#archive-topic').selectOption('porsche');
  assert.equal(await p.locator('[data-archive-item]:visible').count(), 2);

  await p.route('**/data/news.json', r => r.fulfill({status: 503, body: 'unavailable'}));
  await p.goto(base + '/edition/news/');
  await p.waitForFunction(() => document.getElementById('wire-state').textContent.includes('연결 지연'));
  assert((await p.locator('#feed-health').textContent()).includes('접속할 수 없습니다'));
  await p.unroute('**/data/news.json');
  await p.route('**/data/news.json', r => r.fulfill({json: {status: 'live', generated_at: '2020-01-01T00:00:00Z', items: [{title: 'Old source headline', source: 'Porsche', url: 'https://newsroom.porsche.com/old', published_at: '2020-01-01T00:00:00Z'}]}}));
  await p.reload();
  await p.waitForFunction(() => document.getElementById('wire-state').textContent.includes('과거 수집 자료'));
  await p.unroute('**/data/news.json');
  await ctx.close();
  report.interactions.push({engine, passed: ['Cover frame', 'Cover → Journal → Newsroom → Journal / back', 'menu / Escape', 'search → article', 'save / reload / remove', 'article TOC / progress / sources', 'load 12 → 24', 'publisher / query / category / reset', 'original source link', 'feed health disclosure', 'topic deep link', 'RSS title search', 'archive search / empty / reset / category', 'HTTP 503 fallback', 'stale snapshot']});

  const reduced = await browser.newContext({...devices['iPhone 13'], reducedMotion: 'reduce'});
  const rp = await reduced.newPage();
  await rp.goto(base + '/journal/');
  assert.equal(await rp.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  await rp.locator('.header-journal').click();
  await rp.waitForURL('**/edition/');
  await reduced.close();
}

(async () => {
  fs.mkdirSync(out, {recursive: true});
  for (const engine of ['webkit', 'chromium']) {
    const browser = await (engine === 'webkit' ? webkit : chromium).launch(engine === 'chromium' ? {executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']} : {});
    const ctx = await browser.newContext({deviceScaleFactor: 1});
    const p = await ctx.newPage();
    p.on('pageerror', e => report.errors.push(`${engine}: ${e.message}`));
    for (const width of widths) {
      await p.setViewportSize({width, height: width < 768 ? 844 : 834});
      for (const route of routes) {
        const response = await p.goto(base + route);
        assert([200, 304].includes(response.status()), `${route}: HTTP ${response.status()}`);
        await waitImages(p);
        const result = await p.evaluate(() => ({overflow: document.documentElement.scrollWidth > innerWidth, broken: [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')), fonts: document.fonts.status}));
        assert(!result.overflow, `${engine} / ${width} / ${route} overflow`);
        assert.deepEqual(result.broken, [], `${engine} / ${width} / ${route} images`);
        report.responsive.push({engine, width, route, ...result});
      }
    }
    await ctx.close();
    await journey(browser, engine);
    const nojs = await browser.newContext({...devices['iPhone 13'], javaScriptEnabled: false});
    const np = await nojs.newPage();
    for (const route of ['/journal/', '/edition/', '/edition/news/']) {
      await np.goto(base + route);
      assert(await np.locator('main a[href]').count() > 0);
      if (route === '/edition/news/') assert(await np.locator('noscript').isVisible());
      report.noJavaScript.push({engine, route, passed: true});
    }
    await nojs.close();
    await browser.close();
    console.log(`PASS ${engine}: 64 responsive pages, reader journey, reduced motion, no-JS`);
  }
  assert.deepEqual(report.errors, []);
  fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log('PASS: 128 responsive checks and both complete browser journeys');
})().catch(error => { console.error(error); process.exit(1); });
