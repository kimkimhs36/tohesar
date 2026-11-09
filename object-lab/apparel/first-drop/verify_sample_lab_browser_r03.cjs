#!/usr/bin/env node
'use strict';
/**
 * End-to-end actual Chromium browser QA for the EXISTING SAMPLE-LAB.html.
 * Produces desktop/mobile screenshots of REAL offline local file (not AI mockups).
 * Vendor external links are not clicked; no upload/payment/personal data involved.
 */
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const base=__dirname;
const out=path.join(base,'exports','01-shadow-uniform','sample-lab-browser-proof-r03');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  const url=pathToFileURL(path.join(base,'SAMPLE-LAB.html')).href;
  const desktop=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const failures=[];
  desktop.on('pageerror', e=>failures.push('desktop JS: '+e.message));
  await desktop.goto(url,{waitUntil:'load'});
  await desktop.locator('#fitSize').waitFor();
  assert.equal(await desktop.locator('#styleTitle').innerText(),'01 / SHADOW UNIFORM');
  assert.equal(await desktop.locator('#blankFit').isVisible(),true);
  assert.equal(await desktop.locator('#gateResult').innerText(),'0 / 8');
  const imageLoaded=await desktop.locator('.hero img').evaluate(img=>img.complete&&img.naturalWidth>0);
  assert.equal(imageLoaded,true,'04 original engineering SVG must load (historically broken PNG)');
  await desktop.locator('#fitSize').selectOption('M');
  for(const [id,val] of [['fitShoulder','50'],['fitChest','55'],['fitLength','69'],['fitSleeve','20']])await desktop.locator('#'+id).fill(val);
  let comparison=await desktop.locator('#fitTable').innerText();
  for(const expected of ['54 cm','58 cm','71 cm','21 cm','+4 cm','+3 cm','+2 cm','+1 cm'])assert(comparison.includes(expected),'Missing fit data '+expected);
  assert.match(await desktop.locator('#fitDecision').innerText(),/구매 승인·재고 보증이 아니야/);
  await desktop.reload({waitUntil:'load'});
  assert.equal(await desktop.locator('#fitSize').inputValue(),'M','Local size choice persists without external service');
  await desktop.locator('#tab04').click();
  assert.equal(await desktop.locator('#blankFit').isVisible(),false);
  assert.equal(await desktop.locator('#styleTitle').innerText(),'04 / OFFSET SHELL');
  await desktop.locator('#tab01').click();
  assert.equal(await desktop.locator('#blankFit').isVisible(),true);
  await desktop.screenshot({path:path.join(out,'SHADOW-R03-DESKTOP-1440.png'),fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  mobile.on('pageerror', e=>failures.push('mobile JS: '+e.message));
  await mobile.goto(url,{waitUntil:'load'});
  assert.equal(await mobile.locator('#blankFit').isVisible(),true);
  assert.equal(await mobile.locator('#styleTitle').innerText(),'01 / SHADOW UNIFORM');
  await mobile.locator('#fitSize').selectOption('S');
  await mobile.locator('#fitChest').fill('55');
  await mobile.screenshot({path:path.join(out,'SHADOW-R03-MOBILE-390.png'),fullPage:true});
  const overflow=await mobile.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  assert(overflow.scrollWidth<=overflow.innerWidth+4,'Unexpected mobile horizontal overflow: '+JSON.stringify(overflow));
  assert.equal(failures.length,0,'Unexpected JavaScript errors: '+failures.join(' ; '));
  const result={status:'PASS_BROWSER_FILE_RENDER',environment:'Playwright Chromium from actual GitHub source offline',testedAt:new Date().toISOString(),desktop:{viewport:[1440,1000],loadedExistingEngineeringSvg:imageLoaded,defaultRoute:'01',sourceBasedSizeChart:true,persistentOwnedShirtMeasurements:true,photo:'SHADOW-R03-DESKTOP-1440.png'},mobile:{viewport:[390,844],scrollWidth:overflow.scrollWidth,innerWidth:overflow.innerWidth,noHorizontalOverflow:true,photo:'SHADOW-R03-MOBILE-390.png'},outsideUploads:false,checkout:false,physicalGarment:false};
  fs.writeFileSync(path.join(out,'BROWSER-R03-QC.json'),JSON.stringify(result,null,2)+'\n');
  console.log('PASS / real browser desktop+mobile sample-lab:',JSON.stringify(result));
 } finally { await browser.close(); }
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
