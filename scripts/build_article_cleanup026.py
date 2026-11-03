"""Finish the authored article journey after article/navigation/publish generators.

No article paragraphs or source records are rewritten. The three stories keep
individual openings and miniatures; discovery belongs to the home and journal.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CSS = '<link rel="stylesheet" href="/journal/assets/article-cleanup026.css">'
RETURN = '''<aside class="article-return026" aria-label="읽기를 마친 뒤"><p>이야기는 여기서 잠시 멈춥니다.</p><h2>다시, 새로운 시선으로.</h2><nav aria-label="홈으로 돌아가기"><a href="/" data-travel>홈으로</a></nav></aside>'''
PAGES = ('journal/f40/index.html', 'journal/design/type-01/index.html', 'journal/design/giulia/index.html')


def cleanup(text, *, template=False):
    # Authored chapter headings/anchors remain; remove only the duplicate jump rows.
    text = re.sub(r'<nav\b[^>]*class="(?:type-chapters|giulia-toc|story-explore)"[^>]*>.*?</nav>', '', text, flags=re.S)
    text = re.sub(r'<a\b[^>]*class="next-story"[^>]*>.*?</a>', '', text, flags=re.S)
    # Upstream atlas builds append related cards whenever their markers are absent.
    # Normalize both old cards and our existing return together, retaining exactly
    # the first ending in document order, including after a full publisher rebuild.
    ending_seen = False
    def ending(_match):
        nonlocal ending_seen
        if ending_seen:
            return ''
        ending_seen = True
        return RETURN
    text = re.sub(r'<aside\b[^>]*class="[^"]*(?:metadata-related|type-related|article-return026)[^"]*"[^>]*>.*?</aside>', ending, text, flags=re.S)
    # Standalone repeat links into other branches are replaced by the one return above.
    text = re.sub(r'<a\b[^>]*class="atlas-link"[^>]*>모든 디자인 이야기와 검색으로 돌아가기.*?</a>', '', text, flags=re.S)
    text = re.sub(r'(<div class="type-topline">\s*<a href=")[^"]+(")', r'\1/journal/\2', text)
    text = text.replace('↖ Journal', '저널').replace('↖ Design Atlas', '저널').replace('↖ 디자인 아틀라스', '저널')
    text = text.replace('↖', '').replace('↗', '')
    text = re.sub(r'(<footer\b[^>]*>.*?)<nav\b[^>]*>.*?</nav>', r'\1<nav aria-label="하단 탐색"><a href="/">홈</a><a href="/journal/">저널</a></nav>', text, flags=re.S)
    if not template:
        text = text.replace(CSS, '').replace('</head>', CSS + '</head>')
    return text


def build():
    for relative in PAGES:
        path = ROOT / relative
        path.write_text(cleanup(path.read_text()))
    template = ROOT / 'journal/templates/giulia-body.html'
    template.write_text(cleanup(template.read_text(), template=True))
    print('Article cleanup: F40, Type 01 and Giulia; opening photography and paragraphs retained.')

if __name__ == '__main__':
    build()
