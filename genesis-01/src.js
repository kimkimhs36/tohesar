import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// A new procedural artifact: two unequal folded folios, never a swept ribbon.
// All deformation and camera motion share one reversible 0–0.30 timeline.
const stage = document.querySelector('#stage');
const fallback = document.querySelector('#fallback');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = THREE.MathUtils.clamp;
const ease = (a,b,p) => {const t=clamp((p-a)/(b-a),0,1);return t*t*(3-2*t);};
let renderer;
try { renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'}); }
catch { fallback.hidden=false; }
if(renderer) init();
function init(){
renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
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
titanium.bumpMap=brushed;titanium.bumpScale=.008;
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
 x+=s*open*(.24+u*.88);z-=open*(u*.85);y+=open*s*u*.14;
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
const forced=new URLSearchParams(location.search).get('p');
function measure(){
 const w=stage.clientWidth,h=stage.clientHeight;mobile=w/h<.8;
 renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
 scrollRange=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 onScroll();
}
function onScroll(){target=reduced.matches?0:forced!==null?clamp(Number(forced)||0,0,.3):clamp(scrollY/scrollRange,0,1)*.3;request();}
function request(){if(!raf&&!document.hidden&&!contextLost)raf=requestAnimationFrame(draw);}
function pose(p){
 const opening=ease(.17,.235,p),split=ease(.23,.27,p),pass=ease(.27,.30,p);
 for(let i=0;i<4;i++)morphs[i].morphTargetInfluences[0]=opening;
 for(const mesh of [...films,...filmEdges])mesh.morphTargetInfluences[0]=split;
 // The artifact stays in place. The camera crosses its z-depth at the final beat.
 sculpture.position.set(mobile?.66:1.22,mobile?.62:.05,0);
 sculpture.scale.setScalar(mobile?.84:1);
 sculpture.rotation.y=THREE.MathUtils.lerp(-.32,0,split);
 sculpture.rotation.z=THREE.MathUtils.lerp(-.18,-.035,split);
 const startZ=mobile?10.2:9.5;
 camera.position.set(THREE.MathUtils.lerp(0,sculpture.position.x,split),THREE.MathUtils.lerp(.12,sculpture.position.y,split),startZ-ease(.12,.23,p)*1.55-pass*(startZ-.7));
 camera.lookAt(camera.position.x,camera.position.y,-8);
 shadow.material.opacity=1-split;
 document.documentElement.style.setProperty('--caption',1-ease(.12,.19,p));
 document.documentElement.style.setProperty('--hint',1-ease(.01,.08,p));
 document.querySelector('#phase').textContent=p<.17?'FOLDED MEMORY':p<.23?'OPENING':p<.27?'LAYER SEPARATION':'WITHIN THE LAYERS';
 document.querySelector('#percent').textContent=`${String(Math.round(p*100)).padStart(2,'0')} / 30`;
}
let lastFrame=0;
function draw(now){raf=0;const dt=lastFrame?Math.min((now-lastFrame)/1000,.1):1/60;lastFrame=now;progress+= (target-progress)*(1-Math.exp(-12*dt));if(Math.abs(target-progress)<.00002)progress=target;pose(progress);renderer.render(scene,camera);if(progress!==target)request();}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',measure);visualViewport?.addEventListener('resize',measure);
reduced.addEventListener('change',onScroll);document.addEventListener('visibilitychange',request);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;fallback.hidden=false;});
renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;fallback.hidden=true;request();});
// Explicit read-only inspection for repeatable browser verification.
window.__genesis={get state(){return {progress,target,camera:camera.position.toArray(),morph:morphs.map(m=>m.morphTargetInfluences[0]),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,reduced:reduced.matches};}};
measure();
if(forced!==null){progress=target;}
}
