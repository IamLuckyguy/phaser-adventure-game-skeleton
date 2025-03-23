'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// 동적 임포트로 게임 컴포넌트 가져오기
const Game = dynamic(() => import('@/game'), {
    ssr: false, // 서버 사이드 렌더링 비활성화
});

export default function GameComponent() {
    return (
        <div id="game-container" className="w-full h-screen">
            <Game containerId="game-container" />
        </div>
    );
}