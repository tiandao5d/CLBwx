<template>
  <div id="app">
    <router-view v-if="!loading"></router-view>
    <div class="loader-box" v-if="!!loading">
      <div class="loader-con">
        <div class="loader-inner line-scale">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="loader-txt">{{txt}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      loading: true,
      txt: '加载中……'
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      var du = this.$xljs.deCodeUrl(), // 浏览器url记录的参数数据
          ds = this.$xljs.storageL(this.$xljs.sessionAct, null, true) || {}, // 本地储存的活动数据
          aid = du.id || ds.id
      if ( aid ) {
        this.$xljs.aid = aid
        this.getInitData()
      } else {
        this.txt = '没有ID'
      }
    },
    // 获取初始基本数据
    getInitData ( callback = function () {} ) {
      let aid = this.$xljs.aid,
          aArr = [
            {url: `/ushop-api-merchant/api/sns/task/detail/get/${aid}`}, // 活动详情
            {url: '/ushop-api-merchant/api/sns/task/wishing/winner/listBy', data: {id: aid, page: 1, rows: 10}, method: 'get'}
          ]
      this.$xljs.ajaxAll(aArr, ( ...args ) => {
        let actData = args[0], // 活动详情数据
            winArr = args[1].recordList || [] // 中奖列表，用于弹幕
        if ( actData.id ) {
          // 获取助力任务数据
          this.getAssActDa(actData.assistanceId, (zdata) => {
            if ( zdata.id ) {
              actData.zdata = zdata;
              this.$xljs.storageL(this.$xljs.sessionAct, actData, true)
            } else {
              this.$vux.toast.text('助力数据请求失败')
            }
            this.loading = false // 解除遮屏
          });
          this.$xljs.winprizearr = this.paraFormat ( winArr )
        } else {
          this.$vux.toast.text('活动数据请求失败')
        }
      });
    },
    // 获取助力任务数据
    getAssActDa ( zid, callback = function () {} ) {
      let _url = `/ushop-api-merchant/api/sns/task/detail/get/${zid}`
      this.$xljs.ajax(_url, 'get', {}, ( data ) => {
        callback(data)
      });
    },
    // 弹幕数据格式化
    paraFormat ( winArr = [] ) {
      let arr = [], txt = ''
      try {
        this.$xljs.each( winArr, ( index, obj ) => {
          txt = `${obj.userName} 获得 ${JSON.parse(obj.rewardValue).awardName}`
          arr[arr.length] = {msg: txt}
        })
      } catch ( err ) {
        arr[arr.length] = {msg: '数据错误'}
      }
      return arr
    }
  }
}
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';

body {
  background-color: #fbf9fe;
}
#app {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.loader-box {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #ed5565;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 999999999;
}
.loader-txt {
  color: #fff;
  font-size: 16px;
  padding-top: 10px;
}


/**
 * Lines
 */

@-webkit-keyframes line-scale {
  0% {
    -webkit-transform: scaley(1);
    transform: scaley(1);
  }

  50% {
    -webkit-transform: scaley(0.4);
    transform: scaley(0.4);
  }

  100% {
    -webkit-transform: scaley(1);
    transform: scaley(1);
  }
}

@keyframes line-scale {
  0% {
    -webkit-transform: scaley(1);
    transform: scaley(1);
  }

  50% {
    -webkit-transform: scaley(0.4);
    transform: scaley(0.4);
  }

  100% {
    -webkit-transform: scaley(1);
    transform: scaley(1);
  }
}
.line-scale>div:nth-child(1) {
  -webkit-animation: line-scale 1s 0.1s infinite cubic-bezier(.2, .68, .18, 1.08);
  animation: line-scale 1s 0.1s infinite cubic-bezier(.2, .68, .18, 1.08);
}

.line-scale>div:nth-child(2) {
  -webkit-animation: line-scale 1s 0.2s infinite cubic-bezier(.2, .68, .18, 1.08);
  animation: line-scale 1s 0.2s infinite cubic-bezier(.2, .68, .18, 1.08);
}

.line-scale>div:nth-child(3) {
  -webkit-animation: line-scale 1s 0.3s infinite cubic-bezier(.2, .68, .18, 1.08);
  animation: line-scale 1s 0.3s infinite cubic-bezier(.2, .68, .18, 1.08);
}

.line-scale>div:nth-child(4) {
  -webkit-animation: line-scale 1s 0.4s infinite cubic-bezier(.2, .68, .18, 1.08);
  animation: line-scale 1s 0.4s infinite cubic-bezier(.2, .68, .18, 1.08);
}

.line-scale>div:nth-child(5) {
  -webkit-animation: line-scale 1s 0.5s infinite cubic-bezier(.2, .68, .18, 1.08);
  animation: line-scale 1s 0.5s infinite cubic-bezier(.2, .68, .18, 1.08);
}

.line-scale>div {
  background-color: #fff;
  width: 4px;
  height: 35px;
  border-radius: 2px;
  margin: 2px;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  display: inline-block;
}

</style>
