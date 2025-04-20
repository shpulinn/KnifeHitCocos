import { _decorator, Component, RigidBody2D, Input, input, EventMouse, Vec2, Vec3, Collider2D, Contact2DType, Node, IPhysics2DContact, director, Director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('KnifePhysicController')
export class KnifePhysicController extends Component {
    @property
    throwForce: number = 500;

    @property(Vec3)
    offset: Vec3 | null = null;

    private rigidBody: RigidBody2D | null = null;
    private collider: Collider2D | null = null;
    private isThrown: boolean = false;
    private isStuck: boolean = false;
    private stickTarget: Node | null = null;
    private contactPoint: Vec3 | null = null;

    // private gameManager: any = null;

    // public setGameManager(manager: any) {
    //     this.gameManager = manager;
    // }

    start() {
        this.rigidBody = this.getComponent(RigidBody2D);
        this.collider = this.getComponent(Collider2D);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);

        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onMouseDown(event: EventMouse) {
        if (!this.isThrown && this.rigidBody) {
            this.isThrown = true;
            this.rigidBody.applyLinearImpulseToCenter(new Vec2(0, this.throwForce), true);
        }
    }

    private onBeginContact(selfCol: Collider2D, otherCol: Collider2D, contact: IPhysics2DContact | null) {
        if (this.isStuck) return;

        const otherNode = otherCol.node;
        if (otherNode.getComponent(Collider2D).tag === 1) {
            this.isStuck = true;
            this.stickTarget = otherNode;

            const worldManifold = contact.getWorldManifold();
            this.contactPoint = worldManifold.points[0].toVec3();

            director.once(Director.EVENT_AFTER_PHYSICS, this.stickKnife, this);
        } 
        else if (otherNode.getComponent(Collider2D).tag === 2) {
            // if (this.gameManager) {
            //     this.gameManager.gameOver();
            // }
        }
    }

    private stickKnife() {
        if (!this.stickTarget || !this.rigidBody || !this.contactPoint) return;

        this.node.removeComponent(RigidBody2D);

        this.node.setWorldPosition(this.contactPoint.add(this.offset));

        this.node.scale = new Vec3(1, -1, 1);

        this.node.setParent(this.stickTarget);

        this.collider.tag = 2;

        // if (this.gameManager) {
        //     this.gameManager.addScore();
        // }
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }
}