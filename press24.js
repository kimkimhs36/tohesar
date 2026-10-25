/* TOHEŞAR / press24 motion: native, content-first, progressive enhancement. */
(()=>{'use strict';
 const article=document.querySelector('body.news-article article.article');if(!article)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced||!('IntersectionObserver' in window))return;
 const parts=[...article.querySelectorAll('.press-brief,.article-section,.sources')];
 const observer=new IntersectionObserver((entries)=>{
  for(const item of entries){
   if(!item.isIntersecting)continue;
   item.target.classList.add('is-visible');
   observer.unobserve(item.target);
  }
 },{threshold:0.06,rootMargin:'0px 0px -8% 0px'});
 for(const section of parts){
  const rect=section.getBoundingClientRect();
  if(rect.top<window.innerHeight*.95){continue;}
  section.classList.add('press-reveal');observer.observe(section);
 }
})();
