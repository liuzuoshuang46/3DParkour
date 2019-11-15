import { _decorator, Component, log, Node, JsonAsset, Prefab, assert } from "cc";
const { ccclass, property } = _decorator;

@ccclass("JsonMgr")
export class JsonMgr extends Component {

    init() {
        this.initData();
    }

    initData() {
        this.parseDataName();
        this.parseDataGame();
    }

    @property([JsonAsset])
    public jsons: JsonAsset[] = [];


    private name2Json = {};
    parseDataName() {
        this.jsons.forEach(jsonAsset => {
            assert(!this.name2Json[jsonAsset.name]);
            this.name2Json[jsonAsset.name] = jsonAsset;
        })
    }

    parseDataGame() {
        this.parseDataPass();
    }

    private allMapData: any = {};  // 读取第几块的随机表
    private allPassData: any = {}; // 地图块上面障碍物之类的数据
    parseDataPass() {
        const mapJson = this.getJson('map')[0]; // 读取第几块的随机表
        this.allMapData =
            [
                [
                    JSON.parse(mapJson.scene1_1),
                    JSON.parse(mapJson.scene1_2),
                    JSON.parse(mapJson.scene1_3),
                ],
                [
                    JSON.parse(mapJson.scene2_1),
                    JSON.parse(mapJson.scene2_2),
                    JSON.parse(mapJson.scene2_3),
                ],
                [
                    JSON.parse(mapJson.scene3_1),
                    JSON.parse(mapJson.scene3_2),
                    JSON.parse(mapJson.scene3_3),
                ],
                [
                    JSON.parse(mapJson.scene4_1),
                    JSON.parse(mapJson.scene4_2),
                    JSON.parse(mapJson.scene4_3),
                ]
            ];

        const passJson = this.getJson('pass');// 地图块上面障碍物之类的数据
        for (var k in passJson) {
            let item = passJson[k];
            if (item.mapId == "地图id") { // 中文注释不知道为啥被导出来了
                continue;
            }
            if (!this.allPassData[item.mapId]) {
                this.allPassData[item.mapId] = [];
            }
            this.allPassData[item.mapId].push(item);
        }
        for (var k in this.allPassData) {
            const item = this.allPassData[k];
            cc.assert(item.length === 32);
        }
    }

    /**
     * 获取正常关卡障碍物数据
     * @param difficulty 难度 对应scene*_1,2,3 三档难度 
     * 难度0 scene*_1,2
     * 难度1 scene*_1,2,3
     * 难度2 scene*_1,3,2,3,3
     * @param num 进地道次数 num % 2 == 0 对应 allMapData[0] allMapData[1] 1 对应 allMapData[2] allMapData[3]
     * ----------------------------------------------------------------------------
     * 上面的规则都废了，用下面的
     * 1-3难度出的顺序固定为:1212313233
     * 1-4场景出的规则为 num % 2 == 0 出12场景，1 出34 场景
     * 每次场景用完进金币关 进完金币关 num + 1 ,重新调用本函数刷新场景数据
     */
    getMapDataNormal(difficulty, num) {
        cc.assert(difficulty <= 2 && difficulty >= 0);
        let ret = [];
        let [sc1, sc2] = num % 2 == 0 ? [0, 1] : [2, 3];
        sc1 = this.allMapData[sc1];
        sc2 = this.allMapData[sc2];

        // if (difficulty == 0) {
        //     ret.push(sc1[0], sc1[1]);
        //     ret.push(sc2[0], sc2[1]);
        // } else if (difficulty == 1) {
        //     ret.push(sc1[0], sc1[1], sc1[2]);
        //     ret.push(sc2[0], sc2[1], sc2[2]);
        // } else if (difficulty == 2) {
        //     ret.push(sc1[0], sc1[2], sc1[1], sc1[2], sc1[2]);
        //     ret.push(sc2[0], sc2[2], sc2[1], sc2[2], sc2[2]);
        // }

        if (!window.xinshoubuhuiwan) {
            const mapJson = this.getJson('map')[0];
            let novice_shut = JSON.parse(mapJson.novice_shut);
            novice_shut.forEach( mapId => ret.push([mapId]) );
            // ret.push([10000], [10000], [10000], [10000], [10000], [10000], [10000], [10000], [10000], [10000], [10000]);
            window.xinshoubuhuiwan = true;
        }

        ret.push(sc1[0], sc1[2], sc1[0], sc1[1], sc1[2], sc1[0], sc1[2], sc1[1], sc1[2], sc1[2]);
        ret.push(sc2[0], sc2[2], sc2[0], sc2[1], sc2[2], sc2[0], sc2[2], sc2[1], sc2[2], sc2[2]);
        console.log('getMapDataNormal', JSON.stringify(ret));
        ret.forEach((arrPassId, idx) => {
            ret[idx] = this.allPassData[fcapp.util.randArr(arrPassId)];
        });

        return ret;
    }

    getMapDataCoin() {

        const mapJson = this.getJson('map')[0]; // 读取第几块的随机表
        let coinData = JSON.parse(mapJson.gold_1);
        let ret = coinData;
        ret.forEach((passId, idx) => {
            ret[idx] = this.allPassData[passId];
        });

        return ret;
    }

    getJson(name) {
        cc.assert(this.name2Json[name]);
        return this.name2Json[name].json;
    }
}
