// Browser-engine checks; a physical iPhone/Safari remains a separate test.
const {chromium, webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
(async()=>{
 const engine=process.env.ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch(process.env.ENGINE==='webkit'?{}:{executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const routes=['/journal/','/journal/issues/001/','/edition/archive/','/edition/','/journal/design/type-01/'];
 for(const viewport of [{width:375,height:812},{width:390,height:844},{width:430,height:932},{width:1180,height:820}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const url of routes){
   await page.goto(base+url,{waitUntil:'domcontentloaded'});await page.waitForTimeout(120);
   const check=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,heading:!!document.querySelector('h1'),hidden:!!document.querySelector('.thz-icons030.is-visible')}));
   assert(check.overflow<=1,`${url} ${viewport.width}: overflow ${check.overflow}`);assert(check.heading,`${url}: heading missing`);assert(!check.hidden,'reduced motion');
  }
  await page.goto(base+'/journal/design/type-01/');
  const story=await page.evaluate(()=>({
   final:document.querySelector('.type-conclusion').lastElementChild.className,
   arrivals:document.querySelectorAll('article img[src*="type01-arrival-"]').length,
   figures:[...document.querySelectorAll('article figure img')].map(i=>i.getAttribute('src')),
   body:getComputedStyle(document.querySelector('.type-lead p')).fontSize,
   ghost:getComputedStyle(document.querySelector('.type-lead'),'::before').display,
   heroRatio:(()=>{const r=document.querySelector('.type-hero img').getBoundingClientRect();return r.width/r.height})(),
   cropNotice:document.querySelector('.type-hero-foot small').innerText.includes('모바일 화면 크롭'),
   sticky:[...document.querySelectorAll('article section, article figure')].some(e=>getComputedStyle(e).position==='sticky')
  }));
  assert.equal(story.final,'type-closing-photo');assert.equal(story.arrivals,1);assert.equal(story.figures.length,5);assert(!story.sticky);assert.equal(story.ghost,'none');assert(story.cropNotice);if(viewport.width<700) assert(story.heroRatio<1.1 && story.heroRatio>1);assert.equal(story.body,viewport.width===1180?'17px':'16.5px');
  assert.deepEqual(errors,[]);await page.close();console.log('PASS routes and Jaguar sequence',viewport.width);
 }
 const p=await browser.newPage({viewport:{width:390,height:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.__thzIcons030Test={delay:0,speed:5}});
 await p.goto(base+'/journal/');await p.waitForSelector('.thz-icons030.is-visible');
 await p.waitForFunction(()=>document.querySelectorAll('.thz-icons030-track').length>=2,null,{timeout:20000});
 const before=await p.evaluate(()=>({model:document.querySelector('.thz-icons030-current').getAttribute('src'),marks:document.querySelectorAll('.thz-icons030-track').length}));
 await p.locator('.atlas-invite-photo').click();await p.waitForURL('**/journal/design/type-01/');await p.waitForSelector('.thz-icons030.is-visible');
 assert.equal(await p.locator('.thz-icons030-current').getAttribute('src'),before.model);assert((await p.locator('.thz-icons030-track').count())>=before.marks);
 await p.goBack();await p.waitForURL('**/journal/');await p.waitForSelector('.thz-icons030.is-visible');assert.equal(await p.locator('.thz-icons030-current').getAttribute('src'),before.model);assert((await p.locator('.thz-icons030-track').count())>=before.marks);
 await p.reload();await p.waitForSelector('.thz-icons030.is-visible');assert.equal(await p.locator('.thz-icons030-current').getAttribute('src'),before.model);assert((await p.locator('.thz-icons030-track').count())>=before.marks);
 assert.equal(await p.locator('.thz-icons030-car').evaluate(e=>getComputedStyle(e).touchAction),'pan-y');
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);assert.equal(await p.locator('.thz-icons030.is-visible').count(),0);assert.deepEqual(errors,[]);
 await p.close();await browser.close();console.log('PASS native navigation, back, reload, traces, reduced motion');
})().catch(e=>{console.error(e);process.exit(1)});
