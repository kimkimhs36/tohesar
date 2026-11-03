// BASE_URL=http://127.0.0.1:8000 node tests/navigation.cjs
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://127.0.0.1:8000';
const stories = [
  {id:'f40', path:'/journal/f40/', home:'.home-feature-image', photo:'.f40-hero > img'},
  {id:'giulia', path:'/journal/design/giulia/', home:'.home-pair article:nth-child(1) > a', photo:'.giulia-hero > img'},
  {id:'jaguar', path:'/journal/design/type-01/', home:'.home-pair article:nth-child(2) > a', photo:'.type-hero > img'}
];
const sizes = [{width:375,height:812},{width:390,height:844},{width:430,height:932},{width:1180,height:820},{width:1440,height:900}];
async function homeSignature(page) {
  assert.equal(await page.locator('.home-feature-image').count(), 1);
  assert.equal(await page.locator('.home-pair article').count(), 2);
  assert.match(await page.locator('.home-feature h2').innerText(), /바람이 지나갈/);
  assert.equal(await page.locator('.cover-passage').count(), 1);
}
async function clean(page) {
  await page.waitForTimeout(650);
  assert.equal(await page.locator('[data-cinematic-shared]').count(), 0, 'temporary names must be cleared');
  assert.equal(await page.locator('.travel-leaving,.travel-arriving').count(), 0, 'no blocked veil');
}
(async () => {
  let engines = 0;
  for (const [engine, type] of [['chromium',chromium],['webkit',webkit]]) {
    let browser;
    try { browser = await type.launch(engine === 'chromium' ? {executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']} : {}); }
    catch (error) { console.log(`SKIP ${engine}: ${error.message.split('\n').find(Boolean)}`); continue; }
    engines++;
    for (const viewport of sizes) {
      const page = await browser.newPage({viewport});
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => {
        addEventListener('pageshow', () => {
          window.__cinematicAtShow = {
            native: 'onpageswap' in window && 'onpagereveal' in window,
            story: document.documentElement.dataset.cinematic || null,
            shared: [...document.querySelectorAll('[data-cinematic-shared]')].map(el => ({tag:el.tagName, name:el.style.viewTransitionName, src:el.currentSrc || ''}))
          };
        });
      });
      for (const story of stories) {
        await page.goto(base + '/');
        await homeSignature(page);
        await page.locator(story.home).scrollIntoViewIfNeeded();
        await page.locator(story.home + ' img').evaluate(img => img.decode());
        await page.locator(story.home).click();
        await page.waitForURL('**' + story.path);
        const state = await page.evaluate(() => window.__cinematicAtShow);
        if (engine === 'chromium' && state.native && state.story) {
          assert.equal(state.story, story.id, 'correct story selected on arrival');
          assert.equal(state.shared.filter(x => x.name === 'journal-photo').length, 1, 'one shared photograph');
          assert.equal(await page.locator(story.photo).getAttribute('data-cinematic-shared'), '');
        } else {
          assert.equal(state.shared.length, 0, 'unavailable photographs safely skip sharing');
        }
        await clean(page);
        await page.locator('.article-return026 a[href="/"]').click();
        await page.waitForURL(base + '/');
        await clean(page); await homeSignature(page);
        await page.goBack(); await page.waitForURL('**' + story.path); await clean(page);
        await page.goForward(); await page.waitForURL(base + '/'); await clean(page); await homeSignature(page);
        await page.reload(); await homeSignature(page);
      }
      assert.deepEqual(errors, [], 'no uncaught page errors');
      console.log(`PASS ${engine} ${viewport.width}x${viewport.height}: all three stories, home, back, forward, reload`);
      await page.close();
    }
    const reduced = await browser.newPage({viewport:sizes[1],reducedMotion:'reduce'});
    await reduced.goto(base + '/');
    await reduced.locator(stories[0].home).click(); await reduced.waitForURL('**' + stories[0].path);
    assert.equal(await reduced.locator('[data-cinematic-shared]').count(), 0);
    await reduced.locator('.article-return026 a').click(); await reduced.waitForURL(base + '/'); await homeSignature(reduced);
    await reduced.close();
    const nojs = await browser.newPage({viewport:sizes[1],javaScriptEnabled:false});
    await nojs.goto(base + '/');
    await nojs.locator(stories[0].home).click(); await nojs.waitForURL('**' + stories[0].path);
    await nojs.locator('.article-return026 a').evaluate(a => window.scrollTo({top:a.getBoundingClientRect().top + scrollY - 300, behavior:'instant'}));
    await nojs.locator('.article-return026 a').click(); await nojs.waitForURL(base + '/'); await homeSignature(nojs);
    await nojs.close();
    const keyboard = await browser.newPage({viewport:sizes[1]});
    await keyboard.goto(base + '/'); await keyboard.locator(stories[0].home).focus();
    await keyboard.keyboard.press('Enter'); await keyboard.waitForURL('**' + stories[0].path);
    await keyboard.close();
    const rapid = await browser.newPage({viewport:sizes[1]});
    await rapid.goto(base + '/');
    await rapid.locator(stories[0].home).evaluate(a => { a.click(); a.click(); });
    await rapid.waitForURL('**' + stories[0].path); await clean(rapid);
    await rapid.locator('.article-return026 a').evaluate(a => { a.click(); a.click(); });
    await rapid.emulateMedia({reducedMotion:'reduce'}); await rapid.waitForURL(base + '/'); await homeSignature(rapid);
    await rapid.close();
    console.log(`PASS ${engine}: reduced motion, JavaScript disabled, keyboard, repeated clicks`);
    await browser.close();
  }
  assert(engines > 0, 'at least one browser must run');
})().catch(error => { console.error(error); process.exit(1); });
