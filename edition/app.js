/* TOHEŞAR Edition 003: source-aware reading UI. No dependencies or cross-site tracking. */
(()=>{
'use strict';
const by=(id)=>document.getElementById(id);
const root=document.body;
const base=root.dataset.page==='article'?'../../':['news','archive'].includes(root.dataset.page)?'../':'./';
const catalog=[
 {keywords:'porsche 포르쉐 mission s 2026 미래 디자인',id:'mission-s',title:'다음 시대에도, 포르쉐는 포르쉐일까',category:'2026 · DESIGN',url:base+'story/mission-s/'},
 {keywords:'ferrari 페라리 f40 1987 역사 디자인',id:'f40',title:'속도가 형태를 만들 때: 페라리 F40',category:'1987 · FERRARI',url:base+'story/f40/'},
 {keywords:'porsche 포르쉐 911 carrera rsr 1973 역사 디자인',id:'911',title:'시간이 남긴 실루엣: 포르쉐 911 카레라 RSR',category:'1973 · PORSCHE · 디자인 역사',url:base+'story/911/'},
 {id:'bmw-7',title:'BMW Concept 7 Protection: 보이지 않는 기술의 디자인',category:'2026 · BMW',url:'https://www.press.bmwgroup.com/global/article/detail/T0461562EN/bmw-concept-7-protection%3A-discreet-protection-in-its-most-sophisticated-form'}
];
const storageKey='tohesar:edition003:saved';
function getSaved(){try{const x=JSON.parse(localStorage.getItem(storageKey)||'[]');return Array.isArray(x)?x.filter(v=>typeof v==='string'):[]}catch{return []}}
function saveItems(items){try{localStorage.setItem(storageKey,JSON.stringify(items));return true}catch{return false}}
function element(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el}
function headlineCard(item){
 const li=element('li');const a=element('a','wire-card');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer external';
 const meta=element('small',null,item.source||'Source');const title=element('strong',null,item.title);title.lang='en';
 const stamp=element('span',null,(item.published_at?new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'short',day:'numeric',timeZone:'Asia/Seoul'}).format(new Date(item.published_at)):'')+' · ORIGINAL ↗');
 a.append(meta,title,stamp);li.append(a);return li;
}
const approvedHosts=['newsroom.porsche.com','www.press.bmwgroup.com','press.bmwgroup.com','www.motor1.com','motor1.com'];
const safeFeedItem=(x)=>{try{const url=new URL(x.url);return url.protocol==='https:'&&approvedHosts.includes(url.hostname)&&typeof x.title==='string'&&x.title.length>5&&x.title.length<400&&Number.isFinite(Date.parse(x.published_at))}catch{return false}};
let wireItems=[];
let wireVisible=12;
const topicLabels={
 'new-cars':'신차·차종','design':'디자인·콘셉트','technology':'기술·제조',
 'motorsport':'모터스포츠','motorcycles':'모터사이클','industry':'산업·시장'
};
function topicOf(item){
 const provided=String(item.category||'');
 if(topicLabels[provided])return provided;
 const t=String(item.title||'').toLowerCase();
 if(/\b(motorcycle|motorcycles|superbike|motorrad|scooter|motogp)\b/.test(t))return 'motorcycles';
 if(/\b(f1|formula one|formula 1|nascar|wrc|grand prix|motorsport|le mans|racing|rally|indycar)\b/.test(t))return 'motorsport';
 if(/\b(concept|prototype|design|styling|heritage|classic|vintage|restomod|vision model)\b/.test(t))return 'design';
 if(/\b(battery|charging|autonomous|software|electric|hydrogen|self-driving|factory|production|robot|powertrain)\b/.test(t))return 'technology';
 if(/\b(recall|earnings|tariff|sales|market|partnership|plant|workers|ceo)\b/.test(t))return 'industry';
 return 'new-cars';
}
function renderWire(){
 const list=by('wire-list');if(!list)return;
 const query=(by('wire-query')?.value||'').trim().toLocaleLowerCase();
 const publisher=by('wire-publisher')?.value||'all';
 const topic=by('wire-topic')?.value||'all';
 const matches=wireItems.filter(item=>
   (publisher==='all'||item.source_id===publisher)&&
   (topic==='all'||topicOf(item)===topic)&&
   (!query||(item.title+' '+item.source).toLocaleLowerCase().includes(query))
 );
 const shown=matches.slice(0,wireVisible);
 const frag=document.createDocumentFragment();
 for(const item of shown)frag.append(headlineCard(item));
 if(!shown.length)frag.append(element('li','wire-placeholder',wireItems.length?'조건에 맞는 뉴스가 없습니다. 필터를 바꿔보세요.':'표시할 원문 뉴스가 없습니다.'));
 list.replaceChildren(frag);
 const counter=by('wire-count');
 if(counter)counter.textContent=matches.length+'건 중 '+shown.length+'건 표시 · 주제는 원문 제목 키워드로 자동 분류';
 const more=by('wire-load-more');
 if(more)more.hidden=shown.length>=matches.length;
}
async function loadWire(){
 const list=by('wire-list'),state=by('wire-state');if(!list)return;
 if(state)state.textContent='수집 기록 확인 중';
 try{
  const response=await fetch(base+'data/news.json',{cache:'no-cache'});
  if(!response.ok)throw new Error('fetch');
  const data=await response.json();
  if(!Array.isArray(data.items))throw new Error('bad schema');
  wireItems=data.items.filter(safeFeedItem).slice(0,45);
  if(!wireItems.length)throw new Error('empty');
  renderWire();
  const instant=Date.parse(data.generated_at),age=(Date.now()-instant)/3600000;
  const validTime=Number.isFinite(instant);
  const when=validTime?new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(instant)):'날짜 확인 불가';
  const isFresh=validTime&&age>=0&&age<12&&['live','partial'].includes(data.status);
  const health=by('feed-health');
  if(health)health.textContent=(data.sources||[]).map(x=>x.name+' · '+(x.status==='ok'?'수집 정상':x.status==='empty'?'최근 항목 없음':'수집 불가')).join(' / ');
  if(state)state.textContent=(isFresh?(data.status==='partial'?'일부 출처 수집 · ':'수집 완료 · '):'과거 수집 자료 · ')+when+' KST';
 }catch(e){
  wireItems=[];renderWire();
  if(state)state.textContent='연결 지연 · 공식 출처에서 원문 확인';
  const health=by('feed-health');if(health)health.textContent='헤드라인 데이터에 접속할 수 없습니다.';
 }
}
for(const name of ['wire-query','wire-publisher','wire-topic']){
 const input=by(name);
 if(input)input.addEventListener(name==='wire-query'?'input':'change',()=>{wireVisible=12;renderWire()});
}
by('wire-load-more')?.addEventListener('click',()=>{wireVisible+=12;renderWire()});
let searchIndexRequest=null;
function ensureSearchIndex(){
 if(wireItems.length||searchIndexRequest)return;
 searchIndexRequest=fetch(base+'data/news.json',{cache:'no-cache'}).then(res=>{
  if(!res.ok)throw new Error('no-news');
  return res.json();
 }).then(data=>{
  if(Array.isArray(data.items)){wireItems=data.items.filter(safeFeedItem).slice(0,45);drawSearch()}
 }).catch(()=>{}).finally(()=>{searchIndexRequest=null});
}
const refresh=by('refresh-wire');if(refresh)refresh.addEventListener('click',loadWire);
if(by('wire-list')){
 const requestedTopic=new URLSearchParams(location.search).get('topic');
 const topicSelect=by('wire-topic');
 if(topicSelect&&requestedTopic&&Array.from(topicSelect.options).some(option=>option.value===requestedTopic))topicSelect.value=requestedTopic;
 loadWire();
}
const archiveQuery=by('archive-query'),archiveTopic=by('archive-topic');
function filterArchive(){
 const query=(archiveQuery?.value||'').trim().toLocaleLowerCase(),topic=archiveTopic?.value||'all';
 let count=0;
 document.querySelectorAll('[data-archive-item]').forEach(item=>{
  const matchesTopic=topic==='all'||item.dataset.topics.split(' ').includes(topic);
  const matchesQuery=!query||(item.textContent+' '+item.dataset.keywords).toLocaleLowerCase().includes(query);
  item.hidden=!(matchesTopic&&matchesQuery);if(!item.hidden)count++;
 });
 const state=by('archive-count');if(state)state.textContent=count+'편의 이야기';
}
archiveQuery?.addEventListener('input',filterArchive);archiveTopic?.addEventListener('change',filterArchive);
if(archiveQuery)filterArchive();
const menuButton=document.querySelector('.menu-button'), menu=by('mobile-menu');
function closeMenu(){if(menu){if(menu.contains(document.activeElement))menuButton?.focus();menu.hidden=true;}if(menuButton){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','메뉴 열기')}}
if(menuButton&&menu){menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기')});menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!menuButton.contains(e.target))closeMenu()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()})}
function openDialog(dialog){if(dialog&&typeof dialog.showModal==='function'&&!dialog.open){closeMenu();dialog.showModal()}}
for(const dlg of document.querySelectorAll('dialog')){dlg.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dlg.close()}});dlg.addEventListener('click',e=>{const r=dlg.getBoundingClientRect();if(e.target===dlg&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dlg.close()});dlg.addEventListener('close',()=>{document.body.style.overflow=''})}
const search=by('search-dialog'),field=by('search-field'),results=by('search-results');
function drawSearch(){if(!results||!field)return;const q=field.value.trim().toLocaleLowerCase();results.replaceChildren();if(!q){results.append(element('p',null,'자동차 이름이나 디자인 키워드를 입력해 보세요.'));return}const list=catalog.filter(x=>(x.title+' '+x.category+' '+(x.keywords||'')).toLocaleLowerCase().includes(q));const extras=wireItems.filter(x=>(x.title+' '+x.source).toLocaleLowerCase().includes(q)).slice(0,8);if(!list.length&&!extras.length){results.append(element('p',null,'검색 결과가 없습니다. 다른 키워드를 입력해 보세요.'));return}for(const item of [...list,...extras]){const a=element('a',null,item.title);a.href=item.url;if(a.hostname!==location.hostname){a.target='_blank';a.rel='noopener noreferrer external'}a.append(element('small',null,item.category||item.source));results.append(a)}}
for(const b of document.querySelectorAll('.search-open'))b.addEventListener('click',()=>{openDialog(search);drawSearch();ensureSearchIndex();field?.focus()});field?.addEventListener('input',drawSearch);
const savedDialog=by('saved-dialog'),savedContainer=by('saved-items');
function drawSaved(){if(!savedContainer)return;savedContainer.replaceChildren();const chosen=catalog.filter(x=>getSaved().includes(x.id));if(!chosen.length){savedContainer.append(element('p',null,'저장한 글이 없습니다. 기사에서 ☆ 저장을 눌러 보세요.'));return}for(const item of chosen){const a=element('a',null,item.title);a.href=item.url;a.append(element('small',null,item.category));const row=element('div','saved-row');const remove=element('button',null,'삭제');remove.type='button';remove.setAttribute('aria-label',item.title+' 저장 취소');remove.addEventListener('click',()=>{if(saveItems(getSaved().filter(id=>id!==item.id))){drawSaved();document.querySelectorAll('[data-save]').forEach(b=>{const on=getSaved().includes(b.dataset.save);b.setAttribute('aria-pressed',String(on));b.textContent=on?'★ 저장됨':'☆ 저장'})}});row.append(a,remove);savedContainer.append(row)}}
for(const b of document.querySelectorAll('[data-saved-open]')){b.addEventListener('click',e=>{e.preventDefault();drawSaved();openDialog(savedDialog)})}
for(const b of document.querySelectorAll('[data-save]')){const id=b.dataset.save;function update(){const on=getSaved().includes(id);b.setAttribute('aria-pressed',String(on));b.textContent=on?'★ 저장됨':'☆ 저장'}update();b.addEventListener('click',()=>{const saved=getSaved();if(saveItems(saved.includes(id)?saved.filter(s=>s!==id):[...saved,id]))update();else b.textContent='저장 공간 사용 불가'})}
for(const btn of document.querySelectorAll('[data-share]')){const status=element('p','share-status');status.setAttribute('role','status');btn.closest('.article-toolbar').after(status);btn.addEventListener('click',async()=>{try{if(navigator.share){await navigator.share({title:document.title,url:location.href})}else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);status.textContent='기사 링크를 복사했습니다.'}else{status.textContent='이 주소를 복사해 공유하세요: '+location.href}}catch(e){if(e.name!=='AbortError')status.textContent='주소창의 기사 링크를 복사해 공유해 주세요.'}})}
const toc=document.querySelector('.article-toc');if(toc){document.querySelectorAll('.article-body h2').forEach((h,i)=>{h.id='chapter-'+(i+1);const a=element('a',null,String(i+1).padStart(2,'0')+' · '+h.textContent);a.href='#'+h.id;toc.append(a)})}
window.addEventListener('storage',()=>{drawSaved();document.querySelectorAll('[data-save]').forEach(b=>{const on=getSaved().includes(b.dataset.save);b.setAttribute('aria-pressed',String(on));b.textContent=on?'★ 저장됨':'☆ 저장'})});
const prog=by('reading-progress');if(prog&&root.dataset.page==='article'){let raf=0;const update=()=>{raf=0;const max=document.documentElement.scrollHeight-innerHeight;const pct=max>0?Math.max(0,Math.min(100,scrollY/max*100)):0;prog.style.transform='scaleX('+pct/100+')'};window.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});requestAnimationFrame(update)}
})();