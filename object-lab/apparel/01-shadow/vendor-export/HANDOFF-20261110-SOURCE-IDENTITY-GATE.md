# 01 SHADOW — original-art identity gate (2026-11-10 KST)

## Change
Updated `01-SHADOW-PRINT-ASSET-PREFLIGHT-20261110.py` so geometry and ivory color alone cannot approve a lookalike PNG. The preflight now checks the **exact original Git blob SHA-1** of the committed 2500×575 RGBA source PNG: `899d2014d8c247fe7e7774b65b6371c6315f72f9`. Git blob hashing uses `SHA1("blob " + byte_length + NUL + file_bytes)`, not a plain SHA-1 file hash. Changed pixels, glyphs, or metadata must fail `originalSourceIntegrityPass` even when alpha bbox and color still pass.

## Verification boundaries
- Original PNG blob SHA fetched directly from GitHub at PR #38 before the code change: PASS.
- Git blob identity formula independently exercised with synthetic byte sequences in local Python: PASS (changed bytes yield different digest).
- Updated source code written to PR #38 feature branch: PASS.
- Full updated script executed against original PNG: **NOT RUN**. Actual GitHub original binary not materialized to the local runner; do not claim original preflight PASS.
- Vendor print, position, cost, physical sample: **NOT RUN / UNAPPROVED**.

## Next executable step
On a runtime with the source PNG and Pillow, run:
```sh
python object-lab/apparel/01-shadow/vendor-export/01-SHADOW-PRINT-ASSET-PREFLIGHT-20261110.py object-lab/apparel/01-shadow/vendor-export/01-SHADOW-82MM-IVORY-TRANSPARENT-2500PX-UNAPPROVED.png
```
Check `originalSourceIntegrityPass=true`, `geometryPass=true`, `opaqueIvoryPass=true`, and `localPreflightPass=true`. For a negative control, modify one opaque pixel in a copy, preserving the original geometry; the original source integrity gate must fail. Do not upload original art to any supplier without separate approval. First wearable sample still requires owner-selected size, vendor image-print method and one-piece logo-inclusive quote.
