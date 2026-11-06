/* TOHEŞAR — real responsive browser contract for FIELD NOTES 001.
   BASE_URL=http://127.0.0.1:8765 node tests/field-notes-responsive.cjs
   Tests geometry, not subjective artistic approval; screenshots are review artifacts. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium,webkit}=require('playwright');
const base=(process.env.BASE_URL||'http://127.0.0.1:8765').replace(/\/$/,'');
const shotDir=process.env.SCREENSHOT_DIR||path.join(__dirname,'..','.qa-field-notes');
const viewports=[
  {name:'iphone-se-320',width:320,height:680},
  {name:'iphone-375',width:375,height:812},
  {name:'iphone-390',width:390,height:844},
  {name:'iphone-430',width:430,height:932},
  {name:'iphone-landscape',width:844,height:390},
  {name:'ipad-portrait',width:768,height:1024},
  {name:'ipad-landscape',width:1194,height:834},
  {name:'desktop',width:1440,height:900},
];
function approxBounds(rect,w,margin=2){
  return rect.x>=-margin && rect.right<=w+margin && rect.width>0;
}
async function checkPage(browser,engine,viewport,route,entry){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1,hasTouch:viewport.width<900,isMobile:engine==='webkit'&&viewport.width<900});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(String(err)));
  try{
    const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:30000});
    assert.equal(response.status(),200,engine+' '+route+' HTTP');
    await page.locator(entry?'.field-entry__grid':'.contact-sheet').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    const metrics=await page.evaluate(({entry})=>{
      const box=sel=>{const r=document.querySelector(sel)?.getBoundingClientRect();if(!r)return null;return {x:r.x,right:r.right,y:r.y,bottom:r.bottom,width:r.width,height:r.height}};
      return {
        viewport:innerWidth,scroll:document.documentElement.scrollWidth,bodyScroll:document.body.scrollWidth,
        visual:box(entry?'.field-entry__media':'.contact-sheet'),
        copy:box(entry?'.field-entry__copy':'.opening h1'),
        allLinks:entry?null:[...document.querySelectorAll('.mast__links a')].map(a=>({text:a.innerText,rect:box('.mast__links')})),
        photo:entry?box('.field-entry__visual'):box('.contact-sheet'),
        title:box(entry?'.field-entry h2':'.opening h1'),
      };
    },{entry});
    assert.ok(metrics.scroll<=metrics.viewport+2,`${engine} ${viewport.name} ${route}: horizontal document overflow ${metrics.scroll}>${metrics.viewport}`);
    assert.ok(metrics.bodyScroll<=metrics.viewport+2,`${engine} ${viewport.name} ${route}: body overflow`);
    assert.ok(approxBounds(metrics.visual,viewport.width),`${engine} ${viewport.name} image outside viewport: ${JSON.stringify(metrics.visual)}`);
    assert.ok(approxBounds(metrics.title,viewport.width),`${engine} ${viewport.name} headline outside viewport: ${JSON.stringify(metrics.title)}`);
    if(entry && viewport.width<=860){
      assert.ok(metrics.visual.bottom<=metrics.copy.y+5,`${engine} ${viewport.name}: photo did not move above editorial text`);
    }
    if(!entry){
      assert.equal(await page.locator('[data-chapter]').count(),3);
      const nav=await page.locator('.mast__links a').count();
      assert.equal(nav,5,'all navigation links remain available on narrow phones');
      const all=await page.locator('.mast__links a').evaluateAll(els=>els.map(x=>({name:x.innerText,x:x.getBoundingClientRect().x,right:x.getBoundingClientRect().right})));
      assert.ok(all.every(x=>x.x>=-2&&x.right<=viewport.width+2),`${engine} ${viewport.name}: clipped chapter links: ${JSON.stringify(all)}`);
    }
    if(viewport.name==='iphone-390'||viewport.name==='ipad-landscape'){
      fs.mkdirSync(shotDir,{recursive:true});
      if(entry){
        // Review the actual new entry module, not the existing cinematic homepage cover.
        await page.locator('.field-entry').screenshot({path:path.join(shotDir,`${engine}-${viewport.name}-entry.png`),animations:'disabled'});
      }else{
        await page.screenshot({path:path.join(shotDir,`${engine}-${viewport.name}-article.png`),fullPage:true,animations:'disabled'});
      }
    }
    assert.deepEqual(errors,[],`${engine} ${viewport.name} browser errors`);
    console.log('PASS',engine,viewport.name,entry?'entry':'article','docWidth='+metrics.scroll);
  }finally{await context.close();}
}
async function main(){
  let failures=0,passes=0;
  for(const [engine,browserType] of [['chromium',chromium],['webkit',webkit]]){
    let browser;
    try{browser=await browserType.launch({headless:true,args:engine==='chromium'?['--no-sandbox']:[]});}
    catch(e){console.error('BROWSER UNAVAILABLE',engine,e.message);process.exitCode=1;return;}
    try{
      for(const viewport of viewports){
        for(const [route,entry] of [['/journal/field-notes/001/',false],['/journal/',true],['/',true]]){
          try{await checkPage(browser,engine,viewport,route,entry);passes++}
          catch(e){failures++;console.error('FAIL',engine,viewport.name,route,e.message);}
        }
      }
    }finally{await browser.close();}
  }
  console.log('TOHEŞAR UI QA results:',passes,'pass /',failures,'fail');
  if(failures)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
