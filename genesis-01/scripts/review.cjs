const {chromium}=require('@playwright/test');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://localhost:5173/?p=0');await page.waitForFunction(()=>window.__genesis);
 const frames=[];
 for(const p of (process.env.FRAMES||'0,.23,.30,.37,.40,.43,.48').split(',').map(Number)){
  await page.evaluate(p=>window.__genesis.seek(p),p);
  await page.waitForFunction(p=>Math.abs(window.__genesis.state.progress-p)<.00001,p);
  if(p>.30)await page.waitForFunction(()=>window.__genesis.state.mediaReady);
  await page.screenshot({path:`captures/g02-mobile-${Math.round(p*100)}.png`});
  frames.push({p,state:await page.evaluate(()=>window.__genesis.state)});
 }
 fs.writeFileSync('captures/g02-review.json',JSON.stringify({browser:'Chromium SwiftShader; NOT real iPhone Safari',viewport:'390×844',errors,frames},null,2));
 console.log(JSON.stringify({errors,frames},null,2));
 }finally{await browser.close();}
})();
