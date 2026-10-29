/* Scroll decorates an already complete static composition. No loop at rest. */
(() => {
  const scenes = [...document.querySelectorAll('[data-wallpaper]')].map(el => ({
    el, cars: [...el.querySelectorAll('[data-wallpaper-car]')].map(el => {
      const css = getComputedStyle(el);
      return {el, x: +css.getPropertyValue('--dx'), y: +css.getPropertyValue('--dy'),
        turn: +css.getPropertyValue('--turn'), r: +css.getPropertyValue('--r')};
    })
  }));
  if (!scenes.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  function paint() {
    queued = false;
    for (const s of scenes) {
      if (reduced.matches) {
        s.cars.forEach(c => c.el.style.removeProperty('transform'));
        delete s.el.dataset.progress;
        continue;
      }
      const rect = s.el.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > innerHeight + 100) continue;
      const p = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
      const t = p * 2 - 1;
      s.el.dataset.progress = p.toFixed(5);
      for (const c of s.cars) {
        if (!c.x && !c.y && !c.turn) continue; // Some motifs stay printed in place.
        c.el.style.transform = `translate(-50%,-50%) translate3d(${(c.x*t).toFixed(3)}px,${(c.y*Math.sin(t*Math.PI/2)).toFixed(3)}px,0) rotate(${(c.r+c.turn*t).toFixed(3)}deg)`;
      }
    }
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  addEventListener('orientationchange', schedule);
  addEventListener('pageshow', schedule);
  addEventListener('load', schedule);
  reduced.addEventListener('change', schedule);
  window.visualViewport?.addEventListener('resize', schedule, {passive:true});
  document.fonts?.ready.then(schedule);
  schedule();
})();
