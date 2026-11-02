(() => {
  const menu = document.querySelector('.journal-index');
  if (!menu) return;
  const summary = menu.querySelector('summary');
  const path = location.pathname;
  const section = path.startsWith('/edition/') || path.startsWith('/journal/news/') ? '/edition/' :
    /^\/journal\/(explore|design|visual|miniatures|yokohama)\//.test(path) ? '/journal/explore/' :
    path.startsWith('/journal/') ? '/journal/' : path.startsWith('/sitemap/') ? '/sitemap/' : '/';
  const active = menu.querySelector(`a[href="${section}"]`);
  // A section link represents the current location, not necessarily this page.
  if (active) active.setAttribute('aria-current', active.pathname === path ? 'page' : 'location');
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
  });
  document.addEventListener('click', e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  // Keyboard users can leave the disclosure without leaving an obscuring panel open.
  menu.addEventListener('focusout', e => {
    if (menu.open && e.relatedTarget && !menu.contains(e.relatedTarget)) menu.open = false;
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.open = false));
  addEventListener('pageshow', () => menu.open = false);
})();
