# 01 SHADOW — ink-envelope gauge handoff (2026-11-11)

Source at run start: PR #38 HEAD `7a54706130ea53301161feb9925a484be448f2a9`, draft, based on PR #37. Separate PR #35 sticker and #36 zip unchanged.

New artifact: `01-INK-ASPECT-RATIO-PHYSICAL-GAUGE-R01-20261111.svg`, commit `86cac499502fff9871f62f8fe9814ac87ca5750d`. Existing paper template used 82 x 25 mm as a *handling aid*, not true ink aspect. New gauge gives the actual rectangular ink envelope inferred from prior PNG metadata: width 82 mm, height 82 * 565 / 2487 = 18.62887012464817 mm. It includes a 100mm scale reference and no proprietary artwork. It does NOT replace original logo or assert print approval.

Static checks performed: GitHub blob fetched; 210 x 297 mm SVG viewBox; 100mm calibration bar; calculated ratio matches; no logo path. Physical print calibration NOT RUN; actual PNG binary remeasurement NOT RUN; browser rendering NOT RUN; vendor proof NOT RUN.

**Next action**: print at actual size, measure 100mm bar and 82 x 18.629mm ink envelope; compare wearer-left chest vs center front on an actual tee; record measurements and owner placement approval. Do not upload artwork or order without separate explicit permission. Verify vendor alpha-trim scaling and image-logo price only after authorized external upload. The historical 2500px canvas has 2487px ink width; full-canvas scaling to 82mm would yield 81.5736mm ink, so supplier scaling behavior remains a HOLD.
