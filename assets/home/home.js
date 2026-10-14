/* Homepage editorial interactions. Destination pages remain independent. */
const menu = document.querySelector('#menu');
document.querySelector('.menu-toggle').addEventListener('click', () => menu.showModal());
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.close()));
const stories = {
  coast: { title: 'Coastal hours.', kicker: '002 / THE COAST', image: 'assets/coast.webp', alt: 'Coastal hours visual study', copy: 'A series of imagined views from the edge of the sea, where the road gives way to the horizon. An editorial visual study created for TOHEŞAR.' },
  detail: { title: 'The small things.', kicker: '003 / MATERIAL & FORM', image: 'assets/detail.webp', alt: 'Automotive detail visual study', copy: 'An exploration of the details that give objects their character — light, material, reflection and form.' },
  bluehour: { title: 'After the light.', kicker: '004 / BLUE HOUR', image: 'assets/yokohama-bluehour.webp', alt: 'A silver Porsche at Yokohama harbor after dusk', copy: 'Blue settles over the waterfront. A silver car remains by the water as the city lights begin to take over. An independently generated visual study for TOHEŞAR.' }
};
const storyDialog = document.querySelector('#story-dialog');
document.querySelectorAll('[data-story]').forEach(button => button.addEventListener('click', () => {
  const story = stories[button.dataset.story];
  document.querySelector('#dialog-title').textContent = story.title;
  document.querySelector('#dialog-kicker').textContent = story.kicker;
  document.querySelector('#dialog-copy').textContent = story.copy;
  const image = document.querySelector('#dialog-image'); image.src = story.image; image.alt = story.alt;
  storyDialog.showModal();
}));
storyDialog.addEventListener('click', event => { const rect = storyDialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) storyDialog.close(); });
