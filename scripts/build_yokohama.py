"""013 Yokohama: preserve the original, compose a source-built visual essay."""
from pathlib import Path
from build_wallpaper import scene
import json
import re

ROOT = Path(__file__).resolve().parents[1]

def build():
    template = (ROOT / 'journal/partials/yokohama013.html').read_text()
    body = (ROOT / 'journal/partials/yokohama013-wallpaper.html').read_text()
    # Anchor four intact silhouettes to the manuscript's own line breaks. This
    # keeps the printed composition intentional across Korean font/viewport sizes.
    registry = json.loads((ROOT / 'journal/data/wallpaper-artworks.json').read_text())
    art = {a['id']: a for a in registry['artworks']}
    choices = [('lilac-arc', 18, -8), ('blue-hour', 82, 7),
               ('butter-club', 20, -6), ('rose-current', 81, 8)]
    start = body.index('<div class="city-manuscript reading-column">')
    end = body.index('</div>', start)
    manuscript = body[start:end]
    counter = iter(choices)
    def printed(match):
        name, x, angle = next(counter)
        a = art[name]
        return (f'<div class="city-printed-paragraph">{match[0]}'
                f'<span class="city-ink-car" data-wallpaper-car aria-hidden="true" '
                f'style="--x:{x};--r:{angle};--dx:5;--dy:2;--turn:1">'
                f'<img src="{a["web"]}" width="{a["width"]}" height="{a["height"]}" alt="" loading="lazy" decoding="async">'
                '</span></div>')
    manuscript = re.sub(r'<p>.*?</p>', printed, manuscript, flags=re.S)
    body = body[:start] + manuscript + body[end:]
    wallpaper = scene(body, 'yokohama-city', 'city')
    (ROOT / 'journal/yokohama/index.html').write_text(template.replace('{{CITY_WALLPAPER}}', wallpaper))
    original = (ROOT / 'journal/partials/yokohama-001-original.html').read_text()
    archive = ROOT / 'journal/yokohama/original-001/index.html'
    archive.parent.mkdir(parents=True, exist_ok=True)
    archive.write_text(original.replace('<head>', '<head><base href="/journal/yokohama/">', 1))
    print('Rendered Yokohama 013 photographic essay with in-article wallpaper.')

if __name__ == '__main__':
    build()
