# 第 1 课：玩家键盘移动

## 本课目标

让场景里出现一个玩家节点，并通过键盘输入移动它。

## 今天真正掌握的东西

- Cocos 的基本组织方式是“节点 + 组件”。
- 节点负责出现在场景树里，组件负责给节点增加行为。
- `PlayerView` 负责显示，`PlayerController` 负责移动，这是两个不同职责。
- `onEnable` 适合注册输入事件，`onDisable` 适合移除输入事件。
- `update(deltaTime)` 适合处理每帧持续发生的逻辑。
- 移动距离应该乘以 `deltaTime`，这样不同帧率下速度更稳定。

## 本课踩到的问题

第一次预览时，页面能运行、FPS 有数据，但没有看到蓝色矩形。根因是 `PlayerView` 需要 `Graphics` 组件来绘制矩形，而 `Player` 节点上没有这个组件。

修正方式是让 `PlayerView` 在运行时保证依赖存在：

```ts
const transform = this.getComponent(UITransform) ?? this.addComponent(UITransform);
const graphics = this.getComponent(Graphics) ?? this.addComponent(Graphics);
```

这个问题很适合记住：当一个脚本依赖另一个组件时，有两种常见做法。

- 在编辑器里手动把依赖组件挂好。
- 在脚本里检查依赖，不存在时自动添加或明确报错。

第一课我们选择自动添加，因为它能降低编辑器操作失误带来的干扰。

## 可以自己试的小改动

- 把 `Move Speed` 从 `320` 改成 `160` 或 `520`，观察手感变化。
- 把 `PlayerView` 的 `Fill Color` 换掉，确认节点外观和脚本行为是分开的。
- 临时注释掉 `this._moveDirection.normalize()`，再试试斜向移动，会发现斜向速度变快。然后再恢复它。
