"""Attach the optional native transition to the preserved 027 pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ('<link rel="stylesheet" href="/journal/assets/cinematic028.css">',
          '<script src="/journal/assets/cinematic028.js" blocking="render"></script>')
PAGES = ('index.html', 'journal/f40/index.html', 'journal/design/giulia/index.html',
         'journal/design/type-01/index.html')

def build():
    for page in PAGES:
        path = ROOT / page
        text = path.read_text()
        # Avoid mixing the prior veil implementation with the new styles after deployment.
        text = text.replace('/journal/assets/travel.css"', '/journal/assets/travel.css?v=028"')
        text = text.replace('/journal/assets/travel.js"', '/journal/assets/travel.js?v=030b"')
        text = text.replace('/journal/assets/travel.js?v=028"', '/journal/assets/travel.js?v=030b"')
        text = text.replace('/journal/assets/travel.js?v=029"', '/journal/assets/travel.js?v=030b"')
        text = text.replace('/journal/assets/travel.js?v=030"', '/journal/assets/travel.js?v=030b"')
        text = text.replace('/journal/assets/travel.js?v=030a"', '/journal/assets/travel.js?v=030b"')
        for asset in ASSETS:
            text = text.replace(asset, '')
        text = text.replace('</head>', ''.join(ASSETS) + '</head>', 1)
        path.write_text(text)
    print('Cinematic 028: native transitions attached to the home and three stories.')

if __name__ == '__main__':
    build()
