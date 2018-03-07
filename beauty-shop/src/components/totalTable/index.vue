<template>
  <div class="page-body">
    <div class="content-body">
      <div class="tt-box">
        <img class="full-img" :src="pageBg7">
        <img class="full-img" :src="pageBg8">
        <div class="tt-con">
          <!-- 倒计时 -->
          <div class="tt-status1 tt-status" v-if="ttStatus === '1'">
            <img class="full-img" :src="pageBg11">
            <div class="tt-d tt-tt">{{dttObj.d}}</div>
            <div class="tt-h tt-tt">{{dttObj.h}}</div>
            <div class="tt-i tt-tt">{{dttObj.i}}</div>
          </div>
          <!-- 可报名 -->
          <div class="tt-status2 tt-status" v-if="ttStatus === '2'">
            <img class="full-img" :src="pageBg12">
            <div class="tts2-btn"></div>
            <div class="tts2-num">已有<span>2015</span>家投注站完成报名</div>
          </div>
          <!-- 已结束 -->
          <div class="tt-status3 tt-status" v-if="ttStatus === '3'">
            <img class="full-img" :src="pageBg13">
            <div class="tts3-btn"></div>
          </div>
        </div>
      </div>
      <img class="full-img" :src="pageBg9">
      <div style="height: 20px;"></div>
      <div class="tt-table-box">
        <table class="tt-table">
          <thead>
            <tr>
              <th>城市</th>
              <th>一等奖</th>
              <th>个数</th>
              <th>二等奖</th>
              <th>个数</th>
              <th>三等奖</th>
              <th>个数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>武汉</td>
              <td>8888元</td>
              <td>1</td>
              <td>8888元</td>
              <td>2</td>
              <td>8888元</td>
              <td>10</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="height: 20px;"></div>
      <img class="full-img" :src="pageBg10">
      <div style="height: 20px;"></div>
      <div class="tt-table-box">
        <table class="tt-table">
          <thead>
            <tr>
              <th>城市</th>
              <th>一等奖</th>
              <th>个数</th>
              <th>二等奖</th>
              <th>个数</th>
              <th>三等奖</th>
              <th>个数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>武汉</td>
              <td>8888元</td>
              <td>1</td>
              <td>8888元</td>
              <td>2</td>
              <td>8888元</td>
              <td>10</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="height: 40px;"></div>
    </div>
  </div>
</template>

<script>
import pageBg7 from '@/assets/image/bs/add_shop007.jpg';
import pageBg8 from '@/assets/image/bs/add_shop008.jpg';
import pageBg9 from '@/assets/image/bs/add_shop009.png';
import pageBg10 from '@/assets/image/bs/add_shop010.png';
import pageBg11 from '@/assets/image/bs/add_shop011.png';
import pageBg12 from '@/assets/image/bs/add_shop012.png';
import pageBg13 from '@/assets/image/bs/add_shop013.png';
export default {
  data () {
    return {
      pageBg7,
      pageBg8,
      pageBg9,
      pageBg10,
      pageBg11,
      pageBg12,
      pageBg13,
      endtt: +(new Date('2018-03-10')),
      ttStatus: '2'
    }
  },
  computed: {
    dttObj () {
      let that = this,
          endtt = that.endtt,
          newtt = +(new Date());
      let timeDif = endtt - newtt;
      let d = parseInt((timeDif%8553600000)/(86400000)),
          h = parseInt((timeDif%86400000)/(3600000)),
          i = parseInt((timeDif%3600000)/(60000)),
          s = parseInt((timeDif%60000)/1000),
          ms = parseInt((timeDif%1000)/100);
      console.log(123)
      return {d, h, i, s, ms}
    }
  },
  created () {
    // 页面数据初始化
    this.pageInit()
  },
  methods: {
    // 页面数据并发请求
    pageInit () {
      let that = this;
      if (that.ttStatus === '1') {
        that.ttItval();
      }
    },
    ttItval () {
      let that = this,
          itval = 60000;
      setInterval(() => {
        that.endtt -= itval;
      }, itval);
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
.tt-status {
  position: relative;
}
.tt-tt {
  position: absolute;
  top: 38%;
  bottom: 5%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: #fff;
}
.tt-d {
  left: 23.5%;
  right: 67%;
}
.tt-h {
  left: 41.3%;
  right: 49.5%;
}
.tt-i {
  left: 60%;
  right: 30.5%;
}
.tts2-btn,
.tts3-btn {
  position: absolute;
  left: 25%;
  right: 25%;
  top: 19%;
  bottom: 19%;
}
.tts2-btn {
  top: 5%;
  bottom: 35%;
}
.tts2-num {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  line-height: 1.2;
  font-style: italic;
  text-align: center;
  font-size: 16px;
  color: #ff8a00;
  font-weight: bold;
}
.tts2-num span {
  font-size: 1.2em;
  color: #ff1127;
  display: inline-block;
  padding: 0 5px;
}
@media screen and (min-width: 400px) {
  .tt-tt {
    font-size: 24px;
  }
}
@media screen and (min-width: 600px) {
  .tt-tt {
    font-size: 30px;
  }
}
</style>
