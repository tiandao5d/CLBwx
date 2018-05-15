<template>
  <div>
    <div ref="turntable" class="gb-turntable">
      <div class="gb-turntable-container"></div>
      <a class="gb-turntable-btn" href="javascript:;">抽奖</a>
    </div>
    <button @click="prizeStart">132</button>
  </div>
</template>
<script>
import Turntable from './turntable.js'
import awi023 from '@/assets/images/aw_023.png'
export default {
  data () {
    return {
      isshow: false
    }
  },
  mounted () {
    let gbTurntable = new Turntable() //初始化转盘
    let _this = this,
        cwidth = 240,
        ele = _this.$refs.turntable,

        //抽奖概率和提示信息的配置
        chance = [{
            id: 0,
            txt: '1元红包'
          },
          {
            id: 1,
            txt: '2元红包'
          },
          {
            id: 2,
            txt: '3元红包'
          },
          {
            id: 3,
            txt: '4元红包'
          },
          {
            id: 4,
            txt: '5元红包'
          },
          {
            id: 5,
            txt: '6元红包'
          },
          {
            id: 6,
            txt: '7元红包'
          },
          {
            id: 7,
            txt: '8元红包'
          }
        ],
        opts = {
          ele: ele,
          width: cwidth,
          config: function(callback) {
            // 获取奖品信息
            let carr = []
            _this.$xljs.each(chance, ( index, obj ) => {
              carr[carr.length] = `<div class="prize-box"><i style="font-size: ${cwidth * 0.05}px">${obj.txt}</i><img style="width: ${cwidth * 0.125}'px;height: ${cwidth * 0.125}px" src="${awi023}"></div>`
            })
            callback && callback(carr)
          },
          // 转盘完成后执行
          gotBack ( data, id ) {
            let a, i = 0
            _this.$vux.toast.text(chance[id]['txt'])
          }
        }
    _this.gbTurntable = gbTurntable
    gbTurntable.init(opts)
  },
  methods: {
    getTurnConfig () {
      var actData = this.$xljs.storageL(this.$xljs.sessionAct)
    },
    // 获取任务可参与的次数
    getChanceNum ( id, callback = function () {} ) {
      let _url = `/ushop-api-merchant/api/sns/task/wishing/done/get/${id}`
      this.$xljs.ajax(_url, 'get', {}, ( data ) => {
        callback(data)
      })
    },
    // 抽奖开始
    prizeStart ( num, chances ) {
      // 获取中奖信息
      num = (Math.floor(Math.random() * 8)); //对应奖品的数据ID
      chances = 1; // 可抽奖次数，当值为0时将是最后一次执行
      this.gbTurntable.pstart([num, chances])
    }
  }
}
</script>
<style scoped>
.gb-turntable {
  position: relative;
  border-radius: 50%;
  border: 16px solid #E44025;
  box-shadow: 0 2px 3px #333, 0 0 2px #000;
  margin: -0 auto;
  box-sizing: content-box;
}

.gb-turntable-container {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  width: inherit;
  height: inherit;
  border-radius: inherit;
  background-clip: padding-box;
  background-color: #ffcb3f;
}

.gb-turntable-btn {
  position: absolute;
  z-index: 3;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  color: #F4E9CC;
  background-color: #E44025;
  line-height: 80px;
  text-align: center;
  font-size: 20px;
  text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.6);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.6);
  text-decoration: none;
}

.gb-turntable-btn::after {
  position: absolute;
  display: block;
  content: '';
  left: 10px;
  top: -46px;
  width: 0;
  height: 0;
  overflow: hidden;
  border-width: 30px;
  border-style: solid;
  border-color: transparent;
  border-bottom-color: #E44025;
}

.gb-turntable-btn.disabled {
  pointer-events: none;
  background: #B07A7B;
  color: #ccc;
}

.gb-turntable-btn.disabled::after {
  border-bottom-color: #B07A7B;
}

.gb-turntable-btn:active:after {
  border-bottom-color: #B07A7B;
}

.gb-turntable-btn:active {
  background: #B07A7B;
}

.gb-turntable a.gb-turntable-btn {
  border: none;
}

.linear360 {
  animation-fill-mode: both;
  animation-name: lineart;
  animation-iteration-count: 1;
  animation-duration: .4s;
  animation-timing-function: linear;
}

.easeout360 {
  transition: all 3s ease-out;
}
@keyframes lineart {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
<style>
.gb-turntable-container canvas {
  border-radius: 50%;
}

.gb-turntable ul,
.gb-turntable li {
  margin: 0;
  padding: 0;
  list-style: none;
}

.gb-turntalbe-list {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.gb-turntable-item {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  color: #e4370e;
  font-weight: bold;
  line-height: 1;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
}

.gb-turntable-item span {
  position: relative;
  display: block;
  padding-top: 10px;
  margin: 0 auto;
  text-align: center;
}

.gb-turntable-item i {
  font-style: normal;
}
.prize-box img {
  display: block;
  width: 30px;
  margin: 5px auto 0;
}
</style>

