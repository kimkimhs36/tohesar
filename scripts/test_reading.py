"""Browser regression for the reader journey. Requires Playwright and Chromium."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import shutil

from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}/edition/'
try:
    with sync_playwright() as p:
        executable = shutil.which('chromium')
        browser = p.chromium.launch(**({'executable_path': executable} if executable else {}))
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(base + 'story/mission-s/')
        page.get_by_role('button', name='검색 열기').click()
        page.locator('#search-field').fill('F40')
        page.locator('#search-results a').first.click()
        assert '/story/f40/' in page.url
        page.go_back()
        assert '/story/mission-s/' in page.url
        page.locator('[data-save]').click()
        page.reload()
        assert page.locator('[data-save]').get_attribute('aria-pressed') == 'true'
        page.locator('[data-share]').click()
        page.wait_for_function("document.querySelector('.share-status').textContent.length > 0")
        page.locator('[data-saved-open]').click()
        assert page.locator('#saved-items a').count() == 1
        page.locator('#saved-items button').click()
        assert page.locator('#saved-items a').count() == 0
        page.keyboard.press('Escape')
        page.goto(base + 'archive/')
        page.locator('#archive-query').fill('F40')
        assert page.locator('[data-archive-item]:visible').count() >= 1
        page.locator('#archive-query').fill('unlikelynoresults')
        assert page.locator('#archive-empty').is_visible()
        page.locator('#archive-reset').click()
        assert not page.locator('#archive-empty').is_visible()
        page.goto(base + 'news/')
        page.wait_for_function('document.querySelectorAll("#wire-list .wire-card").length > 0')
        page.locator('#wire-publisher').select_option('autoblog')
        assert page.locator('#wire-list .wire-card').count() > 0
        assert all('Autoblog' in label for label in page.locator('#wire-list .wire-card small').all_inner_texts())
        page.locator('#wire-publisher').select_option('all')
        page.locator('#wire-query').fill('Porsche')
        assert page.locator('#wire-list .wire-card').count() > 0
        page.locator('#wire-topic').select_option('design')
        assert page.locator('#wire-count').inner_text()
        page.locator('#wire-query').fill('unlikelynoresults')
        assert '조건에 맞는' in page.locator('#wire-list').inner_text()
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()
print('PASS: reader search, back, saved, share, archive and news filtering')
