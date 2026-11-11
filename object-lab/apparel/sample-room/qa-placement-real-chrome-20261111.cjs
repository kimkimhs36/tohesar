const p=require(process.env.TOHESAR_PUPPETEER||'puppeteer');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const pause=t=>new Promise(r=>setTimeout(r,t));
(async()=>{
 const dir=__dirname,html=path.join(dir,'SAMPLE-DECISION-ROOM-20261110.html'),dl=path.join(dir,'downloads');
 fs.mkdirSync(dl,{recursive:true});for(const f of fs.readdirSync(dl))if(f.endsWith('.json'))fs.unlinkSync(path.join(dl,f));
 const b=await p.launch({executablePath:process.env.TOHESAR_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
 const result={ranAt:new Date().toISOString(),test:'01 SHADOW placement review live Chrome',desktop:[],mobile:[],javascriptErrors:[],unexpectedNetwork:[],downloadedBriefs:[],overallPass:false};
 try{
  for(const size of [{name:'desktop',w:1440,h:1000},{name:'mobile',w:390,h:844}]){
   const page=await b.newPage();await page.setViewport({width:size.w,height:size.h,deviceScaleFactor:1});
   const cdp=await page.createCDPSession();await cdp.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:dl});
   page.on('pageerror',e=>result.javascriptErrors.push(e.message));
   page.on('request',req=>{if(!/^(file:|data:|blob:)/.test(req.url()))result.unexpectedNetwork.push(req.url())});
   await page.goto('file:///'+html.replaceAll('\\','/'),{waitUntil:'load'});
   let state=await page.evaluate(()=>({panel:!document.getElementById('placementPanel').hidden,mode:document.querySelector('[data-placement][aria-pressed=true]')?.dataset.placement||null,empty:document.getElementById('placementGraphic').hidden,logoPathMatch:document.querySelector('.brandmark path').getAttribute('d')===document.querySelector('#placementGraphic svg path').getAttribute('d'),over:document.documentElement.scrollWidth>innerWidth+5}));
   assert(state.panel&&!state.mode&&state.empty&&state.logoPathMatch&&!state.over,'initial state failed');
   await page.click('[data-placement="left-chest"]');
   await page.evaluate(()=>{const s=document.getElementById('leftOffset');s.value='120';s.dispatchEvent(new Event('input',{bubbles:true}))});
   state=await page.evaluate(()=>({mode:document.querySelector('[data-placement][aria-pressed=true]').dataset.placement,left:parseFloat(document.getElementById('placementGraphic').style.left),widthPct:parseFloat(document.getElementById('placementGraphic').style.width),state:document.getElementById('placementState').textContent}));
   assert(state.mode==='left-chest'&&Math.abs(state.left-(50+120/580*100))<0.01&&Math.abs(state.widthPct-82/580*100)<0.01&&state.state.includes('120 mm'),'left-chest geometry failed');
   result[size.name].push({case:'left-chest original path and 120 mm offset',passed:true,leftPct:state.left,widthPct:state.widthPct});
   await page.click('[data-placement="center-front"]');
   state=await page.evaluate(()=>({left:document.getElementById('placementGraphic').style.left,disabled:document.getElementById('leftOffset').disabled,state:document.getElementById('placementState').textContent}));
   assert(state.left==='50%'&&state.disabled&&state.state.includes('90'),'center behavior wrong');
   result[size.name].push({case:'center front and isolated 90mm datum',passed:true});
   await page.click('[data-placement="left-chest"]');
   await page.evaluate(()=>{[...document.querySelectorAll('#sizes button')].find(e=>e.textContent==='L').click()});
   state=await page.evaluate(()=>({size:document.getElementById('testSize').textContent,logoPercent:parseFloat(document.getElementById('placementGraphic').style.width),price:document.getElementById('scenarioAmount').textContent,over:document.documentElement.scrollWidth>innerWidth+5}));
   assert(state.size==='L'&&Math.abs(state.logoPercent-82/610*100)<0.01&&state.price.includes('PRICE NOT VERIFIED')&&!state.over,'size-dependent placement wrong');
   result[size.name].push({case:'L size proportional width, no unverified price',passed:true,widthPct:state.logoPercent});
   for(const f of fs.readdirSync(dl))if(f.endsWith('.json'))fs.unlinkSync(path.join(dl,f));
   await page.click('#exportSampleBrief');
   let files=[];for(let i=0;i<70;i++){files=fs.readdirSync(dl).filter(f=>f.endsWith('.json'));if(files.length)break;await pause(100)}
   assert(files.length===1,'download missing');
   let brief=JSON.parse(fs.readFileSync(path.join(dl,files[0]),'utf8'));assert(brief.placementReview.candidate==='left-chest'&&brief.placementReview.lateralOffsetMm===120&&brief.placementReview.verticalNeckOffsetMm===null&&brief.placementReview.ownerApproved===false&&brief.approvals.payment===false,'exported placement invalid');
   result.downloadedBriefs.push({viewport:size.name,product:'01',candidate:brief.placementReview.candidate,ownerApproved:brief.placementReview.ownerApproved});
   await page.screenshot({path:path.join(dir,'PR38-SHADOW-PLACEMENT-'+size.name+'-QA.png'),fullPage:true});
   await page.evaluate(()=>{[...document.querySelectorAll('#choices button')].find(x=>x.innerText.includes('07')).click()});
   assert(await page.evaluate(()=>document.getElementById('placementPanel').hidden),'placement panel should hide outside 01');
   for(const f of fs.readdirSync(dl))if(f.endsWith('.json'))fs.unlinkSync(path.join(dl,f));
   await page.click('#exportSampleBrief');
   for(let i=0;i<70;i++){files=fs.readdirSync(dl).filter(f=>f.endsWith('.json'));if(files.length)break;await pause(100)}
   brief=JSON.parse(fs.readFileSync(path.join(dl,files[0]),'utf8'));assert(brief.sku===9337&&brief.placementReview===null,'non01 export falsely inherited placement');
   result[size.name].push({case:'other products unaffected',passed:true});
   await page.close();
  }
  assert(result.javascriptErrors.length===0&&result.unexpectedNetwork.length===0,'runtime errors or network activity');
  result.overallPass=true;
 }finally{await b.close();fs.writeFileSync(path.join(dir,'PR38-SHADOW-PLACEMENT-REAL-CHROME-QA.json'),JSON.stringify(result,null,2))}
 console.log(JSON.stringify({pass:result.overallPass,desktop:result.desktop,mobile:result.mobile,downloads:result.downloadedBriefs,errors:result.javascriptErrors,unexpectedNetwork:result.unexpectedNetwork},null,2));
})().catch(e=>{console.error(e.stack);process.exit(1)});