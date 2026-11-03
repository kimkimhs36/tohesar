// Usage: node scripts/capture_living_gallery032.cjs http://127.0.0.1:4173 docs/living-gallery-032/after
const {chromium}=require('playwright');
const [base,out]=process.argv.slice(2);
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
for(const [name,url,selector] of [
 ['jaguar-hero','/journal/design/type-01/',null],
 ['jaguar-opening','/journal/design/type-01/','.type-opening-paper'],
 ['jaguar-profile','/journal/design/type-01/','.type-profile'],
 ['jaguar-language','/journal/design/type-01/','#different-language'],
 ['jaguar-comparison','/journal/design/type-01/','.type-study-intro'],
 ['jaguar-closing','/journal/design/type-01/','.type-closing-photo'],
 ['journal','/journal/','.atlas-invitation'],['issue','/journal/issues/001/','#chapter-04'],
 ['newsroom','/edition/','.desk-feature'],['archive','/edition/archive/','[data-archive-item]']]){
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});
 await page.goto(base+url,{waitUntil:'domcontentloaded'});
 if(selector){const el=page.locator(selector).first(); await el.scrollIntoViewIfNeeded();
  await page.evaluate(selector=>{const e=document.querySelector(selector);window.scrollTo(0,window.scrollY+e.getBoundingClientRect().top-68)},selector);}
 await page.waitForTimeout(250); await page.screenshot({path:`${out}/${name}.png`}); await page.close(); console.log(name);
} await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
