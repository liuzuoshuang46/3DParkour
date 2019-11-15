import { _decorator, Component, Node, LabelComponent, SpriteComponent, Vec3, SpriteFrame, Prefab } from "cc";
const { ccclass, property } = _decorator;

@ccclass("taskViewData")
export class taskViewData extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property({ type: LabelComponent })
    public describeLabel = null;

    @property({ type: LabelComponent })
    public progressLabel = null;

    @property({ type: SpriteComponent })
    public moneyIcon = null;

    @property({ type: LabelComponent })
    public moneyNum = null;

    @property({ type: [Node] })
    public btnList = [];

    @property({ type: [SpriteFrame] })
    public itemSprite = [];

    private isAvailable = false;
    private m_data = null;
    private m_parentObj = null;

    start() {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
    init(data,parentObj) {

        this.isAvailable = false;

        // G_Common.getUserData().taskIsReset();

        this.m_data = data;
        this.m_parentObj = parentObj;

        this.initUi();

        this.updataInfo();
    }
    initUi() {

        let reward = JSON.parse(this.m_data.reward);
        //描述
        this.describeLabel.string = this.m_data.describe;
       
        //奖励数量
        this.moneyNum.string = reward[1];
        //奖励icon
        this.moneyIcon.spriteFrame = this.itemSprite[Number(reward[0]) - 1];
    }
    updataInfo() {


        //进度
        var value = 0;

        value = fcapp.data.taskIdNum[Number(this.m_data.type)];
        if(this.m_data.number > 10)
        {
            if( this.m_data.number <=  value)
            {
                this.progressLabel.string = '1/1';
            }
            else
            {
                this.progressLabel.string = '0/1' ;
            }
        }
        else
        {
            this.progressLabel.string = value + '/' + this.m_data.number;
        }
        


        let isOvder = false;
        isOvder = fcapp.data.taskIdState[Number(this.m_data.id)] == 1 ? true : false;
        //按钮状态
        var statsValue = 0;//1.进行中 2.领取 3.已完成
        if (value >= Number(this.m_data.number)) {
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


        for (var i = 0; i < this.btnList.length; i++) {

            if (i == statsValue - 1) {
                this.btnList[i].active = true;
            }
            else {
                this.btnList[i].active = false;
            }
        }


        this.isAvailable = (statsValue == 2 || statsValue == 3);
    }

    getReward() {
        //奖励
        var rewardData = JSON.parse(this.m_data.reward);
        var value =Number(rewardData[1]);
        var id = Number(rewardData[0]);

        var stt = "";
        if (id == 1) {
            fcapp.data.coin = Number(fcapp.data.coin) + Number(value);
            stt ="获得金币x" + value;
        } else if (id == 2) {
            fcapp.data.diamond = Number(fcapp.data.diamond) + Number(value);
            stt ="获得钻石x" + value;
        }

        fcapp.datasdk.onEvent("任务领取成功" + this.m_data.describe);

        fcapp.logItem.log(stt);

        let temptaskIdState = fcapp.data.taskIdState;
        temptaskIdState[Number(this.m_data.id)] = 1;
        fcapp.data.taskIdState = temptaskIdState;
       
        this.updataInfo();

        this.m_parentObj.getComponent('taskLayer').nodeSort();
    }
}
