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

这一课的核心变化不是星星变多，而是数据结构变了：

```text
一个对象 -> 一个变量
多个对象 -> 一个数组
```

## 关键代码

运行时对象列表：

```ts
private readonly _starNodes: Node[] = [];
```

根据 `starCount` 创建多个星星：

```ts
while (this._starNodes.length < this.starCount) {
    const starNode = instantiate(this.starPrefab);
    parentNode.addChild(starNode);
    this._starNodes.push(starNode);
}
```

逐个检查星星是否被收集：

```ts
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
```

这里的 `return` 很重要。它代表这一帧只处理一个收集结果，避免玩家同时贴近多个星星时分数一次跳好几分。

## 数据流

```text
进入场景
-> createStarsIfNeeded()
-> instantiate Star.prefab 直到数量达到 starCount
-> 保存到 _starNodes
-> showReady() / startGame() 调用 respawnAllStars()
-> Playing 状态循环检查每一个 Star Node
-> 收集到某一个 Star Node
-> 加分、播放音效、只重生这一个 Star Node
```

## 为什么暂时不做对象池

这一课我们只创建 3 个星星，而且创建发生在场景启动时。数量少、生命周期简单，用数组直接管理就够了。

对象池要解决的是大量对象频繁创建和销毁的问题，比如子弹、敌人、掉落物。现在提前引入对象池，会把注意力从“数组管理多个实例”带偏。

正确顺序是：

```text
先会创建一个
-> 再会创建多个
-> 再理解销毁和复用
-> 最后学习对象池
```

## 可以自己试的小改动

- 把 `Star Count` 改成 `5`，观察画面和收集逻辑。
- 想一想：如果星星之间不能重叠，随机位置函数要怎么改？
- 想一想：如果星星被收集后先隐藏 1 秒再出现，需要在哪个方法里改？
- 想一想：如果后续生成敌人，`_starNodes` 这种数组会变成什么名字？

