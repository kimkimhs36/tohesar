/* TOHEŞAR Edition 003: source-aware reading UI. No dependencies or cross-site tracking. */
(()=>{
'use strict';
const by=(id)=>document.getElementById(id);
const root=document.body;
const base=root.dataset.page==='article'?'../../':'./';
const catalog=[
 {id:'mission-s',title:'다음 시대에도, 포르쉐는 포르쉐일까',category:'2026 · DESIGN',url:base+'story/mission-s/'},
 {id:'f40',title:'속도가 형태를 만들 때: 페라리 F40',category:'1987 · FERRARI',url:base+'story/f40/'},
 {id:'bmw-7',title:'BMW Concept 7 Protection: 보이지 않는 기술의 디자인',category:'2026 · BMW',url:'https://www.press.bmwgroup.com/global/article/detail/T0461562EN/bmw-concept-7-protection%3A-discreet-protection-in-its-most-sophisticated-form'}
];
const storageKey='tohesar:edition003:saved';
function getSaved(){try{const x=JSON.parse(localStorage.getItem(storageKey)||'[]');return Array.isArray(x)?x.filter(v=>typeof v==='string'):[]}catch{return []}}
function saveItems(items){try{localStorage.setItem(storageKey,JSON.stringify(items))}catch{}}
function element(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el}
function headlineCard(item){
 const li=element('li');const a=element('a','wire-card');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer external';
 const meta=element('small',null,item.source||'Source');const title=element('strong',null,item.title);title.lang='en';
 const stamp=element('span',null,(item.published_at?new Intl.DateTimeFormat('ko-KR',{month:'short',day:'numeric',timeZone:'Asia/Seoul'}).format(new Date(item.published_at)):'')+' · ORIGINAL ↗');
 a.append(meta,title,stamp);li.append(a);return li;
}
const approvedHosts=['newsroom.porsche.com','www.press.bmwgroup.com','press.bmwgroup.com','www.motor1.com','motor1.com'];
const safeFeedItem=(x)=>{try{const url=new URL(x.url);return url.protocol==='https:'&&approvedHosts.includes(url.hostname)&&typeof x.title==='string'&&x.title.length>5&&x.title.length<400&&Number.isFinite(Date.parse(x.published_at))}catch{return false}};
let wireItems=[];
async function loadWire(){
 const list=by('wire-list');const state=by('wire-state');if(!list)return;
 try {
  const response=await fetch(base+'data/news.json',{cache:'no-cache'});
  if(!response.ok)throw new Error('fetch');
  const data=await response.json();
  if(!Array.isArray(data.items))throw new Error('bad schema');
  const chosen=data.items.filter(safeFeedItem).slice(0,12);wireItems=chosen;
  list.replaceChildren(...chosen.map(headlineCard));
  if(!chosen.length)throw new Error('empty');
  const instant=Date.parse(data.generated_at);const age=Math.max(0,(Date.now()-instant)/3600000);
  const when=Number.isFinite(instant)?new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(instant)):'확인 불가';
  const isFresh=data.status==='live'&&age<12;
  state.textContent=(isFresh?'자동 갱신 · ':'보관된 자료 · ')+when+' KST';
 }catch(e){wireItems=[];list.replaceChildren();const li=element('li','wire-placeholder','외부 헤드라인에 접속할 수 없습니다. 공식 발표 링크는 위에서 확인할 수 있습니다.');list.append(li);if(state)state.textContent='연결되지 않음 · 출처 방문 가능';}
}
const refresh=by('refresh-wire');if(refresh)refresh.addEventListener('click',loadWire);
if(by('wire-list'))loadWire();
const menuButton=document.querySelector('.menu-button'), menu=by('mobile-menu');
function closeMenu(){if(menu)menu.hidden=true;if(menuButton){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','메뉴 열기')}}
if(menuButton&&menu){menuButton.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기')});menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!menuButton.contains(e.target))closeMenu()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()})}
function openDialog(dialog){if(dialog&&typeof dialog.showModal==='function'&&!dialog.open){closeMenu();dialog.showModal()}}
for(const dlg of document.querySelectorAll('dialog')){dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});dlg.addEventListener('close',()=>{document.body.style.overflow=''})}
const search=by('search-dialog'),field=by('search-field'),results=by('search-results');
function drawSearch(){if(!results||!field)return;const q=field.value.trim().toLocaleLowerCase();results.replaceChildren();if(!q){results.append(element('p',null,'자동차 이름이나 디자인 키워드를 입력해 보세요.'));return}const list=catalog.filter(x=>(x.title+' '+x.category).toLocaleLowerCase().includes(q));const extras=wireItems.filter(x=>(x.title+' '+x.source).toLocaleLowerCase().includes(q)).slice(0,8);if(!list.length&&!extras.length){results.append(element('p',null,'검색 결과가 없습니다. 다른 키워드를 입력해 보세요.'));return}for(const item of [...list,...extras]){const a=element('a',null,item.title);a.href=item.url;if(a.hostname!==location.hostname){a.target='_blank';a.rel='noopener noreferrer external'}a.append(element('small',null,item.category||item.source));results.append(a)}}
for(const b of document.querySelectorAll('.search-open'))b.addEventListener('click',()=>{openDialog(search);drawSearch();field?.focus()});field?.addEventListener('input',drawSearch);
const savedDialog=by('saved-dialog'),savedContainer=by('saved-items');
function drawSaved(){if(!savedContainer)return;savedContainer.replaceChildren();const chosen=catalog.filter(x=>getSaved().includes(x.id));if(!chosen.length){savedContainer.append(element('p',null,'저장한 글이 없습니다. 기사에서 ☆ 저장을 눌러 보세요.'));return}for(const item of chosen){const a=element('a',null,item.title);a.href=item.url;a.append(element('small',null,item.category));savedContainer.append(a)}}
for(const b of document.querySelectorAll('[data-saved-open]')){b.addEventListener('click',e=>{e.preventDefault();drawSaved();openDialog(savedDialog)})}
for(const b of document.querySelectorAll('[data-save]')){const id=b.dataset.save;function update(){const on=getSaved().includes(id);b.setAttribute('aria-pressed',String(on));b.textContent=on?'★ 저장됨':'☆ 저장'}update();b.addEventListener('click',()=>{const saved=getSaved();saveItems(saved.includes(id)?saved.filter(s=>s!==id):[...saved,id]);update()})}
for(const btn of document.querySelectorAll('[data-share]')){btn.addEventListener('click',async()=>{try{if(navigator.share){await navigator.share({title:document.title,url:location.href})}else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);btn.textContent='링크 복사됨 ✓'}}catch(e){/* cancelled share is not a failure */}})}
const prog=by('reading-progress');if(prog){let raf=0;const update=()=>{raf=0;const max=document.documentElement.scrollHeight-innerHeight;const pct=max>0?Math.max(0,Math.min(100,scrollY/max*100)):0;prog.style.width=pct+'%'};window.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});update()}
})();