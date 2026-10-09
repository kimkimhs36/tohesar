/* TOHEŞAR / Camera Study 001. One photographic scene, guided parallax.
   No gyroscope permission, new images, tracking, or animation dependency. */
(() => {
  'use strict';
  const scene = document.querySelector('[data-camera-study]');
  const img = scene?.querySelector('picture img');
  if (!scene || !img) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;
  scene.classList.add('camera-ready');

  const instruction = document.querySelector('[data-camera-instruction]');
  if (instruction) instruction.textContent = window.matchMedia('(pointer: coarse)').matches
    ? '↔ DRAG TO LOOK' : '↔ MOVE TO LOOK';

  let active = false, dragging = false, raf = 0, lastPaint = 0;
  let x = 0, y = 0, targetX = 0, targetY = 0, scrollY = 0;
  let sunlightX = 73, sunlightY = 31;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function point(clientX, clientY) {
    const rect = scene.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = clamp((clientX - rect.left) / rect.width, 0, 1);
    const ny = clamp((clientY - rect.top) / rect.height, 0, 1);
    targetX = (0.5 - nx) * Math.min(18, rect.width * 0.027);
    targetY = (0.5 - ny) * Math.min(12, rect.height * 0.020);
    sunlightX = 73 + (nx - .5) * 6;
    sunlightY = 31 + (ny - .5) * 4;
  }

  function scrollPosition() {
    const rect = scene.getBoundingClientRect();
    const normalized = clamp((rect.top + rect.height * .5 - innerHeight * .5) / (innerHeight + rect.height), -.5, .5);
    scrollY = -normalized * 11;
  }

  function paint(now) {
    if (!active || document.hidden || motion.matches) { raf = 0; return; }
    raf = requestAnimationFrame(paint);
    if (now - lastPaint < 30) return; // ~30fps is enough for a slow photograph.
    lastPaint = now;
    const breathing = Math.sin(now / 9000) * 1.15;
    x += (targetX + breathing - x) * .085;
    y += (targetY + scrollY - y) * .085;
    img.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(1.115)`;
    scene.style.setProperty('--camera-light-x', sunlightX.toFixed(2) + '%');
    scene.style.setProperty('--camera-light-y', sunlightY.toFixed(2) + '%');
  }

  function start() { if (active) return; active = true; if (!raf) raf = requestAnimationFrame(paint); }
  function stop() { active = false; cancelAnimationFrame(raf); raf = 0; }

  scene.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
    dragging = true;
    scene.classList.add('camera-dragging');
    point(e.clientX, e.clientY);
  });
  scene.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' || dragging) point(e.clientX, e.clientY);
  }, {passive:true});
  function reset(){ dragging = false; targetX = 0; targetY = 0; sunlightX = 73; sunlightY = 31; scene.classList.remove('camera-dragging'); }
  scene.addEventListener('pointerup', reset);
  scene.addEventListener('pointercancel', reset);
  scene.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') reset(); });

  // Accessible optional arrow-key navigation. The photograph is focusable.
  scene.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') targetX = clamp(targetX + 5, -16, 16);
    else if (e.key === 'ArrowRight') targetX = clamp(targetX - 5, -16, 16);
    else if (e.key === 'ArrowUp') targetY = clamp(targetY + 5, -12, 12);
    else if (e.key === 'ArrowDown') targetY = clamp(targetY - 5, -12, 12);
    else if (e.key === 'Home') reset();
    else return;
    e.preventDefault();
  });

  window.addEventListener('scroll', scrollPosition, {passive:true});
  window.addEventListener('resize', scrollPosition, {passive:true});
  document.addEventListener('visibilitychange', () => { if (!document.hidden && active && !raf) raf = requestAnimationFrame(paint); });
  motion.addEventListener?.('change', () => { if (motion.matches) { stop(); reset(); scene.classList.remove('camera-ready'); img.style.transform = ''; if (instruction) instruction.textContent = 'AN IMAGINED ENCOUNTER'; } });
  scrollPosition();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) start(); else stop();
    }, {threshold:0, rootMargin:'70px 0px 70px 0px'});
    observer.observe(scene);
  } else start();
})();