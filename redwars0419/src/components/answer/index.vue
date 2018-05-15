<template>
  <div class="answer-item" v-show="isshow">
    <div class="list-box">
      <transition leave-active-class="animated fadeOut" :enter-active-class="'animated ' + anis">
        <div class="list-item" :key="itemshow">{{item}}</div>
      </transition>
    </div>
    {{itemshow}}
    <x-button type="primary" @click.native="btnclick">primary</x-button>
  </div>
</template>

<script>

import 'animate.css'

export default {
  data () {
    return {
      isshow: false, // 容器显示与否
      itemshow: 0, // 内容显示哪一个
      anis: 'tada', // 动效
      dataarr: [1,2,3,4,5,6,7,8,9], // 列表内容数组
      anisarr: ['bounceIn','bounceInDown','bounceInLeft','bounceInRight','bounceInUp','fadeIn','fadeInDown','fadeInDownBig','fadeInLeft','fadeInLeftBig','fadeInRight','fadeInRightBig','fadeInUp','fadeInUpBig','flipInX','flipInY','lightSpeedIn','rotateIn','rotateInDownLeft','rotateInDownRight','rotateInUpLeft','rotateInUpRight','slideInUp','slideInDown','slideInLeft','slideInRight','zoomIn','zoomInDown','zoomInLeft','zoomInRight','zoomInUp','jackInTheBox','rollIn'] // 可用特效
    }
  },
  mounted () {
    this.init()
  },
  computed: {
    item () {
      let i = 0
      this.$xljs.each(this.dataarr, ( index, obj ) => {
        if ( index === this.itemshow ) {
          i = obj
        }
      })
      return i
    }
  },
  methods: {
    init () {
      console.log(123)
    },
    btnclick () {
      this.getAnis()
      this.itemshow = parseInt(Math.random()*this.dataarr.length)
    },
    getAnis () {
      let ns = this.anisarr[parseInt(Math.random()*this.anisarr.length)]
      if ( ns && !(ns === this.anis) ) {
        this.anis = ns
      } else {
        this.getAnis()
      }
    }
  },
  components: {
  }
}
</script>

<style scoped>
.answer-item {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 10;
}
.list-box {
  position: relative;
  height: 200px;
}
.list-item {
  position: absolute;
  left: 30%;
  top: 50px;
  width: 100px;
  height: 100px;
  background-color: #f00;
}
</style>
