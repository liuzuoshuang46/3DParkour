import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Ranking")
export class Ranking extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
        if(window.wx ) {
            let openDataContext = wx.getOpenDataContext();
            openDataContext.postMessage({
                message: 'Refresh',
            });
        }

        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true  && window.wx)
        {
            this.banner = window.bannerMgr.showBottomBanner();
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    clickSkip () {
        this.node.destroy();
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }
    }
    clickPreBtn () {
        if(window.wx ) {
            let openDataContext = wx.getOpenDataContext();
            openDataContext.postMessage({
                message: 'onTouchPrev',
            });
        }
    }
    clickNextBtn () {
        if(window.wx ) {
            let openDataContext = wx.getOpenDataContext();
            openDataContext.postMessage({
                message: 'onTouchNext',
            });
        }

       
    }
}
