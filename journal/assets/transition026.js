/* Content is visible without JavaScript; animate the arrival only when requested. */
(() => {
 const header=document.querySelector('.journal-flow>.site-header');
 const intro=document.querySelector('.home-intro');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(!header||!intro||!('IntersectionObserver' in window))return;
 const marker=document.querySelector('.cover-passage');
 if(marker){new IntersectionObserver(([entry])=>header.classList.toggle('is-settled',!entry.isIntersecting && entry.boundingClientRect.bottom<=0),{threshold:0}).observe(marker)}
 if(!reduced.matches){const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){intro.classList.add('entering');const finish=()=>intro.classList.remove('entering');intro.addEventListener('animationend',finish,{once:true});intro.addEventListener('animationcancel',finish,{once:true});observer.disconnect()}},{threshold:.08});observer.observe(intro)}
})();
