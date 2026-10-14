/* CHROME ATMOSPHERE / original parametric artwork. No symbol geometry or imagery.
   A continuous liquid loop, physical chrome, optical glass, and a procedural HDR studio. */
import * as THREE from 'three';
const canvas=document.querySelector('#chrome-canvas');
const artwork=document.querySelector('#artwork');
const motionButton=document.querySelector('#motion');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.6:1.8));
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(35,1,.1,80);
 camera.position.set(0,.15,9.6);
 // An HDR environment made from architectural light cards, rather than a flat chrome gradient.
 const studio=new THREE.Scene();studio.background=new THREE.Color(.48,.5,.51);
 function card(x,y,z,w,h,color){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.lookAt(0,0,0);studio.add(mesh);}
 card(-4,2,3,2,9,new THREE.Color(6,6.2,6.4));
 card(4,1,2,1.6,8,new THREE.Color(4.5,3.6,3));
 card(0,6,0,7,6,new THREE.Color(4,4.2,4.5));
 card(-1,1,5,.7,8,new THREE.Color(.012,.016,.021));
 card(2,.5,5,1.3,9,new THREE.Color(.018,.024,.029));
 card(0,-4,2,10,4,new THREE.Color(.13,.16,.18));
 card(-4,0,-3,4,6,new THREE.Color(.55,.9,1.5));
 card(4,0,-2,3,7,new THREE.Color(1.4,.7,.43));
 const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(studio,.06,.1,50);
 scene.environment=environment.texture;pmrem.dispose();
 studio.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});
 // The background is actual scene geometry, so glass transmission sees the peach/blue atmosphere.
 const backdropMaterial=new THREE.ShaderMaterial({depthWrite:false,uniforms:{shift:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`precision highp float;varying vec2 vUv;uniform float shift;void main(){vec2 p=vUv;vec3 col=vec3(.91,.90,.87);float blue=exp(-length((p-vec2(.22+shift*.15,.42))*vec2(3.,2.9))*2.1);float peach=exp(-length((p-vec2(.77,.64-shift*.15))*vec2(3.,3.))*2.2);col=mix(col,vec3(.53,.72,.86),blue*.8);col=mix(col,vec3(.98,.69,.51),peach*.7);gl_FragColor=vec4(col,1.);}`});
 const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(35,25),backdropMaterial);backdrop.position.z=-6;scene.add(backdrop);
 const chrome=new THREE.MeshPhysicalMaterial({color:'#e5e8ec',metalness:1,roughness:.095,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.25});
 // A custom liquid cross-section follows an asymmetric spatial loop. This is not a stock torus.
 const U=144,V=40,positions=new Float32Array((U+1)*(V+1)*3),indices=[];
 for(let i=0;i<U;i++)for(let j=0;j<V;j++){const a=i*(V+1)+j,b=(i+1)*(V+1)+j;indices.push(a,b,a+1,b,b+1,a+1);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setIndex(indices);
 function shape(morph=0){
  for(let i=0;i<=U;i++){
   const u=i/U,t=u*(Math.PI*2-morph*.95)+morph*.25;
   const r=1.45+.16*Math.cos(3*t+.3)+morph*.18*Math.sin(t);
   const x=r*Math.cos(t),y=(1.6+.12*Math.sin(2*t))*Math.sin(t),z=.46*Math.sin(2*t+.6)+morph*.55*Math.cos(t);
   const tube=.45+.13*Math.sin(t+.8)+.07*Math.cos(3*t);
   const taper=1-morph*(1-Math.pow(Math.max(0,Math.sin(Math.PI*u)),.25))*.97;
   for(let j=0;j<=V;j++){
    const v=j/V*Math.PI*2,twist=t*.7+morph*.7;
    const a=Math.cos(v)*tube*taper,b=Math.sin(v)*tube*.74*taper;
    const radial=a*Math.cos(twist)-b*Math.sin(twist),depth=a*Math.sin(twist)+b*Math.cos(twist);
    const k=(i*(V+1)+j)*3;positions[k]=x+Math.cos(t)*radial;positions[k+1]=y+Math.sin(t)*radial;positions[k+2]=z+depth;
   }
  }
  geometry.attributes.position.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
 }
 shape();
 const sculpture=new THREE.Mesh(geometry,chrome);sculpture.rotation.set(.2,-.38,-.52);scene.add(sculpture);
 const glass=new THREE.Mesh(new THREE.SphereGeometry(.67,48,32),new THREE.MeshPhysicalMaterial({color:'#f6faff',metalness:0,roughness:.045,transmission:1,thickness:1.4,ior:1.46,envMapIntensity:1.3,clearcoat:1}));glass.position.set(1.48,1.05,-.45);scene.add(glass);
 const satellite=new THREE.Mesh(new THREE.SphereGeometry(.18,32,24),chrome);satellite.position.set(-1.65,-1.15,.6);scene.add(satellite);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(7,2),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{strength:{value:.16}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float strength;void main(){float d=length((vUv-.5)*vec2(2.,5.));gl_FragColor=vec4(.28,.32,.35,exp(-d*d*5.)*strength);}`}));shadow.position.set(0,-2.45,-.4);shadow.rotation.x=-.55;scene.add(shadow);
 let paused=reduced.matches,raf=0,last=0,time=0,active=true,progress=0,targetProgress=0;
 const pointer=new THREE.Vector2(),smoothPointer=new THREE.Vector2();
 function fit(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();camera.position.z=w<600?13.1:w/h<1.2?10.4:8.8;sculpture.scale.setScalar(w<600?.93:1);render(performance.now());}
 function render(now){if(raf)cancelAnimationFrame(raf);raf=0;const dt=Math.min(.04,(now-(last||now))/1000);last=now;if(!paused)time+=dt;
  smoothPointer.lerp(paused?new THREE.Vector2():pointer,.035);
  sculpture.rotation.set(.2+Math.sin(time*.25)*.08+smoothPointer.y*.1,-.38+Math.sin(time*.19)*.1+smoothPointer.x*.14,-.52+Math.sin(time*.16)*.035);
  sculpture.position.y=.02+Math.sin(time*.65)*.065;
  glass.position.y=1.05+Math.sin(time*.45+.7)*.1;satellite.position.y=-1.15+Math.sin(time*.55)*.12;
  renderer.render(scene,camera);if(active&&!document.hidden&&!paused)raf=requestAnimationFrame(render);
 }
 function resume(){last=0;if(active&&!document.hidden)render(performance.now());else{cancelAnimationFrame(raf);raf=0;}}
 const syncButton=()=>{motionButton.textContent=paused?'▷':'Ⅱ';motionButton.setAttribute('aria-pressed',String(paused));motionButton.setAttribute('aria-label',paused?'Play ambient motion':'Pause ambient motion');};
 motionButton.addEventListener('click',()=>{paused=!paused;syncButton();resume();});
 reduced.addEventListener('change',()=>{paused=reduced.matches;syncButton();resume();});
 window.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced.matches)return;pointer.set((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2);},{passive:true});
 new ResizeObserver(fit).observe(artwork);document.addEventListener('visibilitychange',resume);
 new IntersectionObserver(entries=>{active=entries[0].isIntersecting;resume();}).observe(artwork);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(raf);artwork.classList.remove('ready');motionButton.hidden=true;});
 fit();syncButton();artwork.classList.add('ready');
} catch(error){console.warn('Chrome Atmosphere fallback:',error.message);motionButton.hidden=true;}
