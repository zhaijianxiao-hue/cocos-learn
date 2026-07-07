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
