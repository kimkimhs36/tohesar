"""BUILD 014 visual receipts and focused regression; no application mutation.

Run with Python Playwright, Chromium at /usr/bin/chromium and optional
WEBKIT_EXECUTABLE_PATH. BASE_URL defaults to the local static preview.
Screenshots are actual browser renders; they do not certify physical iOS Safari.
"""
import json
import os
import subprocess
from io import BytesIO
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('BASE_URL', 'http://localhost:8000').rstrip('/')
OUT = ROOT / 'art-direction/014/after'
VALIDATION = ROOT / 'art-direction/014/validation'
SIZES = [(390, 844), (430, 932), (820, 1180), (1180, 820), (1440, 900)]
ROUTES = ['/journal/', '/journal/issues/001/', '/journal/911/', '/journal/f40/',
          '/journal/design/giulia/', '/journal/design/type-01/', '/journal/miniatures/',
          '/journal/news/', '/journal/design/', '/journal/visual/',
          '/journal/yokohama/original-001/', '/']


def ready(page):
    page.evaluate("""async()=>{
      document.documentElement.style.scrollBehavior='auto';
      for(const i of document.images)i.loading='eager';
      await document.fonts.ready;
      await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));
    }""")
    page.wait_for_timeout(180)


def goto(page, route):
    response = page.goto(BASE + route)
    assert response.status == 200, route
    ready(page)


def position(page, selector, offset=0):
    page.locator(selector).first.evaluate('(e,o)=>scrollTo(0,e.getBoundingClientRect().top+scrollY+o)', offset)
    page.wait_for_timeout(120)


def scroll(page, y):
    page.evaluate('(y)=>scrollTo(0,y)', round(y))
    page.wait_for_timeout(120)


def capture(page, filename):
    data = page.screenshot()
    Image.open(BytesIO(data)).save(OUT / (filename + '.webp'), quality=91)
    if filename.startswith('webkit-390-') or filename in ['390-yokohama-opening', '390-yokohama-wallpaper']:
        (OUT / (filename + '.png')).write_bytes(data)


def geometry(page):
    value = page.evaluate("""()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      overflow:document.documentElement.scrollWidth>innerWidth,
      broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src'))})""")
    assert not value['overflow'], (page.url, value)
    assert not value['broken'], (page.url, value)
    return value


def poses(page):
    return page.locator('[data-wallpaper-car]').evaluate_all('(els)=>els.map(e=>e.style.transform)')


def run():
    OUT.mkdir(parents=True, exist_ok=True)
    VALIDATION.mkdir(parents=True, exist_ok=True)
    source = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    receipts = {'base': BASE, 'source_commit': source, 'physical_device_tested': False,
                'scope': 'Chromium and Playwright WebKit emulation; physical Safari untested', 'browsers': []}
    with sync_playwright() as pw:
        for engine in ['chromium', 'webkit']:
            opts = {'headless': True}
            if engine == 'chromium':
                opts.update(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
            elif os.environ.get('WEBKIT_EXECUTABLE_PATH'):
                opts['executable_path'] = os.environ['WEBKIT_EXECUTABLE_PATH']
            browser = getattr(pw, engine).launch(**opts)
            record = {'engine': engine, 'version': browser.version, 'viewports': [], 'routes': []}
            for w, h in SIZES:
                page = browser.new_page(viewport={'width': w, 'height': h},
                                        device_scale_factor=1, is_mobile=w < 1000, has_touch=w < 1000)
                errors = []
                page.on('pageerror', lambda e: errors.append(str(e)))
                prefix = '' if engine == 'chromium' else 'webkit-'
                goto(page, '/journal/yokohama/')
                capture(page, f'{prefix}{w}-yokohama-opening')
                scene = page.locator('#wallpaper-yokohama-city').first
                box = scene.bounding_box()
                top, height = box['y'], box['height']
                positions = [top - 80, top + height * .22, top + height * .44]
                snapshots = []
                for y in positions:
                    scroll(page, y)
                    snapshots.append(poses(page))
                scroll(page, positions[1])
                reverse = poses(page)
                assert snapshots[1] == reverse, 'Reverse scroll restores identical pose'
                assert snapshots[0] != snapshots[2], 'Native scroll moves wallpaper'
                for selector, label, offset in [('.city-blue-photo', 'blue', -40),
                        ('.city-small', 'photo-to-paper', -h*.5),
                        ('.city-manuscript', 'wallpaper', -80),
                        ('.city-cover', 'photo', -40),
                        ('.city-panorama', 'afterglow', -40)]:
                    position(page, selector, offset)
                    capture(page, f'{prefix}{w}-yokohama-{label}')
                state = geometry(page)
                page.emulate_media(reduced_motion='reduce')
                scroll(page, positions[1])
                page.wait_for_function("[...document.querySelectorAll('[data-wallpaper-car]')].every(e=>!e.style.transform)")
                if w == 390:
                    capture(page, f'{prefix}{w}-yokohama-reduced-motion')
                assert not errors, errors
                record['viewports'].append({'size': [w, h], **state,
                                            'reverse_scroll': True, 'reduced_motion': True, 'js_errors': errors})
                for route, label in [('/journal/', 'journal'), ('/journal/issues/001/', 'issue')]:
                    goto(page, route)
                    capture(page, f'{prefix}{w}-{label}-opening')
                    geometry(page)
                    if label == 'issue' and w in [390, 1440]:
                        for chapter in ['curve', 'edge', 'proportion', 'language', 'small']:
                            position(page, '.chapter-' + chapter)
                            capture(page, f'{prefix}{w}-issue-{chapter}')
                page.close()
            page = browser.new_page(viewport={'width':390, 'height':844}, is_mobile=True, has_touch=True)
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            for route in ROUTES:
                goto(page, route)
                record['routes'].append({'route':route, **geometry(page)})
                label = {'/journal/911/':'911', '/journal/f40/':'f40', '/journal/design/giulia/':'giulia',
                         '/journal/design/type-01/':'type01', '/journal/miniatures/':'miniatures'}.get(route)
                if label:
                    capture(page, f'{prefix}390-{label}-opening')
            goto(page, '/journal/')
            page.locator('.journal-index summary').click()
            assert page.locator('.journal-index').get_attribute('open') is not None
            page.locator('.journal-index summary').click()
            page.locator('.city-invite-link').click()
            page.wait_for_url('**/journal/yokohama/')
            page.locator('.city-inline-link').click()
            page.wait_for_url('**/journal/911/')
            page.go_back()
            page.wait_for_url('**/journal/yokohama/')
            record['journal_menu_and_city_to_911_back'] = True
            goto(page, '/journal/design/?q=Yokohama')
            assert page.locator('#design-query').input_value() == 'Yokohama'
            page.locator('#design-query').fill('Type 01')
            page.locator('.atlas-search button').click()
            assert page.locator('[data-content-id="jaguar-type-01"]').is_visible()
            record['search_query_and_results'] = True
            goto(page, '/journal/news/')
            page.locator('[data-filter="culture"]').click()
            assert page.locator('.news-item:visible').count() > 0
            record['news_filter'] = True
            goto(page, '/journal/visual/')
            page.locator('[data-enlarge]').first.click()
            assert page.locator('dialog').evaluate('(e)=>e.open')
            page.keyboard.press('Escape')
            assert not page.locator('dialog').evaluate('(e)=>e.open')
            record['visual_lightbox'] = True
            assert not errors, errors
            page.close()
            static = browser.new_page(viewport={'width':390,'height':844}, java_script_enabled=False)
            goto(static, '/journal/yokohama/')
            assert static.locator('[data-wallpaper-car]').count() >= 14
            position(static, '.city-manuscript', -80)
            capture(static, f'{prefix}390-yokohama-no-js')
            record['no_js'] = geometry(static)
            static.close()
            browser.close()
            receipts['browsers'].append(record)
            (VALIDATION/'browser-checks.json').write_text(json.dumps(receipts,ensure_ascii=False,indent=2)+'\n')
    print('PASS: both engines, all five sizes, static/reduced-motion wallpaper, reverse scroll, routes, search, index, news, lightbox.')

if __name__ == '__main__':
    run()
