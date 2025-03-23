```
/public
  /assets
    /images
      /backgrounds     # 각 씬의 배경 이미지
      /characters      # 플레이어 및 NPC 캐릭터
      /items           # 수집 가능한 아이템
      /ui              # UI 요소(버튼, 메뉴 등)
    /audio
      /music           # 배경 음악
      /sfx             # 효과음
    /scenes            # 씬 데이터 JSON 파일
    manifest.json      # 에셋 매니페스트

/src
  /game
    /config            # 게임 설정
      config.js        # 기본 Phaser 설정
      constants.js     # 게임 상수 정의
    
    /core              # 핵심 게임 시스템
      GameManager.js   # 게임 전체 상태 관리
      InputManager.js  # 입력 관리
      AudioManager.js  # 오디오 관리
      DialogManager.js # 대화 시스템 관리
      InventorySystem.js # 인벤토리 시스템
    
    /scenes            # Phaser 씬
      BootScene.js     # 초기 로딩
      PreloadScene.js  # 에셋 로딩
      MenuScene.js     # 메인 메뉴
      GameScene.js     # 메인 게임 플레이
      SettingsScene.js # 설정 메뉴
      CreditsScene.js  # 크레딧
    
    /entities          # 게임 엔티티
      Player.js        # 플레이어 캐릭터
      NPC.js           # NPC 기본 클래스
      Item.js          # 아이템 기본 클래스
      Hotspot.js       # 상호작용 영역
    
    /ui                # UI 컴포넌트
      Dialog.js        # 대화 창
      Inventory.js     # 인벤토리 UI
      Menu.js          # 메뉴 컴포넌트
      HUD.js           # 게임 내 HUD
    
    /utils             # 유틸리티
      assetLoader.js   # 에셋 로딩 헬퍼
      stateManager.js  # 상태 관리 유틸리티
      animations.js    # 애니메이션 헬퍼
      pathfinding.js   # 경로 찾기 알고리즘

  /services           # 외부 서비스
    storageService.js  # 저장/로드 시스템
    analyticsService.js # 게임 분석 (선택적)

  index.js            # 게임 진입점
```