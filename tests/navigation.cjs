// BASE_URL=http://127.0.0.1:8000 node tests/navigation.cjs
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://127.0.0.1:8000';
const stories = [
  {id:'f40', path:'/journal/f40/', home:'.home-feature-image', photo:'.f40-hero > img', image:'f40-'},
  {id:'giulia', path:'/journal/design/giulia/', home:'.home-pair article:nth-child(1) > a', photo:'.giulia-hero > img', image:'giulia/profile-'},
  {id:'jaguar', path:'/journal/design/type-01/', home:'.home-pair article:nth-child(2) > a', photo:'.type-hero > img', image:'type01-arrival-'}
];
const sizes = [{width:375,height:812},{width:390,height:844},{width:430,height:932},{width:1180,height:820},{width:1440,height:900}];
async function homeSignature(page) {
  assert.equal(await page.locator('.home-feature-image').count(), 1);
  assert.equal(await page.locator('.home-pair article').count(), 2);
  assert.match(await page.locator('.home-feature h2').innerText(), /바람이 지나갈/);
  assert.equal(await page.locator('.cover-passage').count(), 1);
}
async function clean(page) {
  // Cross-document View Transitions settle asynchronously; wait for actual cleanup
  // rather than assuming every WebKit/Chromium runner finishes within 650ms.
  await page.waitForFunction(() =>
    !document.querySelector('[data-cinematic-shared]') &&
    !document.querySelector('.travel-leaving,.travel-arriving'),
    null, {timeout: 4000});
  assert.equal(await page.locator('[data-cinematic-shared]').count(), 0, 'temporary names must be cleared');
  assert.equal(await page.locator('.travel-leaving,.travel-arriving').count(), 0, 'no blocked veil');
}
(async () => {
  let engines = 0;
  for (const [engine, type] of [['chromium',chromium],['webkit',webkit]]) {
    if (process.env.TEST_ENGINE && process.env.TEST_ENGINE !== engine) continue;
    let browser;
    try { browser = await type.launch(engine === 'chromium' ? {executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']} : {}); }
    catch (error) { console.log(`SKIP ${engine}: ${error.message.split('\n').find(Boolean)}`); continue; }
    engines++;
    for (const viewport of sizes.filter(size => !process.env.TEST_WIDTH || size.width === Number(process.env.TEST_WIDTH))) {
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
        if (state.native && state.story) {
          assert.equal(state.story, story.id, 'correct story selected on arrival');
          assert.equal(state.shared.filter(x => x.name === 'journal-photo').length, 1, 'one shared photograph');
          assert(state.shared.find(x => x.name === 'journal-photo').src.includes(story.image), 'only the matching story photograph is shared');
        } else {
          assert.equal(state.shared.length, 0, 'unavailable photographs safely skip sharing');
        }
        await clean(page);
        await page.locator('footer nav a[href="/"]').click();
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
    await reduced.locator('footer nav a[href="/"]').click(); await reduced.waitForURL(base + '/'); await homeSignature(reduced);
    await reduced.close();
    const nojs = await browser.newPage({viewport:sizes[1],javaScriptEnabled:false});
    await nojs.goto(base + '/');
    await nojs.locator(stories[0].home).click(); await nojs.waitForURL('**' + stories[0].path);
    await nojs.waitForTimeout(1000);
    await nojs.locator('footer nav a[href="/"]').evaluate(a => window.scrollTo({top:a.getBoundingClientRect().top + scrollY - 300, behavior:'instant'}));
    await nojs.locator('footer nav a[href="/"]').click(); await nojs.waitForURL(base + '/'); await homeSignature(nojs);
    await nojs.close();
    const keyboard = await browser.newPage({viewport:sizes[1]});
    await keyboard.goto(base + '/'); await keyboard.locator(stories[0].home).focus();
    await keyboard.keyboard.press('Enter'); await keyboard.waitForURL('**' + stories[0].path);
    await keyboard.close();
    const rapid = await browser.newPage({viewport:sizes[1]});
    await rapid.goto(base + '/');
    await rapid.locator(stories[0].home).evaluate(a => { a.click(); a.click(); });
    // The second native click may cancel the first request before committing.
    await rapid.waitForURL('**' + stories[0].path).catch(() => rapid.waitForURL('**' + stories[0].path)); await clean(rapid);
    await rapid.locator('footer nav a[href="/"]').evaluate(a => { a.click(); a.click(); });
    await rapid.emulateMedia({reducedMotion:'reduce'}); await rapid.waitForURL(base + '/').catch(() => rapid.waitForURL(base + '/')); await homeSignature(rapid);
    await rapid.close();
    console.log(`PASS ${engine}: reduced motion, JavaScript disabled, keyboard, repeated clicks`);
    await browser.close();
  }
  assert(engines > 0, 'at least one browser must run');
})().catch(error => { console.error(error); process.exit(1); });
