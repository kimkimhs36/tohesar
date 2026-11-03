# COVER 004 — Apple Music listening experiment (032)

Branch: `experiment/cover-004-apple-music-032` (based on `design/editorial-beauty-refinement-031`).

Purpose: test the emotional fit of Daft Punk's **Get Lucky** with the existing COVER 004 photograph and wordmark. No music file is copied, and no cover animation, artwork, or editorial content has been altered.

- One 44px listening button is added to the cover's top-right corner.
- The button reveals Apple's visible, branded, official embeddable player. The song is **not** played merely by opening the panel: the visitor initiates playback inside Apple's player.
- Visitors not logged into Apple Music generally receive a short preview, while full tracks require eligible Apple Music authentication/subscription. Region/service behavior may differ.
- Closing the panel unloads the iframe and stops listening. This experiment does not claim continuous playback across page navigation.
- The embedded player loads only after the visitor opens the panel. No autoplay, hidden player, or extracted track. A direct Apple Music song link is supplied as a fallback.
- Main and the production site are not to be updated until explicit visual and iPhone Safari review.
- **Review still required:** actual Apple embed loading and full-vs-preview behavior on iPhone Safari; this test stubs the remote iframe and checks only integration behavior.

Sources:
- https://artists.apple.com/ko-kr/support/1117-apple-music-marketing-tools
- https://music.apple.com/us/song/617154366

Verification: serve the repository root locally, then run `node tests/music-cover032.cjs` (Playwright + Chromium installed). Check `/?` in iPhone Safari after a nonproduction preview is available.
