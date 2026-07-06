import { _decorator, Color, Component, Graphics, UITransform } from 'cc';

const { ccclass, property, requireComponent } = _decorator;

@ccclass('PlayerView')
@requireComponent(UITransform)
@requireComponent(Graphics)
export class PlayerView extends Component {
    @property
    public width = 64;

    @property
    public height = 64;

    @property
    public fillColor = new Color(70, 170, 255, 255);

    start() {
        this.draw();
    }

    private draw() {
        const transform = this.getComponent(UITransform) ?? this.addComponent(UITransform);
        const graphics = this.getComponent(Graphics) ?? this.addComponent(Graphics);

        transform.setContentSize(this.width, this.height);

        graphics.clear();
        graphics.fillColor = this.fillColor;
        graphics.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 8);
        graphics.fill();
    }
}
