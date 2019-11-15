import { _decorator, Component, Node,director ,LabelComponent,ButtonComponent,tweenUtil} from "cc";
const { ccclass, property } = _decorator;

@ccclass("GUIGameOver")
export class GUIGameOver extends Component {
    @property({ type: LabelComponent })
    public metreLabel = null;
    @property({ type: LabelComponent })
    public coinLabel = null;
    @property({ type: LabelComponent })
    public diamondsLabel = null;
    // onLoad () {
    //     this.getBtnY = this.node.getChildByName('cancel').position.y;
    // }
    onEnable() {
        // this.getBtnY = this.node.getChildByName('cancel').position.y;

        var promotion2 = this.node.getChildByName('bg').getChildByName('promotion2');
        var promotion = this.node.getChildByName('bg').getChildByName('promotion');
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
            this.promotion2 = promotion2.getComponent( "home-promotion2" );;
            this.promotion2.init(fcapp.sidebarList_home);
        }
        else
        {
            promotion.active = false;
            promotion2.active = false;
        }


        this.show ();
        // promotion.active = true;
        // this.promotion = promotion.getComponent( "home-promotion2" );;
        // this.promotion.init(fcapp.sidebarList_home);
    }
    backMainScene () {
        if (window.openBanner == true && window.wx) 
        {
            // this.node.getChildByName('cancel').position.y = this.getBtnY;
            window.bannerMgr.rmBanner( this.banner);
        }

        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true  && window.wx)
        {
            fcapp.gameUI.clickGengduo(function( ret ){
                cc.director.loadScene("MainScene")
                // fcapp.lockView.loadSceneName('MainScene');
            }.bind( this ));
        }
        else
        {
            cc.director.loadScene("MainScene")
            // fcapp.lockView.loadSceneName('MainScene');
        }

        
    }

    clickGet () {
        fcapp.audio.play(fcapp.audio.audio18);
        var coinNum = parseInt(fcapp.gameMgr._play.getCoin());
        if( fcapp.gameMgr.readyPropId == 1 || fcapp.gameMgr._play.roleId == 4)
        {
            coinNum =  coinNum*2;
        }
        fcapp.data.coin =  Number(fcapp.data.coin) + coinNum;
        var diamondsNum = parseInt(fcapp.gameMgr._play.getDiamonds());
        fcapp.data.diamond =   Number(fcapp.data.diamond) + diamondsNum;

        var stt = "";
        if(coinNum > 0)
        {
            stt = "金币x"+coinNum;
        }
        if(diamondsNum > 0)
        {
            stt = ";钻石x"+diamondsNum;
        }
        fcapp.logItem.log(stt);

        this.backMainScene();
    }
    clickDoubleGet () {
        fcapp.audio.play(fcapp.audio.audio18);
        var next = function( ret ){
            if( ret ){
                var coinNum = parseInt(fcapp.gameMgr._play.getCoin()) * 2;
                if( fcapp.gameMgr.readyPropId == 1 || fcapp.gameMgr._play.roleId == 4)
                {
                    coinNum =  coinNum*2;
                }
                fcapp.data.coin =  Number(fcapp.data.coin) + coinNum;
                var diamondsNum = parseInt(fcapp.gameMgr._play.getDiamonds()) * 2;
                fcapp.data.diamond =   Number(fcapp.data.diamond) + diamondsNum;
        
                var stt = "";
                if(coinNum > 0)
                {
                    stt = "金币x"+coinNum;
                }
                if(diamondsNum > 0)
                {
                    stt = ";钻石x"+diamondsNum;
                }
                fcapp.logItem.log(stt);
        
                fcapp.datasdk.onEvent("游戏双倍结算");
                this.backMainScene();
            }
            else
            {
                fcapp.logItem.log('领取失败');
            }
        }.bind( this );
        fcapp.chsdk.callAdVideo( next );
        
    }

    show () {
        fcapp.audio.player.stop();
        fcapp.audio.playShort(fcapp.audio.audio10);
        
        let meterOfRun = parseInt(fcapp.gameMgr._play.getMeterOfRun());
        this.metreLabel.string = meterOfRun;


        if(meterOfRun < 100)
        {
            fcapp.datasdk.onEvent("游戏结算界面显示","100米以下");
        }
        else  if(meterOfRun < 500)
        {
            fcapp.datasdk.onEvent("游戏结算界面显示","500米以下");
        }
        else  if(meterOfRun < 1000)
        {
            fcapp.datasdk.onEvent("游戏结算界面显示","1000米以下");
        }
        else
        {
            fcapp.datasdk.onEvent("游戏结算界面显示","1000米以上");
        }
        
        
        fcapp.datasdk.onEvent("进切换场景次数","次数"+fcapp.gameMgr._intoCoinJs);

        fcapp.data.setTaskNum(1,meterOfRun);

        var coinNum =  parseInt(fcapp.gameMgr._play.getCoin());
        if( fcapp.gameMgr.readyPropId == 1 || fcapp.gameMgr._play.roleId == 4)
        {
            coinNum =  coinNum*2;
        }
        fcapp.data.setTaskNum(4,coinNum);
        this.coinLabel.string =  coinNum;

        let diamondsNum = parseInt(fcapp.gameMgr._play.getDiamonds());
        this.diamondsLabel.string =  diamondsNum;
        fcapp.data.setTaskNum(5,diamondsNum);
        this.node.active = true;


        var cancelImage =  this.node.getChildByName('cancelImage');
        var cancel =  this.node.getChildByName('cancel');
        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true  && window.wx)
        {
            // cancelImage.active = true;
            // cancel.active = false;
            // let temp = {};
            // tweenUtil(temp)
            //     .to(1.5, { time: temp.stopIdx }, { easing: 'Cubic-Out' }) // 转10圈*8个 = 80个
            //     .call(() => {
            //         this.banner = window.bannerMgr.showBottomBanner();
            //         this.promotion.setBanner(this.banner);
            //         this.promotion2.setBanner(this.banner);
            //         window.bannerMgr.onBannerClick(function () {
            //             fcapp.datasdk.onEvent("结算banner点击");
            //         }.bind(this));
            //     })
            //     .to(0.5, { time: temp.stopIdx }, { easing: 'Cubic-Out' }) // 转10圈*8个 = 80个
            //     .call(() => {
            //         cancelImage.active = false;
            //         cancel.active = true;
            //     })
            //     .start()
            cancelImage.active = false;
            cancel.active = true;
            this.banner = window.bannerMgr.showBottomBanner();
            this.promotion.setBanner(this.banner);
            this.promotion2.setBanner(this.banner);
        }
        else
        {
            cancelImage.active = false;
            cancel.active = true;
            if(this.promotion)
                this.promotion.node.active = false;
                
        }

        if(window.wx ){
            var score  = fcapp.gameMgr._play.getMeterOfRun()+"";
            var kvScore = {"key":"stageLv","value":score};
            wx.setUserCloudStorage({
                KVDataList: [kvScore],
                success: res => {
                    console.log("刷新排行榜信息()success",res);
                    let openDataContext = wx.getOpenDataContext();
                    openDataContext.postMessage({
                        message: 'updataInfo',
                    });
                },
                fail: res => {
                    console.log("刷新排行榜信息()fail",res);
                }
            });
        }
       
    }
   

    hide () {
        if (window.wx) 
        {
            // this.node.getChildByName('cancel').position.y = this.getBtnY;
            window.bannerMgr.rmBanner( this.banner);
        }
        this.node.active = false;
    }
}
