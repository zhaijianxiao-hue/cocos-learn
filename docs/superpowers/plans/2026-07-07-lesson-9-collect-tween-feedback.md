# Lesson 9 Collect Tween Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给星星收集加入短暂缩放 Tween 反馈，让收集事件有清晰视觉确认。

**Architecture:** `GameManager` 继续负责收集流程，但把“收集后立刻重生”改成“加分和音效立即发生，星星播放缩放 Tween，Tween 回调里重生”。用 `_collectingStars: Set<Node>` 标记正在播放反馈的星星，避免同一个星星在动效期间重复触发收集。

**Tech Stack:** Cocos Creator 3.8.8, TypeScript, Cocos `tween`, `Vec3`, `Set<Node>`, `npm run typecheck`, Git.

---

## File Structure

- Modify: `assets/scripts/GameManager.ts`
  - 引入 `tween`。
  - 新增 `collectScaleDuration` Inspector 配置。
  - 新增 `_collectingStars: Set<Node>`。
  - 收集检测跳过正在播放反馈的星星。
  - `collectStar()` 改为调用 `playCollectFeedback()`。
  - 新增 `playCollectFeedback()`。
  - `respawnStar()` 保证星星缩放恢复为 `Vec3.ONE`。
- Modify: `assets/scenes/Main.scene`
  - Cocos 刷新脚本属性后保存 `Collect Scale Duration` 默认值。
- Create: `docs/lessons/lesson-9-collect-tween-feedback.md`
  - 第 9 课技术总结。

---

### Task 1: 在 GameManager 中加入收集 Tween 反馈

**Files:**
- Modify: `assets/scripts/GameManager.ts`

- [ ] **Step 1: 更新 import**

把：

```ts
import { _decorator, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
```

改成：

```ts
import { _decorator, Component, instantiate, Label, Node, Prefab, tween, Vec3 } from 'cc';
```

- [ ] **Step 2: 新增 collectScaleDuration 配置**

在 `collectDistance` 后面加入：

```ts
@property
public collectScaleDuration = 0.08;
```

目标区域变成：

```ts
@property
public collectDistance = 58;

@property
public collectScaleDuration = 0.08;

@property
public gameDuration = 20;
```

- [ ] **Step 3: 新增正在收集的星星集合**

在 `_starNodes` 后面加入：

```ts
private readonly _collectingStars = new Set<Node>();
```

目标区域变成：

```ts
private _startPending = false;
private readonly _starNodes: Node[] = [];
private readonly _collectingStars = new Set<Node>();
private readonly _playerStartPosition = new Vec3();
```

- [ ] **Step 4: 收集检测跳过正在播放反馈的星星**

在 `checkStarCollection()` 的循环中，把：

```ts
if (!starNode.active) {
    continue;
}
```

改成：

```ts
if (!starNode.active || this._collectingStars.has(starNode)) {
    continue;
}
```

- [ ] **Step 5: 改造 collectStar()**

把：

```ts
private collectStar(starNode: Node) {
    this._score += 1;
    this.audioManager?.playCollect();
    this.updateScoreLabel();
    this.respawnStar(starNode);
}
```

改成：

```ts
private collectStar(starNode: Node) {
    this._score += 1;
    this.audioManager?.playCollect();
    this.updateScoreLabel();
    this.playCollectFeedback(starNode);
}
```

- [ ] **Step 6: 新增 playCollectFeedback()**

在 `collectStar()` 后面新增：

```ts
private playCollectFeedback(starNode: Node) {
    this._collectingStars.add(starNode);
    tween(starNode)
        .to(this.collectScaleDuration, { scale: Vec3.ZERO })
        .call(() => {
            this.respawnStar(starNode);
            this._collectingStars.delete(starNode);
        })
        .start();
}
```

说明：

- `tween(starNode)` 表示对这个节点做动效。
- `to(duration, { scale: Vec3.ZERO })` 表示缩放到 0。
- `call()` 表示动效结束后执行逻辑。
- `_collectingStars` 防止动效期间重复收集同一个星星。

- [ ] **Step 7: 确保 respawnStar() 恢复缩放**

把 `respawnStar()` 改成：

```ts
private respawnStar(starNode: Node) {
    const nextX = this.randomRange(this.spawnMinX, this.spawnMaxX);
    const nextY = this.randomRange(this.spawnMinY, this.spawnMaxY);
    this._nextStarPosition.set(nextX, nextY, 0);
    starNode.setPosition(this._nextStarPosition);
    starNode.setScale(Vec3.ONE);
    starNode.active = true;
}
```

- [ ] **Step 8: 在 respawnAllStars() 中清理收集状态**

把 `respawnAllStars()` 改成：

```ts
private respawnAllStars() {
    this._collectingStars.clear();

    for (const starNode of this._starNodes) {
        starNode.active = true;
        this.respawnStar(starNode);
    }
}
```

说明：Restart 或 Ready 重置时，清空所有正在收集的标记，避免旧状态影响新一局。

- [ ] **Step 9: Run typecheck**

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

- [ ] **Step 10: Commit**

```bash
git add assets/scripts/GameManager.ts
git commit -m "feat: add collect tween feedback"
```

---

### Task 2: 刷新 Cocos 场景属性

**Files:**
- Modify: `assets/scenes/Main.scene`

- [ ] **Step 1: 等待 Cocos 刷新脚本属性**

在 Cocos 中选中 `GameManager` 节点。

预期 Inspector 中出现：

```text
Collect Scale Duration  0.08
```

如果没有出现：

1. 右键 `assets/scripts/GameManager`。
2. 选择重新导入或刷新资源。
3. 仍然没有时重启 Cocos Creator。

- [ ] **Step 2: 保存场景**

确认 `Collect Scale Duration` 是 `0.08`，然后 `Ctrl + S` 保存场景。

- [ ] **Step 3: 检查场景文件**

Run:

```bash
Select-String -Path assets\scenes\Main.scene -Pattern 'collectScaleDuration|starCount|starPrefab' -Context 1,3
```

Expected: 能看到 `collectScaleDuration` 字段值为 `0.08`，`starCount` 仍为 `3`，`starPrefab` 仍引用 `cc.Prefab`。

- [ ] **Step 4: Commit**

```bash
git add assets/scenes/Main.scene
git commit -m "chore: save collect feedback scene settings"
```

---

### Task 3: 手动验证收集反馈

**Files:**
- No code files.

- [ ] **Step 1: Cocos 预览运行**

在 Cocos 中点击预览按钮。

Expected:

- Ready 状态正常。
- 画面仍有 3 个星星。

- [ ] **Step 2: 验证收集反馈**

操作：

1. 点击 Start。
2. 用 WASD 或方向键移动玩家碰到任意一个星星。

Expected:

- 分数增加 1。
- 收集音效播放。
- 被收集星星有短暂缩放反馈。
- 反馈结束后星星出现在新位置。
- 其他星星不受影响。

- [ ] **Step 3: 验证重复收集保护**

操作：

1. 贴近一个星星收集它。
2. 观察分数变化。

Expected:

- 单次收集只加 1 分。
- 不会因为 Tween 期间连续检测而一口气加多分。

- [ ] **Step 4: 验证 Restart**

操作：

1. 等倒计时结束进入 Game Over。
2. 点击 Restart。

Expected:

- Restart 点击音效正常。
- 游戏重新开始。
- 星星缩放都恢复正常。
- 画面仍有 3 个星星。

- [ ] **Step 5: 检查 Console**

Expected:

- 没有红色运行时报错。
- 没有 Tween 或空引用相关错误。

---

### Task 4: 写第 9 课技术总结

**Files:**
- Create: `docs/lessons/lesson-9-collect-tween-feedback.md`

- [ ] **Step 1: 创建课程总结**

写入：

```md
# 第 9 课：收集 Tween 反馈

## 本课目标

给星星收集加入短暂缩放反馈，让玩家更清楚地感知“我收到了这个星星”。

## 今天真正掌握的东西

- `tween(node)` 可以对一个节点做属性变化。
- `to(duration, props)` 表示在一段时间内把属性变到目标值。
- `call()` 可以在 Tween 中插入逻辑回调。
- scale 是缩放，不是位置。
- 动效期间需要防止同一个对象被重复收集。

## 关键代码

```ts
private readonly _collectingStars = new Set<Node>();
```

```ts
tween(starNode)
    .to(this.collectScaleDuration, { scale: Vec3.ZERO })
    .call(() => {
        this.respawnStar(starNode);
        this._collectingStars.delete(starNode);
    })
    .start();
```

```ts
if (!starNode.active || this._collectingStars.has(starNode)) {
    continue;
}
```

## 技术总结

这一课的核心不是“星星变小”，而是把玩法事件拆成两条线：

```text
规则线：加分、播放音效、防止重复收集
表现线：缩放反馈、动效结束后重生
```

规则线必须稳定，表现线可以继续打磨。以后受击、爆炸、按钮反馈、敌人死亡动画都会用类似思路。

## 踩坑点

不能在动效开始前把星星 `active = false`，否则星星会隐藏，玩家看不到 Tween。正确做法是用 `_collectingStars` 标记它正在播放反馈，检测时跳过它。

## 可以自己试的小改动

- 把 `Collect Scale Duration` 改成 `0.15`，观察手感变化。
- 把 `Vec3.ZERO` 改成 `new Vec3(1.3, 1.3, 1)`，试试放大反馈。
- 想一想：如果要先放大再缩小，需要怎么链式调用 Tween？
```

- [ ] **Step 2: Commit**

```bash
git add docs/lessons/lesson-9-collect-tween-feedback.md
git commit -m "docs: add lesson 9 tween feedback recap"
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

