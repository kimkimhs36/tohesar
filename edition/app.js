/* TOHEŞAR EDITION — progressively enhanced source index.
   Third-party content is inserted with textContent, never innerHTML. */
(() => {
  "use strict";
  const $ = (query,root=document) => root.querySelector(query);
  const $$ = (query,root=document) => [...root.querySelectorAll(query)];
  const storageKey="tohesar:edition:saved:v1";
  const permitted = {
    porsche:["newsroom.porsche.com"],
    bmw:["www.press.bmwgroup.com","press.bmwgroup.com"],
    motor1:["www.motor1.com","motor1.com"]
  };
  const escaped = value => typeof value==="string" ? value.trim() : "";
  function savedGet() {
    try { const value=JSON.parse(localStorage.getItem(storageKey)||"[]");return new Set(Array.isArray(value)?value.filter(x=>typeof x==="string").slice(0,500):[]); } catch {return new Set();}
  }
  function savedSet(values) { try { localStorage.setItem(storageKey,JSON.stringify([...values].slice(0,500)));return true; }catch {return false;} }
  const saved=savedGet();
  function trustedUrl(input,source) {
    try {const u=new URL(input);
      if(u.protocol!=="https:"||!Object.values(permitted).flat().includes(u.hostname))return null;
      if(!permitted[source]?.includes(u.hostname))return null;
      return u.href;
    } catch{return null;}
  }
  function kst(value) {
    const date=new Date(value);
    if(!Number.isFinite(date.getTime()))return "";
    return new Intl.DateTimeFormat("ko-KR",{timeZone:"Asia/Seoul",month:"short",day:"numeric",year:"numeric"}).format(date);
  }
  const menu=$(".menu");
  document.addEventListener("keydown",event => {if(event.key==="Escape" && menu?.open) menu.open=false;});
  document.addEventListener("click",event => {
    if(menu?.open && event.target instanceof Node && !menu.contains(event.target))menu.open=false;
  });
  const expand=$("#wire-toggle"),content=$("#wire-content"),list=$("#wire-list"),state=$("#wire-state"),
    query=$("#wire-query"),more=$("#wire-more");
  $("[data-bookmark]").forEach(button=>{
    const id=escaped(button.dataset.bookmark);
    const label=()=>{const ok=saved.has(id);button.setAttribute("aria-pressed",String(ok));button.textContent=ok?"저장됨 ♥":"나중에 읽기 ♡";};
    label();
    button.addEventListener("click",()=>{if(saved.has(id))saved.delete(id);else saved.add(id);savedSet(saved);label();});
  });
  if(!expand||!content||!list||!state)return;
  let feed=[],active="all",take=12,loaded=false;
  function dom(tag,cls,value) {
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(value!==undefined)el.textContent=value;
    return el;
  }
  function draw(){
    const search=escaped(query?.value).toLocaleLowerCase();
    const shown=feed.filter(item=>(active==="all"||item.category===active||active==="saved"&&saved.has(item.url))
      &&(!search||(item.title+" "+item.source).toLocaleLowerCase().includes(search)));
    list.replaceChildren();
    if(!shown.length){
      list.append(dom("li","empty-feed","조건에 맞는 소식이 없습니다. 다른 주제를 선택해 보세요."));
    } else {
      const frag=document.createDocumentFragment();
      shown.slice(0,take).forEach((item,i)=>{
        const li=dom("li"),rank=dom("span","feed-order",String(i+1).padStart(2,"0"));
        const middle=dom("div");
        const a=dom("a","feed-title",item.title);
        a.href=item.url;a.target="_blank";a.rel="noopener noreferrer external";a.lang="en";
        const meta=dom("span","feed-meta",item.source+" · "+kst(item.published_at)+" · 원문 보기 ↗");
        middle.append(a,meta);
        const actions=dom("span","feed-actions");
        const btn=dom("button",null,saved.has(item.url)?"♥":"♡");
        btn.type="button";btn.setAttribute("aria-label",saved.has(item.url)?"뉴스 저장 해제":"뉴스 저장");
        btn.setAttribute("aria-pressed",String(saved.has(item.url)));
        btn.addEventListener("click",()=>{
          if(saved.has(item.url))saved.delete(item.url);else saved.add(item.url);
          savedSet(saved);draw();
        });
        actions.append(btn);li.append(rank,middle,actions);frag.append(li);
      });
      list.append(frag);
    }
    more.hidden=shown.length<=take;
    if(shown.length && state.dataset.ok==="1"){
      state.textContent=shown.length+"건 · 출처별 원문 링크 · "+(state.dataset.fetched||"수집 시각 미확인");
    }
  }
  async function loadFeed(){
    if(loaded)return;
    loaded=true;
    state.textContent="공개 뉴스 자료를 읽는 중입니다.";
    try{
      const res=await fetch("./data/live.json",{cache:"no-cache",headers:{Accept:"application/json"}});
      if(!res.ok)throw Error("HTTP "+res.status);
      const data=await res.json();
      feed=(Array.isArray(data.articles)?data.articles:[]).map(item=>{
        if(typeof item!=="object"||item===null)return null;
        const source=escaped(item.source_id);
        const url=trustedUrl(item.url,source);
        const title=escaped(item.title).slice(0,250);
        const published=Date.parse(item.published_at||"");
        if(!url||!title||!Number.isFinite(published))return null;
        return {url,title,source:escaped(item.source).slice(0,70),category:escaped(item.category),published_at:new Date(published).toISOString()};
      }).filter(Boolean).sort((a,b)=>b.published_at.localeCompare(a.published_at)).slice(0,100);
      const fetched=Date.parse(data.fetched_at||"");
      state.dataset.ok="1";
      state.dataset.fetched=Number.isFinite(fetched)?"확인 "+kst(fetched):"수집일 미확인";
      const stale=Number.isFinite(fetched) && Date.now()-fetched > 72*3600*1000;
      if(stale){state.dataset.fetched+=" · 갱신 지연";}
      draw();
    }catch{
      loaded=false;feed=[];
      state.textContent="현재 뉴스 목록이 준비되지 않았습니다. 공식 출처를 직접 확인해 주세요.";
      list.replaceChildren();
      const links=dom("li","feed-fallback");
      [
        ["Porsche Newsroom","https://newsroom.porsche.com/en.html"],
        ["BMW PressClub","https://www.press.bmwgroup.com/global"],
        ["Motor1","https://www.motor1.com/"]
      ].forEach(([name,href])=>{const a=dom("a",null,name+" ↗");a.href=href;a.rel="noopener noreferrer";a.target="_blank";a.style.marginRight="18px";links.append(a);});
      list.append(links);more.hidden=true;
    }
  }
  expand.addEventListener("click",()=>{
    const open=content.hidden;content.hidden=!open;
    expand.setAttribute("aria-expanded",String(open));
    expand.lastElementChild.textContent=open?"−":"＋";
    if(open)loadFeed();
  });
  query?.addEventListener("input",()=>{take=12;draw();});
  $$("[data-filter]").forEach(button=>button.addEventListener("click",()=>{
    active=button.dataset.filter||"all";take=12;
    $$("[data-filter]").forEach(el=>el.setAttribute("aria-pressed",String(el===button)));
    draw();
  }));
  more?.addEventListener("click",()=>{take+=12;draw();});

})();
