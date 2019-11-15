import { _decorator, Component,Vec3,tweenUtil,Tween, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("MoveTo")
export class MoveTo extends Component {
    isMoving: boolean = false;

    private curPos:Vec3 = new Vec3();
    private tween: Tween = null;
    private startPos: Vec3 = new Vec3();

    moveBy( time, off ){
        this.curPos.set( 0, 0, 0 );
        this.startPos.set( this.node.position );

        this.tween = tweenUtil( this.curPos )
        .to( time, off )
        .call( () => {
            this.isMoving = false;
            delete this.tween;
        } )
        .start();

        this.isMoving = true;
    }

    update () {

    }

    onDisable() {
        if( this.tween ){
            delete this.tween;
        }
        this.isMoving = false;
    }
}
