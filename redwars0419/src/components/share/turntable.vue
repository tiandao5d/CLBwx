<template>
  <div class="page-item">
    <div class="page-con">
      <img class="w100" :src="tte015">
      <div class="turn-box" ref="turnbox">
        <div ref="turntable" class="gb-turntable">
          <div class="gb-turntable-container"></div>
          <img class="gb-pointer" :src="tte016">
        </div>
      </div>
      <div class="start-btn" ref="startbtn"></div>
      <div class="turn-txt1"><span>{{pnum}}</span></div>
      <div class="mpshow-btn" @click="showMyprize"></div>
      <div class="turn-btxt"><div class="turn-bp">当前还有<span>{{rewardPool}}</span>元奖品待领取</div></div>
      <!-- 中奖弹窗 -->
      <xl-prize ref="xlprize" @close="winpClose" />
      <xl-myprize ref="myprize" />
    </div>
    <!-- 提前加载图片 -->
    <div class="imgloading-box" ref="iload">
      <img :src="tte015" @load="imgloading">
    </div>
    <xl-load :isshow="loading"/>
  </div>
</template>
<script>
import XlLoad from '@/components/share/loading.vue'
import Turntable from './turntable.js'
import XlPrize from '@/components/winprize/twinprize.vue' // 红包弹窗
import XlMyprize from '@/components/turntable/myprize.vue' // 中奖列表

import tte015 from '@/assets/images/tte015.jpg'
import tte016 from '@/assets/images/tte016.png'
export default {
  data () {
    return {
      loading: true, // 加载中显示
      gbTurntable: null, // 记录转盘对象
      tte015,
      tte016,
      rewardPool: 0, // 奖池金额
      count: 0 // 可抽奖次数
    }
  },
  computed: {
    pnum () {
      let actData = this.$xljs.storageL(this.$xljs.sessionAct, null, true),
          cv = parseInt(actData.participateTime) || 0, // 总共可以抽奖的次数
          count = parseInt(this.count) || 0 // 剩余可以抽奖的次数
      count = count > 0 ? count : 0
      return ( ( cv - count ) + '/' + cv )
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    // 图片加载加载
    imgloading () {
      let box = this.$refs.iload,
          imgs = box.querySelectorAll('img'),
          num = box.num || 1
      if ( num >= imgs.length ) {
        this.loading = false
      } else {
        box.num = ++num
      }
    },
    init () {
      let actData = this.$xljs.storageL(this.$xljs.sessionAct, null, true)
      this.rewardPool = parseInt(actData.rewardPool)
      this.canvasInit()
      // 屏幕变化时改变转盘的大小
      window.addEventListener('resize', () => {
        if ( this.gbTurntable ) {
          this.gbTurntable.draw({ // 重新绘制内容
            width: this.$refs.turnbox.offsetWidth
          })
        }
      })
      this.getChanceNum((data) => {
        this.count = parseInt(data.count) || 0 // 剩余可以抽奖的次数
      })
    },
    // 获取任务可参与的次数
    getChanceNum ( callback = function () {} ) {
      let _url = `/ushop-api-merchant/api/sns/task/wishing/done/get/${this.$xljs.aid}`
      this.$xljs.ajax(_url, 'get', {}, ( data ) => {
        callback(data)
      })
    },
    // 用户抽奖，获取抽奖流水号
    getUserDraw ( callback = function () {}) {
      this.$xljs.ajaxAll([
        {url: `/ushop-api-merchant/api/sns/task/wishing/draw/${this.$xljs.aid}`, method: 'post'}, // 获取流水号
        {url: `/ushop-api-merchant/api/sns/task/wishing/done/get/${this.$xljs.aid}`} // 获取抽奖次数
      ], ( ...args ) => {
        callback( args[0].requestNo, args[1].count )
      }, false)
    },
    // 获取抽奖结果
    getDrawRe ( callback ) {
      let _this = this,
          att = 0
      this.$vux.loading.show({
        text: '转盘启动中……'
      })
      this.count--
      this.getUserDraw( ( requestNo, count ) => {
        if ( count > 0 ) {
          if ( requestNo ) {
            getResultFn(requestNo)
          } else {
            this.$vux.loading.hide()
            this.$vux.toast.text('错误：抽奖失败')
          }
        } else {
          this.$vux.loading.hide()
          this.$refs.startbtn.classList.add('disabled')
          this.$vux.toast.text('抽奖次数用完了')
        }
      })
      function resultAfterFn ( data ) {
        _this.$vux.loading.hide()
        callback(data)
      }
      // 抽奖结果查询
      function getResultFn ( rno ) {
        let _url = `/ushop-api-merchant/api/sns/task/wishing/result/get/${rno}`,
            baset = 1000, // 重复请求的基数
            maxt = 10000 // 判断超时的最大值
        // 如果超过规定时间还未请求到结果，改变重复请求的基数
        if ( att > 5000 ) {
          baset = 2000
        }
        _this.$xljs.ajax(_url, 'get', {}, ( data ) => {
          if ( data.status === 102 ) { // 未中奖
            resultAfterFn()
          } else if ( data.status === 103 ) {
            if ( data.result ) { // 中奖
              resultAfterFn(data)
            } else { // 未中奖
              resultAfterFn()
            }
          } else if ( att > maxt ) { // 请求超时当做未中奖
            resultAfterFn()
          } else {
            setTimeout(() => {
              att = att ? (att + baset) : baset // 重置抽奖结果计时
              getResultFn(rno)
            }, baset)
          }
        }, false)
      }
    },
    canvasInit () {
      this.gbTurntable = new Turntable() //初始化转盘
      this.gbTurntable.init(this.getCotps())
    },
    // 获取轮盘参数
    getCotps () {
      let _this = this,
          ele = this.$refs.turntable,
          cwidth = this.$refs.turnbox.offsetWidth,
          btn = this.$refs.startbtn,
          chance = this.getChance(),
          cunwin = null
      cwidth = ((cwidth > 0) ? cwidth : 240)
      return  {
                ele: ele,
                width: cwidth,
                config: function(callback) {
                  // 获取奖品信息
                  let carr = []
                  _this.$xljs.each(chance, ( index, obj ) => {
                    carr[carr.length] = `<div class="prize-box"><i style="font-size: ${cwidth * 0.03}px">${obj.txt}</i><img style="width: ${cwidth * 0.125}'px;height: ${cwidth * 0.125}px" src="${tte016}"></div>`
                  })
                  callback && callback(carr)
                },
                // 点击按键立马执行
                getPrize: function(callback) {
                  if ( !_this.$xljs.startAnswer ) {
                    _this.$vux.toast.text('请按流程走')
                    return false
                  }
                  // 获取中奖信息
                  _this.getDrawRe(( obj ) => {
                    let p = (obj || {}).result || {},
                        num = ( parseInt(p.index) - 1 )
                    if ( !( num >= 0 ) ) { // 当成未中奖处理
                      num = ( chance.length - 1 )
                    }
                    cunwin = obj
                    callback && callback([num, 1])
                  })
                },
                btn: btn,
                // 转盘完成后执行
                gotBack ( data, id ) {
                  let a, i = 0
                  _this.showPrize(cunwin)
                  // _this.$vux.toast.text(chance[id]['txt'])
                }
              }
    },
    // 过去内容数组
    getChance () {
      let actData = this.$xljs.storageL(this.$xljs.sessionAct, null, true), // 活动数据
          rvarr = JSON.parse(actData.rewardValue), // 奖等数据
          arr = [],
          aval = null,
          lgn = rvarr.length
      this.$xljs.each(rvarr, ( index, obj ) => {
        aval = (obj.awardValue + '').split('|')
        arr[index] = {
          id: index,
          txt: ( aval[1] === '999' ) ? ( aval[0] + '元' ) : ( aval[0] + '彩豆' ),
          img: obj.ico || '',
          obj: obj
        }
      })
      arr[lgn] = { // 添加未中奖的格子
          id: lgn,
          txt: '未中奖',
          img: ''
      }
      return arr
    },
    // 显示中奖弹窗
    // 参数为中奖数据
    showPrize ( obj ) {
      this.$refs.xlprize.show( obj )
    },
    // 显示红包列表
    showMyprize () {
      this.$refs.myprize.show()
    },
    // 关闭中奖弹窗
    winpClose () {
      this.$xljs.startAnswer = false
      this.$router.push('/')
      this.$refs.xlprize.hide() // 中奖弹窗关闭
    }
  },
  components: {
    XlPrize,
    XlMyprize,
    XlLoad
  }
}
</script>
<style scoped>
.turn-box {
  position: absolute;
  left: 20.6%;
  right: 20.1%;
  top: 21.6%;
  bottom: 41.5%;
}
.start-btn {
  position: absolute;
  left: 34.8%;
  top: 82.7%;
  right: 35%;
  bottom: 11.5%;
  border-radius: 5px;
}
.start-btn:active,
.start-btn.disabled {
  background-color: rgba(0,0,0,.2);
}
.gb-turntable {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
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
  transition: transform 6s ease;
}
.gb-pointer {
  position: absolute;
  left: 39.5%;
  top: 20%;
  width: 21%;
  z-index: 10;
}
.turn-txt1 {
  position: absolute;
  top: 71.25%;
  left: 38%;
  right: 38%;
  font-size: 16px;
  color: #fff600;
  text-align: center;
  background: linear-gradient(to right, rgba(0,0,0,0),rgba(0,0,0,0.2), rgba(0,0,0,0.2), rgba(0,0,0,0.2), rgba(0,0,0,0));
}
.turn-btxt {
  position: absolute;
  bottom: 3%;
  left: 0;
  width: 100%;
  text-align: center;
}
.turn-bp {
  display: inline-block;
  padding: 0 1em;
  font-size: 16px;
  color: #fff;
  background: linear-gradient(to right, rgba(0,0,0,0), #ff960d, #ff960d, #ff960d, rgba(0,0,0,0));
}
.turn-bp span {
  color: #f00;
}
.mpshow-btn {
  position: absolute;
  right: 12%;
  top: 78%;
  left: 70%;
  bottom: 10%;
}
@keyframes lineart {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(1080deg);
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
  color: #fff;
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
.w100 {
  width: 100%;
}
.wh11 {
  width: 100%;
  height: 100%;
}
</style>

