import { _decorator, Component, Node,SkinningModelComponent
    ,AnimationComponent } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerSkin")
export class PlayerSkin extends Component {
    @property( SkinningModelComponent ) 
    skinningModel: SkinningModelComponent = null;
    
    @property( AnimationComponent ) 
    animationComponent: AnimationComponent = null;
}
