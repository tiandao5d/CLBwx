<template>
  <div class="modal-item" v-show="isshow">
    <div class="dmi-p1" v-show="!showp2">
      <img class="dmi-bg1" :src="awi016">
      <div class="dmi-txt">{{txt}}</div>
      <div class="a0000"></div>
      <div class="dmi-btn1" @click="showp2 = true"><img :src="awi017"></div>
    </div>
    <div class="dmi-p2" v-show="!!showp2">
      <img :src="awi034">
      <div class="dim-share" @click="hide"></div>
    </div>
  </div>
</template>

<script>
import awi016 from '@/assets/images/aw_016.png'
import awi017 from '@/assets/images/aw_017.png'
import awi034 from '@/assets/images/aw_034.png'

export default {
  data () {
    return {
      isshow: false,
      txt: '没有内容',
      awi016,
      showp2: false,
      awi017,
      awi034
    }
  },
  methods: {
    show ( txt ) {
      this.isshow = true
      this.txt = txt || '没有内容'
    },
    hide () {
      this.showp2 = false
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
.dmi-p1 {
  position: absolute;
  left: 2%;
  top: 35%;
  width: 96%;
  text-align: center;
}
.dmi-bg1,
.dmi-btn1 img {
  width: 100%;
}
.dmi-txt {
  position: absolute;
  left: 13%;
  top: 27%;
  width: 76%;
  height: 25%;
  color: #000;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
}
.dmi-btn1 {
  position: absolute;
  left: 40%;
  bottom: 19%;
  width: 20%;
}
.dmi-p2 {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}
.dmi-p2 img {
  width: 100%;
}
.dim-share {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
