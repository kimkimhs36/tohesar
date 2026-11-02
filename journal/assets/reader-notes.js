/* Explanations remain visible without JavaScript. Controls are enabled only after setup. */
(() => {
  const notes = [...document.querySelectorAll('.term-note')].map(note => ({
    note, button: note.querySelector('.term-trigger'), fallback: note.querySelector('.term-fallback'),
    definition: note.querySelector('.term-definition')
  })).filter(item => item.button && item.fallback && item.definition && item.button.getAttribute('aria-controls') === item.definition.id);
  if (!notes.length) return;
  let open = null;
  function close(restoreFocus = false) {
    if (!open) return;
    const item = open;
    item.button.setAttribute('aria-expanded', 'false');
    item.definition.hidden = true;
    open = null;
    if (restoreFocus) item.button.focus();
  }
  for (const item of notes) {
    item.definition.hidden = true;
    item.fallback.hidden = true;
    item.button.hidden = false;
    item.button.addEventListener('click', () => {
      if (open === item) { close(); return; }
      close();
      item.definition.hidden = false;
      item.button.setAttribute('aria-expanded', 'true');
      open = item;
    });
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); close(true); }
  });
  document.addEventListener('click', event => { if (open && !open.note.contains(event.target)) close(); });
  addEventListener('pageshow', () => close());
})();
