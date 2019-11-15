import { _decorator, Component, Node, game } from "cc";
import { ekey } from "./DataController"
const { ccclass, property } = _decorator;

export enum EEvent {
    LocalVal
}

const event_pre = 'fcEvent.type.';

@ccclass("fcEvent")
export class fcEvent extends Component {

    /**
     * 监听事件挂载的节点
     */
    get target ():typeof game {
        if( !this.node ){
            this.node = new cc.Node();
        }
        return this.node;
    }

    /**
     * 往cc.game上注册事件监听回调， 关闭回调off时参数需完全一致
     * @param type 事件ID 用fcapp.eevent.*
     * @param callback 回调函数
     * @param target 可选参数，有的话target会替换callback中的this
     */
    on ( type: EEvent, callback: Function, target?: object ) {
        this.target.on( event_pre + type, callback, target ); 
    }

    /**
     * 只有type 没有后面的参数，会关闭所有同事件的监听函数(不论是通过什么节点注册来的))
     * @param type 事件ID 用fcapp.eevent.*
     * @param callback 回调函数
     * @param target 可选参数
     */
    off ( type: EEvent, callback: Function, target?: object ) {
        this.target.off( event_pre + type, callback, target ); 
    }

    /**
     * 发送事件 
     * @param type 事件ID  
     * @param args 任意长度的参数 例如 1,2,3 对应 回调函数参数(p1,p2,p3)
     */
    emit ( type: EEvent, ...args: any[] ){
        this.target.emit( event_pre + type, ...args );
    }

}
