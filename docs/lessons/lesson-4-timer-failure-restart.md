# 第 4 课：倒计时失败和重新开始

## 本课目标

加入倒计时、失败状态和重新开始按钮。倒计时归零后游戏停止，玩家不能继续移动；点击 Restart 后重置分数、时间、玩家和星星。

## 今天真正掌握的东西

- 游戏状态是协调多个对象行为的核心。
- `GameManager` 可以作为状态机入口，决定当前是游玩中还是失败状态。
- `PlayerController` 不需要知道游戏为什么结束，只需要暴露启停控制的方法。
- UI 不只是显示数据，也可以通过 Button 触发脚本方法。
- UI Label 需要考虑布局和动态文本宽度，不能只看初始值是否摆得下。

## 技术总结

第 4 课引入了第一个明确的游戏状态：

```text
Playing
    ↓ 时间归零
GameOver
    ↓ 点击 Restart
Playing
```

状态变化由 `GameManager` 管理：

```text
倒计时减少
    ↓
归零
    ↓
设置 _gameOver = true
    ↓
禁用 PlayerController
    ↓
显示 Game Over 和 Restart
```

这里的关键职责边界是：

```text
GameManager
└─ 决定游戏是否结束、何时重开

PlayerController
└─ 只提供 setControlEnabled，让外部启停控制
```

如果以后 AI 把倒计时写进 `PlayerController`，或者让按钮直接改一堆玩家状态，就要警惕：游戏状态应该由统一入口管理。

## 本课踩到的问题

第一次验证时，功能正常，但 `ScoreLabel` 和 `TimerLabel` 重叠在右上角。

根因是两个 Label 的坐标太接近：

```text
ScoreLabel: x = 520, y = 300
TimerLabel: x = 500, y = 300
```

修正后：

```text
ScoreLabel: x = -500, y = 300
TimerLabel: x = 500, y = 300
```

这里顺手建立一个 UI 认知：Canvas 中心是 `x = 0, y = 0`，x 负数往左，x 正数往右，y 正数往上。

## 可以自己试的小改动

- 把 `Game Duration` 改成 `10`，观察失败节奏变化。
- 在失败状态下尝试按 WASD，确认玩家不能移动。
- 点击 Restart 后，观察所有状态是否都回到起点。
- 把 `ScoreLabel` 和 `TimerLabel` 的位置调得更靠边，理解 Canvas 坐标。
