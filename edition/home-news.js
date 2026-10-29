/* The front page shows source-linked headlines without copying publisher imagery or body text. */
(()=>{
'use strict';
const list=document.getElementById('front-wire-list');
const state=document.getElementById('front-wire-state');
if(!list)return;
const hosts=['newsroom.porsche.com','www.press.bmwgroup.com','press.bmwgroup.com','www.motor1.com','motor1.com','www.autoblog.com','autoblog.com'];
const valid=item=>{try{const url=new URL(item.url);return url.protocol==='https:'&&hosts.includes(url.hostname)&&typeof item.title==='string'&&item.title.length>5&&item.title.length<400&&Number.isFinite(Date.parse(item.published_at))}catch{return false}};
fetch('/edition/data/news.json',{cache:'no-cache'}).then(response=>{if(!response.ok)throw Error('fetch');return response.json()}).then(data=>{
 const items=Array.isArray(data.items)?data.items.filter(valid).slice(0,Number(list.dataset.limit)||8):[];
 if(!items.length)throw Error('empty');
 const fragment=document.createDocumentFragment();
 items.forEach((item,index)=>{
  const li=document.createElement('li'),a=document.createElement('a'),meta=document.createElement('span'),title=document.createElement('strong'),date=document.createElement('time');
  li.className='front-wire-item';a.href=item.url;a.target='_blank';a.rel='noopener noreferrer external';
  meta.className='front-wire-meta';meta.textContent=String(index+1).padStart(2,'0')+' / '+(item.source||'SOURCE');
  title.lang='en';title.textContent=item.title;
  date.className='front-wire-date';date.dateTime=item.published_at;date.textContent=new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'short',day:'numeric',timeZone:'Asia/Seoul'}).format(new Date(item.published_at))+' · 원문 ↗';
  a.append(meta,title,date);li.append(a);fragment.append(li);
 });
 list.replaceChildren(fragment);
 const timestamp=Date.parse(data.generated_at),age=(Date.now()-timestamp)/3600000;
 const when=Number.isFinite(timestamp)?new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Seoul'}).format(new Date(timestamp))+' KST':'시각 확인 불가';
 state.textContent=(age>=0&&age<12&&['live','partial'].includes(data.status)?(data.status==='partial'?'일부 출처 수집 · ':'수집 완료 · '):'과거 수집 자료 · ')+when;
}).catch(()=>{list.replaceChildren();const message=document.createElement('li');message.className='front-wire-message';message.textContent='뉴스 자료를 불러오지 못했습니다. 뉴스 데스크에서 다시 확인해 주세요.';list.append(message);state.textContent='수집 기록 확인 불가'});
})();
