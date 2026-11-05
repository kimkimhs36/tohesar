"""Finish the Jaguar essay after the legacy reading builders, without changing records."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'journal/design/type-01/index.html'
STYLE = '<link rel="stylesheet" href="/journal/assets/living-gallery032.css">'

def build():
    s = PAGE.read_text()
    s = s.replace(STYLE, '').replace('</head>', STYLE + '</head>', 1)
    s = re.sub(r'<aside class="type-fact">.*?</aside>\s*', '', s, flags=re.S)
    s = s.replace('<span>공식 발표와 독립적인 시각적 관찰을 구분한 디자인 에세이</span>', '')
    def opening_credit(match):
        opening = match.group()
        if '모바일 화면 크롭' not in opening:
            opening = opening.replace('<span>© Jaguar Land Rover Limited · WebP 변환</span>', '<span>© Jaguar Land Rover Limited · WebP 변환 · 모바일 화면 크롭</span>', 1)
        return opening
    s = re.sub(r'<header class="type-opening" id="new-arrival">.*?</header>', opening_credit, s, count=1, flags=re.S)
    s = s.replace('사진은 크기 조정·WebP 변환했으며 비교 사진의 전체 프레임·종횡비·방향을 유지했습니다.', '사진은 크기 조정·WebP 변환했고 도입 사진은 모바일에서 화면에 맞춰 크롭했습니다. Type 00 사진은 전체 프레임·종횡비·방향을 유지했습니다.')
    s = re.sub(r'<p class="type-pull">.*?</p>\s*', '', s, flags=re.S)
    s = re.sub(r'<div class="comparison-heading">.*?</div>', '', s, count=1, flags=re.S)
    s = s.replace('같은 차의 전후 사진이 아닙니다.<br>서로 다른 역할을 가진 두 모델에서, 이어지는 생각을 살펴보세요.', 'Type 00은 디자인 비전 콘셉트, Type 01은 그 뒤를 잇는 양산 모델입니다.')
    s = s.replace('공식 이미지의 프레임과 방향을 그대로 두었습니다. 서로 다른 촬영 조건이므로 길이·높이의 수치 비교가 아닌, 형태의 관계를 읽는 자료입니다.', 'Type 00은 2024년 공개된 디자인 비전 콘셉트입니다. 사진은 원래 프레임과 방향을 유지했습니다.')
    s = s.replace('<p>Type 00의 긴 보닛과 낮은 지붕, 뒤로 흐르는 실루엣은 Type 01에서도 핵심이다. 공식 사진에서는 두 모델 모두 옆창보다 차체 면의 존재감이 먼저 읽힌다. 이것은 선이 완전히 같다는 주장이 아니라, 요소 사이의 위계가 이어진다는 관찰이다.</p>', '')
    s = s.replace('01 / 긴 보닛과 짧은 앞 오버행은 서로 다른 비례다.', '긴 보닛과 짧은 앞 오버행은 서로 다른 비례다.')
    s = s.replace('02 / 빛으로 읽는 면과 모서리', '빛으로 읽는 면과 모서리')
    s = re.sub(r'<svg class="profile-guides".*?</svg>', '', s, flags=re.S)
    s = re.sub(r'<small>선은 관찰 지점을 표시한 TOHEŞAR 해석 그래픽이며 실측 치수가 아닙니다\. 원본 프레임·비율 유지\.</small>', '', s)
    s = s.replace('관찰선은 해석용 그래픽이며 실측 도면이 아닙니다. ', '')
    s = s.replace('자료 확인 2026.10.28.', '자료 확인 2026.10.28. 뉴욕 공개는 10월 6일, 영국 JLR·Jaguar 보도자료 발행은 10월 7일입니다. 주문·인도 일정은 발표 당시 계획입니다.') if '뉴욕 공개는 10월 6일' not in s else s
    # The opening already shows the Type 01 arrival photograph at full size.
    s = re.sub(r'(<div class="comparison-cars">\s*<figure>.*?</figure>)\s*<figure>.*?</figure>', r'\1', s, count=1, flags=re.S)
    s = re.sub(r'<a href="/journal/assets/design/type00-arrival-1600.webp"[^>]*>(\s*<img[^>]*>)\s*</a>', r'\1', s, count=1, flags=re.S)
    # Retain all observations and citations, but read them as continuous prose.
    def notes(match):
        paragraphs = re.findall(r'<p>.*?</p>', match.group(1), flags=re.S)
        return '<div class="comparison-notes">' + ''.join(paragraphs) + '</div>'
    s = re.sub(r'<div class="comparison-notes">(.*?)</div>\s*(?=<div class="type-reading">)', notes, s, count=1, flags=re.S)
    # Place the profile after the first observation, then return to the analysis.
    def first_chapter(match):
        section = match.group()
        if 'type-profile-preface' in section:
            return section
        photo = re.search(r'<figure class="type-profile">.*?</figure>', section, flags=re.S)
        copy = re.search(r'<div class="type-columns"><div>(.*?)</div></div>', section, flags=re.S)
        if not photo or not copy:
            return section
        paragraphs = re.findall(r'<p>.*?</p>', copy.group(1), flags=re.S)
        assert len(paragraphs) == 3, 'Unexpected Jaguar profile passage'
        image = photo.group()
        section = section[:photo.start()] + section[photo.end():]
        copy = re.search(r'<div class="type-columns"><div>.*?</div></div>', section, flags=re.S)
        replacement = '<div class="type-columns type-profile-preface"><div>' + paragraphs[0] + '</div></div>' + image + '<div class="type-columns"><div>' + ''.join(paragraphs[1:]) + '</div></div>'
        return section[:copy.start()] + replacement + section[copy.end():]
    s = re.sub(r'<section class="type-chapter" id="long-bonnet">.*?</section>', first_chapter, s, count=1, flags=re.S)
    # Two contextual paragraphs introduce the detail; the observations follow it.
    def language_chapter(match):
        section = match.group()
        if 'class="language-preface"' in section:
            return section
        layout = re.search(r'<div class="language-layout">(<figure>.*?</figure>)<div>(.*?)</div></div>', section, flags=re.S)
        if not layout:
            return section
        paragraphs = re.findall(r'<p>.*?</p>', layout.group(2), flags=re.S)
        assert len(paragraphs) == 4, 'Unexpected Jaguar language passage'
        replacement = '<div class="language-preface">' + ''.join(paragraphs[:2]) + '</div><div class="language-layout">' + layout.group(1) + '<div>' + ''.join(paragraphs[2:]) + '</div></div>'
        return section[:layout.start()] + replacement + section[layout.end():]
    s = re.sub(r'<section class="type-chapter type-language" id="different-language">.*?</section>', language_chapter, s, count=1, flags=re.S)
    # End the essay with the overhead photograph, after the final reflection.
    m = re.search(r'<figure class="type-closing-photo">.*?</figure>', s, flags=re.S)
    if m:
        photo = m.group()
        s = s[:m.start()] + s[m.end():]
        s, count = re.subn(r'</section>(\s*)(?=<section class="type-sources")', lambda m: photo + '</section>' + m.group(1), s, count=1)
        assert count == 1
    s = s.replace('<p>달력의 두 지점을 잇는 것은 이름만이 아니다. 긴 보닛, 낮은 지붕, 넓게 남겨둔 차체 표면이 반복된다. 그러나 네 개의 문과 실제 생활을 위한 경계를 가진 Type 01은 콘셉트의 복제품도 아니다. 이 글은 그 사이에 남은 생각과 달라진 형태를 읽는다.</p>', '')
    s = s.replace('<p>여기서 중요한 변화는 전기차에 단 하나의 올바른 비례가 있다고 보지 않는 태도다. Type 01은 전동화를 과거의 비례를 지우는 이유로만 쓰지 않는다. 과거의 긴장감을 다른 표면과 그래픽으로 표현할 수 있는 조건으로 삼는다. 911이 곡선의 연속성을, F40이 기능의 노출을 통해 정체성을 만든다면, 이번 재규어는 비례의 기억과 표면의 단절을 한 차체 안에 함께 놓는다.</p>', '')
    PAGE.write_text(s)
    journal = ROOT / 'journal/index.html'
    j = journal.read_text()
    # Normalize the two assets independently. Another stylesheet may have been
    # inserted between them, so looking only for an adjacent pair duplicates
    # the transition resources on the first rebuild.
    cinematic_css = '<link rel="stylesheet" href="/journal/assets/cinematic028.css">'
    cinematic_js = '<script src="/journal/assets/cinematic028.js" blocking="render"></script>'
    j = j.replace(cinematic_css, '').replace(cinematic_js, '')
    j = j.replace('</head>', cinematic_css + cinematic_js + '</head>', 1)
    j = re.sub(r'<a class="text-link" data-travel="" href="/journal/design/">디자인 아틀라스 둘러보기</a>', '', j)
    journal.write_text(j)
    newsroom = ROOT / 'edition/index.html'
    n = newsroom.read_text().replace('Type 00의 선언에서 새로운 4도어 GT까지.<br/>Jaguar', 'Type 00의 선언에서 새로운 4도어 GT까지. Jaguar')
    newsroom.write_text(n)
    issue = ROOT / 'journal/issues/001/index.html'
    i = issue.read_text().replace('<script src="/journal/assets/miniature-paper.js" defer></script>', '')
    issue.write_text(i)
    print('Living Gallery 032: Jaguar photographic sequence and reading applied.')

if __name__ == '__main__':
    build()
