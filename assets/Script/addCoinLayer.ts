import { _decorator, Component, Node ,LabelComponent} from "cc";
const { ccclass, property } = _decorator;

@ccclass("addCoinLayer")
export class addCoinLayer extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    //属性信息
    @property({ type: [Node] })
    public itemList = [];

    private _type = 0;
    private _num = 0;
    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    onEnable() {
        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true  && window.wx)
        {
            this.banner = window.bannerMgr.showBottomBanner();
        }
    }
    init(type,num)
    {
        this._type = Number(type);
        this._num = Number(num);
        this.itemList[0].active = false;
        this.itemList[1].active = false;

        this.itemList[Number(type - 1)].active = true;
        this.itemList[Number(type - 1)].getChildByName("num").getComponent(LabelComponent).string = num;

        if(this._type == 1)
        {

            fcapp.datasdk.onEvent("显示免费领取金币");
        }
        else
        {
            fcapp.datasdk.onEvent("显示免费领取钻石");
        }

    }
    callBackGet(){

        var next = function( ret ){
            if( ret ){
                if(this._type == 1)
                {
        
                    fcapp.datasdk.onEvent("免费领取金币成功");
                    fcapp.data.coin = fcapp.data.coin + this._num;
                }
                else
                {
                    fcapp.datasdk.onEvent("免费领取钻石成功");
                    fcapp.data.diamond = fcapp.data.diamond + this._num;
                }
        
                this.closeBackCall();
                
                fcapp.logItem.log('领取成功');
            }
            else
            {
                fcapp.logItem.log('领取失败');
            }
        }.bind( this );

        fcapp.chsdk.callAdVideo( next );

        
    }
     //关闭按钮
     closeBackCall(){
         this.node.destroy();
        // this.node.active = false;
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }
     }
}
