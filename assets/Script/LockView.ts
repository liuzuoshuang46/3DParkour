import { _decorator, Component,tweenUtil,LabelComponent,director,SpriteComponent, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("LockView")
export class LockView extends Component {
    @property( Node )
    lockNode: Node = null;

    onLoad () {
    }

    @property({ type: SpriteComponent })
    public image_tiao = null;

    @property({ type: SpriteComponent })
    public image_tiao1 = null;

    @property( LabelComponent )
    lblProgress: LabelComponent = null;

    update () {
        this.image_tiao.fillRange += 0.03;
        if( this.image_tiao.fillRange >= 1 ){
            this.image_tiao.fillRange = 0;
        }
    }

    any: any = {};
    loadSceneName( name: string, onHide ){

        fcapp.datasdk.onEvent("关卡界面loading开始");
        console.log('LockView loadSceneName : ', name );
        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true  && window.wx)
        {
            this.banner = window.bannerMgr.showBottomBanner();
        }
        this.node.active = true;
        this.image_tiao.fillRange = 0;
        director.preloadScene(name, ( completedCount, totalCount ) => { 
            // console.log('lock view load scene ' + name + completedCount + '/' + totalCount);
            let percent = completedCount / totalCount;

            this.image_tiao1.fillRange = percent;
            this.lblProgress.string = '加载中...' + (percent * 100).toFixed( 0 ) + '%';
        }, () => { 
            director.loadScene( name, (p1,p2,p3,p4) => { 
                if (window.wx) 
                {
                    window.bannerMgr.rmBanner( this.banner);
                }
                if( onHide ){
                    onHide( () => { 
                fcapp.datasdk.onEvent("关卡界面loading结束");
                        this.node.active = false
                    });
                } else{
                    this.node.active = false
                }
            }, null );
        })
    }
}
