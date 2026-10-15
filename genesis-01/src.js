import * as THREE from 'three';
import { createContinuum } from './continuum.js';
import { createRevelation } from './revelation.js';
import { stepSpring, openingAir } from './motion.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// A new procedural artifact: two unequal folded folios, never a swept ribbon.
// All deformation and camera motion share one reversible 0–1 timeline.
const stage = document.querySelector('#stage');
const fallback = document.querySelector('#fallback');
const atmosphere = document.querySelector('#atmosphere');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = THREE.MathUtils.clamp;
const ease = (a,b,p) => {const t=clamp((p-a)/(b-a),0,1);return t*t*(3-2*t);};
let renderer;
try { renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'}); }
catch { fallback.hidden=false; }
if(renderer) init();
document.querySelector('#return-start').addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}));
function init(){
// On narrow iPhone viewports, reduce expensive fill-rate without losing the 3D artwork.
renderer.setPixelRatio(Math.min(devicePixelRatio,Math.min(innerWidth,innerHeight)<650?1.5:1.65));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.02;
stage.append(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,.035,70);
const pmrem=new THREE.PMREMGenerator(renderer);
const room=new RoomEnvironment();
// Large reflected light cards, with restrained blue/peach chromatic separation.
const card=(color,x,y,z,sx,sy)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(sx,sy),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);room.add(m);};
card(0x20282b,-1.8,0,4,1.2,6);card(0xfff5e7,1.8,2,3,.8,6);
card(0xc1e4ff,-3,2,2,3,7);card(0xf3c9ac,4,-1,1,2,6);card(0x252a30,1,1,-3,1.8,7);
const env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xdceefa,0xd7b7a2,.75));
const key=new THREE.DirectionalLight(0xfff5e6,2.2);key.position.set(-3,5,6);scene.add(key);
const sky=new THREE.DirectionalLight(0xb9d8ef,1.4);sky.position.set(4,2,-1);scene.add(sky);
const peach=new THREE.DirectionalLight(0xf6baa0,.8);peach.position.set(-2,-3,3);scene.add(peach);
const sculpture=new THREE.Group();scene.add(sculpture);sculpture.rotation.set(-.09,-.32,-.18);
const titanium=new THREE.MeshPhysicalMaterial({color:0x8a9ba5,metalness:.94,roughness:.38,anisotropy:.55,clearcoat:.2,clearcoatRoughness:.3,side:THREE.DoubleSide});
const edgeMaterial=new THREE.MeshStandardMaterial({color:0xdde3e4,metalness:1,roughness:.12});
// Deterministic hairline finish; no external texture or noise animation.
const finish=new Uint8Array(256*256*4);
for(let y=0;y<256;y++)for(let x=0;x<256;x++){
 const i=(y*256+x)*4,n=126+22*Math.sin(x*17.13)+8*Math.sin(x*3.7+y*.19);
 finish[i]=finish[i+1]=finish[i+2]=n;finish[i+3]=255;
}
const brushed=new THREE.DataTexture(finish,256,256);brushed.wrapS=brushed.wrapT=THREE.RepeatWrapping;brushed.repeat.set(3,1);brushed.needsUpdate=true;
titanium.bumpMap=brushed;titanium.bumpScale=.004;
// Broad satin faces and a finer pressed crest respond differently to the
// same light card; the finish stays attached to the authored surface UVs.
titanium.onBeforeCompile=shader=>{
 shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
  float pressed = smoothstep(.55,.70,vBumpMapUv.x) * (1.0-smoothstep(.70,.86,vBumpMapUv.x));
  roughnessFactor = clamp(roughnessFactor + .045*sin(vBumpMapUv.y*8.0) - .11*pressed,.23,.46);
 `);
};
const films=[];const morphs=[];const filmEdges=[];

// s: left/right folio, u: spine→cut edge, v: foot→crown, open: authored morph target.
function folio(s,u,v,open=0,layer=-1){
 const t=v*2-1;
 const w=s<0 ? .98 : 1.65;
 const crown=s<0 ? .12 : -.30;
 const width=w*(.42+.64*Math.sin(v*Math.PI*.92)+.12*Math.sin(v*7));
 const seam=.25*Math.sin(t*2.1)+.10*t;
 let x=seam+s*(.085+width*u);
 let y=t*2.26 + crown*u + .20*Math.sin(u*Math.PI)*Math.sin(v*2.4) - .38*u*u*(1-v) - .42*u*u*Math.pow(v,5);
 // A pressed ridge and broad concave face: a folio with material memory.
 let z=.64*Math.sin(u*Math.PI*1.12)+.48*u*u+.32*Math.sin(v*4+u*2)-.12*t;
 z+=s<0 ? .18*u : -.19*u;
 z+=.14*Math.tanh((u-.65)*9)+.32*Math.pow(v,5)*u;
 if(s<0){y=y*.85+.13;x-=.13*Math.pow(v,4);}
 x+=s*open*(.5+u*.9);z+=open*(u*.4);y+=open*s*u*.14;
 if(layer>=0){
  x=seam+(x-seam)*(.86-layer*.045);
  y=y*(.91-layer*.025)+layer*.045;
  z-=.65+layer*.18;
 }
 return new THREE.Vector3(x,y,z);
}
function grid(fn,nu=44,nv=92){
 const points=[],uv=[],idx=[];
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){points.push(...fn(i/nu,j/nv).toArray());uv.push(i/nu,j/nv);}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;idx.push(a,b,a+1,b,b+1,a+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
function morphMesh(closed,opened,material){
 closed.morphAttributes.position=[opened.attributes.position];closed.morphAttributes.normal=[opened.attributes.normal];
 const mesh=new THREE.Mesh(closed,material);sculpture.add(mesh);morphs.push(mesh);return mesh;
}
function border(s,open){
 const pts=[];
 for(let j=0;j<=92;j++)pts.push(folio(s,0,j/92,open));
 for(let i=1;i<=44;i++)pts.push(folio(s,i/44,1,open));
 for(let j=91;j>=0;j--)pts.push(folio(s,1,j/92,open));
 for(let i=43;i>=0;i--)pts.push(folio(s,i/44,0,open));
 return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),256,.009,5,true);
}
for(const s of [-1,1]){
 morphMesh(grid((u,v)=>folio(s,u,v)),grid((u,v)=>folio(s,u,v,1)),titanium);
 morphMesh(border(s,0),border(s,1),edgeMaterial);
}
// Procedural registration lines encode the idea of a record, not fictional archives.
function filmTexture(n){
 const c=document.createElement('canvas');c.width=512;c.height=1024;const ctx=c.getContext('2d');
 const g=ctx.createLinearGradient(0,0,512,1024);g.addColorStop(0,'#8faebf');g.addColorStop(.48,'#e2d6c4');g.addColorStop(1,'#c58e78');ctx.fillStyle=g;ctx.fillRect(0,0,512,1024);
 ctx.strokeStyle='rgba(45,67,75,.43)';ctx.lineWidth=1;
 for(let i=0;i<34;i++){const y=130+i*23;ctx.beginPath();ctx.moveTo(35,y);ctx.lineTo(470-(i%5)*13,y);ctx.stroke();}
 ctx.strokeStyle='rgba(255,255,255,.7)';ctx.strokeRect(22,22,468,980);
 ctx.fillStyle='rgba(61,76,80,.65)';ctx.font='14px monospace';ctx.fillText(`TOHEŞAR  /  MATERIAL ${String(n+1).padStart(2,'0')}`,39,75);
 for(let j=0;j<16;j++)ctx.fillRect(35+j*28,951,1,j%4===0?22:8);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
for(let k=0;k<5;k++){
 const mat=new THREE.MeshPhysicalMaterial({map:filmTexture(k),color:0xb9c5c6,metalness:.08,roughness:.32,envMapIntensity:.45,transmission:.12,thickness:.055,ior:1.33,transparent:true,opacity:.86,side:THREE.DoubleSide,depthWrite:false});
 mat.forceSinglePass=true;
 const s=k%2===0?1:-1;
 const closed=grid((u,v)=>folio(s,u,v,0,k),24,56);
 const openPoint=(u,v)=>{
  const p=folio(s,u,v,1,k);p.x=s*(.14+k*.035+u*(1.8+k*.14));p.z=-.6-k*1.3-u*.9+Math.sin(u*Math.PI)*.16;p.y*=1.15;return p;
 };
 const opened=grid(openPoint,24,56);
 const mesh=morphMesh(closed,opened,mat);mesh.renderOrder=5-k;films.push(mesh);
 const perimeter=fn=>{const pts=[];for(let j=0;j<=48;j++)pts.push(fn(0,j/48));for(let i=1;i<=24;i++)pts.push(fn(i/24,1));for(let j=47;j>=0;j--)pts.push(fn(1,j/48));for(let i=23;i>=0;i--)pts.push(fn(i/24,0));return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),192,.004,3,true);};
 const a=perimeter((u,v)=>folio(s,u,v,0,k)),b=perimeter(openPoint);
 a.morphAttributes.position=[b.attributes.position];a.morphAttributes.normal=[b.attributes.normal];
 const rim=new THREE.Mesh(a,new THREE.MeshBasicMaterial({color:k%2?0x94705e:0x6b8e9f,transparent:true,opacity:.5}));sculpture.add(rim);filmEdges.push(rim);
}
// Wide, diffuse contact shadow; no expensive realtime shadow pass.
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
const sc=shadowCanvas.getContext('2d'),sg=sc.createRadialGradient(64,64,0,64,64,64);sg.addColorStop(0,'rgba(56,65,65,.18)');sg.addColorStop(1,'rgba(56,65,65,0)');sc.fillStyle=sg;sc.fillRect(0,0,128,128);
const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5,2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.position.set(.4,-2.65,-.5);shadow.rotation.x=-Math.PI/2;scene.add(shadow);
let progress=0,target=0,raf=0,scrollRange=1,mobile=false,contextLost=false;
let progressVelocity=0,airProgress=0,airVelocity=0;
// Cached labels: avoid querying the live DOM on each WebGL animation frame.
const phaseLabel=document.querySelector('#phase');
const percentLabel=document.querySelector('#percent');
const revelation=createRevelation(scene,request);
const continuum=createContinuum(scene,request);
let forced=new URLSearchParams(location.search).get('p');
let measuredWidth=0,measuredHeight=0,resizeQueued=false;
function measure(){
 const w=stage.clientWidth,h=stage.clientHeight;
 if(w<1||h<1)return;
 mobile=w/h<.8;
 // Dynamic Safari browser chrome can fire multiple VisualViewport events;
 // avoid reallocating the WebGL backbuffer unless the actual stage changed.
 if(w!==measuredWidth||h!==measuredHeight){
  measuredWidth=w;measuredHeight=h;
  renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 scrollRange=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 onScroll();
}
function queueMeasure(){
 if(resizeQueued)return;
 resizeQueued=true;
 requestAnimationFrame(()=>{resizeQueued=false;measure();});
}
function onScroll(){const raw=forced!==null?clamp(Number(forced)||0,0,1):clamp(scrollY/scrollRange,0,1);target=reduced.matches?[0,.215,.43,.57,.8,1][Math.min(5,Math.floor(raw*6))]:raw;request();}
function request(){if(!raf&&!document.hidden&&!contextLost)raf=requestAnimationFrame(draw);}
function pose(p,air=p){
 // The colored air is a material environment, not a looping video.
 // The backdrop's motion is time-driven by GPU-composited CSS animations
 // while these offsets connect its spatial phase to the physical sculpture.
 // The first 0–10.5% used to appear frozen. A separate spring-driven color
 // timeline now opens the atmosphere immediately, ahead of the metal morph.
 const awake=openingAir(air);
 const returnLight=ease(.90,1,air),railLight=Math.sin(ease(.48,.90,air)*Math.PI);
 const depth=ease(.12,.30,air),archive=ease(.30,.43,air);
 // Counter-moving luminous volumes create a visible soft folding motion.
 // Their existing palette, dimensions and autonomous CSS cycles stay intact.
 atmosphere.style.setProperty('--sky-shift-x',(-4+22*awake-24*depth+35*archive-22*railLight-24*returnLight).toFixed(3)+'vw');
 atmosphere.style.setProperty('--sky-shift-y',(-4+12*awake+17*depth-13*archive).toFixed(3)+'dvh');
 atmosphere.style.setProperty('--peach-shift-x',(-7-27*awake+33*depth-34*archive).toFixed(3)+'vw');
 atmosphere.style.setProperty('--peach-shift-y',(4-11*awake-18*depth+14*archive-17*railLight-12*returnLight).toFixed(3)+'dvh');
 atmosphere.style.setProperty('--glass-shift-x',(8+19*awake-27*depth+23*archive+12*railLight-18*returnLight).toFixed(3)+'vw');
 atmosphere.style.setProperty('--glass-shift-y',(-2-14*awake+14*depth-21*archive).toFixed(3)+'dvh');
 atmosphere.style.setProperty('--archive-calm',archive.toFixed(3));
 // Two lights physically glide across the titanium as the CSS color fields
 // cross the viewer. A small reflection gain leaves the approved finish intact.
 sky.intensity=1.38+.18*awake+.25*depth-.18*archive;
 peach.intensity=.84+.16*awake+.38*depth-.23*archive;
 sky.position.set(4+.75*awake-1.35*depth+.65*archive,2+.5*awake+.8*depth,-1+1.65*archive);
 peach.position.set(-2-.8*awake+1.50*depth-.35*archive,-3+.5*awake+1.1*depth,3+.45*archive);
 titanium.envMapIntensity=1+.11*depth-.06*archive;
 edgeMaterial.roughness=.12+.025*archive;
 const opening=ease(.17,.235,p),split=ease(.23,.27,p),pass=ease(.27,.30,p);
 // CSS and WebGL receive the same progress rather than drifting independently.
 atmosphere.style.setProperty('--optic-open',Math.min(1,.45*awake+.55*ease(.16,.28,air)).toFixed(3));
 atmosphere.style.setProperty('--optic-align',ease(.37,.43,air).toFixed(3));
 for(let i=0;i<4;i++)morphs[i].morphTargetInfluences[0]=opening;
 films.forEach((film,i)=>{
  const release=ease(.23+i*.0015,.264+i*.0015,p);
  film.morphTargetInfluences[0]=release;filmEdges[i].morphTargetInfluences[0]=release;
 });
 // The artifact stays in place. The camera crosses its z-depth at the final beat.
 sculpture.position.set(mobile?.66:1.22,mobile?.62:.05,0);
 sculpture.scale.setScalar(mobile?.84:1);
 sculpture.rotation.y=THREE.MathUtils.lerp(-.32,0,split)+.055*Math.sin(awake*Math.PI);
 sculpture.rotation.z=THREE.MathUtils.lerp(-.18,-.035,split);
 const startZ=mobile?10.2:9.5;
 // Hold a composed portrait while the fold opens, before the camera enters.
 const approach=ease(.12,.23,p)*.72;
 const threshold=ease(.23,.27,p)*4.13;
 const penetration=pass*(startZ-4.0);
 camera.position.set(THREE.MathUtils.lerp(0,sculpture.position.x,split),THREE.MathUtils.lerp(.12,sculpture.position.y,split),startZ-approach-threshold-penetration);
 camera.lookAt(camera.position.x,camera.position.y,-8);
 const scatter=ease(.30,.37,p),arrive=ease(.37,.43,p);
 if(p>.30){
  camera.position.set(sculpture.position.x+Math.sin(Math.PI*scatter)*.4+(1-arrive)*scatter*(mobile?.45:.9),sculpture.position.y+.18*scatter*(1-arrive),THREE.MathUtils.lerp(-.85,-3.3,scatter)-arrive*1.7);
  camera.lookAt(camera.position.x,camera.position.y,-16);
 }
 films.forEach((film,i)=>{const side=i%2?-1:1;film.position.set(side*scatter*(1.1+i*.17),scatter*(i-2)*.3,-scatter*.5);filmEdges[i].position.copy(film.position);});
 const anchor=sculpture.position.clone();
 const late=continuum.update(p,camera,anchor,mobile,measuredWidth,measuredHeight);
 revelation.update(p,camera,anchor,mobile);
 // Return the original authored metal to the compressed film stack. Its
 // slimmer silhouette records the journey, rather than resetting the scene.
 const reunion=ease(.93,.99,p);
 sculpture.visible=p<.48||p>.93;
 if(p>.93){
  sculpture.position.set(anchor.x,anchor.y+.2,-14.65);
  sculpture.scale.set(.45*reunion,.59*reunion,.32*reunion);
  sculpture.rotation.set(-.09,.22,-.20);
  for(let i=0;i<4;i++)morphs[i].morphTargetInfluences[0]=.12*(1-reunion);
 }
 films.forEach(film=>film.visible=p<.48);filmEdges.forEach(rim=>rim.visible=p<.48);
 document.documentElement.style.setProperty('--revelation',ease(.43,.46,p)*(1-ease(.485,.525,p)));
 document.documentElement.style.setProperty('--source',ease(.31,.35,p)*(1-ease(.65,.72,p)));
 shadow.material.opacity=(1-split)*(1-ease(.46,.48,p));
 document.documentElement.style.setProperty('--caption',1-ease(.12,.19,p));
 document.documentElement.style.setProperty('--hint',1-ease(.01,.08,p));
 phaseLabel.textContent=p>.975?'MEMORY ALLOY':p>.90?'REASSEMBLY':p>.72?'FIVE THRESHOLDS':p>.64?'IMAGE INTO MATTER':p>.48?'THE EDITORIAL RAIL':p<.17?'FOLDED MEMORY':p<.23?'OPENING':p<.27?'LAYER SEPARATION':p<.30?'WITHIN THE LAYERS':p<.37?'MEMORY FRAGMENTS':p<.43?'FINDING A PERSPECTIVE':'A SCENE, REMEMBERED';
 percentLabel.textContent=`${String(Math.round(p*100)).padStart(2,'0')} / 100`;
}
let lastFrame=0;
function draw(now){
 raf=0;
 const dt=lastFrame?Math.min(Math.max((now-lastFrame)/1000,0),.1):1/60;
 lastFrame=now;
 if(reduced.matches){
  progress=airProgress=target;
  progressVelocity=airVelocity=0;
 }else{
  // Critically damped camera + gently elastic atmosphere. Exact time-based
  // springs avoid the staircase / draggy sensation of direct scroll mapping.
  const cameraStep=stepSpring(progress,progressVelocity,target,dt,17,1);
  const airStep=stepSpring(airProgress,airVelocity,target,dt,11,.8);
  progress=cameraStep.position;progressVelocity=cameraStep.velocity;
  airProgress=airStep.position;airVelocity=airStep.velocity;
 }
 pose(progress,airProgress);
 renderer.render(scene,camera);
 if(progress!==target||airProgress!==target)request();
}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',queueMeasure);
window.visualViewport?.addEventListener('resize',queueMeasure);
reduced.addEventListener('change',queueMeasure);
document.addEventListener('visibilitychange',()=>{
 document.documentElement.classList.toggle('page-hidden',document.hidden);
 if(!document.hidden){lastFrame=0;queueMeasure();request();}
});
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;fallback.hidden=false;});
renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;fallback.hidden=true;request();});
// Explicit read-only inspection for repeatable browser verification.
window.__genesis={seek(p){if(forced!==null){forced=String(clamp(p,0,1));onScroll();progress=airProgress=target;progressVelocity=airVelocity=0;pose(progress,airProgress);renderer.render(scene,camera);}},get state(){return {progress,target,airProgress,progressVelocity,airVelocity,camera:camera.position.toArray(),morph:morphs.map(m=>m.morphTargetInfluences[0]),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,reduced:reduced.matches,optical:{open:Number(atmosphere.style.getPropertyValue('--optic-open')),align:Number(atmosphere.style.getPropertyValue('--optic-align')),sky:sky.position.toArray(),peach:peach.position.toArray()},revelation:revelation.inspection,mediaReady:revelation.ready};}};
measure();
if(forced!==null){progress=airProgress=target;progressVelocity=airVelocity=0;pose(progress,airProgress);renderer.render(scene,camera);}
}
