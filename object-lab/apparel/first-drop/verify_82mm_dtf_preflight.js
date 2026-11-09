#!/usr/bin/env node
/**
 * TOHESAR: physical 82mm artwork source-lock and independent DTF thin-cross-section preflight.
 * Read-only, zero upload, zero order, zero external network, never redraws the brand mark.
 *
 * Run from any folder: node object-lab/apparel/first-drop/verify_82mm_dtf_preflight.js
 * This is a geometry risk screen, NOT any printer's final acceptance or physical test.
 * External reference threshold 0.5mm: https://help.housedtf.com/portal/en/kb/articles/artwork-guidelines-18-9-2024
 */
"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,"../../..");
const MASTER=path.join(ROOT,"assets/wordmark.svg");
const ART=path.join(__dirname,"01-SHADOW-CHEST-82MM-ORIGINAL-PATH-IVORY.svg");
function parseContours(d) {
  const tokens = d.match(/[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[Ee][-+]?\d+)?/g) || [];
  let i=0, current=[], polygons=[];
  while (i<tokens.length) {
    const cmd=tokens[i++];
    if (cmd==="M") {
      if (current.length) throw Error("Unclosed contour or unsupported M sequence");
      while(i<tokens.length&&!/^[A-Za-z]$/.test(tokens[i])) {
        if(i+1>=tokens.length || /^[A-Za-z]$/.test(tokens[i+1])) throw Error("Coordinate pair missing");
        current.push([Number(tokens[i++]),Number(tokens[i++])]);
      }
    } else if(cmd==="Z") {
      if(current.length<3)throw Error("Degenerate closed contour");
      polygons.push(current);current=[];
    } else throw Error("Unsupported SVG command: "+cmd+" (do not silently change original geometry)");
  }
  if(current.length)throw Error("Unclosed final contour");
  if(!polygons.length)throw Error("Missing vector geometry");
  return polygons;
}
function analyzeDTF(contours,viewWidth,viewHeight,widthMm,thresholdMm) {
  const scale=widthMm/viewWidth, limit=thresholdMm/scale;
  const edges=contours.flatMap(poly=>poly.map((point,i)=>[point,poly[(i+1)%poly.length]]));
  function intervals(axis,slice) {
    const hits=[];
    for(const [a,b] of edges) {
      const k0=axis==="y"?a[1]:a[0], k1=axis==="y"?b[1]:b[0];
      if((k0<=slice && slice<k1)||(k1<=slice && slice<k0)) {
        const v0=axis==="y"?a[0]:a[1],v1=axis==="y"?b[0]:b[1];
        hits.push(v0+(slice-k0)*(v1-v0)/(k1-k0));
      }
    }
    hits.sort((a,b)=>a-b);
    if(hits.length%2)throw Error("Even-odd crossing error at "+axis+"="+slice);
    const paired=[];
    for(let j=0;j<hits.length;j+=2)paired.push([hits[j],hits[j+1]]);
    return paired;
  }
  function scan(axis,n) {
    let ink=0,thin=0,thinCount=0,intervalCount=0,smallest=Infinity;
    for(let i=0;i<n;i++){
      for(const [a,b] of intervals(axis,i+.5)){
        const v=b-a;ink+=v;intervalCount++;smallest=Math.min(smallest,v);
        if(v<limit){thin+=v;thinCount++;}
      }
    }
    return {inkAreaMm2:+(ink*scale*scale).toFixed(3),narrowSliceAreaMm2:+(thin*scale*scale).toFixed(3),narrowSliceAreaPct:+(thin/ink*100).toFixed(3),narrowCrossSections:thinCount,allCrossSections:intervalCount,minimumObservedSectionMm:+(smallest*scale).toFixed(4)};
  }
  const points=contours.flat(), xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  return {sourceContours:contours.length,sourceEdges:edges.length,physicalCanvasMm:[+widthMm.toFixed(6),+(viewHeight*scale).toFixed(6)],inkBoundsMm:{width:+((Math.max(...xs)-Math.min(...xs))*scale).toFixed(3),height:+((Math.max(...ys)-Math.min(...ys))*scale).toFixed(3)},referenceThinLimitMm:thresholdMm,scanlineX:scan("y",viewHeight),scanlineY:scan("x",viewWidth)};
}
function svgPath(xml) {const nodes=[...xml.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)];if(nodes.length!==1)throw Error("Expected one path");return nodes[0][1];}
function gitBlobSha(buffer) {
  const header=Buffer.from("blob "+buffer.length+"\0");
  return crypto.createHash("sha1").update(Buffer.concat([header,buffer])).digest("hex");
}
function run(){
  const origBytes=fs.readFileSync(MASTER),artBytes=fs.readFileSync(ART);
  const orig=origBytes.toString("utf8"),art=artBytes.toString("utf8");
  const blob=gitBlobSha(origBytes);
  if(blob!=="e9b299f8d797625b3704103c08ea1aede5c5ea05")throw Error("Original master changed: stop, do not reinterpret brand logo");
  if(svgPath(orig)!==svgPath(art))throw Error("82mm d differs from source: stop");
  if(!art.includes('width="82mm"')||!art.includes('viewBox="0 0 1109 255"')||!art.includes('fill="#f8f2e7"'))throw Error("Art dimensions or ivory changed");
  if(/<text\b/.test(art))throw Error("Live text in art");
  const fixture=analyzeDTF(parseContours("M0 0 10 0 10 10 0 10Z M3 3 7 3 7 7 3 7Z"),10,10,10,.5);
  if(fixture.scanlineX.inkAreaMm2!==84||fixture.scanlineY.inkAreaMm2!==84)throw Error("Geometry scanner failed even-odd-hole fixture");
  const result=analyzeDTF(parseContours(svgPath(orig)),1109,255,82,.5);
  if(Math.abs(result.scanlineX.inkAreaMm2-416.792)>.002||Math.abs(result.scanlineY.inkAreaMm2-416.792)>.002)throw Error("Reference art analytic drift");
  console.log(JSON.stringify({status:"SOURCE_VECTOR_QC_PASS__VENDOR_PRINT_UNVERIFIED",sourceGitBlob:blob,referenceLineMm:.5,originalPathUnchanged:true,printedSampleTested:false,
    warning:"Narrow corner slices are not automatically printable thin strokes; require actual one-piece vendor DTF proof",...result},null,2));
}
try {run();} catch(e){console.error(e);process.exitCode=1}
