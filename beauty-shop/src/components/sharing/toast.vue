<template>
  <mu-snackbar v-if="snackbar" :message="snackbartxt" action="关闭" @actionClick="snackbarSH('hide')"/>
</template>

<script>

export default {
  data () {
    return {
      snackbar: false,
      snackbartxt: '没有内容'
    }
  },
  created () {
    // 页面数据初始化
    this.pageInit()
  },
  methods: {
    // 页面数据并发请求
    pageInit () {
    },
    // 提示框的显示隐藏
    snackbarSH ( type, txt = '' ) {
      let that = this;
      if ( type === 'show' ) {
        that.snackbar = true;
        that.snackbartxt = ( typeof txt === 'string' ) ? txt : '没有内容';
        if ( that.snackTimer ) {
          clearTimeout(that.snackTimer)
        }
        that.snackTimer = setTimeout(() => { that.snackbar = false }, 2000)
      } else if ( type === 'hide' ) {
        that.snackbar = false;
        if ( that.snackTimer ) {
          clearTimeout( that.snackTimer )
        }
      }
    }
  }
}
</script>
<style scoped>
</style>
