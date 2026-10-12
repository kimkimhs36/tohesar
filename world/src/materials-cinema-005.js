import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

export const noiseGLSL = `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return .55*noise(p)+.27*noise(p*2.03)+.12*noise(p*4.17)+.06*noise(p*8.31);}
`;

export function makeSky(){
 const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{sun:{value:new THREE.Vector3(.27,.18,-.945).normalize()},dusk:{value:0}},vertexShader:`varying vec3 vDir; void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 vDir;uniform vec3 sun;uniform float dusk;${noiseGLSL}
 void main(){vec3 d=normalize(vDir);float h=max(d.y,0.);float warm=pow(max(dot(d,sun),0.),4.);vec3 col=mix(vec3(.78,.42,.28),vec3(.14,.21,.33),smoothstep(0.,.65,h));col=mix(col,vec3(1.05,.66,.36),warm*.66*exp(-h*2.5));
 float s=max(dot(d,sun),0.);col+=vec3(1.,.57,.26)*pow(s,90.)*.65;col+=vec3(1.,.74,.42)*smoothstep(.99977,.99994,s)*4.;
 vec2 q=d.xz/max(d.y+.18,.045);float clouds=fbm(q*vec2(.75,3.)+vec2(8.4,3.));float layer=smoothstep(.50,.73,clouds)*smoothstep(.01,.09,h)*(1.-smoothstep(.38,.72,h));col=mix(col,vec3(.39,.37,.40)+warm*vec3(.40,.20,.10),layer*.44);col+=smoothstep(.49,.55,clouds)*(1.-smoothstep(.55,.60,clouds))*warm*.11*(1.-smoothstep(.4,.65,h));
 float nightFactor=smoothstep(.13,.97,dusk);
 vec3 twilight=mix(vec3(.29,.21,.26),vec3(.045,.095,.20),smoothstep(0.,.72,h));
 float haze=pow(1.-smoothstep(0.,.35,h),3.);
 twilight+=vec3(.24,.09,.045)*haze*(1.-nightFactor*.5);
 col=mix(col,twilight,nightFactor*.87);
 gl_FragColor=vec4(col,1.);#include <tonemapping_fragment>
 #include <colorspace_fragment>}`.replace(';#include',';\n#include')});
 const sky=new THREE.Mesh(new THREE.SphereGeometry(400,48,24),material);return sky;
}

export function makeGround(){
 const narrow=typeof window!=='undefined'&&window.matchMedia('(max-width:700px)').matches;
 const ground=new Reflector(new THREE.PlaneGeometry(240,240),{textureWidth:narrow?512:768,textureHeight:narrow?768:1024,clipBias:.006,multisample:0});
 ground.rotation.x=-Math.PI/2;ground.position.set(0,-.025,-42);
 ground.material.uniforms.time={value:0};ground.material.uniforms.reflectionEnabled={value:1};ground.material.uniforms.dusk={value:0};
 ground.material.vertexShader=`uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 vWorld;void main(){vUv=textureMatrix*vec4(position,1.);vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
 ground.material.fragmentShader=`uniform sampler2D tDiffuse;uniform float time;uniform float reflectionEnabled;uniform float dusk;varying vec4 vUv;varying vec3 vWorld;${noiseGLSL}
 void main(){vec2 p=vWorld.xz;vec3 V=normalize(cameraPosition-vWorld);float farfade=1.-exp(-length(cameraPosition-vWorld)*.009);
 float patches=fbm(p*.61+9.);float grain=noise(p*125.);float pits=noise(p*29.);
 // Irregular narrow pockets of older, darker asphalt around the foreground.
 float tarSeams=smoothstep(.61,.82,noise(p*2.6+vec2(18.,7.)))*.06;float fissure=abs(sin(p.x*1.32+fbm(p*.42)*8.+sin(p.y*.51)*2.));float crack=1.-smoothstep(.013,.050,fissure);crack*=smoothstep(.34,.65,noise(p*1.5));
 float wet=smoothstep(.54,.70,patches);wet=max(wet,crack*.8);float fresnel=pow(1.-max(V.y,0.),4.);vec3 dry=vec3(.078,.088,.102)*( .68+grain*.44+pits*.20);dry*=1.-crack*.77;dry*=1.-tarSeams;
 float marking=(1.-smoothstep(.048,.069,abs(p.x+1.5)))*step(.43,fract((p.y+2.)*.17));float edge=1.-smoothstep(.05,.07,abs(p.x-4.25));float paint=(marking+edge*.5)*smoothstep(.19,.45,noise(p*44.));dry=mix(dry,vec3(.43,.39,.30),paint*.77);
 vec2 uv=vUv.xy/vUv.w;vec2 bump=vec2(noise(p*15.),noise(p*15.+18.))-.5;vec2 ripple=vec2(sin(p.y*33.+p.x*7.),cos(p.x*29.))*.00024;float blur=mix(.004,.0006,wet);uv+=bump*.004*(1.-wet*.55)+ripple*wet;
 vec3 reflected=texture2D(tDiffuse,uv).rgb*.38;reflected+=texture2D(tDiffuse,uv+vec2(blur,0)).rgb*.155;reflected+=texture2D(tDiffuse,uv-vec2(blur,0)).rgb*.155;reflected+=texture2D(tDiffuse,uv+vec2(0,blur*2.)).rgb*.155;reflected+=texture2D(tDiffuse,uv-vec2(0,blur*2.)).rgb*.155;
 float reflectance=mix(.035,.34,wet)*(.16+.84*fresnel);reflectance*=reflectionEnabled;vec3 col=mix(dry,reflected,reflectance);float spark=pow(max(grain-.73,0.)*3.7,5.);
 // Break the road into reflective shallow micro-pools instead of uniform gloss.
 float waterIslands=smoothstep(.56,.77,fbm(p*vec2(1.4,.78)+vec2(8.,2.)));
 float reflectedSky=smoothstep(.12,.85,waterIslands)*wet*pow(1.-max(V.y,0.),2.);
 col+=vec3(.045,.060,.078)*reflectedSky*.34;col+=vec3(.11,.055,.025)*spark*fresnel*wet;
 // Reflected harbor streetlamps, softly broken up by water-filled roughness.
 float lampPool=exp(-pow((p.x-4.9)*.43,2.))*pow(max(cos((p.y-4.)*.4833219),0.),16.);
 col+=vec3(.39,.205,.086)*lampPool*(.10+.90*wet)*(.20+.80*fresnel)*.29;
 col=mix(col,vec3(.28,.25,.24),farfade*.72);col*=mix(vec3(1.),vec3(.80,.91,1.13),smoothstep(.2,1.,dusk)*.31);gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>}`;
 return ground;
}

export function makeWater(){
 return new THREE.Mesh(new THREE.PlaneGeometry(330,250),new THREE.ShaderMaterial({uniforms:{time:{value:0},dusk:{value:0}},vertexShader:`varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 vWorld;uniform float time;uniform float dusk;${noiseGLSL}
 void main(){vec2 p=vWorld.xz;float waves=noise(p*vec2(1.9,18.)+vec2(time*.11,0.));vec3 V=normalize(cameraPosition-vWorld);vec3 n=normalize(vec3((noise(p*3.+time*.04)-.5)*.09,1.,(waves-.5)*.16));vec3 H=normalize(V+normalize(vec3(.27,.18,-.945)));float shine=pow(max(dot(n,H),0.),230.);vec3 col=mix(vec3(.10,.18,.22),vec3(.34,.36,.37),waves*.5);col+=vec3(2.9,1.6,.6)*shine;float f=1.-exp(-length(cameraPosition-vWorld)*.005);col=mix(col,vec3(.50,.41,.36),f*.6);
 // Sunset light spreads across slight wave crests without a scrolling fake reflection.
 float amberCrest=smoothstep(.63,.81,waves)*pow(max(dot(n,H),0.),24.);
 col+=vec3(.49,.24,.10)*amberCrest*.16*(1.-dusk*.75);col=mix(col,col*vec3(.64,.82,1.15),dusk*.65);gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>}`}));
}

export function makeComposite(renderer){
 const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:true,samples:2});
 const material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{image:{value:target.texture},time:{value:0},texel:{value:new THREE.Vector2(1,1)},motion:{value:1},exposureShift:{value:1},chapter:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`uniform sampler2D image;uniform float time;uniform vec2 texel;uniform float motion;uniform float exposureShift;uniform float chapter;varying vec2 vUv;${noiseGLSL}
 void main(){vec2 uv=vUv;float band=smoothstep(.36,.46,uv.y)*(1.-smoothstep(.51,.57,uv.y));float drift=(noise(vec2(uv.x*85.,uv.y*110.-time*.65))-.5)*.0015*band*motion;uv.x+=drift;
 vec3 col=texture2D(image,uv).rgb;vec3 bloom=vec3(0.);vec2 offsets[4];offsets[0]=vec2(3,1);offsets[1]=vec2(-3,-1);offsets[2]=vec2(1,-3);offsets[3]=vec2(-1,3);for(int i=0;i<4;i++){vec3 s=texture2D(image,uv+texel*offsets[i]*2.).rgb;bloom+=max(s-vec3(.9),vec3(0.));}col+=bloom*.064;
 col*=exposureShift;float dusk=smoothstep(.25,.96,chapter);col*=mix(vec3(1.028,1.002,.982),vec3(.922,.958,1.085),dusk);col=mix(col,col/(vec3(.035)+col)*col,.035);float vignette=smoothstep(.78,.16,distance(vUv,vec2(.48,.51)));col*=.82+.18*vignette;col+=vec3(1.,.71,.43)*pow(max(0.,1.-distance(vUv,vec2(.22,.54))),8.)*.012;gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 gl_FragColor.rgb+=(hash(gl_FragCoord.xy+fract(time)*100.)-.5)/255.;}`});
 const quadScene=new THREE.Scene();quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));const cam=new THREE.Camera();
 return {target,material,resize(w,h){target.setSize(w,h);material.uniforms.texel.value.set(1/w,1/h);},render(scene,camera,time,motion){material.uniforms.time.value=time;material.uniforms.motion.value=motion;renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(quadScene,cam);}};
}
