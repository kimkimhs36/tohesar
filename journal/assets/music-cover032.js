/* TOHEŞAR 032 — opt-in Apple Music official embed, independent of COVER 004 motion. */
(() => {
  'use strict';
  const stage = document.querySelector('#cover .stage');
  if (!stage || document.getElementById('thz-music032-panel')) return;

  // Official Apple Music song URL: Random Access Memories (2013).
  // Never proxy, extract, download or autoplay copyrighted audio.
  const songUrl = 'https://music.apple.com/us/song/617154366';
  const embedUrl = 'https://embed.music.apple.com/us/song/617154366';

  const root = document.createElement('div');
  root.className = 'thz-music032';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'thz-music032-toggle';
  toggle.textContent = '♫';
  toggle.setAttribute('aria-label', 'Apple Music 플레이어 열기');
  toggle.setAttribute('aria-controls', 'thz-music032-panel');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('title', '음악 감상');

  const panel = document.createElement('section');
  panel.className = 'thz-music032-panel';
  panel.id = 'thz-music032-panel';
  panel.setAttribute('aria-label', 'Apple Music — Get Lucky');
  panel.hidden = true;

  const title = document.createElement('p');
  title.className = 'thz-music032-title';
  title.textContent = 'Daft Punk — Get Lucky';

  const note = document.createElement('div');
  note.className = 'thz-music032-note';
  const hint = document.createElement('span');
  hint.textContent = 'Apple Music에서 재생';
  const direct = document.createElement('a');
  direct.href = songUrl;
  direct.target = '_blank';
  direct.rel = 'noopener noreferrer';
  direct.textContent = '곡 열기';
  note.append(hint, direct);
  panel.append(title, note);

  const open = () => {
    if (!panel.hidden) return;
    const frame = document.createElement('iframe');
    frame.className = 'thz-music032-iframe';
    frame.title = 'Get Lucky — Apple Music 공식 플레이어';
    frame.src = embedUrl;
    frame.loading = 'lazy';
    frame.allow = 'autoplay *; encrypted-media *; fullscreen *; clipboard-write';
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    panel.insertBefore(frame, note);
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Apple Music 플레이어 닫기');
  };
  const close = () => {
    if (panel.hidden) return;
    panel.hidden = true;
    const frame = panel.querySelector('iframe');
    if (frame) frame.remove(); // Also ends playback without attempting to control Apple audio.
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Apple Music 플레이어 열기');
  };

  toggle.addEventListener('click', () => panel.hidden ? open() : close());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      close();
      toggle.focus();
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!panel.hidden && !root.contains(event.target)) close();
  });

  root.append(toggle, panel);
  stage.append(root);
})();
