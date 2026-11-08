#!/usr/bin/env python3
"""TOHEŞAR STICKER 001 — fail-closed SVG preflight, Python stdlib only.
Usage: python object-lab/production-studio/preflight_sticker_001.py
Only checks file structure/provenance; never certifies print-shop approval.
"""
import hashlib
import json
from pathlib import Path
from xml.etree import ElementTree as ET

BASE=Path(__file__).resolve().parent
STICKER=BASE/"STICKER-001-100x30mm-CANDIDATE.svg"
ORIGINAL=BASE/"WORDMARK-WEB-SOURCE-REFERENCE.svg"
EXPECTED_STICKER_BLOB="e9e445ddc5b4e762c3d454bcf3947bde6108899c"
EXPECTED_ORIGINAL_BLOB="e9b299f8d797625b3704103c08ea1aede5c5ea05"
NS="{http://www.w3.org/2000/svg}"
def blobsha(data):
    return hashlib.sha1(f"blob {len(data)}\\0".encode()+data).hexdigest()
def find(root,name):
    return [x for x in root.iter() if x.tag==NS+name]
def main():
    checks={}
    s=STICKER.read_bytes()
    o=ORIGINAL.read_bytes()
    checks["sticker_git_blob_unchanged"]=blobsha(s)==EXPECTED_STICKER_BLOB
    checks["original_git_blob_unchanged"]=blobsha(o)==EXPECTED_ORIGINAL_BLOB
    sticker=ET.fromstring(s); original=ET.fromstring(o)
    checks["canvas_100x30mm"]=(sticker.get("width"),sticker.get("height"),sticker.get("viewBox"))==("100mm","30mm","0 0 100 30")
    rects=find(sticker,"rect")
    checks["black_full_canvas"]=len(rects)==1 and all(rects[0].get(k)==v for k,v in {"x":"0","y":"0","width":"100","height":"30","fill":"#10110F"}.items())
    nested=find(sticker,"svg")
    nested=[x for x in nested if x is not sticker]
    checks["one_nested_92mm_logo"]=len(nested)==1 and all(nested[0].get(k)==v for k,v in {"x":"4","y":"5.4","width":"92","height":"21.15419297","viewBox":"0 0 1109 255"}.items())
    paths=find(sticker,"path"); refpaths=find(original,"path")
    checks["single_exact_original_vector"]=len(paths)==1 and len(refpaths)==1 and paths[0].get("d")==refpaths[0].get("d")
    checks["ivory_vector"]=len(paths)==1 and paths[0].get("fill")=="#F8F2E7"
    checks["no_live_text_or_external_image"]=not (find(sticker,"text") or find(sticker,"image") or find(sticker,"foreignObject") or find(sticker,"use"))
    checks["no_external_url"]=b"http://" not in s.replace(b"http://www.w3.org/2000/svg",b"") and b"https://" not in s
    # Geometry is a *nominal* sticker canvas; production bleed/cutline is not provided.
    checks["no_unapproved_cutter_path"]=not any("cut" in (x.get("id","")+x.get("class","")).lower() for x in sticker.iter())
    result={"product":"STICKER 001","source_sticker_blob":blobsha(s),"source_wordmark_blob":blobsha(o),
      "checks":checks,"passed":all(checks.values()),
      "production_release":False,
      "open_gates":["owner-approved sticker master comparison","vendor editor import test",
        "vendor-specific bleed and contour-cut specification","actual count per sheet",
        "verified shipping-inclusive checkout total","owner purchase authorization"]}
    print(json.dumps(result,ensure_ascii=False,indent=2))
    if not result["passed"]:raise SystemExit(1)
if __name__=="__main__":main()
