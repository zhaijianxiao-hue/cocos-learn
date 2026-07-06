# 第 5 课：开始流程和基础打磨

## 本课目标

加入明确的开始状态：进入游戏后先显示标题和 Start 按钮，点击 Start 后才开始倒计时和玩法；失败后按钮变成 Restart。

## 今天真正掌握的东西

- 布尔值适合两个状态，但状态变多后应该升级成明确的状态机。
- `Ready`、`Playing`、`GameOver` 比 `_gameOver: boolean` 更能表达游戏流程。
- 同一个按钮可以在不同状态下显示不同文案，触发同一个入口方法。
- UI 文案和按钮显隐应该由状态统一驱动，而不是散落在多个地方。

## 技术总结

第 4 课只有两个状态：

```text
Playing
GameOver
```

第 5 课加入开始界面后，状态变成：

```text
Ready -> Playing -> GameOver -> Playing
```

这时候如果继续用 `_gameOver` 布尔值，代码会越来越别扭，因为它只能表达“是不是结束”，不能表达“是否还没开始”。

所以我们引入：

```ts
enum GameState {
    Ready,
    Playing,
    GameOver,
}
```

以后状态更多时，例如 `Paused`、`LevelComplete`，也可以继续扩展。

## 按钮复用的本质

这节课没有新建一个 `StartButton`，而是复用已有按钮：

```text
Ready 状态：按钮显示 Start
GameOver 状态：按钮显示 Restart
Playing 状态：按钮隐藏
```

按钮点击后仍然调用同一个入口：

```ts
restartGame()
```

但 `GameManager` 会根据当前状态决定是否进入 `Playing`。这说明 UI 的文案可以变，入口可以复用，真正决定行为的是游戏状态。

## 可以自己试的小改动

- 把标题 `Star Catcher` 改成自己的游戏名。
- 把按钮初始文案改成 `Play`。
- 增加一个 `Paused` 状态之前，先想清楚它和 `GameOver` 的区别。
