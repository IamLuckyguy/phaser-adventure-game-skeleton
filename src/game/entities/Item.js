// src/game/entities/Item.js
import {IS_DEV, ITEM_TYPES} from '../config/constants';

export default class Item {
    constructor(scene, config) {
        this.scene = scene;
        this.id = config.id || config.name;
        this.name = config.name || 'Item';
        this.x = config.x;
        this.y = config.y;
        this.type = config.type || ITEM_TYPES.MISC;
        this.description = config.description || `A ${this.name.toLowerCase()}`;
        this.pickupMessage = config.pickupMessage || `${this.name}을(를) 획득했습니다.`;
        this.icon = config.icon || config.key;
        this.useWith = config.useWith || [];
        this.usable = config.usable !== false;
        this.examinable = config.examinable !== false;
        this.combinable = config.combinable !== false;
        this.cursor = config.cursor || 'pointer';

        // 아이템 스프라이트 생성
        this.createSprite(config);

        // 아이템 관련 이벤트 및 액션 설정
        this.setupInteractions();
    }

    createSprite(config) {
        // 아이템 스프라이트 생성
        this.gameObject = this.scene.add.image(this.x, this.y, this.icon || config.key);
        this.gameObject.setDepth(5);

        // 히트 영역
        const hitAreaWidth = config.width || this.gameObject.width;
        const hitAreaHeight = config.height || this.gameObject.height;

        this.gameObject.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(
                -hitAreaWidth / 2,
                -hitAreaHeight / 2,
                hitAreaWidth,
                hitAreaHeight
            ),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains
        });

        // 아이템 강조 효과 (깜빡임, 빛 등)
        if (config.highlight) {
            this.addHighlightEffect();
        }

        // 디버그 모드에서 히트 영역 표시
        if (IS_DEV) {
            this.hitAreaDebug = this.scene.add.rectangle(
                this.x,
                this.y,
                hitAreaWidth,
                hitAreaHeight,
                0xff0000,
                0.3
            );
        }
    }

    addHighlightEffect() {
        // 아이템 강조 효과 (깜빡임)
        this.scene.tweens.add({
            targets: this.gameObject,
            alpha: { from: 1, to: 0.7 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // 또는 빛나는 효과 (파티클)
        if (this.scene.add.particles) {
            this.particles = this.scene.add.particles(this.x, this.y, 'particle', {
                lifespan: 2000,
                scale: { start: 0.1, end: 0 },
                speed: { min: 10, max: 30 },
                quantity: 1,
                frequency: 500,
                alpha: { start: 0.5, end: 0 },
                tint: 0xffffaa
            });
            this.particles.setDepth(4);
        }
    }

    setupInteractions() {
        // 아이템 클릭 이벤트
        this.gameObject.on('pointerover', () => {
            document.body.style.cursor = 'pointer';
            this.onHover();
        });

        this.gameObject.on('pointerout', () => {
            document.body.style.cursor = 'default';
            this.onHoverEnd();
        });
    }

    onHover() {
        // 마우스 오버 시 효과
        this.scene.tweens.add({
            targets: this.gameObject,
            scale: 1.1,
            duration: 200
        });

        // 아이템 이름 툴팁 표시 (선택적)
        this.showNameTooltip();
    }

    onHoverEnd() {
        // 마우스 아웃 시 효과
        this.scene.tweens.add({
            targets: this.gameObject,
            scale: 1,
            duration: 200
        });

        // 툴팁 숨김
        this.hideNameTooltip();
    }

    showNameTooltip() {
        // 아이템 이름 툴팁 표시
        if (this.nameTooltip) return;

        this.nameTooltip = this.scene.add.text(
            this.x,
            this.y - this.gameObject.height / 2 - 20,
            this.name,
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 5, y: 3 }
            }
        );
        this.nameTooltip.setOrigin(0.5);
        this.nameTooltip.setDepth(50);

        // 페이드 인 효과
        this.nameTooltip.alpha = 0;
        this.scene.tweens.add({
            targets: this.nameTooltip,
            alpha: 1,
            duration: 200
        });
    }

    hideNameTooltip() {
        // 툴팁 숨김
        if (!this.nameTooltip) return;

        this.scene.tweens.add({
            targets: this.nameTooltip,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                if (this.nameTooltip) {
                    this.nameTooltip.destroy();
                    this.nameTooltip = null;
                }
            }
        });
    }

    containsPoint(x, y) {
        // 특정 좌표가 아이템 히트 영역 내에 있는지 확인
        const bounds = this.gameObject.getBounds();
        return bounds.contains(x, y);
    }

    getItemData() {
        // 인벤토리 시스템에서 사용할 아이템 데이터 반환
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            description: this.description,
            icon: this.icon,
            usable: this.usable,
            examinable: this.examinable,
            combinable: this.combinable,
            useWith: this.useWith,
            cursor: this.cursor
        };
    }

    getDescription() {
        // 아이템 설명 반환
        return this.description;
    }

    playPickupAnimation(onComplete) {
        // 아이템 획득 애니메이션
        this.scene.tweens.add({
            targets: this.gameObject,
            y: this.y - 50,
            alpha: 0,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => {
                // 파티클 효과 종료
                if (this.particles) {
                    this.particles.destroy();
                }

                // 완료 콜백
                if (onComplete) onComplete();
            }
        });
    }

    use(target) {
        // 아이템 사용 (타겟이 있는 경우)
        if (!this.usable) return false;

        console.log(`아이템 사용: ${this.name}`);

        // 사용 로직 구현
        return true;
    }

    canCombineWith(itemId) {
        // 다른 아이템과 조합 가능한지 확인
        return this.combinable && this.useWith.includes(itemId);
    }

    setPosition(x, y) {
        // 아이템 위치 설정
        this.x = x;
        this.y = y;
        this.gameObject.x = x;
        this.gameObject.y = y;

        if (this.hitAreaDebug) {
            this.hitAreaDebug.x = x;
            this.hitAreaDebug.y = y;
        }

        if (this.particles) {
            this.particles.x = x;
            this.particles.y = y;
        }
    }

    hide() {
        // 아이템 숨김
        this.gameObject.visible = false;

        if (this.hitAreaDebug) {
            this.hitAreaDebug.visible = false;
        }

        if (this.particles) {
            this.particles.visible = false;
        }
    }

    show() {
        // 아이템 표시
        this.gameObject.visible = true;

        if (this.hitAreaDebug) {
            this.hitAreaDebug.visible = IS_DEV;
        }

        if (this.particles) {
            this.particles.visible = true;
        }
    }

    destroy() {
        // 리소스 정리
        if (this.nameTooltip) {
            this.nameTooltip.destroy();
            this.nameTooltip = null;
        }

        if (this.particles) {
            this.particles.destroy();
            this.particles = null;
        }

        if (this.hitAreaDebug) {
            this.hitAreaDebug.destroy();
            this.hitAreaDebug = null;
        }

        this.gameObject.destroy();
    }
}