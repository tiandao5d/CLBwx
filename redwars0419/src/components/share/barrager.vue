<template>
  <canvas ref="canvasme">你的浏览器不支持canvas</canvas>
</template>
<script>
import Barrager from './barrager.js'
export default {
  props: {
    para: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      bapi: null
    }
  },
  watch: {
    para ( arr ) {
      if ( arr && arr[0] && !this.bapi ) {
        this.bapi = new Barrager(this.$refs.canvasme, this.para)
        this.bapi.init()
      }
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

