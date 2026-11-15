# VISION DRIVE 4.1 — source preview (not deployed)

This directory preserves the 2026-11-08 local ESP32-CAM firmware/UI improvement source. It is a **development preview** only. The main-site VISION DRIVE 4.0 and public `downloads/manifest.json` are intentionally unchanged.

Added experimental PSRAM-aware dual-buffer MJPEG transport (port 82), improved X4 Studio camera stream/fallback handling and frame-rate diagnostics. Firmware build and simulated tests were recorded locally, but this patch has **not** been flashed to the user's KS5023 ESP32-CAM or tested on live hardware. No autonomous robot control or safety certification is implied.

No release binaries, backup flash images, device credentials, local incident captures, generated build artifacts or font files are included. Use the repo's existing public version 4.0 until hardware backup, board wiring, bench testing, and recovery have been verified. A standalone production build may require generating UI/font assets from appropriately licensed local sources.
