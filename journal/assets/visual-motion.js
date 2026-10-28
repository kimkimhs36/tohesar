/* Builds on 005's passive-scroll → rAF → deterministic progress pattern.
   Each plate owns its composition; no inertia, scroll interception or perpetual loop. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1, n));
  const scenes = [...document.querySelectorAll('[data-scroll-scene]')].map(el => ({
    el, board: el.querySelector('[data-scene-board]'),
    cars: [...el.querySelectorAll('[data-car]')],
    captions: [...el.querySelectorAll('[data-scene-caption]')], last: -1
  }));
  let queued = false;
  function measure() {
    scenes.forEach(s => {
      // Short landscape screens get an ordinary static plate instead of a clipped sticky one.
      s.enabled = !reduced.matches && innerHeight >= 620;
      s.el.classList.toggle('scene-enabled', s.enabled);
      s.top = s.el.getBoundingClientRect().top + scrollY;
      s.distance = Math.max(1, s.el.offsetHeight - s.board.offsetHeight);
      const track = s.el.querySelector('.air-diagram');
      if (track) s.travel = Math.max(0, track.clientWidth - s.el.querySelector('.air-car').offsetWidth);
      s.captions.forEach(p => { p.classList.remove('is-active'); p.removeAttribute('aria-hidden'); });
      s.cars.forEach(car => car.style.removeProperty('transform'));
      const car = s.el.querySelector('.air-car');
      if (car) car.style.removeProperty('transform');
      s.el.style.removeProperty('--p'); s.last = -1;
      if (!s.enabled) delete s.el.dataset.progress;
    });
    paint();
  }
  function paint() {
    queued = false;
    scenes.forEach(s => {
      if (!s.enabled) return;
      const p = clamp((scrollY - s.top) / s.distance);
      if (s.last === p) return;
      s.last = p; s.el.dataset.progress = p.toFixed(4);
      s.el.style.setProperty('--p', p.toFixed(4));
      if (s.el.dataset.scrollScene === 'air') {
        const x = s.travel * clamp(p / .77);
        const lift = clamp((p - .72) / .28);
        s.el.querySelector('.air-car').style.transform = `translate3d(${x}px,${-lift * 16}px,0) rotate(${-lift * 2}deg)`;
        const active = p < .34 ? 0 : p < .7 ? 1 : 2;
        s.captions.forEach((el, i) => { el.classList.toggle('is-active', i === active); el.setAttribute('aria-hidden', String(i !== active)); });
      } else {
        const w = s.board.clientWidth;
        s.cars[0].style.transform = `translate3d(${(p-.5)*w*.11}px,${-p*18}px,0) rotate(${-8+p*7}deg)`;
        s.cars[1].style.transform = `translate3d(${(.5-p)*w*.13}px,${p*9}px,0) rotate(${5-p*8}deg)`;
        s.cars[2].style.transform = `translate3d(${(p-.5)*w*.08}px,${-p*8}px,0) rotate(${-4-p*3}deg)`;
      }
    });
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pageshow', measure);
  reduced.addEventListener('change', measure);
  document.fonts?.ready.then(measure);
  measure();
  const viewer = document.querySelector('.image-viewer');
  if (!viewer || typeof viewer.showModal !== 'function') {
    document.querySelectorAll('[data-enlarge]').forEach(b => b.hidden = true); return;
  }
  document.querySelectorAll('[data-enlarge]').forEach(button => button.addEventListener('click', () => {
    const figure = button.closest('figure'), source = figure.querySelector('img');
    const target = viewer.querySelector('img'); target.src = source.currentSrc || source.src; target.alt = source.alt;
    viewer.querySelector('figcaption').textContent = figure.querySelector('figcaption b').textContent;
    viewer.showModal();
  }));
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
})();
