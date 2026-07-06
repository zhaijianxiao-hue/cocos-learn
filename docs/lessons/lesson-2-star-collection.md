# 第 2 课：星星收集和分数 UI

## 本课目标

在已有玩家移动基础上，加入一颗星星和一个分数 Label。玩家碰到星星后，星星隐藏，分数从 0 变成 1。

## 今天真正掌握的东西

- `Label` 是 Cocos 里显示文字的常用组件。
- 脚本可以通过 `@property(Node)` 暴露节点引用，然后在 Inspector 里拖拽绑定。
- `GameManager` 适合管理“跨多个对象的规则”，例如玩家碰到星星后更新分数。
- 简单距离检测可以先不用物理系统，用两个节点的世界坐标计算。
- 不要一开始就上复杂碰撞系统；先理解数据流和对象关系更重要。

## 本课的对象关系

```text
GameManager
├─ playerNode -> Player
├─ starNode -> Star
└─ scoreLabel -> ScoreLabel
```

这说明 `GameManager` 自己不显示任何东西，它只是拿到场景里的关键节点，然后协调它们。

## 本课的数据流

```text
Player 移动
    ↓
GameManager 每帧读取 Player 和 Star 的世界坐标
    ↓
计算两者距离
    ↓
距离小于 Collect Distance
    ↓
隐藏 Star，分数加 1，更新 ScoreLabel
```

## 可以自己试的小改动

- 把 `Collect Distance` 改成 `30` 或 `100`，观察收集距离变化。
- 把 `Star` 的位置改远一点，确认收集逻辑跟节点位置有关。
- 把 `ScoreLabel` 的文字颜色或位置改掉，确认 UI 和游戏规则是分开的。
