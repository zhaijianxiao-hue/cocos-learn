# 第 10 课设计：Space Collector 成品化第一轮

## 课程目标

第 10 课要把当前的机制 demo 包装成一个有主题、有素材、有画面观感的可玩第一版。目标不是增加玩法复杂度，而是让玩家第一眼知道自己在玩一个“太空收集”小游戏，而不是看见方块和圆圈。

本课完成后，项目从：

```text
蓝色方块 + 黄色圆圈 + 黑背景
```

升级成：

```text
太空飞船 + 能量晶体/星星 + 星空背景 + 更像游戏的 HUD
```

## 当前状态

当前 `Star Catcher` 已经具备完整机制闭环：

- 玩家移动。
- 多个星星实例。
- 分数和倒计时。
- Start / Game Over / Restart。
- 音效。
- Prefab。
- Tween 收集反馈。

但表现层仍然是训练用占位图形：

- `PlayerView` 用 `Graphics` 画蓝色圆角矩形。
- `StarView` 用 `Graphics` 画黄色圆形。
- 背景基本是纯黑。
- UI 文案还偏测试状态。

这说明玩法线已经能跑，但资源线还没有跟上。

## 方案选择

### 方案 A：Kenney 太空素材成品化

使用 Kenney 的太空类 2D 素材，把玩家和收集物替换成真实图片资源，并加入星空背景。

优点：

- 授权清楚，适合训练和发布。
- 风格统一。
- 能真实训练资源下载、筛选、命名、导入、绑定和授权记录。
- 不需要美术制作能力也能快速进入可玩版本。

缺点：

- 美术不是原创。
- 需要挑选合适素材并调整尺寸。

### 方案 B：AI 生成一套素材

用 AI 生成飞船、星星、背景。

优点：

- 更个性化。

缺点：

- 风格统一性、透明背景、尺寸、授权记录都更麻烦。
- 训练阶段会把注意力从 Cocos 资源管线带偏。

### 方案 C：继续用 Graphics 画得更好看

用代码画飞船、星空、能量球。

优点：

- 不依赖外部素材。
- 能继续训练 Graphics。

缺点：

- 仍然不像实际资源项目。
- 无法训练贴图导入、SpriteFrame、授权记录等真实流程。

## 推荐方案

采用方案 A：Kenney 太空素材成品化。

优先使用官方 Kenney 资源：

- Kenney Space Shooter Extension：https://www.kenney.nl/assets/space-shooter-extension
- Kenney 2D Assets：https://www.kenney.nl/assets/category%3A2D

授权记录写入：

```text
docs/assets/asset-credits.md
```

## 本课范围

包含：

- 下载并筛选太空主题 2D 素材。
- 导入玩家飞船图片。
- 导入收集物图片。
- 导入或生成简单星空背景图片。
- 把 `PlayerView` 从 Graphics 绘制改成 Sprite 表现。
- 把 `StarView` 从 Graphics 绘制改成 Sprite 表现。
- 调整 Player 和 Star Prefab 尺寸，让碰撞距离和视觉大小匹配。
- 更新 UI 文案：
  - 标题改为 `Space Collector`。
  - 分数改为 `Energy: N` 或保留 `Score: N`，优先用更游戏化文案。
  - Game Over 文案保留最终得分。
- 更新素材授权记录。

不包含：

- 新增敌人。
- 新增生命值。
- 新增关卡。
- 新增背景音乐。
- Web 构建。
- 对象池。
- 正式主菜单复杂 UI。

## 代码设计

### PlayerView

当前 `PlayerView` 负责用 Graphics 画蓝色方块。第 10 课改为：

- 确保节点有 `UITransform`。
- 确保节点有 `Sprite`。
- 暴露 `SpriteFrame` 属性，允许 Inspector 绑定飞船图片。
- 暴露宽高配置，控制飞船视觉尺寸。

`PlayerController` 不改。移动逻辑不关心玩家长什么样。

### StarView

当前 `StarView` 负责用 Graphics 画黄色圆。第 10 课改为：

- 确保节点有 `UITransform`。
- 确保节点有 `Sprite`。
- 暴露 `SpriteFrame` 属性，允许 Prefab 绑定收集物图片。
- 暴露大小配置，控制收集物视觉尺寸。

`GameManager` 的收集逻辑尽量不改，只根据视觉大小微调 `collectDistance`。

### 背景

添加一个 `Background` 节点：

```text
Canvas
  Background
  Camera
  Player
  GameManager
  UI Labels
  AudioManager
```

背景使用 `Sprite`，铺满当前设计分辨率。它只是表现层，不参与玩法逻辑。

## 数据流

```text
外部素材包
-> 解压筛选 PNG
-> 复制到 assets/textures/space
-> Cocos 生成 .meta
-> 图片资源成为 SpriteFrame
-> PlayerView / StarView 暴露 SpriteFrame 引用槽
-> Inspector 绑定飞船和能量物图片
-> 游戏运行时仍沿用原来的移动、收集、Tween、音效逻辑
```

## 验收标准

完成后需要满足：

- 画面第一眼像太空收集游戏，不再是方块圆圈 demo。
- 玩家显示为飞船图片。
- 收集物显示为太空能量/星星图片。
- 背景有星空或太空感。
- Start / Game Over / Restart 流程正常。
- 移动、收集、分数、倒计时、音效、Tween 全部正常。
- 素材文件和 `.meta` 都已提交。
- `docs/assets/asset-credits.md` 记录所有新增素材来源和授权。
- `npm run typecheck` 通过。

## 本课技术总结要点

课程结束时需要讲清：

- 为什么功能闭环不等于可玩成品。
- Sprite / SpriteFrame 和 Graphics 的区别。
- 为什么表现组件可以替换，而玩法控制组件不需要改。
- 资源导入为什么必须包含 `.meta`。
- 授权记录为什么是成品化的一部分。
- 玩法代码线和资源生产线如何并行推进。

