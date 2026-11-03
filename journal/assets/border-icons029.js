/* TOHEŞAR 029 — Living Icons. One lightweight, optional border-side easter egg.
 * No navigation interception, no stateful loader, no image-generation dependencies.
 * All five miniatures are original transparent SVG assets kept in this repository.
 */
(() => {
  'use strict';
  if (window.__thzLivingIcons029 || !document.body || !window.requestAnimationFrame ||
      !window.SVGPathElement || location.pathname.startsWith('/creative/')) return;
  window.__thzLivingIcons029 = true;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dataSaver = navigator.connection && navigator.connection.saveData;
  const models = ['turbo930', 'f40', 'countach', 'giulia', 'etype'];
  const paths = models.map(name => '/journal/assets/border-icons029/' + name + '.svg?v=029');
  const context = location.pathname;
  let modelIndex = /\/journal\/f40\//.test(context) ? 1
    : /\/journal\/design\/giulia\//.test(context) ? 3
    : /\/journal\/design\/type-01\//.test(context) ? 4 : 0;

  const layer = document.createElement('div');
  layer.className = 'thz-icons029';
  layer.setAttribute('aria-label', 'TOHEŞAR의 작은 클래식 자동차');
  const car = document.createElement('button');
  car.type = 'button';
  car.className = 'thz-icons029-car';
  car.title = '자동차 바꾸기';
  car.setAttribute('aria-label', '테두리를 달리는 자동차. 누르면 다른 명차로 바뀝니다.');
  car.disabled = true;
  const first = document.createElement('img');
  const second = document.createElement('img');
  first.className = 'thz-icons029-current';
  second.className = 'thz-icons029-next';
  first.alt = second.alt = '';
  first.decoding = second.decoding = 'async';
  first.src = paths[modelIndex];
  car.append(first, second);
  layer.append(car);

  const geometry = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  geometry.setAttribute('aria-hidden', 'true');
  geometry.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';
  const track = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  geometry.append(track);
  layer.append(geometry);

  const insetProbe = document.createElement('div');
  insetProbe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
  layer.append(insetProbe);
  document.body.append(layer);

  let visibleImage = first, incomingImage = second;
  let raf = 0, timer = 0, morphTimer = 0, total = 0, duration = 20000;
  let timeStart = 0, running = false, lastCheckpoint = 0, morphing = false;
  let fraction = 0, enabled = !reduced.matches && !dataSaver && document.visibilityState !== 'hidden';
  const checkpoint = [0.23, 0.48, 0.73];
  const preloads = paths.map(src => { const img = new Image(); img.src = src; return img; });

  function layout() {
    const width = Math.max(150, document.documentElement.clientWidth || innerWidth);
    const height = Math.max(200, innerHeight);
    const safe = getComputedStyle(insetProbe);
    const safeTop = parseFloat(safe.paddingTop) || 0;
    const safeBottom = parseFloat(safe.paddingBottom) || 0;
    const left = 10, right = width - 10;
    const top = Math.max(14, safeTop + 8);
    const bottom = height - Math.max(18, safeBottom + 8);
    const radius = Math.min(28, (right - left) / 6, (bottom - top) / 6);
    const d = ['M',left+radius,top,'H',right-radius,
      'A',radius,radius,0,0,1,right,top+radius,
      'V',bottom-radius,'A',radius,radius,0,0,1,right-radius,bottom,
      'H',left+radius,'A',radius,radius,0,0,1,left,bottom-radius,
      'V',top+radius,'A',radius,radius,0,0,1,left+radius,top,'Z'].join(' ');
    track.setAttribute('d', d);
    total = track.getTotalLength();
    duration = Math.max(18500, total / 108 * 1000);
    paint(fraction);
  }
  function paint(p) {
    if (!total || !Number.isFinite(total)) return;
    fraction = p;
    const at = (p * total) % total;
    const point = track.getPointAtLength(at);
    const next = track.getPointAtLength((at + 1.5) % total);
    const angle = Math.atan2(next.y - point.y, next.x - point.x) * 180 / Math.PI;
    const halfWidth = car.offsetWidth / 2, halfHeight = car.offsetHeight / 2;
    car.style.transform = 'translate3d(' + (point.x - halfWidth).toFixed(2) + 'px,' +
      (point.y - halfHeight).toFixed(2) + 'px,0) rotate(' + angle.toFixed(2) + 'deg)';
  }

  function morph() {
    if (morphing || !running) return;
    morphing = true;
    modelIndex = (modelIndex + 1) % models.length;
    incomingImage.src = paths[modelIndex];
    car.classList.add('is-transforming');
    clearTimeout(morphTimer);
    morphTimer = setTimeout(() => {
      // Swap nodes without replacing the current asset in the middle of an animation.
      const old = visibleImage;
      visibleImage = incomingImage;
      incomingImage = old;
      visibleImage.className = 'thz-icons029-current';
      incomingImage.className = 'thz-icons029-next';
      incomingImage.removeAttribute('src');
      car.classList.remove('is-transforming');
      morphing = false;
    }, 460);
  }

  function cancel() {
    clearTimeout(timer);clearTimeout(morphTimer);cancelAnimationFrame(raf);
    timer = morphTimer = raf = 0;
    running = morphing = false;
    car.classList.remove('is-transforming');
    layer.classList.remove('is-visible');
    car.disabled = true;
  }
  function ready() {
    if (!document.getElementById('cover')) return true;
    const cover = document.getElementById('cover');
    return cover.getBoundingClientRect().bottom < innerHeight * 0.8;
  }
  function schedule(delay) {
    clearTimeout(timer);
    if (!enabled) return;
    timer = setTimeout(() => {
      if (!enabled) return;
      if (!ready()) { schedule(1800); return; }
      begin();
    }, delay);
  }
  function finish() {
    running = false;
    cancelAnimationFrame(raf);
    layer.classList.remove('is-visible');
    car.disabled = true;
    schedule(23000);
  }
  function tick(now) {
    if (!running || !enabled) return;
    const p = Math.min(1, (now - timeStart) / duration);
    paint(p);
    while (lastCheckpoint < checkpoint.length && p >= checkpoint[lastCheckpoint]) {
      morph();
      lastCheckpoint++;
    }
    if (p >= 1) { finish(); return; }
    raf = requestAnimationFrame(tick);
  }
  function begin() {
    if (!enabled || running) return;
    layout();
    running = true;
    fraction = 0;
    lastCheckpoint = 0;
    timeStart = performance.now();
    car.disabled = false;
    layer.classList.add('is-visible');
    raf = requestAnimationFrame(tick);
  }
  function updateEnabled() {
    enabled = !reduced.matches && !dataSaver && document.visibilityState !== 'hidden';
    cancel();
    if (enabled) schedule(6500);
  }
  car.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    if (running) morph();
  });
  reduced.addEventListener('change', updateEnabled);
  document.addEventListener('visibilitychange', updateEnabled);
  addEventListener('pagehide', cancel);
  addEventListener('pageswap', () => { layer.classList.remove('is-visible'); });
  addEventListener('pageshow', updateEnabled);
  addEventListener('resize', () => { if (running) layout(); }, { passive:true });
  window.visualViewport?.addEventListener('resize', () => { if (running) layout(); }, { passive:true });
  layout();
  if (enabled) schedule(6500);
})();
