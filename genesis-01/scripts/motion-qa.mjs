import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stepSpring,openingAir} from '../motion.js';

function simulate(hz,omega,damping,duration,goal,start=0) {
 let position=start,velocity=0,max=-Infinity;
 const frames=Math.round(duration*hz);
 for(let i=0;i<frames;i++){
  const result=stepSpring(position,velocity,goal,1/hz,omega,damping);
  position=result.position;velocity=result.velocity;
  assert(Number.isFinite(position)&&Number.isFinite(velocity));
  max=Math.max(max,position);
 }
 return {position,velocity,max};
}
assert.equal(openingAir(0),0);
assert.equal(openingAir(.105),1);
assert.equal(openingAir(.3),1);
assert(openingAir(.01)>.2,'Background must respond from the very first 1%');
assert(openingAir(.05)>.8,'Halfway into opening the colors should visibly move');

for(const [omega,zeta] of [[17,1],[11,.8]]) {
 const low=simulate(30,omega,zeta,1.2,.48);
 const high=simulate(120,omega,zeta,1.2,.48);
 assert(Math.abs(low.position-high.position)<1e-7,'Spring must be frame-rate independent');
 assert(Math.abs(high.position-.48)<.0002,'Spring must settle in time');
 assert(high.max<=.48*1.04,'Atmosphere must not bounce out of control');
 const reverse=simulate(60,omega,zeta,1.2,0,.48);
 assert(Math.abs(reverse.position)<.0002,'Reverse scroll must settle');
}
let pos=0,vel=0,last=0;
for(let i=0;i<90;i++){
 const s=stepSpring(pos,vel,.1,1/60,17,1);
 assert(s.position>=last-1e-9,'Camera must not jerk backward during forward movement');
 last=pos=s.position;vel=s.velocity;
}
const source=readFileSync(new URL('../src.js',import.meta.url),'utf8');
assert(source.includes("stepSpring(progress,progressVelocity,target,dt,17,1)"));
assert(source.includes("stepSpring(airProgress,airVelocity,target,dt,11,.8)"));
assert(source.includes("22*awake")&&source.includes("-27*awake"));
assert(source.includes("revelation.update(p,camera,sculpture.position,mobile)"));
assert(source.includes("progress=airProgress=target"),'Deterministic visual QA poses must stay intact');
console.log('SOFT SCROLL PASS: instant color response, 30/120fps equivalence, elastic settle, reverse, 43% scene preserved');
