// src/game/core/GameManager.js

import { saveGameData, loadGameData } from '../services/storageService';
import * as Phaser from 'phaser';

export default class GameManager extends Phaser.Events.EventEmitter {
    constructor() {
        super(); // Phaser.Events.EventEmitter의 생성자 호출

        this.currentScene = '';
        this.inventory = [];
        this.gameFlags = {};
        this.visitedScenes = new Set();
        this.itemDatabase = {};
        this.itemCombinations = {};
        this.gameData = null;
        this.initialized = false;
        this.initializationPromise = null; // 초기화 Promise 추가
    }

    async init(gameDataPath = '/assets/data/game-data.json') {
        // 이미 초기화 중이거나 완료되었으면 기존 Promise 반환
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        // 초기화 Promise 생성 및 저장
        this.initializationPromise = new Promise(async (resolve, reject) => {
            try {
                // 게임 데이터 로드 (아이템, 조합법 등)
                const response = await fetch(gameDataPath);
                if (!response.ok) {
                    throw new Error(`게임 데이터 로드 실패: ${response.status}`);
                }

                this.gameData = await response.json();

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
                console.log('게임 매니저 초기화 완료:', this.gameData);
                this.emit('init-complete', this.gameData);
                resolve(true);
            } catch (error) {
                console.error('게임 매니저 초기화 실패:', error);
                // 기본 설정으로 대체
                this.resetGameState();
                this.initialized = true;
                this.emit('init-error', error);
                // 초기화 실패도 Promise를 resolve하고 오류 정보 전달
                resolve(false);
            }
        });

        return this.initializationPromise;
    }

    // 초기화 여부 확인 헬퍼 메서드
    ensureInitialized() {
        if (!this.initialized) {
            console.warn('GameManager가 아직 초기화되지 않았습니다.');
            return false;
        }
        return true;
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

        this.emit('state-reset');
    }

    loadSavedGame(savedData) {
        // 저장된 게임 데이터 로드
        this.currentScene = savedData.currentScene || this.gameData?.startingScene || 'room1';
        this.inventory = savedData.inventory || [];
        this.gameFlags = savedData.gameFlags || {};
        this.visitedScenes = new Set(savedData.visitedScenes || []);

        console.log('저장된 게임 로드됨:', savedData);
        this.emit('game-loaded', savedData);
    }

    saveGameState() {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return null;

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

        console.log('게임 저장됨:', saveData);
        this.emit('game-saved', saveData);
        return saveData;
    }

    setCurrentScene(sceneKey) {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return;

        this.currentScene = sceneKey;
        this.visitedScenes.add(sceneKey);
        this.emit('scene-changed', sceneKey);
    }

    getSavedState(sceneKey) {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return null;

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
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return false;

        if (!this.inventory.includes(itemId)) {
            this.inventory.push(itemId);
            console.log(`아이템 획득: ${itemId}`);
            this.emit('item-collected', itemId);
            return true;
        }
        return false;
    }

    removeItem(itemId) {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return false;

        const index = this.inventory.indexOf(itemId);
        if (index !== -1) {
            this.inventory.splice(index, 1);
            console.log(`아이템 제거: ${itemId}`);
            this.emit('item-removed', itemId);
            return true;
        }
        return false;
    }

    hasItem(itemId) {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return false;

        return this.inventory.includes(itemId);
    }

    getInventory() {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return [];

        // 인벤토리에 있는 모든 아이템의 데이터 반환
        return this.inventory.map(itemId => this.getItemData(itemId)).filter(Boolean);
    }

    getCollectedItems() {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return [];

        return [...this.inventory];
    }

    getItemData(itemId) {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return null;

        return this.itemDatabase[itemId] || null;
    }

    combineItems(itemId1, itemId2) {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return null;

        const key = this.getCombinationKey(itemId1, itemId2);
        const resultItemId = this.itemCombinations[key];

        if (resultItemId) {
            // 성공적인 조합
            console.log(`아이템 조합 성공: ${itemId1} + ${itemId2} = ${resultItemId}`);

            // 기존 아이템 제거
            this.removeItem(itemId1);
            this.removeItem(itemId2);

            // 새 아이템 추가
            this.collectItem(resultItemId);

            this.emit('items-combined', { itemId1, itemId2, resultItemId });

            return this.getItemData(resultItemId);
        }

        // 조합 실패
        console.log(`아이템 조합 실패: ${itemId1} + ${itemId2}`);
        this.emit('item-combination-failed', { itemId1, itemId2 });
        return null;
    }

    getCombinationKey(itemId1, itemId2) {
        // 조합은 순서에 관계없이 동일한 키 생성
        return [itemId1, itemId2].sort().join('_');
    }

    setFlag(flagName, value = true) {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return;

        const oldValue = this.gameFlags[flagName];
        this.gameFlags[flagName] = value;
        this.emit('flag-changed', { flagName, oldValue, newValue: value });
    }

    getFlag(flagName) {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return false;

        return this.gameFlags[flagName] || false;
    }

    hasVisitedScene(sceneKey) {
        // 초기화 여부 확인
        if (!this.ensureInitialized()) return false;

        return this.visitedScenes.has(sceneKey);
    }
}