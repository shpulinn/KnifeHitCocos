import { _decorator, Component, Node, director, UITransform, input, Input} from 'cc';
import { KnifeController } from './KnifeController';
import { CollisionManager } from './CollisionManager';
import { UIManager } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(KnifeController)
    knifeController: KnifeController | null = null;

    @property(CollisionManager)
    collisionManager: CollisionManager | null = null;

    @property(UIManager)
    uiManager: UIManager | null = null;

    private score: number = 0;
    private canThrow: boolean = true;

    start() {
        console.log('GameManager start, checking setup:', {
            uiTransform: !!this.node.getComponent(UITransform),
            knifeController: !!this.knifeController,
            collisionManager: !!this.collisionManager,
            uiManager: !!this.uiManager,
            nodeActive: this.node.active
        });

        if (!this.node.getComponent(UITransform)) {
            console.error('GameManager: UITransform component missing on node!');
            return;
        }

        this.score = 0;
        this.canThrow = true;
        this.uiManager.updateScore(this.score);

        input.on(Input.EventType.MOUSE_DOWN, this.handleTouch, this);
        input.on(Input.EventType.TOUCH_START, this.handleTouch, this);
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_DOWN, this.handleTouch, this);
        input.off(Input.EventType.TOUCH_START, this.handleTouch, this);
    }

    handleTouch() {
        if (!this.canThrow || !this.knifeController || !this.collisionManager || !this.uiManager) {
            console.log('Cannot throw: canThrow=', this.canThrow);
            return;
        }

        this.canThrow = false;

        this.knifeController.throwKnife((knife: Node) => {
            const isHit = this.collisionManager.checkCollision(knife);

            if (isHit) {
                this.knifeController.fallKnife(() => {
                    console.log('Game over!');
                    director.loadScene('MainScene');
                });
            } else {
                this.collisionManager.attachKnife(knife);
                this.score++;
                this.uiManager.updateScore(this.score);
                this.knifeController.respawnKnife();
                this.canThrow = true;
            }
        });
    }
}