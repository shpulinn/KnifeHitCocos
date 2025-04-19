import { _decorator, Component} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WoodController')
export class WoodController extends Component {
    @property
    initialSpeed: number = 2.5;

    private rotationSpeed: number = 0;

    start() {
        this.rotationSpeed = this.initialSpeed;
        this.node.setSiblingIndex(10);
        this.node.setPosition(0, 400, 0);
        console.log('WoodController initialized, position:', this.node.getWorldPosition());

        this.schedule(this.changeSpeed, 2.5);
    }

    onDestroy() {
        this.unschedule(this.changeSpeed);
    }

    changeSpeed() {
        const dir = Math.random() > 0.5 ? 1 : -1;
        const speed = 1 + Math.random() * 2;
        this.rotationSpeed = dir * speed;
        console.log('Wood rotation speed changed:', this.rotationSpeed);
    }

    update(deltaTime: number) {
        this.node.angle = (this.node.angle + this.rotationSpeed) % 360;
    }

    getRotationSpeed(): number {
        return this.rotationSpeed;
    }
}