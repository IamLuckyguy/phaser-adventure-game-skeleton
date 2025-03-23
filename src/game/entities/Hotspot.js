// src/game/entities/Hotspot.js
import {HOTSPOT_TYPES, IS_DEV} from '../config/constants';

export default class Hotspot {
    constructor(scene, config) {
        this.scene = scene;
        this.id = config.id || config.name;
        this.name = config.name || 'hotspot';
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 50;
        this.height = config.height || 50;
        this.type = config.type || HOTSPOT_TYPES.DEFAULT;
        this.enabled = config.enabled !== false;
        this.visible = config.visible !== false;
        this.description = config.description || `${this.name}`;
        this.interactionPoint = config.interactionPoint || { x: this.x + this.width / 2, y: this.y + this.height };
        this.reachDistance = config.reachDistance || 50;
        this.actions = config.actions || config.action || {};

        // 필요한 아이템 목록
        this.requiredItems = config.requiredItems ||
            (config.action && config.action.type === 'requireItem' ? [config.action.item] : []);

        // 시각적 요소 생성
        this.createVisual(config);

        // 이벤트 핸들러 설정
        this.setupEventHandlers();
    }

    createVisual(config) {
        // 히트 영역 (개발 모드에서만 표시)
        this.hitArea = this.scene.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            0xffffff,
            IS_DEV ? 0.1 : 0
        ).setOrigin(0, 0);

        // 핫스팟 아이콘이 있으면 표시 (선택적)
        if (config.icon) {
            this.icon = this.scene.add.image(
                this.x + this.width / 2,
                this.y + this.height / 2,
                config.icon
            );

            // 아이콘 깜빡임 애니메이션 (선택적)
            if (config.blinkIcon) {
                this.scene.tweens.add({
                    targets: this.icon,
                    alpha: { from: 1, to: 0.5 },
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
            }
        }

        // 상호작용 가능 표시 (마우스 오버)
        this.hitArea.setInteractive();
    }

    setupEventHandlers() {
        // 마우스 오버/아웃 이벤트
        this.hitArea.on('pointerover', () => {
            if (this.enabled && this.visible) {
                this.onPointerOver();
            }
        });

        this.hitArea.on('pointerout', () => {
            if (this.enabled && this.visible) {
                this.onPointerOut();
            }
        });
    }

    onPointerOver() {
        // 마우스 오버 시 커서 변경 또는 강조 효과
        document.body.style.cursor = 'pointer';

        // 개발 모드에서 히트 영역 강조
        if (IS_DEV) {
            this.hitArea.setStrokeStyle(2, 0xff0000);
        }

        // 아이콘이 있으면 강조
        if (this.icon) {
            this.scene.tweens.add({
                targets: this.icon,
                scale: 1.1,
                duration: 200
            });
        }
    }

    onPointerOut() {
        // 마우스 아웃 시 원래 상태로 복원
        document.body.style.cursor = 'default';

        // 개발 모드에서 히트 영역 복원
        if (IS_DEV) {
            this.hitArea.setStrokeStyle(0);
        }

        // 아이콘이 있으면 원래 크기로
        if (this.icon) {
            this.scene.tweens.add({
                targets: this.icon,
                scale: 1,
                duration: 200
            });
        }
    }

    interact(gameScene) {
        console.log(`Hotspot ${this.id} interaction started`);
        if (!this.enabled) return;

        // 상호작용 처리
        console.log(`핫스팟 상호작용: ${this.name}`);

        const action = this.getAction();
        if (!action) return;

        this.executeAction(action, gameScene);
    }

    doubleInteract(gameScene) {
        // 더블 클릭/탭 상호작용 (기본적으로 일반 상호작용과 동일)
        this.interact(gameScene);
    }

    examine(gameScene) {
        // 핫스팟 검사 (상세 정보 표시)
        gameScene.dialog.show(this.description);
    }

    useItem(itemId, gameScene) {
        // 아이템 사용 처리
        const item = gameScene.scene.get('BootScene').gameManager.getItemData(itemId);
        if (!item) return;

        console.log(`아이템 사용: ${item.name} on ${this.name}`);

        // 아이템 사용 액션 실행
        const itemAction = this.getItemAction(itemId);
        if (itemAction) {
            this.executeAction(itemAction, gameScene);
        } else {
            // 기본 메시지
            gameScene.dialog.show(`${item.name}을(를) 여기에 사용할 수 없습니다.`);
        }
    }

    getAction() {
        // 기본 액션 반환
        if (typeof this.actions === 'object' && !Array.isArray(this.actions)) {
            return this.actions;
        } else if (Array.isArray(this.actions) && this.actions.length > 0) {
            return this.actions[0];
        }
        return null;
    }

    getItemAction(itemId) {
        // 특정 아이템에 대한 액션 반환
        if (typeof this.actions === 'object' && this.actions.itemActions) {
            return this.actions.itemActions[itemId];
        }
        return null;
    }

    executeAction(action, gameScene) {
        if (!action || !action.type) return;

        switch (action.type) {
            case 'dialog':
                // 대화 표시
                gameScene.dialog.show(action.text);
                break;

            case 'conversation':
                // 여러 단계 대화 표시
                gameScene.dialog.showConversation(action.conversation);
                break;

            case 'changeScene':
                // 씬 전환
                gameScene.changeScene(action.targetScene);
                break;

            case 'giveItem':
                // 아이템 지급
                gameScene.giveItem(action.itemId);
                break;

            case 'requireItem':
                // 아이템이 필요한 액션
                this.handleRequireItemAction(action, gameScene);
                break;

            case 'toggleObject':
                // 상태 전환 (문 열기/닫기 등)
                this.toggleState(action, gameScene);
                break;

            case 'playAnimation':
                // 애니메이션 재생
                this.playAnimation(action, gameScene);
                break;

            case 'custom':
                // 커스텀 액션 실행
                if (action.handler && typeof action.handler === 'function') {
                    action.handler(this, gameScene);
                }
                break;

            default:
                console.warn(`알 수 없는 액션 타입: ${action.type}`);
        }

        // 액션 실행 후 이벤트
        if (action.onComplete) {
            if (typeof action.onComplete === 'function') {
                action.onComplete(this, gameScene);
            } else if (action.onComplete.type) {
                this.executeAction(action.onComplete, gameScene);
            }
        }
    }

    handleRequireItemAction(action, gameScene) {
        const gameManager = gameScene.scene.get('BootScene').gameManager;

        if (gameManager.hasItem(action.item)) {
            // 아이템이 있으면 성공 액션 실행
            if (action.consumeItem) {
                gameManager.removeItem(action.item);
            }

            if (action.successAction) {
                this.executeAction(action.successAction, gameScene);
            } else if (action.successText) {
                gameScene.dialog.show(action.successText);
            }
        } else {
            // 아이템이 없으면 힌트 표시
            gameScene.dialog.show(action.hintText || "무언가 필요한 것 같습니다.");
        }
    }

    toggleState(action, gameScene) {
        // 상태 전환 (문 열기/닫기, 스위치 켜기/끄기 등)
        const gameManager = gameScene.scene.get('BootScene').gameManager;
        const stateFlagName = `${this.id}_state`;
        const currentState = gameManager.getFlag(stateFlagName);

        // 상태 토글
        gameManager.setFlag(stateFlagName, !currentState);

        // 시각적 변화
        if (this.icon) {
            if (action.toggleTexture) {
                this.icon.setTexture(currentState ? action.defaultTexture : action.toggleTexture);
            }
        }

        // 효과음
        if (action.sound) {
            gameScene.sound.play(action.sound);
        }

        // 상태 전환 메시지
        if (action.stateTexts) {
            const message = currentState ? action.stateTexts[0] : action.stateTexts[1];
            gameScene.dialog.show(message);
        }
    }

    playAnimation(action, gameScene) {
        // 애니메이션 재생
        if (action.target === 'this' && this.icon) {
            // 핫스팟 자체 애니메이션
            gameScene.tweens.add({
                targets: this.icon,
                ...action.props,
                duration: action.duration || 1000,
                ease: action.ease || 'Power2',
                yoyo: action.yoyo,
                repeat: action.repeat || 0,
                onComplete: () => {
                    if (action.onAnimComplete) {
                        this.executeAction(action.onAnimComplete, gameScene);
                    }
                }
            });
        } else if (action.targetSprite) {
            // 다른 스프라이트 애니메이션
            const sprite = gameScene[action.targetSprite] || gameScene.children.getByName(action.targetSprite);
            if (sprite) {
                if (action.animationKey) {
                    sprite.play(action.animationKey);
                } else {
                    gameScene.tweens.add({
                        targets: sprite,
                        ...action.props,
                        duration: action.duration || 1000,
                        ease: action.ease || 'Power2',
                        yoyo: action.yoyo,
                        repeat: action.repeat || 0,
                        onComplete: () => {
                            if (action.onAnimComplete) {
                                this.executeAction(action.onAnimComplete, gameScene);
                            }
                        }
                    });
                }
            }
        }
    }

    enable() {
        this.enabled = true;
        if (this.icon) this.icon.alpha = 1;
    }

    disable() {
        this.enabled = false;
        if (this.icon) this.icon.alpha = 0.5;
    }

    show() {
        this.visible = true;
        if (this.icon) this.icon.visible = true;
        this.hitArea.input.enabled = true;
    }

    hide() {
        this.visible = false;
        if (this.icon) this.icon.visible = false;
        this.hitArea.input.enabled = false;
    }

    isEnabled() {
        return this.enabled;
    }

    isVisible() {
        return this.visible;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;

        this.hitArea.x = x;
        this.hitArea.y = y;

        if (this.icon) {
            this.icon.x = x + this.width / 2;
            this.icon.y = y + this.height / 2;
        }

        // 상호작용 지점 갱신
        this.interactionPoint = { x: this.x + this.width / 2, y: this.y + this.height };
    }

    containsPoint(x, y) {
        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        );
    }

    getInteractionPoint() {
        console.log(`Hotspot ${this.id} interaction point:`, this.interactionPoint);
        // interactionPoint가 정의되지 않은 경우 기본값 제공
        return this.interactionPoint || { x: this.x + this.width / 2, y: this.y + this.height };
    }

    isWithinReach(player) {
        // 플레이어가 핫스팟에 닿을 수 있는지 확인
        // player.sprite 객체의 x,y 또는 player의 getPosition() 메서드 사용
        const playerPos = player.getPosition ? player.getPosition() : player;

        const distance = Phaser.Math.Distance.Between(
            playerPos.x,
            playerPos.y,
            this.interactionPoint.x,
            this.interactionPoint.y
        );

        return distance <= this.reachDistance;
    }

    getDescription() {
        return this.description;
    }

    canUseItem(itemId) {
        // 이 핫스팟에 특정 아이템을 사용할 수 있는지 확인
        if (this.requiredItems.includes(itemId)) return true;

        const itemAction = this.getItemAction(itemId);
        return itemAction !== null;
    }

    destroy() {
        // 리소스 정리
        if (this.hitArea) this.hitArea.destroy();
        if (this.icon) this.icon.destroy();
    }
}