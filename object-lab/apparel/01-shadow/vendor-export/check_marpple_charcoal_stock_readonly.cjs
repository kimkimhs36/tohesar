/**
 * TOHEŞAR OBJECT LAB — Marpple charcoal stock observer.
 * Public anonymous pages only; NEVER uploads artwork, opens checkout, contacts seller or orders.
 * Requires: Node 18+, puppeteer, installed Chrome. Set TOHESAR_PUPPETEER for a custom package path.
 */
const fs=require('node:fs');
const path=require('node:path');
const puppeteer=require(process.env.TOHESAR_PUPPETEER||'puppeteer');
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));
const products=[
  {id:8178,model:'Becanvas pigment oversized T-shirt',purpose:'01 SHADOW'},
  {id:9337,model:'Becanvas pigment oversized crewneck',purpose:'07 exploration'}
];
(async()=>{
 const browser=await puppeteer.launch({
  executablePath:process.env.TOHESAR_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:true,args:['--no-sandbox'],defaultViewport:{width:1400,height:940}
 });
 const result={checkedAtUtc:new Date().toISOString(),mode:'read-only anonymous',artUploaded:false,cart:false,ordered:false,contact:false,products:[]};
 for(const prod of products){
  const page=await browser.newPage();
  const item={id:prod.id,model:prod.model,purpose:prod.purpose,
   url:'https://www.marpple.com/kr/product/detail?bp_id='+prod.id,errors:[]};
  try{
   const response=await page.goto(item.url,{waitUntil:'domcontentloaded',timeout:45000});
   item.status=response?.status();
   await page.waitForSelector('[data-rune="MarpplizerOptionSelectbox"]',{timeout:30000});
   await sleep(1100);
   const clicked=await page.evaluate(()=>{
    const container=document.querySelector('[data-rune="MarpplizerOptionSelectbox"]');
    const opener=container?.querySelector('button[class*="header__"]');
    if(!opener)return 'COLOR_MENU_NOT_FOUND';
    opener.click();
    return 'OPENED_COLOR_MENU';
   });
   if(clicked!=='OPENED_COLOR_MENU')throw Error(clicked);
   await sleep(350);
   const chosen=await page.evaluate(()=>{
    const container=document.querySelector('[data-rune="MarpplizerOptionSelectbox"]');
    const button=[...(container?.querySelectorAll('button')||[])].find(e=>e.innerText.trim()==='차콜');
    if(!button)return 'CHARCOAL_NOT_FOUND';
    button.click();
    return 'CHARCOAL_SELECTED';
   });
   if(chosen!=='CHARCOAL_SELECTED')throw Error(chosen);
   await sleep(3300); // REQUIRED: delayed inventory transition observed up to 1.8 s; never trust immediate sold-out state
   Object.assign(item,await page.evaluate(()=>{
    const text=document.body.innerText;
    const color=document.querySelector('[data-rune="MarpplizerOptionSelectbox"] button[class*="header__"]')?.innerText.trim();
    const sizeButtons=[...document.querySelectorAll('button[class*="item__a06c94b4"]')].filter(el=>el.getClientRects().length).slice(0,6);
    return {selectedColor:color,unitPriceKRW:Number((text.match(/1개당\s*([\d,]+)원/)||[])[1]?.replace(/,/g,''))||null,
      displayedShippingKRW:Number((text.match(/배송비\s*([\d,]+)원/)||[])[1]?.replace(/,/g,''))||null,
      qtyOneText:/1개부터 주문 가능/.test(text),
      sizes:sizeButtons.map(e=>({size:e.innerText.trim().split('\n')[0],soldOut:e.disabled})),
      cartButtonEnabled:!document.querySelector('button[class*="cart_button"]')?.disabled
     };
   }));
   if(item.selectedColor!=='차콜'||item.sizes.length===0)throw Error('incomplete color or size state');
   await sleep(850);
   const confirmation=await page.evaluate(()=>({
    color:document.querySelector('[data-rune="MarpplizerOptionSelectbox"] button[class*="header__"]')?.innerText.trim(),
    stock:[...document.querySelectorAll('button[class*="item__a06c94b4"]')].filter(el=>el.getClientRects().length).slice(0,6).map(el=>el.disabled)
   }));
   item.stockReadStable=confirmation.color===item.selectedColor&&JSON.stringify(item.sizes.map(s=>s.soldOut))===JSON.stringify(confirmation.stock);
   item.stockInterpretation=!item.stockReadStable?'loading/unstable — do not infer sold out':item.sizes.every(s=>s.soldOut)?'all size buttons disabled after checks — recheck':'size controls selectable in browser — final stock unconfirmed';

  }catch(e){item.errors.push(String(e).slice(0,400))}
  result.products.push(item);
  await page.close();
 }
 await browser.close();
 const dest=path.join(__dirname,'MARPPLE-CHARCOAL-LIVE-READONLY-LATEST.json');
 fs.writeFileSync(dest,JSON.stringify(result,null,2),'utf8');
 console.log(JSON.stringify(result,null,2));
})().catch(err=>{console.error(err);process.exit(1)});
