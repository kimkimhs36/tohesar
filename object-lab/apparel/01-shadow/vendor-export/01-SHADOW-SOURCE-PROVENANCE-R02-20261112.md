# 01 SHADOW — source-identity gate R02 (2026-11-12 KST)

## Material change
The preceding R01 raster inspection checks 2500×575, ivory RGB and alpha, but **does not pin the original PNG bytes**. A different ivory shape with the same size/color could pass its checks. This is a real source-provenance gap, not another mockup.

New independent `shadow_source_provenance_gate_r02.py` pins the actual original 2500×575 PNG Git blob **899d2014d8c247fe7e7774b65b6371c6315f72f9** as returned by GitHub at PR #38 head `756f7f99e3ff0f654d62b1fd04b7878e03a2c121`. It verifies the exact byte stream, PNG signature/IHDR and width/height, and emits a JSON receipt with SHA256. A changed source PNG fails closed. This complements, **does not replace**, R01's actual pixel/alpha/ink inspection.

## Evidence / limits
- Six synthetic Python standard-library unit tests were actually run in an independent local execution environment and **6/6 PASS**. They exercise mutation rejection, valid PNG header, wrong dimensions, non-PNG bytes, wrong type and Git blob computation.
- The GitHub connector independently reported the real PNG Git blob ID, but the actual original binary was **NOT** copied into the local runner, and the new committed script was **NOT** run against the original binary or through GitHub CI during this run. The new file's committed-byte re-execution is also NOT verified.
- **This guard does not prove original SVG Ş path fidelity by itself.** That still requires existing source-vector checks and image proof. Do not confuse matching PNG identity with printing acceptability.
- No supplier upload, personal details, seller message, order, payment, main merge or deployment.

## Exact next manufacturing blocker
Obtain separate owner permission before testing the original 82mm logo in the MARPPLE editor, then verify actual placement, print method/underbase and image-logo-inclusive one-piece total; sample size also requires owner confirmation. If permission is unavailable, do not continue generating speculative logo mocks or repeat size studies. Physical garment/print/wash QA remains NOT RUN.
