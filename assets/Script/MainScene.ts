import { _decorator, Component, Node, game, Color, director, Vec3, Vec4, AnimationComponent, LabelComponent, tweenUtil, Prefab, ScrollViewComponent, SpriteFrame, SpriteComponent } from "cc";
const { ccclass, property } = _decorator;

@ccclass("MainScene")
export class MainScene extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    //角色节点
    @property({ type: [Node] })
    public playerNodeList = [];

    // //角色节点
    // @property({ type: [Node] })
    // public playerNodeListModelNode = [];

    //二级界面父节点
    @property({ type: Node })
    private popRootNode = null;

    //金币数量
    @property({ type: LabelComponent })
    public coinLabel = null;

    //钻石数量
    @property({ type: LabelComponent })
    public diamondLabel = null;

    //角色名字
    @property({ type: LabelComponent })
    public nameLabel = null;
    //角色特性
    @property({ type: [Node] })
    public featuresLabelRoot: Node[] = [];

    //角色升级界面
    @property({ type: Node })
    private heroUpNode = null;

    //赛车升级界面
    @property({ type: Node })
    private carUpNode = null;

    //抽奖界面
    @property({ type: Node })
    private luckDrawNode = null;

    //添加金币界面
    @property({ type: Prefab })
    private addCoinNode = null;

    //排行榜界面
    @property({ type: Prefab })
    private RankingNode = null;

    //任务界面
    @property({ type: Prefab })
    private taskNode = null;


    //箭头界面
    @property({ type: Node })
    private arrowNode = null;

    //箭头anniu 
    @property({ type: Node })
    private arrowBtn = null;

    //更多界面
    @property({ type: Node })
    private moreGamesNode = null;
    //更多按钮
    @property({ type: Node })
    private moreGamesBtn = null;

    //任务按钮
    @property({ type: Node })
    private taskBtn = null;

    //开始游戏的各个状态
    @property({ type: [Node] })
    public startBtnList = [];

    //当前选中的角色下标
    private playerIndx = 1;

    //选择角色的动作是否完成
    private moveOver = false;//

    //左右按钮
    @property({ type: [Node] })
    public btnList = [];

    //点点点礼包预制体
    @property({ type: Prefab })
    public diandiandian = null;

    //触摸节点
    @property({ type: Node })
    public touchNode: Node = null;

    //第一次进入游戏的引导按钮
    @property({ type: Node })
    public noviceNode: Node = null;

    @property({ type: Node })
    public collectNode = null;
    private tempPost = new Vec3(0, 0, 0);//箭头起始位置
    private collectNodePos = new Vec3(0, 0, 0);//箭头起始位置
    //触摸的起始位置
    private currentPos = new Vec3(0, 0, 0);
    //触摸到抬起 玩家是否执行了动作
    private _isPlayerAction = false;

    onLoad() {
        if (!fcapp.hasInitMainScene) {
            this.initFcappMainScene();
        }

        this.heroUpNode.active = false;
        this.carUpNode.active = false;
        this.luckDrawNode.active = false;

        this.playerIndx = fcapp.data.selectHero;

        fcapp.event.on(fcapp.eevent.LocalVal, this.testEvent, this);

        var promotion2 = this.node.getChildByName('main').getChildByName('promotion2');
        var promotion = this.node.getChildByName('main').getChildByName('promotion');
        if ( window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true &&  window.wx) {
            this.moreGamesBtn.active = true;
            this.arrowBtn.active = true;

            promotion2.active = true;
            this.promotion2 = promotion2.getComponent("home-promotion2");;
            this.promotion2.init(fcapp.sidebarList_home);

            promotion.active = true;
            this.promotion = promotion.getComponent("home-promotion");;
            this.promotion.init(fcapp.sidebarList_home);
        }
        else {
            this.moreGamesBtn.active = false;
            this.arrowBtn.active = false;

            promotion2.active = false;
            promotion.active = false;
        }

        fcapp.mainScene = this;

    }
    start() {
        this.playAnim();
        this.coinLabel.string = fcapp.data.coin;
        this.diamondLabel.string = fcapp.data.diamond;
        fcapp.audio.playLoop(fcapp.audio.audio19);
        this.selectedHero();
        // this.btnState();

        this.playerNodeList.forEach(node => {
            let pos = node.position.clone();
            pos.z = 100;
            node.position = pos;
        })

        // this.playerNodeListModelNode.forEach(node => {
        //     let pos = node.position.clone();
        //     pos.z = 100;
        //     node.position = pos;
        // })


        if (window.openBanner == true && window.fcapp.hbswitch.ccclick == true && window.wx) {
            // if (!window.switchSceneFromLoading) {
            //     let node = cc.instantiate(this.diandiandian);
            //     node.parent = this.node;
            // } else {
            //     delete window.switchSceneFromLoading;
            // }
            let node = cc.instantiate(this.diandiandian);
            node.getComponent("diandiandian").init(null);
            node.parent = this.node;

        }

        this.collectNodePos = new Vec3(this.collectNode.position.x, this.collectNode.position.y, this.collectNode.position.z);
        this.tempPost = new Vec3(this.collectNode.position.x, this.collectNode.position.y, this.collectNode.position.z);

        this.dongzuo();
        this.schedule(this.collectMovePost);

        this.initTouch();

        // this.updataTaskInfo();
        this.taskTimes = 0;
        this.schedule(this.updataTaskInfo);


        if (fcapp.data.guideComplete) {
            this.noviceNode.active = false;
        }
        else {
            this.noviceNode.active = true;
            this.hard1 = this.noviceNode.getChildByName("hadn");
            this.hardNodePos = new Vec3(this.hard1.position.x, this.hard1.position.y, this.hard1.position.z);
            this.tempHard1Post = new Vec3(this.hard1.position.x, this.hard1.position.y, this.hard1.position.z);
            this.hard1Move();
        }



        this.leftBtnTween = tweenUtil({ scale: 1 })
            .to(0.3, { scale: 1.4}, {
                onUpdate: obj => {
                    this.btnList[0].scale = cc.v3(obj.scale, obj.scale, obj.scale);
                    this.btnList[1].scale = cc.v3(obj.scale, obj.scale, obj.scale);
                }
            })
            .to(0.3, { scale: 1 }, {
                onUpdate: obj => {
                    this.btnList[0].scale = cc.v3(obj.scale, obj.scale, obj.scale);
                    this.btnList[1].scale = cc.v3(obj.scale, obj.scale, obj.scale);
                }
            })
            .to(0.6, {}, {})
            .union()
            .repeat(-1)
            .start()

        // this.startGameBtnTween = tweenUtil({ scale: 1 })
        // .to(0.1, { scale: 1.15 }, { easing: 'Linear-None', onUpdate: obj => {
        //     startGameBtn.scale = cc.v3( obj.scale ,obj.scale ,obj.scale );
        // } } )
        // .to(0.1, { scale: 1 }, { easing: 'Linear-None', onUpdate: obj => {
        //     startGameBtn.scale = cc.v3( obj.scale ,obj.scale ,obj.scale );
        // } } )
        // .to(0.1, { scale: 1.15 }, { easing: 'Linear-None', onUpdate: obj => {
        //     startGameBtn.scale = cc.v3( obj.scale ,obj.scale ,obj.scale );
        // } } )
        // .to(0.1, { scale: 1 }, { easing: 'Linear-None', onUpdate: obj => {
        //     startGameBtn.scale = cc.v3( obj.scale ,obj.scale ,obj.scale );
        // } } )
        //     .to(2, {}, { easing: 'Linear-None' })
        //     .union()
        //     .repeat(100)
        //     .start()

    }
    updataTaskInfo() {
        if (this.taskTimes != 0) {
            this.taskTimes++;
            if (this.taskTimes >= 100) {
                this.taskTimes = 0;
            }
            return;
        }

        this.dian = this.taskBtn.getChildByName("dian");
        this.hard = this.taskBtn.getChildByName("hardRoot").getChildByName("hard");
        var jsonData = fcapp.json.getJson("task");
        var isHave = false;
        for (var i = 0; i < jsonData.length; i++) {
            var value = fcapp.data.taskIdNum[Number(jsonData[i].type)]
            let isOvder = fcapp.data.taskIdState[Number(jsonData[i].id)] == 1 ? true : false;
            if (value >= Number(jsonData[i].number) && isOvder == false) {

                isHave = true;
                break;
            }
        }


        if (this.hard.active == false && this.dian.active == false) {
        }
        else {
            if (isHave == this.hard.active) {
                return;
            }
        }

        if (isHave == true) {
            this.dian.active = false;
            this.hard.active = true;

        }
        else {
            this.dian.active = true;
            this.hard.active = false;
        }
        // this.dian.getComponent(SpriteComponent).color = new Color(255,255,255,180);

        if (this.hardTween) {
            this.hardTween.stop();
            this.unschedule(this.updataTaskBtn);
        }

        this.dianColor();
        this.hardNodePos = new Vec3(this.hard.position.x, this.hard.position.y, this.hard.position.z);
        this.tempHardPost = new Vec3(this.hard.position.x, this.hard.position.y, this.hard.position.z);
        this.hardMove();
    }

    initTouch() {
        this.touchNode.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
    }
    touchStart(event) {
        this.currentPos = event.getLocation();
        this._isPlayerAction = false;
        this.DirectionAngleInput(event);
        return true;
    }
    touchMove(event) {
        this.DirectionAngleInput(event);
        return true;
    }

    touchEnd(event) {
        this.DirectionAngleInput(event);
        this._isPlayerAction = false;
        return true;
    }

    touchCancel(event) {
        this.DirectionAngleInput(event);
        this._isPlayerAction = false;
        return true;
    }
    //根据位置执行相应动作
    DirectionAngleInput(event) {

        if (this._isPlayerAction == true)
            return;

        var pos = event.getLocation();

        //左
        if ((this.currentPos.x - pos.x) < -50) {

            this.callBackLeftBtn();
            this._isPlayerAction = true;
        }

        //右
        else if ((this.currentPos.x - pos.x) > 50) {


            this.callBackRightBtn();
            this._isPlayerAction = true;
        }

    }
    initFcappMainScene() {
        let persistRootNode = director.getRunningScene().getChildByName('PersistRootNode');
        game.addPersistRootNode(persistRootNode);
        fcapp.initMainScene(persistRootNode);
        fcapp.logItem.node.active = true;
    }

    testEvent(value) {
        cc.log(value);
        if (value.type == 'coin' || value.type == 'diamond') {
            this.coinLabel.string = fcapp.data.coin;
            this.diamondLabel.string = fcapp.data.diamond;
        }
        //
    }




    playAnim() {
        this.playGoScaleAnim();

        for (let i = 0; i < this.playerNodeList.length; i++) {
            this.playAnimName(this.playerNodeList[i], 'idle');
        }
    }
    playAnimName(playerNode, name) {
        playerNode.eulerAngles = new Vec3(0, 0, 0);
        playerNode.getComponent(AnimationComponent).play(name);
    }
    //选择英雄
    selectedHero() {
        this.btnState();

        for (let i = 0; i < this.playerNodeList.length; i++) {
            this.playerNodeList[i].parent.active = false;
        }
        var indx = this.playerIndx;
        this.playerNodeList[indx].parent.active = true;
        indx = (this.playerIndx - 1) < 0 ? 4 : (this.playerIndx - 1);
        this.playerNodeList[indx].parent.active = false;
        indx = (this.playerIndx + 1) >= this.playerNodeList.length ? 0 : (this.playerIndx + 1);
        this.playerNodeList[indx].parent.active = false;



        var post = new Array();
        var indx = this.playerIndx;
        for (let i = 0; i < this.playerNodeList.length; i++) {
            if (indx == i) {
                post.push(new Vec4(0, 0, 110, 400));
                this.heroEulerAngles(this.playerNodeList[i]);
            }
            else if (this.getIndxAdd(indx, 1) == i) {
                post.push(new Vec4((1) * (310), 0, 110, 250));
                this.heroStopEulerAngles(this.playerNodeList[i]);
            }
            else if (this.getIndxAdd(indx, 2) == i) {
                post.push(new Vec4((2) * (310), 0, 110, 250));
                this.heroStopEulerAngles(this.playerNodeList[i]);
            }
            else if (this.getIndxSubtract(indx, 1) == i) {
                post.push(new Vec4((1) * (-310), 0, 110, 250));
                this.heroStopEulerAngles(this.playerNodeList[i]);
            }
            else if (this.getIndxSubtract(indx, 2) == i) {
                post.push(new Vec4((2) * (-310), 0, 110, 250));
                this.heroStopEulerAngles(this.playerNodeList[i]);
            }
        }


        this.tweenHeroPost(post);

    }
    //下标添加一定的数值后应该是多少(越界后的处理)
    getIndxAdd(indx, value) {
        for (var i = 0; i < value; i++) {
            indx += 1;
            if (indx >= this.playerNodeList.length) {
                indx = 0;
            }
        }

        return indx;
    }
    //下标减去一定的数值后应该是多少(越界后的处理)
    getIndxSubtract(indx, value) {
        for (var i = 0; i < value; i++) {
            indx -= 1;
            if (indx < 0) {
                indx = 4;
            }
        }
        return indx;
    }

    //更新按钮状态
    btnState() {
        var heroData = fcapp.data.hero;
        for (var i = 0; i < this.startBtnList.length; i++) {
            this.startBtnList[i].active = false;
        }
        var tempName = "";
        var tempFeatures = "";
        // if (this.playerIndx == 0)
        //     tempName = "猪猪侠";
        // else if (this.playerIndx == 1)
        //     tempName = "菲菲";
        // else if (this.playerIndx == 2)
        //     tempName = "超人强";
        // else if (this.playerIndx == 3)
        //     tempName = "小呆呆";
        // else if (this.playerIndx == 4)
        //     tempName = "波比";


        if (heroData[this.playerIndx + 1].lock == false) {
            this.startBtnList[0].active = true;

            var jsonData = fcapp.json.getJson("role");
            var price = "";
            for (var i = 0; i < jsonData.length; i++) {
                if (jsonData[i].type == 1) {
                    //猪猪侠
                    if (this.playerIndx == 0 && jsonData[i].role_id == 1) {

                        tempName = jsonData[i].name;
                        tempFeatures = jsonData[i].features_lable
                    }
                    //菲菲
                    else if (this.playerIndx == 1 && jsonData[i].role_id == 2) {

                        tempName = jsonData[i].name;
                        tempFeatures = jsonData[i].features_lable
                    }
                    //超人强
                    else if (this.playerIndx == 2 && jsonData[i].role_id == 3) {

                        tempName = jsonData[i].name;
                        tempFeatures = jsonData[i].features_lable
                    }
                    //小呆呆
                    else if (this.playerIndx == 3 && jsonData[i].role_id == 4) {

                        tempName = jsonData[i].name;
                        tempFeatures = jsonData[i].features_lable
                    }

                    //波比
                    else if (this.playerIndx == 4 && jsonData[i].role_id == 5) {

                        tempName = jsonData[i].name;
                        tempFeatures = jsonData[i].features_lable
                    }
                }
            }
        }
        else {
            var jsonData = fcapp.json.getJson("role");
            var price = "";
            for (var i = 0; i < jsonData.length; i++) {
                if (jsonData[i].type == 1) {
                    //猪猪侠
                    if (this.playerIndx == 0 && jsonData[i].role_id == 1) {
                        price = jsonData[i].price;
                        tempName = jsonData[i].name;
                        tempFeatures = jsonData[i].features_lable
                    }
                    //菲菲
                    else if (this.playerIndx == 1 && jsonData[i].role_id == 2) {
                        price = jsonData[i].price;
                        tempName = jsonData[i].name;
                        tempFeatures = jsonData[i].features_lable
                    }
                    //超人强
                    else if (this.playerIndx == 2 && jsonData[i].role_id == 3) {
                        price = jsonData[i].price;
                        tempName = jsonData[i].name;
                        tempFeatures = jsonData[i].features_lable
                    }
                    //小呆呆
                    else if (this.playerIndx == 3 && jsonData[i].role_id == 4) {
                        price = jsonData[i].price;
                        tempName = jsonData[i].name;
                        tempFeatures = jsonData[i].features_lable
                    }

                    //波比
                    else if (this.playerIndx == 4 && jsonData[i].role_id == 5) {
                        price = jsonData[i].price;
                        tempName = jsonData[i].name;
                        tempFeatures = jsonData[i].features_lable
                    }
                }
            }

            var priceList = JSON.parse(price);
            this.buyType = Number(priceList[0]);//类型
            this.buyNum = Number(priceList[1]);//数量
            if (this.buyType == 1) {
                if (fcapp.data.coin >= this.buyNum) {
                    this.startBtnList[1].active = true;
                    this.startBtnList[1].getChildByName("icon1").active = true;
                    this.startBtnList[1].getChildByName("icon2").active = false;
                    this.startBtnList[1].getChildByName("num").getComponent(LabelComponent).string = this.buyNum;
                }
                else {
                    this.startBtnList[2].active = true;
                    this.startBtnList[2].getChildByName("icon1").active = true;
                    this.startBtnList[2].getChildByName("icon2").active = false;
                    this.startBtnList[2].getChildByName("num").getComponent(LabelComponent).string = this.buyNum;
                    this.startBtnList[2].getChildByName("num").getComponent(LabelComponent).color = new Color(255, 0, 0, 255);
                }
            }
            else if (this.buyType == 2) {
                if (fcapp.data.diamond >= this.buyNum) {
                    this.startBtnList[1].active = true;
                    this.startBtnList[1].getChildByName("icon1").active = false;
                    this.startBtnList[1].getChildByName("icon2").active = true;
                    this.startBtnList[1].getChildByName("num").getComponent(LabelComponent).string = this.buyNum;
                }
                else {
                    this.startBtnList[2].active = true;
                    this.startBtnList[2].getChildByName("icon1").active = false;
                    this.startBtnList[2].getChildByName("icon2").active = true;
                    this.startBtnList[2].getChildByName("num").getComponent(LabelComponent).string = this.buyNum;
                    this.startBtnList[2].getChildByName("num").getComponent(LabelComponent).color = new Color(255, 0, 0, 255);
                }
            }
        }

        this.nameLabel.string = tempName;
        this.featuresLabelRoot[0].active = false;
        this.featuresLabelRoot[1].active = false;
        if (this.playerIndx == 0) {
            this.featuresLabelRoot[0].getChildByName("FeaturesLabel").getComponent(LabelComponent).string = "" + tempFeatures;
            this.featuresLabelRoot[0].active = true;
        }
        else {
            this.featuresLabelRoot[1].getChildByName("FeaturesLabel").getComponent(LabelComponent).string = "" + tempFeatures;
            this.featuresLabelRoot[1].active = true;
            for (var i = 1; i < 5; i++) {
                if (i == this.playerIndx) {
                    this.featuresLabelRoot[1].getChildByName("" + (i + 1)).active = true;
                }
                else {
                    this.featuresLabelRoot[1].getChildByName("" + (i + 1)).active = false;
                }

            }

        }
        // this.featuresLabel.string = tempFeatures;
    }
    /*************************************** */

    //无限循环的回调
    dongzuo() {
        this.collectNodePos = new Vec3(this.tempPost.x, this.tempPost.y, this.tempPost.z);
        //箭头目标位置
        var jianNodeMubiaoPos = new Vec3(this.collectNodePos.x - 100, this.collectNodePos.y, this.collectNodePos.z);
        var jianNodeMubiaoPos1 = new Vec3(this.collectNodePos.x, this.collectNodePos.y, this.collectNodePos.z);
        this.collecTween = tweenUtil(this.collectNodePos)
            .to(1, jianNodeMubiaoPos)
            .to(1, jianNodeMubiaoPos1)
            .call(() => {
                this.dongzuo();
            })
            .start()
    }
    //实时更新箭头位置
    collectMovePost() {
        // console.log('***************',this.collectNodePos);
        this.collectNode.position = new Vec3(this.collectNodePos.x, this.collectNodePos.y, this.collectNodePos.z);
    }

    playGoScaleAnim() {
        let startGameBtn = cc.find('main/Btn/startBtn', this.node);
        //         this.startBtnGameScale = {scale:1};

        //         this.startGameBtnTween = tweenUtil(this.startBtnGameScale)
        //         .to( 0.2, {scale: 1.3}, {easing: 'Cubic-Out'} )
        //         .to( 0.2, {scale: 1}, {easing: 'Cubic-Out'} )
        //         .union()
        //         .repeat(2)
        //         .union()
        //         .delay( 2 )
        //         .union()
        //         .repeat(100)
        //         .start();


        //         this.startGameBtnSchedule = () => {
        //             startGameBtn.scale = cc.v3( this.startBtnGameScale.scale,this.startBtnGameScale.scale,this.startBtnGameScale.scale);
        //         }
        //         this.schedule( this.startGameBtnSchedule );

        this.startGameBtnTween = tweenUtil({ scale: 1 })
            .to(0.1, { scale: 1.15 }, {
                easing: 'Linear-None', onUpdate: obj => {
                    startGameBtn.scale = cc.v3(obj.scale, obj.scale, obj.scale);
                }
            })
            .to(0.1, { scale: 1 }, {
                easing: 'Linear-None', onUpdate: obj => {
                    startGameBtn.scale = cc.v3(obj.scale, obj.scale, obj.scale);
                }
            })
            .to(0.1, { scale: 1.15 }, {
                easing: 'Linear-None', onUpdate: obj => {
                    startGameBtn.scale = cc.v3(obj.scale, obj.scale, obj.scale);
                }
            })
            .to(0.1, { scale: 1 }, {
                easing: 'Linear-None', onUpdate: obj => {
                    startGameBtn.scale = cc.v3(obj.scale, obj.scale, obj.scale);
                }
            })
            .to(2, {}, { easing: 'Linear-None' })
            .union()
            .repeat(100)
            .start()
    }

    private anyValue: any = {};
    dianColor() {
        this.dian.getComponent(SpriteComponent).color = new Color(255, 255, 255, 255);
        this.anyValue.r = 240;
        this.anyValue.value = -10;
        this.schedule(this.updataTaskBtn);
    }
    //无限循环的回调
    hardMove() {
        this.hardNodePos = new Vec3(this.tempHardPost.x, this.tempHardPost.y, this.tempHardPost.z);
        //箭头目标位置
        var jianNodeMubiaoPos = new Vec3(this.hardNodePos.x - 20, this.hardNodePos.y, this.hardNodePos.z);
        var jianNodeMubiaoPos1 = new Vec3(this.hardNodePos.x, this.hardNodePos.y, this.hardNodePos.z);
        this.hardTween = tweenUtil(this.hardNodePos)
            .to(0.5, jianNodeMubiaoPos)
            .to(0.5, jianNodeMubiaoPos1)
            .call(() => {
                this.hardMove();
            })
            .start()
    }
    updataTaskBtn() {
        if (this.anyValue.r < 20 || this.anyValue.r > 240) {
            this.anyValue.value = -(this.anyValue.value);
        }
        this.anyValue.r += this.anyValue.value;
        this.dian.getComponent(SpriteComponent).color = new Color(255, 255, 255, this.anyValue.r);


        this.hard.position = new Vec3(this.hardNodePos.x, this.hardNodePos.y, this.hardNodePos.z);
        if (this.hard1NodePos) {
            this.hard1.position = new Vec3(this.hard1NodePos.x, this.hard1NodePos.y, this.hard1NodePos.z);
        }

    }

    //无限循环的回调
    hard1Move() {
        this.hard1NodePos = new Vec3(this.tempHard1Post.x, this.tempHard1Post.y, this.tempHard1Post.z);
        //箭头目标位置
        var jianNodeMubiaoPos = new Vec3(this.hard1NodePos.x, this.hard1NodePos.y - 40, this.hard1NodePos.z);
        var jianNodeMubiaoPos1 = new Vec3(this.hard1NodePos.x, this.hard1NodePos.y, this.hard1NodePos.z);
        this.hard1Tween = tweenUtil(this.hard1NodePos)
            .to(0.5, jianNodeMubiaoPos)
            .to(0.5, jianNodeMubiaoPos1)
            .call(() => {
                this.hard1Move();
            })
            .start()
    }
    private any: any = {};
    //旋转展示角色
    heroEulerAngles(carNode) {

        let whiteSprite = carNode.getComponent(AnimationComponent);
        let curScheduleCall = (<any>carNode)._scheduleCall;

        carNode.eulerAngles = new Vec3(0, (-180), 0);
        carNode.parent.eulerAngles = new Vec3(0, (0), 0);
        this.any.eulerAngles_y = (0);
        (<any>carNode)._scheduleCall = curScheduleCall = () => {
            this.any.eulerAngles_y += 1.0;
            if (this.any.eulerAngles_y > 360) {
                this.any.eulerAngles_y = 0;
            }
            carNode.parent.eulerAngles = new Vec3(0, this.any.eulerAngles_y, 0);
        }
        whiteSprite.schedule(curScheduleCall);
    }
    heroStopEulerAngles(carNode) {

        let whiteSprite = carNode.getComponent(AnimationComponent);
        let curScheduleCall = (<any>carNode)._scheduleCall;
        if (curScheduleCall) {
            whiteSprite.unschedule(curScheduleCall);
        }
        carNode.eulerAngles = new Vec3(0, (-180), 0);
        carNode.parent.eulerAngles = new Vec3(0, 0, 0);

    }
    public obj = {
        1: cc.v4(0, 0, 0, 0),
        2: cc.v4(0, 0, 0, 0),
        3: cc.v4(0, 0, 0, 0),
        4: cc.v4(0, 0, 0, 0),
        5: cc.v4(0, 0, 0, 0)
    };
    //根据选择的下标 角色移动到指定位置 
    tweenHeroPost(post) {
        //停止未完成的动作
        if (this.tween) {
            this.tween.stop();
            this.unschedule(this.movePost);
        }

        var param = {
            1: post[0],
            2: post[1],
            3: post[2],
            4: post[3],
            5: post[4]
        };

        console.log(param);
        this.moveOver = false;
        this.tween = tweenUtil(this.obj)
            .to(0.5, param, { easing: 'Cubic-Out' })
            .call(() => {
                this.moveOver = true;
                this.unschedule(this.movePost);
            })
            .start()
        this.schedule(this.movePost);
    }
    //更新角色位置 
    movePost() {
        for (let i = 0; i < this.playerNodeList.length; i++) {

            var pos = new Vec3(this.obj[i + 1].x, this.obj[i + 1].y, this.obj[i + 1].z);
            // this.playerNodeList[i].setPosition(pos);
            // this.playerNodeList[i].scale = new Vec3(this.obj[i+1].w,this.obj[i+1].w,this.obj[i+1].w);
            this.playerNodeList[i].parent.setPosition(pos);
            // this.playerNodeList[i].scale = new Vec3(this.obj[i + 1].w, this.obj[i + 1].w, this.obj[i + 1].w);
        }
    }
    /*************************************** */
    //开始游戏
    callBackStartBtn() {

        if (this.hardTween) {
            this.hardTween.stop();

            this.unschedule(this.updataTaskBtn);
            this.unschedule(this.updataTaskInfo);
        }
        if (this.hard1Tween) {
            this.hard1Tween.stop();
        }
        if (this.leftBtnTween) {
            this.leftBtnTween.stop();
        }

        console.log('***************unschedule-》updataTaskInfo()');
        if (this.collecTween) {
            this.collecTween.stop();
            this.unschedule(this.collectMovePost);
        }

        if (this.startGameBtnTween) {
            this.startGameBtnTween.stop();
        }

        fcapp.data.selectHero = this.playerIndx;
        fcapp.event.off(fcapp.eevent.LocalVal, this.testEvent, this);
        fcapp.lockView.loadSceneName('GameScene', (hideLoadingCall) => {
            fcapp.gameMgr.loadRoleRes(() => {
                fcapp.gameMgr.init();
                hideLoadingCall();
            });
        });
    }
    //购买角色
    callBackBuyHeroBtn() {
        var heroData = fcapp.data.hero;
        heroData[this.playerIndx + 1].lock = false;
        fcapp.data.hero = heroData;
        this.selectedHero();
        fcapp.logItem.log('购买成功');
        fcapp.datasdk.onEvent("购买角色_" + this.playerIndx + "_成功");
        if (this.buyType == 1) {
            fcapp.data.coin = Number(fcapp.data.coin) - Number(this.buyNum);
        }
        else if (this.buyType == 2) {
            fcapp.data.diamond = Number(fcapp.data.diamond) - Number(this.buyNum);

        }
    }
    //角色试用
    callBackTryBtn() {
        var next = function (ret) {
            if (ret) {
                fcapp.data.setTaskNum(6, 1);

                if (this.hardTween) {
                    this.hardTween.stop();
                    this.unschedule(this.updataTaskBtn);
                    this.unschedule(this.updataTaskInfo);
                }

                if (this.hard1Tween) {
                    this.hard1Tween.stop();
                }

                if (this.startGameBtnTween) {
                    this.startGameBtnTween.stop();
                }


                if (this.leftBtnTween) {
                    this.leftBtnTween.stop();
                }

                if (this.collecTween) {
                    this.collecTween.stop();
                    this.unschedule(this.collectMovePost);
                }
                fcapp.setAny('tryRoleId', this.playerIndx);
                fcapp.event.off(fcapp.eevent.LocalVal, this.testEvent, this);
                fcapp.lockView.loadSceneName('GameScene', (hideLoadingCall) => {
                    fcapp.gameMgr.loadRoleRes(() => {
                        fcapp.gameMgr.init();
                        hideLoadingCall();
                    });
                });

                fcapp.datasdk.onEvent("角色_" + this.playerIndx + "_试用成功");
                fcapp.logItem.log('领取成功');
            }
            else {
                fcapp.logItem.log('领取失败');
            }
        }.bind(this);
        fcapp.datasdk.onEvent("点击角色_" + this.playerIndx + "_试用按钮");
        fcapp.chsdk.callAdVideo(next);

    }
    //角色升级
    callBackHeroUpBtn() {
        fcapp.data.selectHero = this.playerIndx;//(this.playerIndx);
        this.heroUpNode.active = true;
    }
    //车辆升级
    callBackCarUpBtn() {
        fcapp.data.selectHero = this.playerIndx;//(this.playerIndx);
        this.carUpNode.active = true;
    }
    //左按钮
    callBackLeftBtn() {
        if (this.moveOver == false)
            return;
        this.playerProIndx = this.playerIndx;
        this.playerIndx -= 1;
        if (this.playerIndx < 0) {
            this.playerIndx = (this.playerNodeList.length - 1);
        }

        this.selectedHero();

        if (this.playerIndx == 0)
            fcapp.audio.playShort(fcapp.audio.audio15);
        else if (this.playerIndx == 1)
            fcapp.audio.playShort(fcapp.audio.audio16);
        else if (this.playerIndx == 2)
            fcapp.audio.playShort(fcapp.audio.audio17);
        else if (this.playerIndx == 3)
            fcapp.audio.playShort(fcapp.audio.audio13);
        else if (this.playerIndx == 4)
            fcapp.audio.playShort(fcapp.audio.audio14);

    }
    //右按钮
    callBackRightBtn() {
        if (this.moveOver == false)
            return;
        this.playerProIndx = this.playerIndx;
        this.playerIndx += 1
        if (this.playerIndx >= (this.playerNodeList.length)) {
            this.playerIndx = 0;
        }


        this.selectedHero();

        if (this.playerIndx == 0)
            fcapp.audio.playShort(fcapp.audio.audio15);
        else if (this.playerIndx == 1)
            fcapp.audio.playShort(fcapp.audio.audio16);
        else if (this.playerIndx == 2)
            fcapp.audio.playShort(fcapp.audio.audio17);
        else if (this.playerIndx == 3)
            fcapp.audio.playShort(fcapp.audio.audio13);
        else if (this.playerIndx == 4)
            fcapp.audio.playShort(fcapp.audio.audio14);
    }

    //抽奖
    callBackLuckDrawBtn() {
        this.luckDrawNode.active = true;
    }
    //签到
    callBackSignInBtn() {

    }
    //排行榜
    callBackRankingBtn() {
        let node = cc.instantiate(this.RankingNode);
        node.parent = this.popRootNode;
    }
    //添加金币
    callBackAddGoldBtn() {
        let node = cc.instantiate(this.addCoinNode);
        node.parent = this.popRootNode;
        node.getComponent("addCoinLayer").init(1, 1000);
    }
    //添加钻石
    callBackAddDiamondsBtn() {
        let node = cc.instantiate(this.addCoinNode);
        node.parent = this.popRootNode;
        node.getComponent("addCoinLayer").init(2, 100);
    }
    //声音
    callBackAddSoundBtn() {

    }
    //箭头按钮的回调
    callBackArrowBtn() {
        this.arrowNode.active = true;
    }
    //跳转时 调用更多游戏
    clickGengduo(_callback) {
        this.callBackMoreGamesBtn();
        this.moreGamesNode.getComponent("moreGamesLayer").callBack = _callback;
    }
    //更多游戏按钮的回调
    callBackMoreGamesBtn() {
        this.moreGamesNode.active = true;
    }
    //任务按钮的回调
    callBackTaskBtn() {
        let node = cc.instantiate(this.taskNode);
        node.parent = this.popRootNode;
    }



}
