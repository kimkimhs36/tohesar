// TOHEŞAR 01 SHADOW: source-linked sizing ambiguity test, NOT a fit approval.
// Run: node object-lab/apparel/vendor-gates/marpple/01-SHADOW-SIZE-OVERLAP-GATE-20261110.cjs
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const source = JSON.parse(fs.readFileSync(path.join(__dirname, 'VERIFIED-SIZE-CHARTS-4SKU-20261110.json'), 'utf8'));
const chart = source.bySku['8178'];
assert.deepEqual(source.measureDefinitions, ['garmentLength','shoulderWidth','chestWidthFlat','sleeveLength']);
assert.ok(chart.materialStatements.includes('두께 : 32수 2합 / 275gsm'));
const labels = ['S','M','L','XL','2XL','3XL'];
const allowance = 3; // conservative hypothetical ±3 cm, NOT a verified symmetric vendor distribution
const rows = [];
for (let i=0;i<labels.length-1;i++) {
  const a=chart.sizes[labels[i]], b=chart.sizes[labels[i+1]];
  assert.equal(a.length,4); assert.equal(b.length,4);
  const delta=b.map((v,j)=>+(v-a[j]).toFixed(2));
  const overlap=delta.map(d=>+(Math.max(0,2*allowance-Math.abs(d))).toFixed(2));
  rows.push({sizes:labels[i]+' / '+labels[i+1],nominalDeltaCm:delta,hypotheticalOverlapCm:overlap});
}
assert.equal(rows.length,5);
assert.deepEqual(rows[0].nominalDeltaCm,[2.5,2,3,0]);
assert.ok(rows.every(r=>r.hypotheticalOverlapCm.every(v=>v>0)));
const result={
  status:'PASS',sku:8178,sourceDate:source.checkedLocalDate,
  measurementOrder:source.measureDefinitions,
  interpretation:'Hypothetical ±3cm per listed dimension, NOT a probability or seller-confirmed signed tolerance',
  adjacentPairs:rows,
  releaseApproved:false,ownerSizeSelected:false,physicalFitTested:false,
  nextAction:'Choose size from real wearer garment measurements and desired silhouette; request actual sample garment measurements after authorized purchase.'
};
console.log(JSON.stringify(result,null,2));
