# -*- coding: utf-8 -*-
"""TOHEŞAR 07 AFTERIMAGE crewneck: original path QA + vendor-safe transparent PNG export."""
from pathlib import Path
from urllib.request import urlopen
from io import BytesIO
import xml.etree.ElementTree as ET
import hashlib, json, re
from resvg_py import svg_to_bytes
from PIL import Image
base="https://raw.githubusercontent.com/kimkimhs36/tohesar/object-lab/06-afterhours-longsleeve-20261109/"
original=urlopen(base+"assets/wordmark.svg",timeout=20).read().decode("utf-8")
art=urlopen(base+"object-lab/apparel/07-afterimage-crew/07-AFTERIMAGE-82MM-ONE-SURFACE-PRINT-UNAPPROVED.svg",timeout=20).read().decode("utf-8")
ns={"s":"http://www.w3.org/2000/svg"}
a=ET.fromstring(original).find(".//s:path",ns)
b=ET.fromstring(art).find(".//s:path",ns)
assert a is not None and b is not None and a.attrib["d"]==b.attrib["d"]
assert b.attrib["fill"]=="#f8f2e7" and b.attrib["fill-rule"]=="evenodd"
assert 'width="82mm"' in art and 'viewBox="0 0 1109 423"' in art
out=Path(__file__).resolve().parent/"MARPPLE_PRINT_ART"
out.mkdir(exist_ok=True)
render=re.sub(r'width="[^"]+" height="[^"]+"', 'width="1109" height="423"', art, count=1)
data=svg_to_bytes(svg_string=render,width=2500)
im=Image.open(BytesIO(data)).convert("RGBA")
assert im.width==2500 and 950 <= im.height <= 956, f'unexpected size {im.size}'
assert im.getpixel((0,0))[3]==0
box=im.getchannel("A").getbbox()
assert box and box[2]>2450 and box[3]>800
png=out/"07-AFTERIMAGE-82MM-TRANSPARENT-2500PX-UNAPPROVED.png"
ppi=2500/(82/25.4)
im.save(png,dpi=(ppi,ppi))
qa={"collection":"TOHEŞAR OBJECT LAB", "product":"07 AFTERIMAGE CREW", "source_path_sha256":hashlib.sha256(a.attrib["d"].encode()).hexdigest(),"art_svg_sha256":hashlib.sha256(art.encode()).hexdigest(), "art_width_mm":82,"art_height_mm":round(82*423/1109,4),"png_size":list(im.size),"alpha_bbox":list(box), "transparent":True, "one_surface_print_candidate":True,"vendor_color_choice":"charcoal","vendor_art_uploaded":False,"vendor_art_approved":False,"real_print_charge_verified":False,"final_quote_verified":False,"ordered":False}
(out/"07-AFTERIMAGE-ART-QA.json").write_text(json.dumps(qa,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(qa,ensure_ascii=True,indent=2))
print("OUTPUT:",png.name, png.stat().st_size, "bytes")