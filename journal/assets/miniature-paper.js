/* Align one miniature paper through the reading, with a small scroll-led drift. */
(() => {
  const main = document.querySelector('main');
  if (!main) return;
  const sheets = [...main.querySelectorAll('.story-intro,.wallpaper-paper,.story-sources,.next-story,.giulia-opening,.opening-text,.reading-chapter,.giulia-sources,.giulia-related,.edition-opening,.edition-preface,.edition-chapter,.type-opening,.type-lead,.type-chapter,.type-language,.type-comparison,.type-sources,.type-related,.shape-note,.air-sequence,.proportion-intro,.proportion-study,.static-proportions,.surface-plate,.face-diptych,.giulia-pullquote,.edition-closing,.type-study-intro,.design-study')];
  // One quiet miniature in the source area; the opening remains untouched.
  const end = main.querySelector('.story-sources,.giulia-sources,.type-sources,.edition-closing');
  if (end && !end.querySelector('.miniature-end-car')) {
    const car = document.createElement('span');
    car.className = 'miniature-end-car';
    car.setAttribute('aria-hidden', 'true');
    end.appendChild(car);
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false, needsAlignment = true;
  function paint() {
    queued = false;
    if (needsAlignment) {
      const origin = main.getBoundingClientRect().top + scrollY;
      sheets.forEach(sheet => {
        const y = sheet.getBoundingClientRect().top + scrollY - origin;
        sheet.style.setProperty('--miniature-paper-y', `${-((Math.round(y) % 1650 + 1650) % 1650)}px`);
      });
      needsAlignment = false;
    }
    const drift = reduced.matches ? 0 : Math.sin(scrollY / 320) * 5;
    main.style.setProperty('--miniature-drift', `${drift.toFixed(2)}px`);
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
  function resize() { needsAlignment = true; schedule(); }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', resize, {passive:true});
  addEventListener('load', resize, {once:true});
  reduced.addEventListener('change', schedule);
  document.fonts?.ready.then(resize);
  schedule();
})();
