import Phaser from 'phaser';
import GameManager from '../core/GameManager';

export class BootScene extends Phaser.Scene {
    gameManager = null;

    constructor() {
        super('BootScene');
    }

    preload() {
        // 로딩 화면에 필요한 에셋 로드
        this.load.image('logo', '/assets/images/ui/logo.png');
        this.load.image('loading_bar', '/assets/images/ui/loading_bar.png');

        // 게임 데이터 경로 로드
        this.load.json('asset_manifest', '/assets/manifest.json');
    }

    async create() {
        console.log('BootScene: 게임 매니저 초기화');

        // 게임 매니저 초기화
        this.gameManager = new GameManager();
        await this.gameManager.init();

        // 프리로드 씬으로 전환
        this.scene.start('PreloadScene');
    }
}