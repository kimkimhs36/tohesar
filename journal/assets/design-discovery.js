/* Progressive enhancement: the generated list and links remain the baseline. */
(() => {
  const root = document.querySelector('.atlas-explore');
  if (!root) return;
  try {
    const items = JSON.parse(document.getElementById('discovery-index').textContent);
    const controls = root.querySelector('[data-discovery-controls]');
    const input = root.querySelector('input[name=q]');
    const cards = [...root.querySelectorAll('[data-content-id]')];
    const buttons = [...root.querySelectorAll('[data-form]')];
    const validForms = new Set(buttons.map(b => b.dataset.form));
    const list = document.getElementById('design-results');
    const count = document.getElementById('result-count');
    const empty = document.getElementById('design-empty');
    const normalize = s => s.normalize('NFKC').toLocaleLowerCase().replace(/[\s\-–—]/g, '');
    const index = new Map(items.map(i => [i.id, {...i, haystack: normalize(i.search_text)}]));
    let form = 'all';
    function render() {
      const terms = input.value.trim().split(/\s+/).filter(Boolean).map(normalize);
      let shown = 0;
      for (const card of cards) {
        const item = index.get(card.dataset.contentId);
        const match = item && (form === 'all' || item.forms.includes(form)) && terms.every(t => item.haystack.includes(t));
        card.hidden = !match;
        if (match) shown++;
      }
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.form === form)));
      list.classList.toggle('is-filtered', form !== 'all' || terms.length > 0);
      count.textContent = `${shown}개의 이야기 / 전체 ${items.length}`;
      empty.hidden = shown > 0;
    }
    function readURL() {
      const params = new URL(location.href).searchParams;
      input.value = (params.get('q') || '').slice(0, 100);
      form = validForms.has(params.get('form')) ? params.get('form') : 'all';
      render();
    }
    function saveURL() {
      const url = new URL(location.href);
      const q = input.value.trim();
      if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
      if (form !== 'all') url.searchParams.set('form', form); else url.searchParams.delete('form');
      // Real committed actions form history entries; typing previews results only.
      url.hash = 'explore';
      if (url.href !== location.href) history.pushState(null, '', url);
      render();
    }
    root.querySelector('form').addEventListener('submit', e => {e.preventDefault(); saveURL();});
    input.addEventListener('input', render);
    input.addEventListener('change', saveURL);
    buttons.forEach(b => b.addEventListener('click', () => {form = b.dataset.form; saveURL();}));
    root.querySelector('[data-reset]').addEventListener('click', () => {input.value = ''; form = 'all'; saveURL(); input.focus({preventScroll:true});});
    addEventListener('popstate', readURL);
    addEventListener('pageshow', readURL);
    controls.hidden = false;
    readURL();
  } catch (error) {
    root.querySelector('[data-search-error]').hidden = false;
    // Preserve the complete static collection if enhancement cannot initialize.
    root.querySelectorAll('[data-content-id]').forEach(el => el.hidden = false);
  }
})();
