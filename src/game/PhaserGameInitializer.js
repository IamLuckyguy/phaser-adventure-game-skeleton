// src/game/PhaserGameInitializer.js
// Phaser 게임 인스턴스 초기화 및 관리를 위한 클래스

class PhaserGameInitializer {
    constructor(containerElement) {
        this.containerElement = containerElement;
        this.gameInstance = null;
    }

    /**
     * Phaser 게임 초기화
     * @returns {Promise<Phaser.Game>} 초기화된 게임 인스턴스
     */
    async initialize() {
        // Phaser와 필요한 씬들을 동적으로 가져옴
        try {
            const Phaser = (await import('phaser')).default;
            const { BootScene } = await import('./scenes/BootScene');
            const { PreloadScene } = await import('./scenes/PreloadScene');
            const { MenuScene } = await import('./scenes/MenuScene');
            const GameScene = (await import('./scenes/GameScene')).default;
            const { SettingsScene } = await import('./scenes/SettingsScene');
            const { CreditsScene } = await import('./scenes/CreditsScene');

            // 게임 설정
            const config = {
                type: Phaser.AUTO,
                parent: this.containerElement,
                width: 1280,
                height: 720,
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH
                },
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 0 },
                        debug: process.env.NODE_ENV === 'development'
                    }
                },
                scene: [
                    BootScene,
                    PreloadScene,
                    MenuScene,
                    GameScene,
                    SettingsScene,
                    CreditsScene
                ],
                audio: {
                    disableWebAudio: false,
                    noAudio: false,
                    // 오디오 로드 실패를 무시하고 진행
                    ignoreLoadErrors: true
                },
                pixelArt: true,
                backgroundColor: '#000000',
                callbacks: {
                    postBoot: (game) => {
                        // 게임 초기화 완료 후 호출
                        console.log('게임 초기화 완료');
                        game.events.emit('ready');
                    }
                }
            };

            // 게임 인스턴스 생성
            this.gameInstance = new Phaser.Game(config);

            // 글로벌 오류 처리
            this.setupErrorHandling(this.gameInstance);

            return this.gameInstance;
        } catch (error) {
            console.error('Phaser 게임 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 게임 인스턴스 오류 처리 설정
     * @param {Phaser.Game} game - Phaser 게임 인스턴스
     */
    setupErrorHandling(game) {
        // 씬 전환 오류 처리
        game.events.on('sceneinit', (scene) => {
            scene.events.on('error', (error) => {
                console.error(`[${scene.scene.key}] 씬 오류:`, error);
                // 개발 모드에서만 오류 표시
                if (process.env.NODE_ENV === 'development') {
                    this.showErrorOverlay(error, scene.scene.key);
                }

                // 실패한 씬에서 복구 시도
                try {
                    // 오류 발생 시 메뉴 씬으로 돌아가기
                    scene.scene.start('MenuScene', { error: '오류가 발생하여 게임을 재시작합니다.' });
                } catch (recoveryError) {
                    console.error('씬 복구 실패:', recoveryError);
                }
            });
        });

        // 글로벌 오류 처리
        window.addEventListener('error', (event) => {
            if (this.gameInstance && event.error && event.error.message) {
                console.error('게임 런타임 오류:', event.error);
            }
        });
    }

    /**
     * 개발 모드용 오류 오버레이 표시
     * @param {Error} error - 발생한 오류
     * @param {string} sceneName - 오류가 발생한 씬 이름
     */
    showErrorOverlay(error, sceneName) {
        if (process.env.NODE_ENV !== 'development') return;

        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '10px';
        overlay.style.left = '10px';
        overlay.style.right = '10px';
        overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        overlay.style.color = 'white';
        overlay.style.padding = '20px';
        overlay.style.borderRadius = '5px';
        overlay.style.fontFamily = 'monospace';
        overlay.style.fontSize = '14px';
        overlay.style.zIndex = '1000';
        overlay.style.maxHeight = '80%';
        overlay.style.overflow = 'auto';

        overlay.innerHTML = `
      <h3>게임 오류 발생 (씬: ${sceneName})</h3>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
      <button id="close-error">닫기</button>
    `;

        document.body.appendChild(overlay);

        document.getElementById('close-error').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        // 10초 후 자동으로 닫기
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 10000);
    }

    /**
     * 게임 인스턴스 제거
     */
    destroy() {
        if (this.gameInstance) {
            this.gameInstance.destroy(true);
            this.gameInstance = null;
        }
    }
}

export default PhaserGameInitializer;