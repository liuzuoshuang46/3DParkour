import { _decorator, Component,AudioSourceComponent,AudioClip , Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AudioMgr")
export class AudioMgr extends Component {
    @property( AudioSourceComponent )
    player: AudioSourceComponent  = null;
    @property( AudioSourceComponent )
    playerShort: AudioSourceComponent  = null;

    @property( [AudioClip] )
    clips:AudioClip[] = [];
    @property( AudioClip )
    clipShort:AudioClip = null;

    private name2clip: any = null;

    private audio1 = "background";
    private audio2 = "受伤-女孩";
    private audio3 = "受伤-小呆呆";
    private audio4 = "受伤-波比";
    private audio5 = "受伤-猪猪侠";
    private audio6 = "受伤-超人强";
    private audio7 = "吃道具";
    private audio8 = "吃金币";
    private audio9 = "吃钻石";
    private audio10 = "场景中_刷新记录";
    private audio11 = "失败_掉坑了";
    private audio12 = "失败_角色撞晕了";
    private audio13 = "展示、切换语音-小呆呆";
    private audio14 = "展示、切换语音-波比";
    private audio15 = "展示、切换语音-猪猪侠";
    private audio16 = "展示、切换语音-菲菲";
    private audio17 = "展示、切换语音-超人强";
    private audio18 = "按钮通用";
    private audio19 = "背景音乐_主界面";
    private audio20 = "背景音乐_关卡";
    private audio21 = "背景音乐_关卡2";
    private audio22 = "角色左右滑动";
    private audio23 = "角色开局飞机";
    private audio24 = "角色落水";
    private audio25 = "角色赛车升级成功";
    private audio26 = "赛车加速";
    private audio27 = "跳跃语音_小呆呆";
    private audio28 = "跳跃语音_波比";
    private audio29 = "跳跃语音_猪猪侠";
    private audio30 = "跳跃语音_菲菲";
    private audio31 = "跳跃语音_超人强";
    private audio32 = "跳跃音效_通用";
    private audio33 = "金币关开车语音1-猪猪侠";
    private audio34 = "金币关开车语音2-女孩";
    private audio35 = "金币关开车语音3-小呆呆";
    private audio36 = "金币关开车语音4-波比";
    private audio37 = "金币关开车语音5-超人强";
    private audio38 = "金币关背景音乐";
    private audio39 = "金币关过了终点线";
    private audio40 = "障碍物_汽车开动声大";
    private audio41 = "障碍物_汽车开动声小";
    private audio42 = "障碍物_移动的车喇叭_大车";
    private audio43 = "障碍物_移动的车喇叭_小车";
    private audio44 = "321go";

    onLoad () {
        this.initData();
    }

    initData () {
        this.parseClipName();
    }

    parseClipName () {
        this.name2clip = {};
        this.clips.forEach( clip => {
            this.name2clip[ clip.name ] = clip;
        })
    }

    // play once
    play ( name ) {
        let clip:AudioClip = this.name2clip[ name ];
        cc.assert( clip );
        this.player.playOneShot( clip );
    }
    playShort ( name ) {
        
        if(this.clipShort)
            this.clipShort.pause();

        this.clipShort = this.name2clip[ name ];
        cc.assert(  this.clipShort );
        this.playerShort.playOneShot(  this.clipShort );
    }

    // play loop
    playLoop ( name ) {
        this.player.stop();
        let clip:AudioClip = this.name2clip[ name ];
        cc.assert( clip );
        this.player.clip = clip;
        this.player.loop = true;
        this.player.play();
    }
    resumePlayLoop ( ) {
        this.player.play();
    }

    get volume () {
        return fcapp.data.volume;
    }

    set volume ( val ) {
        val = Number( val );
        val = Math.max( 0, val );
        val = Math.min( 1, val );
        fcapp.data.volume = val;
        this.player.volume = val;
        this.playerShort.volume = val;
    }
}
