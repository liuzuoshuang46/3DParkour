import { _decorator, Component, Node, tweenUtil,ButtonComponent } from "cc";
const { ccclass, property } = _decorator;
var createBannerCfg = function (yPercent) {
    if (!window.wx) {
        return;
    }
    const {
        windowWidth,
        windowHeight,
    } = window.wx.getSystemInfoSync();

    // banner的 高 / 宽
    var h_w_percent = 144 / 414;
    var bannerHeight = windowWidth * h_w_percent;

    var ret = {
        left: 0,
        width: windowWidth,
        top: (windowHeight - bannerHeight) * (1 - yPercent),
    }
    bannerlog('createBannerCfg', windowWidth, windowHeight, h_w_percent, bannerHeight, (windowHeight - bannerHeight) * yPercent + bannerHeight);
    return ret;
}


var bannerlog = function (...args) { console.log(...args); };
var creator = function (obj) {
    if (!window.wx) {
        return null;
    }
    if (!obj.bid) {
        console.error('bid error');
        return null;
    }

    let cfg = createBannerCfg(obj.yPercent);
    var createCfg = {
        adUnitId: obj.bid,
        style: cfg
    };

    let bannerAd = window.wx.createBannerAd(createCfg);

    obj.loaded = true;
    obj.inst = bannerAd;
    let oe = function (err) {
        bannerlog('onCreateBannerError', err);
        bannerAd.offError(oe);
        window.bannerMgr.onCreateBannerError(obj.name);
    };
    bannerAd.onError(oe);

    bannerlog('creator', bannerAd);
    return bannerAd;
};

@ccclass("bannerMgr")
export class bannerMgr extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start() {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    init(opt) {
        console.log('bannerMgrInit');
        this.initData(opt);
        setInterval(() => {
            this.check();
            this.checkClearErrorNumDt -= this.checkDt;
            if (this.checkClearErrorNumDt <= 0) {
                this.checkClearErrorNumDt = this.clearErrorNumDt;
                this.clearErrorNum();
            }
        }, this.checkDt * 1000);
    }
    clearErrorNum() {
        for (var k in this.banners) {
            this.banners[k].errorNum = 0;
        }
    }

    initData(opt) {
        this.checkDt = opt.checkDt || 0.1; // 几秒检查一次
        this.clearErrorNumDt = opt.clearErrorNumDt || 10; // 几秒把错误次数清零
        this.errorNumMax = opt.errorNumMax || 5;
        this.bids = opt.bids;

        if (!opt.openLog) {
            bannerlog = function () { };
        }

        this.banners = {
            top: {
                errorNum: 0,
                yPercent: 1,
                name: 'top',
                canUseNum: 5,
            },
            bottom: {
                errorNum: 0,
                yPercent: 0,
                canUseNum: 1,
                name: 'bottom'
            },
            // middle:{
            //     errorNum:0,
            //     yPercent: 0,
            //     canUseNum: 1,
            //     name:'middle'
            // },
        };
        this.checkClearErrorNumDt = this.clearErrorNumDt;
    }

    check() {
        if (!window.wx) {
            return;
        }
        for (var i in this.banners) {
            if (!this.banners[i].loaded && this.banners[i].errorNum < this.errorNumMax) {
                bannerlog('bannerMgr check', i, this.banners[i].errorNum);
                this.createBannerIndex(i);
                break;
            }
        }
    }

    createBannerIndex(index) {
        if (!window.wx) {
            return;
        }
        let obj = this.banners[index];
        if (obj.inst) {
            obj.inst.destroy();
        }
        bannerlog('bannerMgr createBannerIndex index', index);
        obj.bid = this.bids[parseInt(Math.random() * this.bids.length)];
        creator(obj);
    }

    rmBanner(inst) {
        if (!window.wx) {
            return;
        }
        let index = -1;
        for (var k in this.banners) {
            let item = this.banners[k];
            if (item.inst == inst) {
                index = k;
            }
        }

        if (index === -1) {
            bannerlog('rmBanner error inst not found');
            return;
        }

        let obj = this.banners[index];
        if (obj.usedNum == undefined) {
            obj.usedNum = obj.canUseNum;;
        }
        obj.usedNum -= 1;

        bannerlog('bannerMgr rmBanner index', index, obj);
        if (obj.usedNum <= 0) {
            obj.usedNum = obj.canUseNum;
            obj.inst.destroy();
            this.createBannerIndex(index);
        } else {
            obj.inst.hide();
        }

        this.offBannerClick();
    }

    show(opt) {
        if (!window.wx) {
            return;
        }
        bannerlog('bannerMgr show', opt);
        if (opt.bannerId == 'middle') {
            opt.bannerId = 'bottom';
        }
        // app.datasdk.requestBannerShow();
        let obj = this.banners[opt.bannerId];
        if (!obj) {
            bannerlog('banner unable', opt, this.banners);
            if (opt) {
                opt.onCatch('banner all unable');
            }
            return;
        };

        bannerlog('bannerMgr show', obj);
        let inst = obj.inst;
        inst.show()
            .then(() => {
                // app.datasdk.requestBannerShowSuccess();
                bannerlog('bannerMgr show then');
                // wx.mtBannerShowEvent();
                if (opt) {
                    opt.onShow && opt.onShow();
                }
            })
            .catch((err) => {
                bannerlog('bannerMgr show catch ');
                if (err) {
                    bannerlog('banner.show.catch', err);
                }
                if (opt) {
                    opt.onCatch && opt.onCatch(err);
                }
                this.onShowBannerError(opt.bannerId);
            });
        return inst;
    }

    onShowBannerError(bannerId) {
        bannerlog('bannerMgr onShowBannerError');
        this.banners[bannerId].errorNum++;
        this.banners[bannerId].loaded = false;
    }

    onCreateBannerError(bannerId) {
        bannerlog('bannerMgr onCreateBannerError');
        this.banners[bannerId].errorNum++;
        this.banners[bannerId].loaded = false;
    }

    // 出banner 的时候，banner延时，领取按钮位置放到banner的位置，到时见后banner出现，领取按钮回到原位置
    showBannerWithDelayAndOffy(opt) {
        // console.log( '延时展示', app.hbswitch.bannerDelay,window.openBanner );
        if (fcapp.hbswitch.bannerDelay && window.openBanner) {

            var btnComponent = null;
            if (opt.nodeBtn) {
                btnComponent = opt.nodeBtn.getComponent(ButtonComponent);

                opt.nodeBtn.position.y -= opt.offy;
                console.log('***************',opt.nodeBtn.position);

                if (btnComponent) {
                    btnComponent.enabled = false;
                }
               
            }
           
            let temp = {};
            tweenUtil(temp)
                .to(1.5, { time: temp.stopIdx }, { easing: 'Cubic-Out' }) // 转10圈*8个 = 80个
                .call(() => {
                    var call = this.showBottomBanner();
                    opt.callBack(call);
                })
                .to(0.5, { time: temp.stopIdx }, { easing: 'Cubic-Out' }) // 转10圈*8个 = 80个
                .call(() => {
                    opt.callBackMove();
                })
                .start()
        }
        else {
            var call = this.showBottomBanner();
            opt.callBack(call);
        }

    }
    showBottomBanner() {
        return this.show({
            bannerId: 'bottom',
            onShow: () => {

            },
            onCatch: () => {

            }
        });
    }
    onBannerClick(next) {
        if (!window.wx) {
            return;
        }
        this._bannerClickCallf = next;
        var onHide = options => {
            console.log('wx.onHide', options);
            wx.offHide(onHide);

            // showingBannerId 是一个变量，记录游戏中最后展示的banner的id
            // 用于触发banner点击后，判定那个banner被点击。getCurrentShowingBannerId方法由开发者实现；
            /*let showingBannerId = this.__showingBannerId; */

            // 落地页回小游戏时，options会带有targetPagePath字段
            if (options.targetPagePath/* && showingBannerId  */) {
                let isBackFromBanner = false;

                // 安卓手机点击跳转微信落地页，targetPagePath 包含nativeLandingPagesPrevideUI文本
                console.log('wx.onHide targetPagePath', options.targetPagePath.toLowerCase());

                if (options.targetPagePath.toLowerCase().indexOf('nativelandingpages') > -1) {
                    isBackFromBanner = true;
                }
                // 苹果手机跳转，targetPagePath包含http
                else if (options.targetPagePath.indexOf('http') > -1) {
                    isBackFromBanner = true;
                } else if (options.targetPagePath.indexOf('weixinad') > -1) {
                    isBackFromBanner = true;
                }

                if (!isBackFromBanner) {
                    if (
                        (options.targetAction == 8 || options.targetAction == 9 || options.targetAction == 10)
                        && options.targetPagePath.length > 50
                    ) {
                        isBackFromBanner = true;
                    }
                }

                if (isBackFromBanner) {
                    if (this._bannerClickCallf) {
                        let callf = this._bannerClickCallf;
                        delete this._bannerClickCallf;
                        this._bannerClickCallf = null;
                        // app.log.log('领取奖励成功');
                        callf();
                    }
                    else {
                        fcapp.datasdk.onEvent("普通banner点击");
                    }
                }
            }
        };
        window.wx.onHide(onHide);
    }

    offBannerClick() {
        if(this._bannerClickCallf)
        {
            delete this._bannerClickCallf;
            this._bannerClickCallf = null;
        }
    }
}
