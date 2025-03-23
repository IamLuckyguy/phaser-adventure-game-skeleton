// src/game/core/GameManager.js
import { saveGameData, loadGameData } from '../services/storageService';
import Phaser from 'phaser';

export default class GameManager extends Phaser.Events.EventEmitter {
    constructor() {
        super(); // Phaser 이벤트 시스템 초기화

        this.currentScene = '';
        this.inventory = [];
        this.gameFlags = {};
        this.visitedScenes = new Set();
        this.itemDatabase = {};
        this.itemCombinations = {};
        this.gameData = null;
        this.initialized = false;
        this.initializing = false;
    }

    async init(gameDataPath = '/assets/data/game-data.json') {
        // 이미 초기화 중이거나 완료된 경우 중복 초기화 방지
        if (this.initialized || this.initializing) {
            if (this.initialized) {
                console.log('GameManager: 이미 초기화 완료됨');
                this.emit('init-complete', this);
            } else {
                console.log('GameManager: 초기화 진행 중...');
            }
            return this.initialized;
        }

        this.initializing = true;
        console.log('GameManager: 초기화 시작');

        try {
            // 게임 데이터 로드 (아이템, 조합법 등)
            const response = await fetch(gameDataPath);
            if (!response.ok) {
                throw new Error(`게임 데이터 로드 실패: ${response.status}`);
            }

            this.gameData = await response.json();
            console.log('GameManager: 게임 데이터 로드 완료');

            // 아이템 데이터베이스 설정
            if (this.gameData.items) {
                this.itemDatabase = this.gameData.items.reduce((db, item) => {
                    db[item.id] = item;
                    return db;
                }, {});
            }

            // 아이템 조합 설정
            if (this.gameData.combinations) {
                this.itemCombinations = this.gameData.combinations.reduce((combos, combo) => {
                    const key = this.getCombinationKey(combo.item1, combo.item2);
                    combos[key] = combo.result;
                    return combos;
                }, {});
            }

            // 저장된 게임 불러오기 시도
            const savedGame = loadGameData();
            if (savedGame) {
                this.loadSavedGame(savedGame);
            } else {
                // 새 게임 설정
                this.resetGameState();
            }

            this.initialized = true;
            this.initializing = false;

            // 초기화 완료 이벤트 발생
            this.emit('init-complete', this);
            console.log('GameManager: 초기화 완료');
            return true;
        } catch (error) {
            console.error('GameManager: 초기화 실패:', error);
            // 기본 설정으로 대체
            this.resetGameState();
            this.initialized = true;
            this.initializing = false;

            // 초기화 실패 이벤트 발생
            this.emit('init-error', error);
            return false;
        }
    }

    // 초기화 상태 확인 및 대기 메서드
    async waitForInit() {
        // 이미 초기화되었으면 바로 반환
        if (this.initialized) {
            return true;
        }

        // 아직 초기화 시작되지 않았으면 시작
        if (!this.initializing) {
            return this.init();
        }

        // 초기화 중이면 완료될 때까지 대기
        return new Promise((resolve) => {
            this.once('init-complete', () => resolve(true));
            this.once('init-error', () => resolve(false));
        });
    }

    resetGameState() {
        // 게임 상태를 초기화
        this.currentScene = this.gameData?.startingScene || 'room1';
        this.inventory = [];
        this.gameFlags = {};
        this.visitedScenes = new Set();

        // 시작 아이템이 있으면 추가
        if (this.gameData?.startingItems) {
            this.gameData.startingItems.forEach(itemId => {
                this.collectItem(itemId);
            });
        }
    }

    loadSavedGame(savedData) {
        // 저장된 게임 데이터 로드 (함수명 오타 수정)
        this.currentScene = savedData.currentScene || this.gameData?.startingScene || 'room1';
        this.inventory = savedData.inventory || [];
        this.gameFlags = savedData.gameFlags || {};
        this.visitedScenes = new Set(savedData.visitedScenes || []);

        console.log('GameManager: 저장된 게임 로드됨:', savedData);

        // 저장 게임 로드 이벤트 발생
        this.emit('game-loaded', savedData);
    }

    saveGameState() {
        // 현재 게임 상태 저장
        const saveData = {
            currentScene: this.currentScene,
            inventory: this.inventory,
            gameFlags: this.gameFlags,
            visitedScenes: Array.from(this.visitedScenes),
            timestamp: new Date().toISOString()
        };

        // 클라이언트 사이드에서만 저장 실행
        if (typeof window !== 'undefined') {
            saveGameData(saveData);
        }

        console.log('GameManager: 게임 저장됨:', saveData);

        // 게임 저장 이벤트 발생
        this.emit('game-saved', saveData);

        return saveData;
    }

    setCurrentScene(sceneKey) {
        const previousScene = this.currentScene;
        this.currentScene = sceneKey;
        this.visitedScenes.add(sceneKey);

        // 씬 변경 이벤트 발생
        this.emit('scene-changed', { previous: previousScene, current: sceneKey });
    }

    getSavedState(sceneKey) {
        // 특정 씬에 대한 저장 상태 반환
        if (sceneKey === this.currentScene) {
            return {
                sceneKey: this.currentScene,
                flags: this.gameFlags,
                visitedBefore: this.visitedScenes.has(sceneKey)
            };
        }
        return null;
    }

    collectItem(itemId) {
        if (!this.inventory.includes(itemId)) {
            this.inventory.push(itemId);
            console.log(`GameManager: 아이템 획득: ${itemId}`);

            // 아이템 획득 이벤트 발생
            this.emit('item-collected', itemId);
            return true;
        }
        return false;
    }

    removeItem(itemId) {
        const index = this.inventory.indexOf(itemId);
        if (index !== -1) {
            this.inventory.splice(index, 1);
            console.log(`GameManager: 아이템 제거: ${itemId}`);

            // 아이템 제거 이벤트 발생
            this.emit('item-removed', itemId);
            return true;
        }
        return false;
    }

    hasItem(itemId) {
        return this.inventory.includes(itemId);
    }

    getInventory() {
        // 인벤토리에 있는 모든 아이템의 데이터 반환
        return this.inventory.map(itemId => this.getItemData(itemId)).filter(Boolean);
    }

    getCollectedItems() {
        return [...this.inventory];
    }

    getItemData(itemId) {
        return this.itemDatabase[itemId] || null;
    }

    combineItems(itemId1, itemId2) {
        const key = this.getCombinationKey(itemId1, itemId2);
        const resultItemId = this.itemCombinations[key];

        if (resultItemId) {
            // 성공적인 조합
            console.log(`GameManager: 아이템 조합 성공: ${itemId1} + ${itemId2} = ${resultItemId}`);

            // 기존 아이템 제거
            this.removeItem(itemId1);
            this.removeItem(itemId2);

            // 새 아이템 추가
            this.collectItem(resultItemId);

            // 아이템 조합 이벤트 발생
            this.emit('items-combined', { item1: itemId1, item2: itemId2, result: resultItemId });

            return this.getItemData(resultItemId);
        }

        // 조합 실패
        console.log(`GameManager: 아이템 조합 실패: ${itemId1} + ${itemId2}`);
        return null;
    }

    getCombinationKey(itemId1, itemId2) {
        // 조합은 순서에 관계없이 동일한 키 생성
        return [itemId1, itemId2].sort().join('_');
    }

    setFlag(flagName, value = true) {
        const previousValue = this.gameFlags[flagName];
        this.gameFlags[flagName] = value;

        // 플래그 변경 이벤트 발생
        this.emit('flag-changed', {
            flag: flagName,
            value: value,
            previousValue: previousValue
        });
    }

    getFlag(flagName) {
        return this.gameFlags[flagName] || false;
    }

    hasVisitedScene(sceneKey) {
        return this.visitedScenes.has(sceneKey);
    }
}