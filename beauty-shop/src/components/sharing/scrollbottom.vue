<template>
<div v-show="loading" class="mu-infinite-scroll">
  <span class="loading-img"></span>
  <span class="mu-infinite-scroll-text">{{loadingText}}</span>
</div>
</template>

<script>
import Scroll from './scroll'
export default {
  name: 'mu-infinite-scroll',
  mixins: [Scroll],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '正在加载。。。'
    },
    isLoaded: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onScroll () {
      if (this.loading || this.isLoaded) return
      const scroller = this.scroller
      const isWindow = scroller === window
      const scrollTop = isWindow ? scroller.scrollY : scroller.scrollTop
      const scrollHeight = isWindow ? document.documentElement.scrollHeight || document.body.scrollHeight : scroller.scrollHeight
      let h = scrollHeight - scrollTop - 5
      let sh = isWindow ? window.innerHeight : scroller.offsetHeight
      if (h <= sh) {
        this.$emit('load')
      }
    }
  }
}
</script>

<style lang="css">
.mu-infinite-scroll{
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 8px;
  line-height: 36px;
  width: 100%;
}
.mu-infinite-scroll-text{
  margin-left: 16px;
  font-size: 16px;
}
.loading-img {
  border-radius: 100%;
  width: 24px;
  height: 24px;
  vertical-align: top;
  display: inline-block;
  border: solid 3px rgba(0, 0, 0, .1);
  border-top-color: #ff9c00;
  animation: spin .5s infinite linear;
}
</style>
