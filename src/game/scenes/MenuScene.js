import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        console.log('MenuScene: 메뉴 생성');

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

        // 제목
        this.add.image(width / 2, height / 4, 'logo');

        // 시작 버튼
        const startButton = this.add.image(width / 2, height / 2, 'button_normal')
            .setInteractive();

        const startText = this.add.text(width / 2, height / 2, '게임 시작', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 버튼 이벤트
        startButton.on('pointerover', () => {
            startButton.setTexture('button_hover');
        });

        startButton.on('pointerout', () => {
            startButton.setTexture('button_normal');
        });

        startButton.on('pointerdown', () => {
            // 클릭 사운드 (오디오 파일이 존재하는 경우)
            try {
                if (!this.sound.get('click_sound')) {
                    this.sound.add('click_sound', {loop: false});
                }
            } catch (e) {
                console.log('사운드 파일이 없습니다');
            }

            // 게임 씬 시작
            this.scene.start('GameScene', { sceneKey: 'room1' });
        });

        // 설정 버튼
        const settingsButton = this.add.image(width / 2, height / 2 + 80, 'button_normal')
            .setInteractive();

        const settingsText = this.add.text(width / 2, height / 2 + 80, '설정', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 버튼 이벤트
        settingsButton.on('pointerover', () => {
            settingsButton.setTexture('button_hover');
        });

        settingsButton.on('pointerout', () => {
            settingsButton.setTexture('button_normal');
        });

        // 크레딧 버튼
        const creditsButton = this.add.image(width / 2, height / 2 + 160, 'button_normal')
            .setInteractive();

        const creditsText = this.add.text(width / 2, height / 2 + 160, '크레딧', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 버튼 이벤트
        creditsButton.on('pointerover', () => {
            creditsButton.setTexture('button_hover');
        });

        creditsButton.on('pointerout', () => {
            creditsButton.setTexture('button_normal');
        });
    }
}