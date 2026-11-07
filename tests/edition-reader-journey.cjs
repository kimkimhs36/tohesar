/* Run the existing reader regression with the project's Node Playwright. */
'use strict';
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:19465';

(async()=>{
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch(name==='chromium'?{args:['--no-sandbox']}:{});
  try{
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.addInitScript(()=>{
    Object.defineProperty(navigator,'share',{value:undefined});
    Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>{window.__copiedArticle=value}}});
   });
   await page.goto(base+'/edition/story/mission-s/',{waitUntil:'load'});
   await page.getByRole('button',{name:'검색 열기'}).click();
   await page.locator('#search-field').fill('F40');
   await page.locator('#search-results a').first().click();
   assert.match(page.url(),/\/story\/f40\//);
   await page.goBack();
   assert.match(page.url(),/\/story\/mission-s\//);
   await page.locator('[data-save]').click();
   await page.reload();
   assert.equal(await page.locator('[data-save]').getAttribute('aria-pressed'),'true');
   await page.locator('[data-share]').click();
   await page.waitForFunction(()=>document.querySelector('.share-status').textContent.length>0);
   assert.match(await page.evaluate(()=>window.__copiedArticle),/\/edition\/story\/mission-s\//);
   await page.locator('[data-saved-open]').click();
   assert.equal(await page.locator('#saved-items a').count(),1);
   await page.locator('#saved-items button').click();
   assert.equal(await page.locator('#saved-items a').count(),0);
   await page.keyboard.press('Escape');
   await page.goto(base+'/edition/archive/');
   await page.locator('#archive-query').fill('F40');
   assert.ok(await page.locator('[data-archive-item]:visible').count()>=1);
   await page.locator('#archive-query').fill('unlikelynoresults');
   assert.equal(await page.locator('#archive-empty').isVisible(),true);
   await page.locator('#archive-reset').click();
   assert.equal(await page.locator('#archive-empty').isVisible(),false);
   await page.goto(base+'/edition/news/');
   await page.waitForFunction(()=>document.querySelectorAll('#wire-list .wire-card').length>0);
   await page.locator('#wire-publisher').selectOption('autoblog');
   assert.ok(await page.locator('#wire-list .wire-card').count()>0);
   for(const label of await page.locator('#wire-list .wire-card small').allInnerTexts())assert.match(label,/Autoblog/);
   await page.locator('#wire-publisher').selectOption('all');
   await page.locator('#wire-query').fill('Porsche');
   assert.ok(await page.locator('#wire-list .wire-card').count()>0);
   await page.locator('#wire-topic').selectOption('design');
   assert.ok(await page.locator('#wire-count').innerText());
   await page.locator('#wire-query').fill('unlikelynoresults');
   assert.match(await page.locator('#wire-list').innerText(),/조건에 맞는/);
   await page.locator('#wire-reset').click();
   assert.equal(await page.locator('#wire-query').inputValue(),'');
   assert.equal(await page.locator('#wire-publisher').inputValue(),'all');
   assert.equal(await page.locator('#wire-topic').inputValue(),'all');
   assert.ok(await page.locator('#wire-list .wire-card').count()>0);
   assert.deepEqual(errors,[]);
   await page.close();
   console.log('PASS '+name+': edition search, back, save, share feedback, archive and news filtering');
  }finally{await browser.close()}
 }
})().catch(error=>{console.error(error);process.exitCode=1});
