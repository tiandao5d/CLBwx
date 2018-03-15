<template>
  <div class="page-body">
    <div class="content-body">
      <div class="tt-box">
        <img class="full-img" :src="pageBg16">
        <div class="tt-con">
          <img class="full-img" :src="pageBg17">
          <div class="tnum-num1">{{this.$xljs.actSession().selects}}</div>
          <div class="tnum-num2">{{this.$xljs.actSession().participants}}</div>
        </div>
      </div>
      <img class="full-img" :src="pageBg14">
      <div style="height: 20px;"></div>
      <div class="tt-table-box">
        <table class="tt-table">
          <thead>
            <tr>
              <th>城市</th>
              <th>一等奖</th>
              <th>二等奖</th>
              <th>三等奖</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>武汉</td>
              <td>1</td>
              <td>2</td>
              <td>10</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="height: 20px;"></div>
      <img class="full-img" :src="pageBg15">
      <div style="height: 20px;"></div>
      <div class="tt-table-box">
        <table class="tt-table">
          <thead>
            <tr>
              <th>期号</th>
              <th>周数</th>
              <th>中奖者（微信号）</th>
              <th>奖品</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>20180101期</td>
              <td>第一周</td>
              <td>002（投注站）</td>
              <td>电脑</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="height: 40px;"></div>
    </div>
  </div>
</template>

<script>
import pageBg14 from '@/assets/image/bs/add_shop014.png';
import pageBg15 from '@/assets/image/bs/add_shop015.png';
import pageBg16 from '@/assets/image/bs/add_shop016.jpg';
import pageBg17 from '@/assets/image/bs/add_shop017.png';
export default {
  data () {
    return {
      pageBg14,
      pageBg15,
      pageBg16,
      pageBg17
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
.page-body {
  background-color: #f2a538;
}
.full-img {
  width: 100%;
  vertical-align: top;
}
.tt-box {
  position: relative;
}
.tt-con {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  margin-top: 60%;
}
.tnum-num1,
.tnum-num2 {
  position: absolute;
  top: 54%;
  color: #fff;
  font-size: 16px;
  line-height: 1;
}
.tnum-num1 {
  left: 19.7%;
}
.tnum-num2 {
  left: 63%;
}
.tt-table {
  width: 90%;
  margin: 0 auto;
  background-color: #fffbcb;
  border-radius: 15px;
  border-collapse:collapse;
}
.tt-table th,
.tt-table td {
  text-align: center;
  vertical-align: middle;
  border: solid 1px #f2a538;
}
@media screen and (min-width: 400px) {
  .tnum-num1,
  .tnum-num2 {
    font-size: 20px;
  }
}
@media screen and (min-width: 600px) {
  .tnum-num1,
  .tnum-num2 {
    font-size: 24px;
  }
}
</style>
