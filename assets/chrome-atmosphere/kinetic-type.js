/* KINETIC TYPE / sculpted letters, not a flat text animation.
   Glyph outlines are generated from the site's existing, OFL-licensed Instrument Serif.
   The outlines become real beveled, extruded Three.js meshes. */
export function createKineticType(THREE, scene, environment) {
  const first = new THREE.Group();
  const second = new THREE.Group();
  const shared = new THREE.MeshPhysicalMaterial({
    color: 0xdbe3e7, metalness: 1, roughness: 0.12, clearcoat: 1,
    clearcoatRoughness: 0.06, envMapIntensity: 1.55, envMap: environment,
    side: THREE.DoubleSide
  });
  const warm = shared.clone();
  warm.color.set(0xe4d4c5);
  warm.roughness = 0.16;
  scene.add(first, second);
  let ready = false, widthOne = 1, widthTwo = 1, aspect = 1, viewH = 1;
  let viewport = {w: 1, h: 1};

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { update(){}, resize(){}, get ready(){return false} };
  const SAMPLE = 2;
  const FONT = 240;
  const HEIGHT = 320;

  function area(points) {
    let sum = 0;
    for (let i=0; i<points.length; i++) {
      const p=points[i], n=points[(i+1)%points.length];
      sum += p[0]*n[1]-n[0]*p[1];
    }
    return sum*.5;
  }
  function contains(poly, p) {
    let inside=false;
    for (let i=0,j=poly.length-1;i<poly.length;j=i++) {
      const a=poly[i], b=poly[j];
      if ((a[1]>p[1]) !== (b[1]>p[1]) &&
          p[0] < (b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
    }
    return inside;
  }
  function simplify(poly) {
    // Drop the orthogonal staircase, preserving corners and the elegant serif shapes.
    let out=[];
    for (let i=0;i<poly.length;i++) {
      const a=poly[(i+poly.length-1)%poly.length], b=poly[i], c=poly[(i+1)%poly.length];
      if ((b[0]-a[0])*(c[1]-b[1]) === (b[1]-a[1])*(c[0]-b[0])) continue;
      out.push(b);
    }
    if (out.length<4) return out;
    const reduced=[];
    for (let i=0;i<out.length;i++) {
      const prev=out[(i+out.length-1)%out.length], at=out[i], next=out[(i+1)%out.length];
      const dx=next[0]-prev[0],dy=next[1]-prev[1];
      const err=Math.abs(dy*at[0]-dx*at[1]+next[0]*prev[1]-next[1]*prev[0])/
        (Math.hypot(dx,dy)||1);
      if (err>0.58 || Math.hypot(next[0]-prev[0],next[1]-prev[1])>9) reduced.push(at);
    }
    return reduced.length>=4?reduced:out;
  }
  function glyphGeometry(letter) {
    ctx.font = '400 '+FONT+'px "Instrument Serif", Georgia, serif';
    const advance = ctx.measureText(letter).width;
    canvas.width = Math.ceil(advance+42);
    canvas.height = HEIGHT;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#fff';
    ctx.font = '400 '+FONT+'px "Instrument Serif", Georgia, serif';
    ctx.textBaseline='alphabetic';
    ctx.fillText(letter,21,244);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const w=Math.ceil(canvas.width/SAMPLE),h=Math.ceil(HEIGHT/SAMPLE);
    const filled=new Uint8Array(w*h);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
      let n=0;
      for (let dy=0;dy<SAMPLE;dy++)for(let dx=0;dx<SAMPLE;dx++){
        const sx=Math.min(canvas.width-1,x*SAMPLE+dx), sy=Math.min(HEIGHT-1,y*SAMPLE+dy);
        n+=data[(sy*canvas.width+sx)*4+3];
      }
      filled[y*w+x]=n>110*SAMPLE*SAMPLE?1:0;
    }
    const isOn=(x,y)=>x>=0&&x<w&&y>=0&&y<h&&filled[y*w+x];
    const edges=new Map();
    const add=(ax,ay,bx,by)=>{
      const k=ax+','+ay, v=[bx,by];
      if(!edges.has(k))edges.set(k,[]);
      edges.get(k).push(v);
    };
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      if(!isOn(x,y))continue;
      if(!isOn(x,y-1))add(x,y,x+1,y);
      if(!isOn(x+1,y))add(x+1,y,x+1,y+1);
      if(!isOn(x,y+1))add(x+1,y+1,x,y+1);
      if(!isOn(x-1,y))add(x,y+1,x,y);
    }
    const contours=[];
    let remaining=[...edges.values()].reduce((n,e)=>n+e.length,0);
    while(remaining>0){
      const start=[...edges.keys()].find(k=>edges.get(k)?.length);
      if(!start)break;
      const startPair=start.split(',').map(Number);
      let p=startPair,poly=[],steps=0;
      while(steps++<5000){
        poly.push(p);
        const k=p.join(','),list=edges.get(k);
        if(!list?.length)break;
        p=list.pop();remaining--;
        if(p[0]===startPair[0]&&p[1]===startPair[1])break;
      }
      if(poly.length>=8) {
        const s=simplify(poly);
        if(s.length>=4&&Math.abs(area(s))>6)contours.push(s);
      }
    }
    const outer=contours.filter(p=>area(p)>0),holes=contours.filter(p=>area(p)<0);
    const shapes=[];
    const scale=.012;
    const points=(a)=>a.map(([x,y])=>new THREE.Vector2((x*SAMPLE-21)*scale,(244-y*SAMPLE)*scale));
    for(const line of outer){
      const outline=points(line).reverse();
      const shape=new THREE.Shape(outline);
      for(const hole of holes){
        if(contains(line,hole[0])){
          const holePoints=points(hole).reverse();
          shape.holes.push(new THREE.Path(holePoints));
        }
      }
      shapes.push(shape);
    }
    if(!shapes.length) return {geometry:null,advance:advance*.012};
    const geo=new THREE.ExtrudeGeometry(shapes,{
      depth:.24,steps:1,bevelEnabled:true,bevelSegments:3,curveSegments:4,
      bevelThickness:.032,bevelSize:.027,bevelOffset:0
    });
    geo.computeVertexNormals();
    return {geometry:geo,advance:advance*scale};
  }

  function word(text, group, mat) {
    let x=0, glyphs=[];
    for(let i=0;i<text.length;i++) {
      const {geometry,advance}=glyphGeometry(text[i]);
      if(geometry) {
        const mesh=new THREE.Mesh(geometry,mat);
        mesh.position.set(x,0,0);
        mesh.userData.origin=x;
        mesh.userData.index=i;
        mesh.castShadow=true;
        group.add(mesh);
        glyphs.push(mesh);
      }
      x+=advance*.91;
    }
    for (const m of glyphs) m.position.x-=x/2;
    return x;
  }

  document.fonts.load('400 240px "Instrument Serif"').then(()=>{
    widthOne=word('CHROME',first,shared);
    widthTwo=word('STATES',second,warm);
    ready=first.children.length>0;
    document.documentElement.classList.toggle('has-kinetic-type',ready);
    size(viewport.w,viewport.h);
  }).catch(()=>{});

  function size(w,h) {
    viewport={w,h};
    if(!ready||!h)return;
    aspect=w/h;
    // Camera is 35deg. Width is measured at the actual text depth.
    const d=w<650?12.4:(aspect<1.2?9.4:7.8);
    const visibleH=2*Math.tan(THREE.MathUtils.degToRad(35)/2)*d;
    const visibleW=visibleH*aspect;
    viewH=visibleH;
    const scale1=Math.min(1.75,(visibleW*(w<650?.93:.83))/widthOne);
    const scale2=Math.min(1.75,(visibleW*(w<650?.92:.75))/widthTwo);
    first.scale.setScalar(scale1);
    second.scale.setScalar(scale2);
  }

  // Scroll does not merely move the type: it changes each letter's geometry.
  // This produces a liquid sculptural distortion while the word is dismantled.
  function liquefy(mesh, amount, phase) {
    if (!mesh.geometry) return;
    if (Math.abs(amount - (mesh.userData.lastMelt ?? -1)) < 0.008) return;
    mesh.userData.lastMelt = amount;
    const attribute = mesh.geometry.attributes.position;
    const output = attribute.array;
    if (!mesh.userData.originalVertices) {
      mesh.userData.originalVertices = new Float32Array(output);
    }
    const original = mesh.userData.originalVertices;
    for (let i=0;i<output.length;i+=3) {
      const x=original[i], y=original[i+1], z=original[i+2];
      const ripple=Math.sin(y*2.8+phase*1.7)*Math.cos(x*1.5+phase);
      output[i]   = x + amount*(Math.sin(y*2.1+phase)*.26 + z*.33);
      output[i+1] = y + amount*(Math.sin(x*2.5+phase*.5)*.34 + ripple*.16);
      output[i+2] = z + amount*(Math.sin(x*3.1+y*1.1+phase)*.64);
    }
    attribute.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeBoundingSphere();
  }

  function update(p, t, dt, reducedMotion=false) {
    if(!ready)return;
    const clamp=(v)=>Math.max(0,Math.min(1,v));
    const ease=(v)=>{v=clamp(v);return v*v*(3-2*v)};
    const fracture=ease((p-.16)/.40);
    const reunion=ease((p-.48)/.36);
    const spread=fracture*(1-reunion);
    first.visible=p<.65;
    second.visible=p>.39;
    first.position.set(0,viewH*(aspect<.8?.285:.18)-.48,1.85);
    second.position.set(0,(aspect<.8?-.02:-.12)*viewH,1.8);
    first.rotation.set(-.04-fracture*.38,Math.sin(t*.22)*.075+fracture*.44,-.035);
    second.rotation.set(-.12+(1-reunion)*.55,.08+(1-reunion)*.8,.015);
    first.children.forEach((mesh,i)=>{
      const k=i-(first.children.length-1)/2;
      mesh.position.x=(mesh.userData.origin-widthOne/2)+k*spread*.48;
      mesh.position.y=spread*(Math.sin(i*2.37)*.9+k*.14)+Math.sin(t*.7+i)*.018;
      mesh.position.z=spread*(Math.cos(i*1.7)*2.0);
      mesh.rotation.x=spread*(i%2?1:-1)*.85;
      mesh.rotation.y=spread*(Math.sin(i*2.1))*1.7;
      mesh.rotation.z=spread*k*.27;
      const s=1-fracture*.28;
      mesh.scale.setScalar(s);
      liquefy(mesh, spread*.87, i*.9);
    });
    second.children.forEach((mesh,i)=>{
      const k=i-(second.children.length-1)/2;
      mesh.position.x=mesh.userData.origin-widthTwo/2+k*(1-reunion)*1.7;
      mesh.position.y=(1-reunion)*Math.cos(i*2.1)*2.6;
      mesh.position.z=(1-reunion)*Math.sin(i*1.45)*3.3;
      mesh.rotation.x=(1-reunion)*Math.PI*(i%2?1:-1)*.7;
      mesh.rotation.y=(1-reunion)*Math.PI*.95;
      mesh.rotation.z=(1-reunion)*k*.4;
      mesh.scale.setScalar(.25+.75*reunion);
      liquefy(mesh, (1-reunion)*.76, i*.75);
    });
    shared.roughness=.12+spread*.11;
    warm.roughness=.16+(1-reunion)*.06;
    if(reducedMotion) {
      first.rotation.set(0,0,0);
      second.rotation.set(0,0,0);
    }
  }
  return {update,resize:size,get ready(){return ready}};
}
