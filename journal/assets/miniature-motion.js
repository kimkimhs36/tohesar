(() => {
  const sequence = document.querySelector('.motion-sequence');
  if (!sequence) return;
  const root = document.documentElement;
  const board = sequence.querySelector('.drive-board');
  const track = sequence.querySelector('.drive-track');
  const path = track.querySelector('.road-outline');
  const car = sequence.querySelector('.moving-mini');
  const captions = [...sequence.querySelectorAll('[data-drive-caption]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  let geometry, queued = false, last = -1, activeScene = -1;
  function measure() {
    root.classList.toggle('motion-enabled', !reduced.matches);
    if (reduced.matches) {
      car.removeAttribute('style');
      captions.forEach(p => { p.removeAttribute('aria-hidden'); p.classList.remove('is-active'); });
      geometry = null; last = -1; activeScene = -1; return;
    }
    const rect = sequence.getBoundingClientRect();
    geometry = { top: rect.top + scrollY, distance: Math.max(1, sequence.offsetHeight - board.offsetHeight), width: track.clientWidth, height: track.clientHeight, length: path.getTotalLength() };
    last = -1; paint();
  }
  function paint() {
    queued = false;
    if (!geometry || reduced.matches) return;
    const progress = clamp((scrollY - geometry.top) / geometry.distance);
    if (progress === last) return;
    last = progress;
    // A deterministic position, never integrated velocity: reverse and fast scrolling are exact.
    const point = path.getPointAtLength(progress * geometry.length);
    const ahead = path.getPointAtLength(clamp(progress + .008) * geometry.length);
    const behind = path.getPointAtLength(clamp(progress - .008) * geometry.length);
    const dx = (ahead.x - behind.x) * geometry.width / 1000;
    const dy = (ahead.y - behind.y) * geometry.height / 280;
    const angle = clamp(Math.atan2(dy, dx) * 180 / Math.PI, -13, 13);
    car.style.transform = `translate3d(${point.x * geometry.width / 1000}px,${point.y * geometry.height / 280}px,0) translate(-50%,-82%) rotate(${angle}deg)`;
    car.style.opacity = String(.65 + .35 * clamp(progress * 10));
    sequence.dataset.progress = progress.toFixed(4);
    const scene = progress < .34 ? 0 : progress < .72 ? 1 : 2;
    if (scene !== activeScene) {
      activeScene = scene;
      captions.forEach((p, i) => { p.classList.toggle('is-active', i === scene); p.setAttribute('aria-hidden', String(i !== scene)); });
    }
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(paint); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pageshow', measure);
  reduced.addEventListener('change', measure);
  if (document.fonts) document.fonts.ready.then(measure);
  measure();
})();
