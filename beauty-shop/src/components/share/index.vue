<template>
  <div class="share-body" v-if="shareShow" @click="shareBtnClick">
      <img :src="pageBg22" style="width: 100%;">
  </div>
</template>

<script>

import pageBg22 from '@/assets/image/bs/add_shop022.png';
export default {
  data () {
    return {
      shareShow: false,
      pageBg22
    }
  },
  methods: {
    show ( item ) {
      this.shareShow = true;
    },
    shareBtnClick () {
      this.shareShow = false;
    }
  }
}
</script>
<style scoped>
.share-body {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  background-color: rgba(0,0,0,.7);
}
</style>
