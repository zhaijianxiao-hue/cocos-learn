# 第 9 课：收集 Tween 反馈

## 本课目标

给星星收集加入短暂缩放反馈，让玩家更清楚地感知“我收到了这个星星”。

## 今天真正掌握的东西

- `tween(node)` 可以对一个节点做属性变化。
- `to(duration, props)` 表示在一段时间内把属性变到目标值。
- `call()` 可以在 Tween 中插入逻辑回调。
- scale 是缩放，不是位置。
- 动效期间需要防止同一个对象被重复收集。
- 表现反馈应该围绕玩法事件，而不是替代玩法规则。

## 关键代码

用集合记录正在播放收集反馈的星星：

```ts
private readonly _collectingStars = new Set<Node>();
```

播放缩放 Tween：

```ts
tween(starNode)
    .to(this.collectScaleDuration, { scale: Vec3.ZERO })
    .call(() => {
        this.respawnStar(starNode);
        this._collectingStars.delete(starNode);
    })
    .start();
```

检测时跳过正在播放反馈的星星：

```ts
if (!starNode.active || this._collectingStars.has(starNode)) {
    continue;
}
```

重生时恢复正常缩放：

```ts
starNode.setScale(Vec3.ONE);
```

## 技术总结

这一课的核心不是“星星变小”，而是把一次玩法事件拆成两条线：

```text
规则线：加分、播放音效、防止重复收集
表现线：缩放反馈、动效结束后重生
```

规则线必须稳定，表现线可以继续打磨。以后受击、爆炸、按钮反馈、敌人死亡动画都会用类似思路。

## 数据流

```text
玩家碰到星星
-> checkStarCollection() 命中 starNode
-> collectStar(starNode)
-> 分数 +1
-> 播放收集音效
-> 把 starNode 加入 _collectingStars
-> Tween 缩放到 0
-> Tween call() 回调
-> respawnStar(starNode)
-> 缩放恢复为 Vec3.ONE
-> 从 _collectingStars 移除
```

## 踩坑点

不能在动效开始前把星星设为：

```ts
starNode.active = false;
```

因为 `active = false` 会隐藏节点，玩家就看不到 Tween。正确做法是让星星保持显示，同时用 `_collectingStars` 标记它正在播放反馈，检测时跳过它。

## 可以自己试的小改动

- 把 `Collect Scale Duration` 改成 `0.15`，观察手感变化。
- 把 `Vec3.ZERO` 改成 `new Vec3(1.3, 1.3, 1)`，试试放大反馈。
- 想一想：如果要先放大再缩小，需要怎么链式调用 Tween？
- 想一想：如果要做敌人死亡动画，规则线和表现线分别是什么？

