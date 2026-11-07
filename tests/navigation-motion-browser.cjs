/* The same accessible Index interaction across editorial pages and devices. */
'use strict';
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const base=process.env.BASE_URL||'http://127.0.0.1:19465';
const shots=process.env.SCREENSHOT_DIR||path.resolve('artifacts/menu');fs.mkdirSync(shots,{recursive:true});
(async()=>{
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch(name==='chromium'?{executablePath:process.env.CHROMIUM_PATH||undefined}:{});
  try{
   for(const width of [320,390,768,1024,1440]){
    const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'no-preference'});
    for(const [label,route] of [['journal','/journal/'],['field','/journal/field-notes/001/'],['owner','/owner-stories/'],['studio','/owner-stories/story-card/'],['archive','/edition/archive/']]){
     await page.goto(base+route,{waitUntil:'load'});
     const menu=page.locator('.journal-index'),summary=menu.locator('summary'),panel=menu.locator('nav');
     await summary.focus();await page.keyboard.press('Enter');
     assert.equal(await menu.evaluate(e=>e.open),true,name+' '+label+' opens');
     await page.waitForTimeout(370);
     assert.equal(await panel.evaluate(e=>getComputedStyle(e).animationName),'journal-menu-in');
     const filter=await page.locator('main').first().evaluate(e=>getComputedStyle(e).filter);
     assert.equal(filter,'none','menu never blurs the article behind it');
     const rect=await panel.evaluate(e=>{let r=e.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height}});
     assert.ok(rect.left>=-2&&rect.right<=width+2&&rect.width>150,name+' '+width+' '+label+' '+JSON.stringify(rect));
     assert.ok(await panel.locator('a:visible').count()>=4);
     if((width===390||width===1440)&&['journal','owner'].includes(label))await page.screenshot({path:path.join(shots,name+'-'+label+'-index-'+width+'.png')});
     await page.keyboard.press('Escape');
     assert.equal(await panel.getAttribute('aria-hidden'),'true','closing panel removed from accessibility tree');
     await page.waitForTimeout(250);
     assert.equal(await menu.evaluate(e=>e.open),false,name+' '+label+' closes');
     assert.equal(await summary.evaluate(e=>document.activeElement===e),true,'Escape restores focus');
     if(width===390&&label==='journal'){
      await summary.click();await summary.click();await page.waitForTimeout(50);await summary.click();
      await page.waitForTimeout(300);
      assert.equal(await menu.evaluate(e=>e.open),true,'rapid reopen cancels closing');
      assert.equal(await panel.getAttribute('aria-hidden'),null);
      await page.mouse.click(5,800);await page.waitForTimeout(250);
      assert.equal(await menu.evaluate(e=>e.open),false,'outside click closes');
     }
    }
    await page.close();
   }
   const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await reduced.goto(base+'/journal/');const menu=reduced.locator('.journal-index'),summary=menu.locator('summary');
   await summary.click();assert.equal(await menu.locator('nav').evaluate(e=>getComputedStyle(e).animationName),'none');
   await reduced.keyboard.press('Escape');assert.equal(await menu.evaluate(e=>e.open),false,'reduced motion closes immediately');
   await reduced.close();
   const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(base+'/journal/');
   await nojs.locator('.journal-index summary').click();assert.equal(await nojs.locator('.journal-index nav').isVisible(),true,'native menu works without JS');await nojs.close();
   // On the cover continuation, the header is inside main. Blur only the
   // editorial content so the menu and authored cover stay clear and usable.
   const home=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await home.goto(base+'/');const homeSummary=home.locator('.journal-index summary');
   await homeSummary.scrollIntoViewIfNeeded();await homeSummary.click();
   await home.waitForFunction(()=>document.querySelector('.journal-index').style.getPropertyValue('--thz-menu-height'));
   assert.equal(await home.locator('main').evaluate(e=>getComputedStyle(e).filter),'none');
   assert.equal(await home.locator('.home-editorial').evaluate(e=>getComputedStyle(e).filter),'none','home article no longer ghosts through the menu');
   let bounds=await home.locator('.journal-index nav').evaluate(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom}});
   assert.ok(bounds.top>=-2&&bounds.bottom<=846,'home Index remains within the viewport: '+JSON.stringify(bounds));
   await home.locator('.journal-index nav a[href="/journal/"]').click();await home.waitForURL('**/journal/');
   await home.close();
   const short=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'});
   await short.goto(base+'/');const shortSummary=short.locator('.journal-index summary');
   await shortSummary.scrollIntoViewIfNeeded();await shortSummary.click();
   await short.waitForFunction(()=>document.querySelector('.journal-index').style.getPropertyValue('--thz-menu-height'));
   bounds=await short.locator('.journal-index nav').evaluate(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom}});
   assert.ok(bounds.top>=-2&&bounds.bottom<=570,'short viewport keeps the Index reachable: '+JSON.stringify(bounds));
   const items=await short.locator('.journal-index nav a').evaluateAll(links=>links.map(link=>{const r=link.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height}}));
   assert.ok(items.every(r=>r.top>=-2&&r.bottom<=570&&r.height>=44),'all menu items remain visible and touch-sized: '+JSON.stringify(items));
   await short.locator('.journal-index nav a[href="/owner-stories/"]').click();await short.waitForURL('**/owner-stories/');
   await short.close();
   console.log('PASS '+name+': shared Index at 320/390/768/1024/1440, keyboard, blur, close, reduced motion and no-JS');
  }finally{await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
