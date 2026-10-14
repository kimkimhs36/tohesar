# GENESIS 02 — production checkpoints

- C02: Scene 01/02 refined from Genesis 01. Unequal crowns, pressed ridge, deterministic satin microfinish, thinner polished perimeter, reduced studio light, deeper blue/peach films and explicit film edges. Frame-rate-independent settling. Baseline screenshots preserved under `captures/genesis-01-baseline/`.
- Checked 0%, 23%, 30% in Chromium software WebGL at 390×844. No JS errors. Real iPhone Safari untested.
- Next: Scene 03 (30–48%), source-backed YOKOHAMA visual-fiction fragments, optical alignment, integrated review.
- No production deployment. All changes confined to `genesis-01/`.

- C03: Scene 03 geometry implemented: seven UV fragments of the existing YOKOHAMA portrait at different physical depths, film walls opening into the fragment field, camera continuation to 48%. Source JSON and visible AI-assisted visual-fiction disclosure added. 37% rendered without JS errors. Anamorphic alignment remains the next checkpoint; current fragments are intentionally scattered.

- C04: True perspective anamorphosis implemented. Seven crops sit at depths spanning 3.6 world units. Geometry locks from 40–44.5%; camera-only motion resolves the image at 43%. Measured center projection error: 0.4543 NDC at 40%, approximately 2e-16 at 43%. The 43% and 48% images were rendered and visually inspected. Final layers converge into a quiet editorial plane; this is still Scene 03, not a Journal build.

- C05 in progress: staged the 23–30% dolly to reduce the final rush; brought the image traces forward into the corridor; improved source disclosure size; tuned portrait/desktop editorial composition; added reduced-motion access to both endpoints. Full mobile/desktop/native-scroll verification underway.
- WebKit check unavailable: browser downloaded, but missing host GTK/GLES/related libraries; `sudo` is not installed. Physical iPhone remains unverified.

- C05 complete: mobile 0/23/30/37/40/43/48, desktop 0/30/43/48, landscape 0/43/48, plus transition probes 25/27/33/41/44.5 rendered in Chromium and inspected. Landscape title/source collisions found in review were fixed. Intermediate 25/27 frames show separated film surfaces; 33 shows emergence; 41 shows the incomplete projection resolving toward 43.
- Native scroll/reverse, 43% alignment, reduced-motion first/final states, no horizontal overflow and simulated context-loss poster passed; no JavaScript errors. Build passes. Reports and screenshots live in `captures/`; baseline images and all prior Git checkpoints retained.
- Latest implementation is 0–48% only. No official deployment and no protected ecosystem changes. Next quality gate is physical iPhone Safari, including thermal behavior and toolbar/orientation changes. This environment cannot certify it.
