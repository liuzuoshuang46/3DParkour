import { _decorator, Component, Node, ButtonComponent, SpriteFrame, SpriteComponent, LabelComponent, tweenUtil } from "cc";
const { ccclass, property } = _decorator;

@ccclass("luckDrawLayer")
export class luckDrawLayer extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property({ type: [Node] })
    public itemList = [];
    @property({ type: [SpriteFrame] })
    public itemTypeSpriteFrame = [];

    @property({ type: ButtonComponent })
    public closeBtn = null;
    @property({ type: ButtonComponent })
    public startBtn = null;
    @property({ type: ButtonComponent })
    public getBtn = null;
    @property({ type: ButtonComponent })
    public cancelBtn = null;
    @property({ type: ButtonComponent })
    public addBtn = null;

    private LuckDrawNum = 0;//使用次数
    private LuckDrawTime = "";//上次的时间rendMaxValeu
    private rendMaxValeu = 0;//概率的最大数
    private itemAllArr = new Array();//当前从表里取出的8个物品
    private tempItemArr = new Array();//临时的8个对象
    private itemIndx = 0;//奖品的数组下标
    private selectedIndx = 0;//当前轮训到的下标
    start() {
        // Your initialization goes here.

        

        // promotion.active = true;
        // this.promotion = promotion.getComponent( "home-promotion2" );;
        // this.promotion.init(fcapp.sidebarList_home);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    onEnable() {

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

        this.getBtn.node.active = false;
        this.initData();
        this.initUi();
    }
    init() {
       
    }
    initData() {
        // this.itemAllArr = new Array();
        var itemArr = fcapp.json.getJson("lucky_draw");

        if(this.itemAllArr.length <= 0)
        {
            for (var i = 0; i < itemArr.length; i++) {
                this.itemAllArr.push(itemArr[i]);
            }
        }
       
    }
    initUi() {

        this.LuckDrawNum = fcapp.data.LuckDrawNum;
        this.LuckDrawTime = fcapp.data.LuckDrawTime;

        var checkInTime = JSON.stringify(new Date()).substring(0, 11);
        if (this.LuckDrawTime != checkInTime) {
            this.LuckDrawNum = 3;
        }

        this.node.getChildByName("Bg").getChildByName("NumLabel").getComponent(LabelComponent).string = "今日次数" + this.LuckDrawNum + "/3";


        this.btnState(1);
        this.tempItemArr = new Array();
        this.rendMaxValeu = 0;

        this.itemList = this.itemList[0].parent.children; // children是转圈动画中的顺序 面板拖拽的itemList不对
        for (var i = 0; i < this.itemAllArr.length; i++) {
            var node = this.itemList[i];

            var stt = "";
            var type = this.itemAllArr[i].type;
            var value = this.itemAllArr[i].number;
            var item_id = this.itemAllArr[i].item_id;

            var SpriteFrameIndx = 0;

            if (type == 1) {
                stt = "金币";
                if (value < 300) {
                    SpriteFrameIndx = 0;
                }
                else if (value < 400) {
                    SpriteFrameIndx = 1;
                }
                else {
                    SpriteFrameIndx = 2;
                }
            } else if (type == 2) {
                stt = "钻石";
                if (value < 300) {
                    SpriteFrameIndx = 3;
                }
                else if (value < 400) {
                    SpriteFrameIndx = 4;
                }
                else {
                    SpriteFrameIndx = 5;
                }
            } else if (type == 3) {
                if (item_id == 1) {
                    stt = "超级加速";
                    SpriteFrameIndx = 6;
                }
                else if (item_id == 2) {
                    stt = "能量防御";
                    SpriteFrameIndx = 6;
                }
                else if (item_id == 3) {
                    stt = "飞行冲刺";
                    SpriteFrameIndx = 6;
                }
                else if (item_id == 4) {
                    stt = "生命+1";
                    SpriteFrameIndx = 6;
                }
                else if (item_id == 5) {
                    stt = "万能磁铁";
                    SpriteFrameIndx = 7;
                }
                else if (item_id == 6) {
                    stt = "金币双倍";
                    SpriteFrameIndx = 7;
                }
            }
            node.getChildByName("ItemIcon").getComponent(SpriteComponent).spriteFrame = this.itemTypeSpriteFrame[SpriteFrameIndx];
            node.getChildByName("num").getComponent(LabelComponent).string = stt + "x" + value;
            this.showSelectedIdx( -1 );
            this.rendMaxValeu += Number(this.itemAllArr[i].probability);
            this.tempItemArr.push(this.itemAllArr[i]);
        }
    }
    //看视频送次数
    addNum() {

        fcapp.audio.play(fcapp.audio.audio18);
        
        fcapp.datasdk.onEvent("抽奖看视频送次数点击");
        var next = function( ret ){
            if( ret ){
                fcapp.data.LuckDrawNum = this.LuckDrawNum + 5;
                this.initUi();
                fcapp.logItem.log('奖励领取成功');
                fcapp.datasdk.onEvent("抽奖看视频送次数成功");
            }
            else
            {
                fcapp.logItem.log('领取失败');
            }
        }.bind( this );
        fcapp.chsdk.callAdVideo( next );
    }
    //下次再说
    clickCancel() {
        fcapp.audio.play(fcapp.audio.audio18);
        this.btnState(4);
        // G_Common.getAudioManager().playSound( G_Common.getAudioManager().mSoundBtnclick)
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

    //1抽奖前  2.抽奖中  3.显示下次再说 4.领奖
    btnState(state) {
        if (state == 1) {
            //关闭按钮
            this.closeBtn.node.active = true;
            this.closeBtn.interactable = true;
            //领取按钮
            this.getBtn.node.active = false;
            this.getBtn.interactable = false;
            //下次再说按钮
            this.cancelBtn.node.active = false;
            this.cancelBtn.interactable = false;
            //看视频
            this.addBtn.node.active = true;
            this.addBtn.interactable = true;
            if (this.LuckDrawNum > 0) {
                //抽奖按钮
                this.startBtn.node.active = true;
                this.startBtn.interactable = true;
            }
            else {
                //抽奖按钮
                this.startBtn.node.active = true;
                this.startBtn.interactable = false;
            }

        }
        else if (state == 2) {
            //关闭按钮
            this.closeBtn.node.active = true;
            this.closeBtn.interactable = false;
            //领取按钮
            this.getBtn.node.active = false;
            this.getBtn.interactable = false;
            //下次再说按钮
            this.cancelBtn.node.active = false;
            this.cancelBtn.interactable = false;
            //看视频
            this.addBtn.node.active = true;
            this.addBtn.interactable = false;
            if (this.LuckDrawNum > 0) {
                //抽奖按钮
                this.startBtn.node.active = true;
                this.startBtn.interactable = false;
            }

        }
        // else  if(state == 3)
        // {
        //     //关闭按钮
        //     this.closeBtn.node.active = true;
        //     this.closeBtn.interactable = false;
        //     if(this.LuckDrawNum > 0)
        //     {
        //         //抽奖按钮
        //         this.startBtn.node.active = false;
        //         this.startBtn.interactable = false;
        //     }
        //     //领取按钮
        //     this.getBtn.node.active = false;
        //     this.getBtn.interactable = false;
        //     //下次再说按钮
        //     this.cancelBtn.node.active = true;
        //     this.cancelBtn.interactable = true;
        // }
        else if (state == 4) {
            //关闭按钮
            this.closeBtn.node.active = true;
            this.closeBtn.interactable = false;
            //抽奖按钮
            this.startBtn.node.active = false;
            this.startBtn.interactable = false;
            //领取按钮
            this.getBtn.node.active = true;
            this.getBtn.interactable = true;
            //下次再说按钮
            this.cancelBtn.node.active = false;
            this.cancelBtn.interactable = false;
            //看视频
            this.addBtn.node.active = true;
            this.addBtn.interactable = false;
        }
    }

    //开始抽奖
    clickShare() {
        fcapp.audio.play(fcapp.audio.audio18);
        this.startLuckDraw();
    }
    //开始抽奖
    clickStart() {
        fcapp.audio.play(fcapp.audio.audio18);
        if (this.LuckDrawNum == 0) {

            fcapp.logItem.log('抽奖次数不足');
            return;
        }
        //  window.gameScene.datasdk.onEvent("开始抽奖");

        fcapp.datasdk.onEvent("开始抽奖");
        this.startLuckDraw();
    }
    //开始抽奖
    startLuckDraw() {
        var js = 0;
        for (var i = 0; i < this.itemAllArr.length; i++) {
            var temp = this.getRandValue(0, this.rendMaxValeu);
            if (temp <= this.tempItemArr[js].probability) {
                this.itemIndx = i;
                break;
            }
            else {
                this.rendMaxValeu -= this.tempItemArr[js].probability;
                cc.js.array.remove(this.tempItemArr, this.tempItemArr[js]);
            }
        }
        if (this.itemIndx >= 8)
            this.itemIndx = 7;

        // this.btnState(2);
        // this.selectedIndx = 0;

        
        this.btnState(2);
        this.highRotateByNew();
        //  G_Common.getAudioManager().playSound( G_Common.getAudioManager().mSoundBtnclick)
    }


    //点击领取
    clickGet() {
        fcapp.audio.play(fcapp.audio.audio18);
        //  G_Common.getAudioManager().playSound( G_Common.getAudioManager().mSoundBtnclick)
        this.getItem();
    }
    //点击领取
    getItem() {
        this.closeBtn.interactable = true;
        this.startBtn.interactable = true;
        this.getBtn.node.active = false;
        this.startBtn.node.active = true;

        var id = Number(this.itemAllArr[this.itemIndx].type);
        var value = Number(this.itemAllArr[this.itemIndx].number);
        
        var stt = "";
        if (this.itemAllArr[this.itemIndx].type == 1) {
            stt = "金币";
            fcapp.data.coin = fcapp.data.coin + value;
        } else if (this.itemAllArr[this.itemIndx].type == 2) {
            stt = "钻石";
            fcapp.data.diamond = fcapp.data.diamond + value;
        } else if (this.itemAllArr[this.itemIndx].type == 3) {
            if (this.itemAllArr[this.itemIndx].item_id == 1) {
                stt = "超级加速";
            }
            else if (this.itemAllArr[this.itemIndx].item_id == 2) {
                stt = "能量防御";
            }
            else if (this.itemAllArr[this.itemIndx].item_id == 3) {
                stt = "飞行冲刺";
            }
            else if (this.itemAllArr[this.itemIndx].item_id == 4) {
                stt = "生命+1";
            }
            else if (this.itemAllArr[this.itemIndx].item_id == 5) {
                stt = "万能磁铁";
            }
            else if (this.itemAllArr[this.itemIndx].item_id == 6) {
                stt = "金币双倍";
            }
        }
        fcapp.logItem.log(stt+'x'+value);


        if (this.LuckDrawNum <= 0) {
            this.LuckDrawNum = 0;
        }
        else {
            this.LuckDrawNum--;
        }
        this.LuckDrawTime = JSON.stringify(new Date()).substring(0, 11);

        fcapp.data.LuckDrawTime = this.LuckDrawTime;
        fcapp.data.LuckDrawNum = this.LuckDrawNum;

        this.node.getChildByName("Bg").getChildByName("NumLabel").getComponent(LabelComponent).string = "今日次数" + this.LuckDrawNum + "/3";

        this.btnState(1);

        this.showSelectedIdx( -1 );
    }

    // wk
    highRotateByNew() {
        let circleNum = 10; //转几圈
        let sumNum = 8 * circleNum; // 几圈 * 每圈8个 总个数
        let stopIdx =  this.itemIndx;//fcapp.util.random( 7 );// 随机停在最后一圈第几个
        let sumTime = 0.8 * circleNum; // 历时

        this.rotateObject = {
            current: 0,
            time: sumNum,
            stopIdx: stopIdx
        }

        tweenUtil(this.rotateObject)
            .to(sumTime, { time: stopIdx }, { easing: 'Cubic-Out' }) // 转10圈*8个 = 80个
            .call(() => {
                this.unschedule(this.rotateSchedule);
                this.overRotateBy();
            })
            .start()
        this.schedule(this.rotateSchedule);
    }

    showSelectedIdx(idx) {
        for (var i = 0; i < this.itemAllArr.length; i++) {
            this.itemList[i].getChildByName("selectedItem").active = (i == idx);
        }
    }

    private rotateObject = null;
    rotateSchedule(dt) {
        let curIdx = -1;
        if( this.rotateObject.time - this.rotateObject.stopIdx <= 0.001 ){
            curIdx = this.rotateObject.stopIdx;
        }else{
            curIdx = Math.floor( this.rotateObject.time % 8 ) ;
        }
        
        if( this.rotateObject.time )
        if (curIdx != this.rotateObject.current) {
            this.rotateObject.current = curIdx;
            this.showSelectedIdx(7 - curIdx);
        }
    }
    //高速运转
    highRotateBy() {
        //  //当前位置
        //  var num =  G_Common.getRandValue(3,6);
        //  var draw = this.node.getChildByName("Turntable");

        //  var times = 0;
        //  var rotate = 0;

        //  //放置角度过大出问题
        //  if(draw.rotation > 1) {
        //      draw.rotation = draw.rotation % 360
        //      //计算上次位置到归零的位置的差距
        //      var a = draw.rotation/ 60;
        //      times = (6 - a) * 0.6;
        //      rotate = 360 / 6 * (6 - a);
        //  }

        //  draw.runAction(
        //      cc.sequence(
        //          cc.rotateBy(0.6*num + times,360*num +  rotate).easing(cc.easeIn(3)),
        //          cc.callFunc( function(){
        //              this.lowRotateBy();
        //          }.bind( this ) )
        //      )
        //  );

        // this.whiteNode.active = true;
        // let whiteSprite = this.whiteNode.getComponent( SpriteComponent );
        // let curScheduleCall = (<any>whiteSprite)._scheduleCall;
        // if( curScheduleCall ){
        //     whiteSprite.unschedule( curScheduleCall );
        // }

        // this.any.white_color_a = 255; // 白色图的 alpha 值透明度
        // (<any>whiteSprite)._scheduleCall = curScheduleCall = () => { 
        //     whiteSprite.color = cc.color( 255, 255, 255, this.any.white_color_a );
        // }
        // whiteSprite.schedule( curScheduleCall );

        // tweenUtil( this.any )
        // .to( 2, { white_color_a: 0 },{ easing: 'Cubic-Out' } )
        // .start()
    }
    //低速运转
    lowRotateBy() {
        //  var num =  G_Common.getRandValue(2,3);
        //  var draw = this.node.getChildByName("Turntable");
        //  draw.runAction(
        //      cc.sequence(
        //          cc.rotateBy(1.2*num + (1.2/6)*this.itemIndx,360*num + (360/6)*this.itemIndx ).easing(cc.easeOut(3)),
        //          cc.callFunc( function(){
        //              this.overRotateBy();
        //          }.bind( this ) )
        //      )
        //  );
    }
    overRotateBy() {
        this.btnState(4);
    }
    
    getRandValue(min, max) {
        let range = max - min;
        let ranValue = min + Math.round(Math.random() * range);
        return ranValue;
    }

}
