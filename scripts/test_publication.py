from playwright.sync_api import sync_playwright
from pathlib import Path
import os
BASE=os.environ.get('PUBLICATION_BASE_URL','http://localhost:8765/publication').rstrip('/')
OUTPUT=Path(__file__).resolve().parents[1]/'docs/astra-production-001'
OUTPUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(390,844),(1440,1000),(1024,768),(320,700)]:
  page=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  for route in ['index','journal','small-obsessions','gallery','light','form','credits','legacy']:
   page.goto(BASE+'/'+route+'.html');page.locator('img[loading]').evaluate_all('(imgs)=>imgs.forEach(i=>i.loading="eager")');page.wait_for_timeout(500)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(route,width,'overflow')
   assert page.locator('img[src]').evaluate_all('(images)=>images.every(i=>i.complete && i.naturalWidth>0)'),(route,'broken image')
   if width in [390,1440] and route in ['index','small-obsessions','gallery']:page.screenshot(path=str(OUTPUT/f'{route}-{width}.png'),full_page=True)
  page.close()
 print('PASS 32 route/viewport combinations: no overflow or broken images')
 page=b.new_page(viewport={'width':390,'height':844});page.goto(BASE+'/small-obsessions.html')
 page.locator('[data-save]').click();assert page.locator('[data-save]').get_attribute('aria-pressed')=='true';page.reload();assert page.locator('[data-save]').get_attribute('aria-pressed')=='true'
 page.locator('[data-search]').click();page.locator('#query').fill('Ferrari');assert page.locator('#results a').count()==1;page.keyboard.press('Escape');assert not page.locator('#search').is_visible()
 page.locator('[data-saved]').click();assert page.locator('#results a').count()==1;page.keyboard.press('Escape')
 page.goto(BASE+'/gallery.html');page.locator('[data-enlarge]').first.click();assert page.locator('#lightbox').is_visible();page.keyboard.press('Escape')
 print('PASS save persistence, search, saved list, photo enlargement, Escape dismissal')
 b.close()
