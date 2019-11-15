import { _decorator, Component, Node ,game} from "cc";
const { ccclass, property } = _decorator;
import {CHSdkwx} from "./CHSdkwx";
@ccclass("CHSdk")
export class CHSdk extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    init () {

        this._chsdk = new CHSdkwx();
        this.appid = this._chsdk.appid;
        this.initSdk();
        this.initSystemEvent();
    }

    
    callAdVideo (  next, retryWithShare /* = true */ ) {
        if( CC_DEBUG ){
            fcapp.logItem.log('调试模式直接领取奖励');
            next( true );
            return;
        }


        if( retryWithShare === undefined ){
            retryWithShare = true;
        }

        var self = this;
        var onSuccess = function(code){
            console.log('切回游戏' );
            next( true );
            fcapp.data.setTaskNum(8,1);
            self.adShow = false;
            fcapp.audio.resumePlayLoop();
        };

        var onFailed = function(code){
            console.log('切回游戏' );
            next( false );
            self.adShow = false;
            fcapp.audio.resumePlayLoop();
        }

        var onShowed = function(){
            // cc.audioEngine.pauseMusic();
            self.adShow = true;
        }

        var onError = function() {
            fcapp.chsdk.share( function( ret ){
                console.log('切回游戏' );
                if( ret ){
                    next( true );
                }else{
                    next( false );
                }
            } );
            // next( false );
            // self.adShow = false;
        }

        this._chsdk.adVideo( onSuccess, onFailed, onShowed, onError );
    }

    initSdk () {
        this._chsdk.initSdk( this );
    }

    onInitFinish ( init, opts ) {
        init = !!init;
        this.inited = init;
        if( !init ){
            return;
        }

        console.log( 'chsdk init finish', init, opts );

        this.appAccountId = opts.appAccountId;
        this.session = opts.session;
        this.cpUserInfo = opts.cpUserInfo;
        this.username = opts.username;
        this.username = opts.username;

        // this.requestOrder();

        this._afterInitCallf = this._afterInitCallf || [];
        for( var i in this._afterInitCallf ){
            this._afterInitCallf[i]();
        }
        this._afterInitCallf = [];
    }

    afterInit ( next ) {

        if( this.inited ){
            next();
            return;
        }
        this._afterInitCallf = this._afterInitCallf || [];
        this._afterInitCallf.push( next );
    }

    share ( callfunc ) {
        if( CC_DEBUG ){
            callfunc( true );
            fcapp.logItem.log('调试模式分享奖励');
        };
        if( !this._chsdk.share ){
            return false;
        }
        if( this._shareOpenTime ){
            return false;
        }
        if( this._chsdk.share() ){
            this._shareCallf = callfunc;
            this._shareDT = this._shareDT || 3000; // 毫秒
            this._shareOpenTime = Date.now();
        }else{
            return false;
        }
    }

    canHideVideoSpr () {
        if( this._chsdk.canHideVideoSpr && this._chsdk.canHideVideoSpr() ){
            return true;
        }
        return false;
    }

    initSystemEvent() {
        var onGameShow = function(){
            console.log('切回游戏' );
            if( this._shareOpenTime ){
                var off = Date.now() - this._shareOpenTime;
                this._shareCallf( off >= this._shareDT );

                this._shareOpenTime = false;
                delete this._shareCallf;
            }

           
        }
        
        game.on(cc.Game.EVENT_HIDE, function(event){
            console.log('切出游戏' );
            if( fcapp.gameMgr && fcapp.gameMgr.isGameStarted)
            {
                fcapp.gameMgr.callbackSuspendBtn();
            }
        });
        game.on(cc.Game.EVENT_SHOW, onGameShow, this );
    }

    promotion( opt, next ){
        console.log('CHSdk.promotion()' );
        if( CC_DEBUG ){
            fcapp.logItem.log('调试模式直接领取奖励');
            next( true );
            return;
        }
        if( this._chsdk.promotion ){
            this._chsdk.promotion( opt, next );
        }else{
            next( false );
        }
    }
}
