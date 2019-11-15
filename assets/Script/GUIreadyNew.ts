import { _decorator, Component, Node, Prefab, LabelComponent ,Vec3,tweenUtil} from "cc";
const { ccclass, property } = _decorator;

@ccclass("GUIreadyNew")
export class GUIreadyNew extends Component {
    /* class member could be defined like this */
    // dummy = '';

    @property({ type: [Node] } )
    public itemList = [];

    private any:any = {};
    onLoad() {
        fcapp.ready = this;
        

        //  //角色特性
        //  if (this._play.roleId == 1) {
        //     this._play.doFly();
        // }
        // else if (this._play.roleId == 2) {
        //     this._play.onEatProp_hudun();
        // }
        // else if (this._play.roleId == 3) {
        //     this._play.addHp(1);
        //     fcapp.gameUI.eftAddHp();
        // }
        // else if (this._play.roleId == 4) {
        //     fcapp.gameUI.eftCoinDouble();
        // }

        for(var i=0;i<this.itemList.length;i++)
        {
            this.itemList[i].active = false;
        }

       
        
        
    }
    start() {
        // Your initialization goes here.
         //取有效的
         var randList = new Array();
         for(var i=0;i<this.itemList.length;i++)
         {
             if(fcapp.gameMgr._play.roleId == 1 && i == 1)
             {
                 continue;
             }
             else if(fcapp.gameMgr._play.roleId == 2 && i == 3)
             {
                 continue;
             }
             else if(fcapp.gameMgr._play.roleId == 3 && i == 0)
             {
                 continue;
             }
             else if(fcapp.gameMgr._play.roleId == 4 && i == 2)
             {
                 continue;
             }
 
             randList.push(this.itemList[i]);
         }
         
         //随机一个
         var indx = fcapp.util.random(0,randList.length - 1);
         indx = (indx >= randList.length ? (randList.length - 1) : indx)
         randList[indx].active = true;

         var promotion2 = this.node.getChildByName('promotion');
        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true &&  window.wx )
        {
            promotion2.active = true;
            this.promotion2 = promotion2.getComponent( "home-promotion" );;
            this.promotion2.init(fcapp.sidebarList_home);
        }
        else
        {
            promotion2.active = false;
        }

         if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true  && window.wx)
         {
             this.banner = window.bannerMgr.showBottomBanner();
             this.promotion2.setBanner(this.banner);
         }

    }
    callBackStartGame() {
        
        fcapp.audio.play(fcapp.audio.audio18);
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }

      
        fcapp.gameMgr.readyPropId = -1;
        this.node.active = false;
        fcapp.gameMgr._loadOver = true;
        fcapp.gameUI.startCountDown();
    }
    callBacktryOutBtn(event) {
        var indx = Number(event.target.name)

        var next = function( ret ){
            if( ret ){
               
                fcapp.logItem.log('领取成功');
                this.userPro(indx);
            }
            else
            {
                fcapp.logItem.log('领取失败');
            }
        }.bind( this );
        fcapp.chsdk.callAdVideo( next );
    }
    userPro(proId)
    {
        fcapp.audio.play(fcapp.audio.audio18);
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }

       
        fcapp.data.setTaskNum(2,1);
        if(proId == 1)
        {
            fcapp.data.setTaskNum(3,1);
        }
        
        // 0 飞行道具
        // 1 金币双倍
        // 2 加血
        // 3 开局加速
        // 4 无敌护盾
        if(proId == 0)
        {
            fcapp.datasdk.onEvent("开局道具","飞行道具");
        }
        else if(proId == 1)
        {
            fcapp.datasdk.onEvent("开局道具","金币双倍");
        }
        else if(proId == 2)
        {
            fcapp.datasdk.onEvent("开局道具","加血");
        }
        else if(proId == 3)
        {
            fcapp.datasdk.onEvent("开局道具","开局加速");
        }
        else if(proId == 4)
        {
            fcapp.datasdk.onEvent("开局道具","无敌护盾");
        }
        
        fcapp.gameMgr.readyPropId = proId;
        this.node.active = false;
        fcapp.gameMgr._loadOver = true;
        fcapp.gameUI.startCountDown();
    }

}
