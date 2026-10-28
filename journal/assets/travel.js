(() => {
  const root = document.documentElement;
  // A resize or rapid history traversal may legitimately cancel a native transition.
  addEventListener('pagereveal', event => {
    if (event.viewTransition) {
      event.viewTransition.ready.catch(() => {});
      event.viewTransition.finished.catch(() => {});
    }
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const veil = document.createElement('div'); veil.className = 'travel-veil'; veil.setAttribute('aria-hidden','true'); document.body.append(veil);
  let timer, leaving = false;
  function reset() { clearTimeout(timer); leaving = false; root.classList.remove('travel-leaving','travel-arriving'); }
  addEventListener('pageshow', reset);
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('travel-arriving')));
  document.addEventListener('click', event => {
    const a = event.target.closest('a[data-travel]');
    if (!a || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || a.target || a.download || reduced.matches) return;
    const target = new URL(a.href, location.href);
    if (target.origin !== location.origin || target.href === location.href || (target.pathname === location.pathname && target.hash)) return;
    event.preventDefault(); if (leaving) return; leaving = true;
    try { sessionStorage.setItem('tohesar-arrival', String(Date.now())); } catch {}
    root.classList.add('travel-leaving');
    timer = setTimeout(() => location.assign(target.href), 180);
  });
})();
