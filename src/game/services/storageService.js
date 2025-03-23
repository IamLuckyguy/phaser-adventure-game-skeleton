// localStorage를 사용한 게임 데이터 저장/불러오기 서비스

// 게임 데이터 저장
export function saveGameData(data) {
    try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem('phaser_adventure_game_save', serializedData);
        return true;
    } catch (error) {
        console.error('게임 데이터 저장 실패:', error);
        return false;
    }
}

// 게임 데이터 불러오기
export function loadGameData() {
    try {
        const serializedData = localStorage.getItem('phaser_adventure_game_save');
        if (!serializedData) return null;
        return JSON.parse(serializedData);
    } catch (error) {
        console.error('게임 데이터 불러오기 실패:', error);
        return null;
    }
}

// 게임 데이터 삭제
export function clearGameData() {
    try {
        localStorage.removeItem('phaser_adventure_game_save');
        return true;
    } catch (error) {
        console.error('게임 데이터 삭제 실패:', error);
        return false;
    }
}

// 게임 데이터 존재 여부 확인
export function hasGameData() {
    return localStorage.getItem('phaser_adventure_game_save') !== null;
}