#!/usr/bin/env python3
"""01 SHADOW paper placement gauge: actual-size A4, no vendor connection."""
from __future__ import annotations
import argparse, hashlib, io, json
from pathlib import Path
from PIL import Image, ImageChops
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
import fitz

EXPECTED_ART_SHA256 = "10eb8c3f582039bca54b8313c0e6a91dad99202e0265c600feef0a73ec75bd07"
ART_NAME = "01-SHADOW-82MM-IVORY-TRANSPARENT-2500PX-UNAPPROVED.png"
PDF_NAME = "01-SHADOW-82MM-PAPER-PLACEMENT-GAUGE-R01-20261111.pdf"
QA_NAME = "01-SHADOW-PAPER-PLACEMENT-GAUGE-R01-QA.json"
MM = 72 / 25.4
def mm(v): return v * MM

def build(art: Path, target: Path, qa: Path):
    assert art.is_file(), f"missing original art: {art}"
    art_hash = hashlib.sha256(art.read_bytes()).hexdigest()
    assert art_hash == EXPECTED_ART_SHA256, "refuse altered original logo"
    src = Image.open(art).convert("RGBA")
    assert src.size == (2500,575) and src.getchannel("A").getbbox() == (4,4,2491,569)
    # Strongest ink is warm ivory, and the rest must retain transparency.
    rgba = src.getpixel((0,0))
    assert rgba[3] == 0, "background is not transparent"
    assert src.getchannel("A").getextrema() == (0,255)
    assert any(src.getpixel((x,y))[3] > 0 for x,y in [(1250,250),(1250,300),(500,250)]) or src.getchannel("A").getbbox()
    # Flatten ONLY for paper preview; never modify the print master.
    opaque = Image.new("RGBA",src.size,"#252729")
    opaque.alpha_composite(src)
    patch = ImageReader(opaque.convert("RGB"))
    c = canvas.Canvas(str(target), pagesize=A4, pageCompression=1)
    c.setTitle("TOHESAR - 01 SHADOW - Paper Placement Gauge - NOT APPROVED")
    c.setAuthor("TOHESAR Object Lab")
    cw,ch=A4
    def tx(x,y,s,size=8,font="Helvetica",rgb=(.15,.17,.18)):
        c.setFillColorRGB(*rgb); c.setFont(font,size); c.drawString(mm(x),mm(y),s)
    c.setFillColorRGB(.97,.97,.96);c.rect(0,0,cw,ch,stroke=0,fill=1)
    c.setFillColorRGB(.08,.09,.1);c.rect(0,mm(277),cw,mm(20),fill=1,stroke=0)
    tx(17,284,"OBJECT LAB     /     01 SHADOW UNIFORM",12,"Helvetica-Bold",(.97,.95,.9))
    tx(16,264,"82 MM   /   PAPER-ONLY PLACEMENT GAUGE",14,"Helvetica-Bold")
    tx(16,256,"Cut the charcoal card. Place it on a shirt without using adhesive.",8)
    tx(16,250,"Print A4 at ACTUAL SIZE / 100%. Never use 'fit to page'.",8,"Helvetica-Bold")
    c.setStrokeColorRGB(.3,.32,.33); c.setLineWidth(.6)
    c.line(mm(16),mm(246),mm(194),mm(246))
    tx(16,233,"01  /  CUT-OUT SWATCH",9,"Helvetica-Bold")
    tx(16,226,"106 x 49 mm paper rectangle / original source-locked ivory mark",7.5)
    # 106 x 49 mm physical silhouette; dotted outline is to cut, not production trim.
    x,y,w,h=52,166,106,49
    c.setFillColorRGB(.145,.153,.161);c.rect(mm(x),mm(y),mm(w),mm(h),stroke=0,fill=1)
    # Precisely 82 mm PDF-image rectangle, 18.86 mm tall from 575:2500 pixels.
    artw=82
    arth=82 * 575 / 2500
    artx=x+(w-artw)/2
    arty=y+(h-arth)/2
    c.drawImage(patch,mm(artx),mm(arty),width=mm(artw),height=mm(arth),mask='auto')
    c.saveState();c.setDash(2.2,2.2);c.setStrokeColorRGB(.36,.36,.36)
    c.setLineWidth(.7);c.rect(mm(x),mm(y),mm(w),mm(h),fill=0,stroke=1)
    c.restoreState()
    tx(16,202,"CUT",9,"Helvetica-Bold")
    tx(16,197,"along",7)
    tx(16,193,"dashed",7)
    tx(16,189,"outline",7)
    tx(16,155,"The logo is 82 mm across its IMAGE canvas, not a vendor-approved print.",7.4)
    tx(16,148,"Do not infer ink opacity, fabric color, or transfer edge from paper.",7.4)
    c.setStrokeColorRGB(.4,.43,.43);c.line(mm(16),mm(140),mm(194),mm(140))
    tx(16,133,"02  /  PRINTER CALIBRATION",9,"Helvetica-Bold")
    tx(16,127,"A 100 mm bar must measure exactly 100 mm with a physical ruler.",7.5)
    x0,y0=37,112
    c.setStrokeColorRGB(.1,.11,.12);c.setLineWidth(.8)
    c.line(mm(x0),mm(y0),mm(x0+100),mm(y0))
    for i in range(11):
        xx=x0+10*i;c.line(mm(xx),mm(y0-2),mm(xx),mm(y0+(5 if i%5==0 else 3)))
    tx(37,104,"0",7);tx(130,104,"100 mm",7)
    c.line(mm(16),mm(98),mm(194),mm(98))
    tx(16,90,"03  /  LATERAL POSITION STRIP",9,"Helvetica-Bold")
    tx(16,83,"Candidate: measure 120 mm sideways from the garment centre to LOGO centre.",7.3)
    # 180 mm linear strip, ticked every 10 mm; user can cut it out.
    sx,sy=15,65
    c.setLineWidth(.45);c.setStrokeColorRGB(.25,.27,.28)
    c.line(mm(sx),mm(sy),mm(sx+180),mm(sy))
    for t in range(0,181,10):
        c.line(mm(sx+t),mm(sy-2),mm(sx+t),mm(sy+(6 if t in (0,120,180) else 3)))
    tx(sx,57,"0 / CENTRE",7)
    tx(sx+112,57,"120",8,"Helvetica-Bold")
    tx(sx+163,57,"180 mm",7)
    tx(16,45,"120 mm is a candidate centre offset; VERTICAL placement is still unknown.",7.1)
    tx(16,38,"Keep the logo card level. Check wearer-left direction before judging fit.",7.1)
    tx(16,29,"PAPER MOCK ONLY  /  NO SUPPLIER APPROVAL  /  NO PURCHASE  /  NO FABRIC TEST",7,"Helvetica-Bold")
    c.setStrokeColorRGB(.3,.3,.3);c.line(mm(16),mm(24),mm(194),mm(24))
    tx(16,16,"Original RGBA 2500 x 575 px  |  PDF art box 82.000 x 18.860 mm  |  A4 210 x 297 mm",7)
    tx(16,10,"Scale reference: physical ruler is authoritative. Check printer settings and margins.",7)
    c.showPage();c.save()
    doc=fitz.open(str(target))
    assert doc.page_count==1
    page=doc[0]
    assert abs(page.rect.width-mm(210)) < .1 and abs(page.rect.height-mm(297))<.1
    imgrefs=page.get_images(full=True)
    assert imgrefs,"missing actual original image in PDF"
    rects=[rect for info in imgrefs for rect in page.get_image_rects(info[0])]
    assert any(abs(rect.width-mm(82))<.08 and abs(rect.height-mm(arth))<.08 for rect in rects),rects
    assert "ACTUAL SIZE" in page.get_text() and "VERTICAL placement is still unknown" in page.get_text()
    pix=page.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False)
    assert pix.width>1100 and pix.height>1600
    preview=target.with_suffix(".qa-preview.png")
    pix.save(str(preview))
    record={
      "status":"PASS_PDF_GEOMETRY_AND_RENDER_ONLY",
      "sourceArtSha256":art_hash,
      "sourcePixelDimensions":list(src.size),
      "sourceAlphaBoundingBox":list(src.getchannel("A").getbbox()),
      "pdfSha256":hashlib.sha256(target.read_bytes()).hexdigest(),
      "pdfPages":1,"pdfA4Millimeters":[210,297],
      "nominalWordmarkCanvasMillimeters":[82,round(arth,3)],
      "paperCutoutMillimeters":[106,49],
      "printerRulerMillimeters":100,"lateralCandidateMillimeters":120,
      "verticalPlacementApproved":False,"vendorImageUpload":False,
      "sampleMade":False,"actualPrinterCheck":"NOT_RUN",
      "physicalCutAndWearCheck":"NOT_RUN",
      "rasterPreview":preview.name,
      "checks":["PNG SHA and alpha exact","A4 PDF page geometry","embedded image art rectangle 82 mm","PDF text notes","PyMuPDF raster rendered"]
    }
    qa.write_text(json.dumps(record,indent=2),encoding="utf-8")
    print(json.dumps(record,indent=2))
    doc.close()

if __name__ == "__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--art",type=Path,default=Path(__file__).with_name(ART_NAME))
    p.add_argument("--out",type=Path,default=Path(__file__).with_name(PDF_NAME))
    p.add_argument("--qa",type=Path,default=Path(__file__).with_name(QA_NAME))
    a=p.parse_args();build(a.art,a.out,a.qa)
