(() => {
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const items = [...document.querySelectorAll('[data-topic]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    items.forEach(item => item.hidden = button.dataset.filter !== 'all' && item.dataset.topic !== button.dataset.filter);
    document.querySelector('#news-count').textContent = `${items.filter(item => !item.hidden).length}개의 기록`;
  }));
})();
