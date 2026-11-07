/* Real local navigation through reading, resuming, participation and card export. */
'use strict';
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.BASE_URL||'http://127.0.0.1:19465';
const output=process.env.SCREENSHOT_DIR||path.resolve('artifacts/reader-journey');
const key='tohesar.reading.v1';
fs.mkdirSync(output,{recursive:true});

async function run(name,engine){
  const browser=await engine.launch(name==='chromium'?{args:['--no-sandbox']}:{});
  try{
    for(const width of [320,390,768,1024,1440]){
      const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',hasTouch:width<768});
      const page=await context.newPage();
      const errors=[],posts=[];
      page.on('pageerror',error=>errors.push(error.message));
      page.on('request',request=>{if(request.method()==='POST')posts.push(request.url())});
      await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copiedDraft=text}}})});
      await page.goto(base+'/journal/',{waitUntil:'load'});
      assert.equal(await page.locator('[data-journal-resume]').isHidden(),true,'no invented reading history');
      await page.locator('.design-small a[href="/journal/design/giulia/"]').first().click();
      await page.waitForURL('**/journal/design/giulia/');
      await page.evaluate(()=>scrollTo(0,Math.round((document.documentElement.scrollHeight-innerHeight)*.45)));
      await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)||'[]').some(item=>item.path==='/journal/design/giulia/'&&item.progress>.35),key);
      await page.locator('.site-shortcuts a[href="/journal/"]').click();
      await page.waitForURL('**/journal/');
      assert.equal(await page.locator('[data-journal-resume]').isVisible(),true);
      assert.match(await page.locator('[data-journal-title]').innerText(),/비례가 말하는 것/);
      assert.match(await page.locator('[data-journal-progress]').innerText(),/\d+%/);
      assert.equal(await page.locator('[data-journal-link]').getAttribute('href'),'/journal/design/giulia/');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'journal overflow '+width);
      if(width===390){
        await page.screenshot({path:path.join(output,name+'-390-journal-continuity.png'),animations:'disabled'});
        await page.locator('.journal-index summary').click();
        await page.screenshot({path:path.join(output,name+'-390-cloud-index.png'),animations:'disabled'});
        await page.locator('.journal-index summary').click();
      }
      const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key))[0].progress,key);
      await page.locator('[data-journal-link]').click();
      await page.waitForURL('**/journal/design/giulia/');
      await page.waitForFunction(()=>scrollY>300);
      const actual=await page.evaluate(()=>scrollY/(document.documentElement.scrollHeight-innerHeight));
      assert.ok(Math.abs(actual-saved)<.12,'restored reading position '+name+' '+width+' '+actual+' expected '+saved);
      await page.locator('.site-shortcuts a[href="/owner-stories/"]').click();
      await page.waitForURL('**/owner-stories/');
      await page.locator('.hero a[href="#join"]').click();
      assert.equal(await page.locator('[data-owner-form]').evaluate(form=>form.checkValidity()),false,'empty proposal invalid');
      await page.locator('[name=model]').fill('Giulia');
      await page.locator('[name=story]').fill('이 자동차의 선과 함께한 시간을 좋아합니다.');
      assert.equal(await page.locator('[data-owner-form]').evaluate(form=>form.checkValidity()),true);
      await page.locator('[data-owner-copy]').click();
      assert.match(await page.locator('[data-owner-status]').innerText(),/직접 보내주세요/);
      assert.match(await page.evaluate(()=>window.__copiedDraft),/Giulia/);
      if(width===390)await page.locator('[data-owner-form]').screenshot({path:path.join(output,name+'-390-owner-form.png'),animations:'disabled'});
      await page.locator('.owner-storymaker__action a').click();
      await page.waitForURL('**/owner-stories/story-card/**');
      await page.locator('#car-name').fill('Giulia');
      await page.locator('#car-photo').setInputFiles(path.join(__dirname,'..','journal','assets','editorial-fresh','911-journal-abhinand-800.webp'));
      await page.waitForFunction(()=>document.querySelector('#card-status').textContent.includes('불러왔어요'));
      const pending=page.waitForEvent('download');
      await page.locator('#save').click();
      const file=await pending;
      assert.equal(file.suggestedFilename(),'TOHESAR-OWNER-STORY.png');
      assert.deepEqual(await page.locator('#story-canvas').evaluate(c=>[c.width,c.height]),[1080,1920]);
      if(width===390){
        await file.saveAs(path.join(output,name+'-journey-story-card.png'));
        await page.locator('.studio').screenshot({path:path.join(output,name+'-390-story-studio.png'),animations:'disabled'});
      }
      await page.locator('.notice a[href="/owner-stories/#join"]').click();
      await page.waitForURL('**/owner-stories/#join');
      assert.equal(await page.locator('[data-owner-form]').isVisible(),true);
      await page.locator('.site-shortcuts a[href="/journal/"]').click();
      await page.waitForURL('**/journal/');
      assert.equal(await page.locator('[data-journal-resume]').isVisible(),true,'history survives entire journey');
      await page.locator('[data-journal-forget]').click();
      assert.equal(await page.locator('[data-journal-resume]').isHidden(),true);
      assert.match(await page.locator('[data-journal-status]').textContent(),/지웠습니다/);
      assert.equal(await page.evaluate(()=>document.activeElement.id),'featured-title','focus remains on a meaningful heading after removing the last record');
      assert.deepEqual(errors,[],name+' '+width+' runtime errors');
      assert.deepEqual(posts,[],name+' '+width+' no submission or photo upload');
      await context.close();
    }
    // Session storage can fail independently of local storage; 3% is a valid
    // recorded position and must still be resumed by the explicit link.
    const restricted=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page=await restricted.newPage();
    await page.addInitScript(()=>{
      const session=window.sessionStorage;
      for(const method of ['getItem','setItem','removeItem']){
        const original=Storage.prototype[method];
        Storage.prototype[method]=function(...args){if(this===session)throw new Error('session storage blocked');return original.apply(this,args)};
      }
    });
    await page.goto(base+'/journal/');
    await page.evaluate(key=>localStorage.setItem(key,JSON.stringify([{path:'/journal/design/giulia/',progress:.03,updated:Date.now()}])),key);
    await page.reload();
    assert.match(await page.locator('[data-journal-progress]').innerText(),/3%/);
    await page.locator('[data-journal-link]').click();
    await page.waitForURL('**/journal/design/giulia/**');
    await page.waitForFunction(()=>scrollY>10);
    const ratio=await page.evaluate(()=>scrollY/(document.documentElement.scrollHeight-innerHeight));
    assert.ok(Math.abs(ratio-.03)<.025,'restricted storage 3% resume '+ratio);
    assert.equal(await page.evaluate(()=>location.hash),'','temporary fallback hash cleared');
    await restricted.close();
    const edge=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const edgePage=await edge.newPage();
    await edgePage.goto(base+'/journal/issues/001/');
    await edgePage.evaluate(()=>scrollTo(0,Math.round((document.documentElement.scrollHeight-innerHeight)*.35)));
    await edgePage.waitForFunction(key=>JSON.parse(localStorage.getItem(key)||'[]').some(item=>item.path==='/journal/issues/001/'&&item.progress>.25),key);
    await edgePage.locator('.journal-index summary').click();
    await edgePage.locator('.journal-index nav a[href="/journal/"]').click();
    await edgePage.waitForURL('**/journal/');
    assert.match(await edgePage.locator('[data-journal-title]').innerText(),/THE SHAPE/,'issue is a resumable long read');
    await edgePage.evaluate(key=>{
      const issue=JSON.parse(localStorage.getItem(key))[0];
      localStorage.setItem(key,JSON.stringify([
        {path:'/journal/911/',progress:.98,updated:Date.now()},
        {path:'/journal/design/giulia/',progress:.03,updated:Date.now()-1000},
        {...issue,updated:Date.now()-2000}
      ]));
    },key);
    await edgePage.reload();
    assert.match(await edgePage.locator('[data-journal-title]').innerText(),/비례가 말하는 것/,'unfinished history takes priority');
    await edgePage.locator('[data-journal-forget]').click();
    assert.match(await edgePage.locator('[data-journal-title]').innerText(),/THE SHAPE/,'forget preserves other articles');
    assert.equal(await edgePage.evaluate(key=>JSON.parse(localStorage.getItem(key)).length,key),2);
    await edge.close();
    const nojs=await browser.newPage({javaScriptEnabled:false});
    await nojs.goto(base+'/journal/');
    assert.equal(await nojs.locator('[data-journal-resume]').isHidden(),true);
    assert.ok(await nojs.locator('.design-small a[href="/journal/design/giulia/"]').count()>0);
    await nojs.close();
    console.log('PASS '+name+': full reader journey at 320/390/768/1024/1440; blocked session storage and no-JS');
  }finally{await browser.close()}
}
(async()=>{await run('chromium',chromium);await run('webkit',webkit)})().catch(error=>{console.error(error);process.exitCode=1});
