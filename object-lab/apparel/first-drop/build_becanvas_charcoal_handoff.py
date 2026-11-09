#!/usr/bin/env python3
"""Build a real source-audited supplier intake ZIP for TOHEŞAR SHADOW UNIFORM 01.

Requires the CI workspace to supply the exact production-studio 600 DPI PNG
via first CLI argument. This package is a proposal, NOT final factory approval.
Never order or contact a vendor from this program.
"""
from __future__ import annotations

import hashlib
import io
import json
import sys
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

from PIL import Image

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[2]
SOURCE = ROOT / "assets" / "wordmark.svg"
ART = BASE / "01-SHADOW-CHEST-82MM-ORIGINAL-PATH-IVORY.svg"
FRONT = BASE / "exports/01-shadow-uniform/SHADOW-01-VENDOR-FRONT-PLACEMENT-REFERENCE-R02.png"
OUT = BASE / "vendor-handoff"
ZIPNAME = "TOHESAR-SHADOW01-BECANVAS-CHARCOAL-INTAKE-UNAPPROVED.zip"

SHA_ORIGINAL = "e9b299f8d797625b3704103c08ea1aede5c5ea05"
SHA_ARTWORK = "c4160648feb1d74d4b2af663b8755984a2ac77fa"
SHA_PRINT_600 = "cb41377e235346bd8786029e89edeb5567bcd61006a8226d0800184b9e3e847c"
SHA_FRONT = "f9620398fb4ced6a6a45d7dab91b157382900980342961cdebca8fb3d87e091b"
LOGO_D_SHA = "b7d36711e60d94465d0587e4a4e4100fba1217a2157865995717ca8c23b0d93d"
SVG_NS = "{http://www.w3.org/2000/svg}"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def blob_sha(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\x00" + data).hexdigest()


def get_logo(svg: bytes):
    root = ET.fromstring(svg)
    paths = [e for e in root.iter() if e.tag == SVG_NS + "path"]
    if len(paths) != 1:
        raise ValueError("Expected single authentic original vector path")
    for el in root.iter():
        if el.tag in (SVG_NS + "text", SVG_NS + "image", SVG_NS + "foreignObject"):
            raise ValueError("No text/image reconstruction permitted")
    return root, paths[0]


def verify_png(data: bytes, expected_sha: str, size: tuple[int, int], alpha: bool):
    if sha(data) != expected_sha:
        raise ValueError("SOURCE LOCK ERROR: actual PNG SHA256 changed")
    with Image.open(io.BytesIO(data)) as im:
        if im.format != "PNG" or im.size != size:
            raise ValueError("PNG format/pixel size mismatch")
        if alpha:
            if im.mode != "RGBA" or im.getchannel("A").getextrema() != (0, 255):
                raise ValueError("Artwork alpha channel incomplete")
            xdpi, ydpi = im.info.get("dpi", (0, 0))
            if abs(xdpi - 600) > 1 or abs(ydpi - 600) > 1:
                raise ValueError("Physical 600 DPI metadata missing")
    # Pillow requires verify() on a freshly opened, untouched handle.
    with Image.open(io.BytesIO(data)) as checksum_image:
        checksum_image.verify()


def write_zip(path: Path, files: dict[str, bytes]):
    # ZIP timestamp fixed for identical source/manifest -> identical archive bytes.
    with ZipFile(path, "w", compression=ZIP_DEFLATED, compresslevel=9) as z:
        for name in sorted(files):
            entry = ZipInfo(name, date_time=(2026, 11, 9, 0, 0, 0))
            entry.compress_type = ZIP_DEFLATED
            entry.external_attr = 0o644 << 16
            z.writestr(entry, files[name], compress_type=ZIP_DEFLATED, compresslevel=9)


def main(print_png_path: Path):
    original = SOURCE.read_bytes()
    art = ART.read_bytes()
    if blob_sha(original) != SHA_ORIGINAL or blob_sha(art) != SHA_ARTWORK:
        raise ValueError("GIT SOURCE LOCK: input vector blob is not the approved existing source")
    root_source, path_source = get_logo(original)
    root_art, path_art = get_logo(art)
    if path_source.attrib["d"] != path_art.attrib["d"]:
        raise ValueError("Logo geometry drift; do not recreate letters or cedilla")
    if sha(path_source.attrib["d"].encode()) != LOGO_D_SHA:
        raise ValueError("Logo path checksum changed")
    if path_art.attrib.get("fill", "").lower() != "#f8f2e7":
        raise ValueError("Original warm ivory must remain unchanged")
    if root_art.attrib.get("width") != "82mm":
        raise ValueError("Artwork physical width is not 82 mm")

    print_png = print_png_path.read_bytes()
    front_png = FRONT.read_bytes()
    verify_png(print_png, SHA_PRINT_600, (1937, 445), alpha=True)
    verify_png(front_png, SHA_FRONT, (1900, 2240), alpha=False)
    if len(print_png) > 5 * 1024 * 1024 or len(front_png) > 5 * 1024 * 1024:
        raise ValueError("Vendor public 5 MB per-file limit exceeded")

    guide = """TOHEŞAR OBJECT LAB / 01 SHADOW UNIFORM / PHYSICAL SAMPLE 1-UNIT INTAKE
2026-11-09 · PREPRODUCTION · ARTWORK / PRODUCT / PRICE NOT APPROVED
This package is for OWNER REVIEW FIRST. No supplier file transmission authorized.

[INTENDED PRODUCT / verify store selection first]
Manufacturer: BECANVAS (비캔버스)
Blank: 32수 2합 피그먼트 반팔티 275gsm / cotton 100% / oversized
Desired garment color: 차콜 (charcoal), a real manufacturer-listed color.
Actual selectable vendor color and in-stock size: NOT VERIFIED
Quantity: 1 piece
Size: UNDECIDED, do not assume user's size
Product manufacturer evidence: https://becanvas.co.kr/shop_view/254
Potential 1-piece printer / options:
https://sendicode.com/product/becanvas-%EB%B9%84%EC%BA%94%EB%B2%84%EC%8A%A4-%ED%94%BC%EA%B7%B8%EB%A8%BC%ED%8A%B8-32%EC%88%98-2%ED%95%A9-275gsm-%EB%B0%98%ED%8C%94/16416/
Seller's published page shows 15,000 KRW *base item price*, a <=10cm print
option, color/size selectors, 5 file uploads <=5MB each, minimum 1 unit.
Seller's published delivery policy: 3,500 KRW below 200,000 KRW.
NO VERIFIED SELECTED-OPTIONS CHECKOUT OR VAT CONFIRMATION.

[PRINT ASSET]
01_LOGO_82mm_IVORY_TRANSPARENT_600DPI.png
- SOURCE-LOCKED original TOHEŞAR vector; NO generated text, no redrawn Ş.
- Print exactly 82.0 mm wide (18.854824 mm high, proportional).
- Transparent background: DO NOT print any black rectangle.
- Ivory warm ink reference #F8F2E7, not pure white.
- Put once on the upper front chest; exact offset from neckline /
  shoulder / center must be measured/approved in vendor proof.
- Vendor category to check: '소형인쇄(10cm이하)' (82 mm <= 100 mm).
  Category suitability does NOT guarantee acceptance.
- Ask supplier to identify DTF vs DTG/other method, textile white
  underbase, actual ivory color matching and wash durability.
- For source geometry, 02_LOGO_82mm_SOURCE_VECTOR.svg has exact same d path.

[PLACEMENT REFERENCE]
03_FRONT_CONCEPT_REFERENCE_NOT_MEASURED.png
- Existing R02 illustration; not photograph of actual blank.
- NOT true-to-life garment dimensions or approved print placement.
- Compare style and relative restraint only.

[CHECK BEFORE ORDER — all remain PENDING]
1. Confirm seller's actual CHARCOAL + chosen size selector and available stock.
2. Confirm garment's size table, measured shoulder/chest/body length.
3. Upload original 600 DPI PNG to vendor editor, inspect exact 82mm proof.
4. Verify print method/ink/placement, extra print surcharge, VAT.
5. Read one-unit final price including 3,500 KRW shipping or updated amount.
6. Obtain the owner's approval BEFORE submitting any files to vendor,
   contacting supplier, ordering, entering PII or making any payment.
7. Only after delivery: check printing edge/ivory tone/82mm size,
   true fit, inside label, wash test, front and back sample photos.

[STATUS]
Logo source checksum tested: YES
PNG generated and round-trip validated in prior CI: YES
Vendor editor import: NO
Vendor checkout total: NO
Manufacture ordered/received/worn/washed/photographed: NO
Owner-approved garment brand master: NOT ESTABLISHED
"""
    manifest = {
        "product": "TOHESAR 01 SHADOW UNIFORM",
        "manufacturer_color_listing_verified": True,
        "seller_selected_color_size_verified": False,
        "print_category_publicly_listed": "소형인쇄(10cm이하)",
        "vendor_import_succeeded": False,
        "minimum_order_quantity_advertised": 1,
        "seller_blank_price_krw": 15000,
        "seller_shipping_policy_krw": 3500,
        "print_surcharge_krw": None,
        "actual_all_in_total_krw": None,
        "source_approved_as_final_brand_master": False,
        "source_blob_sha1": SHA_ORIGINAL,
        "art_blob_sha1": SHA_ARTWORK,
        "original_path_sha256": LOGO_D_SHA,
        "consent_to_send": False,
        "ordered": False,
        "received": False,
        "worn": False,
        "photo_finished": False,
    }

    contents = {
        "01_LOGO_82mm_IVORY_TRANSPARENT_600DPI.png": print_png,
        "02_LOGO_82mm_SOURCE_VECTOR.svg": art,
        "03_FRONT_CONCEPT_REFERENCE_NOT_MEASURED.png": front_png,
        "04_PRODUCTION_INTAKE_READ_ME_FIRST.txt": guide.encode("utf-8"),
    }
    manifest["files"] = [
        {"name": n, "sha256": sha(b), "bytes": len(b)}
        for n, b in sorted(contents.items())
    ]
    contents["05_SOURCE_AND_RELEASE_MANIFEST.json"] = (
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    ).encode("utf-8")
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / ZIPNAME
    write_zip(dest, contents)
    with ZipFile(dest) as z:
        if z.testzip() is not None:
            raise ValueError("ZIP CRC failed")
        if set(z.namelist()) != set(contents):
            raise ValueError("ZIP missing file")
        for name, expected in contents.items():
            if z.read(name) != expected:
                raise ValueError(f"ZIP roundtrip changed {name}")
    summary = {
        "archive_name": dest.name,
        "size_bytes": dest.stat().st_size,
        "sha256": sha(dest.read_bytes()),
        "files": manifest["files"],
        "ready_for_owner_review": True,
        "not_approved_for_external_vendor_upload": True,
        "vendor_checkout_verified": False,
    }
    (OUT / "HANDOFF-QC-RESULT.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: build_becanvas_charcoal_handoff.py <path-to-source-locked-600DPI-PNG>")
    main(Path(sys.argv[1]))
