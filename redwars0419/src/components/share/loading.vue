<template>
  <div class="loader-box" v-if="isshow">
    <div class="loader-con">
      <div class="loader-inner line-scale">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div class="loader-txt">{{txt}}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    txt: {
      type: String,
      default: '加载中……',
      required: false
    },
    isshow: {
      type: Boolean,
      default: false,
      required: true
    }
  }
}
</script>
