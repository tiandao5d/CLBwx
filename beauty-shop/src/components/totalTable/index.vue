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
            <div class="tt-i tt-tt">{{dttObj.i + 1}}</div>
          </div>
          <!-- 可报名 -->
          <div class="tt-status2 tt-status" v-if="ttStatus === '2'">
            <img class="full-img" :src="pageBg12">
            <router-link to="/addShop" class="tts2-btn"></router-link>
            <div class="tts2-num">已有<span>{{signup}}</span>家投注站完成报名</div>
          </div>
          <!-- 报名已结束 -->
          <div class="tt-status3 tt-status" v-if="ttStatus === '3'">
            <img class="full-img" :src="pageBg13">
            <div class="tts3-btn"></div>
          </div>
          <!-- 活动已结束 -->
          <div class="tt-status3 tt-status" v-if="ttStatus === '4'">
            <img class="full-img" :src="pageBg23">
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
      <mu-dialog :open="!!ttDialog" title="提示" @close="ttClose">
        {{ttDialog}}
        <mu-flat-button slot="actions" primary @click="ttClose" label="确定"/>
      </mu-dialog>
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
import pageBg23 from '@/assets/image/bs/add_shop023.png';
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
      pageBg23,
      ttDialog: '',
      signup: 0, // 当前已经报名的数量
      endtt: +(new Date('2050-03-10')),
      nowtt: +(new Date()),
      inttt: 60000, // 跳动的时间
      ttStatus: ''
    }
  },
  mounted () {
    this.pageInit();
  },
  computed: {
    dttObj () {
      let that = this;
      let timeDif = that.endtt - that.nowtt;
      let d = parseInt((timeDif%8553600000)/(86400000)),
          h = parseInt((timeDif%86400000)/(3600000)),
          i = parseInt((timeDif%3600000)/(60000)),
          s = parseInt((timeDif%60000)/1000),
          ms = parseInt((timeDif%1000)/100);
      return {d, h, i, s, ms}
    }
  },
  methods: {
    // 页面数据并发请求
    pageInit () {
      let that = this,
          sesData = that.$xljs.actSession();
      if ( sesData ) {
        that.atStatus(sesData);
      } else {
        window.location.reload(); // 刷新界面
      }
    },
    ttClose () {
      let that = this;
      that.ttDialog = '';
      that.$router.push('/home');
    },
    // 报名未发布100 报名已发布101 投票未发布102 投票已发布103 结束104 下架105
    atStatus ( data ) {
      let that = this;
      if ( data.status === 100 ) { // 报名未发布
        that.$xljs.toast (  '活动报名未发布' );
      } else if ( data.status === 101 ) { // 可以开始报名
        that.$xljs.getTT((stt) => {
          that.nowtt = stt; // 当前时间
          that.endtt = ((+(new Date(data.enrollTime))) + 10000); //报名时间，推迟10秒
          if ( that.endtt > that.nowtt ) { // 说明报名时间未到，开启倒计时
            that.ttStatus = '1'; // 倒计时
            that.ttItval();
          } else { // 可是开始报名，显示报名按键
            that.getWorksList((uType) => {
              if ( uType === 1 ) { // 已经报名
                that.ttDialog = '您已经报名成功，去到主界面！';
              } else { // 未报名
                that.ttStatus = '2'; // 可以报名
                that.signup = data.selects;
              }
            });
          }
        }, false);
      } else if ( data.status === 102 ) { // 投票未发布
          that.ttStatus = '3'; // 报名已结束
      } else if ( data.status === 103 ) { // 可以开始投票
        that.$xljs.getTT((stt) => {
          that.nowtt = stt; // 当前时间
          that.endtt = ((+(new Date(data.voteTime))) + 10000); //报名时间，推迟10秒
          if ( that.endtt > that.nowtt ) { // 说明报名时间未到，开启倒计时
            that.ttStatus = '1'; // 倒计时
            that.ttItval();
          } else { // 可是开始投票
            that.ttDialog = '活动已经开始，去到主界面';
          }
        }, false);
      } else if ( data.status === 104 ) { // 已经结束了
          that.ttStatus = '4'; // 活动已结束
          that.ttDialog = '活动已经结束，去到主界面';
      } else if ( data.status === 105 ) { // 下架了
        that.$xljs.toast (  '活动已下架' );
      } else {
        that.$xljs.toast ( `活动状态不正确，${that.$xljs.actSession().status}` );
      }
    },
    // 获取候选作品列表
    getWorksList ( callback = function () {} ) {
      let that = this,
          _url = '/ushop-api-merchant/api/sns/vote/candidate/listBy',
          _param = {
            page: 1,
            rows: 10,
            serialNo: '', // 站点编号
            district: '', // 地区
            electionId: that.$xljs.actSession().id, // 活动ID
            self: '1'
          };
      that.$xljs.ajax(_url, 'get', _param, ( data ) => {
        if ( data.totalCount > 0 ) {
          callback(1);
        } else {
          callback(0);
        }
      });
    },
    ttItval () {
      let that = this;
      setTimeout(() => {
        that.nowtt += that.inttt;
        if ( that.nowtt < that.endtt ) {
          that.ttItval();
        } else {
          that.pageInit();
        }
      }, that.inttt);
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
