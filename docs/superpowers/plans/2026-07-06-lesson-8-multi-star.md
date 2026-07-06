# Lesson 8 Multi-Star Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把单个运行时星星实例升级为固定数量的多个星星实例，并用数组管理它们。

**Architecture:** `GameManager` 继续引用同一个 `Star.prefab` 模板，但启动时根据 `starCount` 创建多个 `Node` 实例并保存到 `_starNodes: Node[]`。收集检测从单个节点判断改成循环检查数组，碰到哪个星星就只重生哪个星星。

**Tech Stack:** Cocos Creator 3.8.8, TypeScript, Cocos Prefab, `instantiate`, `Node[]`, `npm run typecheck`, Git.

---

## File Structure

- Modify: `assets/scripts/GameManager.ts`
  - 增加 `starCount` Inspector 配置。
  - `_starNode: Node | null` 改成 `_starNodes: Node[]`。
  - `createStarIfNeeded()` 改成 `createStarsIfNeeded()`。
  - `respawnStar()` 改成接收一个具体 `starNode` 参数。
  - `showReady()` 和 `startGame()` 重置所有星星。
  - `checkStarCollection()` 循环检查所有星星。
- Modify: `assets/scenes/Main.scene`
  - Cocos 刷新脚本属性后保存 `Star Count` 默认值。
- Create: `docs/lessons/lesson-8-multi-star.md`
  - 第 8 课技术总结。

---

### Task 1: 改造 GameManager 为多星星数组

**Files:**
- Modify: `assets/scripts/GameManager.ts`

- [ ] **Step 1: 新增 starCount 配置**

在 `gameDuration` 后面加入：

```ts
@property
public starCount = 3;
```

目标区域变成：

```ts
@property
public gameDuration = 20;

@property
public starCount = 3;

@property
public spawnMinX = -520;
```

- [ ] **Step 2: 把单个 Star 字段改成数组**

把：

```ts
private _starNode: Node | null = null;
```

改成：

```ts
private readonly _starNodes: Node[] = [];
```

- [ ] **Step 3: 更新 start() 创建方法名**

把：

```ts
this.createStarIfNeeded();
```

改成：

```ts
this.createStarsIfNeeded();
```

- [ ] **Step 4: 替换创建方法**

把整个 `createStarIfNeeded()` 方法替换成：

```ts
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
```

说明：

- `this.starPrefab` 是模板资源。
- `this._starNodes` 保存所有运行时实例。
- `while` 循环会补齐数量到 `starCount`。
- 本课不处理运行时减少 `starCount` 的情况。

- [ ] **Step 5: 在 showReady() 中重置所有星星**

把：

```ts
if (this._starNode) {
    this._starNode.active = true;
    this.respawnStar();
}
```

改成：

```ts
this.respawnAllStars();
```

- [ ] **Step 6: 在 startGame() 中重置所有星星**

把：

```ts
if (this._starNode) {
    this._starNode.active = true;
    this.respawnStar();
}
```

改成：

```ts
this.respawnAllStars();
```

- [ ] **Step 7: 新增 respawnAllStars()**

在 `collectStar()` 前面新增：

```ts
private respawnAllStars() {
    for (const starNode of this._starNodes) {
        starNode.active = true;
        this.respawnStar(starNode);
    }
}
```

- [ ] **Step 8: 改造 checkStarCollection()**

把整个 `checkStarCollection()` 方法替换成：

```ts
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
```

说明：

- `for...of` 逐个检查星星。
- 收集到一个后立刻 `return`，避免同一帧同时吃到多个星星导致分数跳太快。

- [ ] **Step 9: 改造 collectStar()**

把：

```ts
private collectStar() {
    this._score += 1;
    this.audioManager?.playCollect();
    this.updateScoreLabel();
    this.respawnStar();
}
```

改成：

```ts
private collectStar(starNode: Node) {
    this._score += 1;
    this.audioManager?.playCollect();
    this.updateScoreLabel();
    this.respawnStar(starNode);
}
```

- [ ] **Step 10: 改造 respawnStar()**

把整个 `respawnStar()` 方法替换成：

```ts
private respawnStar(starNode: Node) {
    const nextX = this.randomRange(this.spawnMinX, this.spawnMaxX);
    const nextY = this.randomRange(this.spawnMinY, this.spawnMaxY);
    this._nextStarPosition.set(nextX, nextY, 0);
    starNode.setPosition(this._nextStarPosition);
    starNode.active = true;
}
```

- [ ] **Step 11: Run typecheck**

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

- [ ] **Step 12: Commit**

```bash
git add assets/scripts/GameManager.ts
git commit -m "feat: spawn multiple stars"
```

---

### Task 2: 刷新 Cocos 场景属性

**Files:**
- Modify: `assets/scenes/Main.scene`

- [ ] **Step 1: 等待 Cocos 刷新脚本属性**

在 Cocos 中选中 `GameManager` 节点。

预期 Inspector 中出现：

```text
Star Count  3
```

如果没有出现：

1. 右键 `assets/scripts/GameManager`。
2. 选择重新导入或刷新资源。
3. 仍然没有时重启 Cocos Creator。

- [ ] **Step 2: 保存场景**

确认 `Star Count` 是 `3`，然后 `Ctrl + S` 保存场景。

- [ ] **Step 3: 检查场景文件**

Run:

```bash
Select-String -Path assets\scenes\Main.scene -Pattern 'starCount|starPrefab' -Context 1,3
```

Expected: 能看到 `starCount` 字段值为 `3`，`starPrefab` 仍引用 `cc.Prefab`。

- [ ] **Step 4: Commit**

```bash
git add assets/scenes/Main.scene
git commit -m "chore: save multi-star scene settings"
```

---

### Task 3: 手动验证多星星行为

**Files:**
- No code files.

- [ ] **Step 1: Cocos 预览运行**

在 Cocos 中点击预览按钮。

Expected:

- Ready 状态下能看到标题和 Start 按钮。
- 画面中能看到 3 个黄色星星。

- [ ] **Step 2: 验证收集任意星星**

操作：

1. 点击 Start。
2. 用 WASD 或方向键移动玩家碰到任意一个星星。

Expected:

- 分数增加 1。
- 收集音效播放。
- 被碰到的那个星星换到新位置。
- 其他星星保持可见。

- [ ] **Step 3: 验证 Restart**

操作：

1. 等倒计时结束进入 Game Over。
2. 点击 Restart。

Expected:

- Restart 点击音效正常。
- 游戏重新开始。
- 画面仍有 3 个星星。
- 所有星星重新随机摆放。

- [ ] **Step 4: 检查 Console**

Expected:

- 没有红色运行时报错。
- 没有 `starPrefab` 未绑定或数组访问异常。

---

### Task 4: 写第 8 课技术总结

**Files:**
- Create: `docs/lessons/lesson-8-multi-star.md`

- [ ] **Step 1: 创建课程总结**

写入：

```md
# 第 8 课：多星星生成

## 本课目标

把一个 `Star.prefab` 模板创建成多个运行时星星实例，并用数组统一管理。

## 今天真正掌握的东西

- 一个 Prefab 可以 `instantiate()` 出多个独立 Node。
- 单个对象适合用 `Node | null`，多个对象适合用 `Node[]`。
- `for...of` 可以逐个检查一组运行时对象。
- 收集到一个对象后可以立刻 `return`，避免同一帧处理多个收集。
- 批量生成是对象池、敌人刷怪、子弹系统的前置能力。

## 改造前后

改造前：

```text
GameManager._starNode -> 一个 Star Node
```

改造后：

```text
GameManager._starNodes -> 多个 Star Node
```

## 关键代码

```ts
private readonly _starNodes: Node[] = [];
```

```ts
while (this._starNodes.length < this.starCount) {
    const starNode = instantiate(this.starPrefab);
    parentNode.addChild(starNode);
    this._starNodes.push(starNode);
}
```

```ts
for (const starNode of this._starNodes) {
    if (!starNode.active) {
        continue;
    }

    if (distanceSquared <= collectDistanceSquared) {
        this.collectStar(starNode);
        return;
    }
}
```

## 技术总结

这一课的核心变化不是星星变多，而是数据结构变了：

```text
一个对象 -> 一个变量
多个对象 -> 一个数组
```

以后敌人、子弹、障碍物、掉落物都会使用同样的心智模型。

## 可以自己试的小改动

- 把 `Star Count` 改成 `5`，观察画面和收集逻辑。
- 想一想：如果星星之间不能重叠，随机位置函数要怎么改？
- 想一想：如果星星被收集后先隐藏 1 秒再出现，需要在哪个方法里改？
```

- [ ] **Step 2: Commit**

```bash
git add docs/lessons/lesson-8-multi-star.md
git commit -m "docs: add lesson 8 multi-star recap"
```

---

### Task 5: Final Verification and Push

**Files:**
- No code files.

- [ ] **Step 1: Run typecheck**

```bash
npm run typecheck
```

Expected: exit code 0。

- [ ] **Step 2: Confirm status**

```bash
git status -sb
```

Expected before push:

```text
## main...origin/main [ahead N]
```

- [ ] **Step 3: Push**

```bash
git push
```

Expected: `main -> main`。

