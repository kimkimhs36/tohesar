// TOHEŞAR / Independent visual-journal soundtrack.
// The existing 37-second production is reused with its published provenance.
// No autoplay, no remote provider, no visual click bait. User gesture only.
export function initAmbience(){
 const button=document.getElementById('ambience-toggle');
 if(!button)return;
 const audio=new Audio('/assets/journal-theme.mp3');
 audio.loop=true;
 audio.preload='none';
 audio.volume=0;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let playing=false,frame=0,opening=false;
 function show(){
  button.textContent=playing?'SOUND ON':'SOUND OFF';
  button.setAttribute('aria-pressed',String(playing));
  button.setAttribute('aria-label',playing?'Turn ambient soundtrack off':'Turn ambient soundtrack on');
  button.classList.toggle('is-playing',playing);
 }
 function cancel(){if(frame)cancelAnimationFrame(frame);frame=0;}
 function fadeTo(target,done){
  cancel();
  if(reduced.matches){audio.volume=target;done?.();return;}
  const start=performance.now(),from=audio.volume;
  const duration=target>from?850:390;
  function step(now){
   const t=Math.min(1,(now-start)/duration),e=t*t*(3-2*t);
   audio.volume=Math.max(0,Math.min(1,from+(target-from)*e));
   if(t<1)frame=requestAnimationFrame(step);
   else{frame=0;done?.();}
  }
  frame=requestAnimationFrame(step);
 }
 button.addEventListener('click',async()=>{
  if(opening)return;
  if(playing){
   playing=false;show();
   fadeTo(0,()=>{if(!playing)audio.pause();});
   return;
  }
  opening=true;
  button.disabled=true;
  cancel();
  audio.volume=0;
  try{
   await audio.play();
   playing=true;show();fadeTo(.17);
  }catch{
   playing=false;audio.pause();show();
  }finally{opening=false;button.disabled=false;}
 });
 document.addEventListener('visibilitychange',()=>{
  if(!document.hidden)return;
  cancel();playing=false;audio.volume=0;audio.pause();show();
 });
 show();
}
