# 第 4 课：倒计时失败和重新开始 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 加入倒计时、失败状态和重新开始按钮：倒计时归零后游戏停止，玩家不能继续移动，点击按钮可重置分数、时间、玩家和星星。

**Architecture:** 第 4 课让 `GameManager` 成为游戏状态的唯一管理者，负责倒计时、失败、重开和 UI 更新。`PlayerController` 增加 `setControlEnabled` 方法，让外部可以启停玩家输入，但仍只负责玩家移动本身。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript、Cocos Button、Cocos Label、Scene Node 引用、游戏状态管理。

---

## 文件结构

- Modify: `assets/scripts/PlayerController.ts`
  - 增加 `setControlEnabled`，失败时禁用移动并清空输入状态。
- Modify: `assets/scripts/GameManager.ts`
  - 增加倒计时、失败状态、重开逻辑、UI 文本更新和按钮事件入口。
- Modify: `assets/scenes/Main.scene`
  - 添加 `TimerLabel`、`MessageLabel`、`RestartButton`，并在 Inspector 绑定到 `GameManager`。
- Create: `docs/lessons/lesson-4-timer-failure-restart.md`
  - 第 4 课中文复盘和技术总结。

## Task 1: 让 PlayerController 支持启停控制

**Files:**
- Modify: `assets/scripts/PlayerController.ts`

- [ ] **Step 1: 修改 `PlayerController.ts`**

Replace `assets/scripts/PlayerController.ts` with this content:

```ts
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
    private _controlEnabled = true;

    onEnable() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        if (!this._controlEnabled) {
            return;
        }

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

    public setControlEnabled(enabled: boolean) {
        this._controlEnabled = enabled;

        if (!enabled) {
            this.clearInputState();
        }
    }

    private onKeyDown(event: EventKeyboard) {
        if (!this._controlEnabled) {
            return;
        }

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

    private clearInputState() {
        this._leftPressed = false;
        this._rightPressed = false;
        this._upPressed = false;
        this._downPressed = false;
    }

    private clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }
}
```

- [ ] **Step 2: 等待 Cocos 重新编译脚本**

回到 Cocos Creator，等待 Console 没有脚本编译错误。

- [ ] **Step 3: Commit**

```powershell
git add assets/scripts/PlayerController.ts
git commit -m "feat: allow disabling player control"
```

## Task 2: 给 GameManager 加倒计时、失败和重开

**Files:**
- Modify: `assets/scripts/GameManager.ts`

- [ ] **Step 1: 修改 `GameManager.ts`**

Replace `assets/scripts/GameManager.ts` with this content:

```ts
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
```

- [ ] **Step 2: 等待 Cocos 重新编译脚本**

回到 Cocos Creator，等待 `GameManager` 组件在 Inspector 中出现新的 UI 引用和 `Game Duration` 属性。

- [ ] **Step 3: Commit**

```powershell
git add assets/scripts/GameManager.ts
git commit -m "feat: add timer and restart game state"
```

## Task 3: 在场景中添加倒计时、消息和重开按钮

**Files:**
- Modify: `assets/scenes/Main.scene`

- [ ] **Step 1: 创建 TimerLabel**

在 Cocos Creator 的 Hierarchy 面板中：

```text
Canvas -> 右键 -> Create -> 2D Object -> Label
```

命名为：

```text
TimerLabel
```

Inspector 设置：

```text
Position: x = 500, y = 300
Label String: Time: 20
Font Size: 32
Color: 白色
```

- [ ] **Step 2: 创建 MessageLabel**

在 Hierarchy 面板中：

```text
Canvas -> 右键 -> Create -> 2D Object -> Label
```

命名为：

```text
MessageLabel
```

Inspector 设置：

```text
Position: x = 0, y = 120
Label String: 留空
Font Size: 42
Color: 白色
```

- [ ] **Step 3: 创建 RestartButton**

在 Hierarchy 面板中：

```text
Canvas -> 右键 -> Create -> UI Component -> Button
```

命名为：

```text
RestartButton
```

设置 `RestartButton` 节点：

```text
Position: x = 0, y = 40
Active: false
```

把按钮子节点里的文字改成：

```text
Restart
```

- [ ] **Step 4: 绑定 RestartButton 点击事件**

选中 `RestartButton`，在 `Button` 组件的 Click Events 中添加一个事件：

```text
Target: 拖拽 Hierarchy 里的 GameManager 节点
Component: GameManager
Handler: restartGame
```

- [ ] **Step 5: 绑定 GameManager 新引用**

选中 `GameManager` 节点，在 `GameManager` 组件中设置：

```text
Player Node: Player
Star Node: Star
Score Label: ScoreLabel
Timer Label: TimerLabel
Message Label: MessageLabel
Restart Button Node: RestartButton
Collect Distance: 58
Game Duration: 20
Spawn Min X: -520
Spawn Max X: 520
Spawn Min Y: -280
Spawn Max Y: 280
```

- [ ] **Step 6: 保存场景**

在 Cocos Creator 中执行：

```text
Ctrl + S
```

- [ ] **Step 7: Commit**

```powershell
git add assets/scenes/Main.scene
git commit -m "feat: add timer and restart UI"
```

## Task 4: 手动运行验证

**Files:**
- No file changes expected.

- [ ] **Step 1: 验证初始状态**

在 Cocos Creator 顶部点击预览运行按钮。

Expected:

```text
Score: 0 可见
Time: 20 可见
Restart 按钮初始不可见
玩家可以移动
星星可以收集并重生
Console 没有脚本报错
```

- [ ] **Step 2: 验证失败状态**

等待倒计时归零。

Expected:

```text
出现 Game Over Score: 当前分数
Restart 按钮出现
玩家不能继续移动
星星不再触发收集
Console 没有脚本报错
```

- [ ] **Step 3: 验证重新开始**

点击 `Restart` 按钮。

Expected:

```text
Score 回到 0
Time 回到 20
Game Over 文本清空
Restart 按钮隐藏
玩家回到初始位置并可以移动
星星重新出现在可玩区域
Console 没有脚本报错
```

## Task 5: 记录第 4 课复盘和技术总结

**Files:**
- Create: `docs/lessons/lesson-4-timer-failure-restart.md`

- [ ] **Step 1: 创建复盘文档**

Create `docs/lessons/lesson-4-timer-failure-restart.md` with this content:

```md
# 第 4 课：倒计时失败和重新开始

## 本课目标

加入倒计时、失败状态和重新开始按钮。倒计时归零后游戏停止，玩家不能继续移动；点击 Restart 后重置分数、时间、玩家和星星。

## 今天真正掌握的东西

- 游戏状态是协调多个对象行为的核心。
- `GameManager` 可以作为状态机入口，决定当前是游玩中还是失败状态。
- `PlayerController` 不需要知道游戏为什么结束，只需要暴露启停控制的方法。
- UI 不只是显示数据，也可以通过 Button 触发脚本方法。

## 技术总结

第 4 课引入了第一个明确的游戏状态：

```text
Playing
    ↓ 时间归零
GameOver
    ↓ 点击 Restart
Playing
```

状态变化由 `GameManager` 管理：

```text
倒计时减少
    ↓
归零
    ↓
设置 _gameOver = true
    ↓
禁用 PlayerController
    ↓
显示 Game Over 和 Restart
```

这里的关键职责边界是：

```text
GameManager
└─ 决定游戏是否结束、何时重开

PlayerController
└─ 只提供 setControlEnabled，让外部启停控制
```

如果以后 AI 把倒计时写进 `PlayerController`，或者让按钮直接改一堆玩家状态，就要警惕：游戏状态应该由统一入口管理。

## 可以自己试的小改动

- 把 `Game Duration` 改成 `10`，观察失败节奏变化。
- 在失败状态下尝试按 WASD，确认玩家不能移动。
- 点击 Restart 后，观察所有状态是否都回到起点。
```

- [ ] **Step 2: Commit**

```powershell
git add docs/lessons/lesson-4-timer-failure-restart.md
git commit -m "docs: add lesson 4 recap"
```

## Task 6: 同步第 4 课进度

**Files:**
- No file changes expected.

- [ ] **Step 1: 查看提交历史**

Run:

```powershell
git log --oneline -8
```

Expected includes:

```text
docs: add lesson 4 recap
feat: add timer and restart UI
feat: add timer and restart game state
feat: allow disabling player control
docs: add lesson 3 recap
```

- [ ] **Step 2: 确认工作区干净**

Run:

```powershell
git status -sb
```

Expected:

```text
## main...origin/main [ahead 4]
```

- [ ] **Step 3: 推送到 GitHub**

Run:

```powershell
git push
```

Expected:

```text
main -> main
```

## 自检

- 设计文档中的第 4 课目标由 Task 1 到 Task 5 覆盖。
- 本计划只实现倒计时、失败状态和重新开始，不加入敌人、音效或复杂菜单。
- 每课结束包含技术总结。
- 需要你阅读的内容全部使用中文。
- 没有使用占位描述或未定实现说明。
