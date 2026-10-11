import * as T from 'three';

// Original unbadged classic-coupe study. Dimensions in metres, nose at -Z.
// No downloaded car mesh and no claim of an exact manufacturer model.
export function makeVehicle(){
 const group=new T.Group();
 const paint=new T.MeshPhysicalMaterial({color:0x9da3aa,metalness:.86,roughness:.27,clearcoat:1,clearcoatRoughness:.19,envMapIntensity:.9});
 const glass=new T.MeshPhysicalMaterial({color:0x20313b,metalness:.62,roughness:.12,clearcoat:1,envMapIntensity:1.65});
 const rubber=new T.MeshStandardMaterial({color:0x101112,roughness:.88});
 const trim=new T.MeshStandardMaterial({color:0x1c2227,metalness:.72,roughness:.3});
 const chrome=new T.MeshStandardMaterial({color:0xb7bec3,metalness:1,roughness:.21});
 const red=new T.MeshStandardMaterial({color:0x63190d,emissive:0xae240b,emissiveIntensity:.13,roughness:.22,metalness:.3});
 function mesh(geo,mat,pos=[0,0,0],scale){const m=new T.Mesh(geo,mat);m.position.set(...pos);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
 function box(w,h,d,mat,pos){return mesh(new T.BoxGeometry(w,h,d),mat,pos);}
 function line(points,mat,r=.009){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),40,r,5,false),mat);}
 // Cross-sections provide compound hood / shoulder / deck curvature.
 const sections=[[-2.17,.53,.58],[-2.03,.81,.66],[-1.72,.88,.78],[-1.30,.90,.87],[-.92,.88,.89],[-.5,.86,.88],[0,.86,.87],[.55,.88,.90],[1.05,.94,.91],[1.5,.93,.85],[1.94,.84,.75],[2.14,.66,.63]];
 
 function sample(z,k){for(let i=0;i<sections.length-1;i++){if(z<=sections[i+1][0]){let t=(z-sections[i][0])/(sections[i+1][0]-sections[i][0]);t=t*t*(3-2*t);return T.MathUtils.lerp(sections[i][k],sections[i+1][k],t);}}return sections.at(-1)[k];}
 const positions=[],uv=[],indices=[];const nx=40,nz=100;
 for(let j=0;j<=nz;j++){let z=-2.17+j/nz*4.31;const w=sample(z,1),h=sample(z,2);for(let i=0;i<=nx;i++){let a=-Math.PI/2+i/nx*Math.PI;let x=Math.sin(a)*w;let shoulder=Math.pow(Math.max(Math.cos(a),0),.45);let fenders=(Math.exp(-(((z+1.30)/.52)**2))+Math.exp(-(((z-1.30)/.57)**2)))*.15*Math.pow(Math.abs(Math.sin(a)),4);let y=.35+(h-.35)*shoulder+fenders;positions.push(x,y,z);uv.push(i/nx,j/nz);}}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){let a=j*(nx+1)+i,b=a+nx+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const body=new T.BufferGeometry();body.setAttribute('position',new T.Float32BufferAttribute(positions,3));body.setAttribute('uv',new T.Float32BufferAttribute(uv,2));body.setIndex(indices);body.computeVertexNormals();mesh(body,paint);
 // Close the deck and nose with smoothly shaped valances. The original loft
 // is intentionally open below the sills, but must never expose the underbody.
 for(const [z,w,h] of [sections[0],sections.at(-1)]){
  const cap=new T.Shape();cap.moveTo(-w,.35);for(let i=0;i<=40;i++){let a=-Math.PI/2+i/40*Math.PI;cap.lineTo(Math.sin(a)*w,.35+(h-.35)*Math.pow(Math.max(Math.cos(a),0),.45));}cap.lineTo(w,.28);cap.quadraticCurveTo(0,.23,-w,.28);cap.closePath();
  const m=mesh(new T.ShapeGeometry(cap,30),paint,[0,0,z]);m.material=paint.clone();m.material.side=T.DoubleSide;
 }
 mesh(new T.SphereGeometry(1,48,24),paint,[0,.48,1.94],[.825,.22,.25]);
 mesh(new T.SphereGeometry(1,48,24),paint,[0,.45,-1.97],[.80,.17,.21]);
 box(1.42,.11,3.50,trim,[0,.30,0]);
 // Greenhouse loft, descending rear glass; framed side windows.
 const rows=[[-.85,.75,.9],[-.38,.63,1.24],[.05,.61,1.36],[.46,.62,1.27],[.87,.70,1.11],[1.28,.79,.88]];
 const gp=[],gu=[],gi=[];for(let j=0;j<rows.length;j++){let [z,w,h]=rows[j];for(let i=0;i<=24;i++){let x=(i/24*2-1)*w;gp.push(x,h-.11*Math.pow(x/w,2),z);gu.push(i/24,j/(rows.length-1));}}for(let j=0;j<rows.length-1;j++)for(let i=0;i<24;i++){let a=j*25+i,b=a+25;gi.push(a,b,a+1,b,b+1,a+1);}const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(gp,3));gg.setAttribute('uv',new T.Float32BufferAttribute(gu,2));gg.setIndex(gi);gg.computeVertexNormals();mesh(gg,glass);
 // Solid roof between front/rear glass, subtly double-curved.
 const roofGeo=new T.SphereGeometry(1,40,16,0,Math.PI*2,0,Math.PI*.43);mesh(roofGeo,paint,[0,1.235,.05],[.645,.14,.57]);
 for(const side of [-1,1]){
  const sidePoints=[[-.78,.88],[-.34,1.22],[.14,1.27],[.48,1.22],[1.15,.89]];
  const sp=[],si=[];for(let i=0;i<sidePoints.length;i++){const [z,y]=sidePoints[i];const x=side*(y>1.15?.63:.80);sp.push(x,y,z,side*.81,.82,z);if(i<sidePoints.length-1){let a=i*2;si.push(a,a+1,a+2,a+1,a+3,a+2);}}const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sp,3));sg.setIndex(si);sg.computeVertexNormals();let gm=glass.clone();gm.side=T.DoubleSide;mesh(sg,gm);
  line([[-.81,.87],[-.34,1.24],[.12,1.30],[.50,1.24],[1.19,.89]].map(([z,y])=>[side*(y>1.15?.65:.81),y,z]),chrome,.014);
  line([[side*.81,.86,-.80],[side*.81,.84,1.19]],chrome,.012);
  line([[side*.66,1.24,.44],[side*.82,.84,.57]],trim,.021);
  line([[side*.858,.79,-.64],[side*.87,.44,-.5],[side*.877,.41,.58],[side*.90,.78,.65]],trim,.006);
  box(.025,.025,.16,chrome,[side*.876,.78,.44]);
  mesh(new T.SphereGeometry(1,20,10),paint,[side*.94,.93,-.55],[.13,.066,.13]);
  line([[side*.79,.83,-.51],[side*.91,.9,-.55]],trim,.021);
 }
 for(const z of [-1.34,1.34])for(const side of [-1,1]){
  const x=side*.875;
  let tire=mesh(new T.TorusGeometry(.265,.105,16,64),rubber,[x,.37,z]);tire.rotation.y=Math.PI/2;
  let wall=mesh(new T.CylinderGeometry(.333,.333,.215,64),rubber,[x,.37,z]);wall.rotation.z=Math.PI/2;
  let rim=mesh(new T.CylinderGeometry(.239,.239,.223,48),chrome,[x,.37,z]);rim.rotation.z=Math.PI/2;
  let recess=mesh(new T.CylinderGeometry(.208,.208,.225,48),trim,[x+side*.006,.37,z]);recess.rotation.z=Math.PI/2;
  let disk=mesh(new T.CylinderGeometry(.179,.179,.228,40),new T.MeshStandardMaterial({color:0x73757a,metalness:.8,roughness:.5}),[x,.37,z]);disk.rotation.z=Math.PI/2;
  for(let j=0;j<5;j++){let a=j*Math.PI*2/5;let spoke=box(.037,.174,.052,chrome,[x+side*.123,.37+Math.cos(a)*.118,z+Math.sin(a)*.118]);spoke.rotation.x=a;let bolt=mesh(new T.SphereGeometry(.014,8,6),chrome,[x+side*.15,.37+Math.cos(a)*.047,z+Math.sin(a)*.047]);}
  let hub=mesh(new T.CylinderGeometry(.052,.052,.25,20),chrome,[x,.37,z]);hub.rotation.z=Math.PI/2;
  // Wheel-arch lip over tire, open toward the road.
  const points=[];for(let i=0;i<=28;i++){let a=i/28*Math.PI;points.push([side*.937,.37+Math.sin(a)*.395,z+Math.cos(a)*.395]);}line(points,paint,.035);
  const treadGeo=new T.TorusGeometry(.356,.006,4,64);for(let k=-1;k<=1;k++){let ring=mesh(treadGeo,trim,[x+k*.048,.37,z]);ring.rotation.y=Math.PI/2;}
 }
 // Restrained bumpers, lenses, rear engine grille and plate.
 box(1.56,.09,.12,trim,[0,.40,2.12]);box(1.61,.095,.10,trim,[0,.46,-2.04]);
 box(1.38,.065,.039,red,[0,.63,2.10]);box(.36,.115,.02,new T.MeshStandardMaterial({color:0xd5d1c2,roughness:.55}),[0,.43,2.20]);
 for(let i=0;i<11;i++)box(.73,.012,.022,trim,[0,.837-i*.005,1.2+i*.039]);
 const head=new T.MeshPhysicalMaterial({color:0xffedce,emissive:0xffc884,emissiveIntensity:.3,metalness:.35,roughness:.16,clearcoat:1});
 for(const side of [-1,1]){let housing=mesh(new T.SphereGeometry(1,24,16),chrome,[side*.65,.73,-1.85],[.18,.18,.115]);let lamp=mesh(new T.SphereGeometry(1,24,16),head,[side*.65,.739,-1.925],[.145,.146,.05]);lamp.rotation.x=-.15;box(.2,.038,.04,new T.MeshStandardMaterial({color:0xd39746,roughness:.2}),[side*.67,.47,-2.10]);}
 const exhaust=mesh(new T.CylinderGeometry(.045,.046,.19,16),chrome,[-.58,.25,2.1]);exhaust.rotation.x=Math.PI/2;
 // Subtle stationary warm running light imprint in wet pavement.
 const tailLight=new T.PointLight(0xff4321,.025,1.1);tailLight.position.set(0,.48,2.2);group.add(tailLight);
 group.userData.material=paint;return group;
}
