import { _decorator, Component, Node, log, js } from "cc";
const { ccclass, property } = _decorator;

var num2chinese = {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
}

@ccclass("fcUtil")
export class fcUtil {
    /**
     * 从arr中返回一个随机位置的值
     * @param arr 数组
     */
    public randArr(arr) {
        let idx = this.random(arr.length - 1);
        return arr[idx];
    }

    public random(min, max?) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    init () {}

    v2Distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    num2chinese(num) {
        return num2chinese[num];
    }

    formatLengthNum(num, len) {
        num = String(num);
        var off = len - num.length;
        for (var i = 0; i < off; i++) {
            num = '0' + off;
        }
        return num;
    }

    // 数值换算成小数点后1位的带单位字符串
    formatNum(val) {
        var numToFixed = function (val) {
            val = val.toFixed(2);
            if (parseInt(val) === parseFloat(val)) {
                val = parseInt(val);
            }
            return val;
        }

        var ret: any = 'error';
        if (val >= 1000000) {
            ret = val / 1000000;
            ret = numToFixed(ret);
            ret = ret + 'M';
            return ret;
        } else if (val >= 1000) {
            ret = val / 1000;
            ret = numToFixed(ret);
            ret = ret + 'K';
            return ret;
        } else {
            return String(val);
        }
    }

    // K M 单位换算成数值
    parseNum(val) {
        if (typeof val === 'number') {
            val = String(val);
        };
        var idx = val.indexOf('K');
        var ret = NaN;
        if (idx !== -1) {
            val = val.substring(0, idx);
            ret = Number(val) * 1000;
            return ret;
        }

        idx = val.indexOf('M');
        if (idx !== -1) {
            val = val.substring(0, idx);
            ret = Number(val) * 1000000;
            return ret;
        }

        ret = Number(val);
        return ret;
    }

    // 对node的子节点遍历执行func 不递归
    childsExec(node, func) {
        var childs = node.children;
        var len = childs.length;
        for (var i = len - 1; i >= 0; i--) {
            var child = childs[i];
            func(child);
        }
    }

    deepClone(obj) {
        var ret = obj;
        ret = JSON.stringify(ret);
        ret = JSON.parse(ret)
        return ret;
    }

    removeFrom(item, array) {
        var idx = array.indexOf(item);
        if (idx != -1) {
            array.splice(idx, 1);
        } else {
            cc.assert( false );
        }
        return null;
    }

    removeIf(item, array) {
        var idx = array.indexOf(item);
        if (idx != -1) {
            array.splice(idx, 1);
        } else {
            return null;
        }
        return null;
    }
    
    //获取当前日期
    getLocaleDate() {
        let testDate = new Date();
        //获取当前日期
        let fullYear = testDate.getFullYear();
        fullYear = fullYear < 10 ? "0" + fullYear : fullYear;
        let month = Number(Number(testDate.getMonth()) + 1);
        month = month < 10 ? "0" + month : month;
        let date = testDate.getDate();
        date = date < 10 ? "0" + date : date;
        return fullYear + ":" + month + ":" + date;
    }
    //获取当前时间
    getTimeDate() {
        let testDate = new Date();
        //获取当前日期
        let hours = testDate.getHours();
        hours = hours < 10 ? "0" + hours : hours;
        let minutes = testDate.getMinutes();
        minutes = minutes < 10 ? "0" + minutes : minutes;
        let seconds = testDate.getSeconds();
        seconds = seconds < 10 ? "0" + seconds : seconds;
        return hours + ":" + minutes + ":" + seconds;
    }
}
