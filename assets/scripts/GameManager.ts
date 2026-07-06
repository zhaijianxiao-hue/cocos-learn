import { _decorator, Component, Label, Node, Vec3 } from 'cc';
import { PlayerController } from './PlayerController';

const { ccclass, property } = _decorator;

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
    private _gameOver = false;
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

        this.restartGame();
    }

    update(deltaTime: number) {
        if (this._gameOver) {
            return;
        }

        this.tickTimer(deltaTime);
        this.checkStarCollection();
    }

    public restartGame() {
        this._score = 0;
        this._timeRemaining = this.gameDuration;
        this._gameOver = false;

        if (this.playerNode) {
            this.playerNode.setPosition(this._playerStartPosition);
        }

        if (this.starNode) {
            this.starNode.active = true;
            this.respawnStar();
        }

        this._playerController?.setControlEnabled(true);
        this.setRestartVisible(false);
        this.setMessage('');
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
        this._gameOver = true;
        this._playerController?.setControlEnabled(false);
        this.setMessage(`Game Over  Score: ${this._score}`);
        this.setRestartVisible(true);
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

    private setRestartVisible(visible: boolean) {
        if (!this.restartButtonNode) {
            return;
        }

        this.restartButtonNode.active = visible;
    }

    private randomRange(min: number, max: number) {
        return min + Math.random() * (max - min);
    }
}
