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
