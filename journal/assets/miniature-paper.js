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
  let queued = false, needsAlignment = true, previousDrift;
  function paint() {
    queued = false;
    if (needsAlignment) {
      const origin = main.getBoundingClientRect().top + scrollY;
      // Read every position before writing styles: long articles must not reflow per sheet.
      const offsets = sheets.map(sheet => sheet.getBoundingClientRect().top + scrollY - origin);
      sheets.forEach((sheet, index) => {
        sheet.style.setProperty('--miniature-paper-y', `${-((Math.round(offsets[index]) % 1650 + 1650) % 1650)}px`);
      });
      needsAlignment = false;
    }
    const drift = reduced.matches ? 0 : Math.sin(scrollY / 320) * 5;
    const value = `${drift.toFixed(2)}px`;
    if (value !== previousDrift) {
      main.style.setProperty('--miniature-drift', value);
      previousDrift = value;
    }
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
  function resize() { needsAlignment = true; schedule(); }
  function motionPreference() {
    // Reduced motion keeps the paper printed in place, without a per-scroll callback.
    removeEventListener('scroll', schedule);
    if (!reduced.matches) addEventListener('scroll', schedule, {passive:true});
    schedule();
  }
  motionPreference();
  addEventListener('resize', resize, {passive:true});
  addEventListener('load', resize, {once:true});
  reduced.addEventListener('change', motionPreference);
  // Lazy photos can change chapter positions after window load and font readiness.
  // Observe geometry, not style mutations, so our background writes cannot loop.
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(main);
  main.addEventListener('load', event => {
    if (event.target instanceof HTMLImageElement) resize();
  }, true);
  addEventListener('pageshow', resize);
  document.fonts?.ready.then(resize);
  schedule();
})();
