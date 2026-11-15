// Exercise the actual browser mixer, not a rewritten version. No hardware involved.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const script = readFileSync(new URL('../web/drive/drive.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../web/drive/index.html', import.meta.url), 'utf8');
const mixer = script.match(/function vector\(\)\{[^\n]*\}/)?.[0];
assert.ok(mixer, 'production vector() must be present');
const slider = html.match(/<input\b[^>]*\bid="trim"[^>]*>/)?.[0];
assert.ok(slider, 'trim slider must be present');
for (const attr of ['min="-20"', 'max="20"', 'value="0"', 'step="1"']) assert.ok(slider.includes(attr), attr);
const run = (x, y, power, trim) => Array.from(vm.runInNewContext(`${mixer}; vector()`, { x, y, power, trim }));
// Explicit expected values establish which side is reduced for both signs and directions.
for (const [x,y,trim,expected] of [
  [0,1,0,[85,85]], [0,1,20,[68,85]], [0,1,-20,[85,68]],
  [0,-1,20,[-68,-85]], [0,-1,-20,[-85,-68]],
  [-1,0,20,[-68,85]], [1,0,-20,[85,-68]],
  [1,1,20,[68,0]], [-1,1,-20,[0,68]],
  [0,0,20,[0,0]],
]) assert.deepEqual(run(x,y,85,trim).map(v => v || 0), expected);

let checks = 0;
for (const power of [85,170,255]) for (let trim = -20; trim <= 20; trim++) {
  for (const [x,y] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,1],[.25,.75],[-.7,-.3],[0,0]]) {
    const actual = run(x,y,power,trim);
    const denominator = Math.max(1, Math.abs(y+x), Math.abs(y-x));
    const raw = [(y+x)/denominator*power, (y-x)/denominator*power];
    const gains = [trim > 0 ? 1-trim/100 : 1, trim < 0 ? 1+trim/100 : 1];
    for (let i=0; i<2; i++) {
      assert.ok(Math.abs(actual[i] - raw[i]*gains[i]) <= .50000001, 'rounding and side scaling');
      assert.ok(Math.abs(actual[i]) <= power && Number.isInteger(actual[i]), 'integer PWM is bounded');
      assert.ok(actual[i] === 0 || Math.sign(actual[i]) === Math.sign(raw[i]), 'trim never reverses direction');
    }
    checks++;
  }
}
console.log(`PASS: ${checks} mixer combinations plus explicit direction and trim boundary cases (no hardware)`);