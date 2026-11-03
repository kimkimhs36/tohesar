"""Apply the authored reading refinements after the legacy page builders."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
STYLE = '<link rel="stylesheet" href="/journal/assets/reading027.css">'

def build():
    for page in ('journal/f40/index.html', 'journal/design/giulia/index.html', 'journal/design/type-01/index.html'):
        path = ROOT / page
        text = path.read_text()
        text = text.replace(STYLE, '').replace('</head>', STYLE + '</head>', 1)
        if 'type-01' in page:
            opening = (ROOT / 'journal/partials/type01-opening027.html').read_text().strip()
            text, count = re.subn(r'<header class="type-opening" id="new-arrival">.*?</header>', lambda _: opening, text, count=1, flags=re.S)
            assert count == 1
            # The comparison below already contains the original photographs, their
            # credits and the full written observations. Remove the duplicate motion study.
            text = re.sub(r'<div class="design-study" data-design-study>.*?</div>\s*(?=<div class="type-comparison")', '', text, count=1, flags=re.S)
            text = re.sub(r'<a href="#comparison" class="study-skip">.*?</a>', '', text)
            observations = (ROOT / 'journal/partials/type01-observations027.html').read_text().strip()
            if 'class="study-observations027"' not in text:
                text = text.replace('</section>\n<div class="type-comparison"', observations + '</section>\n<div class="type-comparison"', 1)
            text = text.replace('<script src="/journal/assets/design-study.js" defer></script>', '')
        if '/f40/' in page:
            study = (ROOT / 'journal/partials/f40-air027.html').read_text().strip()
            text, count = re.subn(r'<section class="air-sequence".*?</section>', lambda _: study, text, count=1, flags=re.S)
            assert count == 1
        path.write_text(text)
    print('Reading 027: authored openings and photo observations applied.')

if __name__ == '__main__': build()
