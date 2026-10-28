/* Scroll is native. Progress directly determines the reveal, accent and annotation.
   Photographs keep their full frames; no registration, mirroring or shape morphing. */
(() => {
  const scene = document.querySelector('[data-design-study]');
  if (!scene) return;
  const board = scene.querySelector('.study-board');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const short = matchMedia('(max-height: 600px)');
  const captions = [...scene.querySelectorAll('[data-study-caption]')];
  const controls = scene.querySelector('.study-controls');
  const buttons = [...scene.querySelectorAll('[data-study-go]')];
  let enabled = false, top = 0, distance = 1, queued = false;
  const clamp = x => Math.min(1, Math.max(0, x));
  function paint() {
    queued = false;
    if (!enabled) return;
    const p = clamp((scrollY - top) / distance);
    const index = p < .32 ? 0 : p < .69 ? 1 : 2;
    scene.dataset.progress = p.toFixed(4);
    scene.dataset.scene = String(index);
    scene.style.setProperty('--study-reveal', `${15 + clamp(p / .72) * 85}%`);
    scene.style.setProperty('--study-shift', (Math.sin(p * Math.PI) * 16).toFixed(3));
    scene.style.setProperty('--study-progress', `${p * 100}%`);
    captions.forEach((c, i) => c.classList.toggle('is-current', i === index));
    buttons.forEach((b, i) => b.setAttribute('aria-current', String(i === index)));
    scene.querySelector('.study-step').textContent = ['01 / CONCEPT', '02 / TRANSLATION', '03 / PRODUCTION DESIGN'][index];
  }
  function schedule() {if (!queued) {queued = true; requestAnimationFrame(paint);}}
  function measure() {
    enabled = !reduced.matches && !short.matches;
    scene.classList.toggle('study-enabled', enabled);
    controls.hidden = !enabled;
    scene.dataset.progress = '0';
    if (enabled) {
      top = scene.getBoundingClientRect().top + scrollY;
      distance = Math.max(1, scene.offsetHeight - board.offsetHeight);
    }
    schedule();
  }
  buttons.forEach(b => b.addEventListener('click', () => {
    if (enabled) scrollTo({top:top + distance * Number(b.dataset.studyGo), behavior:'auto'});
  }));
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', measure, {passive:true});
  addEventListener('pageshow', measure);
  reduced.addEventListener('change', measure);
  short.addEventListener('change', measure);
  document.fonts.ready.then(measure);
  measure();
})();
