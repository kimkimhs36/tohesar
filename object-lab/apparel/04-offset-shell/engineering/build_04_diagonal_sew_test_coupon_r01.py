#!/usr/bin/env python3
"""TOHESAR 04: full-scale A/B diagonal-join test COUPON, not a garment pattern."""
from __future__ import annotations
import argparse, hashlib, json, math
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import fitz

MM = 72 / 25.4
def pt(v): return v * MM
def curve(t):
    # Hypothetical 150 mm swatch: controlled bowed join, NOT the garment geometry.
    return (30.0 + 150.0*t, 20.0*t + 6.0*math.sin(math.pi*t))
def tangent(t):
    dy=20.0 + 6.0*math.pi*math.cos(math.pi*t)
    scale=math.hypot(150.0,dy)
    return (150.0/scale,dy/scale)
def shifted(t, baseline, normal_mm):
    x,y=curve(t);tx,ty=tangent(t)
    return (x-normal_mm*ty,baseline+y+normal_mm*tx)
def line_length(n=5000):
    last=curve(0);total=0.
    for i in range(1,n+1):
        cur=curve(i/n);total+=math.dist(last,cur);last=cur
    return total
def arc_notches():
    n=5000; points=[curve(i/n) for i in range(n+1)];dist=[0.]
    for i in range(1,n+1): dist.append(dist[-1]+math.dist(points[i-1],points[i]))
    positions=[]
    for ratio in (0.25,0.5,0.75):
        target=dist[-1]*ratio
        lo,hi=0,n
        while lo<hi:
            m=(lo+hi)//2
            if dist[m]<target:lo=m+1
            else:hi=m
        positions.append(lo/n)
    return positions

def document(out, qa):
    length=line_length()
    notches=arc_notches()
    assert 150 < length < 158, length
    assert all(.20<n<.80 for n in notches)
    assert abs(length-line_length(10000))<.0002
    assert math.isclose(math.dist(shifted(.44,202,-10),shifted(.44,202,0)),10.0,abs_tol=1e-8)
    assert math.isclose(math.dist(shifted(.44,120,10),shifted(.44,120,0)),10.0,abs_tol=1e-8)
    # The SAME mathematical stitch line is translated between panels.
    for t in (0,.1,.25,.5,.75,.9,1):
        ax,ay=shifted(t,202,0);bx,by=shifted(t,120,0)
        assert math.isclose(ax,bx,abs_tol=1e-9)
        assert math.isclose(ay-by,82,abs_tol=1e-9)
    c=canvas.Canvas(str(out),pagesize=A4,pageCompression=1)
    c.setTitle("TOHESAR 04 OFFSET SHELL | 1:1 diagonal seam sew-test coupon R01")
    c.setAuthor("TOHESAR Object Lab - INTERNAL")
    def txt(x,y,s,z=8,bold=False):
        c.setFillColorRGB(.15,.15,.16)
        c.setFont("Helvetica-Bold" if bold else "Helvetica",z)
        c.drawString(pt(x),pt(y),s)
    def outline(points,stroke=1,fill=0):
        path=c.beginPath();path.moveTo(pt(points[0][0]),pt(points[0][1]))
        for x,y in points[1:]:path.lineTo(pt(x),pt(y))
        path.close();c.drawPath(path,stroke=stroke,fill=fill)
    def pathline(pts):
        p=c.beginPath();p.moveTo(pt(pts[0][0]),pt(pts[0][1]))
        for x,y in pts[1:]:p.lineTo(pt(x),pt(y))
        c.drawPath(p,stroke=1,fill=0)
    c.setFillColorRGB(1,1,1);c.rect(0,0,*A4,fill=1,stroke=0)
    c.setFillColorRGB(.12,.14,.15);c.rect(0,pt(282),pt(210),pt(15),fill=1,stroke=0)
    c.setFillColorRGB(1,1,1);c.setFont("Helvetica-Bold",10)
    c.drawString(pt(13),pt(287),"OBJECT LAB  /  04 OFFSET SHELL  /  SEW-TEST")
    txt(13,275,"1:1 A4 COUPON  |  trial join only  |  NOT a whole-garment pattern",8,True)
    vals=[-.08 + 1.16*i/300 for i in range(301)]  # extend CUT edges beyond nominal stitch endpoints
    stitch_vals=[i/300 for i in range(301)]
    def contains(point, polygon):
        x,y=point;inside=False
        for a,b in zip(polygon, polygon[1:]+polygon[:1]):
            if (a[1]>y) != (b[1]>y):
                xx=a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1])
                if x<xx:inside=not inside
        return inside
    def draw_piece(baseline,side):
        if side=="A":
            cut=[shifted(t,baseline,-10) for t in vals]
            polygon=[(20,263),(190,263)] + list(reversed(cut))
            sewing=[shifted(t,baseline,0) for t in stitch_vals]
            title="A / UPPER PANEL - fold allowance toward A (trial only)"
            label_y=250
            dir_=-1
        else:
            cut=[shifted(t,baseline,10) for t in vals]
            polygon=cut+[(190,62),(20,62)]
            sewing=[shifted(t,baseline,0) for t in stitch_vals]
            title="B / LOWER PANEL - align matching arc-length notches"
            label_y=78
            dir_=1
        for t in (0,.01,.25,.5,.75,.99,1):
            assert contains(shifted(t,baseline,0),polygon), f'{side} stitch point outside cut outline at t={t}'
        c.setFillColorRGB(.964,.965,.960);c.setStrokeColorRGB(.16,.17,.17);c.setLineWidth(.9)
        outline(polygon,1,1)
        c.setDash(3,2);c.setStrokeColorRGB(.16,.34,.38);c.setLineWidth(.9)
        pathline(sewing);c.setDash()
        txt(38,label_y,title,8,True)
        for j,t in enumerate(notches):
            # Tick between the cut line and stitch line, not an actual physical slit.
            x0,y0=shifted(t,baseline,dir_*10)
            x1,y1=shifted(t,baseline,dir_*5)
            c.setLineWidth(1.1);c.setStrokeColorRGB(.12,.12,.12)
            c.line(pt(x0),pt(y0),pt(x1),pt(y1))
            if j==1:
                # Double middle notch reduces chance of flipping ends.
                x2,y2=shifted(min(1,t+.013),baseline,dir_*10)
                x3,y3=shifted(min(1,t+.013),baseline,dir_*5)
                c.line(pt(x2),pt(y2),pt(x3),pt(y3))
        txt(39,237 if side=="A" else 88,"CUT solid / SEW dashed / 10 mm trial allowance",7)
        txt(39,230 if side=="A" else 95,"Match notch positions by walked SEWING line, not cut edges.",6.8)
    draw_piece(202,"A")
    txt(13,183,"A/B pairing: SAME 150 mm x-span + bowed join geometry, exact shared sewing-line.",7.7)
    txt(13,175,"No factory fabric/size claim. Print 100%, cut solid outline, then transfer sewing marks.",7.5)
    draw_piece(120,"B")
    txt(13,49,"PRINTER SCALE TEST - Measure this bar exactly 100 mm before cutting:",8,True)
    c.setStrokeColorRGB(.1,.1,.1);c.setLineWidth(1.0)
    c.line(pt(32),pt(36),pt(132),pt(36))
    for k in range(11):
        x=32+k*10;c.line(pt(x),pt(34),pt(x),pt(39 if k%5==0 else 37.5))
    txt(31,29,"0",7);txt(125,29,"100 mm",7)
    txt(13,20,"Internal sewn-coupon geometry only. Proposed 10 mm allowance / no maker sign-off.",7)
    txt(13,13,"No logo, no supplier upload, no printing approval, no order, no physical fabric test.",7)
    c.showPage();c.save()
    doc=fitz.open(str(out));assert doc.page_count==1
    page=doc[0]
    assert abs(page.rect.width-pt(210))<.1 and abs(page.rect.height-pt(297))<.1
    text=page.get_text()
    assert all(x in text for x in ["UPPER PANEL","LOWER PANEL","100 mm","NOT a whole-garment pattern"])
    preview=out.with_suffix(".qa-preview.png")
    page.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False).save(str(preview))
    # Check curved 10 mm seam allowance and matched lines across all sampled notches.
    checks=[]
    for t in [0,.1,.25,.5,.75,.9,1]:
        a=math.dist(shifted(t,202,-10),shifted(t,202,0))
        b=math.dist(shifted(t,120,10),shifted(t,120,0))
        assert abs(a-10)<1e-8 and abs(b-10)<1e-8
        checks.append({"t":round(t,4),"A_allowance_mm":round(a,4),"B_allowance_mm":round(b,4)})
    record={
      "status":"PASS_DIGITAL_SWATCH_GEOMETRY_ONLY",
      "pdf_sha256":hashlib.sha256(out.read_bytes()).hexdigest(),
      "size_mm":[210,297],"pages":1,
      "sample_only":True,"not_whole_garment_pattern":True,
      "join_curve":"x=30+150t; y=20t+6sin(pi*t), t 0..1, mm",
      "A_stitch_line_mm":round(length,4),"B_stitch_line_mm":round(length,4),
      "stitch_line_difference_mm":0.0,"trial_allowance_mm":10,
      "notch_fractions_of_walk":[.25,.5,.75],
      "notch_parameters":[round(t,6) for t in notches],
      "sampled_allowance_checks":checks,
      "printer_bar_mm":100,
      "pdf_rendered":True,"preview":preview.name,
      "physical_printer_measurement":"NOT_RUN",
      "sewn_washed_swatch":"NOT_RUN",
      "maker_approval":False,"sample_cut":False,"vendor_contact":False
    }
    qa.write_text(json.dumps(record,indent=2),encoding="utf-8")
    doc.close()
    print(json.dumps(record,indent=2))
if __name__=="__main__":
    a=argparse.ArgumentParser();a.add_argument("--out",type=Path,required=True);a.add_argument("--qa",type=Path,required=True)
    p=a.parse_args();document(p.out,p.qa)
