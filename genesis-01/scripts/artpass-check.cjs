/* GENESIS optical art-pass smoke test; Chromium software WebGL only. */
const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={engine:'Chromium SwiftShader; not iPhone Safari',errors:[],viewports:[]};
 try{
  for(const item of [
   {name:'portrait',w:390,h:844,frames:[0,.23,.25,.27,.30,.40,.41,.43,.48,.55,.61,.70,.8,.95,1]},
   {name:'landscape',w:844,h:390,frames:[0,.23,.43,.48,.61,.8,1]},
   {name:'desktop',w:1440,h:900,frames:[0,.43,.48,.61,.8,1]}
  ]){
   const page=await browser.newPage({viewport:{width:item.w,height:item.h},hasTouch:item.w<900,isMobile:item.w<900,deviceScaleFactor:1});
   page.on('pageerror',e=>report.errors.push(item.name+': '+e.message));
   page.on('console',m=>{if(m.type()==='error')report.errors.push(item.name+': '+m.text());});
   await page.goto('http://localhost:5173/?p=0');
   await page.waitForFunction(()=>window.__genesis);
   const row={viewport:item.name,size:item.w+'x'+item.h,frames:[]};
   for(const p of item.frames){
    await page.evaluate(p=>window.__genesis.seek(p),p);
    // seek() sets progress synchronously, BEFORE the next WebGL draw.
    // Wait for two real animation frames and for pose() to update the DOM.
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.waitForFunction(p=>document.querySelector('#percent').textContent.startsWith(String(Math.round(p*100)).padStart(2,'0')),p);
    await page.waitForFunction(p=>Math.abs(window.__genesis.state.progress-p)<.00002,p);
    // On-demand rendering may upload the asynchronous image after the exact
    // 30% crossing; record the frame first, then gate on the resolved 43% image.
    if(p>=.37) {
      try { await page.waitForFunction(()=>window.__genesis.state.mediaReady,{},{timeout:10000}); }
      catch { console.log('MEDIA_WAIT',item.name,p,await page.evaluate(()=>window.__genesis.state)); }
    }
    await page.screenshot({path:'captures/artpass-'+item.name+'-'+Math.round(p*100)+'.png'});
    const state=await page.evaluate(()=>window.__genesis.state);
    row.frames.push({p,cameraZ:state.camera[2],edgeOpacity:state.revelation.edgeOpacity,gutter:state.revelation.opticalGutter,alignmentError:state.revelation.alignmentError,depth:state.revelation.depthRange});
    if(p===.43){
      assert(state.mediaReady,'journal texture was not uploaded in 3D');
      assert(state.revelation.alignmentError<.003,'alignment error');
      assert(state.revelation.depthRange>3,'depth must remain 3D');
      assert(state.revelation.edgeOpacity<.001,'resolved photograph must hide registration borders');
      assert(state.revelation.opticalGutter>1,'optical tiles must close');
    }
    if(p===.23&&item.name==='portrait')assert(state.camera[2]>9,'portrait should not over-zoom early');
   }
   const view=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,wordmark:document.querySelector('header img').getBoundingClientRect().toJSON()}));
   assert(!view.overflow,item.name+' horizontal overflow');
   assert(view.wordmark.left>=0&&view.wordmark.right<=item.w,'wordmark outside viewport');
   report.viewports.push(row);
   await page.close();
  }
  assert.equal(report.errors.length,0,'Browser runtime errors');
  fs.writeFileSync('captures/artpass-report.json',JSON.stringify(report,null,2));
  console.log('ARTPASS PASS: '+report.viewports.length+' viewports; '+report.viewports.reduce((s,v)=>s+v.frames.length,0)+' rendered frames.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
