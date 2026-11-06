/* TOHEŞAR Field Notes — progressive reading index and scroll progress.
   Text, photos and navigation remain fully available with JavaScript disabled. */
(() => {
  'use strict';
  const root=document.documentElement;
  const tracker=document.querySelector('[data-read-progress]');
  const chapters=[...document.querySelectorAll('[data-chapter]')];
  const nav=[...document.querySelectorAll('[data-chapter-link]')];
  if (!tracker || !chapters.length) return;
  root.classList.add('has-reading-progress');
  let scheduled=false;
  function updateProgress(){
    scheduled=false;
    const total=Math.max(1,root.scrollHeight-innerHeight);
    const percent=Math.min(100,Math.max(0,(scrollY/total)*100));
    root.style.setProperty('--reading-progress',percent.toFixed(2)+'%');
    tracker.setAttribute('aria-valuenow',String(Math.round(percent)));
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress)}}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  schedule();
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        for(const link of nav){
          if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');
          else link.removeAttribute('aria-current');
        }
      }
    },{rootMargin:'-22% 0px -60% 0px',threshold:0});
    for(const chapter of chapters)observer.observe(chapter);
  }
})();
