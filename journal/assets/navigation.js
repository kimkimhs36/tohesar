(() => {
  const menu = document.querySelector('.journal-index');
  if (!menu) return;
  const summary = menu.querySelector('summary');
  const path = location.pathname;
  const section = path.startsWith('/edition/') || path.startsWith('/journal/news/') ? '/edition/' :
    /^\/journal\/(explore|design|visual|miniatures|yokohama)\//.test(path) ? '/journal/explore/' :
    path.startsWith('/journal/') ? '/journal/' : path.startsWith('/sitemap/') ? '/sitemap/' : '/';
  const active = menu.querySelector(`a[href="${section}"]`);
  if (active) active.setAttribute('aria-current', 'page');
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
  });
  document.addEventListener('click', e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.open = false));
  addEventListener('pageshow', () => menu.open = false);
})();
