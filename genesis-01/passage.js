import * as THREE from 'three';

// TOHEŞAR / THE INNER PASSAGE
// The raised shut-line of the titanium opening continues through space as
// two finely drawn, reflective returns. Their separation grows with depth.
// Not a decorative tunnel of hoops, particles or randomly displaced plastic.
// Authored 27–40% to connect sculpture → seven archival fragments.
const smooth=(a,b,p)=>{
 const x=THREE.MathUtils.clamp((p-a)/(b-a),0,1);
 return x*x*(3-2*x);
};
const points=(side)=>{
 const positions=[];
 for(let i=0;i<=36;i++){
  const t=i/36;
  positions.push(new THREE.Vector3(
   side*(.62+1.31*Math.pow(t,.82)+.075*Math.sin(Math.PI*t)),
   -.09+.24*t+.14*Math.sin(Math.PI*t),
   -.93-10.1*t
  ));
 }
 return positions;
};
function returnSurface(side){
 const pos=[],uv=[],indices=[];
 const center=points(side);
 // A 5–9 cm folded return with an independent surface normal.
 // All vertices are deterministic. No procedural noise, displacement maps
 // or extra photo content are introduced.
 for(let i=0;i<center.length;i++){
  const t=i/(center.length-1);
  const p=center[i];
  const w=.05+.04*Math.sin(Math.PI*t);
  pos.push(p.x,p.y-w,p.z,p.x+side*(.014+.017*t),p.y+w,p.z-.065);
  uv.push(0,t,1,t);
  if(i<center.length-1){
   const a=i*2,b=a+2;
   if(side<0)indices.push(a,b,a+1,b,b+1,a+1);
   else indices.push(a,a+1,b,a+1,b+1,b);
  }
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(indices);
 g.computeVertexNormals();
 return g;
}
export function createSlitPassage(scene){
 const root=new THREE.Group();scene.add(root);
 const metal=new THREE.MeshStandardMaterial({
  color:0xbfcdd0,metalness:.93,roughness:.26,
  transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false
 });
 const cool=new THREE.MeshBasicMaterial({
  color:0xc6e2e4,transparent:true,opacity:0,
  depthWrite:false,toneMapped:false
 });
 const warm=new THREE.MeshBasicMaterial({
  color:0xf2ded0,transparent:true,opacity:0,
  depthWrite:false,toneMapped:false
 });
 const sideParts=[];
 for(const side of [-1,1]){
  const mesh=new THREE.Mesh(returnSurface(side),metal);
  root.add(mesh);
  const source=points(side);
  // Two controlled continuous contour highlights define the whole space.
  const curve=new THREE.CatmullRomCurve3(source);
  const tube=new THREE.Mesh(
   new THREE.TubeGeometry(curve,72,.006,4,false),
   side<0?cool:warm
  );
  tube.position.set(side*.015,.038,0);
  root.add(tube);
  sideParts.push({mesh,tube});
 }
 const label=document.createElement('div');
 label.className='passage-index';
 label.setAttribute('aria-hidden','true');
 label.hidden=true;
 label.innerHTML='<span>INSIDE THE MEMORY</span><span>YOKOHAMA / 001 &nbsp; — &nbsp; VISUAL FICTION</span>';
 document.querySelector('main').append(label);
 const state={presence:0,progress:0};
 function update(p,anchor){
  const entry=smooth(.265,.306,p);
  const exit=1-smooth(.365,.413,p);
  const presence=entry*exit;
  state.presence=presence;state.progress=p;
  root.visible=presence>.003;
  // All passage objects are aligned with the slit, the camera and the
  // archival tiles in world space; no sudden fullscreen scenery swap.
  if(root.visible){
   root.position.set(anchor.x,anchor.y,0);
   metal.opacity=.46*presence;
   cool.opacity=.38*presence;
   warm.opacity=.33*presence;
  }
  const textAlpha=smooth(.302,.328,p)*(1-smooth(.369,.402,p));
  label.hidden=textAlpha<.008;
  if(!label.hidden)label.style.opacity=textAlpha.toFixed(4);
 }
 return {update,state};
}
