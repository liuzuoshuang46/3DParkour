import { _decorator, Component, Node, ColliderComponent } from "cc";
const { ccclass, property } = _decorator;
import { Item } from "./Item"
var tv3 = cc.v3();

@ccclass("GameGroundPlaneComponent")
export class GameGroundPlaneComponent extends Component {

    private arrObstacle: any = null;

    private gid: any = null;
    init(gid) {
        this.gid = gid;
        cc.assert(!this.arrObstacle);
        this.arrObstacle = {};
    }

    addObstacle(ObstacleId, ObstacleNode) {
        cc.assert(cc.isValid(this.node));
        ObstacleNode.parent = this.node;
        
        ObstacleNode.active = true;
        if( ObstacleNode.isSky ){
            tv3.set( ObstacleNode.position );
            tv3.y = fcapp.gameMgr._play.isFlying() ? 5 : 200;
            ObstacleNode.position = tv3;
        }

        let comt: Item = ObstacleNode.getComponent(Item);
        if (!comt) {
            comt = ObstacleNode.addComponent(Item);
        }
        comt.itemId = ObstacleId;

        if (!this.arrObstacle[ObstacleId]) {
            this.arrObstacle[ObstacleId] = [];
        }
        this.arrObstacle[ObstacleId].push(ObstacleNode);

        let tests = ObstacleNode.getComponentsInChildren(ColliderComponent);
        for (var j = 0; j < tests.length; j++) {
            tests[j].setGroup(4);//1000
            tests[j].setMask(2);//0010
        }
    }
    getProp()
    {
        var arrProp = new Array();
        if(this.arrObstacle[1000])
        {
            for(let i=0;i<this.arrObstacle[1000].length;i++)
            {
                var node = this.arrObstacle[1000][i];
                if(node.parent != null)
                {
                    let tests = node.getChildByName("prop").getComponentsInChildren(ColliderComponent);
                    arrProp.push(tests);
                }
                
            }
        }
        if(this.arrObstacle[1000001])
        {
            for(let i=0;i<this.arrObstacle[1000001].length;i++)
            {
                var node = this.arrObstacle[1000001][i];
                let tests = node.getChildByName("prop").getComponentsInChildren(ColliderComponent);
                arrProp.push(tests);
            }
        }
        if(this.arrObstacle[1000002])
        {
            for(let i=0;i<this.arrObstacle[1000002].length;i++)
            {
                var node = this.arrObstacle[1000002][i];
                let tests = node.getChildByName("prop").getComponentsInChildren(ColliderComponent);
                arrProp.push(tests);
            }
        }
        for(let i=0;i<12;i++)
        {
            let value = 10000 + i;
            if(this.arrObstacle[value])
            {
                for(let j=0;j<this.arrObstacle[value].length;j++)
                {
                    var node = this.arrObstacle[value][j];
                    let tests = node.getChildByName("prop").getComponentsInChildren(ColliderComponent);
                    arrProp.push(tests);
                }
            }
        }
        
        return arrProp;
        
    }
    rmObstacle(ObstacleNode) {
        let comt: Item = ObstacleNode.getComponent(Item);
        cc.assert(comt);
        fcapp.util.removeFrom(ObstacleNode, this.arrObstacle[comt.itemId]);
    }

    getArrObstacle() {
        return this.arrObstacle;
    }

    removeAll() {
        for (const ObstacleId in this.arrObstacle) {
            let arrObst = this.arrObstacle[ObstacleId];
            arrObst.forEach((obst: Node) => {
                let item = obst.getComponent(Item);
                if (item && (
                    item.itemId == 1000001 ||
                    item.itemId == 1000002
                )) {
                    obst.parent = null;
                } else {
                    fcapp.gameMgr.doRemoveObstOnGroundDestory(obst);
                }
            })
        }
        delete this.arrObstacle;
        fcapp.gameMgr.putObstacleToPool(this.gid, this.node);
    }

    removeAllObstacles() {
        for (const ObstacleId in this.arrObstacle) {
            let arrObst = this.arrObstacle[ObstacleId];
            arrObst.forEach((obst: Node) => {
                fcapp.gameMgr.doRemoveObstOnGroundDestory(obst);
            })
        }
        this.arrObstacle = {};
    }

    private isChildsColliderEnable: boolean = null;
    setChildsColliderEnable(isEnable: boolean) {
        if (this.isChildsColliderEnable == isEnable) {
            return;
        }
        this.isChildsColliderEnable = isEnable;
        let colls = this.node.getComponentsInChildren(ColliderComponent);
        colls.forEach((coll: ColliderComponent) => {
            if (!coll.node.name.match('ground_plane')) {
                coll.enabled = isEnable
            }
        });
    }

    showSkyCoins(show) {
        this.arrObstacle[1000].forEach( coinNode => {
            if( coinNode.isSky ){
                tv3.set( coinNode.position );
                tv3.y = show ? 5 : 200;
                coinNode.position = tv3;
            }
        })
    }
}
