import * as THREE from 'three';

// Two coach-built shells. A single rising shoulder, a long drawn waist and
// a swept central shut-line define every section; no noise displaces the skin.
export function folio(side, u, v, open = 0, layer = -1) {
  const t = 2 * v - 1;
  const envelope = Math.pow(Math.max(0.00004, Math.sin(Math.PI * v)), .68);
  const shoulder = envelope * (.82 + .24 * v);
  const width = (side < 0 ? .88 : 1.23) * shoulder;
  const spine = .20 * Math.sin((v - .14) * Math.PI) - .20 * t;
  const shut = .021 * envelope;
  let x = spine + side * (shut + u * width);
  let y = t * 2.28 + (side < 0 ? .16 : -.12) * u * envelope;
  // The broad convex volume turns into a restrained concave return at the
  // outer shoulder. The narrow highlight is made by curvature, not a stripe.
  const camber = Math.sin(u * Math.PI * .93);
  let z = .22 + .77 * camber * shoulder + .15 * t * t
    - .17 * u * u + (side < 0 ? .10 : -.05) * u * shoulder;
  z -= .075 * Math.exp(-Math.pow((u - .84) / .115, 2)) * envelope;
  z += .028 * Math.exp(-Math.pow((u - .98) / .035, 2)) * envelope;
  // Each leaf rotates about its drawn spine while its hinge translates into
  // the passage. Continuous target topology keeps reverse scrolling exact.
  const angle = side * open * .82;
  const dx = x - spine, dz = z - .22;
  x = spine + dx * Math.cos(angle) + dz * Math.sin(angle) + side * open * .94;
  z = .22 - dx * Math.sin(angle) + dz * Math.cos(angle) - open * .18;
  y += side * open * u * .08;
  if (layer >= 0) {
    x = spine + (x - spine) * (.85 - layer * .045);
    y = y * (.91 - layer * .025) + layer * .045;
    z -= .65 + layer * .18;
  }
  return new THREE.Vector3(x, y, z);
}

export function shellSkin(side, open) {
  const nu = 56, nv = 128, positions = [], uv = [], indices = [];
  const count = (nu + 1) * (nv + 1);
  for (let back = 0; back < 2; back++) {
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      const p = folio(side, i / nu, j / nv, open);
      positions.push(p.x, p.y, p.z - back * .032);
      uv.push(i / nu, j / nv);
    }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = back * count + j * (nu + 1) + i, b = a + nu + 1;
      if (back) indices.push(a, a + 1, b, b, a + 1, b + 1);
      else indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

// A real 32 mm cut section joins the front to a return skin. Unlike a tube
// laid on a zero-thickness plane, this bevel remains part of the silhouette.
export function shellEdge(side, open) {
  const boundary = [];
  for (let j = 0; j <= 128; j++) boundary.push([0, j / 128]);
  for (let i = 1; i <= 56; i++) boundary.push([i / 56, 1]);
  for (let j = 127; j >= 0; j--) boundary.push([1, j / 128]);
  for (let i = 55; i >= 0; i--) boundary.push([i / 56, 0]);
  const pos = [], uv = [], indices = [];
  const n = boundary.length;
  for (let k = 0; k <= 4; k++) {
    const theta = k / 4 * Math.PI;
    for (const [u, v] of boundary) {
      const p = folio(side, u, v, open);
      p.z -= .016 * (1 - Math.cos(theta));
      pos.push(p.x, p.y, p.z);
      uv.push(u, v);
    }
  }
  for (let k = 0; k < 4; k++) for (let j = 0; j < n; j++) {
    const a = k * n + j, b = k * n + (j + 1) % n;
    indices.push(a, b, a + n, b, b + n, a + n);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
