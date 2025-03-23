// src/game/config/constants.js

// 게임 상태
export const GAME_STATES = {
    LOADING: 'loading',
    MENU: 'menu',
    EXPLORING: 'exploring',
    DIALOG: 'dialog',
    CUTSCENE: 'cutscene',
    INVENTORY: 'inventory',
    PAUSED: 'paused'
};

// 씬 이벤트
export const SCENE_EVENTS = {
    SCENE_CREATED: 'scene-created',
    SCENE_DESTROYED: 'scene-destroyed',
    PLAYER_MOVED: 'player-moved',
    ITEM_COLLECTED: 'item-collected',
    HOTSPOT_INTERACTION: 'hotspot-interaction',
    DIALOG_STARTED: 'dialog-started',
    DIALOG_ENDED: 'dialog-ended'
};

// 핫스팟 타입
export const HOTSPOT_TYPES = {
    DEFAULT: 'default',
    DOOR: 'door',
    ITEM: 'item',
    NPC: 'npc',
    OBJECT: 'object',
    TRIGGER: 'trigger'
};

// 아이템 타입
export const ITEM_TYPES = {
    KEY: 'key',
    TOOL: 'tool',
    DOCUMENT: 'document',
    CONSUMABLE: 'consumable',
    QUEST: 'quest',
    MISC: 'misc'
};

// 액션 타입
export const ACTION_TYPES = {
    DIALOG: 'dialog',
    CONVERSATION: 'conversation',
    CHANGE_SCENE: 'changeScene',
    GIVE_ITEM: 'giveItem',
    REQUIRE_ITEM: 'requireItem',
    TOGGLE_OBJECT: 'toggleObject',
    PLAY_ANIMATION: 'playAnimation',
    PLAY_SOUND: 'playSound',
    SET_FLAG: 'setFlag',
    CUSTOM: 'custom'
};

// 게임 플래그 (특정 이벤트나 상태를 추적하기 위한 플래그)
export const GAME_FLAGS = {
    INTRO_COMPLETED: 'introCompleted',
    DOOR_UNLOCKED: 'doorUnlocked',
    PUZZLE_SOLVED: 'puzzleSolved'
    // 게임별 플래그 추가
};

// UI 관련 상수
export const UI_CONFIG = {
    DIALOG_TEXT_SPEED: 30, // 글자당 밀리초
    INVENTORY_SLOT_SIZE: 80,
    TOOLTIP_DELAY: 500,
    INTERACTION_RADIUS: 50
};

// 효과음
export const SOUND_KEYS = {
    CLICK: 'click_sound',
    PICKUP: 'item_pickup',
    DOOR_OPEN: 'door_open',
    DIALOG: 'dialog_blip',
    BACKGROUND: 'background_music'
};

// 애니메이션 키
export const ANIMATION_KEYS = {
    PLAYER_IDLE: 'player_idle',
    PLAYER_WALK: 'player_walk',
    PLAYER_RUN: 'player_run',
    DOOR_OPEN: 'door_open',
    ITEM_PICKUP: 'item_pickup'
};

// 컨트롤 키
export const CONTROL_KEYS = {
    INVENTORY: 'I',
    MENU: 'ESC',
    ACTION: 'E',
    EXAMINE: 'Q'
};

// 모바일 제스처 (스와이프 방향)
export const GESTURES = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
};

// 설정 기본값
export const DEFAULT_SETTINGS = {
    MUSIC_VOLUME: 0.5,
    SFX_VOLUME: 0.7,
    TEXT_SPEED: 'normal', // 'slow', 'normal', 'fast'
    LANGUAGE: 'ko', // 언어 코드
    FULLSCREEN: false
};

// DEV 여부
export const IS_DEV = process.env.NODE_ENV === 'development';