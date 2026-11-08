#!/usr/bin/env node
/* TOHEŞAR STICKER 001 / PURE NODE.js GEOMETRY + ORIGINAL VECTOR TEST.
   No vendor editor or buyer data accessed. Not an approval to print/order.
   Run from any checkout: node object-lab/sticker-001/verify_4up_inward2.js
*/
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"../.."), here=__dirname;
const read=p=>fs.readFileSync(p,"utf8");
const original=read(path.join(root,"assets/wordmark.svg"));
const body=Buffer.from(original,"utf8"), gitHash=crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+body.length+"\0"),body])).digest("hex");
const expected="e9b299f8d797625b3704103c08ea1aede5c5ea05";
assert.equal(gitHash,expected,"Official vector source must match locked blob");
const one=original.match(/<path\b[^>]*\/>/g);
assert.equal(one?.length,1,"Expected one official SVG geometry path");
const srcPath=one[0];
const single=read(path.join(here,"104x34-AUTO-CUT-INWARD2-SINGLE-ARTWORK-NOT-APPROVED.svg"));
const sheet=read(path.join(here,"140x200-4UP-INWARD2-ARTWORK-LAYOUT-NOT-APPROVED.svg"));
const singlePaths=single.match(/<path\b[^>]*\/>/g)||[], sheetPaths=sheet.match(/<path\b[^>]*\/>/g)||[];
assert.deepEqual(singlePaths,[srcPath],"Single logo path cannot be modified");
assert.equal(sheetPaths.length,4);
for(const d of sheetPaths)assert.equal(d,srcPath,"Each exact vector path must match original source");
assert.match(single,/width="104mm" height="34mm" viewBox="0 0 104 34"/);
assert.match(sheet,/width="140mm" height="200mm" viewBox="0 0 140 200"/);
const rects=[...sheet.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="#000000"/g)].map(m=>({x:+m[1],y:+m[2],w:+m[3],h:+m[4]}));
assert.equal(rects.length,4);
const cutOffset=2, [sheetW,sheetH]=[140,200], [safeL,safeR,safeTop,safeBottom]=[2,138,2,190], spacingMin=5;
rects.forEach((r,i)=>{assert.equal(r.x,18);assert.equal(r.w,104);assert.equal(r.h,34);assert.equal(r.x+cutOffset,20);assert.equal(r.w-2*cutOffset,100);assert.equal(r.h-2*cutOffset,30);assert.ok(r.x>=safeL &&r.x+r.w<=safeR);assert.ok(r.y>=safeTop &&r.y+r.h<=safeBottom);
if(i)assert.ok(r.y-(rects[i-1].y+rects[i-1].h)>=spacingMin);});
const maxFit=Math.floor((safeBottom-safeTop+spacingMin)/(34+spacingMin));
assert.equal(maxFit,4,"At 2mm bleed and >=5mm between artwork 4 is max vertically");
console.log(JSON.stringify({status:"PASS",officialGitBlob:gitHash,count:rects.length,artworkSizeMm:[104,34],provisionalCutOffsetMm:2,nominalCutMm:[100,30],minimumArtworkSpacingMm:5,minimumBlackBleedMm:2,sheetSizeMm:[sheetW,sheetH],safeAreaUsedMm:[safeL,safeTop,safeR,safeBottom],maxFitGivenTheseConstraints:maxFit,editorAcceptance:"NOT TESTED",allInCheckoutPrice:"NOT VERIFIED"},null,2));
