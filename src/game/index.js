'use client';

import { useEffect, useRef } from 'react';
import {IS_DEV} from "@/game/config/constants";

export default function GameComponent({ containerId = 'game-container' }) {
    const gameInstanceRef = useRef(null);

    useEffect(() => {
        // 초기화 함수
        const initGame = async () => {
            // Phaser를 동적으로 가져옴
            if (typeof window !== 'undefined' && !gameInstanceRef.current) {
                // Phaser와 필요한 씬들을 동적으로 가져옴
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
                    parent: containerId,
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
                            debug: false
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
                    backgroundColor: '#000000'
                };

                // 게임 인스턴스 생성
                gameInstanceRef.current = new Phaser.Game(config);

                // 리사이즈 이벤트에 대응
                window.addEventListener('resize', () => {
                    if (gameInstanceRef.current) {
                        gameInstanceRef.current.scale.refresh();
                    }
                });
            }
        };

        initGame();

        // 컴포넌트 언마운트 시 게임 인스턴스 정리
        return () => {
            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, [containerId]);

    return null; // 이 컴포넌트는 DOM을 렌더링하지 않음
}