import { _decorator, Color, Component, Graphics, UITransform } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('StarView')
export class StarView extends Component {
    @property
    public radius = 28;

    @property
    public fillColor = new Color(255, 220, 80, 255);

    start() {
        this.draw();
    }

    private draw() {
        let transform = this.getComponent(UITransform);
        if (!transform) {
            transform = this.addComponent(UITransform);
        }

        let graphics = this.getComponent(Graphics);
        if (!graphics) {
            graphics = this.addComponent(Graphics);
        }

        transform.setContentSize(this.radius * 2, this.radius * 2);

        graphics.clear();
        graphics.fillColor = this.fillColor;
        graphics.circle(0, 0, this.radius);
        graphics.fill();
    }
}
