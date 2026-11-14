/* Anonymous one-piece O-SEAN AP-048 option selection only. No cart/order/upload/contact. */
const P=require('C:/Users/kimki/AppData/Local/npm-cache/_npx/4b4c857f6efdfb61/node_modules/puppeteer');const fs=require('fs'),path=require('path');const delay=n=>new Promise(r=>setTimeout(r,n));
(async()=>{const b=await P.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox'],defaultViewport:{width:1450,height:950}});let p=await b.newPage();let o={at:new Date().toISOString(),seller:'O-SEAN',product:'AP-048',noOrder:true,noContact:true,noUpload:true,actions:[],errors:[]};
let read=async tag=>{await delay(450);let x=await p.evaluate(()=>({body:document.body.innerText.split('\n').map(x=>x.trim()).filter(Boolean).filter(x=>/^(빈티지 피그먼트|색상|사이즈|차콜|블랙|S$|M$|L$|XL$|수량|예상 금액|기본가|배송비|인쇄비|1장|[0-9,]+원|\(VAT 별도\)|1,000장|[0-9,]+장)/.test(x)).slice(0,45),inputs:[...document.querySelectorAll('input')].map(x=>({aria:x.getAttribute('aria-label'),value:x.value})),menus:[...document.querySelectorAll('[role=option],button')].filter(x=>x.getClientRects().length && /^(차콜|M|L|XL|S|블랙|샌드 베이지)$/.test(x.innerText.trim())).map(x=>({tag:x.tagName,txt:x.innerText.slice(0,40),outer:x.outerHTML.slice(0,200)})).slice(0,18)}));o.actions.push({step:tag,...x});};
try{await p.goto('https://o-sean.io/category/item/AP-048',{waitUntil:'domcontentloaded',timeout:23000});await delay(1000);
await p.evaluate(()=>{const btn=[...document.querySelectorAll('button')].find(x=>x.innerText.trim().startsWith('색상'));if(btn)btn.click()});await read('color-options');
let chosen=await p.evaluate(()=>{let es=[...document.querySelectorAll('[role=option],button')].filter(x=>x.getClientRects().length&&x.textContent.trim()==='차콜');const e=es[0];if(e){e.click();return e.outerHTML.slice(0,280)}return null});o.selectedCharcoal=!!chosen;
await p.evaluate(()=>{const btn=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()==='사이즈');if(btn)btn.click()});await read('size-options');
chosen=await p.evaluate(()=>{let es=[...document.querySelectorAll('[role=option],button')].filter(x=>x.getClientRects().length&&x.textContent.trim()==='M');const e=es[0];if(e){e.click();return e.outerHTML.slice(0,280)}return null});o.selectedM=!!chosen;
let el=await p.$('input[aria-label="수량 직접 입력"]');if(el){await p.$eval('input[aria-label="수량 직접 입력"]',e=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(e,'1');e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));e.blur()});o.qtyOne=true}
await read('final-anonymous-onepiece');
o.printDropdown=await p.evaluate(()=>{const all=[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length);const btn=all.find(x=>x.innerText.includes('인쇄')&&x.innerText.includes('없음'));if(btn){btn.click();return btn.outerHTML.slice(0,600)}return null});
await delay(450);
o.printMethods=await p.evaluate(()=>[...document.querySelectorAll('[role=option],button,input,label')].filter(e=>e.getClientRects().length&&/전사|실크|소형|중형|대형|인쇄 없음|자수|70mm/.test((e.innerText||'').trim())).slice(0,25).map(e=>({tag:e.tagName,text:e.innerText.slice(0,100),outer:e.outerHTML.slice(0,400)})));
o.selectedSmallPrint=await p.evaluate(()=>{const e=[...document.querySelectorAll('[role=option]')].find(x=>x.getClientRects().length&&x.innerText.trim().startsWith('인쇄 소형'));if(e){e.click();return true}return false});
await read('charcoal-M-onepiece-smallprint-estimate');
await p.screenshot({path:path.join(__dirname,'05-OSEAN-CHARCOAL-M-QTY1-ESTIMATE-NO-ORDER.png'),fullPage:false});
o.quoteScroll=await p.evaluate(()=>{const el=[...document.querySelectorAll('div,span')].find(x=>x.children.length===0&&x.innerText?.trim()==='예상 금액');if(el){el.scrollIntoView({block:'center'});return true}return false});
await p.screenshot({path:path.join(__dirname,'05-OSEAN-CHARCOAL-M-PRINTED-PRICE-PROOF.png'),fullPage:false});
}catch(e){o.errors.push(String(e.stack||e).slice(0,1000))}
fs.writeFileSync(path.join(__dirname,'05-OSEAN-CHARCOAL-M-QTY1-GATE.json'),JSON.stringify(o,null,2));
console.log(JSON.stringify({charcoal:o.selectedCharcoal,sizeM:o.selectedM,one:o.qtyOne,last:o.actions.at(-1),errors:o.errors}).slice(0,6000));await b.close()})();
