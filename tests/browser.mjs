/**
 * TOHEŞAR browser acceptance checks.
 * Run a static server first, then: node tests/browser.mjs
 * Optional: TOHESAR_BASE_URL, TOHESAR_EVIDENCE_DIR, TOHESAR_BROWSER=webkit,
 * TOHESAR_CHROMIUM_PATH, TOHESAR_TEST_FILTER (regular expression). Playwright can be installed locally or provided by Codex.
 * Screenshots and JSON evidence are generated outside the source tree by default.
 * These checks exercise rendered experiences; they do not establish artistic quality.
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }
const base = process.env.TOHESAR_BASE_URL || 'http://127.0.0.1:8080';
const evidence = process.env.TOHESAR_EVIDENCE_DIR || '/tmp/tohesar-browser-evidence';
const engine = process.env.TOHESAR_BROWSER || 'chromium';
fs.mkdirSync(evidence, { recursive: true });
const launch = engine === 'chromium' ? {
  executablePath: process.env.TOHESAR_CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-certificate-errors'],
} : {};
const browser = await playwright[engine].launch({ headless: true, ...launch });
const report = { date: new Date().toISOString(), base, engine, tests: [], notes: [
  'Chromium uses software WebGL in this environment; frame rate is not a device benchmark.',
  'Mobile emulation is not verification on a physical iPhone or iOS Safari.',
] };

let currentDetail = {};
async function check(name, run) {
  if (process.env.TOHESAR_TEST_FILTER && !new RegExp(process.env.TOHESAR_TEST_FILTER).test(name)) return;
  const started = Date.now(); currentDetail = {};
  try {
    const detail = await run();
    report.tests.push({ name, passed: true, durationMs: Date.now() - started, ...detail });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.tests.push({ name, passed: false, durationMs: Date.now() - started, error: error.stack, ...currentDetail });
    console.error(`FAIL ${name}: ${error.message}`);
  }
  fs.writeFileSync(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2));
}

async function context(device = 'desktop', reducedMotion = 'no-preference') {
  return browser.newContext({
    viewport: device === 'desktop' ? { width: 1440, height: 1000 } : { width: 390, height: 844 },
    deviceScaleFactor: 1, hasTouch: device === 'mobile', isMobile: engine !== 'firefox' && device === 'mobile',
    reducedMotion, ignoreHTTPSErrors: true,
  });
}

function observe(page) {
  const errors = [], failedRequests = [], responses = [];
  page.on('pageerror', error => errors.push({ kind: 'exception', text: error.message }));
  page.on('console', message => {
    if (message.type() === 'error') errors.push({ kind: 'console', text: message.text() });
  });
  page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('response', response => { if (response.status() >= 400) responses.push({ url: response.url(), status: response.status() }); });
  const events = { errors, failedRequests, responses }; currentDetail.events = events; return events;
}

async function instrument(page) {
  await page.addInitScript(() => {
    window.__testGL = [];
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      const result = getContext.call(this, kind, ...args);
      if (result && (kind === 'webgl' || kind === 'webgl2' || kind === 'experimental-webgl') && !window.__testGL.includes(result)) {
        window.__testGL.push(result);
      }
      return result;
    };
  });
}

const stage = route => route === 'world' ? '#world-stage' : '#sculpture-stage';
const canvas = route => route === 'world' ? '#world-canvas' : '#sculpture-canvas';
const stateGlobal = route => route === 'world' ? '__TOHESAR_WORLD' : '__TOHESAR_SYMBOL';
async function load(page, route, expected = 'ready') {
  const response = await page.goto(`${base}/${route === 'home' ? '' : route + '/'}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  assert.equal(response?.status(), 200, 'Route must respond successfully');
  if (route !== 'home') await page.waitForFunction(({ selector, expected }) => document.querySelector(selector)?.dataset.state === expected,
    { selector: stage(route), expected }, { timeout: 45000 });
  else await page.locator('main').waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function renderDetail(page, route) {
  return page.evaluate(({ selector, key }) => {
    const art = document.querySelector(selector);
    const context = window.__testGL?.find(gl => gl.canvas === art);
    const object = window[key];
    return {
      canvas: art && { width: art.width, height: art.height, cssWidth: art.clientWidth, cssHeight: art.clientHeight },
      webglContexts: window.__testGL?.length || 0,
      contextLost: context ? context.isContextLost() : null,
      glError: context ? context.getError() : null,
      renderer: object?.renderer ? {
        calls: object.renderer.info.render.calls, triangles: object.renderer.info.render.triangles,
        geometries: object.renderer.info.memory.geometries, textures: object.renderer.info.memory.textures,
        pixelRatio: object.renderer.getPixelRatio(),
      } : null,
      camera: object?.camera ? object.camera.position.toArray() : null,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      missingImages: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src),
    };
  }, { selector: canvas(route), key: stateGlobal(route) });
}
async function cameraPosition(page, route) {
  return page.evaluate(key => window[key]?.camera?.position.toArray() || null, stateGlobal(route));
}
async function touchDrag(page, selector) {
  const box = await page.locator(selector).boundingBox();
  assert.ok(box && box.width > 100 && box.height > 100, 'Interaction canvas must be visible');
  if (engine === 'chromium') {
    const session = await page.context().newCDPSession(page);
    const x = box.x + box.width * .5, y = box.y + box.height * .55;
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 0 }] });
    for (let i = 1; i <= 6; i++) await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove', touchPoints: [{ x: x + i * 12, y: y - i * 3, id: 0 }],
    });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  } else {
    // WebKit's protocol is different. A real touch tap plus desktop pointer drag
    // is recorded; this is not equivalent to a device-level touch drag check.
    await page.touchscreen.tap(box.x + box.width * .5, box.y + box.height * .5);
  }
}

for (const device of ['desktop', 'mobile']) {
  for (const route of ['home', 'world', 'symbol']) await check(`${route}/${device}: render and interaction`, async () => {
    const ctx = await context(device); const page = await ctx.newPage(); const events = observe(page);
    try {
      await instrument(page); await load(page, route); await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(evidence, `${route}-${device}.png`), animations: 'disabled' });
      if (route === 'home') {
        await page.evaluate(async () => {
          document.documentElement.style.scrollBehavior = 'auto';
          for (let y = 0; y < document.body.scrollHeight; y += innerHeight * .85) {
            scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 180));
          }
          scrollTo(0, 0);
        });
        await page.waitForFunction(() => [...document.images].every(img => img.complete), null, {timeout:15000});
        await page.screenshot({ path: path.join(evidence, `${route}-${device}-full.png`), fullPage: true, animations: 'disabled', timeout:60000 });
        assert.ok(await page.locator('a[href="/world/"]').count(), 'Home must link to World');
        assert.ok(await page.locator('a[href="/symbol/"]').count(), 'Home must link to Sculpture');
        const images = await page.evaluate(() => [...document.images].filter(i => i.getBoundingClientRect().top < innerHeight).map(i => ({src:i.currentSrc,complete:i.complete,width:i.naturalWidth})));
        assert.ok(images.every(i => i.complete && i.width > 0), 'Opening images must load');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'No horizontal overflow');
        const links = await page.locator('a[href="/world/"]').evaluateAll(els => els.map(a => ({href:a.href,visible:a.getBoundingClientRect().height>0})));
        await page.keyboard.press('Tab');
        assert.ok(await page.evaluate(() => document.activeElement?.matches('a,button,input')), 'Keyboard focus must reach an interactive control');
        assert.equal(events.errors.length, 0, JSON.stringify(events.errors));
        assert.equal(events.responses.length, 0, JSON.stringify(events.responses));
        const journalLinks = await page.locator('a[href^="/journal/"]').evaluateAll(els => [...new Set(els.map(a => a.getAttribute('href')))]);
        for (const target of journalLinks) {
          const url = new URL(target, base);
          const response = await page.request.get(url.href);
          assert.equal(response.status(), 200, `Journal target must load: ${target}`);
          if (url.hash) {
            const html = await response.text();
            assert.ok(html.includes(`id="${url.hash.slice(1)}"`), `Journal fragment must exist: ${target}`);
          }
        }
        return { ...events, images, links, journalLinks };
      }
      const rendering = await renderDetail(page, route); currentDetail.rendering = rendering;
      assert.ok(rendering.canvas?.width > 0 && rendering.canvas?.height > 0, 'Canvas drawing buffer must have dimensions');
      assert.ok(rendering.webglContexts > 0, 'A real WebGL context must initialize');
      assert.equal(rendering.contextLost, false, 'WebGL context must remain valid');
      assert.equal(rendering.glError, 0, 'WebGL must not report a runtime error');
      if (rendering.renderer) assert.ok(rendering.renderer.calls > 0 && rendering.renderer.triangles > 0, 'Renderer must draw geometry');
      assert.equal(rendering.overflow, false, 'No horizontal overflow');
      if (route === 'world') {
        await page.locator('[data-world-shot="1"]').click();
        assert.equal(await page.locator('[data-world-shot="1"]').getAttribute('aria-pressed'), 'true');
        await page.locator('#world-credits').click();
        assert.equal(await page.locator('#world-credit-dialog').evaluate(d => d.open), true, 'Credits dialog opens');
        assert.match(await page.locator('#world-credit-dialog').innerText(), /CC BY-SA|Creative Commons/i, 'Car license must remain visible');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#world-credit-dialog').evaluate(d => d.open), false, 'Escape closes dialog');
      } else {
        await page.locator('[data-sculpture-finish="champagne"]').click();
        assert.equal(await page.locator('[data-sculpture-finish="champagne"]').getAttribute('aria-pressed'), 'true');
        await page.locator('[data-sculpture-view="detail"]').click();
        assert.equal(await page.locator('[data-sculpture-view="detail"]').getAttribute('aria-pressed'), 'true');
        await page.locator('#sculpture-reset').click();
      }
      // Reset shot/pose before testing directional keyboard input.
      await page.locator(route === 'world' ? '#world-reset' : '#sculpture-reset').click();
      await page.waitForTimeout(1000);
      const before = await cameraPosition(page, route);
      await page.locator(canvas(route)).focus();
      await page.keyboard.press('ArrowRight'); await page.keyboard.press('+');
      await page.waitForTimeout(400);
      const after = await cameraPosition(page, route);
      if (before && after) assert.notDeepEqual(after, before, 'Keyboard controls must move the camera');
      if (device === 'mobile') await touchDrag(page, canvas(route));
      else {
        const box = await page.locator(canvas(route)).boundingBox();
        await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5);
        await page.mouse.down(); await page.mouse.move(box.x + box.width * .6, box.y + box.height * .52, {steps:8}); await page.mouse.up();
      }
      await page.waitForTimeout(250);
      assert.equal(events.errors.length, 0, JSON.stringify(events.errors));
      assert.equal(events.responses.length, 0, JSON.stringify(events.responses));
      await page.locator(route === 'world' ? '#world-reset' : '#sculpture-reset').click();
      return { ...events, rendering, keyboardCamera: {before,after}, touchDrag: device === 'mobile' ? engine === 'chromium' : null };
    } finally { await ctx.close(); }
  });
}

for (const route of ['world', 'symbol']) {
  await check(`${route}: reduced motion`, async () => {
    const ctx = await context('mobile', 'reduce'); const page = await ctx.newPage(); const events = observe(page);
    try {
      await load(page, route);
      assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion:reduce)').matches), true);
      if (route === 'world') assert.notEqual(await page.locator('#world-tour').getAttribute('aria-pressed'), 'true', 'Reduced motion starts with camera tour paused');
      const animations = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => ({duration:a.effect?.getTiming().duration,iterations:a.effect?.getTiming().iterations})));
      assert.equal(animations.filter(a => a.iterations === Infinity).length, 0, 'Reduced motion must disable repeating CSS animations');
      assert.equal(events.errors.length, 0, JSON.stringify(events.errors));
      return { ...events, animations };
    } finally { await ctx.close(); }
  });
  await check(`${route}: WebGL unavailable`, async () => {
    const ctx = await context('mobile'); const page = await ctx.newPage(); const events = observe(page);
    try {
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
          return /webgl/i.test(kind) ? null : original.call(this, kind, ...args);
        };
      });
      await load(page, route, 'fallback');
      assert.ok(await page.locator('a').evaluateAll(els => els.some(a => new URL(a.href).pathname === '/')), 'Fallback must preserve navigation');
      assert.ok(await page.locator(stage(route)).innerText().then(t => t.length > 0) || await page.locator(`${stage(route)} img`).count(), 'Fallback offers content');
      assert.equal(events.errors.filter(e => e.kind === 'exception').length, 0, 'No uncaught exception in fallback');
      await page.screenshot({path:path.join(evidence,`${route}-mobile-no-webgl.png`),animations:'disabled'});
      return events;
    } finally { await ctx.close(); }
  });
  await check(`${route}: dependency load failure`, async () => {
    const ctx = await context(); const page = await ctx.newPage(); const events = observe(page);
    try {
      // Leave HTML/CSS/photos available while emulating an unavailable Three dependency.
      await page.route(/(?:three(?:\.module|\.core|\.webgpu)?(?:\.min)?\.js|three@[^/]+\/build)/, r => r.abort('failed'));
      await load(page, route, 'fallback');
      assert.ok(await page.locator('a').evaluateAll(els => els.some(a => new URL(a.href).pathname === '/')), 'Fallback navigation is available');
      assert.equal(events.errors.filter(e => e.kind === 'exception').length, 0, 'Module rejection must be handled');
      await page.screenshot({path:path.join(evidence,`${route}-desktop-dependency-failure.png`),animations:'disabled'});
      return events;
    } finally { await ctx.close(); }
  });
  await check(`${route}: context loss`, async () => {
    const ctx = await context(); const page = await ctx.newPage(); const events = observe(page);
    try {
      await instrument(page); await load(page, route);
      const lost = await page.evaluate(selector => {
        const art = document.querySelector(selector);
        const gl = window.__testGL.find(context => context.canvas === art);
        const extension = gl?.getExtension('WEBGL_lose_context');
        if (!extension) return false;
        window.__testLoss = extension; extension.loseContext(); return true;
      }, canvas(route));
      assert.ok(lost, 'Test browser must provide WEBGL_lose_context');
      await page.waitForFunction(selector => document.querySelector(selector)?.dataset.state === 'fallback', stage(route), {timeout:10000});
      assert.equal(events.errors.filter(e => e.kind === 'exception').length, 0, 'Context loss must not throw');
      await page.waitForTimeout(300);
      await page.evaluate(() => window.__testLoss.restoreContext());
      await page.waitForFunction(selector => document.querySelector(selector)?.dataset.state === 'ready', stage(route), {timeout:15000});
      await page.waitForTimeout(300);
      const restored = await renderDetail(page, route); currentDetail.rendering = restored;
      assert.equal(restored.contextLost, false, 'Context must restore');
      assert.equal(restored.glError, 0, 'Restored context must render without WebGL errors');
      await page.screenshot({path:path.join(evidence,`${route}-desktop-context-restored.png`),animations:'disabled',timeout:60000});
      return { ...events, restored };

    } finally { await ctx.close(); }
  });
  await check(`${route}: GPU resources released on departure`, async () => {
    const ctx = await context(); const page = await ctx.newPage(); const events = observe(page);
    try {
      await load(page, route);
      const memory = await page.evaluate(key => {
        const renderer = window[key]?.renderer;
        if (!renderer) return null;
        const before = { ...renderer.info.memory };
        window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }));
        return { before, after: { ...renderer.info.memory } };
      }, stateGlobal(route));
      assert.ok(memory && memory.before.geometries > 0, 'Scene must allocate GPU resources');
      assert.equal(memory.after.geometries, 0, 'Geometry resources must be released');
      assert.equal(memory.after.textures, 0, 'Texture resources must be released');
      assert.equal(events.errors.length, 0, JSON.stringify(events.errors));
      return { ...events, memory };
    } finally { await ctx.close(); }
  });
}
await browser.close();
report.passed = report.tests.every(test => test.passed);
report.summary = `${report.tests.filter(t => t.passed).length}/${report.tests.length} checks passed`;
fs.writeFileSync(path.join(evidence, 'report.json'), JSON.stringify(report, null, 2));
console.log(`${report.summary}; evidence: ${evidence}`);
process.exitCode = report.passed ? 0 : 1;
