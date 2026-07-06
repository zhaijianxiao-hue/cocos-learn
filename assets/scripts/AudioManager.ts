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
        this.scheduleOnce(() => {
            this.playOneShot(this.clickClip);
        }, 0);
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
