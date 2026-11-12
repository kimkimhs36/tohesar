#!/usr/bin/env node
/** TOHEŞAR 05 cross-seller public listing QA. No vendor access, network, or order. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const data=JSON.parse(fs.readFileSync(path.join(__dirname,"05-400GSM-CROSS-SELLER-EVIDENCE-20261110.json"),"utf8"));
const o=data.observations;
assert.equal(data.product,"05 NIGHT SHIFT ZIP");
assert.equal(o.marpple_9362.gsm,null,"Cannot claim MARPPLE's exact SKU is 400gsm");
assert.equal(o.bodatee_1000001018.gsm,400);
assert.equal(o.croom_400gsm_zip.gsm,400);
assert.equal(o.bodatee_1000001018.vat_included_in_displayed_tier,true);
assert.equal(o.bodatee_1000001018.one_piece_blank_price_krw,41600);
assert.equal(o.bodatee_1000001018.actual_one_piece_logo_total_krw,null);
assert.equal(o.marpple_9362.historical_no_logo_blank_price_krw,35900);
assert.equal(o.marpple_9362.historical_generic_text_price_krw,43900);
assert.equal(o.marpple_9362.historical_generic_text_price_krw-o.marpple_9362.historical_no_logo_blank_price_krw,8000);
assert.equal(o.bodatee_1000001018.one_piece_blank_price_krw-o.marpple_9362.historical_no_logo_blank_price_krw,5700);
assert.equal(data.cross_seller_identity.product_family_400gsm_corroborated,true);
assert.equal(data.cross_seller_identity.marpple_9362_is_exact_same_400gsm_manufacturer_style_confirmed,false);
assert.equal(data.cross_seller_identity.supplier_mapping_model_code_confirmed,false);
assert.ok(Object.values(data.editor_and_order_gates).every(v=>v===false));
const mar=o.marpple_9362.sizes_cm_length_shoulder_chest_sleeve;
const cr=o.croom_400gsm_zip.sizes_cm_length_chest_sleeve;
let compared=0,matches=0,differences=[];
for(const size of ["S","M","L","XL","2XL","3XL"]){
  assert.ok(mar[size]&&cr[size]);
  for(const [label,mi,ci] of [["length",0,0],["chest",2,1],["sleeve",3,2]]){
    compared++;
    if(mar[size][mi]===cr[size][ci]) matches++;
    else differences.push({size,measurement:label,marpple_cm:mar[size][mi],croom_cm:cr[size][ci]});
  }
}
assert.equal(compared,18);
assert.equal(matches,17);
assert.deepEqual(differences,[{size:"L",measurement:"sleeve",marpple_cm:57,croom_cm:66}]);
assert.ok(cr.L[2]>cr.M[2]&&cr.L[2]>cr.XL[2]);
console.log(JSON.stringify({status:"PASS",size_cells_compared:compared,matching_cells:matches,discrepancies:differences,marpple_style_code:"UNVERIFIED",actual_logo_quote:"UNVERIFIED"}));
