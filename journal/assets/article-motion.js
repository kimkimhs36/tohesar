/* One observer for quiet, once-only reading details. Openings and authored studies stay still. */
(() => {
  if (!('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const selectors = [
    '.story-chapter h2', '.chapter-body > p', '.reading-chapter h2', '.reading-column > p',
    '.type-chapter h2', '.type-columns > div > p', '.type-reading > p', '.language-layout > div > p',
    '.es-section h2', '.es-section p', '.es-section-image',
    '.city-chapter-heading h2', '.city-prose > p', '.city-printed-paragraph',
    '.article-body > h2', '.article-body > p', 'main figure',
    '.story-sources > p', '.giulia-sources > p', '.type-sources > p',
    '.es-sources-inner > h2', '.es-source-list > li',
    '.article-return026 > p', '.article-return026 > h2'
  ];
  const protectedScenes = [
    '.story-intro', '.story-hero', '.f40-hero', '.f40-article-image',
    '.giulia-opening', '.type-opening', '.type-hero', '.es-opening', '.es-hero',
    '.city-opening', '.article-intro', '.article-cover',
    '.motion-sequence', '.design-study', '[data-design-study]', '[data-proportion-study]',
    '.wallpaper-art', '[data-wallpaper-car]'
  ].join(',');
  const candidates = [...document.querySelectorAll(selectors.join(','))].filter(target => {
    if (target.closest(protectedScenes)) return false;
    // A photo and its caption move as one unit; never animate nested targets twice.
    return !target.parentElement?.closest('figure,.es-section-image');
  });
  const seen = new WeakSet();
  const active = new Map();
  function finish(target) {
    const cleanup = active.get(target);
    if (cleanup) {
      target.removeEventListener('animationend', cleanup);
      target.removeEventListener('animationcancel', cleanup);
      active.delete(target);
    }
    target.classList.remove('article-motion-enter');
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => {
      if (!isIntersecting || reduced.matches) return;
      observer.unobserve(target);
      seen.add(target);
      const cleanup = () => finish(target);
      active.set(target, cleanup);
      target.addEventListener('animationend', cleanup);
      target.addEventListener('animationcancel', cleanup);
      target.classList.add('article-motion-enter');
    });
  }, {threshold: 0.06});
  function configure() {
    observer.disconnect();
    if (reduced.matches) {
      [...active.keys()].forEach(finish);
      return;
    }
    // Never replay the first screen, restored scroll position, or something already read.
    candidates.forEach(target => {
      if (seen.has(target)) return;
      if (target.getBoundingClientRect().top > innerHeight + 24) observer.observe(target);
      else seen.add(target);
    });
  }
  reduced.addEventListener('change', configure);
  addEventListener('pagehide', () => {
    observer.disconnect();
    [...active.keys()].forEach(finish);
  });
  addEventListener('pageshow', configure);
  configure();
})();
