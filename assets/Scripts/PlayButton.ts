import { _decorator, Component, Button, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayButton')
export class PlayButton extends Component {

    @property(Button)
    button: Button | null = null;

    onLoad () {
        this.button.node.on(Button.EventType.CLICK, this.callback, this);
    }

    callback (button: Button) {
        director.loadScene("MainScene");
    }   
}