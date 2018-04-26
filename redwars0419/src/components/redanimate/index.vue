<template>
  <div class="modal-item" v-show="isshow">
    <div ref="anibox" class="ani-box"></div>
    <!-- 提前加载图片 -->
    <div class="imgloading-box">
      <img :src="isrc" v-for="isrc, index in iarr" :key="index">
      <img :src="awi033">
    </div>
  </div>
</template>

<script>
import awi033 from '@/assets/images/aw_033.png'
export default {
  data () {
    function getIarr () {
      var i = 0, arr = []
      while ( ++i <= 19 ) {
        arr[arr.length] = require('@/assets/images/cspn_0' + ( i < 10 ? ( '0' + i ) : i ) + '.png')
      }
      return arr
    }
    return {
      isshow: false,
      awi033,
      att: 0, // 请求结果的时间
      iarr: getIarr()
    }
  },
  methods: {
    // 红包雨
    redRain ( isrc, box ) {
      let _this = this,
          anics = box.querySelector('.ani-csimg')
      rdDiv()
      // 如果财神图存在就删除
      // 延时，有一定的红包时才会执行
      setTimeout( () => {
        if ( anics ) {
          anics.parentNode.removeChild(anics)
          _this.$emit('csafter') // 财神动画完成
        }
      }, 2000)
      // 最大和最小值之间的随机值
      function rdn () {
        var max = Math.max(arguments[0], arguments[1]),
          min = Math.min(arguments[0], arguments[1])
        return parseInt(Math.random() * (max - min) + min)
      }
      // 添加图片元素
      function rdDiv () {
        // 红包数量达到一定数量将不再增加
        if ( box.querySelectorAll('.imgbox').length >= 30 || !_this.isshow ) {
          return false;
        } else {
          setTimeout( () => {
            rdDiv()
          }, 200)
        }
        var imgbox = document.createElement('div')
        imgbox.className = 'imgbox animated'
        imgbox.innerHTML = '<img src="' + isrc + '">'
        eleCss(imgbox)
        imgbox.addEventListener('animationend', function () {
          if ( _this.isshow ) {
            this.classList.remove('animated')
            eleCss(this)
            setTimeout( () => {
              this.classList.add('animated')
            }, 0)
          }
        })
        box.appendChild(imgbox)
      }
      // 元素的飘动样式
      function eleCss ( ele ) {
        ele.style.width = (rdn(50, 20) + 'px')
        ele.style.left = (rdn(90, 10) + '%')
        ele.style.transform = ('rotate(' + rdn(45, -45) + 'deg)')
        ele.style.animationDuration = (rdn(8, 4) + 's')
      }
    },
    // 序列图财神
    sequencePlay ( box, iarr, s ) {
      var img = new Image(),
          lgn = iarr.length,
          ms = s*1000/lgn,
          i = 0,
          _this = this
      img.src = iarr[0]
      img.className = 'ani-csimg'
      img.style.width = '100%'
      box.appendChild(img)
      rep()
      function rep () {
        i++;
        // 播放序列图
        if ( i < lgn ) {
          setTimeout( () => {
            img.src = iarr[i]
            rep()
          }, ms)
        // 下红包雨
        } else {
          _this.redRain( awi033, box ) // 下红包雨
        }
      }
    },
    // 获取抽奖结果
    getDrawRe ( rno ) {
      let _url = `/ushop-api-merchant/api/sns/task/wishing/result/get/${rno}`,
          baset = 5000, // 重复请求的基数
          maxt = 60000 // 判断超时的最大值
      this.$xljs.ajax(_url, 'get', {}, ( data ) => {
        if ( data.status === 102 ) { // 未中奖
          this.handResult()
        } else if ( data.status === 103 ) {
          if ( data.result ) { // 中奖
            this.handResult(data)
          } else { // 未中奖
            this.handResult()
          }
        } else if ( this.att > maxt ) { // 请求超时当做未中奖
          this.handResult()
        } else {
          setTimeout(() => {
            this.att = this.att ? (this.att + baset) : baset // 重置抽奖结果计时
            this.getDrawRe(rno)
          }, baset)
        }
      }, false)
    },
    // 抽奖结果处理，跳转到首页
    handResult ( data ) {
      this.att = 0 // 重置抽奖结果计时
      this.$emit('dresult', data)
    },
    show () {
      this.isshow = true
      this.sequencePlay(this.$refs.anibox, this.iarr, 2)
    },
    hide () {
      this.att = 0 // 重置抽奖结果计时
      this.isshow = false
      this.$refs.anibox.innerHTML = '' // 清空红包容器
    }
  }
}
</script>

<style scoped>
.modal-item {
  z-index: 10;
}
.modal-item,
.ani-box {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
}
.ani-box {
  overflow: hidden;
}
</style>
<style>
@keyframes fttt{
  from{
    top: -100px;
  }
  to{
    top: 100%;
  }
}
.imgbox {
  position: absolute;
  top: -100px;
  left: 50px;
  width: 40px;
  transform: rotate(30deg);
}
.imgbox img {
  width: 100%;
}
.animated {
  animation: fttt ease-in-out both;
}
.ani-csimg {
  position: absolute;
  left: 0;
  top: 20%;
}
.imgloading-box {
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
