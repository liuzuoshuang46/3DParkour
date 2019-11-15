import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("CameraFollow")
export class CameraFollow extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    private mPos = new cc.Vec3(0,0,0);
    private targetPos = new cc.Vec3(0,0,0);
    private mOffsetPos = new cc.Vec3(0,3.5,6);
    // private mOffsetPos = new cc.Vec3(0,0,6);
    start () {
        // Your initialization goes here.

    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
 
    setTargetPos( pos ){
        this.targetPos = pos;
    }

    stepUpdate ( dt ) {
       

        if(this.mPos == undefined)
            return;

        let point = new cc.Vec3(this.targetPos.x + this.mOffsetPos.x,this.targetPos.y + this.mOffsetPos.y,this.targetPos.z + this.mOffsetPos.z);

        let tempPos =new cc.Vec3(point.x - this.mPos.x,point.y - this.mPos.y,point.z - this.mPos.z);//;

        this.mPos =new cc.Vec3(tempPos.x/5 + this.mPos.x,tempPos.y/9 + this.mPos.y,tempPos.z/9 + this.mPos.z);

        this.node.position = this.mPos;
    }
}
