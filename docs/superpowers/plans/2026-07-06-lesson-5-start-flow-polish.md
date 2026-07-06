# 第 5 课：开始流程和基础打磨 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 加入明确的开始状态：进入预览后先显示标题和 Start 按钮，点击后才开始倒计时和游玩；失败后同一个按钮变成 Restart。

**Architecture:** 将 `GameManager` 从 `_gameOver` 布尔值升级为 `GameState` 状态机，包含 `Ready`、`Playing`、`GameOver`。`RestartButton` 节点继续复用，但按钮文字由 `GameManager` 控制：Ready 状态显示 `Start`，GameOver 状态显示 `Restart`。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript、Cocos Button、Cocos Label、状态机、UI 文案控制。

---

## 文件结构

- Modify: `assets/scripts/GameManager.ts`
  - 增加 `GameState`，拆分 `showReady`、`startGame`、`restartGame`、`endGame`，并控制按钮文本。
- Modify: `assets/scenes/Main.scene`
  - 将 `MessageLabel` 初始文本调整为游戏标题，确认按钮事件仍指向 `restartGame`。
- Create: `docs/lessons/lesson-5-start-flow-polish.md`
  - 第 5 课中文复盘和技术总结。

## Task 1: 将 GameManager 升级为明确状态机

**Files:**
- Modify: `assets/scripts/GameManager.ts`

- [ ] **Step 1: 修改 `GameManager.ts`**

Replace `assets/scripts/GameManager.ts` with this content:

```ts
import { _decorator, Component, Label, Node, Vec3 } from 'cc';
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
```

- [ ] **Step 2: 等待 Cocos 重新编译脚本**

回到 Cocos Creator，等待 Console 没有脚本编译错误。

- [ ] **Step 3: Commit**

```powershell
git add assets/scripts/GameManager.ts
git commit -m "feat: add start state to game flow"
```

## Task 2: 调整场景初始 UI

**Files:**
- Modify: `assets/scenes/Main.scene`

- [ ] **Step 1: 确认 RestartButton 事件**

选中 `RestartButton`，确认 `Button -> Click Events` 仍然是：

```text
Target: GameManager
Component: GameManager
Handler: restartGame
```

- [ ] **Step 2: 设置 MessageLabel 初始文案**

选中 `MessageLabel`，设置：

```text
Label String: Star Catcher
Font Size: 42
Position: x = 0, y = 120
```

- [ ] **Step 3: 设置 RestartButton 初始状态**

选中 `RestartButton`，设置：

```text
Active: true
Position: x = 0, y = 40
```

把按钮子节点文字改为：

```text
Start
```

- [ ] **Step 4: 保存场景**

在 Cocos Creator 中执行：

```text
Ctrl + S
```

- [ ] **Step 5: Commit**

```powershell
git add assets/scenes/Main.scene
git commit -m "chore: configure start screen UI"
```

## Task 3: 手动运行验证

**Files:**
- No file changes expected.

- [ ] **Step 1: 验证初始 Ready 状态**

运行预览。

Expected:

```text
显示 Star Catcher
显示 Start 按钮
Score: 0
Time: 20
玩家不能移动
倒计时不减少
Console 没有脚本报错
```

- [ ] **Step 2: 验证 Playing 状态**

点击 Start。

Expected:

```text
Star Catcher 文案消失
Start 按钮隐藏
玩家可以移动
倒计时开始减少
星星可以收集并重生
Console 没有脚本报错
```

- [ ] **Step 3: 验证 GameOver 和 Restart**

等待时间归零。

Expected:

```text
显示 Game Over Score: 当前分数
按钮显示 Restart
玩家不能移动
点击 Restart 后回到 Playing
Score 回到 0
Time 回到 20
Console 没有脚本报错
```

## Task 4: 记录第 5 课复盘和技术总结

**Files:**
- Create: `docs/lessons/lesson-5-start-flow-polish.md`

- [ ] **Step 1: 创建复盘文档**

Create `docs/lessons/lesson-5-start-flow-polish.md` with this content:

```md
# 第 5 课：开始流程和基础打磨

## 本课目标

加入明确的开始状态：进入游戏后先显示标题和 Start 按钮，点击 Start 后才开始倒计时和玩法；失败后按钮变成 Restart。

## 今天真正掌握的东西

- 布尔值适合两个状态，但状态变多后应该升级成明确的状态机。
- `Ready`、`Playing`、`GameOver` 比 `_gameOver: boolean` 更能表达游戏流程。
- 同一个按钮可以在不同状态下显示不同文案，触发同一个入口方法。
- UI 文案和按钮显隐应该由状态统一驱动，而不是散落在多个地方。

## 技术总结

第 4 课只有两个状态：

```text
Playing
GameOver
```

第 5 课加入开始界面后，状态变成：

```text
Ready -> Playing -> GameOver -> Playing
```

这时候如果继续用 `_gameOver` 布尔值，代码会越来越别扭，因为它只能表达“是不是结束”，不能表达“是否还没开始”。

所以我们引入：

```ts
enum GameState {
    Ready,
    Playing,
    GameOver,
}
```

以后状态更多时，例如 `Paused`、`LevelComplete`，也可以继续扩展。

## 可以自己试的小改动

- 把标题 `Star Catcher` 改成自己的游戏名。
- 把按钮初始文案改成 `Play`。
- 增加一个 `Paused` 状态之前，先想清楚它和 `GameOver` 的区别。
```

- [ ] **Step 2: Commit**

```powershell
git add docs/lessons/lesson-5-start-flow-polish.md
git commit -m "docs: add lesson 5 recap"
```

## Task 5: 同步第 5 课进度

**Files:**
- No file changes expected.

- [ ] **Step 1: 查看提交历史**

Run:

```powershell
git log --oneline -8
```

Expected includes:

```text
docs: add lesson 5 recap
chore: configure start screen UI
feat: add start state to game flow
docs: add lesson 4 recap
```

- [ ] **Step 2: 确认工作区干净**

Run:

```powershell
git status -sb
```

Expected:

```text
## main...origin/main [ahead 3]
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

- 设计文档中的第 5 课目标由 Task 1 到 Task 4 覆盖。
- 本计划只实现开始状态、按钮文案切换和状态机，不加入音效、关卡或复杂菜单。
- 每课结束包含技术总结。
- 需要你阅读的内容全部使用中文。
- 没有使用占位描述或未定实现说明。
