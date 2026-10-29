// Focused behaviour and rendering verification; no runtime website dependencies.
const {chromium,webkit}=require('playwright');
const fs=require('node:fs'), assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:8000',out=process.env.REVIEW_DIR||'docs/design-007-review';
fs.mkdirSync(out,{recursive:true});
const result={base,checked_at:new Date().toISOString(),real_iphone_tested:false,browsers:[]};
async function ready(p){await p.evaluate(async()=>{for(const i of document.images)i.loading='eager';await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));document.documentElement.style.scrollBehavior='auto'});await p.waitForTimeout(80)}
async function inspect(p){const s=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,broken:[...document.images].filter(i=>i.getAttribute('src')&&!i.naturalWidth).map(i=>i.src)}));assert.equal(s.overflow,false,p.url()+' overflow');assert.deepEqual(s.broken,[],p.url()+' image');return s}
async function pose(p,f){const g=await p.locator('[data-design-study]').evaluate(e=>({top:e.getBoundingClientRect().top+scrollY,d:e.offsetHeight-e.querySelector('.study-board').offsetHeight}));await p.evaluate(({g,f})=>scrollTo(0,g.top+g.d*f),{g,f});await p.waitForFunction(f=>Math.abs(Number(document.querySelector('[data-design-study]').dataset.progress)-f)<.002,f);return p.locator('[data-design-study]').evaluate(e=>({p:e.dataset.progress,focus:e.dataset.focus,width:e.style.getPropertyValue('--inspection-width'),shift:e.style.getPropertyValue('--study-shift')}))}
(async()=>{
 for(const name of (process.env.BROWSERS||'chromium,webkit').split(',')){
  const browser=await (name==='chromium'?chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}):webkit.launch({executablePath:process.env.WEBKIT_EXECUTABLE_PATH||undefined}));
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}),p=await ctx.newPage(),errors=[],checks=[];
  p.on('pageerror',e=>errors.push(String(e)));
  for(const route of ['/','/journal/','/journal/911/','/journal/f40/','/journal/news/','/journal/visual/','/journal/miniatures/','/journal/design/','/journal/design/type-01/']){
   assert.equal((await p.goto(base+route)).status(),200);await ready(p);checks.push({route,width:390,...await inspect(p)});
   if(['/journal/','/journal/design/','/journal/design/type-01/'].includes(route))await p.screenshot({path:`${out}/${name}-${route.includes('type-01')?'type01':route.includes('design')?'atlas':'journal'}-iphone.png`});
  }
  await p.goto(base+'/journal/design/');await ready(p);
  const index=await p.locator('#discovery-index').evaluate(e=>JSON.parse(e.textContent));assert.equal(index.length,11);
  for(const f of ['curves','wedge-edge','grand-touring','new-language']){
   await p.locator(`[data-form="${f}"]`).click();assert.equal(await p.locator('.discovery-card:visible').count(),index.filter(i=>i.forms.includes(f)).length);assert.equal(new URL(p.url()).searchParams.get('form'),f);
  }
  await p.locator('[data-form=all]').click();
  for(const [q,id] of [['Porsche','porsche-911'],['Ferrari','ferrari-f40'],['Jaguar','jaguar-type-01'],['911','porsche-911'],['F40','ferrari-f40'],['Type 01','jaguar-type-01'],['곡선','porsche-911'],['GT','jaguar-type-01']]){
   await p.locator('#design-query').fill(q);await p.locator('#design-query').press('Enter');assert.equal(await p.locator(`[data-content-id="${id}"]`).isVisible(),true,q);assert.equal(new URL(p.url()).searchParams.get('q'),q);
  }
  await p.locator('#design-query').fill('존재하지않는모델zz');await p.locator('#design-query').press('Enter');assert.equal(await p.locator('.discovery-card:visible').count(),0);assert.equal(await p.locator('#design-empty').isVisible(),true);
  await p.locator('[data-reset]').click();assert.equal(await p.locator('.discovery-card:visible').count(),11);
  await p.goto(base+'/journal/design/?q=Type+01&form=grand-touring#explore');assert.equal(await p.locator('[data-content-id=jaguar-type-01]').isVisible(),true);await p.reload();assert.equal(await p.locator('#design-query').inputValue(),'Type 01');
  await p.locator('[data-form=curves]').click();assert.equal(await p.locator('#design-empty').isVisible(),true);await p.goBack();assert.equal(await p.locator('[data-form=grand-touring]').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('[data-content-id=jaguar-type-01]').isVisible(),true);
  await p.goto(base+'/journal/design/type-01/#design-study');await ready(p);await p.reload();await ready(p);
  const first=await pose(p,.05),mid=await pose(p,.5),last=await pose(p,.95),back=await pose(p,.5);assert.equal(first.focus,'bonnet');assert.equal(mid.focus,'cabin');assert.equal(last.focus,'whole');assert.deepEqual(mid,back);
  await p.screenshot({path:`${out}/${name}-study-iphone.png`});
  await p.locator('[data-study-go="0.95"]').click();await p.waitForFunction(()=>document.querySelector('[data-design-study]').dataset.focus==='whole');
  const board=await p.locator('.study-board').boundingBox(),controls=await p.locator('.study-controls').boundingBox();assert.ok(controls.y>=board.y&&controls.y+controls.height<=board.y+board.height+1);
  await p.locator('#comparison').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${name}-comparison-iphone.png`});
  // Narrow, wide phones and desktop on the two new routes; landscape gets a static study.
  for(const size of [{width:320,height:667},{width:430,height:932},{width:1440,height:1000},{width:844,height:390}]){
   await p.setViewportSize(size);
   for(const route of ['/journal/design/','/journal/design/type-01/']){
    await p.goto(base+route);await ready(p);checks.push({route,...size,...await inspect(p)});
    if(size.width===1440)await p.screenshot({path:`${out}/${name}-${route.includes('type-01')?'type01':'atlas'}-desktop.png`});
    if(route.includes('type-01')&&size.width===844)assert.equal(await p.locator('.study-enabled').count(),0);
   }
  }
  await p.setViewportSize({width:390,height:844});await p.emulateMedia({reducedMotion:'reduce'});await p.goto(base+'/journal/design/type-01/#design-study');await ready(p);assert.equal(await p.locator('.study-enabled').count(),0);assert.equal(await p.locator('[data-study-caption]:visible').count(),3);await p.locator('[data-design-study]').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${name}-reduced-iphone.png`});
  await p.emulateMedia({reducedMotion:'no-preference'});
  // Real journal/menu journey, with browser history and original discovery paths.
  await p.goto(base+'/');await p.locator('a[href="/journal/"]').first().click();await p.waitForURL('**/journal/');await p.locator('summary').click();await p.locator('.journal-index a[href="/journal/design/"]').click();await p.waitForURL('**/journal/design/');await p.locator('.atlas-feature-copy a').first().click();await p.waitForURL('**/journal/design/type-01/');await p.locator('.type-related a[href="/journal/911/"]').click();await p.waitForURL('**/journal/911/');await p.goBack();await p.waitForURL('**/journal/design/type-01/');await p.goBack();await p.waitForURL('**/journal/design/');
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),n=await nojs.newPage();await n.goto(base+'/journal/design/');assert.equal(await n.locator('.discovery-card:visible').count(),11);await n.locator('.atlas-feature-copy a').first().click();assert.equal(new URL(n.url()).pathname,'/journal/design/type-01/');assert.equal(await n.locator('[data-study-caption]:visible').count(),3);await n.locator('summary').click();await n.locator('.journal-index a[href="/journal/design/"]').click();assert.equal(new URL(n.url()).pathname,'/journal/design/');await nojs.close();
  assert.deepEqual(errors,[]);result.browsers.push({name,checks,errors,search_and_filters:'passed',history_and_direct_reload:'passed',motion:{first,mid,last,back},reduced_and_nojs:'passed',journey:'passed'});await browser.close();console.log(name+' PASS');
 }
 fs.writeFileSync(out+'/checks.json',JSON.stringify(result,null,2)+'\n');
})().catch(e=>{console.error(e);process.exit(1)});
