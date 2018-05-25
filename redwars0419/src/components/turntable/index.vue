<template>
  <div class="page-item" :class="{wh0000: (appwh > 0.6 && appwh < 0.7)}">
    <div class="page-con">
      <img class="tbox-bg" :src="tte001">
      <div class="ani-barrager">
        <xl-anibger />
      </div>
      <div class="a0000"></div>
      <div class="tbox-img1">
        <img class="w100" :src="tte003">
        <div class="tbox-time">
          <img class="w100" :src="tte009">
        </div>
        <div class="tbox-stars clearfix">
          <img :src="stars < 1 ? tte006 : tte007">
          <img :src="stars < 2 ? tte006 : tte007">
          <img :src="stars < 3 ? tte006 : tte007">
        </div>
        <div class="a0000"></div>
        <div class="tbox-txt1 hide">今日已完成答题次数：<span>{{pnum}}</span>次</div>
        <div class="tbox-btn1" @click="startAnswer"></div>
        <div class="tbox-btn2" @click="explainShow"></div>
        <div class="tbox-txt2">
          <div class="tbox-p1">当前还有<span>{{rewardPool}}</span>元奖品待领取</div>
        </div>
      </div>
    </div>
    <xl-explain ref="explain" />
    <!-- 提前加载图片 -->
    <div class="imgloading-box" id="img_loading_box">
      <img :src="tte001" @load="imgloading">
      <img :src="tte003" @load="imgloading">
    </div>
    <xl-load :isshow="loading"/>
  </div>
</template>

<script>
import XlLoad from '@/components/share/loading.vue'
import XlExplain from '@/components/dialog/tindex.vue' // 说明
import XlAnibger from '@/components/share/xlbger.vue' // 弹幕

import tte001 from '@/assets/images/tte001.jpg'
import tte003 from '@/assets/images/tte003.png'
import tte006 from '@/assets/images/tte006.png'
import tte007 from '@/assets/images/tte007.png'
import tte009 from '@/assets/images/tte009.png'

export default {
  data () {
    return {
      loading: true, // 加载中显示
      tte001,
      tte003,
      tte006,
      tte007,
      tte009,
      rewardPool: 0, // 奖池金额
      pnum: '', // 可抽奖次数显示
      appwh: 0,
      friendNum: 0,
      count: 0, // 可抽奖的次数
      stars: 0 // 亮星星的个数
    }
  },
  mounted () {
    this.init()
    window.addEventListener('resize', () => {
      this.appwh = this.$root.$el.offsetWidth/this.$root.$el.offsetHeight
    })
    this.appwh = this.$root.$el.offsetWidth/this.$root.$el.offsetHeight
  },
  methods: {
    // 图片加载加载
    imgloading () {
      let box = document.getElementById('img_loading_box'),
          imgs = box.querySelectorAll('img'),
          num = box.num || 1
      if ( num >= imgs.length ) {
        this.loading = false
      } else {
        box.num = ++num
      }
    },
    init () {
      let _this = this,
          actData = _this.$xljs.storageL(_this.$xljs.sessionAct, null, true), // 活动数据
          aid = actData.id, // 活动ID
          zid = actData.assistanceId, // 助力ID
          zdata = actData.zdata // 助力活动的数据
      _this.rewardPool = parseInt(actData.rewardPool)
      // 获得本活动可抽奖次数
      _this.getChanceNum(aid, function (data) {
        let cv = parseInt(actData.participateTime) || 0, // 总共可以抽奖的次数
            count = parseInt(data.count) || 0 // 剩余可以抽奖的次数
        count = ((count >= 0) ? count : 0)
        _this.pnum = ( cv - count ) + '/' + cv
        _this.count = count
      })
      // 获得助力活动可抽奖次数
      // zdata.conditionValue 目标数量
      // zdata.participateTime 可参与次数
      _this.getZChanceNum(zid, function (data) { // 活动剩余可以参与的次数
        let ofnum = ((data.count >= 0) ? ( zdata.participateTime - data.count ) : 0) // 已经参与的次数
        ofnum = ofnum > 0 ? ofnum : 0 // 值不能小于0
        // 获取助力任务完成的进度
        _this.getActProgre(zid, function (data) {
          if ( !(data.record && data.record.id) ) {
            return false
          }
          let tval = data.record && data.record.taskValue, // 活动完成进度
              tstatus = data.record && data.record.status // 任务状态
          if ( tstatus === 101 ) { // 说明有任务在执行
            ofnum = ofnum > 0 ? (ofnum - 1) : 0
            _this.friendNum = ( ofnum*zdata.conditionValue ) + ( tval > 0 ? tval : 0 ) // 好友数量
          } else {
            _this.friendNum = ( ofnum*zdata.conditionValue ) // 好友数量
          }
          _this.stars = parseInt( _this.friendNum/zdata.conditionValue ) + 1 // 默认亮一个
        })
      })
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
    explainShow () {
      this.$refs.explain.show()
    },
    // 开始答题点击
    startAnswer () {
      if ( this.count > 0 ) {
        this.$xljs.startAnswer = 1 // 记录流程
        this.$router.push('/answer')
      } else {
        this.$vux.toast.text('分享可增加答题次数')
      }
    }
  },
  components: {
    XlExplain,
    XlAnibger,
    XlLoad
  }
}
</script>

<style scoped>
.ani-barrager {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  padding-top: 30%;
  z-index: 999;
}
/*.page-item.wh0000,
.page-item.wh0000 .tbox-bg {
  height: 100%;
}*/
.tbox-bg {
  width: 100%;
}
.tbox-box {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.tbox-img1 {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}
.tbox-time {
  position: absolute;
  left: 30%;
  top: 60%;
  width: 40%;
}
.tbox-stars {
  position: absolute;
  left: 33%;
  top: 69.5%;
  right: 33%;
  bottom: 28.5%;
}
.tbox-stars img {
  float: left;
  width: 33.3333%;
}
.tbox-txt1 {
  position: absolute;
  left: 0;
  top: 78%;
  width: 100%;
  line-height: 1;
  color: #fff;
  text-align: center;
  font-size: 14px;
}
.tbox-txt1 span {
  color: #00ff12;
}
.tbox-btn1 {
  position: absolute;
  left: 31%;
  top: 81%;
  bottom: 8%;
  right: 31%;
}
.tbox-btn2 {
  position: absolute;
  right: 2.5%;
  bottom: 8.5%;
  left: 79%;
  top: 81%;
}
.tbox-btn1:active,
.tbox-btn2:active {
  opacity: .8;
}
.tbox-txt2 {
  position: absolute;
  left: 0;
  bottom: 2%;
  width: 100%;
  text-align: center;
}
.tbox-p1 {
  display: inline-block;
  font-size: 16px;
  padding: 0 1em;
  color: #fff;
  background-size: 100% 100%;
  line-height: 1.4;
  background: linear-gradient(to right, rgba(0,0,0,0), #000, #000, #000, rgba(0,0,0,0));
}
.tbox-p1 span {
  color: #f9e017;
}
.w100 {
  width: 100%;
}
.wh11 {
  width: 100%;
  height: 100%;
}
@media screen and (min-width: 500px) {
    .tbox-txt1 {
      font-size: 18px;
    }
    .tbox-p1 {
      font-size: 24px;
    }
}
</style>
