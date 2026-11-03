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
  const paths = models.map(name => '/journal/assets/living-icons/' + name + '.webp?v=030');
  let model = /\/f40(?:\/|$)/i.test(location.pathname) ? 1 :
    /giulia/i.test(location.pathname) ? 3 : /jaguar|type-01/i.test(location.pathname) ? 4 : 0;
  const layer = document.createElement('div');
  layer.className = 'thz-icons030';
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
  let preloads, generation = 0;
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
    controls = Array.from(document.querySelectorAll('nav a, nav button, header a, header button, [role="navigation"] a, [role="navigation"] button')).filter(el => el.getClientRects().length).map(el => el.getBoundingClientRect());
  }
  function paint() {
    if (!total) return;
    const at = ((distance % total) + total) % total;
    const point = track.getPointAtLength(at);
    const ahead = track.getPointAtLength((at + 1) % total);
    const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180 / Math.PI;
    car.style.transform = `translate3d(${point.x.toFixed(2)}px,${point.y.toFixed(2)}px,0) translate(-50%,-50%) rotate(${angle.toFixed(2)}deg)`;
    // Hide before entering a control's hit area so the decoration never steals navigation.
    const blocked = controls.some(r => point.x > r.left - 35 && point.x < r.right + 35 && point.y > r.top - 35 && point.y < r.bottom + 35);
    car.classList.toggle('is-obscured', blocked);
    car.tabIndex = blocked ? -1 : 0;
  }
  function morph() {
    if (!running || morphing) return;
    morphing = true;
    brakingUntil = performance.now() + 650;
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
  function cancel() {
    generation++;
    clearTimeout(timer); clearTimeout(morphTimer); cancelAnimationFrame(frame);
    running = morphing = false;
    car.classList.remove('is-transforming');
    layer.classList.remove('is-visible');
    car.disabled = true;
  }
  function ready() {
    const cover = document.getElementById('cover');
    return !cover || cover.getBoundingClientRect().bottom < innerHeight * .8;
  }
  function schedule(delay) {
    clearTimeout(timer);
    if (!enabled) return;
    timer = setTimeout(() => {
      if (!enabled) return;
      if (!ready()) { schedule(2500); return; }
      begin();
    }, delay);
  }
  function tick(now) {
    if (!running || !enabled) return;
    const dt = Math.min((now - last) / 1000, .05); last = now; elapsed += dt;
    // Smooth departure and arrival; corner curvature naturally follows the path tangent.
    const end = smooth((total - distance) / 110);
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
    distance += speed * dt;
    paint();
    if (!transformed && distance > total * .55) { transformed = true; morph(); }
    if (distance >= total - 1) {
      running = false; layer.classList.remove('is-visible'); car.disabled = true;
      schedule(60000); return;
    }
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
    layout(); distance = 0; speed = 0; elapsed = 0; transformed = false; last = performance.now();
    running = true; paint(); car.disabled = false;
    layer.classList.add('is-visible'); frame = requestAnimationFrame(tick);
  }
  function updateEnabled() {
    enabled = !reduced.matches && !(connection && connection.saveData) && document.visibilityState !== 'hidden';
    cancel(); if (enabled) schedule(Number.isFinite(test.delay) ? test.delay : 12000);
  }
  car.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); morph(); });
  reduced.addEventListener('change', updateEnabled);
  connection?.addEventListener?.('change', updateEnabled);
  document.addEventListener('visibilitychange', updateEnabled);
  addEventListener('pagehide', cancel);
  addEventListener('pageshow', updateEnabled);
  addEventListener('resize', layout, {passive:true});
  addEventListener('scroll', () => {
    if (!running || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updateControls(); });
  }, {passive:true});
  window.visualViewport?.addEventListener('resize', layout, {passive:true});
  layout(); updateEnabled();
})();
