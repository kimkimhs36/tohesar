// Run with a local static server on :8000. Requires Playwright; no runtime dependencies.
const {chromium, webkit} = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const out = process.env.REVIEW_DIR || '/workspace/tohesar/docs/journal-005-review';
const base = process.env.BASE_URL || 'http://127.0.0.1:8000';
fs.mkdirSync(out,{recursive:true});
const results = {base,checked_at:new Date().toISOString(),browsers:[],errors:[]};
async function images(page) {
  await page.evaluate(async()=>{
    await document.fonts.ready;
    for(const img of document.images) { img.loading='eager'; }
    await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));
  });
}
async function instantScroll(page,y) {
  await page.evaluate(y=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,y)},y);
  await page.waitForTimeout(80);
}
(async()=>{
 for (const engine of ['chromium','webkit']) {
  const browser = await (engine==='chromium' ? chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}) : webkit.launch({executablePath:process.env.WEBKIT_EXECUTABLE_PATH || undefined}));
  const ctx = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const p = await ctx.newPage(); const errors=[];
  p.on('pageerror',e=>errors.push(String(e)));
  const checks=[];
  for(const width of [320,390,430,768,1440]) {
   await p.setViewportSize({width,height:width<700?844:1000});
   for(const path of ['/','/journal/','/journal/911/','/journal/f40/','/journal/news/']) {
    const r=await p.goto(base+path); assert.equal(r.status(),200);
    await images(p);
    const state = await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),h1:document.querySelectorAll('h1').length}));
    assert.equal(state.overflow,false,engine+' '+width+' '+path+' overflow');
    assert.deepEqual(state.broken,[],engine+' '+path+' broken images');
    assert.equal(state.h1,1);
    checks.push({width,path,...state});
    if(width===390&&path==='/journal/') {await p.screenshot({path:out+'/'+engine+'-journal-iphone.png'});await p.screenshot({path:out+'/'+engine+'-journal-full.png',fullPage:true});}
    if(width===390&&path==='/journal/911/')await p.screenshot({path:out+'/'+engine+'-911-iphone.png'});
    if(width===1440&&path==='/journal/')await p.screenshot({path:out+'/'+engine+'-journal-desktop.png',fullPage:true});
   }
  }
  // Full reading journey: cover -> journal -> article -> related story, then history restoration.
  await p.setViewportSize({width:390,height:844}); await p.goto(base+'/');
  await p.locator('.journal-link').click(); await p.waitForURL('**/journal/');
  await p.getByRole('link',{name:'천천히 읽어보기'}).click(); await p.waitForURL('**/journal/911/');
  await images(p);
  const g=await p.locator('.motion-sequence').evaluate(el=>({top:el.offsetTop,distance:el.offsetHeight-el.querySelector('.drive-board').offsetHeight}));
  const poses=[];
  for(const [i,progress] of [.05,.45,.95,.45].entries()) {
   await instantScroll(p,g.top+g.distance*progress);
   const state=await p.locator('.moving-mini').evaluate(el=>({transform:el.style.transform,x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,visible:el.getBoundingClientRect().bottom>0&&el.getBoundingClientRect().top<innerHeight}));
   assert.ok(state.visible,engine+' miniature outside viewport'); poses.push(state);
   if(i<3)await p.waitForTimeout(250);
   if(i<3)await p.screenshot({path:out+'/'+engine+'-motion-'+(i+1)+'.png'});
  }
  assert.ok(poses[2].x>poses[0].x+150,'car should advance along line');
  assert.equal(poses[1].transform,poses[3].transform,'reverse scroll must restore identical pose');
  // Rotation and mobile landscape fit.
  await p.setViewportSize({width:844,height:390});
  const landscape=await p.locator('.motion-sequence').evaluate(el=>({top:el.offsetTop,distance:el.offsetHeight-el.querySelector('.drive-board').offsetHeight}));
  await instantScroll(p,landscape.top+landscape.distance*.5);
  assert.ok(await p.locator('.drive-board').evaluate(el=>el.getBoundingClientRect().height<=innerHeight+2),'sticky board must fit landscape');
  await p.setViewportSize({width:390,height:844});
  await p.locator('.next-story').click();await p.waitForURL('**/journal/f40/');
  await p.goBack();await p.waitForURL('**/journal/911/');
  await p.goBack();await p.waitForURL('**/journal/');
  await p.goBack();assert.equal(new URL(p.url()).pathname,'/');
  assert.equal(await p.locator('.travel-veil').evaluate(el=>getComputedStyle(el).opacity),'0');
  // Force the unsupported-View-Transitions case; the CSS veil and ordinary URL navigation remain usable.
  await p.goto(base+'/');await p.addStyleTag({content:'@view-transition{navigation:none}'});
  await p.locator('.journal-link').click();await p.waitForURL('**/journal/');
  assert.equal(await p.locator('.travel-veil').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
  // Direct loads, refresh and filtering.
  await p.goto(base+'/journal/news/');await p.reload();
  await p.getByRole('button',{name:'디자인',exact:true}).click();
  assert.equal(await p.locator('.news-item:visible').count(),1);
  assert.match(await p.locator('.news-item:visible h3').innerText(),/Mission S/);
  await p.getByRole('button',{name:'전체',exact:true}).click();assert.equal(await p.locator('.news-item:visible').count(),3);
  // Reduced motion must remove the sticky sequence and retain readable copy & art.
  await p.emulateMedia({reducedMotion:'reduce'});await p.goto(base+'/journal/911/');await images(p);
  assert.equal(await p.locator('html').evaluate(el=>el.classList.contains('motion-enabled')),false);
  assert.equal(await p.locator('.drive-board').evaluate(el=>getComputedStyle(el).position),'static');
  assert.equal(await p.locator('.drive-captions p[aria-hidden=true]').count(),0);
  await p.locator('#miniature').scrollIntoViewIfNeeded();await p.screenshot({path:out+'/'+engine+'-reduced-motion.png'});
  assert.deepEqual(errors,[]);results.browsers.push({engine,version:browser.version(),responsive_checks:checks,poses,journey:'pass',reverse_scroll:'pass',landscape:'pass',filter:'pass',reduced_motion:'pass',errors});
  // JavaScript-off navigation still reaches actual content.
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const n=await nojs.newPage();await n.goto(base+'/');await n.locator('.journal-link').click();assert.equal(new URL(n.url()).pathname,'/journal/');await n.getByRole('link',{name:'천천히 읽어보기'}).click();assert.equal(new URL(n.url()).pathname,'/journal/911/');await nojs.close();
  await ctx.close();await browser.close();
 }
 fs.writeFileSync(out+'/browser-results.json',JSON.stringify(results,null,2)+'\n');
 console.log('PASS: Chromium + WebKit, 50 responsive page checks, full journey, history, reverse scrolling, rotation, filtering, reduced motion, no-JS navigation.');
})().catch(e=>{console.error(e);fs.writeFileSync(out+'/failure.txt',String(e));process.exitCode=1});
