const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  for(const vp of [{width:390,height:844,name:'iphone'},{width:844,height:390,name:'landscape'}]){
   const page=await browser.newPage({viewport:vp,deviceScaleFactor:1,isMobile:true,hasTouch:true});
   let errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:5173/?p=0');await page.waitForFunction(()=>!!window.__genesis);
   let x0=0,x23=0;
   for(const p of [0,.23,.43]){
    await page.evaluate(v=>window.__genesis.seek(v),p);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const s=await page.evaluate(()=>{
     const bg=document.querySelector('#atmosphere');
     return {x:new DOMMatrix(getComputedStyle(bg.querySelector('.atmosphere-well--sky')).transform).m41,
      animation:getComputedStyle(bg.querySelector('.atmosphere-shape--sky')).animationName,
      progress:window.__genesis.state.progress,
      percent:document.querySelector('#percent').textContent,
      overflow:document.documentElement.scrollWidth>innerWidth}
    });
    assert(s.animation.includes('skyOrbit'));assert(!s.overflow);
    assert(Math.abs(s.progress-p)<.001);assert.equal(s.percent.slice(0,2),String(Math.round(p*100)).padStart(2,'0'));
    if(p===0)x0=s.x;if(p===.23)x23=s.x;
    await page.screenshot({path:'captures/gradient-'+vp.name+'-'+Math.round(p*100)+'.png'});
   }
   assert(Math.abs(x23-x0)>vp.width*.12,'Scroll gradient not visibly moving: '+x0+' -> '+x23);
   assert.deepEqual(errors,[]);console.log('ATMOSPHERE PASS',vp.name,'scroll delta',Math.round(x23-x0)+'px');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
