/* CHROME ATMOSPHERE / original parametric artwork. No symbol geometry or imagery.
   A continuous liquid loop, physical chrome, optical glass, and a procedural HDR studio. */
import * as THREE from "three";
const canvas = document.querySelector("#chrome-canvas");
const artwork = document.querySelector("#artwork");
const motionButton = document.querySelector("#motion");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth < 700 ? 1.6 : 1.8),
  );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
  camera.position.set(0, 0.15, 9.6);
  // An HDR environment made from architectural light cards, rather than a flat chrome gradient.
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0.48, 0.5, 0.51);
  function card(x, y, z, w, h, color) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
    );
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
  }
  card(-4, 2, 3, 2, 9, new THREE.Color(6, 6.2, 6.4));
  card(4, 1, 2, 1.6, 8, new THREE.Color(4.5, 3.6, 3));
  card(0, 6, 0, 7, 6, new THREE.Color(4, 4.2, 4.5));
  card(-1, 1, 5, 0.7, 8, new THREE.Color(0.012, 0.016, 0.021));
  card(2, 0.5, 5, 1.3, 9, new THREE.Color(0.018, 0.024, 0.029));
  card(0, -4, 2, 10, 4, new THREE.Color(0.13, 0.16, 0.18));
  card(-4, 0, -3, 4, 6, new THREE.Color(0.55, 0.9, 1.5));
  card(4, 0, -2, 3, 7, new THREE.Color(1.4, 0.7, 0.43));
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, 0.06, 0.1, 50);
  scene.environment = environment.texture;
  pmrem.dispose();
  studio.traverse((o) => {
    o.geometry?.dispose();
    if (o.material) o.material.dispose();
  });
  // The background is actual scene geometry, so glass transmission sees the peach/blue atmosphere.
  const backdropMaterial = new THREE.ShaderMaterial({
    depthWrite: false,
    uniforms: { shift: { value: 0 } },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `precision highp float;varying vec2 vUv;uniform float shift;void main(){vec2 p=vUv;vec3 col=vec3(.91,.90,.87);float blue=exp(-length((p-vec2(.22+shift*.15,.42))*vec2(3.,2.9))*2.1);float peach=exp(-length((p-vec2(.77,.64-shift*.15))*vec2(3.,3.))*2.2);col=mix(col,vec3(.53,.72,.86),blue*.8);col=mix(col,vec3(.98,.69,.51),peach*.7);gl_FragColor=vec4(col,1.);}`,
  });
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(35, 25),
    backdropMaterial,
  );
  backdrop.position.z = -6;
  scene.add(backdrop);
  const chrome = new THREE.MeshPhysicalMaterial({
    color: "#e5e8ec",
    metalness: 1,
    roughness: 0.095,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.25,
  });
  // A custom liquid cross-section follows an asymmetric spatial loop. This is not a stock torus.
  const U = 144,
    V = 40,
    positions = new Float32Array((U + 1) * (V + 1) * 3),
    indices = [];
  for (let i = 0; i < U; i++)
    for (let j = 0; j < V; j++) {
      const a = i * (V + 1) + j,
        b = (i + 1) * (V + 1) + j;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  function shape(morph = 0) {
    for (let i = 0; i <= U; i++) {
      const u = i / U,
        t = u * (Math.PI * 2 - morph * 0.95) + morph * 0.25;
      const r =
        1.45 + 0.16 * Math.cos(3 * t + 0.3) + morph * 0.18 * Math.sin(t);
      const x = r * Math.cos(t),
        y = (1.6 + 0.12 * Math.sin(2 * t)) * Math.sin(t),
        z = 0.46 * Math.sin(2 * t + 0.6) + morph * 0.55 * Math.cos(t);
      const tube = 0.45 + 0.13 * Math.sin(t + 0.8) + 0.07 * Math.cos(3 * t);
      const taper =
        1 -
        morph * (1 - Math.pow(Math.max(0, Math.sin(Math.PI * u)), 0.25)) * 0.97;
      for (let j = 0; j <= V; j++) {
        const v = (j / V) * Math.PI * 2,
          twist = t + 0.35 * Math.sin(2 * t) + morph * 0.7;
        const a = Math.cos(v) * tube * taper,
          b = Math.sin(v) * tube * 0.74 * taper;
        const radial = a * Math.cos(twist) - b * Math.sin(twist),
          depth = a * Math.sin(twist) + b * Math.cos(twist);
        const k = (i * (V + 1) + j) * 3;
        positions[k] = x + Math.cos(t) * radial;
        positions[k + 1] = y + Math.sin(t) * radial;
        positions[k + 2] = z + depth;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  }
  shape();
  const sculpture = new THREE.Mesh(geometry, chrome);
  sculpture.rotation.set(0.2, -0.38, -0.52);
  scene.add(sculpture);
  const glass = new THREE.Mesh(
    new THREE.SphereGeometry(0.67, 48, 32),
    new THREE.MeshPhysicalMaterial({
      color: "#f6faff",
      metalness: 0,
      roughness: 0.045,
      transmission: 1,
      thickness: 1.4,
      ior: 1.46,
      envMapIntensity: 1.3,
      clearcoat: 1,
    }),
  );
  glass.position.set(1.48, 1.05, -0.45);
  scene.add(glass);
  const satellite = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 32, 24),
    chrome,
  );
  satellite.position.set(-1.65, -1.15, 0.6);
  scene.add(satellite);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { strength: { value: 0.16 } },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec2 vUv;uniform float strength;void main(){float d=length((vUv-.5)*vec2(2.,5.));gl_FragColor=vec4(.28,.32,.35,exp(-d*d*5.)*strength);}`,
    }),
  );
  shadow.position.set(0, -2.45, -0.4);
  shadow.rotation.x = -0.55;
  scene.add(shadow);
  let paused = reduced.matches,
    raf = 0,
    last = 0,
    time = 0,
    active = true,
    progress = 0,
    targetProgress = 0,
    lastMorph = -1;
  const sequence = document.querySelector(".sequence");
  const first = document.querySelector(".chapter-one"),
    second = document.querySelector(".chapter-two");
  const title = document.querySelector(".title-chrome"),
    subtitle = document.querySelector(".title-atmosphere");
  const sceneNumber = document.querySelector("#scene-number"),
    scrollLabel = document.querySelector("#scroll-label");
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => {
    const x = clamp((v - a) / (b - a));
    return x * x * (3 - 2 * x);
  };
  let baseDistance = 9.6;
  function readScroll() {
    const bounds = sequence.getBoundingClientRect();
    targetProgress = clamp(
      -bounds.top / Math.max(1, sequence.offsetHeight - innerHeight),
    );
    if (!raf) resume();
  }
  window.addEventListener("scroll", readScroll, { passive: true });
  function choreography() {
    const p = progress,
      travel = smooth(0.06, 0.94, p),
      morph = smooth(0.12, 0.88, p);
    if (Math.abs(morph - lastMorph) > 0.0008) {
      shape(morph);
      lastMorph = morph;
    }
    const portrait = camera.aspect < 0.8;
    // The camera passes from frontal still life to an intimate, three-quarter optical study.
    camera.position.set(
      travel * (portrait ? 1.15 : 2.1),
      0.15 + travel * 0.6,
      baseDistance * (1 - travel * 0.24),
    );
    camera.lookAt(travel * (portrait ? 0.15 : 0.6), travel * 0.05, 0);
    sculpture.position.x = travel * (portrait ? 0.36 : 1.1);
    sculpture.position.y = 0.02 - travel * 0.45 + Math.sin(time * 0.65) * 0.065;
    sculpture.rotation.set(
      0.2 +
        travel * 0.48 +
        Math.sin(time * 0.25) * 0.08 +
        smoothPointer.y * 0.1,
      -0.38 +
        travel * 0.83 +
        Math.sin(time * 0.19) * 0.1 +
        smoothPointer.x * 0.14,
      -0.52 - travel * 0.57 + Math.sin(time * 0.16) * 0.035,
    );
    glass.position.set(
      1.48 - travel * 1.6,
      1.05 - travel * 0.72 + Math.sin(time * 0.45 + 0.7) * 0.1,
      -0.45 + travel * 1.7,
    );
    glass.scale.setScalar(1 + travel * 0.25);
    satellite.position.set(
      -1.65 + travel * 0.15,
      -1.15 + travel * 2.3 + Math.sin(time * 0.55) * 0.12,
      0.6 + travel * 0.25,
    );
    shadow.material.uniforms.strength.value = 0.16 - travel * 0.07;
    backdropMaterial.uniforms.shift.value = travel;
    scene.environmentRotation.y = travel * 0.6;
    scene.environmentRotation.z = travel * 0.18;
    chrome.roughness = 0.095 - travel * 0.025;
    const out = smooth(0.06, 0.43, p),
      incoming = smooth(0.56, 0.85, p);
    first.style.opacity = String(1 - out);
    first.style.visibility = out > 0.999 ? "hidden" : "visible";
    first.setAttribute("aria-hidden", String(out > 0.99));
    if (!reduced.matches) {
      title.style.transform = `translate3d(${-out * 16}%,${-out * 35}px,0)`;
      subtitle.style.transform = `translate3d(${out * 14}%,${out * 35}px,0)`;
    }
    second.style.opacity = String(incoming);
    second.style.visibility = incoming > 0.001 ? "visible" : "hidden";
    second.style.transform = reduced.matches
      ? "none"
      : `translate3d(0,${(1 - incoming) * 35}px,0)`;
    second.setAttribute("aria-hidden", String(incoming < 0.5));
    document.documentElement.style.setProperty("--progress", p);
    sceneNumber.textContent = p > 0.55 ? "02" : "01";
    scrollLabel.textContent =
      p > 0.9
        ? "A NEW STATE OF MATTER"
        : p > 0.35
          ? "MATTER IS NEVER STILL"
          : "SCROLL TO ALTER THE ATMOSPHERE";
  }

  const pointer = new THREE.Vector2(),
    smoothPointer = new THREE.Vector2();
  function fit() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    baseDistance = w < 600 ? 13.4 : w / h < 1.2 ? 10.4 : 8.8;
    sculpture.scale.setScalar(w < 600 ? 0.93 : 1);
    render(performance.now());
  }
  function render(now) {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    const dt = Math.min(0.04, (now - (last || now)) / 1000);
    last = now;
    if (!paused) time += dt;
    smoothPointer.lerp(paused ? new THREE.Vector2() : pointer, 0.035);
    progress +=
      (targetProgress - progress) *
      (reduced.matches ? 1 : 1 - Math.exp(-dt * 7));
    if (Math.abs(targetProgress - progress) < 0.0002) progress = targetProgress;
    choreography();
    renderer.render(scene, camera);
    if (
      active &&
      !document.hidden &&
      (!paused || Math.abs(targetProgress - progress) > 0.0002)
    )
      raf = requestAnimationFrame(render);
  }
  function resume() {
    last = 0;
    if (active && !document.hidden) render(performance.now());
    else {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }
  const syncButton = () => {
    motionButton.textContent = paused ? "▷" : "Ⅱ";
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.setAttribute(
      "aria-label",
      paused ? "Play ambient motion" : "Pause ambient motion",
    );
  };
  motionButton.addEventListener("click", () => {
    paused = !paused;
    syncButton();
    resume();
  });
  reduced.addEventListener("change", () => {
    paused = reduced.matches;
    syncButton();
    resume();
  });
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse" || reduced.matches) return;
      pointer.set(
        (e.clientX / innerWidth - 0.5) * 2,
        (e.clientY / innerHeight - 0.5) * 2,
      );
    },
    { passive: true },
  );
  new ResizeObserver(fit).observe(artwork);
  document.addEventListener("visibilitychange", resume);
  new IntersectionObserver((entries) => {
    active = entries[0].isIntersecting;
    resume();
  }).observe(artwork);
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    active = false;
    cancelAnimationFrame(raf);
    artwork.classList.remove("ready");
    motionButton.hidden = true;
  });
  fit();
  readScroll();
  syncButton();
  artwork.classList.add("ready");
} catch (error) {
  console.warn("Chrome Atmosphere fallback:", error.message);
  motionButton.hidden = true;
}
