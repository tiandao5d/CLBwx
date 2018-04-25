<template>
  <div class="modal-item" v-show="isshow">
    <div class="wp-box1">
      <img class="wp-bg wp-bg1 wp-spin" :src="awi028">
      <img class="wp-bg" :src="awi029">
      <img class="wp-bg" :src="awi030" v-if="iswin">
      <div class="wp-p1">
        <img :src="cunwp">
      </div>
      <div class="wp-p2" v-if="iswin">
        <img :src="awi031">
      </div>
      <div class="wp-btn1" @click="hide">
        <img :src="awi032">
      </div>
    </div>
  </div>
</template>

<script>
import awi018 from '@/assets/images/aw_018.png'
import awi019 from '@/assets/images/aw_019.png'
import awi020 from '@/assets/images/aw_020.png'
import awi021 from '@/assets/images/aw_021.png'
import awi022 from '@/assets/images/aw_022.png'
import awi023 from '@/assets/images/aw_023.png'
import awi024 from '@/assets/images/aw_024.png'
import awi025 from '@/assets/images/aw_025.png'
import awi026 from '@/assets/images/aw_026.png'
import awi027 from '@/assets/images/aw_027.png'
import awi028 from '@/assets/images/aw_028.png'
import awi029 from '@/assets/images/aw_029.png'
import awi030 from '@/assets/images/aw_030.png'
import awi031 from '@/assets/images/aw_031.png'
import awi032 from '@/assets/images/aw_032.png'

export default {
  data () {
    return {
      isshow: false,
      cunwp: awi018, // 显示的奖等或者未中奖文字
      prizen: [awi018, awi019, awi020, awi021, awi022], // 未中奖文字，随机选择一个
      prizey: [awi023, awi024, awi025, awi026, awi027], // 中奖的奖等，第一个是一等奖
      iswin: false, // 是否中奖
      awi028,
      awi029,
      awi030,
      awi031,
      awi032
    }
  },
  methods: {
    show ( obj ) {
      this.isshow = true
      if ( obj ) { // 中奖了
        this.iswin = true
        // index = 1 表示一等奖，2表示二等奖以此类推
        this.cunwp = this.prizey[(obj.result.index - 1)]
      } else { // 未中奖
        this.iswin = false
        this.cunwp = this.prizen[Math.floor(Math.random() * this.prizen.length)] // 随机未中奖
      }
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
  overflow: hidden;
  background-color: rgba(0,0,0,.6);
}
.wp-box1 {
  position: absolute;
  left: -17%;
  top: 6%;
  width: 134%;
}
.wp-bg {
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
.wp-p1,
.wp-p2,
.wp-btn1 {
  position: absolute;
  left: 35%;
  top: 35%;
  width: 30%;
}
.wp-p1 img,
.wp-p2 img,
.wp-btn1 img {
  width: 100%;
}
.wp-p2 {
  top: 57%;
  left: 40%;
  width: 21%;
}
.wp-btn1 {
  top: 66%;
  left: 42%;
  width: 16%;
}
</style>
