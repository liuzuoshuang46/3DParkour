import { _decorator, Component, Node ,SpriteComponent,Prefab,tweenUtil,Vec3} from "cc";
const { ccclass, property } = _decorator;

@ccclass("diandiandian")
export class diandiandian extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

     @property({ type: Prefab })
     public prefGongXi = null;

     @property({ type: SpriteComponent })
     public bar = null;

     @property({ type: Number })
     public awardValue = 0;

     private isHave = false;
     private isStop = false;
     private tempPost = new Vec3(0,0,0);//箭头起始位置
     private jianNodePos = new Vec3(0,0,0);//箭头当前位置
     private jianNode = null;//箭头节点
    start () {
        // Your initialization goes here.
        this.jianNode = this.node.getChildByName("jian");
        this.jianNodePos = new Vec3(this.jianNode.position.x,this.jianNode.position.y,this.jianNode.position.z);
        this.tempPost = new Vec3(this.jianNode.position.x,this.jianNode.position.y,this.jianNode.position.z);


        this.dongzuo();
        this.schedule(this.movePost);

        if(this.awardValue <= 0)
        {
            fcapp.datasdk.onEvent("金币关点点界面显示");
        }
        else
        {
            fcapp.datasdk.onEvent("点点界面显示");
        }
        
    }
    init(closeCall)
    {
        this.closeCall = closeCall;
    }
    //无限循环的回调
    dongzuo()
    {
        this.jianNodePos = new Vec3(this.tempPost.x,this.tempPost.y,this.tempPost.z);
        //箭头目标位置
        var jianNodeMubiaoPos = new Vec3(this.jianNodePos.x,this.jianNodePos.y - 100,this.jianNodePos.z);
        var jianNodeMubiaoPos1 = new Vec3(this.jianNodePos.x,this.jianNodePos.y ,this.jianNodePos.z);
        this.tween = tweenUtil(this.jianNodePos)
        .to(0.5, jianNodeMubiaoPos)
        .to(0.5, jianNodeMubiaoPos1)
        .call(() => {
                this.dongzuo();
        })
        .start()
    }
    //实时更新箭头位置
    movePost()
    {
        // console.log('***************',this.jianNodePos);
        this.jianNode.position =new Vec3(this.jianNodePos.x,this.jianNodePos.y,this.jianNodePos.z) ;
        
    }
    onEnable() {
        this.curNum = 0;
        this.bar.fillRange  = 0;
        // let node = this.node.getChildByName('btn').getChildByName('箭头');
        // let pos = node.position;
        // var seq = cc.sequence(
        //     cc.moveBy(0.3, 0,-30).easing( cc.easeOut( 2 ) ),
        //     cc.moveBy(0.3, 0,30).easing( cc.easeOut( 2 ) )
        // )
        // node.runAction(cc.repeatForever (seq) );
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    clickBtn () {
        this.curNum += 20;
    }

    update ( dt ) {
        if( this.isStop ){
            return;
        }
        
        this.curNum -= dt * 20;

        if( this.curNum < 0 ){
            this.curNum = 0;
        }
        this.bar.fillRange  = this.curNum / 100;

        if(this.isHave == false && this.curNum >= 80)
        {
            this.isHave = true;
            this.isStop = true;
            this.bar.fillRange = 1;

            if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true && window.wx)
            {
                this.banner = window.bannerMgr.showBottomBanner();
                if(this.awardValue <= 0)
                {
                    window.bannerMgr.onBannerClick(function () {
                        fcapp.datasdk.onEvent("金币关点点banner点击");
                    }.bind(this));
                }
                else{
                    window.bannerMgr.onBannerClick(function () {
                        fcapp.datasdk.onEvent("点点banner点击");
                    }.bind(this));
                }
               
            }

            let temp = {};
            tweenUtil(temp)
            .to(1, {time:temp.indx}, { easing: 'Cubic-Out' })
            .call(() => {
                    let node = cc.instantiate(this.prefGongXi);
                    let num = 1000;
                    let cmt = node.getComponent('gongxihuode');
                    node.parent = this.node;
                    cmt.init(function () {
                        if(this.closeCall)
                        {
                            this.closeCall();
                        }
                        this.node.destroy();
                        if(this.awardValue > 0)
                        {
                            fcapp.logItem.log('恭喜获得1000金币');
                            fcapp.data.coin = Number(fcapp.data.coin) + 1000;
                        }
                        
                    }.bind(this));
            })
            .start()
        }

    }

    onDisable () {
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }
        this.tween.stop();
        this.unschedule(this.movePost);
    }
}
