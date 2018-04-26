<template>
  <canvas ref="canvasme">你的浏览器不支持canvas</canvas>
</template>
<script>
import Barrager from './barrager.js'
export default {
  mounted () {
    // 弹幕数据
    let arr =   (this.$xljs.winprizearr && this.$xljs.winprizearr[0]) ?
                this.$xljs.winprizearr :
                [{msg: '暂无人中奖'}]
    if ( arr && arr[0] ) {
      let api = new Barrager(this.$refs.canvasme, arr)
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
}
</style>

