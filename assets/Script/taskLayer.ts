import { _decorator, Component, Node ,Prefab,LabelComponent,SpriteComponent,Vec3,SpriteFrame} from "cc";
const { ccclass, property } = _decorator;

@ccclass("taskLayer")
export class taskLayer extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    //
    @property({ type: Node })
    public contentNode = null;

    //
    @property({ type: Prefab })
    public taskViewData = null;

     //
     @property({ type: Node })
     public lastNode = null;

     @property({ type: [Node] })
    public btnList = [];

     @property({ type: [SpriteFrame] })
     public itemSprite= [];

    private nodeList = new Array()
    private lastData = null
    start () {
        // Your initialization goes here.
        var jsonData = fcapp.json.getJson("task");
        var len = jsonData.length - 1;

        //默认高度
        let contentHeight = this.contentNode.height;
        //计算出的高度
        let viewDataHeight = 0;
        //完成所有任务的数据
        this.lastData = null;

        let isAvailable = 0
        for(var i=0;i<jsonData.length;i++)
        {
            if(jsonData[i].id == jsonData.length)
            {
                this.lastData = jsonData[i];
                continue;
            }
                

            let node = cc.instantiate(this.taskViewData);
            node.parent = this.contentNode;
            //单个节点的高度
            let heig = (node.height + 10)
            node.position = new Vec3(0, -(viewDataHeight + heig/2),0);
            viewDataHeight += heig;
            node.getComponent('taskViewData').init(jsonData[i],this.node);
            if(node.getComponent('taskViewData').isAvailable)
            {
                isAvailable++;
            }

            this.nodeList.push(node);
            
        }
        contentHeight = viewDataHeight;//(contentHeight < viewDataHeight * len ? viewDataHeight * len : contentHeight);
        this.contentNode.height = contentHeight;

       
        this.updataInfo(isAvailable,len);

        this.nodeSort();

        if(window.openBanner == true && window.fcapp.hbswitch.bannerDelay == true  && window.wx)
        {
            this.banner = window.bannerMgr.showBottomBanner();
        }
    }

    onEnable()
    {
        fcapp.datasdk.onEvent("展示任务界面");
    }

    updataInfo(isAvailable,len)
    {
        //状态
        let reward = JSON.parse( this.lastData.reward );
        let value = isAvailable == len ? 1 : 0;//;
        fcapp.data.setTaskNum(10,value);
        this.lastNode.getChildByName("progressLabel").getComponent(LabelComponent).string = value + '/1' ;
        var statsValue = 0;//1.进行中 2.领取 3.已完成
        var isOvder = (fcapp.data.taskIdState[11] == 1 ? true : false);
        if (value  == 1) {
            if (isOvder == true) {
                statsValue = 3;
            }
            else {
                statsValue = 2;
            }
        }
        else {
            statsValue = 1;
        }

        //按钮
        for (var i = 0; i < this.btnList.length; i++) {

            if (i == statsValue - 1) {
                this.btnList[i].active = true;
            }
            else {
                this.btnList[i].active = false;
            }
        }

        //信息
        for(let i=0;i<reward.length;i++)
        {
            let tempReward =  reward[i];
            let node = this.lastNode.getChildByName("ItemBg" + (i+1));
            node.getChildByName("Icon").getComponent(SpriteComponent).spriteFrame = this.itemSprite[Number(tempReward[0]) - 1];
            
            node.getChildByName("num").getComponent(LabelComponent).string = tempReward[1];
        }
    }
    //把能领取的放到上面
    nodeSort()
    {
        var len = this.nodeList.length;
        for(var i=0;i<len - 1;i++){

            for(var j=0;j<len -1-i;j++){

                var value1 = this.nodeList[j].getComponent("taskViewData").isAvailable;
                var value2 = this.nodeList[j+1].getComponent("taskViewData").isAvailable;
                if(value1 == false && value2 == true)
                {
                    var tempjY = this.nodeList[j].position.y;
                    var tempj1Y = this.nodeList[j+1].position.y;

                    var temp = this.nodeList[j];
                    this.nodeList[j] = this.nodeList[j+1];
                    this.nodeList[j+1] = temp;

                    this.nodeList[j+1].position = new Vec3(0,tempj1Y,0);
                    this.nodeList[j].position = new Vec3(0,tempjY,0);
                }
            }
        }
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    getReward() {
        //奖励
        var rewardData = JSON.parse(this.lastData.reward);
        var stt = "获得";
        for(var i=0;i<rewardData.length;i++)
        {
            var value =Number(rewardData[i][1]);
            var id = Number(rewardData[i][0]);
            if (id == 1) {
                fcapp.data.coin = Number(fcapp.data.coin) + Number(value);
                stt +="金币x" + value +";";
            } else if (id == 2) {
                fcapp.data.diamond = Number(fcapp.data.diamond) + Number(value);
                stt ="钻石x" + value+";";
            }
    
        }
        
        fcapp.logItem.log(stt);

        let temptaskIdState = fcapp.data.taskIdState;
        temptaskIdState[Number(this.lastData.id)] = 1;
        fcapp.data.taskIdState = temptaskIdState;
       
        var jsonData = fcapp.json.getJson("task");
        var len = jsonData.length - 1;

        this.updataInfo(len,len);
    }

    callBackCloseBtn () {
        if (window.wx) 
        {
            window.bannerMgr.rmBanner( this.banner);
        }
        this.node.destroy();
       
    }
}
