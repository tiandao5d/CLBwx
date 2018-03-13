<template>
  <div class="footer">
    <mu-tabs :value="value" @change="footTabChange" lineClass="footer-line">
      <mu-tab v-for="item, index in tabarr" :key="index"
              :value="item.val" icon="."
              :iconClass="item.icon + ' icony'" :title="item.txt"/>
    </mu-tabs>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    tabarr: {
      type: Array,
      default: []
    },
    change: {
      type: Function,
      default () {}
    }
  },
  data () {
    return {
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
    footTabChange ( val ) {
      this.$emit('change', val)
    }
  }
}
</script>
<style scoped>
.footer .mu-tab-link-highlight {
  display: none;
}
</style>
