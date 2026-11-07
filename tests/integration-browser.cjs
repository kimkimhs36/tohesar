/* Local browser integration: no accounts, uploads or external requests. */
'use strict';
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.BASE_URL||'http://127.0.0.1:19465';
const output=process.env.SCREENSHOT_DIR||path.resolve('artifacts/integration');
fs.mkdirSync(output,{recursive:true});
const routes=[['home','/'],['journal','/journal/'],['field-notes','/journal/field-notes/001/'],['owner','/owner-stories/'],['story-card','/owner-stories/story-card/'],['explore','/journal/explore/'],['design','/journal/design/'],['archive','/edition/archive/']];
const widths=[320,390,768,1024,1440];
async function run(name,engine){
 const browser=await engine.launch(name==='chromium'?{executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']}:{});
 let count=0;
 try{
  for(const width of widths){
   const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1,reducedMotion:'reduce',hasTouch:width<768});
   const errors=[],bad=[];page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.url().startsWith(base+'/')&&r.status()>=400)bad.push(r.status()+' '+r.url())});
   await page.addInitScript(()=>{window.__cls=0;try{new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true})}catch(_){}});
   for(const [label,route] of routes){
    const r=await page.goto(base+route,{waitUntil:'load',timeout:30000});
    assert.equal(r.status(),200,name+' '+width+' '+route);
    const metrics=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,cls:window.__cls||0,title:document.title}));
    if(metrics.scroll>metrics.width+2){
      const details=await page.evaluate(()=>[...document.querySelectorAll('body *')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,cls:String(e.className).slice(0,80),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)}}).filter(x=>x.right>innerWidth+2).slice(0,12));
      console.error('Overflow elements',JSON.stringify(details));
    }
    assert.ok(metrics.scroll<=metrics.width+2,name+' '+width+' '+route+' overflow '+JSON.stringify(metrics));
    assert.ok(metrics.title,name+' '+route+' missing title');
    assert.ok(await page.locator('main h1').count()>=1,name+' '+route+' missing main heading');
    if(width===390||width===1440&&['journal','field-notes','archive'].includes(label)){
      await page.screenshot({path:path.join(output,name+'-'+label+'-'+width+'.png'),animations:'disabled'});
    }
    count++;
   }
   assert.deepEqual(errors,[],name+' '+width+' script errors');
   assert.deepEqual(bad,[],name+' '+width+' failed local assets');
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await page.goto(base+'/journal/');
  const menu=page.locator('.journal-index summary');await menu.focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('.journal-index').evaluate(e=>e.open),true,'keyboard opens journal navigation');
  assert.ok(await page.getByRole('link',{name:/차주의 이야기/}).count()>0);
  await page.goto(base+'/edition/archive/?q=F-40&topic=history');
  assert.equal(await page.locator('[data-archive-item]:visible').count(),1,'normalized URL search and topic');
  assert.match(await page.locator('#archive-count').innerText(),/1편/);
  await page.locator('#archive-query').fill('Alfa Romeo');await page.locator('#archive-topic').selectOption('all');
  assert.equal(await page.locator('[data-archive-item]:visible').count(),1,'multiword search');
  await page.locator('#archive-topic').selectOption('porsche');
  assert.equal(await page.locator('#archive-empty').isVisible(),true,'empty state');
  await page.locator('#archive-reset').click();
  assert.equal(await page.locator('[data-archive-item]:visible').count(),5,'reset restores all stories');
  assert.equal(new URL(page.url()).search,'','reset clears shareable URL');
  assert.equal(await page.locator('#archive-query').evaluate(e=>document.activeElement===e),true,'reset returns keyboard focus');
  await page.goto(base+'/journal/design/');
  await page.locator('#design-query').fill('F40');
  assert.equal(await page.locator('[data-content-id]:visible').count(),1,'design discovery search');
  await page.locator('#design-query').fill('없는자동차123');
  assert.equal(await page.locator('#design-empty').isVisible(),true);
  await page.locator('[data-reset]').click();
  assert.equal(await page.locator('[data-content-id]:visible').count(),7,'design discovery reset');
  await page.close();
  const nojs=await browser.newPage({javaScriptEnabled:false});
  await nojs.goto(base+'/edition/archive/');
  assert.equal(await nojs.locator('.archive-controls').isHidden(),true);
  assert.equal(await nojs.locator('[data-archive-item]:visible').count(),5,'static archive works without JS');
  await nojs.goto(base+'/journal/field-notes/001/');
  assert.equal(await nojs.locator('[data-chapter]').count(),3);
  await nojs.close();
  const card=await browser.newPage({viewport:{width:390,height:844}});
  await card.addInitScript(()=>{Object.defineProperty(navigator,'canShare',{value:()=>true});Object.defineProperty(navigator,'share',{value:async data=>{window.__shared={count:data.files.length,type:data.files[0].type,size:data.files[0].size}}})});
  await card.goto(base+'/owner-stories/story-card/');
  await card.locator('#car-photo').setInputFiles(path.join(__dirname,'..','journal','assets','editorial-fresh','911-journal-abhinand-800.webp'));
  await card.waitForFunction(()=>document.querySelector('#card-status').textContent.includes('불러왔어요'));
  const downloadPromise=card.waitForEvent('download');await card.locator('#save').click();const download=await downloadPromise;
  assert.equal(download.suggestedFilename(),'TOHESAR-OWNER-STORY.png');
  await download.saveAs(path.join(output,name+'-story-card.png'));
  await card.locator('#share').click();
  await card.waitForFunction(()=>window.__shared);
  assert.deepEqual(await card.evaluate(()=>window.__shared),{count:1,type:'image/png',size:(await card.evaluate(()=>window.__shared.size))});
  assert.ok((await card.evaluate(()=>window.__shared.size))>10000,'shared PNG has content');
  await card.close();
  console.log('PASS '+name+': '+count+' responsive routes; navigation, filters, no-JS, PNG download and mocked sharing');
 }finally{await browser.close()}
}
(async()=>{await run('chromium',chromium);await run('webkit',webkit)})().catch(e=>{console.error(e);process.exitCode=1});
