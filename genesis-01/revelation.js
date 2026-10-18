import * as THREE from 'three';
const mix=THREE.MathUtils.lerp;
const smooth=(a,b,p)=>{const t=THREE.MathUtils.clamp((p-a)/(b-a),0,1);return t*t*(3-2*t);};
// One existing published visual fiction; UV fragments never invent new archive material.
export function createRevelation(scene,request){
 const group=new THREE.Group();scene.add(group);
 const texture=new THREE.TextureLoader().load('./assets/yokohama-portrait.webp',()=>request());
 texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 // The fragment study resolves into a genuine editorial print at optical closure.
 // It uses the already-published TOHEŞAR artwork, never invented archive imagery.
 const photoPlate=document.createElement('section');
 photoPlate.className='yokohama-photo-plate';
 photoPlate.hidden=true;
 photoPlate.setAttribute('aria-label','Yokohama visual journal — the complete image');
 photoPlate.innerHTML=`
  <div class="photo-plate-ground" aria-hidden="true"></div>
  <figure class="photo-plate-frame">
   <img src="./assets/yokohama-portrait.webp" alt="TOHEŞAR의 가상 요코하마 항구와 자동차 비주얼 스터디" decoding="async">
   <figcaption>TOHEŞAR / VISUAL FICTION 001</figcaption>
  </figure>
  <div class="photo-plate-copy">
   <span class="photo-plate-index">001 &nbsp;/&nbsp; THE IMAGE</span>
   <h2>Yoko<em>hama.</em></h2>
   <p>A CITY IMAGINED. A MOMENT REMEMBERED.</p>
   <a href="/journal/yokohama/" aria-label="Read Yokohama visual journal">EXPLORE THE JOURNAL <span aria-hidden="true">↗</span></a>
  </div>
  <span class="photo-plate-footnote">AI-ASSISTED VISUAL STUDY / 2026</span>
 `;
 document.querySelector('main').append(photoPlate);
 const photoLink=photoPlate.querySelector('a');
 const regions=[[0,0,.42,.3],[.42,0,.58,.3],[0,.3,.28,.4],[.28,.3,.45,.4],[.73,.3,.27,.4],[0,.7,.55,.3],[.55,.7,.45,.3]];
 const depths=[3.8,5.4,4.6,6.3,4.1,5.9,7.4];
 const fragments=regions.map((r,i)=>{
  const [x,y,w,h]=r,g=new THREE.PlaneGeometry(1,1,12,16),uv=g.attributes.uv;
  for(let j=0;j<uv.count;j++)uv.setXY(j,x+uv.getX(j)*w,1-y-h+uv.getY(j)*h);
  const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,transparent:true,opacity:0,toneMapped:false});
  material.forceSinglePass=true;
  const tile=new THREE.Mesh(g,material);group.add(tile);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.018,1.018)),new THREE.LineBasicMaterial({color:i%2?0x987967:0x8da7b3,transparent:true,opacity:.55}));tile.add(edge);
  const backing=new THREE.Mesh(new THREE.PlaneGeometry(1.012,1.012),new THREE.MeshStandardMaterial({color:i%2?0xc8b39c:0xa9bbc4,metalness:.82,roughness:.29,side:THREE.DoubleSide,transparent:true,opacity:0}));
  backing.position.z=-.008;tile.add(backing);
  return {tile,edge,backing,region:r,depth:depths[i]};
 });
 let ready=false;texture.onUpdate=()=>{ready=true;};
 const inspection={alignmentError:null,depthRange:0,fragmentCount:7};
 function update(p,camera,anchor,mobile){
  // The image settles at 43%, holds as a real editorial plate, then dissolves
  // into the existing architectural leaves from 48%. No abrupt object swap.
  const plateIn=smooth(.416,.446,p);
  const plateOut=1-smooth(.486,.516,p);
  const plateOpacity=plateIn*plateOut;
  const plateInteractive=plateOpacity>.91&&p<.492;
  photoPlate.hidden=plateOpacity<.006;
  photoPlate.inert=!plateInteractive;
  photoPlate.setAttribute('aria-hidden',String(!plateInteractive));
  if(!photoPlate.hidden)photoPlate.style.opacity=plateOpacity.toFixed(3);
  photoLink.tabIndex=plateInteractive?0:-1;
  document.documentElement.style.setProperty('--photo-plate',plateOpacity.toFixed(3));
  group.visible=p>.27&&p<.665;
  group.position.x=0;
  const reveal=smooth(.27,.33,p),spread=smooth(.30,.37,p);
  // Geometry locks at 40%. Only the camera resolves the projection from 40–43%.
  const arrange=smooth(.37,.40,p),settle=smooth(.445,.48,p);
  const halfH=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*6;
  const halfW=halfH*camera.aspect;
  const width=mobile?halfW*1.64:halfH*1.05;
  const height=width*1050/850;
  let error=0,minZ=Infinity,maxZ=-Infinity;
  // Measure the optical closure as a verifiable scene state.
  const align=smooth(.401,.429,p);
  const gutter=mix(.987,1.002,align);
  const edgeOpacity=.48*(1-smooth(.397,.429,p));
  inspection.opticalGutter=gutter;
  inspection.edgeOpacity=edgeOpacity;
  camera.updateMatrixWorld();
  for(let i=0;i<fragments.length;i++){
   const {tile,edge,backing,region:r,depth}=fragments[i], [x,y,w,h]=r;
   const cx=(x+w/2-.5)*width+(mobile?0:halfW*.35),cy=(.5-y-h/2)*height+halfH*.14;
   const distance=mix(depth,5.4,settle),ratio=distance/6;
   const scatterX=Math.sin(i*2.4)*(mobile?.46:.9)*spread*(1-arrange);
   const scatterY=Math.cos(i*1.8)*.62*spread*(1-arrange);
   // Back-project each crop from the same reference camera, at unequal depths.
   tile.position.set(anchor.x+cx*ratio+scatterX,anchor.y+cy*ratio+scatterY,-5-distance);
   // The photographic fragments retain their separate spatial depth.
   // Only their projected edges close as the camera reaches alignment;
   // a tiny overlap prevents antialiased hairline gaps.
   tile.scale.set(width*w*ratio*(.55+.45*spread)*gutter,height*h*ratio*(.55+.45*spread)*gutter,1);
   // Registration boundaries dissolve at the optical climax.
   edge.material.opacity=edgeOpacity*(1-plateIn);
   edge.visible=edge.material.opacity>.006;
   backing.material.opacity=reveal*.8*(1-smooth(.39,.43,p));
   backing.visible=backing.material.opacity>.005;
   tile.rotation.set(.14*Math.sin(i*2)*spread*(1-arrange),.45*Math.cos(i*2.3)*spread*(1-arrange),.13*Math.sin(i)*spread*(1-arrange));
   const departure=smooth(.485,.555,p)*-.12;
   const dx=tile.position.x-anchor.x,dz=tile.position.z+10.4;
   tile.position.x=anchor.x+dx*Math.cos(departure)+dz*Math.sin(departure);
   tile.position.z=-10.4-dx*Math.sin(departure)+dz*Math.cos(departure);
   tile.rotation.y+=departure;
   // Once the full print resolves, fragmented geometry stays dissolved.
   // The next scene takes over; we never resurrect split tiles on the way out.
   tile.material.opacity=reveal*(1-smooth(.422,.446,p));
   tile.updateMatrixWorld();
   const screen=tile.position.clone().project(camera);
   error=Math.max(error,Math.hypot(screen.x-cx/halfW,screen.y-cy/halfH));
   minZ=Math.min(minZ,tile.position.z);maxZ=Math.max(maxZ,tile.position.z);
  }
  inspection.alignmentError=error;inspection.depthRange=maxZ-minZ;
  inspection.geometryLocked=p>=.40&&p<=.445;
 }

 return {update,inspection,fragments,get ready(){return ready;}};
}
