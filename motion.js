/* TOHEŞAR — micro-interactions and editorial pacing. No dependencies. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const html = document.documentElement;
  const items = [
    ['.feature-caption > div:first-child', 0],
    ['.feature-caption .feature-note', 90],
    ['.about .about-small', 0],
    ['.about h2', 70],
    ['.about p', 150],
    ['.archive .section-title', 0],
    ['.archive-grid > .visual-card', 0],
    ['.archive-side > .visual-card:first-child', 60],
    ['.archive-side > .visual-card:nth-child(2)', 0],
    ['.interlude > .eyebrow', 0],
    ['.interlude > p', 90],
    ['.interlude .interlude-bottom', 160],
    ['.closing .closing-top', 0],
    ['.closing .footer-mark', 70],
    ['.closing .footer-line', 120]
  ];
  if (!('IntersectionObserver' in window)) {
    html.classList.add('motion-ready');
    return;
  }
  // Set up before triggering opening animation so the next chapters feel continuous.
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -7% 0px', threshold: 0.04 });

  for (const [selector, delay] of items) {
    const element = document.querySelector(selector);
    if (!element) continue;
    element.style.setProperty('--reveal-delay', `${delay}ms`);
    element.classList.add('will-reveal');
    observer.observe(element);
  }
  // The rules themselves remain the 1px editorial dividers. This only draws them.
  const lineObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('line-visible');
      lineObserver.unobserve(entry.target);
    }
  }, {rootMargin:'0px 0px -12% 0px',threshold:0});
  document.querySelectorAll('.section-title,.about').forEach(el => lineObserver.observe(el));

  html.classList.add('motion-ready');

  // Initial motion is deliberately one-shot. Refreshing in the middle of a page
  // should never animate the masthead away above the viewport.
  if (window.scrollY > 100) html.classList.remove('motion-ready');
})();