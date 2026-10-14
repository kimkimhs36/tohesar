/* MEMORY ALLOY 001 — Three.js procedural folios / one scene, reversible scroll / mobile-first.
   Original shape study, NOT Se-diyu, not CHROME ATMOSPHERE and not a published work. */
import * as THREE from "three";

const $ = (s) => document.querySelector(s);
const clamp = (v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth = (a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
const canvas=$("#scene"), stage=$("#viewport"), sequence=$("#sequence");
const first=$("#editorial-first"), second=$("#editorial-second");
const indexToggle=$("#index-toggle"), panel=$("#index-panel"), indexClose=$("#index-close");
const motion=$("#motion-control"), reduced=matchMedia("(prefers-reduced-motion: reduce)");
let paused=reduced.matches;
function setMenu(open){panel.hidden=!open;indexToggle.setAttribute("aria-expanded",String(open));if(open)indexClose.focus();else indexToggle.focus();}
indexToggle.addEventListener("click",()=>setMenu(panel.hidden));
indexClose.addEventListener("click",()=>setMenu(false));
document.addEventListener("keydown",(e)=>{if(e.key==="Escape"&&!panel.hidden)setMenu(false);});
let renderer;
try {
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
 renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.3;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(35,1,.08,80);
 const group=new THREE.Group();scene.add(group);

 // Reflective studio: lit panels and dark flags create legible titanium, not flat chrome.
 const rig=new THREE.Scene();
 rig.background=new THREE.Color("#838e93");
 const panels=[
  [-4.1,2.5,3,2.5,8.6,0xf1f9ff,4.0],
  [3.7,1.6,1.7,1.4,8.0,0xffd2b7,3.2],
  [-.7,5.2,1,6,2.5,0xffffff,4.2],
  [-.5,-3.8,3,7,2,0x87979d,1.0],
  [-1.7,1.1,4,.76,8.4,0x10191c,.15],
  [1.6,0,4,.75,7.8,0x192024,.12],
  [-4.5,0,-2,3,6,0xb6d6ef,1.8]
 ];
 for(const [x,y,z,w,h,color,intensity] of panels){
  const material=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide,toneMapped:false});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
  mesh.position.set(x,y,z);mesh.lookAt(0,0,0);rig.add(mesh);
 }
 const pmrem=new THREE.PMREMGenerator(renderer);
 const generated=pmrem.fromScene(rig,.07,.1,45);
 scene.environment=generated.texture;pmrem.dispose();
 rig.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 scene.add(new THREE.HemisphereLight(0xe7f1ff,0xbb9888,1.0));
 const key=new THREE.DirectionalLight(0xfff4e7,2.1);
 key.position.set(-3.5,4,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xb5d5f1,2.1);rim.position.set(4,1,-3);scene.add(rim);

 const materialA=new THREE.MeshPhysicalMaterial({color:0xc5cccd,metalness:1,roughness:.32,clearcoat:.15,clearcoatRoughness:.28,envMapIntensity:1.35,side:THREE.DoubleSide});
 const materialB=new THREE.MeshPhysicalMaterial({color:0xe1ded9,metalness:1,roughness:.22,clearcoat:.4,clearcoatRoughness:.14,envMapIntensity:1.48,side:THREE.DoubleSide});
 const materialTrim=new THREE.MeshPhysicalMaterial({color:0xf2f2f0,metalness:1,roughness:.12,envMapIntensity:1.75});
 const filmBlue=new THREE.MeshPhysicalMaterial({color:0xcce2ea,metalness:0,roughness:.22,transparent:true,opacity:.48,depthWrite:false,side:THREE.DoubleSide,clearcoat:.2});
 const filmPeach=new THREE.MeshPhysicalMaterial({color:0xffe0d2,metalness:0,roughness:.32,transparent:true,opacity:.44,depthWrite:false,side:THREE.DoubleSide,clearcoat:.12});

 // In each part the UV mesh has stable topology. Scroll changes transforms, not topology.
 function makeSheet(fn,nu=66,nv=88){
  const pos=[],uv=[],tri=[];
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
   const u=i/nu,v=j/nv,q=fn(u,v);
   pos.push(q[0],q[1],q[2]);uv.push(u,v);
  }
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
   const k=j*(nu+1)+i;
   tri.push(k,k+nu+1,k+1,k+1,k+nu+1,k+nu+2);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(tri);g.computeVertexNormals();return g;
 }
 const pA=(u,v)=>{
  const s=u-.5,t=v-.5;
  return [.46+s*(2.35+.25*Math.cos(v*3.3))+.31*t+.21*Math.sin(v*5.2),
          4.75*t+.11*Math.sin(u*Math.PI*1.6),
          -.40+.48*Math.cos(u*Math.PI*1.5)+.37*Math.sin(v*5.1)+.34*Math.pow(s,2)];
 };
 const pB=(u,v)=>{
  const s=u-.5,t=v-.5;
  return [-.10+s*(1.73+.14*Math.sin(v*5.1))+.22*t+.15*Math.sin(v*3.7),
          4.08*t+.15*Math.sin(u*4.7),
          .45+.37*Math.sin((u+.08)*Math.PI)+.20*Math.cos(v*4.5)+.18*s];
 };
 const pFilm=(u,v,offset)=>{
  const s=u-.5,t=v-.5;
  return [.04+s*(1.60+.12*Math.sin(v*3))-.15*t,
          3.96*t+.07*Math.cos(u*5.2),
          -.06+offset+.20*Math.sin(u*4.3+v*2.2)];
 };
 const A=new THREE.Mesh(makeSheet(pA),materialA);A.rotation.set(-.07,-.19,-.10);
 const B=new THREE.Mesh(makeSheet(pB),materialB);B.rotation.set(.03,-.08,.13);
 const C1=new THREE.Mesh(makeSheet((u,v)=>pFilm(u,v,-.14)),filmBlue);
 const C2=new THREE.Mesh(makeSheet((u,v)=>pFilm(u,v,-.34)),filmPeach);
 C1.renderOrder=2;C2.renderOrder=3;
 group.add(C1,C2,A,B);

 // A thin resolved edge catches a controlled highlight as the wing opens.
 function edgePath(fn,constant){
  const pts=[];for(let i=0;i<=65;i++)pts.push(new THREE.Vector3(...fn(constant,i/65)));
  return new THREE.CatmullRomCurve3(pts);
 }
 const edge=new THREE.Mesh(new THREE.TubeGeometry(edgePath(pB,.98),110,.013,5,false),materialTrim);
 B.add(edge); // follows the moving folio, not the camera

 // Soft contact below the sculpture, always translucent.
 const shadowCanvas=document.createElement("canvas");shadowCanvas.width=256;shadowCanvas.height=256;
 const c=shadowCanvas.getContext("2d");const grad=c.createRadialGradient(128,128,10,128,128,125);
 grad.addColorStop(0,"rgba(50,55,60,.26)");grad.addColorStop(.42,"rgba(70,76,82,.11)");grad.addColorStop(1,"rgba(70,76,82,0)");
 c.fillStyle=grad;c.fillRect(0,0,256,256);
 const shadowTex=new THREE.CanvasTexture(shadowCanvas);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.8,2.4),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,opacity:.48,depthWrite:false}));
 shadow.position.set(.46,-2.12,-1.5);shadow.rotation.x=-.23;scene.add(shadow);

 let w=390,h=844,p=0,target=0,time=0,last=0,visible=true,raf=0,lost=false,prev=-1;
 const setMotion=()=>{motion.textContent=paused?"▷":"Ⅱ";motion.setAttribute("aria-label",paused?"Resume ambient motion":"Pause ambient motion");motion.setAttribute("aria-pressed",String(paused));};
 setMotion();
 motion.addEventListener("click",()=>{paused=!paused;setMotion();start();});
 function resize(){
  const r=stage.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);
  const dpr=Math.min(devicePixelRatio||1,w<750?1.5:1.8);
  renderer.setPixelRatio(dpr);renderer.setSize(w,h,false);
  camera.aspect=w/h;camera.fov=w<700?35:32;camera.updateProjectionMatrix();
  group.scale.setScalar(w<700?.93:1.05);
  group.position.x=w<700?.37:.6;start();
 }
 function onScroll(){
  const denom=Math.max(1,sequence.offsetHeight-innerHeight);
  target=clamp(-sequence.getBoundingClientRect().top/denom);
  if(new URLSearchParams(location.search).has("frame")){
   target=clamp(parseFloat(new URLSearchParams(location.search).get("frame"))||0);
  }
  start();
 }
 function compose(){
  const opening=smooth(.14,.87,p);
  const dolly=smooth(.16,1,p);
  const fold=smooth(.12,.77,p);
  B.position.set(-.70*fold,.03*fold,.42*fold);
  B.rotation.y=-.08-.94*fold;
  B.rotation.z=.13-.13*fold;
  B.rotation.x=.03+.11*fold;
  A.rotation.y=-.19+.12*fold;
  A.rotation.z=-.10+.06*fold;
  C1.position.set(-.25*fold,.10*fold,.36*fold);
  C2.position.set(-.57*fold,-.10*fold,.09*fold);
  C1.rotation.y=-.25*fold;C2.rotation.y=.16*fold;
  const portrait=w/h<.78;
  camera.position.set((portrait?.02:-.25)-.45*dolly,.02+.22*dolly,9.25-6.85*dolly);
  camera.lookAt((portrait?.29:.33)-.45*dolly,-.12,.05-.52*dolly);
  const breathe=paused||reduced.matches?0:Math.sin(time*.50)*.018;
  group.rotation.set(.025+breathe*.3,.02+breathe,-.025);
  scene.environmentRotation.y=.08+.24*opening;
  const fadeOut=smooth(.25,.50,p);
  const fadeIn=smooth(.62,.85,p);
  first.style.opacity=String(1-fadeOut);
  first.style.visibility=fadeOut>.995?"hidden":"visible";
  second.style.opacity=String(fadeIn);
  second.style.visibility=fadeIn<.001?"hidden":"visible";
  second.setAttribute("aria-hidden",String(fadeIn<.98));
  $("#scroll-prompt").style.opacity=String(1-smooth(.60,.93,p));
  $("#page-index").textContent=String(Math.round(p*30)).padStart(2,"0");
  $("#progress-bar").style.width=(100*p).toFixed(2)+"%";
  shadow.material.opacity=.48-.27*opening;
 }
 function render(t){
  raf=0;if(lost)return;
  const dt=Math.min((t-(last||t))/1000,.04);last=t;
  if(!paused&&!reduced.matches)time+=dt;
  // Frame-rate independent smoothing for touch scrolling; reduced motion snaps.
  const lerp=reduced.matches?1:1-Math.exp(-dt*12);
  p+=(target-p)*lerp;
  if(Math.abs(p-target)<.0003)p=target;
  compose();renderer.render(scene,camera);
  if(visible&&!document.hidden&&(Math.abs(target-p)>.0004||(!paused&&!reduced.matches)))start();
 }
 function start(){if(!raf&&visible&&!document.hidden&&!lost)raf=requestAnimationFrame(render);}
 window.addEventListener("scroll",onScroll,{passive:true});
 window.addEventListener("resize",resize,{passive:true});
 new ResizeObserver(resize).observe(stage);
 new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)start();else if(raf){cancelAnimationFrame(raf);raf=0;}},{rootMargin:"100px"}).observe(stage);
 document.addEventListener("visibilitychange",start);
 reduced.addEventListener("change",()=>{paused=reduced.matches;setMotion();start();});
 canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();lost=true;document.documentElement.classList.remove("webgl-ready");if(raf)cancelAnimationFrame(raf);raf=0;});
 canvas.addEventListener("webglcontextrestored",()=>{location.reload();});
 resize();onScroll();
 document.documentElement.classList.add("webgl-ready");
 window.__MEMORY_ALLOY__={get progress(){return p;},get renderer(){return renderer.info.render;}};
} catch(err) {
 console.error("Memory Alloy artwork unavailable; preserving accessible static fallback.",err);
 document.documentElement.classList.remove("webgl-ready");
}
