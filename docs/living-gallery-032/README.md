# TOHEŞAR 032 — 검토 기록

기준은 `design/editorial-beauty-refinement-031`의 `e3c1b1e`다. COVER 004와 원본 사진, 발행 데이터는 변경하지 않았다. 이미지는 로컬 HTTP 서버에서 Playwright Chromium으로 캡처한 390 × 844 CSS 픽셀 화면이다. 각 쌍은 같은 지면 요소를 화면 상단에 맞춰 찍었으며, 본문 순서가 바뀐 만큼 인접한 내용은 다를 수 있다. 실기기 사진이 아니다.

| 지면 | 031 | 032 |
| --- | --- | --- |
| Jaguar 첫 장면 | [Before](before/jaguar-hero.png) | [After](after/jaguar-hero.png) |
| Jaguar 도입과 타이포그래피 | [Before](before/jaguar-opening.png) | [After](after/jaguar-opening.png) |
| 측면 사진 | [Before](before/jaguar-profile.png) | [After](after/jaguar-profile.png) |
| Type 00에서 Type 01으로 | [Before](before/jaguar-comparison.png) | [After](after/jaguar-comparison.png) |
| 마지막 사진과 본문 순서 | [Before](before/jaguar-closing.png) | [After](after/jaguar-closing.png) |
| 저널 Jaguar 소개 | [Before](before/journal.png) | [After](after/journal.png) |
| ISSUE 001의 Jaguar | [Before](before/issue.png) | [After](after/issue.png) |
| 뉴스룸 | [Before](before/newsroom.png) | [After](after/newsroom.png) |
| 아카이브 | [Before](before/archive.png) | [After](after/archive.png) |

추가 화면: [375px](after/jaguar-375.png), [430px](after/jaguar-430.png), [iPad 가로 1180px](after/jaguar-1180.png). 캡처 재현: `node scripts/capture_living_gallery032.cjs http://127.0.0.1:4173 <output-dir>`.

## 시각적 판단

- [Type 7](https://type7.com/) 실제 지면의 사진이 페이지를 지배하는 크기와 분명한 제목 위계를 관찰했다. Type 7의 사진 위 대형 영문 타이틀이나 상업용 캐러셀을 재현하지 않고, 한글 가독성을 위해 Jaguar의 사진과 제목을 별도 영역에 두었다.
- Awwwards Site of the Day 수상작 [S-2K](https://www.uicoach.io/inspirations/award-winning/s-2k)의 실제 수상 스크린샷에서 어두운 사진과 크고 작은 활자의 명확한 위계를 비교했다. 시선의 중심을 하나로 두는 원칙을 가져오되, 원본 이미지 위의 큰 장식 텍스트나 몰입형 모션은 적용하지 않았다. 모바일 도입 사진은 차체가 잘리지 않는 범위에서 좌우를 크롭했다. [M-Sport Raptor의 수상 기록](https://www.ryzeagency.co.uk/news/ryze-wins-site-of-the-day-for-m-sport-raptor-website/)도 확인했다.
- Jaguar의 첫 사진에서 어두운 종이색으로 이어지는 명암과 밝은 본문, 다시 어두워지는 마지막 캡션으로 큰 시각적 리듬을 만들었다. 대표 사진 중복을 제거하고 Type 00 사진을 독립된 장면으로 놓았다. 조형 관찰선, 반복되는 풀쿼트와 소제목을 줄였다. 원문 사실과 인용은 유지하면서 이미 앞에서 설명한 반복 문장만 덜었다. 결론 뒤에 항공 사진을 배치해 마지막 시각 장면이 글을 마무리한다.
- 한글의 지나치게 좁은 자간을 완화하고 영문 차명을 세리프로, 캡션은 더 읽기 쉽게 조정했다. ISSUE 001의 흐릿한 반복 자동차 배경은 정지된 종이색으로 정리했으며, 별도의 주행 자동차는 유지했다. 저널에서 나란히 붙어 보이던 두 링크 중 중복 유도를 제거했다.

## 사진과 이용 조건

Jaguar의 도입·측면·후면·항공 사진과 Type 00은 기존 JLR 공식 이미지 그대로이며 크기 변경 및 WebP 변환 기록, 원본 URL·해시·크레딧과 라이선스는 `journal/data/design-image-sources.json`에 있다. 800/1600px 파일은 각각 약 21–195 KiB다. 모바일 도입 사진은 화면에서만 좌우를 크롭해 차체와 빛을 더 크게 보여준다. 파일 자체와 나머지 사진의 프레임은 유지했고 확인되지 않은 사진으로 교체하지 않았다. 현재 이미지는 제조사 보도사진 중심이라 이후 현장성 있는 사진이 필요하면 촬영자 직접 의뢰 또는 사용권을 서면으로 확인한 도로 주행·세부 사진을 후보로 검토할 수 있다. 현재 후보 파일이나 추가 이용권이 확인된 것은 아니다.

[JLR User Licence](https://media.jlr.com/jaguar/en-gb/user-licence) §4(b)는 주로 상업적 이익이나 사적 금전 보상을 목적으로 한 사용을 제한하고, §4(c)는 크레딧 및 후원·보증 암시 금지 조건을 둔다. 이미지별 출처와 조건을 유지했다. 사이트의 수익화, 홍보 소재·표지 등 이용 맥락이 바뀌면 공개 전에 권리자와 별도로 확인해야 한다.

## 발행과 공개 전 확인

- `content-index.json`과 `issues.json`은 그대로다. 현재 검사 결과 7개 콘텐츠 레코드, 발행 이슈 1개, 뉴스 레코드 9개이며 새로운 발행번호는 생성하지 않았다. 이슈 빌더는 ID 중복·미발행 콘텐츠 참조·사진과 출처를 검사한다.
- 100개 이상 확장 시 디자인 아틀라스는 발행 레코드에서 카드를 생성하지만, 뉴스룸 아카이브는 정적 HTML 카드와 클라이언트 필터다. 기록 하나만 추가해도 모든 지면이 자동 동기화되는 구조는 아니다. 대량 자료를 넣기 전에 아카이브를 인덱스에서 생성하고 페이지 분할·검색 성능·URL 중복 검사를 추가해야 한다. 이번 작업에서 실재하지 않는 기록을 만들어 검증하지 않았다.
- 홈·저널·Jaguar·ISSUE 001·F40은 `noindex,nofollow`, 뉴스룸 및 아카이브는 해당 메타가 없다. `robots.txt`는 크롤링을 허용하고 sitemap은 4개 URL만 담고 있으며 주요 저널 URL을 빠뜨린다. Jaguar는 description이 있지만 canonical이 없고, F40은 검사한 메타 description이 없다. 공개 승인 전 환경별 색인 정책, canonical·공유 메타데이터·sitemap을 기록 기준으로 일괄 점검해야 한다. 이번 작업은 색인 정책을 바꾸지 않았다.
- 3배 밀도 모바일 에뮬레이션에서 Jaguar 첫 사진은 1600px WebP 약 199,458 bytes를 선택했다. 로컬 측정은 실제 모바일 네트워크의 LCP나 배터리 수명을 보증하지 않는다. 주행 애니메이션은 비가시 상태, 데이터 절약, reduced motion에서 중단되며 흔적 수는 제한된다. Chromium 터치 에뮬레이션에서 자동차 위 스와이프가 75px의 문서 스크롤로 이어지는 것을 확인했다. 실제 iPhone Safari, 저전력 모드 및 현장 배터리 측정은 별도 실기기 확인이 필요하다.

## 검증

- `scripts/publish.py check`, `links`: 통과 (12개 지면, 로컬 링크/앵커 1,243개).
- `scripts/test_publishing_008.py`: 격리된 임시 복사본에서 8개 통과. 실제 발행 상태 변경 없음.
- `tests/editorial-refinement031.cjs`: 375/390/430/1180px F40·Giulia·Jaguar, 연속 주행과 reload·reduced motion 통과.
- `tests/living-gallery032.cjs`: Chromium과 Playwright WebKit에서 375/390/430/1180px 주요 지면, 이미지 순서, 가로 넘침, 링크를 통한 이동·뒤로 가기·새로고침·흔적 보존·reduced motion 통과.
- `tests/navigation.cjs`: Chromium 375/390/430/1180px에서 커버 이후 F40·Giulia·Jaguar 이동, 뒤로·앞으로·새로고침 통과. 430/1180px에서는 키보드, JavaScript 비활성화, 빠른 재클릭과 reduced motion도 통과. 초기 430px 시도는 병렬 부하 중 시간 초과였고 단독 재검증에서 통과했다.
- `scripts/test_edition.py`, `scripts/test_reading.py`: 아카이브 및 뉴스 필터와 리더 기능 통과.
- 브라우저 기반 테스트는 OS의 실제 iPhone Safari가 아니다. 운영 배포 및 main 병합은 수행하지 않았다.
