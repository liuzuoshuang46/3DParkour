import {
    _decorator, Component, ICollisionEvent, ITriggerEvent, ColliderComponent, ParticleSystemComponent,
    BoxColliderComponent, Node, Prefab, NodePool, Vec3, instantiate, AnimationComponent, PhysicsSystem, director
} from "cc";
const { ccclass, property } = _decorator;

import { PlayerController } from "./PlayerController"
import { Item } from "./Item"
import { ResList } from "./ResList"
import { GameGroundPlaneComponent } from "./GameGroundPlaneComponent"
import { rotateForever } from "./Components/rotateForever"


export enum ECoderKeepId {
    OBS_NEXT = 1000001, // 下一关碰撞体
    OBS_COIN_PASS, // 金币关碰撞体
    EFT_EAT_COIN, // 特效 吃金币
    EFT_BG_PROP, // 特效 道具背景光
    EFT_CHE_WEI_YAN, // 特效 车尾焰
    EFT_HU_DUN, // 特效 护盾
    EFT_ROLE_JIA_SU, // 特效 角色加速
    EFT_SCREEN_LIGHT, // 特效 全屏的光效

    EFT_CITY_1, //城市装饰1
    EFT_CITY_2, //城市装饰2
    EFT_CITY_3, //城市装饰3
    EFT_CITY_4, //城市装饰4
    EFT_CITY_5, //城市装饰5
    EFT_SNOWFIELD_1, //雪地装饰1
    EFT_SNOWFIELD_2, //雪地装饰2
    EFT_SNOWFIELD_3, //雪地装饰3
    EFT_SNOWFIELD_4, //雪地装饰4
    EFT_SNOWFIELD_5, //雪地装饰5
    EFT_FOREST_1, //草地装饰1
    EFT_FOREST_2, //草地装饰2
    EFT_SAIDAO_1, //赛道装饰1
    EFT_SAIDAO_2 //赛道装饰2
}
@ccclass("GameMageController")
export class GameMageController extends Component {

    //地面根节点
    @property({ type: Node })
    public groundRoot: Node = null;

    @property({ type: ResList })
    resList: ResList = null;
    @property({ type: Node })
    resListRoot = null;

    //玩家根节点
    @property({ type: Node })
    public playerRoot: Node = null;

    //地面预制体
    @property({ type: [Prefab] })
    public groundPrefabList = [];

    //下一关预制体
    @property({ type: Prefab })
    public nextTransform = null;

    private _play: PlayerController = null;

    private _ground = cc.v3(0, 0, 0); // 脚下有一块初始地面长度10，
    private _groundList = new Array();

    //装饰根节点
    @property({ type: Node })
    public decorateRoot: Node = null;
    private _groundId = 0;//场景id 1008森林 2013城市 雪地
    private _proGroundId = 0;//上次场景id 1008森林 2013城市 雪地
    private _decorate = cc.v3(0, 0, 0);//道路两边的装饰最远端
    private _decorateLeftList = new Array();
    private _decorateRightList = new Array();
    private _intoCoinJs = 0;//进入金币关的次数
    private _loadOver = false;//

    //开局道具id
    private readyPropId = -1;//

    //初始地面
    @property({ type: [Node] })
    public initGroundList = [];
    onLoad() {
        fcapp.gameMgr = this;
    }

    startCountDown() {
        this._play.startCountDown();
    }

    loadRoleRes(next) {
        let roleId = fcapp.data.selectHero;
        if (fcapp.getAny('tryRoleId')) {
            roleId = fcapp.getAny('tryRoleId');
        }
        let id2Name = [
            'RedPig_skin',
            'feifei_skin',
            'CRQ_skin',
            'GreenPig_skin',
            'BluePig_skin'
        ];

        let id2CarName = [
            'RedPig_car_skin',
            'feifei_car_skin',
            'CRQ_car_skin',
            'GreenPig_car_skin',
            'BluePig_car_skin'
        ];
        // loadRes<T>(url: string, type: Constructor<T>, completeCallback: LoadCompleteCallback<T>): any;
        cc.loader.loadRes('role/' + id2Name[roleId], Prefab, (err, asset: Prefab) => {
            if (err) {
                console.error(err);
            }
            this.resList.registePrefab(asset);
            cc.loader.loadRes('car/' + id2CarName[roleId], Prefab, (err, asset: Prefab) => {
                if (err) {
                    console.error(err);
                }
                this.resList.registePrefab(asset);
                next();
            });
        });
    }

    init() {
        cc.log("GameMageController->onLoad");
        (<any>this.node.parent.getChildByName('Canvas').getComponent('GameUI')).init();

        // 禁用刚体自动休眠，否则复活界面卡着的时候会自动休眠，接不到碰撞结束的回调
        PhysicsSystem.instance.allowSleep = false;

        this.initData();

        fcapp.audio.player.stop();
        cc.log("GameMageController->onLoad.over");

        this.initNodePool();
        fcapp.gameMgr.initPlayer();
        
        this.checkGuide();
        this.createInitGround();
        for (var i = 0; i < 3; i++) {
            this.createNextGround();
        }

        this.initGroundList[0].active = true;
        let tests = this.initGroundList[0].getComponentsInChildren(ColliderComponent);
        for (var j = 0; j < tests.length; j++) {
            tests[j].setGroup(4);//1000
            tests[j].setMask(2);//0010

            console.log("groundControllerGroup", tests[j].getGroup());
            console.log("groundControllerMask", tests[j].getMask());
        }

        this.scheduleOnce(this.gameMgrStart.bind(this));
    }

    gameMgrStart () {
        fcapp.gameUI.onGameMgrStart();
    }

    checkGuide() {
        if( !fcapp.data.guideComplete ){
            let node = this.resList.newPrefabByName('guide');
            node.parent = this.node.parent.getChildByName('Canvas');
            this._guide = node.getComponent('GUIGuide');

            this.arrMapDataNormal.unshift( fcapp.json.allPassData[10000], fcapp.json.allPassData[10001] );
        }
    }

    initPlayer() {
        let roleId = fcapp.data.selectHero;
        if (fcapp.getAny('tryRoleId')) {
            roleId = fcapp.getAny('tryRoleId');
            fcapp.setAny('tryRoleId', null);
        }
        this._play = this.playerRoot.getComponent(PlayerController);
        this._play.initWithId(roleId);
    }

    private nodePoolParent: Node = null;
    private objPool: { [key: string]: Object } = null;
    initNodePool() {
        cc.assert(!this.objPool);
        this.objPool = {};

        /**
         * 
         
        1001: "shu-1", // 障碍物-树1
        1002: "brideg-1", // 障碍物-桥1
        1003: "zhang_ai_wu",// 障碍物-地面路障
        1004: "shu-2",// 障碍物-树2
        1005: "shitou-2",// 障碍物-石头2
        1006: "shitou-1",// 障碍物-石头1
        1007: "brideg-2",// 障碍物-桥2
        1008: "ground_plane",// 正常地面
        1009: "正常跑道",// 地面的装饰物

        1000: "Coin", // 道具-金币
        10001:"hudun", // 道具-能量防御盾 	
        10002:"fly", // 道具-飞天
        10003:"jiaxue", // 道具-生命+1	    
        10004:"xitieshi", // 道具-万能磁铁	
        10010:"zuanshi", // 道具-钻石id  
        10011:"jiasu", // 道具-人加速  
        10000:"jiasu_saiche", // 道具-车加速  

         */
        let obstacleId2Num: any =
        {
            1001: 0,
            1002: 0,
            1003: 0,
            1004: 0,
            1005: 0,
            1006: 0,
            1007: 0,
            1008: 1,

            2000: 0,
            2001: 0,
            2002: 0,
            2003: 0,
            2004: 0,
            2005: 0,
            2006: 0,
            2007: 0,
            2008: 0,
            2009: 0,
            2010: 0,
            2011: 0,
            2012: 0,
            2013: 1,

            3000: 1,

            4000: 1,

            5000: 1,

            1000: 40,
            10001: 10,
            10002: 10,
            10003: 10,
            10004: 10,
            10010: 10,
            10011: 10,
            10000: 10,
        }

        // 程序自定义保留id ECoderKeepId 1000000起
        obstacleId2Num[ECoderKeepId.OBS_NEXT] = 10;
        obstacleId2Num[ECoderKeepId.OBS_COIN_PASS] = 2;
        obstacleId2Num[ECoderKeepId.EFT_EAT_COIN] = 10;
        obstacleId2Num[ECoderKeepId.EFT_BG_PROP] = 10;
        obstacleId2Num[ECoderKeepId.EFT_CHE_WEI_YAN] = 10;
        obstacleId2Num[ECoderKeepId.EFT_HU_DUN] = 10;
        obstacleId2Num[ECoderKeepId.EFT_ROLE_JIA_SU] = 1;
        obstacleId2Num[ECoderKeepId.EFT_SCREEN_LIGHT] = 1;

        obstacleId2Num[ECoderKeepId.EFT_CITY_1] = 0;
        obstacleId2Num[ECoderKeepId.EFT_CITY_2] = 0;
        obstacleId2Num[ECoderKeepId.EFT_CITY_3] = 0;
        obstacleId2Num[ECoderKeepId.EFT_CITY_4] = 0;
        obstacleId2Num[ECoderKeepId.EFT_CITY_5] = 0;
        obstacleId2Num[ECoderKeepId.EFT_SNOWFIELD_1] = 0;
        obstacleId2Num[ECoderKeepId.EFT_SNOWFIELD_2] = 0;
        obstacleId2Num[ECoderKeepId.EFT_SNOWFIELD_3] = 0;
        obstacleId2Num[ECoderKeepId.EFT_SNOWFIELD_4] = 0;
        obstacleId2Num[ECoderKeepId.EFT_SNOWFIELD_5] = 0;
        obstacleId2Num[ECoderKeepId.EFT_FOREST_1] = 0;
        obstacleId2Num[ECoderKeepId.EFT_FOREST_2] = 0;
        obstacleId2Num[ECoderKeepId.EFT_SAIDAO_1] = 0;
        obstacleId2Num[ECoderKeepId.EFT_SAIDAO_2] = 0;

        for (var k in obstacleId2Num) {
            let ObstacleId = k;
            this.objPool[ObstacleId] = {
                arr:[],
                get() {
                    cc.assert( this.arr.length );
                    return this.arr.pop();
                },

                put ( node ) {
                    node.parent = null;
                    this.arr.push( node );
                },

                size () {
                    return this.arr.length;
                },
            }
        }

        this.any.createdNodeIds = [];
        for (var k in obstacleId2Num) {
            let ObstacleId = k;
            let num = obstacleId2Num[ObstacleId];
            for (var i = 0; i < num; i++) {
                let Obstacle: Node = this.resList.newObstacleById(ObstacleId);

                cc.assert(this.any.createdNodeIds.indexOf(Obstacle._id) == -1);
                this.any.createdNodeIds.push(Obstacle._id);
                this.objPool[ObstacleId].put(Obstacle);
            }
        }
    }

    any: any = {};
    getObstacleFromPool(ObstacleId) {
        cc.assert(this.objPool[ObstacleId]);
        if (!this.objPool[ObstacleId].size()) {
            let Obstacle: Node = this.resList.newObstacleById(ObstacleId);

            cc.assert(this.any.createdNodeIds.indexOf(Obstacle._id) == -1);
            this.any.createdNodeIds.push(Obstacle._id);
            this.objPool[ObstacleId].put(Obstacle);
        }
        let ret = this.objPool[ObstacleId].get();
        return ret;
    }

    getEffectFromPool(eid) {
        cc.assert(this.objPool[eid]);
        if (!this.objPool[eid].size()) {
            let Obstacle: Node = this.resList.newObstacleById(eid);

            cc.assert(this.any.createdNodeIds.indexOf(Obstacle._id) == -1);
            this.any.createdNodeIds.push(Obstacle._id);
            this.objPool[eid].put(Obstacle);
        }
        let ret = this.objPool[eid].get();
        return ret;
    }

    putObstacleToPool(ObstacleId, node) {
        this.objPool[ObstacleId].put(node);
    }

    // putGroundNodeToPool(node) {
    //     this.objPool[1008].put(node);
    // }

    initData() {
        this.getMapDataByGameProgress();
    }

    private isGameStarted: boolean = false;
    startGame() {
        this.isGameStarted = true;
        this._play.startGame();
        fcapp.datasdk.onEvent("进入关卡");



        //角色特性
        if (this._play.roleId == 1) {
            this._play.doFly();
        }
        else if (this._play.roleId == 2) {
            this._play.onEatProp_hudun();
        }
        else if (this._play.roleId == 3) {
            this._play.addHp(1);
            fcapp.gameUI.eftAddHp();
        }
        else if (this._play.roleId == 4) {
            fcapp.gameUI.eftCoinDouble();
        }
        
        //开局道具
        if (this.readyPropId != -1) {
            if (this.readyPropId == 0) {
                this._play.doFly();
            }
            else if (this.readyPropId == 1) {
                fcapp.gameUI.eftCoinDouble();
            }
            else if (this.readyPropId == 2) {
                this._play.addHp(1);
                fcapp.gameUI.eftAddHp();
            }
            else if (this.readyPropId == 3) {
                this._play.doAddSpeed();
            }
            else {
                this._play.onEatProp_hudun();
            }

            this._play.addCoinNum( 500 );

            let bb = {
                0: '飞行道具',
                1: '金币双倍',
                2: '加血',
                3: '开局加速',
                4: '无敌护盾'
            };
            fcapp.datasdk.onEvent(bb[this.readyPropId]);

        }
        // this._play.doFly();
    }

    endGame() {
        this.isGameStarted = false;
        this._play.dead();
        fcapp.gameUI.showGameOver();
    }

    revival() {
        this.isGameStarted = true;
        this.clearObstaclesFront();
        this._play.revival();
    }

    onPlayerReduceHp() {
        if (this._play.hp <= 0) {
            this.endGame();
        } else {
            this.clearObstaclesFront();
        }
    }

    clearObstaclesFront() {
        fcapp.gameUI.playWhite();
        let arrObst = this.getObstZLessThanPlayer(10);
        arrObst.forEach((obst: Node) => {
            let ObstacleId = String(obst.getComponent(Item).itemId);
            if (this.itemIdIsProp(ObstacleId) || ECoderKeepId[ObstacleId]) {

            } else {
                this.doRemoveObst(obst);
            }
        })
    }

    itemIdIsProp(itemId) {
        // 1000: "Coin", // 道具-金币
        // 10001:"hudun", // 道具-能量防御盾 	
        // 10003:"jiaxue", // 道具-生命+1	    
        // 10004:"xitieshi", // 道具-万能磁铁	
        // 10010:"zuanshi", // 道具-钻石id  
        // 10011:"jiasu", // 道具-人加速  
        // 10000:"jiasu_saiche", // 道具-车加速

        return [
            1000,
            10001,
            10002,
            10003,
            10004,
            10010,
            10011,
            10000
        ].indexOf(itemId) != -1;
    }

    // 单个删除障碍物
    doRemoveObst(obst: Node) {
        let itemId = obst.getComponent(Item).itemId;
        this._play.handleRemoveObst(obst);
        obst.getComponent(Item).removeFromGround();
        this.putObstacleToPool(itemId, obst);
    }

    // 单个删除障碍物 地面整个销毁时，删除地面上所有的建筑物，这时候不调用obst.getComponent( Item ).removeFromGround();
    doRemoveObstOnGroundDestory(obst: Node) {
        let itemId = obst.getComponent(Item).itemId;
        this._play.handleRemoveObst(obst);
        this.putObstacleToPool(itemId, obst);
    }

    private arrItemFlyToPlayer: any = null;
    addItemFlyToPlayer(node) {
        if (!this.arrItemFlyToPlayer) {
            this.arrItemFlyToPlayer = {};
        }
        cc.assert()
    }

    /**
     * 获取z坐标比角色坐标z小 lessz 的障碍物， z越小，在地图中越远
     * @param lessz z坐标差值
     */
    getObstZLessThanPlayer(lessz) {
        let curGround: Node = null, nextGround: Node = null, curGroundIndex = -1;

        let playerZ = this._play.node.getPosition().z;
        this._groundList.some((groundNode: Node, index: number) => {
            let groundZ = groundNode.getPosition().z;
            if (Math.abs(playerZ - groundZ) <= 5) {
                curGround = groundNode;
                curGroundIndex = index;
                return true;
            }
            return false;
        })

        nextGround = this._groundList[curGroundIndex + 1];
        cc.assert(curGround && nextGround);

        let curGroundZ = curGround.getPosition().z;
        let curPlayerZInGround = playerZ - curGroundZ;// 角色在当前踩着的地面上的相对坐标 5->-5 负轴是移动正方向

        let curGroundStartZ = Math.min(curPlayerZInGround + 5, 5); // 获取到的障碍物的起始z坐标 身后也清楚5所以+5;
        let curGroundEndZ = curPlayerZInGround - lessz; // 获取到的障碍物的结束Z坐标
        let nextGroundEndZ = 0; // 下一块地图 结束坐标， 起始坐标0
        if (curGroundEndZ < -5) {
            nextGroundEndZ = -5 - curGroundEndZ;
            curGroundEndZ = -5;
        }

        let ret = [];
        let curGroundArrObst = curGround.getComponent(GameGroundPlaneComponent).getArrObstacle();
        let nextGroundArrObst = nextGround.getComponent(GameGroundPlaneComponent).getArrObstacle();

        for (var k in curGroundArrObst) {
            let item = curGroundArrObst[k];
            item.forEach((obst: Node) => {
                cc.assert(obst.getComponent(Item));
                let obstZ = obst.getPosition().z;
                if (obstZ <= curGroundStartZ && obstZ >= curGroundEndZ) {
                    ret.push(obst);
                }
            })
        }

        if (nextGroundEndZ != 0) {
            for (var k in nextGroundArrObst) {
                let item = nextGroundArrObst[k];
                item.forEach((obst: Node) => {
                    cc.assert(obst.getComponent(Item));
                    let obstZ = obst.getPosition().z;
                    if (obstZ >= nextGroundEndZ) {
                        ret.push(obst);
                    }
                })
            }
        }

        return ret;
    }

    private enterBurrowNum: number = 0; // 进入过地道的次数

    private arrMapData: any = {};
    private arrMapDataCoin: any = {}; // 金币关
    private arrMapDataNormal: any = {}; // 正常关卡
    /**
     * 游戏的不同阶段，使用不同难度的地图数据
     */
    getMapDataByGameProgress() {
        let difficulty = Math.min(2, Math.floor(this.createdMapSumNum / 3));

        this.enterBurrowNum = this.curCoinPassIndex;
        this.arrMapDataNormal = fcapp.json.getMapDataNormal(difficulty, this.enterBurrowNum);
        this.arrMapDataCoin = fcapp.json.getMapDataCoin(difficulty, this.enterBurrowNum);

        this.arrMapData = this.arrMapDataNormal;
    }

    checkGroundShouldEnabled() {
        let playerZ = this._play.node.getPosition().z;
        this._groundList.forEach((groundNode: Node, index: number) => {
            let groundZ = groundNode.getPosition().z;
            let groundCmt = groundNode.getComponent(GameGroundPlaneComponent);
            if (Math.abs(playerZ - groundZ) <= 5) { // 当前踩到的地面
                groundCmt.setChildsColliderEnable(true);
            } else {
                groundCmt.setChildsColliderEnable(true);
            }
        })
    }

    //角色移动和 定时创建地面
    update(deltaTime: number) {
        if (this._loadOver != true)
            return;
        this._play.setupdate(deltaTime);
        if( this._guide ){
            this._guide.stepUpdate( deltaTime );
        }
        this.checkGroundShouldEnabled();

        // 每帧update时再删除物理时间中触发的删除物体，否则物理引擎的上下文会崩溃
        if (this.todoRemoveObstacles.length) {
            this.todoRemoveObstacles.forEach((node: Node) => {
                node.active = false;
                // this.doRemoveObst(node);
            })
            this.todoRemoveObstacles = [];
        }
        if (this.needCreateGround) {
            this.needCreateGround = false;
            this.createNextGround();
            this.removeGround();
        }
    }

    allNext(call) {
        let ret = [];
        this._groundList.forEach((node: Node) => {
            let cmt: GameGroundPlaneComponent = node.getComponent(GameGroundPlaneComponent);
            let arr = cmt.getArrObstacle();
            cc.assert(arr);
            if (arr[ECoderKeepId.OBS_NEXT]) {
                ret.push(arr[ECoderKeepId.OBS_NEXT][0]);
            }
        })
        if (call) {
            ret.forEach(i => {
                call(i);
            })
        }
        return ret;
    }

    private needCreateGround: boolean = false;
    private todoRemoveObstacles: any = [];



    /************************************************* */
    //创建地面

    removeGround() {
        let playerZ = this._play.node.getPosition().z;
        for (var i = this._groundList.length - 1; i >= 0; i--) {
            let ground = this._groundList[i];
            let groundZ = ground.getPosition().z;

            if (groundZ + 5 < playerZ) { // 角色还没踩到的地面起点不删除
                continue;
            }

            if (groundZ - 5 - 2 < playerZ) { // 角色刚离开地面2以内不删除
                continue;
            }

            ground.getComponent(GameGroundPlaneComponent).removeAll();
            this._groundList.splice(i, 1);
        }
    }

    mapIsCoinPass() {
        return this.arrMapData == this.arrMapDataCoin;
    }

    private currentMapIndex: number = 0; // 地图数据是地图块的数组，标记当前出到哪个下标了
    private createdMapSumNum: number = 0; // 创建过的地图总数
    private curCoinPassIndex: number = 0; //每 200 400 800 米创建一次金币关
    //创建地面
    createNextGround() {
        let needCreateCoinCollider = false; // 创建金币关出入口的碰撞体
        let mapData = this.arrMapData[this.currentMapIndex];

        this.currentMapIndex = this.currentMapIndex + 1;
        ++this.createdMapSumNum;


        //每 200 400 800 米创建一次金币关
        // let coniPassItemZArr = [300,400,500,600];
        let coniPassItemZArr = [300, 300 + 500, 300 + 500 + 700, 300 + 500 + 700 + 800];
        // let coinPassItemZ = Math.pow(2, this.curCoinPassIndex + 1) * 100;
        let coinPassItemZ = coniPassItemZArr[Math.min(this.curCoinPassIndex, coniPassItemZArr.length - 1)];
        let passedMapZ = this._ground.z;
        if (passedMapZ <= -1 * coinPassItemZ - this.curCoinPassIndex * this.arrMapDataCoin.length * 4 * 10) {
            console.log('create enter coin pass item', passedMapZ);
            needCreateCoinCollider = true; // 满足z坐标，创建进入金币关障碍物
            this.curCoinPassIndex++;
        }

        if (this.mapIsCoinPass() && this.currentMapIndex >= this.arrMapData.length) {
            console.log('create exut coin pass item', passedMapZ);
            needCreateCoinCollider = true; // 金币关结束，创建离开金币关障碍物
        }

        if (needCreateCoinCollider) {
            if (!this.mapIsCoinPass()) {
                this.enterCoinPass(); // 把后面的地图数据改成金币关
            } else {
                this.exitCoinPass();
            }
        }

        if (this.currentMapIndex >= this.arrMapData.length) {
            console.log('getMapDataByGameProgress all used', this.currentMapIndex, this.arrMapData.length);
            this.currentMapIndex = 0;
            this.getMapDataByGameProgress();
        }

        this._proGroundId = this._groundId;

        for (let i = 0; i < 4; i++) {
            //地面
            let len = 8;
            let indx1 = (i) * len + 0;
            let id = Number(mapData[indx1].mapId);// 299;//
            if (id < 100)//草地
            {
                id = 1008;
            }
            else if (id < 200)//城市
            {
                id = 2013
            }
            else if (id < 300)//雪地
            {
                id = 3000
            }
            else if (id < 400)//森林
            {
                id = 4000;
            }
            else if (id < 1100)//雪地
            {
                id = 5000
            }else{
                id = 2013;
            }
            this._groundId = id;
            let ground: Node = this.getObstacleFromPool(id);
            ground.getComponent(GameGroundPlaneComponent).init(id);
            ground.setPosition(this._ground);

            let nodeSize = ground.getComponent(BoxColliderComponent).size;
            this._ground.z -= nodeSize.z;
            ground.parent = this.groundRoot;
            this._groundList.push(ground);

            let tests = ground.getComponentsInChildren(ColliderComponent);
            for (var j = 0; j < tests.length; j++) {
                tests[j].setGroup(4);//1000
                tests[j].setMask(2);//0010
            }

            //创建新的道路两边装饰
            if (this._decorate.z > this._ground.z) {
                let id: number = ECoderKeepId.EFT_CITY_1;
                var value = -4.871;
                if (Number(this._groundId) == 1008)//草地
                {
                    id = fcapp.util.random(ECoderKeepId.EFT_FOREST_1, ECoderKeepId.EFT_FOREST_2);
                    value = -3;
                }
                else if (Number(this._groundId) == 2013)//城市
                {
                    id = fcapp.util.random(ECoderKeepId.EFT_CITY_1, ECoderKeepId.EFT_CITY_5);
                    value = -4;
                }
                else if (Number(this._groundId) == 3000)//雪地
                {
                    id = fcapp.util.random(ECoderKeepId.EFT_SNOWFIELD_1, ECoderKeepId.EFT_SNOWFIELD_5);
                    value = -3;
                }
                else if (Number(this._groundId) == 4000)//森林
                {
                    id = fcapp.util.random(ECoderKeepId.EFT_FOREST_1, ECoderKeepId.EFT_FOREST_2);
                    value = -3;
                }
                else if (Number(this._groundId) == 5000)//赛道
                {
                    id = fcapp.util.random(ECoderKeepId.EFT_SAIDAO_1, ECoderKeepId.EFT_SAIDAO_2);
                    value = -4;
                }


                let leftDecorate: Node = this.getEffectFromPool(id);
                leftDecorate.setPosition(new Vec3(value, 0, this._decorate.z));
                leftDecorate._objFlags = id;
                leftDecorate.eulerAngles = new Vec3(0, 0, 0);
                let decorateSize = leftDecorate.getChildByName("New Node").getComponent(BoxColliderComponent).size;
                leftDecorate.parent = this.decorateRoot;
                this._decorateLeftList.push(leftDecorate);

                let rightDecorate: Node = this.getEffectFromPool(id);
                rightDecorate._objFlags = id;
                rightDecorate.setPosition(new Vec3(Math.abs(value), 0, this._decorate.z));
                rightDecorate.eulerAngles = new Vec3(0, 180, 0);
                rightDecorate.parent = this.decorateRoot;
                this._decorateRightList.push(rightDecorate);


                this._decorate.z -= decorateSize.z;
            }



            //fps 增加3(19-20)
            for (let k = 0; k < len; k++) {

                //查找地图数据
                let ObstacleId = '';
                let ObstaclePost = new Vec3(0, 0, 0);
                let value = 0;
                let indx = (i) * len + k;
                ObstacleId = mapData[indx].item_left;
                value = ObstacleId ? Number(ObstacleId) : 0;

                if (value != 0) {
                    ObstaclePost.x = -1.6
                    ObstaclePost.z = nodeSize.z / 2 - nodeSize.z / len * k;
                    this.addObstacle(ground, value, ObstaclePost);
                }

                ObstacleId = mapData[indx].item_subleft;
                value = ObstacleId ? Number(ObstacleId) : 0;
                if (value != 0) {
                    ObstaclePost.x = -0.8
                    ObstaclePost.z = nodeSize.z / 2 - nodeSize.z / len * k;
                    this.addObstacle(ground, value, ObstaclePost);
                }

                ObstacleId = mapData[indx].item_Middle;
                value = ObstacleId ? Number(ObstacleId) : 0;
                if (value != 0) {
                    ObstaclePost.x = 0
                    ObstaclePost.z = nodeSize.z / 2 - nodeSize.z / len * k;
                    this.addObstacle(ground, value, ObstaclePost);
                }

                ObstacleId = mapData[indx].item_subRight;
                value = ObstacleId ? Number(ObstacleId) : 0;
                if (value != 0) {
                    ObstaclePost.x = 0.8
                    ObstaclePost.z = nodeSize.z / 2 - nodeSize.z / len * k;
                    this.addObstacle(ground, value, ObstaclePost);
                }

                ObstacleId = mapData[indx].item_Right;
                value = ObstacleId ? Number(ObstacleId) : 0;
                if (value != 0) {
                    ObstaclePost.x = 1.6
                    ObstaclePost.z = nodeSize.z / 2 - nodeSize.z / len * k;
                    this.addObstacle(ground, value, ObstaclePost);
                }

            }

            //障碍-金币
            for (let k = 0; k < len; k++) {
                let ObstaclePost = new Vec3(0, 0, 0);
                let names = [
                    "obstacle_left",
                    "obstacle_subleft",
                    "obstacle_Middle",
                    "obstacle_subRight",
                    "obstacle_Right",

                    "sky_left",
                    "sky_subleft",
                    "sky_Middle",
                    "sky_subRight",
                    "sky_Right"
                ];
                names.forEach(name => {
                    let indx = (i) * len + k;
                    let ObstacleId = mapData[indx][name];
                    let value = ObstacleId ? Number(ObstacleId) : 0;
                    if (value > 0) {
                        let x = 0; i
                        if (name.match('subleft')) {
                            x = -0.8
                        } else if (name.match('left')) {
                            x = -1.6
                        } else if (name.match('Middle')) {
                            x = 0
                        } else if (name.match('subRight')) {
                            x = 0.8
                        } else if (name.match('Right')) {
                            x = 1.6
                        } else {
                            cc.assert(0, 'coin x error' + name);
                        }
                        ObstaclePost.x = x
                        ObstaclePost.z = nodeSize.z / 2 - nodeSize.z / len * k;
                        ObstaclePost.y = value
                        if( name.match('sky') ){
                            this.addObstacleSky(ground, 1000, ObstaclePost);
                        }else{
                            this.addObstacle(ground, 1000, ObstaclePost);
                        }
                    }
                })
            }

            if (i == 3) {
                this.addNextTransform(ground);
            }

            ground.getComponent(GameGroundPlaneComponent).setChildsColliderEnable(false);
        }

        if (needCreateCoinCollider) {
            this.addCoinPassObsItem(this._groundList[this._groundList.length - 1]);
        }

        //移除老的
        if (this._play) {
            let playerZ = this._play.node.getPosition().z;
            for (var i = 0; i < this._decorateLeftList.length; i++) {
                var m = this._decorateLeftList[i];
                let nodeSize = m.getChildByName("New Node").getComponent(BoxColliderComponent).size;
                let posZ = m.getPosition().z;
                if ((posZ - nodeSize.z / 2) - playerZ > 30) {
                    this.putObstacleToPool(m._objFlags, m);
                }
            }
            for (var i = 0; i < this._decorateRightList.length; i++) {
                var m = this._decorateRightList[i];
                let nodeSize = m.getChildByName("New Node").getComponent(BoxColliderComponent).size;
                let posZ = m.getPosition().z;
                if ((posZ - nodeSize.z / 2) - playerZ > 30) {
                    this.putObstacleToPool(m._objFlags, m);
                }
            }
        }
    }

    //创建刚开始角色脚下的地面
    createInitGround() {
        let mapData = this.arrMapData[this.currentMapIndex];
        let id = Number(mapData[0].mapId);

        if (id < 100)//草地
        {
            id = 1008;
        }
        else if (id < 200)//城市
        {
            id = 2013
        }
        else if (id < 300)//雪地
        {
            id = 3000
        }
        else if (id < 400)//森林
        {
            id = 4000;
        }
        else if (id < 1100)//雪地
        {
            id = 5000
        }else{
            id = 2013;
        }
        let ground: Node = this.getObstacleFromPool(id);
        ground.getComponent(GameGroundPlaneComponent).init(id);
        ground.setPosition(this._ground);

        let nodeSize = ground.getComponent(BoxColliderComponent).size;
        this._ground.z -= nodeSize.z;
        ground.parent = this.groundRoot;
        this._groundList.push(ground);

        cc.find('Ground/ground_plane', this.node).children.forEach( node => node.active = false );
    }

    addCoinPassObsItem(ground: Node) {
        let nodeSize = ground.getComponent(BoxColliderComponent).size;

        let node: Node = this.getObstacleFromPool(ECoderKeepId.OBS_COIN_PASS);
        let postZ = -(nodeSize.z / 2);
        node.setPosition(new Vec3(0, 0, postZ));
        ground.getComponent(GameGroundPlaneComponent).addObstacle(ECoderKeepId.OBS_COIN_PASS, node);

        // var tests = node.getComponentsInChildren(ColliderComponent);
        // for(var i=0;i<tests.length;i++) 
        // {
        //     tests[i].setGroup(4);//1000
        //     tests[i].setMask(2);//0010
        // }
    }

    //创建下一关的碰撞体
    addNextTransform(ground: Node) {
        let nodeSize = ground.getComponent(cc.BoxColliderComponent).size;

        let node: Node = this.getObstacleFromPool(ECoderKeepId.OBS_NEXT);
        let postZ = -(nodeSize.z / 2);
        node.setPosition(new Vec3(0, 0, postZ));
        ground.getComponent(GameGroundPlaneComponent).addObstacle(ECoderKeepId.OBS_NEXT, node);


        // var tests = node.getComponentsInChildren(ColliderComponent);
        // for(var i=0;i<tests.length;i++) 
        // {
        //     tests[i].setGroup(4);//1000
        //     tests[i].setMask(2);//0010
        // }
    }

    //创建障碍物（//金币 路障 公共汽车  上坡）
    addObstacle(ground: Node, ObstacleId: Number, ObstaclePost: Vec3) {
        if (ObstacleId == 10004
            || ObstacleId == -1)
            return;
        let Obstacle: Node = this.getObstacleFromPool(ObstacleId);
        Obstacle.setPosition(ObstaclePost);
        Obstacle.isSky = false;
        ground.getComponent(GameGroundPlaneComponent).addObstacle(ObstacleId, Obstacle);
        let rotateCmt = Obstacle.getComponent(rotateForever);
        if (rotateCmt) {
            rotateCmt.setDelayTime(fcapp.util.random(10) * 0.2);
        }
    }

    addObstacleSky(ground: Node, ObstacleId: Number, ObstaclePost: Vec3) {
        if (ObstacleId == 10004
            || ObstacleId == -1)
            return;
        let Obstacle: Node = this.getObstacleFromPool(ObstacleId);
        Obstacle.setPosition(ObstaclePost);
        Obstacle.isSky = true;
        ground.getComponent(GameGroundPlaneComponent).addObstacle(ObstacleId, Obstacle);
        let rotateCmt = Obstacle.getComponent(rotateForever);
        if (rotateCmt) {
            rotateCmt.setDelayTime(fcapp.util.random(10) * 0.2);
        }
    }

    onPlayerFlyShowSkyCoins() {
        let playerZ = this._play.node.getPosition().z;
        this._groundList.forEach((groundNode: Node, index: number) => {
            let groundZ = groundNode.getPosition().z;
            if( groundZ - playerZ <= -5 ){
                groundNode.getComponent( GameGroundPlaneComponent ).showSkyCoins( true );
            }
        })
    }

    onPlayerFlyHideSkyCoins() {
        let playerZ = this._play.node.getPosition().z;
        this._groundList.forEach((groundNode: Node, index: number) => {
            let groundZ = groundNode.getPosition().z;
            if( groundZ - playerZ <= -5 ){
                groundNode.getComponent( GameGroundPlaneComponent ).showSkyCoins( false );
            }
        })
    }

    // 设置下一块要创建的地面位金币关
    enterCoinPass() {
        this.arrMapData = this.arrMapDataCoin;
        this.any.oldNormalMapIndex = this.currentMapIndex;

        // 金币关之后切换场景，JsonMgr返回的是数组 长度20，前10一个场景 后10 一个场景
        if (this.any.oldNormalMapIndex <= 9) {
            this.arrMapData = this.arrMapDataCoin;
            this.any.oldNormalMapIndex = 10;
        } else {
            this.getMapDataByGameProgress();
            this.arrMapData = this.arrMapDataCoin;
            this.any.oldNormalMapIndex = 0;
        }
        this.currentMapIndex = 0;
    }

    // 地图数据从金币关换成普通关卡
    exitCoinPass() {
        this.arrMapData = this.arrMapDataNormal;
        this.currentMapIndex = this.any.oldNormalMapIndex;
    }

    removeAllGround() {
        let playerZ = this._play.node.getPosition().z;
        for (var i = this._groundList.length - 1; i >= 0; i--) {
            let ground = this._groundList[i];
            let groundZ = ground.getPosition().z;

            if (groundZ + 5 < playerZ) { // 角色还没踩到的地面全删掉
                ground.getComponent(GameGroundPlaneComponent).removeAll();
            } else {
                ground.getComponent(GameGroundPlaneComponent).removeAllObstacles(); // 踩到过的清除障碍物
            }
        }
    }

    onEatProp(propNode: Node) {
        let name = propNode.parent.name;
        
        console.log('碰撞名字',name);
        if (name == "next") {
            this.onEatPropNext(propNode);
        } else if (name == "Coin") {
            this.onEatPropCoin(propNode);
        } else if (name == "hudun") {
            this.onEatProp_hudun(propNode);
        } else if (name == "jiaxue") {
            this.onEatProp_jiaxue(propNode);
        } else if (name == "xitieshi") {
            this.onEatProp_xitieshi(propNode);
        } else if (name == "zuanshi") {
            this.onEatProp_zuanshi(propNode);
        } else if (name == "jiasu") {
            this.onEatProp_jiasu(propNode);
        } else if (name == "jiasu_saiche") {
            this.onEatProp_jiasu_saiche(propNode);
        } else if (name == "coin_pass") {
            this.onEatProp_coin_pass(propNode);
        } else if (name == "fly") {
            this.onEatProp_fly(propNode);
        }
    }

    onEatProp_coin_pass(node: Node) {
        this.onCollCoinPassObs();
        // this.todoRemoveObstacles.push(node.parent) // 父节点是根节点
        node.parent.active = false;
    }

    onEatProp_fly(node: Node) {
        this._play.doFly();
        this.todoRemoveObstacles.push(node.parent) // 父节点是根节点
    }

    onCollCoinPassObs() {
        fcapp.gameUI.playWhite();
        if (this._play.hasCar()) {
            this._play.onExitCoinPass();
        } else {
            this._play.onEnterCoinPass();
        }
    }

    onEatPropCoin(node: Node) {
        this._play.playEffectEatCoin();
        this._play.addCoinNum(1);
        fcapp.audio.play(fcapp.audio.audio8);
        this.todoRemoveObstacles.push(node.parent) // 父节点是根节点
    }

    onEatPropNext(node: Node) {
        this.needCreateGround = true;
        this.todoRemoveObstacles.push(node.parent) // 父节点是根节点
    }

    onEatProp_hudun(node: Node) {
        this._play.onEatProp_hudun();
        this.todoRemoveObstacles.push(node.parent);
    }
    onEatProp_jiaxue(node: Node) {
        this._play.addHp(1);
        fcapp.gameUI.eftAddHp();
        this.todoRemoveObstacles.push(node.parent);
    }
    onEatProp_xitieshi(node: Node) {
        this.todoRemoveObstacles.push(node.parent);
        this._play.onPropXitieshi();
    }
    onEatProp_zuanshi(node: Node) {
        this._play.addDiamonds(1);
        this.todoRemoveObstacles.push(node.parent);
    }
    onEatProp_jiasu(node: Node) {
        this.todoRemoveObstacles.push(node.parent);
        this._play.doAddSpeed();
    }
    onEatProp_jiasu_saiche(node: Node) {
        this.todoRemoveObstacles.push(node.parent);
        this._play.doAddCarSpeed();
    }

    showEffectScreenLight() {
        fcapp.gameUI.showEffectScreenLight();
    }

    hideEffectScreenLight() {
        fcapp.gameUI.hideEffectScreenLight();
    }

    //暂停
    callbackSuspendBtn() {
        if (this.isGameStarted == false)
            return;
        this.isGameStarted = false;
        fcapp.gameUI.showSuspend(function () {
            // this.isGameStarted = true;
            fcapp.gameUI.hideSuspend();
            fcapp.gameUI.startCountDown1();
        }.bind(this));
    }

    pauseAndCallVideoMoto() {
        if (this.isGameStarted == false)
            return;
        this.isGameStarted = false;
        fcapp.gameUI.showPopVideoMoto(function () {
            this.isGameStarted = true;
        }.bind(this));
    }

    pause() {
        this.isGameStarted = false;
    }

    resume() {
        this.isGameStarted = true;
    }
}