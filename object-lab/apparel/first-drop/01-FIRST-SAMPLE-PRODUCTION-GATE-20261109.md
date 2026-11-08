# TOHEŞAR — FIRST DROP / 01 SHADOW UNIFORM / production gate
**Updated 2026-11-09 (KST). Preproduction research, not a purchase authorization.**

## Scope / why
Create **one real wearable clothing sample** and evaluate handfeel, actual fit and original-wordmark print durability before scaling. Keep **04 OFFSET SHELL R02** separate: it requires new patternmaking/cut-and-sew, and cannot be satisfied by printing on a ready-made blank.

## Locked creative from earlier R02
- 01: washed charcoal concept, 82mm small original ivory wordmark on front.
- Asset: `01-SHADOW-CHEST-82MM-ORIGINAL-PATH-IVORY.svg`, physically 82 x 18.854824 mm, transparent canvas, original path unchanged. Source `assets/wordmark.svg` git blob SHA `e9b299f8d797625b3704103c08ea1aede5c5ea05`.
- Flatlay: `01-SHADOW-SOURCE-LOCKED-FRONT.svg` is a visualization, **not** an actual product photo and **not** the print master.
- Artwork is a **candidate** based on website original, not proof of owner-approved garment master. No permission to alter or redraw the Ş or any letter shape.
- Exact garment base color availability, physical chest placement and print process are not locked, and supplier editor placement overrides should be checked on a 1:1 measuring guide.

## Vendor discovery — verified advertised starting prices (NOT checkout totals)
Source: https://www.ohprint.me/apparel/store/tshirt-shortsleeves/overview, checked 2026-11-09.
| Candidate | Starting displayed price | Reason to evaluate | Open questions |
| --- | ---: | --- | --- |
| UA 20수 헤비웨이트 오버핏 티셔츠 | ₩26,500+ | Structured, boxier silhouette candidate; preferred first physical **fit** test | Whether washed charcoal is offered, material composition and actual measured size, single chest print price, upload support, shipping, VAT, full checkout |
| 컴포트컬러즈 워싱 릴렉스핏 티셔츠 | ₩21,500+ | Washed surface/relaxed fit comparator | Dark charcoal availability, actual color and size options, print area/method, shipping, VAT, full checkout |

Supplier general instructions, source: https://www.ohprint.me/blog/spring-sports-day-uniform-guide-2026
- 1-item order described as possible in the supplier's public guides; not verified with either precise candidate configuration.
- PNG/AI artwork, 300dpi or higher recommended in supplier public guide; **SVG upload acceptance is not verified**.
- Supplier quality review is described, but it is not proof of our individual design passing artwork/quality acceptance.
- The online product list advertises a *starting price*, not a guaranteed selected-size/ink price.

## Artwork and actual resolution
- **True vector asset** remains highest fidelity; no generative upscaling, no font recreation.
- `build_01_chest_print_assets.py` is a deterministic export tool to produce *transparent* PNGs at **300dpi (~969 × 223 px)** and **600dpi (~1937 × 445 px)** for the exact 82mm output width. It validates original Git blob identity, the `d` geometry and PNG alpha channel. It also emits a JSON manifest with SHA-256 evidence.
- Run from checked-out repo: `python -m pip install resvg_py pillow`; `python object-lab/apparel/first-drop/build_01_chest_print_assets.py`.
- Only the vector and reproducible **script** have been committed; the PNGs have not been generated or verified in this GitHub connector session.
- Even a transparent 600dpi PNG does not fix a vendor editor mis-scaling the actual logo width: inspect and set 82mm physically in the editor.

## One sample — practical QC protocol (proposed internal acceptance, not a factory warranty)
**Before payment:** find exact color and size by seller size chart; check editor can reproduce 82mm mark and preserve Ş; select one sided chest print; read material and care instructions; verify one-unit checkout total including VAT, shipping, surcharges; save screenshots; owner must explicitly approve order, payment and personal-info sharing.

**Upon receipt, capture evidence:**
1. Photo front/back with ruler and neutral lighting; measure left chest mark width in mm.
2. Measure actual pit-to-pit (half chest), shoulder, body length, sleeve length, compare blank chart.
3. Document pigment wash variation and handfeel separately from print method quality.
4. Inspect original Ş, edges, print opacity, no halo/glue edge, no cracking, no misshapen strokes.
5. First try-on front/side/back in everyday movement; check shoulder, arm drop, hem proportion.
6. Repeat measurements and close-up image after care-label-compliant washes at 1 and 3 cycles; log shrinkage % for each dimension as `100*(before-after)/before`. Proposed internal target: no visible print cracking and <3% dimension shrinkage; these are **our test criteria**, not vendor guarantees.

**Status separately:** `artwork candidate: yes`; `vendor upload pass: no`; `verified full price: no`; `owner order approval: no`; `ordered: no`; `received: no`; `wear test: no`; `photographic completion: no`.

## Design / 04 independence
04 OFFSET SHELL R02 A MONOLITH/TONAL is restrained direction; B PETROL/INTERRUPTION is optional exploration. Existing source tech draft holds 12 provisional POM targets, 9 BOM components and 16 sewing/validation steps. These are not real garment patterns, physical measurements or approved production specs. Do not start 04 factory quotes, order, or call it ready-to-cut.

## Stop conditions and next legitimate progress
Do not make up available colors, exact size, actual 1-unit cost or verified printer file support. Do not order, pay, provide PII or send vendor messages without explicit user approval. The next concrete gate is a confirmed 1-unit seller configurator subtotal + shipping and a saved preview showing original Ş and 82mm print width. The user can then be asked **one** evidence-based approval question; until then, no premature purchase request.

## Continuity
Main site remains untouched; all files are on `object-lab/apparel-first-drop-r02-20261109`. This scope does NOT import the ₩50,000 budget assigned to *STICKER 001* into the apparel project.
