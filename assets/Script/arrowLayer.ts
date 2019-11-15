import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("arrowLayer")
export class arrowLayer extends Component {
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
    onEnable() {
        var promotion = this.node.getChildByName('promotion');
        if(window.openBanner == true && window.wx)
        {
            promotion.active = true;
            this.promotion = promotion.getComponent( "home-promotion" );;
            this.promotion.init(fcapp.sidebarList_home);
        }
        else
        {
            promotion.active = false;
        }

        // promotion.active = true;
        // this.promotion = promotion.getComponent( "home-promotion" );;
        // this.promotion.init(fcapp.sidebarList_home);
    }

     //关闭按钮
     closeBackCall() {
         if(this.promotion)
            // this.promotion.exit();
        fcapp.audio.play(fcapp.audio.audio18);
        this.node.active = false;
    }
}
