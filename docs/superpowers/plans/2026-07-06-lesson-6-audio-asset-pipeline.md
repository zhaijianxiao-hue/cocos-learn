# 第 6 课：音效资源管线 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给 Star Catcher 加入按钮、收集、失败三个音效，并建立资源授权记录。

**Architecture:** 使用 Kenney UI Audio 作为 CC0 音效来源，只导入本课需要的少量 `.ogg` 音效。新增 `AudioManager` 组件集中播放音效，`GameManager` 通过 Inspector 引用 `AudioManager`，在 Start/Restart、收集星星、Game Over 时触发播放。

**Tech Stack:** Cocos Creator 3.8.8、TypeScript、AudioSource、AudioClip、外部资源导入、资源授权记录。

---

## 资源来源

- 来源：Kenney UI Audio。
- 页面：https://kenney.nl/assets/ui-audio
- 授权：Creative Commons CC0。
- 下载包：`kenney_ui-audio.zip`。

## 文件结构

- Create: `assets/audio/sfx/sfx_ui_click.ogg`
- Create: `assets/audio/sfx/sfx_collect.ogg`
- Create: `assets/audio/sfx/sfx_game_over.ogg`
- Create: `assets/scripts/AudioManager.ts`
- Modify: `assets/scripts/GameManager.ts`
- Modify: `assets/scenes/Main.scene`
- Create: `docs/assets/asset-credits.md`
- Create: `docs/lessons/lesson-6-audio-asset-pipeline.md`

## Task 1: 下载并挑选音效资源

**Files:**
- Create: `assets/audio/sfx/sfx_ui_click.ogg`
- Create: `assets/audio/sfx/sfx_collect.ogg`
- Create: `assets/audio/sfx/sfx_game_over.ogg`

- [ ] **Step 1: 下载资源包到临时目录**

Run:

```powershell
$zip = Join-Path $env:TEMP 'kenney_ui-audio.zip'
Invoke-WebRequest -Uri 'https://kenney.nl/media/pages/assets/ui-audio/490d233f68-1677590494/kenney_ui-audio.zip' -OutFile $zip
```

- [ ] **Step 2: 解压并查看资源**

Run:

```powershell
$extract = Join-Path $env:TEMP 'kenney_ui-audio'
if (Test-Path $extract) { Remove-Item -LiteralPath $extract -Recurse -Force }
Expand-Archive -Path $zip -DestinationPath $extract
Get-ChildItem -Recurse $extract -File | Select-Object FullName
```

- [ ] **Step 3: 创建项目音效目录**

Run:

```powershell
New-Item -ItemType Directory -Force assets\audio\sfx
```

- [ ] **Step 4: 挑选并复制 3 个 `.ogg` 文件**

从解压目录中挑选 3 个短音效，复制到：

```text
assets/audio/sfx/sfx_ui_click.ogg
assets/audio/sfx/sfx_collect.ogg
assets/audio/sfx/sfx_game_over.ogg
```

- [ ] **Step 5: 等待 Cocos 导入音频**

回到 Cocos Creator，等待 Assets 面板出现 `assets/audio/sfx` 下的三个音频资源和对应 `.meta`。

- [ ] **Step 6: Commit**

```powershell
git add assets/audio
git commit -m "feat: import star catcher sound effects"
```

## Task 2: 记录资源授权

**Files:**
- Create: `docs/assets/asset-credits.md`

- [ ] **Step 1: 创建授权记录文档**

Create `docs/assets/asset-credits.md` with this content:

```md
# Asset Credits

| 资源 | 来源 | 作者 | 授权 | 用途 | 链接 |
| --- | --- | --- | --- | --- | --- |
| sfx_ui_click.ogg | Kenney UI Audio | Kenney | CC0 | Start / Restart 按钮音效 | https://kenney.nl/assets/ui-audio |
| sfx_collect.ogg | Kenney UI Audio | Kenney | CC0 | 收集星星音效 | https://kenney.nl/assets/ui-audio |
| sfx_game_over.ogg | Kenney UI Audio | Kenney | CC0 | Game Over 音效 | https://kenney.nl/assets/ui-audio |
```

- [ ] **Step 2: Commit**

```powershell
git add docs/assets/asset-credits.md
git commit -m "docs: record audio asset credits"
```

## Task 3: 新增 AudioManager

**Files:**
- Create: `assets/scripts/AudioManager.ts`

- [ ] **Step 1: 创建 `AudioManager.ts`**

Create `assets/scripts/AudioManager.ts` with this content:

```ts
import { _decorator, AudioClip, AudioSource, Component } from 'cc';

const { ccclass, property, requireComponent } = _decorator;

@ccclass('AudioManager')
@requireComponent(AudioSource)
export class AudioManager extends Component {
    @property(AudioClip)
    public clickClip: AudioClip | null = null;

    @property(AudioClip)
    public collectClip: AudioClip | null = null;

    @property(AudioClip)
    public gameOverClip: AudioClip | null = null;

    private _audioSource: AudioSource | null = null;

    onLoad() {
        this._audioSource = this.getComponent(AudioSource);
    }

    public playClick() {
        this.playOneShot(this.clickClip);
    }

    public playCollect() {
        this.playOneShot(this.collectClip);
    }

    public playGameOver() {
        this.playOneShot(this.gameOverClip);
    }

    private playOneShot(clip: AudioClip | null) {
        if (!clip || !this._audioSource) {
            return;
        }

        this._audioSource.playOneShot(clip);
    }
}
```

- [ ] **Step 2: 等待 Cocos 导入脚本**

回到 Cocos Creator，等待 `AudioManager` 出现在 Assets 面板，并生成 `.meta`。

- [ ] **Step 3: Commit**

```powershell
git add assets/scripts/AudioManager.ts assets/scripts/AudioManager.ts.meta
git commit -m "feat: add audio manager"
```

## Task 4: 在 GameManager 中触发音效

**Files:**
- Modify: `assets/scripts/GameManager.ts`

- [ ] **Step 1: 修改 `GameManager.ts`**

Add import:

```ts
import { AudioManager } from './AudioManager';
```

Add property:

```ts
@property(AudioManager)
public audioManager: AudioManager | null = null;
```

In `startGame`, before state changes or after entering the method, call:

```ts
this.audioManager?.playClick();
```

In `collectStar`, after `_score += 1`, call:

```ts
this.audioManager?.playCollect();
```

In `endGame`, after setting state to GameOver, call:

```ts
this.audioManager?.playGameOver();
```

- [ ] **Step 2: 等待 Cocos 重新编译脚本**

回到 Cocos Creator，确认 `GameManager` 组件出现 `Audio Manager` 引用。

- [ ] **Step 3: Commit**

```powershell
git add assets/scripts/GameManager.ts
git commit -m "feat: play sounds for game events"
```

## Task 5: 场景绑定 AudioManager 和音频资源

**Files:**
- Modify: `assets/scenes/Main.scene`

- [ ] **Step 1: 创建 AudioManager 节点**

在 Cocos Creator 的 Hierarchy 面板中：

```text
Canvas -> 右键 -> Create -> Create Empty Node
```

命名为：

```text
AudioManager
```

添加组件：

```text
Add Component -> Custom Script -> AudioManager
```

确认节点上有 `AudioSource` 组件。

- [ ] **Step 2: 绑定音频资源**

选中 `AudioManager` 节点，在 `AudioManager` 组件中拖拽绑定：

```text
Click Clip: sfx_ui_click
Collect Clip: sfx_collect
Game Over Clip: sfx_game_over
```

- [ ] **Step 3: 绑定 GameManager 引用**

选中 `GameManager` 节点，将 Hierarchy 里的 `AudioManager` 节点拖到：

```text
Audio Manager
```

- [ ] **Step 4: 保存场景**

在 Cocos Creator 中执行：

```text
Ctrl + S
```

- [ ] **Step 5: Commit**

```powershell
git add assets/scenes/Main.scene
git commit -m "chore: wire audio manager in scene"
```

## Task 6: 手动运行验证

**Files:**
- No file changes expected.

- [ ] **Step 1: 运行预览**

Expected:

```text
点击 Start 有按钮音效
收集星星有收集音效
倒计时归零有 Game Over 音效
点击 Restart 有按钮音效
Console 没有脚本报错
```

## Task 7: 记录第 6 课复盘

**Files:**
- Create: `docs/lessons/lesson-6-audio-asset-pipeline.md`

- [ ] **Step 1: 创建复盘文档**

Create `docs/lessons/lesson-6-audio-asset-pipeline.md` with this content:

```md
# 第 6 课：音效资源管线

## 本课目标

给 Star Catcher 加入按钮、收集和失败音效，并建立资源授权记录。

## 今天真正掌握的东西

- 外部资源进入项目前要先确认授权。
- 不要把整包资源全部导入项目，只挑真正用到的资源。
- 音效应该放在清晰目录中，例如 `assets/audio/sfx`。
- Cocos 音频资源也会生成 `.meta`，需要和音频文件一起提交。
- `AudioManager` 可以集中管理音效播放，避免各个脚本直接操作 AudioSource。

## 技术总结

这一课补齐了从 demo 到成品非常关键的一条线：

```text
找资源
    ↓
确认授权
    ↓
挑选需要的文件
    ↓
导入 Cocos
    ↓
绑定到组件
    ↓
在游戏事件中播放
    ↓
记录 credits
```

资源管线和代码同样重要。没有授权记录，项目就不适合发布；没有资源目录规范，项目很快会变乱。

## 可以自己试的小改动

- 换一个收集音效，观察手感变化。
- 给按钮和 Game Over 分别调不同音效。
- 在 `asset-credits.md` 里新增一条资源记录。
```

- [ ] **Step 2: Commit**

```powershell
git add docs/lessons/lesson-6-audio-asset-pipeline.md
git commit -m "docs: add lesson 6 recap"
```

## Task 8: 同步第 6 课进度

**Files:**
- No file changes expected.

- [ ] **Step 1: 推送到 GitHub**

Run:

```powershell
git push
```

Expected:

```text
main -> main
```

## 自检

- 资源来源和授权已记录。
- 只导入本课需要的少量音效。
- 音效由 `AudioManager` 集中播放。
- 每课结束包含技术总结。
- 需要你阅读的内容全部使用中文。
