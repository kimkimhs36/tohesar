'use strict';
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:19465';
const key='tohesar.reading.v1';
async function test(name,engine){
 const browser=await engine.launch(name==='chromium'?{args:['--no-sandbox']}:{});
 try {
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const go=path=>page.goto(base+path,{waitUntil:'load'});
  await go('/journal/design/giulia/');
  await page.waitForTimeout(5300); // Exercise the original delayed 0% write.
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),null,'a stationary visit must not create a record');
  await go('/');
  assert.match(await page.locator('[data-reading-kicker]').innerText(),/에디터가 고른/);
  const now=Date.now();
  await page.evaluate(({k,now})=>localStorage.setItem(k,JSON.stringify([
    {path:'/journal/f40/',progress:0,updated:now},
    {path:'/journal/design/giulia/',progress:.54,updated:now-1000}
  ])),{k:key,now});
  await page.reload();
  assert.equal(await page.locator('[data-reading-action]').getAttribute('href'),'/journal/design/giulia/','invalid zero record must not displace an unfinished story');
  await go('/journal/design/giulia/');
  await page.waitForTimeout(5300);
  await go('/');
  const history=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  assert.equal(history.find(x=>x.path==='/journal/design/giulia/').progress,.54,'opening the top must preserve an earlier position');
  assert.match(await page.locator('[data-reading-status]').innerText(),/54%/);
  await page.evaluate(({k,now})=>localStorage.setItem(k,JSON.stringify([
    {path:'/journal/911/',progress:.98,updated:now},
    {path:'/journal/design/giulia/',progress:.54,updated:now-1000}
  ])),{k:key,now:Date.now()});
  await page.reload();
  assert.equal(await page.locator('[data-reading-action]').getAttribute('href'),'/journal/design/giulia/','completed stories should not hide an unfinished one');
  await page.locator('[data-reading-action]').click();
  await page.waitForURL('**/journal/design/giulia/');
  await page.waitForFunction(()=>scrollY>300,null,{timeout:10000});
  const ratio=await page.evaluate(()=>scrollY/(document.documentElement.scrollHeight-innerHeight));
  assert.ok(Math.abs(ratio-.54)<.12,'resume near the actual saved point: '+ratio);
  assert.deepEqual(errors,[]);
  await page.close();console.log('PASS '+name+': no zero records, preserved progress, unfinished priority and real resume');
 }finally{await browser.close()}
}
Promise.all([test('chromium',chromium),test('webkit',webkit)]).catch(e=>{console.error(e);process.exitCode=1});
