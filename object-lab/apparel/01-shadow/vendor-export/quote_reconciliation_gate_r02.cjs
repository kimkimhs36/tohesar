"use strict";
/** 01 SHADOW vendor-original-image one-piece arithmetic and permission gate.
 * Conservative independent preflight: cannot prove supplier evidence authenticity.
 * No network, checkout, logo upload, payment, or order behavior.
 */
function reconcileQuote(r){
 const issues=[];
 const integer=(v)=>typeof v==="number"&&Number.isSafeInteger(v)&&v>=0;
 if(!r||typeof r!=="object"||Array.isArray(r))return {release:false,issues:["INVALID_RECEIPT"]};
 for(const [k,v] of Object.entries({sku:8178,quantity:1,garmentColor:"차콜",currency:"KRW",artworkType:"ORIGINAL_TOHESAR_IMAGE_NOT_NATIVE_TEXT",ownerArtworkUploadApproved:true,ownerSampleSizeApproved:true,orderApproved:false})){if(r[k]!==v)issues.push("INVALID_"+k);}
 if(!["S","M","L","XL","2XL","3XL"].includes(r.size))issues.push("SIZE_NOT_APPROVED");
 if(!(typeof r.artboardWidthMm==="number"&&Number.isFinite(r.artboardWidthMm)&&r.artboardWidthMm>=81.5&&r.artboardWidthMm<=82.5))issues.push("ARTBOARD_WIDTH_UNVERIFIED");
 if(!(typeof r.inkWidthMeasuredMm==="number"&&Number.isFinite(r.inkWidthMeasuredMm)&&r.inkWidthMeasuredMm>0&&r.inkWidthMeasuredMm<=100))issues.push("INK_WIDTH_UNVERIFIED");
 for(const k of ["printMethod","placementReference","evidenceUrlOrLocalRef"]){if(typeof r[k]!=="string"||r[k].trim().length<6)issues.push("MISSING_"+k);}
 if(!["CONFIRMED_WHITE_UNDERBASE","CONFIRMED_NO_UNDERBASE"].includes(r.underbase))issues.push("UNDERBASE_UNVERIFIED");
 for(const k of ["placementXmm","placementYmm"]){if(typeof r[k]!=="number"||!Number.isFinite(r[k])||r[k]<0||r[k]>1000)issues.push("INVALID_"+k);}
 if(typeof r.evidenceUrlOrLocalRef==="string"&&/(hypothetical|placeholder|dummy|example|test[-_ ]|not[-_ ]?verified|no[-_ ]vendor[-_ ]proof)/i.test(r.evidenceUrlOrLocalRef))issues.push("PLACEHOLDER_EVIDENCE_REF");
 if(typeof r.evidenceCapturedAt!=="string"||!/^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(r.evidenceCapturedAt)||Number.isNaN(Date.parse(r.evidenceCapturedAt)))issues.push("TIMESTAMP_UNVERIFIED");
 for(const k of ["unitPrintedPrice","shippingPrice","totalPayable"]){if(!integer(r[k]))issues.push("INVALID_"+k);}
 if(integer(r.unitPrintedPrice)&&r.unitPrintedPrice===0)issues.push("ZERO_PRINTED_PRICE_REQUIRES_VENDOR_CONFIRMATION");
 if(integer(r.totalPayable)&&r.totalPayable===0)issues.push("ZERO_TOTAL_REQUIRES_VENDOR_CONFIRMATION");
 if(!["VAT_INCLUDED","VAT_SEPARATE_EXPLICITLY_ITEMIZED"].includes(r.taxHandling))issues.push("TAX_HANDLING_UNVERIFIED");
 if(r.taxHandling==="VAT_SEPARATE_EXPLICITLY_ITEMIZED"&&!integer(r.taxAmount))issues.push("VAT_AMOUNT_NOT_ITEMIZED");
 if(r.taxHandling==="VAT_INCLUDED"&&r.taxAmount!==undefined&&r.taxAmount!==0)issues.push("VAT_INCLUDED_DOUBLE_COUNT_RISK");
 if(["unitPrintedPrice","shippingPrice","totalPayable"].every(k=>integer(r[k]))&&["VAT_INCLUDED","VAT_SEPARATE_EXPLICITLY_ITEMIZED"].includes(r.taxHandling)){
   const tax=r.taxHandling==="VAT_INCLUDED"?0:r.taxAmount;
   if(integer(tax)){const sum=r.unitPrintedPrice+r.shippingPrice+tax;if(!Number.isSafeInteger(sum)||sum!==r.totalPayable)issues.push("TOTAL_ARITHMETIC_MISMATCH");}
 }
 if(r.evidenceSourceKind!=="VENDOR_ORIGINAL_IMAGE_EDITOR_PROOF")issues.push("SOURCE_NOT_VENDOR_IMAGE_PROOF");
 return {release:issues.length===0,issues,receiptIsOrderAuthorization:false,physicalSampleVerified:false};
}
module.exports={reconcileQuote};
if(require.main===module){
 const fs=require("fs");
 const path=process.argv[2];
 if(!path){console.error("Usage: node quote_reconciliation_gate_r02.cjs receipt.json");process.exit(2)}
 const result=reconcileQuote(JSON.parse(fs.readFileSync(path,"utf8")));
 console.log(JSON.stringify(result,null,2));
 process.exit(result.release?0:1);
}
