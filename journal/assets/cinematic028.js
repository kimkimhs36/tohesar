/* A photograph is shared only for the actual home image link being followed.
   Navigation is never intercepted; storage is a short-lived hand-off, not state. */
(() => {
  if (!('onpageswap' in window) || !('onpagereveal' in window)) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'tohesar-photo-passage-028';
  const stories = {
    '/journal/f40/': { id: 'f40', home: '.home-feature-image img', photo: '.f40-hero > img', title: '.story-intro' },
    '/journal/design/giulia/': { id: 'giulia', home: '.home-pair article:nth-child(1) > a img', photo: '.giulia-hero > img', title: '.giulia-name' },
    '/journal/design/type-01/': { id: 'jaguar', home: '.home-pair article:nth-child(2) > a img', photo: '.type-hero > img', title: '.type-opening-paper' }
  };
  let selected = null;
  const clear = () => {
    document.querySelectorAll('[data-cinematic-shared]').forEach(el => {
      el.style.removeProperty('view-transition-name');
      el.removeAttribute('data-cinematic-shared');
    });
    root.removeAttribute('data-cinematic');
    root.removeAttribute('data-cinematic-direction');
  };
  const name = (el, value) => {
    el.style.viewTransitionName = value;
    el.setAttribute('data-cinematic-shared', '');
  };
  const readPassage = () => {
    try {
      const value = JSON.parse(sessionStorage.getItem(key));
      sessionStorage.removeItem(key);
      return value;
    } catch (_) { return null; }
  };
  document.addEventListener('click', event => {
    selected = null;
    if (location.pathname !== '/' || reduced.matches || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a');
    if (!link || link.target || link.hasAttribute('download')) return;
    const target = new URL(link.href, location.href);
    const story = target.origin === location.origin && stories[target.pathname];
    const photo = story && document.querySelector(story.home);
    if (photo && link.contains(photo) && photo.complete && photo.naturalWidth) selected = { path: target.pathname, photo };
  });
  addEventListener('pageswap', event => {
    // A destination may not opt in, or a rapid back navigation may abort the transition.
    // Observe both promises even when no shared photograph was selected.
    event.viewTransition?.ready.catch(() => {});
    event.viewTransition?.finished.catch(() => {});
    clear();
    // A stale or interrupted click must never supply a later navigation.
    try { sessionStorage.removeItem(key); } catch (_) {}
    if (!event.viewTransition || reduced.matches || !selected) return;
    const destination = event.activation && event.activation.entry && event.activation.entry.url;
    if (!destination || new URL(destination).pathname !== selected.path) return;
    const story = stories[selected.path];
    root.dataset.cinematic = story.id;
    root.dataset.cinematicDirection = 'out';
    name(selected.photo, 'journal-photo');
    try { sessionStorage.setItem(key, JSON.stringify({ path: selected.path, time: Date.now() })); } catch (_) {
      clear();
      return;
    }
    event.viewTransition.finished.finally(clear).catch(() => {});
    selected = null;
  });
  addEventListener('pagereveal', event => {
    event.viewTransition?.ready.catch(() => {});
    event.viewTransition?.finished.catch(() => {});
    clear();
    const passage = readPassage();
    const story = stories[location.pathname];
    const from = window.navigation && navigation.activation && navigation.activation.from && navigation.activation.from.url;
    if (!event.viewTransition || reduced.matches || !story || !passage || passage.path !== location.pathname || Date.now() - passage.time > 4000 || !from || new URL(from).pathname !== '/') return;
    const photo = document.querySelector(story.photo);
    // Never animate an empty or partially decoded replacement image.
    if (!photo || !photo.complete || !photo.naturalWidth) {
      event.viewTransition.ready.catch(() => {});
      event.viewTransition.skipTransition();
      return;
    }
    root.dataset.cinematic = story.id;
    root.dataset.cinematicDirection = 'in';
    name(photo, 'journal-photo');
    const title = document.querySelector(story.title);
    if (title) name(title, 'journal-title');
    event.viewTransition.finished.finally(clear).catch(() => {});
  });
  addEventListener('pageshow', event => { if (event.persisted) { selected = null; clear(); } });
})();
