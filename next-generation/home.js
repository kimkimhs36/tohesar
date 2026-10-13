// Progressive enhancement: every page section and navigation link works without JS.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const revealTargets=document.querySelectorAll('.introduction,.section-head,.journal-grid,.experience-copy,.closing>p');
if('IntersectionObserver' in window&&!reduced.matches){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.remove('pending');observer.unobserve(entry.target);}}},{threshold:.08});
 revealTargets.forEach(el=>{el.classList.add('reveal','pending');observer.observe(el);});
 reduced.addEventListener('change',()=>{if(reduced.matches){revealTargets.forEach(el=>el.classList.remove('pending'));observer.disconnect();}});
}
const button=document.getElementById('sound-toggle'),audio=document.getElementById('ambient-audio'),label=document.getElementById('sound-label'),status=document.getElementById('sound-status');
let requested=false;
function soundState(on){button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'배경 음악 일시정지':'배경 음악 재생');label.textContent=on?'SOUND ON':'SOUND OFF';}
button.addEventListener('click',async()=>{requested=!requested;if(!requested){audio.pause();soundState(false);return;}try{audio.volume=.28;await audio.play();soundState(true);}catch{requested=false;soundState(false);status.textContent='음악을 불러오지 못했습니다. 나중에 다시 시도해 주세요.';}});
audio.addEventListener('error',()=>{requested=false;soundState(false);status.textContent='음악을 불러오지 못했습니다.';});
document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.pause();soundState(false);requested=false;}});
window.addEventListener('pagehide',()=>audio.pause());
