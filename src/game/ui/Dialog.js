// src/game/ui/Dialog.js

export default class Dialog {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.currentConversation = null;
        this.currentConversationIndex = 0;

        // UI 요소 생성
        this.createUI();

        // 이벤트 핸들러 설정
        this.setupEventHandlers();
    }

    createUI() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // 대화창 배경
        this.background = this.scene.add.rectangle(
            width / 2,
            height - 100,
            width - 100,
            120,
            0x000000,
            0.8
        );
        this.background.setOrigin(0.5);
        this.background.setDepth(100);
        this.background.setStrokeStyle(2, 0xffffff);

        // 대화 텍스트
        this.text = this.scene.add.text(
            width / 2,
            height - 100,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: width - 150 }
            }
        );
        this.text.setOrigin(0.5);
        this.text.setDepth(101);

        // 이름 표시 (선택적)
        this.nameText = this.scene.add.text(
            this.background.x - (this.background.width / 2) + 20,
            this.background.y - (this.background.height / 2) - 15,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffff00',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            }
        );
        this.nameText.setDepth(101);

        // 계속 버튼 (또는 아이콘)
        this.continueIcon = this.scene.add.text(
            width / 2 + (this.background.width / 2) - 30,
            height - 50,
            '▼',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }
        );
        this.continueIcon.setOrigin(0.5);
        this.continueIcon.setDepth(101);

        // 애니메이션 (깜빡임)
        this.scene.tweens.add({
            targets: this.continueIcon,
            alpha: { from: 1, to: 0.2 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // 선택지 컨테이너 (선택지가 있는 대화용)
        this.choicesContainer = this.scene.add.container(width / 2, height - 180);
        this.choicesContainer.setDepth(101);
        this.choices = [];

        // 모든 요소 초기에 숨김
        this.hide();
    }

    setupEventHandlers() {
        // 대화창 클릭하면 다음으로 진행
        this.background.setInteractive();
        this.background.on('pointerdown', () => {
            this.next();
        });

        // 계속 아이콘 클릭
        this.continueIcon.setInteractive();
        this.continueIcon.on('pointerdown', () => {
            this.next();
        });
    }

    show(text, options = {}) {
        const { speaker, onComplete, autoClose, duration } = options;

        // 대화창 표시
        this.isActive = true;
        this.background.visible = true;
        this.text.visible = true;
        this.continueIcon.visible = !autoClose;

        // 텍스트 설정
        this.text.setText(text);

        // 화자 이름 설정 (있는 경우)
        if (speaker) {
            this.nameText.setText(speaker);
            this.nameText.visible = true;
        } else {
            this.nameText.visible = false;
        }

        // 자동 닫기 설정
        if (autoClose) {
            this.scene.time.delayedCall(duration || 3000, () => {
                this.hide();
                if (onComplete) onComplete();
            });
        } else {
            this.onCompleteCallback = onComplete;
        }

        // 화면 하단으로 슬라이드 애니메이션 (선택적)
        this.background.y = this.scene.cameras.main.height + 50;
        this.text.y = this.scene.cameras.main.height + 50;
        this.continueIcon.y = this.scene.cameras.main.height + 100;

        this.scene.tweens.add({
            targets: [this.background, this.text, this.nameText],
            y: (target) => {
                if (target === this.background) return this.scene.cameras.main.height - 100;
                if (target === this.text) return this.scene.cameras.main.height - 100;
                if (target === this.nameText) return this.background.y - (this.background.height / 2) - 15;
                return 0;
            },
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.scene.tweens.add({
            targets: this.continueIcon,
            y: this.scene.cameras.main.height - 50,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // 게임 상태 변경 (선택적)
        // this.scene.gameState = GAME_STATES.DIALOG;

        return this;
    }

    showConversation(conversation) {
        // 여러 단계 대화 시작
        this.currentConversation = conversation;
        this.currentConversationIndex = 0;

        // 첫 번째 대화 표시
        this.showCurrentConversation();

        return this;
    }

    showCurrentConversation() {
        if (!this.currentConversation || this.currentConversationIndex >= this.currentConversation.length) {
            this.endConversation();
            return;
        }

        const current = this.currentConversation[this.currentConversationIndex];

        if (current.choices) {
            // 선택지가 있는 대화
            this.showWithChoices(current.text, current.speaker, current.choices);
        } else {
            // 일반 대화
            this.show(current.text, {
                speaker: current.speaker,
                onComplete: current.onComplete
            });
        }
    }

    showWithChoices(text, speaker, choices) {
        // 선택지 있는 대화 표시
        this.show(text, { speaker });

        // 선택지 생성
        this.createChoices(choices);

        return this;
    }

    createChoices(choices) {
        // 기존 선택지 제거
        this.clearChoices();

        // 새 선택지 추가
        choices.forEach((choice, index) => {
            const choiceText = this.scene.add.text(
                0,
                index * 40,
                choice.text,
                {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: '#ffffff',
                    backgroundColor: '#444444',
                    padding: { x: 15, y: 8 }
                }
            );
            choiceText.setOrigin(0.5, 0);
            choiceText.setInteractive({ useHandCursor: true });

            // 호버 효과
            choiceText.on('pointerover', () => {
                choiceText.setStyle({ backgroundColor: '#666666' });
            });

            choiceText.on('pointerout', () => {
                choiceText.setStyle({ backgroundColor: '#444444' });
            });

            // 클릭 이벤트
            choiceText.on('pointerdown', () => {
                this.handleChoice(choice);
            });

            this.choices.push(choiceText);
            this.choicesContainer.add(choiceText);
        });

        // 선택지 컨테이너 표시
        this.choicesContainer.visible = true;

        // 선택지 컨테이너 위치 조정
        this.choicesContainer.y = this.background.y - this.background.height - 20;
    }

    handleChoice(choice) {
        // 선택지 클릭 처리
        this.clearChoices();

        // 선택에 따른 액션 실행
        if (choice.action) {
            // 선택지 액션이 있으면 실행
            if (typeof choice.action === 'function') {
                choice.action(this.scene);
            } else if (choice.action.type) {
                // 핫스팟 액션과 유사한 형식
                const hotspot = this.scene.getHotspotAt(this.scene.player.x, this.scene.player.y);
                if (hotspot) {
                    hotspot.executeAction(choice.action, this.scene);
                }
            }
        }

        // 다음 대화로 진행
        if (choice.next !== undefined) {
            if (typeof choice.next === 'number') {
                // 특정 인덱스로 이동
                this.currentConversationIndex = choice.next;
                this.showCurrentConversation();
            } else if (Array.isArray(choice.next)) {
                // 새 대화 시퀀스로 변경
                this.currentConversation = choice.next;
                this.currentConversationIndex = 0;
                this.showCurrentConversation();
            } else {
                // 기본적으로 대화 종료
                this.endConversation();
            }
        } else {
            // 기본적으로 다음 대화로 진행
            this.currentConversationIndex++;
            this.showCurrentConversation();
        }
    }

    clearChoices() {
        // 선택지 제거
        this.choices.forEach(choice => choice.destroy());
        this.choices = [];
        this.choicesContainer.removeAll(true);
        this.choicesContainer.visible = false;
    }

    next() {
        // 다음 대화로 진행
        if (!this.isActive) return;

        if (this.currentConversation) {
            // 대화 시퀀스가 있는 경우
            this.currentConversationIndex++;
            this.showCurrentConversation();
        } else {
            // 단일 대화인 경우
            this.hide();
            if (this.onCompleteCallback) {
                const callback = this.onCompleteCallback;
                this.onCompleteCallback = null;
                callback();
            }
        }
    }

    endConversation() {
        // 대화 시퀀스 종료
        this.currentConversation = null;
        this.currentConversationIndex = 0;
        this.hide();

        // 게임 상태 복원 (선택적)
        // this.scene.gameState = GAME_STATES.EXPLORING;
    }

    hide() {
        // 대화창 숨기기
        this.isActive = false;
        this.background.visible = false;
        this.text.visible = false;
        this.nameText.visible = false;
        this.continueIcon.visible = false;
        this.clearChoices();
    }

    isVisible() {
        // 대화창이 표시 중인지 확인
        return this.isActive;
    }

    getElement(elementName) {
        // 특정 UI 요소 반환
        switch (elementName) {
            case 'background': return this.background;
            case 'text': return this.text;
            case 'nameText': return this.nameText;
            case 'continueIcon': return this.continueIcon;
            case 'choicesContainer': return this.choicesContainer;
            default: return null;
        }
    }

    destroy() {
        // 리소스 정리
        this.background.destroy();
        this.text.destroy();
        this.nameText.destroy();
        this.continueIcon.destroy();
        this.clearChoices();
        this.choicesContainer.destroy();
    }
}