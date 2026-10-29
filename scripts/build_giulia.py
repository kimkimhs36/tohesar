"""Assemble the authored article with image-level credits from its manifest."""
from build_issues import shell
from issue_model import ROOT,load
from html import escape as e
body=(ROOT/'journal/templates/giulia-body.html').read_text()
credits=''
for i in load('journal/data/giulia-image-sources.json'):
    label={'giulia-side':'전면 사선 / 표면','giulia-front':'기사 시작 / 얼굴','giulia-rear':'후면','giulia-profile':'Proportion Study / 측면'}[i['id']]
    credits+=f'<p><strong>{label}</strong> — {e(i["author"])} · <a href="{e(i["source"])}">사진 출처</a> / <a href="{e(i["licence_url"])}">{e(i["licence"])}</a> · <a href="/{e(i["original_path"])}">보존 원본</a><br>크기 조절·WebP 변환 / 일부 CSS 프레임 발췌·관찰선 추가. 차체의 형태·비율 변형 없음.</p>'
body=body.replace('<!-- GIULIA-CREDITS:START --><!-- GIULIA-CREDITS:END -->','<!-- GIULIA-CREDITS:START -->'+credits+'<!-- GIULIA-CREDITS:END -->')
s=shell('Alfa Romeo Giulia — 아름다움이 비율이 되는 순간','현대 Giulia 952의 자세, 곡면, 얼굴과 비례를 실사진과 스크롤 관찰로 읽는 한국어 디자인 에세이.',body,'issue-page giulia-page')
s=s.replace('<link rel="stylesheet" href="/journal/assets/art009.css">','')
s=s.replace('</head>','<link rel="stylesheet" href="/journal/assets/giulia008.css"><link rel="stylesheet" href="/journal/assets/art009.css"><script src="/journal/assets/proportion008.js" defer></script></head>')
(ROOT/'journal/design/giulia/index.html').write_text(s)
print('Rendered Giulia editorial and image credits.')
