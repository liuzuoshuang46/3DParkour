// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        itemsParent: cc.Node,
        showType:'',
        isShakeAction: 0,//0为不晃动  1为晃动

        viewRoot: cc.ScrollViewComponent,
        viewContent: cc.Node,
        isAudioMove:true,
    },

    close () {
        // app.homeWgt.hidePromotion();
    },


    // 使用二级页面的逻辑初始化
    init (sidebarList) {



        let childs = this.itemsParent.children;
        this.items = [];
       
        this.viewRoot.node.on("scroll-began", this.viewTouchBegan, this);
        this.viewRoot.node.on("scrolling", this.viewTouchling, this);
        this.viewRoot.node.on("scroll-ended", this.viewTouchEnded, this);

        this.initPost = cc.v3(0,0,0);
        //定时自动移动
        var timeCallback = function (dt) {
            if(this.isAudioMove == true)
            {
                this.viewRoot.scrollToOffset(cc.v3(this.initPost.x + 0.6,this.initPost.y,this.initPost.z));
                this.initPost  = this.viewRoot.getScrollOffset();
                this.initPost.x = Math.abs(this.initPost.x);
            }
            this.viewTouchling();
          }.bind(this);
          this.schedule(timeCallback, 0.02);
        
        for( var i in childs ){
            this.items.push(childs[i].getComponent('promotionitem'));
        }
        
         if (this.isShakeAction == 1) {
            this.startShakeIcon();
            // this.startFadeToIcon();
        }
        
        console.log("****************",sidebarList);
        this.sidebarList = sidebarList || [];
        if( !this.sidebarList.length ){
            return;
        }
        this.startRandShow();
        // this.randShowCfg();
  
    },
    //触摸按下
    viewTouchBegan()
    {
        this.isAudioMove = false;
    },
    //移动中
    viewTouchling()
    {
        var value  = this.viewRoot.getScrollOffset();
        var maxValue  = this.viewRoot.getMaxScrollOffset();
        // console.log("偏移~~~~~~~~~~~~~~~",value,maxValue);
        if(value.x < -(maxValue.x - 10))
        {
            this.initPost = cc.v3(0,0,0);
            this.viewRoot.scrollToLeft(0.01);
        }
        else
        {
            this.initPost  = this.viewRoot.getScrollOffset();
            this.initPost.x = Math.abs(this.initPost.x);
        }
    },
    //触摸抬起
    viewTouchEnded()
    {
        this.isAudioMove = true;
        
    },

    startRandShow() {
        for (var i = 0; i < this.sidebarList.length; i++) {
            var name = this.sidebarList[i].GameName;
            fcapp.datasdk.onEvent("互推游戏曝光",name);
        }
        this.randShowCfg();
        // this.node.runAction(
        //     cc.repeatForever(
        //         cc.sequence(
        //             cc.callFunc( this.randShowCfg.bind( this ) ),
        //             cc.delayTime(5),
        //         )
        //     )
        // );
    },

    startShakeIcon () {
        if( this.shakeIdx == undefined ){
            this.shakeIdx = -1;
        }

        if (this.node.activeInHierarchy == false) {
            this.scheduleOnce(function () {
                this.startShakeIcon();
            }.bind(this), 1);
        }
        else {
            ++this.shakeIdx;
            this.shakeIdx = this.shakeIdx % this.items.length;
            let item = this.items[this.shakeIdx];
            item.shakeAction();

            this.scheduleOnce(function () {
                this.startShakeIcon();
            }.bind(this), 1);

            // let tag = 1104;
            // let act = cc.sequence(
            //     cc.delayTime(1),
            //     cc.callFunc(function () {
            //         this.startShakeIcon();
            //     }.bind(this))
            // )
            //     ;
            // act.setTag(1104);
            // this.node.stopActionByTag(tag);
            // this.node.runAction(act);
        }
    },
    startFadeToIcon() {
        console.log("随机数~~~~~~~~~~~~~~~");
        for (var i = 0; i < this.items.length; i++) {
            var value = fcapp.util.random(0,100);
            console.log("随机数",value);
            if(value < 50)
            {
                this.items[i].node.getChildByName("New Sprite").active = true;
                this.items[i].node.getChildByName("New Sprite").stopAllActions();
                this.items[i].node.getChildByName("New Sprite").runAction(cc.repeatForever(cc.sequence(cc.fadeTo(0.5, 0), cc.fadeTo(0.5, 255))));
            }
            else{
                this.items[i].node.getChildByName("New Sprite").active = false;
            }
        }

    },
    randShowCfg () {
        console.log("****************","randShowCfg");
        this.randStartIdx = this.randStartIdx || 0;
        if(!this.items)
            return;
        for (var i = 0; i < this.items.length; i++) {
            let titleFrameIdx = i;
            titleFrameIdx = titleFrameIdx % 3;

            var idx = this.randStartIdx + i;
            idx = idx % this.sidebarList.length;
            var cfg = {};

            if (Number(idx) > Number(this.sidebarList.length - 1) || !this.items[i].node) {
                continue;
            }


            if( !this.sidebarList[idx] ){
                this.items[i].node.active = false;
                continue;
            }
            this.items[i].node.active = true;

            //id
            cfg.id = this.sidebarList[idx].Position;
            //路径
            cfg.path = this.sidebarList[idx].PromoteLink;
            //appid
            cfg.appId = this.sidebarList[idx].GameAppId;
            //名字
            cfg.name = this.sidebarList[idx].GameName;
            //图标 
            cfg.icon = this.sidebarList[idx].Icon;
        //    cfg.isJumpMaxPng = this.isJumpMaxPng;

           cfg.isShakeAction = this.isShakeAction;


            // = this.frames[idx];
            cfg.showType = this.showType;
            cfg.sidebarList = this.sidebarList;
            this.items[i].init(cfg);
        }
        this.randStartIdx = (this.randStartIdx + this.items.length) % this.sidebarList.length;
    },
    setBanner(bannerObj)
    {
        if(this.items)
        {
            console.log("1222222222222222",bannerObj);
            console.log("1222222222222223",this.items.length);
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].bannerObj = bannerObj;
            }
        }
    },
});
