import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
        this.loadingErrors = []; // 로딩 실패한 에셋 추적
    }

    preload() {
        console.log('PreloadScene: 에셋 로딩 시작');

        // 로딩 화면 생성
        this.createLoadingBar();

        // 매니페스트에서 에셋 목록 가져오기
        const manifest = this.cache.json.get('asset_manifest');

        if (!manifest) {
            console.error('에셋 매니페스트를 찾을 수 없습니다');
            // 오류 메시지 표시
            this.showErrorMessage('에셋 매니페스트를 찾을 수 없습니다');
            return;
        }

        // 에셋 로딩 실패 시 이벤트 처리
        this.load.on('loaderror', (fileObj) => {
            console.warn(`에셋 로딩 실패: ${fileObj.key} (${fileObj.url})`);
            this.loadingErrors.push({ key: fileObj.key, url: fileObj.url });

            // 실패해도 게임이 계속 진행되도록 함
            // 중요 에셋이 아닌 경우 게임 진행에 영향 없음
        });

        // 이미지 로드
        if (manifest.images && manifest.images.length > 0) {
            manifest.images.forEach((image) => {
                this.load.image(image.key, image.path);
            });
        }

        // 오디오 로드 (주석 해제)
        if (manifest.audio && manifest.audio.length > 0) {
            manifest.audio.forEach((audio) => {
                this.load.audio(audio.key, audio.path);
            });
        }

        // 스프라이트시트 로드
        if (manifest.spritesheets && manifest.spritesheets.length > 0) {
            manifest.spritesheets.forEach((spritesheet) => {
                this.load.spritesheet(spritesheet.key, spritesheet.path, {
                    frameWidth: spritesheet.frameWidth,
                    frameHeight: spritesheet.frameHeight
                });
            });
        }

        // 씬 데이터 로드
        if (manifest.scenes && manifest.scenes.length > 0) {
            manifest.scenes.forEach((scene) => {
                this.load.json(scene.key, scene.path);
            });
        }

        // 게임 데이터 로드
        this.load.json('game-data', '/assets/data/game-data.json');
    }

    create() {
        console.log('PreloadScene: 에셋 로딩 완료');

        // 로딩 실패한 에셋이 있는지 확인하고 처리
        if (this.loadingErrors.length > 0) {
            console.warn(`${this.loadingErrors.length}개의 에셋 로딩 실패, 대체 에셋으로 진행`);

            // 실패한 이미지에는 placeholder 사용
            this.loadingErrors.forEach(error => {
                // 이미지인 경우 빈 텍스처를 생성
                if (error.url.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
                    this.createPlaceholderTexture(error.key);
                }
                // 사운드인 경우 빈 사운드 생성
                else if (error.url.match(/\.(mp3|ogg|wav)$/i)) {
                    this.createPlaceholderSound(error.key);
                }
            });
        }

        // 애니메이션 정의
        this.createAnimations();

        // 메인 메뉴로 전환
        this.scene.start('MenuScene');
    }

    createLoadingBar() {
        // 로딩 바 구현
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 로고 이미지 추가
        try {
            const logo = this.add.image(width / 2, height / 2 - 100, 'logo');
        } catch (error) {
            console.warn('로고 이미지를 로드할 수 없습니다:', error);
            // 로고 대신 텍스트 표시
            this.add.text(width / 2, height / 2 - 100, '게임 로딩 중...', {
                fontSize: '32px',
                color: '#ffffff'
            }).setOrigin(0.5);
        }

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 20, '로딩 중...', {
            fontSize: '20px',
            color: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.add.text(width / 2, height / 2 + 70, '0%', {
            fontSize: '18px',
            color: '#ffffff'
        });
        percentText.setOrigin(0.5, 0.5);

        // 로딩 진행 상태 업데이트
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
    }

    createAnimations() {
        // 기존 애니메이션이 있으면 정리 (removeAll 대신 개별 삭제)
        const animsToRemove = ['player_idle', 'player_walk', 'player_run'];
        animsToRemove.forEach(key => {
            if (this.anims.exists(key)) {
                this.anims.remove(key);
            }
        });

        // 플레이어 애니메이션 정의
        if (this.textures.exists('player_sprite')) {
            // 대기 애니메이션
            this.anims.create({
                key: 'player_idle',
                frames: this.anims.generateFrameNumbers('player_sprite', { start: 0, end: 3 }),
                frameRate: 5,
                repeat: -1
            });

            // 걷기 애니메이션
            this.anims.create({
                key: 'player_walk',
                frames: this.anims.generateFrameNumbers('player_sprite', { start: 4, end: 11 }),
                frameRate: 10,
                repeat: -1
            });

            // 달리기 애니메이션
            this.anims.create({
                key: 'player_run',
                frames: this.anims.generateFrameNumbers('player_sprite', { start: 12, end: 15 }),
                frameRate: 12,
                repeat: -1
            });
        } else {
            console.warn('player_sprite 텍스처가 로드되지 않았습니다. 애니메이션을 생성할 수 없습니다.');
            // 기본 애니메이션 생성
            this.createPlaceholderAnimations();
        }
    }

    createPlaceholderTexture(key) {
        // 로드 실패한 이미지를 위한 플레이스홀더 생성
        const graphics = this.make.graphics();
        graphics.fillStyle(0xCCCCCC);
        graphics.fillRect(0, 0, 64, 64);
        graphics.lineStyle(2, 0x000000);
        graphics.strokeRect(0, 0, 64, 64);
        graphics.lineTo(64, 64);
        graphics.moveTo(0, 64);
        graphics.lineTo(64, 0);

        graphics.generateTexture(key, 64, 64);
        graphics.destroy();

        console.log(`플레이스홀더 텍스처 생성: ${key}`);
    }

    createPlaceholderSound(key) {
        // 로드 실패한 사운드를 위한 빈 사운드 생성
        this.cache.audio.add(key, { data: new AudioBuffer({ length: 1, sampleRate: 44100 }) });
        console.log(`플레이스홀더 사운드 생성: ${key}`);
    }

    createPlaceholderAnimations() {
        // 기본 애니메이션 생성 (스프라이트시트가 없을 경우)
        const dummyTexture = this.textures.get('__DEFAULT');

        this.anims.create({
            key: 'player_idle',
            frames: [ { key: '__DEFAULT', frame: '__BASE' } ],
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'player_walk',
            frames: [ { key: '__DEFAULT', frame: '__BASE' } ],
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'player_run',
            frames: [ { key: '__DEFAULT', frame: '__BASE' } ],
            frameRate: 12,
            repeat: -1
        });
    }

    showErrorMessage(message) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const errorBg = this.add.rectangle(width/2, height/2, width-100, 150, 0x000000, 0.8);
        const errorText = this.add.text(width/2, height/2, message, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ff0000',
            align: 'center',
            wordWrap: { width: width-150 }
        });
        errorText.setOrigin(0.5);

        // 재시도 버튼
        const retryButton = this.add.text(width/2, height/2 + 50, '재시도', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 15, y: 10 }
        });
        retryButton.setOrigin(0.5);
        retryButton.setInteractive({ useHandCursor: true });
        retryButton.on('pointerdown', () => {
            this.scene.restart();
        });
    }
}