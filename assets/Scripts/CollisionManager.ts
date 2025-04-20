import { _decorator, Component, Node, instantiate, Prefab, Sprite, UITransform, AudioSource, Vec2, Vec3 } from 'cc';
import { WoodController } from './WoodController';
const { ccclass, property } = _decorator;


@ccclass('CollisionManager')
export class CollisionManager extends Component {
    @property(Prefab)
    knifePrefab: Prefab | null = null;

    @property(Node)
    woodNode: Node | null = null;

    @property
    collisionAngle: number = 15;
    
    @property
    knifeOffsetDistance: number = 5;

    @property(AudioSource)
    hitWoodSound: AudioSource  | null = null;

    private knives: Node[] = [];
    private woodRadius: number = 0;
    private knifeAngles: number[] = [];

    start() {
        this.calculateWoodRadius();
    }

    private calculateWoodRadius(): void {
        if (!this.woodNode) return;
        
        const woodSprite = this.woodNode.getComponent(Sprite);
        const uiTransform = this.woodNode.getComponent(UITransform);
        
        if (woodSprite && woodSprite.spriteFrame && uiTransform) {
            this.woodRadius = uiTransform.width / 2 * this.woodNode.scale.y;
        } else {
            console.error('CollisionManager: Cannot calculate wood radius!');
        }
    }

    checkCollision(knife: Node): boolean {
        if (!this.woodNode) return false;

        
        const knifePos = knife.position;
        const woodPos = this.woodNode.position;
        const relativePos = new Vec3(knifePos.x - woodPos.x, knifePos.y - woodPos.y);
        let knifeAngle = (Math.atan2(relativePos.y, relativePos.x) * 180 / Math.PI + 90) % 360;
        knifeAngle = (knifeAngle + 360) % 360;

        const woodAngle = (this.woodNode.angle % 360 + 360) % 360;
        const adjustedKnifeAngle = (knifeAngle - woodAngle + 360) % 360;

        console.log(`Checking collision: knife angle ${adjustedKnifeAngle}, wood angle ${woodAngle}`);

        for (let i = 0; i < this.knifeAngles.length; i++) {
            const otherAngle = (this.knifeAngles[i] % 360 + 360) % 360;
            const angleDiff = Math.min(
                Math.abs(adjustedKnifeAngle - otherAngle),
                360 - Math.abs(adjustedKnifeAngle - otherAngle)
            );

            if (angleDiff < this.collisionAngle) {
                console.log(`Collision detected: knife angle ${adjustedKnifeAngle}, other knife angle ${otherAngle}, diff ${angleDiff}`);
                return true;
            }
        }
        return false;
    }

    attachKnife(knife: Node) {
        if (!this.knifePrefab || !this.woodNode) {
            console.error('CollisionManager: knifePrefab or woodNode missing');
            return;
        }

        this.hitWoodSound?.play();
        this.calculateWoodRadius();

        const knifePos = knife.position;
        const woodPos = this.woodNode.position;
        const relativePos = new Vec3(knifePos.x - woodPos.x, knifePos.y - woodPos.y);
        let knifeAngle = (Math.atan2(relativePos.y, relativePos.x) * 180 / Math.PI - 90) % 360;
        knifeAngle = (knifeAngle + 360) % 360;

        const woodAngle = (this.woodNode.angle % 360 + 360) % 360;
        const adjustedKnifeAngle = (knifeAngle - woodAngle + 360) % 360;

        const newKnife = instantiate(this.knifePrefab);
        newKnife.setParent(this.woodNode);
        newKnife.active = true;
        newKnife.setSiblingIndex(this.knives.length + 10);

        newKnife.angle = adjustedKnifeAngle;
        const finalRadius = this.woodRadius + this.knifeOffsetDistance;
        const rad = (Math.PI * (adjustedKnifeAngle - 90)) / 180;
        newKnife.setPosition(
            finalRadius * Math.cos(rad),
            finalRadius * Math.sin(rad)
        );

        this.knives.push(newKnife);
        this.knifeAngles.push(adjustedKnifeAngle);
        console.log(`Knife attached at angle: ${adjustedKnifeAngle}, position: ${newKnife.position.x}, ${newKnife.position.y}, wood angle: ${woodAngle}`);
    }

    update(deltaTime: number) {
        if (!this.woodNode) return;
        
        const woodController = this.woodNode.getComponent(WoodController);
        const rotationSpeed = woodController ? woodController.getRotationSpeed() * deltaTime : 0;

        for (const knife of this.knives) {
            knife.angle = (knife.angle + rotationSpeed) % 360;
            this.updateKnifePosition(knife);
        }
    }

    private updateKnifePosition(knife: Node) {
        if (this.woodRadius <= 0) {
            this.calculateWoodRadius();
        }
        
        const rad = Math.PI * (knife.angle - 90) / 180;
        
        const finalRadius = this.woodRadius + this.knifeOffsetDistance;
        
        knife.setPosition(
            finalRadius * Math.cos(rad),
            finalRadius * Math.sin(rad)
        );
    }

    getKnives(): Node[] {
        return this.knives;
    }
    
    clearKnives(): void {
        for (const knife of this.knives) {
            knife.destroy();
        }
        this.knives = [];
    }
}