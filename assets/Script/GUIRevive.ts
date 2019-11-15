import { _decorator, Component, Node,director ,LabelComponent,ButtonComponent,tweenUtil} from "cc";
const { ccclass, property } = _decorator;

@ccclass("GUIRevive")
export class GUIRevive extends Component {

     //钻石数量
     @property({ type: LabelComponent })
     public timeLabel = null;

      //倒计时事件
      private times :Number = 10;
       //倒计时状态
     private timeState = false;

    onLoad () {
        var promotion = this.node.getChildByName('promotion');
        var promotion2 = this.node.getChildByName('promotion2');
        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true && window.wx)
        {
            if(window.fcapp.hbswitch.bannerDelay == true)
            {
                promotion.active = true;
                this.promotion = promotion.getComponent( "home-promotion" );;
                this.promotion.init(fcapp.sidebarList_home);
            }
            else
            {
                promotion.active = false;
            }
            

            promotion2.active = true;
            this.promotion2 = promotion2.getComponent( "home-promotion" );;
            this.promotion2.init(fcapp.sidebarList_home);
        }
        else
        {
            promotion2.active = false;
            promotion.active = false;
        }

        fcapp.datasdk.onEvent("复活界面显示");
        // promotion.active = true;
        // this.promotion = promotion.getComponent( "home-promotion2" );;
        // this.promotion.init(fcapp.sidebarList_home);
    }
    onEnable() {
        
    }
    clickCancel () {
        if(this.promotion)
            // this.promotion.exit();
        fcapp.audio.play(fcapp.audio.audio18);
        fcapp.gameUI.hideGameOver();
        fcapp.gameUI.showSettlement();
    }

    clickRevival () {
        this.timeState = false;
        fcapp.audio.play(fcapp.audio.audio18);
        var next = function( ret ){
            this.timeState = true;
            if( ret ){
                // if(this.promotion)
                    // this.promotion.exit();
                fcapp.data.setTaskNum(7,1);
                fcapp.datasdk.onEvent("角色复活成功");
                fcapp.gameMgr.revival();
                fcapp.gameUI.hideGameOver();
            }
            else
            {
                fcapp.logItem.log('复活失败');
            }
        }.bind( this );
        fcapp.chsdk.callAdVideo( next );
       
    }

    show () {
        this.node.active = true;
        this.times = 10;
        this.timeState = true;
        this.timeLabel.string = 10;
        console.log("复活界面展示");
        var cancelImage =  this.node.getChildByName('cancelImage');
        var cancel =  this.node.getChildByName('cancel');
        if(window.openBanner == true && window.wx && window.fcapp.hbswitch.bannerDelay == true)
        {
            cancelImage.active = true;
            cancel.active = false;
            let temp = {};
            tweenUtil(temp)
                .to(1.5, { time: temp.stopIdx }, { easing: 'Cubic-Out' }) // 转10圈*8个 = 80个
                .call(function() {
                    this.banner = window.bannerMgr.showBottomBanner();
                    this.promotion2.setBanner(this.banner);
                    window.bannerMgr.onBannerClick(function () {
                        fcapp.datasdk.onEvent("复活banner点击");
                    }.bind(this));
                }.bind(this))
                .to(0.5, { time: temp.stopIdx }, { easing: 'Cubic-Out' }) // 转10圈*8个 = 80个
                .call(function() {
                    cancelImage.active = false;
                    cancel.active = true;
                }.bind(this))
                .start()

        }
        else
        {
            cancelImage.active = false;
            cancel.active = true;
            if(this.promotion)
                this.promotion.node.active = false;
        }


        
    }
    hide () {
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }
        this.node.active = false;
        this.timeState = false;
        this.times = 10;
    }
    update (dt) {

        if( this.timeState == true)
        {
            this.times -= dt;

            this.timeLabel.string = parseInt(this.times);
            if(this.times <=0)
            {
                this.timeState = false;
                this.clickCancel();
            }
        }
    }
}
