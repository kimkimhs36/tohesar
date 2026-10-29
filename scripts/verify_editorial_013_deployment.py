"""Verify the isolated release against the checked-out application, then render it.
Development-only; requires Playwright. Set WEBKIT_EXECUTABLE_PATH if necessary.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import urllib.request,hashlib,json,sys,os
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from review_editorial_013 import ready,scroll,geometry
root=ROOT;out=root/'docs/editorial-013-review/deployed';out.mkdir(parents=True,exist_ok=True)
base=os.environ.get('BASE_URL','https://tohesar-editorial-013-review.vercel.app').rstrip('/')
files=['journal/yokohama/index.html','journal/index.html','journal/visual/index.html','journal/911/index.html','journal/issues/001/index.html','journal/assets/yokohama013.css','journal/assets/world013.css','journal/assets/wallpaper011.css','journal/assets/wallpaper011.js','journal/data/wallpaper-layouts.json','journal/partials/yokohama-001-original.html','journal/yokohama/original-001/index.html','docs/editorial-013-review/index.html']
checks=[]
for file in files:
 url=base+'/'+file
 if file.endswith('index.html'):url=url[:-10]
 with urllib.request.urlopen(url,timeout=30) as response: remote=response.read()
 local=(root/file).read_bytes();same=remote==local
 assert same,file+' live source mismatch'
 checks.append(dict(path=file,byte_identical=same,sha256=hashlib.sha256(remote).hexdigest()))
(out/'source-verification.json').write_text(json.dumps(dict(source_sha='59f6b847e3d6818ff00e1a13749efabf86fe40ad',files=checks),indent=2))
receipts=[]
with sync_playwright() as pw:
 for engine in ['chromium','webkit']:
  kw=dict(headless=True)
  if engine=='chromium':kw.update(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  elif os.environ.get('WEBKIT_EXECUTABLE_PATH'):kw.update(executable_path=os.environ['WEBKIT_EXECUTABLE_PATH'])
  browser=getattr(pw,engine).launch(**kw)
  for w,h in [(390,844),(1180,820)]:
   p=browser.new_page(viewport=dict(width=w,height=h));response=p.goto(base+'/journal/yokohama/');assert response.status==200;ready(p)
   p.screenshot(path=str(out/f'{engine}-{w}-opening.png'))
   box=p.locator('[data-wallpaper]').bounding_box();top,height=box['y'],box['height'];pose=[]
   for name,ratio in [('start',0),('middle',.22),('end',.44),('reverse',.22)]:
    scroll(p,top+height*ratio-80);pose.append(p.locator('[data-wallpaper-car]').evaluate_all('(els)=>els.map(e=>e.style.transform)'))
    if name=='middle':p.screenshot(path=str(out/f'{engine}-{w}-prose.png'))
   assert pose[0]!=pose[2] and pose[1]==pose[3]
   p.emulate_media(reduced_motion='reduce');p.wait_for_function("matchMedia('(prefers-reduced-motion: reduce)').matches && [...document.querySelectorAll('[data-wallpaper-car]')].every(e=>!e.style.transform)",timeout=5000)
   receipts.append(dict(engine=engine,viewport=[w,h],motion=True,reverse=True,reduced_motion=True,**geometry(p)))
   p.close()
  browser.close()
(out/'checks.json').write_text(json.dumps(receipts,indent=2))
print('PASS live: source byte equality, actual public phone/tablet renders, motion, reverse and reduced motion.')
