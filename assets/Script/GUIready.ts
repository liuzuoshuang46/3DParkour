import { _decorator, Component, Node, Prefab, LabelComponent ,Vec3,tweenUtil} from "cc";
const { ccclass, property } = _decorator;

@ccclass("GUIready")
export class GUIready extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    //添加金币界面
    @property({ type: Prefab })
    private addCoinNode = null;
    //金币数量
    @property({ type: LabelComponent })
    public coinLabel = null;
    //钻石数量
    @property({ type: LabelComponent })
    public diamondLabel = null;
    
    @property({ type: [Node] } )
    public itemList = [];

    // @property({ type: Node } )
    // public contentNode = null;

    private goldBuyBtnList = new Array();
    private diamondsBuyBtnList = new Array();
    private videoBtnList = new Array();
    private priceList = new Array();
    private nameList = new Array();
    private describeList = new Array();
    private IconBgList = new Array();
    private IconList = new Array();

    private any:any = {};
    onLoad() {
        fcapp.ready = this;
        fcapp.event.on(fcapp.eevent.LocalVal, this.testEvent, this);

        this.coinLabel.string = fcapp.data.coin;
        this.diamondLabel.string = fcapp.data.diamond;

        var jsonData = fcapp.json.getJson("buff");
        // var itemList = this.contentNode.getchildren();
        
        for(var i=0;i< this.itemList.length;i++)
        {
            this.priceList.push("");

            var data = this.itemList[i].getChildByName("goldBuyBtn");
            data.name = (""+i);
            this.goldBuyBtnList.push(data);
            data = this.itemList[i].getChildByName("diamondsBuyBtn");
            data.name =(""+i);
            this.diamondsBuyBtnList.push(data);
            data = this.itemList[i].getChildByName("videoBtn");
            data.name =(""+i);
            this.videoBtnList.push(data);

            data = this.itemList[i].getChildByName("Bg").getChildByName("name");
            this.nameList.push(data);
            data = this.itemList[i].getChildByName("Bg").getChildByName("describe");
            this.describeList.push(data);
            data = this.itemList[i].getChildByName("Bg").getChildByName("IconBg");
            this.IconBgList.push(data);
            data = this.itemList[i].getChildByName("Bg").getChildByName("Icon");
            this.IconList.push(data);
        }

        
    }
    start() {
        // Your initialization goes here.

        var itemArr = fcapp.json.getJson("buff");

        for(var i=0;i<itemArr.length;i++)
        {
            var indx = -1;
            if(itemArr[i].id == 1)
            {
                indx = 3;
            }
            else if(itemArr[i].id == 2)
            {
                indx = 4;
            }
            else if(itemArr[i].id == 3)
            {
                indx = 0;
            }
            else if(itemArr[i].id == 4)
            {
                indx = 2;
            }
            else if(itemArr[i].id ==6)
            {
                indx = 1;
            }

            if(indx >= 0)
            {
                this.goldBuyBtnList[indx].active = false;
                this.diamondsBuyBtnList[indx].active = false;
                this.videoBtnList[indx].active = false;
    
                var gold = Number(itemArr[i].price_gold);
                var rmb = Number(itemArr[i].price_rmb);
                this.nameList[indx].getComponent(LabelComponent).string = itemArr[i].item_name;
                this.describeList[indx].getComponent(LabelComponent).string = itemArr[i].describe;
                
                if(fcapp.data.diamond >= rmb)
                {
                    this.priceList[indx] = [2,rmb];
                    this.diamondsBuyBtnList[indx].active = true;
                    this.diamondsBuyBtnList[indx].getChildByName("Label").getComponent(LabelComponent).string = ""+rmb;
                }
                else if(fcapp.data.coin >= gold)
                {
                    this.priceList[indx] = [1,gold];
                    this.goldBuyBtnList[indx].active = true;
                    this.goldBuyBtnList[indx].getChildByName("Label").getComponent(LabelComponent).string = ""+gold;
                }
                else{
                    this.videoBtnList[indx].active = true;
                    this.priceList[indx] = [0,1];
                }
            }
            
        }


        var promotion = this.node.getChildByName('promotion');
        if( window.fcapp.hbswitch.bannerDelay == true && window.wx)
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





        this.any.eulerAngles_z = 0;
       
        this.collectNodePos = new Vec3(this.IconList[0].position.x,this.IconList[0].position.y,this.IconList[0].position.z);
        this.tempPost = new Vec3(this.IconList[0].position.x,this.IconList[0].position.y,this.IconList[0].position.z);
     
        this.dongzuo();
        this.schedule( this.collectMovePost );

    }
    private tempPost = new Vec3(0,0,0);//箭头起始位置
    private collectNodePos = new Vec3(0,0,0);//箭头起始位置
    //无限循环的回调
    dongzuo()
    {
        this.collectNodePos = new Vec3(this.tempPost.x,this.tempPost.y,this.tempPost.z);
        //箭头目标位置
        var jianNodeMubiaoPos = new Vec3(this.collectNodePos.x ,this.collectNodePos.y + 10,this.collectNodePos.z);
        var jianNodeMubiaoPos1 = new Vec3(this.collectNodePos.x,this.collectNodePos.y  ,this.collectNodePos.z);
        this.collecTween = tweenUtil(this.collectNodePos)
        .to(0.5, jianNodeMubiaoPos)
        .to(0.5, jianNodeMubiaoPos1)
        .call(() => {
                this.dongzuo();
        })
        .start()
    }
    //实时更新箭头位置
    collectMovePost()
    {
        // console.log('***************',this.collectNodePos);
        for(var i=0;i<this.IconList.length;i++)
        {
            this.IconList[i].position =new Vec3(this.collectNodePos.x,this.collectNodePos.y,this.collectNodePos.z) ;
        }

        this.any.eulerAngles_z += 0.5;
        if(this.any.eulerAngles_z > 360)
        {
            this.any.eulerAngles_z = 0;
        }
        for(var i=0;i<this.IconBgList.length;i++)
        {
            this.IconBgList[i].eulerAngles = new Vec3(0, 0,this.any.eulerAngles_z);
        }
        
    }


    testEvent(value) {
        cc.log(value);
        if (value.type == 'coin' || value.type == 'diamond') {
            this.coinLabel.string = fcapp.data.coin;
            this.diamondLabel.string = fcapp.data.diamond;
        }
        //
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    callBackStartGame() {
        
        fcapp.audio.play(fcapp.audio.audio18);
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }

        this.collecTween.stop();
        this.unschedule(this.collectMovePost);

        this.node.active = false;
        fcapp.event.off(fcapp.eevent.LocalVal, this.testEvent, this);
        fcapp.gameMgr._loadOver = true;
        fcapp.gameUI.startCountDown();
    }
    //添加金币
    callBackAddGoldBtn() {
        let node = cc.instantiate(this.addCoinNode);
        node.parent = this.node;
        node.getComponent("addCoinLayer").init(1, 1000);
    }
    //添加钻石
    callBackAddDiamondsBtn() {
        let node = cc.instantiate(this.addCoinNode);
        node.parent = this.node;
        node.getComponent("addCoinLayer").init(2, 100);
    }
    callBackGoldBuyBtn(event) {
        var indx = Number(event.target.name)
        var obj = this.priceList[indx];
        if(fcapp.data.coin >= obj[1])
        {
            this.userPro(indx);
            fcapp.data.coin = Number(fcapp.data.coin) - Number(obj[1]);
            fcapp.logItem.log('购买成功');
        }
        else
        {
            fcapp.logItem.log('金币不足');
        }
    }
    callBackDiamondsBuyBtn(event) {
        var indx = Number(event.target.name)
        var obj = this.priceList[indx];
        if(fcapp.data.diamond >= obj[1])
        {
            this.userPro(indx);
            fcapp.data.diamond = Number(fcapp.data.diamond) - Number(obj[1]);
            fcapp.logItem.log('购买成功');
        }
        else
        {
            fcapp.logItem.log('钻石不足');
        }
    }
    callBacktryOutBtn(event) {
        var indx = Number(event.target.name)
        var obj = this.priceList[indx];

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

        this.collecTween.stop();
        this.unschedule(this.collectMovePost);

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
        fcapp.gameMgr.readyPropId = proId;
        this.node.active = false;
        fcapp.event.off(fcapp.eevent.LocalVal, this.testEvent, this);
        fcapp.gameMgr._loadOver = true;
        fcapp.gameUI.startCountDown();
    }

}
