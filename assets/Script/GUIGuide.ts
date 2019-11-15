import { _decorator, Component, LabelComponent,Node,PhysicsSystem } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GUIGuide")
export class GUIGuide extends Component {

    @property( LabelComponent )
    lbl: LabelComponent = null;

    any: any = {};

    onLoad () {
        this.init();
    }

    init() {
        this.any.step = 0;
        this.any.stepStr = [
            '上',
            '下',
            '左',
            '右',
            '上',
            '右'
        ];
        // this.any.stepZ = [ -12, -28, -43, -54 ];
        this.any.stepZ = [ -12, -28, -41, -54, -64, -71 ];
        this.lbl.node.active = false;
        
        this.anim = this.node.getChildByName('anim').getComponent( cc.AnimationComponent );
        this.anim.node.active = false;
    }

    nextStep() {
        this.lbl.string = this.any.stepStr[this.any.step];
        
        let tmp = {
            '上': { rotationZ: 180 },
            '下': { rotationZ: 0 },
            '左': { rotationZ: -90 },
            '右': { rotationZ: 90 }
        };
        let rotationZ = tmp[ this.any.stepStr[this.any.step] ].rotationZ;
        this.anim.node.eulerAngles = cc.v3(0,0,rotationZ);
        this.anim.node.active = true;
        this.anim.play('guide-show-hua-dong');

        fcapp.gameMgr.pause();
        if( this.any.step == 5 ){
            PhysicsSystem.instance.enable = false;
        }
    }

    stepComplete() {
        ++this.any.step;
        fcapp.gameMgr.resume();
        this.anim.node.active = false;

        if( this.any.step >= 6 ){
            this.node.destroy();
            fcapp.gameMgr._guide = null;
            fcapp.data.guideComplete = true;
        }

        if( this.any.step == 5 ){
            fcapp.gameMgr._play.pauseSkeleAni();
        }
        if( this.any.step == 6 ){
            PhysicsSystem.instance.enable = true;
            fcapp.gameMgr._play.resumeSkeleAni();
        }
    }

    stepUpdate ( deltaTime ) {
        if( !fcapp.gameMgr.isGameStarted ){
            return;
        }
        if( this.any.step < this.any.stepZ.length && fcapp.gameMgr._play.node.position.z <= this.any.stepZ[ this.any.step ] ) {
            this.nextStep();
        }
    }

    hide () {

    }
}
