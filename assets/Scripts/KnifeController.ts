import { _decorator, Component, Node, Prefab, instantiate, Sprite, Vec3, tween, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('KnifeController')
export class KnifeController extends Component {
    @property(Prefab)
    knifePrefab: Prefab | null = null;

    @property(Node)
    spawnPoint: Node | null = null;

    @property(Node)
    woodNode: Node | null = null;

    @property(AudioSource)
    hitKnifeSound: AudioSource  | null = null;

    private currentKnife: Node | null = null;
    private defaultKnifePos: Vec3 = Vec3.ZERO;

    start() {
        if (!this.knifePrefab || !this.spawnPoint || !this.woodNode) {
            console.error('KnifeController: Required nodes or prefab not assigned!');
            return;
        }
        this.defaultKnifePos = this.spawnPoint.position.clone();
        console.log('KnifeController initialized, defaultKnifePos:', this.defaultKnifePos);
        this.spawnKnife();
    }

    spawnKnife() {
        if (this.knifePrefab && this.spawnPoint) {
            this.currentKnife = instantiate(this.knifePrefab);
            this.currentKnife.setParent(this.node);
            this.currentKnife.setPosition(this.defaultKnifePos);
            console.log('Spawned knife at:', this.currentKnife.position);
        } else {
            console.error('Cannot spawn knife: knifePrefab or spawnPoint missing');
        }
    }

    throwKnife(onComplete: (knife: Node) => void) {
        if (!this.currentKnife || !this.woodNode) {
            console.error('Cannot throw knife: currentKnife or woodNode missing');
            return;
        }

        const woodSprite = this.woodNode.getComponent(Sprite);
        if (!woodSprite || !woodSprite.spriteFrame) {
            console.error('KnifeController: Wood node missing Sprite or SpriteFrame!');
            return;
        }

        const woodRadius = woodSprite.spriteFrame.rect.height / 2 * this.woodNode.scale.y;
        const targetPos = new Vec3(0, this.woodNode.worldPosition.y - woodRadius * 2, 0);
        console.log('Throwing knife to targetPos:', targetPos, 'woodPosition:', this.woodNode.position, 'woodRadius:', woodRadius);

        tween(this.currentKnife)
            .to(.3, { position: targetPos }, { easing: 'linear' })
            .call(() => {
                if (this.currentKnife) {
                    onComplete(this.currentKnife);
                }
            })
            .start();
    }

    fallKnife(onComplete: () => void) {
        if (!this.currentKnife) return;

        this.hitKnifeSound.play();

        const fallPos = new Vec3(this.currentKnife.position.x, -1080, 0);
        tween(this.currentKnife)
            .to(0.5, { position: fallPos, angle: 30 }, { easing: 'linear' })
            .call(onComplete)
            .start();
    }

    getCurrentKnife(): Node | null {
        return this.currentKnife;
    }

    destroyCurrentKnife() {
        if (this.currentKnife) {
            this.currentKnife.destroy();
            this.currentKnife = null;
        }
    }

    respawnKnife() {
        this.destroyCurrentKnife();
        this.spawnKnife();
    }
}