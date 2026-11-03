/* TOHEŞAR 030 — an occasional visitor, independent of navigation. */
(() => {
  'use strict';
  if (window.__thzLivingIcons030 || !document.body || !window.requestAnimationFrame ||
      !window.SVGPathElement || location.pathname.startsWith('/creative/')) return;
  window.__thzLivingIcons030 = true;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const test = window.__thzIcons030Test || {};
  const models = ['930', 'f40', 'countach', 'giulia', 'etype'];
  const stateKey = 'tohesar-living-icons-visit-031';
  let saved = null;
  try {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation && navigation.type === 'reload') sessionStorage.removeItem(stateKey);
    else saved = JSON.parse(sessionStorage.getItem(stateKey) || 'null');
  } catch (_) {}
  const paths = models.map(name => '/journal/assets/living-icons/' + name + '.webp?v=030');
  let model = /\/f40(?:\/|$)/i.test(location.pathname) ? 1 :
    /giulia/i.test(location.pathname) ? 3 : /jaguar|type-01/i.test(location.pathname) ? 4 : 0;
  if (saved && Number.isInteger(saved.model) && saved.model >= 0 && saved.model < models.length) model = saved.model;
  const layer = document.createElement('div');
  layer.className = 'thz-icons030';
  const effects = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  effects.setAttribute('class', 'thz-icons030-effects');
  effects.setAttribute('aria-hidden', 'true');
  layer.append(effects);
  const car = document.createElement('button');
  car.type = 'button';
  car.className = 'thz-icons030-car';
  car.setAttribute('aria-label', '테두리를 달리는 자동차. 누르면 다른 명차로 바뀝니다.');
  car.disabled = true;
  const body = document.createElement('span');
  body.className = 'thz-icons030-body';
  const current = document.createElement('img');
  const next = document.createElement('img');
  current.className = 'thz-icons030-current';
  next.className = 'thz-icons030-next';
  current.alt = next.alt = '';
  current.decoding = next.decoding = 'async';
  body.append(current, next);
  car.append(body);
  layer.append(car);
  const geometry = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  geometry.setAttribute('aria-hidden', 'true');
  geometry.style.cssText = 'position:absolute;width:1px;height:1px;visibility:hidden;pointer-events:none';
  const track = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  geometry.append(track);
  layer.append(geometry);
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  layer.append(probe);
  document.body.append(layer);

  let front = current, back = next, total = 0, distance = 0, last = 0, elapsed = 0;
  let frame = 0, timer = 0, morphTimer = 0, running = false, morphing = false, transformed = false;
  let controls = [], enabled = false, brakingUntil = 0, speed = 0, scrollFrame = 0;
  let blocked = false, lastPuff = 0, lastTrack = 0, previousWheels = null, exhaustUntil = 0;
  let drag = null, returning = null, suppressClick = false, currentAngle = 0, coverShowing = null;
  let preloads, generation = 0, started = false;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  function layout() {
    const width = document.documentElement.clientWidth || innerWidth;
    const height = innerHeight;
    const safe = getComputedStyle(probe);
    const inset = 37; // half the longest car, including its corner sweep
    const left = inset + (parseFloat(safe.paddingLeft) || 0);
    const right = Math.max(left + 20, width - inset - (parseFloat(safe.paddingRight) || 0));
    const top = inset + (parseFloat(safe.paddingTop) || 0);
    const bottom = Math.max(top + 20, height - inset - (parseFloat(safe.paddingBottom) || 0));
    const radius = Math.min(54, (right - left) / 4, (bottom - top) / 4);
    track.setAttribute('d', `M ${left + radius} ${top} H ${right - radius} A ${radius} ${radius} 0 0 1 ${right} ${top + radius} V ${bottom - radius} A ${radius} ${radius} 0 0 1 ${right - radius} ${bottom} H ${left + radius} A ${radius} ${radius} 0 0 1 ${left} ${bottom - radius} V ${top + radius} A ${radius} ${radius} 0 0 1 ${left + radius} ${top} Z`);
    const old = total;
    total = track.getTotalLength();
    if (old) distance = distance / old * total;
    updateControls();
  }
  function updateControls() {
    controls = Array.from(document.querySelectorAll('header a, header button, nav a, nav button, main a, main button, main input, main summary, main p, main h1, main h2, main h3, main h4, main figure img')).filter(el => el.getClientRects().length).map(el => el.getBoundingClientRect()).filter(r => r.bottom > 0 && r.top < innerHeight);
  }
  function paint() {
    if (!total) return;
    const at = ((distance % total) + total) % total;
    const point = track.getPointAtLength(at);
    const ahead = track.getPointAtLength((at + 1) % total);
    const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180 / Math.PI;
    currentAngle = angle;
    car.style.transform = `translate3d(${point.x.toFixed(2)}px,${point.y.toFixed(2)}px,0) translate(-50%,-50%) rotate(${angle.toFixed(2)}deg)`;
    // Hide before entering a control's hit area so the decoration never steals navigation.
    blocked = controls.some(r => point.x > r.left - 35 && point.x < r.right + 35 && point.y > r.top - 35 && point.y < r.bottom + 35);
    car.classList.toggle('is-obscured', blocked);
    car.tabIndex = blocked ? -1 : 0;
  }
  function effectNode(name, className) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    node.setAttribute('class', className);
    if (className === 'thz-icons030-puff') node.addEventListener('animationend', () => node.remove(), {once:true});
    effects.append(node);
    return node;
  }
  function clearEffects(clearTracks) {
    effects.querySelectorAll(clearTracks ? '.thz-icons030-puff, .thz-icons030-track' : '.thz-icons030-puff').forEach(node => node.remove());
  }
  function drawEffects(now, bend) {
    if (morphing) { previousWheels = null; return; }
    const at = ((distance % total) + total) % total;
    const point = track.getPointAtLength(at);
    const ahead = track.getPointAtLength((at + 1) % total);
    const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x);
    const dx = Math.cos(angle), dy = Math.sin(angle);

    // Tiny wisps while driving, with short pauses; a little more at departure.
    const accelerating = elapsed < 2.5 || now < exhaustUntil;
    if ((accelerating || elapsed % 7.5 < 5.5) && now - lastPuff > (accelerating ? 350 : 650)) {
      lastPuff = now;
      const puff = effectNode('g', 'thz-icons030-puff');
      puff.setAttribute('transform', `translate(${(point.x - dx * 26).toFixed(1)} ${(point.y - dy * 26).toFixed(1)}) rotate(${(angle * 180 / Math.PI).toFixed(1)})`);
      const cloud = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      cloud.setAttribute('rx', '2.8'); cloud.setAttribute('ry', '1.7');
      puff.append(cloud);
    }

    // A light pair of traces remains on the page after the car takes a bend.
    if (bend < .045 || speed < 20) { previousWheels = null; return; }
    if (now - lastTrack < 110) return;
    lastTrack = now;
    const rearX = point.x - dx * 14, rearY = point.y - dy * 14;
    const wheels = [-1, 1].map(side => ({x:rearX - dy * 8 * side, y:rearY + dx * 8 * side}));
    if (previousWheels) wheels.forEach((wheel, i) => {
      const previous = previousWheels[i];
      // Discard discontinuities after resizing or a missed frame.
      if (Math.hypot(wheel.x - previous.x, wheel.y - previous.y) > Math.max(24, speed * .3)) return;
      const line = effectNode('line', 'thz-icons030-track');
      line.setAttribute('x1', previous.x.toFixed(1)); line.setAttribute('y1', previous.y.toFixed(1));
      line.setAttribute('x2', wheel.x.toFixed(1)); line.setAttribute('y2', wheel.y.toFixed(1));
    });
    // Bound the number of retained marks for unusually long visits.
    const marks = effects.querySelectorAll('.thz-icons030-track');
    if (marks.length > 800) for (let i = 0; i < marks.length - 800; i++) marks[i].remove();
    previousWheels = wheels;
  }
  function morph() {
    if (!running || morphing) return;
    morphing = true;
    brakingUntil = performance.now() + 650;
    exhaustUntil = brakingUntil + 1800;
    model = (model + 1) % models.length;
    back.src = paths[model];
    car.classList.add('is-transforming');
    clearTimeout(morphTimer);
    morphTimer = setTimeout(() => {
      const old = front; front = back; back = old;
      front.className = 'thz-icons030-current';
      back.className = 'thz-icons030-next';
      back.removeAttribute('src');
      car.classList.remove('is-transforming');
      morphing = false;
    }, 900);
  }
  function cancel(clearTracks = false) {
    generation++;
    clearTimeout(timer); clearTimeout(morphTimer); cancelAnimationFrame(frame);
    running = morphing = false;
    clearEffects(clearTracks); previousWheels = null;
    drag = returning = null;
    car.classList.remove('is-dragging');
    car.classList.remove('is-transforming');
    layer.classList.remove('is-visible');
    car.disabled = true;
  }
  function ready() {
    const cover = document.getElementById('cover');
    if (!cover) return true;
    const rect = cover.getBoundingClientRect();
    return rect.bottom <= 0 || rect.top >= innerHeight;
  }
  function syncCover() {
    const showing = !ready();
    if (showing === coverShowing) return;
    coverShowing = showing;
    layer.classList.toggle('is-cover-hidden', showing);
    if (showing) cancel(false);
    else if (enabled) schedule(600);
  }
  function schedule(delay) {
    clearTimeout(timer);
    if (!enabled || coverShowing) return;
    timer = setTimeout(() => {
      if (!enabled) return;
      if (!ready()) { syncCover(); return; }
      begin();
    }, delay);
  }
  function tick(now) {
    if (!running || !enabled) return;
    const dt = Math.min((now - last) / 1000, .05); last = now;
    if (drag && drag.moved) { frame = requestAnimationFrame(tick); return; }
    if (returning) {
      const t = smooth((now - returning.start) / 700);
      const destination = track.getPointAtLength(distance);
      const ahead = track.getPointAtLength((distance + 1) % total);
      const target = Math.atan2(ahead.y - destination.y, ahead.x - destination.x) * 180 / Math.PI;
      const turn = ((target - returning.angle + 540) % 360) - 180;
      const x = returning.x + (destination.x - returning.x) * t;
      const y = returning.y + (destination.y - returning.y) * t;
      currentAngle = returning.angle + turn * t;
      car.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%) rotate(${currentAngle.toFixed(2)}deg)`;
      if (t >= 1) { returning = null; speed = 0; paint(); }
      frame = requestAnimationFrame(tick); return;
    }
    elapsed += dt;
    // The closed path has no artificial stop at the seam.
    const end = 1;
    const start = smooth(elapsed / 2);
    const braking = now < brakingUntil ? .55 : 1;
    const point = track.getPointAtLength(distance % total);
    const before = track.getPointAtLength((distance - 12 + total) % total);
    const after = track.getPointAtLength((distance + 12) % total);
    const a = Math.atan2(point.y - before.y, point.x - before.x);
    const b = Math.atan2(after.y - point.y, after.x - point.x);
    const bend = Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a)));
    const targetSpeed = Math.max(8, 86 * Math.min(start, end) * braking * (1 - Math.min(.28, bend * .7))) * (test.speed || 1);
    speed += (targetSpeed - speed) * Math.min(1, dt * 3);
    distance = (distance + speed * dt) % total;
    paint();
    drawEffects(now, bend);
    frame = requestAnimationFrame(tick);
  }
  async function begin() {
    if (!enabled || running) return;
    const request = ++generation;
    if (!preloads) preloads = paths.map(src => { const image = new Image(); image.src = src; return image; });
    try {
      await preloads[model].decode();
    } catch (_) {
      if (enabled && request === generation) schedule(60000);
      return;
    }
    if (!enabled || request !== generation) return;
    front.src = paths[model];
    layout();
    if (!started && saved) {
      distance = clamp(Number(saved.progress) || 0, 0, 1) * total;
      speed = clamp(Number(saved.speed) || 0, 0, 100);
      elapsed = Math.max(0, Number(saved.elapsed) || 0);
      const width = document.documentElement.clientWidth || innerWidth, height = innerHeight;
      if (Array.isArray(saved.tracks)) saved.tracks.slice(-800).forEach(coords => {
        if (!Array.isArray(coords) || coords.length !== 4 || !coords.every(Number.isFinite)) return;
        const line = effectNode('line', 'thz-icons030-track');
        ['x1','y1','x2','y2'].forEach((key, i) => line.setAttribute(key, (coords[i] * (i % 2 ? height : width)).toFixed(1)));
      });
      saved = null;
    }
    started = true; last = performance.now();
    running = true; paint(); car.disabled = false;
    layer.classList.add('is-visible'); frame = requestAnimationFrame(tick);
  }
  function updateEnabled() {
    enabled = !reduced.matches && !(connection && connection.saveData) && document.visibilityState !== 'hidden';
    cancel(reduced.matches || !!(connection && connection.saveData)); if (enabled) schedule(Number.isFinite(test.delay) ? test.delay : 4000);
  }
  car.addEventListener('pointerdown', event => {
    if (!running || returning || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const rect = car.getBoundingClientRect();
    drag = {id:event.pointerId, startX:event.clientX, startY:event.clientY,
      offsetX:rect.left + rect.width / 2 - event.clientX, offsetY:rect.top + rect.height / 2 - event.clientY,
      x:rect.left + rect.width / 2, y:rect.top + rect.height / 2, moved:false};
    car.setPointerCapture(event.pointerId);
  });
  car.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return;
    drag.moved = true; previousWheels = null;
    car.classList.add('is-dragging'); car.classList.remove('is-obscured');
    drag.x = clamp(event.clientX + drag.offsetX, 37, innerWidth - 37);
    drag.y = clamp(event.clientY + drag.offsetY, 37, innerHeight - 37);
    car.style.transform = `translate3d(${drag.x.toFixed(2)}px,${drag.y.toFixed(2)}px,0) translate(-50%,-50%) rotate(${currentAngle.toFixed(2)}deg)`;
  });
  function release(event) {
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.moved) {
      let nearest = 0, best = Infinity;
      for (let d = 0; d < total; d += 8) {
        const p = track.getPointAtLength(d), squared = (p.x - drag.x) ** 2 + (p.y - drag.y) ** 2;
        if (squared < best) { best = squared; nearest = d; }
      }
      distance = nearest;
      transformed = true;
      returning = {x:drag.x, y:drag.y, angle:currentAngle, start:performance.now()};
      suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
    }
    drag = null; car.classList.remove('is-dragging');
  }
  car.addEventListener('pointerup', release);
  car.addEventListener('pointercancel', release);
  car.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); if (!suppressClick) morph(); });
  reduced.addEventListener('change', updateEnabled);
  connection?.addEventListener?.('change', updateEnabled);
  document.addEventListener('visibilitychange', updateEnabled);
  function saveVisit() {
    if (!started && saved) return;
    try {
      const width = document.documentElement.clientWidth || innerWidth, height = innerHeight;
      const tracks = Array.from(effects.querySelectorAll('.thz-icons030-track')).slice(-800).map(line =>
        ['x1','y1','x2','y2'].map((key, i) => Number(line.getAttribute(key)) / (i % 2 ? height : width)));
      sessionStorage.setItem(stateKey, JSON.stringify({model, progress: total ? ((distance % total) + total) % total / total : 0, speed, elapsed, tracks}));
    } catch (_) {}
  }
  addEventListener('pagehide', () => { saveVisit(); cancel(false); });
  addEventListener('pageshow', updateEnabled);
  addEventListener('resize', () => { layout(); syncCover(); }, {passive:true});
  addEventListener('scroll', () => {
    syncCover();
    if (!running || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updateControls(); });
  }, {passive:true});
  window.visualViewport?.addEventListener('resize', () => { layout(); syncCover(); }, {passive:true});
  layout(); syncCover(); updateEnabled();
})();
