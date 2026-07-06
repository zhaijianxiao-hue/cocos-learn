# Lesson 7 Star Prefab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把场景中的固定 `Star` 节点升级为 `Star.prefab`，并由 `GameManager` 在运行时创建星星实例。

**Architecture:** `Star.prefab` 作为资源模板保存在 `assets/prefabs`；`GameManager` 通过 `@property(Prefab)` 引用模板，并用 `instantiate()` 创建运行时 `Node` 实例。现有收集、重生、分数、音效和状态机逻辑保持不变，只把星星来源从“场景固定节点”改成“Prefab 模板实例化”。

**Tech Stack:** Cocos Creator 3.8.8, TypeScript, Cocos Prefab, `instantiate`, `npm run typecheck`, Git.

---

## File Structure

- Create: `assets/prefabs/Star.prefab`
  - Cocos 编辑器生成，保存星星模板。
- Create: `assets/prefabs/Star.prefab.meta`
  - Cocos 编辑器生成，保存 Prefab 资源身份。
- Create: `assets/prefabs.meta`
  - Cocos 编辑器生成，保存 `prefabs` 目录身份。
- Modify: `assets/scenes/Main.scene`
  - 删除场景中固定 `Star` 节点。
  - 将 `GameManager.starPrefab` 绑定到 `Star.prefab`。
- Modify: `assets/scripts/GameManager.ts`
  - 把 `starNode` 属性替换成 `starPrefab` 属性。
  - 新增运行时 `_starNode`。
  - 新增 `createStarIfNeeded()`。
  - 收集检测和重生逻辑改用 `_starNode`。
- Create: `docs/lessons/lesson-7-star-prefab.md`
  - 第 7 课技术总结。

---

### Task 1: 在 Cocos 中创建 Star Prefab

**Files:**
- Create: `assets/prefabs/Star.prefab`
- Create: `assets/prefabs/Star.prefab.meta`
- Create: `assets/prefabs.meta`
- Modify: `assets/scenes/Main.scene`

- [ ] **Step 1: 创建 prefabs 目录**

在 Cocos 资源面板中：

1. 右键 `assets`。
2. 选择 `Create -> Folder`。
3. 命名为 `prefabs`。

预期：文件系统中出现：

```text
assets/prefabs
assets/prefabs.meta
```

- [ ] **Step 2: 生成 Star.prefab**

在 Cocos 层级面板中：

1. 找到当前 `Canvas` 下的 `Star` 节点。
2. 将 `Star` 节点拖到资源面板的 `assets/prefabs` 文件夹里。
3. 确认资源面板出现 `Star` Prefab。

预期：文件系统中出现：

```text
assets/prefabs/Star.prefab
assets/prefabs/Star.prefab.meta
```

- [ ] **Step 3: 删除场景中的固定 Star 节点**

在 Cocos 层级面板中：

1. 选中 `Canvas` 下原来的 `Star` 节点。
2. 删除它。
3. 保存场景。

预期：场景启动后不再依赖手工摆放的固定 `Star`，后续由代码创建。

- [ ] **Step 4: 检查文件状态**

Run:

```bash
git status --short
```

Expected: 看到 `assets/prefabs` 和 `assets/scenes/Main.scene` 有变化。

- [ ] **Step 5: Commit**

```bash
git add assets/prefabs.meta assets/prefabs assets/scenes/Main.scene
git commit -m "feat: create star prefab"
```

---

### Task 2: 改造 GameManager 使用 Prefab 创建 Star

**Files:**
- Modify: `assets/scripts/GameManager.ts`

- [ ] **Step 1: 更新 import**

把第一行从：

```ts
import { _decorator, Component, Label, Node, Vec3 } from 'cc';
```

改为：

```ts
import { _decorator, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
```

- [ ] **Step 2: 替换 Inspector 属性**

把：

```ts
@property(Node)
public starNode: Node | null = null;
```

替换成：

```ts
@property(Prefab)
public starPrefab: Prefab | null = null;
```

- [ ] **Step 3: 新增运行时 Star 实例字段**

在私有字段区域加入：

```ts
private _starNode: Node | null = null;
```

字段区域应包含：

```ts
private _score = 0;
private _timeRemaining = 0;
private _state = GameState.Ready;
private _playerController: PlayerController | null = null;
private _starNode: Node | null = null;
private readonly _playerStartPosition = new Vec3();
private readonly _playerWorldPosition = new Vec3();
private readonly _starWorldPosition = new Vec3();
private readonly _nextStarPosition = new Vec3();
```

- [ ] **Step 4: 在 start() 中创建 Star 实例**

把 `start()` 改成：

```ts
start() {
    this._playerController = this.playerNode?.getComponent(PlayerController) ?? null;
    this.createStarIfNeeded();

    if (this.playerNode) {
        this.playerNode.getPosition(this._playerStartPosition);
    }

    this.showReady();
}
```

- [ ] **Step 5: 新增 createStarIfNeeded()**

在 `restartGame()` 后面新增：

```ts
private createStarIfNeeded() {
    if (this._starNode || !this.starPrefab) {
        return;
    }

    this._starNode = instantiate(this.starPrefab);
    this.node.parent?.addChild(this._starNode);
}
```

说明：

- `this.starPrefab` 是模板资源。
- `instantiate(this.starPrefab)` 创建一个新的运行时节点。
- `this.node.parent` 当前是 `Canvas`，所以星星实例仍然被放在 `Canvas` 下。

- [ ] **Step 6: 改造 showReady()**

把：

```ts
if (this.starNode) {
    this.starNode.active = true;
    this.respawnStar();
}
```

改成：

```ts
if (this._starNode) {
    this._starNode.active = true;
    this.respawnStar();
}
```

- [ ] **Step 7: 改造 startGame()**

把：

```ts
if (this.starNode) {
    this.starNode.active = true;
    this.respawnStar();
}
```

改成：

```ts
if (this._starNode) {
    this._starNode.active = true;
    this.respawnStar();
}
```

- [ ] **Step 8: 改造 checkStarCollection()**

把整个方法改成：

```ts
private checkStarCollection() {
    if (!this.playerNode || !this._starNode || !this._starNode.active) {
        return;
    }

    this.playerNode.getWorldPosition(this._playerWorldPosition);
    this._starNode.getWorldPosition(this._starWorldPosition);

    const offsetX = this._playerWorldPosition.x - this._starWorldPosition.x;
    const offsetY = this._playerWorldPosition.y - this._starWorldPosition.y;
    const distanceSquared = offsetX * offsetX + offsetY * offsetY;
    const collectDistanceSquared = this.collectDistance * this.collectDistance;

    if (distanceSquared <= collectDistanceSquared) {
        this.collectStar();
    }
}
```

- [ ] **Step 9: 改造 respawnStar()**

把整个方法改成：

```ts
private respawnStar() {
    if (!this._starNode) {
        return;
    }

    const nextX = this.randomRange(this.spawnMinX, this.spawnMaxX);
    const nextY = this.randomRange(this.spawnMinY, this.spawnMaxY);
    this._nextStarPosition.set(nextX, nextY, 0);
    this._starNode.setPosition(this._nextStarPosition);
    this._starNode.active = true;
}
```

- [ ] **Step 10: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected:

```text
> typecheck
> tsc --noEmit
```

并且命令退出码为 0。

- [ ] **Step 11: Commit**

```bash
git add assets/scripts/GameManager.ts
git commit -m "feat: instantiate star prefab at runtime"
```

---

### Task 3: 绑定 Star Prefab 到 GameManager

**Files:**
- Modify: `assets/scenes/Main.scene`

- [ ] **Step 1: 等待 Cocos 刷新脚本属性**

在 Cocos 中选中 `GameManager` 节点。

预期 Inspector 中：

- 原来的 `Star Node` 属性消失。
- 新的 `Star Prefab` 属性出现。

- [ ] **Step 2: 绑定 Star.prefab**

在 Cocos 中：

1. 从资源面板 `assets/prefabs` 拖 `Star` Prefab。
2. 放到 `GameManager` 组件的 `Star Prefab` 属性上。
3. 保存场景。

预期：`GameManager` 不再绑定场景节点，而是绑定 `Star.prefab` 资源。

- [ ] **Step 3: 检查场景文件**

Run:

```bash
Select-String -Path assets\scenes\Main.scene -Pattern 'starPrefab|Star.prefab|Star' -Context 1,3
```

Expected: 能看到 `starPrefab` 字段引用了 Prefab 的 UUID。

- [ ] **Step 4: Commit**

```bash
git add assets/scenes/Main.scene
git commit -m "chore: bind star prefab in scene"
```

---

### Task 4: 手动验证游戏行为

**Files:**
- No code files.

- [ ] **Step 1: Cocos 预览运行**

在 Cocos 中点击预览按钮。

Expected:

- Ready 状态下能看到标题和 Start 按钮。
- 画面中能看到一个黄色星星。

- [ ] **Step 2: 验证收集流程**

操作：

1. 点击 Start。
2. 用 WASD 或方向键移动玩家碰到星星。

Expected:

- 分数增加。
- 星星换到新的随机位置。
- 收集音效播放。

- [ ] **Step 3: 验证状态流程**

操作：

1. 等倒计时结束。
2. 确认 Game Over 出现。
3. 点击 Restart。

Expected:

- Game Over 音效播放。
- Restart 点击音效播放。
- 游戏重新开始。
- 星星仍然由 Prefab 创建并正常收集。

- [ ] **Step 4: 检查 Console**

Expected:

- 没有红色运行时报错。
- 没有因为 `starPrefab` 未绑定导致的异常。

---

### Task 5: 写第 7 课技术总结

**Files:**
- Create: `docs/lessons/lesson-7-star-prefab.md`

- [ ] **Step 1: 创建课程总结**

写入：

```md
# 第 7 课：Star Prefab 入门

## 本课目标

把场景中的固定 `Star` 节点升级成 `Star.prefab`，并由 `GameManager` 在运行时创建星星实例。

## 今天真正掌握的东西

- Prefab 是资源模板，不是场景里的具体对象。
- Node 是运行时实例，可以来自场景，也可以来自 `instantiate()`。
- `@property(Prefab)` 暴露的是资源引用槽。
- `instantiate(prefab)` 会从模板复制出一个新的节点实例。
- 先学会创建，再学习对象池和批量生成。

## 技术总结

改造前：

```text
GameManager.starNode -> 场景里的 Star 节点
```

改造后：

```text
GameManager.starPrefab -> assets/prefabs/Star.prefab
GameManager._starNode -> instantiate() 创建出来的运行时节点
```

这就是后续生成敌人、子弹、障碍物的基础模型。

## 可以自己试的小改动

- 把 `Star.prefab` 拖到场景里看看，它会变成一个实例。
- 修改 `StarView.radius` 后重新应用 Prefab，观察实例变化。
- 想一想：如果要同时出现 5 个星星，`_starNode` 应该变成什么数据结构？
```

- [ ] **Step 2: Commit**

```bash
git add docs/lessons/lesson-7-star-prefab.md
git commit -m "docs: add lesson 7 prefab recap"
```

---

### Task 6: Final Verification and Push

**Files:**
- No code files.

- [ ] **Step 1: Run typecheck**

```bash
npm run typecheck
```

Expected: exit code 0。

- [ ] **Step 2: Confirm clean status**

```bash
git status -sb
```

Expected:

```text
## main...origin/main [ahead N]
```

或推送后：

```text
## main...origin/main
```

- [ ] **Step 3: Push**

```bash
git push
```

Expected: `main -> main`。

