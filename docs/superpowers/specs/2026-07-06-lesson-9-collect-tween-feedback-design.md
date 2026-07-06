# 第 9 课设计：收集 Tween 反馈

## 课程目标

第 9 课要给星星收集加入一个很短的视觉反馈：玩家碰到星星后，星星先做一个缩放动效，再移动到新的随机位置。

本课重点是建立 Tween 的心智：

```text
Tween = 用代码描述一段属性变化
scale = 节点的缩放
position = 节点的位置
动效 = 表现反馈，不应该改变游戏规则本身
```

## 当前状态

当前 `Star Catcher` 已经具备：

- `Star.prefab` 模板。
- `starCount = 3`。
- `_starNodes: Node[]` 管理多个运行时星星。
- 玩家碰到任意一个星星后加分、播放音效、立刻重生该星星。

当前收集流程很直接：

```text
碰到星星
-> 加分
-> 播放音效
-> 星星立刻换位置
```

这个逻辑能跑，但反馈偏硬。玩家会看到星星瞬间跳走，缺少“我收到了”的视觉确认。

## 方案选择

### 方案 A：Tween 缩放反馈

收集时把被碰到的星星缩小到 0，再恢复到 1，并在缩小后重生到新位置。

优点：

- 只需要代码，不需要额外资源。
- 能清楚训练 `tween()`、`Vec3`、回调顺序。
- 和当前 Graphics 绘制的星星兼容。

缺点：

- 视觉仍然比较基础。

### 方案 B：粒子或爆炸特效

收集时生成粒子、闪光或爆炸。

优点：

- 视觉效果更明显。

缺点：

- 会引入粒子系统、资源、生命周期管理。
- 对本课来说概念过多。

### 方案 C：分数飘字

收集时生成 `+1` 文字，向上飘并淡出。

优点：

- 很像完整游戏里的反馈。

缺点：

- 会引入 Label Prefab、UI 层级、销毁或复用。
- 更适合作为后续 UI 反馈课程。

## 推荐方案

采用方案 A：Tween 缩放反馈。

理由：它只引入一个核心概念 `tween()`，但能明显改善游戏手感。我们不额外引入粒子、图片或飘字，避免一次课塞太多东西。

## 本课范围

包含：

- `GameManager` 引入 Cocos 的 `tween`。
- 新增 `collectScaleDuration` 配置，默认 `0.08` 秒。
- 收集星星后先加分和播放音效。
- 被收集的星星先缩小。
- 缩小结束后重生到新位置。
- 重生后恢复正常缩放。

不包含：

- 粒子系统。
- 飘字。
- 图片资源替换。
- 按钮动效。
- 对所有星星做闲置动画。

## 对象关系

改造前：

```text
collectStar(starNode)
-> updateScoreLabel()
-> respawnStar(starNode)
```

改造后：

```text
collectStar(starNode)
-> updateScoreLabel()
-> playCollect()
-> playCollectFeedback(starNode)
-> Tween 缩小
-> respawnStar(starNode)
-> 恢复 scale
```

## 数据流

```text
Playing 状态
-> checkStarCollection()
-> 命中某个 starNode
-> collectStar(starNode)
-> 加分和音效立即发生
-> starNode.active = false，避免动画期间重复收集
-> Tween 缩放到 0
-> Tween 回调里随机重生该 starNode
-> scale 恢复为 1
-> starNode.active = true
```

这里会先把星星设为 inactive，避免动画期间同一个星星在多帧内被重复吃到。动效结束后再恢复 active。

## 验收标准

完成后需要满足：

- `GameManager` Inspector 中出现 `Collect Scale Duration`，默认值为 `0.08`。
- 玩家收集星星时，星星不是立刻跳走，而是有短暂缩放反馈。
- 分数仍然只加 1。
- 收集音效正常。
- 被收集的星星重生后缩放正常，不会越来越小。
- 其他星星不受影响。
- Game Over 和 Restart 流程正常。
- `npm run typecheck` 通过。

## 本课技术总结要点

课程结束时需要讲清：

- `tween(starNode)` 是对某个节点做属性变化。
- `to(duration, { scale: ... })` 表示在指定时间内把 scale 变到目标值。
- `call()` 可以在 Tween 中插入逻辑回调。
- 为什么动效期间要避免重复收集。
- 为什么表现反馈应该围绕玩法事件，而不是改变玩法规则。

