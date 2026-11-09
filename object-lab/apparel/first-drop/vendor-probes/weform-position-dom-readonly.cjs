/* TOHESAR SAFE DIAGNOSTIC: anonymous vendor option visibility only. No upload/cart/order. */
const P=require('C:/Users/kimki/AppData/Local/npm-cache/_npx/4b4c857f6efdfb61/node_modules/puppeteer');
const fs=require('fs'),path=require('path');const sleep=n=>new Promise(r=>setTimeout(r,n));
(async()=>{const b=await P.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox'],defaultViewport:{width:1420,height:1100}});
const p=await b.newPage();let out={source:'WEFORM BECANVAS product_no=10462',timestamp:new Date().toISOString(),noUpload:true,noOrder:true,actions:[],steps:[],errors:[]};
const snap=async(label)=>{const d=await p.evaluate(()=>{const qs=s=>[...document.querySelectorAll(s)];const texts=qs('label,button,input,select,div,span').filter(e=>/^(왼가슴.*|선택한 옵션 요약|인쇄 위치 선택.*|파일 첨부.*|선택된 인쇄 위치가 없습니다\.|총 합계 금액|인쇄 추가금 합계)$/.test((e.innerText||'').trim())||/^(print|dtf|position|upload|location)/i.test((e.id||'')+' '+(e.name||''))).slice(-45).map(e=>({tag:e.tagName,id:e.id,cls:String(e.className).slice(0,130),txt:(e.innerText||'').slice(0,190),outer:e.outerHTML.slice(0,1100),parent:e.parentElement?.outerHTML.slice(0,1900),grandparent:e.parentElement?.parentElement?.outerHTML.slice(0,2500),fullCard:e.parentElement?.parentElement?.parentElement?.outerHTML.slice(0,3500),visible:!!e.getClientRects().length}));return {texts,prices:qs('#totalProducts,#totalPrice,.print-summary,.selected-options-summary,.opt-summary').map(x=>({id:x.id,cls:x.className,text:x.innerText.slice(0,1200)})),positionContainers:qs('[class*=print],[class*=position],[class*=loc],[class*=opt]').filter(x=>(x.innerText||'').includes('왼가슴')&&(x.innerText||'').length<250).slice(-18).map(x=>({cls:String(x.className).slice(0,130),tag:x.tagName,text:x.innerText.slice(0,220),html:x.outerHTML.slice(0,2000)})),fileInputs:qs('input[type=file]').map(x=>x.outerHTML.slice(0,300))}});out.steps.push({label,...d});console.log(label,JSON.stringify({prices:d.prices,texts:d.texts.filter(x=>x.visible).map(x=>({tag:x.tag,id:x.id,txt:x.txt.slice(0,75)}))}).slice(0,2500));};
try{await p.goto('https://oasisent1.cafe24.com/product/detail.html?product_no=10462',{waitUntil:'domcontentloaded',timeout:30000});await sleep(900);
await p.select('#product_option_id1','2226');await sleep(500);out.actions.push('charcoal');
await p.select('#product_option_id2','2244');await sleep(800);out.actions.push('size M');
const boxes=await p.$$('.opt-radio-box');for(const el of boxes){if((await el.evaluate(e=>e.innerText)).includes('빠른 인쇄 (DTF)')){await el.click();out.actions.push('DTF');break}}
await sleep(700);await snap('dtf-before-position');
const op=await p.$('#addproduct_option_id_10596_1');if(op){await p.select('#addproduct_option_id_10596_1','P0000PRO000A');out.actions.push('selected supplemental chest option');await sleep(900)}
await snap('dtf-after-supplemental');
const pos=await p.$('.pos-chk-box[data-pos-id="1"]');out.positionCardFound=!!pos;out.actions.push('inspected position card only; DID NOT activate or upload');
out.configuration=await p.evaluate(()=>({
 selectedColor:document.querySelector('#product_option_id1')?.selectedOptions[0]?.textContent.trim()||null,
 selectedSize:document.querySelector('#product_option_id2')?.selectedOptions[0]?.textContent.trim()||null,
 dtfActive:[...document.querySelectorAll('.opt-radio-box')].some(x=>x.classList.contains('active')&&x.innerText.includes('빠른 인쇄 (DTF)')),
 supplementalChest:document.querySelector('#addproduct_option_id_10596_1')?.selectedOptions[0]?.textContent.trim()||null,
 positionCardPrice:Number(document.querySelector('.pos-chk-box[data-pos-id="1"]')?.dataset.price||NaN),
 positionCardSelected:document.querySelector('.pos-chk-box[data-pos-id="1"]')?.classList.contains('active')||false,
 supplierDisplayedBase:document.querySelector('#tnt-base-price-display')?.innerText||null,
 supplierDisplayedInk:document.querySelector('#tnt-add-price-display')?.innerText||null,
 supplierDisplayedTotal:document.querySelector('#tnt-total-price-display')?.innerText||null,
 emptyPrintSummary:(document.querySelector('.summary-tags')?.innerText||'').includes('선택된 인쇄 위치가 없습니다')
}));
out.gates={charcoal:out.configuration.selectedColor==='차콜',sizeM:out.configuration.selectedSize==='M',dtf:out.configuration.dtfActive,leftChestOption:/왼가슴/.test(out.configuration.supplementalChest||''),leftChestCard:out.positionCardFound&&out.configuration.positionCardPrice===2000,editorPreviewAccepted:false,uploaded:false,checkoutTotalConfirmed:false};
out.gates.structurePass=Object.values(out.gates).slice(0,5).every(Boolean);
await p.screenshot({path:path.join(__dirname,'WEFORM-PRINT-DOM-SAFE.png')});
}catch(e){out.errors.push(String(e.stack||e).slice(0,1400))}
fs.writeFileSync(path.join(__dirname,'WEFORM-PRINT-DOM-READONLY.json'),JSON.stringify(out,null,2));
console.log('DONE '+JSON.stringify({actions:out.actions,errors:out.errors,steps:out.steps.map(x=>({label:x.label,texts:x.texts.length,files:x.fileInputs.length}))}));await b.close()})()
