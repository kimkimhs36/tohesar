// Checks the rebuild's preservation requirements against the verified baseline.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {CEDILLA_POINTS} from '../next-generation/cedilla-shape.js';
const base='6c5ec183992332d1d44b35edc8f86ea14f1ce1a5';
const hash=b=>createHash('sha256').update(b).digest('hex');
const original=path=>execFileSync('git',['show',`${base}:${path}`],{maxBuffer:32*1024*1024});
for(const route of ['index.html','world/index.html','symbol/index.html'])assert.equal(hash(readFileSync(`archive/next-generation-baseline/${route}`)),hash(original(route)),`Archived entry must exactly match baseline: ${route}`);
const silhouette=JSON.parse(original('symbol/index.html').toString().match(/<script id="shape-data" type="application\/json">(.*?)<\/script>/s)[1]).points;
assert.equal(CEDILLA_POINTS.length,67);
assert.deepEqual(CEDILLA_POINTS,silhouette,'Approved silhouette coordinates must remain exact');
const paths=execFileSync('git',['ls-tree','-r','--name-only',base,'assets','world','journal','crash-week','styles.css','motion.css','motion.js','CNAME']).toString().trim().split('\n').filter(p=>p!=='world/index.html');
for(const path of paths)assert.equal(hash(readFileSync(path)),hash(original(path)),`Original work must remain unchanged: ${path}`);
console.log(`PASS: 3 exact entrypoint archives, 67 exact silhouette points, ${paths.length} original source/assets/licenses unchanged.`);
