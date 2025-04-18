import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Label)
    scoreLabel: Label | null = null;

    start() {
        if (!this.scoreLabel) {
            console.error('UIManager: scoreLabel not assigned!');
            return;
        }
        this.updateScore(0);
    }

    updateScore(score: number) {
        if (this.scoreLabel) {
            this.scoreLabel.string = `Score: ${score}`;
        }
    }
}