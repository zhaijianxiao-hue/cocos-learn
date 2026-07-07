# Lesson 10 Space Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前方块圆圈机制 demo 包装成 `Space Collector` 太空收集可玩第一版。

**Architecture:** 玩法逻辑继续由 `PlayerController` 和 `GameManager` 负责，表现层从 `Graphics` 占位绘制改成 `SpriteFrame` 资源绑定。外部素材进入 `assets/textures/space`，Cocos 生成 `.meta` 后由 `PlayerView`、`StarView` 和场景背景节点引用；授权记录写入 `docs/assets/asset-credits.md`。

**Tech Stack:** Cocos Creator 3.8.8, TypeScript, Cocos Sprite/SpriteFrame/UITransform, Kenney CC0 2D assets, Git, `npm run typecheck`.

## Global Constraints

- 项目文档使用中文。
- 资源必须来自明确授权来源，新增外部素材必须记录到 `docs/assets/asset-credits.md`。
- 本课不新增玩法系统，不新增敌人、生命值、背景音乐、对象池或 Web 构建。
- 保留现有移动、收集、分数、倒计时、音效、Prefab、多实例、Tween 反馈逻辑。
- 资源文件和 Cocos `.meta` 文件必须一起提交。

---

## File Structure

- Create: `assets/textures.meta`
  - Cocos 生成，保存 `textures` 目录身份。
- Create: `assets/textures/space.meta`
  - Cocos 生成，保存太空素材目录身份。
- Create: `assets/textures/space/player_ship.png`
  - 从 Kenney Space Shooter Redux 复制的玩家飞船素材。
- Create: `assets/textures/space/player_ship.png.meta`
  - Cocos 生成的资源身份。
- Create: `assets/textures/space/energy_star.png`
  - 从 Kenney Space Shooter Redux 复制的收集物素材。
- Create: `assets/textures/space/energy_star.png.meta`
  - Cocos 生成的资源身份。
- Create: `assets/textures/space/space_background.png`
  - 从 Kenney Space Shooter Redux 复制的星空背景素材。
- Create: `assets/textures/space/space_background.png.meta`
  - Cocos 生成的资源身份。
- Modify: `docs/assets/asset-credits.md`
  - 记录新增视觉素材来源和授权。
- Modify: `assets/scripts/PlayerView.ts`
  - 从 Graphics 绘制改成 Sprite 表现。
- Modify: `assets/scripts/StarView.ts`
  - 从 Graphics 绘制改成 Sprite 表现。
- Modify: `assets/scripts/GameManager.ts`
  - 更新标题、分数和结算文案。
- Modify: `assets/scenes/Main.scene`
  - 绑定 Player 的飞船 SpriteFrame。
  - 新增 Background 节点并绑定背景图。
  - 保存 GameManager 文案改动后的场景引用。
- Modify: `assets/prefabs/Star.prefab`
  - 绑定 StarView 的收集物 SpriteFrame。
- Create: `docs/lessons/lesson-10-space-polish.md`
  - 第 10 课技术总结。

---

### Task 1: 下载并导入视觉素材

**Files:**
- Create: `assets/textures.meta`
- Create: `assets/textures/space.meta`
- Create: `assets/textures/space/player_ship.png`
- Create: `assets/textures/space/player_ship.png.meta`
- Create: `assets/textures/space/energy_star.png`
- Create: `assets/textures/space/energy_star.png.meta`
- Create: `assets/textures/space/space_background.png`
- Create: `assets/textures/space/space_background.png.meta`
- Modify: `docs/assets/asset-credits.md`

**Interfaces:**
- Produces image assets that later tasks bind as `SpriteFrame`:
  - `assets/textures/space/player_ship.png`
  - `assets/textures/space/energy_star.png`
  - `assets/textures/space/space_background.png`

- [ ] **Step 1: 下载 Kenney Space Shooter Redux 到临时目录**

Run:

```powershell
$tmp = Join-Path $env:TEMP 'cocos-lesson10-space-polish'
Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $tmp | Out-Null
$zip = Join-Path $tmp 'SpaceShooterRedux.zip'
Invoke-WebRequest -Uri 'https://opengameart.org/sites/default/files/SpaceShooterRedux.zip' -OutFile $zip
Expand-Archive -LiteralPath $zip -DestinationPath $tmp
```

Expected: `$tmp` 中存在 `PNG` 和 `Backgrounds` 目录。

- [ ] **Step 2: 复制并重命名项目需要的素材**

Run:

```powershell
New-Item -ItemType Directory -Path assets\textures\space -Force | Out-Null
$tmp = Join-Path $env:TEMP 'cocos-lesson10-space-polish'
Copy-Item -LiteralPath (Join-Path $tmp 'PNG\playerShip1_blue.png') -Destination assets\textures\space\player_ship.png
Copy-Item -LiteralPath (Join-Path $tmp 'PNG\Effects\star1.png') -Destination assets\textures\space\energy_star.png
Copy-Item -LiteralPath (Join-Path $tmp 'Backgrounds\darkPurple.png') -Destination assets\textures\space\space_background.png
```

Expected:

```text
assets/textures/space/player_ship.png
assets/textures/space/energy_star.png
assets/textures/space/space_background.png
```

- [ ] **Step 3: 等待 Cocos 生成 `.meta`**

在 Cocos 中观察资源面板，确认出现：

```text
assets/textures/space/player_ship
assets/textures/space/energy_star
assets/textures/space/space_background
```

Expected: 文件系统中出现：

```text
assets/textures.meta
assets/textures/space.meta
assets/textures/space/player_ship.png.meta
assets/textures/space/energy_star.png.meta
assets/textures/space/space_background.png.meta
```

- [ ] **Step 4: 更新素材授权记录**

在 `docs/assets/asset-credits.md` 的表格中追加：

```md
| `assets/textures/space/player_ship.png` | Space Shooter Redux | Kenney | CC0 | 玩家飞船图片 | https://opengameart.org/content/space-shooter-redux |
| `assets/textures/space/energy_star.png` | Space Shooter Redux | Kenney | CC0 | 能量收集物图片 | https://opengameart.org/content/space-shooter-redux |
| `assets/textures/space/space_background.png` | Space Shooter Redux | Kenney | CC0 | 星空背景图片 | https://opengameart.org/content/space-shooter-redux |
```

- [ ] **Step 5: 检查资源文件**

Run:

```powershell
Get-ChildItem -Force assets\textures, assets\textures\space | Select-Object Name,Length
git status --short
```

Expected: 看到新增 PNG 和 `.meta` 文件，以及 `docs/assets/asset-credits.md` 修改。

- [ ] **Step 6: Commit**

```bash
git add assets/textures.meta assets/textures docs/assets/asset-credits.md
git commit -m "feat: import space visual assets"
```

---

### Task 2: 把 PlayerView 和 StarView 改成 Sprite 表现

**Files:**
- Modify: `assets/scripts/PlayerView.ts`
- Modify: `assets/scripts/StarView.ts`

**Interfaces:**
- Consumes image assets from Task 1 as Cocos `SpriteFrame` resources.
- Produces component properties used by scene/prefab binding:
  - `PlayerView.spriteFrame: SpriteFrame | null`
  - `StarView.spriteFrame: SpriteFrame | null`

- [ ] **Step 1: 替换 PlayerView.ts**

把 `assets/scripts/PlayerView.ts` 替换为：

```ts
import { _decorator, Component, Sprite, SpriteFrame, UITransform } from 'cc';

const { ccclass, property, requireComponent } = _decorator;

@ccclass('PlayerView')
@requireComponent(UITransform)
@requireComponent(Sprite)
export class PlayerView extends Component {
    @property(SpriteFrame)
    public spriteFrame: SpriteFrame | null = null;

    @property
    public width = 76;

    @property
    public height = 64;

    start() {
        this.applyView();
    }

    private applyView() {
        const transform = this.getComponent(UITransform) ?? this.addComponent(UITransform);
        const sprite = this.getComponent(Sprite) ?? this.addComponent(Sprite);

        transform.setContentSize(this.width, this.height);
        sprite.spriteFrame = this.spriteFrame;
    }
}
```

- [ ] **Step 2: 替换 StarView.ts**

把 `assets/scripts/StarView.ts` 替换为：

```ts
import { _decorator, Component, Sprite, SpriteFrame, UITransform } from 'cc';

const { ccclass, property, requireComponent } = _decorator;

@ccclass('StarView')
@requireComponent(UITransform)
@requireComponent(Sprite)
export class StarView extends Component {
    @property(SpriteFrame)
    public spriteFrame: SpriteFrame | null = null;

    @property
    public size = 44;

    start() {
        this.applyView();
    }

    private applyView() {
        const transform = this.getComponent(UITransform) ?? this.addComponent(UITransform);
        const sprite = this.getComponent(Sprite) ?? this.addComponent(Sprite);

        transform.setContentSize(this.size, this.size);
        sprite.spriteFrame = this.spriteFrame;
    }
}
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected:

```text
> typecheck
> tsc --noEmit
```

并且命令退出码为 0。

- [ ] **Step 4: Commit**

```bash
git add assets/scripts/PlayerView.ts assets/scripts/StarView.ts
git commit -m "feat: render player and stars with sprites"
```

---

### Task 3: 更新游戏文案为 Space Collector

**Files:**
- Modify: `assets/scripts/GameManager.ts`

**Interfaces:**
- Produces UI strings:
  - Ready title: `Space Collector`
  - Score label: `Energy: N`
  - Game Over message: `Mission Over  Energy: N`

- [ ] **Step 1: 更新 Ready 标题**

把：

```ts
this.setMessage('Star Catcher');
```

改成：

```ts
this.setMessage('Space Collector');
```

- [ ] **Step 2: 更新结算文案**

把：

```ts
this.setMessage(`Game Over  Score: ${this._score}`);
```

改成：

```ts
this.setMessage(`Mission Over  Energy: ${this._score}`);
```

- [ ] **Step 3: 更新分数 Label**

把：

```ts
this.scoreLabel.string = `Score: ${this._score}`;
```

改成：

```ts
this.scoreLabel.string = `Energy: ${this._score}`;
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: exit code 0。

- [ ] **Step 5: Commit**

```bash
git add assets/scripts/GameManager.ts
git commit -m "chore: rename game to space collector"
```

---

### Task 4: 在 Cocos 中绑定 SpriteFrame 并添加背景

**Files:**
- Modify: `assets/scenes/Main.scene`
- Modify: `assets/prefabs/Star.prefab`

**Interfaces:**
- Consumes:
  - `PlayerView.spriteFrame`
  - `StarView.spriteFrame`
  - `assets/textures/space/player_ship.png`
  - `assets/textures/space/energy_star.png`
  - `assets/textures/space/space_background.png`

- [ ] **Step 1: 刷新脚本和图片资源**

在 Cocos 中确认：

```text
assets/textures/space/player_ship
assets/textures/space/energy_star
assets/textures/space/space_background
```

都已出现。

如果 `PlayerView` 或 `StarView` 的新属性没出现，右键对应脚本重新导入，必要时重启 Cocos。

- [ ] **Step 2: 绑定 Player 飞船图片**

在 Cocos 中：

1. 选中 `Canvas/Player`。
2. 在 `PlayerView` 组件中，把 `Sprite Frame` 绑定为 `assets/textures/space/player_ship`。
3. 确认 `Width = 76`，`Height = 64`。

- [ ] **Step 3: 绑定 Star Prefab 收集物图片**

在 Cocos 中：

1. 双击打开 `assets/prefabs/Star`。
2. 选中 Prefab 根节点。
3. 在 `StarView` 组件中，把 `Sprite Frame` 绑定为 `assets/textures/space/energy_star`。
4. 确认 `Size = 44`。
5. 保存 Prefab。
6. 回到 `Main.scene`。

- [ ] **Step 4: 添加 Background 节点**

在 Cocos 中：

1. 在 `Canvas` 下创建空节点，命名 `Background`。
2. 把 `Background` 拖到 `Canvas` 子节点最上方，确保渲染在底层。
3. 添加 `Sprite` 组件。
4. 添加或确认 `UITransform` 组件。
5. 绑定 `Sprite Frame` 为 `assets/textures/space/space_background`。
6. 设置 Position：`x = 0, y = 0`。
7. 设置 Content Size：`w = 1280, h = 720`。
8. 保存场景。

- [ ] **Step 5: 检查场景和 Prefab 文件**

Run:

```powershell
Select-String -Path assets\scenes\Main.scene -Pattern 'Background|player_ship|space_background|Space Collector|Energy' -Context 1,4
Select-String -Path assets\prefabs\Star.prefab -Pattern 'energy_star|StarView|spriteFrame|size' -Context 1,4
git status --short
```

Expected:

- `Main.scene` 已修改。
- `Star.prefab` 已修改。
- 能在场景或 Prefab 中看到相关 `SpriteFrame` 引用字段。

- [ ] **Step 6: Commit**

```bash
git add assets/scenes/Main.scene assets/prefabs/Star.prefab
git commit -m "chore: wire space sprites in scene"
```

---

### Task 5: 手动验证 Space Collector 成品化第一轮

**Files:**
- No code files.

**Interfaces:**
- Consumes all assets and bindings from Tasks 1-4.

- [ ] **Step 1: Cocos 预览运行**

Expected:

- 第一眼看到太空背景。
- 玩家是飞船。
- 收集物是星星/能量图片。
- 画面不再是蓝色方块和黄色圆圈。

- [ ] **Step 2: 验证玩法闭环**

操作：

1. 点击 Start。
2. 用 WASD 或方向键移动飞船。
3. 收集能量星。
4. 等倒计时结束。
5. 点击 Restart。

Expected:

- 移动正常。
- 收集正常。
- Tween 收集反馈正常。
- 收集音效、点击音效、Game Over 音效正常。
- UI 文案显示 `Space Collector`、`Energy: N`、`Mission Over  Energy: N`。

- [ ] **Step 3: 检查 Console**

Expected:

- 没有红色运行时报错。
- 没有 SpriteFrame 未绑定导致的空图。

---

### Task 6: 写第 10 课技术总结

**Files:**
- Create: `docs/lessons/lesson-10-space-polish.md`

**Interfaces:**
- Consumes implementation results from Tasks 1-5.

- [ ] **Step 1: 创建课程总结**

写入：

```md
# 第 10 课：Space Collector 成品化第一轮

## 本课目标

把机制 demo 包装成太空收集主题的可玩第一版，让玩家第一眼知道自己在玩一个游戏，而不是看方块和圆圈。

## 今天真正掌握的东西

- 功能闭环不等于可玩成品。
- Sprite / SpriteFrame 是 Cocos 里显示图片资源的常用方式。
- Graphics 适合原型占位，Sprite 更接近实际游戏资源管线。
- 玩法控制组件可以不动，只替换表现组件。
- 外部素材必须记录来源和授权。

## 改造前后

改造前：

```text
PlayerView -> Graphics 蓝色方块
StarView -> Graphics 黄色圆圈
背景 -> 纯黑
```

改造后：

```text
PlayerView -> Sprite 飞船
StarView -> Sprite 能量星
Background -> 星空图片
UI -> Space Collector / Energy
```

## 技术总结

这一课的核心是把游戏拆成两条线：

```text
玩法代码线：移动、收集、计时、状态、音效、Tween
资源生产线：图片、背景、授权、导入、绑定
```

真正的游戏开发不是只写逻辑，也不是只摆素材，而是让两条线稳定配合。

## 踩坑点

SpriteFrame 绑定依赖 Cocos 的 `.meta`。图片复制到 `assets` 后，必须等待 Cocos 导入完成再绑定，否则 Inspector 里可能找不到可拖拽资源。

## 可以自己试的小改动

- 换另一艘飞船，观察只换表现不改逻辑的效果。
- 换另一张背景，观察游戏气质变化。
- 把 `Energy` 改成 `Crystals`，体会 UI 文案对主题的影响。
```

- [ ] **Step 2: Commit**

```bash
git add docs/lessons/lesson-10-space-polish.md
git commit -m "docs: add lesson 10 space polish recap"
```

---

### Task 7: Final Verification and Push

**Files:**
- No code files.

**Interfaces:**
- Consumes all previous tasks.

- [ ] **Step 1: Run typecheck**

```bash
npm run typecheck
```

Expected: exit code 0。

- [ ] **Step 2: Confirm status**

```bash
git status -sb
```

Expected before push:

```text
## main...origin/main [ahead N]
```

- [ ] **Step 3: Push**

```bash
git push
```

Expected: `main -> main`。

