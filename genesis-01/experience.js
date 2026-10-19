// TOHEŞAR / Memory Rooms.
// A single continuous editorial installation assembled only from published
// Yokohama visual-fiction assets. Three distinct light states, not filler cards.
// The parent GENESIS scroll position drives everything; no second scroll layer.
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,p)=>{const x=clamp((p-a)/(b-a));return x*x*(3-2*x);};

const chapters=[
 {src:'./assets/yokohama-portrait.webp',title:'Arrival.',index:'01',label:'THE ARRIVAL',caption:'YOKOHAMA / VISUAL JOURNAL 001',hint:'A place that feels familiar.'},
 {src:'./assets/yokohama-interior.webp',title:'Human trace.',index:'02',label:'THE HUMAN TRACE',caption:'YOKOHAMA / AN IMAGINED PLACE',hint:'The light inside.'},
 {src:'./assets/yokohama-bluehour.webp',title:'Blue hour.',index:'03',label:'THE LAST LIGHT',caption:'YOKOHAMA / BLUE HOUR',hint:'The city after the sun.'}
];
export function createArchiveExperience(){
 const host=document.createElement('section');
 host.className='memory-rooms';
 host.hidden=true;
 host.setAttribute('aria-label','Yokohama — a memory space in three chapters');
 host.setAttribute('aria-hidden','true');
 host.innerHTML=`
  <div class="memory-rooms__architecture" aria-hidden="true">
   <div class="memory-rooms__vertical"></div>
   <div class="memory-rooms__glow"></div>
   <div class="memory-rooms__cut"></div>
  </div>
  <div class="memory-rooms__upper">
   <span>TOHEŞAR / MEMORY STUDY</span>
   <span>YOKOHAMA &nbsp; / &nbsp; 2026</span>
  </div>
  <div class="memory-rooms__composition">
   <div class="memory-rooms__gallery" role="img" aria-label="Three published, AI-assisted visual-fiction frames of Yokohama, shown in sequence">
    ${chapters.map((chapter,i)=>`
      <figure class="memory-rooms__image memory-rooms__image--${i+1}" data-frame="${i}">
       <img src="${chapter.src}" alt="" decoding="async" loading="eager" fetchpriority="low">
       <figcaption>${chapter.caption}</figcaption>
      </figure>`).join('')}
    <span class="memory-rooms__hairline memory-rooms__hairline--a" aria-hidden="true"></span>
    <span class="memory-rooms__hairline memory-rooms__hairline--b" aria-hidden="true"></span>
   </div>
   <div class="memory-rooms__editorial">
    <span class="memory-rooms__edition">TOHEŞAR &nbsp; / &nbsp; VISUAL FICTION 001</span>
    <div class="memory-rooms__titles">
     ${chapters.map((chapter,i)=>`<div class="memory-rooms__title" data-copy="${i}">
      <span class="memory-rooms__chapter">${chapter.index} &nbsp;—&nbsp; ${chapter.label}</span>
      <h2>${chapter.title}</h2>
      <p>${chapter.hint}</p>
     </div>`).join('')}
    </div>
    <a href="/journal/yokohama/" class="memory-rooms__read">
     <span>ENTER THE VISUAL JOURNAL</span><span aria-hidden="true">↗</span>
    </a>
    <div class="memory-rooms__progress" aria-hidden="true"><span></span><span></span><span></span></div>
   </div>
  </div>
  <div class="memory-rooms__lower">
   <span>CAR / PLACE / MEMORY</span>
   <span>AI-ASSISTED IMAGERY · EDITORIAL DIRECTION BY TOHEŞAR</span>
  </div>`;
 // Insert before the corresponding Chapter 05 threshold room, allowing the
 // photographed memory to become the same white exhibition architecture.
 const room=document.getElementById('threshold-index');
 if(room)room.before(host);else document.querySelector('main').append(host);
 const images=[...host.querySelectorAll('.memory-rooms__image')];
 const titles=[...host.querySelectorAll('.memory-rooms__title')];
 const ticks=[...host.querySelectorAll('.memory-rooms__progress span')];
 const link=host.querySelector('.memory-rooms__read');
 link.tabIndex=-1;
 const state={visible:false,chapter:0,presence:0};
 function update(p){
  const arrival=smooth(.484,.526,p),departure=1-smooth(.693,.744,p);
  const presence=arrival*departure;
  state.presence=presence;
  const show=presence>.006;
  host.hidden=!show;
  host.style.opacity=presence.toFixed(4);
  // A drawn slit opens into the photographic room, rather than fading to a
  // different fullscreen page. The final narrowing leads into the thresholds.
  const leaving=smooth(.693,.744,p);
  const revealLeft=(1-arrival)*38+leaving*18;
  const revealRight=(1-arrival)*12+leaving*12;
  host.style.clipPath=`inset(0 ${revealRight.toFixed(2)}% 0 ${revealLeft.toFixed(2)}%)`;
  const interactive=presence>.9&&p<.704;
  host.inert=!interactive;
  host.setAttribute('aria-hidden',String(!interactive));
  link.tabIndex=interactive?0:-1;
  if(!show){state.visible=false;return;}
  state.visible=true;
  const phases=[
   1-smooth(.555,.583,p),
   smooth(.552,.581,p)*(1-smooth(.626,.653,p)),
   smooth(.622,.652,p)
  ];
  const chapter=phases.indexOf(Math.max(...phases));
  state.chapter=chapter;
  const journey=smooth(.497,.693,p);
  host.style.setProperty('--room-travel',journey.toFixed(4));
  const dusk=smooth(.60,.67,p);
  host.style.setProperty('--room-temperature',dusk.toFixed(4));
  host.style.setProperty('--room-blue-opacity',(dusk*.75).toFixed(4));
  // A restrained virtual dolly move: the photograph, laminated aperture and
  // editorial caption occupy different depths without scripted autoplay.
  host.style.setProperty('--room-dolly',Math.sin(journey*Math.PI).toFixed(4));
  host.style.setProperty('--room-bearing',(journey*2-1).toFixed(4));
  // Architectural media planes move in depth, not vertically as feed cards.
  // A slight perspective shift makes each published photograph an actual
  // wall within the same room; the next wall becomes visible behind it.
  const roomDepth=smooth(.50,.692,p);
  images.forEach((figure,i)=>{
   const alpha=phases[i],distance=Math.abs(i-chapter);
   const offsetX=(i-1)*11+(roomDepth-.5)*31;
   const offsetY=(i-1)*6-(roomDepth-.5)*17;
   const offsetZ=-distance*36;
   const yaw=(i-1)*2.2+(1-alpha)*(i<chapter?-2.2:2.2);
   figure.style.opacity=alpha.toFixed(4);
   figure.style.zIndex=alpha>.5?'2':'1';
   figure.style.transform=`translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, ${offsetZ.toFixed(2)}px) rotateY(${yaw.toFixed(2)}deg) scale(${(1.023+roomDepth*.052).toFixed(4)})`;
  });
  // Unlike photographs, typography must NEVER cross-dissolve over the
  // same coordinates. End one title before introducing the next.
  // Video QA (iPad Safari): previous overlapping titles produced illegible
  // "Arrival / Human trace" and "Human trace / Blue hour" collisions.
  const copyPhases=[
   1-smooth(.546,.565,p),
   smooth(.568,.584,p)*(1-smooth(.614,.633,p)),
   smooth(.636,.654,p)
  ];
  titles.forEach((title,i)=>{
   const alpha=copyPhases[i];
   title.style.opacity=alpha.toFixed(4);
   title.style.visibility=alpha>.005?'visible':'hidden';
   title.style.transform=`translate3d(0,${((1-alpha)*11).toFixed(2)}px,0)`;
   title.setAttribute('aria-hidden',String(alpha<=.005));
  });
  ticks.forEach((tick,i)=>tick.classList.toggle('is-active',i===chapter));
 }
 return {update,state};
}
