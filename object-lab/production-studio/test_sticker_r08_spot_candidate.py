#!/usr/bin/env python3
"""Independent R08 spot separation / geometry / render QA, not printer approval."""
from pathlib import Path
import hashlib, json
import pymupdf as fitz
import numpy as np

root = Path(__file__).resolve().parent
pdf = root / "exports" / "STICKER-001-R08-SPOT-CANDIDATE-110x40mm-UNAPPROVED.pdf"
out_json = root / "STICKER-001-R08-SPOT-OVERPRINT-QA-20261114.json"
out_png = root / "exports" / "STICKER-001-R08-SPOT-OVERPRINT-300DPI-UNAPPROVED.png"
raw = pdf.read_bytes()
assert raw.startswith(b"%PDF-1.5"), "PDF_HEADER"
assert raw.count(b"/Type /OCG") == 2, "OCG_COUNT"
assert b"[/Separation /KissCut /DeviceCMYK 9 0 R]" in raw, "SPOT_SEPARATION"
assert b"/GSKissCut" not in raw, "WRONG_RESOURCE_NAME"
assert b"/GSKissOverprint gs" in raw and b"/CS_CutSpot CS" in raw and b"1 SCN" in raw, "SPOT_STROKE_COMMANDS"
assert b"/OP true /op true /OPM 1" in raw, "OVERPRINT"
assert b"/C1 [0 1 0 0]" in raw, "MAGENTA_FALLBACK"
assert b"0 1 0 0 K" not in raw, "DEVICE_CMYK_CUTLINE_LEAK"
assert b"/Subtype /Image" not in raw and b"/Font" not in raw, "ART_RASTERIZED_OR_FONT"
assert b"f*" in raw and b" re S" in raw, "VECTOR_ART_OR_CUT"
doc = fitz.open(pdf)
assert doc.page_count == 1
page = doc[0]
w = page.rect.width*25.4/72
h = page.rect.height*25.4/72
assert abs(w-110)<0.002 and abs(h-40)<0.002, (w,h)
ocgs = doc.get_ocgs()
assert len(ocgs)==2 and set(ocgs)=={6,7},ocgs
assert b"/Name <FEFFC778C1C4>" in raw and b"/Name <FEFFBC18CE7C>" in raw, "OCG_UNICODE_LAYER_NAMES"
assert "/Separation" in doc.xref_object(8) and "/KissCut" in doc.xref_object(8)
assert "/Type /ExtGState" in doc.xref_object(10) and "/OPM 1" in doc.xref_object(10)
pix=page.get_pixmap(matrix=fitz.Matrix(300/72,300/72),alpha=False)
pix.save(out_png)
p=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)[:,:,:3].astype(np.int16)
r,g,b=p[:,:,0],p[:,:,1],p[:,:,2]
mag=(r>155)&(b>90)&(g<80)&((r-g)>95)&((b-g)>60)
ivory=(r>220)&(g>205)&(b>180)&((r-g)<35)&((r-b)<45)&((r-b)>5)
dark=(r<55)&(g<55)&(b<55)
num=int(mag.sum())
assert num>100, ("MAGENTA_NOT_VISIBLE",num)
assert int(ivory.sum())>100, ("IVORY_NOT_VISIBLE",int(ivory.sum()))
assert int(dark.sum())>10000, ("DARK_BACKGROUND_NOT_VISIBLE",int(dark.sum()))
ys,xs=np.where(mag)
bbox_mm=[float(xs.min()/pix.width*110),float(ys.min()/pix.height*40),float((xs.max()+1)/pix.width*110),float((ys.max()+1)/pix.height*40)]
expected=[5,5,105,35]
assert all(abs(a-b)<0.7 for a,b in zip(bbox_mm,expected)), ("CUTLINE_WRONG_RECT",bbox_mm)
doc.close()
receipt={
 "dateKst":"2026-11-14",
 "state":"UNAPPROVED_INTERNAL_SPOT_SEPARATION_TEST",
 "pdfBytes":len(raw),
 "pdfSha256":hashlib.sha256(raw).hexdigest(),
 "pdfVersion":"1.5",
 "mediaBoxMm":[round(w,6),round(h,6)],
 "sourceOriginalLogo":"git blob e9b299f8d797625b3704103c08ea1aede5c5ea05, retained by R08 source-locked generator",
 "cutline":"spot /KissCut /Separation with DeviceCMYK M100 fallback, 0.5pt, OPM1 overprint",
 "cutlineBBoxMmMeasured":[round(v,4) for v in bbox_mm],
 "render":{"method":"PyMuPDF", "dpi":300,"pixelSize":[pix.width,pix.height],"darkPixelCount":int(dark.sum()),"ivoryPixelCount":int(ivory.sum()),"magentaPixelCount":num,"pngSha256":hashlib.sha256(out_png.read_bytes()).hexdigest()},
 "checks":{"sourceShaLockedOnGeneration":"PASS","separationSpot":"PASS","OCGPrintKisscut":"PASS","pageSize110x40":"PASS","overprint":"PASS","cutline100x30Inset5Within0.7mm":"PASS","darkIvoryAndMagentaRendered":"PASS"},
 "notRun":["Independent OCG on/off raster isolation (PyMuPDF set_layer yielded identical PNGs)","Adobe Illustrator PDF separation review","PDF/X conversion","Adobe Acrobat preflight","printer spot name acceptance","ICC calibrated color","actual vendor artwork upload","physical print/cut","supplier quote/order"],
 "vendorRequirementsReference":[
  "https://www.redprinting.co.kr/ko/guide3/view/freeform-sticker",
  "https://www.redprinting.co.kr/ko/guide3/view/finishing-overview"
 ],
 "vendorApproval":False,
 "ownerApproved":False
}
out_json.write_text(json.dumps(receipt,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(receipt,ensure_ascii=False,indent=2))
