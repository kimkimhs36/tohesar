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
