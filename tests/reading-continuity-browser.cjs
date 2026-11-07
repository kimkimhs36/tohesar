/* TOHEŞAR last-read feature end-to-end acceptance.
 * BASE_URL=http://127.0.0.1:8765 node tests/reading-continuity-browser.cjs
 * The reader's data remains in browser-local storage: no tracking backend.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium,webkit}=require('playwright');
const base=(process.env.BASE_URL||'http://127.0.0.1:8765').replace(/\/$/,'');
const folder=process.env.SCREENSHOT_DIR||path.resolve('artifacts/reading-continuity');
const key='tohesar.reading.v1';
const width=390,height=844;
const open=async(page,route)=> {
  const r=await page.goto(base+route,{waitUntil:'load',timeout:30000});
  assert.equal(r.status(),200,'http '+route);
};
async function read(page,route,ratio){
  await open(page,route);
  const expected=await page.evaluate(ratio=>{
    const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    scrollTo(0,Math.round(max*ratio));
    return {max};
  },ratio);
  await page.waitForFunction(({key,route})=>{
    try {
      const a=JSON.parse(localStorage.getItem(key)||'[]');
      return a.some(x=>x.path===route&&x.progress>.08);
    }catch(e){return false;}
  },{key,route},{timeout:12000});
  assert.ok(expected.max>300,'Expected long-form article for resume test');
}
async function assertNoOverflow(page,tag){
  const x=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}));
  assert.ok(x.scrollWidth<=x.width+2,tag+' horizontal overflow: '+JSON.stringify(x));
}
(async()=>{
  fs.mkdirSync(folder,{recursive:true});
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
    const browser=await engine.launch(name==='chromium'?{args:['--no-sandbox']}: {});
    try{
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:'reduce'});
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));

      // No one ever read a page: the F40 remains a curated story, NOT fabricated history.
      await open(page,'/');
      assert.match(await page.locator('[data-reading-kicker]').innerText(),/에디터가 고른 이야기/);
      assert.equal(await page.locator('[data-reading-action]').getAttribute('href'),'/journal/f40/');
      assert.equal(await page.locator('[data-reading-status]').isHidden(),true);
      await assertNoOverflow(page,name+' clean');

      // Read an actual Giulia article and navigate away.
      await read(page,'/journal/design/giulia/',.38);
      await open(page,'/');
      await page.waitForFunction(()=>document.querySelector('[data-reading-kicker]')?.textContent?.includes('읽던 이야기'));
      assert.match(await page.locator('[data-reading-title]').innerText(),/비례가 말하는 것/);
      assert.equal(await page.locator('[data-reading-action]').getAttribute('href'),'/journal/design/giulia/');
      assert.match(await page.locator('[data-reading-image]').getAttribute('src'),/giulia\/front-1600.webp/);
      assert.equal(await page.locator('[data-reading-status]').isVisible(),true);
      assert.equal(await page.locator('[data-reading-meter]').isVisible(),true);
      await assertNoOverflow(page,name+' personalized');

      await page.locator('.home-feature').screenshot({
        path:path.join(folder,name+'-390-real-giulia-continue.png'),animations:'disabled'
      });

      // The real, personalized feature — not only the default F40 — must
      // remain generously sized on the smallest phone and iPad landscape.
      for(const size of [
        {name:'iphone-small-320',width:320,height:700,minImageWidth:275},
        {name:'ipad-landscape-1194',width:1194,height:834,minImageWidth:420}
      ]){
        await page.setViewportSize({width:size.width,height:size.height});
        await page.locator('.home-feature').scrollIntoViewIfNeeded();
        await assertNoOverflow(page,name+' '+size.name);
        const imageWidth=await page.locator('[data-reading-image]').evaluate(img=>img.getBoundingClientRect().width);
        assert.ok(imageWidth>=size.minImageWidth,name+' '+size.name+
          ' featured car photo shrank unexpectedly: '+imageWidth);
        assert.equal(await page.locator('[data-reading-action]').getAttribute('href'),'/journal/design/giulia/');
        await page.locator('.home-feature').screenshot({
          path:path.join(folder,name+'-'+size.name+'-real-giulia-continue.png'),
          animations:'disabled'
        });
      }
      await page.setViewportSize({width,height});

      // "Continue" must return to the stored place, not simply the article top.
      await page.locator('[data-reading-action]').click();
      await page.waitForURL('**/journal/design/giulia/',{timeout:15000});
      await page.waitForFunction(()=>window.scrollY>300,null,{timeout:12000});
      const progress=await page.evaluate(()=>{
        const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
        return scrollY/max;
      });
      assert.ok(progress>.14&&progress<.8,name+' resume position fraction '+progress);

      // The most recently read *different* story takes the same large slot.
      await read(page,'/journal/911/',.28);
      await open(page,'/');
      await page.waitForFunction(()=>document.querySelector('[data-reading-action]')?.getAttribute('href')==='/journal/911/');
      assert.match(await page.locator('[data-reading-title]').innerText(),/형태가 시간을/);
      assert.match(await page.locator('[data-reading-image]').getAttribute('src'),/911-journal-abhinand/);
      assert.equal(await page.locator('[data-reading-action]').getAttribute('href'),'/journal/911/');
      await assertNoOverflow(page,name+' second article');

      // Do not confuse 'read more' recommendation cards with reading history.
      assert.equal(await page.locator('.home-pair').getAttribute('aria-label'),'더 읽을 이야기');
      assert.deepEqual(errors,[],name+' browser runtime errors');
      await context.close();

      const noJS=await browser.newContext({viewport:{width,height},javaScriptEnabled:false});
      const noJSPage=await noJS.newPage();
      await open(noJSPage,'/');
      assert.match(await noJSPage.locator('[data-reading-title]').innerText(),/바람이 지나갈/);
      assert.match(await noJSPage.locator('[data-reading-kicker]').innerText(),/에디터가 고른 이야기/);
      await noJS.close();
      console.log('PASS',name,'local last-read hero + resume + no-JS editorial fallback');
    }finally{await browser.close();}
  }
})().catch(error=>{console.error('READING CONTINUITY FAILED',error);process.exitCode=1;});
