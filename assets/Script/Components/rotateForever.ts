import { _decorator, Component,CCFloat,CCBoolean, Node, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("rotateForever")
export class rotateForever extends Component {

    /**
     * 正数正转，负数倒转
     */
    @property
    speedX: number = 0;
    @property
    speedY: number = 0;
    @property
    speedZ: number = 0;

    @property
    delayStart: number = 0;

    @property
    startOnLoad: boolean = false;
 
    private isStartAction: boolean = false
    start () {
        if( this.startOnLoad ){
            this.isStartAction = true;
        }
    }

    private tv3: Vec3 = new Vec3();
    update( dt:number ){
        if( this.isStartAction ){
            if( this.delayStart > 0 ){ 
                this.delayStart -= dt;
            }else{
                Vec3.copy( this.tv3,this.node.eulerAngles );
                this.speedX && (this.tv3.x += dt * this.speedX);
                this.speedY && (this.tv3.y += dt * this.speedY);
                this.speedZ && (this.tv3.z += dt * this.speedZ);
                this.node.eulerAngles = this.tv3;
            }
        }
    }

    public startAction() {
        this.isStartAction = true;
    }

    public stopAction() {
        this.isStartAction = false;
    }

    public setDelayTime ( val ) {
        this.delayStart = val;
    }
}
