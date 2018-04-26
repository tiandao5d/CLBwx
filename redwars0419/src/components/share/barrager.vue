<template>
  <canvas ref="canvasme" :class="{show: isshow}">你的浏览器不支持canvas</canvas>
</template>
<script>
import Barrager from './barrager.js'
export default {
  data () {
    return {
      isshow: false
    }
  },
  mounted () {
    // 弹幕数据
    if ( this.$xljs.winprizearr && this.$xljs.winprizearr[0] ) {
      this.isshow = true
      let api = new Barrager(this.$refs.canvasme, this.$xljs.winprizearr)
      api.init()
    }
  }
}
</script>

<style scoped>
canvas {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,.6);
  opacity: 0;
}
.show {
  opacity: 1;
}
</style>

