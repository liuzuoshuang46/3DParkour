import { _decorator, Component,instantiate, Node,Prefab } from "cc";
const { ccclass, property } = _decorator;
import { ECoderKeepId } from "./GameMageController"
@ccclass("ResListItem")
class PrefabCollection{
    @property
    key: string = "";

    @property([Prefab])
    arr: Prefab[] = [];
}

@ccclass("ResList")
export class ResList extends Component {

    @property( [PrefabCollection] )
    prefabs: PrefabCollection[] = [];

    onLoad () {
        this.initId2Name();
        this.parseAssetName();
    }

    public obstacleId2Name:any = null;
    initId2Name () {
        this.obstacleId2Name =
        {
            1001: "shu-1", // 障碍物-树1
            1002: "brideg-1", // 障碍物-桥1
            1003: "zhang_ai_wu",// 障碍物-地面路障
            1004: "shu-2",// 障碍物-树2
            1005: "shitou-2",// 障碍物-石头2
            1006: "shitou-1",// 障碍物-石头1
            1007: "brideg-2",// 障碍物-桥2
            1008: "ground_plane",// 正常地面
            1009: "正常跑道",// 地面的装饰物

            2000: "Car_01", // 障碍物-树1
            2001: "Car_04", // 障碍物-桥1
            2002: "Car_05",// 障碍物-地面路障
            2003: "Car_02",// 障碍物-树2
            2004: "Car_03",// 障碍物-石头2
            2005: "Car_07",// 障碍物-石头1
            2006: "Car_09",// 障碍物-桥2
            2007: "Luzhang_02",// 正常地面
            2008: "Luzhang_03",// 地面的装饰物
            2009: "Luzhang_04",// 地面的装饰物
            2010: "Deng_1",// 地面的装饰物
            2011: "Deng_2",// 地面的装饰物
            2012: "Deng_3",// 地面的装饰物

            2013: "chengshi-ground_plane",// 城市地面

            3000: "xuedi_ground_plane",// 雪地地面

            4000: "sl_ground_plane",// 森林地面

            5000: "sd_ground_plane",// 赛道地面
        
            1000: "Coin", // 道具-金币
            10001: "hudun", // 道具-能量防御盾 	
            10002: "fly", // 道具-飞天
            10003: "jiaxue", // 道具-生命+1	    
            10004: "xitieshi", // 道具-万能磁铁	
            10010: "zuanshi", // 道具-钻石id  
            10011: "jiasu", // 道具-人加速  
            10000: "jiasu_saiche", // 道具-车加速  
        }
        
        // 程序自定义保留id ECoderKeepId 1000000起
        this.obstacleId2Name[ ECoderKeepId.OBS_NEXT ] = "next";
        this.obstacleId2Name[ ECoderKeepId.OBS_COIN_PASS ] = "coin_pass";
        // 特效
        this.obstacleId2Name[ ECoderKeepId.EFT_EAT_COIN ] = "Jinbi";
        this.obstacleId2Name[ ECoderKeepId.EFT_BG_PROP ] = "daoju";
        this.obstacleId2Name[ ECoderKeepId.EFT_CHE_WEI_YAN ] = "Cheweiyan";
        this.obstacleId2Name[ ECoderKeepId.EFT_HU_DUN ] = "baohuzhao";
        this.obstacleId2Name[ ECoderKeepId.EFT_ROLE_JIA_SU ] = "jiaosejiasu";
        this.obstacleId2Name[ ECoderKeepId.EFT_SCREEN_LIGHT ] = "light";

        //两边的装饰
        this.obstacleId2Name[ ECoderKeepId.EFT_CITY_1 ] = "yuansuzuhe1";
        this.obstacleId2Name[ ECoderKeepId.EFT_CITY_2 ] = "yuansuzuhe2";
        this.obstacleId2Name[ ECoderKeepId.EFT_CITY_3 ] = "yuansuzuhe3";
        this.obstacleId2Name[ ECoderKeepId.EFT_CITY_4 ] = "yuansuzuhe4";
        this.obstacleId2Name[ ECoderKeepId.EFT_CITY_5 ] = "yuansuzuhe5";
        this.obstacleId2Name[ ECoderKeepId.EFT_SNOWFIELD_1 ] = "yuansuzuhe20";
        this.obstacleId2Name[ ECoderKeepId.EFT_SNOWFIELD_2 ] = "yuansuzuhe21";
        this.obstacleId2Name[ ECoderKeepId.EFT_SNOWFIELD_3 ] = "yuansuzuhe22";
        this.obstacleId2Name[ ECoderKeepId.EFT_SNOWFIELD_4 ] = "yuansuzuhe23";
        this.obstacleId2Name[ ECoderKeepId.EFT_SNOWFIELD_5 ] = "yuansuzuhe24";
        this.obstacleId2Name[ ECoderKeepId.EFT_FOREST_1 ] = "yuansuzuhe40";
        this.obstacleId2Name[ ECoderKeepId.EFT_FOREST_2 ] = "yuansuzuhe41";
        this.obstacleId2Name[ ECoderKeepId.EFT_SAIDAO_1 ] = "yuansuzuhe100";
        this.obstacleId2Name[ ECoderKeepId.EFT_SAIDAO_2 ] = "yuansuzuhe101";
    }

    parseAssetName () {
        this.parsePrefabName();
    }

    namePrefabs:any = null;
    parsePrefabName () {
        this.namePrefabs = {};
        this.prefabs.forEach( (item:PrefabCollection) => { 
            item.arr.forEach( (asset: Prefab) => { 
                if( !asset ){
                    return;
                }
                this.namePrefabs[ asset.data.name ] = asset;
            })
        })
    }

    newPrefabByName( name: string ){
        cc.assert( name && this.namePrefabs[ name ] );
        var prefabNode = this.namePrefabs[ name ] ;
        let node = instantiate(prefabNode );
        return node;
    }

    newEffectById( eid: ECoderKeepId ){
        let name = this.obstacleId2Name[ eid ];
        cc.assert( name && this.namePrefabs[ name ] );
        let node = instantiate( this.namePrefabs[ name ] );
        return node;
    }

    newObstacleById( oid: number ) {
        let name = this.obstacleId2Name[ oid ];
        cc.assert( name && this.namePrefabs[ name ] );
        let node = instantiate( this.namePrefabs[ name ] );
        return node;
    }

    registePrefab( asset: Prefab ){
        cc.assert( !this.namePrefabs[ asset.data.name ] );
        this.namePrefabs[ asset.data.name ] = asset;
    }

}
