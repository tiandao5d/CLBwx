<template>
  <div class="province-box" v-show="show">
    <div class="province-btn-item" v-for="item, index in ctarr" :key="index">
      <mu-raised-button class="province-btn" @click="closeCom(item.val)" :label="item.txt"/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    ctarr: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      show: false,
      activePro: ''
    }
  },
  methods: {
    showCom () {
      let that = this;
      that.show = true;
    },
    closeCom ( val ) {
      let that = this;
      that.show = false;
      that.$parent.titleTabChange( val )
    }
  }
}
</script>

<style scoped>
.province-box {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: #fff;
  z-index: 999;
  overflow-y: auto;
  overflow-x: hidden;
}
.province-btn-item {
  float: left;
  width: 33.3333%;
  padding: 5px;
}
.province-btn {
  min-width: 0;
  width: 100%;
}
@media screen and (min-width: 480px) {
  .province-btn-item {
    width: 25%;
  }
}
</style>
