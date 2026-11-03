# TOHEŞAR 025 — 사진이 먼저 보이는 저널

기준은 `design/tohesar-reading-experience-024`의 `cdd35a3`이다. 019~024의 탐색·기사 접수·비공개 검토·용어 설명을 보존했다. 운영 `main`과 운영 배포는 변경하지 않았다.

홈의 반복 배경이 제목에 겹치던 부분을 정리하고, 도입을 줄여 F40 사진을 더 일찍 보여준다. Giulia와 Jaguar는 아이보리 지면과 서로 다른 사진 폭으로 이어진다. 저널은 기사 흐름을 먼저 보여주고 특집호 안내를 뒤로 옮겼다. Explore의 사진 출처와 실제 비율을 보완하고, 아틀라스의 검색·필터와 뉴스룸의 기사·원문을 같은 라일락·아이보리·피치 계열로 다듬었다. 기존 사진과 권리 표기를 유지했으며 새로운 실차 이미지나 혼합 차종 아트워크를 만들지 않았다.

첫 캡처 후 홈의 배경·여백을 수정했고, 다시 캡처해 모바일 정렬과 저널의 기사 순서를 재조정했다. 아틀라스에서는 실제 캡처 중 발견한 장식 미니카의 2px 넘침을 고쳤다. 생성기에는 이미지 헤더에서 크기를 읽는 기능과 반응형 사진을 반영했다. 재빌드에서 빠지던 Giulia의 공통 읽기 스타일·미니카 정렬 스크립트도 복원하도록 수정했다.

## 바로 비교하기

| 화면 | 이전 | 수정 후 |
| --- | --- | --- |
| 홈의 저널 진입부 | [390px](before/home-entry-390.png) | [390px](after/home-entry-390.png) |
| 디자인 아틀라스 | [390px](before/design-390.png) | [390px](after/design-390.png) |
| 뉴스룸 | [390px](../reading-polish-025/before-newsroom-390.png) | [390px](../reading-polish-025/after-newsroom-390.png) |

전체 화면 [이전 비교 시트](baseline-contact-390.jpg)와 [최종 비교 시트](final-contact-390.jpg), 개별 상단·중간·하단 캡처를 함께 보관했다. 스크린샷을 저장한 뒤 실제 이미지를 열어 사진 구도, 줄바꿈, 메뉴와 하단까지 검토했다. 자동 테스트 통과를 미적 승인으로 간주하지 않는다.

## 검증과 범위

Python 테스트 45개, 기사·출처·로컬 링크 검사, 검색·저장·공유·필터 검사와 별도 복사본의 전체 재생성 검사가 통과했다. Chromium은 11개 경로 × 5개 폭, 총 55개 조합에서 HTTP 응답·가로 넘침·사진·JavaScript 오류를 확인했다. COVER 004·F40·Giulia 오프닝은 375/390/430/768/1440px에서 이전 캡처와 픽셀이 같다. 원본 해시와 결과는 `preservation-results.json`, 테스트 범위는 `validation-summary.json`에 있다.

브라우저는 `/usr/bin/chromium`이다. 실제 iPhone Safari나 WebKit을 실행한 결과가 아니다. 기존 비주얼 픽션은 픽션 표기를 유지했으며, 기존 기사의 사실·사진 권리를 새로 독립 검증했다고 주장하지 않는다. Issue·Miniatures·보호된 기사들은 화면 검사를 했고 이번 시각 수정의 중심은 홈·저널·Explore·아틀라스·뉴스룸이다.

Vercel 배포 도구가 연결되지 않았고 GitHub 배포 조회도 `Forbidden`으로 막혀 새 미리보기 URL은 없다. GitHub 검토 브랜치와 캡처로 비교할 수 있다.

## 재현

저장소에서 `python3 -m http.server 8000 --bind 127.0.0.1`로 실행하고, 별도 셸에서 `python3 scripts/verify_art_direction_025.py /tmp/tohesar-025-audit`를 실행한다. Python Playwright와 Chromium이 필요하다.

`python3 scripts/publish.py build`는 검증된 콘텐츠만 재생성하며 025 원본도 마지막에 적용한다. 운영 배포 명령이 아니다. 개별 지면만 확인하려면 `python3 scripts/build_editorial025.py`, `python3 scripts/build_design_atlas.py --atlas-only`, `python3 scripts/build_newsroom_polish.py`를 사용한다. 기사 접수 지침은 [기사 에이전트 문서](../editorial-agent/README.md)를 따른다. 검증되지 않은 기사는 여전히 자동 공개되지 않는다.
