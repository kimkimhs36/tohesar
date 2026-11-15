# 01 SHADOW — actual PNG raster/underbase preflight gate (2026-11-12 KST)
This is a **new digital print-method risk gate**, not another garment mockup or fit score. The original 2500×575 transparent ivory wordmark PNG is unchanged.

- Added Pillow preflight inspecting the **actual saved source PNG** for transparency, source dimensions, exact visible ivory RGB, alpha edge coverage, and effective PPI at 82 mm. Unlike a visual mockup, this identifies whether the raster includes anti-aliased partial-alpha edges, which may require vendor-specific white underbase and printing-method review.
- Added 6 negative/positive regression tests. Independent synthetic-image tests were executed in the available Python environment: **6/6 PASS**. The new committed test file and actual source-PNG check require a GitHub Actions run; **do not claim those passed until CI output is inspected**.
- Workflow `.github/workflows/object-lab-shadow-raster-preflight.yml` checks the actual binary in GitHub and stores a JSON receipt as a CI artifact. CI does **not** authorize printing.
- The actual original logo has not been uploaded to any supplier. The repository is public, so do not add confidential materials or personal data.

**Next physical blocker:** owner-approved sample size and specific permission for third-party 82mm logo upload, then vendor editor proof of location, original Ş fidelity, print method/underbase, one-piece image-art quote and shipping/tax total. No vendor-upload, cart, order, payment, main merge or deployment.
