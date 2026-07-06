import { _decorator, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import { AudioManager } from './AudioManager';
import { PlayerController } from './PlayerController';

const { ccclass, property } = _decorator;

enum GameState {
    Ready,
    Playing,
    GameOver,
}

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node)
    public playerNode: Node | null = null;

    @property(Prefab)
    public starPrefab: Prefab | null = null;

    @property(Label)
    public scoreLabel: Label | null = null;

    @property(Label)
    public timerLabel: Label | null = null;

    @property(Label)
    public messageLabel: Label | null = null;

    @property(Node)
    public restartButtonNode: Node | null = null;

    @property(AudioManager)
    public audioManager: AudioManager | null = null;

    @property
    public collectDistance = 58;

    @property
    public gameDuration = 20;

    @property
    public starCount = 3;

    @property
    public spawnMinX = -520;

    @property
    public spawnMaxX = 520;

    @property
    public spawnMinY = -280;

    @property
    public spawnMaxY = 280;

    private _score = 0;
    private _timeRemaining = 0;
    private _state = GameState.Ready;
    private _playerController: PlayerController | null = null;
    private _startPending = false;
    private readonly _starNodes: Node[] = [];
    private readonly _playerStartPosition = new Vec3();
    private readonly _playerWorldPosition = new Vec3();
    private readonly _starWorldPosition = new Vec3();
    private readonly _nextStarPosition = new Vec3();

    start() {
        this._playerController = this.playerNode?.getComponent(PlayerController) ?? null;
        this.createStarsIfNeeded();

        if (this.playerNode) {
            this.playerNode.getPosition(this._playerStartPosition);
        }

        this.showReady();
    }

    update(deltaTime: number) {
        if (this._state !== GameState.Playing) {
            return;
        }

        this.tickTimer(deltaTime);
        this.checkStarCollection();
    }

    public restartGame() {
        if (this._startPending || (this._state !== GameState.Ready && this._state !== GameState.GameOver)) {
            return;
        }

        this._startPending = true;
        this.audioManager?.playClick();
        this.scheduleOnce(() => {
            this._startPending = false;
            this.startGame();
        }, 0.06);
    }

    private createStarsIfNeeded() {
        if (!this.starPrefab || this._starNodes.length >= this.starCount) {
            return;
        }

        const parentNode = this.node.parent;

        if (!parentNode) {
            return;
        }

        while (this._starNodes.length < this.starCount) {
            const starNode = instantiate(this.starPrefab);
            parentNode.addChild(starNode);
            this._starNodes.push(starNode);
        }
    }

    private showReady() {
        this._state = GameState.Ready;
        this._score = 0;
        this._timeRemaining = this.gameDuration;

        if (this.playerNode) {
            this.playerNode.setPosition(this._playerStartPosition);
        }

        this.respawnAllStars();

        this._playerController?.setControlEnabled(false);
        this.setMessage('Star Catcher');
        this.setActionButtonVisible(true);
        this.setActionButtonText('Start');
        this.updateScoreLabel();
        this.updateTimerLabel();
    }

    private startGame() {
        this._state = GameState.Playing;
        this._score = 0;
        this._timeRemaining = this.gameDuration;

        if (this.playerNode) {
            this.playerNode.setPosition(this._playerStartPosition);
        }

        this.respawnAllStars();

        this._playerController?.setControlEnabled(true);
        this.setMessage('');
        this.setActionButtonVisible(false);
        this.updateScoreLabel();
        this.updateTimerLabel();
    }

    private tickTimer(deltaTime: number) {
        this._timeRemaining = Math.max(0, this._timeRemaining - deltaTime);
        this.updateTimerLabel();

        if (this._timeRemaining <= 0) {
            this.endGame();
        }
    }

    private checkStarCollection() {
        if (!this.playerNode) {
            return;
        }

        this.playerNode.getWorldPosition(this._playerWorldPosition);

        for (const starNode of this._starNodes) {
            if (!starNode.active) {
                continue;
            }

            starNode.getWorldPosition(this._starWorldPosition);

            const offsetX = this._playerWorldPosition.x - this._starWorldPosition.x;
            const offsetY = this._playerWorldPosition.y - this._starWorldPosition.y;
            const distanceSquared = offsetX * offsetX + offsetY * offsetY;
            const collectDistanceSquared = this.collectDistance * this.collectDistance;

            if (distanceSquared <= collectDistanceSquared) {
                this.collectStar(starNode);
                return;
            }
        }
    }

    private respawnAllStars() {
        for (const starNode of this._starNodes) {
            starNode.active = true;
            this.respawnStar(starNode);
        }
    }

    private collectStar(starNode: Node) {
        this._score += 1;
        this.audioManager?.playCollect();
        this.updateScoreLabel();
        this.respawnStar(starNode);
    }

    private respawnStar(starNode: Node) {
        const nextX = this.randomRange(this.spawnMinX, this.spawnMaxX);
        const nextY = this.randomRange(this.spawnMinY, this.spawnMaxY);
        this._nextStarPosition.set(nextX, nextY, 0);
        starNode.setPosition(this._nextStarPosition);
        starNode.active = true;
    }

    private endGame() {
        this._state = GameState.GameOver;
        this.audioManager?.playGameOver();
        this._playerController?.setControlEnabled(false);
        this.setMessage(`Game Over  Score: ${this._score}`);
        this.setActionButtonVisible(true);
        this.setActionButtonText('Restart');
        this.updateTimerLabel();
    }

    private updateScoreLabel() {
        if (!this.scoreLabel) {
            return;
        }

        this.scoreLabel.string = `Score: ${this._score}`;
    }

    private updateTimerLabel() {
        if (!this.timerLabel) {
            return;
        }

        this.timerLabel.string = `Time: ${Math.ceil(this._timeRemaining)}`;
    }

    private setMessage(message: string) {
        if (!this.messageLabel) {
            return;
        }

        this.messageLabel.string = message;
    }

    private setActionButtonVisible(visible: boolean) {
        if (!this.restartButtonNode) {
            return;
        }

        this.restartButtonNode.active = visible;
    }

    private setActionButtonText(text: string) {
        const buttonLabel = this.restartButtonNode?.getComponentInChildren(Label);

        if (!buttonLabel) {
            return;
        }

        buttonLabel.string = text;
    }

    private randomRange(min: number, max: number) {
        return min + Math.random() * (max - min);
    }
}
