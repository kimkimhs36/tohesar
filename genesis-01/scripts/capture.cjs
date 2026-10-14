const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const result=[];
 for(const p of ['0','.23','.30']){
  await page.goto('http://localhost:5173/?p='+p);await page.waitForFunction(()=>window.__genesis && Math.abs(window.__genesis.state.progress-window.__genesis.state.target)<.0001);await page.waitForTimeout(300);
  await page.screenshot({path:`captures/mobile-${p}.png`});
  if(p==='0') await page.screenshot({path:'public/assets/poster.png',style:'header,.caption,.annotation,.scroll-hint{visibility:hidden}'});
  result.push({p,state:await page.evaluate(()=>window.__genesis?.state)});
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto('http://localhost:5173/?p=0');await page.waitForTimeout(1000);await page.screenshot({path:'captures/desktop-0.png'});
 fs.writeFileSync('captures/render-report.json',JSON.stringify({browser:'Chromium / SwiftShader; not real iPhone Safari',viewport:'390 × 844 @1x',errors,frames:result},null,2));
 console.log(JSON.stringify({errors,frames:result},null,2));await browser.close();
})();
