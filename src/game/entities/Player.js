// src/game/entities/Player.js

import {IS_DEV} from "@/game/config/constants";

export default class Player {
    constructor(scene, config) {
        this.scene = scene;
        this.x = config.x || 400;
        this.y = config.y || 450;
        this.speed = config.speed || 150;
        this.runSpeed = config.runSpeed || 250;
        this.isMoving = false;
        this.isRunning = false;
        this.targetPosition = null;
        this.onMoveComplete = null;
        this.facingRight = true;

        // 경로 찾기 지점
        this.path = [];
        this.currentPathIndex = 0;

        // 플레이어 스프라이트 생성
        this.createSprite(config);

        // 애니메이션 설정
        this.setupAnimations(config);
    }

    createSprite(config) {
        // 플레이어 스프라이트 생성
        this.sprite = this.scene.add.sprite(this.x, this.y, 'player_sprite');
        this.sprite.setDepth(10); // 다른 객체 위에 표시되도록 depth 설정

        // 히트 영역 (선택적, 디버그용)
        if (IS_DEV) {
            this.hitArea = this.scene.add.circle(this.x, this.y, 20, 0x00ff00, 0.3);
        }

        // 그림자 (선택적)
        if (config.shadow) {
            this.shadow = this.scene.add.ellipse(
                this.x,
                this.y + 30,
                40,
                15,
                0x000000,
                0.3
            );
            this.shadow.setDepth(5);
        }
    }

    setupAnimations(config) {
        // 플레이어 애니메이션 설정
        const anims = this.scene.anims;

        // 애니메이션이 이미 정의되어 있는지 확인
        if (!anims.exists('player_idle')) {
            anims.create({
                key: 'player_idle',
                frames: anims.generateFrameNumbers('player_sprite', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!anims.exists('player_walk')) {
            anims.create({
                key: 'player_walk',
                frames: anims.generateFrameNumbers('player_sprite', { start: 4, end: 11 }),
                frameRate: 12,
                repeat: -1
            });
        }

        if (!anims.exists('player_run')) {
            anims.create({
                key: 'player_run',
                frames: anims.generateFrameNumbers('player_sprite', { start: 12, end: 15 }),
                frameRate: 15,
                repeat: -1
            });
        }

        // 초기 애니메이션 설정
        this.sprite.play('player_idle');
    }

    update(time, delta) {
        if (this.isMoving) {
            this.updateMovement(delta);
        }

        // 그림자 위치 업데이트 (있는 경우)
        if (this.shadow) {
            this.shadow.x = this.x;
            this.shadow.y = this.y + 30;
        }

        // 디버그 히트 영역 업데이트
        if (this.hitArea) {
            this.hitArea.x = this.x;
            this.hitArea.y = this.y;
        }
    }

    updateMovement(delta) {
        if (!this.targetPosition) return;

        if (this.path.length > 0) {
            // 경로 찾기를 사용하는 경우
            this.followPath(delta);
        } else {
            // 직접 이동
            this.moveDirectlyToTarget(delta);
        }
    }

    moveDirectlyToTarget(delta) {
        const targetX = this.targetPosition.x;
        const targetY = this.targetPosition.y;

        // 목표까지의 거리 계산
        const distanceX = targetX - this.x;
        const distanceY = targetY - this.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // 목표에 도달했는지 확인
        if (distance < 5) {
            this.arriveAtTarget();
            return;
        }

        // 이동 속도 계산
        const speed = this.isRunning ? this.runSpeed : this.speed;
        const moveDistance = speed * (delta / 1000);

        // 이동 거리가 남은 거리보다 크면 목표 지점으로 직접 이동
        if (moveDistance >= distance) {
            this.x = targetX;
            this.y = targetY;
            this.arriveAtTarget();
            return;
        }

        // 정규화된 방향 벡터 계산
        const directionX = distanceX / distance;
        const directionY = distanceY / distance;

        // 이동
        this.x += directionX * moveDistance;
        this.y += directionY * moveDistance;

        // 스프라이트 위치 업데이트
        this.sprite.x = this.x;
        this.sprite.y = this.y;

        // 방향에 따라 플립
        if (directionX < 0 && this.facingRight) {
            this.sprite.flipX = true;
            this.facingRight = false;
        } else if (directionX > 0 && !this.facingRight) {
            this.sprite.flipX = false;
            this.facingRight = true;
        }
    }

    followPath(delta) {
        if (this.currentPathIndex >= this.path.length) {
            // 경로의 끝에 도달
            this.path = [];
            this.currentPathIndex = 0;
            this.arriveAtTarget();
            return;
        }

        // 현재 경로 지점
        const currentTarget = this.path[this.currentPathIndex];

        // 현재 지점까지의 거리
        const distanceX = currentTarget.x - this.x;
        const distanceY = currentTarget.y - this.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // 현재 지점에 도달했는지 확인
        if (distance < 5) {
            // 다음 경로 지점으로
            this.currentPathIndex++;

            // 경로의 마지막 지점이었으면 종료
            if (this.currentPathIndex >= this.path.length) {
                this.path = [];
                this.currentPathIndex = 0;
                this.arriveAtTarget();
                return;
            }

            return;
        }

        // 이동 속도 계산
        const speed = this.isRunning ? this.runSpeed : this.speed;
        const moveDistance = speed * (delta / 1000);

        // 정규화된 방향 벡터
        const directionX = distanceX / distance;
        const directionY = distanceY / distance;

        // 이동
        this.x += directionX * moveDistance;
        this.y += directionY * moveDistance;

        // 스프라이트 위치 업데이트
        this.sprite.x = this.x;
        this.sprite.y = this.y;

        // 방향에 따라 플립
        if (directionX < 0 && this.facingRight) {
            this.sprite.flipX = true;
            this.facingRight = false;
        } else if (directionX > 0 && !this.facingRight) {
            this.sprite.flipX = false;
            this.facingRight = true;
        }
    }

    arriveAtTarget() {
        console.log("Player arrived at target");

        // 이동 완료
        this.isMoving = false;
        this.isRunning = false;
        this.sprite.play('player_idle');

        // 콜백 실행
        if (this.onMoveComplete) {
            const callback = this.onMoveComplete;
            this.onMoveComplete = null;
            callback();
        }
    }

    // Player.js의 moveTo 메서드 수정
    moveTo(x, y, onComplete = null) {
        // 현재 위치
        const startX = this.sprite.x;
        const startY = this.sprite.y;

        // 목적지 - 여기가 문제일 수 있음
        let targetX, targetY;

        if (typeof x === 'object') {
            // x가 객체인 경우 (예: interactionPoint)
            console.log("Moving to object:", x); // 디버깅용
            targetX = x.x || 0; // x가 undefined인 경우를 대비
            targetY = x.y || 0; // y가 undefined인 경우를 대비
        } else {
            // x, y가 직접 좌표값으로 주어진 경우
            targetX = x;
            targetY = y;
        }

        // 애니메이션 변경
        this.playAnimation('player_walk');

        // 캐릭터 방향 설정 (좌/우)
        if (targetX < startX) {
            this.sprite.setFlipX(true);  // 왼쪽을 보도록
        } else {
            this.sprite.setFlipX(false); // 오른쪽을 보도록
        }

        // 트윈으로 이동 (수정된 버전)
        this.isMoving = true;
        this.targetPosition = { x: targetX, y: targetY };

        // 스프라이트가 제대로 설정되어 있는지 확인
        if (!this.sprite) {
            console.error("Player sprite is not defined");
            if (onComplete) onComplete();
            return;
        }

        this.scene.tweens.add({
            targets: this.sprite,
            x: targetX,
            y: targetY,
            duration: this.calculateMoveDuration(startX, startY, targetX, targetY),
            onUpdate: () => {
                // 스프라이트 위치에 맞게 플레이어 좌표 업데이트
                this.x = this.sprite.x;
                this.y = this.sprite.y;
            },
            onComplete: () => {
                // 이동 완료 후 대기 애니메이션
                this.playAnimation('player_idle');
                this.isMoving = false;

                // 콜백 실행
                if (onComplete) onComplete();
            }
        });
    }

    runTo(x, y, onComplete = null) {
        // 달리기 (moveTo와 유사하지만 빠른 속도)
        this.targetPosition = { x, y };
        this.isMoving = true;
        this.isRunning = true;
        this.onMoveComplete = onComplete;

        // 달리기 애니메이션
        this.sprite.play('player_run');

        // 사운드 효과 (선택적)
        // this.scene.sound.play('run_footsteps', { volume: 0.4, loop: true });

        // 경로 찾기 사용
        this.findPath(x, y);
    }

    findPath(targetX, targetY) {
        // 간단한 경로 찾기 또는 네비게이션 메시 사용
        // 이 예제에서는 직접 이동을 위해 빈 경로 사용
        this.path = [];
        this.currentPathIndex = 0;

        // 실제 게임에서는 장애물을 고려한 경로 찾기 알고리즘 구현
        // 또는 미리 정의된 노드 시스템 사용
    }

    stopMoving() {
        // 이동 중지
        this.isMoving = false;
        this.isRunning = false;
        this.targetPosition = null;
        this.path = [];
        this.currentPathIndex = 0;
        this.sprite.play('player_idle');

        // 사운드 중지 (필요시)
        // this.scene.sound.stopByKey('footsteps');
        // this.scene.sound.stopByKey('run_footsteps');
    }

    faceDirection(direction) {
        // 특정 방향 바라보기
        if (direction === 'left') {
            this.sprite.flipX = true;
            this.facingRight = false;
        } else if (direction === 'right') {
            this.sprite.flipX = false;
            this.facingRight = true;
        }
    }

    playAnimation(animKey, completeCallback = null) {
        // 특정 애니메이션 재생
        this.sprite.play(animKey);

        if (completeCallback) {
            this.sprite.on('animationcomplete', () => {
                completeCallback();
                // 기본 애니메이션으로 복귀
                this.sprite.play('player_idle');
            }, this);
        }
    }

    setVisible(visible) {
        // 플레이어 표시/숨김
        this.sprite.visible = visible;
        if (this.shadow) this.shadow.visible = visible;
    }

    teleport(x, y) {
        // 즉시 이동 (애니메이션 없음)
        this.x = x;
        this.y = y;
        this.sprite.x = x;
        this.sprite.y = y;

        if (this.shadow) {
            this.shadow.x = x;
            this.shadow.y = y + 30;
        }

        if (this.hitArea) {
            this.hitArea.x = x;
            this.hitArea.y = y;
        }
    }

    getPosition() {
        // 현재 위치 반환
        return { x: this.x, y: this.y };
    }

    calculateMoveDuration(startX, startY, targetX, targetY) {
        // 시작점과 목표점 사이의 거리 계산
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 속도에 따른 이동 시간 계산 (거리 / 속도)
        const speed = this.isRunning ? this.runSpeed : this.speed;

        // 최소 지속 시간 100ms, 최대 5000ms
        return Math.min(Math.max(distance / (speed / 1000), 100), 5000);
    }

    destroy() {
        // 리소스 정리
        if (this.sprite) this.sprite.destroy();
        if (this.shadow) this.shadow.destroy();
        if (this.hitArea) this.hitArea.destroy();
    }
}