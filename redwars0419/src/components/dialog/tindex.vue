<template>
  <div class="modal-item" v-show="isshow">
    <div class="te-img">
      <img :src="tte002">
      <div class="a0000"></div>
      <button class="te-btn1" @click="hide"></button>
      <div class="tee-txt1">2018年3月1日—2018年6月1日</div>
      <div class="tee-txt2">1、进入活动后开始答题，根据题目从下方的选项中选出正确答案；</div>
    </div>
  </div>
</template>

<script>
import tte002 from '@/assets/images/tte002.png'

export default {
  data () {
    return {
      isshow: false,
      tte002
    }
  },
  methods: {
    show ( txt ) {
      this.isshow = true
    },
    hide () {
      this.showp2 = false
      this.isshow = false
    }
  }
}
</script>

<style scoped>
.te-img {
  position: absolute;
  width: 85%;
  left: 50%;
  top: 50%;
  transform: translate(-49%, -50%);
}
.te-img img {
  width: 100%;
}
.te-btn1 {
  position: absolute;
  right: 0;
  top: 3%;
  width: 11%;
  padding-top: 11%;
  border-radius: 50%;
  border: 0;
  background-color: transparent;
}
.te-btn1:active {
  background-color: rgba(249,255,20,.3);
}
.tee-txt1,
.tee-txt2 {
  position: absolute;
  left: 0;
  width: 100%;
  padding: 0 8% 0 4%;
  color: #2f1000;
}
.tee-txt1 {
  top: 20%;
  text-align: center;
  font-size: 14px;
}
.tee-txt2 {
  top: 39%;
  font-size: 12px;
}
.tee-txt1 span,
.tee-txt2 span {
  width: 100%;
  display: block;
  height: 30px;
  background-color: #f00;
}
</style>
