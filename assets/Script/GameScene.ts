import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GameScene")
export class GameScene extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    backCallBack() {
        cc.director.loadScene('MainScene');
    }
}
