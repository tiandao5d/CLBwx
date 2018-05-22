<template>
  <div class="modal-item" v-show="isshow">
    <div class="rmi-p1">
      <div class="rmi-pcon">
        <img class="rmi-bg1" :src="awi015">
        <div class="rmi-err" v-if="!listarr[0]">{{errtxt}}</div>
        <div class="list-box" v-if="!!listarr[0]">
          <div class="list-item" v-for="item, index in listarr" :key="index">
            <div class="clearfix">
              <div class="li-l">{{item.ttime}}</div>
              <div class="li-r">
                <span style="color: #fe0115;">{{item.money}}</span>元红包
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="rmi-img1" @click="hide"><img :src="awi014"></div>
    </div>
  </div>
</template>

<script>
import awi014 from '@/assets/images/aw_014.png'
import awi015 from '@/assets/images/aw_015.png'

export default {
  data () {
    return {
      isshow: false,
      awi014,
      awi015,
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
            o.money = parseInt(o.rewardValue.awardValue)
            o.tdata = this.$xljs.msToTime(o.createTime)
            o.ttime = o.tdata['_m'] + '月' + o.tdata['_d'] + '日'
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
.rmi-p1 {
  position: absolute;
  left: 0;
  top: 6%;
  width: 100%;
}
.rmi-pcon {
  position: relative;
}
.rmi-bg1,
.rmi-img1 img {
 width: 100%;
}
.list-box,
.rmi-err {
  position: absolute;
  left: 17%;
  right: 17%;
  top: 44%;
  bottom: 10.5%;
}
.list-box {
  overflow-y: auto;
  overflow-x: hidden;
}
.list-item {
  position: relative;
  height: 16.66666%;
  line-height: 1;
  font-size: 15px;
  color: #000;
  display: flex;
  align-items: center;
}
.list-item:before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background-color: #efdcc4;
}
.list-item:first-child:before {
  height: 0;
}
.list-item .clearfix {
  width: 100%;
}
.li-l {
  float: left;
}
.li-r {
  float: right;
  text-align: right;
}
.rmi-img1 {
 width: 15%;
 margin: 10px auto 0;
}
.rmi-err {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
