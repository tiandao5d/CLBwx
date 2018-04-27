<template>
  <div class="page-item">
    <img :src="awi008" class="page-bg">
    <div class="barrager-box">
      <xl-barrager />
    </div>
    <button class="rw-btn01 rw-btn" @click="showPacket">
      <img :src="awi010">
    </button>
    <button class="rw-btn02 rw-btn" @click="showGrule">
      <img :src="awi012">
    </button>
    <div class="rw-p1">
      <div class="wish-img" :class="{open: index < imgfNum}"  v-for="img, index in imgfArr" :key="index"><img :src="index < imgfNum ? img[1] : img[0]"></div>
    </div>
    <div class="rw-p2">
      <p>有{{friendNum}}位好友为您点亮了祝福</p>
    </div>
    <div class="rw-p3">
      <button @click="userDraw" class="rw-btn03 rw-btn">
        <img class="rw-btn03-i" :src="awi011">
        <div class="rw-num01">
          <img :src="numarr[numNum]" v-if="numarr[numNum]">
          <span v-else>{{numNum}}</span>
        </div>
      </button>
    </div>
    <div class="rw-p4">{{rewardPool}}</div>
    <!-- 游戏规则 -->
    <xl-grule ref="xlgrule" />
    <!-- 游戏弹窗 -->
    <xl-dialog ref="xldialog" />
    <!-- 我的红包 -->
    <xl-packet ref="xlpacket" />
    <!-- 财神动画 -->
    <xl-animate @dresult="showPrize" ref="xlanimate" @csafter="csafter" />
    <!-- 中奖弹窗 -->
    <xl-prize ref="xlprize" @close="winpClose" />
  </div>
</template>

<script>

import awi008 from '@/assets/images/aw_008.png'
import awi010 from '@/assets/images/aw_010.png'
import awi011 from '@/assets/images/aw_011.png'
import awi012 from '@/assets/images/aw_012.png'

import awf011 from '@/assets/images/aw_f011.png'
import awf020 from '@/assets/images/aw_f020.png'
import awf021 from '@/assets/images/aw_f021.png'
import awf030 from '@/assets/images/aw_f030.png'
import awf031 from '@/assets/images/aw_f031.png'
import awf040 from '@/assets/images/aw_f040.png'
import awf041 from '@/assets/images/aw_f041.png'
import awf050 from '@/assets/images/aw_f050.png'
import awf051 from '@/assets/images/aw_f051.png'
import awf060 from '@/assets/images/aw_f060.png'
import awf061 from '@/assets/images/aw_f061.png'

import num001 from '@/assets/images/aw_001.png'
import num002 from '@/assets/images/aw_002.png'
import num003 from '@/assets/images/aw_003.png'
import num004 from '@/assets/images/aw_004.png'
import num005 from '@/assets/images/aw_005.png'
import num006 from '@/assets/images/aw_006.png'
import num007 from '@/assets/images/aw_007.png'

import XlBarrager from '@/components/share/barrager.vue'
import XlGrule from '@/components/grule'
import XlDialog from '@/components/dialog'
import XlPacket from '@/components/redpacket'
import XlPrize from '@/components/winprize'
import XlAnimate from '@/components/redanimate'

export default {
  data () {
    return {
      awi008,
      awi010,
      awi011,
      awi012,
      rewardPool: 0, // 奖池金额
      friendNum: 0, // 助力朋友的数量
      imgfNum: 0, // 点亮的祝福数量
      imgfArr: [[awf011, awf011], [awf020, awf021], [awf030, awf031], [awf040, awf041], [awf050, awf051], [awf060, awf061]],
      numNum: 0, // 祝福红包的数量，可参与次数
      numarr: [num001, num002, num003, num004, num005, num006, num007]
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      let _this = this,
          actData = _this.$xljs.storageL(_this.$xljs.sessionAct, null, true), // 活动数据
          aid = actData.id, // 活动ID
          zid = actData.assistanceId, // 助力ID
          zdata = actData.zdata // 助力活动的数据
      _this.rewardPool = parseInt(actData.rewardPool)
      // 获得本活动可抽奖次数
      _this.getChanceNum(aid, function (data) {
        let count = data.count // 活动剩余可以参与的次数
        _this.numNum = ((count >= 0) ? count : 0)
      })
      // 获得助力活动可抽奖次数
      // zdata.conditionValue 目标数量
      // zdata.participateTime 可参与次数
      _this.getZChanceNum(zid, function (data) { // 活动剩余可以参与的次数
        let ofnum = ((data.count >= 0) ? ( zdata.participateTime - data.count ) : 0) // 已经参与的次数
        ofnum = ofnum > 0 ? ofnum : 0 // 值不能小于0
        // 获取助力任务完成的进度
        _this.getActProgre(zid, function (data) {
          let tval = data.record && data.record.taskValue, // 活动完成进度
              tstatus = data.record && data.record.status // 任务状态
          if ( tstatus === 101 ) { // 说明有任务在执行
            ofnum = ofnum > 0 ? (ofnum - 1) : 0
          }
          _this.friendNum = ( ofnum*zdata.conditionValue ) + ( tval > 0 ? tval : 0 ) // 好友数量
          _this.imgfNum = ofnum > 0 ? (ofnum + 1) : 1 // 默认亮一个
        })
      })
    },
    // 用户执行抽奖
    userDraw () {
      if ( !this.numNum ) {
        this.showDialog( '需要更多好友点亮祝福才能继续领取祝福红包，快去邀请好友来点亮吧！' )
        return false
      }
      this.$refs.xlanimate.show() // 显示开奖动画
    },
    // 财神出现动画完成后，飘红包雨前
    csafter () {
      let _url = `/ushop-api-merchant/api/sns/task/wishing/draw/${this.$xljs.aid}`
      this.$xljs.ajax(_url, 'post', {}, ( data, res ) => {
        if ( data.requestNo ) {
          this.$refs.xlanimate.getDrawRe( data.requestNo ) // 请求开奖结果
        } else {
          this.$refs.xlanimate.hide() // 隐藏开奖动画
        }
      }, false) // 有红包雨，不需要加载中圆圈
    },
    // 获取任务可参与的次数
    getChanceNum ( id, callback = function () {} ) {
      let _url = `/ushop-api-merchant/api/sns/task/wishing/done/get/${id}`
      this.$xljs.ajax(_url, 'get', {}, ( data ) => {
        callback(data)
      })
    },
    // 获取任务完成的进度
    getActProgre ( id, callback = function () {} ) {
      let _url = `/ushop-api-merchant/api/sns/task/progress/get/${id}`
      this.$xljs.ajax(_url, 'get', {}, ( data ) => {
        callback(data)
      })
    },
    // 获取助力任务的参与次数
    getZChanceNum ( id, callback = function () {} ) {
      let _url = `/ushop-api-merchant/api/sns/task/done/get/${id}`
      this.$xljs.ajax(_url, 'get', {}, ( data ) => {
        callback(data)
      })
    },
    // 显示游戏规则
    showGrule () {
      this.$refs.xlgrule.show()
    },
    // 显示弹窗
    // 参数为弹窗的内容字符串
    showDialog ( txt ) {
      this.$refs.xldialog.show( txt )
    },
    // 显示我的红包列表
    // 参数为列表数据
    showPacket () {
      this.$refs.xlpacket.show() // 显示中奖弹窗
    },
    // 显示中奖弹窗
    // 参数为中奖数据
    showPrize ( obj ) {
      this.numNum -= 1 // 减少一次抽奖机会
      this.$refs.xlprize.show( obj )
    },
    // 关闭中奖弹窗
    winpClose () {
      this.$refs.xlprize.hide() // 中奖弹窗关闭
      this.$refs.xlanimate.hide() // 动画关闭
    }
  },
  components: {
    XlBarrager,
    XlDialog,
    XlPacket,
    XlPrize,
    XlGrule,
    XlAnimate
  }
}
</script>

<style scoped>
.page-bg {
  width: 100%;
}
.barrager-box {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  padding-top: 16%;
  overflow: hidden;
}
.page-item {
  position: relative;
  max-width: 720px;
  margin: 0 auto;
}
.rw-btn01,
.rw-btn02 {
  position: absolute;
  left: 15%;
  top: 39%;
  width: 30%;
}
.rw-btn02 {
  left: 56%;
}
.rw-btn01 img,
.rw-btn02 img {
  width: 100%;
}
.rw-p1 {
  position: absolute;
  left: 13%;
  right: 11%;
  top: 48%;
}
.wish-img {
  float: left;
  width: 16.66666%;
  padding: 0 .5%;
}
.wish-img.open {
  box-shadow: 0 0 15px #fff700;
}
.wish-img img {
  width: 100%;
}
.rw-p2 {
  position: absolute;
  left: 0;
  width: 100%;
  top: 75%;
  bottom: 19%;
}
.rw-p2 p {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-size: 14px;
}
.rw-p3 {
  position: absolute;
  left: 0;
  top: 82%;
  width: 100%;
}
.rw-btn03-i {
  width: 100%;
}
.rw-btn03 {
  width: 45%;
  margin: 0 auto;
}
.rw-num01 {
  position: absolute;
  left: 0;
  bottom: 11%;
  width: 100%;
  height: 48%;
  text-align: center;
}
.rw-num01 img {
  height: 100%;
}
.rw-p4 {
  position: absolute;
  left: 41%;
  right: 48%;
  bottom: 5%;
  line-height: 1;
  color: #fe0000;
  font-size: 10px;
  text-align: center;
  font-weight: bold;
  padding-bottom: 1px;
}
.rw-btn {
  display: block;
  background: none;
  border: 0;
}
@media screen and (min-width: 350px) {
    .rw-p4 {
      font-size: 12px;
    }
}
@media screen and (min-width: 400px) {
    .rw-p4 {
      font-size: 14px;
    }
}
@media screen and (min-width: 450px) {
    .rw-p4 {
      font-size: 16px;
    }
}
@media screen and (min-width: 500px) {
    .rw-p4 {
      font-size: 18px;
    }
}
@media screen and (min-width: 550px) {
    .rw-p4 {
      font-size: 20px;
    }
}
@media screen and (min-width: 650px) {
    .rw-p4 {
      font-size: 22px;
    }
}
</style>
<style>
.rw-btn:active {
  opacity: .6;
}
</style>
