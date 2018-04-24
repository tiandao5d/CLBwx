<template>
  <div class="modal-item" v-show="isshow">
    <div class="dmi-p1">
      <img class="dmi-bg1" :src="awi016">
      <div class="dmi-txt">{{txt}}</div>
      <div class="dmi-btn1" @click="hide"><img :src="awi017"></div>
    </div>
  </div>
</template>

<script>
import awi016 from '@/assets/images/aw_016.png'
import awi017 from '@/assets/images/aw_017.png'

export default {
  data () {
    return {
      isshow: false,
      txt: '没有内容',
      awi016,
      awi017
    }
  },
  methods: {
    show ( txt ) {
      this.isshow = true
      this.txt = txt || '没有内容'
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
}
.dmi-p1 {
  position: absolute;
  left: 2%;
  top: 20%;
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
  font-size: 16px;
  line-height: 20px;
  text-align: center;
}
.dmi-btn1 {
  position: absolute;
  left: 40%;
  bottom: 19%;
  width: 20%;
}
</style>
