"""Actual browser captures and focused editorial checks; development only.

Requires Python Playwright. Set WEBKIT_EXECUTABLE_PATH where the local engine
needs a system-library launcher. BASE_URL may point to the isolated review.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / os.environ.get('REVIEW_DIR', 'docs/editorial-013-review')
BASE = os.environ.get('BASE_URL', 'http://localhost:8000').rstrip('/')
SIZES = [(390, 844), (430, 932), (820, 1180), (1180, 820), (1440, 900)]


def ready(page):
    page.evaluate("""async () => {
      document.documentElement.style.scrollBehavior = 'auto';
      await document.fonts.ready;
      for (const image of document.images) image.loading = 'eager';
      await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    }""")


def goto(page, route):
    response = page.goto(BASE + route)
    assert response.status == 200, route
    ready(page)


def scroll(page, y):
    page.evaluate('(y) => scrollTo(0, y)', round(y))
    page.wait_for_timeout(80)


def capture(page, filename):
    page.screenshot(path=str(OUT / filename))


def geometry(page):
    state = page.evaluate("""() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      broken: [...document.images].filter(i => !i.naturalWidth).map(i => i.src)
    })""")
    assert not state['overflow'], page.url
    assert not state['broken'], state
    return state


def run():
    OUT.mkdir(parents=True, exist_ok=True)
    receipts = {'base': BASE, 'hardware_tested': False, 'browsers': []}
    with sync_playwright() as pw:
        for engine in ['chromium', 'webkit']:
            options = {'headless': True}
            if engine == 'chromium':
                options.update(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
            elif os.environ.get('WEBKIT_EXECUTABLE_PATH'):
                options['executable_path'] = os.environ['WEBKIT_EXECUTABLE_PATH']
            browser = getattr(pw, engine).launch(**options)
            record = {'engine': engine, 'version': browser.version, 'viewports': [], 'routes': []}
            for w, h in SIZES:
                page = browser.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1,
                                        is_mobile=w < 1000, has_touch=w < 1000)
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                goto(page, '/journal/yokohama/')
                capture(page, f'{engine}-{w}-opening.png')
                scene = page.locator('[data-wallpaper]').first
                box = scene.bounding_box()
                top, height = box['y'], box['height']
                positions = [top - 80, top + height * .22, top + height * .44]
                poses = []
                for name, y in zip(['start', 'middle', 'end'], positions):
                    scroll(page, y)
                    poses.append(page.locator('[data-wallpaper-car]').evaluate_all('(els)=>els.map(e=>e.style.transform)'))
                    capture(page, f'{engine}-{w}-wallpaper-{name}.png')
                scroll(page, positions[1])
                reverse = page.locator('[data-wallpaper-car]').evaluate_all('(els)=>els.map(e=>e.style.transform)')
                assert poses[1] == reverse, 'Reverse scroll must restore the same pose'
                assert poses[0] != poses[2], 'Wallpaper must respond to native scroll'
                scroll(page, top - h * .50)
                capture(page, f'{engine}-{w}-photo-to-paper.png')
                scroll(page, top + height - h * .66)
                capture(page, f'{engine}-{w}-paper-to-photo.png')
                if w in [390, 1180]:
                    for label, selector in [('photographic-layout', '.city-arrival-photo'), ('blue-hour', '.city-blue-photo'), ('afterglow', '.city-panorama')]:
                        y = page.locator(selector).evaluate('(el)=>el.getBoundingClientRect().top+scrollY')
                        scroll(page, y - 40)
                        capture(page, f'{engine}-{w}-{label}.png')
                page.emulate_media(reduced_motion='reduce')
                scroll(page, positions[1])
                page.wait_for_function("matchMedia('(prefers-reduced-motion: reduce)').matches && [...document.querySelectorAll('[data-wallpaper-car]')].every(e=>!e.style.transform)")
                capture(page, f'{engine}-{w}-reduced.png')
                state = geometry(page)
                assert not errors, errors
                record['viewports'].append({'size': [w, h], **state, 'reverse_scroll': True, 'reduced_motion': True, 'errors': errors})
                page.close()
            page = browser.new_page(viewport={'width': 390, 'height': 844})
            for route in ['/', '/journal/', '/journal/911/', '/journal/f40/', '/journal/design/giulia/',
                          '/journal/design/type-01/', '/journal/issues/001/', '/journal/visual/',
                          '/journal/miniatures/', '/journal/news/', '/journal/design/', '/journal/yokohama/original-001/']:
                goto(page, route)
                record['routes'].append({'route': route, **geometry(page)})
            goto(page, '/journal/')
            page.locator('.city-invitation').scroll_into_view_if_needed()
            capture(page, f'{engine}-390-journal-discovery.png')
            page.locator('.city-invite-link').click()
            page.wait_for_url('**/journal/yokohama/')
            page.locator('.city-inline-link').click()
            page.wait_for_url('**/journal/911/')
            page.go_back()
            page.wait_for_url('**/journal/yokohama/')
            record['journal_to_city_to_911_and_back'] = True
            goto(page, '/journal/visual/')
            page.locator('[data-enlarge]').first.click()
            assert page.locator('dialog').evaluate('(el)=>el.open')
            page.keyboard.press('Escape')
            assert not page.locator('dialog').evaluate('(el)=>el.open')
            goto(page, '/journal/news/')
            page.locator('[data-filter="culture"]').click()
            assert page.locator('.news-item:visible').count() > 0
            goto(page, '/journal/design/?q=Yokohama')
            assert page.locator('#design-query').input_value() == 'Yokohama'
            page.close()
            static = browser.new_page(viewport={'width': 390, 'height': 844}, java_script_enabled=False)
            goto(static, '/journal/yokohama/')
            assert static.locator('[data-wallpaper-car]').count() == 14
            static.locator('.city-manuscript').scroll_into_view_if_needed()
            capture(static, f'{engine}-390-no-js.png')
            record['no_js'] = geometry(static)
            static.close()
            browser.close()
            receipts['browsers'].append(record)
    (OUT / 'checks.json').write_text(json.dumps(receipts, ensure_ascii=False, indent=2) + '\n')
    print('PASS: actual Chromium and WebKit layouts, native scroll/reverse, reduced motion, no-JS, routes and history.')


if __name__ == '__main__':
    run()
