# 第 3 课：星星重生和玩家边界 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让星星被收集后在可玩区域内随机重生，并限制玩家不能移出可玩区域。

**Architecture:** 第 3 课继续使用现有 `PlayerController` 和 `GameManager`，不新增复杂系统。`PlayerController` 增加边界限制，负责保证玩家移动后仍在指定矩形范围内；`GameManager` 在收集星星后不再隐藏星星，而是把星星移动到新的随机位置并继续游戏循环。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript、Vec3、Math.random、Inspector 属性配置、简单边界约束。

---

## 文件结构

- Modify: `assets/scripts/PlayerController.ts`
  - 增加 `minX`、`maxX`、`minY`、`maxY` 属性，并在移动后限制位置。
- Modify: `assets/scripts/GameManager.ts`
  - 增加星星随机生成范围，收集后重置星星位置而不是隐藏。
- Modify: `assets/scenes/Main.scene`
  - 在 Inspector 中配置玩家边界和星星随机范围。
- Create: `docs/lessons/lesson-3-spawn-and-bounds.md`
  - 第 3 课中文复盘和技术总结。

## Task 1: 给 PlayerController 加边界限制

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
```

- [ ] **Step 2: 等待 Cocos 重新编译脚本**

回到 Cocos Creator，等待 Console 没有脚本编译错误。

- [ ] **Step 3: Commit**

```powershell
git add assets/scripts/PlayerController.ts
git commit -m "feat: keep player inside play area"
```

## Task 2: 让星星收集后随机重生

**Files:**
- Modify: `assets/scripts/GameManager.ts`

- [ ] **Step 1: 修改 `GameManager.ts`**

Replace `assets/scripts/GameManager.ts` with this content:

```ts
import { _decorator, Component, Label, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node)
    public playerNode: Node | null = null;

    @property(Node)
    public starNode: Node | null = null;

    @property(Label)
    public scoreLabel: Label | null = null;

    @property
    public collectDistance = 58;

    @property
    public spawnMinX = -520;

    @property
    public spawnMaxX = 520;

    @property
    public spawnMinY = -280;

    @property
    public spawnMaxY = 280;

    private _score = 0;
    private readonly _playerWorldPosition = new Vec3();
    private readonly _starWorldPosition = new Vec3();
    private readonly _nextStarPosition = new Vec3();

    start() {
        this.updateScoreLabel();
    }

    update() {
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

    private updateScoreLabel() {
        if (!this.scoreLabel) {
            return;
        }

        this.scoreLabel.string = `Score: ${this._score}`;
    }

    private randomRange(min: number, max: number) {
        return min + Math.random() * (max - min);
    }
}
```

- [ ] **Step 2: 等待 Cocos 重新编译脚本**

回到 Cocos Creator，等待 `GameManager` 组件在 Inspector 中出现新的生成范围属性。

- [ ] **Step 3: Commit**

```powershell
git add assets/scripts/GameManager.ts
git commit -m "feat: respawn star after collection"
```

## Task 3: 在 Inspector 中配置边界和生成范围

**Files:**
- Modify: `assets/scenes/Main.scene`

- [ ] **Step 1: 配置 PlayerController 边界**

选中 Hierarchy 里的 `Player`，在 `PlayerController` 组件中设置：

```text
Move Speed: 320
Min X: -560
Max X: 560
Min Y: -300
Max Y: 300
```

- [ ] **Step 2: 配置 GameManager 生成范围**

选中 Hierarchy 里的 `GameManager`，在 `GameManager` 组件中确认引用仍然存在，并设置：

```text
Player Node: Player
Star Node: Star
Score Label: ScoreLabel
Collect Distance: 58
Spawn Min X: -520
Spawn Max X: 520
Spawn Min Y: -280
Spawn Max Y: 280
```

- [ ] **Step 3: 保存场景**

在 Cocos Creator 中执行：

```text
Ctrl + S
```

- [ ] **Step 4: Commit**

```powershell
git add assets/scenes/Main.scene
git commit -m "chore: configure lesson 3 gameplay bounds"
```

## Task 4: 手动运行验证

**Files:**
- No file changes expected.

- [ ] **Step 1: 运行场景**

在 Cocos Creator 顶部点击预览运行按钮。

- [ ] **Step 2: 验证玩家边界**

Expected:

```text
Player 不能移出可玩区域左侧
Player 不能移出可玩区域右侧
Player 不能移出可玩区域上侧
Player 不能移出可玩区域下侧
Console 没有脚本报错
```

- [ ] **Step 3: 验证星星重生**

Expected:

```text
移动 Player 靠近 Star 后，Score 增加 1
Star 不再永久隐藏，而是出现在新位置
连续收集多次，Score 持续增加
Star 的新位置始终在可玩区域内
Console 没有脚本报错
```

## Task 5: 记录第 3 课复盘和技术总结

**Files:**
- Create: `docs/lessons/lesson-3-spawn-and-bounds.md`

- [ ] **Step 1: 创建复盘文档**

Create `docs/lessons/lesson-3-spawn-and-bounds.md` with this content:

```md
# 第 3 课：星星重生和玩家边界

## 本课目标

把一次性收集升级成可重复游戏循环：玩家收集星星后，分数增加，星星在可玩区域内随机重生；玩家移动时不能离开可玩区域。

## 今天真正掌握的东西

- 游戏循环不只是 `update`，也包括“事件发生后如何回到下一轮可玩状态”。
- 边界限制是把计算后的下一帧位置夹在一个合法范围内。
- 随机生成不是随便给坐标，而是在设计好的区域内生成坐标。
- `PlayerController` 负责玩家自身移动规则，`GameManager` 负责跨对象的游戏规则。

## 技术总结

第 1 课里，玩家能移动。第 2 课里，玩家能收集一次星星。第 3 课把这两者变成了持续玩法：

```text
移动玩家
    ↓
靠近星星
    ↓
GameManager 判断收集成立
    ↓
分数增加
    ↓
星星移动到新随机位置
    ↓
继续下一轮
```

这里的核心是职责边界：

```text
PlayerController
└─ 只关心玩家移动是否合法

GameManager
└─ 关心分数、星星位置和游戏规则推进
```

如果以后 AI 把随机星星生成写进 `PlayerController`，就要警惕：那是在把“游戏规则”塞回“玩家控制”里。

## 可以自己试的小改动

- 把玩家边界改小一点，观察活动范围变化。
- 把星星生成范围改小一点，观察星星是否集中出现。
- 把 `Collect Distance` 改大，观察是否更容易收集。
```

- [ ] **Step 2: Commit**

```powershell
git add docs/lessons/lesson-3-spawn-and-bounds.md
git commit -m "docs: add lesson 3 recap"
```

## Task 6: 同步第 3 课进度

**Files:**
- No file changes expected.

- [ ] **Step 1: 查看提交历史**

Run:

```powershell
git log --oneline -8
```

Expected includes:

```text
docs: add lesson 3 recap
chore: configure lesson 3 gameplay bounds
feat: respawn star after collection
feat: keep player inside play area
docs: add lesson 2 recap
```

- [ ] **Step 2: 确认工作区干净**

Run:

```powershell
git status -sb
```

Expected:

```text
## main...origin/main [ahead 5]
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

- 设计文档中的第 3 课目标由 Task 1 到 Task 5 覆盖。
- 本计划只实现星星重生、随机位置和玩家边界，不加入危险物、计时器或失败条件。
- 每课结束技术总结已写入复盘要求。
- 需要你阅读的内容全部使用中文。
- 没有使用占位描述或未定实现说明。
