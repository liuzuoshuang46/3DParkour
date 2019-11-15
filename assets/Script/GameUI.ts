import { _decorator, Component, Node, LabelComponent,AnimationComponent, SpriteComponent, tweenUtil,Prefab,Vec3 } from "cc";
import { GUIRevive } from "./GUIRevive"
import { GUIGameOver } from "./GUIGameOver"
import { GUISuspend } from "./GUISuspend"
import { GUIreadyNew } from "./GUIreadyNew"
import { PopVideoMoto } from "../pop_video_moto/PopVideoMoto"
const { ccclass, property } = _decorator;

@ccclass("GameUI")
export class GameUI extends Component {

    @property(LabelComponent)
    lblCountDown: LabelComponent = null;

    revive: GUIRevive = null;
    ready: GUIreadyNew = null;
    suspend: GUISuspend = null;
    gameover = null;
    popVideoMoto: PopVideoMoto = null;
    moreGamesNode = null;

    @property(Node)
    private popUIParent = null;

    @property(Node)
    whiteNode: Node = null;
    @property({ type: [Node] })
    public hpList = [];
    @property({ type: LabelComponent })
    public metreLabel = null;
    @property({ type: LabelComponent })
    public coinLabel = null;
    @property({ type: LabelComponent })
    public diamondsLabel = null;
     @property({ type: [Node] })
     public propIconList = [];
     @property({ type: Node })
     public promotionNode = null;
     public propIconTimes = new Array();
     public propIconPost = new Array();

    @property( AnimationComponent )
    public animCoinDouble: AnimationComponent = null;
    @property( AnimationComponent )
    public animAddDiamond: AnimationComponent = null;
    @property( AnimationComponent )
    public animAddHp: AnimationComponent = null;


    showPopVideoMoto( callf: Function ) {
        this.createPopByName( 'popVideoMoto' );
        this.popVideoMoto.show( callf );
    }

    hidePopVideoMoto () {
        this.popVideoMoto && this.popVideoMoto.hide(  );
    }

    createPopByName ( name ) {
        // revive: GUIRevive = null;
        // ready: GUIreadyNew = null;
        // suspend: GUISuspend = null;
        // gameover = null;
        // popVideoMoto: PopVideoMoto = null;
        // moreGamesNode = null;
        if( this[ name ] ){
            return;
        }

        let name2prefabName = {
            revive: 'revive1',
            ready: 'ready',
            suspend: 'suspend',
            gameover: 'GameOver',
            popVideoMoto: 'pop_video_moto',
            moreGamesNode: 'moreGamesLayer',
        };
        let node = fcapp.gameMgr.resList.newPrefabByName( name2prefabName[ name ] );
        node.parent = this.popUIParent;

        let name2CmtName = {
            revive: 'GUIRevive',
            ready: 'GUIreadyNew',
            suspend: 'GUISuspend',
            gameover: 'GUIGameOver',
            popVideoMoto: 'PopVideoMoto',
            moreGamesNode: 'moreGamesLayer',
        };
        this[ name ] = node.getComponent( name2CmtName[ name ] );
    }

    private any: any = {};
    playWhite( next?: any ) {
        this.whiteNode.active = true;
        let whiteSprite = this.whiteNode.getComponent(SpriteComponent);
        let curScheduleCall = (<any>whiteSprite)._scheduleCall;
        if (curScheduleCall) {
            whiteSprite.unschedule(curScheduleCall);
        }

        this.any.white_color_a = 255; // 白色图的 alpha 值透明度
        (<any>whiteSprite)._scheduleCall = curScheduleCall = () => {
            whiteSprite.color = cc.color(255, 255, 255, this.any.white_color_a);
        }
        whiteSprite.schedule(curScheduleCall);

        tweenUtil(this.any)
            .to(1, { white_color_a: 50 }, { easing: 'Cubic-Out' })
            .call( () => {
                next && next();
            })
            .to(1, { white_color_a: 0 }, { easing: 'Cubic-Out' })
            .start()
    }

    onLoad () {
        this.node.active = false;
        for(var i=0;i<this.propIconList.length;i++) 
        {
            this.propIconList[i].active = false;
            this.propIconPost.push(cc.v3(this.propIconList[i].position.x,this.propIconList[i].position.y,this.propIconList[i].position.z))
            this.propIconTimes.push(0);
        }
        
    }

    init() {
        this.node.active = true;
        cc.log("GameMageController->GameUI");
        fcapp.gameUI = this;
        this.initData();
        this.initUI();
        cc.log("GameMageController->GameUI.over");


       
       
    }
    set meterNum(val: number) {
        this.metreLabel.string = val;
    }

    set coinNum(val: number) {
        this.coinLabel.string = val;
    }

    set diamondNum(val: number) {
        this.diamondsLabel.string = val;
    }

    set hpNum(val: number) {
        for (var i = 0; i < this.hpList.length; i++) {
            if (i < val) {
                this.hpList[i].active = true;
            }
            else {
                this.hpList[i].active = false;
            }
        }
    }

    initData() {

    }

    initUI() {
        this.initPlayerAttr();
        // this.hideGameOver();
        // this.hideSettlement();
        this.hideEffectScreenLight();
        this.whiteNode.active = false;
        this.animAddHp.node.active = 
        this.animCoinDouble.node.active = 
        this.animAddDiamond.node.active = false;

        this.hidePopVideoMoto();

        var promotion = this.node.getChildByName('Ui').getChildByName('promotion');
        if( window.openBanner == true &&  window.fcapp.hbswitch.bannerDelay == true  && window.wx)
        // if(true)
        {
            promotion.active = true;
            this.promotion = promotion.getComponent( "home-promotion" );;
            this.promotion.init(fcapp.sidebarList_home);

            // this.promotionTween = tweenUtil({ rotate: 0 })
            // .to(0.15, { rotate: -30 }, {
            //     easing: 'Linear-None', onUpdate: obj => {
            //         this.promotionNode.eulerAngles = cc.v3(0, 0, obj.rotate);
            //     }
            // })
            // .to(0.15, { rotate: 30 }, {
            //     easing: 'Linear-None', onUpdate: obj => {
            //         this.promotionNode.eulerAngles =  cc.v3(0, 0, obj.rotate);
            //     }
            // })
            // .to(0.15, { rotate: -30 }, {
            //     easing: 'Linear-None', onUpdate: obj => {
            //         this.promotionNode.eulerAngles =  cc.v3(0, 0, obj.rotate);
            //     }
            // })
            // .to(0.15, {rotate: 30 }, {
            //     easing: 'Linear-None', onUpdate: obj => {
            //         this.promotionNode.eulerAngles = cc.v3(0, 0, obj.rotate);
            //     }
            // })
            // .to(0.075, {rotate: 0 }, {
            //     easing: 'Linear-None', onUpdate: obj => {
            //         this.promotionNode.eulerAngles =  cc.v3(0, 0, obj.rotate);
            //     }
            // })
            // .to(2, {}, { easing: 'Linear-None' })
            // .union()
            // .repeat(-1)
            // .start()
        }
        else
        {
            promotion.active = false;
        }

        // fcapp.gameUI.promotion.exit();
    }

    onGameMgrStart(){
        if(fcapp.data.guideComplete)
        {
            this.showReadyLayer();
        }
        else
        {
            fcapp.gameMgr._loadOver = true;
            fcapp.gameUI.startCountDown();
        }
    }

    showReadyLayer() {
        this.createPopByName( 'ready' );
        this.ready.node.active = true;
    }

    eftAddHp(  ){
        this.animAddHp.node.active = true;
        this.animAddHp.play();
    }

    eftAddDiamond( num ){
        this.animAddDiamond.node.active = true;
        this.animAddDiamond.play();
        this.animAddDiamond.node.getChildByName('lbl').getComponent( LabelComponent ).string = '+' + num;
    }

    eftCoinDouble () {
        this.animCoinDouble.node.active = true;
        this.animCoinDouble.play();
    }

    initPlayerAttr() {
        this.meterNum = 0;
        this.coinNum = 0;
        this.diamondNum = 0;
        this.hpNum = 0;
    }

    showSettlement() {
        this.createPopByName( 'gameover' );
        //this.gameover.show();
    }

    hideSettlement() {
    }

    showSuspend(callbackContinue) {
        this.createPopByName( 'suspend' );
        this.suspend.show(callbackContinue);
    }
    hideSuspend() {
        this.suspend.hide();
    }
    showGameOver() {
        this.createPopByName( 'revive' );
        this.revive.hide();
        this.scheduleOnce( () => {
            this.revive.show();
        },3.5);
    }

    showVideoGetMotuoBtn( show ){
        cc.find('Ui/motuoBtn', this.node).active = show;
    }

    clickVideoGetMotuo() {
        fcapp.gameMgr.pauseAndCallVideoMoto();
    }

    hideGameOver() {
        this.revive.hide();
    }

    startCountDown() {
        fcapp.gameMgr.startCountDown();
        this.lblCountDown.node.active = false;
        let obj = { leftTime: 3 };
        this.lblCountDown.string = String(obj.leftTime);
        tweenUtil(obj)
            .to( 1.5, {} ) // 延时1.5s
            .call( () => {
                this.lblCountDown.node.active = true;
                this.lblCountDown.string = String(obj.leftTime);
                fcapp.audio.play(fcapp.audio.audio44);
            })
            .to(1, { leftTime: 2 })
            .call(() => {
                this.lblCountDown.string = String(obj.leftTime);
            })
            .to(1, { leftTime: 1 })
            .call(() => {
                this.lblCountDown.string = String(obj.leftTime);
            })
            .to(1, { leftTime: 0 })
            .call(() => {
                this.lblCountDown.string = String(obj.leftTime);
                this.lblCountDown.node.active = false;
                fcapp.audio.playLoop(fcapp.audio.audio21);
                fcapp.gameMgr.startGame();
            })
            .start();
    }
    startCountDown1() {
        // fcapp.gameMgr.startCountDown();
        this.lblCountDown.node.active = false;
        let obj = { leftTime: 3 };
        this.lblCountDown.string = String(obj.leftTime);
        tweenUtil(obj)
            .to( 0.1, {} ) // 延时1.5s
            .call( () => {
                this.lblCountDown.node.active = true;
                this.lblCountDown.string = String(obj.leftTime);
            })
            .to(1, { leftTime: 2 })
            .call(() => {
                this.lblCountDown.string = String(obj.leftTime);
            })
            .to(1, { leftTime: 1 })
            .call(() => {
                this.lblCountDown.string = String(obj.leftTime);
            })
            .to(1, { leftTime: 0 })
            .call(() => {
                this.lblCountDown.string = String(obj.leftTime);
                this.lblCountDown.node.active = false;
                // fcapp.audio.playLoop(fcapp.audio.audio21);
                fcapp.gameMgr.isGameStarted = true;
            })
            .start();
    }

    @property( Node )
    screenLightNode:Node = null;
    showEffectScreenLight(  ) {
        this.screenLightNode.active = true;
    }

    hideEffectScreenLight() {
        this.screenLightNode.active = false;
    }
    clickGengduo(_callback)
    {
        this.callBackMoreGamesBtn();
        this.moreGamesNode.callBack = _callback;
    }
    callBackMoreGamesBtn() {
        this.createPopByName( 'moreGamesNode' );
        this.moreGamesNode.node.active = true;
    }

    onDestroy() {
        if(this.promotionTween)
            this.promotionTween.stop();
    }
    //id  0金币双倍 1加速 2护盾 3飞行
    //fillRange cd的进度 0-10
    //剩余时间
    setPropIcon(id,fillRange,times)
    {
        this.propIconTimes[id] = fillRange;

        let indx = 0;
        for(var i=0;i<this.propIconTimes.length;i++)
        {
            if(id == i)
            {
                if(this.propIconTimes[i] > 0)
                {
                    this.propIconList[i].active =  true;
                    this.propIconList[i].getChildByName("CD").getComponent(SpriteComponent).fillRange = fillRange;
                    this.propIconList[i].getChildByName("Time").getComponent(LabelComponent).string = parseInt(times);
                    var post = new Vec3(this.propIconPost[indx].x,this.propIconPost[indx].y,this.propIconPost[indx].z);
                    this.propIconList[i].position = post;
                }
                else
                {
                    this.propIconList[i].active =  false;
                }
            }

            if(this.propIconTimes[i] > 0)
            {
                indx ++;
            }
            
        }
        
        this.propIconList[0].getChildByName("CD").getComponent(SpriteComponent).fillRange = 0;
    }
}
