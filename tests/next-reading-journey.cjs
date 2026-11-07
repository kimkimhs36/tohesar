/* Each article leads into a relevant, credited next story, not a dead end. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium,webkit}=require('playwright');
const base=(process.env.BASE_URL||'http://127.0.0.1:8765').replace(/\/$/,'');
const shot=process.env.NEXT_SCREENSHOT_DIR||path.resolve('artifacts/next-reading');
const stories=[
  {from:'/journal/911/',to:'/journal/f40/',title:'바람이 지나갈'},
  {from:'/journal/f40/',to:'/journal/design/giulia/',title:'비례가'},
  {from:'/journal/design/giulia/',to:'/journal/design/type-01/',title:'새로운 시대의'},
  {from:'/journal/design/type-01/',to:'/journal/field-notes/001/',title:'어떤 차는'}
];
async function run(browser,name,viewport){
  const context=await browser.newContext({viewport,reducedMotion:'reduce',deviceScaleFactor:1});
  try{
    const page=await context.newPage();
    for(const story of stories){
      const res=await page.goto(base+story.from,{waitUntil:'load',timeout:30000});
      assert.equal(res.status(),200,story.from);
      const next=page.locator('[data-next-reading]');
      assert.equal(await next.count(),1,story.from+' must lead to exactly one new story');
      const destination=next.locator('.next-reading__cta');
      assert.equal(await destination.getAttribute('href'),story.to);
      assert.match(await next.locator('h2').innerText(),new RegExp(story.title));
      const photo=next.locator('img');
      await photo.scrollIntoViewIfNeeded();
      const decoded=await photo.evaluate(async img=>{
        img.loading='eager';
        await img.decode();
        return {width:img.naturalWidth,height:img.naturalHeight,rect:img.getBoundingClientRect().toJSON()};
      });
      assert.ok(decoded.width>=500&&decoded.height>=400,story.from+' next image is decoded');
      assert.ok(decoded.rect.width>200&&decoded.rect.right<=viewport.width+2,story.from+' next image is not clipped');
      assert.equal(await next.locator('figcaption a').count(),2,'photo author and license links stay visible');
      assert.ok(await next.locator('.next-reading__foot a[href="/journal/"]').isVisible());
      const positions=await next.evaluate(section=>{
        const image=section.querySelector('.next-reading__photo').getBoundingClientRect();
        const copy=section.querySelector('.next-reading__copy').getBoundingClientRect();
        return {image:{x:image.x,right:image.right,bottom:image.bottom},copy:{x:copy.x,top:copy.top},doc:document.documentElement.scrollWidth,width:innerWidth};
      });
      assert.ok(positions.doc<=positions.width+2,'page horizontal overflow '+story.from+' '+viewport.width);
      if(viewport.width<850)assert.ok(positions.image.bottom<=positions.copy.top+2,'mobile photo-first sequence '+story.from);
      else assert.ok(positions.image.right<=positions.copy.x+5,'landscape columns '+story.from);
      if(viewport.width===390){
        fs.mkdirSync(shot,{recursive:true});
        await next.screenshot({path:path.join(shot,name+'-'+story.from.replace(/\W+/g,'_')+'.png'),animations:'disabled'});
      }
      await destination.click();
      await page.waitForURL('**'+story.to,{timeout:20000});
      assert.ok(await page.locator('main').count()>=1,'next story loads '+story.to);
    }
    console.log('PASS',name,viewport.width+'px','four connected stories with decoded images');
  }finally{await context.close()}
}
(async()=>{
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
    const browser=await engine.launch({headless:true,args:name==='chromium'?['--no-sandbox']:[]});
    try{
      for(const viewport of [{width:390,height:844},{width:1194,height:834}])await run(browser,name,viewport);
    }finally{await browser.close()}
  }
})().catch(error=>{console.error('EDITORIAL CONTINUATION FAILED',error);process.exitCode=1});
