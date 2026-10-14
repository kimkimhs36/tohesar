/*
 * TOHEŞAR / MEMORY ALLOY — FOLDED RECORD
 * Experimental art-direction proof, 2026-10-14.
 * An original, standalone WebGL2 surface renderer. No third-party models, symbol
 * geometry or fake editorial content. Existing wordmark is displayed separately.
 * The sequence deliberately covers only the first 0–30% of the proposed homepage.
 */
(() => {
  'use strict';
  const stage = document.getElementById('stage');
  const sequence = document.getElementById('sequence');
  const canvas = document.getElementById('alloy');
  const artwork = document.getElementById('artwork');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const pauseButton = document.getElementById('motion-toggle');
  const indexToggle = document.getElementById('index-toggle');
  const indexPanel = document.getElementById('site-index');
  const cover = document.getElementById('editorial');
  const reveal = document.getElementById('revelation');
  const scrollLabel = document.getElementById('scroll-label');
  const phaseLabel = document.getElementById('sequence-count');
  const indicator = document.querySelector('.progress span');
  const sky = document.querySelector('.sky-layer');
  const shadow = document.querySelector('.sculpture-shadow');
  const record = document.getElementById('record-window');
  const errorNotice = document.getElementById('error-notice');
  const clamp = (a, min=0, max=1) => Math.min(max,Math.max(min,a));
  const ease = (a,b,x) => { const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };
  indexToggle.addEventListener('click', () => {
    const open = indexToggle.getAttribute('aria-expanded') !== 'true';
    indexToggle.setAttribute('aria-expanded',String(open));
    indexToggle.setAttribute('aria-label',open?'Close index':'Open index');
    indexPanel.hidden = !open;
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && !indexPanel.hidden){indexPanel.hidden=true;indexToggle.setAttribute('aria-expanded','false');indexToggle.focus();}
  });
  document.addEventListener('pointerdown',e => {
    if (!indexPanel.hidden && !indexPanel.contains(e.target) && !indexToggle.contains(e.target)) {
      indexPanel.hidden=true;indexToggle.setAttribute('aria-expanded','false');
    }
  });

  function readScroll() {
    const rect = sequence.getBoundingClientRect();
    target = clamp(-rect.top / Math.max(1,sequence.offsetHeight-innerHeight));
    // reduced-motion preserves the information hierarchy without camera passage.
    if(reduce.matches) current = target;
    start();
  }
  let target=0,current=0,lastTime=0,clock=0,motionPaused=reduce.matches,frame=0,visible=true;
  function updateDom(p){
    // Three choreographed visual states rather than one enlarging chrome surface.
    const leave=ease(.08,.38,p);
    const revealIn=ease(.30,.49,p), revealOut=ease(.63,.77,p);
    const journalIn=ease(.72,.94,p);
    cover.style.opacity=String(1-leave);
    cover.style.visibility=leave>.997?'hidden':'visible';
    cover.setAttribute('aria-hidden',String(leave>.99));
    const revealOpacity=revealIn*(1-revealOut);
    reveal.style.opacity=String(revealOpacity);
    reveal.style.transform=`translateY(${(1-revealIn)*26-revealOut*15}px)`;
    reveal.setAttribute('aria-hidden',String(revealOpacity<.7));
    // A real labelled journal still emerges from the space between two wings.
    record.style.opacity=String(journalIn);
    record.style.transform=`translate3d(-50%,${(1-journalIn)*44}px,0) scale(${.90+.1*journalIn})`;
    const recordActive=journalIn>.95;
    record.style.pointerEvents=recordActive?'auto':'none';
    record.tabIndex=recordActive?0:-1;
    record.setAttribute('aria-hidden',String(!recordActive));
    artwork.style.opacity=String(1-ease(.71,.97,p)*.94);
    const shift=ease(.12,.93,p);
    sky.style.filter=`saturate(${1+shift*.08}) hue-rotate(${shift*-5}deg)`;
    sky.style.transform=`scale(${1+shift*.025}) translateX(${-shift*.7}%)`;
    shadow.style.opacity=String((.52-shift*.35)*(1-journalIn));
    indicator.style.width=(100*p).toFixed(1)+'%';
    phaseLabel.textContent=p>.77?'03':p>.3?'02':'01';
    scrollLabel.textContent=p>.83?'THE JOURNAL OPENS':p>.3?'FOLLOW THE FOLD':'SCROLL TO UNFOLD';
    stage.dataset.progress=p.toFixed(4);
  }
  let gl;
  try { gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,premultipliedAlpha:false,powerPreference:'high-performance'}); }
  catch(e) { gl=null; }
  function startFallback(){
    errorNotice.hidden=true;
    pauseButton.hidden=true;
    const updateFallback = () => {
      const bounds = sequence.getBoundingClientRect();
      target = clamp(-bounds.top / Math.max(1,sequence.offsetHeight-innerHeight));
      current = target;
      updateDom(current);
    };
    window.addEventListener('scroll', updateFallback, {passive:true});
    window.addEventListener('resize', updateFallback, {passive:true});
    updateFallback();
  }
  const glIsReady=!!gl;
  if(!glIsReady){
    startFallback();
    return;
  }

  const vertexSource=`#version 300 es
  precision highp float;
  layout(location=0) in vec3 aPos;
  layout(location=1) in vec3 aNormal;
  layout(location=2) in vec2 aUv;
  uniform vec3 uEye,uRight,uUp,uForward;
  uniform float uFocal,uAspect;
  out vec3 vWorld,vNormal,vEye; out vec2 vUv;
  void main(){
    vec3 rel=aPos-uEye;
    float z=max(.05,dot(rel,uForward));
    gl_Position=vec4(dot(rel,uRight)*uFocal/uAspect,dot(rel,uUp)*uFocal,((80.1/79.9)*z-(16.0/79.9)),z);
    vWorld=aPos;
    vNormal=aNormal;
    vEye=uEye;
    vUv=aUv;
  }`;
  const fragmentSource=`#version 300 es
  precision highp float;
  in vec3 vWorld,vNormal,vEye;in vec2 vUv;
  uniform float uMat,uTime,uOpen;
  out vec4 fragColor;
  float g(float x,float m,float s){float k=(x-m)/s;return exp(-k*k);}
  vec3 studio(vec3 r) {
    float sky=smoothstep(-.75,.95,r.y);
    vec3 c=mix(vec3(.14,.19,.23),vec3(.73,.78,.82),sky);
    c+=vec3(1.30,1.27,1.20)*g(r.x,-.65,.18)*(.4+.6*g(r.y,.22,.8));
    c+=vec3(1.50,1.17,.96)*g(r.x,.55,.13)*(.5+.5*g(r.y,.15,.78));
    c+=vec3(.53,.77,.98)*g(r.x,.9,.23)*(.6+.4*g(r.y,-.38,.85));
    c+=vec3(.82,.88,.98)*g(r.y,.84,.14)*.25;
    c*=1.-g(r.x,-.23,.078)*.79;
    c*=1.-g(r.x,.15,.055)*.48;
    return c;
  }
  void main(){
    vec3 n=normalize(vNormal);
    if(!gl_FrontFacing)n=-n;
    vec3 v=normalize(vEye-vWorld),r=reflect(-v,n);
    float fres=pow(1.-max(0.,dot(n,v)),4.);
    vec3 env=studio(r+vec3(sin(uTime*.18)*.007,0.,0.));
    float edge=smoothstep(.83,.998,abs(vUv.x-.5)*2.);
    float ystripe=sin(vUv.y*975.+vUv.x*21.)*.5+.5;
    float brushed=(ystripe-.5)*.026;
    vec3 col;
    if(uMat<.5){
      col=mix(vec3(.22,.25,.27),env*.88, .86);
      col=col*.91+vec3(.18,.17,.15);
      col+=vec3(.09,.10,.105)*fres+brushed;
      col+=edge*vec3(.36,.36,.34);
    }else if(uMat<1.5){
      col=env*1.07+vec3(.065,.06,.05)+vec3(.29,.31,.33)*fres;
      col+=edge*vec3(.62,.61,.56);
      col+=brushed*.47;
    }else{
      vec3 base=mix(vec3(.68,.80,.84),vec3(.96,.88,.82),smoothstep(-.65,.7,r.x));
      float sheen=g(r.x,.11,.27)+.6*g(r.y,.78,.28);
      col=base*.75+env*.22+sheen*vec3(.21,.21,.20);
      col+=fres*vec3(.36,.39,.42);
      // Pale thin-film traces reveal the material's layered edge.
      col+=vec3(.16,.21,.24)*edge*.28;
    }
    col=col/(col+vec3(.74));
    col=pow(clamp(col,0.,1.),vec3(.82));
    float opacity=uMat<1.5?1.0:mix(.29,.64,smoothstep(.1,.8,uOpen));
    fragColor=vec4(col,opacity);
  }`;
  const shader=(type,source)=>{
    const s=gl.createShader(type); gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
    return s;
  };
  let program;
  try {
    program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexSource));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragmentSource));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  } catch(err) {
    console.error('MEMORY ALLOY shader error:',err);
    startFallback();
    return;
  }
  const uniforms={};
  for (const name of ['uEye','uRight','uUp','uForward','uFocal','uAspect','uMat','uTime','uOpen']) uniforms[name]=gl.getUniformLocation(program,name);
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.CULL_FACE);
  const cols=35,rows=102,triangles=[];
  for(let j=0;j<rows;j++) for(let i=0;i<cols;i++){
    const a=j*(cols+1)+i,b=a+cols+1;
    triangles.push(a,b,a+1,a+1,b,b+1);
  }
  const indices=new Uint16Array(triangles);
  function createSurface(type,index=0){
    const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,(cols+1)*(rows+1)*8*4,gl.DYNAMIC_DRAW);
    const stride=8*4;
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,stride,0);
    gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,stride,3*4);
    gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,stride,6*4);
    const ibo=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    const vertices=new Float32Array((cols+1)*(rows+1)*8);
    return {type,index,vao,buffer,vertices,mat:type==='outer'?0:type==='wing'?1:2};
  }
  const surfaces=[createSurface('film',2),createSurface('film',1),createSurface('film',0),createSurface('outer'),createSurface('wing')];
  const N=cols+1;
  const V=rows+1;
  const norm=(v)=>Math.sqrt(v.reduce((a,x)=>a+x*x,0))||1;
  const normalized=(v)=>v.map(x=>x/norm(v));
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  // Independent sheets with stable topology: one central folded folio, an
  // overlapping wing which opens, and three staggered light-transmitting films.
  function surfacePoint(type,k,u,t,p){
    const v=t*2-1;
    const xscale=(.12+Math.pow(Math.max(0,Math.sin(Math.PI*t)),.55)*.9);
    const open=ease(.22,.73,p);
    const drift=ease(.46,1,p);
    if(type==='outer'){
      const width=xscale*(.84+.06*Math.sin(t*7));
      const center=.34+.23*Math.sin(2.8*t-.8)+.25*v;
      const x=center+u*width;
      const y=2.22-t*4.48+.1*Math.sin(u*2.8+t*4.6);
      const z=-.22+.44*Math.sin((u+.45*t)*2.8)+.22*u*u+.15*v+.13*Math.sin(t*8+u*2);
      return [x+.08*Math.sin(t*3)-open*.96,y+open*.13*v,z-open*.44];
    }
    if(type==='wing'){
      const width=xscale*(.64+.17*Math.sin(t*4));
      const local=u*width;
      const center=.06+.22*Math.sin(t*3+.9)-.10*v;
      // A turning fold anchored along its right-hand spine.
      const a=.11+open*1.42;
      const pivot=center+width*.76;
      const xx=center+local;
      const x=pivot+(xx-pivot)*Math.cos(a)+open*1.18;
      const z=.61+.36*Math.cos(u*2.7+t*6.2)+.52*(xx-pivot)*Math.sin(a)+open*.26;
      const y=1.98-t*4.08+.11*Math.sin(t*5+u*.7)+.14*open*(.5-u);
      return [x,y,z];
    }
    const layer=k,spread=layer-1;
    const width=xscale*(.52+.07*Math.cos(t*8+layer))*(.9+.15*open);
    const center=.21+.12*Math.sin(t*4+layer*.36)-.15*v+.48*spread*open;
    const x=center+u*width+.07*Math.cos(4*t);
    const y=1.72-t*3.58+.08*Math.sin(t*5+layer)+.07*open*spread;
    const z=-.15-layer*.22+.11*Math.sin(u*3.2+t*5)+open*(.19+layer*.12)-drift*.25;
    return [x,y,z];
  }
  const addToVertex=(dst,k,pos,n,uv)=>{const a=k*8;dst[a]=pos[0];dst[a+1]=pos[1];dst[a+2]=pos[2];dst[a+3]=n[0];dst[a+4]=n[1];dst[a+5]=n[2];dst[a+6]=uv[0];dst[a+7]=uv[1];};
  let lastUpdated=-9;
  function updateGeometry(p){
    if(Math.abs(p-lastUpdated)<.0012) return;
    lastUpdated=p;
    for(const s of surfaces){
      const positions=new Float32Array(N*V*3);
      for(let j=0;j<V;j++)for(let i=0;i<N;i++){
        const v=j/rows,u=i/cols*2-1,pt=surfacePoint(s.type,s.index,u,v,p),a=(j*N+i)*3;
        positions[a]=pt[0];positions[a+1]=pt[1];positions[a+2]=pt[2];
      }
      const at=(i,j)=>{const a=(Math.max(0,Math.min(rows,j))*N+Math.max(0,Math.min(cols,i)))*3;return [positions[a],positions[a+1],positions[a+2]];};
      for(let j=0;j<V;j++)for(let i=0;i<N;i++){
        const tangentU=sub(at(i+1,j),at(i-1,j)),tangentV=sub(at(i,j+1),at(i,j-1));
        const n=normalized(cross(tangentU,tangentV));
        addToVertex(s.vertices,j*N+i,at(i,j),n,[i/cols,j/rows]);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER,s.buffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,s.vertices);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,null);
  }
  let aspect=1,physicalW=0,physicalH=0;
  function resize(){
    const w=stage.clientWidth,h=stage.clientHeight;
    aspect=w/h;
    // Conservative on purpose. Visible sharp DOM type is never rasterized by WebGL.
    const pixelRatio=Math.min(devicePixelRatio||1,w<650?1.55:1.75,Math.sqrt(2_800_000/(w*h)));
    physicalW=Math.round(w*pixelRatio);physicalH=Math.round(h*pixelRatio);
    if(canvas.width!==physicalW||canvas.height!==physicalH){canvas.width=physicalW;canvas.height=physicalH;}
    gl.viewport(0,0,physicalW,physicalH);start();
  }
  const camera=(p)=>{
    const move=ease(.16,.69,p),settle=ease(.72,.94,p);
    const isPortrait=aspect<.8;
    // Keep the entire unfolding sculpture in frame on portrait iPhone.
    // The previous dolly to z≈4.5 enlarged the surface beyond the viewport.
    const eye=isPortrait
      ? [0.05+move*.36,.13+move*.22,10.85-move*.73+settle*.75]
      : [-.1+move*1.04,.04+move*.32,8.6-move*.85+settle*.55];
    const target=isPortrait
      ? [ -.12+move*.24, .01+move*.12, 0]
      : [ .2+move*.36, move*.12, 0];
    const forward=normalized(sub(target,eye));
    const right=normalized(cross(forward,[0,1,0]));
    const up=normalized(cross(right,forward));
    return {eye,right,up,forward};
  };
  function draw(p){
    if(!visible||document.hidden)return;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    const cam=camera(reduce.matches?Math.min(.42,p):p);
    gl.uniform3fv(uniforms.uEye,new Float32Array(cam.eye));
    gl.uniform3fv(uniforms.uRight,new Float32Array(cam.right));
    gl.uniform3fv(uniforms.uUp,new Float32Array(cam.up));
    gl.uniform3fv(uniforms.uForward,new Float32Array(cam.forward));
    gl.uniform1f(uniforms.uFocal,1/Math.tan((35*Math.PI/180)/2));
    gl.uniform1f(uniforms.uAspect,aspect);
    gl.uniform1f(uniforms.uTime,clock);
    gl.uniform1f(uniforms.uOpen,p);
    updateGeometry(reduce.matches?Math.min(.57,p):p);
    // Semi-transparent film volumes behind the individually shading metal sheets.
    gl.depthMask(false);
    for(const s of surfaces.filter(s=>s.type==='film')){ gl.uniform1f(uniforms.uMat,s.mat);gl.bindVertexArray(s.vao);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0); }
    gl.depthMask(true);
    for(const s of surfaces.filter(s=>s.type!=='film')){ gl.uniform1f(uniforms.uMat,s.mat);gl.bindVertexArray(s.vao);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0); }
    gl.bindVertexArray(null);
  }
  const needMotion=()=>!motionPaused&&!reduce.matches;
  function loop(now){
    frame=0;
    const dt=Math.min(.065,(now-(lastTime||now))/1000);
    lastTime=now;
    if(needMotion()) clock+=dt;
    const next=reduce.matches?target:current+(target-current)*(1-Math.exp(-dt*9));
    current=(Math.abs(target-next)<.0002)?target:next;
    updateDom(current);
    draw(current);
    if(Math.abs(current-target)>.0003||(needMotion()&&visible&&!document.hidden))start();
  }
  function start(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(loop);}
  function lost(e){e.preventDefault();visible=false;artwork.classList.remove('ready');errorNotice.hidden=false;}
  function recovered(){window.location.reload();}
  canvas.addEventListener('webglcontextlost',lost);
  canvas.addEventListener('webglcontextrestored',recovered);
  pauseButton.addEventListener('click',()=>{
    motionPaused=!motionPaused;
    pauseButton.textContent=motionPaused?'▷':'Ⅱ';
    pauseButton.setAttribute('aria-pressed',String(motionPaused));
    pauseButton.setAttribute('aria-label',motionPaused?'Play sculpture movement':'Pause sculpture movement');
    start();
  });
  window.addEventListener('scroll',readScroll,{passive:true});
  window.addEventListener('resize',()=>{resize();readScroll();},{passive:true});
  reduce.addEventListener('change',()=>{motionPaused=reduce.matches;start();});
  document.addEventListener('visibilitychange',start);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();}, {threshold:0,rootMargin:'100px'});
  observer.observe(stage);
  resize();readScroll();
  artwork.classList.add('ready');
  start();
})();