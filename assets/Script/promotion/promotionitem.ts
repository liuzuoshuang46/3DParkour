import { _decorator, Component, Node ,SpriteComponent,LabelComponent,SpriteFrame,Texture2D,tweenUtil} from "cc";
const { ccclass, property } = _decorator;

@ccclass("promotionitem")
export class promotionitem extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property({ type: SpriteComponent })
    public icon = null;
    @property({ type: LabelComponent })
    public lblname = null;

    private opt = [];
    start () {
        // Your initialization goes here.
    }
 
    init ( opt ){
        this.initData( opt );
        this.initUI( opt );
    }

    initData(opt) {
        this.opt = opt;
    }

    shakeAction () {
        // var act = cc.sequence(
        //     cc.rotateBy( 0.15,15 ).easing( cc.easeIn(2) ),
        //     cc.rotateBy( 0.15,-30 ),
        //     cc.rotateBy( 0.15,30 ),
        //     cc.rotateBy( 0.15,-30 ),
        //     cc.rotateBy( 0.15,30 ),
        //     cc.rotateBy( 0.15,-30 ),
        //     cc.rotateBy( 0.15,15 ).easing( cc.easeOut(2) ),
        // );
        // this.icon.node.runAction( act );

        this.tween = tweenUtil({ rotate: 0 })
            .to(0.15, { rotate: -30 }, {
                easing: 'Linear-None', onUpdate: obj => {
                    this.node.eulerAngles = cc.v3(0, 0, obj.rotate);
                }
            })
            .to(0.15, { rotate: 30 }, {
                easing: 'Linear-None', onUpdate: obj => {
                    this.node.eulerAngles =  cc.v3(0, 0, obj.rotate);
                }
            })
            .to(0.15, { rotate: -30 }, {
                easing: 'Linear-None', onUpdate: obj => {
                    this.node.eulerAngles =  cc.v3(0, 0, obj.rotate);
                }
            })
            .to(0.15, {rotate: 30 }, {
                easing: 'Linear-None', onUpdate: obj => {
                    this.node.eulerAngles = cc.v3(0, 0, obj.rotate);
                }
            })
            .to(0.075, {rotate: 0 }, {
                easing: 'Linear-None', onUpdate: obj => {
                    this.node.eulerAngles =  cc.v3(0, 0, obj.rotate);
                }
            })
            // .to(2, {}, { easing: 'Linear-None' })
            // .union()
            // .repeat(-1)
            .start()
    }

    initUI ( opt ) {

        const self = this;
        const stt = opt.icon;

        
        cc.loader.load(stt, function (err, imageAsset) {
            if(err == null)
            {
                const spriteFrame = new SpriteFrame();
                (spriteFrame.texture as Texture2D).image = imageAsset;
                self.icon.spriteFrame = spriteFrame;
            }
        });

        this.lblname.string = opt.name;
    }

    // 跳转游戏
    promotion() {
        fcapp.datasdk.onEvent("互推游戏跳转",this.opt.showType);
        fcapp.chsdk.promotion( this.opt, function( ret ){
            if( ret ){
                fcapp.datasdk.onEvent("互推游戏成功跳转",this.opt.showType);
                fcapp.datasdk.onEvent("互推游戏成功跳转名字",this.opt.name);
                this.init( this.opt );
            }
            else if(this.opt.showType != "箭头" 
            && this.opt.showType != "更多游戏上部分" 
            && this.opt.showType != "更多游戏下部分" 
            && this.opt.showType != "复活"
            && this.opt.showType != "游戏界面"
            && this.opt.showType != "开局道具"
            && this.opt.showType != "摩托" && window.openBanner == true){
                // app.showMoreGames();
                let node = cc.find('Canvas');
                var scene = node.getComponent("MainScene");
                if(scene)
                {
                    if(this.bannerObj)
                    {
                        window.bannerMgr.rmBanner( this.bannerObj );
                    }
                    scene.clickGengduo(null);
                }
                else
                {
                    var scene =  node.getComponent("GameUI");
                    if(scene)
                    {
                        if(this.bannerObj)
                        {
                            window.bannerMgr.rmBanner( this.bannerObj );
                        }
                        scene.clickGengduo(null);
                    }
                }
               
            }

            // else if(this.opt.showType != "箭头" && this.opt.showType != "更多游戏上部分" && this.opt.showType != "更多游戏下部分"){
            //     // app.showMoreGames();
            //     let node = cc.find('Canvas');
            //     var scene = node.getComponent("main-scene");
            //     if(scene)
            //     {
                    
            //         if(app.g.JILIBANNEROPEN == true)
            //         {
            //             app.pbanner.show();
            //         }
            //         else
            //         {
            //             console.log("1333333333333333333333333",this.bannerObj);
            //             if(this.bannerObj)
            //             {
            //                 console.log("144444444444444444",this.bannerObj);
            //                 window.bannerMgr.rmBanner( this.bannerObj );
            //             }
                       
            //         }

            //         scene.clickGengduo(null);
            //     }
            //     else
            //     {
            //         var scene =  node.getComponent("game-scene");
            //         if(scene)
            //         {
            //             if(app.g.JILIBANNEROPEN == true)
            //             {
            //                 app.pbanner.show();
            //             }
            //             else
            //             {
            //                 if(this.bannerObj)
            //                 {
            //                     window.bannerMgr.rmBanner( this.bannerObj );
            //                 }
            //             }
            //             scene.clickGengduo(null);
            //         }
            //     }
               
            // }

        }.bind( this ));
    }

    click () {
        console.log(this.opt);
        this.promotion();
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    onDestroy() {
        console.log("****************home-promotion->onDestroy");
        if(this.tween)
        {
            this.tween.stop();
        }
    }
}
