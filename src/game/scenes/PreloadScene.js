import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        console.log('PreloadScene: 에셋 로딩 시작');

        // 로딩 화면 생성
        this.createLoadingBar();

        // 매니페스트에서 에셋 목록 가져오기
        const manifest = this.cache.json.get('asset_manifest');

        if (!manifest) {
            console.error('에셋 매니페스트를 찾을 수 없습니다');
            return;
        }

        // 이미지 로드
        manifest.images?.forEach((image) => {
            this.load.image(image.key, image.path);
        });

        // 오디오 로드
        // manifest.audio?.forEach((audio) => {
        //     this.load.audio(audio.key, audio.path);
        // });

        // 스프라이트시트 로드
        manifest.spritesheets?.forEach((spritesheet) => {
            this.load.spritesheet(spritesheet.key, spritesheet.path, {
                frameWidth: spritesheet.frameWidth,
                frameHeight: spritesheet.frameHeight
            });
        });

        // 씬 데이터 로드
        manifest.scenes?.forEach((scene) => {
            this.load.json(scene.key, scene.path);
        });

        // 게임 데이터 로드
        this.load.json('game-data', '/assets/data/game-data.json');
    }

    create() {
        console.log('PreloadScene: 에셋 로딩 완료');

        // 애니메이션 정의
        this.createAnimations();

        // 메인 메뉴로 전환
        this.scene.start('MenuScene');
    }

    createLoadingBar() {
        // 로딩 바 구현
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const logo = this.add.image(width / 2, height / 2 - 100, 'logo');

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 20, '로딩 중...', {
            fontSize: '20px',
            color: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);

        // 로딩 진행 상태 업데이트
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    createAnimations() {
        // 플레이어 텍스처 키가 변경되었으므로 수정
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNumbers('player_sprite', { start: 0, end: 0 }), // 키 이름 수정
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'player_walk',
            frames: this.anims.generateFrameNumbers('player_sprite', { start: 0, end: 0 }), // 키 이름 수정
            frameRate: 10,
            repeat: -1
        });
    }
}