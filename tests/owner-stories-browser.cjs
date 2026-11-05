/* Local-only browser integration. All non-local requests are intercepted. */
'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.OWNER_TEST_BASE || 'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try {
  for(const width of [320,390,768,1024]){
   const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});const errors=[];const posts=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST')posts.push(r.url())});
   await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
   for(const route of ['/owner-stories/','/owner-stories/story-card/']){
    await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,route+' at '+width);
    assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.owner-header img').getAttribute('src'),'/assets/wordmark.svg');
    await page.locator('.owner-index summary').focus();assert.equal(await page.evaluate(()=>document.activeElement.tagName),'SUMMARY');
    if(width===390){
     await page.screenshot({path:'/tmp/owner-'+(route.includes('story-card')?'studio':'landing')+'.png',fullPage:true});
     if(route.includes('story-card')){
      await page.locator('#car-photo').setInputFiles({name:'local.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')});
      await page.waitForFunction(()=>document.querySelector('#card-status').textContent.includes('불러왔어요'));
      const downloaded=page.waitForEvent('download');await page.locator('#save').click();const file=await downloaded;assert.equal(file.suggestedFilename(),'TOHESAR-OWNER-STORY.png');
      assert.deepEqual(await page.locator('#story-canvas').evaluate(c=>[c.width,c.height]),[1080,1920]);
     }
    }
   }
   await page.goto(base+'/journal/',{waitUntil:'networkidle'});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'journal at '+width);
   const invitation=page.locator('.owner-journal-invite');assert.equal(await invitation.count(),1);
   await invitation.scrollIntoViewIfNeeded();if(width===390)await invitation.screenshot({path:'/tmp/owner-journal-invite.png'});
   await invitation.getByRole('link',{name:/차주의 이야기 제안하기/}).click();await page.waitForURL('**/owner-stories/');
   assert.equal(await page.locator('[data-owner-prepare]').isVisible(),false);
   assert.deepEqual(errors,[]);assert.deepEqual(posts,[]);await page.close();
  }
  const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
  await nojs.goto(base+'/owner-stories/');assert.equal(await nojs.locator('[data-owner-form] button[type=submit]').isDisabled(),true);
  assert.match(await nojs.locator('[data-owner-form]').getAttribute('action'),/^mailto:/);assert.match(await nojs.locator('noscript a').getAttribute('href'),/^mailto:/);await nojs.close();
  const race=await browser.newPage();
  await race.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
  await race.addInitScript(()=>{const src=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{...src,set(value){if(value.startsWith('blob:'))setTimeout(()=>src.set.call(this,value),800);else src.set.call(this,value)}});});
  await race.goto(base+'/owner-stories/story-card/');
  await race.locator('#car-photo').setInputFiles({name:'slow.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')});
  await race.locator('#save').click();assert.match(await race.locator('#card-status').textContent(),/불러오는 중/);
  await race.locator('#car-photo').dispatchEvent('change');
  const afterCancel=race.waitForEvent('download');await race.locator('#save').click();await afterCancel;await race.close();
  const draft=await browser.newPage();await draft.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
  await draft.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>{window.copiedDraft=value}}});});
  await draft.goto(base+'/owner-stories/');assert.equal(await draft.locator('[data-owner-prepare]').isVisible(),false);
  await draft.locator('[name=model]').fill('Test Car');await draft.locator('[name=story]').fill('이 자동차의 선을 좋아합니다.');await draft.locator('[data-owner-copy]').click();
  assert.match(await draft.locator('[data-owner-status]').textContent(),/직접 보내주세요/);assert.match(await draft.evaluate(()=>window.copiedDraft),/Test Car/);await draft.close();
  const page=await browser.newPage();const calls=[];let status=503,malformed=false;
  await page.route('**/*',async route=>{
   const url=route.request().url();
   if(url.endsWith('/owner-stories/intake-config.js'))return route.fulfill({contentType:'text/javascript',body:"window.OWNER_STORIES_INTAKE={endpoint:'https://intake.example.test/api/submit',sitekey:'test_sitekey_12345'}"});
   if(url.startsWith('https://challenges.cloudflare.com/'))return route.fulfill({contentType:'text/javascript',body:"window.turnstile={render:(el,opts)=>{window.testWidget=opts;opts.callback('mock-valid-token');return 'widget'},reset:()=>{}}"});
   if(url==='https://intake.example.test/api/submit'){
    calls.push({body:route.request().postDataJSON(),key:route.request().headers()['idempotency-key']});
    return route.fulfill({status,contentType:'application/json',body:malformed?'not json':JSON.stringify(status===202?{ok:true,status:'accepted'}:{ok:false,error:'delivery_unconfirmed'})});
   }
   return url.startsWith(base)?route.continue():route.abort();
  });
  await page.goto(base+'/owner-stories/');await page.locator('[name=model]').fill('Test Car');await page.locator('[name=story]').fill('이 자동차의 선을 좋아합니다.');
  assert.equal(await page.locator('[data-owner-prepare]').isVisible(),true);await page.locator('[data-owner-prepare]').click();
  await page.locator('[name=contact]').fill('driver@example.org');await page.waitForFunction(()=>!!window.testWidget);
  await page.locator('[data-owner-send]').click();assert.equal(calls.length,0);assert.match(await page.locator('[data-owner-status]').textContent(),/동의/);
  await page.locator('[name=consent]').check();await page.locator('[data-owner-send]').click();await page.waitForFunction(()=>document.querySelector('[data-owner-status]').textContent.includes('확인하지 못했어요'));
  assert.equal(calls.length,1);assert.equal(calls[0].body.consent,true);assert.equal('photo' in calls[0].body,false);
  status=202;await page.evaluate(()=>window.testWidget.callback('fresh-mock-token'));await page.locator('[data-owner-send]').click();
  await page.waitForFunction(()=>document.querySelector('[data-owner-status]').textContent.includes('전달 서비스에 접수'));
  assert.equal(calls.length,2);assert.equal(calls[0].key,calls[1].key);await page.evaluate(()=>window.testWidget.callback('another-token'));assert.equal(await page.locator('[data-owner-send]').isDisabled(),true);
  await page.locator('[name=story]').fill('다른 자동차의 선을 좋아합니다.');assert.equal(await page.locator('[data-owner-send]').isEnabled(),true);
  await page.evaluate(()=>window.testWidget['expired-callback']());assert.equal(await page.locator('[data-owner-send]').isDisabled(),true);
  malformed=true;await page.evaluate(()=>window.testWidget.callback('fresh-third-token'));await page.locator('[data-owner-send]').click();
  await page.waitForFunction(()=>document.querySelector('[data-owner-status]').textContent.includes('확인하지 못했어요'));assert.equal(calls.length,3);
  await page.close();console.log('PASS: Chromium 320/390/768/1024, journal journey, local-only photo studio and mocked online retry/consent');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
