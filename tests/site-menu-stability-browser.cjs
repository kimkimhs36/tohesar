/* Regression for real iPhone Index swipe-overlap and unified site shells.
 * BASE_URL=http://127.0.0.1:8765 node tests/site-menu-stability-browser.cjs
 * Runs against the actual static build (no mocked DOM or fake photographs).
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium,webkit}=require('playwright');
const base=(process.env.BASE_URL||'http://127.0.0.1:8765').replace(/\/$/,'');
const screenshots=process.env.SCREENSHOT_DIR||path.resolve('artifacts/site-menu');
const routes=[
  '/','/journal/','/journal/911/','/journal/f40/',
  '/journal/design/giulia/','/journal/design/type-01/',
  '/journal/field-notes/001/','/journal/explore/','/journal/design/',
  '/journal/issues/','/journal/issues/001/',
  '/journal/miniatures/','/journal/visual/','/journal/yokohama/',
  '/journal/news/','/owner-stories/','/owner-stories/story-card/',
  '/edition/','/edition/archive/','/edition/news/',
  '/edition/story/911/','/edition/story/f40/','/edition/story/mission-s/',
  '/sitemap/'
];
const deviceSizes=[
  {name:'iphone-mini',width:320,height:568},
  {name:'iphone',width:390,height:844},
  {name:'ipad-landscape',width:1194,height:834}
];
function near(a,b,tolerance=2){return Math.abs(a-b)<=tolerance}
async function checkPage(browser,engine,route,size,full){
  const ctx=await browser.newContext({viewport:{width:size.width,height:size.height},deviceScaleFactor:1,reducedMotion:'reduce',hasTouch:size.width<=700});
  const page=await ctx.newPage();
  try{
    const response=await page.goto(base+route,{waitUntil:'load',timeout:30000});
    assert.equal(response.status(),200,route+' HTTP');
    const menu=page.locator('.journal-index').first();
    assert.equal(await menu.count(),1,route+' must have one global menu');
    const summary=menu.locator('summary');
    assert.equal(await summary.locator('.thz-menu-icon').count(),1,route+' has explicit menu icon');
    assert.equal(await summary.locator('.thz-label-menu').isVisible(),true,route+' says MENU');
    assert.equal(await summary.getAttribute('aria-label'),'전체 메뉴 열기');
    await summary.scrollIntoViewIfNeeded();
    const header=page.locator('.site-header:has(.journal-index),.owner-header:has(.journal-index),.article-bar:has(.journal-index),.city-nav:has(.journal-index)').first();
    assert.equal(await header.count(),1,route+' has a shared brand header');
    const color=await header.evaluate(el=>getComputedStyle(el).backgroundColor);
    assert.equal(color,'rgb(233, 228, 238)',route+' uses the shared warm-lavender header');
    const original=await page.evaluate(()=>window.scrollY);
    await summary.click();
    await page.waitForFunction(()=>document.documentElement.classList.contains('thz-menu-open'));
    assert.equal(await summary.getAttribute('aria-label'),'전체 메뉴 닫기');
    assert.equal(await summary.locator('.thz-label-close').isVisible(),true);
    const panel=menu.locator('nav');
    const bounds=await panel.evaluate(el=>{
      const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
      return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,
        width:rect.width,height:rect.height,position:style.position,background:style.backgroundImage};
    });
    assert.equal(bounds.position,'fixed',engine+' '+route+' menu must attach to the viewport');
    assert.ok(bounds.left>=-2&&bounds.right<=size.width+2,engine+' '+route+' horizontal menu clipping '+JSON.stringify(bounds));
    assert.ok(bounds.top>=0&&bounds.bottom<=size.height+3,engine+' '+route+' vertical menu clipping '+JSON.stringify(bounds));
    assert.match(bounds.background,/gradient/,route+' menu is an opaque paper surface');
    assert.equal(await panel.locator('a').count(),5);
    // Reproduce user screenshot: swipe upward while the Index is open.
    await page.mouse.move(Math.max(8,size.width/2),Math.min(size.height-35,bounds.bottom-20));
    await page.mouse.wheel(0,-640);
    await page.waitForTimeout(90);
    let after=await page.evaluate(()=>scrollY);
    assert.ok(near(after,original),engine+' '+route+' body moved behind open menu: '+after+' vs '+original);
    await page.evaluate(()=>scrollBy(0,300)); // programmatic/legacy movement must also be restored.
    await page.waitForTimeout(90);
    after=await page.evaluate(()=>scrollY);
    assert.ok(near(after,original),engine+' '+route+' scroll lock lost position after external scroll');
    if(full){
      fs.mkdirSync(screenshots,{recursive:true});
      await page.screenshot({path:path.join(screenshots,engine+'-'+size.name+'-'+route.replace(/\W+/g,'_')+'-menu.png'),animations:'disabled'});
    }
    await summary.click();
    await page.waitForFunction(()=>!document.querySelector('.journal-index').open);
    assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('thz-menu-open')),false);
    assert.ok(near(await page.evaluate(()=>scrollY),original),route+' closing restores scroll');
    assert.equal(await summary.getAttribute('aria-label'),'전체 메뉴 열기');
  }finally{await ctx.close();}
}
(async()=>{
  fs.mkdirSync(screenshots,{recursive:true});
  let count=0;
  for(const [engineName,engine] of [['chromium',chromium],['webkit',webkit]]){
    const browser=await engine.launch({headless:true,args:engineName==='chromium'?['--no-sandbox']:[]});
    try{
      for(const route of routes){
        const size=deviceSizes[1];
        await checkPage(browser,engineName,route,size,['/','/journal/','/edition/','/journal/yokohama/','/owner-stories/'].includes(route));
        count++;
      }
      for(const size of [deviceSizes[0],deviceSizes[2]]){
        for(const route of ['/','/journal/','/edition/','/journal/yokohama/']){
          await checkPage(browser,engineName,route,size,true);count++;
        }
      }
      const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
      const nojs=await context.newPage();
      await nojs.goto(base+'/journal/',{waitUntil:'load'});
      await nojs.locator('.journal-index summary').click();
      assert.equal(await nojs.locator('.journal-index nav').isVisible(),true,'native menu survives without JS');
      assert.equal(await nojs.locator('.thz-label-close').isVisible(),true,'native close label works');
      await context.close();
    }finally{await browser.close()}
  }
  console.log('PASS shared TOHEŞAR menu: '+count+' route/viewpoint/browser checks + no-JS');
})().catch(error=>{console.error('SITE MENU REGRESSION',error);process.exitCode=1});
