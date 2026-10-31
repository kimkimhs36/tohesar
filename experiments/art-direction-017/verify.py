#!/usr/bin/env python3
"""Browser and preservation evidence for the isolated 017 preview.
Requirements: playwright, beautifulsoup4, pillow; Playwright WebKit installed.
Serve repository root first: python -m http.server 8177
BASE_URL=http://127.0.0.1:8177 python experiments/art-direction-017/verify.py
"""
import os, json, subprocess, hashlib, statistics, time
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import urlopen
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
OUT=HERE/'review'/'final';OUT.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('BASE_URL','http://127.0.0.1:8177').rstrip('/')
PREFIX='/experiments/art-direction-017/'
START='70d2a818c0be7f695b840fe5a2f2f0255d240b97'

def git(*args,input=None):
 return subprocess.check_output(['git',*args],cwd=ROOT,input=input)

def normalized(el):
 return ' '.join(el.get_text(' ',strip=True).split())

# Compare every source manuscript paragraph, heading, deck and source disclosure.
manuscripts=[]
for slug in ['911','f40']:
 original=BeautifulSoup((ROOT/f'journal/{slug}/index.html').read_text(),'html.parser')
 for variant in ['a','b']:
  preview=BeautifulSoup((HERE/variant/slug/'index.html').read_text(),'html.parser')
  for oldsel,newsel in [('h1','h1'),('.story-deck','.deck'),('.story-opening p','.opening-copy p'),('.chapter-body h2','.chapter-text h2'),('.chapter-body p','.chapter-text p'),('.story-sources','.story-sources')]:
   old=[normalized(e) for e in original.select(oldsel)];new=[normalized(e) for e in preview.select(newsel)]
   assert old==new,(variant,slug,oldsel,'manuscript changed')
  assert len(preview.select('.chapter'))>=3
  assert not preview.select('script'),'Article requires JavaScript'
  manuscripts.append({'variant':variant,'story':slug,'sections':len(preview.select('.chapter')),'paragraphs':len(preview.select('.chapter-text p')),'all_manuscript_text_equal':True})

# Check Git content hashes for EVERY file at the start commit, not a selected list.
entries=[line.split('\t',1) for line in git('ls-tree','-r',START).decode().splitlines()]
paths=[name for _,name in entries]
actual=git('hash-object','--stdin-paths',input=('\n'.join(paths)+'\n').encode()).decode().splitlines()
changed=[name for (meta,name),digest in zip(entries,actual) if meta.split()[2]!=digest]
assert not changed,changed
assert len(actual)==len(paths)
assert git('merge-base','--is-ancestor',START,'HEAD')==b''
# 016 is never an ancestor of this preview branch.
contains016=subprocess.run(['git','merge-base','--is-ancestor','origin/creative/tohesar-visual-refinement-016','HEAD'],cwd=ROOT).returncode==0
assert not contains016
preservation={'baseline_commit':START,'verified_existing_files':len(paths),'existing_file_content_changes':changed,'all_existing_files_byte_identical':True,'contains_016_commits':False,'new_source_prefix':PREFIX,'manuscripts':manuscripts,'protected_examples':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in ['index.html','CNAME','.vercelignore','creative/cover-art-max-004/index.html','journal/index.html','journal/911/index.html','journal/f40/index.html','edition/index.html','edition/news/index.html','edition/data/news.json','journal/data/content-index.json','scripts/refresh_news.py','.github/workflows/tohesar-pages-news.yml']}}
(HERE/'review/preservation.json').write_text(json.dumps(preservation,ensure_ascii=False,indent=2)+'\n')

records=[]
with sync_playwright() as pw:
 browser=pw.webkit.launch()
 for width,height in [(390,844),(375,844),(430,932),(1194,834)]:
  for variant in ['a','b']:
   for slug in ['911','f40']:
    context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,is_mobile=width<700,has_touch=True)
    page=context.new_page();errors=[];failed=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r: failed.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
    path=f'{PREFIX}{variant}/{slug}/';t=time.monotonic();page.goto(BASE+path,wait_until='networkidle');page.evaluate('document.fonts.ready')
    page.wait_for_timeout(80)
    initial_height=page.evaluate('document.body.scrollHeight')
    opening=OUT/f'{variant}-{slug}-{width}-opening.png'
    page.screenshot(path=str(opening))
    # Native document scroll; load all lazy photos, then record the entire article.
    for y in range(0,initial_height,620):
     page.evaluate('(y)=>scrollTo({top:y,behavior:"instant"})',y);page.wait_for_timeout(60)
    page.wait_for_function('Array.from(document.images).every(i=>i.complete && i.naturalWidth>0)')
    images=page.evaluate('Array.from(document.images).map(i=>({src:new URL(i.currentSrc).pathname,width:i.naturalWidth,complete:i.complete}))')
    layout=page.evaluate('''() => {
      const text=[...document.querySelectorAll('.chapter-text p')];
      return {viewport:innerWidth,document:document.documentElement.scrollWidth,height:document.body.scrollHeight,
       bodyFont:getComputedStyle(text[0]).fontFamily,bodySize:getComputedStyle(text[0]).fontSize,lineHeight:getComputedStyle(text[0]).lineHeight,
       readingWidth:text[0].getBoundingClientRect().width,animations:document.getAnimations().length,
       objectCount:document.querySelectorAll('.miniature').length};
    }''')
    assert layout['document']==width,(path,width,'horizontal overflow',layout)
    assert int(float(layout['bodySize'].replace('px','')))>=16
    assert layout['animations']==0
    # Decorative objects may overlap the print, but never manuscript/heading lanes.
    collisions=page.evaluate('''() => {
      let bad=[];
      for(const car of document.querySelectorAll('.miniature')){
       const a=car.querySelector('img').getBoundingClientRect();
       for(const node of document.querySelectorAll('h1,.deck,.opening-copy p,.chapter-text h2,.chapter-text p,.quiet-spread p,.editorial-pause>p')){
        const b=node.getBoundingClientRect();
        if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2)bad.push(node.textContent.slice(0,40));
       }
      }return bad;
    }''')
    assert not collisions,(path,width,'objects overlap text',collisions)
    if width==390:
     page.screenshot(path=str(OUT/f'{variant}-{slug}-390-full.png'),full_page=True)
     for label,selector in [('reading','.chapter-1'),('objects','.quiet-spread' if variant=='b' else '.editorial-pause'),('next','.next-story')]:
      page.locator(selector).scroll_into_view_if_needed();page.wait_for_timeout(60)
      page.screenshot(path=str(OUT/f'{variant}-{slug}-390-{label}.png'))
    else:
     page.locator('.chapter-2').scroll_into_view_if_needed();page.wait_for_timeout(50)
     page.screenshot(path=str(OUT/f'{variant}-{slug}-{width}-reading.png'))
     if variant=='b':
      page.locator('.quiet-spread').scroll_into_view_if_needed();page.screenshot(path=str(OUT/f'{variant}-{slug}-{width}-objects.png'))
    # Confirm object document positions stay constant as the page moves.
    page.evaluate('scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(30)
    pos0=page.locator('.miniature').first.evaluate('e=>e.getBoundingClientRect().top+scrollY')
    page.evaluate('scrollTo({top:400,behavior:"instant"})');page.wait_for_timeout(30)
    pos1=page.locator('.miniature').first.evaluate('e=>e.getBoundingClientRect().top+scrollY')
    assert abs(pos1-pos0)<1,(path,'unexpected drifting object')
    perf=None
    if width==390:
     perf=page.evaluate('''async () => {
      const samples=[];let prev;const max=document.documentElement.scrollHeight-innerHeight;
      for(let i=0;i<72;i++){
       const t=await new Promise(requestAnimationFrame);if(prev)samples.push(t-prev);prev=t;
       scrollTo({top:max*i/71,behavior:'instant'});
      }
      const sorted=samples.slice().sort((a,b)=>a-b);
      return {frames:samples.length,medianMs:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:Math.max(...samples),note:'Local headless WebKit RAF sweep; not physical iPhone performance'};
     }''')
     # Follow the actual next-story route and A/B controls, with JS disabled below too.
     other='f40' if slug=='911' else '911'
     page.locator('.next-story>a').click();page.wait_for_url('**/'+other+'/')
     assert page.title().startswith(variant.upper())
     page.locator(f'.lab-bar a[href="{PREFIX}{"b" if variant=="a" else "a"}/{other}/"]').click()
     page.wait_for_url('**/'+other+'/')
     assert page.title().startswith('B' if variant=='a' else 'A')
    assert not errors and not failed,(path,width,errors,failed)
    records.append({'path':path,'viewport':[width,height],'engine':'WebKit','dpr':1,'load_and_scroll_seconds':round(time.monotonic()-t,2),'layout':layout,'images':images,'broken_requests':failed,'script_errors':errors,'text_object_collisions':collisions,'object_document_position_delta':round(pos1-pos0,3),'scroll_raf':perf})
    print('PASS',variant,slug,width,'images',len(images),flush=True)
    context.close()
 # No-JavaScript + reduced-motion articles still include the manuscript and links.
 c=browser.new_context(viewport={'width':390,'height':844},java_script_enabled=False,reduced_motion='reduce')
 for variant in ['a','b']:
  for slug in ['911','f40']:
   p=c.new_page();p.goto(f'{BASE}{PREFIX}{variant}/{slug}/',wait_until='networkidle');assert p.locator('.chapter').count()>=3;assert p.locator('.next-story>a').get_attribute('href');p.close()
 c.close();browser.close()

# Make native-size comparisons from browser captures (no synthetic mockup UI).
font_path='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
font=ImageFont.truetype(font_path,17,index=1)
large=ImageFont.truetype(font_path,24,index=1)
for slug in ['911','f40']:
 canvas=Image.new('RGB',(840,956),'#eee8e4');draw=ImageDraw.Draw(canvas)
 draw.text((22,15),f'TOHEŞAR / 017     {slug.upper()}',font=large,fill='#352d36')
 draw.text((22,56),'A — Photographic Editorial',font=font,fill='#725f70')
 draw.text((428,56),'B — Miniature Atmosphere',font=font,fill='#725f70')
 for i,v in enumerate(['a','b']):
  canvas.paste(Image.open(OUT/f'{v}-{slug}-390-opening.png'),(22+i*406,88))
 draw.text((22,935),'390 × 844 · WebKit · independent preview',font=ImageFont.truetype(font_path,11,index=1),fill='#725f70')
 canvas.save(HERE/f'review/iphone-{slug}-comparison.png',optimize=True)

# Crawl each preview's local href/src and CSS URL including final captures.
local=[]
for html in [HERE/'index.html',*[HERE/v/s/'index.html' for v in ['a','b'] for s in ['911','f40']]]:
 soup=BeautifulSoup(html.read_text(),'html.parser');base_path=PREFIX+str(html.relative_to(HERE).parent)+'/'
 for e in soup.select('[href],[src]'):
  val=e.get('href') or e.get('src')
  target=urlparse(urljoin(BASE+base_path,val))
  if target.netloc!=urlparse(BASE).netloc:continue
  if target.fragment and target.path in [base_path,base_path+'index.html']:
   assert soup.find(id=target.fragment),('broken anchor',html,val)
  if target.path.endswith(('/verification.json','/preservation.json')):continue
  local.append(target.path)
for path in sorted(set(local)):
 with urlopen(BASE+path) as response:assert response.status==200,path

report={'baseline_commit':START,'browser':'Playwright WebKit 26.5 / Linux','physical_device':False,'manuscripts':manuscripts,'responsive_checks':len(records),'no_js_and_reduced_motion_routes':4,'local_link_and_image_urls':len(set(local)),'records':records,'visual_approval':'Pending founder review; technical checks are not design approval.'}
(HERE/'review/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS: all manuscripts, all existing source files, 16 responsive routes, no-JS, links, images, object placement, scroll samples')
