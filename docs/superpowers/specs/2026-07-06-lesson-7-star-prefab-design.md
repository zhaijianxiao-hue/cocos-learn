# 第 7 课设计：Star Prefab 入门

## 课程目标

第 7 课要把当前场景里手工摆放的 `Star` 节点，升级成一个可以复用的 `Star` Prefab。游戏运行时由 `GameManager` 根据 Prefab 创建星星实例，再继续使用已有的随机重生、收集检测、分数和音效逻辑。

这节课的重点不是增加玩法复杂度，而是建立 Prefab 的核心心智：

```text
Prefab = 可复用对象模板
Scene Node = 当前场景里的一个具体实例
instantiate(prefab) = 运行时从模板复制出一个实例
```

## 当前状态

当前 `Star Catcher` 已经具备：

- 玩家移动和边界限制。
- 星星收集和分数 UI。
- 倒计时、失败、开始、重开流程。
- 按钮、收集、Game Over 音效。
- `GameManager` 通过 `starNode` 属性直接引用场景中的固定星星节点。

这个结构能跑，但它仍然偏 demo：星星是场景里的固定对象，不是资源模板。后续如果要生成障碍物、敌人、子弹、掉落物，就需要先掌握 Prefab。

## 本课范围

本课只做一件事：让星星从 Prefab 创建。

包含：

- 在 Cocos 编辑器中把现有 `Star` 节点制作成 Prefab。
- 新建 `assets/prefabs` 目录保存 `Star.prefab`。
- 修改 `GameManager`，把 `starNode` 配置改成 `starPrefab` 配置。
- `GameManager` 在运行时创建一个星星实例，并挂到 `Canvas` 下。
- 保留已有收集、随机重生、音效、分数和状态机行为。

不包含：

- 同屏多个星星。
- 对象池。
- 碰撞组件。
- 替换星星图片资源。
- 新增复杂特效。

这些内容会放到后续课程里逐步引入。

## 推荐实现方案

方案采用“最小可理解的 Prefab 改造”：

1. 保留当前 `StarView` 脚本，继续用 `Graphics` 绘制黄色圆形。
2. 将场景里的 `Star` 节点拖入 `assets/prefabs`，生成 `Star.prefab`。
3. 从场景中删除原本固定的 `Star` 节点，避免同一个对象既是模板又是实例。
4. `GameManager` 增加：

```ts
@property(Prefab)
public starPrefab: Prefab | null = null;
```

5. `GameManager` 内部维护运行时实例：

```ts
private _starNode: Node | null = null;
```

6. 在游戏初始化阶段，如果实例不存在，就通过 `instantiate(this.starPrefab)` 创建并添加到当前父节点。
7. 现有逻辑中原来读写 `this.starNode` 的地方，改成读写 `this._starNode`。

## 对象关系

改造前：

```text
Main.scene
  Canvas
    Star 节点

GameManager.starNode -> 场景里的 Star 节点
```

改造后：

```text
assets/prefabs/Star.prefab
  保存 Star 模板

Main.scene
  Canvas
    GameManager 运行时创建 Star 实例

GameManager.starPrefab -> Star.prefab 模板
GameManager._starNode -> 运行时创建出来的 Star 实例
```

## 数据流

```text
进入场景
-> GameManager.start()
-> 根据 starPrefab 创建 Star 实例
-> showReady()
-> respawnStar() 设置随机位置
-> Playing 状态下检测 Player 和 Star 的距离
-> 收集成功后播放音效、加分、重新设置 Star 位置
```

核心变化是：`GameManager` 不再要求场景里提前摆好一个 `Star`，而是拿到一个“模板资源”，自己在运行时创建实例。

## 验收标准

完成后需要满足：

- Cocos 资源面板中存在 `assets/prefabs/Star.prefab` 和对应 `.meta`。
- 场景层级中不再依赖手工固定的 `Star` 节点。
- `GameManager` Inspector 中出现 `Star Prefab` 属性。
- 将 `Star.prefab` 拖入 `Star Prefab` 后，预览运行能看到星星。
- Start 后玩家仍可收集星星。
- 收集后分数增加，星星随机换位置。
- 收集音效仍然正常。
- Game Over 和 Restart 流程仍然正常。
- `npm run typecheck` 通过。

## 本课技术总结要点

课程结束时需要讲清：

- Prefab 和场景节点实例的区别。
- 为什么运行时创建对象要用 `instantiate()`。
- 为什么 `Prefab` 是资源，`Node` 是实例。
- 为什么这一步是后续敌人、子弹、障碍物生成的基础。
- 为什么本课不急着做对象池：先理解创建，再理解复用和回收。

