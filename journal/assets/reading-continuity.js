/* TOHEŞAR — Reading Continuity 001
 * Resume what this visitor actually read. No account, network request or tracker.
 * All artwork, titles, links and credits are selected from an explicit allowlist.
 * Fallback remains an editorial selection when local storage is unavailable.
 */
(() => {
  'use strict';
  const KEY='tohesar.reading.v1';
  const RESUME_KEY='tohesar.reading.resume.v1';
  const MAX_AGE=90*24*60*60*1000;
  const MAX_ITEMS=6;
  const CATALOG={
    '/journal/911/':{
      kicker:'PORSCHE / 911',
      title:'형태가 시간을 통과하는 방식.',
      description:'낮은 보닛에서 지붕과 넓은 뒤쪽 어깨까지. 911이라는 실루엣을 오래 바라보다.',
      image:'/journal/assets/editorial-fresh/911-journal-abhinand-800.webp',
      srcset:'/journal/assets/editorial-fresh/911-journal-abhinand-800.webp 800w, /journal/assets/editorial-fresh/911-journal-abhinand-1200.webp 1200w',
      width:1200,height:1500,
      alt:'건물 앞의 두 대의 Porsche 911을 바라보는 에디토리얼 사진',
      credit:'Abhinand Venugopal',
      creditUrl:'https://unsplash.com/photos/a-silver-car-parked-in-front-of-a-garage-RhczKSVd860',
      license:'Unsplash License',
      licenseUrl:'https://unsplash.com/license'
    },
    '/journal/f40/':{
      kicker:'FERRARI / F40',
      title:'바람이 지나갈 자리를 남기다.',
      description:'구멍과 면, 그리고 거대한 윙. 기능을 감추지 않는 차체의 아름다움.',
      image:'/journal/assets/editorial-fresh/f40-home-luca-800.webp',
      srcset:'/journal/assets/editorial-fresh/f40-home-luca-800.webp 800w, /journal/assets/editorial-fresh/f40-home-luca-1200.webp 1200w',
      width:1200,height:800,
      alt:'붉은 Ferrari F40의 앞모습과 차체의 공기 흡입구',
      credit:'Luca Hooijer',
      creditUrl:'https://unsplash.com/photos/a-red-sports-car-parked-in-front-of-a-building-z3USd87EN6U',
      license:'Unsplash License',
      licenseUrl:'https://unsplash.com/license'
    },
    '/journal/design/giulia/':{
      kicker:'ALFA ROMEO / GIULIA',
      title:'비례가 말하는 것.',
      description:'긴 보닛과 짧은 오버행. 선 하나가 아니라 서로에게 내어 준 거리로 기억되는 세단.',
      image:'/journal/assets/giulia/front-1600.webp',
      srcset:'',
      width:1600,height:845,
      alt:'붉은 Alfa Romeo Giulia 앞부분의 차체 비례를 보여 주는 사진',
      credit:'Vauxford',
      creditUrl:'https://commons.wikimedia.org/wiki/File:2017_Alfa_Romeo_Giulia_V6_Biturbo_Automatic_3.0_Front.jpg',
      license:'CC BY-SA 4.0',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'
    },
    '/journal/design/type-01/':{
      kicker:'JAGUAR / TYPE 01',
      title:'새로운 시대의 비례.',
      description:'낮은 지붕과 긴 앞부분. 재규어가 그린 새로운 형태의 가능성을 살펴보다.',
      image:'/journal/assets/editorial-fresh/type01-home-jlr-800.webp',
      srcset:'/journal/assets/editorial-fresh/type01-home-jlr-800.webp 800w, /journal/assets/editorial-fresh/type01-home-jlr-1024.webp 1024w',
      width:1024,height:683,
      alt:'도로 위에 있는 은색 Jaguar Type 01의 공식 이미지',
      credit:'Jaguar Land Rover Limited',
      creditUrl:'https://media.jlr.com/jaguar/en-gb/news/2026/10/jaguar-type-01-new-era-begins',
      license:'JLR 이용 조건',
      licenseUrl:'https://media.jlr.com/jaguar/en-gb/user-licence'
    },
    '/journal/field-notes/001/':{
      kicker:'TOHEŞAR / FIELD NOTES 001',
      title:'어떤 차는 선으로 남는다.',
      description:'911, F40, Giulia. 서로 다른 세 자동차로 읽는 형태와 기억의 관계.',
      image:'/assets/cover-911-valentin-kremer.jpg',
      srcset:'',
      width:1200,height:1989,
      alt:'벽돌 건물 앞에 선 검은 Porsche 911의 실루엣',
      credit:'Valentin Kremer',
      creditUrl:'https://unsplash.com/license',
      license:'Unsplash License',
      licenseUrl:'https://unsplash.com/license'
    }
  };
  const path=location.pathname.replace(/\/+$/,'/')||'/';
  const now=()=>Date.now();
  const validRecord=r=>r&&typeof r==='object'&&Object.prototype.hasOwnProperty.call(CATALOG,r.path)&&Number.isFinite(r.updated)&&now()-r.updated<=MAX_AGE&&r.updated<=now()+60000&&Number.isFinite(r.progress)&&r.progress>=0&&r.progress<=1;
  function getHistory(){
    try{
      const data=JSON.parse(localStorage.getItem(KEY)||'[]');
      if(!Array.isArray(data))return [];
      return data.filter(validRecord).sort((a,b)=>b.updated-a.updated).slice(0,MAX_ITEMS);
    }catch(_){return []}
  }
  function remember(progress){
    const item={path,progress:Math.round(Math.max(0,Math.min(progress,1))*100)/100,updated:now()};
    const list=[item,...getHistory().filter(r=>r.path!==path)].slice(0,MAX_ITEMS);
    try{localStorage.setItem(KEY,JSON.stringify(list))}catch(_){/* Private browsing: keep static editorial fallback. */}
  }
  function localProgress(){
    const height=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    return Math.max(0,Math.min(1,window.scrollY/height));
  }
  function enableArticleMemory(){
    const entered=now();
    let lastWritten=0;
    function checkpoint(force=false){
      // Brief accidental visits should not displace an article the reader chose.
      if(now()-entered<4500&&window.scrollY<120)return;
      if(!force&&now()-lastWritten<1400)return;
      lastWritten=now();
      remember(localProgress());
    }
    window.addEventListener('scroll',()=>checkpoint(),{passive:true});
    window.addEventListener('pagehide',()=>checkpoint(true));
    window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')checkpoint(true)});
    window.setTimeout(()=>checkpoint(),5000);
    // Resume is explicit: only the CTA/card click on the homepage sets this flag.
    let resume=null;
    try{
      resume=JSON.parse(sessionStorage.getItem(RESUME_KEY)||'null');
      sessionStorage.removeItem(RESUME_KEY);
    }catch(_){/* Session storage may be blocked. */}
    if(resume&&resume.path===path&&now()-resume.at<60000&&resume.progress>=.035&&resume.progress<.94&&!location.hash){
      window.addEventListener('load',()=>{
        window.setTimeout(()=>{
          const target=Math.round(resume.progress*Math.max(0,document.documentElement.scrollHeight-window.innerHeight));
          window.scrollTo({top:target,behavior:'auto'});
        },120);
      },{once:true});
    }
  }
  const hero=document.querySelector('[data-reading-feature]');
  function updateCredit(holder,article){
    if(!holder)return;
    const link=(text,href)=>{
      const a=document.createElement('a');a.href=href;a.textContent=text;
      a.target='_blank';a.rel='noopener noreferrer';return a;
    };
    holder.replaceChildren(document.createTextNode('사진: '),
      link(article.credit,article.creditUrl),
      document.createTextNode(' / '),
      link(article.license,article.licenseUrl),
      document.createTextNode(' · 웹사이트 아카이브 이미지'));
  }
  function enableHomeContinuity(){
    if(!hero)return;
    const img=hero.querySelector('[data-reading-image]');
    const label=hero.querySelector('[data-reading-kicker]');
    const title=hero.querySelector('[data-reading-title]');
    const description=hero.querySelector('[data-reading-description]');
    const credit=hero.querySelector('[data-reading-credit]');
    const status=hero.querySelector('[data-reading-status]');
    const meter=hero.querySelector('[data-reading-meter]');
    const action=hero.querySelector('[data-reading-action]');
    const links=[...hero.querySelectorAll('[data-reading-link]')];
    if(!img||!label||!title||!description||!action||!links.length)return;
    let active=null;
    function refresh(){
      const last=getHistory().find(r=>r.progress<.94);
      // Without actual history, keep the handpicked F40 cover and describe it honestly.
      if(!last){
        active=null;
        label.textContent='에디터가 고른 이야기 / FERRARI F40';
        title.textContent='바람이 지나갈 자리를 남기다.';
        description.textContent=CATALOG['/journal/f40/'].description;
        action.textContent='에디토리얼 읽기';
        for(const a of links)a.href='/journal/f40/';
        const fallback=CATALOG['/journal/f40/'];
        img.src=fallback.image;img.srcset=fallback.srcset;img.width=fallback.width;img.height=fallback.height;img.alt=fallback.alt;
        updateCredit(credit,fallback);
        if(status)status.hidden=true;
        if(meter)meter.hidden=true;
        return;
      }
      const article=CATALOG[last.path];
      active={...last};
      label.textContent='읽던 이야기 / '+article.kicker;
      title.textContent=article.title;
      description.textContent=article.description;
      action.textContent='읽던 지점에서 이어 읽기';
      for(const a of links)a.href=last.path;
      img.srcset=''; // Clear stale candidates before switching image formats.
      img.src=article.image;
      if(article.srcset)img.srcset=article.srcset;
      img.width=article.width;img.height=article.height;img.alt=article.alt;
      updateCredit(credit,article);
      if(status){status.hidden=false;status.textContent='이 기기에서 읽던 이야기 · 약 '+Math.round(last.progress*100)+'% 지점';}
      if(meter){
        meter.hidden=false;
        meter.style.setProperty('--resume-percent',Math.round(last.progress*100)+'%');
        meter.setAttribute('aria-valuenow',String(Math.round(last.progress*100)));
      }
    }
    hero.addEventListener('click',event=>{
      const a=event.target.closest('[data-reading-link]');
      if(!a||!active)return;
      // Never intercept normal links or claim a resume when navigating elsewhere.
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      try{sessionStorage.setItem(RESUME_KEY,JSON.stringify({path:active.path,progress:active.progress,at:now()}))}catch(_){}
    });
    refresh();
    window.addEventListener('pageshow',refresh);
    window.addEventListener('storage',event=>{if(event.key===KEY)refresh()});
  }
  if(Object.prototype.hasOwnProperty.call(CATALOG,path))enableArticleMemory();
  if(hero)enableHomeContinuity();
})();
