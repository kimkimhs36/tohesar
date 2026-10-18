const {chromium,webkit}=require('@playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const results=[];
 for(const [engine,driver] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await driver.launch();
  for(const [name,width,height] of [['iphone',390,844],['small-iphone',375,667],['ipad',820,1180],['desktop',1440,900]]){
   const page=await browser.newPage({viewport:{width,height},isMobile:width<900,hasTouch:width<900,deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   await page.goto('http://localhost:5173/?p=0');await page.waitForFunction(()=>window.__genesis);
   for(const p of [0,.05,.12,.18,.21,.23,.27,.30,.43,.55,.8,.95,1]){
    await page.evaluate(p=>__genesis.seek(p),p);
    if([0,.12,.21,.23,.27,.30,.8].includes(p))await page.screenshot({path:`captures/genesis03/${engine}-${name}-${Math.round(p*100)}.png`});
    const state=await page.evaluate(()=>__genesis.state);
    assert(state.calls>0,`${engine} ${name} ${p}: blank renderer`);
    assert(state.camera.every(Number.isFinite),'invalid camera');
    if(p===.43){assert(state.revelation.alignmentError<.003);assert(state.mediaReady);}
   }
   // The 30% handoff must be continuous in both scroll directions.
   const cameras=[];
   for(const p of [.29999,.30,.30001,.30,.29999]){await page.evaluate(p=>__genesis.seek(p),p);cameras.push(await page.evaluate(()=>__genesis.state.camera));}
   for(let i=1;i<cameras.length;i++)assert(Math.hypot(...cameras[i].map((x,j)=>x-cameras[i-1][j]))<.002,'camera jumped at handoff');
   const view=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,fallback:!document.querySelector('#fallback').hidden}));
   assert(!view.overflow&&!view.fallback);assert.deepEqual(errors,[]);
   results.push({engine,name,frames:13,errors});await page.close();console.log('PASS',engine,name);
  }
  // Exercise real scroll with the existing spring, then reverse back to zero.
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true});
  await page.goto('http://localhost:5173/');await page.waitForFunction(()=>window.__genesis);
  for(const p of [.12,.23,.3,.8,.43,0]){
   await page.evaluate(p=>scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*p),p);
   await page.waitForFunction(p=>Math.abs(__genesis.state.progress-p)<.001,p);
  }
  await page.close();await browser.close();
 }
 fs.writeFileSync('captures/genesis03/verification.json',JSON.stringify(results,null,2));
 console.log('GENESIS 03 PASS: 104 rendered states; 8 engine/viewports; continuous 30% handoff and real scroll/reverse.');
})().catch(e=>{console.error(e);process.exitCode=1});
