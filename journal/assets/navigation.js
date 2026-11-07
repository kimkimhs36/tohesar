/* Shared Index disclosure: native links, optional short closing transition. */
(() => {
  const menu=document.querySelector('.journal-index');
  if(!menu)return;
  const summary=menu.querySelector('summary');
  const panel=menu.querySelector('nav');
  if(!summary||!panel)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const path=location.pathname;
  const section=path.startsWith('/owner-stories/') ? '/owner-stories/' :
    path.startsWith('/edition/')||path.startsWith('/journal/news/') ? '/edition/' :
    /^\/journal\/(explore|design|visual|miniatures|yokohama)\//.test(path) ? '/journal/explore/' :
    path.startsWith('/journal/') ? '/journal/' : path.startsWith('/sitemap/') ? '/sitemap/' : '/';
  const active=menu.querySelector(`a[href="${section}"]`);
  if(active)active.setAttribute('aria-current',active.pathname===path?'page':'location');
  let closing=false,timer=0,positionFrame=0;
  function positionPanel(){
    if(!menu.open||closing)return;
    const rect=summary.getBoundingClientRect();
    const viewport=window.visualViewport;
    const top=viewport?.offsetTop||0;
    const height=viewport?.height||window.innerHeight;
    const above=rect.top-top-12;
    const below=height-(rect.bottom-top)-12;
    const opensUp=below<340&&above>below;
    const space=Math.max(140,Math.floor(opensUp?above:below));
    menu.classList.toggle('opens-up',opensUp);
    menu.classList.toggle('is-compact',space<370);
    menu.style.setProperty('--index-space',space+'px');
  }
  function schedulePosition(){
    if(!menu.open||positionFrame)return;
    positionFrame=requestAnimationFrame(()=>{positionFrame=0;positionPanel()});
  }
  function finish(){
    clearTimeout(timer);timer=0;closing=false;menu.open=false;
    if(positionFrame)cancelAnimationFrame(positionFrame);positionFrame=0;
    menu.classList.remove('is-closing','opens-up','is-compact');menu.style.removeProperty('--index-space');
    panel.removeAttribute('inert');panel.removeAttribute('aria-hidden');
  }
  function close({focus=false,immediate=false}={}){
    if(!menu.open)return;
    if(focus)summary.focus();
    if(closing&&!immediate)return;
    if(immediate||reduced.matches){finish();return;}
    closing=true;panel.setAttribute('inert','');panel.setAttribute('aria-hidden','true');
    menu.classList.add('is-closing');timer=setTimeout(finish,220);
  }
  summary.addEventListener('click',event=>{
    if(!menu.open)return;
    event.preventDefault();
    if(closing){clearTimeout(timer);timer=0;closing=false;menu.classList.remove('is-closing');panel.removeAttribute('inert');panel.removeAttribute('aria-hidden');positionPanel();return;}
    close();
  });
  menu.addEventListener('toggle',()=>{if(menu.open)positionPanel()});
  addEventListener('resize',schedulePosition);
  addEventListener('scroll',schedulePosition,{passive:true});
  window.visualViewport?.addEventListener('resize',schedulePosition);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menu.open){event.preventDefault();close({focus:true});}
  });
  document.addEventListener('click',event=>{if(menu.open&&!menu.contains(event.target))close()});
  menu.addEventListener('focusout',event=>{if(menu.open&&event.relatedTarget&&!menu.contains(event.relatedTarget))close()});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>close({immediate:true})));
  reduced.addEventListener?.('change',()=>{if(reduced.matches&&closing)finish()});
  addEventListener('pagehide',finish);
  addEventListener('pageshow',finish);
})();
