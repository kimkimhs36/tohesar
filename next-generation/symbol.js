/* TOHEŞAR / Se-diyu, an architectural object study.
 * Approved contour is preserved at every point. Bevels are cut inward;
 * nothing is added outside the established silhouette. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CEDILLA_POINTS } from './cedilla-shape.js';

const stage = document.querySelector('#sculpture-stage');
const canvas = document.querySelector('#sculpture-canvas');
const status = document.querySelector('#sculpture-status');
const sceneButtons = [...document.querySelectorAll('[data-sculpture-control]')];
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let renderer, environment, controls, frame = 0, transition = null;
let visible = true, lost = false, disposed = false;
const resources = new Set();
const keep = resource => { resources.add(resource); return resource; };

function fallback(message = 'The original form. A quiet study in silhouette.') {
  stage.dataset.state = 'fallback';
  stage.classList.remove('is-ready');
  stage.setAttribute('aria-busy', 'false');
  status.textContent = message;
  sceneButtons.forEach(button => button.disabled = true);
  cancelAnimationFrame(frame); frame = 0;
}

/* Smooth quarter-circle bevel, with an exact, unexpanded outer boundary.
 * At sharp corners normals stay crisp; sampled curves share their normals. */
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

/* Deterministic microtexture. Brushing is present at close range without
 * turning the surface into a decorative pattern or a glittering finish. */
function brushedTexture() {
  const width = 512, height = 512, data = new Uint8Array(width * height * 4);
  let seed = 74327;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let y = 0; y < height; y++) {
    const stroke = random() * 17;
    for (let x = 0; x < width; x++) {
      const v = 202 + stroke + random() * 9 + Math.sin(x * .063 + y * .28) * 2;
      const offset = (y * width + x) * 4;
      data[offset] = data[offset + 1] = data[offset + 2] = v; data[offset + 3] = 255;
    }
  }
  const texture = keep(new THREE.DataTexture(data, width, height));
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 6);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
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

function plinthGeometry() {
  const shape = new THREE.Shape();
  const x = 2.12, z = .83, r = .05;
  shape.moveTo(-x + r, -z); shape.lineTo(x - r, -z); shape.quadraticCurveTo(x, -z, x, -z + r);
  shape.lineTo(x, z - r); shape.quadraticCurveTo(x, z, x - r, z);
  shape.lineTo(-x + r, z); shape.quadraticCurveTo(-x, z, -x, z - r);
  shape.lineTo(-x, -z + r); shape.quadraticCurveTo(-x, -z, -x + r, -z);
  const geometry = keep(new THREE.ExtrudeGeometry(shape, { depth: .58, bevelEnabled: true, bevelSize: .024, bevelThickness: .024, bevelSegments: 4, curveSegments: 8, steps: 1 }));
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -2.025, 0);
  return geometry;
}

async function init() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'default' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .87;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e1e7e5');
    scene.fog = new THREE.Fog('#e1e7e5', 18, 40);
    environment = studioEnvironment(); scene.environment = environment.texture;
    const camera = new THREE.PerspectiveCamera(32, 1, .08, 60);
    camera.position.set(.85, 1.25, 8.1);
    controls = new OrbitControls(camera, canvas);
    controls.target.set(0, -.32, 0);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minDistance = 1.6; controls.maxDistance = 13;
    controls.minPolarAngle = .3; controls.maxPolarAngle = Math.PI * .58;
    controls.rotateSpeed = .65; controls.zoomSpeed = .65;
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };

    const texture = brushedTexture();
    const front = keep(new THREE.MeshPhysicalMaterial({
      color: '#99a6ac', metalness: 1, roughness: .27,
      roughnessMap: texture, bumpMap: texture, bumpScale: .0007,
      anisotropy: .55, anisotropyRotation: Math.PI / 2,
      envMapIntensity: .58, clearcoat: .06, clearcoatRoughness: .35,
    }));
    const edges = keep(new THREE.MeshPhysicalMaterial({ color: '#c6cbcb', metalness: 1, roughness: .225, envMapIntensity: 1.05, roughnessMap: texture, bumpMap: texture, bumpScale: .00035 }));
    const sculpture = new THREE.Mesh(sculptureGeometry(), [front, edges]);
    sculpture.rotation.set(-.035, -.10, -.018);
    sculpture.castShadow = true; sculpture.receiveShadow = true;
    scene.add(sculpture);
    const limestone = keep(new THREE.MeshStandardMaterial({ color: '#d0cbbd', roughness: .92, metalness: 0 }));
    const plaster = keep(new THREE.MeshStandardMaterial({ color: '#efece0', roughness: .97 }));
    const warmPlaster = keep(new THREE.MeshStandardMaterial({ color: '#d9d4c8', roughness: .96 }));
    const blue = keep(new THREE.MeshStandardMaterial({ color: '#204cdb', roughness: .8 }));
    const clay = keep(new THREE.MeshStandardMaterial({ color: '#e76a45', roughness: .93 }));
    const box = (x, y, z, width, height, depth, material, cast = true) => {
      const mesh = new THREE.Mesh(keep(new THREE.BoxGeometry(width, height, depth)), material);
      mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = true; scene.add(mesh); return mesh;
    };
    const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(45, 45)), limestone);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.052; floor.receiveShadow = true; scene.add(floor);
    const plinth = new THREE.Mesh(plinthGeometry(), plaster);
    plinth.castShadow = true; plinth.receiveShadow = true; scene.add(plinth);
    // A recessed base gives the stone block a finely defined architectural edge.
    box(0, -2.024, 0, 3.98, .07, 1.42, warmPlaster);
    // Full, shadow-casting gallery architecture. The sky aperture is real space.
    box(-4.65, 1.8, -4.5, 7.4, 7.7, .42, plaster);
    box(5.5, 1.8, -4.5, 3.4, 7.7, .42, plaster);
    box(1.5, 5.5, -4.5, 4.6, .34, .65, plaster);
    box(3.35, .2, -4.02, .55, 4.5, .8, blue);
    box(-6.15, .45, .1, .64, 5, 8, plaster);
    box(-3.9, -1.74, -2.7, 1.65, .56, 1.65, clay);
    box(-2.9, -1.74, -8.2, 5.9, .6, 3.5, warmPlaster);
    box(4.9, -.1, -10.5, .42, 4.0, 8, warmPlaster);
    for (let i = 0; i < 4; i++) box(-3.2, 4.9, -3.1 + i * 1.48, 8, .18, .13, plaster);
    // Quiet stone joints, far thinner than the sculpture's smallest edge.
    const jointMaterial = keep(new THREE.MeshStandardMaterial({ color: '#b7b3a9', roughness: 1 }));
    for (let i = -4; i <= 4; i++) {
      box(i * 3.2, -2.048, 0, .008, .002, 35, jointMaterial, false);
      box(0, -2.048, i * 3.2, 35, .002, .008, jointMaterial, false);
    }
    scene.add(new THREE.HemisphereLight('#d5e4f3', '#b8a98b', 1.35));
    const sunlight = new THREE.DirectionalLight('#fff1d6', 4.1);
    sunlight.position.set(-4.5, 8.5, 6); sunlight.target.position.set(0, -1, -1);
    sunlight.castShadow = true;
    const shadowSize = innerWidth < 700 ? 1024 : 2048;
    sunlight.shadow.mapSize.set(shadowSize, shadowSize);
    sunlight.shadow.camera.left = -11; sunlight.shadow.camera.right = 11;
    sunlight.shadow.camera.top = 11; sunlight.shadow.camera.bottom = -11;
    sunlight.shadow.camera.near = .5; sunlight.shadow.camera.far = 35;
    sunlight.shadow.normalBias = .018; sunlight.shadow.bias = -.00012;
    sunlight.shadow.radius = 3;
    scene.add(sunlight, sunlight.target);
    const fill = new THREE.DirectionalLight('#c8ddff', .85);
    fill.position.set(5, 1, 2); scene.add(fill);

    let currentView = 'sculpture';
    let userInteracting = false;
    const viewButtons = [...document.querySelectorAll('[data-sculpture-view]')];
    const views = {
      front: { position: [.18, .8, 8.0], target: [0, -.24, 0], rotation: [0, 0, 0], label: 'Front view. The original silhouette.' },
      sculpture: { position: [.85, 1.25, 8.1], target: [0, -.32, 0], rotation: [-.035, -.10, -.018], label: 'Sculpture view. Brushed aluminium in daylight.' },
      detail: { position: [2.45, .82, 2.45], target: [1.1, .12, .08], rotation: [-.035, -.10, -.018], label: 'Detail view. Explore the bevel and the brushed surface.' },
    };
    function markView(name) {
      viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.sculptureView === name)));
    }
    function fitPosition(position, name) {
      const result = new THREE.Vector3(...position);
      if (name !== 'detail' && camera.aspect < 1) {
        const fit = 3.35 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * .83);
        result.z = Math.max(result.z, fit);
        controls.maxDistance = Math.max(13, fit + 2);
      }
      return result;
    }
    function setView(name, immediate = false) {
      const view = views[name]; if (!view || lost) return;
      currentView = name; markView(name); status.textContent = view.label;
      document.querySelector('.sculpture-hero').dataset.view = name;
      const position = fitPosition(view.position, name);
      const target = new THREE.Vector3(...view.target);
      const rotation = new THREE.Euler(...view.rotation);
      if (motionQuery.matches || immediate) {
        camera.position.copy(position); controls.target.copy(target); sculpture.rotation.copy(rotation); controls.update(); transition = null;
      } else {
        transition = { start: performance.now(), from: camera.position.clone(), position, fromTarget: controls.target.clone(), target, fromRotation: sculpture.rotation.clone(), rotation };
      }
      requestRender();
    }
    function requestRender() {
      if (!frame && visible && !document.hidden && !lost && !disposed) frame = requestAnimationFrame(render);
    }
    function render(now) {
      frame = 0;
      if (transition) {
        const t = Math.min(1, (now - transition.start) / 950);
        const ease = t * t * (3 - 2 * t);
        camera.position.lerpVectors(transition.from, transition.position, ease);
        controls.target.lerpVectors(transition.fromTarget, transition.target, ease);
        sculpture.rotation.set(
          THREE.MathUtils.lerp(transition.fromRotation.x, transition.rotation.x, ease),
          THREE.MathUtils.lerp(transition.fromRotation.y, transition.rotation.y, ease),
          THREE.MathUtils.lerp(transition.fromRotation.z, transition.rotation.z, ease),
        );
        controls.update(); if (t === 1) transition = null;
      }
      renderer.render(scene, camera);
      if (transition) requestRender();
    }
    function resize() {
      const { width, height } = stage.getBoundingClientRect();
      if (!width || !height) return;
      const previousAspect = camera.aspect;
      camera.aspect = width / height;
      renderer.setSize(width, height, false);
      if (width > 760) camera.setViewOffset(width, height, -width * .14, 0, width, height);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      if (Math.abs(camera.aspect - previousAspect) > .06 && currentView !== 'detail' && !userInteracting) setView(currentView, true);
      requestRender();
    }
    controls.addEventListener('start', () => { transition = null; userInteracting = true; markView(''); });
    controls.addEventListener('change', requestRender);
    canvas.addEventListener('keydown', event => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_', '0', 'Home'];
      if (!keys.includes(event.key) || lost) return;
      event.preventDefault(); transition = null;
      if (event.key === '0' || event.key === 'Home') { userInteracting = false; setView('sculpture'); return; }
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      if (event.key === 'ArrowLeft') spherical.theta -= .1;
      if (event.key === 'ArrowRight') spherical.theta += .1;
      if (event.key === 'ArrowUp') spherical.phi -= .08;
      if (event.key === 'ArrowDown') spherical.phi += .08;
      if (event.key === '+' || event.key === '=') spherical.radius *= .9;
      if (event.key === '-' || event.key === '_') spherical.radius *= 1.1;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle);
      spherical.radius = THREE.MathUtils.clamp(spherical.radius, controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update(); userInteracting = true; markView(''); requestRender();
    });
    viewButtons.forEach(button => button.addEventListener('click', () => { userInteracting = false; setView(button.dataset.sculptureView); }));
    const finishes = {
      aluminium: { color: '#99a6ac', edge: '#c6cbcb', roughness: .27, label: 'Brushed aluminium' },
      champagne: { color: '#c7a773', edge: '#ddc393', roughness: .32, label: 'Champagne alloy' },
      titanium: { color: '#707b80', edge: '#9ca8ad', roughness: .34, label: 'Satin titanium' },
    };
    const finishButtons = [...document.querySelectorAll('[data-sculpture-finish]')];
    finishButtons.forEach(button => button.addEventListener('click', () => {
      const finish = finishes[button.dataset.sculptureFinish]; if (!finish) return;
      front.color.set(finish.color); edges.color.set(finish.edge); front.roughness = finish.roughness;
      finishButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelector('#sculpture-material').textContent = finish.label;
      status.textContent = `${finish.label}. Material study selected.`;
      requestRender();
    }));
    function zoom(factor) {
      transition = null; const offset = camera.position.clone().sub(controls.target);
      const distance = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(offset.setLength(distance)); controls.update(); userInteracting = true; markView(''); requestRender();
    }
    document.querySelector('#sculpture-closer').addEventListener('click', () => zoom(.86));
    document.querySelector('#sculpture-further').addEventListener('click', () => zoom(1.16));
    document.querySelector('#sculpture-reset').addEventListener('click', () => { userInteracting = false; setView('sculpture'); });
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
    const intersectionObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) requestRender(); else { cancelAnimationFrame(frame); frame = 0; }
    }, { rootMargin: '100px' }); intersectionObserver.observe(stage);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else requestRender();
    });
    motionQuery.addEventListener?.('change', () => { if (transition && motionQuery.matches) setView(currentView, true); });
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault(); lost = true;
      // Release render targets while this context is lost. Deferring deletion
      // until a restored WebKit context can submit stale GPU handles to it.
      scene.environment = null; environment?.dispose(); environment = null;
      sunlight.shadow.dispose(); sunlight.shadow.map = null; sunlight.shadow.mapPass = null;
      fallback('The gallery is resting. The original silhouette remains on view.');
    });
    canvas.addEventListener('webglcontextrestored', () => {
      try {
        // Render-target textures have no CPU image to restore. Rebuild the
        // studio capture after the renderer has recreated its GPU resources.
        environment = studioEnvironment(); scene.environment = environment.texture;
        renderer.shadowMap.needsUpdate = true;
        lost = false; stage.dataset.state = 'ready'; stage.classList.add('is-ready');
        sceneButtons.forEach(button => button.disabled = false);
        status.textContent = 'Gallery restored. Explore the sculpture.'; requestRender();
      } catch { fallback('The original silhouette remains on view. Reload to reopen the sculpture room.'); }
    });
    window.addEventListener('pagehide', event => {
      if (event.persisted) return;
      disposed = true; cancelAnimationFrame(frame);
      resizeObserver.disconnect(); intersectionObserver.disconnect(); controls.dispose();
      resources.forEach(resource => resource.dispose()); environment?.dispose(); sunlight.shadow.dispose(); renderer.dispose();
    });
    // Explicit scene diagnostics support reproducible WebGL / interaction QA.
    window.__TOHESAR_SYMBOL = { renderer, scene, camera, controls, sculpture, points: CEDILLA_POINTS, get view() { return currentView; }, get animating() { return Boolean(frame || transition); } };
    resize(); setView('sculpture', true);
    renderer.render(scene, camera);
    stage.dataset.state = 'ready'; stage.classList.add('is-ready'); stage.setAttribute('aria-busy', 'false');
    sceneButtons.forEach(button => button.disabled = false);
    status.textContent = 'Sculpture view. Brushed aluminium in daylight.';
  } catch (error) {
    console.warn('TOHEŞAR sculpture gallery could not start:', error.message);
    if (renderer) renderer.dispose();
    resources.forEach(resource => resource.dispose()); environment?.dispose();
    fallback();
  }
}

if (stage && canvas) init();
