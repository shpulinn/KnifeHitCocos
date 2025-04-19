import { _decorator, Component, Node, instantiate, Prefab, Sprite } from 'cc';
import { WoodController } from './WoodController';
const { ccclass, property } = _decorator;


@ccclass('CollisionManager')
export class CollisionManager extends Component {
    @property(Prefab)
    knifePrefab: Prefab | null = null;

    @property(Node)
    woodNode: Node | null = null;

    private knives: Node[] = [];

    checkCollision(knife: Node): boolean {
        const gap = 15;
        const knifeAngle = knife.angle % 360;

        for (const otherKnife of this.knives) {
            const otherAngle = otherKnife.angle % 360;
            if (Math.abs(knifeAngle - otherAngle) < gap || Math.abs(360 - Math.abs(knifeAngle - otherAngle)) < gap) {
                return true; // Столкновение
            }
        }
        return false; // Нет столкновения
    }

    attachKnife(knife: Node) {
        if (!this.knifePrefab || !this.woodNode) {
            console.error('CollisionManager: knifePrefab or woodNode missing');
            return;
        }

        const woodSprite = this.woodNode.getComponent(Sprite);
        if (!woodSprite || !woodSprite.spriteFrame) {
            console.error('CollisionManager: Wood node missing Sprite or SpriteFrame!');
            return;
        }

        const newKnife = instantiate(this.knifePrefab);
        newKnife.setParent(this.woodNode); // Прикрепляем к Wood для локальных координат
        newKnife.setPosition(0, -woodSprite.spriteFrame.rect.height / 2 * this.woodNode.scale.y); // Начальная позиция на краю
        newKnife.angle = knife.angle;
        newKnife.setSiblingIndex(10);

        this.knives.push(newKnife);
        console.log('Attached knife, woodPosition:', this.woodNode.position, 'knife angle:', newKnife.angle);
    }

    update(deltaTime: number) {
        if (!this.woodNode) return;

        const woodSprite = this.woodNode.getComponent(Sprite);
        if (!woodSprite || !woodSprite.spriteFrame) return;

        const woodRadius = woodSprite.spriteFrame.rect.height / 2 * this.woodNode.scale.y;
        let rotationSpeed = this.woodNode.getComponent(WoodController)?.getRotationSpeed() || 0;

        for (const knife of this.knives) {
            knife.angle = (knife.angle + rotationSpeed / 2) % 360;
            this.updateKnifePosition(knife, woodRadius);
        }
    }

    private updateKnifePosition(knife: Node, woodRadius: number) {
        const rad = (Math.PI * (knife.angle - 90)) / 180;
        knife.setPosition(
            woodRadius * Math.cos(rad),
            woodRadius * Math.sin(rad)
        );
    }

    getKnives(): Node[] {
        return this.knives;
    }
}