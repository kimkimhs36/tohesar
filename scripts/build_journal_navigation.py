"""Share one static, no-JS-capable navigation across active journal pages.
Run after new editorial pages are added. COVER 004, legacy and Yokohama stay untouched.
"""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
nav=(ROOT/'journal/partials/navigation.html').read_text().strip()
for page in ['journal/index.html','journal/911/index.html','journal/f40/index.html','journal/news/index.html','journal/visual/index.html','journal/miniatures/index.html','journal/design/index.html','journal/design/type-01/index.html']:
    p=ROOT/page;s=p.read_text()
    s=re.sub(r'<details class="journal-index">.*?</details>',nav,s,flags=re.S)
    s=re.sub(r'<a class="cover-return".*?</a>',nav,s,flags=re.S)
    if '/journal/assets/navigation.css' not in s:
        s=s.replace('</head>','<link rel="stylesheet" href="/journal/assets/navigation.css"><script src="/journal/assets/navigation.js" defer></script></head>')
    footer=s.index('<footer')
    if 'href="/journal/visual/"' not in s[footer:]:
        s=s[:footer]+s[footer:].replace('<a href="/journal/yokohama/"','<a href="/journal/visual/" data-travel>Visual Culture ↗</a><a href="/journal/miniatures/" data-travel>Miniatures ↗</a><a href="/journal/yokohama/"',1)
    p.write_text(s)
print('Rendered shared navigation in eight active journal pages.')
