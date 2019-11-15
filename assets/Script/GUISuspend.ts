import { _decorator, Component, Node,tweenUtil } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GUISuspend")
export class GUISuspend extends Component {
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
    show(callbackContinue)
    {
        this.callback = callbackContinue;
        this.node.active = true;

        var promotion = this.node.getChildByName('promotion');
        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true &&   window.wx)
        {
            promotion.active = true;
            this.promotion = promotion.getComponent( "home-promotion2" );;
            this.promotion.init(fcapp.sidebarList_home);
        }
        else
        {
            promotion.active = false;
        }
        
        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true  && window.wx)
        {
            this.banner = window.bannerMgr.showBottomBanner();
            this.promotion.setBanner(this.banner);
        }
    }
    hide()
    {
        this.node.active = false;
    }
    
    //继续
    callbackContinueBtn()
    {
        fcapp.audio.play(fcapp.audio.audio18);
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }
        this.callback();
    }
    //重新
    callbackRestartBtn()
    {
        fcapp.audio.play(fcapp.audio.audio18);
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }
        this.hide();
        fcapp.lockView.loadSceneName('GameScene', ( hideLoadingCall ) => {
            fcapp.gameMgr.loadRoleRes( () => {
                fcapp.gameMgr.init();
                hideLoadingCall();
            } );
        });
        // fcapp.lockView.loadSceneName('GameScene');
    }
    //退出
    callbackQuiteBtn()
    {
        fcapp.audio.play(fcapp.audio.audio18);
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }
        this.hide();
        cc.director.loadScene("MainScene")
        // fcapp.lockView.loadSceneName('MainScene', ( hideLoadingCall ) => {
        //     fcapp.gameMgr.loadRoleRes( () => {
        //         // fcapp.gameMgr.init();
        //         hideLoadingCall();
        //     } );
        // });
        // fcapp.lockView.loadSceneName('MainScene');
    }



}
