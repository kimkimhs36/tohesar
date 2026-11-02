/* A single observer, only for below-the-fold editorial details; openings stay authored. */
(() => {
  if (!('IntersectionObserver' in window) || !matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
  const selectors = [
    '.story-chapter h2', '.reading-chapter h2', '.type-chapter h2',
    '.es-section h2', '.es-section-image', '.type-profile', '.type-closing-photo',
    '.city-arrival-photo', '.city-blue-photo', '.city-panorama', '.city-drive-photo',
    '.article-body h2', '.article-main figure:not(.f40-article-image)'
  ];
  const targets = document.querySelectorAll(selectors.join(','));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      entry.target.classList.add('article-motion-enter');
      entry.target.addEventListener('animationend', () => entry.target.classList.remove('article-motion-enter'), {once:true});
    });
  }, {threshold: 0.08});
  targets.forEach(target => {
    if (target.getBoundingClientRect().top > innerHeight + 24) observer.observe(target);
  });
})();
