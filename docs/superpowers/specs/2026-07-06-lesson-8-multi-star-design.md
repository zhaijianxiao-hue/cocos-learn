# 第 8 课设计：多星星生成

## 课程目标

第 8 课要把第 7 课创建的单个 `Star` Prefab 实例，升级成多个同时存在的星星实例。`GameManager` 不再只维护一个 `_starNode`，而是维护一个 `_starNodes: Node[]` 数组。

本课重点是建立“运行时对象列表”的心智：

```text
Prefab = 模板
instantiate(prefab) = 创建一个实例
Node[] = 管理一批运行时实例
```

这个能力会直接迁移到后续的障碍物、敌人、子弹、掉落物生成。

## 当前状态

当前 `Star Catcher` 已经具备：

- `Star.prefab` 资源模板。
- `GameManager.starPrefab` 引用 Prefab。
- `GameManager._starNode` 保存一个运行时星星实例。
- 玩家碰到星星后加分、播放音效、随机重生。

当前结构能说明 Prefab 的基础，但还没有训练“批量生成”和“列表管理”。

## 方案选择

### 方案 A：固定 3 个星星

新增一个 Inspector 参数：

```ts
@property
public starCount = 3;
```

`GameManager` 启动时创建 `starCount` 个星星，保存进数组。每帧循环检查所有星星，碰到哪一个，就让哪一个加分并随机换位置。

优点：

- 概念清楚。
- 代码量可控。
- 最适合教学数组和多实例。

缺点：

- 星星数量固定，不涉及动态增减。

### 方案 B：每次收集后新增一个星星

每收集一次，就额外 `instantiate()` 一个星星。

优点：

- 玩法变化明显。

缺点：

- 很快引出数量失控、性能、对象回收等问题。
- 对本课来说过早。

### 方案 C：对象池

提前创建一批星星，收集后隐藏或复用。

优点：

- 更接近正式项目。

缺点：

- 对第 8 课来说概念过多，会把注意力从数组和多实例带偏。

## 推荐方案

采用方案 A：固定 3 个星星。

理由：第 8 课的真正目标不是让玩法更复杂，而是让你理解“一个 Prefab 可以生成多个互相独立的实例，并且用数组管理它们”。

## 本课范围

包含：

- `GameManager` 增加 `starCount` 配置。
- `_starNode` 改成 `_starNodes: Node[]`。
- 启动时根据 `starCount` 创建多个星星。
- Ready 和 Start 时重置所有星星的位置。
- Playing 时循环检查所有星星的收集距离。
- 收集到某一个星星后，只重生那个星星。

不包含：

- 对象池。
- 星星之间防重叠。
- 动态增加或减少星星数量。
- UI 显示当前星星数量。
- 使用 Collider 替换距离检测。

## 对象关系

改造前：

```text
GameManager.starPrefab -> Star.prefab
GameManager._starNode -> 运行时的一个 Star Node
```

改造后：

```text
GameManager.starPrefab -> Star.prefab
GameManager._starNodes -> 运行时的多个 Star Node
```

## 数据流

```text
进入场景
-> GameManager.start()
-> createStarsIfNeeded()
-> instantiate Star.prefab 多次
-> 保存到 _starNodes 数组
-> showReady() 随机摆放所有星星
-> Playing 状态循环检查每个星星
-> 碰到某个星星
-> 加分、播放音效、只重生这个星星
```

## 验收标准

完成后需要满足：

- `GameManager` Inspector 中出现 `Star Count`，默认值为 `3`。
- 预览运行时画面中能看到多个星星。
- Start 后玩家碰到任意一个星星都能加分。
- 被收集的星星会换位置，其他星星不需要同时换位置。
- 收集音效正常。
- Game Over 和 Restart 流程正常。
- `npm run typecheck` 通过。

## 本课技术总结要点

课程结束时需要讲清：

- `Node | null` 和 `Node[]` 的区别。
- 为什么管理多个对象时要用数组。
- 为什么循环检查多个对象时要注意“收集一个后是否继续检查”。
- 为什么本课暂时不做对象池。
- 这套模型如何迁移到子弹、敌人、障碍物。

