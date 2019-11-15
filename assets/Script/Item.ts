import { _decorator, Component, Node} from "cc";
const { ccclass, property } = _decorator;

import { GameGroundPlaneComponent } from "./GameGroundPlaneComponent"

@ccclass("Item")
export class Item extends Component {
    private _itemId: number = -1;

    set itemId( itemId ){
        this._itemId = itemId;
    }

    get itemId () {
        return this._itemId;
    }

    removeFromGround () {
        cc.assert( this.node.parent );
        cc.assert( this.node.parent.getComponent( GameGroundPlaneComponent ) );
        let ground: GameGroundPlaneComponent = this.node.parent.getComponent( GameGroundPlaneComponent );
        ground.rmObstacle( this.node );
    }
}
