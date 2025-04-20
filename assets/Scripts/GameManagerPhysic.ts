import { _decorator, Component, Node, Prefab, instantiate, Label, director, Canvas } from 'cc';
import { KnifePhysicController } from './KnifePhysicController';
const { ccclass, property } = _decorator;

@ccclass('GameManagerPhysic')
export class GameManagerPhysic extends Component {
    @property(Node)
    knifeSpawnPoint: Node = null;

    @property(Label)
    scoreLabel: Label = null;

    @property(Prefab)
    knifePrefab: Prefab = null;

    @property(Canvas)
    canvas: Canvas = null;

    private currentKnife: Node = null;
    private score: number = 0;
    private isGameOver: boolean = false;

    start() {
        this.spawnKnife();
    }

    spawnKnife() {
        if (this.isGameOver) return;

        let canvas = director.getScene().getChildByName("Canvas");

        this.currentKnife = instantiate(this.knifePrefab);
        this.currentKnife.setParent(canvas);
        this.currentKnife.setPosition(this.knifeSpawnPoint.getPosition());

        const knifeScript = this.currentKnife.getComponent(KnifePhysicController);
        knifeScript.setGameManager(this);
    }

    addScore() {
        this.score++;
        this.scoreLabel.string = this.score.toString();
        this.spawnKnife();
    }

    gameOver() {
        this.isGameOver = true;
        this.scoreLabel.string = 'Game Over';

        this.scheduleOnce(() => {
            director.loadScene(director.getScene().name);
        }, 1.5);
    }
}
