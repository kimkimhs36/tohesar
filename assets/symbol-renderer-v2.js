/* TOHEŞAR / THE CEDILLA · Object Study 001, renderer v2.
   Original 2D path + real WebGL depth, bevel and response to pointer movement.
   No externally loaded 3D libraries or pre-rendered rotation sequences. */
(()=>{
 'use strict';
 const stage=document.getElementById('stage');
 const canvas=document.getElementById('art');
 const spinButton=document.getElementById('spin-toggle');
 const resetButton=document.getElementById('reset');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!stage||!canvas||!spinButton||!resetButton)return;
 let shape;
 try {shape=JSON.parse(document.getElementById('shape-data').textContent)}catch(e){return;}
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,depth:true,stencil:false,powerPreference:'default'});
 if(!gl){spinButton.disabled=true;stage.setAttribute('aria-label','3D 미지원 기기에서는 평면 세디유 심볼을 표시합니다.');return;}
 const vertexSource=`attribute vec3 position;attribute vec3 normal;
 uniform float yaw;uniform float pitch;uniform float zoom;uniform float aspect;
 varying vec3 N;varying vec3 P;
 void main(){float cy=cos(yaw),sy=sin(yaw),cx=cos(pitch),sx=sin(pitch);
 mat3 ry=mat3(cy,0.,-sy,0.,1.,0.,sy,0.,cy);
 mat3 rx=mat3(1.,0.,0.,0.,cx,sx,0.,-sx,cx);
 mat3 rot=rx*ry;vec3 p=rot*position;
 N=normalize(rot*normal);P=p;
 float z=6.0-p.z;float projection=2.85*zoom;
 gl_Position=vec4(p.x*projection/aspect,p.y*projection,(z-2.4)*.55,z);
 }`;
 const fragmentSource=`precision highp float;varying vec3 N;varying vec3 P;
 uniform vec3 base;uniform float gloss;uniform float time;
 float spec(vec3 a,vec3 b,float power){return pow(max(dot(normalize(a),normalize(b)),0.),power);}
 void main(){
 vec3 n=normalize(N);
 vec3 v=normalize(vec3(-P.x*.12,-P.y*.10,4.2));
 vec3 key=normalize(vec3(-.72,.87,1.15));
 vec3 fill=normalize(vec3(.88,.21,.72));
 float diffuse=max(dot(n,key),0.);
 float fillLight=max(dot(n,fill),0.);
 float fresnel=pow(1.-max(dot(n,v),0.),2.25);
 vec3 r=reflect(-v,n);
 // Softbox panels reflected in metal; large directional studio lights, not point-light plastic.
 float mainBox=spec(r,vec3(-.72,.72,.51),11.0+gloss*7.);
 float edgeBox=spec(r,vec3(.96,.23,.42),32.0+gloss*12.);
 float upperBox=spec(r,vec3(.05,.96,.44),8.0+gloss*6.);
 float specular=spec(n,normalize(key+v),44.0+gloss*62.);
 float edgeGlint=spec(n,normalize(fill+v),54.0+gloss*85.);
 // A brushed satin microtexture etched along the long axis of the object.
 float grain=sin(P.y*310.0+sin(P.x*46.)*.25)*.007;
 vec3 col=base*(.24+.38*diffuse+.15*fillLight);
 col+=vec3(1.0,.92,.77)*(mainBox*.67+upperBox*.16+specular*.36);
 col+=vec3(.96,.84,.71)*(edgeBox*.58+edgeGlint*.29+fresnel*.30);
 // A weak, warm gallery source grazing the front face as it turns.
 float sweep=exp(-pow((P.x*.77-P.y*.21-.16)/.45,2.0))*pow(max(dot(n,v),0.),1.6);
 col+=vec3(1.0,.87,.69)*sweep*.10;
 col+=vec3(grain)*(.2+gloss*.15);
 // Soft filmic response with specular highlights left intact.
 col=max(col,vec3(0.));col=col/(col+vec3(.42));
 col=pow(col,vec3(.83));
 gl_FragColor=vec4(clamp(col,0.,1.),1.);
 }`;
 function shader(type,source){let s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 let program;
 try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexSource));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragmentSource));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}
 catch(e){console.warn('TOHEŞAR 3D renderer:',e);spinButton.disabled=true;return;}
 gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
 const vertices=[],normals=[];
 const pts=shape.points,indices=shape.triangles;
 function tri(a,b,c,na,nb,nc){vertices.push(...a,...b,...c);normals.push(...na,...nb,...nc);}
 function at(i,scale,z){return [pts[i][0]*scale,pts[i][1]*scale,z];}
 function outward(i){const count=pts.length,prev=pts[(i+count-1)%count],curr=pts[i],next=pts[(i+1)%count];
 const a=Math.hypot(curr[0]-prev[0],curr[1]-prev[1])||1,b=Math.hypot(next[0]-curr[0],next[1]-curr[1])||1;
 let x=(curr[1]-prev[1])/a+(next[1]-curr[1])/b,y=-(curr[0]-prev[0])/a-(next[0]-curr[0])/b;
 const mag=Math.hypot(x,y)||1;return[x/mag,y/mag];}
 // 0.27 total depth, reduced from the previous 0.44. Bevels no longer look like thick cast plastic.
 const DEPTH=.135,BEVEL=.103;
 for(let k=0;k<indices.length;k+=3){const a=indices[k],b=indices[k+1],c=indices[k+2];
 tri(at(a,1,DEPTH),at(b,1,DEPTH),at(c,1,DEPTH),[0,0,1],[0,0,1],[0,0,1]);
 tri(at(c,1,-DEPTH),at(b,1,-DEPTH),at(a,1,-DEPTH),[0,0,-1],[0,0,-1],[0,0,-1]);}
 // Discreet chamfer creates glints at the edges as the object rotates.
 const rings=[[1,DEPTH,1],[1.013,BEVEL,.72],[1.013,-BEVEL,0],[1,-DEPTH,-1]];
 for(let i=0;i<pts.length;i++){
  const j=(i+1)%pts.length,oi=outward(i),oj=outward(j);
  for(let k=0;k<rings.length-1;k++){
   const a=rings[k],b=rings[k+1];
   const p1=at(i,a[0],a[1]),p2=at(j,a[0],a[1]),p3=at(i,b[0],b[1]),p4=at(j,b[0],b[1]);
   const normal=(o,z)=>{const mag=Math.hypot(o[0],o[1],z)||1;return[o[0]/mag,o[1]/mag,z/mag];};
   const n1=normal(oi,a[2]),n2=normal(oj,a[2]),n3=normal(oi,b[2]),n4=normal(oj,b[2]);
   tri(p1,p4,p2,n1,n4,n2);tri(p1,p3,p4,n1,n3,n4);
  }
 }
 function buffer(name,data){const pos=gl.getAttribLocation(program,name),obj=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,obj);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,0,0);}
 buffer('position',new Float32Array(vertices));buffer('normal',new Float32Array(normals));
 const uni={};for(const name of ['yaw','pitch','zoom','aspect','base','gloss','time'])uni[name]=gl.getUniformLocation(program,name);
 const finishes={champagne:{base:[.94,.69,.38],gloss:.65},silver:{base:[.65,.68,.71],gloss:.35},graphite:{base:[.33,.35,.37],gloss:.75}};
 let finish='champagne',yaw=-.12,pitch=-.08,zoom=1,dragging=false,lastX=0,lastY=0,velocityX=0,velocityY=0;
 let auto=!reduced,active=true,raf=0,previous=0,observedVisible=true,observer=null;
 function toggleState(){spinButton.textContent=auto?'AUTO · ON':'AUTO · OFF';spinButton.setAttribute('aria-pressed',String(auto));}
 function schedule(){if(active&&!raf)raf=requestAnimationFrame(draw);}
 function draw(now){
  raf=0;const dt=Math.min(45,now-(previous||now));previous=now;
  if(!dragging){if(Math.abs(velocityX)+Math.abs(velocityY)>.00008){yaw+=velocityX*dt*.07;pitch=Math.max(-1.42,Math.min(1.42,pitch+velocityY*dt*.07));velocityX*=Math.pow(.85,dt/16);velocityY*=Math.pow(.85,dt/16);}else if(auto){yaw+=dt*.00018;}}
  const dpr=Math.min(window.devicePixelRatio||1,1.75);
  const w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
  const aspect=w/h;
  const fit=Math.min(1,aspect/1.13);
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.uniform1f(uni.yaw,yaw);gl.uniform1f(uni.pitch,pitch);gl.uniform1f(uni.zoom,zoom*fit);gl.uniform1f(uni.aspect,aspect);
  gl.uniform3fv(uni.base,finishes[finish].base);gl.uniform1f(uni.gloss,finishes[finish].gloss);gl.uniform1f(uni.time,now*.001);
  gl.drawArrays(gl.TRIANGLES,0,vertices.length/3);
  if(active&&(auto||dragging||Math.abs(velocityX)+Math.abs(velocityY)>.00008))schedule();
 }
 stage.addEventListener('pointerdown',e=>{
  if(e.button!==0&&e.pointerType==='mouse')return;
  dragging=true;auto=false;toggleState();stage.classList.add('grabbing');
  lastX=e.clientX;lastY=e.clientY;velocityX=velocityY=0;
  stage.setPointerCapture(e.pointerId);schedule();
 });
 stage.addEventListener('pointermove',e=>{
  if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;
  yaw+=dx*.0065;pitch=Math.max(-1.42,Math.min(1.42,pitch+dy*.0065));
  velocityX=dx*.0045;velocityY=dy*.0045;lastX=e.clientX;lastY=e.clientY;schedule();
 });
 const release=()=>{dragging=false;stage.classList.remove('grabbing');schedule();};
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
 stage.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.min(1.25,Math.max(.78,zoom+(e.deltaY<0?.05:-.05)));schedule();},{passive:false});
 stage.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','r','R'].includes(e.key))return;
  e.preventDefault();auto=false;toggleState();if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch=Math.max(-1.42,pitch-.12);if(e.key==='ArrowDown')pitch=Math.min(1.42,pitch+.12);
  if(e.key.toLowerCase()==='r'){yaw=-.12;pitch=-.08;zoom=1;}schedule();
 });
 spinButton.addEventListener('click',()=>{auto=!auto;toggleState();schedule();});
 resetButton.addEventListener('click',()=>{auto=false;yaw=-.12;pitch=-.08;zoom=1;velocityX=velocityY=0;toggleState();schedule();});
 document.querySelectorAll('[data-finish]').forEach(b=>b.addEventListener('click',()=>{
  if(!(b.dataset.finish in finishes))return;
  finish=b.dataset.finish;
  document.querySelectorAll('[data-finish]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});
  schedule();
 }));
 function visibility(){active=!document.hidden&&observedVisible;if(!active&&raf){cancelAnimationFrame(raf);raf=0;previous=0;}else if(active)schedule();}
 if('IntersectionObserver'in window){observer=new IntersectionObserver(entries=>{observedVisible=entries[0].isIntersecting;visibility();},{rootMargin:'100px 0px 100px 0px'});observer.observe(stage);}
 document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',schedule,{passive:true});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;stage.classList.remove('ready');});
 stage.classList.add('ready');toggleState();schedule();
})();