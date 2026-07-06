# 第 6 课：音效资源管线

## 本课目标

把外部音效资源导入 Cocos，记录素材来源，并让游戏里的关键事件播放对应音效：

- 点击 Start / Restart：播放点击音效。
- 收集星星：播放收集音效。
- 游戏结束：播放失败音效。

## 今天真正掌握的东西

- Cocos 资源不是只有原始文件，旁边的 `.meta` 才是编辑器识别和引用资源的身份信息。
- `AudioClip` 是音频资源，`AudioSource` 是负责播放音频的组件。
- `@property(AudioClip)` 可以让脚本在 Inspector 里暴露音频拖拽槽。
- `playOneShot()` 适合播放短音效，不会打断同一个 `AudioSource` 上正在播放的其他一次性音效。
- 外部素材要记录来源和授权，不能只把文件扔进项目里。

## 关键代码

`AudioManager` 负责保存音效资源引用，并统一播放：

```ts
@property(AudioClip)
public collectClip: AudioClip | null = null;

private _audioSource: AudioSource | null = null;

onLoad() {
    this._audioSource = this.getComponent(AudioSource);
}

public playCollect() {
    this.playOneShot(this.collectClip);
}

private playOneShot(clip: AudioClip | null) {
    if (!clip || !this._audioSource) {
        return;
    }

    this._audioSource.playOneShot(clip);
}
```

`GameManager` 不直接处理底层播放，只在游戏事件发生时通知音频管理器：

```ts
private collectStar() {
    this._score += 1;
    this.audioManager?.playCollect();
    this.updateScoreLabel();
    this.respawnStar();
}
```

这里的 `?.` 表示：如果 `audioManager` 已经绑定，就调用；如果没有绑定，就安静跳过。它能避免空引用报错，但不能替代正确接线。

## 技术总结

这一课的完整链路是：

```text
外部音频文件
-> 放入 assets/audio/sfx
-> Cocos 生成 .meta
-> 脚本用 @property(AudioClip) 暴露引用槽
-> Inspector 拖入 AudioClip
-> GameManager 在事件发生时调用 AudioManager
-> AudioSource.playOneShot 播放短音效
```

这就是游戏资源管线的雏形。图片、音乐、预制体、模型以后也类似：先进入 `assets`，由 Cocos 生成资源身份，再通过组件属性或代码加载进入运行时。

## 资源管理习惯

本课使用的音效来自 Kenney UI Audio，授权是 CC0。我们把来源写进：

```text
docs/assets/asset-credits.md
```

以后只要项目加入外部素材，都要补到这个表里。这个习惯会让项目从“练习 demo”慢慢接近“可以发布的作品”。

## 可以自己试的小改动

- 换一组点击音效，感受 UI 反馈的变化。
- 把收集音效音量调小一点，避免频繁收集时太吵。
- 新增一个 `AudioManager.playButton()`，让所有 UI 按钮统一走同一个入口。
- 思考背景音乐和短音效的区别：背景音乐通常循环播放，短音效通常用 `playOneShot()`。

