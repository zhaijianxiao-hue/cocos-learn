import { _decorator, Component, Label, Node, Vec3 } from 'cc';
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

    @property(Node)
    public starNode: Node | null = null;

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
    private readonly _playerStartPosition = new Vec3();
    private readonly _playerWorldPosition = new Vec3();
    private readonly _starWorldPosition = new Vec3();
    private readonly _nextStarPosition = new Vec3();

    start() {
        this._playerController = this.playerNode?.getComponent(PlayerController) ?? null;

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
        if (this._state === GameState.Ready || this._state === GameState.GameOver) {
            this.startGame();
        }
    }

    private showReady() {
        this._state = GameState.Ready;
        this._score = 0;
        this._timeRemaining = this.gameDuration;

        if (this.playerNode) {
            this.playerNode.setPosition(this._playerStartPosition);
        }

        if (this.starNode) {
            this.starNode.active = true;
            this.respawnStar();
        }

        this._playerController?.setControlEnabled(false);
        this.setMessage('Star Catcher');
        this.setActionButtonVisible(true);
        this.setActionButtonText('Start');
        this.updateScoreLabel();
        this.updateTimerLabel();
    }

    private startGame() {
        this.audioManager?.playClick();

        this._state = GameState.Playing;
        this._score = 0;
        this._timeRemaining = this.gameDuration;

        if (this.playerNode) {
            this.playerNode.setPosition(this._playerStartPosition);
        }

        if (this.starNode) {
            this.starNode.active = true;
            this.respawnStar();
        }

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
        if (!this.playerNode || !this.starNode || !this.starNode.active) {
            return;
        }

        this.playerNode.getWorldPosition(this._playerWorldPosition);
        this.starNode.getWorldPosition(this._starWorldPosition);

        const offsetX = this._playerWorldPosition.x - this._starWorldPosition.x;
        const offsetY = this._playerWorldPosition.y - this._starWorldPosition.y;
        const distanceSquared = offsetX * offsetX + offsetY * offsetY;
        const collectDistanceSquared = this.collectDistance * this.collectDistance;

        if (distanceSquared <= collectDistanceSquared) {
            this.collectStar();
        }
    }

    private collectStar() {
        this._score += 1;
        this.audioManager?.playCollect();
        this.updateScoreLabel();
        this.respawnStar();
    }

    private respawnStar() {
        if (!this.starNode) {
            return;
        }

        const nextX = this.randomRange(this.spawnMinX, this.spawnMaxX);
        const nextY = this.randomRange(this.spawnMinY, this.spawnMaxY);
        this._nextStarPosition.set(nextX, nextY, 0);
        this.starNode.setPosition(this._nextStarPosition);
        this.starNode.active = true;
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
