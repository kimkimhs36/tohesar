"""Chromium navigation audit at five widths. Requires a repository HTTP server on port8000.
Usage: python3 scripts/verify_navigation_025.py /tmp/tohesar-025-navigation
This does not execute Safari. Home menu begins after the authored cover.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,sys
out=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/tohesar-025-navigation');out.mkdir(parents=True,exist_ok=True)
results=[]
pages=[('home','/'),('journal','/journal/'),('design','/journal/design/'),('news','/edition/'),('f40','/journal/f40/'),('giulia','/journal/design/giulia/'),('sitemap','/sitemap/'),('explore','/journal/explore/')]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in (375,390,430,768,1440):
  for name,url in pages:
   page=b.new_page(viewport={'width':width,'height':844},device_scale_factor=1,is_mobile=width<500,has_touch=width<500)
   errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
   try:
    resp=page.goto('http://127.0.0.1:8000'+url,wait_until='domcontentloaded');page.wait_for_timeout(700)
    page.evaluate('window.scrollTo(0, document.querySelector("#journal-index").getBoundingClientRect().top+scrollY+200)') if name=='home' else page.evaluate('window.scrollTo(0, Math.min(document.body.scrollHeight/2, 1400))');page.wait_for_timeout(400)
    d=page.locator('.journal-index').first
    if not d.count(): raise Exception('missing menu')
    summary=d.locator('summary');summary.click(timeout=5000);assert d.evaluate('(e)=>e.open'), 'menu failed to open'
    page.screenshot(path=str(out/f'after-{name}-{width}-menu.png')) if width==390 else None
    page.keyboard.press('Escape');assert not d.evaluate('(e)=>e.open'), 'Escape failed'
    summary.click();assert d.evaluate('(e)=>e.open'); page.mouse.click(5,840);assert not d.evaluate('(e)=>e.open'), 'outside click failed'
    assert page.locator('.site-header').first.evaluate('(e)=>e.getBoundingClientRect().top>=-1 && e.getBoundingClientRect().top<1'), 'header not sticky'
    dims=page.evaluate('({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete && i.currentSrc && !i.naturalWidth).map(i=>i.currentSrc)})')
    if width==390:
     page.evaluate('scrollTo(0,0)');page.screenshot(path=str(out/f'after-{name}-{width}.png'),full_page=True)
    results.append({'page':name,'width':width,'status':resp.status,'dimensions':dims,'errors':errors})
   except Exception as e:results.append({'page':name,'width':width,'failure':str(e),'errors':errors})
   page.close()
 b.close()
(out/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(results,ensure_ascii=False))
failures = [r for r in results if 'failure' in r or r.get('status') != 200 or r.get('errors') or r.get('dimensions', {}).get('broken') or r.get('dimensions', {}).get('scroll', 0) > r.get('dimensions', {}).get('width', 0)]
if failures:
 raise SystemExit(f'{len(failures)} navigation checks failed; see {out / "results.json"}')
