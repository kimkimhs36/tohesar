# VISION DRIVE 04

TOHEŞAR × TEAM BKIT · 김현성  
STOCK OUTSIDE. FAST INSIDE.

KS5023 ESP32-CAM 로봇이 Wi-Fi와 웹 조종석을 직접 제공하는 펌웨어·UI·서비스 도구입니다. **처음 한 번 펌웨어 설치 후에는 아이패드/스마트폰만으로 조종합니다.** 매번 설치·컴파일·PowerShell·노트북 중계 서버를 실행하지 않습니다.

- 공개 프로젝트: https://tohesar.com/vision-drive/
- 공개 시뮬레이션: https://tohesar.com/vision-drive/simulator/ — 실제 로봇 통신 없음
- 최초 백업·설치 도구: https://tohesar.com/vision-drive/setup/ — 데스크톱 Chrome/Edge + USB
- 학교 실행 안내: https://tohesar.com/vision-drive/guide/
- 설치 후 실제 조종: 로봇 AP `VISION-DRIVE-…` → 암호 `BKIT-5023` → **http://192.168.4.1**

## 현재 상태

펌웨어를 실제 ESP32 툴체인으로 컴파일했고, 생산 C++ 상태 머신과 브라우저·모의 HTTP·모의 USB 절차를 시험했습니다. **실물 기기는 연결·플래시하지 않았습니다.** 실제 모터 방향, 카메라, 전원, 단절 시 출력 중단 시간, iPad Safari는 현장 인수 시험이 필요합니다. `docs/VALIDATION.md`에서 구분합니다.

기존 정상 펌웨어의 정확한 BIN은 이 기기를 읽어야 얻을 수 있습니다. 업로더는 전체 백업을 검증하기 전에 설치를 허용하지 않습니다. 이미 확보한 기기 백업이 있다고 주장하지 않습니다. 공식 제조사 코드는 `vendor/`에 보관했습니다. 첨부 STUDIO 03 원본은 작업공간에 별도 보관하며 공개 ZIP에는 포함하지 않습니다.

## 핵심 기능

- 직접 AP / 내장 UI / QVGA JPEG 프레임별 수신 확인 / 외부 CDN·학교망 불필요
- 아날로그 차동 조이스틱·방향 버튼·키보드 / PWM 85·170·255 / 좌우 수동 출력 보정
- 별도 FreeRTOS 안전 태스크: 유효 명령 350 ms 만료 시 GPIO 출력 0 + 세션 폐기 + LED OFF
- 최근 영상이 없으면 구동 준비 차단 / 오래된 시퀀스·이전 세션 거부 / 재연결 후 수동 준비
- LED, 반전·구도선·사진·지원 브라우저에서 최대 60초 녹화·메모·기록 내보내기
- 모터를 움직이지 않는 HTTP 응답 진단과 시운전 HTML 보고서·JSON 기록

표시는 명령·응답 기준입니다. 실제 속도·거리·배터리 센서값이나 자동 직진·장애물 회피 기능은 없습니다. 350 ms는 명령 만료 기준이며 기계적 정지 시간을 보장하지 않습니다.

## 디렉터리

- `firmware/`: PlatformIO 소스·정확한 GPIO 매핑·공유 안전 상태 머신
- `web/drive/`: 로봇에 내장되는 실제 조종석. 로봇 주소에서만 통신
- `web/simulator/`: 공개 입력 시각화. 로봇 네트워크 요청 없음
- `web/setup/`: 로컬에 포함된 esptool-js 기반 백업·설치·복원 도구
- `release/`: 합본/개별 BIN, 매니페스트, 빌드·시험 기록
- `tests/`: 생산 C++ 상태 머신 / Playwright 모의 HTTP 및 USB 시험
- `docs/`: 아키텍처·학교 실행·출처·검증·설계 인계
- `tools/`: UI 임베드·패키징·Python 서비스 대체 도구

## 개발 재현

Python 3.12, PlatformIO 6.2.0으로 검증했습니다. 최초 개발 환경 준비에만 인터넷이 필요합니다.

```sh
python -m pip install platformio==6.2.0
cd firmware
python -m platformio run
cd ..
python tools/package_release.py
```

`platformio.ini`가 espressif32 6.9.0 / Arduino ESP32 2.0.17을 사용합니다. `web/drive`를 gzip 배열로 생성하여 펌웨어에 넣습니다. 파일 시스템 업로드는 따로 필요하지 않습니다. 브라우저에서 직접 여는 파일이 아닌 로봇 자체 HTTP 서버에서 제공합니다. 실제 플래시는 위 명령에 포함되지 않습니다.

호스트 상태 머신:

```sh
g++ -std=c++17 -Wall -Wextra -Werror -Ifirmware/include tests/control_test.cpp -o /tmp/vision-control-test
/tmp/vision-control-test
```

브라우저 재검증은 개발자용 Python Playwright·Chromium·Pillow가 필요합니다. 학교에서 조종할 때는 필요하지 않습니다.

```sh
python -m http.server 8787 --directory web
# 별도 터미널
python tests/browser_test.py
python tests/uploader_test.py
```

개발용 HTTP 서버는 공개 사이트/시뮬레이션 시험을 위한 것입니다. 실물 조종에 노트북 서버가 필요하다는 뜻이 아닙니다.

## USB 서비스 대체 도구

웹 업로더가 정책상 차단된 경우에만 선생님이 허용한 PC에서 사용합니다. Python 및 esptool은 처음 한 번 준비합니다. 반복 시연에는 필요하지 않습니다.

```sh
python -m pip install -r tools/requirements.txt
python tools/flash.py backup --port COM3 --backup stock-myrobot.bin
python tools/flash.py install --port COM3 --backup stock-myrobot.bin --confirm INSTALL
# 복원할 때
python tools/flash.py restore --port COM3 --backup stock-myrobot.bin --confirm RESTORE
```

모터 전원 분리·바퀴 띄움·제조사 USB-TTL/BOOT 배선 확인 후 실행하세요. 전체 백업 BIN과 JSON의 MAC·SHA-256이 일치해야 기록합니다. 기록 후 읽기 검증을 수행하고 자동 실행하지 않습니다. 완료 후 GPIO0–GND를 해제하고 수동으로 전원을 다시 켭니다. 이 대체 도구의 실제 USB 실행도 미검증입니다.