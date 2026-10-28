from playwright.sync_api import sync_playwright
import json,os
from pathlib import Path
out=str(Path(__file__).resolve().parents[1]/'docs/verification');os.makedirs(out,exist_ok=True)
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);ctx=b.new_context(reduced_motion='reduce');page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for w in [320,375,390,430,768,1024,1440]:
  page.set_viewport_size({'width':w,'height':844 if w<768 else 1000})
  for path in ['','news/','archive/','story/f40/','story/mission-s/','story/911/']:
   page.goto('http://127.0.0.1:8000/edition/'+path);page.evaluate('document.fonts.ready');page.wait_for_timeout(80)
   for im in page.locator('img').all():im.scroll_into_view_if_needed()
   page.wait_for_timeout(100)
   checks=page.evaluate('''() => ({overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),font:document.fonts.status})''')
   assert not checks['overflow'],(w,path,checks)
   assert not checks['images'],(w,path,checks)
   if w<768 and page.locator('.f40-article-image img').count():
    assert page.locator('.f40-article-image img').evaluate('(i)=>Math.abs(i.getBoundingClientRect().height/i.getBoundingClientRect().width-i.naturalHeight/i.naturalWidth)<0.02'),(w,path,'distorted image box')
   if w in [390,1440] and path in ['','news/','story/911/']:
    page.screenshot(path=out+'/'+('home' if not path else path.replace('/','-'))+str(w)+'.png',full_page=True)
   results.append({'width':w,'page':path or 'home',**checks})
 page.set_viewport_size({'width':390,'height':844});page.goto('http://127.0.0.1:8000/edition/')
 page.get_by_role('button',name='메뉴 열기').click();assert page.locator('#mobile-menu').is_visible();page.keyboard.press('Escape');assert not page.locator('#mobile-menu').is_visible()
 page.get_by_role('button',name='검색 열기').click();page.locator('#search-field').fill('911');assert page.locator('#search-results a').count()==1;page.keyboard.press('Escape')
 page.get_by_role('button',name='검색 열기').focus();page.keyboard.press('Enter');page.keyboard.press('ControlOrMeta+A');page.keyboard.type('F40');assert page.locator('#search-results a').count()==1;page.keyboard.press('Escape');assert not page.locator('#search-dialog').is_visible();assert page.get_by_role('button',name='검색 열기').evaluate('(el)=>el===document.activeElement')
 page.goto('http://127.0.0.1:8000/edition/story/f40/');page.locator('[data-save]').click();page.reload();assert page.locator('[data-save]').get_attribute('aria-pressed')=='true';assert page.locator('.article-toc a').count()==2
 page.locator('[data-saved-open]').click();assert page.locator('#saved-items a').count()==1;page.locator('#saved-items button').click();assert page.locator('#saved-items a').count()==0;page.keyboard.press('Escape');assert page.locator('[data-save]').get_attribute('aria-pressed')=='false'
 page.locator('.article-toc a').last.click();assert page.evaluate('scrollY')>0;assert page.locator('#reading-progress').get_attribute('style')
 page.route('**/data/news.json',lambda r:r.fulfill(status=503,body='down'));page.goto('http://127.0.0.1:8000/edition/news/');page.wait_for_timeout(200);assert '연결되지 않음' in page.locator('#wire-state').inner_text();page.unroute('**/data/news.json')
 page.route('**/data/news.json',lambda r:r.fulfill(json={'status':'live','generated_at':'2020-01-01T00:00:00Z','items':[{'title':'Old source headline','source':'Porsche','url':'https://newsroom.porsche.com/old','published_at':'2020-01-01T00:00:00Z'}]}));page.reload();page.wait_for_timeout(200);assert '오래된' in page.locator('#wire-state').inner_text()
 assert not errors,errors
 json.dump({'browser':b.version,'checks':results,'interaction_tests':['menu/escape','search','save/reload/remove','toc/progress','HTTP503 fallback','stale snapshot'],'pageerrors':errors},open(out+'/browser-results.json','w'),ensure_ascii=False,indent=2);b.close()
print('PASS 42 responsive page checks and interaction/fallback checks')
