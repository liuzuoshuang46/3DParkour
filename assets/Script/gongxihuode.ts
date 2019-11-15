import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("gongxihuode")
export class gongxihuode extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    init ( closeCall ) {
        this.closeCall = closeCall;
        // if(app.G.SWITCH_WXTENSION == true) {
        //     if (app.sidebarList.length > 0) {
        //         this.homePromotion.node.active = true;
        //         this.homePromotion.init();
        //     }
        //     else {
        //         this.homePromotion.node.active = false;
        // }
        // }
        // else
        // {
        //     this.homePromotion.node.active = false;
        // }

    }

    clickGet () {
        this.closeCall && this.closeCall();
        this.node.destroy();
    }
}
