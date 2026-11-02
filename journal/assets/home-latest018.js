/* TOHEŞAR 018 · Homepage uses the same verified editorial news records as Journal.
   Existing authored HTML remains a readable fallback if JavaScript or the JSON fetch fails. */
(()=>{
'use strict';
const root=document.querySelector('.journal-flow'),list=root?.querySelector('[data-news-list]');
if(!root||!list)return;
const allowed=new Set(['published']),topics={design:'DESIGN',culture:'CULTURE',industry:'INDUSTRY'};
function el(tag,cls,value){const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=String(value);return x;}
fetch('/journal/data/news.json',{cache:'no-cache'})
.then(response=>{if(!response.ok)throw Error('news-unavailable');return response.json()})
.then(data=>{
  if(!Array.isArray(data.items))throw Error('invalid-news');
  const fresh=data.items.filter(n=>allowed.has(n.status)&&n.fact_check_status==='verified'&&typeof n.title==='string'&&typeof n.summary==='string'&&typeof n.url==='string'&&n.url.startsWith('https://')&&/^\d{4}-\d{2}-\d{2}$/.test(n.published_at||'')).sort((a,b)=>b.published_at.localeCompare(a.published_at)).slice(0,3);
  if(!fresh.length)return;
  const nodes=document.createDocumentFragment();
  fresh.forEach(n=>{
    const entry=el('article','news-item'),date=el('div','news-date'),time=el('time',null,n.published_at.replaceAll('-','.'));
    time.dateTime=n.published_at;
    date.append(time,el('span',null,(n.manufacturer||'AUTOMOTIVE')+' / '+(topics[n.topic]||'NEWS')));
    const title=el('h3'),link=el('a',null,n.title);link.href=n.url;link.target='_blank';link.rel='noopener noreferrer external';title.append(link);
    const right=el('div'),desc=el('p',null,n.summary),source=el('a','news-source',(n.source||'공식 발행처')+' · 원문 읽기 ↗');
    source.href=n.url;source.target='_blank';source.rel='noopener noreferrer external';right.append(desc,source);
    entry.append(date,title,right);nodes.append(entry);
  });
  list.replaceChildren(nodes);
})
.catch(()=>{/* Fall back to the existing 016 editorial records without pretending they are fresh. */});
})();