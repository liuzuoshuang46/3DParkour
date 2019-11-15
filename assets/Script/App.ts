import { _decorator, Component, Node,log, js,DEBUG } from "cc";
import { JsonMgr } from "./JsonMgr";
import { fcData } from "./DataController";
import { fcUtil } from "./fcUtil";
import { GameMageController } from "./GameMageController";
import { GameUI } from "./GameUI";
import { fcEvent,EEvent } from "./fcEvent"
import { LogItem } from "./LogItem"
import { AudioMgr } from "./AudioMgr"
import { LockView } from "./LockView"
import { CHSdk } from "./CHSdk"


const { ccclass, property } = _decorator;

@ccclass("App")
export class App{
    json:JsonMgr = null;
    data:fcData = null;
    util: fcUtil = null;
    gameMgr: GameMageController = null;
    gameUI: GameUI = null;
    event: fcEvent = null;
    eevent: any = null;
    logItem: LogItem = null;
    audio: AudioMgr = null;
    lockView: LockView = null;
    chsdk: CHSdk = null;

    sidebarList_home = null;
    sidebarList_end = null;
    
    initLoadingScene ( data: fcData ) {
        this.data = new fcData();
        this.util = new fcUtil();
        this.event = new fcEvent();
        this.chsdk = new CHSdk();
        this.eevent = EEvent;
        this.chsdk.init();
        this.data.init();
        this.util.init();
    }

    private hasInitMainScene: boolean = false;
    initMainScene (node) 
    {
        let nodeCanvas = node.getChildByName('Canvas');
        var json = nodeCanvas.getChildByName('json').getComponent( JsonMgr );
        var audio = nodeCanvas.getChildByName('audio').getComponent( AudioMgr );
        var log = nodeCanvas.getChildByName('log').getComponent( LogItem );
        var lockView = nodeCanvas.getChildByName('lockView').getComponent( LockView );
        var datasdk = nodeCanvas.getChildByName('datasdk').getComponent( "datasdk" );

        this.hasInitMainScene = true;
        this.json = json;
        this.audio = audio;
        this.logItem = log;
        this.lockView = lockView;
        this.datasdk = datasdk;
        

        this.lockView.node.active = false;
        this.json.init();

        this.hbswitch = false;
        this.gameid = window.gameid;
        this.version = window.version;
        this.qudaoId = window.qudaoId;
        this.hbswitch = window.hbswitch;
    }
    
    // 全局变量 临时存储数值  往这里挂，
    private _any: any = {};
    setAny ( key, val ) {
        log('change any item ',key,' current: ', this._any[ key ], ' to: ', val );
        this._any[ key ] = val; 
    }

    getAny ( key ) {
        log( 'get any item', key, this._any[ key ] );
        return this._any[ key ];
    }

    logStr( str ){
        this.logItem.log( str );
    }
}
