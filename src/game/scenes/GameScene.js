// src/game/scenes/GameScene.js
import Player from '../entities/Player';
import Hotspot from '../entities/Hotspot';
import Item from '../entities/Item';
import Dialog from '../ui/Dialog';
import Inventory from '../ui/Inventory';
import {SCENE_EVENTS, GAME_STATES} from '../config/constants';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.hotspots = [];
        this.items = [];
        this.dialog = null;
        this.inventory = null;
        this.currentSceneKey = '';
        this.gameState = GAME_STATES.EXPLORING;
    }

    init(data) {
        // 씬 초기화 시 필요한 파라미터 설정
        this.currentSceneKey = data.sceneKey || 'room1';
        this.gameState = GAME_STATES.EXPLORING;

        // 게임 매니저에서 저장된 상태 불러오기
        const gameManager = this.scene.get('BootScene').gameManager;
        const savedState = gameManager.getSavedState(this.currentSceneKey);

        if (savedState) {
            // 저장된 상태가 있으면 적용
            this.applyGameState(savedState);
        }
    }

    preload() {
        // 특정 씬에 필요한 추가 리소스가 있으면 여기서 로드
    }

    create() {
        this.events.emit(SCENE_EVENTS.SCENE_CREATED, this.currentSceneKey);

        // 씬 데이터 로드
        const sceneData = this.cache.json.get(this.currentSceneKey);
        if (!sceneData) {
            console.error(`씬 데이터를 찾을 수 없음: ${this.currentSceneKey}`);
            return;
        }

        // 배경 설정
        this.createBackground(sceneData);

        // 핫스팟(상호작용 영역) 생성
        this.createHotspots(sceneData.hotspots);

        // 아이템 생성
        this.createItems(sceneData.items);

        // 플레이어 생성
        this.createPlayer(sceneData.player);

        // UI 컴포넌트 초기화
        this.setupUI();

        // 입력 이벤트 설정
        this.setupInputEvents();

        // 배경 음악 시작 (있는 경우)
        if (sceneData.backgroundMusic) {
            // 파일이 있는 경우
            if (!this.sound.isPlaying) {
                this.sound.play(sceneData.backgroundMusic, {loop: true, volume: 0.5});
            }
        }

        // 씬 시작 시 실행할 이벤트 또는 대화
        if (sceneData.introEvent) {
            this.handleSceneEvent(sceneData.introEvent);
        }
    }

    update(time, delta) {
        // 게임 상태에 따른 업데이트 처리
        if (this.gameState === GAME_STATES.EXPLORING && this.player) {
            this.player.update(time, delta);
        }

        // 핫스팟 업데이트 (필요한 경우)
        this.hotspots.forEach(hotspot => {
            if (hotspot.update) hotspot.update(time, delta);
        });
    }

    createBackground(sceneData) {
        const bgKey = sceneData.background;
        this.add.image(0, 0, bgKey).setOrigin(0, 0);

        // 배경 확장 요소 (파티클, 애니메이션 등)가 있으면 추가
        if (sceneData.backgroundExtras) {
            sceneData.backgroundExtras.forEach(extra => {
                this.createBackgroundExtra(extra);
            });
        }
    }

    createBackgroundExtra(extraData) {
        // 배경 추가 요소 (움직이는 구름, 깜빡이는 조명 등)
        switch (extraData.type) {
            case 'particle':
                // 파티클 효과 (비, 연기 등)
                break;
            case 'animation':
                // 애니메이션 요소 (움직이는 물체 등)
                break;
        }
    }

    createHotspots(hotspotsData) {
        if (!hotspotsData) return;

        this.hotspots = hotspotsData.map(hotspotData => {
            return new Hotspot(this, hotspotData);
        });
    }

    createItems(itemsData) {
        if (!itemsData) return;

        // 이미 수집된 아이템은 제외
        const gameManager = this.scene.get('BootScene').gameManager;
        const collectedItems = gameManager.getCollectedItems();

        this.items = itemsData
            .filter(itemData => !collectedItems.includes(itemData.id))
            .map(itemData => new Item(this, itemData));
    }

    createPlayer(playerData) {
        if (!playerData) return;

        this.player = new Player(this, playerData);
    }

    setupUI() {
        // 대화 UI 초기화
        this.dialog = new Dialog(this);

        // 인벤토리 UI 초기화
        this.inventory = new Inventory(this);

        // 게임 메뉴 버튼
        this.createMenuButton();
    }

    createMenuButton() {
        const menuButton = this.add.text(
            this.cameras.main.width - 100,
            20,
            '메뉴',
            {
                fontFamily: 'Arial',
                fontSize: 18,
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();

        menuButton.on('pointerdown', () => {
            // 게임 일시정지 및 메뉴 표시
            this.pauseGame();
            this.scene.launch('MenuScene');
        });
    }

    setupInputEvents() {
        // 모바일/데스크톱 환경에 따른 입력 설정
        const isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS;

        if (isMobile) {
            this.setupMobileInput();
        } else {
            this.setupDesktopInput();
        }
    }

    setupMobileInput() {
        // 싱글 탭
        this.input.on('pointerdown', this.handleTap, this);

        // 더블 탭 감지
        this.lastTapTime = 0;
        this.input.on('pointerdown', this.handleDoubleTap, this);

        // 드래그/스와이프
        this.input.on('pointermove', this.handleDrag, this);
        this.input.on('pointerup', this.handleSwipe, this);
    }

    setupDesktopInput() {
        // 마우스 클릭
        this.input.on('pointerdown', this.handleClick, this);

        // 마우스 오른쪽 클릭
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.handleRightClick(pointer);
            }
        });

        // 키보드 입력
        this.keyboardKeys = this.input.keyboard.addKeys({
            inventory: Phaser.Input.Keyboard.KeyCodes.I,
            menu: Phaser.Input.Keyboard.KeyCodes.ESC
        });

        this.input.keyboard.on('keydown-I', () => {
            this.inventory.toggleVisibility();
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.pauseGame();
            this.scene.launch('MenuScene');
        });
    }

    handleTap(pointer) {
        if (this.gameState !== GAME_STATES.EXPLORING) return;

        // 대화 UI가 표시 중이면 다음 대화로 진행
        if (this.dialog.isVisible()) {
            this.dialog.next();
            return;
        }

        // 인벤토리 아이템이 선택된 상태인지 확인
        const selectedItem = this.inventory.getSelectedItem();

        // 핫스팟 확인
        const clickedHotspot = this.getHotspotAt(pointer.x, pointer.y);
        if (clickedHotspot) {
            // 선택된 아이템이 있으면 아이템 사용, 없으면 일반 상호작용
            if (selectedItem) {
                this.useItemOnHotspot(selectedItem, clickedHotspot);
            } else {
                this.interactWithHotspot(clickedHotspot);
            }
            return;
        }

        // 아이템 확인
        const clickedItem = this.getItemAt(pointer.x, pointer.y);
        if (clickedItem) {
            if (selectedItem) {
                // 아이템 조합 시도
                this.combineItems(selectedItem, clickedItem);
            } else {
                // 아이템 획득
                this.collectItem(clickedItem);
            }
            return;
        }

        // 빈 영역 클릭 - 플레이어 이동
        if (this.player && !this.inventory.isTouched(pointer)) {
            this.player.moveTo(pointer.x, pointer.y);
        }
    }

    handleDoubleTap(pointer) {
        const currentTime = new Date().getTime();
        const tapInterval = currentTime - this.lastTapTime;

        if (tapInterval < 300 && tapInterval > 0) {
            // 더블 탭 감지됨
            if (this.gameState === GAME_STATES.EXPLORING) {
                // 플레이어 달리기 또는 특별 액션
                const clickedHotspot = this.getHotspotAt(pointer.x, pointer.y);
                if (clickedHotspot) {
                    // 특별한 더블 탭 액션이 있는지 확인
                    this.handleHotspotDoubleInteraction(clickedHotspot);
                } else if (this.player) {
                    // 플레이어 달리기
                    this.player.runTo(pointer.x, pointer.y);
                }
            }
        }

        this.lastTapTime = currentTime;
    }

    handleDrag(pointer) {
        if (!pointer.isDown || this.gameState !== GAME_STATES.EXPLORING) return;

        // 드래그 시작점 기록
        if (!this.dragStart) {
            this.dragStart = { x: pointer.x, y: pointer.y };
            return;
        }

        // 인벤토리 스크롤 등의 드래그 동작
        if (this.inventory.isVisible() && this.inventory.isTouched(this.dragStart)) {
            this.inventory.handleDrag(pointer.x - this.dragStart.x);
        }
    }

    handleSwipe(pointer) {
        if (!this.dragStart || this.gameState !== GAME_STATES.EXPLORING) {
            this.dragStart = null;
            return;
        }

        const dx = pointer.x - this.dragStart.x;
        const dy = pointer.y - this.dragStart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 50) {
            // 스와이프 감지됨
            if (Math.abs(dx) > Math.abs(dy)) {
                // 수평 스와이프
                const direction = dx > 0 ? 'right' : 'left';
                this.handleHorizontalSwipe(direction);
            } else {
                // 수직 스와이프
                const direction = dy > 0 ? 'down' : 'up';
                this.handleVerticalSwipe(direction);
            }
        }

        this.dragStart = null;
    }

    handleHorizontalSwipe(direction) {
        if (direction === 'left') {
            // 왼쪽 스와이프 (인벤토리 열기 등)
            this.inventory.show();
        } else {
            // 오른쪽 스와이프 (인벤토리 닫기 등)
            this.inventory.hide();
        }
    }

    handleVerticalSwipe(direction) {
        if (direction === 'up') {
            // 위로 스와이프 (메뉴 열기 등)
            this.pauseGame();
            this.scene.launch('MenuScene');
        } else {
            // 아래로 스와이프 (힌트 표시 등)
            // 힌트 시스템 구현 시 활용
        }
    }

    handleClick(pointer) {
        // 데스크톱 클릭 처리 (기본적으로 handleTap과 유사)
        this.handleTap(pointer);
    }

    handleRightClick(pointer) {
        // 오른쪽 클릭 처리 (아이템 검사 등)
        if (this.gameState !== GAME_STATES.EXPLORING) return;

        // 핫스팟 검사
        const hotspot = this.getHotspotAt(pointer.x, pointer.y);
        if (hotspot) {
            this.examineHotspot(hotspot);
            return;
        }

        // 아이템 검사
        const item = this.getItemAt(pointer.x, pointer.y);
        if (item) {
            this.examineItem(item);
            return;
        }
    }

    getHotspotAt(x, y) {
        // 지정된 좌표에 있는 핫스팟 찾기
        return this.hotspots.find(hotspot => hotspot.containsPoint(x, y));
    }

    getItemAt(x, y) {
        // 지정된 좌표에 있는 아이템 찾기
        return this.items.find(item => item.containsPoint(x, y));
    }

    // GameScene.js의 interactWithHotspot 메서드 수정
    interactWithHotspot(hotspot) {
        // 핫스팟과 상호작용
        if (!hotspot.isEnabled()) return;

        console.log("Interacting with hotspot:", hotspot.id);

        // 플레이어가 핫스팟에 접근할 수 있는지 확인
        if (this.player && !hotspot.isWithinReach(this.player)) {
            const interactionPoint = hotspot.getInteractionPoint();
            console.log("Moving player to interaction point:", interactionPoint);

            // 이 부분이 중요 - 플레이어 이동 전에 좌표 유효성 확인
            if (!interactionPoint || typeof interactionPoint.x !== 'number' || typeof interactionPoint.y !== 'number') {
                console.error("Invalid interaction point:", interactionPoint);
                hotspot.interact(this); // 유효하지 않은 경우 그냥 상호작용 진행
                return;
            }

            this.player.moveTo(interactionPoint, () => {
                hotspot.interact(this);
            });
        } else {
            hotspot.interact(this);
        }
    }

    handleHotspotDoubleInteraction(hotspot) {
        // 핫스팟에 대한 더블 탭/더블 클릭 상호작용
        if (hotspot.doubleInteract) {
            hotspot.doubleInteract(this);
        } else {
            // 기본 상호작용과 동일하게 처리
            this.interactWithHotspot(hotspot);
        }
    }

    examineHotspot(hotspot) {
        // 핫스팟 자세히 보기
        if (hotspot.examine) {
            hotspot.examine(this);
        } else {
            // 기본 설명 표시
            this.dialog.show(hotspot.getDescription());
        }
    }

    useItemOnHotspot(item, hotspot) {
        // 아이템을 핫스팟에 사용
        if (hotspot.canUseItem(item.id)) {
            if (this.player) {
                this.player.moveTo(hotspot.getInteractionPoint(), () => {
                    hotspot.useItem(item.id, this);
                    this.inventory.deselectItem();
                });
            } else {
                hotspot.useItem(item.id, this);
                this.inventory.deselectItem();
            }
        } else {
            // 아이템을 사용할 수 없음
            this.dialog.show("그것은 여기에 사용할 수 없습니다.");
            this.inventory.deselectItem();
        }
    }

    collectItem(item) {
        // 아이템 획득
        if (this.player) {
            this.player.moveTo(item.x, item.y, () => {
                this.addItemToInventory(item);
            });
        } else {
            this.addItemToInventory(item);
        }
    }

    addItemToInventory(item) {
        // 인벤토리에 아이템 추가
        // 사운드 파일이 있을 때
        if (item.sound && item.sound.pickup) {
            this.sound.play('item_pickup', {volume: 0.5});
        }

        // 아이템 획득 애니메이션
        this.tweens.add({
            targets: item.gameObject,
            alpha: 0,
            y: item.y - 20,
            duration: 300,
            onComplete: () => {
                // 아이템 제거 및 인벤토리에 추가
                const gameManager = this.scene.get('BootScene').gameManager;
                gameManager.collectItem(item.id);

                // 인벤토리 UI 업데이트
                this.inventory.addItem(item.getItemData());

                // 아이템 객체 제거
                this.items = this.items.filter(i => i !== item);
                item.destroy();

                // 아이템 획득 메시지 표시 (선택적)
                if (item.pickupMessage) {
                    this.dialog.show(item.pickupMessage);
                }
            }
        });
    }

    examineItem(item) {
        // 아이템 자세히 보기
        this.dialog.show(item.getDescription());
    }

    combineItems(itemA, itemB) {
        // 아이템 조합 시도
        const gameManager = this.scene.get('BootScene').gameManager;
        const combinationResult = gameManager.combineItems(itemA.id, itemB.id);

        if (combinationResult) {
            // 조합 성공
            this.inventory.removeItem(itemA.id);
            this.inventory.removeItem(itemB.id);

            // 새 아이템 추가
            this.inventory.addItem(combinationResult);

            // 조합 성공 메시지
            this.dialog.show(combinationResult.creationMessage || "아이템을 조합했습니다!");
        } else {
            // 조합 실패
            this.dialog.show("이 아이템들은 함께 사용할 수 없습니다.");
        }

        this.inventory.deselectItem();
    }

    handleSceneEvent(eventData) {
        // 씬 이벤트 처리 (인트로 대화, 컷씬 등)
        switch (eventData.type) {
            case 'dialog':
                this.dialog.showConversation(eventData.conversation);
                break;
            case 'cutscene':
                this.playCutscene(eventData.cutscene);
                break;
            case 'item_give':
                this.giveItem(eventData.itemId);
                break;
        }
    }

    playCutscene(cutsceneData) {
        // 컷씬 재생
        this.gameState = GAME_STATES.CUTSCENE;

        // 컷씬 구현...

        // 컷씬 종료 후 게임 상태 복원
        this.time.delayedCall(cutsceneData.duration || 3000, () => {
            this.gameState = GAME_STATES.EXPLORING;
        });
    }

    giveItem(itemId) {
        // 아이템 직접 지급
        const gameManager = this.scene.get('BootScene').gameManager;
        const itemData = gameManager.getItemData(itemId);

        if (itemData) {
            gameManager.collectItem(itemId);
            this.inventory.addItem(itemData);

            // 아이템 획득 메시지 표시 (선택적)
            if (itemData.pickupMessage) {
                this.dialog.show(itemData.pickupMessage);
            }
        }
    }

    changeScene(targetSceneKey) {
        // 다른 씬으로 전환
        this.scene.start('GameScene', { sceneKey: targetSceneKey });
    }

    pauseGame() {
        // 게임 일시 정지
        this.gameState = GAME_STATES.PAUSED;
        this.sound.pauseAll();
    }

    resumeGame() {
        // 게임 재개
        this.gameState = GAME_STATES.EXPLORING;
        this.sound.resumeAll();
    }

    saveGameState() {
        // 현재 게임 상태 저장
        const gameManager = this.scene.get('BootScene').gameManager;
        gameManager.saveGameState();
    }

    applyGameState(savedState) {
        // 저장된 게임 상태 적용
        // 이 메서드는 저장된 게임을 로드할 때 사용됨
    }
}