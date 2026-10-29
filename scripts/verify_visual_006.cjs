// Focused release checks. Requires Playwright, Chromium and WebKit; no website dependencies.
const {chromium, webkit}=require('playwright');
const fs=require('node:fs'), assert=require('node:assert/strict');
const base=process.env.BASE_URL || 'http://127.0.0.1:8000';
const out=process.env.REVIEW_DIR || 'docs/visual-006-review';
fs.mkdirSync(out,{recursive:true});
const result={base,checked_at:new Date().toISOString(),real_iphone_tested:false,browsers:[]};
async function ready(p){await p.evaluate(async()=>{await document.fonts.ready;for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));document.documentElement.style.scrollBehavior='auto'});}
async function scroll(p,y){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(200);}
async function pose(p,selector,fraction){const g=await p.locator(selector).evaluate(el=>({top:el.offsetTop,d:el.offsetHeight-el.querySelector('[data-scene-board],.drive-board').offsetHeight}));await scroll(p,g.top+g.d*fraction);await p.waitForFunction(({selector,fraction})=>Math.abs(Number(document.querySelector(selector).dataset.progress)-fraction)<.015,{selector,fraction},{timeout:5000});return p.locator(selector).evaluate(el=>({progress:el.dataset.progress,transforms:[...el.querySelectorAll('[data-car],.air-car,.moving-mini')].map(c=>c.style.transform)}));}
(async()=>{
 for(const name of (process.env.BROWSERS||'chromium,webkit').split(',')){
  const browser=await (name==='chromium'?chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}):webkit.launch({executablePath:process.env.WEBKIT_EXECUTABLE_PATH||undefined}));
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const p=await context.newPage(),errors=[],checks=[];p.on('pageerror',e=>errors.push(String(e)));
  for(const route of ['/','/journal/','/journal/911/','/journal/f40/','/journal/news/','/journal/visual/','/journal/miniatures/']){
   assert.equal((await p.goto(base+route)).status(),200);await ready(p);
   const state=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,broken:[...document.images].filter(i=>i.getAttribute('src')&&!i.naturalWidth).map(i=>i.src)}));
   assert.equal(state.overflow,false,route+' overflow');assert.deepEqual(state.broken,[],route+' broken images');
   checks.push({route,width:390,...state});
   if(['/journal/','/journal/visual/','/journal/miniatures/'].includes(route))await p.screenshot({path:`${out}/${name}-${route.split('/')[2]||'journal'}-iphone.png`});
   if(route==='/journal/visual/'){
    await p.locator('#sequence').evaluate(el=>scrollTo(0,el.offsetTop+350));await p.waitForTimeout(80);await p.screenshot({path:`${out}/${name}-visual-sequence-iphone.png`});
    await p.locator('[data-enlarge]').first().click();assert.equal(await p.locator('dialog').evaluate(el=>el.open),true);await p.keyboard.press('Escape');assert.equal(await p.locator('dialog').evaluate(el=>el.open),false);
   }
   if(['/journal/911/','/journal/f40/','/journal/visual/','/journal/miniatures/'].includes(route)){
    const sel=route==='/journal/911/'?'.motion-sequence':route==='/journal/f40/'?'.air-sequence':'.collection-sequence';
    const first=await pose(p,sel,.05),middle=await pose(p,sel,.5),last=await pose(p,sel,.95),back=await pose(p,sel,.5);
    assert.notDeepEqual(first.transforms,last.transforms,route+' must move');assert.deepEqual(middle.transforms,back.transforms,route+' reverse must restore pose');
    const board=await p.locator(sel+' [data-scene-board],'+sel+' .drive-board').boundingBox();assert.ok(board.height<=844+2,route+' board must fit');
    await p.screenshot({path:`${out}/${name}-${route.split('/')[2]}-motion-iphone.png`});
    if(route==='/journal/f40/'){
     await p.setViewportSize({width:844,height:390});await p.waitForTimeout(80);assert.equal(await p.locator(sel).evaluate(el=>el.classList.contains('scene-enabled')),false);
     await p.setViewportSize({width:390,height:844});
    }
   }
  }
  // Native history/menu destinations, direct hash load and reload.
  await p.goto(base+'/journal/');await p.locator('summary').click();await p.locator('.journal-index a[href="/journal/visual/"]').click();await p.waitForURL('**/journal/visual/');
  await ready(p);await p.reload();await ready(p);assert.equal(new URL(p.url()).pathname,'/journal/visual/');
  await p.locator('summary').click();await p.locator('.journal-index a[href="/journal/miniatures/"]').click();await p.waitForURL('**/journal/miniatures/');
  await p.goBack();await p.waitForURL('**/journal/visual/');await p.goBack();await p.waitForURL('**/journal/');
  await p.goto(base+'/journal/f40/#air-study');await ready(p);await p.locator('#air-study').scrollIntoViewIfNeeded();
  // Archive matches data, filters remain functional.
  await p.goto(base+'/journal/news/');const newsData=JSON.parse(fs.readFileSync('journal/data/news.json')).items.filter(i=>i.status==='published');assert.equal(await p.locator('.news-item').count(),newsData.length);await p.locator('[data-filter="culture"]').click();assert.equal(await p.locator('.news-item:visible').count(),newsData.filter(i=>i.topic==='culture').length);
  // Short phone, narrow phone and desktop layouts for the new spaces only.
  for(const size of [{width:320,height:667},{width:1440,height:1000}]){
   await p.setViewportSize(size);
   for(const route of ['/journal/visual/','/journal/miniatures/']){
    await p.goto(base+route);await ready(p);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false,route+' responsive overflow');
    const plate=await p.locator('.collection-sequence').evaluate(el=>({enabled:el.classList.contains('scene-enabled'),h:el.querySelector('[data-scene-board]').offsetHeight}));
    assert.ok(!plate.enabled||plate.h<=size.height+2);
    if(size.width===1440){await p.screenshot({path:`${out}/${name}-${route.split('/')[2]}-desktop.png`});await pose(p,'.collection-sequence',.5);await p.screenshot({path:`${out}/${name}-collection-desktop.png`});}
    checks.push({route,...size,plate});
   }
  }
  await p.setViewportSize({width:390,height:844});await p.emulateMedia({reducedMotion:'reduce'});
  for(const route of ['/journal/f40/','/journal/visual/']){
   await p.goto(base+route);await ready(p);assert.equal(await p.locator('.scene-enabled').count(),0);
   if(route.includes('f40'))assert.equal(await p.locator('[data-scene-caption]:visible').count(),3);
   await p.locator('[data-scroll-scene]').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${name}-${route.split('/')[2]}-reduced.png`});
  }
  // Ordinary links, static artwork and all captions work with scripts disabled.
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const n=await nojs.newPage();
  await n.goto(base+'/journal/f40/');assert.equal(await n.locator('[data-scene-caption]:visible').count(),3);await n.locator('summary').click();await n.locator('.journal-index a[href="/journal/visual/"]').click();assert.equal(new URL(n.url()).pathname,'/journal/visual/');await nojs.close();
  assert.deepEqual(errors,[]);result.browsers.push({name,checks,reverse_scroll:true,history_menu_reload:true,reduced_motion:true,no_js:true,errors});
  await browser.close();
 }
 // Cover and protected sources remain byte-for-byte identical to 005.
 const {execFileSync}=require('node:child_process');
 const preserved=['index.html','styles.css','motion.css','motion.js','assets','creative/cover-art-max-004','journal/yokohama','journal/legacy-004','creative/journal-world-005','journal/assets/miniature-coupe.webp','journal/assets/miniature-motion.js'];
 assert.equal(execFileSync('git',['diff','acbb362e19661fb3333b160c936271aa5cec46d7','--',...preserved],{maxBuffer:1024*1024}).length,0);
 result.preserved=preserved;if(fs.existsSync(out+'/checks.json')){const old=JSON.parse(fs.readFileSync(out+'/checks.json'));result.browsers=[...old.browsers.filter(b=>!result.browsers.some(n=>n.name===b.name)),...result.browsers];}fs.writeFileSync(out+'/checks.json',JSON.stringify(result,null,2));console.log('PASS: two browser engines, 22 focused route/viewport checks, editorial motion, history, reduced motion, no-JS, source preservation.');
})().catch(e=>{console.error(e);process.exitCode=1});
