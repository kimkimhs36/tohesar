/* TOHEŞAR main homepage / a suspended Cedilla. Local Three.js, original contour.
   Sculptural presence only: the full sculpture room and WORLD are separate works. */
import * as THREE from 'three';
import { CEDILLA_POINTS } from '../../next-generation/cedilla-shape.js';
const stage = document.querySelector('#home-stage');
const canvas = document.querySelector('#home-canvas');
const toggle = document.querySelector('#motion-toggle');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const resources = new Set();
const keep = resource => { resources.add(resource); return resource; };
let renderer;
function sculptureGeometry() {
  const points = CEDILLA_POINTS.map(([x, y]) => new THREE.Vector2(x, y));
  const n = points.length, bevel = .037, halfDepth = .158;
  const edges = points.map((p, i) => {
    const d = points[(i + 1) % n].clone().sub(p).normalize();
    return new THREE.Vector2(d.y, -d.x);
  });
  const bisectors = points.map((_, i) => {
    const a = edges[(i + n - 1) % n], b = edges[i];
    return a.clone().add(b).divideScalar(Math.max(.2, 1 + a.dot(b)));
  });
  const inset = distance => points.map((p, i) => p.clone().addScaledVector(bisectors[i], -distance));
  const positions = [], normals = [], uvs = [];
  const push = (p, normal, uv) => { positions.push(...p); normals.push(...normal); uvs.push(...uv); };
  const face = inset(bevel);
  const triangles = THREE.ShapeUtils.triangulateShape(face, []);
  // Precision-planar faces. The studio flags and actual perspective supply
  // gradients in the metal; the source surface is never artificially warped.
  for (const sign of [1, -1]) {
    for (const tri of triangles) {
      for (const index of sign > 0 ? tri : [...tri].reverse()) {
        const p = face[index];
        push([p.x, p.y, halfDepth * sign], [0, 0, sign], [(p.x + 1.61) / 3.22, (p.y + 1.43) / 2.86]);
      }
    }
  }
  const faceCount = positions.length / 3;
  const rings = [];
  for (let i = 0; i <= 9; i++) {
    const a = i / 9 * Math.PI / 2;
    rings.push({ points: inset(bevel * (1 - Math.sin(a))), z: halfDepth - bevel * (1 - Math.cos(a)), radial: Math.sin(a), axial: Math.cos(a) });
  }
  rings.push({ points, z: -halfDepth + bevel, radial: 1, axial: 0 });
  for (let i = 8; i >= 0; i--) {
    const a = i / 9 * Math.PI / 2;
    rings.push({ points: inset(bevel * (1 - Math.sin(a))), z: -halfDepth + bevel * (1 - Math.cos(a)), radial: Math.sin(a), axial: -Math.cos(a) });
  }
  for (let ring = 0; ring < rings.length - 1; ring++) {
    const a = rings[ring], b = rings[ring + 1];
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      function normal(index, r) {
        const previous = edges[(index + n - 1) % n];
        const smooth = previous.dot(edges[index]) > .86;
        const edge = smooth ? bisectors[index].clone().normalize() : edges[i];
        return [edge.x * r.radial, edge.y * r.radial, r.axial];
      }
      const nodes = [[a, i], [b, next], [a, next], [a, i], [b, i], [b, next]];
      for (const [r, index] of nodes) {
        const p = r.points[index];
        push([p.x, p.y, r.z], normal(index, r), [(p.x + 1.61) / 3.22, (p.y + 1.43) / 2.86]);
      }
    }
  }
  const geometry = keep(new THREE.BufferGeometry());
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.addGroup(0, faceCount, 0);
  geometry.addGroup(faceCount, positions.length / 3 - faceCount, 1);
  geometry.computeBoundingSphere();
  return geometry;
}

function studioEnvironment() {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color('#989b96');
  const objects = [];
  const card = (position, width, height, color) => {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position); mesh.lookAt(0, 0, 0);
    studio.add(mesh); objects.push(mesh);
  };
  card([-4, 2, 5], 2.8, 8, new THREE.Color(2.4, 2.25, 2.0));
  card([3.7, 1, 4], .85, 8, new THREE.Color(2.3, 2.6, 3.1));
  card([.2, 1, 5.5], 1.0, 8, new THREE.Color(.018, .025, .026));
  card([-1.8, .6, 5.8], .55, 8, new THREE.Color(.055, .065, .07));
  card([0, 6, 0], 8, 5, new THREE.Color(2.2, 2.1, 1.85));
  card([4, 0, -3], 3, 6, new THREE.Color(.2, .3, .5));
  card([0, -4, 0], 10, 10, new THREE.Color(.22, .19, .15));
  card([-5, 0, -1], 2, 7, new THREE.Color(.12, .12, .11));
  const generator = new THREE.PMREMGenerator(renderer);
  generator.compileCubemapShader();
  const result = generator.fromScene(studio, .025, .1, 50);
  objects.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); });
  generator.dispose();
  return result;
}


try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 50);
  camera.position.set(0, 0, 7.3);
  const environment = studioEnvironment();
  scene.environment = environment.texture;
  // Reflection cards are evaluated in view space for a continuous, high-contrast
  // chrome finish across the original planar face and its curved bevel.
  const chrome = (edge = false) => keep(new THREE.ShaderMaterial({
    uniforms: { edgeFinish: { value: edge ? 1 : 0 } },
    vertexShader: `varying vec3 vNormal; varying vec3 vPosition;
      void main(){vec4 p=modelViewMatrix*vec4(position,1.);vPosition=p.xyz;
      vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*p;}`,
    fragmentShader: `precision highp float; varying vec3 vNormal; varying vec3 vPosition;
      uniform float edgeFinish;
      float band(float x,float center,float width){return exp(-pow((x-center)/width,2.));}
      void main(){vec3 n=normalize(vNormal);vec3 eye=normalize(-vPosition);
      vec3 r=reflect(-eye,n);float fresnel=pow(1.-max(0.,dot(n,eye)),3.);
      float skylight=smoothstep(-.35,.65,r.y);
      float window=band(r.x,-.69,.14);
      float ribbon=band(r.x,-.37,.028);
      float dark=band(r.x,-.47,.085);
      float secondary=band(r.x,.48,.15);
      vec3 col=mix(vec3(.12,.14,.15),vec3(.72,.76,.79),skylight);
      col+=vec3(.87,.85,.79)*window*.9;
      col+=vec3(.95,.96,1.)*ribbon*.9;
      col+=vec3(.7,.76,.86)*secondary*.7;
      col*=1.-dark*.86;
      col+=vec3(.76,.61,.45)*band(r.y,-.4,.18)*.22;
      col+=vec3(.79,.84,.88)*fresnel*.55;
      col+=edgeFinish*vec3(.04);
      gl_FragColor=vec4(pow(clamp(col,0.,1.),vec3(.85)),1.);}`
  }));
  const face = chrome(); const edge = chrome(true);
  const sculpture = new THREE.Mesh(sculptureGeometry(), [face, edge]);
  sculpture.rotation.set(.13, -.45, -.28);
  sculpture.position.set(.15, .22, 0);
  scene.add(sculpture);
  scene.add(new THREE.HemisphereLight(0xf6eee0, 0x767c83, 2));
  const key = new THREE.DirectionalLight(0xffffff, 3);
  key.position.set(-3, 5, 4); scene.add(key);
  let paused = motionQuery.matches, visible = true, raf = 0, time = 0, last = 0;
  let pointer = {x: 0, y: 0}, current = {x: 0, y: 0}, scroll = 0;
  const shadow = stage.querySelector('.object-shadow');
  const updateButton = () => { toggle.textContent = paused ? '▷' : 'Ⅱ'; toggle.setAttribute('aria-pressed', String(paused)); toggle.setAttribute('aria-label', paused ? 'Play sculpture motion' : 'Pause sculpture motion'); };
  function resize() {
    const {width, height} = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 600 ? 7.8 : 7.3;
    camera.updateProjectionMatrix();
    render(performance.now());
  }
  function render(now) {
    if (raf) cancelAnimationFrame(raf); raf = 0;
    const dt = Math.min((now - (last || now)) / 1000, .05); last = now;
    if (!paused) time += dt;
    const animate = !paused && !motionQuery.matches;
    current.x += ((animate ? pointer.x : 0) - current.x) * .045;
    current.y += ((animate ? pointer.y : 0) - current.y) * .045;
    sculpture.rotation.y = -.45 + Math.sin(time * .28) * .22 + current.x * .3;
    sculpture.rotation.x = .13 + Math.sin(time * .22) * .08 + current.y * .15;
    sculpture.rotation.z = -.28 + Math.sin(time * .21) * .04 + (animate ? scroll * .12 : 0);
    sculpture.position.y = .22 + Math.sin(time * .65) * .07;
    shadow.style.opacity = String(.12 + Math.sin(time * .65) * .015);
    renderer.render(scene, camera);
    if (visible && !document.hidden && animate) raf = requestAnimationFrame(render);
  }
  function resume() { last = 0; if (visible && !document.hidden) render(performance.now()); else { cancelAnimationFrame(raf); raf = 0; } }
  document.querySelector('.opening').addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || paused) return; const r = stage.getBoundingClientRect(); pointer.x = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)); pointer.y = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1)); }, {passive: true});
  document.querySelector('.opening').addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });
  window.addEventListener('scroll', () => { scroll = Math.min(1, scrollY / innerHeight); }, {passive: true});
  toggle.addEventListener('click', () => { paused = !paused; updateButton(); resume(); });
  motionQuery.addEventListener('change', () => { paused = motionQuery.matches; updateButton(); resume(); });
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); }, {rootMargin: '100px'}).observe(stage);
  document.addEventListener('visibilitychange', resume);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); visible = false; cancelAnimationFrame(raf); stage.classList.remove('ready'); toggle.hidden = true; });
  canvas.addEventListener('webglcontextrestored', () => { stage.classList.remove('ready'); });
  updateButton(); resize(); stage.classList.add('ready');
} catch (error) {
  // The original vector silhouette keeps the composition intact without WebGL.
  console.warn('Homepage sculpture unavailable:', error.message);
  toggle.hidden = true;
}
