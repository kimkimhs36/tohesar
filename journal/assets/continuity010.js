/* 005–006 pattern: passive scroll, one scheduled frame, measured reversible progress.
   Native paths describe each character; artwork is never warped or used as a control. */
(() => {
  const scenes=[...document.querySelectorAll('[data-passage]')].map(el=>({el,board:el.querySelector('.passage-board'),plate:el.querySelector('.passage-plate'),cars:[...el.querySelectorAll('[data-passage-car]')].map(el=>({el,path:el.parentElement.querySelector(`[data-route="${el.dataset.passageCar}"]`)}))}));
  if(!scenes.length)return;
  const mq=matchMedia('(prefers-reduced-motion: reduce)');let queued=false;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function draw(){queued=false;for(const s of scenes){if(!s.enabled)continue;const p=clamp(-s.el.getBoundingClientRect().top/s.distance);s.el.dataset.progress=p.toFixed(4);
    s.cars.forEach((c,i)=>{
      // Coupé takes a long arc; Wedge advances briskly; GT lingers along its lower sweep.
      const t=i===0?p:i===1?clamp((p-.12)/.76):p*p*(3-2*p);
      const length=c.path.getTotalLength(),at=c.path.getPointAtLength(t*length),a=c.path.getPointAtLength(Math.max(0,t*length-2)),b=c.path.getPointAtLength(Math.min(length,t*length+2));
      const angle=Math.atan2((b.y-a.y)*s.sy,(b.x-a.x)*s.sx)*180/Math.PI*.28;
      c.el.style.left=`${at.x/10}%`;c.el.style.top=`${at.y/4.4}%`;c.el.style.transform=`translate(-50%,-50%) rotate(${angle}deg)`;
    });
  }}
  function measure(){for(const s of scenes){s.enabled=!mq.matches&&innerHeight>=620;s.el.classList.toggle('passage-enabled',s.enabled);
    if(s.enabled&&s.board.offsetHeight>innerHeight){s.enabled=false;s.el.classList.remove('passage-enabled')}
    s.top=s.el.getBoundingClientRect().top+scrollY;s.distance=Math.max(1,s.el.offsetHeight-s.board.offsetHeight);s.sx=s.plate.clientWidth/1000;s.sy=s.plate.clientHeight/440;
    if(!s.enabled){delete s.el.dataset.progress;s.cars.forEach(c=>c.el.removeAttribute('style'))}
  }draw()}
  function schedule(){if(!queued){queued=true;requestAnimationFrame(draw)}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});addEventListener('pageshow',measure);mq.addEventListener('change',measure);document.fonts?.ready.then(measure);addEventListener('load',measure);measure();
})();
