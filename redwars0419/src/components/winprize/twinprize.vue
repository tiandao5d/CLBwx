<template>
  <transition name="diaani">
    <div class="modal-item" v-show="isshow">
      <div class="wp-box1">
        <div v-show="!redShow">
          <img class="wp-bg wp-bg1 wp-spin" :src="awi028">
          <img class="wp-bg" :src="awi029">
          <img class="wp-bg" :src="awi030" v-if="(cunwp instanceof Array)">
          <div class="wp-p1">
            <!-- 中奖 -->
            <div class="win-ibox a0000" v-if="(cunwp instanceof Array)">
              <div class="win-it"><img :src="levArr[award]"></div>
              <div class="win-ib" :class="[winclass]">
                <img :src="num" v-for="num, index in cunwp" :key="index">
                <img :src=" (funType === '999') ? levArr[0] : levd">
              </div>
            </div>
            <!-- 未中奖 -->
            <img :src="cunwp" v-else>
          </div>
          <div class="wp-p2" v-if="(cunwp instanceof Array)">
            <img :src="awi031">
          </div>
          <!-- <div class="a0000"></div> -->
          <div class="wp-twocode">
            <img :src="awi036" class="imgw100">
          </div>
          <div class="wp-btn1" @click="btnClick">
            <img :src="awi032">
          </div>
        </div>
        <div class="wp-bigred" v-show="!!redShow">
          <img :src="awi035">
          <div class="a0000" @click="bigredClick"></div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import awi018 from '@/assets/images/aw_018.png'
import awi019 from '@/assets/images/aw_019.png'
import awi020 from '@/assets/images/aw_020.png'
import awi021 from '@/assets/images/aw_021.png'
import awi022 from '@/assets/images/aw_022.png'
import awi028 from '@/assets/images/aw_028.png'
import awi029 from '@/assets/images/aw_029.png'
import awi030 from '@/assets/images/aw_030.png'
import awi031 from '@/assets/images/aw_031.png'
import awi032 from '@/assets/images/aw_032.png'
import awi035 from '@/assets/images/aw_035.png'
import awi036 from '@/assets/images/aw_036.png'

import num0 from '@/assets/images/num0.png'
import num1 from '@/assets/images/num1.png'
import num2 from '@/assets/images/num2.png'
import num3 from '@/assets/images/num3.png'
import num4 from '@/assets/images/num4.png'
import num5 from '@/assets/images/num5.png'
import num6 from '@/assets/images/num6.png'
import num7 from '@/assets/images/num7.png'
import num8 from '@/assets/images/num8.png'
import num9 from '@/assets/images/num9.png'

import lev1 from '@/assets/images/lev1.png'
import lev2 from '@/assets/images/lev2.png'
import lev3 from '@/assets/images/lev3.png'
import lev4 from '@/assets/images/lev4.png'
import lev5 from '@/assets/images/lev5.png'
import levy from '@/assets/images/tte019.png'
import levd from '@/assets/images/tte018.png'

export default {
  data () {
    return {
      isshow: false, // 模块显示与否
      redShow: false, // 红包显示与否
      cunwp: awi018, // 显示的奖等或者未中奖文字，字符串表示未中奖，数组表示中奖
      prizen: [awi018, awi019, awi020, awi021, awi022], // 未中奖文字，随机选择一个
      numArr: [num0, num1, num2, num3, num4, num5, num6, num7, num8, num9], // 数字图片
      levArr: [levy, lev1, lev2, lev3, lev4, lev5], // 奖等图片
      levd,
      funType: '',
      award: 0,
      awi028,
      awi029,
      awi030,
      awi031,
      awi032,
      awi035,
      awi036
    }
  },
  methods: {
    getNumImg ( num ) {
      let narr = (parseInt(num) + '').split(''),
          iarr = []
      this.$xljs.each(narr, ( i, n ) => {
        iarr[iarr.length] = this.numArr[parseInt(n)]
      })
      return iarr
    },
    show ( obj ) {
      this.redShow = true
      this.isshow = true
      if ( obj ) { // 中奖了
        let p = obj.result || {}
        // index = 1 表示一等奖，2表示二等奖以此类推
        this.cunwp = this.getNumImg(p.awardValue)
        this.funType = p.awardValue.split('|')[1]
        this.award = p.index
        this.winclass = ( this.cunwp.length > 5 ) ? 'xs' : ( ( this.cunwp.length > 3 ) ? 'md' : '' )
      } else { // 未中奖
        this.cunwp = this.prizen[Math.floor(Math.random() * this.prizen.length)] // 随机未中奖
      }
    },
    hide () {
      this.isshow = false
    },
    btnClick () {
      this.$emit('close')
    },
    bigredClick () {
      this.redShow = false
    }
  }
}
</script>

<style scoped>
.modal-item {
  z-index: 20;
}
.wp-box1 {
  position: absolute;
  left: -17%;
  top: 8%;
  width: 134%;
}
.wp-bg,
.wp-bigred {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}
.wp-bg1 {
  position: relative;
}
.wp-spin {
  transform-origin:50% 50%;
  animation: spin 8s infinite linear;
}
.wp-p1 img,
.wp-p2 img,
.wp-btn1 img,
.wp-bigred img,
.imgw100 {
  width: 100%;
}
.wp-p1 {
  position: absolute;
  left: 35%;
  top: 35%;
  width: 30%;
  height: 19%;
}
.wp-p2 {
  position: absolute;
  top: 57%;
  left: 40%;
  width: 21%;
}
.wp-btn1 {
  position: absolute;
  top: 66%;
  left: 42%;
  width: 16%;
}
.win-it {
  position: absolute;
  left: 15%;
  top: 0;
  height: 50%;
  width: 70%;
  margin: 0 auto;
}
.win-ib {
  position: absolute;
  left: 0;
  bottom: 7%;
  width: 100%;
  height: 32%;
  font-size: 0;
  text-align: center;
}
.win-ib img {
  height: 100%;
  width: auto;
}
.win-ib.md {
  bottom: 16%;
  height: 20%;
}
.win-ib.xs {
  bottom: 16%;
  height: 16%;
}
.wp-twocode {
  position: absolute;
  left: 22.4%;
  top: 65.6%;
  right: 65.1%;
  bottom: 21.6%;
}
.diaani-enter-active {
  animation: bounce-in .5s;
}
.diaani-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>
