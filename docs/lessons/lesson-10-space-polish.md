# 第 10 课：Space Collector 成品化第一轮

## 本课目标

把机制 demo 包装成太空收集主题的可玩第一版，让玩家第一眼知道自己在玩一个游戏，而不是看方块和圆圈。

## 今天真正掌握的东西

- 功能闭环不等于可玩成品。
- `Sprite` / `SpriteFrame` 是 Cocos 里显示图片资源的常用方式。
- `Graphics` 适合原型占位，`Sprite` 更接近实际游戏资源管线。
- 玩法控制组件可以不动，只替换表现组件。
- 外部素材必须记录来源和授权。
- Cocos 资源绑定依赖 `.meta`，不要只盯着图片文件本身。

## 改造前后

改造前：

```text
PlayerView -> Graphics 蓝色方块
StarView -> Graphics 黄色圆圈
背景 -> 纯黑
UI -> Star Catcher / Score
```

改造后：

```text
PlayerView -> Sprite 飞船
StarView -> Sprite 能量星
Background -> 星空图片
UI -> Space Collector / Energy
```

## 关键代码

玩家视图不再自己画方块，而是暴露一个 `SpriteFrame` 给 Inspector 绑定：

```ts
@property(SpriteFrame)
public spriteFrame: SpriteFrame | null = null;
```

运行时把绑定好的图片交给 `Sprite` 组件显示：

```ts
const sprite = this.getComponent(Sprite) ?? this.addComponent(Sprite);
sprite.spriteFrame = this.spriteFrame;
```

尺寸仍然由组件属性控制：

```ts
const transform = this.getComponent(UITransform) ?? this.addComponent(UITransform);
transform.setContentSize(this.width, this.height);
```

收集物也是同样思路，只是用一个 `size` 控制宽高：

```ts
transform.setContentSize(this.size, this.size);
sprite.spriteFrame = this.spriteFrame;
```

主题文案从分数改成能量：

```ts
this.scoreLabel.string = `Energy: ${this._score}`;
```

## 技术总结

这一课的核心是把游戏拆成两条线：

```text
玩法代码线：移动、收集、计时、状态、音效、Tween
资源生产线：图片、背景、授权、导入、绑定
```

真正的游戏开发不是只写逻辑，也不是只摆素材，而是让两条线稳定配合。

这次我们没有重写 `PlayerController`，也没有重写 `GameManager` 的收集规则。原因是：移动、碰撞距离、计分、倒计时这些属于玩法线；飞船、能量星、背景属于表现线。表现变了，规则可以继续复用。

这就是组件化开发的价值：同一个节点可以同时挂控制组件和显示组件。控制组件管行为，显示组件管外观。以后你换角色皮肤、换敌人图片、换收集物主题，都应该优先思考“能不能只替换表现层”。

## 数据流

```text
图片复制到 assets/textures/space
-> Cocos 生成 .meta 和 SpriteFrame
-> PlayerView / StarView 暴露 SpriteFrame 属性
-> Inspector 绑定具体图片
-> 运行时 Sprite 显示图片
-> GameManager 继续按节点位置做收集逻辑
```

## 资源管线

本课新增了三张视觉资源：

```text
assets/textures/space/player_ship.png
assets/textures/space/energy_star.png
assets/textures/space/space_background.png
```

来源记录写在：

```text
docs/assets/asset-credits.md
```

以后只要加入外部图片、音效、音乐、字体、模型，都要补授权记录。成品项目越往后走，资源管理越重要。

## 踩坑点

图片文件出现，不代表 Cocos 已经能绑定。必须等对应 `.meta` 生成后，Inspector 才能稳定识别资源。

Prefab 编辑模式里只看到一个 `Star` 节点是正常的。双击 Prefab 时，Cocos 会临时进入这个 Prefab 自己的编辑环境，不会显示完整场景层级。

背景节点要放在 `Canvas` 子节点最上方，因为 2D UI 节点通常按层级顺序渲染。越靠前越在底层，越靠后越在上层。

## 可以自己试的小改动

- 换另一艘飞船，观察只换表现不改逻辑的效果。
- 换另一张背景，观察游戏气质变化。
- 把 `Energy` 改成 `Crystals`，体会 UI 文案对主题的影响。
- 调整飞船 `Width` / `Height`，观察视觉大小和收集距离之间的关系。
