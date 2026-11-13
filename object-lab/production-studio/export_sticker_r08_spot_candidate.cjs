"use strict";
/* TOHEŞAR R07 PDF vector/OCG generator: PREPRODUCTION ONLY. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function buildPdf(svg,masterSvg){
 const pathd=s=>{const x=s.match(/<path\b[^>]*\bd="([^"]+)"/);if(!x)throw Error("SOURCE_PATH_MISSING");return x[1]};
 const d=pathd(svg);if(d!==pathd(masterSvg))throw Error("MASTER_PATH_MISMATCH");
 const need=['width="110mm" height="40mm" viewBox="0 0 110 40"','transform="translate(2 2)"','x="7" y="7.422903515" width="92" height="21.15419297" viewBox="0 0 1109 255"','fill="#F8F2E7" fill-rule="evenodd"','<rect x="0" y="0" width="110" height="40" fill="#10110F"/>'];
 for(const str of need)if(!svg.includes(str))throw Error("SOURCE_GEOMETRY_CHANGED");
 if([...new Set(d.match(/[A-Za-z]/g))].sort().join("")!=="MZ")throw Error("UNSUPPORTED_VECTOR_COMMAND");
 const t=d.match(/M|Z|-?\d+(?:\.\d+)?/g);const mm=72/25.4,F=n=>Number(n.toFixed(6)).toString();let pts=0,contours=0,closures=0,open=false,lines=[],i=0;
 while(i<t.length){const x=t[i++];if(x==="M"){contours++;open=true;continue}if(x==="Z"){closures++;lines.push("h");open=false;continue}if(i>=t.length||!/^-?\d+(?:\.\d+)?$/.test(x))throw Error("BAD_PATH_DATA");
 const xx=Number(x),yy=Number(t[i++]);if(xx<0||xx>1109||yy<0||yy>255)throw Error("BAD_COORDINATE");
 lines.push(F(mm*(9+xx*92/1109))+" "+F(mm*(40-9.422903515-yy*21.15419297/255))+(open?" m":" l"));pts++;open=false;}
 if(pts!==979||contours!==8||closures!==8)throw Error("SOURCE_PATH_COUNT_CHANGED");
 const stream=[
  "q","/OC /Printing BDC","0.062745 0.066667 0.058824 rg",`0 0 ${F(110*mm)} ${F(40*mm)} re f`,"0.972549 0.949020 0.905882 rg",...lines,"f*","EMC","Q",
  "q","/OC /KissCut BDC","/CS_CutSpot CS","1 SCN","0.5 w","0 J","0 j",`${F(5*mm)} ${F(5*mm)} ${F(100*mm)} ${F(30*mm)} re S`,"EMC","Q",""
 ].join("\n");
 const unicode=s=>"FEFF"+[...s].map(c=>c.charCodeAt(0).toString(16).padStart(4,"0")).join("").toUpperCase();
 const objs=[
 `<< /Type /Catalog /Pages 2 0 R /OCProperties << /OCGs [6 0 R 7 0 R] /D << /Order [6 0 R 7 0 R] /ON [6 0 R 7 0 R] /BaseState /ON >> >> >>`,
 "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
 `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${F(110*mm)} ${F(40*mm)}] /Resources << /Properties << /Printing 6 0 R /KissCut 7 0 R >> /ColorSpace << /CS_CutSpot 8 0 R >> >> /Contents 4 0 R >>`,
 `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
 "<< /Title (TOHESAR STICKER001 R07 UNAPPROVED VECTOR PDF) /Producer (TOHESAR Source Locked R07) >>",
 `<< /Type /OCG /Name <${unicode("인쇄")}> /Intent /View >>`,
 `<< /Type /OCG /Name <${unicode("반칼")}> /Intent /View >>`,
 `[/Separation /KissCut /DeviceCMYK 9 0 R]`,
 `<< /FunctionType 2 /Domain [0 1] /C0 [0 0 0 0] /C1 [0 1 0 0] /N 1 >>`
 ];
 let pdf="%PDF-1.5\n%\xE2\xE3\xCF\xD3\n";const offsets=[0];
 objs.forEach((o,index)=>{offsets.push(pdf.length);pdf+=`${index+1} 0 obj\n${o}\nendobj\n`});
 const start=pdf.length;pdf+="xref\n0 10\n0000000000 65535 f \n";
 for(let k=1;k<=9;k++)pdf+=String(offsets[k]).padStart(10,"0")+" 00000 n \n";
 pdf+=`trailer\n<< /Size 10 /Root 1 0 R /Info 5 0 R >>\nstartxref\n${start}\n%%EOF\n`;
 return {pdf,info:{bytes:pdf.length,sourcePathChars:d.length,sourcePathVertices:pts,closedContours:contours,pdfVersion:"1.5",pageMm:[110,40],cutlineMm:[100,30],cutlineInsetMm:5,cutlineStrokePt:0.5,printOcg:"인쇄",kisscutOcg:"반칼",cutlineInk:"Separation /KissCut, CMYK alternate C0 M100 Y0 K0",printArtwork:"DeviceRGB, NOT CALIBRATED",xrefOffset:start}};
}
const work=__dirname;
const source=fs.readFileSync(path.join(work,"STICKER-001-R06-FREEFORM-110x40mm-ART-UNAPPROVED.svg"),"utf8");
const master=fs.readFileSync(path.join(work,"..","..","assets","wordmark.svg"),"utf8");
const gitHash=s=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(s,"utf8")+String.fromCharCode(0)).update(Buffer.from(s,"utf8")).digest("hex");
if(gitHash(source)!=="46275eec9e61ec2e2a7b872f09271580c95cf396"||gitHash(master)!=="e9b299f8d797625b3704103c08ea1aede5c5ea05")throw Error("ORIGINAL_SOURCE_GIT_SHA_CHANGED");
const output=buildPdf(source,master);
const final=process.argv[2]||path.join(work,"exports","STICKER-001-R08-SPOT-CANDIDATE-110x40mm-UNAPPROVED.pdf");
fs.mkdirSync(path.dirname(final),{recursive:true});
fs.writeFileSync(final,Buffer.from(output.pdf,"latin1"));
console.log(JSON.stringify({output:final,...output.info,sha256:crypto.createHash("sha256").update(Buffer.from(output.pdf,"latin1")).digest("hex")},null,2));
