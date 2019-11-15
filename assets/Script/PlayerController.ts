// import { _decorator, Component, Node } from "cc";
import {
    _decorator, Component, Node, ParticleSystemComponent,
    Vec3, ICollisionEvent, Material, SkinningModelComponent,
    RigidBodyComponent, ConstantForce, AnimationComponent,
    BoxColliderComponent, ColliderComponent, ITriggerEvent,
    SkeletalAnimationComponent, geometry,Prefab
} from "cc";
import { PlayerSkin } from "./PlayerSkin"
import { Item } from "./Item"
import { ECoderKeepId } from "./GameMageController"
import { Car } from "./Car"
import { GameGroundPlaneComponent } from "./GameGroundPlaneComponent"

const { ccclass, property } = _decorator;
const r_t = new geometry.ray();
enum DirectionInput {
    Null, Left, Right, Up, Down
};

enum Position {
    Middle, Left, Right
};

let tv3 = new Vec3();

const playerAttr = {
    hp: 1,
    leftInvincibleTime: 10,
    leftXitieshiTime: 5,
    leftAddSpeedTime: 6,
    leftFlyTime: 7,

    speedZ: 6 + (6*0.2),
    speedAddZ: 9 + (9*0.2),
    speedMotuoZ: 9 ,
    speedMotuoAddZ: 15 ,
    speedCarZ: 20 ,
    speedCarAddZ: 35 
}

@ccclass("PlayerController")
export class PlayerController extends Component {

    //角色节点
    @property({ type: Node })
    public playerNode: Node = null;

    //用来设置摄像头跟随
    @property({ type: Node })
    public cameraHou: Node = null;

    //触摸节点
    @property({ type: Node })
    public touchNode: Node = null;

    //触摸的起始位置
    private currentPos = new Vec3(0, 0, 0);
    //目标跑到
    private directInput: DirectionInput = DirectionInput.Null;
    //疑似  当前位置
    private positionStand: Position = Position.Middle;

    private _jumpTime = 0;

    //触摸到抬起 玩家是否执行了动作
    private _isPlayerAction = false;
  //点点点礼包预制体
  @property({ type: Prefab })
  public diandiandian = null;
    //点点点礼包父节点
    @property({ type: Node })
    public diandiandianParent = null;

    /**
     * 角色状态
     * 1 地面
     * 2 跳跃
     * 3 加速下落
     * 4 地面滑行
     * 5 脚下空了自由下落
     * 6 飞天
     */
    private _roleState = 1;

    private _isCollSideMove: boolean = false; // 因为撞到障碍物侧面反弹回去引起的_moveState变化
    private _collSideForbidenInputTime: number = 0;// 撞到障碍物禁止操作1s 

    private _moveState = 0;//0未移动 1向左移动 2向右移动
    private __postState: number = 0;// 123 第123条路
    private proPost = new Vec3(0, 0, 0)
    private currentPost = new Vec3(0, 0, 0)
    public get _postState() {
        return this.__postState;
    }
    public set _postState(val) {
        this.__postState = val;
    }

    private skin: PlayerSkin = null;

    // 吃了加速道具 加速特效 和加速数据
    private leftAddSpeedTime: number = 0;
    doAddSpeed() {
        this.leftAddSpeedTime = playerAttr.leftAddSpeedTime;
        fcapp.gameMgr.showEffectScreenLight();
    }
    doAddCarSpeed() {
        this.leftAddSpeedTime = playerAttr.leftAddSpeedTime;
        fcapp.gameMgr.showEffectScreenLight();
        this.showCarAddSpeedEffectNIUBI();
        this.showWeiyan(true);
    }

    // 角色尾焰
    showRoleWieYan(show) {
        if (!this.eftRoleWeiyan) {
            this.eftRoleWeiyan = this.skin.node.getChildByName('weiyan');
        }
        if (this.eftRoleWeiyan) {
            this.eftRoleWeiyan.active = show;
            if (show) {
                this.eftRoleWeiyan.getComponentsInChildren(ParticleSystemComponent).forEach(particle => {
                    particle.clear();
                    particle.play();
                })
            }
        }
    }

    // 汽车尾焰
    showWeiyan(show) {
        if (this.hasCar()) {
            let weiyanNodeParent = this.curCar.getChildByName('weiyan');
            weiyanNodeParent.active = show;
            if (show) {
                weiyanNodeParent.children.forEach(node => {
                    let particle = node.getComponent(ParticleSystemComponent);
                    particle.clear();
                    particle.play();
                })
            }
        }
    }

    playEffectEatCoin() {
        let ect = fcapp.gameMgr.getEffectFromPool(ECoderKeepId.EFT_EAT_COIN);
        ect.parent = this.skin.node;
        ect.scale = cc.v3(7, 7, 7);
        ect.position = cc.v3(0, 0.25, 0.8);

        let particle = ect.getComponent(ParticleSystemComponent);
        particle.clear();
        particle.play();

        this.scheduleOnce(() => {
            fcapp.gameMgr.putObstacleToPool(ECoderKeepId.EFT_EAT_COIN, ect);
        }, 1);
    }

    // 吃了飞行道具，飞行特效和飞行数据
    onEatFly() {
        this.doFly();
        fcapp.gameMgr.showEffectScreenLight();
    }

    private eft_hudun: ParticleSystemComponent = null;
    initSkinEffect() {
        if (!this.eft_hudun) {
            let eft = this.eft_hudun = fcapp.gameMgr.getEffectFromPool(ECoderKeepId.EFT_HU_DUN).getComponent(ParticleSystemComponent);
            let node = eft.node;
            node.parent = this.skin.node;
            node.scale = cc.v3(5, 5, 5);
            node.position = cc.v3(0, 0.87, -0.65);
            node.active = false;
        }
    }

    initCollider() {
        let Collider: ColliderComponent = this.playerNode.getComponent(cc.ColliderComponent);
        Collider.on('onCollisionEnter', this.onCollisionEnter, this);
        Collider.on('onCollisionStay', this.onCollisionStay, this);
        Collider.on('onCollisionExit', this.onCollisionExit, this);

        Collider.on('onTriggerEnter', this.onTriggerEnter, this);
        Collider.on('onTriggerStay', this.onTriggerStay, this);
        Collider.on('onTriggerExit', this.onTriggerExit, this);

        let tests = this.playerNode.getComponentsInChildren(ColliderComponent);
        for (var j = 0; j < tests.length; j++) {
            tests[j].setGroup(2);//0010
            tests[j].setMask(4);//1000

            console.log("PlayerControllerGroup", tests[j].getGroup());
            console.log("PlayerControllerMask", tests[j].getMask());
        }
    }

    initWithId(roleId) {
        let id2Name = [
            'RedPig_skin',
            'feifei_skin',
            'CRQ_skin',
            'GreenPig_skin',
            'BluePig_skin'
        ];
        let roleNode = fcapp.gameMgr.resList.newPrefabByName(id2Name[roleId]);
        this.skin = roleNode.getComponent(PlayerSkin);
        this.initData(roleId);
        this.playerNode.removeAllChildren();
        roleNode.parent = this.playerNode;

        this.initSkinEffect();
        this.initCollider();
        this.skin.skinningModel.material.setProperty('albedo', cc.color(255, 255, 255, 255));
        this.playAniForce('idle');
        this.showRoleWieYan(false);
    }

    private posState2posX = [-99999999999999, -1.61, 0, 1.61];

    private collisionList: Object = null;

    pauseSkeleAni() {
        this.skin.animationComponent.pause();
        if( this.curMoto ){
            this.curMoto.getComponent(AnimationComponent).pause();
        }
    }

    resumeSkeleAni() {
        this.skin.animationComponent.resume();
        if( this.curMoto ){
            this.curMoto.getComponent(AnimationComponent).resume();
        }
    }

    private isDead: boolean = false;
    dead() {
        this.isDead = true;
        this.playAniForce('ending');
        // this.pauseSkeleAni();
    }

    // 挂点临时变量
    private any: any = {};
    playBlinkPlayerBody() {
        this.any.bodyOpacity = {
            opacity: 255
        }
        this.skin.skinningModel.material.setProperty('albedo', cc.color(255, 255, 255, this.any.bodyOpacity.opacity));
    }

    private leftInvincibleTime: number = 0;
    revival() {
        this.isDead = false;
        this.playAniForce(this._curAnimName);
        // this.resumeSkeleAni();
        this.hp = playerAttr.hp;
        this.doInvincibleShort();
    }

    doInvincible() {
        this.leftInvincibleTime = playerAttr.leftInvincibleTime;
    }

    doInvincibleShort() {
        this.leftInvincibleTime = 2;
    }

    // 吃了护盾道具，出护盾特效， 同时无敌
    onEatProp_hudun() {
        this.doInvincible();
        this.eft_hudun.node.active = true;
        this.eft_hudun.clear();
        this.eft_hudun.play();
    }

    private leftXitieshiTime: number = 0;
    onPropXitieshi() {
        this.leftXitieshiTime = playerAttr.leftXitieshiTime;
    }

    isPropXitieshi() {
        return this.leftXitieshiTime > 0;
    }

    isInvincible() {
        return this.leftInvincibleTime > 0;
    }

    isAddSpeed() {
        return this.leftAddSpeedTime > 0;
    }

    private roleId: number = null;
    initData(roleId) {
        this.roleId = roleId;
        this.collisionList = {};
        this.hp = playerAttr.hp;
    }

    curMoto: Node = null;

    onCollMoto() {
        if (this.curMoto) {
            this.skin.node.parent = this.playerNode;
            this.curMoto.destroy();
        }

        fcapp.gameUI.showVideoGetMotuoBtn(false);
        this.playAnimName('drive_motuo');
        
        let car = this.curMoto = fcapp.gameMgr.resList.newPrefabByName('motuo_skin');
        car.parent = this.playerNode;
        var target = car.getChildByName('bone_che_ride Socket').getChildByName('hero');
        this.skin.node.parent = target;

        target.scale = new Vec3(1/2.53999996185303,1/2.53999996185303,1/2.5400002646446227)
        target.eulerAngles = new Vec3(0,0,-90);
        target.position = new Vec3(-0.275,0,0);
    }

    onExitMoto() {
        if (this.curMoto) {
            this.skin.node.parent = this.playerNode;
            this.curMoto.destroy();
            delete this.curMoto;

            this.playAnimName('run');

            fcapp.gameUI.hideEffectScreenLight();
        }
        fcapp.gameUI.showVideoGetMotuoBtn(true);
        fcapp.gameMgr.pauseAndCallVideoMoto();
    }

    showMoto(show) {
        if (this.curMoto) {
            this.curMoto.active = show;
            if(show == false)
            {
                this.skin.node.parent = this.playerNode; 
            }
            else
            {
                var target = this.curMoto.getChildByName('bone_che_ride Socket').getChildByName('hero');
                this.skin.node.parent = target;
            }
        }
    }

    isMotoEnable() {
        return this.curMoto && this.curMoto.active;
    }

    private curCar: Node = null;
    onCollCar() {
        this.showMoto(false);
        fcapp.gameUI.showVideoGetMotuoBtn(false);
        if (this.curCar) {
            this.curCar.destroy();
        }

        let id2Name = [
            'RedPig_car_skin',
            'feifei_car_skin',
            'CRQ_car_skin',
            'GreenPig_car_skin',
            'BluePig_car_skin'
        ];
        let car = this.curCar = fcapp.gameMgr.resList.newPrefabByName(id2Name[this.roleId]);
        car.parent = this.skin.node;
        this.playAnimName('drive_car');
        this.showWeiyan(false);
    }

    private eftNiubiAddSpeed: Node = null;
    // 牛逼带闪电的加速特效
    showCarAddSpeedEffectNIUBI() {
        // if( !this.hasCar() ){
        // return;
        // }
        if (!this.eftNiubiAddSpeed) {
            let eftParentNode = fcapp.gameMgr.resList.newEffectById(ECoderKeepId.EFT_ROLE_JIA_SU);
            eftParentNode.parent = this.skin.node;
            this.eftNiubiAddSpeed = eftParentNode;
        }
        this.eftNiubiAddSpeed.active = true;
        let particles = this.eftNiubiAddSpeed.getComponentsInChildren(ParticleSystemComponent);
        particles.forEach(p => {
            p.clear();
            p.play();
        })
    }

    hideCarAddSpeedEffectNIUBI() {
        if (this.eftNiubiAddSpeed) {
            this.eftNiubiAddSpeed.active = false;
        }
    }

    onExitCar() {
        this.showMoto(true);
        if (!this.curMoto) {
            fcapp.gameUI.showVideoGetMotuoBtn(true);
        }
        if (this.curCar) {
            this.curCar.destroy();
            delete this.curCar;

            fcapp.gameUI.hideEffectScreenLight();
            this.hideCarAddSpeedEffectNIUBI();
        }
    }

    hasCar() {
        return !!this.curCar;
    }

    onCollReduceHp() {
        cc.assert(this.hp >= 0);
        if (fcapp.data.selectHero == 0)
            fcapp.audio.play(fcapp.audio.audio5);
        else if (fcapp.data.selectHero == 1)
            fcapp.audio.play(fcapp.audio.audio2);
        else if (fcapp.data.selectHero == 2)
            fcapp.audio.play(fcapp.audio.audio6);
        else if (fcapp.data.selectHero == 3)
            fcapp.audio.play(fcapp.audio.audio3);
        else if (fcapp.data.selectHero == 4)
            fcapp.audio.play(fcapp.audio.audio4);

        this.reduceHp(1);
        this.doInvincibleShort();
        fcapp.gameMgr.onPlayerReduceHp();
    }

    @property(SkinningModelComponent)
    shentiSkinningModelComponent: SkinningModelComponent = null;
    startGame() {
        //初始化触摸
        this.playerNode.getComponent(cc.BoxColliderComponent).material.restitution = 0;
        this.initTouch();
        this._postState = 2;

        this.doInvincibleShort();
    }

    startCountDown() {

        if (fcapp.gameMgr.readyPropId == 1) {
            fcapp.gameUI.setPropIcon(0, 1, 1);
        } else {
            fcapp.gameUI.setPropIcon(0, 0, 0);
        }

        this.playAniForce('idle_run');
        this.scheduleOnce(() => {
            this.playAniForce('drive_motuo');
            this.onCollMoto();
        }, 1.5);
    }

    initTouch() {
        this.touchNode.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
    }

    onEnterCoinPass() {

        fcapp.gameMgr._intoCoinJs ++;
        if (window.openBanner == true && window.fcapp.hbswitch.ccclick == true && window.wx) 
        {
            if(fcapp.gameMgr._intoCoinJs > 1 && fcapp.gameMgr._intoCoinJs%2 == 1)
            {
                let node = cc.instantiate(this.diandiandian);
                node.getComponent("diandiandian").init(function (ret) {
                    fcapp.gameMgr.resume();
                    this.endFly();
                    this.onCollCar();
                }.bind(this));
                node.parent = this.diandiandianParent;
                fcapp.gameMgr.pause();
            }
            else
            {
                this.endFly();
                this.onCollCar(); 
            }
        }
        else
        {
            this.endFly();
            this.onCollCar(); 
        }

        
       
       
    }

    onExitCoinPass() {
        fcapp.gameMgr._intoCoinJs ++;
        this.onExitCar();
        this.leftAddSpeedTime = 0;
    }

    setupdate(dt) {
        if (fcapp.gameMgr.isGameStarted) {
            this.updateMove(dt);
            if (this.leftInvincibleTime > 0) {
                this.leftInvincibleTime -= dt;
                if (this.leftInvincibleTime <= 0) {
                    this.eft_hudun.node.active = false;
                }
            }
            if (this.leftXitieshiTime > 0) {
                this.leftXitieshiTime -= dt;
                this.checkCoinNearPlayer();
            } else {
            }
            if (this.leftAddSpeedTime > 0) {
                this.leftAddSpeedTime -= dt;
                if (this.leftAddSpeedTime <= 0) {
                    fcapp.gameMgr.hideEffectScreenLight();
                    this.showWeiyan(false);
                    this.hideCarAddSpeedEffectNIUBI();
                }
            }
            this.secondUpdate(dt);

            /****************************************** */
            var testDate = new Date();
            // let times1 = testDate.getTime();
            let js = 0;
            let pigNode = this.node.getChildByName("RedPig_skin");
            let pigBox = pigNode.getComponent(BoxColliderComponent)
            this.currentPost = new Vec3(pigNode.position.x, pigNode.position.y + pigBox.size.y / 2, this.node.position.z);
            if (this.proPost.z < 0) {

                //  let pigBox = pigNode.getComponentsInChildren(BoxColliderComponent)[0];
                let propaabb: geometry.aabb = geometry.aabb.create(0, 0, 0, 0, 0, 0);
                //  let pigaabb: geometry.aabb = geometry.aabb.create(0, 0, 0, 0, 0, 0);
                let pigline: geometry.line = geometry.line.create(this.proPost.x, this.proPost.y, this.proPost.z, this.currentPost.x, this.currentPost.y, this.currentPost.z);
                //    //障碍物的位置
                for (var i = 0; i < fcapp.gameMgr._groundList.length; i++) {
                    let node = fcapp.gameMgr._groundList[i];
                    //  if ((node.position.z < this.currentPost.z && (node.position.z + 10) > this.currentPost.z) || (node.position.z > this.currentPost.z && (node.position.z - 10) < this.currentPost.z) )
                    if (true) {
                        let propList = node.getComponent("GameGroundPlaneComponent").getProp();
                        for (let j = 0; j < propList.length; j++) {
                            let prop = propList[j];
                            let propPostZ = prop[0].node.parent.position.z + node.position.z;

                            if(prop[0].node.parent.active == false)
                            {
                                continue;
                            }
                            //减枝操作
                            //if ((propPostZ < this.currentPost.z && (propPostZ + 10) > this.currentPost.z) || (propPostZ > this.currentPost.z && (propPostZ - 10) < this.currentPost.z))
                            if (propPostZ > this.currentPost.z - 4)
                            {
                                js++;
                                let propBox = prop[0];
                                //地面的位置+道具的位置+碰撞盒的node位置+碰撞盒的位置
                                var propX = node.position.x + prop[0].node.parent.position.x + propBox.node.position.x + propBox.center.x;
                                var propY = node.position.y + prop[0].node.parent.position.y + propBox.node.position.y + propBox.center.y;
                                var propZ = node.position.z + prop[0].node.parent.position.z + propBox.node.position.z + propBox.center.z;
                                //碰撞盒的大小/2
                                var prophw = propBox.size.x / 2;
                                var prophh = propBox.size.y / 2;
                                var prophl = propBox.size.z / 2;
                                //设置碰撞盒
                                geometry.aabb.set(propaabb, propX, propY, propZ, prophw, prophh, prophl);
                                //线对盒检测
                                let result = this.line_aabb(pigline, propaabb);
                                //结果判断
                                if (result) {
                                    fcapp.gameMgr.onEatProp(prop[0].node);
                                }
                            }
                        }
                    }
                }
            }
            // var tempValue = (this.proPost.z - this.currentPost.z);
            // if (tempValue < 0.1)
            //     console.log('两帧的距离0.1');
            // else if (tempValue < 0.2)
            //     console.log('两帧的距离0.2');
            // else if (tempValue < 0.3)
            //     console.log('两帧的距离0.3');
            // else if (tempValue < 0.4)
            //     console.log('两帧的距离0.4');
            // else if (tempValue < 0.5)
            //     console.log('两帧的距离0.5');
            // else
            //     console.log('两帧的距离', tempValue);
            this.proPost = new Vec3(this.currentPost.x, this.currentPost.y, this.currentPost.z);
            testDate = new Date();
            // let times2 = testDate.getTime();
            //  console.log('循环检耗时',(times2 - times1),"检测次数",js);

            /****************************************** */
        }
        this.updateCamera(dt);
    }
    line_aabb(line: geometry.line, aabb: geometry.aabb): number {
        r_t.o.set(line.s);
        Vec3.subtract(r_t.d, line.e, line.s);
        r_t.d.normalize();
        const min = geometry.intersect.ray_aabb(r_t, aabb);
        const len = line.length();
        if (min <= len) {
            return min;
        } else {
            return 0;
        }
    }
    private secondDt: number = 0;
    secondUpdate(dt) {
        this.secondDt -= dt;
        if (this.secondDt < 0) {
            this.updateMeter();

            if (this.leftInvincibleTime > 0) {
                fcapp.gameUI.setPropIcon(2,
                    this.leftInvincibleTime / playerAttr.leftInvincibleTime,
                    this.leftInvincibleTime);
            } else {
                fcapp.gameUI.setPropIcon(2, 0);
            }
            if (this.leftAddSpeedTime > 0) {
                fcapp.gameUI.setPropIcon(1,
                    this.leftAddSpeedTime / playerAttr.leftAddSpeedTime,
                    this.leftAddSpeedTime);
            } else {
                fcapp.gameUI.setPropIcon(1, 0);
            }
            if (this._leftFlyTime > 0) {
                fcapp.gameUI.setPropIcon(3,
                    this._leftFlyTime / playerAttr.leftFlyTime,
                    this._leftFlyTime);
            } else {
                fcapp.gameUI.setPropIcon(3, 0);
            }

        }
    }

    checkCoinNearPlayer() {
        let arr = fcapp.gameMgr.getObstZLessThanPlayer(3);
        arr.forEach((node: Node) => {
            let item = node.getComponent(Item);
            let coinItemId = 1000;
            if (item && item.itemId == coinItemId) {

            }
        })
    }

    updateMeter() {
        fcapp.gameUI.meterNum = this.getMeterOfRun();
    }

    updateCamera(dt) {
        this.cameraHou.getComponent("CameraFollow").setTargetPos(this.playerNode.position);
        this.cameraHou.getComponent("CameraFollow").stepUpdate(dt);
    }

    updateMove(dt) {
        var nodePos = this.node.position.clone();
        let movez = this.getSpeedZ() * dt;
        if (this.hasCollPName('down')) {
            this.node.setPosition(cc.v3(nodePos.x, nodePos.y - 0.04, nodePos.z - movez));
        } else {
            this.node.setPosition(cc.v3(nodePos.x, nodePos.y, nodePos.z - movez));
        }

        //起跳
        if (this._roleState == 2) {
            this._jumpTime += dt;
            if (this._jumpTime < 0.07) {
                this.playerNode.getComponent(ConstantForce).force = new cc.Vec3(0, 0, 0);
                this.playerNode.getComponent(RigidBodyComponent).setLinearVelocity(new Vec3(0, 5, 0));
            }
        } else {
            this._jumpTime = 0;
        }

        if (this._collSideForbidenInputTime > 0) {
            this._collSideForbidenInputTime -= dt;
        }

        // 下滑
        if (this._roleState == 4) {
            this._slideTime += dt;
            if (this._slideTime > 0.6) {
                this.playAnimName('run');
                this._roleState = 1;
            }
        } else {
            Vec3.copy(tv3, this.playerNode.getComponent(BoxColliderComponent).size);
            tv3.y = 1;
            this.playerNode.getComponent(BoxColliderComponent).size = tv3;

            Vec3.copy(tv3, this.playerNode.getComponent(BoxColliderComponent).center);
            tv3.y = 0.5;
            this.playerNode.getComponent(BoxColliderComponent).center = tv3;

            this._slideTime = 0;
        }

        let speedX = 5;
        //右移
        if (this._moveState == 2) {
            let pos = this.playerNode.position.clone();
            pos.x += dt * speedX;
            let targetPos = null;
            if (this._postState == 1) {
                targetPos = 2;
            } else if (this._postState == 2) {
                targetPos = 3;
            } else {
                cc.assert(false);
            }
            if (pos.x >= this.posState2posX[targetPos]) {
                pos.x = this.posState2posX[targetPos];
                this._moveState = 0;
                this._postState = targetPos;
                this._isCollSideMove = false;

                if (this.hasCollPName('ground')) {
                    this.playAnimName('run');
                } else {
                    // this.playAnimName('jump01');    
                }
            }

            this.playerNode.setPosition(pos);
        }

        //左移
        else if (this._moveState == 1) {
            let pos = this.playerNode.position.clone();
            pos.x -= dt * speedX;
            let targetPos = null;
            if (this._postState == 2) {
                targetPos = 1;
            } else if (this._postState == 3) {
                targetPos = 2;
            } else {
                cc.assert(false);
            }
            if (pos.x <= this.posState2posX[targetPos]) {
                pos.x = this.posState2posX[targetPos];
                this._isCollSideMove = false;
                this._moveState = 0;
                this._postState -= 1;

                if (this.hasCollPName('ground')) {
                    this.playAnimName('run');
                } else {
                    // this.playAnimName('jump01');    
                }
            }

            this.playerNode.setPosition(pos);
        }

        this.checkAndHandleFly(dt);
    }

    private _leftFlyTime = 0;
    checkAndHandleFly(dt: number) {
        if (this._roleState != 6) {
            return;
        }
        const flyToY = 5;
        const flySpeedY = 8;
        const flySpeedZ = 5;

        let playPos = this.playerNode.getPosition();
        if (playPos.y < flyToY) {
            playPos.y += dt * flySpeedY;
            if (playPos.y > flyToY) {
                playPos.y = flyToY;
            }
        }

        this._leftFlyTime -= dt;
        if (this._leftFlyTime <= 0) {
            this.endFly();
        }
        this.playerNode.position = playPos;

        // let thisPos = this.node.getPosition();
        // thisPos.z -= dt * flySpeedZ;
        // this.node.setPosition(thisPos);
    }

    doFly() {
        fcapp.gameMgr.onPlayerFlyShowSkyCoins();
        fcapp.gameMgr.showEffectScreenLight();
        this.showRoleWieYan(true);
        this._roleState = 6;
        this.showMoto(false);
        this.playAnimName('fly');
        this._leftFlyTime = playerAttr.leftFlyTime;
        this.playerNode.getComponent(RigidBodyComponent).linearFactor = new Vec3(0, 0, 0);
    }

    endFly() {
        if (this._roleState != 6) {
            return;
        }

        this._roleState = 5;
        fcapp.gameMgr.hideEffectScreenLight();
        this.showRoleWieYan(false);
        this.showMoto(true);

        this.playerNode.getComponent(RigidBodyComponent).linearFactor = new Vec3(0, 1, 0);
        this.playAnimName('jump01');
        if (fcapp.data.selectHero == 0)
            fcapp.audio.play(fcapp.audio.audio29);
        else if (fcapp.data.selectHero == 1)
            fcapp.audio.play(fcapp.audio.audio30);
        else if (fcapp.data.selectHero == 2)
            fcapp.audio.play(fcapp.audio.audio31);
        else if (fcapp.data.selectHero == 3)
            fcapp.audio.play(fcapp.audio.audio27);
        else if (fcapp.data.selectHero == 4)
            fcapp.audio.play(fcapp.audio.audio28);

        fcapp.gameMgr.onPlayerFlyHideSkyCoins();
        this._leftFlyTime = 0;
        this.leftInvincibleTime = 3;
    }

    isFlying() {
        return this._roleState == 6;
    }

    lateUpdate_bak(dt) {
        // cc.log('lateUpdate_bak');
        //起跳
        if (this._roleState == 2) {
            this._jumpTime += dt;
            if (this._jumpTime < 0.07) {
                this.playerNode.getComponent(ConstantForce).force = new cc.Vec3(0, 0, 0);
                this.playerNode.getComponent(RigidBodyComponent).setLinearVelocity(new Vec3(0, 5, 0));
            }
        } else {
            this._jumpTime = 0;
        }

        if (this._collSideForbidenInputTime > 0) {
            this._collSideForbidenInputTime -= dt;
        }

        // 下滑
        if (this._roleState == 4) {
            this._slideTime += dt;
            if (this._slideTime > 0.6) {
                this.playAnimName('run');
                this._roleState = 1;
            }
        } else {
            Vec3.copy(tv3, this.playerNode.getComponent(BoxColliderComponent).size);
            tv3.y = 1;
            this.playerNode.getComponent(BoxColliderComponent).size = tv3;

            Vec3.copy(tv3, this.playerNode.getComponent(BoxColliderComponent).center);
            tv3.y = 0.5;
            this.playerNode.getComponent(BoxColliderComponent).center = tv3;

            this._slideTime = 0;
        }

        let speedX = 5;
        //右移
        if (this._moveState == 2) {
            let pos = this.playerNode.position.clone();
            pos.x += dt * speedX;
            let targetPos = null;
            if (this._postState == 1) {
                targetPos = 2;
            } else if (this._postState == 2) {
                targetPos = 3;
            } else {
                cc.assert(false);
            }
            if (pos.x >= this.posState2posX[targetPos]) {
                pos.x = this.posState2posX[targetPos];
                this._moveState = 0;
                this._postState = targetPos;
                this._isCollSideMove = false;

                if (this.hasCollPName('ground')) {
                    this.playAnimName('run');
                } else {
                    // this.playAnimName('jump01');    
                }
            }

            this.playerNode.setPosition(pos);
        }

        //左移
        else if (this._moveState == 1) {
            let pos = this.playerNode.position.clone();
            pos.x -= dt * speedX;
            let targetPos = null;
            if (this._postState == 2) {
                targetPos = 1;
            } else if (this._postState == 3) {
                targetPos = 2;
            } else {
                cc.assert(false);
            }
            if (pos.x <= this.posState2posX[targetPos]) {
                pos.x = this.posState2posX[targetPos];
                this._isCollSideMove = false;
                this._moveState = 0;
                this._postState -= 1;

                if (this.hasCollPName('ground')) {
                    this.playAnimName('run');
                } else {
                    // this.playAnimName('jump01');    
                }
            }

            this.playerNode.setPosition(pos);
        }

        this.checkAndHandleFly(dt);
    }

    private _curAnimName: string = null;
    private _curCarAniName: string = null;
    playAnimName(name) {
        let needReturn = false;
        
        if (!fcapp.gameMgr.isGameStarted) {
            needReturn = true;
            if( fcapp.gameMgr._guide ){
                needReturn = false;
            }
        }
        
        if (needReturn) {
            return true;
        }


        if (name == this._curAnimName) {
            // cc.log('playAnim name' + name + '  is playing');
            return;
        }

        if (this.curCar) {
            if (this._curAnimName != 'drive_car ') {
                this._curAnimName = 'drive_car';
                this.skin.animationComponent.play('drive_car');
            }

            if (['run', 'idle', 'turnLeft', 'turnRight'].indexOf(name) != -1 && this._curCarAniName != name) {
                this.curCar.getComponent(AnimationComponent).play(name);
            }
        } else if (this.isMotoEnable()) {
            if (name == 'slide') {
                this.skin.animationComponent.play('slide');
                this._curAnimName = 'slide';
            } else if (this._curAnimName != 'drive_motuo ') {
                this._curAnimName = 'drive_motuo';
                this.skin.animationComponent.play('drive_motuo');
            }

            if (name.match('jump')) {
                // name = 'jump01';
                if(name == 'jump03')
                {
                    name = 'jump02';
                }
            }
            // if( name.match('turn') ){
            //     name = 'run';
            // }
            if (['run', 'idle', 'turnLeft', 'jump01', 'slide', 'turnRight','jump02'].indexOf(name) != -1 && this._curCarAniName != name) {
                this.curMoto.getComponent(AnimationComponent).play(name);
            }
        } else {
            this._curAnimName = name;
            this.skin.animationComponent.play(name);
        }

        // let state = this.playerNode.getComponent( AnimationComponent ).getState( name );
        // cc.assert( state );
        // 1 normal 2 loop
        // state.wrapMode = ['slide'].indexOf( name ) == -1 ? 2 : 1;
    }

    playAniForce(name) {
        this.skin.animationComponent.play(name);
    }

    touchStart(event) {
        this.currentPos = event.getLocation();
        this._isPlayerAction = false;
        this.DirectionAngleInput(event);
        return true;
    }
    touchMove(event) {
        this.DirectionAngleInput(event);
        return true;
    }

    touchEnd(event) {
        this.DirectionAngleInput(event);
        this._isPlayerAction = false;
        return true;
    }

    touchCancel(event) {
        this.DirectionAngleInput(event);
        this._isPlayerAction = false;
        return true;
    }

    DirectionAngleInput(event) {
        if (!fcapp.gameMgr.isGameStarted) {
            if( !fcapp.gameMgr._guide ){
                return;
            }
        }
        if (this._isPlayerAction == true) {
            return;
        }
        var pos = event.getLocation();

        this.directInput = DirectionInput.Null;

        //右
        if ((this.currentPos.x - pos.x) < -100) {

            if (this.rightJump()) {
                this._isPlayerAction = true;
                this.currentPos = pos;
                this.directInput = DirectionInput.Right;
            }
        }
        //左
        else if ((this.currentPos.x - pos.x) > 100) {

            if (this.leftJump()) {
                this._isPlayerAction = true;
                this.currentPos = pos;
                this.directInput = DirectionInput.Left;
            }
        }
        //下
        else if ((this.currentPos.y - pos.y) > 100) {
            //this.currentPos = pos;
            if (this.jumpDown()) {
                this._isPlayerAction = true;
                this.currentPos = pos;
            }
        }
        //上
        else if ((this.currentPos.y - pos.y) < -100) {
            if (this.jump()) {
                this._isPlayerAction = true;
                this.currentPos = pos;
            }
        }


        //根据动作设置当前状态
        if (this.directInput == DirectionInput.Right) {
            if (this.positionStand == Position.Middle) {
                this.positionStand = Position.Right;
            } else if (this.positionStand == Position.Left) {
                this.positionStand = Position.Middle;
            }
            else if (this.positionStand == Position.Right) {
                this.positionStand = Position.Middle;
            }

        } else if (this.directInput == DirectionInput.Left) {

            if (this.positionStand == Position.Middle) {
                this.positionStand = Position.Left;
            } else if (this.positionStand == Position.Left) {
                this.positionStand = Position.Middle;
            }
            else if (this.positionStand == Position.Right) {
                this.positionStand = Position.Middle;
            }
        }

        this.directInput = DirectionInput.Null;
    }

    // 是否在地面行走
    isGround() {
        return this.hasCollPName('ground');
    }

    // 碰撞保持的碰撞体的属性名集合 是否包含指定name
    hasCollPName(name) {
        let ret = [];
        for (const k in this.collisionList) {
            const item = this.collisionList[k];
            if (item.indexOf(name) != -1) {
                ret.push(item);
            }
        }
        if (ret.length) {
            return ret;
        }
        return null;
    }

    addCollPName(event: ICollisionEvent, name: String, pname: String) {
        // console.log('coll event enter', event.otherCollider.node._id);
        cc.assert(!this.collisionList[event.otherCollider.node._id]);
        this.collisionList[event.otherCollider.node._id] = pname;
        if (CC_DEBUG) {
            this.any.nodeId = this.any.nodeId || {};
            this.any.nodeId[event.otherCollider.node._id] = {
                node: event.otherCollider.node,
                curPos: event.otherCollider.node.position.clone(),
                parentPos: event.otherCollider.node.parent.position.clone(),
            }
        }
    }
    rmCollPName(event: ICollisionEvent, name: String, pname: String) {
        // console.log('coll event exit', event.otherCollider.node._id);
        // cc.assert(this.collisionList[event.otherCollider.node._id]);
        delete this.collisionList[event.otherCollider.node._id];
    }

    checkCollSide(event: ICollisionEvent, name: String, pname: String) {
        if (this._isCollSideMove) {
            return false;
        }
        if (this._moveState == 0) {
            return;
        }

        let isCollSide = pname && pname.indexOf('side') != -1;
        if (!isCollSide) {
            return;
        }

        let offState = 0;
        if (this._moveState == 1) {
            offState = -1;
        } else {
            offState = 1;
        }
        // cc.log('coll side 1', this._postState, this._moveState);
        this._postState += offState;
        this._moveState = this._moveState == 1 ? 2 : 1;
        this._collSideForbidenInputTime = 1;
        this._isCollSideMove = true;
        // cc.log('coll side 2', this._postState, this._moveState);

        return true;
    }

    private _tempHasFly: boolean = false;// 临时用，第一次落到地面，开局飞天冲刺


    rightJump() {
        let needReturn = false;
        if (fcapp.gameMgr._guide) {
            if (fcapp.gameMgr._guide.any.step == 3
                ||fcapp.gameMgr._guide.any.step == 5) {
                    if( !fcapp.gameMgr.isGameStarted ){

                    }else{
                        needReturn = true;
                    }
            } else {
                needReturn = true;
            }
        }
        if (needReturn) {
            return true;
        }

        if (this._postState == 3 || this._moveState != 0 || this._collSideForbidenInputTime > 0)
            return false;

        if (this._roleState != 6) {
            this.playAnimName('turnRight');
        }
        this._moveState = 2;

        fcapp.audio.play(fcapp.audio.audio22);

        if( fcapp.gameMgr._guide ){
            fcapp.gameMgr._guide.stepComplete();
        }
        return true;
    }

    leftJump() {
        let needReturn = false;
        if (fcapp.gameMgr._guide) {
            if (fcapp.gameMgr._guide.any.step == 2) {
                if( !fcapp.gameMgr.isGameStarted ){

                }else{
                    needReturn = true;
                }
            } else {
                needReturn = true;
            }
        }
        if (needReturn) {
            return true;
        }
        if (this._postState == 1 || this._moveState != 0 || this._collSideForbidenInputTime > 0)
            return false;

        if (this._roleState != 6) {
            this.playAnimName('turnLeft');
        }
        this._moveState = 1;
        this._moveTime = 0;
        fcapp.audio.play(fcapp.audio.audio22);
        if( fcapp.gameMgr._guide ){
            fcapp.gameMgr._guide.stepComplete();
        }
        return true;
    }

    private jumpIdx: number = 0;
    jump() {
        let needReturn = false;
        if (fcapp.gameMgr._guide) {
            if (fcapp.gameMgr._guide.any.step == 0
                || fcapp.gameMgr._guide.any.step == 4) {
                    if( !fcapp.gameMgr.isGameStarted ){

                    }else{
                        needReturn = true;
                    }
            } else {
                needReturn = true;
            }
        }
        if (needReturn) {
            return true;
        }
        if (this.hasCar()) {
            return;
        }
        if (this._roleState == 6) {
            return;
        }
        if (this._roleState == 2 || this._collSideForbidenInputTime > 0)
            return false;

        const arrJumpAnimName = ['jump01', 'jump02', 'jump03'];
        const jumpAnimName = arrJumpAnimName[this.jumpIdx];
        this.jumpIdx = (1 + this.jumpIdx) % arrJumpAnimName.length;
        this.playerNode.getComponent(ConstantForce).force = new cc.Vec3(0, 0, 0);
        this.playerNode.getComponent(RigidBodyComponent).setLinearVelocity(new Vec3(0, 5, 0));
        this.playAnimName(jumpAnimName);
        this._roleState = 2;
        if( fcapp.gameMgr._guide ){
            fcapp.gameMgr._guide.stepComplete();
        }
        return true;
    }

    private _slideTime = 0;
    jumpDown() {

        let needReturn = false;
        if (fcapp.gameMgr._guide) {
            if (fcapp.gameMgr._guide.any.step == 1) {
                if( !fcapp.gameMgr.isGameStarted ){

                }else{
                    needReturn = true;
                }
            } else {
                needReturn = true;
            }
        }
        if (needReturn) {
            return true;
        }

        if (this.hasCar()) {
            return;
        }

        if (this._roleState == 6) {
            return;
        }

        if (this._moveState != 0 || this._collSideForbidenInputTime > 0) {
            return false;
        }

        if (this._roleState == 2) {
            this._jumpTime = 0;
            this._roleState = 3;

            this.playerNode.getComponent(RigidBodyComponent).setLinearVelocity(new Vec3(0, -10, 0));
        } else if (this._roleState == 1) {
            this.playAnimName('slide');
            this._slideTime = 0;
            this._roleState = 4;

            Vec3.copy(tv3, this.playerNode.getComponent(BoxColliderComponent).size);
            tv3.y = 0.5;
            this.playerNode.getComponent(BoxColliderComponent).size = tv3;

            Vec3.copy(tv3, this.playerNode.getComponent(BoxColliderComponent).center);
            tv3.y = 0.25;
            this.playerNode.getComponent(BoxColliderComponent).center = tv3;

        }
        if( fcapp.gameMgr._guide ){
            fcapp.gameMgr._guide.stepComplete();
        }
        return true;
    }

    GetAngle(form, to) {
        let nVector = new Vec3(0, 0, 0);
        nVector.x = to.x;
        nVector.y = form.y;
        let a = to.y - nVector.y;
        let b = nVector.x - form.x;
        let tan = a / b;
        return this.RadToDegree(Math.atan(tan));
    }

    RadToDegree(radius) {
        return (radius * 180) / Math.PI;
    }

    // 触发了碰撞开始而隐藏掉的障碍物,需要检查碰撞结束的事件，
    handleRemoveObstCheckCollList(ObstNode: Node) {
        // 刚体组件没被销毁就不会有问题  刚体组件enable true 就有后续碰撞，无论有没有parent
        return;
        if (this.collisionList[ObstNode._id]) {
            delete this.collisionList[ObstNode._id]
            cc.assert(!this.collisionList[ObstNode._id]);
        }
    }

    // 当障碍物隐藏时
    handleRemoveObst(ObstNode: Node) {
        this.handleRemoveObstCheckCollList(ObstNode);
    }

    //金币的数量
    private eatCoinNum: number = 0;
    addCoinNum(num: number) {
        this.eatCoinNum += num;
        fcapp.gameUI.coinNum = this.eatCoinNum;
    }

    // 获取金币
    getCoin() {
        return this.eatCoinNum;
    }

    getMeterOfRun() {
        return Math.floor(-1 * this.node.position.z);
    }

    private _hp: number = 0;
    public get hp() {
        return this._hp;
    }
    public set hp(val) {
        this._hp = val;
        fcapp.gameUI.hpNum = this._hp;
    }
    public addHp(hp: number) {
        this.hp += hp;
       
    }
    reduceHp(val: number) {
        if (!window.tttt) {
            this.hp -= val;
        }
    }

    private eatDiamondNum: number = 0;
    // 获取钻石
    getDiamonds() {
        return this.eatDiamondNum;
    }

    addDiamonds(val: number) {
        this.eatDiamondNum += val;
        fcapp.gameUI.eftAddDiamond(val);
        fcapp.gameUI.diamondNum = this.eatDiamondNum;
    }


    getSpeedZ() {
        let ret = playerAttr.speedZ;
        if (this.hasCar()) { // 汽车状态
            ret = playerAttr.speedCarZ;
            if (this.isAddSpeed()) { // 汽车吃了加速状态
                ret = playerAttr.speedCarAddZ;
            }
        } else if (this._roleState == 6) { // 飞天
            ret = playerAttr.speedAddZ;
        } else if (this.isMotoEnable()) { // 摩托车1.5倍
            ret = playerAttr.speedMotuoZ;
            if (this.isAddSpeed()) { // 摩托车吃了加速状态
                ret = playerAttr.speedMotuoAddZ;
            }
        }
        else if (this.isAddSpeed()) { // 加速道具1.5倍
            ret = playerAttr.speedAddZ;
        }

        if (window.tttt) { // 浏览器调试加速用的
            ret = window.tttt;
        }

        let addPercentByPosZ = 0; // 1000米 + 10%
        addPercentByPosZ = this.node.position.z;
        addPercentByPosZ = Math.floor(addPercentByPosZ / -1000);
        addPercentByPosZ *= 0.01 * 10;

        ret = ret * (1 + addPercentByPosZ);
        return ret;
    }


    /************************************************* */

    /* class member could be defined like this */
    // dummy = '';
    /*
    "ground 能行走的面":
    [
        "plane 平面，如 车顶，桥面",
        "up 上升斜面 如桥面"，
        "down 下降斜面 如桥面"，
    ]
    "item 障碍物（金币除外，金币不走碰撞）"
    */
    public ItemName2Property = {
        'bridge_up': ['bridge', 'ground', 'up'],
        'bridge_plane': ['bridge', 'ground', 'plane'],
        'brideg_down': ['bridge', 'ground', 'down'],
        'ground_plane': ['', 'ground', 'plane'],

        'chengshi-ground_plane': ['', 'ground', 'plane'],
        'xuedi_ground_plane': ['', 'ground', 'plane'],
        'sd_ground_plane': ['', 'ground', 'plane'],
        'sl_ground_plane': ['', 'ground', 'plane'],

        'Coin': ['Coin', 'item'],
        'shidun': ['shidun', 'item'],
        'xiemian_up': ['xiemian', 'ground', 'up'],
        'side_left': ['side', 'left'],
        'side_right': ['side', 'right'],
        'item': ['item'],
        'coin_pass': ['coin_pass']
    };

    /************************************* */
    //碰撞开始
    onCollisionEnter(event: ICollisionEvent) {
        var name = event.otherCollider.node.name;
        var pname = this.ItemName2Property[name];
        this.addCollPName(event, name, pname);
        this.checkCollSide(event, name, pname);
        if (pname && pname.indexOf('ground') != -1) {
            if (this._roleState != 1 && this._roleState != 4) { // 两块地面拼接处会触发新地面的进入
                this._roleState = 1;
                this._jumpTime = 0;
                this.playAnimName('run');
            }
            if (this._roleState == 1 && this._curAnimName != 'run') {
                this.playAnimName('run');
            }
            if (!this._tempHasFly && fcapp.gameMgr.isGameStarted) {
                this._tempHasFly = true;
            }
        }

        if (!this.isDead && !this.isInvincible() && this.hasCollPName('item')) {
            if (this.curMoto) {
                this.hp += 1;
                this.onExitMoto();
            }
            this.onCollReduceHp();
        }
    }

    //碰撞保持
    onCollisionStay(event: ICollisionEvent) {
        var name = event.otherCollider.node.name;
        var pname = this.ItemName2Property[name];
        if (pname && pname.indexOf('ground') != -1) {
            let rigidBody = this.playerNode.getComponent(RigidBodyComponent);
            let lv = new Vec3();
            rigidBody.getLinearVelocity(lv);
            lv.y = 0;
            rigidBody.setLinearVelocity(lv);
        }
    }

    //碰撞退出
    onCollisionExit(event: ICollisionEvent) {
        var name = event.otherCollider.node.name;
        var pname = this.ItemName2Property[name];

        if (fcapp.gameMgr._loadOver != true)
            return;
        this.rmCollPName(event, name, pname);
        if (!this.hasCollPName('ground')) {
            this.playerNode.getComponent(ConstantForce).force = new cc.Vec3(0, 0, 0);

            if (this._roleState == 1) {
                this.playAnimName('jump01');
                this._roleState = 5;
            }
        }
    }
    /************************************* */

    private onTriggerEnter(event: ITriggerEvent) {
        let node = event.otherCollider.node;
        let name = node.name;
        if (name == 'prop') {
            // console.log('on trigger enter', node._id, node.parent._id, node.parent.name, this.node.position.z );
            // this.any.triggerNodeId = this.any.triggerNodeId || {};
            // this.any.triggerNodeId[ node._id ] = node;
            // fcapp.gameMgr.onEatProp(node);
        }
    }

    private onTriggerStay(event: ITriggerEvent) {
    }

    private onTriggerExit(event: ITriggerEvent) {
        let node = event.otherCollider.node;
        let name = node.name;
        if (name == 'prop') {
            // if( !this.any.triggerNodeId[ node._id ] ){
            //     fcapp.gameMgr.onEatProp( node );
            // }else{
            //     delete this.any.triggerNodeId[ node._id ];
            // }
            // console.log('on trigger exit', node._id, node.parent._id, node.parent.name, this.node.position.z );
        }
    }
}
