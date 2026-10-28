/* No wheel/touch interception, smoothing loop, canvas or SVG morphing.
   Geometry is measured only on resize; scroll only schedules a single paint. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sequence = document.querySelector('.sequence');
  const stage = document.querySelector('.stage');
  const windowFrame = document.querySelector('.photo-window');
  const photo = document.querySelector('.cover-photo');
  const word = document.querySelector('.wordmark');
  const nav = document.querySelector('.navigation');
  const signature = document.querySelector('.signature');
  let geometry;
  let queued = false;
  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (a, b, p) => a + (b - a) * p;
  const phase = (p, a, b) => {
    const t = clamp((p - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const set = (name, value) => root.style.setProperty(`--${name}`, value);

  function measure() {
    if (reduced.matches) return;
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const wide = w >= 760 && w > h;
    const edge = parseFloat(getComputedStyle(nav).left);
    const top = parseFloat(getComputedStyle(nav).top);
    const target = wide
      ? { x: w * .05, y: h * .16, w: w * .60, h: h * .69 }
      : { x: edge, y: Math.max(top + 64, h * .12), w: w - edge * 2, h: Math.min(h * .49, (w - edge * 2) * 1.12) };
    geometry = {
      w, h, wide, edge, top, target,
      start: sequence.offsetTop,
      distance: sequence.offsetHeight - h,
      wordX: word.offsetLeft + word.offsetWidth * .625,
      wordY: word.offsetTop + word.offsetHeight * .90,
      headerX: edge + 12,
      headerY: top + 22
    };
    set('caption-bottom', `${h - target.y - target.h - 25}px`);
    set('editorial-top', `${target.y + target.h + 68}px`);
    paint();
  }

  function paint() {
    queued = false;
    if (!geometry || reduced.matches) return;
    const g = geometry;
    const p = clamp((window.scrollY - g.start) / g.distance);
    const framing = phase(p, .18, .90);
    const withdrawal = phase(p, .035, .55);
    const transfer = withdrawal;
    const x = mix(0, g.target.x, framing);
    const y = mix(0, g.target.y, framing);
    const w = mix(g.w, g.target.w, framing);
    const h = mix(g.h, g.target.h, framing);

    // A changing photographic aperture reveals the unprinted paper around it.
    // The image remains one intact photograph; the car never becomes a cutout.
    windowFrame.style.clipPath = `inset(${y}px ${g.w - x - w}px ${g.h - y - h}px ${x}px)`;
    photo.style.width = `${w}px`;
    photo.style.height = `${Math.min(h, g.w * 1.58)}px`;
    photo.style.left = `${x}px`;
    photo.style.bottom = `${g.h - y - h}px`;
    // In the editorial plate the full source replaces the tall-cover crop.
    photo.style.objectPosition = g.wide ? `50% ${mix(64, 65, framing)}%` : '85% 100%';
    photo.style.setProperty('--sky-feather', `${g.wide ? 0 : 18 * clamp((h - Math.min(h, g.w * 1.58)) / 60)}%`);
    set('word-x', `${(g.headerX - g.wordX) * withdrawal}px`);
    set('word-y', `${(g.headerY - g.wordY) * withdrawal}px`);
    set('word-scale', mix(1, .12, withdrawal));
    set('word-opacity', 1 - phase(p, .13, .43));
    set('transfer-x', `${mix(g.wordX, g.headerX, transfer) - 13}px`);
    set('transfer-y', `${mix(g.wordY, g.headerY, transfer) - 13}px`);
    set('transfer-scale', mix(.45, 1, phase(p, .33, .55)));
    set('transfer-opacity', phase(p, .33, .43) * (1 - phase(p, .55, .59)));
    signature.style.opacity = phase(p, .55, .59);
    signature.style.visibility = p > .55 ? 'visible' : 'hidden';
    const ink = phase(p, .26, .40);
    nav.style.color = `rgb(${mix(248, 39, ink)} ${mix(242, 43, ink)} ${mix(231, 56, ink)})`;
    set('cue-opacity', 1 - phase(p, 0, .16));
    set('cue-y', `${-18 * phase(p, 0, .2)}px`);
    set('cue-visibility', p > .18 ? 'hidden' : 'visible');
    set('caption-opacity', phase(p, .65, .88));
    set('caption-y', `${8 * (1 - phase(p, .65, .88))}px`);
    set('editorial-opacity', phase(p, .66, .98));
    set('editorial-y', `${28 * (1 - phase(p, .66, .98))}px`);
    set('editorial-visibility', p > .66 ? 'visible' : 'hidden');
  }

  function schedule() {
    if (!queued && !reduced.matches) {
      queued = true;
      requestAnimationFrame(paint);
    }
  }

  function configure() {
    root.classList.toggle('motion', !reduced.matches);
    if (reduced.matches) {
      root.removeAttribute('style');
      [nav, signature, windowFrame, photo].forEach(el => el.removeAttribute('style'));
    } else measure();
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  reduced.addEventListener('change', configure);
  configure();
})();
