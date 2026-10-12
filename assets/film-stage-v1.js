/* TOHEŞAR — Film Stage 001. Accessible, user-directed sequence; never auto-advances. */
(()=>{
'use strict';
const stage=document.getElementById('film-stage');
if(!stage)return;
const frames=[...stage.querySelectorAll('[data-film-frame]')];
const buttons=[...stage.querySelectorAll('[data-film-select]')];
const count=stage.querySelector('[data-film-count]');
const description=stage.querySelector('[data-film-description]');
const scenes=[
 'ARRIVAL — THE FIRST LIGHT',
 'AFTERGLOW — THE MOMENT BETWEEN',
 'BLUE HOUR — WHEN THE CITY REMAINS'
];
if(frames.length!==3||buttons.length!==3||!count||!description)return;
function select(index,focus=false){
 if(!Number.isInteger(index)||index<0||index>=scenes.length)return;
 frames.forEach((frame,i)=>{
  frame.classList.toggle('is-active',i===index);
  frame.setAttribute('aria-hidden',String(i!==index));
 });
 buttons.forEach((button,i)=>{
  const on=i===index;button.classList.toggle('is-active',on);button.setAttribute('aria-pressed',String(on));
 });
 count.textContent=String(index+1).padStart(2,'0')+' / 03';
 description.textContent=scenes[index];
 stage.dataset.frame=String(index);
 if(focus)buttons[index].focus();
}
buttons.forEach((button,index)=>{
 button.addEventListener('click',()=>select(index));
 button.addEventListener('keydown',event=>{
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
  event.preventDefault();
  if(event.key==='Home')select(0,true);
  else if(event.key==='End')select(2,true);
  else select((index+(event.key==='ArrowRight'?1:2))%3,true);
 });
});
select(0);
})();
