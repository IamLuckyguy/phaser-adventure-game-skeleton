// src/game/scenes/CreditsScene.js
import Phaser from 'phaser';

export class CreditsScene extends Phaser.Scene {
    constructor() {
        super('CreditsScene');
    }

    create() {
        console.log('CreditsScene: 크레딧 화면 생성');

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x222222).setOrigin(0);

        // 제목
        this.add.text(width / 2, 100, '크레딧', {
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 크레딧 정보
        this.add.text(width / 2, height / 2, '개발: 당신\n디자인: 당신\n음악: 당신', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
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