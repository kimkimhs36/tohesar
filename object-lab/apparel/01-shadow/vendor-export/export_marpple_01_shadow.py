# -*- coding: utf-8 -*-
"""TOHEŞAR 01 vendor-safe print art export. Preserves official vector path; no upload or order."""
from pathlib import Path
from urllib.request import urlopen
from io import BytesIO
from datetime import datetime, timezone
import re, json, hashlib, math
import xml.etree.ElementTree as ET
from resvg_py import svg_to_bytes
from PIL import Image
ROOT = Path(__file__).resolve().parent
OUT = ROOT / "MARPPLE_PRINT_ART"
OUT.mkdir(parents=True,exist_ok=True)
URL = "https://raw.githubusercontent.com/kimkimhs36/tohesar/object-lab/06-afterhours-longsleeve-20261109/assets/wordmark.svg"
raw = urlopen(URL,timeout=20).read().decode("utf-8")
root=ET.fromstring(raw)
ns={"svg":"http://www.w3.org/2000/svg"}
paths=root.findall(".//svg:path",ns)
assert len(paths)==1, "must have exactly one authoritative original path"
src=paths[0]
assert root.attrib.get("viewBox")=="0 0 1109 255"
assert src.attrib.get("fill")=="#f8f2e7"
assert src.attrib.get("fill-rule")=="evenodd"
d=src.attrib["d"]
assert len(d)>1000
assert hashlib.sha256(raw.encode("utf-8")).hexdigest()=="17d4ac8b0e3f13d8b4e76e5c335a9ee42a603136401d8fa81422b70ae5337d20", "official SVG changed — STOP"
assert hashlib.sha256(d.encode("utf-8")).hexdigest()=="b7d36711e60d94465d0587e4a4e4100fba1217a2157865995717ca8c23b0d93d", "official path changed — STOP"
physical_width=82.0
physical_height=physical_width*255/1109
svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{physical_width:g}mm" height="{physical_height:.6f}mm" viewBox="0 0 1109 255" role="img"><title>TOHEŞAR 01 SHADOW official path 82mm ivory / NOT vendor-approved</title><path fill="#f8f2e7" fill-rule="evenodd" d="{d}"/></svg>'
v=OUT/"01-SHADOW-82MM-IVORY-PRINT-MASTER-UNAPPROVED.svg"
v.write_text(svg,encoding="utf-8")
width=2500
render_svg=re.sub(r'width="[^"]+" height="[^"]+"', 'width="1109" height="255"', svg, count=1)
png_bytes=svg_to_bytes(svg_string=render_svg,width=width,height=round(width*255/1109))
im=Image.open(BytesIO(png_bytes)).convert("RGBA")
assert im.width==width and im.height>=570
assert im.getpixel((0,0))[3]==0
assert im.getpixel((im.width-1,0))[3]==0
alpha=im.getchannel("A")
bbox=alpha.getbbox()
assert bbox and bbox[2]-bbox[0] > 2350
dpi=width/(physical_width/25.4)
out=OUT/"01-SHADOW-82MM-IVORY-TRANSPARENT-2500PX-UNAPPROVED.png"
im.save(out,dpi=(dpi,dpi))
check=Image.open(out).convert("RGBA")
assert check.size==im.size and check.getchannel("A").getbbox()==bbox
manifest={
 "title":"TOHEŞAR 01 SHADOW / MARPPLE file-format preflight (not uploaded)",
 "generated_at_utc":datetime.now(timezone.utc).isoformat(),
 "official_source_url":URL,
 "source_svg_sha256":hashlib.sha256(raw.encode("utf-8")).hexdigest(),
 "source_path_sha256":hashlib.sha256(d.encode("utf-8")).hexdigest(),
 "source_path_character_count":len(d),
 "art_width_mm":physical_width,
 "art_height_mm":round(physical_height,5),
 "png_pixels":list(im.size),
 "png_alpha_bbox":list(bbox),
 "png_has_transparent_background":True,
 "png_approx_embedded_dpi":round(dpi,2),
 "vendor_note":"MARPPLE editor accepts PNG/JPG; exact on-garment 82mm placement must be set manually in editor and approved by vendor. Pixel/dpi metadata alone does not enforce print size.",
 "owner_approval":"NOT APPROVED",
 "uploaded":False,"price_verified":False,"ordered":False
}
(OUT/"01-MARPPLE-PREFLIGHT-QA.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(manifest,ensure_ascii=True,indent=2))
print("FILES:",*(p.name for p in OUT.iterdir()),sep="\n - ")
