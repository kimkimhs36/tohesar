// Frame-rate-independent damped spring for scroll-driven cinematic poses.
// Natural frequency (omega) is in radians per second; damping 1 is critically
// damped. Smaller damping adds restrained physical follow-through.
export function stepSpring(position, velocity, target, seconds, omega=14, damping=1) {
  const dt=Math.max(0,Math.min(seconds,0.1));
  if(!Number.isFinite(dt)||!Number.isFinite(position)||!Number.isFinite(velocity)||!Number.isFinite(target)) {
    return {position:target,velocity:0};
  }
  if(dt===0)return {position,velocity};
  const x=position-target;
  let displacement, nextVelocity;
  if(damping>=1) {
    // Exact critical-damping solution: independent of FPS, no timer-based lerp.
    const e=Math.exp(-omega*dt);
    const j=(velocity+omega*x)*dt;
    displacement=(x+j)*e;
    nextVelocity=(velocity-omega*j)*e;
  } else {
    // Exact underdamped solution: the atmosphere trails with a gentle rebound.
    const decay=damping*omega;
    const resonant=omega*Math.sqrt(Math.max(0.0001,1-damping*damping));
    const e=Math.exp(-decay*dt);
    const sin=Math.sin(resonant*dt),cos=Math.cos(resonant*dt);
    const carried=(velocity+decay*x)/resonant;
    displacement=e*(x*cos+carried*sin);
    nextVelocity=e*(velocity*cos-((decay*velocity+omega*omega*x)/resonant)*sin);
  }
  const next=target+displacement;
  // Snap the tiny last fractions to let the expensive WebGL loop sleep.
  if(Math.abs(next-target)<0.000014&&Math.abs(nextVelocity)<0.00022)
    return {position:target,velocity:0};
  return {position:next,velocity:nextVelocity};
}

export function openingAir(progress) {
  // The original first 12% of the scene held its object perfectly still.
  // Start the colored air responding from the *first scroll movement*.
  const p=Math.min(1,Math.max(0,progress/.105));
  return 1-Math.pow(1-p,3);
}
