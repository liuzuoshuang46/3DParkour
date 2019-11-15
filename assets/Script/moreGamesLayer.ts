import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("moreGamesLayer")
export class moreGamesLayer extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    @property({ type: Node })
    public promotion1 = null;
    @property({ type: Node })
    public promotion2 = null;
    public callBack = null;
    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    onEnable() {
        if(window.openBanner == true && window.wx)
        {
            this.promotion1.active = true;
            this.promotion1.getComponent( "home-promotion2" ).init(fcapp.sidebarList_home);

            this.promotion2.active = true;
            this.promotion2.getComponent( "home-promotion" ).init(fcapp.sidebarList_home);
        }
        else
        {
            this.promotion1.active =false;
            this.promotion2.active =false;
        }

       
        // this.promotion1.active = true;
        // this.promotion1.getComponent( "home-promotion2" ).init(fcapp.sidebarList_home);

        // this.promotion2.active = true;
        // this.promotion2.getComponent( "home-promotion" ).init(fcapp.sidebarList_home);
    }

     //关闭按钮
     closeBackCall() {
        if(this.promotion2)
            // this.promotion2.getComponent( "home-promotion" ).exit();

        fcapp.audio.play(fcapp.audio.audio18);
        if(this.callBack)
        {
            this.callBack();
        }
        this.callBack = null;
        this.node.active = false;
    }
}
