import * as THREE from 'three';
import { opticalFilm, carrierGeometry } from './optics.js';
const mix=THREE.MathUtils.lerp;
const ease=(a,b,p)=>{const t=THREE.MathUtils.clamp((p-a)/(b-a),0,1);return t*t*t*(t*(t*6-15)+10);};
const destinations=[
 ['JOURNAL','Yokohama · Visual journal','/journal/yokohama/'],
 ['WORLD','Cinematic World 001','/world/'],
 ['SYMBOL','Se-diyu','/symbol/'],
 ['HISTORY','Before the Name','/history/'],
 ['INSTAGRAM','TOHEŞAR / External','https://www.instagram.com/tohesar/']
];

export function createContinuum(scene,request){
 const root=new THREE.Group();scene.add(root);
 const nav=document.querySelector('#spatial-navigation');
 const editorial=document.querySelector('#archive-entry');
 const title=editorial.querySelector('h2'),index=editorial.querySelector('.eyebrow');
 const end=document.querySelector('#imprint');
 const loader=new THREE.TextureLoader();
 const textures=['./assets/yokohama-interior.webp','./assets/yokohama-bluehour.webp'].map(url=>{
  const texture=loader.load(url,request);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
 });
 const geometry=carrierGeometry();
 const panels=destinations.map(([name,description,href],i)=>{
  const group=new THREE.Group();root.add(group);
  const material=opticalFilm({map:textures[i%2],warm:[.2,.06,.88,.46,.65][i],ink:i<2?1:0});
  const mesh=new THREE.Mesh(geometry.surface,material);group.add(mesh);
  const edge=new THREE.Mesh(geometry.edge,new THREE.MeshStandardMaterial({color:i%2?0xc9b8a1:0x9eafb4,metalness:.96,roughness:.22,transparent:true,opacity:0}));group.add(edge);
  const link=document.createElement('a');link.href=href;
  link.innerHTML=`<span class="portal-index">0${i+1}</span><strong>${name}</strong><small>${description}</small><span class="portal-arrow" aria-hidden="true"><svg viewBox="0 0 12 12" width="12" height="12"><path d="M2 10 10 2M3 2h7v7" fill="none" stroke="currentColor" stroke-width="1"/></svg></span>`;
  if(i===4){link.target='_blank';link.rel='noopener noreferrer';}
  link.className='spatial-link';link.hidden=true;nav.append(link);
  let hovered=false,focused=false;
  const highlight=()=>{material.uniforms.focus.value=hovered||focused?1:0;request();};
  link.addEventListener('pointerenter',()=>{hovered=true;highlight();});link.addEventListener('pointerleave',()=>{hovered=false;highlight();});
  link.addEventListener('focus',()=>{focused=true;highlight();});link.addEventListener('blur',()=>{focused=false;highlight();});
  return {group,mesh,edge,material,link};
 });
 // A single curved datum carries the photographic emulsion into the leaves.
 // The two fine rails are actual world-space curves, not screen decorations.
 const rails=[-1,1].map(side=>{
  const points=Array.from({length:65},(_,i)=>new THREE.Vector3(i/64*6.5-.8,side*1.08+.15*Math.sin(i/64*Math.PI),-.17*Math.sin(i/64*Math.PI)));
  const rail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),96,.004,4,false),new THREE.MeshStandardMaterial({color:0xbabbb1,metalness:.92,roughness:.3,transparent:true}));
  scene.add(rail);return rail;
 });
 const point=new THREE.Vector3(),finalPosition=new THREE.Vector3();
 const inspection={architecture:0,reassembly:0,visibleLinks:0};
 function update(p,camera,anchor,mobile,width,height){
  const first=ease(.485,.552,p),second=ease(.577,.639,p);
  const architecture=ease(.65,.765,p),close=ease(.905,.989,p);
  const travel=(first+second)*.5,orbit=Math.sin(ease(.765,.905,p)*Math.PI);
  root.visible=p>.48;
  if(p>.48){
   // Approach → quiet photographic hold → lateral passage → a wide reveal.
   // Camera velocity is zero at the intentional holds; no timeline jumps.
   camera.position.set(anchor.x+(1.95*first+1.9*second)*(1-architecture)+.10*orbit*(1-close),anchor.y+.07*Math.sin(travel*Math.PI)*(1-architecture)+.06*orbit,-5-.9*travel-1.9*architecture+1.15*close);
   const yaw=.20*Math.sin(travel*Math.PI*2)*(1-architecture)+.18*orbit*(1-close);
   camera.lookAt(camera.position.x+yaw,camera.position.y+.08*close,-18);
   camera.updateMatrixWorld();
  }
  const halfH=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*7,halfW=halfH*camera.aspect;
  const gxPortrait=[-.43,.38,-.36,.41,-.16],gyPortrait=[.67,.34,.015,-.32,-.64];
  panels.forEach(({group,mesh,edge,material,link},i)=>{
   const emergence=i<2?ease(.48+i*.025,.522+i*.025,p):ease(.634,.70,p);
   const individual=ease(.651+i*.006,.744+i*.005,p);
   // Three unprinted layers originate immediately behind the last photograph.
   // Their silhouettes inherit its dimensions before opening into thresholds.
   const railX=anchor.x+(i===0?1.95:3.85)+(i>1?(i-1)*.045:0);
   const railZ=-10.4-(i>1?(i-1)*.085:0);
   const gx=mobile?gxPortrait[i]*halfW:(i-2)*halfW*.36;
   const gy=mobile?gyPortrait[i]*halfH:Math.sin(i*1.5)*halfH*.13;
   const gz=-14.8-[.1,.55,0,.65,.3][i];
   group.position.set(mix(railX,anchor.x+gx,architecture),mix(anchor.y+.24,anchor.y+gy,architecture),mix(railZ,gz,architecture));
   finalPosition.set(anchor.x+(i-2)*.043,anchor.y+.65+(i-2)*.018,-14.35-i*.095);
   // A brief outward breath precedes compression into a single lenticular fold.
   group.position.x+=Math.sin(close*Math.PI)*(i-2)*.12;
   group.position.lerp(finalPosition,close);
   const w=mix(mobile?1.64:1.94,mobile?halfW*1.07:halfW*.30,individual);
   const h=mix(mobile?2.05:2.425,mobile?halfH*.80:halfH*1.30,individual);
   group.scale.set(mix(w,.82,close),mix(h,2.08,close),mix(1,.73,close));
   const yaw=[-.44,.54,-.29,.46,-.34][i];
   group.rotation.set(mix(0,.055*Math.sin(i*2),architecture)*(1-close),mix(-.055,yaw,individual)*(1-close)+close*(.27+(i-2)*.045),mix(0,mobile?[.065,-.07,.025,-.05,.08][i]:-.06,architecture)*(1-close)-.23*close);
   const shape=individual*(1-close);
   mesh.morphTargetInfluences[0]=edge.morphTargetInfluences[0]=shape;
   mesh.morphTargetInfluences[1]=edge.morphTargetInfluences[1]=close;
   const u=material.uniforms;
   u.ink.value=(i<2?1:0)*(1-ease(.648,.716,p));
   u.opacity.value=emergence*mix(1,.87,individual)*(1-.18*close);
   u.metal.value=[.18,.64,.50,.28,.15][i]*individual*(1-close)+.52*close;
   u.lightPhase.value=p+.5*close;
   // A narrow remnant of the existing blue-hour image remains inside WORLD,
   // preserving the connection from photographic memory to a destination.
   u.aperture.value=(i===1?.78:0)*ease(.72,.78,p)*(1-close);
   edge.material.opacity=emergence*mix(.32,.76,individual);
   edge.material.roughness=.21+.08*(1-close);
   group.visible=emergence>.001;
   group.updateMatrixWorld();
   const active=p>=.765&&p<=.907;
   link.hidden=!active;link.tabIndex=active?0:-1;
   if(active){
    point.set(mobile?[.15,-.12,.12,-.12,.03][i]:0,mobile?-.015:-.20,.10).applyMatrix4(group.matrixWorld).project(camera);
    const labelWidth=mobile?Math.min(width*.36,164):Math.min(width*.16,205);
    link.style.left=`${THREE.MathUtils.clamp((point.x*.5+.5)*width,labelWidth/2+18,width-labelWidth/2-18)}px`;
    link.style.top=`${(-point.y*.5+.5)*height}px`;
    link.style.width=`${mobile?Math.min(width*.36,164):Math.min(width*.16,205)}px`;
    link.style.setProperty('--portal-presence',ease(.765,.785,p)*(1-ease(.89,.907,p)));
   }
  });
  rails.forEach(rail=>{rail.visible=p>.48&&p<.735;rail.position.set(anchor.x,anchor.y+.24,-10.48);rail.material.opacity=.38*ease(.48,.53,p)*(1-ease(.65,.735,p));});
  const titleA=ease(.532,.548,p)*(1-ease(.571,.587,p));
  const titleB=ease(.606,.625,p)*(1-ease(.65,.674,p));
  const entryOpacity=Math.max(titleA,titleB);
  editorial.hidden=entryOpacity<.005;
  if(!editorial.hidden){
   title.textContent=titleA>titleB?'A human trace.':'Blue hour.';index.textContent=titleA>titleB?'YOKOHAMA / 02':'YOKOHAMA / 03';
   editorial.style.opacity=entryOpacity;editorial.style.transform=`translate3d(0,${(1-entryOpacity)*9}px,0)`;
  }
  end.hidden=p<.968;end.style.opacity=ease(.968,.995,p);
  document.documentElement.style.setProperty('--continuum',architecture*(1-close));
  document.documentElement.style.setProperty('--final-light',ease(.905,.99,p));
  document.documentElement.style.setProperty('--archive-light',ease(.48,.55,p)*(1-ease(.665,.75,p)));
  inspection.architecture=architecture;inspection.reassembly=close;inspection.visibleLinks=p>=.765&&p<=.907?5:0;
  return {travel,architecture,close};
 }
 return {update,inspection};
}
