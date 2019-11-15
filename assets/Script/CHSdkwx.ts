import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

var url_query_order_log = 'https://game.lyqhw.cn/api/query_order_log';
var url_check = 'https://game.lyqhw.cn/api/check';
var url_encode = 'https://game.lyqhw.cn/api/encode';

var createBannerCfg = function ( y, width ){
    const {
        windowWidth,
        windowHeight,
    } = window.wx.getSystemInfoSync();

    var showy = windowHeight / 1136 * y;
    width = windowWidth || 320;
    console.log(y,showy,windowHeight,(width / 16 * 5.6));
    showy = showy < (width / 16 * 5.6) ? (width / 16 * 5.6) : showy;
    var ret = {
        left: (windowWidth - width) / 2,
        width: width,
        top: windowHeight - showy,
    }
    console.log(  ret );
    return ret;
}
@ccclass("CHSdkwx")
export class CHSdkwx extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    private appid = "wx8735f9b390c59cfd";
    private appsecret ="c30a0c65b3b5b64ef7fff9bd9e649add";
    private appAccountId= 0;
    private session = 0;
    private inited = 0;
    private cpUserInfo = 0;
    private  chName = '微信';
    private chId = 563;

    start () {
        // Your initialization goes here.
    }
    initSdk ( delegate ) {
        // this.log = app.util.createLog( '[WXSdk] ', true );
        this.delegate = delegate;
        this.doLogin();
        this.initAd();
    }


    initAd(){
        if( !window.wx ) {
            return;
        }
        if( !wx || !wx.createRewardedVideoAd ){
            return;
        }
        var adVideoUnitId = 'adunit-e6b5e8cadbd7f9cd';
        this.videoAd = wx.createRewardedVideoAd({adUnitId: adVideoUnitId});
        this.videoAd.onError(function(){
            // this.log('onError', arguments);
        }.bind( this ));

    }

    doLogin () {
        // this.log( 'call doLogin', !!window.wx);
        var next = this.delegate.onInitFinish.bind( this.delegate );
        if( !window.wx ) {
            next( false );
            return;
        }
        var self = this;
        window.wx.login({
            success (res) {
                console.log(`login调用成功`,res);
                
                var url = 'https://game.lyqhw.cn/njs/wx_login_sfm?' +
                        'appid=' + self.appid +
                        '&appsecret=' + self.appsecret +
                        '&js_code=' + res.code ;
                    var xhr = cc.loader.getXMLHttpRequest();
                    xhr.timeout = 1000;
                    // self.log("url:"+url);
                    url = encodeURI( url );
                    xhr.open("GET",url, true);

                    xhr.onreadystatechange = function () {

                        var response = xhr.responseText;

                        // self.log("url返回:readyState="+ xhr.readyState +";status="+xhr.status+";response="+response);
                        if (xhr.readyState == 4)
                        {
                            if (response && response.length > 1)
                            {
                                console.log( typeof response );
                                console.log( JSON.parse( response ) );
                                response = JSON.parse( response );
                                self.appAccountId = response.openid || response.anonymous_openid;
                                var opts = {};
                                opts.appAccountId = self.appAccountId;
                                next( true, opts );
                            }
                        }
                    };

                    xhr.send();


            },
            fail (res) {
                next( false );
                console.log(`login调用失败`);
            }
        });

    }

    adVideo ( nextSuccess, nextFailed, nextShowed, nextError ){
        
        if( !window.wx || !this.videoAd ){
            nextError();
            fcapp.logItem.log( '广告接入失败' );
            return;
        }

        var self = this;
        this.videoAd.show()
        .then(() => {
            nextShowed();
        })
        .catch(err => {
            nextError();
        });

        var self = this;
        var closeCallf = function( res ){
            if (res.isEnded) {
                nextSuccess( 0 );
            }else{
                nextFailed( -1 );
            }
            self.videoAd.offClose(closeCallf)
        };

        this.videoAd.onClose( closeCallf );

        var errorCallf = function(){
            nextError();
            this.videoAd.offError(errorCallf);
            console.log('wx video on error');
        }.bind( this );
        this.videoAd.onError(errorCallf);
    }

    canHideVideoSpr () {
        return false;
    }

    share () {
        if( !window.wx ){
            return;
        }
        var shareImgCfg = [
            {
                title:'超人强和你一起勇闯外太空...',
                imageUrlId:'kbv_sDTESjWBKF3DfEiRpA',
                imageUrl:'https://mmocgame.qpic.cn/wechatgame/oXqAiaQvFtIkuDwlQLT24Sfm2XgGQGYn5QGibPgoCRf6T9TGbM04icPnaY0KusyNGWI/0'
            },
            {
                title:'猪猪侠-超级五灵战士速速归队...',
                imageUrlId:'MS0npyuPRni3AoRd-IDAvw',
                imageUrl:'https://mmocgame.qpic.cn/wechatgame/oXqAiaQvFtImBlSJK20D2mB2U5KhXHY3x3yBd51WPN3nlhjGwXalsvibhvmSP6I0HZ/0'
            },
        ];
        var maxLen = 2;

        var num = fcapp.util.random( 0, maxLen);
        num = num >= 2 ? 1 : num;
        var useRet = shareImgCfg[num ];
        window.wx.mtShareAppMessage({
            title:useRet.title,
            imageUrlId:useRet.imageUrlId,
            imageUrl:useRet.imageUrl,
            query:'Inviter='+this.appid 
        });

        return true;
    }

    promotion( opt, next ){
        console.log('CHSdk-wx.promotion()' );
        if( !window.wx ){
            return;
        }

          window.wx.navigateToMiniProgram({
            appId: opt.appId ||  opt.appid,
            path: opt.path,
            extraData: {},
            envVersion: 'release',
            success(res) {
                window.wx.mtJumpMiniProgramEvent();
                console.log('wx.navigateToMiniProgram success', opt, fcapp.chsdk.appAccountId );
                next && next( true );
            },
            fail () {
                console.log('wx.navigateToMiniProgram fail', arguments );
                next && next( false );
            },
            complete () {
                console.log('wx.navigateToMiniProgram complete', arguments );
            }
          });

          window.wx.mtShowJumpMiniProgramEvent({
              toapp: opt.appId, //目标小程序的 appid
              position_id:opt.id,//icon获取的path参数中截取mt_position_id的值
              link_id:opt.path,//icon获取的path参数中截取mt_link_id的值
            });
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
