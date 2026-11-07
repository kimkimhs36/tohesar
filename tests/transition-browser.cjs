/* Verify native journal -> FIELD NOTES passage and reduced-motion fallback. */
'use strict';
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const base=process.env.BASE_URL||'http://127.0.0.1:19465';
const shots=process.env.SCREENSHOT_DIR||path.resolve('artifacts/transitions');
fs.mkdirSync(shots,{recursive:true});
(async()=>{
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch(name==='chromium'?{executablePath:process.env.CHROMIUM_PATH||undefined}:{});
  try{
   const options={viewport:{width:390,height:844},reducedMotion:'no-preference'};
   if(name==='chromium')options.recordVideo={dir:shots,size:{width:390,height:844}};
   const context=await browser.newContext(options);
   await context.addInitScript(()=>{
    for(const type of ['pageswap','pagereveal']) addEventListener(type,event=>{
      try{const log=JSON.parse(sessionStorage.getItem('transition-test')||'[]');log.push({type,transition:!!event.viewTransition,path:location.pathname});sessionStorage.setItem('transition-test',JSON.stringify(log))}catch(_){}
    });
   });
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/journal/');
   await page.evaluate(()=>sessionStorage.removeItem('transition-test'));
   const supported=await page.evaluate(()=>'onpageswap' in window&&'onpagereveal' in window);
   const link=page.locator('.field-entry--journal .field-entry__cta');
   await link.scrollIntoViewIfNeeded();await page.waitForTimeout(300);
   await link.click();await page.waitForURL('**/journal/field-notes/001/');
   await page.waitForTimeout(600);
   assert.equal(await page.locator('.journal-index summary').count(),1,'same shared menu');
   const log=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('transition-test')||'[]'));
   if(supported){
    assert.ok(log.some(e=>e.type==='pageswap'&&e.transition),'source view transition ran');
    assert.ok(log.some(e=>e.type==='pagereveal'&&e.transition),'destination view transition ran');
   }
   await page.screenshot({path:path.join(shots,name+'-field-after-navigation.png')});
   await page.goBack();await page.waitForURL('**/journal/');
   assert.deepEqual(errors,[]);
   const video=page.video();await context.close();
   if(video) console.log(name+' navigation video: '+await video.path());
   const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await reduced.goto(base+'/journal/field-notes/001/');
   await reduced.locator('#chapter-f40').scrollIntoViewIfNeeded();await reduced.waitForTimeout(400);
   assert.equal(await reduced.locator('.article-motion-enter').count(),0,'reduced motion does not animate prose');
   assert.equal(await reduced.locator('#chapter-f40-title').isVisible(),true);
   await reduced.close();
   console.log('PASS '+name+': journal to story, return, reduced motion; native view transition '+(supported?'observed':'unsupported by browser'));
  }finally{await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
