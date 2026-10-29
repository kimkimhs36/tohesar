(() => {
  const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
  // Keep regular document navigation. A brief paper wash is the only transition.
  let arrival;
  try{arrival=JSON.parse(sessionStorage.getItem('tohesar-passage'));sessionStorage.removeItem('tohesar-passage')}catch{}
  if(!reduced.matches&&arrival&&Date.now()-arrival.time<4000){root.style.setProperty('--travel-paper',arrival.paper);root.classList.add('travel-arriving')}
  const veil=document.createElement('div');veil.className='travel-veil';veil.setAttribute('aria-hidden','true');document.body.append(veil);
  let timer,leaving=false;
  function reset(){clearTimeout(timer);leaving=false;root.classList.remove('travel-leaving','travel-arriving')}
  addEventListener('pageshow',e=>{if(e.persisted)reset()});
  requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.remove('travel-arriving')));
  document.addEventListener('click',event=>{
    const a=event.target.closest('a[data-travel]');
    if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.target||a.hasAttribute('download')||reduced.matches)return;
    const target=new URL(a.href,location.href);
    if(target.origin!==location.origin||target.href===location.href||(target.pathname===location.pathname&&target.hash))return;
    event.preventDefault();if(leaving)return;leaving=true;
    const paper=getComputedStyle(document.body).backgroundColor;
    root.style.setProperty('--travel-paper',paper);
    try{sessionStorage.setItem('tohesar-passage',JSON.stringify({time:Date.now(),paper}))}catch{}
    root.classList.add('travel-leaving');timer=setTimeout(()=>location.assign(target.href),140);
  });
  reduced.addEventListener('change',()=>{if(reduced.matches)reset()});
})();
