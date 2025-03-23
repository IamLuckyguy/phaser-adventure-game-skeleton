// src/game/scenes/SettingsScene.js
import Phaser from 'phaser';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }

    create() {
        console.log('SettingsScene: 설정 화면 생성');

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x222222).setOrigin(0);

        // 제목
        this.add.text(width / 2, 100, '설정', {
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 돌아가기 버튼
        const backButton = this.add.image(width / 2, height - 100, 'button_normal')
            .setInteractive();

        this.add.text(width / 2, height - 100, '돌아가기', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}