/* Source-backed viewport evidence. Phone/iPad labels are dimensions, not hardware. */
const {chromium,webkit}=require('playwright');
const sharp=require('sharp'),fs=require('node:fs'),assert=require('node:assert/strict');
const root=process.env.REVIEW_DIR||'docs/wallpaper-011-review';
const base=process.env.BASE_URL||'http://127.0.0.1:8000';
const before=process.env.BEFORE_URL||'http://127.0.0.1:8001';
const sizes=[[320,667],[390,844],[430,932],[820,1180],[1180,820],[1440,900]];
const engines=(process.env.BROWSERS||'chromium,webkit').split(',');
async function ready(p,url){
  assert([200,304].includes((await p.goto(url)).status()),url);
  await p.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';for(const i of document.images)i.loading='eager';await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});
  await p.waitForTimeout(100);
}
async function at(p,sel,offset=0){await p.locator(sel).first().evaluate((el,offset)=>scrollTo(0,el.getBoundingClientRect().top+scrollY+offset),offset);await p.waitForTimeout(100)}
async function inspect(p){return p.evaluate(()=>({
  overflow:document.documentElement.scrollWidth>innerWidth,
  broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),
  visibleCars:[...document.querySelectorAll('[data-wallpaper-car]')].filter(e=>{let r=e.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&r.left<innerWidth&&r.right>0}).length,
  manuscriptVisible:[...document.querySelectorAll('.wallpaper-reading p')].some(e=>{let r=e.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}),
  scroll:scrollY
}))}
async function snap(p,name,records){let state=await inspect(p);assert.equal(state.overflow,false,name);assert.deepEqual(state.broken,[],name);await sharp(await p.screenshot()).webp({quality:87}).toFile(root+'/'+name+'.webp');records.push({name,route:new URL(p.url()).pathname,viewport:p.viewportSize(),...state})}
(async()=>{
  fs.mkdirSync(root,{recursive:true});let results=[];
  for(const engine of engines){
    const b=await(engine==='webkit'?webkit.launch({executablePath:process.env.WEBKIT_EXECUTABLE_PATH||undefined}):chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}));
    const p=await b.newPage({deviceScaleFactor:1,hasTouch:true});let errors=[],records=[];
    p.on('pageerror',e=>errors.push(e.message));
    for(const [width,height] of sizes){
      await p.setViewportSize({width,height});
      await p.emulateMedia({reducedMotion:'reduce'});
      await ready(p,before+'/journal/911/');await at(p,'.story-opening',-90);await snap(p,`${engine}-${width}-before`,records);
      await ready(p,base+'/journal/911/');await at(p,'.story-opening',-90);await snap(p,`${engine}-${width}-opening`,records);
      await at(p,'#wallpaper-living',90);let state=await inspect(p);assert(state.visibleCars>=5&&state.manuscriptVisible);
      await snap(p,`${engine}-${width}-living-static`,records);
      await at(p,'#wallpaper-ending',100);await snap(p,`${engine}-${width}-ending`,records);
      if([390,1180].includes(width)){
        for(const [d,sel] of [['/journal/issues/001/','#wallpaper-issue-curve .chapter-copy'],['/journal/issues/001/','#wallpaper-issue-small .chapter-copy'],['/journal/design/giulia/','#wallpaper-giulia-stance'],['/journal/f40/','#wallpaper-planes .story-chapter']]){
          await ready(p,base+d);await at(p,sel,-65);await snap(p,`${engine}-${width}-${sel.includes('small')?'issue-small':d.includes('issues')?'issue':d.includes('giulia')?'giulia':'f40'}`,records);
        }
      }
    }
    await p.setViewportSize({width:390,height:844});await p.emulateMedia({reducedMotion:'no-preference'});
    await ready(p,base+'/journal/911/');let poses=[];
    for(const [label,offset] of [['start',0],['middle',190],['end',380],['reverse',190]]){
      await at(p,'#wallpaper-living',offset);
      poses.push(await p.locator('#wallpaper-living').evaluate(e=>({progress:e.dataset.progress,transforms:[...e.querySelectorAll('[data-wallpaper-car]')].map(c=>c.style.transform)})));
      await snap(p,`${engine}-390-motion-${label}`,records);
    }
    assert.deepEqual(poses[1],poses[3],'reverse restores exactly');assert.notDeepEqual(poses[0],poses[2]);
    await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);
    assert(await p.locator('[data-wallpaper-car]').evaluateAll(es=>es.every(e=>!e.style.transform)));
    await snap(p,`${engine}-390-reduced`,records);
    await p.emulateMedia({reducedMotion:'no-preference'});await p.setViewportSize({width:844,height:390});await at(p,'#wallpaper-living',50);await snap(p,`${engine}-844-rotated`,records);
    await ready(p,base+'/journal/miniatures/');assert.equal(await p.locator('.passage-archive').getAttribute('open'),null);await p.locator('.passage-archive>summary').click();await at(p,'#miniature-passage');assert(await p.locator('#miniature-passage').isVisible());
    await p.setViewportSize({width:390,height:844});await ready(p,before+'/journal/911/');await at(p,'#miniature-passage');await snap(p,`${engine}-390-old-passage`,records);
    const nj=await b.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});await ready(nj,base+'/journal/911/');await at(nj,'#wallpaper-living',90);await snap(nj,`${engine}-390-no-js`,records);assert((await inspect(nj)).visibleCars>=5);await nj.close();
    assert.deepEqual(errors,[]);results.push({engine,version:b.version(),physicalDevice:false,errors,records,poses});await b.close();
  }
  fs.writeFileSync(root+'/checks.json',JSON.stringify({base,before,results},null,2));console.log('Rendered and checked wallpaper: '+engines.join(', '));
})().catch(e=>{console.error(e);process.exit(1)});
