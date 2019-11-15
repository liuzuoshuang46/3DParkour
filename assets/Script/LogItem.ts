import { _decorator, Component,LabelComponent, Node,tweenUtil,Tween } from "cc";
const { ccclass, property } = _decorator;

@ccclass("LogItem")
export class LogItem extends Component {
    log( str ){
        if( this.tween ){
            this.tween.stop();
        }

        this.node.active = true;
        this.any.logItemPos = cc.v3( 320, 568, 0 );
        this.rootNode.position = this.any.logItemPos;
        this.lbl.string = str;
        this.tween = 
        tweenUtil( this.any.logItemPos )
        .to( 0.8, { y: 668 },{ easing: 'Cubic-Out' } )
        // .delay( 1 )
        .call( () => { 
            delete this.any.logItemPos;
            this.node.active = false;
        })
        .start();
    } 

    @property( LabelComponent )
    lbl: LabelComponent = null;

    @property( Node )
    rootNode: Node = null;

    any: any = null;
    onLoad () {
        this.any = {};
        this.node.active = false;
        this.schedule( this.moveSchedule.bind( this ) );
    }

    tween: Tween = null;
    moveSchedule () {
        if( this.any.logItemPos ){
            this.rootNode.position = this.any.logItemPos;
        }
    }
}
