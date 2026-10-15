import * as THREE from 'three';
const mix=THREE.MathUtils.lerp;
const ease=(a,b,p)=>{const t=THREE.MathUtils.clamp((p-a)/(b-a),0,1);return t*t*(3-2*t);};
const destinations=[
 ['JOURNAL','Yokohama · Visual journal','/journal/yokohama/'],
 ['WORLD','Cinematic World 001','/world/'],
 ['SYMBOL','Se-diyu','/symbol/'],
 ['HISTORY','Before the Name','/history/'],
 ['INSTAGRAM','TOHEŞAR ↗︎','https://www.instagram.com/tohesar/']
];

// Five carriers: photographic emulsion becomes architectural film, then a
// single compressed memory. Geometry, edge and link share the same transform.
export function createContinuum(scene,request){
 const root=new THREE.Group();scene.add(root);
 const nav=document.querySelector('#spatial-navigation');
 const editorial=document.querySelector('#archive-entry');
 const title=editorial.querySelector('h2');
 const index=editorial.querySelector('.eyebrow');
 const end=document.querySelector('#imprint');
 const loader=new THREE.TextureLoader();
 const textures=['./assets/yokohama-interior.webp','./assets/yokohama-bluehour.webp'].map(url=>{
  const texture=loader.load(url,request);texture.colorSpace=THREE.SRGBColorSpace;return texture;
 });
 const panels=destinations.map(([name,description,href],i)=>{
  const group=new THREE.Group();root.add(group);
  const geometry=new THREE.PlaneGeometry(1,1,20,32);
  const uniforms={bend:{value:0},reveal:{value:0},media:{value:i<2?textures[i]:textures[0]},ink:{value:i<2?1:0},warm:{value:i/4}};
  const material=new THREE.ShaderMaterial({uniforms,transparent:true,side:THREE.DoubleSide,depthWrite:false,
   vertexShader:`uniform float bend; varying vec2 vUv; varying float vFold;
    void main(){vUv=uv;vec3 p=position;float fold=sin(uv.y*3.14159265)*sin(uv.x*3.14159265);p.z+=bend*(fold*.32+pow(uv.x,3.)*.18);vFold=fold;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
   fragmentShader:`uniform sampler2D media;uniform float reveal;uniform float ink;uniform float warm;varying vec2 vUv;varying float vFold;
    void main(){vec3 cold=vec3(.65,.80,.84),peach=vec3(.91,.74,.62);vec3 film=mix(cold,peach,clamp(vUv.y*.45+warm*.45,0.,1.));
     float edge=pow(abs(vUv.x-.5)*2.,16.);float shine=pow(max(0.,1.-abs(vUv.x+vUv.y*.24-.57)*5.),12.);
     film+=.16*vFold+shine*.19+edge*.14;
     vec3 photograph=texture2D(media,vUv).rgb;vec3 color=mix(film,photograph,ink);
     float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
     gl_FragColor=vec4(color+grain*.006,reveal*mix(.56+edge*.3,1.,ink));
     #include <colorspace_fragment>
    }`
  });
  const mesh=new THREE.Mesh(geometry,material);group.add(mesh);
  const frame=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1,1)),new THREE.LineBasicMaterial({color:i%2?0xb5967f:0x758d98,transparent:true,opacity:0}));group.add(frame);
  // A thin physical cut section catches the environment behind the optical face.
  const spine=new THREE.Mesh(new THREE.BoxGeometry(.007,1,.022),new THREE.MeshStandardMaterial({color:0xbdc5c5,metalness:.93,roughness:.24,transparent:true}));spine.position.x=-.5;group.add(spine);
  const link=document.createElement('a');link.href=href;link.innerHTML=`<span class="portal-index">0${i+1}</span><strong>${name}</strong><small>${description}</small><span class="portal-arrow">↗︎</span>`;
  if(i===4){link.target='_blank';link.rel='noopener noreferrer';}
  link.className='spatial-link';link.hidden=true;nav.append(link);
  const focus=()=>{group.userData.focus=true;request();};
  const blur=()=>{group.userData.focus=false;request();};
  link.addEventListener('pointerenter',focus);link.addEventListener('pointerleave',blur);link.addEventListener('focus',focus);link.addEventListener('blur',blur);
  return {group,mesh,frame,spine,uniforms,link};
 });
 const point=new THREE.Vector3();
 function update(p,camera,anchor,mobile,width,height){
  root.visible=p>.485;
  const travel=ease(.49,.64,p),architecture=ease(.65,.75,p),close=ease(.90,.985,p);
  if(p>.48){
   camera.position.set(anchor.x+5.2*travel*(1-architecture),anchor.y-.12*Math.sin(travel*Math.PI),-5-.8*travel-2.2*architecture);
   camera.lookAt(camera.position.x,camera.position.y,-24);
   camera.updateMatrixWorld();
  }
  const distance=6.5;
  const halfH=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*distance,halfW=halfH*camera.aspect;
  panels.forEach(({group,uniforms,frame,spine,link},i)=>{
   const arrival=ease(.485+i*.012,.535+i*.014,p);
   const railX=anchor.x+2.6+i*2.6, railY=anchor.y+.24;
   // Portrait: five overlapping thresholds climb through depth, leaving
   // generous 44px+ labels. Landscape expands the same arrangement laterally.
   const gx=mobile?Math.sin(i*.9)*.25*halfW:(i-2)*halfW*.36;
   const gy=mobile?(2-i)*halfH*.30:Math.sin(i*.9)*halfH*.18;
   const gz=-14.5-(mobile?i*.09:Math.abs(i-2)*.14);
   group.position.set(mix(railX,anchor.x+gx,architecture),mix(railY,anchor.y+gy,architecture),mix(-10.4,gz,architecture));
   group.position.lerp(new THREE.Vector3(anchor.x+(i-2)*.045,anchor.y+.28,-14.7-i*.10),close);
   const w=mix(mobile?1.48:1.8,mobile?halfW*1.47:halfW*.31,architecture);
   const h=mix(mobile?1.85:2.25,mobile?halfH*.65:halfH*1.55,architecture);
   group.scale.set(mix(w,1.1,close),mix(h,2.45,close),1);
   group.rotation.set(mix(0,-.12,close),mix(-.12*(1-architecture),mobile?-.36+i*.14:(i-2)*-.12,architecture)+close*.32,mix(0,-.2,close));
   uniforms.bend.value=.25+.5*architecture+.7*close;
   uniforms.ink.value=(i<2?1:0)*(1-ease(.64,.72,p));
   uniforms.reveal.value=arrival*(1-.46*close);
   frame.material.opacity=arrival*(.35+.24*architecture);
   spine.material.opacity=arrival;
   spine.visible=arrival>.01;
   if(group.userData.focus){uniforms.reveal.value=1;frame.material.opacity=1;}
   group.updateMatrixWorld();
   const active=p>=.755&&p<=.905;
   link.hidden=!active;link.tabIndex=active?0:-1;
   if(active){
    point.set(0,0,.05).applyMatrix4(group.matrixWorld).project(camera);
    link.style.left=`${(point.x*.5+.5)*width}px`;
    link.style.top=`${(-point.y*.5+.5)*height}px`;
    link.style.width=`${mobile?Math.min(width*.67,330):Math.min(width*.16,220)}px`;
   }
  });
  const entry=p>.525&&p<.65;
  editorial.hidden=!entry;
  if(entry){title.textContent=p<.59?'A human trace.':'Blue hour.';index.textContent=p<.59?'YOKOHAMA / 02':'YOKOHAMA / 03';}
  end.hidden=p<.977;
  document.documentElement.style.setProperty('--continuum',architecture*(1-close));
  return {travel,architecture,close};
 }
 return {update};
}
