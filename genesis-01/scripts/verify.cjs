const {chromium}=require('@playwright/test');
const fs=require('fs');
(async()=>{
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5173/');await page.waitForFunction(()=>window.__genesis);
await page.screenshot({path:'public/assets/poster.png',style:'header,.caption,.annotation,.scroll-hint{visibility:hidden}'});
await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
await page.waitForFunction(()=>window.__genesis.state.progress>.2999,{},{timeout:120000});
const end=await page.evaluate(()=>window.__genesis.state);
if(end.camera[2]>=0||end.morph.some(x=>x<.999))throw Error('Passage did not finish');
await page.evaluate(()=>scrollTo(0,0));await page.waitForFunction(()=>window.__genesis.state.progress<.0001,{},{timeout:120000});
const reverse=await page.evaluate(()=>window.__genesis.state);
await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
await page.waitForTimeout(300);const reduced=await page.evaluate(()=>window.__genesis.state);if(reduced.target!==0)throw Error('Reduced motion failed');
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Horizontal overflow');
await page.evaluate(()=>document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
await page.waitForFunction(()=>!document.querySelector('#fallback').hidden);
await page.waitForFunction(()=>{const i=document.querySelector('#fallback img');return i.complete&&i.naturalWidth>0;});
const poster=true;
const report={browser:'Chromium software WebGL, not real Safari',nativeScrollPassage:true,reversible:true,reducedMotion:true,noHorizontalOverflow:!overflow,contextLossPoster:poster,errors,end,reverse,reduced};
fs.writeFileSync('captures/interaction-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(errors.length)throw Error('Browser errors');
}finally{await browser.close()}
})();
