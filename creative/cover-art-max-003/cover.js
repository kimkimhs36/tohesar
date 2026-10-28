(() => {
  const root = document.documentElement;
  const sequence = document.querySelector('.sequence');
  const stage = document.querySelector('.stage');
  const photo = document.querySelector('.photograph');
  const word = document.querySelector('.wordmark');
  const editorial = document.querySelector('.editorial');
  const signature = document.querySelector('.signature');
  const cue = document.querySelector('.opening');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let g, queued = false;
  const clamp = n => Math.max(0, Math.min(1, n));
  const mix = (a,b,t) => a+(b-a)*t;
  const phase = (p,a,b) => { const t=clamp((p-a)/(b-a)); return t*t*(3-2*t); };
  function measure(){
    root.classList.toggle('motion',!reduced.matches);
    if(reduced.matches) return;
    const w=stage.clientWidth,h=stage.clientHeight,wide=w>=760&&w>h;
    const edge=parseFloat(getComputedStyle(root).getPropertyValue('--edge'));
    const y=wide?h*.16:Math.max(86,h*.115);
    const height=wide?h*.73:Math.min(h*.48,(w-edge*2)*1.14);
    g={w,h,wide,edge,y,height,start:wide?h*.39:h*.29,distance:sequence.offsetHeight-h};
    if(!wide) editorial.style.top=`${y+height+27}px`;
    else editorial.style.top='40%';
    paint();
  }
  function paint(){
    queued=false;if(!g||reduced.matches)return;
    const p=clamp((scrollY-sequence.offsetTop)/g.distance);
    // The photograph physically closes over the masthead before opening into a plate.
    const lift=phase(p,0,.44), inset=phase(p,.38,.88), settle=phase(p,.44,.94);
    const targetW=g.wide?g.w*.54:g.w-g.edge*2;
    const x=mix(0,g.wide?g.w*.05:g.edge,inset);
    const y=p<.44?mix(g.start,0,lift):mix(0,g.y,settle);
    const frameHeight=mix(g.h-g.start,g.height,phase(p,.44,.94));
    Object.assign(photo.style,{left:`${x}px`,top:`${y}px`,width:`${mix(g.w,targetW,inset)}px`,height:`${frameHeight}px`});
    word.style.visibility=p>.44?'hidden':'visible';
    root.style.setProperty('--word-y',`${-g.h*.035*lift}px`);
    stage.style.background=`rgb(${mix(200,230,inset)} ${mix(191,224,inset)} ${mix(209,232,inset)})`;
    // Keep the car's full rear three-quarter silhouette as the window changes ratio.
    photo.querySelector('img').style.objectPosition=g.wide?'50% 65%':'85% 63%';
    signature.style.opacity=phase(p,.66,.86);
    signature.style.visibility=p>.66?'visible':'hidden';
    cue.style.opacity=1-phase(p,0,.12);cue.style.visibility=p>.12?'hidden':'visible';
    editorial.style.visibility=p>.68?'visible':'hidden';
    editorial.style.clipPath=`inset(0 0 ${100*(1-phase(p,.68,.96))}% 0)`;
    editorial.style.transform=`translateY(${18*(1-phase(p,.48,.94))}px)`;
    document.querySelector('.journal-link').style.opacity=1-phase(p,.06,.22)+phase(p,.72,.92);
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(paint)}}
  document.querySelectorAll('a[href="#journal"]').forEach(a=>a.addEventListener('click',e=>{
    if(reduced.matches)return;e.preventDefault();scrollTo({top:sequence.offsetTop+g.distance,behavior:'smooth'});
  }));
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);
  reduced.addEventListener('change',measure);measure();
})();
