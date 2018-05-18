<template>
  <div class="modal-item" v-show="isshow">
    <div class="mp-con">
      <img class="imgw100" :src="tte017">
      <div class="mp-ul">
        <div class="mp-li clearfix" v-if="listarr.length > 0">
          <div class="mp-txt1">时间</div>
          <div class="mp-txt2">奖励</div>
        </div>
        <div class="mp-li-null" v-else>没用获得任何奖励</div>
        <div class="mp-li clearfix" v-for="item, index in listarr" :key="index">
          <div class="mp-txt1">{{item.ttime}}</div>
          <div class="mp-txt2">{{item.text}}</div>
        </div>
      </div>
      <div class="mp-btn1 axbtn" @click="hide"></div>
    </div>
  </div>
</template>

<script>
import tte017 from '@/assets/images/tte017.png'

export default {
  data () {
    return {
      isshow: false,
      tte017,
      errtxt: '加载中……',
      listarr: []
    }
  },
  methods: {
    // 获取自己的红包数据
    getRedPacketArr () {
      let aid = this.$xljs.aid,
          _this = this,
          _url = '/ushop-api-merchant/api/sns/task/wishing/winner/listBy',
          _param = {id: aid, page: 1, rows: 10, self: 1}
      this.$xljs.ajax(_url, 'get', _param, ( data ) => {
        let arr = data.recordList || []
        if ( arr[0] ) {
          this.$xljs.each(arr, ( i, o ) => {
            o.rewardValue = JSON.parse(o.rewardValue)
            o.valarr = (o.rewardValue.awardValue + '').split('|')
            o.tdata = this.$xljs.msToTime(o.createTime)
            o.ttime = o.tdata['_m'] + '月' + o.tdata['_d'] + '日'
            o.text = (o.valarr[1] === '999') ? ( '现金红包' + o.valarr[0] + '元' ) : ( o.valarr[0] + '积分' )
          })
          this.listarr = arr
        } else {
          this.errtxt = '没有红包'
        }
      }, false)
    },
    show () {
      this.isshow = true
      this.getRedPacketArr()
    },
    hide () {
      this.isshow = false
    }
  }
}
</script>

<style scoped>
.modal-item {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,.6);
  z-index: 10;
}
.mp-con {
  position: absolute;
  left: 8.5%;
  top: 17%;
  width: 83%;
}
.mp-ul {
  position: absolute;
  left: 3%;
  top: 18%;
  right: 3.5%;
  bottom: 17%;
  overflow-x: hidden;
  overflow-y: auto;
}
.mp-li-null {
  color: #2f1000;
  font-size: 14px;
  line-height: 2;
  text-align: center;
}
.mp-li {
  border-bottom: solid 1px #d5ad85;
  color: #2f1000;
  font-size: 14px;
  line-height: 1.6;
  padding: 0 1em;
}
.mp-li .mp-txt1 {
  float: left;
}
.mp-li .mp-txt2 {
  float: right;
  text-align: right;
}
.mp-btn1 {
  position: absolute;
  top: 90%;
  bottom: 2%;
  left: 34%;
  right: 36%;
}
.mp-btn1:active {
  background-color: rgba(0,0,0,.2);
}
</style>
