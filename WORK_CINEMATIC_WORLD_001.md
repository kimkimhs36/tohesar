# TOHEŞAR / CINEMATIC WORLD 001 — Work Execution Brief
Version: 2026-10-11 · iPhone-first *only* for this experiment
Repository: https://github.com/kimkimhs36/tohesar
Target working branch: experiment/cinematic-world-001
Base of target branch: rebuild/tohesar-2
Current live production branch: main — DO NOT TOUCH

## MISSION
**Build and demonstrate a truly functioning, cinematic, mobile 3D experience on an iPhone, not another design proposal.** Work through the repository, implement code, launch a real preview in the available environment, inspect what renders, fix observed defects, commit changes to the designated experimental branch, and report actual results. Use the strongest reasoning / creative-production capabilities supported by the user's selected Work session. Do not stop because of abstract concerns about Work usage; this is an intentional ambitious experiment.

The experience must feel like entering a place rather than scrolling a conventional site: physically grounded camera travel through an evocative road / urban dusk setting into the evolving TOHEŞAR editorial universe. No generic rotating car in an empty showroom, no neon cyberpunk, no card-grid landing page with superficial parallax.

## ABSOLUTE PRIORITY: iPHONE SAFARI FIRST — CINEMATIC FIDELITY
- The **visual master target is iPhone Safari in portrait orientation**. Push the highest *sustainable real-world visual quality* achievable on modern iPhone Safari: scene scale, lighting, material behavior, motion, atmosphere, cinematic composition and tasteful effects. This is an ambitious cinematic art experiment, NOT a low-graphics Instagram-browser compromise.
- **Instagram in-app browser is a secondary compatibility environment**, not the standard that limits the artistic ambition. It must open the same site coherently, without fatal black screens, inaccessible navigation, or misleading promises. Where an effect is truly unsupported or unstable, apply *measured runtime graceful degradation* only to that effect. Don't globally downgrade the core Safari scene or preemptively remove fine details for speculative WebView limitations.
- Optimize intelligently: dynamic rendering resolution or performance tiers may protect frame pacing, but avoid reducing artistic quality just to hit an arbitrary FPS benchmark; prioritize perceived visual fidelity and stable interactions. Document actual measured performance if possible, never invent benchmarks.
- If Instagram's small/in-app view interrupts the intended experience, provide a tasteful **Open in Safari** suggestion or instructions when technically appropriate. Do not assume a web page can silently force Safari or bypass iOS browser restrictions.
- For this first experiment, focus all development, art direction and verification on portrait iPhone Safari. Verify iPhone-like viewport, dynamic viewport/safe areas, touch, progressive loading, context-loss resilience, audio gesture, and reduced-motion support. Test Instagram in-app compatibility only when feasible; clearly distinguish tested, simulated, and unverified claims.
- **Do not spend creative-production time on iPad, desktop, Android or Galaxy Tab layouts.** Ensure baseline fallback / navigation on other devices without specific cinematic polish. iPad Safari landscape is a future phase.

## CREATIVE DIRECTION
TOHEŞAR is an automotive culture and art archive spanning automobiles, people, music, city, place, design, fashion, time and memory. The site is itself a short advertisement / spatial artwork that can eventually become a portal into real editorial works. Avoid inventing or misrepresenting the brand's old or current slogans. Specifically DO NOT use the retired slogan "Cars built from songs, not for them." Use official assets where accessible, do not fabricate publication history or claim automatic POSTS 010–013 are published; LAUNCH 001 assets are LOCKED and remain untouched.

**Vertical slice to prioritize above any feature count**:
- A remarkably persuasive 5–12 second spatial journey suitable for portrait iPhone, with a strong first frame.
- Camera moving with cinematic restraint through dusk / warm urban road context. A vehicle should belong to the place, never simply spin on a plinth.
- One memorable camera movement that reveals an editorial object or image in the spatial environment.
- Clean typography and one working user action that explores the archive or progresses to the next location.
- The user should *feel the air, temperature, light, material and stillness*. Do not fake complexity with generic particle fields or UI noise.

## MICRO-REALISM: REQUIRED EXPERIMENTS
Demonstrate at least 4 visibly perceptible, performance-bounded physical details where possible. Prioritize:
1. Dry-vs-wet asphalt roughness changes, including subtle **water caught in asphalt crevices**.
2. Small, imperfect, angle-dependent reflected sky and body-color hints in the wet surface, without full mirror floors.
3. Fine road-grain, worn markings and irregular microgeometry/normal detail.
4. Warm low-angle sunset and contact-shadow softness under the vehicle/objects.
5. Restricted distance-based heat shimmer or localized refractive distortion above a sun-warmed road.
6. Atmospheric distance / thin haze / small exposure shifts / nonuniform lens response.
7. Imperfect clearcoat and glass reflections; distant window glints.
8. A barely perceptible light / shadow / material response as the virtual camera moves.

**Choose effects by visual payoff per GPU cost.** A materially convincing small glint beats 10 unrealistic effects. Label what is physically implemented, what is video or 2.5D illusion and what could not be achieved. Do not claim full ray tracing / realistic caustics if only an approximation exists.

## TECHNICAL FREEDOM WITH REAL SAFETY
- Inspect actual current repo files first. Current rebuild prototype uses root HTML/CSS/JS (index.html, styles.css, app.js) with CSS-generated hero art and no genuine 3D engine. You may adopt Vite/Three.js/React Three Fiber/GSAP/shaders or a well-justified alternative; use selective pre-rendered image/video layers where that gives a better iPhone experience.
- Prefer one working and beautiful path over adding heavyweight dependencies with broken deploy or black screens. Gracefully downgrade quality on constrained mobile GPU.
- Preserve semantic navigation and usable fallback for disabled 3D, slow network and reduced-motion preference.
- Be conservative with third-party asset rights. Do not invent commercial licenses; use own/procedural assets or openly licensed verified sources and document attribution.
- The live site at tohesar.com is protected. DO NOT merge or push to main, change CNAME, domain/DNS, GitHub Pages publishing or teambkit.com. The target work branch may be modified. Do not publish as the production website without explicit user approval.
- Do not alter approved LAUNCH 001 or other locked assets.
- If Work supports an isolated preview deployment safely, use it. Otherwise commit source and supply exact preview instructions. Never claim 'deployed' without a verifiable URL.

## WORKFLOW — ACT, DON'T JUST PLAN
1. Inspect latest tree and active code in target branch, and verify current state.
2. Implement an **end-to-end runnable iPhone vertical slice**; build the camera, materials, place, compositing, touch progression and archive entry point.
3. Run available build checks and browser/viewport screenshot/inspection. Repair real failures. Keep going through implementation until limited by actual environment or task limits, not by arbitrary prudence.
4. Commit all actual code to experiment/cinematic-world-001. Provide preview or reproduce commands.
5. Provide honest compact delivery report: branch and commit SHA, changed files, functioning details, measured performance if actually measured, what was visually verified vs not verified, blockers, next incremental improvement.

## PASS/FAIL
PASS = real rendered spatial movement and at least 4 genuinely visible micro-realism effects in a functional portrait-iPhone Safari-targeted preview; navigation or touch action works; no black-screen crash in tested environment; changes committed; live site unchanged.
PARTIAL = functioning scene exists but some tests/effects or physical iPhone Safari / Instagram verification couldn't be completed. Give evidence and precise remaining gaps.
FAIL = only prose/mockup/static picture or unverified claims of implementation. A compelling prototype is better than a 40-page plan.

**Start implementing immediately. Do not ask for permission to experiment within this isolated branch.**
