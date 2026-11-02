# 저널 기사 및 발행 의존성 조사

기준: 018 브랜치 조사 시점. 범위는 `journal/`의 모든 HTML 문서와 해당 직접 CSS/JS 참조, `scripts/publish.py build`의 생성기다. 참조 순서는 실제 HTML 순서이며, 별도 CSS 내부의 글꼴·이미지 URL이나 JS의 런타임 동작까지 완전한 의존성 그래프를 의미하지 않는다. `inline`은 인라인 스크립트 또는 스타일을 뜻한다.

## HTML별 직접 참조

경로가 `/journal/assets/`로 시작하는 경우 아래 표에서 해당 접두사를 생략했다. 빈 칸은 직접 참조가 없다는 뜻이다.

| 문서 | CSS (로드 순서) | JS (로드 순서) |
| --- | --- | --- |
| `journal/911/index.html` | `/creative/cover-art-max-004/fonts.css`, `journal.css`, `travel.css`, `story.css`, `navigation.css`, `continuity010.css`, `wallpaper011.css`, `living012.css`, `beauty014-wallpaper.css`, `beauty014-editorial.css`, `unified018.css` | `inline`, `travel.js`, `miniature-motion.js`, `navigation.js`, `continuity010.js`, `wallpaper011.js`, `miniature-paper.js` |
| `journal/design/giulia/index.html` | `/creative/cover-art-max-004/fonts.css`, `journal.css`, `navigation.css`, `travel.css`, `issue008.css`, `giulia008.css`, `art009.css`, `wallpaper011.css`, `living012.css`, `beauty014-wallpaper.css`, `continuity010.css`, `beauty014-editorial.css`, `unified018.css` | `navigation.js`, `travel.js`, `issue008.js`, `proportion008.js`, `wallpaper011.js`, `continuity010.js`, `miniature-paper.js` |
| `journal/design/index.html` | `/creative/cover-art-max-004/fonts.css`, `journal.css`, `navigation.css`, `travel.css`, `design-atlas.css`, `continuity010.css`, `unified018.css` | `navigation.js`, `travel.js`, `design-discovery.js`, `continuity010.js`, `inline` |
| `journal/design/type-01/index.html` | `/creative/cover-art-max-004/fonts.css`, `journal.css`, `navigation.css`, `travel.css`, `design-atlas.css`, `type01.css`, `continuity010.css`, `beauty014-editorial.css`, `unified018.css` | `navigation.js`, `travel.js`, `design-study.js`, `continuity010.js`, `miniature-paper.js` |
| `journal/f40/index.html` | `/creative/cover-art-max-004/fonts.css`, `journal.css`, `travel.css`, `story.css`, `visual-world.css`, `navigation.css`, `continuity010.css`, `wallpaper011.css`, `living012.css`, `beauty014-wallpaper.css`, `beauty014-editorial.css`, `unified018.css` | `inline`, `travel.js`, `visual-motion.js`, `navigation.js`, `continuity010.js`, `wallpaper011.js`, `miniature-paper.js` |
| `journal/index.html` | `/creative/cover-art-max-004/fonts.css`, `travel.css`, `navigation.css`, `recovery015.css`, `unified018.css` | `inline`, `travel.js`, `navigation.js` |
| `journal/issues/001/index.html` | `/creative/cover-art-max-004/fonts.css`, `journal.css`, `navigation.css`, `travel.css`, `issue008.css`, `art009.css`, `wallpaper011.css`, `living012.css`, `continuity010.css`, `world013.css`, `beauty014-wallpaper.css`, `beauty014-editorial.css`, `unified018.css` | `navigation.js`, `travel.js`, `issue008.js`, `wallpaper011.js`, `continuity010.js`, `miniature-paper.js` |
| `journal/issues/index.html` | `/creative/cover-art-max-004/fonts.css`, `journal.css`, `navigation.css`, `travel.css`, `issue008.css`, `art009.css`, `continuity010.css`, `unified018.css` | `navigation.js`, `travel.js`, `issue008.js`, `continuity010.js` |
| `journal/legacy-004/index.html` | `inline` | — |
| `journal/miniatures/index.html` | `/creative/cover-art-max-004/fonts.css`, `journal.css`, `travel.css`, `visual-world.css`, `navigation.css`, `continuity010.css`, `wallpaper011.css`, `living012.css`, `beauty014-wallpaper.css`, `beauty014-editorial.css`, `unified018.css` | `inline`, `travel.js`, `visual-motion.js`, `navigation.js`, `continuity010.js`, `wallpaper011.js` |
| `journal/news/index.html` | `/creative/cover-art-max-004/fonts.css`, `journal.css`, `travel.css`, `navigation.css`, `continuity010.css`, `unified018.css` | `inline`, `travel.js`, `news.js`, `navigation.js`, `continuity010.js` |
| `journal/partials/miniature-passage.html` | — | — |
| `journal/partials/navigation.html` | — | — |
| `journal/partials/yokohama-001-original.html` | `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap`, `inline` | `inline`, `inline`, `../../assets/camera-study.js` |
| `journal/partials/yokohama013-wallpaper.html` | — | — |
| `journal/partials/yokohama013.html` | `/creative/cover-art-max-004/fonts.css`, `travel.css`, `wallpaper011.css`, `yokohama013.css`, `beauty014-wallpaper.css`, `beauty014-yokohama.css` | `travel.js`, `wallpaper011.js` |
| `journal/templates/giulia-body.html` | — | — |
| `journal/visual/index.html` | `/creative/cover-art-max-004/fonts.css`, `journal.css`, `travel.css`, `visual-world.css`, `navigation.css`, `continuity010.css`, `world013.css`, `unified018.css` | `inline`, `travel.js`, `visual-motion.js`, `navigation.js`, `continuity010.js` |
| `journal/yokohama/index.html` | `/creative/cover-art-max-004/fonts.css`, `travel.css`, `wallpaper011.css`, `yokohama013.css`, `beauty014-wallpaper.css`, `beauty014-yokohama.css`, `unified018.css` | `travel.js`, `wallpaper011.js` |
| `journal/yokohama/original-001/index.html` | `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap`, `inline` | `inline`, `inline`, `../../assets/camera-study.js` |

## 생성과 입력

| 생성기 / 순서 | 입력과 영향 |
| --- | --- |
| `publish.py build` | `content-index.json`의 `body_file`이 있는 published 항목을 `build_issues.shell`로 작성 후 check, 아래 생성기를 순서대로 실행하고 links 검사. draft/review 본문은 생성하지 않음. |
| `build_yokohama.py` | `partials/yokohama013.html`, `yokohama013-wallpaper.html`, `yokohama-001-original.html`, `wallpaper-artworks.json` → 요코하마 두 페이지 재생성. |
| `build_giulia.py` | `templates/giulia-body.html`, `giulia-image-sources.json`, `build_issues.shell`, `build_wallpaper.scene/attach` → Giulia 전체 재생성. HTML 직접 수정은 빌드 시 사라짐. |
| `build_journal_news.py` | `news.json` → 저널과 뉴스 문서의 표시 영역 갱신. |
| `build_issues.py` | `issues.json`, `content-index.json`, 공통 navigation partial → 발행된 호와 호 목록 재생성 및 홈 삽입. |
| `build_design_atlas.py` | `content-index.json`, `news.json` → 디자인 목록, 뉴스 앵커 및 각 공개 기사의 관련 기사 영역 갱신. |
| `build_world_continuity.py` | `miniature-passage.html` → 911 및 미니카 아카이브 영역 갱신. |
| `build_journal_navigation.py` | `partials/navigation.html` → 활성 페이지에 내비게이션과 continuity CSS/JS 삽입. Yokohama와 legacy 제외. |
| `build_wallpaper.py` | `wallpaper-artworks.json`, `wallpaper-layouts.json` → 911, F40, 미니카의 배경 연출 및 CSS/JS 갱신. Giulia도 동일 모듈을 참조. |
| `build_editorial_world.py` | 하드코딩된 초대문 → 홈, visual, issue의 지정 영역 갱신. |
| `build_beauty_editorial.py` | 7개 지면의 body 클래스 및 beauty014-editorial CSS 로드 순서 갱신. |

`publish.py check`는 기존 content-index/issue/news의 상태, 로컬 파일과 뉴스 검증을 확인하며 상태를 승격하지 않는다. 기존 `new-story`는 메타데이터와 HTML 초안 두 곳을 요구하고, `links`는 고정 페이지 목록만 검사한다. 기존 일반 기사 발행 검사는 이미지 출처 필드의 존재를 확인하지만 별도의 사실 검증 상태를 요구하지 않는다. 새 생성 경로는 별도 명시 검증을 요구하고 동적 출력도 링크 검사에 포함해야 한다.

## 보존과 이전 위험

- COVER 004와 루트는 범위에서 제외한다. F40 오프닝과 Giulia·미니카는 CSS 계층과 스크롤 연출이 결합되어 있으므로 선택자 통합이나 CSS 삭제 전 화면 회귀 검증이 필요하다.
- 승인 지면은 개별 생성기가 다시 작성할 수 있다. 특히 Giulia의 원본은 HTML 출력이 아니라 template와 이미지 출처 JSON이다. F40과 미니카는 wallpaper 빌더의 변경 대상이다.
- `journal/design/type-01/`은 design-atlas, type01, continuity, beauty014, unified018 스타일이 겹친다. 초기 `editorial-stories.json`의 Type 01은 review 상태이며 로컬 사진, 대체 텍스트, 원본 및 라이선스를 포함하므로 별도 경로의 공통 시스템 미리보기에 적합하다. 기존 공개 지면을 교체하지 않는다.
- `editorial-system.css`와 `editorial-stories.json`은 초기 시안이며 기존 발행 명령에 연결되어 있지 않다. 새 빌더가 검증 이전에 공개 경로를 만들거나 기존 경로를 덮지 않도록 경로 충돌과 상태를 검사해야 한다.
- 스타일시트는 순서에 의존한다. 페이지별 참조만 제거하면 공통 색상뿐 아니라 배경, 캡션, 관련 기사 및 모바일 동작까지 바뀔 수 있다. 기존 스타일 정리는 이전된 지면부터 독립적으로 수행한다.
- 표는 직접 참조 목록이다. CSS에서 참조하는 이미지·글꼴과 JS 동작, 다양한 Safari viewport에서의 시각 결과는 별도 브라우저 검증이 필요하다.
