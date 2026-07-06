# 第 7 课：Star Prefab 入门

## 本课目标

把场景中的固定 `Star` 节点升级成 `Star.prefab`，并由 `GameManager` 在运行时创建星星实例。

## 今天真正掌握的东西

- Prefab 是资源模板，不是场景里的具体对象。
- Node 是运行时实例，可以来自场景，也可以来自 `instantiate()`。
- `@property(Prefab)` 暴露的是资源引用槽。
- `instantiate(prefab)` 会从模板复制出一个新的节点实例。
- 场景里拖出来的对象是实例，资源面板里的 Prefab 才是模板。
- 先学会创建，再学习对象池、批量生成和回收。

## 改造前后

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

GameManager.starPrefab -> assets/prefabs/Star.prefab
GameManager._starNode -> instantiate() 创建出来的运行时节点
```

这就是后续生成敌人、子弹、障碍物的基础模型。

## 关键代码

`starPrefab` 是模板资源，显示在 Inspector 里让我们拖 Prefab：

```ts
@property(Prefab)
public starPrefab: Prefab | null = null;
```

`_starNode` 是运行时真正参与游戏的节点实例：

```ts
private _starNode: Node | null = null;
```

创建实例的逻辑：

```ts
private createStarIfNeeded() {
    if (this._starNode || !this.starPrefab) {
        return;
    }

    this._starNode = instantiate(this.starPrefab);
    this.node.parent?.addChild(this._starNode);
}
```

这里最重要的是区分：

```text
Prefab = 资源模板
instantiate(Prefab) = 从模板创建实例
Node = 场景里真正运行的对象
```

## 数据流

```text
进入场景
-> GameManager.start()
-> createStarIfNeeded()
-> instantiate(starPrefab)
-> 把生成的 Star Node 挂到 Canvas 下
-> showReady() 设置随机位置
-> Playing 状态下检测 Player 和 Star 的距离
-> 收集成功后加分、播放音效、重新随机位置
```

## 本课踩坑

### 1. 目录拼写错误

一开始资源目录被创建成了：

```text
assets/perfabs
```

后来改成了正确的：

```text
assets/prefabs
```

这类问题很常见，但要早修。资源目录一旦错了，后续脚本、文档、协作都会跟着混乱。

### 2. Cocos Inspector 没及时刷新脚本属性

代码已经从：

```ts
@property(Node)
public starNode: Node | null = null;
```

改成：

```ts
@property(Prefab)
public starPrefab: Prefab | null = null;
```

但 Inspector 里一开始还显示旧的 `Star Node`。这是 Cocos 编辑器脚本导入缓存没有刷新。处理方式是重新导入脚本、刷新资源面板，必要时重启 Cocos。

### 3. 第一次 Start 音效和玩法启动混在一起

第一次点击 Start 时，按钮音效一开始听起来像收集音效。原因是点击音效和进入 `Playing` 后的游戏逻辑太贴近，听感上容易混在一起。

最终做法是让按钮点击先播放音效，再延迟很短时间进入游戏：

```ts
this._startPending = true;
this.audioManager?.playClick();
this.scheduleOnce(() => {
    this._startPending = false;
    this.startGame();
}, 0.06);
```

这个小延迟不是为了拖慢游戏，而是为了让 UI 反馈和玩法启动在感知上分开。

## 可以自己试的小改动

- 把 `Star.prefab` 拖到场景里看看，它会变成一个实例。
- 修改 `StarView.radius` 后重新应用 Prefab，观察实例变化。
- 想一想：如果要同时出现 5 个星星，`_starNode` 应该变成什么数据结构？
- 想一想：如果星星被收集后不是换位置，而是销毁再创建，会有什么优缺点？

