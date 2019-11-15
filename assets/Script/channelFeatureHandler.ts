import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("channelFeatureHandler")
export class channelFeatureHandler extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property({ type: [Node] })
    public videoSprArr = [];

    start () {
       

        // Your initialization goes here.
    }
    onEnable() {
        if( fcapp.hbswitch.hideVideoSpr ){
            this.hideVideoSpr();
        }
    }
    hideVideoSpr () {
        for (var i in this.videoSprArr) {
            var spr = this.videoSprArr[i];
            spr && (spr.active = false);
        }
    }
}
