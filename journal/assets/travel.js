/* Navigation stays native: no timers, intercepted links or persistent overlay. */
(() => {
  const root = document.documentElement;
  function clearLegacyPassage() {
    root.classList.remove('travel-leaving', 'travel-arriving');
    root.style.removeProperty('--travel-paper');
    try {
      sessionStorage.removeItem('tohesar-passage');
      sessionStorage.removeItem('tohesar-arrival');
    } catch (_) { /* Storage is optional. */ }
  }
  clearLegacyPassage();
  addEventListener('pageshow', clearLegacyPassage);
})();


/* Living Icons 030: independent decoration, never involved in navigation. */
(() => {
  if (location.pathname.startsWith('/creative/') ||
      document.querySelector('script[data-living-icons030]')) return;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '/journal/assets/border-icons030.css?v=037';
  document.head.append(css);
  const script = document.createElement('script');
  script.src = '/journal/assets/border-icons030.js?v=037';
  script.defer = true;
  script.dataset.livingIcons030 = '';
  document.head.append(script);
})();
