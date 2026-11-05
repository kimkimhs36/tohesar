// Local browser regression: BASE_URL=http://127.0.0.1:8767 node tests/journal-journey.cjs
'use strict';
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:8767';
const routes = ['/', '/journal/', '/journal/911/', '/journal/f40/', '/journal/design/giulia/', '/journal/design/type-01/', '/owner-stories/', '/owner-stories/story-card/'];
(async () => {
 const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
 try {
  for (const width of [320,390,768,1024]) {
   const page = await browser.newPage({viewport:{width,height:850}, reducedMotion:'reduce'});
   const errors=[]; page.on('pageerror', e=>errors.push(e.message));
   await page.route('**/*', r=>r.request().url().startsWith(base) ? r.continue() : r.abort());
   for (const path of routes) {
    await page.goto(base+path, {waitUntil:'domcontentloaded'});
    if(path==='/') await page.locator('.journal-flow > .site-header').scrollIntoViewIfNeeded();
    const header=page.locator(path.startsWith('/owner-stories/') ? '.owner-header' : '.site-header').first();
    const logo=header.locator(':scope > a').first();
    const links=header.locator('.site-shortcuts a');
    const menu=header.locator('summary');
    assert.equal(await links.count(),2,`${path}: two visible destinations`);
    assert.deepEqual(await links.evaluateAll(es=>es.map(e=>e.getAttribute('href'))),['/journal/','/owner-stories/']);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${path}: no overflow at ${width}`);
    const boxes=await Promise.all([logo.boundingBox(),links.nth(0).boundingBox(),links.nth(1).boundingBox(),menu.boundingBox()]);
    assert(boxes.every(Boolean),`${path}: header controls visible`);
    for (let i=0;i<boxes.length-1;i++) assert(boxes[i].x+boxes[i].width<=boxes[i+1].x+1,`${path}: header controls overlap at ${width}`);
    for (const box of boxes.slice(1,3)) assert(box.width>=44 && box.height>=44,`${path}: shortcut touch target at ${width}`);
    await menu.click();
    assert(await header.locator('details nav a[href="/owner-stories/"]').isVisible(),`${path}: owner stories in index`);
    await menu.click();
   }
   assert.deepEqual(errors,[],`no page errors at ${width}`);
   console.log(`PASS ${width}px: header, menus, controls, overflow across eight routes`);
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:850},reducedMotion:'reduce'});
  const journeyErrors=[];page.on('pageerror',e=>journeyErrors.push({url:page.url(),message:e.message}));
  await page.route('**/*', r=>r.request().url().startsWith(base) ? r.continue() : r.abort());
  for (const path of ['/journal/explore/','/journal/yokohama/','/journal/design/','/journal/miniatures/','/journal/issues/','/edition/','/sitemap/']) {
   await page.goto(base+path,{waitUntil:'domcontentloaded'});
   const menu=page.locator('.journal-index');await menu.locator('summary').click();
   assert(await menu.locator('nav a[href="/owner-stories/"]').isVisible(),`${path}: owner access in the shared index`);
  }
  await page.goto(base+'/');
  const cover=await page.locator('.photograph img').getAttribute('src');
  const homeF40=await page.locator('.home-feature-image img').getAttribute('src');
  const homeGiulia=await page.locator('.home-pair article:first-child img').getAttribute('src');
  const homeJaguar=await page.locator('.home-pair article:nth-child(2) img').getAttribute('src');
  await page.locator('.home-guide a[href="/journal/"]').click(); await page.waitForURL('**/journal/');
  const index911=await page.locator('.featured img').getAttribute('src');
  const indexF40=await page.locator('.design-large img').getAttribute('src');
  const indexGiulia=await page.locator('.design-small img').getAttribute('src');
  const indexJaguar=await page.locator('.atlas-invite-photo img').getAttribute('src');
  for(const sel of ['.featured img','.design-large img','.design-small img']) {
   const img=page.locator(sel);await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());
   assert(await img.evaluate(el=>el.naturalWidth>0),`${sel} loads`);
  }
  await page.locator('.featured a[href="/journal/911/"]').first().click();await page.waitForURL('**/journal/911/');
  const story911=await page.locator('.story-hero img').getAttribute('src');
  assert.equal(new Set([cover,index911,story911]).size,3,'911 cover, journal and story use distinct photos');
  await page.locator('.site-shortcuts a[href="/owner-stories/"]').click();await page.waitForURL('**/owner-stories/');
  await page.locator('.site-shortcuts a[href="/journal/"]').click();await page.waitForURL('**/journal/');
  await page.locator('.design-large a[href="/journal/f40/"]').first().click();await page.waitForURL('**/journal/f40/');
  const storyF40=await page.locator('.f40-hero img').getAttribute('src');
  assert.equal(new Set([homeF40,indexF40,storyF40]).size,3,'F40 home, journal and story use distinct photos');
  assert.notEqual(homeGiulia,indexGiulia,'Giulia home and journal use distinct photos');
  await page.goto(base+'/journal/design/type-01/');
  const storyJaguar=await page.locator('.type-hero img').getAttribute('src');
  assert.equal(new Set([homeJaguar,indexJaguar,storyJaguar]).size,3,'Jaguar home, journal and story use distinct photos');
  await page.locator('.site-header > a').first().click();await page.waitForURL(base+'/');
  await page.waitForTimeout(500);
  assert.deepEqual(journeyErrors,[],'no uncaught errors during cross-page transitions');
  console.log('PASS home → journal → story → owner → journal → story → cover; distinct photographs');
  await page.close();
  const animated=await browser.newPage({viewport:{width:390,height:850},reducedMotion:'no-preference'});
  const transitionErrors=[];animated.on('pageerror',e=>transitionErrors.push(e.message));
  await animated.route('**/*', r=>r.request().url().startsWith(base) ? r.continue() : r.abort());
  await animated.goto(base+'/journal/');await animated.locator('.featured a[href="/journal/911/"]').first().click();await animated.waitForURL('**/journal/911/');
  await animated.locator('.site-shortcuts a[href="/owner-stories/"]').click();await animated.waitForURL('**/owner-stories/');
  await animated.waitForTimeout(500);assert.deepEqual(transitionErrors,[],'animated page transitions must not reject');
  await animated.close();console.log('PASS animated journal → article → owner transitions');
  const nojs=await browser.newPage({viewport:{width:390,height:850},javaScriptEnabled:false});
  await nojs.route('**/*', r=>r.request().url().startsWith(base) ? r.continue() : r.abort());
  await nojs.goto(base+'/journal/');await nojs.locator('.site-shortcuts a[href="/owner-stories/"]').click();await nojs.waitForURL('**/owner-stories/');
  // Wait for the browser's cross-document visual transition to finish.
  await nojs.waitForTimeout(1000);
  await nojs.locator('.site-shortcuts a[href="/journal/"]').click();await nojs.waitForURL('**/journal/');
  await nojs.close();console.log('PASS navigation with JavaScript disabled');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
