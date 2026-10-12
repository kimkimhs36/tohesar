/* TOHEŞAR — Film Stage 002. Connected editorial chapters; no autoplay. */
(()=>{
 'use strict';
 const stage=document.getElementById('film-stage');
 if(!stage)return;
 const frames=[...stage.querySelectorAll('[data-film-frame]')],buttons=[...stage.querySelectorAll('[data-film-select]')];
 const count=stage.querySelector('[data-film-count]');
 const description=stage.querySelector('[data-film-description]');
 const heading=document.getElementById('film-heading');
 const narrative=document.getElementById('film-narrative');
 const enter=document.getElementById('film-enter');
 const scenes=[
  {id:'arrival',description:'ARRIVAL — THE FIRST LIGHT',title:'Where the<br><em>light stays.</em>',copy:'빛이 지나간 자리에도, 이야기는 남는다.'},
  {id:'afterglow',description:'AFTERGLOW — THE MOMENT BETWEEN',title:'Between<br><em>two skies.</em>',copy:'같은 장소, 조금 달라진 빛. 우리는 그 사이를 지나간다.'},
  {id:'memory',description:'BLUE HOUR — WHEN THE CITY REMAINS',title:'When the<br><em>city waits.</em>',copy:'어둠이 내려와도, 어떤 장면은 오래 남는다.'}
 ];
 if(frames.length!==3||buttons.length!==3||!count||!description||!heading||!narrative||!enter)return;
 let selected=0,activePointer=null;
 function select(index,focus=false){
  if(!Number.isInteger(index)||index<0||index>=scenes.length)return;
  selected=index;const scene=scenes[index];
  frames.forEach((frame,i)=>{frame.classList.toggle('is-active',i===index);frame.setAttribute('aria-hidden',String(i!==index));});
  buttons.forEach((button,i)=>{const on=i===index;button.classList.toggle('is-active',on);button.setAttribute('aria-pressed',String(on));});
  count.textContent=String(index+1).padStart(2,'0')+' / 03';
  description.textContent=scene.description;
  heading.innerHTML=scene.title;
  narrative.textContent=scene.copy;
  enter.href='world/?scene='+scene.id;
  enter.setAttribute('aria-label','Cinematic World — '+scene.description+' 장면으로 이동');
  stage.dataset.frame=String(index);
  if(focus)buttons[index].focus();
 }
 buttons.forEach((button,index)=>{
  button.addEventListener('click',()=>select(index));
  button.addEventListener('keydown',e=>{
   if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
   e.preventDefault();
   if(e.key==='Home')select(0,true);else if(e.key==='End')select(2,true);
   else select((index+(e.key==='ArrowRight'?1:2))%3,true);
  });
 });
 // Swipe across the photograph, but never hijack a button or link gesture.
 const onUI=e=>e.target.closest('a,button');
 stage.addEventListener('pointerdown',e=>{
  if(onUI(e)||e.pointerType==='mouse')return;
  activePointer={id:e.pointerId,x:e.clientX,y:e.clientY};
 });
 stage.addEventListener('pointerup',e=>{
  if(!activePointer||e.pointerId!==activePointer.id)return;
  const dx=e.clientX-activePointer.x,dy=e.clientY-activePointer.y;activePointer=null;
  if(Math.abs(dx)>52&&Math.abs(dx)>Math.abs(dy)*1.35)select(Math.max(0,Math.min(2,selected+(dx<0?1:-1))));
 });
 stage.addEventListener('pointercancel',()=>{activePointer=null});
 select(0);
})();
