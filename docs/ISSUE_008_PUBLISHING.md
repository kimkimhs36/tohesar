# TOHEŞAR — 가벼운 발행 작업실

프로젝트 루트에서 Python 3만으로 실행합니다. 프레임워크·DB·API 키는 필요 없습니다.

```sh
python3 scripts/publish.py check
python3 scripts/publish.py build
python3 scripts/publish.py preview --port 8000
```

`build`는 Giulia → 뉴스 → Issues → Atlas/관련 이야기 → 공통 탐색을 재생성하고 로컬 링크와 앵커를 검사합니다. 상태를 변경하거나 배포하지 않습니다. 생성 HTML도 데이터와 함께 커밋합니다. 반복 실행 결과는 동일합니다.

## 다음 호

```sh
python3 scripts/publish.py new-issue 002 --title 'NEXT EDITION'
```

`journal/data/issues.json`에 **draft**를 만듭니다. 기존 호를 출발점으로 복사하므로 대표 사진·출처·소개·편집자 글·챕터를 반드시 새 호에 맞게 편집합니다. `chapters` 배열이 편집 순서의 유일한 원본이며 `content_id`는 `content-index.json`의 실제 ID여야 합니다. `layout`은 `curve`, `edge`, `proportion`, `language`, `small` 중 선택합니다. 원하는 새 아트 디렉션은 생성기와 해당 CSS에 추가할 수 있습니다.

draft → review에서 본문·사진·이용 조건·날짜를 사람이 확인하고 **직접** published로 바꾼 뒤 build합니다. 발행된 콘텐츠만 발행 호에 포함할 수 있습니다. 공개 아카이브·Journal 초대·상세 페이지는 published만 생성합니다. 미래 발행일은 차단합니다. ISSUE 002 생성·비공개·재빌드는 임시 복사본의 자동 테스트에서 확인했으며 실제 데이터에는 가상의 002를 남기지 않았습니다.

발행 취소 시 생성된 상세 페이지는 제거되지만, 이미 다른 기사에 남아 있는 링크는 링크 검사에서 차단됩니다. 해당 링크와 소속 설명까지 검토해야 합니다.

## 새 기사

```sh
python3 scripts/publish.py new-story new-design-note --title '새로운 디자인 이야기'
```

초안 본문 `journal/drafts/new-design-note.html`과 draft 메타데이터가 생성됩니다. 본문 HTML을 작성하고, `journal/data/content-index.json`에서 요약·차종·제조사·검증 가능한 연식·forms·키워드·대표 사진·출처·라이선스·related를 채웁니다. `forms`는 기존 네 분류 중 실제로 관련 있는 것만 사용합니다. 이미지 원본과 최적화 파일을 별도로 보존합니다. 출처 URL과 이용 조건은 사람이 확인해야 하며 필드가 채워졌다는 사실만으로 권리가 검증되지는 않습니다.

검토 후 status를 published로 바꾸고 `build`하면 `body_file`을 공통 지면으로 감싸 공개 URL을 만듭니다. Atlas·검색·분류·관련 이야기는 인덱스에서 갱신됩니다. Issue에 포함하려면 해당 호의 chapters에 ID를 한 번 추가합니다. 기사 원고를 여러 HTML에 복사할 필요가 없습니다. 초안 본문 디렉터리는 `.vercelignore`로 배포에서 제외합니다. 메타데이터 JSON은 공개 파일이므로 비밀 정보는 넣지 않습니다.

Giulia는 별도의 아트 디렉션을 가진 원고이므로 `journal/templates/giulia-body.html`에서 편집합니다. `scripts/build_giulia.py`가 이미지 출처와 페이지를 조립합니다.

## 새 뉴스

```sh
python3 scripts/publish.py new-news manufacturer-topic-yyyymmdd
```

`news.json`에 draft / pending을 생성합니다. 필드:

- `published_at`: **공식 발표일**, `registered_at`: TOHEŞAR 등록일
- `manufacturer`, `topic`: design / culture / industry
- `source`, `source_title`, `url`: 개별 공식 원문
- `fact_check_status`: pending / verified / rejected
- `verification`, `verified_at`: 실제 확인 내용과 확인일
- `image`, `image_usage`: 사용하지 않으면 null과 미사용 설명. 사용하면 image_source / image_licence도 필요
- `status`: draft / review / published

원문 제목·발표일·본문과 요약을 직접 대조하고 verified로 변경합니다. 이후 공개 여부를 검토해 published로 변경합니다. pending 뉴스는 공개할 수 없습니다. ID·제목·정규화한 출처 URL 중복도 차단합니다. 기존 뉴스 생성기는 유지되며 미검증 공개를 직접 실행해도 차단합니다. 자동 크롤링·자동 공개는 없습니다.

## 발행 전

```sh
python3 scripts/publish.py build
python3 -m unittest discover -s scripts -p test_publishing_008.py -v
node scripts/verify_issue_008.cjs
```

브라우저 검사는 Playwright 개발 환경에서 실행합니다. 필요하면 `WEBKIT_EXECUTABLE_PATH`를 지정합니다. 웹사이트 실행에는 Node/Playwright가 필요하지 않습니다. `BASE_URL`과 `REVIEW_DIR`로 독립 배포도 검사할 수 있습니다.

사진·본문·모바일 화면을 직접 검토하고 새 기능 브랜치에 커밋·푸시합니다. 배포는 별도 review 프로젝트와 정확한 커밋을 지정해 사람이 실행합니다. `main`, 공식 도메인과 이전 review 프로젝트를 배포 대상으로 삼지 않습니다. 이 CLI에는 배포 명령이 없습니다.
