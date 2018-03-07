<template>
  <div class="page-body">
    <div class="content-body">
      <div class="ds-body">
        <img class="ds-banner" :src="bannerImg">
        <div style="height: 3px;"></div>
        <div class="ds-con">
          <div class="ds-p">
            <strong>站点编号：</strong>
            <span>001</span>
          </div>
          <div class="ds-p">
            <strong>站点编号：</strong>
            <span>001</span>
          </div>
          <div class="ds-p">
            <strong>站点编号：</strong>
            <span>001</span>
          </div>
          <div class="ds-p">
            <strong>站点编号：</strong>
            <span>001</span>
          </div>
          <div class="ds-p">
            <strong>站点编号：</strong>
            <span>001</span>
          </div>
          <div class="ds-p">
            <strong>站点编号：</strong>
            <span class="ds-p-p">在彩票行业，彩民就是投注站的上帝，他们是维系投注站乃至福彩事业的根本，在这里绝不是一个单纯的买卖关系，需要的是人与人的沟通。为服务好彩民，黄姐非常注重与彩民的沟通。把彩民当成朋友一样去交流，当成亲人一样去接待，无论是新彩民还是老彩民，无论是投注金额大，还是投注金额小，都始终做到来有迎声、去有送语。在投注站里有不少已经退休的老彩民，黄姐对待他们就象亲人一样，照顾非常周到，嘘寒问暖。使老人们非常感动。为服务好彩民，及时给他们提供信息。黄姐主动给彩民们打电话，每</span>
          </div>
          <div class="ds-num">
            <div class="ds-num-p">当前票数：<span>111</span></div>
            <div class="ds-num-p">当前排名：<span>111</span></div>
          </div>
        </div>
      </div>
      <div class="ds-foot clearfix">
        <mu-raised-button label="投 票" class="raised-button"/>
        <mu-raised-button label="分 享" class="raised-button right"/>
      </div>
    </div>
  </div>
</template>

<script>
import pageBg3 from '@/assets/image/bs/add_shop003.jpg';

export default {
  data () {
    return {
      bannerImg: pageBg3
    }
  },
  created () {
    // 页面数据初始化
    this.pageInit()
  },
  methods: {
    // 页面数据并发请求
    pageInit () {
    }
  }
}
</script>
<style scoped>
.ds-body {
  position: absolute;
  bottom: 56px;
  top: 0;
  left: 0;
  right: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
.ds-banner {
  width: 100%;
}
.ds-con {
  position: relative;
  background-color: #fff;
  padding: 0 15px;
}
.ds-p {
  line-height: 30px;
  color: #727272;
}
.ds-p-p {
  display: block;
  text-align: justify;
}
.ds-p strong {
  color: #535353;
}
.ds-num {
  position: absolute;
  right: 0;
  top: 0;
  background-color: #ffc526;
  color: #fff;
  padding: 3px 6px;
}
.ds-num-p span {
  color: #fd3b39;
}
.ds-foot {
  position: absolute;
  left: 0;
  bottom: 0;
  background-color: #eee;
  padding: 10px 20px;
  width: 100%;
}
.raised-button {
  border-radius: 10px;
  background-color: #ff6600;
  color: #fff;
  width: 40%;
  float: left;
  font-size: 15px;
}
.raised-button.right {
  float: right;
  background-color: #ffa818;
}
</style>
