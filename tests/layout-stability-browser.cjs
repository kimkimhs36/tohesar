/* Reserve the real archive photos even when their transfer is delayed. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:19465';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.route('**/edition/assets/f40-800.webp',async route=>{await new Promise(r=>setTimeout(r,700));await route.continue()});
  await page.addInitScript(()=>{window.__layout=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__layout+=e.value}).observe({type:'layout-shift',buffered:true})});
  await page.goto(base+'/edition/archive/',{waitUntil:'load'});
  await page.waitForTimeout(1300);
  const result=await page.evaluate(()=>({cls:window.__layout,loaded:document.querySelector('.archive-cards img').naturalWidth}));
  assert.ok(result.loaded>0,'archive photo decoded');
  assert.ok(result.cls<.1,'mobile archive shifts too far as the photo loads: '+result.cls);
  console.log('PASS chromium: delayed archive image, first-screen layout shift '+result.cls.toFixed(4));
  await page.close();
  const news=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await news.route('**/edition/data/news.json',async route=>{await new Promise(r=>setTimeout(r,700));await route.continue()});
  await news.addInitScript(()=>{window.__layout=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__layout+=e.value}).observe({type:'layout-shift',buffered:true})});
  await news.goto(base+'/edition/',{waitUntil:'load'});
  await news.goto(base+'/edition/news/',{waitUntil:'load'});
  await news.waitForFunction(()=>!document.querySelector('#wire-scroller').hasAttribute('aria-busy'));
  await news.waitForTimeout(350);
  const newsCLS=await news.evaluate(()=>window.__layout);
  assert.ok(newsCLS<.1,'newsroom shifts too far as the feed loads: '+newsCLS);
  assert.ok(await news.locator('#wire-list a').count()>0,'news headlines loaded');
  console.log('PASS chromium: delayed news feed after navigation, first-screen layout shift '+newsCLS.toFixed(4));
  await news.close();
  const resumed=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await resumed.route('**/journal/assets/reading-continuity.js',async route=>{await new Promise(r=>setTimeout(r,900));await route.continue()});
  await resumed.addInitScript(()=>{
   localStorage.setItem('tohesar.reading.v1',JSON.stringify([{path:'/journal/design/giulia/',progress:.45,updated:Date.now()}]));
   window.__layout=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__layout+=e.value}).observe({type:'layout-shift',buffered:true});
  });
  await resumed.goto(base+'/journal/',{waitUntil:'load'});
  await resumed.waitForTimeout(500);
  const resumeCLS=await resumed.evaluate(()=>window.__layout);
  assert.equal(await resumed.locator('[data-journal-resume]').isVisible(),true);
  assert.ok(resumeCLS<.1,'personalized journal shifts while reader script loads: '+resumeCLS);
  console.log('PASS chromium: delayed reading history, first-screen layout shift '+resumeCLS.toFixed(4));
  await resumed.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
