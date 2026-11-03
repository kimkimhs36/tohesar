"""Chromium responsive visual audit. Start the repository HTTP server on port 8000.
Usage: python3 scripts/verify_art_direction_025.py /tmp/tohesar-025-audit
Requires installed Python Playwright and /usr/bin/chromium. This is not Safari.
Hidden lazy decorations are recorded separately from visible image failures.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys
out=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/tohesar-025-audit');out.mkdir(parents=True,exist_ok=True)
routes={'home':'/','journal':'/journal/','explore':'/journal/explore/','design':'/journal/design/','newsroom':'/edition/','f40':'/journal/f40/','giulia':'/journal/design/giulia/','jaguar':'/journal/design/type-01/','miniatures':'/journal/miniatures/','issue':'/journal/issues/001/','cover':'/creative/cover-art-max-004/'}
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for name,route in routes.items():
  for width in [375,390,430,768,1440]:
   page=b.new_page(viewport={'width':width,'height':844 if width<768 else 1000},reduced_motion='reduce',is_mobile=width<768,has_touch=width<768)
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   response=page.goto('http://127.0.0.1:8000'+route,wait_until='networkidle');page.evaluate('document.fonts.ready')
   height=page.evaluate('document.documentElement.scrollHeight')
   for sweep in range(2):
    for y in range(0,page.evaluate('document.documentElement.scrollHeight'),600):
     page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_timeout(70)
   page.wait_for_load_state('networkidle');height=page.evaluate('document.documentElement.scrollHeight')
   page.wait_for_timeout(180)
   metrics=page.evaluate('''() => ({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.getBoundingClientRect().width>0&&i.getBoundingClientRect().height>0&&!i.naturalWidth).map(i=>i.currentSrc||i.src),pending_with_dimensions:[...document.images].filter(i=>!i.complete&&i.naturalWidth>0).length,hidden_unrequested:[...document.images].filter(i=>i.getBoundingClientRect().width===0&& !i.complete).length,height:document.documentElement.scrollHeight})''')
   for position,y in [('top',0),('middle',height//2),('footer',height)]:
    page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_timeout(30);page.screenshot(path=str(out/f'{name}-{width}-{position}.png'))
   page.evaluate('scrollTo(0,0)');menu=page.locator('details.journal-index summary').first
   menu_checked=False;menu_overflow=False
   if menu.count() and menu.is_visible():
    menu.click();page.wait_for_timeout(60);page.screenshot(path=str(out/f'{name}-{width}-menu.png'));menu_checked=True;menu_overflow=page.locator('details.journal-index nav').first.evaluate('(n)=>n.getBoundingClientRect().right>innerWidth||n.getBoundingClientRect().left<0');page.keyboard.press('Escape');assert not menu.locator('..').evaluate('(e)=>e.open'), 'Escape failed';menu.click();assert menu.locator('..').evaluate('(e)=>e.open'), 'menu did not reopen';page.mouse.click(5,800);assert not menu.locator('..').evaluate('(e)=>e.open'), 'outside click failed';page.evaluate('scrollBy(0,document.querySelector(".site-header").getBoundingClientRect().top+100)');assert page.locator('.site-header').first.evaluate('(e)=>Math.abs(e.getBoundingClientRect().top)<1'), 'header not sticky'
   results.append(dict(name=name,width=width,status=response.status,**metrics,errors=errors,menu_checked=menu_checked,menu_overflow=menu_overflow))
   page.close()
 b.close()
(out/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps({'checks':len(results),'failures':[r for r in results if r['status']!=200 or r['overflow'] or r['broken'] or r['errors'] or r['menu_overflow']]},ensure_ascii=False));sys.exit(int(any(r['status']!=200 or r['overflow'] or r['broken'] or r['errors'] or r['menu_overflow'] for r in results)))
