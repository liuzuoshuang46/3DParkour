import { _decorator, Component, Node, game, director, Vec3, AnimationComponent, ButtonComponent, LabelComponent } from "cc";
const { ccclass, property } = _decorator;
import { MainScene } from "./MainScene"

@ccclass("heroUpLayer")
export class heroUpLayer extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    //角色节点
    @property({ type: [Node] })
    public playerNodeList = [];
    //属性信息
    @property({ type: [Node] })
    public attributeList = [];
    //升级按钮
    @property({ type: [ButtonComponent] })
    public attributeUpList = [];
    //未解锁
    @property({ type: Node })
    public lockNode = null;

     //角色名字
     @property({ type: LabelComponent })
     public nameLabel = null;

     @property({ type: MainScene })
     public mainScene = null;
    private playerIndx = 1;
    private goldAttribute = null
    private flightAttribute = null;
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    start() {
       
    }
    onEnable() {
        this.playerIndx = fcapp.data.selectHero;
        this.playAnim();


        

       var promotion = this.node.getChildByName('promotion');
        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true &&  window.wx)
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

        // promotion.active = true;
        // this.promotion = promotion.getComponent( "home-promotion2" );;
        // this.promotion.init(fcapp.sidebarList_home);
        
    }
    playAnim() {
        for (let i = 0; i < this.playerNodeList.length; i++) {
            if ((this.playerIndx) == i) {
                this.playerNodeList[i].active = true;
                this.playAnimName(this.playerNodeList[i]);
            }
            else {
                this.playerNodeList[i].active = false;
            }
        }
    }

    private any:any = {};
    private _curAnimName: string = null;
    playAnimName(playerNode) {
        playerNode.getComponent(AnimationComponent).play("idle");


        let whiteSprite = playerNode.getComponent( AnimationComponent );
        let curScheduleCall = (<any>playerNode)._scheduleCall;
        if(curScheduleCall ){
            whiteSprite.unschedule( curScheduleCall );
        }

        playerNode.eulerAngles = new Vec3(0, 90, 0);
        this.any.eulerAngles_y = 90;
        (<any>playerNode)._scheduleCall = curScheduleCall = () => { 
            this.any.eulerAngles_y += 0.5;
            if(this.any.eulerAngles_y > 360)
            {
                this.any.eulerAngles_y = 0;
            }
            playerNode.eulerAngles = new Vec3(0,  this.any.eulerAngles_y, 0);
        }
        whiteSprite.schedule( curScheduleCall );


        this.updataAttribute();
    }
    updataAttribute() {
        //角色信息
        var heroData = fcapp.data.hero;
        var lock = heroData[this.playerIndx + 1].lock;
        var goldlevel = heroData[this.playerIndx + 1].goldlevel;
        var flightlevel = heroData[this.playerIndx + 1].flightlevel;

        this.lockNode.active = lock;

        //升级信息
        var tempName = "";
        var jsonData = fcapp.json.getJson("role_shuxing");
        this.goldAttribute = null;
        this.flightAttribute = null;
        for (var i = 0; i < jsonData.length; i++) {
            let isData = false;
            //猪猪侠
            if (this.playerIndx == 0 && jsonData[i].type == 1) {
                isData = true;
                tempName = jsonData[i].name;
            }
            //菲菲
            else if (this.playerIndx == 1 && jsonData[i].type == 2) {
                isData = true;
                tempName = jsonData[i].name;
            }
            //超人强
            else if (this.playerIndx == 2 && jsonData[i].type == 3) {
                isData = true;
                tempName = jsonData[i].name;
            }
             //小呆呆
             else if (this.playerIndx == 3 && jsonData[i].type == 4) {
                isData = true;
                tempName = jsonData[i].name;
            }
            //波比
            else if (this.playerIndx == 4 && jsonData[i].type == 5) {
                isData = true;
                tempName = jsonData[i].name;
            }

            if (isData == true) {
                if (jsonData[i].level == goldlevel) {
                    this.goldAttribute = jsonData[i];
                }
                if (jsonData[i].level == flightlevel) {
                    this.flightAttribute = jsonData[i];
                }
            }
        }

        this.nameLabel.string = tempName;
        //金币加成
        this.attributeList[0].getChildByName("describe").getComponent(LabelComponent).string = "金币加成lv" + goldlevel + ":";
        this.attributeList[0].getChildByName("value").getComponent(LabelComponent).string = this.goldAttribute.gold_bonus + "%";
        this.attributeUpList[0].node.getChildByName("num").getComponent(LabelComponent).string = this.goldAttribute.gold_upgrade;
        //飞行时长
        this.attributeList[1].getChildByName("describe").getComponent(LabelComponent).string = "飞行时长lv" + flightlevel + ":";
        this.attributeList[1].getChildByName("value").getComponent(LabelComponent).string = this.flightAttribute.flight_bonus + "%";
        this.attributeUpList[1].node.getChildByName("num").getComponent(LabelComponent).string = this.flightAttribute.flight_upgrade;

    }
    //升级属性1
    callBackUpAttribute1() {

        fcapp.audio.play(fcapp.audio.audio18);
        //角色信息
        var heroData = fcapp.data.hero;
        var lock = heroData[this.playerIndx + 1].lock;
        var goldlevel = heroData[this.playerIndx + 1].goldlevel;
        if (lock == true) {
            return;
        }


        var type = Number(1);//类型
        var num = Number(this.goldAttribute.gold_upgrade);//数量
        if (fcapp.data.coin >= num) {
            fcapp.data.coin = fcapp.data.coin - num;
            heroData[this.playerIndx + 1].goldlevel = goldlevel + 1;
            fcapp.data.hero = heroData;

            this.updataAttribute();
            fcapp.datasdk.onEvent("角色属性1升级成功");
            fcapp.logItem.log('升级成功');
        }
        else
        {
            this.mainScene.callBackAddGoldBtn();
            fcapp.logItem.log('金币不足');
        }


    }
    //升级属性2
    callBackUpAttribute2() {

        fcapp.audio.play(fcapp.audio.audio18);
        //角色信息
        var heroData = fcapp.data.hero;
        var lock = heroData[this.playerIndx + 1].lock;
        var flightlevel = heroData[this.playerIndx + 1].flightlevel;
        if (lock == true) {
            return;
        }

        var type = Number(1);//类型
        var num = Number(this.flightAttribute.gold_upgrade);//数量
        if (fcapp.data.coin >= num) {
            fcapp.data.coin = fcapp.data.coin - num;
            heroData[this.playerIndx + 1].flightlevel = flightlevel + 1;
            fcapp.data.hero = heroData;
            this.updataAttribute();
            fcapp.datasdk.onEvent("角色属性2升级成功");
            fcapp.logItem.log('升级成功');
        }
        else
        {
            this.mainScene.callBackAddGoldBtn();
            fcapp.logItem.log('金币不足');
        }
    }
    //左按钮
    callBackLeftBtn() {
        fcapp.audio.play(fcapp.audio.audio18);
        this.playerIndx -= 1;
        if (this.playerIndx < 0) {
            this.playerIndx = (this.playerNodeList.length - 1);
        }
        this.playAnim();
        if(this.playerIndx == 0)
        fcapp.audio.playShort(fcapp.audio.audio15);
        else if(this.playerIndx == 1)
        fcapp.audio.playShort(fcapp.audio.audio16);
        else if(this.playerIndx == 2)
        fcapp.audio.playShort(fcapp.audio.audio17);
        else if(this.playerIndx == 3)
        fcapp.audio.playShort(fcapp.audio.audio13);
        else if(this.playerIndx == 4)
        fcapp.audio.playShort(fcapp.audio.audio14);
    }
    //右按钮
    callBackRightBtn() {
        fcapp.audio.play(fcapp.audio.audio18);
        this.playerIndx += 1;
        if (this.playerIndx >= (this.playerNodeList.length)) {
            this.playerIndx = 0;
        }
        
        this.playAnim();
        if(this.playerIndx == 0)
        fcapp.audio.playShort(fcapp.audio.audio15);
        else if(this.playerIndx == 1)
        fcapp.audio.playShort(fcapp.audio.audio16);
        else if(this.playerIndx == 2)
        fcapp.audio.playShort(fcapp.audio.audio17);
        else if(this.playerIndx == 3)
        fcapp.audio.playShort(fcapp.audio.audio13);
        else if(this.playerIndx == 4)
        fcapp.audio.playShort(fcapp.audio.audio14);
    }

    //关闭按钮
    closeBackCall() {
        fcapp.audio.play(fcapp.audio.audio18);
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }
        this.node.active = false;
    }
}
