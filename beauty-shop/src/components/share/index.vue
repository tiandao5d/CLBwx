<template>
  <div class="share-body" v-if="shareShow">
    <div class="share-imgbox">
      <img :src="pageBg19">
      <div class="share-con">
        <div class="share-txt">{{txt}}</div>
        <div class="share-img">
          <img :src="p22">
        </div>
        <mu-raised-button @click="shareBtnClick" label="分享至朋友圈或好友" class="share-btn"/>
      </div>
    </div>
  </div>
</template>

<script>

import pageBg19 from '@/assets/image/bs/add_shop019.jpg';
import p22 from '@/assets/image/p200200.png';
export default {
  data () {
    return {
      shareShow: false,
      pageBg19,
      p22,
      txt: '000站点正在参加“最美投注站”，感谢您为它拉票'
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
    show ( item ) {
      console.log(item)
      this.shareShow = true;
      this.p22 = item.url || p22;
      this.txt = item.serialNo + '站点正在参加“最美投注站”，感谢您为它拉票';

    },
    shareBtnClick () {
      this.shareShow = false;
    }
  },
  components: {
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
.share-imgbox {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 90%;
  max-width: 400px;
  transform: translate(-50%, -50%);
}
.share-imgbox > img {
  width: 100%;
}
.share-con {
  position: absolute;
  left: 16%;
  right: 16%;
  top: 20%;
  text-align: center;
}
.share-txt {
  color: #ff4800;
  font-size: 15px;
  padding-bottom: 10px;
  text-align: left;
}
.share-img img {
  width: 100%;
  background-color: #fffad7;
  padding: 3px;
  border-radius: 5px;
}
.share-btn {
  margin-top: 6%;
  color: #fff;
  background-color: #ff6600;
  font-size: 15px;
  border-radius: 10px;
}
</style>
