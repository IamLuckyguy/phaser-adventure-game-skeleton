// src/game/ui/Inventory.js

export default class Inventory {
    constructor(scene) {
        this.scene = scene;
        this.visible = false;
        this.items = [];
        this.selectedItem = null;
        this.itemSlots = [];
        this.scrollPosition = 0;
        this.maxVisibleItems = 8; // 한 번에 표시할 최대 아이템 수

        // UI 요소 생성
        this.createUI();

        // 이벤트 핸들러 설정
        this.setupEventHandlers();

        // 초기 아이템 로드
        this.loadItems();
    }

    createUI() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // 인벤토리 배경
        this.background = this.scene.add.rectangle(
            width / 2,
            height - 60,
            width - 20,
            100,
            0x333333,
            0.9
        );
        this.background.setOrigin(0.5);
        this.background.setDepth(50);
        this.background.setStrokeStyle(2, 0xcccccc);

        // 아이템 슬롯 컨테이너
        this.slotsContainer = this.scene.add.container(width / 2 - 350, height - 60);
        this.slotsContainer.setDepth(51);

        // 슬롯 생성
        this.createItemSlots();

        // 스크롤 버튼 (많은 아이템이 있을 경우)
        this.createScrollButtons();

        // 선택된 아이템 정보 표시 영역
        this.createItemInfoPanel();

        // 모든 요소 초기에 숨김
        this.hide();
    }

    createItemSlots() {
        // 아이템 슬롯 생성
        for (let i = 0; i < this.maxVisibleItems; i++) {
            const slot = this.scene.add.rectangle(
                i * 80,
                0,
                70,
                70,
                0x666666,
                0.8
            );
            slot.setStrokeStyle(2, 0xffffff);

            // 아이템 아이콘 (초기에는 빈 슬롯)
            const icon = this.scene.add.image(0, 0, 'blank');
            icon.setVisible(false);

            // 슬롯 인덱스 저장
            slot.slotIndex = i;
            slot.icon = icon;

            // 상호작용 활성화
            slot.setInteractive();

            // 이벤트 핸들러
            slot.on('pointerover', () => {
                if (slot.itemData) {
                    slot.setStrokeStyle(3, 0xffff00);
                    this.showItemTooltip(slot.itemData);
                }
            });

            slot.on('pointerout', () => {
                slot.setStrokeStyle(2, 0xffffff);
                this.hideItemTooltip();
            });

            slot.on('pointerdown', () => {
                if (slot.itemData) {
                    this.selectItem(slot);
                }
            });

            // 슬롯 추가
            this.slotsContainer.add(slot);
            this.slotsContainer.add(icon);

            this.itemSlots.push({ slot, icon });
        }
    }

    createScrollButtons() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // 왼쪽 스크롤 버튼
        this.leftButton = this.scene.add.text(
            20,
            height - 60,
            '◄',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#cccccc'
            }
        );
        this.leftButton.setOrigin(0.5);
        this.leftButton.setDepth(52);
        this.leftButton.setInteractive();

        // 오른쪽 스크롤 버튼
        this.rightButton = this.scene.add.text(
            width - 20,
            height - 60,
            '►',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#cccccc'
            }
        );
        this.rightButton.setOrigin(0.5);
        this.rightButton.setDepth(52);
        this.rightButton.setInteractive();

        // 이벤트 핸들러
        this.leftButton.on('pointerdown', () => {
            this.scrollLeft();
        });

        this.rightButton.on('pointerdown', () => {
            this.scrollRight();
        });
    }

    createItemInfoPanel() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // 아이템 정보 패널
        this.infoPanel = this.scene.add.container(width - 200, height - 60);
        this.infoPanel.setDepth(51);

        // 배경
        this.infoPanelBg = this.scene.add.rectangle(
            0,
            0,
            180,
            80,
            0x222222,
            0.9
        );
        this.infoPanelBg.setStrokeStyle(1, 0xaaaaaa);

        // 아이템 이름
        this.itemNameText = this.scene.add.text(
            0,
            -25,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff',
                align: 'center'
            }
        );
        this.itemNameText.setOrigin(0.5, 0.5);

        // 아이템 설명
        this.itemDescText = this.scene.add.text(
            0,
            5,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#cccccc',
                align: 'center',
                wordWrap: { width: 160 }
            }
        );
        this.itemDescText.setOrigin(0.5, 0);

        // 패널에 요소 추가
        this.infoPanel.add(this.infoPanelBg);
        this.infoPanel.add(this.itemNameText);
        this.infoPanel.add(this.itemDescText);

        // 초기에 숨김
        this.infoPanel.visible = false;
    }

    setupEventHandlers() {
        // 배경 클릭 처리
        this.background.setInteractive();

        // 키보드 핫키 (I 키로 인벤토리 열기/닫기)
        this.scene.input.keyboard.on('keydown-I', () => {
            this.toggleVisibility();
        });
    }

    loadItems() {
        // 게임 매니저에서 아이템 로드
        const gameManager = this.scene.scene.get('BootScene').gameManager;
        if (gameManager) {
            this.items = gameManager.getInventory();
            this.updateSlots();
        }
    }

    updateSlots() {
        // 아이템 슬롯 업데이트
        const startIndex = this.scrollPosition;
        const endIndex = Math.min(startIndex + this.maxVisibleItems, this.items.length);

        // 모든 슬롯 초기화
        this.itemSlots.forEach(({ slot, icon }) => {
            slot.itemData = null;
            icon.setVisible(false);
            slot.setFillStyle(0x666666, 0.8);
            slot.setStrokeStyle(2, 0xffffff);
        });

        // 아이템 표시
        for (let i = startIndex, slotIdx = 0; i < endIndex; i++, slotIdx++) {
            const item = this.items[i];
            const { slot, icon } = this.itemSlots[slotIdx];

            // 아이템 데이터 설정
            slot.itemData = item;

            // 아이콘 설정
            icon.setTexture(item.icon || item.key);
            icon.setPosition(slot.x, slot.y);
            icon.setVisible(true);

            // 선택된 아이템 표시
            if (this.selectedItem && this.selectedItem.id === item.id) {
                slot.setFillStyle(0x886644, 0.9);
                slot.setStrokeStyle(3, 0xffff00);
            }
        }

        // 스크롤 버튼 상태 업데이트
        this.updateScrollButtons();
    }

    updateScrollButtons() {
        // 스크롤 버튼 활성화/비활성화
        this.leftButton.setAlpha(this.scrollPosition > 0 ? 1 : 0.5);
        this.rightButton.setAlpha(
            this.scrollPosition + this.maxVisibleItems < this.items.length ? 1 : 0.5
        );
    }

    scrollLeft() {
        // 왼쪽으로 스크롤
        if (this.scrollPosition > 0) {
            this.scrollPosition -= this.maxVisibleItems;
            if (this.scrollPosition < 0) this.scrollPosition = 0;
            this.updateSlots();
        }
    }

    scrollRight() {
        // 오른쪽으로 스크롤
        if (this.scrollPosition + this.maxVisibleItems < this.items.length) {
            this.scrollPosition += this.maxVisibleItems;
            this.updateSlots();
        }
    }

    selectItem(slot) {
        // 아이템 선택
        const itemData = slot.itemData;
        if (!itemData) return;

        // 이미 선택된 아이템이면 선택 해제
        if (this.selectedItem && this.selectedItem.id === itemData.id) {
            this.deselectItem();
            return;
        }

        // 새 아이템 선택
        this.selectedItem = itemData;
        this.updateSlots();

        // 아이템 사용 UI 활성화
        this.showItemActions(itemData);

        // 커서 변경 (선택적)
        document.body.style.cursor = 'url(' + itemData.cursor + '), pointer';

        console.log(`아이템 선택됨: ${itemData.name}`);
    }

    deselectItem() {
        // 아이템 선택 해제
        this.selectedItem = null;
        this.updateSlots();

        // 아이템 사용 UI 숨김
        this.hideItemActions();

        // 커서 복원
        document.body.style.cursor = 'default';
    }

    showItemActions(itemData) {
        // 아이템 사용 UI 표시 (검사, 사용, 조합 등)
        // 필요에 따라 구현
    }

    hideItemActions() {
        // 아이템 사용 UI 숨김
    }

    showItemTooltip(itemData) {
        // 아이템 툴팁 표시
        this.itemNameText.setText(itemData.name);
        this.itemDescText.setText(itemData.description);
        this.infoPanel.visible = true;
    }

    hideItemTooltip() {
        // 아이템 툴팁 숨김
        this.infoPanel.visible = false;
    }

    toggleVisibility() {
        // 인벤토리 표시/숨김 전환
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        // 인벤토리 표시
        this.visible = true;
        this.background.visible = true;
        this.slotsContainer.visible = true;
        this.leftButton.visible = true;
        this.rightButton.visible = true;

        // 애니메이션 (선택적)
        this.scene.tweens.add({
            targets: [this.background, this.slotsContainer, this.leftButton, this.rightButton],
            y: (target) => {
                if (target === this.background) return this.scene.cameras.main.height - 60;
                if (target === this.slotsContainer) return this.scene.cameras.main.height - 60;
                return this.scene.cameras.main.height - 60;
            },
            duration: 300,
            ease: 'Back.easeOut'
        });

        // 아이템 업데이트
        this.loadItems();
    }

    hide() {
        // 인벤토리 숨김
        this.visible = false;
        this.background.visible = false;
        this.slotsContainer.visible = false;
        this.leftButton.visible = false;
        this.rightButton.visible = false;
        this.infoPanel.visible = false;

        // 선택된 아이템 정보
        this.deselectItem();
    }

    addItem(itemData) {
        // 인벤토리에 아이템 추가
        if (!this.items.some(item => item.id === itemData.id)) {
            this.items.push(itemData);
            this.updateSlots();

            // 획득 알림 표시 (선택적)
            this.showItemAcquiredNotification(itemData);

            return true;
        }
        return false;
    }

    removeItem(itemId) {
        // 인벤토리에서 아이템 제거
        const index = this.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            const itemData = this.items[index];
            this.items.splice(index, 1);

            // 선택된 아이템이었다면 선택 해제
            if (this.selectedItem && this.selectedItem.id === itemId) {
                this.deselectItem();
            }

            this.updateSlots();
            return itemData;
        }
        return null;
    }

    showItemAcquiredNotification(itemData) {
        // 아이템 획득 알림 표시
        const width = this.scene.cameras.main.width;

        const notif = this.scene.add.container(width / 2, 100);
        notif.setDepth(200);

        // 배경
        const bg = this.scene.add.rectangle(0, 0, 300, 60, 0x333333, 0.9);
        bg.setStrokeStyle(2, 0xffcc00);

        // 아이콘
        const icon = this.scene.add.image(-120, 0, itemData.icon || itemData.key);
        icon.setScale(0.8);

        // 텍스트
        const text = this.scene.add.text(
            -80,
            0,
            `획득: ${itemData.name}`,
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff'
            }
        );
        text.setOrigin(0, 0.5);

        // 컨테이너에 추가
        notif.add(bg);
        notif.add(icon);
        notif.add(text);

        // 알림 애니메이션
        notif.y = -50;
        this.scene.tweens.add({
            targets: notif,
            y: 80,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(2000, () => {
                    this.scene.tweens.add({
                        targets: notif,
                        y: -50,
                        alpha: 0,
                        duration: 500,
                        ease: 'Back.easeIn',
                        onComplete: () => {
                            notif.destroy();
                        }
                    });
                });
            }
        });
    }

    isTouched(pointer) {
        // 포인터가 인벤토리 영역에 있는지 확인
        return (
            this.visible &&
            this.background.getBounds().contains(pointer.x, pointer.y)
        );
    }

    handleDrag(deltaX) {
        // 드래그로 인벤토리 스크롤
        if (deltaX > 50) {
            this.scrollLeft();
        } else if (deltaX < -50) {
            this.scrollRight();
        }
    }

    getSelectedItem() {
        // 현재 선택된 아이템 반환
        return this.selectedItem;
    }

    hasItem(itemId) {
        // 특정 아이템을 가지고 있는지 확인
        return this.items.some(item => item.id === itemId);
    }

    destroy() {
        // 리소스 정리
        this.background.destroy();
        this.itemSlots.forEach(({ slot, icon }) => {
            slot.destroy();
            icon.destroy();
        });
        this.slotsContainer.destroy();
        this.leftButton.destroy();
        this.rightButton.destroy();
        this.infoPanel.destroy();
    }
}