/* Browser acceptance: FIELD NOTES 001
   BASE_URL=http://127.0.0.1:8765 node tests/field-notes-browser.cjs */
const { chromium, webkit }=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.BASE_URL||'http://127.0.0.1:8765';
fs.mkdirSync('artifacts/field-notes',{recursive:true});
const checks=[
  {id:'chapter-911',name:'Porsche 911'},
  {id:'chapter-f40',name:'Ferrari F40'},
  {id:'chapter-giulia',name:'Alfa Romeo Giulia'}
];
(async()=>{
  for(const [engine,launcher] of [['chromium',chromium],['webkit',webkit]]){
    const browser=await launcher.launch(engine==='chromium'?{args:['--no-sandbox']}:{});
    try{
      for(const width of [320,390,768,1024,1440]){
        const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1,reducedMotion:'reduce'});
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        const response=await page.goto(base+'/journal/field-notes/001/',{waitUntil:'load',timeout:30000});
        assert.equal(response.status(),200,engine+' '+width+' page status');
        assert.equal(await page.locator('main h1').count(),1,'unique main headline');
        assert.equal(await page.locator('[data-chapter]').count(),3,'all three arguments');
        const layout=await page.evaluate(()=>{
          const root=document.documentElement;
          return {overflow:root.scrollWidth-root.clientWidth,viewport:root.clientWidth};
        });
        if(layout.overflow>2){
          const offenders=await page.evaluate(()=>{
            const w=document.documentElement.clientWidth;
            return [...document.body.querySelectorAll('*')]
              .map(el=>({tag:el.tagName,cls:String(el.className||'').slice(0,90),width:Math.round(el.getBoundingClientRect().width),right:Math.round(el.getBoundingClientRect().right),left:Math.round(el.getBoundingClientRect().left)}))
              .filter(el=>el.right>w+2||el.left< -2).slice(0,12);
          });
          console.error('OVERFLOW-DIAGNOSTICS '+engine+' '+width+': '+JSON.stringify(offenders));
        }
        assert.ok(layout.overflow<=2,engine+' '+width+' horizontal overflow '+JSON.stringify(layout));
        for(const chapter of checks){
          const c=page.locator('#'+chapter.id);
          assert.equal(await c.count(),1,chapter.name+' section absent');
        }
        const imageResult=await page.locator('main img').evaluateAll(async imgs=>{
          await Promise.all(imgs.map(async img=>{
            img.loading='eager';
            try{await img.decode()}catch{}
          }));
          return imgs.map(img=>({src:img.getAttribute('src'),loaded:img.naturalWidth>0,alt:!!img.alt}));
        });
        for(const img of imageResult){
          assert.ok(img.loaded,engine+' '+width+' broken image: '+img.src);
          assert.ok(img.alt,engine+' '+width+' missing alt: '+img.src);
        }
        // Real keyboard / in-page navigation: not just link presence.
        // The skip link must land at the article main landmark.
        const skip=page.locator('a.skip[href="#article"]');
        assert.equal(await skip.count(),1,engine+' '+width+' accessible skip link');
        await skip.focus();
        await page.keyboard.press('Enter');
        await page.waitForFunction(()=>location.hash==='#article');
        assert.equal(await page.locator('main#article').count(),1,'skip target exists');
        const chapterLink=page.locator('a[data-chapter-link][href="#chapter-giulia"]');
        await chapterLink.focus();
        await page.keyboard.press('Enter');
        await page.waitForFunction(()=>location.hash==='#chapter-giulia');
        assert.equal(await page.locator('#chapter-giulia h2').count(),1,'chapter anchor target exists');
        const progress=await page.locator('[data-read-progress]').getAttribute('aria-valuenow');
        assert.ok(Number(progress)>=0&&Number(progress)<=100,'accessible progress range');
        // Restore the actual cover before taking cover screenshots.
        await page.evaluate(()=>{history.replaceState(null,'',location.pathname);scrollTo(0,0)});
        assert.deepEqual(errors,[],engine+' '+width+' client errors');
        if(width===390||width===1440){
          await page.screenshot({path:'artifacts/field-notes/'+engine+'-'+width+'-cover.png',animations:'disabled'});
          await page.locator('#chapter-f40').scrollIntoViewIfNeeded();
          await page.screenshot({path:'artifacts/field-notes/'+engine+'-'+width+'-f40.png',animations:'disabled'});
          await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
          await page.waitForFunction(()=>Number(document.querySelector('[data-read-progress]').getAttribute('aria-valuenow'))>=95);
        }
        await page.close();
        console.log('PASS '+engine+' '+width+'px, photographs='+imageResult.length);
      }
      for(const entry of [{path:'/',label:'homepage'},{path:'/journal/',label:'journal index'}]){
        const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
        const res=await page.goto(base+entry.path,{waitUntil:'domcontentloaded',timeout:30000});
        assert.equal(res.status(),200,entry.label);
        const link=page.locator('.field-entry__cta[href="/journal/field-notes/001/"]');
        assert.equal(await link.count(),1,entry.label+' discovery link');
        await link.click();
        await page.waitForURL('**/journal/field-notes/001/',{timeout:10000});
        assert.match(await page.locator('main h1').innerText(),/어떤 차는/);
        await page.close();
        console.log('PASS '+engine+' '+entry.label+' -> field notes');
      }
      // Editorial integrity without JavaScript: readable copy, all three
      // chapters and navigation must remain available in the static document.
      const noJS=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
      try{
        const response=await noJS.goto(base+'/journal/field-notes/001/',{waitUntil:'load',timeout:30000});
        assert.equal(response.status(),200,engine+' no-JS HTTP');
        assert.equal(await noJS.locator('[data-chapter]').count(),3,engine+' no-JS chapters');
        assert.match(await noJS.locator('main h1').innerText(),/어떤 차는/);
        assert.equal(await noJS.locator('a[href="#chapter-giulia"]').count(),1,engine+' no-JS chapter navigation');
        assert.equal(await noJS.locator('a[href="/journal/"]').count()>0,true,engine+' no-JS return path');
        console.log('PASS '+engine+' no-JS article reading and navigation');
      }finally{await noJS.close()}
    }finally{await browser.close()}
  }
})().catch(err=>{console.error(err);process.exitCode=1});
