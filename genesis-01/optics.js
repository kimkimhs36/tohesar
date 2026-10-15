import * as THREE from 'three';

// Thin optical coatings: reflection cards and transmitted colour, with no
// framebuffer refraction pass. World-space normals follow the actual fold.
export function opticalFilm({map=null,warm=.5,opacity=.7,ink=0}={}){
 const material=new THREE.ShaderMaterial({
  transparent:true,side:THREE.DoubleSide,depthWrite:false,
  uniforms:{media:{value:map},ink:{value:ink},warm:{value:warm},opacity:{value:opacity},lightPhase:{value:0},focus:{value:0},metal:{value:0},aperture:{value:0}},
  vertexShader:`
   varying vec2 vUv; varying vec3 vWorld;
   #include <common>
   #include <morphtarget_pars_vertex>
   void main(){
    vUv=uv;
    #include <morphinstance_vertex>
    #include <begin_vertex>
    #include <morphtarget_vertex>
    vec4 world=modelMatrix*vec4(transformed,1.);vWorld=world.xyz;
    gl_Position=projectionMatrix*viewMatrix*world;
   }`,
  fragmentShader:`
   uniform sampler2D media;uniform float ink,warm,opacity,lightPhase,focus,metal,aperture;
   varying vec2 vUv;varying vec3 vWorld;
   float band(float x,float center,float width){return exp(-pow((x-center)/width,2.));}
   void main(){
    vec3 N=normalize(cross(dFdx(vWorld),dFdy(vWorld)));
    vec3 V=normalize(cameraPosition-vWorld);if(dot(N,V)<0.)N=-N;
    vec3 R=reflect(-V,N);float grazing=pow(1.-max(dot(N,V),0.),3.);
    vec3 ivory=vec3(.89,.87,.77),sky=vec3(.30,.58,.72),peach=vec3(.83,.50,.34);
    float drift=lightPhase*.20;
    vec3 transmitted=mix(ivory,mix(sky,peach,warm),.16+.22*vUv.y);
    vec3 reflected=mix(sky,ivory,smoothstep(-.6,.65,R.y));
    reflected=mix(reflected,peach,.27*band(R.x,-.57+drift,.42));
    float card=band(R.x+.19*R.y,.36-drift,.105);
    float softbox=band(R.x-.24*R.y,-.50+drift,.34);
    float blocker=band(R.x+.12*R.y,-.04+drift,.075);
    reflected=mix(reflected,vec3(.045,.080,.105),blocker*.84)+vec3(.83,.89,.86)*card*.75+softbox*.22;
    float thinEdge=1.-smoothstep(.0,.009,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
    vec3 glass=mix(transmitted,reflected,.28+.62*grazing);
    // A very narrow warm/cool separation belongs to the coating at grazing
    // angles, not to an RGB postprocessing effect on the entire photograph.
    glass+=grazing*.055*cos(vec3(0.,1.6,3.1)+vUv.y*3.+warm*2.);
    float cut=1.-smoothstep(.008,.025,vUv.x);
    glass=mix(glass,reflected,max(metal,cut*.92));
    glass+=thinEdge*.13+focus*.055;
    vec3 photo=texture2D(media,vUv).rgb;
    float slit=(1.-smoothstep(.065,.085,abs(vUv.x-.70)))*smoothstep(.12,.18,vUv.y)*(1.-smoothstep(.83,.89,vUv.y));
    float emulsion=max(ink,aperture*slit);
    vec3 color=glass;
    float rule=(1.-smoothstep(.0,.0012,abs(vUv.y-.055)))*step(.07,vUv.x)*step(vUv.x,.22);
    color-=rule*.055*(1.-ink);
    float grain=fract(sin(dot(vUv,vec2(2173.13,1927.73)))*43758.5453)-.5;
    gl_FragColor=vec4(color+grain*.0025,opacity*mix(min(1.,.45+.42*grazing+.14*thinEdge+metal*.3+cut*.35),1.,ink));
    #include <tonemapping_fragment>
    gl_FragColor.rgb=mix(gl_FragColor.rgb,photo,emulsion);
    gl_FragColor.a=mix(gl_FragColor.a,opacity,aperture*slit);
    #include <colorspace_fragment>
   }`
 });
 material.forceSinglePass=true;
 return material;
}

// All states have identical topology, including the polished cut section.
// The edge never remains a flat rectangle while the surface bends away.
export function memorySurface(state,u,v){
 const x=u-.5,y=v-.5;
 if(state===0)return new THREE.Vector3(x,y,.035*Math.sin(v*Math.PI)*x*x);
 if(state===1)return new THREE.Vector3(
  x*(.72+.28*Math.sin(v*Math.PI))+.12*Math.sin(v*4.4),
  y*1.12+.045*Math.sin(u*Math.PI)*Math.sin(v*3.),
  .29*Math.sin(u*Math.PI*.95)+.19*Math.sin(v*4.7)*x+.08*u*u);
 return new THREE.Vector3(
  x*(.47+.53*Math.sin(v*Math.PI*.91))+.13*Math.sin(y*3.8),
  y*1.14-.09*u*u+.03*Math.sin(v*6.),
  .30*Math.sin(u*Math.PI*1.1)+.13*Math.sin(v*4.+u*2.)+.08*u*u);
}
function surfaceGeometry(state){
 const g=new THREE.PlaneGeometry(1,1,24,48),pos=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<pos.count;i++){const p=memorySurface(state,uv.getX(i),uv.getY(i));pos.setXYZ(i,p.x,p.y,p.z);}
 g.computeVertexNormals();return g;
}
function perimeter(state){
 const points=[];
 for(let j=0;j<48;j++)points.push(memorySurface(state,0,j/48));
 for(let j=0;j<24;j++)points.push(memorySurface(state,j/24,1));
 for(let j=0;j<48;j++)points.push(memorySurface(state,1,1-j/48));
 for(let j=0;j<24;j++)points.push(memorySurface(state,1-j/24,0));
 return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,true),192,.0027,4,true);
}
export function carrierGeometry(){
 const surface=[0,1,2].map(surfaceGeometry),edge=[0,1,2].map(perimeter);
 for(const states of [surface,edge]){
  states[0].morphAttributes.position=states.slice(1).map(g=>g.attributes.position);
  states[0].morphAttributes.normal=states.slice(1).map(g=>g.attributes.normal);
  states[0].computeBoundingSphere();
 }
 return {surface:surface[0],edge:edge[0]};
}
