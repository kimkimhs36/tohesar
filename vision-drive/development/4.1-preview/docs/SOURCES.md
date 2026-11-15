# 원본과 기술 근거 / 2026-11-02

## 사용자 자료와 이전 결과

1. 사용자 첨부 `1-VISION_DRIVE_STUDIO_03.zip`. 작업공간의 `references/STUDIO_03_ORIGINAL.zip`에 원본 그대로 보관했으며 공개 ZIP에는 포함하지 않았다. `CODEX_CONTINUE.md`, README, SOURCES, VALIDATION, bridge.cs, control-core.js, app.js, HTML/CSS·테스트를 검토했다. **ESP32 소스가 들어 있는 패키지가 아니라 C# 브리지 + UI 패키지**였다.
2. https://vision-drive-showcase-preview.vercel.app/ 의 공개 HTML·CSS·JS를 읽고 `references/previous-showcase/`에 보관했다. 실제 통신 어댑터 없이 입력 시각화만 하는 페이지다. 이를 실물 제어 검증으로 간주하지 않았다.
3. https://github.com/kimkimhs36/tohesar main 및 공개 https://tohesar.com/ 을 확인했다. 통합 전 `/vision-drive/`는 404였으며 홈페이지는 GitHub Pages main 루트에서 제공 중이었다. 새 경로만 추가하고 루트 HTML·CSS·CNAME을 변경하지 않았다.

## 하드웨어와 런타임

- Keyestudio 공식 KS5023 문서: https://docs.keyestudio.com/projects/KS5023/en/latest/docs/2WD%20Camera%20Robot%20Car.html
- 문서에서 연결한 공식 예제 ZIP: https://docs.keyestudio.com/projects/KS5023/en/latest/_downloads/5d1b57111f99c6c53d315d7a0745f42d/codes.zip
- 공식 회로 PDF: https://docs.keyestudio.com/projects/KS5023/en/latest/_downloads/3cc847b5e0625ce1f11692174d3be3bd/esp32_cam_schematic_diagram.pdf
- ESP32 Arduino Wi-Fi AP: https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wifi.html
- ESP-IDF task watchdog: https://docs.espressif.com/projects/esp-idf/en/v4.4.7/esp32/api-reference/system/wdts.html
- ESP HTTP server: https://docs.espressif.com/projects/esp-idf/en/v4.4.7/esp32/api-reference/protocols/esp_http_server.html
- ESP32 camera driver: https://github.com/espressif/esp32-camera
- PlatformIO pinned platform: https://github.com/platformio/platform-espressif32/releases/tag/v6.9.0

## 최초 USB 설치

- esptool-js **0.5.7**, Espressif, Apache 2.0: https://github.com/espressif/esptool-js/tree/v0.5.7
- 배포 bundle: https://unpkg.com/esptool-js@0.5.7/bundle.js — `web/setup/vendor/`에 원형 보관. API와 readFlash/flashMd5sum/getFlashSize/writeFlash 소스를 확인했다. getFlashSize 반환 단위 KB를 실제 코드에 맞췄다.
- Python esptool read_flash stub 프로토콜과 비교해 후미 digest를 소비·검증하는 제한된 어댑터를 작성했다. `flash-io.js` 주석에 출처 명시.
- SparkMD5 **3.0.2**, André Cruz, WTFPL 2: https://github.com/satazor/js-spark-md5 — 공개 도구에서 ArrayBuffer MD5 비교에만 사용. SHA-256은 Web Crypto.
- esptool bundle의 pako 2.1.0 및 atob 고지는 `licenses/`에 보관. firmware는 PlatformIO가 설치하는 Arduino ESP32 2.0.17 / ESP-IDF 4.4 계열의 라이선스를 따른다. 제조사 예제의 별도 라이선스는 원문에 없으므로 프로젝트 자체 코드인 것처럼 재표기하지 않았다.
- Web Serial 지원 범위: https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API — 데스크톱 Chromium 계열 HTTPS. iPad Safari USB 설치를 지원한다고 표시하지 않는다.

## 시각 자산

- Barlow Condensed / Pretendard: 사용자 원본 패키지의 수정하지 않은 OFL 서체와 라이선스 보존.
- 플랫폼 SVG, 조종석 도형, 시뮬레이션 도면은 이 프로젝트에서 코드로 작성했다. 실물 사진·영상이 아니다.
- 공개 screenshot은 이 소스의 실제 Chromium 렌더링이다. 카메라 모의 시험 이미지는 MOCK CAMERA라고 명시했다.