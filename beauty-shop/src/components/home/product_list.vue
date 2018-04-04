<template>
<div class="plist-box">
  <div class="plist-img">
    <img :src="item.url || p22" @click="goDetails">
    <div class="plist-num" v-if="status >= 103">
      <img :src="pageBg18">
      <div class="plist-num-p">
        <div class="plist-num-p1">{{formatNum(item.score || 0)}}</div>
        <div class="plist-num-p2">票</div>
      </div>
    </div>
  </div>
  <div class="plist-txt">
    <div class="ellipsis">站点编号：{{item.serialNo}}</div>
    <div class="ellipsis">站点地址：{{item.address}}</div>
    <div class="plist-btn" v-if="status === 103">
      <mu-raised-button label="为TA投票" @click="voteSubmit" class="raised-button"/>
    </div>
    <div class="plist-btn" v-else-if="status === 104">
      <mu-raised-button label="为TA投票" disabled @click="voteSubmit" class="raised-button disabled"/>
    </div>
  </div>
</div>
</template>

<script>
import p22 from '@/assets/image/p200200.png';
import pageBg18 from '@/assets/image/bs/add_shop018.png';
export default {
  props: {
    item: {
      type: Object,
      required: true,
      default: {}
    },
    status: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      pageBg18,
      p22
    }
  },
  methods: {
    formatNum ( val ) {
      val = parseInt(val);
      if ( val >= 100000000 ) {
        return (val/100000000).toFixed(0) + '亿';
      } else if ( val >= 10000000) {
        return (val/10000000).toFixed(0) + '千万';
      } else if ( val >= 1000000) {
        return (val/1000000).toFixed(0) + '百万';
      } else if ( val >= 100000) {
        return (val/100000).toFixed(0) + '十万';
      } else if ( val >= 10000) {
        return (val/10000).toFixed(0) + '万';
      } else {
        return val;
      }
    },
    goDetails () {
      this.$router.push({path: `/detailsShop?serialNo=${this.item.serialNo}`})
    },
    voteSubmit () {
      this.$emit('voteSubmit', this.item);
    }
  }
}
</script>

<style scoped>
.plist-box {
  background: #fff;
  float: left;
  width: 50%;
  padding: 5px;
}
.plist-img {
  position: relative;
}
.plist-img img {
  width: 100%;
  vertical-align: top;
}
.plist-num {
  position: absolute;
  top: 0;
  right: 0;
  width: 45px;
}
.plist-num img {
  width: 100%;
}
.plist-num-p {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  color: #fff;
  text-align: center;
  line-height: 1.2;
  padding: 3px;
}
.plist-txt {
  padding: 6px;
  line-height: 20px;
  text-align: left;
  font-size: 12px;
  color: #727272;
}
.plist-btn {
  text-align: center;
  padding-top: 6px;
}
.raised-button {
  border-radius: 8px;
  background-color: #ff6600;
  color: #fff !important;
  font-size: 12px;
  width: 120px;
  height: 26px;
  line-height: 26px;
}
.raised-button.disabled {
  background-color: #666;
}
</style>