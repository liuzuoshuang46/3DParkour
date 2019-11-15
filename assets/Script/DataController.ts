import { _decorator, js, log, assert } from "cc";
import { fcEvent, EEvent } from "./fcEvent"
const { ccclass, property } = _decorator;

/**
 enum Days {Sun = 7, Mon, Tue, Wed, Thu, Fri, Sat = <any>"S"};
var Days;
(function (Days) {
    Days[Days["Sun"] = 7] = "Sun";
    Days[Days["Mon"] = 8] = "Mon";
    Days[Days["Tue"] = 9] = "Tue";
    Days[Days["Wed"] = 10] = "Wed";
    Days[Days["Thu"] = 11] = "Thu";
    Days[Days["Fri"] = 12] = "Fri";
    Days[Days["Sat"] = "S"] = "Sat";
})(Days || (Days = {}));
 */

export enum ekey {
    level,
    LuckDrawNum,
    LuckDrawTime,
    coin,
    diamond,
    selectHero,
    hero,
    car, 
    taskIdState,
    taskIdNum,
    taskIdTime,
    audioVolume,
    guideComplete
}

const ekey2parseCall:{ [key: string] : Function } = { 
    level: Number,
    LuckDrawNum: Number,
    LuckDrawTime: null,
    coin: Number,
    diamond: Number,
    selectHero: Number,
    hero: JSON.parse,
    car: JSON.parse, 
    taskIdNum: JSON.parse,
    taskIdState: JSON.parse,
    audioVolume: Number
}

function ccGetLocal(name): string {
    let ret = cc.sys.localStorage.getItem(name);
    log('getItem', name, ret);
    return ret;
}

const localSaveKeyPre = "zzx3d_";

function ccSetLocal(name, val) {
    log('setItem', name, val);

    let fcEvent: fcEvent = <fcEvent>fcapp.event;
    fcEvent.emit(EEvent.LocalVal, {
        type: name,
        val: val
    });

    name = localSaveKeyPre + name;
    if( typeof val === 'object' ){
        val = JSON.stringify(val);
    }
    if (window.wx) {
        window.wx.setStorage({
            key: name,
            data: val
        })
    } else {
        cc.sys.localStorage.setItem(name, val);
    }
}

@ccclass("fcData")
export class fcData {
    init() {
        this.initData()
    }

    initData() {
        this.parseLocal();
        this.taskIsReset()
    }

    private localVals: any = {};
    parseLocal() {
        const keys = ekey;
        for (var k in keys) {
            if (js.isString(k)) {
                let valKey = k;
                const localSaveKey = localSaveKeyPre + valKey;
                let val: string = ccGetLocal(localSaveKey);
                if (val != null && val != "") {
                    ekey2parseCall[ valKey ] && (val = ekey2parseCall[ valKey ]( val ));
                    this.localVals[valKey] = val;
                }
            }
        }
    }

    setChecker(val, check) {
        return val != null && val != undefined && check(val);
    }

    public set level(val: any) {
        assert(val != null && val != undefined && this.setChecker(val, (val) => { return js.isNumber(val); }));
        this.localVals.level = val;
        ccSetLocal('level', val);
    }
    public get level() {
        return this.localVals.level || 1;
    }

    public set coin(val: any) {
        assert(val != null && val != undefined && this.setChecker(val, (val) => { return js.isNumber(val); }));
        this.localVals.coin = val;
        ccSetLocal('coin', val);
    }
    public get coin() {
        let goldValue = fcapp.json.getJson("initialize")[0];
        if(this.localVals.coin != null)
        {
            return this.localVals.coin;
        }
        return parseInt( goldValue.gold );
    }

    public set diamond(val: any) {
        assert(val != null && val != undefined && this.setChecker(val, (val) => { return js.isNumber(val); }));
        this.localVals.diamond = val;
        ccSetLocal('diamond', val);
    }
    public get diamond() {
        let diamondValue = fcapp.json.getJson("initialize")[0];
        if(this.localVals.diamond != null)
        {
            return this.localVals.diamond;
        }
        return parseInt( diamondValue.rmb );
    }
    public set selectHero(val: any) {
        assert(val != null && val != undefined && this.setChecker(val, (val) => { return true; }));
        this.localVals.selectHero = val;
        ccSetLocal('selectHero', val);
    }
    public get selectHero() {
        return this.localVals.selectHero || 0;
    }
    public set hero(val: any) {
        assert(val != null && val != undefined && this.setChecker(val, (val) => { return true; }));
        this.localVals.hero = val;
        ccSetLocal('hero', val);
    }
    public get hero() {
        return this.localVals.hero || {
            1: {
                roleId: 1,
                goldlevel: 1,
                flightlevel: 1,
                lock: false
            },
            2: {
                roleId: 2,
                goldlevel: 1,
                flightlevel: 1,
                lock: true
            },
            3: {
                roleId: 3,
                goldlevel: 1,
                flightlevel: 1,
                lock: true
            },
            4: {
                roleId: 4,
                goldlevel: 1,
                flightlevel: 1,
                lock: true
            },
            5: {
                roleId: 5,
                goldlevel: 1,
                flightlevel: 1,
                lock: true
            }
        };
    }
    public set car(val: any) {
        assert(val != null && val != undefined && this.setChecker(val, (val) => { return true; }));
        this.localVals.car = val;
        ccSetLocal('car', val);
    }
    public get car() {
        return this.localVals.car || {
            1: {
                roleId: 1,
                speedlevel: 1,
                outbreaklevel: 1,
                lock: false
            },
            2: {
                roleId: 2,
                speedlevel: 1,
                outbreaklevel: 1,
                lock: true
            },
            3: {
                roleId: 3,
                speedlevel: 1,
                outbreaklevel: 1,
                lock: true
            },
            4: {
                roleId: 4,
                speedlevel: 1,
                outbreaklevel: 1,
                lock: true
            },
            5: {
                roleId: 5,
                speedlevel: 1,
                outbreaklevel: 1,
                lock: true
            }
        }
    }


    public setLuckDrawNum(val: any) {
        assert(val != null && val != undefined && this.setChecker(val, (val) => { return true; }));
        this.localVals.LuckDrawNum = val;
        ccSetLocal('LuckDrawNum', val);
    }
    public getLuckDrawNum() {
        return this.localVals.LuckDrawNum || 3;
    }
    public set LuckDrawTime(val: any) {
        assert(val != null && val != undefined && this.setChecker(val, (val) => { return true; }));
        this.localVals.LuckDrawTime = val;
        ccSetLocal('LuckDrawTime', val);
    }
    public get LuckDrawTime() {
        return this.localVals.LuckDrawTime || "";
    }

    public set volume( val: any ) {
        assert( val != null && val != undefined && this.setChecker( val, ( val ) => { return cc.isNumber( val ); } ) );
        this.localVals.volume = val;
        ccSetLocal( 'volume', val );
    }
    public set taskIdTime( val: any ) {
        assert( val != null && val != undefined && this.setChecker( val, ( val ) => { return true; } ) );
        this.localVals.taskIdTime = val;
        ccSetLocal( 'taskIdTime', val );
    }
    public get taskIdTime() {
        
        return this.localVals.taskIdTime || "";
    }

    public set taskIdNum( val: any ) {
        assert( val != null && val != undefined && this.setChecker( val, ( val ) => { return true; } ) );
        this.localVals.taskIdNum = val;
        ccSetLocal( 'taskIdNum', val );
    }
    public get taskIdNum() {
        return this.localVals.taskIdNum ||  {
            1:0,
            2:0,
            3:0,
            4:0,
            5:0,
            6:0,
            7:0,
            8:0,
            9:0,
            10:0
        };
    }
    public set taskIdState( val: any ) {
        assert( val != null && val != undefined && this.setChecker( val, ( val ) => { return true; } ) );
        this.localVals.taskIdState = val;
        ccSetLocal( 'taskIdState', val );
    }
    public get taskIdState() {
        return this.localVals.taskIdState || {
            1:0,
            2:0,
            3:0,
            4:0,
            5:0,
            6:0,
            7:0,
            8:0,
            9:0,
            10:0,
            11:0
        };
    }

    public setTaskNum(id,num)
    {
       
        if(id == 1 || id == 4 || id == 10)
        {
            num = (num > this.taskIdNum[Number(id)] ? num : this.taskIdNum[Number(id)]);
        }
        else if(id == 2 || id == 3 || id == 5 || id == 6  || id == 7  || id == 8  || id == 9)
        {
            num = this.taskIdNum[Number(id)] + 1;
        }
        
        let temptaskIdNum = fcapp.data.taskIdNum;
        temptaskIdNum[Number(id)] = num
        fcapp.data.taskIdNum =  temptaskIdNum;
        this.taskIsReset();
    }
    public setTaskIdTime()
    {
        
        var timeData = fcapp.util.getLocaleDate();
        this.taskIdTime = timeData;
    }
    public taskIsReset()
    {
        var timeData = fcapp.util.getLocaleDate();
        if(this.taskIdTime != timeData)
        {
            let temptaskIdNum = fcapp.data.taskIdNum;
            for(var i=0;i<this.taskIdNum.length; i++)
            {
                temptaskIdNum[Number(i)+1]  = 0;
            }
            this.taskIdNum = temptaskIdNum;


            let temptaskIdState = fcapp.data.taskIdState;
            for(var i=0;i<this.taskIdState.length; i++)
            {
                temptaskIdState[Number(i)+1]  = 0;
            }
            this.taskIdState = temptaskIdState;

            this.setTaskIdTime();
        }
        else
        {
            this.setTaskIdTime();
        }
    }

    public get volume() {
        return this.localVals.volume || 1;
    }

    public set guideComplete( val: any ) {
        assert( val != null && val != undefined && this.setChecker( val, ( val ) => { return true; } ) );
        this.localVals.guideComplete = val;
        ccSetLocal( 'guideComplete', val );
    }

    public get guideComplete() {
        return this.localVals.guideComplete || 0;
    }
}