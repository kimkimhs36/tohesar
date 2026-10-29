(() => {
  const root=document.documentElement, sequence=document.querySelector('.sequence'),stage=document.querySelector('.stage');
  const photo=document.querySelector('.photograph'),word=document.querySelector('.wordmark'),editorial=document.querySelector('.editorial');
  const signature=document.querySelector('.signature'),cue=document.querySelector('.opening'),nav=document.querySelector('.navigation');
  const meta=document.querySelector('.article-meta'),copy=editorial.querySelector('p');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=n=>Math.max(0,Math.min(1,n)),mix=(a,b,t)=>a+(b-a)*t;
  const phase=(p,a,b)=>{const t=clamp((p-a)/(b-a));return t*t*t*(t*(t*6-15)+10)};
  let g,queued=false;
  function measure(){
    root.classList.toggle('motion',!reduced.matches);
    if(reduced.matches){
      [photo,word,editorial,meta,copy,signature,cue,nav,stage,document.querySelector('.journal-link')].forEach(el=>el.removeAttribute('style'));
      return;
    }
    const w=stage.clientWidth,h=stage.clientHeight,wide=w>=760&&w>h;
    const edge=parseFloat(getComputedStyle(root).getPropertyValue('--edge'));
    // Height is capped by image width: the complete car stays inside even on tall phones.
    const startH=wide?h:Math.min(h*.735,w*1.60);
    const endW=wide?w*.56:w-edge*2;
    const endH=wide?Math.min(h*.84,endW*1.28):Math.min(h*.465,endW*1.16);
    g={w,h,wide,edge,startH,endW,endH,endY:wide?h*.08:86,distance:sequence.offsetHeight-h};paint();
  }
  function paint(){
    queued=false;if(!g||reduced.matches)return;
    const p=clamp((scrollY-sequence.offsetTop)/g.distance);
    // Release the masthead first; then slowly open the page margins around the photograph.
    const release=phase(p,.01,.29),frame=phase(p,.03,.91),read=phase(p,.40,.79);
    const y=mix(0,g.endY,frame),height=mix(g.startH,g.endH,frame);
    Object.assign(photo.style,{left:`${mix(0,g.wide?g.w*.05:g.edge,frame)}px`,top:`${y}px`,width:`${mix(g.wide?g.w*.60:g.w,g.endW,frame)}px`,height:`${height}px`});
    word.style.opacity=1-release;word.style.transform=`translateY(${-26*release}px)`;
    word.style.visibility=p>=.29?'hidden':'visible';
    editorial.style.top=g.wide?`${mix(g.h*.45,g.h*.34,frame)}px`:`${y+height+mix(24,27,frame)}px`;
    meta.style.marginBottom=`${18*read}px`;meta.style.height=`${(g.wide?46:15)*read}px`;meta.style.opacity=read;meta.style.overflow='hidden';
    photo.style.setProperty('--photo-scale',mix(1,g.wide?1:1.16,frame));
    copy.style.opacity=phase(p,.55,.85);copy.style.transform=`translateY(${8*(1-read)}px)`;
    signature.style.opacity=phase(p,.62,.83);signature.style.visibility=p>.62?'visible':'hidden';
    cue.style.opacity=1-phase(p,0,.15);cue.style.visibility=p>.15?'hidden':'visible';
    // The existing Journal entrance remains visible through the entire sequence.
    document.querySelector('.journal-link').style.opacity=1;
    const navT=g.wide?1:phase(p,.12,.49);nav.style.color=`rgb(${mix(241,51,navT)} ${mix(228,46,navT)} ${mix(223,59,navT)})`;
    stage.style.background=`rgb(${mix(214,232,frame)} ${mix(202,223,frame)} ${mix(210,225,frame)})`;
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
  document.querySelectorAll('a[href="#journal"]').forEach(a=>a.addEventListener('click',e=>{if(reduced.matches)return;e.preventDefault();scrollTo({top:sequence.offsetTop+g.distance,behavior:'smooth'})}));
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure,{passive:true});
  addEventListener('pageshow',measure);
  screen.orientation?.addEventListener('change',()=>requestAnimationFrame(measure));
  visualViewport?.addEventListener('resize',measure,{passive:true});
  document.fonts?.ready.then(measure);
  reduced.addEventListener('change',measure);measure();
})();
