import { _decorator, Component, Node,game,director ,Vec3,AnimationComponent,ButtonComponent,LabelComponent,tweenUtil,} from "cc";
const { ccclass, property } = _decorator;
import { MainScene } from "./MainScene"
@ccclass("carUpLayer")
export class carUpLayer extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    //角色节点
    @property({ type: [Node] })
    public carNodeList = [];
     //属性信息
     @property({ type: [Node] })
     public attributeList = [];
     //升级按钮
     @property({ type: [ButtonComponent] })
     public attributeUpList = [];
    //未解锁
    @property({ type: Node })
    public lockNode = null;
    //赛车名字
    @property({ type: LabelComponent })
    public nameLabel = null;
    @property({ type: MainScene })
    public mainScene = null;
    private carIndx = 1;
    private speedAttribute = null
    private outbreakAttribute = null;
    private _curAnimName: String = null;
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    start () {
        // this.carIndx = fcapp.data.selectHero;
        // this.playAnim();
    }
    onEnable() {
        this.carIndx = fcapp.data.selectHero;
        this.playAnim();
        

        var promotion = this.node.getChildByName('promotion');
        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true && window.wx)
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
    playAnim()
    {
        for(let i=0;i<this.carNodeList.length;i++){
            if((this.carIndx) == i)
            {
               this.carNodeList[i].active = true;
               this.playAnimName(this.carNodeList[i],'idle');
            }
            else
            {
               this.carNodeList[i].active = false;
            }
        }
       
    }

    private any:any = {};
    playAnimName(carNode,name) {

        let whiteSprite = carNode.getComponent( AnimationComponent );
        let curScheduleCall = (<any>carNode)._scheduleCall;
        if(curScheduleCall ){
            whiteSprite.unschedule( curScheduleCall );
        }

        carNode.eulerAngles = new Vec3(0, 0, 0);
        this.any.eulerAngles_y = 0;
        (<any>carNode)._scheduleCall = curScheduleCall = () => { 
            this.any.eulerAngles_y += 0.5;
            if(this.any.eulerAngles_y > 360)
            {
                this.any.eulerAngles_y = 0;
            }
            carNode.eulerAngles = new Vec3(0,  this.any.eulerAngles_y, 0);
        }
        whiteSprite.schedule( curScheduleCall );


        
        this.updataAttribute();
    }
    updataAttribute() {
        //角色信息
        var carData = fcapp.data.car;
        var lock = carData[this.carIndx + 1].lock;
        var speedlevel = carData[this.carIndx + 1].speedlevel;
        var outbreaklevel = carData[this.carIndx + 1].outbreaklevel;

        this.lockNode.active = lock;

        //升级信息
        var jsonData = fcapp.json.getJson("pet_shuxing");
        this.speedAttribute = null;
        this.outbreakAttribute = null;
        var tempName = "";
        for (var i = 0; i < jsonData.length; i++) {
            let isData = false;
            //猪猪侠
            if (this.carIndx == 0 && jsonData[i].type == 1) {
                isData = true;
                tempName = jsonData[i].name;
            }
             //菲菲
             else if (this.carIndx == 1&& jsonData[i].type == 2) {
                isData = true;
                tempName = jsonData[i].name;
            }
             //超人强
             else if (this.carIndx == 2 && jsonData[i].type == 3) {
                isData = true;
                tempName = jsonData[i].name;
            }
            //小呆呆
            else if (this.carIndx == 3 && jsonData[i].type == 4) {
                isData = true;
                tempName = jsonData[i].name;
            }
           
            //波比
            else if (this.carIndx == 4 && jsonData[i].type == 5) {
                isData = true;
                tempName = jsonData[i].name;
            }

            if (isData == true) {
                if (jsonData[i].level == speedlevel) {
                    this.speedAttribute = jsonData[i];
                }
                if (jsonData[i].level == outbreaklevel) {
                    this.outbreakAttribute = jsonData[i];
                }
            }
        }
        this.nameLabel.string = tempName;
        //金币加成
        this.attributeList[0].getChildByName("describe").getComponent(LabelComponent).string = "速度加成lv" + speedlevel + ":";
        this.attributeList[0].getChildByName("value").getComponent(LabelComponent).string = this.speedAttribute.speed_bonus + "%";
        this.attributeUpList[0].node.getChildByName("num").getComponent(LabelComponent).string = this.speedAttribute.speed_upgrade;
        //飞行时长
        this.attributeList[1].getChildByName("describe").getComponent(LabelComponent).string = "合体时长lv" + outbreaklevel + ":";
        this.attributeList[1].getChildByName("value").getComponent(LabelComponent).string = this.outbreakAttribute.outbreak_bonus + "%";
        this.attributeUpList[1].node.getChildByName("num").getComponent(LabelComponent).string = this.outbreakAttribute.outbreak_upgrade;

    }
    //升级属性1
    callBackUpAttribute1() {
        fcapp.audio.play(fcapp.audio.audio18);
        //角色信息
        var carData = fcapp.data.car;
        var lock = carData[this.carIndx + 1].lock;
        var speedlevel = carData[this.carIndx + 1].speedlevel;
        if (lock == true) {
            return;
        }
       

        var type = Number(1);//类型
        var num = Number(this.speedAttribute.speed_upgrade);//数量
        if (fcapp.data.coin >= num) {
            fcapp.data.coin = fcapp.data.coin - num;
            carData[this.carIndx + 1].speedlevel = speedlevel + 1;
            fcapp.data.car = carData;

            this.updataAttribute();
            fcapp.datasdk.onEvent("赛车属性1升级成功");
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
        var carData = fcapp.data.car;
        var lock = carData[this.carIndx + 1].lock;
        var outbreaklevel = carData[this.carIndx + 1].outbreaklevel;
        if (lock == true) {
            return;
        }

        var type = Number(1);//类型
        var num = Number(this.outbreakAttribute.outbreak_upgrade);//数量
        if (fcapp.data.coin >= num) {
            fcapp.data.coin = fcapp.data.coin - num;
            carData[this.carIndx + 1].outbreaklevel = outbreaklevel + 1;
            fcapp.data.car = carData;
            this.updataAttribute();
            fcapp.datasdk.onEvent("赛车属性2升级成功");
            fcapp.logItem.log('升级成功');
        }
        else
        {
            this.mainScene.callBackAddGoldBtn();
            fcapp.logItem.log('金币不足');
        }
    }
     //左按钮
     callBackLeftBtn()
     {
        fcapp.audio.play(fcapp.audio.audio18);
       
        this.carIndx -= 1;
         if(this.carIndx < 0 )
         {
            this.carIndx = (this.carNodeList.length-1);
         }
         this.playAnim();
     }
     //右按钮
     callBackRightBtn()
     {
        fcapp.audio.play(fcapp.audio.audio18);
        this.carIndx += 1;
        if(this.carIndx >=  (this.carNodeList.length))
        {
           this.carIndx = 0;
        }
         this.playAnim();
     }

     //关闭按钮
     closeBackCall(){
        fcapp.audio.play(fcapp.audio.audio18);
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }
        this.node.active = false;
     }
}
