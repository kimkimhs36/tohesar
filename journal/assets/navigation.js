/* TOHEŞAR shared navigation — one interaction model across the magazine.
 * iPhone Safari: do not let the document move behind an open Index menu.
 * A real <details> remains usable without JavaScript.
 */
(() => {
  'use strict';
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

  let closing=false, timer=0, positionFrame=0, locked=false, lockedY=0;
  const root=document.documentElement;
  const eventOptions={passive:false};

  function setSummaryName(){
    summary.setAttribute('aria-label',menu.open?'전체 메뉴 닫기':'전체 메뉴 열기');
  }
  function stopBackgroundScroll(event){
    // Panel stays scrollable; the document beneath it never receives a swipe.
    if(panel.contains(event.target))return;
    if(event.cancelable)event.preventDefault();
  }
  function maintainScroll(){
    if(locked&&Math.abs(scrollY-lockedY)>1)scrollTo({top:lockedY,behavior:'instant'});
  }
  function lockDocument(){
    if(locked)return;
    lockedY=window.scrollY;
    locked=true;
    root.classList.add('thz-menu-open');
    document.body.classList.add('thz-menu-open');
    document.addEventListener('touchmove',stopBackgroundScroll,eventOptions);
    document.addEventListener('wheel',stopBackgroundScroll,eventOptions);
    addEventListener('scroll',maintainScroll,{passive:true});
  }
  function unlockDocument(){
    if(!locked)return;
    locked=false;
    root.classList.remove('thz-menu-open');
    document.body.classList.remove('thz-menu-open');
    document.removeEventListener('touchmove',stopBackgroundScroll,eventOptions);
    document.removeEventListener('wheel',stopBackgroundScroll,eventOptions);
    removeEventListener('scroll',maintainScroll);
    // In iOS Safari restoring the previous scrollY is important after scrolling
    // inside a menu or dismissing the keyboard.
    if(Math.abs(scrollY-lockedY)>1)scrollTo({top:lockedY,behavior:'instant'});
  }
  function positionPanel(){
    if(!menu.open||closing)return;
    const header=menu.closest('.site-header,.owner-header,.es-header,.article-bar')||summary.parentElement;
    const viewport=window.visualViewport;
    const offsetTop=viewport?.offsetTop||0;
    const height=viewport?.height||window.innerHeight;
    const rect=header.getBoundingClientRect();
    const screenBottom=Math.max(0,Math.min(height,rect.bottom-offsetTop));
    const usable=Math.max(150,height-screenBottom);
    // A fixed panel in the visible viewport is immune to the journal's very
    // long cinematic cover and its sticky-section scroll transitions.
    menu.style.setProperty('--thz-menu-top',screenBottom+'px');
    menu.style.setProperty('--thz-menu-height',usable+'px');
  }
  function schedulePosition(){
    if(!menu.open||positionFrame)return;
    positionFrame=requestAnimationFrame(()=>{positionFrame=0;positionPanel()});
  }
  function finish(){
    clearTimeout(timer);timer=0;closing=false;
    menu.open=false;
    if(positionFrame)cancelAnimationFrame(positionFrame);positionFrame=0;
    menu.classList.remove('is-closing','opens-up','is-compact');
    menu.style.removeProperty('--index-space');
    menu.style.removeProperty('--thz-menu-top');
    menu.style.removeProperty('--thz-menu-height');
    panel.removeAttribute('inert');
    panel.removeAttribute('aria-hidden');
    unlockDocument();
    setSummaryName();
  }
  function close({focus=false,immediate=false}={}){
    if(!menu.open)return;
    if(focus)summary.focus();
    if(closing&&!immediate)return;
    if(immediate||reduced.matches){finish();return;}
    closing=true;
    panel.setAttribute('inert','');
    panel.setAttribute('aria-hidden','true');
    menu.classList.add('is-closing');
    timer=setTimeout(finish,210);
  }
  summary.addEventListener('click',event=>{
    if(!menu.open)return;
    event.preventDefault();
    if(closing){
      clearTimeout(timer);timer=0;closing=false;
      menu.classList.remove('is-closing');
      panel.removeAttribute('inert');
      panel.removeAttribute('aria-hidden');
      positionPanel();
      return;
    }
    close();
  });
  menu.classList.add('thz-menu-ready');
  menu.addEventListener('toggle',()=>{
    if(menu.open){lockDocument();positionPanel();}
    else unlockDocument();
    setSummaryName();
  });
  addEventListener('resize',schedulePosition);
  window.visualViewport?.addEventListener('resize',schedulePosition);
  window.visualViewport?.addEventListener('scroll',schedulePosition);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menu.open){event.preventDefault();close({focus:true});}
    if(!menu.open)return;
    if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(event.key)&&
      !panel.contains(document.activeElement)&&document.activeElement!==summary){
      event.preventDefault();
    }
  });
  document.addEventListener('click',event=>{if(menu.open&&!menu.contains(event.target))close();});
  menu.addEventListener('focusout',event=>{if(menu.open&&event.relatedTarget&&!menu.contains(event.relatedTarget))close();});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>close({immediate:true})));
  reduced.addEventListener?.('change',()=>{if(reduced.matches&&closing)finish();});
  addEventListener('pagehide',finish);
  addEventListener('pageshow',()=>{finish();setSummaryName();});
  setSummaryName();
})();
