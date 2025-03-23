# Phaser.js 어드벤처 게임 스켈레톤 프로젝트

이 프로젝트는 Phaser.js를 사용하여 Machinarium 스타일의 포인트 앤 클릭 어드벤처 게임을 빠르게 개발할 수 있는 스켈레톤 코드를 제공합니다. 여러 게임에 재사용 가능하도록 모듈화되고 확장 가능한 구조로 설계되어 있습니다.

## 주요 기능

1. **강력한 상호작용 시스템**
    - 클릭, 더블 클릭, 스와이프 등 다양한 인터랙션 지원
    - 모바일 터치와 데스크톱 입력 모두 처리

2. **유연한 핫스팟 시스템**
    - 다양한 유형의 상호작용 영역 지원
    - 플레이어 이동과 연동된 자동 상호작용

3. **포괄적인 인벤토리 시스템**
    - 아이템 수집 및 관리
    - 아이템 조합 기능
    - 스크롤 가능한 UI

4. **고급 대화 시스템**
    - 단일 대화 및 복잡한 대화 시퀀스 지원
    - 대화 선택지 기능
    - 캐릭터 이름 표시

5. **상태 관리 시스템**
    - 중앙화된 게임 상태 관리
    - 자동 저장 및 로드 기능
    - 게임 플래그를 통한 진행 상태 추적

6. **모바일 최적화**
    - 다양한 화면 크기 자동 대응
    - 터치 제스처 지원
    - 하이브리드 앱 변환 준비

## 시작하기

### 1. 프로젝트 구조 설정

```
/public
  /assets
    /images
      /backgrounds
      /characters
      /items
      /ui
    /audio
      /music
      /sfx
    /scenes
    manifest.json

/src
  /game
    /config
    /core
    /scenes
    /entities
    /ui
    /utils
  /services
  index.js
```

### 2. 필수 파일 복사

제공된 코드 파일들을 적절한 위치에 복사하세요:

- `GameManager.js` → `/src/game/core/`
- `GameScene.js` → `/src/game/scenes/`
- `Hotspot.js` → `/src/game/entities/`
- `Player.js` → `/src/game/entities/`
- `Item.js` → `/src/game/entities/`
- `Dialog.js` → `/src/game/ui/`
- `Inventory.js` → `/src/game/ui/`
- `constants.js` → `/src/game/config/`

### 3. 게임 데이터 생성

`/public/assets/data/game-data.json` 파일을 아래 형식으로 생성하세요:

```json
{
  "title": "나의 어드벤처 게임",
  "startingScene": "room1",
  "startingItems": ["note"],
  "items": [
    {
      "id": "key",
      "name": "열쇠",
      "type": "key",
      "description": "고풍스러운 열쇠입니다. 어딘가의 문을 열 수 있을 것 같습니다.",
      "icon": "icon_key"
    },
    ...
  ],
  "combinations": [
    {
      "item1": "stick",
      "item2": "stone",
      "result": "tool"
    },
    ...
  ]
}
```

### 4. 씬 데이터 생성

`/public/assets/scenes/room1.json` 같은 씬 파일을 다음 형식으로 생성하세요:

```json
{
  "id": "room1",
  "name": "시작 방",
  "description": "게임의 시작 지점. 작은 창문이 있는 방.",
  "background": "bg_room1",
  "backgroundMusic": "background_music",
  "player": {
    "x": 400,
    "y": 450
  },
  "hotspots": [
    {
      "id": "door",
      "name": "문",
      "x": 600,
      "y": 300,
      "width": 100,
      "height": 200,
      "type": "door",
      "description": "단단한 나무 문입니다. 잠겨 있습니다.",
      "actions": {
        "type": "requireItem",
        "item": "key",
        "hintText": "문이 잠겨 있습니다. 열쇠가 필요합니다.",
        "successAction": {
          "type": "changeScene",
          "targetScene": "room2"
        }
      }
    },
    ...
  ],
  "items": [
    {
      "id": "key",
      "name": "열쇠",
      "key": "icon_key",
      "x": 120,
      "y": 500,
      "description": "방을 나갈 수 있는 열쇠입니다."
    },
    ...
  ],
  "introEvent": {
    "type": "dialog",
    "text": "어두운 방에 눈을 떴습니다. 여기가 어디지...?"
  }
}
```

### 5. 에셋 매니페스트 생성

`/public/assets/manifest.json` 파일을 생성하여 모든 에셋 목록을 관리하세요.

```json
{
  "version": "1.0.0",
  "images": [
    { "key": "bg_room1", "path": "/assets/images/backgrounds/bg_room1.png" },
    { "key": "icon_key", "path": "/assets/images/items/icon_key.png" },
    ...
  ],
  "audio": [...],
  "spritesheets": [...],
  "scenes": [
    { "key": "room1", "path": "/assets/scenes/room1.json" },
    ...
  ]
}
```

## 게임 확장하기

### 새 씬 추가하기

1. 새 배경 이미지 추가
2. 씬 JSON 파일 생성
3. manifest.json에 씬 정보 추가

### 새 아이템 추가하기

1. 아이템 이미지 추가
2. game-data.json의 items 배열에 아이템 정보 추가
3. 필요한 씬의 JSON 파일에 아이템 배치

### 새 핫스팟 추가하기

씬 JSON 파일의 hotspots 배열에 새 핫스팟 정보를 추가합니다.

### 복잡한 상호작용 추가하기

`GameManager.js`에 새 메서드를 추가하거나 `Hotspot.js`의 `executeAction` 메서드를 확장하세요.

## 모바일 앱으로 배포하기

### Capacitor 설정 (이미 포함됨)

1. `capacitor.config.ts` 파일에서 앱 정보 수정
2. 빌드 실행:
   ```
   npm run build
   npx cap add android
   npx cap add ios
   npx cap copy
   ```
3. 네이티브 프로젝트 열기:
   ```
   npx cap open android
   npx cap open ios
   ```

### 모바일 앱 최적화 팁

1. 에셋 크기 최적화 
- 이미지는 WebP나 압축된 PNG 형식 사용 
- 오디오는 MP3 형식으로 압축 
- 스프라이트 시트 활용하여 HTTP 요청 줄이기


2. 터치 영역을 충분히 크게 설정 (최소 44x44 픽셀)
- 모든 상호작용 요소는 터치하기 쉽게 충분한 크기로 설정
- 너무 가까이 배치된 상호작용 요소는 피하기


3. 오프라인 모드 지원
- Service Worker 구현으로 오프라인 플레이 지원
- 중요 에셋은 사전 캐싱


4. 성능 최적화
- 불필요한 애니메이션 효과 줄이기
- 화면 밖 객체는 업데이트 일시 중지
- 파티클 효과 사용 자제