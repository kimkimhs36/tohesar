"""013 Yokohama: preserve the original, compose a source-built visual essay."""
from pathlib import Path
from build_wallpaper import scene

ROOT = Path(__file__).resolve().parents[1]

def build():
    template = (ROOT / 'journal/partials/yokohama013.html').read_text()
    body = (ROOT / 'journal/partials/yokohama013-wallpaper.html').read_text()
    wallpaper = scene(body, 'yokohama-city', 'city')
    (ROOT / 'journal/yokohama/index.html').write_text(template.replace('{{CITY_WALLPAPER}}', wallpaper))
    original = (ROOT / 'journal/partials/yokohama-001-original.html').read_text()
    archive = ROOT / 'journal/yokohama/original-001/index.html'
    archive.parent.mkdir(parents=True, exist_ok=True)
    archive.write_text(original.replace('<head>', '<head><base href="/journal/yokohama/">', 1))
    print('Rendered Yokohama 013 photographic essay with in-article wallpaper.')

if __name__ == '__main__':
    build()
