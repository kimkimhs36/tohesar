/* Deterministic browser-API contract tests for OWNER STORIES card editor.
   Run: node --test tests/owner-stories-card.test.cjs */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'owner-stories', 'story-card', 'card.js'), 'utf8');

function harness({loadWordmark=true}={}) {
  const handlers = new Map();
  const elements = new Map();
  const ids = ['story-canvas', 'car-name', 'car-caption', 'car-photo', 'car-tone', 'car-position', 'car-horizontal', 'car-layout', 'card-status', 'photo-name', 'save', 'share'];
  for (const id of ids) elements.set(id, { value: '', textContent: '', files: [], addEventListener(type, cb) { handlers.set(`${id}:${type}`, cb); }, click() {} });
  const drawCalls = [];
  const ctx = new Proxy({
    createLinearGradient: () => ({ addColorStop() {} }),
    measureText: s => ({width: s.length * 20}),
    drawImage: (...args) => { drawCalls.push(args); }
  }, { get(target, key) { return key in target ? target[key] : () => {}; } });
  const canvas = elements.get('story-canvas');
  canvas.getContext = () => ctx;
  canvas.toBlob = cb => cb(new Blob(['png'], {type:'image/png'}));
  canvas.toDataURL = () => 'data:image/png;base64,cG5n';
  elements.get('car-layout').value = 'gallery'; // Match actual HTML default.
  elements.get('car-tone').value = 'neutral';
  elements.get('car-position').value = '50';
  elements.get('car-horizontal').value = '50';
  const imageRequests = [];
  class ImageMock {
    constructor() { this.naturalWidth = 1600; this.naturalHeight = 1200; }
    set src(value) { this._src = value; imageRequests.push(this); }
    get src() { return this._src; }
    complete() { this.onload?.(); }
    fail() { this.onerror?.(new Error('decode')); }
  }
  let urlIndex = 0;
  const revoked = [];
  let shares = 0, downloads = 0;
  const quick = { firstChild: {textContent: ''}, addEventListener(type, cb) {handlers.set(`quick:${type}`,cb);} };
  const document = {
    getElementById: id => elements.get(id), querySelector: () => quick,
    createElement: () => ({click(){downloads++;},remove(){}}),
    body: {appendChild() {}}
  };
  const context = {
    document, Image: ImageMock, Blob, Uint8Array, File: class {constructor(parts,name,options){this.parts=parts;this.name=name;this.type=options.type;}},
    URL: {createObjectURL: () => `blob:test-${++urlIndex}`, revokeObjectURL: url => revoked.push(url)},
    navigator: {canShare: () => true, share: async () => {shares++;}},
    requestAnimationFrame: cb => cb(), setTimeout: () => {}, addEventListener: () => {},
    atob: s => Buffer.from(s,'base64').toString('binary'),
  };
  vm.runInNewContext(source, context, {filename:'card.js'});
  if (loadWordmark) imageRequests.shift().complete(); // Official wordmark loaded.
  const tick = () => new Promise(resolve => setImmediate(resolve));
  async function select(name, type='image/jpeg', size=1000) {
    const input = elements.get('car-photo');
    input.files = [{name,type,size}];
    handlers.get('car-photo:change')();
    await tick();
    return imageRequests.at(-1);
  }
  return {elements, handlers, imageRequests, select, tick, revoked, drawCalls,
    async save() {await handlers.get('save:click')();},
    async share() {await handlers.get('share:click')();},
    get shares(){return shares;},get downloads(){return downloads;}};
}

test('export is blocked while a new photo is decoding, then permitted', async () => {
  const h = harness();
  const img = await h.select('car.jpg');
  await h.save(); await h.share();
  assert.equal(h.downloads, 0); assert.equal(h.shares, 0);
  img.complete(); await h.tick();
  await h.save(); await h.share();
  assert.equal(h.downloads, 1); assert.equal(h.shares, 1);
});

test('older image completion cannot replace the latest selection', async () => {
  const h = harness();
  const first = await h.select('old.jpg');
  const second = await h.select('new.jpg');
  second.complete(); await h.tick();
  first.complete(); await h.tick();
  assert.equal(h.elements.get('photo-name').textContent, 'new.jpg');
  assert.ok(h.revoked.includes(first.src));
  await h.save(); assert.equal(h.downloads, 1);
});

test('decode failure and unsupported files do not strand export in loading state', async () => {
  const h = harness();
  const broken = await h.select('broken.jpg');
  broken.fail(); await h.tick();
  await h.save(); assert.equal(h.downloads, 1);
  await h.select('document.txt','text/plain');
  await h.save(); assert.equal(h.downloads, 2);
});

test('oversized image is rejected and does not block text-only card export', async () => {
  const h = harness();
  await h.select('huge.jpg','image/jpeg',21*1024*1024);
  assert.match(h.elements.get('card-status').textContent,/20MB/);
  await h.save(); assert.equal(h.downloads,1);
});


test('cancelling photo selection clears pending decode and preserves text-card export', async () => {
  const h = harness();
  const pending = await h.select('slow.jpg');
  const input = h.elements.get('car-photo');
  input.files = [];
  h.handlers.get('car-photo:change')();
  await h.tick();
  // The canceled image may never emit load/error; its blob must already be freed.
  assert.ok(h.revoked.includes(pending.src));
  await h.save();
  assert.equal(h.downloads, 1);
  pending.complete();
  await h.tick();
  assert.notEqual(h.elements.get('photo-name').textContent, 'slow.jpg');
  assert.ok(h.revoked.includes(pending.src));
  await h.save();
  assert.equal(h.downloads, 2);
});

test('SVG photos are rejected even when renamed JPG; the raster canvas remains exportable', async () => {
  const h = harness();
  const count = h.imageRequests.length;
  await h.select('unsafe.svg', 'image/svg+xml');
  assert.equal(h.imageRequests.length, count);
  assert.match(h.elements.get('card-status').textContent, /SVG/);
  await h.select('unsafe.jpg', 'image/svg+xml');
  assert.equal(h.imageRequests.length, count);
  await h.save();
  assert.equal(h.downloads, 1);
});

test('HEIC with empty iPhone MIME is allowed by the filename fallback', async () => {
  const h = harness();
  const image = await h.select('IMG_2026.HEIC', '');
  image.complete(); await h.tick();
  assert.equal(h.elements.get('photo-name').textContent, 'IMG_2026.HEIC');
  await h.save();
  assert.equal(h.downloads, 1);
});

test('official wordmark must finish loading before saving or sharing any card', async () => {
  const h = harness({loadWordmark:false});
  await h.save(); await h.share();
  assert.equal(h.downloads, 0);
  assert.equal(h.shares, 0);
  h.imageRequests.shift().complete();
  await h.save(); await h.share();
  assert.equal(h.downloads, 1);
  assert.equal(h.shares, 1);
});

test('gallery is tested as the real default: photo crop stays in its print frame', async () => {
  const h = harness();
  const image = await h.select('photo.png', 'image/png');
  image.complete(); await h.tick();
  const photoDraws = h.drawCalls.filter(args => args.length === 9);
  assert.ok(photoDraws.length > 0);
  assert.deepEqual(photoDraws.at(-1).slice(5), [65, 239, 950, 1050]);
});

test('native sharing starts before yielding user activation to a microtask', async () => {
  const h = harness();
  const promise = h.handlers.get('share:click')();
  assert.equal(h.shares, 1, 'navigator.share should be invoked synchronously');
  await promise;
});
