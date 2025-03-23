'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import PhaserGameInitializer from '@/game/PhaserGameInitializer';

// UI 컴포넌트들
const GameControls = ({ onSave, onExit, isPaused, onTogglePause }) => {
    return (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                onClick={onSave}
            >
                저장
            </button>
            <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow"
                onClick={onTogglePause}
            >
                {isPaused ? '계속하기' : '일시정지'}
            </button>
            <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
                onClick={onExit}
            >
                나가기
            </button>
        </div>
    );
};

// 로딩 컴포넌트
const LoadingScreen = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
        <div className="text-white text-2xl">게임 로딩 중...</div>
    </div>
);

// 메인 게임 컴포넌트
export default function GameComponent() {
    const gameContainerRef = useRef(null);
    const gameInstanceRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    // 게임 나가기 처리
    const handleExit = () => {
        if (confirm('진행 상황이 저장되지 않을 수 있습니다. 정말 나가시겠습니까?')) {
            window.location.href = '/';  // 메인 화면으로 이동
        }
    };

    // 게임 저장 처리
    const handleSave = () => {
        if (gameInstanceRef.current) {
            // GameScene에 접근하여 저장 메서드 호출
            const gameScene = gameInstanceRef.current.scene.getScene('GameScene');
            if (gameScene && gameScene.saveGameState) {
                gameScene.saveGameState();
                alert('게임이 저장되었습니다.');
            } else {
                alert('게임 저장에 실패했습니다.');
            }
        }
    };

    // 일시정지 토글
    const handleTogglePause = () => {
        if (gameInstanceRef.current) {
            const gameScene = gameInstanceRef.current.scene.getScene('GameScene');
            if (gameScene) {
                if (isPaused) {
                    gameScene.resumeGame();
                } else {
                    gameScene.pauseGame();
                }
                setIsPaused(!isPaused);
            }
        }
    };

    // 게임 초기화
    useEffect(() => {
        const initGame = async () => {
            setIsLoading(true);
            try {
                if (gameContainerRef.current && !gameInstanceRef.current) {
                    const phaserGame = new PhaserGameInitializer(gameContainerRef.current);
                    gameInstanceRef.current = await phaserGame.initialize();

                    // 게임 이벤트 리스너 설정
                    gameInstanceRef.current.events.on('ready', () => {
                        setIsLoading(false);
                    });

                    // 창 크기 조정에 대응
                    const handleResize = () => {
                        if (gameInstanceRef.current) {
                            gameInstanceRef.current.scale.refresh();
                        }
                    };

                    window.addEventListener('resize', handleResize);
                    return () => {
                        window.removeEventListener('resize', handleResize);
                    };
                }
            } catch (error) {
                console.error('게임 초기화 실패:', error);
                setIsLoading(false);
                alert('게임을 불러오는 데 문제가 발생했습니다. 페이지를 새로고침해 주세요.');
            }
        };

        initGame();

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, []);

    // 창을 벗어날 때 경고
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            const message = '진행 상황이 저장되지 않을 수 있습니다. 정말 나가시겠습니까?';
            e.returnValue = message;
            return message;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {isLoading && <LoadingScreen />}

            <GameControls
                onSave={handleSave}
                onExit={handleExit}
                isPaused={isPaused}
                onTogglePause={handleTogglePause}
            />

            <div
                id="game-container"
                ref={gameContainerRef}
                className="w-full h-full focus:outline-none"
                tabIndex={0}
            />

            {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                    <div className="text-white text-3xl">일시 정지</div>
                </div>
            )}
        </div>
    );
}