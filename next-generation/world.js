import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Water } from 'three/addons/objects/Water.js';
import { makeVehicle } from '/world/src/vehicle.js';

// A new, imaginary coastal gallery. All dimensions are in metres.
// The licensed 911 and the established wordmark remain their original assets.
export async function mountWorld() {
  const stage = document.querySelector('#world-stage');
  const canvas = document.querySelector('#world-canvas');
  const status = document.querySelector('#world-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px)');
  const shotButtons = [...document.querySelectorAll('[data-world-shot]')];
  const tourButton = document.querySelector('#world-tour');
  const diagnostics = { frames: 0, contextLosses: 0, errors: [], vehicle: 'loading', quality: compact.matches ? 'mobile' : 'desktop', reducedMotion: reduced.matches };
  let renderer, controls, raf = 0, dead = false, lost = false, playing = false, transition = null, tourIntro = null, elapsed = 0, tourTime = 0, activeShot = 0, lastFrame = 0, inView = true, slowTime = 0;
  const disposables = new Set();
  const cleanups = [];
  const listen = (target, type, fn, options) => { target.addEventListener(type, fn, options); cleanups.push(() => target.removeEventListener(type, fn, options)); };
  const fail = (error) => {
    diagnostics.errors.push(String(error));
    stage.dataset.state = 'fallback';canvas.tabIndex=-1;
    status.textContent = '이 기기에서는 사진으로 공간을 감상할 수 있습니다.';
    playing = false; syncTour();
    document.querySelector('#world-fallback-note').hidden = false;
    if (raf) cancelAnimationFrame(raf); raf = 0;
  };
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
  } catch (error) { fail(error); return; }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact.matches ? 1.35 : 1.8));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(43, 1, .12, 600);
  scene.fog = new THREE.Fog(0xc0d6d5, 95, 300);
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !reduced.matches;
  controls.dampingFactor = .075;
  controls.minDistance = 3.8;
  controls.maxDistance = 35;
  controls.minPolarAngle = .19;
  controls.maxPolarAngle = Math.PI * .477;
  controls.enablePan = true;
  controls.panSpeed = .55;
  controls.rotateSpeed = .48;
  controls.zoomSpeed = .6;
  controls.screenSpacePanning = false;
  controls.target.set(0, 1, 1);
  // OrbitControls maps one-finger drag to orbit and two fingers to dolly/pan.
  canvas.tabIndex = 0;
  const stoneTexture = makeStoneTexture();
  const limestone = new THREE.MeshStandardMaterial({ color: 0xe4dfce, map: stoneTexture, roughness: .89 });
  const archReveal = new THREE.MeshStandardMaterial({ color: 0xa8b4ae, roughness: .91 });
  const pale = new THREE.MeshStandardMaterial({ color: 0xeae5d6, roughness: .77 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xd4d1c3, map: stoneTexture, roughness: .95 });
  const seams = new THREE.MeshStandardMaterial({ color: 0xa8aaa0, roughness: .95 });
  const earth = new THREE.MeshStandardMaterial({ color: 0xbe654b, map: stoneTexture, roughness: .92 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x354139, roughness: .56, metalness: .3 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x9b714b, roughness: .82 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x646b63, roughness: .52, metalness: .8 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x31494d, roughness: .16, metalness: .35, clearcoat: .85 });
  const staticMeshes = [];
  function mesh(geometry, material, x, y, z, cast = true) {
    const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; staticMeshes.push(m); return m;
  }
  const box = (w,h,d,mat,x,y,z,cast=true) => mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,cast);
  const cylinder = (r,h,mat,x,y,z,n=32,cast=true) => mesh(new THREE.CylinderGeometry(r,r,h,n),mat,x,y,z,cast);
  function bar(a,b,r,mat) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), mid = A.clone().add(B).multiplyScalar(.5);
    const m = cylinder(r,A.distanceTo(B),mat,...mid.toArray(),8); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize()); return m;
  }
  const skyMaterial = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { zenith: { value: new THREE.Color('#3684b6') }, horizon: { value: new THREE.Color('#c1dee1') } }, vertexShader: 'varying vec3 vWorld; void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}', fragmentShader: 'varying vec3 vWorld;uniform vec3 zenith;uniform vec3 horizon;void main(){vec3 d=normalize(vWorld);float h=pow(max(d.y,0.),.45);vec3 c=mix(horizon,zenith,h);float cloud=sin(d.x*18.+d.z*5.)*.5+.5;float veil=pow(max(0.,1.-abs(d.y-.24)*6.),4.)*.035*cloud;c+=veil;gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}' });
  // Keep shader includes on separate lines for browser GLSL preprocessors.
  skyMaterial.fragmentShader = skyMaterial.fragmentShader.replace(';#include',';\n#include');
  const sky = new THREE.Mesh(new THREE.SphereGeometry(450,32,16),skyMaterial); scene.add(sky);
  scene.add(new THREE.HemisphereLight(0xdbe8f0,0x6c6952,.75));
  const sun = new THREE.DirectionalLight(0xffe7c2,4.1); sun.position.set(-22,34,17); sun.target.position.set(0,0,-10); sun.castShadow=true;
  sun.shadow.mapSize.set(compact.matches?1024:2048,compact.matches?1024:2048);
  Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:100}); sun.shadow.bias=-.00015; sun.shadow.normalBias=.035; scene.add(sun,sun.target);
  const fill = new THREE.DirectionalLight(0x9bbecf,.48); fill.position.set(15,8,-20); scene.add(fill);
  // A deliberately composed environment supplies broad sky and architectural reflections.
  const environmentScene = new THREE.Scene(); environmentScene.add(sky.clone());
  for (const [p, s, color] of [[[12,6,-7],[.4,12,30],0xe5e0d0],[[-20,12,8],[18,6,7],0xfff5dc],[[0,20,0],[35,.5,35],0xe8f2f5],[[5,4,-8],[8,6,.4],0x24363d]]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(...s),new THREE.MeshBasicMaterial({color})); panel.position.set(...p); environmentScene.add(panel);
  }
  const pmrem = new THREE.PMREMGenerator(renderer); let environment = pmrem.fromScene(environmentScene,.08,.1,500); scene.environment=environment.texture; scene.environmentIntensity=1; disposables.add(environment); pmrem.dispose();
  // Retain the tiny procedural environment source for exact context-loss recovery.
  // Main quay: broad, pale stone, rather than an unbounded featureless plane.
  box(40,.72,75,concrete,10,-.37,-18);
  box(44,.85,14,limestone,-8,-.44,-44);
  box(.45,.87,75,limestone,-10.1,-.24,-18);
  box(.56,.08,75,pale,-9.99,.055,-18);
  for(let z=10;z>-54;z-=4.6) box(39,.008,.016,seams,10,.008,z,false);
  for(let x=-5;x<30;x+=5.2) box(.016,.008,75,seams,x,.009,-18,false);
  // Flush drainage and slender edge details anchor the metre-scale scene.
  for(let z=8;z>-42;z-=7.4) {
    box(.16,.016,1.2,steel,-8.9,.017,z,false);
    for(let q=-.45;q<=.45;q+=.15) box(.18,.018,.018,dark,-8.9,.027,z+q,false);
  }
  for(let z=5;z>-45;z-=10) { cylinder(.105,.42,dark,-9.4,.22,z,20); cylinder(.18,.12,steel,-9.4,.47,z,24); }
  // Arcaded gallery. Open arches are genuine extruded shapes, not painted textures.
  // Their 1.1m deep reveals and repeated piers create clear spatial parallax.
  const archShape = new THREE.Shape(); const archWidth=5.85, archHeight=8.1, radius=2.4, spring=3.6;
  archShape.moveTo(-archWidth/2,0);archShape.lineTo(-archWidth/2,archHeight);archShape.lineTo(archWidth/2,archHeight);archShape.lineTo(archWidth/2,0);archShape.lineTo(radius,0);archShape.lineTo(radius,spring);
  archShape.absarc(0,spring,radius,0,Math.PI,false);archShape.lineTo(-radius,0);archShape.closePath();
  const archGeometry=new THREE.ExtrudeGeometry(archShape,{depth:1.05,bevelEnabled:true,bevelThickness:.07,bevelSize:.055,bevelSegments:3,curveSegments:36,steps:1});
  for(let z=-7;z>=-43;z-=6) {
    for(const group of archGeometry.groups){const part=new THREE.BufferGeometry();for(const [name,attribute]of Object.entries(archGeometry.attributes)){part.setAttribute(name,new THREE.BufferAttribute(attribute.array.slice(group.start*attribute.itemSize,(group.start+group.count)*attribute.itemSize),attribute.itemSize,attribute.normalized));}const arch=mesh(part,group.materialIndex===1?archReveal:limestone,11.4,0,z);arch.rotation.y=Math.PI/2;}
    box(7.4,.15,.08,seams,11.4,7.65,z+.55,false);
  }
  box(8.4,.52,44,pale,11.2,8.37,-25);
  box(8.6,.12,44.2,limestone,11.2,8.68,-25);
  box(.35,8.1,18,limestone,15.15,4.05,-37.5);
  box(6.8,.045,42,concrete,11.3,.035,-25);
  // Narrow clerestory, louvers and deep-set dark doorway give the architecture a lived scale.
  box(.05,2.8,6,glass,14.95,2.05,-14);
  for(let z=-11;z>-17;z-=.45) box(.11,3.3,.065,wood,14.86,2.25,z);
  // A curved terracotta pavilion at the far end of the harbour.
  const pavilion=new THREE.Group();
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(6.1,6.1,5.8,80,1,true,Math.PI*.1,Math.PI*1.8),earth);wall.position.set(-11.3,2.9,-41.3);wall.castShadow=true;wall.receiveShadow=true;pavilion.add(wall);
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(6.36,6.36,.25,80),earth);lid.position.set(-11.3,5.93,-41.3);lid.castShadow=true;pavilion.add(lid);scene.add(pavilion);
  box(6.3,2.7,.11,glass,-11.1,1.7,-35.5);box(6.7,.22,1.7,earth,-11.1,3.3,-35.3);
  for(let x=-14.5;x<=-7.7;x+=.42)box(.045,2.9,.15,wood,x,1.7,-35.4);
  // A clean cantilevered overlook on the opposite shore.
  box(9.5,.5,6,limestone,-23,.62,-45);box(6.7,.1,3.5,pale,-23,1,-45);
  for(const x of[-26,-20])box(.35,2,4,concrete,x,-.4,-45);
  // Bench / small human traces: authored procedural objects, no texture billboards.
  for(let k=0;k<5;k++)box(3,.08,.11,wood,4.8,.55,-4.8+k*.14);
  for(const x of[3.7,5.9]){box(.085,.48,.66,steel,x,.25,-4.5);box(.08,.82,.07,steel,x,.49,-4.13);}
  for(let k=0;k<3;k++)box(3,.13,.05,wood,4.8,.74+k*.15,-4.11);
  // Sculptural coastal pines: deliberate flat canopies, softly irregular and instanced.
  const leaf=new THREE.MeshStandardMaterial({color:0x71806a,roughness:1});
  let seed=321;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const crowns=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,2),leaf,30);const dummy=new THREE.Object3D();let canopyIndex=0;
  for(const [x,z,h]of[[18,-11,8.5],[21,-27,11],[-5,-38,7.5]]) {
    cylinder(.16,h,wood,x,h/2,z,14);bar([x,h*.65,z],[x-1.2,h*.86,z-.5],.095,wood);bar([x,h*.74,z],[x+1.5,h*.95,z+.1],.09,wood);
    for(let i=0;i<10;i++){dummy.position.set(x+(random()-.5)*5,h+(random()-.5)*1.7,z+(random()-.5)*4);dummy.scale.set(1.4+random()*1.1,.42+random()*.35,1.1+random());dummy.rotation.set(random(),random(),random());dummy.updateMatrix();crowns.setMatrixAt(canopyIndex++,dummy.matrix);}
  }
  crowns.castShadow=true;crowns.receiveShadow=true;scene.add(crowns);
  // Far city is restrained and rhythmic; its changing scale gives the sea a real horizon.
  const skyline=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0xadbcb9,roughness:.9}),65);
  for(let i=0;i<65;i++){const h=3+random()*16;dummy.position.set(-145+i*4.7,h/2-.4,-172-random()*36);dummy.scale.set(2+random()*4,h,3+random()*6);dummy.rotation.set(0,0,0);dummy.updateMatrix();skyline.setMatrixAt(i,dummy.matrix);}scene.add(skyline);
  // Suspension bridge, reduced to slender limestone pylons and steel cables.
  box(190,.55,3.6,pale,-30,10.6,-130,false);
  for(const x of[-75,8]) {
    for(const dx of[-1.25,1.25])box(.52,29,.68,pale,x+dx,14.5,-130,false);
    bar([x-1.4,25,-130],[x+1.4,25,-130],.16,pale);
    for(let i=1;i<=10;i++)for(const side of[-1,1])bar([x,27,-130],[x+side*i*4.4,10.95,-130],.03,steel);
  }
  // Merge all immobile construction by material and shadow state: fewer draw calls.
  const batches=new Map();for(const m of staticMeshes){m.updateMatrix();const key=m.material.uuid+String(m.castShadow);if(!batches.has(key))batches.set(key,{material:m.material,cast:m.castShadow,geometries:[]});batches.get(key).geometries.push((m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrix));m.geometry.dispose();}
  for(const batch of batches.values()){const geometry=mergeGeometries(batch.geometries);if(geometry){const merged=new THREE.Mesh(geometry,batch.material);merged.castShadow=batch.cast;merged.receiveShadow=true;scene.add(merged);}for(const g of batch.geometries)g.dispose();}archGeometry.dispose();
  const waterNormal=makeWaterNormal();
  const sea=new Water(new THREE.PlaneGeometry(420,320),{textureWidth:compact.matches?128:256,textureHeight:compact.matches?128:256,waterNormals:waterNormal,sunDirection:sun.position.clone().normalize(),sunColor:0xffefd9,waterColor:0x14667d,distortionScale:1.25,alpha:1,fog:true});
  sea.rotation.x=-Math.PI/2;sea.position.set(-150,-.59,-131);sea.material.uniforms.size.value=5.5;sea.material.fragmentShader=sea.material.fragmentShader.replace('float rf0 = 0.3;', 'float rf0 = 0.12;').replace('float theta =', 'reflectionSample = mix(reflectionSample, waterColor * 1.7, 0.34);\n float theta =');scene.add(sea);
  // Capture Water's privately allocated reflection target once for complete disposal.
  const waterRender=sea.onBeforeRender;let capturedWaterTarget=false;sea.onBeforeRender=function(r,...args){if(capturedWaterTarget)return waterRender.call(this,r,...args);const setTarget=r.setRenderTarget;r.setRenderTarget=function(target,...rest){if(target&&!capturedWaterTarget){disposables.add(target);capturedWaterTarget=true;}return setTarget.call(this,target,...rest);};try{return waterRender.call(this,r,...args);}finally{r.setRenderTarget=setTarget;}};
  const foam=new THREE.Mesh(new THREE.PlaneGeometry(.12,75),new THREE.MeshBasicMaterial({color:0xc2d8d1,transparent:true,opacity:.35}));foam.rotation.x=-Math.PI/2;foam.position.set(-10.34,-.565,-18);scene.add(foam);
  status.textContent='차체의 곡면과 반사를 준비하고 있습니다.';
  let vehicle;
  try {
    const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const model=await Promise.race([loader.loadAsync('/world/assets/car-911-carrera-4s-lod1.glb'),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Vehicle load timeout')),14000))]);
    vehicle=model.scene;const bounds=new THREE.Box3().setFromObject(vehicle);const size=bounds.getSize(new THREE.Vector3());vehicle.scale.setScalar(4.65/size.z);const scaled=new THREE.Box3().setFromObject(vehicle),center=scaled.getCenter(new THREE.Vector3());vehicle.position.set(-center.x,-scaled.min.y,-center.z);
    vehicle.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;for(const mat of(Array.isArray(m.material)?m.material:[m.material])){
      mat.envMapIntensity=1.05;
      if(mat.name==='paint'){const paint=new THREE.MeshPhysicalMaterial({color:0xa9b7b9,metalness:.86,roughness:.23,clearcoat:1,clearcoatRoughness:.16,envMapIntensity:1.22,side:mat.side});if(Array.isArray(m.material)){m.material=m.material.map(a=>a===mat?paint:a);}else m.material=paint;mat.dispose();}
      if(mat.name==='window'){mat.color.setHex(0x101d25);mat.roughness=.11;mat.metalness=.65;}
      if(mat.name==='lights'){mat.emissiveIntensity=.06;mat.roughness=.18;}
    }});
    diagnostics.vehicle='Porsche 911 Carrera 4S / Lionsharp Studios / CC BY-SA 4.0';
  }catch(error){vehicle=makeVehicle();vehicle.rotation.y=Math.PI;diagnostics.vehicle='Procedural fallback coupe';diagnostics.errors.push(String(error));document.querySelector('#world-model-note').hidden=false;}
  const car=new THREE.Group();car.add(vehicle);car.position.set(.2,.014,1.7);car.rotation.y=-.28;scene.add(car);
  // Tight underbody occlusion is separate from the directional shadow.
  const contactTexture=makeContactTexture();const contact=new THREE.Mesh(new THREE.PlaneGeometry(3.05,5.5),new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false,opacity:.84}));contact.rotation.x=-Math.PI/2;contact.rotation.z=.28;contact.position.set(.2,.013,1.7);scene.add(contact);
  for(const x of[-.82,.82])for(const z of[-1.37,1.37]){const patch=new THREE.Mesh(new THREE.PlaneGeometry(.62,.85),new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false,opacity:.8}));patch.rotation.x=-Math.PI/2;const point=new THREE.Vector3(x,.019,z).applyAxisAngle(new THREE.Vector3(0,1,0),-.28);patch.position.copy(point).add(car.position);scene.add(patch);}
  const desktopShots=[{position:[-6.3,2.25,9.1],target:[1.1,1.45,-1.5],title:'The arrival',number:'01'},{position:[-6.9,1.85,-6.7],target:[1,.95,1.4],title:'At the waterline',number:'02'},{position:[14,6.6,15.5],target:[2.3,2.25,-7.2],title:'A place to stay',number:'03'}];
  const mobileShots=[{position:[-6.2,2.9,10.4],target:[.3,1.55,.1],title:'The arrival',number:'01'},{position:[-6.6,2,-6.7],target:[.2,1.7,1.2],title:'At the waterline',number:'02'},{position:[13.8,7.5,17],target:[4.3,3,-10],title:'A place to stay',number:'03'}];
  const shots=()=>compact.matches?mobileShots:desktopShots;
  function selectShot(index,animate=true) {
    activeShot=index;playing=false;syncTour();tourTime=index/3*48;
    const shot=shots()[index];const p=new THREE.Vector3(...shot.position),t=new THREE.Vector3(...shot.target);if(compact.matches&&stage.clientHeight<650&&index===0)t.y=1.15;if(stage.clientHeight<400&&index===0)t.y=.55;
    transition=animate&&!reduced.matches?{from:camera.position.clone(),look:controls.target.clone(),to:p,target:t,time:0}:null;
    if(!transition){camera.position.copy(p);controls.target.copy(t);controls.update();}
    shotButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    document.querySelector('#world-shot-name').textContent=shot.title;document.querySelector('#world-shot-number').textContent=shot.number;
    requestRender();
  }
  function syncTour(){tourButton.setAttribute('aria-pressed',String(playing));tourButton.querySelector('span').textContent=playing?'Pause tour':'Take a slow tour';tourButton.dataset.playing=String(playing);}
  const route=new THREE.CatmullRomCurve3([new THREE.Vector3(-6.3,2.25,9.1),new THREE.Vector3(-8,2.2,3),new THREE.Vector3(-6.9,1.85,-6.7),new THREE.Vector3(3,3.8,-9),new THREE.Vector3(14,6.6,15.5),new THREE.Vector3(2.5,4.5,17)],true,'catmullrom',.18);
  const looks=new THREE.CatmullRomCurve3([new THREE.Vector3(1.1,1.45,-1.5),new THREE.Vector3(.2,1.2,1.7),new THREE.Vector3(1,.95,1.4),new THREE.Vector3(1.5,1.4,1.5),new THREE.Vector3(2.3,2.25,-7.2),new THREE.Vector3(.5,1.5,-2)],true,'catmullrom',.18);
  function requestRender(){if(!raf&&!dead&&!lost&&!document.hidden&&inView)raf=requestAnimationFrame(frame);}
  function frame(now){raf=0;if(dead||lost||document.hidden||!inView)return;if(!reduced.matches&&lastFrame&&now-lastFrame<1000/30){requestRender();return;}const rawDt=lastFrame?(now-lastFrame)/1000:1/30;lastFrame=now;const dt=Math.min(rawDt,.075);elapsed+=dt;
    if(transition){transition.time+=dt;const a=Math.min(1,transition.time/2.2),e=a*a*(3-2*a);camera.position.lerpVectors(transition.from,transition.to,e);controls.target.lerpVectors(transition.look,transition.target,e);if(a===1)transition=null;}
    if(playing){tourTime+=dt;const t=(tourTime%48)/48;const p=route.getPointAt(t),l=looks.getPointAt(t);if(tourIntro){tourIntro.time+=dt;const a=Math.min(1,tourIntro.time/2),e=a*a*(3-2*a);camera.position.lerpVectors(tourIntro.from,p,e);controls.target.lerpVectors(tourIntro.look,l,e);if(a===1)tourIntro=null;}else{camera.position.copy(p);controls.target.copy(l);}}
    controls.update();
    if(!reduced.matches)sea.material.uniforms.time.value=elapsed*.28;
    renderer.render(scene,camera);diagnostics.frames++;diagnostics.drawCalls=renderer.info.render.calls;diagnostics.triangles=renderer.info.render.triangles;
    // Reduce only the buffer when sustained rendering exceeds the budget.
    if(rawDt>.075&&!transition){slowTime+=rawDt;if(slowTime>5&&renderer.getPixelRatio()>1){renderer.setPixelRatio(Math.max(1,renderer.getPixelRatio()-.2));resize();slowTime=0;}}else slowTime=Math.max(0,slowTime-dt);
    if(!reduced.matches||playing||transition)requestRender();
  }
  function resize(){const width=stage.clientWidth,height=stage.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=compact.matches?(stage.clientHeight<650?55:51):43;camera.updateProjectionMatrix();requestRender();}
  listen(controls,'start',()=>{playing=false;transition=null;syncTour();});listen(controls,'change',()=>requestRender());
  shotButtons.forEach(button=>listen(button,'click',()=>selectShot(Number(button.dataset.worldShot))));
  listen(tourButton,'click',()=>{if(reduced.matches){selectShot((activeShot+1)%3,false);return;}transition=null;playing=!playing;tourIntro=playing?{from:camera.position.clone(),look:controls.target.clone(),time:0}:null;syncTour();requestRender();});
  listen(document.querySelector('#world-reset'),'click',()=>selectShot(0));
  listen(canvas,'keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home',' '].includes(event.key))return;event.preventDefault();playing=false;transition=null;syncTour();
    if(event.key==='Home'){selectShot(0);return;}if(event.key===' '){tourButton.click();return;}
    const offset=camera.position.clone().sub(controls.target),sphere=new THREE.Spherical().setFromVector3(offset);
    if(event.key==='ArrowLeft')sphere.theta-=.08;if(event.key==='ArrowRight')sphere.theta+=.08;if(event.key==='ArrowUp')sphere.phi-=.06;if(event.key==='ArrowDown')sphere.phi+=.06;if(event.key==='+'||event.key==='=')sphere.radius*=.91;if(event.key==='-')sphere.radius*=1.09;
    sphere.phi=THREE.MathUtils.clamp(sphere.phi,controls.minPolarAngle,controls.maxPolarAngle);sphere.radius=THREE.MathUtils.clamp(sphere.radius,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sphere));controls.update();requestRender();
  });
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView){lastFrame=0;requestRender();}else{if(raf)cancelAnimationFrame(raf);raf=0;}},{threshold:0});observer.observe(stage);cleanups.push(()=>observer.disconnect());
  listen(window,'resize',resize);if(window.visualViewport)listen(window.visualViewport,'resize',resize);
  listen(document,'visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;lastFrame=0;}else requestRender();});
  listen(reduced,'change',()=>{playing=false;transition=null;controls.enableDamping=!reduced.matches;diagnostics.reducedMotion=reduced.matches;syncTour();requestRender();});
  listen(canvas,'webglcontextlost',event=>{event.preventDefault();lost=true;diagnostics.contextLosses++;if(environment){disposables.delete(environment);environment.dispose();environment=null;scene.environment=null;}fail('WebGL context lost');});
  listen(canvas,'webglcontextrestored',()=>{try{lost=false;lastFrame=0;const recoveryPMREM=new THREE.PMREMGenerator(renderer);environment=recoveryPMREM.fromScene(environmentScene,.08,.1,500);recoveryPMREM.dispose();disposables.add(environment);scene.environment=environment.texture;renderer.shadowMap.needsUpdate=true;stage.dataset.state='ready';canvas.tabIndex=0;status.textContent='그래픽 연결이 복구되었습니다.';document.querySelector('#world-fallback-note').hidden=true;requestRender();}catch(error){fail(error);}});
  function dispose(){dead=true;if(raf)cancelAnimationFrame(raf);cleanups.forEach(fn=>fn());controls.dispose();const geometries=new Set(),materials=new Set(),textures=new Set();const collect=o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const mat of(Array.isArray(o.material)?o.material:[o.material]))materials.add(mat);};scene.traverse(collect);environmentScene.traverse(collect);for(const mat of materials){for(const value of Object.values(mat))if(value?.isTexture)textures.add(value);if(mat.uniforms)for(const u of Object.values(mat.uniforms))if(u.value?.isTexture)textures.add(u.value);mat.dispose();}geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());disposables.forEach(d=>d.dispose());sun.shadow.dispose();renderer.dispose();}
  listen(window,'pagehide',event=>{if(!event.persisted)dispose();});
  window.__TOHESAR_WORLD={scene,camera,renderer,controls,diagnostics,selectShot,dispose,get playing(){return playing;}};
  resize();selectShot(0,false);renderer.compile(scene,camera);renderer.render(scene,camera);stage.dataset.state='ready';status.textContent='공간이 열렸습니다. 드래그해서 시점을 바꿔 보세요.';requestRender();
}

function makeStoneTexture(){const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d');const pixels=ctx.createImageData(256,256);let seed=71;for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=242+Math.floor(seed/4294967296*12);pixels.data[i]=v;pixels.data[i+1]=v;pixels.data[i+2]=v;pixels.data[i+3]=255;}ctx.putImageData(pixels,0,0);const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,2);texture.colorSpace=THREE.SRGBColorSpace;return texture;}
function makeContactTexture(){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,5,64,64,64);gradient.addColorStop(0,'rgba(20,27,20,.78)');gradient.addColorStop(.43,'rgba(20,27,20,.64)');gradient.addColorStop(.75,'rgba(20,27,20,.2)');gradient.addColorStop(1,'rgba(20,27,20,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(canvas);}
function makeWaterNormal(){const n=128,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4,dx=Math.cos(x/n*Math.PI*8+y/n*Math.PI*4)*.11+Math.cos(x/n*Math.PI*22-y/n*Math.PI*12)*.045,dy=Math.cos(y/n*Math.PI*10+x/n*Math.PI*6)*.09+Math.cos(y/n*Math.PI*24)*.035;const v=new THREE.Vector3(dx,dy,1).normalize();data[i]=(v.x*.5+.5)*255;data[i+1]=(v.y*.5+.5)*255;data[i+2]=(v.z*.5+.5)*255;data[i+3]=255;}const texture=new THREE.DataTexture(data,n,n);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;return texture;}
