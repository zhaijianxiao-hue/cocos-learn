import { _decorator, Component, EventKeyboard, input, Input, KeyCode, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property
    public moveSpeed = 320;

    @property
    public minX = -560;

    @property
    public maxX = 560;

    @property
    public minY = -300;

    @property
    public maxY = 300;

    private readonly _moveDirection = new Vec3();
    private readonly _nextPosition = new Vec3();
    private _leftPressed = false;
    private _rightPressed = false;
    private _upPressed = false;
    private _downPressed = false;

    onEnable() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        const horizontal = Number(this._rightPressed) - Number(this._leftPressed);
        const vertical = Number(this._upPressed) - Number(this._downPressed);

        this._moveDirection.set(horizontal, vertical, 0);

        if (this._moveDirection.lengthSqr() === 0) {
            return;
        }

        this._moveDirection.normalize();
        this.node.getPosition(this._nextPosition);
        this._nextPosition.x += this._moveDirection.x * this.moveSpeed * deltaTime;
        this._nextPosition.y += this._moveDirection.y * this.moveSpeed * deltaTime;
        this._nextPosition.x = this.clamp(this._nextPosition.x, this.minX, this.maxX);
        this._nextPosition.y = this.clamp(this._nextPosition.y, this.minY, this.maxY);
        this.node.setPosition(this._nextPosition);
    }

    private onKeyDown(event: EventKeyboard) {
        this.updateKeyState(event.keyCode, true);
    }

    private onKeyUp(event: EventKeyboard) {
        this.updateKeyState(event.keyCode, false);
    }

    private updateKeyState(keyCode: KeyCode, pressed: boolean) {
        switch (keyCode) {
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this._leftPressed = pressed;
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this._rightPressed = pressed;
                break;
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this._upPressed = pressed;
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this._downPressed = pressed;
                break;
        }
    }

    private clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }
}
