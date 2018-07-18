<template>
  <xl-redrain v-if="showstr === 1"/>
  <xl-turntable v-else-if="showstr === 2"/>
  <div class="home-err" v-else>{{errstr}}</div>
</template>

<script>

import XlRedrain from '@/components/redrain' // 红包雨
import XlTurntable from '@/components/turntable' // 抽奖转盘
export default {
  data () {
    return {
      showstr: 0, // 渲染红包雨还是渲染抽奖转盘，1红包雨，2转盘
      errstr: ''
    }
  },
  mounted () {
    let actData = this.$xljs.storageL(this.$xljs.sessionAct, null, true) || {},
        ttype = actData.template + ''
    if ( ttype === '1' ) { // 红包雨
      this.showstr = 1
    } else if ( ttype === '2' ) { // 抽奖转盘
      this.showstr = 2
    }
  },
  components: {
    XlRedrain,
    XlTurntable
  }
}
</script>
<style scoped>
.home-err {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color:  #ed5565;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
</style>
