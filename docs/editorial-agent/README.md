# TOHEŞAR 기사 에이전트 작업 지침

이 문서를 GPT 또는 코드 에이전트의 작업 지침으로 제공한다. 이 저장소의 생성기는 공통 서체·사진·출처·미니카·메뉴를 제공한다. 에이전트가 각 기사마다 HTML이나 CSS를 새로 작성하지 않는다. COVER 004, F40, Giulia 및 기존 미니카 지면을 바꾸지 않는다.

## 입력과 접수

사람 또는 에이전트가 UTF-8 JSON 파일에 아래 형태로 내용을 작성한다. `slug`는 소문자 영문·숫자·하이픈이다. `body`에는 도입과 본문을 각각 한 문단 이상 넣는다. 사진은 저장소 내 로컬 이미지 경로, 대체 텍스트, 크레딧, HTTPS 원본과 이용 조건이 모두 필요하다. 사실의 출처와 사진 이용 조건을 확인하지 못했으면 임의로 채우지 말고 접수를 멈춘다.

```json
{
  "slug": "example-story",
  "title": "자동차를 바라보는 시선",
  "body": ["확인된 사실을 바탕으로 작성한 도입 문단.", "근거를 확인한 본문 문단."],
  "hero": {
    "src": "/journal/assets/example.webp",
    "alt": "이미지에 실제로 보이는 장면",
    "credit": "실제 사진 제공자와 권리 표기",
    "source_url": "https://example.com/original-photo",
    "licence_url": "https://example.com/actual-licence"
  },
  "sources": [{"label": "실제로 확인한 원문", "url": "https://example.com/source"}]
}
```

위 주소와 파일명은 형식 예시이며 실제 기사에 사용하면 안 된다. 파일·링크·라이선스는 직접 확인한 자료로 교체한다. 필요하면 `subject`, `deck`, `description`, `date`, `author`, `paper`, `art_direction`을 추가할 수 있다. 생략한 설명과 소제목은 기존 텍스트에서 기계적으로 채우며 새로운 사실을 생성하지 않는다. `art_direction`은 기존 [제작 안내](../editorial-system-guide.md)를 따른다.

```sh
python3 scripts/editorial_intake.py --input /경로/기사.json
python3 scripts/publish.py preview --port 8000
python3 scripts/publish.py check
```

접수는 `review` 상태의 데이터와 `.editorial-preview/<slug>/` 미리보기만 만든다. 같은 slug를 덮어쓰지 않고, 입력에 `status`나 `verification`을 지정할 수도 없다. 미리보기 폴더는 배포에 포함되지 않는다. 위 명령만으로 공개 페이지나 목록은 생성되지 않는다.

## 검증 및 발행

형식 검사는 사실 확인이나 사진 사용 허가를 증명하지 않는다. 독립적으로 원문, 날짜, 사진의 사용 범위와 크레딧을 확인하고 실제 화면의 모바일 지면도 검토한다. 확인한 사람과 근거, 날짜를 데이터의 `verification`에 기록하고 명시적으로 `published`로 바꾸기 전까지 공개하지 않는다. 자세한 발행 명령은 기존 제작 안내를 따른다. 검증되지 않은 글을 자동으로 `verified`로 바꾸거나 검토자 이름을 만들어내지 않는다.

## 반복 실행

이 명령은 비대화형이므로 스케줄러가 JSON을 준비한 다음 실행할 수 있다. 기존 실행 환경에 저장소 접근과 승인된 자료·이미지가 연결되어 있어야 하며, 실패·중복 결과는 기록하고 공개하지 않는다. 이 문서는 스케줄을 생성하거나 GPT 작업과 저장소를 자동 연결하지 않는다. 매 시간 실행하더라도 새로운 자료가 없거나 검증할 수 없으면 새 기사를 만들지 않는다. 스케줄을 실제로 가동하려면 실행 환경, 자료 공급원, 알림 및 접근 권한을 별도로 연결해야 한다.

## GitHub Actions 검토 패키지

저장소의 작업 브랜치에 `journal/inbox/기사.json`과 사진 파일을 추가한다. GitHub Actions에서 **TOHEŞAR article review package**를 선택하고 같은 브랜치 및 파일 경로를 지정해 수동 실행한다. 실행이 성공하면 `tohesar-article-review` 산출물을 내려받아 압축을 풀고, 해당 폴더에서 `python3 -m http.server 8000`을 실행한다. 생성된 `README.txt`의 로컬 주소로 검토한다. 본문에 표시된 다른 사이트 페이지는 패키지에 포함되지 않는다. 이 산출물은 7일 뒤 만료된다.

자동화는 입력 형식과 로컬 파일 존재를 점검해 `review` 기사와 `noindex` 미리보기만 만들며, 저장소에 쓰거나 배포하지 않는다. 원문 사실·사진 권리 확인이나 승인자의 판단을 대신하지 않는다. 실행 스케줄과 GPT 데이터 공급은 설정되지 않았다. 나중에 승인된 스케줄러가 같은 명령을 실행할 수 있지만 내용 수집 및 검증의 책임 경로를 먼저 연결해야 한다.

GitHub의 `workflow_dispatch`는 워크플로 파일이 기본 브랜치에 있어야 실행할 수 있다. 검토 브랜치에만 있는 동안에는 로컬 명령 `python3 scripts/editorial_review_job.py --input journal/inbox/기사.json --output /tmp/tohesar-review`를 사용한다. 기본 브랜치에 워크플로를 반영하기 전까지 GitHub에서 실행 가능한 것으로 간주하지 않는다.

접수함은 정적 사이트 배포에서 제외하지만 Git 저장소에 커밋한 파일은 저장소 접근 권한을 가진 사람에게 보인다. 비밀 정보나 사용 허가가 없는 사진을 커밋하지 않는다.

여러 `editorial_intake.py` 실행은 서로 직렬화된다. 다만 직접 JSON 파일을 편집하거나 다른 생성 도구를 동시에 실행하는 작업까지 직렬화하지는 않으므로 한 번에 하나의 작성 경로만 사용한다. 프로세스가 강제 종료되어 `.editorial-preview/<slug>/`만 남으면 데이터에 해당 기사가 이미 존재하는지 먼저 확인한 뒤, 데이터가 없는 고아 미리보기만 제거하고 재접수한다.
