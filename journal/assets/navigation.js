(() => {
  const menu = document.querySelector('.journal-index');
  if (!menu) return;
  const summary = menu.querySelector('summary');
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
  });
  document.addEventListener('click', e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.open = false));
  addEventListener('pageshow', () => menu.open = false);
})();
