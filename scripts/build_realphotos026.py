"""Remove photographic AI scenes from active pages. Run LAST after legacy generators.

Drawn miniature artwork is retained. The 911 article and COVER use separate
licensed photographs, with attribution and source links beside each image.
"""
from pathlib import Path
from html import escape
import re
ROOT=Path(__file__).resolve().parents[1]
PHOTO='/assets/cover-911-valentin-kremer.jpg'
ALT='벽돌 건물 앞의 검은 Porsche 911. 세부 연식과 모델은 확인되지 않음.'
CREDIT='사진 Valentin Kremer / Unsplash · 세부 모델 미확인 · <a href="https://unsplash.com/photos/mhrZmA_2eEg">원본 사진</a> / <a href="https://unsplash.com/license">Unsplash License</a>'
ARTICLE_PHOTO='/journal/assets/editorial-fresh/911-story-jerry-1200.webp'
ARTICLE_CREDIT='사진 Jerry Kavan / Unsplash · 촬영자 설명: 964 · <a href="https://unsplash.com/photos/black-porsche-911-parked-in-garage-wTTDIVnYzkE">원본 사진</a> / <a href="https://unsplash.com/license">Unsplash License</a> · 크기 조절 및 WebP 변환'
AI=r'/assets/yokohama-[^"\s<>]+'
def real_img(eager=False):
    return f'<img src="{PHOTO}" alt="{ALT}" width="1200" height="1989" decoding="async" '+('fetchpriority="high"' if eager else 'loading="lazy"')+'>'
def finish_navigation(s, *, yokohama=False):
    """Keep source links; finish with one home/journal choice, not another index."""
    s=re.sub(r'<nav class="story-explore"[^>]*>.*?</nav>','',s,flags=re.S)
    s=re.sub(r'<a class="next-story"[^>]*>.*?</a>','',s,flags=re.S)
    s=re.sub(r'<a class="city-inline-link"[^>]*>.*?</a>','',s,flags=re.S)
    s=re.sub(r'<aside class="city-next"[^>]*>.*?</aside>','',s,flags=re.S)
    s=re.sub(r'<aside class="article-return026"[^>]*>.*?</aside>','',s,flags=re.S)
    s=re.sub(r'<a href="/journal/f40/" class="text-link"[^>]*>.*?</a>','',s,flags=re.S)
    heading=' id="next-title"' if yokohama else ''
    ending=f'<aside class="article-return026" aria-label="읽기를 마친 뒤"><p>이야기는 여기서 잠시 멈춥니다.</p><h2{heading}>다시, 새로운 시선으로.</h2><nav aria-label="홈으로 돌아가기"><a href="/" data-travel>홈으로</a></nav></aside>'
    s=s.replace('</main>',ending+'</main>',1)
    css='<link rel="stylesheet" href="/journal/assets/article-cleanup026.css">'
    s=s.replace(css,'').replace('</head>',css+'</head>')
    s=re.sub(r'(<footer\b[^>]*>.*?)<nav\b[^>]*>.*?</nav>',r'\1<nav aria-label="하단 탐색"><a href="/">홈</a><a href="/journal/">저널</a></nav>',s,flags=re.S)
    return s


def strip_scenes(s):
    s=re.sub(r'<figure\b[^>]*>.*?</figure>',lambda m:'' if re.search(AI,m[0]) else m[0],s,flags=re.S)
    s=re.sub(r'<img\b[^>]*src="'+AI+r'"[^>]*>','',s)
    s=re.sub(r'<meta\b[^>]*(?:property|name)="(?:og:image|twitter:image)"[^>]*'+AI+r'[^>]*>','',s)
    return s
# The 911 essay uses a genuine photograph, not historical evidence of the 1963 car.
p=ROOT/'journal/911/index.html';s=p.read_text()
s=re.sub(r'<figure class="story-hero">.*?</figure>',lambda _:f'<figure class="story-hero"><img src="{ARTICLE_PHOTO}" srcset="/journal/assets/editorial-fresh/911-story-jerry-800.webp 800w, {ARTICLE_PHOTO} 1200w" sizes="(max-width:700px) 100vw, 650px" alt="따뜻한 조명의 차고에 주차된 검은 Porsche 911" width="1200" height="1800" decoding="async" fetchpriority="high"><figcaption>{ARTICLE_CREDIT}</figcaption></figure>',s,flags=re.S)
s=strip_scenes(s)
# Legacy wallpaper rebuilds use this boundary to preserve chapter grouping.
# Retain a nonvisual, image-free marker rather than breaking the next build.
if '<figure class="story-wide">' not in s:
    boundary='<!-- WALLPAPER:opening:END -->'
    if boundary not in s:
        raise ValueError('911 opening wallpaper boundary missing')
    s=s.replace(boundary,boundary+'<figure class="story-wide"></figure>',1)
s=re.sub(r'<aside class="metadata-related">.*?</aside>','',s,flags=re.S)
disclosure = '도입 사진은 Jerry Kavan이 촬영한 Porsche 911입니다. 촬영자는 964로 설명하지만 세부 사양은 별도로 확인되지 않았으며, 1963년 차량의 사료 사진으로 제시하지 않습니다.'
for old in ('요코하마 이미지는 기존 TOHEŞAR의 AI 보조 비주얼 스터디입니다. 실제 촬영 사진이나 특정 연식·사양의 정확한 재현이 아니며, 디자인 사료로 사용하지 않았습니다.', '도입 사진은 Valentin Kremer가 촬영한 Porsche 911입니다. 세부 모델과 연식은 확인되지 않았으며, 본문에서 다루는 1963년 차량이나 964의 사료 사진으로 제시하지 않습니다.'):
    s=s.replace(old, disclosure)
s=re.sub(r'<p class="continuation-credit">.*?AI 보조 비주얼 픽션.*?</p>','',s,flags=re.S)
style911='<style id="realphotos026-911">.story-hero>img{width:min(100%,650px);height:auto;max-height:none;object-fit:contain;margin-inline:auto}.story-hero figcaption{display:block;max-width:650px;margin-inline:auto;font-size:11px;line-height:1.9}.story-wide:empty{display:none}.drive-layout{display:block}.drive-explanation{max-width:680px;margin-inline:auto}</style>'
s=re.sub(r'<style id="realphotos026-911">.*?</style>','',s,flags=re.S)
s=s.replace('</head>',style911+'</head>')
p.write_text(finish_navigation(s))
# Yokohama becomes a prose essay rather than relabelling synthetic images as photos.
p=ROOT/'journal/yokohama/index.html';s=strip_scenes(p.read_text())
s=re.sub(r'<aside class="metadata-related">.*?</aside>','',s,flags=re.S)
s=s.replace('도시의 빛, 자동차의 곡선, 지면의 작은 그래픽이 이어지는 TOHEŞAR의 AI 보조 비주얼 에세이.','도시의 빛, 자동차의 곡선과 작은 그래픽을 글로 읽는 TOHEŞAR 에세이.')
s=s.replace('The city. The car. The page. AI 보조 이미지로 구성한 독립 비주얼 에세이.','도시와 자동차의 관계를 상상한 글과 미니카 일러스트.')
s=s.replace('실제 현장 촬영이 아닌, AI 보조 이미지로 구성한 독립적인 시각적 에세이입니다.','사진 형태의 AI 장면은 제외했습니다. 이 글은 요코하마를 상상한 에세이이며 실제 취재나 여행 기록이 아닙니다.')
s=s.replace('기존 TOHEŞAR Yokohama 비주얼 스터디의 이미지를 다시 편집했습니다. 자동차와 도시의 관계를 읽는 글, 그리고 011 Wallpaper Universe의 작은 자동차 일러스트를 하나의 지면으로 연결합니다.','기존 글과 작은 자동차 일러스트를 보존한 텍스트 에세이입니다. 사진처럼 보이는 AI 생성 장면은 이 지면에서 제외했습니다.')
s=s.replace('<dt>이미지</dt><dd>TOHEŞAR · AI 보조 비주얼 픽션</dd>','<dt>사진</dt><dd>사용하지 않음</dd>')
s=s.replace('사진 형태의 AI 장면은 제외했습니다. 이 글은 요코하마를 상상한 에세이이며 실제 취재나 여행 기록이 아닙니다.','요코하마를 상상한 글과 자동차 일러스트를 엮은 에세이입니다. 실제 취재나 여행 기록은 아닙니다.')
s=s.replace('기존 글과 작은 자동차 일러스트를 보존한 텍스트 에세이입니다. 사진처럼 보이는 AI 생성 장면은 이 지면에서 제외했습니다.','도시와 자동차의 관계를 상상한 글에 작은 자동차 일러스트를 더했습니다. 실제 현장 사진은 사용하지 않습니다.')
s=s.replace('이미지 속 차량과 공간의 세부 표현은 현실과 다를 수 있습니다. ','')
s=re.sub(r'<a href="/journal/yokohama/original-001/">.*?</a>','',s)
s=re.sub(r'<p class="continuation-credit">.*?AI 보조 비주얼 픽션.*?</p>','',s,flags=re.S)
style='''<style id="realphotos026">.city-cover,.city-arrival-photo,.city-blue-photo,.city-panorama,.city-drive-photo{display:none}.city-opening{min-height:0}.city-arrival,.city-blue,.city-leaving{display:block}.city-arrival-copy,.city-blue-heading,.city-leaving-copy{max-width:680px;margin-inline:auto;width:auto}.city-margin-note{max-width:680px;margin:40px auto 0}.city-within{display:block;max-width:680px;margin-inline:auto}.city-within-copy{width:auto;max-width:none}.city-arrival,.city-blue,.city-afterglow,.city-leaving{padding-block:clamp(48px,7vw,100px)}.city-manuscript p{max-width:38em}.city-disclosure{max-width:720px;margin-inline:auto}.city-disclosure p{font-size:13px;line-height:1.9}</style>'''
s=re.sub(r'<style id="realphotos026">.*?</style>','',s,flags=re.S)
s=s.replace('</head>',style+'</head>')
for old,new in [('이 이미지에서 먼저 눈에 들어오는 것은','이 상상 속 장면에서 먼저 떠오르는 것은'),('사진 속 자동차를 작은 그림으로 옮기면','상상 속 자동차를 작은 그림으로 옮기면'),('사진이 남긴 인상을','풍경이 남긴 인상을'),('사진에서 일러스트로 바뀔 때처럼','풍경을 일러스트로 옮길 때처럼'),('사진을 지나온 눈에는','글로 그린 풍경을 지나온 눈에는'),('사진 밖에서도','풍경 밖에서도')]:
    s=s.replace(old,new)
p.write_text(finish_navigation(s,yokohama=True))
# Existing issue's 911 illustration is replaced with a credited genuine image.
p=ROOT/'journal/issues/001/index.html';s=p.read_text()
def issue_figure(m):
    if not re.search(AI,m[0]):return m[0]
    result=re.sub(r'<img\b[^>]*src="'+AI+r'"[^>]*>',real_img(),m[0])
    return re.sub(r'<figcaption\b[^>]*>.*?</figcaption>',lambda _:f'<figcaption class="edition-credit">{CREDIT}</figcaption>',result,flags=re.S)
s=re.sub(r'<figure\b[^>]*>.*?</figure>',issue_figure,s,flags=re.S)
s=s.replace('사진과 작은 자동차가 같은 지면에 머무는 시각적 에세이로 이어집니다.','도시의 빛을 상상한 글과 작은 자동차 일러스트로 이어집니다.').replace('AI 보조 비주얼 픽션 · 실제 현장 사진 아님','도시를 상상한 에세이 · 현장 취재 아님')
p.write_text(s)
# Newsroom's onward link uses the same real photograph and recorded attribution.
p=ROOT/'edition/index.html';s=p.read_text()
s=re.sub(r'<a class="journal-return-photo".*?</a>',lambda _:f'<a class="journal-return-photo" data-travel href="/journal/911/">{real_img()}<span>911, 형태가 시간을 통과하는 방식<small>{CREDIT}</small></span></a>',s,flags=re.S)
# Credit links must not be nested inside the article link.
s=s.replace(f'<small>{CREDIT}</small>', '<small>Valentin Kremer / Unsplash · 세부 모델 미확인</small>')
p.write_text(s)
for file in ['journal/911/index.html','journal/yokohama/index.html','journal/issues/001/index.html','edition/index.html']:
    assert not re.search(r'<img\b[^>]*src="'+AI, (ROOT/file).read_text()),file
print('Real-photo policy applied to active 911, Yokohama, issue and newsroom pages. Run this generator last.')
