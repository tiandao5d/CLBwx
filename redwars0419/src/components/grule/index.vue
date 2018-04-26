<template>
  <div class="modal-item" v-show="isshow">
    <div class="mi-p1">
      <div class="mi-img1"><img :src="awi013"></div>
      <div class="mi-img2" @click="hide"><img :src="awi014"></div>
    </div>
  </div>
</template>

<script>
import awi013 from '@/assets/images/aw_013.png'
import awi014 from '@/assets/images/aw_014.png'

export default {
  data () {
    return {
      isshow: false,
      awi013,
      awi014
    }
  },
  methods: {
    show ( txt ) {
      this.isshow = true
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
  z-index: 10;
}
.mi-p1 {
  position: absolute;
  left: 0;
  top: 6%;
  width: 100%;
  text-align: center;
}
.mi-p1 img {
  width: 100%;
}
.mi-img1 {
 width: 100%;
}
.mi-img2 {
 width: 15%;
 margin: 10px auto 0;
}
</style>
