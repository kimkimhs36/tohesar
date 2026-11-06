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
    }finally{await browser.close()}
  }
})().catch(err=>{console.error(err);process.exitCode=1});
