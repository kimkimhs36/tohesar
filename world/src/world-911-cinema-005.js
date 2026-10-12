import * as T from 'three';
import {makeSky,makeGround,makeWater,makeComposite} from './materials-cinema-005.js';
import {makeVehicle} from './vehicle.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export async function createWorld(canvas,onProgress){
 const renderer=new T.WebGLRenderer({canvas,antialias:false,alpha:false,powerPreference:'high-performance'});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.01;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene();scene.fog=new T.FogExp2(0x958781,.0052);
 const camera=new T.PerspectiveCamera(43,1,.1,450);
 const sky=makeSky();scene.add(sky);
 onProgress('하늘의 빛을 담는 중');
 const pmrem=new T.PMREMGenerator(renderer);const envScene=new T.Scene();envScene.add(makeSky());const environment=pmrem.fromScene(envScene,.03,.1,500);scene.environment=environment.texture;pmrem.dispose();envScene.children[0].geometry.dispose();envScene.children[0].material.dispose();
 const ambientSky=new T.HemisphereLight(0xb8d0ed,0x54443a,.91);scene.add(ambientSky);
 // Cold late-evening sky reflection, no extra realtime shadowmap.
 const blueHourFill=new T.DirectionalLight(0x96b4d9,.29);blueHourFill.position.set(-11,8,16);scene.add(blueHourFill);
 const compact=typeof window!=='undefined'&&window.matchMedia('(max-width:700px)').matches;
 const sunlight=new T.DirectionalLight(0xffbd80,2.9);sunlight.position.set(12,9,-43);sunlight.target.position.set(0,0,-1);sunlight.castShadow=true;sunlight.shadow.mapSize.set(compact?1024:2048,compact?1024:2048);Object.assign(sunlight.shadow.camera,{left:-13,right:13,top:15,bottom:-13,near:.5,far:95});sunlight.shadow.bias=-.0002;sunlight.shadow.normalBias=.025;sunlight.shadow.radius=3;scene.add(sunlight,sunlight.target);
 const ground=makeGround();scene.add(ground);
 // Shadow overlay preserves rough planar reflection below it.
 const shadow=new T.Mesh(new T.PlaneGeometry(45,50),new T.ShadowMaterial({opacity:.43}));shadow.rotation.x=-Math.PI/2;shadow.position.set(0,-.017,-6);shadow.receiveShadow=true;scene.add(shadow);
 const water=makeWater();water.rotation.x=-Math.PI/2;water.position.set(0,-.23,-149);scene.add(water);
 let vehicle;let vehicleSource='Porsche 911 Carrera 4S / Lionsharp Studios / CC BY-SA 4.0';
 try{onProgress('차체의 표면과 디테일을 불러오는 중');const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/world/assets/car-911-carrera-4s-lod1.glb');vehicle=gltf.scene;
 const bounds=new T.Box3().setFromObject(vehicle),size=bounds.getSize(new T.Vector3());vehicle.scale.setScalar(4.65/size.z);const scaled=new T.Box3().setFromObject(vehicle),centre=scaled.getCenter(new T.Vector3());vehicle.position.set(-centre.x,-scaled.min.y,-centre.z);
 const mount=new T.Group();mount.add(vehicle);vehicle=mount;vehicle.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;if(m.material){m.material.envMapIntensity=.9;
  // This LOD comes with named materials. Keep a muted silver body under sunset light.
  if(m.material.name==='paint'){m.material.color.setHex(0xb4bac0);m.material.metalness=.82;m.material.roughness=.215;m.material.envMapIntensity=1.30;}
  if(m.material.name==='window'||m.material.name==='glass'){m.material.color.setHex(0x253039);m.material.roughness=.115;m.material.envMapIntensity=1.12;}}}});
 }catch(error){vehicle=makeVehicle();vehicleSource='Procedural coupe fallback';console.warn('Detailed model unavailable; procedural fallback used.',String(error));}
 vehicle.position.add(new T.Vector3(.6,0,-.8));vehicle.rotation.y=-.16;scene.add(vehicle);
 const concrete=new T.MeshStandardMaterial({color:0x797776,roughness:.9});
 const darkConcrete=new T.MeshStandardMaterial({color:0x4a4c4c,roughness:.9});
 const steel=new T.MeshStandardMaterial({color:0x313a40,metalness:.65,roughness:.43});
 const brass=new T.MeshStandardMaterial({color:0x8a6950,metalness:.72,roughness:.46});
 const white=new T.MeshStandardMaterial({color:0xb5b1a4,roughness:.87});
 const warmLamp=new T.MeshStandardMaterial({color:0xffd5a7,emissive:0xffb86e,emissiveIntensity:1.52});
 function box(w,h,d,mat,x,y,z,cast=true){let m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;scene.add(m);return m;}
 function cylinder(r,h,mat,x,y,z,n=16){let m=new T.Mesh(new T.CylinderGeometry(r,r,h,n),mat);m.position.set(x,y,z);m.castShadow=true;scene.add(m);return m;}
 function bar(a,b,r,mat){const A=new T.Vector3(...a),B=new T.Vector3(...b);let m=cylinder(r,A.distanceTo(B),mat,...A.clone().add(B).multiplyScalar(.5).toArray(),8);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),B.sub(A).normalize());return m;}
 // Quay edge with irregularly weathered concrete blocks and mooring fittings.
 box(180,.5,1.1,concrete,0,-.03,-24.4);box(180,.09,.2,white,0,.235,-23.91);
 for(let x=-45;x<55;x+=4){cylinder(.12,.54,steel,x,.45,-23.7);bar([x,.68,-23.7],[x+4,.68,-23.7],.022,steel);bar([x,.39,-23.7],[x+4,.39,-23.7],.009,steel);}
 for(let x=-12;x<20;x+=8){const bollard=cylinder(.16,.42,steel,x,.21,-21.6);cylinder(.24,.12,steel,x,.46,-21.6);box(.55,.055,.5,darkConcrete,x,.03,-21.6);}
 // Low overpass off camera left, repeated columns produce credible depth/parallax.
 box(8,1.1,115,darkConcrete,-14,8.2,-40);box(8,.17,115,concrete,-14,8.84,-40);
 for(let z=7;z>-100;z-=13){box(1.15,7.6,1.4,concrete,-11,3.8,z);box(6.8,.58,1.1,concrete,-13,7.4,z);}
 for(let i=0;i<7;i++)box(.18,.62,112,darkConcrete,-17.2+i,7.55,-40);
 // Bridge is an evocation, never a claim of surveyed Yokohama geometry.
 box(260,.8,5,concrete,0,12,-102,false);box(260,.15,5.2,white,0,12.55,-102,false);
 for(const tx of [-35,43]){for(const dx of [-1.3,1.3])box(1.1,36,1.2,concrete,tx+dx,18,-103,false);bar([tx-1.7,29,-103],[tx+1.7,29,-103],.45,concrete);for(let k=1;k<=12;k++)for(const side of [-1,1])bar([tx,31,-103],[tx+side*k*3.5,12.6,-102],.042,steel);}
 // Skyline uses instancing: 130 buildings and warm windows, no per-building draw calls.
 let seed=1996;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const cityMat=new T.MeshStandardMaterial({color:0x59616c,roughness:.88});const buildings=new T.InstancedMesh(new T.BoxGeometry(1,1,1),cityMat,130);const windows=new T.InstancedMesh(new T.PlaneGeometry(1,1),warmLamp,330);let wi=0;const dummy=new T.Object3D();
 for(let i=0;i<130;i++){let x=-140+i*2.3,h=3+rand()*17,w=1.5+rand()*3.5,z=-151-rand()*40;dummy.position.set(x,h/2,z);dummy.scale.set(w,h,2.5+rand()*4);dummy.rotation.set(0,0,0);dummy.updateMatrix();buildings.setMatrixAt(i,dummy.matrix);for(let j=0;j<3&&wi<330;j++){if(rand()>.16){dummy.position.set(x+(rand()-.5)*w*.6,2+rand()*(h-2),z+3.4);dummy.scale.set(.18+rand()*.32,.3,.8);dummy.updateMatrix();windows.setMatrixAt(wi++,dummy.matrix);}}}windows.count=wi;scene.add(buildings,windows);
 // Harbour cranes, a ferry, gently legible everyday objects.
 for(let i=0;i<5;i++){let x=-75+i*25;bar([x,0,-135],[x,12,-135],.15,steel);bar([x,12,-135],[x+8,17,-135],.13,steel);bar([x+8,17,-135],[x+11,7,-135],.04,steel);}
 box(13,1.5,3.5,white,16,.7,-58,false);box(8,1.25,2.8,white,16,2.1,-58,false);box(6,.55,.03,steel,16,2.3,-56.58,false);
 // Human presence via a bench, a paper cup and a leaning bicycle.
 for(let i=0;i<4;i++)box(2.1,.07,.085,brass,3.8,.53,-11+i*.115);
 for(const x of [3.05,4.55]){box(.09,.51,.5,steel,x,.25,-10.82);bar([x,.48,-10.62],[x,.98,-10.48],.03,steel);}
 for(let i=0;i<3;i++)box(2.1,.11,.055,brass,3.8,.7+i*.14,-10.49);
 cylinder(.043,.12,white,3.12,.625,-10.87);cylinder(.048,.015,steel,3.12,.691,-10.87);
 const bicycle=new T.Group();const tyreMat=new T.MeshStandardMaterial({color:0x18191a,roughness:.85});
 for(const z of [-.52,.52]){const wheel=new T.Mesh(new T.TorusGeometry(.30,.023,8,40),tyreMat);wheel.rotation.y=Math.PI/2;wheel.position.set(0,.33,z);bicycle.add(wheel);const rim=new T.Mesh(new T.TorusGeometry(.274,.008,5,40),brass);rim.rotation.y=Math.PI/2;rim.position.copy(wheel.position);bicycle.add(rim);}
 // bicycle bars built separately then reparented without changing local coordinates
 const links=[[[0,.33,-.52],[0,.72,-.27]],[[0,.33,-.52],[0,.36,.05]],[[0,.36,.05],[0,.74,.30]],[[0,.74,.30],[0,.72,-.27]],[[0,.72,-.27],[0,.36,.05]],[[0,.74,.30],[0,.33,.52]],[[0,.74,.30],[0,.90,.34]]];for(const [a,b]of links)bicycle.add(bar(a,b,.017,brass));bicycle.position.set(4.9,0,-13.5);bicycle.rotation.z=.10;scene.add(bicycle);
 // Small harbor fittings: restrained foreground storytelling without extra realtime lights.
 // Materials are merged below to avoid adding draw calls per object on iPhone.
 const stripe=new T.MeshStandardMaterial({color:0x8e8574,roughness:.97,metalness:.02});
 const wornSteel=new T.MeshStandardMaterial({color:0x586061,roughness:.75,metalness:.35});
 const orangeGlass=new T.MeshBasicMaterial({color:0xb78a59});
 for(let z=2;z>-24;z-=4.5){
   // Drains along the waterfront: a repeated subtle industrial rhythm.
   box(.76,.016,.20,wornSteel,3.95,.017,z,false);
   for(const dx of [-.22,-.08,.08,.22])box(.023,.018,.17,darkConcrete,3.95+dx,.03,z,false);
 }
 for(let z=-3;z>-29;z-=7.8){
   // Low docking reflectors and their shadows across the road edge.
   box(.24,.18,.045,wornSteel,4.38,.17,z,false);
   box(.14,.06,.048,orangeGlass,4.38,.22,z+.024,false);
 }
 // Old quay joints are intermittent rather than a perfectly repeating grid.
 for(let z=-4;z>-22;z-=5.5)box(6,.013,.02,stripe,-4.3,.012,z,false);
 // Street lamps: small emissive surfaces, no expensive forest of point lights.
 for(let z=4;z>=-35;z-=13){cylinder(.04,4.7,steel,5.8,2.35,z);bar([5.8,4.7,z],[4.9,4.7,z],.032,steel);box(.5,.06,.22,warmLamp,4.9,4.68,z);}
 onProgress('요코하마의 기록을 공간에 놓는 중');
 const loader=new T.TextureLoader();const photo=await loader.loadAsync('/world/assets/yokohama-arrival.webp');photo.colorSpace=T.SRGBColorSpace;photo.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
 const poster=new T.Group();poster.position.set(-1.0,0,-15.0);poster.rotation.y=.07;
 const back=new T.Mesh(new T.BoxGeometry(2.32,3.22,.12),steel);back.position.y=2.05;back.castShadow=true;poster.add(back);
 const print=new T.Mesh(new T.PlaneGeometry(2.12,2.65),new T.MeshBasicMaterial({map:photo,toneMapped:false}));print.position.set(0,2.12,.065);poster.add(print);
 const labelCanvas=document.createElement('canvas');labelCanvas.width=1024;labelCanvas.height=128;const ctx=labelCanvas.getContext('2d');ctx.fillStyle='#d9d1c4';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#302c27';ctx.font='24px sans-serif';ctx.fillText('TOHEŞAR    /    YOKOHAMA',42,52);ctx.font='17px sans-serif';ctx.fillText('A PLACE. A MACHINE. A MEMORY.',42,93);const labelTexture=new T.CanvasTexture(labelCanvas);labelTexture.colorSpace=T.SRGBColorSpace;const label=new T.Mesh(new T.PlaneGeometry(2.12,.265),new T.MeshBasicMaterial({map:labelTexture}));label.position.set(0,.64,.066);poster.add(label);
 for(const x of [-.77,.77]){const leg=new T.Mesh(new T.BoxGeometry(.055,.53,.06),steel);leg.position.set(x,.26,0);poster.add(leg);}scene.add(poster);
 // Baked analytic contact shade, not ray tracing or ambient occlusion.
 const aoCanvas=document.createElement('canvas');aoCanvas.width=128;aoCanvas.height=128;const aoc=aoCanvas.getContext('2d');const g=aoc.createRadialGradient(64,64,9,64,64,64);g.addColorStop(0,'rgba(0,0,0,.68)');g.addColorStop(.6,'rgba(0,0,0,.32)');g.addColorStop(1,'rgba(0,0,0,0)');aoc.fillStyle=g;aoc.fillRect(0,0,128,128);const ao=new T.Mesh(new T.PlaneGeometry(3,5.4),new T.MeshBasicMaterial({map:new T.CanvasTexture(aoCanvas),transparent:true,depthWrite:false}));ao.rotation.x=-Math.PI/2;ao.rotation.z=.16;ao.position.set(.6,-.009,-.8);scene.add(ao);
 // Merge immobile harbour meshes by material/shadow state. The car and the
 // editorial object remain independent, preserving raycasting and fine shading.
 const batches=new Map();for(const m of [...scene.children]){if(!m.isMesh||m.isInstancedMesh||!m.material.isMeshStandardMaterial)continue;m.updateMatrix();const key=m.material.uuid+String(m.castShadow);if(!batches.has(key))batches.set(key,{mat:m.material,cast:m.castShadow,geos:[]});batches.get(key).geos.push(m.geometry.clone().applyMatrix4(m.matrix));scene.remove(m);m.geometry.dispose();}
 for(const batch of batches.values()){const geo=mergeGeometries(batch.geos);if(geo){const merged=new T.Mesh(geo,batch.mat);merged.castShadow=batch.cast;merged.receiveShadow=true;scene.add(merged);}for(const g of batch.geos)g.dispose();}
 const composite=makeComposite(renderer);
 const path=new T.CatmullRomCurve3([new T.Vector3(-4.75,1.57,10.3),new T.Vector3(-3.7,1.08,4.1),new T.Vector3(-3.4,.91,.8),new T.Vector3(-3.3,1.38,-3.7),new T.Vector3(-1.75,1.64,-7.3),new T.Vector3(-.35,1.66,-10.55)]);
 const targets=new T.CatmullRomCurve3([new T.Vector3(.5,1.07,.05),new T.Vector3(.6,.77,-1.4),new T.Vector3(.7,.82,-2.2),new T.Vector3(-.4,1.10,-11),new T.Vector3(-1,1.8,-15),new T.Vector3(-1,2.0,-15)]);
 let progress=0,pixelRatio=Math.min(devicePixelRatio,compact?1.55:2),width=1,height=1;
 const point=new T.Vector3(),look=new T.Vector3();
 const fogGolden=new T.Color(0x958781),fogBlue=new T.Color(0x33445d);
 const sunsetOrange=new T.Color(0xffbd80),eveningGold=new T.Color(0xffb28a);
 let lastDusk=-1;
 function lightAt(p){
  const a=Math.max(0,Math.min(1,(p-.11)/.84));
  const d=a*a*(3.-2.*a);
  if(Math.abs(d-lastDusk)<.0005)return;
  lastDusk=d;
  sky.material.uniforms.dusk.value=d;
  ground.material.uniforms.dusk.value=d;
  water.material.uniforms.dusk.value=d;
  sunlight.intensity=2.9-1.94*d;
  sunlight.color.copy(sunsetOrange).lerp(eveningGold,d);
  blueHourFill.intensity=.29+.63*d;
  ambientSky.intensity=.91+.08*d;
  warmLamp.emissiveIntensity=1.52+1.1*d;
  scene.fog.color.copy(fogGolden).lerp(fogBlue,d*.92);
  renderer.toneMappingExposure=1.01-.08*d;
 }
 function resize(){width=canvas.clientWidth;height=canvas.clientHeight;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setPixelRatio(pixelRatio);renderer.setSize(width,height,false);composite.resize(Math.round(width*pixelRatio),Math.round(height*pixelRatio));}
 function render(p,t,motion=1,pan={x:0,y:0}){progress=p;lightAt(p);path.getPoint(p,point);targets.getPoint(p,look);camera.position.copy(point);camera.position.x+=pan.x*.045;camera.position.y+=pan.y*.025;camera.lookAt(look);water.material.uniforms.time.value=t*motion;ground.material.uniforms.time.value=t*motion;composite.material.uniforms.exposureShift.value=1.015-Math.sin(p*Math.PI)*.048;composite.material.uniforms.chapter.value=p;composite.render(scene,camera,t,motion);}
 resize();render(0,0);
 const raycaster=new T.Raycaster();const ndc=new T.Vector2();
 return {renderer,scene,camera,ground,composite,vehicleSource,render,resize,get progress(){return progress;},get pixelRatio(){return pixelRatio;},setScale(r){pixelRatio=Math.min(devicePixelRatio,r);resize();},hitPoster(x,y){let rect=canvas.getBoundingClientRect();ndc.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);raycaster.setFromCamera(ndc,camera);return raycaster.intersectObject(poster,true).length>0;},dispose(){environment.dispose();composite.target.dispose();ground.dispose();const materials=new Set(),textures=new Set();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});for(const m of materials){for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();}for(const t of textures)t.dispose();renderer.dispose();}};
}
