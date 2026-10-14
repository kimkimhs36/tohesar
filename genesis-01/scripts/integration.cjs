const {chromium}=require('@playwright/test');
const fs=require('fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173/');await page.waitForFunction(()=>window.__genesis);
 const points=[];
 async function scroll(p){
  await page.evaluate(p=>scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*p/.48),p);
  await page.waitForFunction(p=>Math.abs(window.__genesis.state.progress-p)<.0002,p,{timeout:120000});
  return page.evaluate(()=>window.__genesis.state);
 }
 for(const p of [0,.23,.30,.40,.43,.48,.30,0]){
  const state=await scroll(p);points.push({p,state});
  if(p===.43){assert(state.revelation.alignmentError<.003);assert(state.revelation.depthRange>3);}
  if(p===.40)assert(state.revelation.alignmentError>.1);
 }
 assert(points.at(-1).state.morph.every(x=>x===0));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert(!overflow);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
 await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
 await page.waitForFunction(()=>window.__genesis.state.progress===.48);
 const reducedEnd=await page.evaluate(()=>window.__genesis.state);assert(reducedEnd.reduced);
 await page.evaluate(()=>scrollTo(0,0));await page.waitForFunction(()=>window.__genesis.state.progress===0);
 const noInterpolation=await page.evaluate(()=>window.__genesis.state.target===window.__genesis.state.progress);assert(noInterpolation);
 await page.evaluate(()=>document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
 await page.waitForFunction(()=>!document.querySelector('#fallback').hidden&&document.querySelector('#fallback img').naturalWidth>0);
 const result={browser:'Chromium software WebGL (not physical iPhone)',errors,nativeScrollAndReverse:true,alignmentVerified:true,reducedMotionShowsBothScenes:true,contextLossPoster:true,noHorizontalOverflow:!overflow,points};
 fs.writeFileSync('captures/g02-integration.json',JSON.stringify(result,null,2));assert.equal(errors.length,0);console.log('PASS: 0–48 native scroll, reverse, optical alignment, reduced-motion endpoints, context-loss poster; no JS errors.');
 }finally{await browser.close();}
})();
