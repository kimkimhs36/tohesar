#!/usr/bin/env node
'use strict';
/** Regression tests for actual 01 SHADOW source dimensions, fit comparison, browser-local
 * inputs, and preventing the offline sample page from asserting any order/checkout.
 * Does not make network requests, upload to a vendor, or purchase.
 */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'SAMPLE-LAB.html'),'utf8');
const chunks=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
assert.equal(chunks.length,1,'One self-contained browser script expected');
new vm.Script(chunks[0][1],{filename:'SAMPLE-LAB.html-inline.js'});
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{
 id,value:'',textContent:'',innerHTML:'',hidden:false,
 classList:{toggle(name,val){this[name]=val}},addEventListener(){},
 });return elements.get(id);}
const store=new Map();
const context=vm.createContext({
 console,
 document:{getElementById:el},
 localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
 Date,
});
vm.runInContext(chunks[0][1],context,{timeout:1500});
assert.equal(el('styleTitle').textContent,'01 / SHADOW UNIFORM','01 should open by default');
assert.equal(el('blankFit').hidden,false,'01 fit selector should be visible');
assert.match(el('fitTable').innerHTML,/사이즈 선택 전/);
assert.equal(el('gateResult').textContent,'0 / 8','No false confirmed release milestones');
const sizes=vm.runInContext('Object.keys(blankChart)',context);
assert.equal(sizes.join(','),'S,M,L,XL,2XL,3XL');
const fit=vm.runInContext("compareBlankFit('M',{shoulder:'50',chest:'55',length:'69',sleeve:'20'})",context);
assert.equal(fit.map(r=>r.delta).join(','),'4,3,2,1');
const miss=vm.runInContext("compareBlankFit('M',{shoulder:'',chest:'',length:'',sleeve:''})",context);
assert(miss.every(r=>r.delta===null),'Blank self measurements must remain unknown');
assert.equal(vm.runInContext("compareBlankFit('UNAVAILABLE',{})",context),null,'Unknown sizes must not silently fall back');
assert.equal(vm.runInContext("compareBlankFit('S',{shoulder:'-4',chest:'',length:'0',sleeve:'300'})",context).every(r=>r.delta===null),true,'Invalid measurements must not become numeric zero');
el('fitSize').value='M';el('fitShoulder').value='50';el('fitChest').value='55';el('fitLength').value='69';el('fitSleeve').value='20';
vm.runInContext("updateFit()",context);
assert.match(el('fitTable').innerHTML,/\+4 cm/);
assert.match(el('fitTable').innerHTML,/\+3 cm/);
assert.match(el('fitDecision').textContent,/추천·구매 승인·재고 보증이 아니야/);
vm.runInContext("setStyle('04')",context);
assert.equal(el('blankFit').hidden,true,'Bespoke 04 should hide ready-made 01 blank sizing');
assert.match(el('styleTitle').textContent,/04/);
vm.runInContext("setStyle('01')",context);
assert.equal(el('blankFit').hidden,false);
assert.match(html,/https:\/\/oasisent1\.cafe24\.com/);
assert.match(html,/SHADOW01-82MM-A4-PRINT-AT-100PCT-UNAPPROVED\.pdf/);
assert.doesNotMatch(html,/04-OFFSET-SHELL-TECHPACK-R01-NO-CUTTING\.pdf/);
assert.doesNotMatch(html,/ENGINEERING-R01\.png/);
assert.match(html,/실제 결제 금액\/재고\/인쇄 품질 미확인/);
assert.match(html,/열자국/);
console.log('PASS / SAMPLE LAB R03: 01 default; 6 real blank sizes; 4-dimensional fit deltas; explicit unknown/invalid handling; 04 routing; vendor-pricing disclosures; real source URLs; no false production gate');
