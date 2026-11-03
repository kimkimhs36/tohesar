"""Apply the quiet Newsroom reading surface after shared navigation/site generators.

Only the two newsroom landing pages are touched. Headlines, rights, source links,
collection controls and existing article openings remain authored by their tools.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STYLESHEET = '<link rel="stylesheet" href="/journal/assets/newsroom025.css">'
REPLACEMENTS = {
    "TOHEŞAR / 뉴스룸": "자동차의 오늘",
    "OFFICIAL SOURCES, A CLOSER LOOK": "원문과 해설을 함께 읽습니다",
    "원문 뉴스 검색 ↗": "원문 뉴스 검색",
    "Editor's pick <span>01</span>": "추천 이야기",
    "원문 헤드라인 <span>02</span>": "해외 원문",
    "Archive <span>03</span>": "기사 모음",
    "01 / DISPATCHES": "해외 원문",
    "02 / THE EDITORIAL DESK": "한국어 해설",
    "CURATED &amp; SOURCE-LINKED": "공식 발표와 함께 읽기",
    "THE LONG READ / DESIGN &amp; HISTORY": "오래 읽는 이야기",
    "DESIGN, PLACES &amp; THE THINGS THAT STAY": "저널에서 이어 읽기",
    "Journal로 돌아가기 <span>↗</span>": "저널 둘러보기",
    "NEWSROOM / ORIGINAL HEADLINES": "자동차 소식 · 해외 원문",
    "ORIGINAL HEADLINES": "원문 수집 기록",
    "검색·필터 초기화 ↺": "검색·필터 초기화",
    "자료 다시 확인 ↻": "자료 다시 확인",
    '<small>NEWS DESK</small>': '<small>원문 검색</small>',
}

def build():
    for relative in ('edition/index.html', 'edition/news/index.html'):
        path = ROOT / relative
        text = path.read_text()
        for old, new in REPLACEMENTS.items():
            text = text.replace(old, new)
        text = text.replace(STYLESHEET, '')
        text = text.replace('</head>', STYLESHEET + '</head>')
        path.write_text(text)
    print('Newsroom polish: two landing pages updated; source records and articles unchanged.')

if __name__ == '__main__':
    build()
