<template>
  <div class="page-body">
    <div class="content-body">
      <div class="mv-head">
        <div class="mvh-item">
          <div>站点票数</div>
          <div class="mvh-num">{{subordinates || 0}}</div>
        </div>
        <div class="mvh-item">
          <div>我的投票数</div>
          <div class="mvh-num">{{votes || 0}}</div>
        </div>
        <div class="mvh-item">
          <div>我的拉票数</div>
          <div class="mvh-num">{{canvasses || 0}}</div>
        </div>
      </div>
      <div class="mv-m1">
        <div class="mv-title">获得抽奖机会</div>
        <div class="mv-list">
          <div class="mv-litem" v-for="item, index in luckyList" :key="index" v-if="downTT[('tt' + item.id)]['istrue']">
            <div class="mv-lb1">
              <div class="mv-limg">
                <img :src="mvbg1">
                <img :src="mvbg2" class="mv-limg-img">
              </div>
              <div class="mv-p3">开奖倒计时</div>
              <div class="countdown-box">
                <div class="cb-item"><span>{{downTT[('tt' + item.id)]['arr'][0]}}</span></div>
                <div class="cb-item"><span>{{downTT[('tt' + item.id)]['arr'][1]}}</span></div>
                <div class="cb-colon">:</div>
                <div class="cb-item"><span>{{downTT[('tt' + item.id)]['arr'][2]}}</span></div>
                <div class="cb-item"><span>{{downTT[('tt' + item.id)]['arr'][3]}}</span></div>
                <div class="cb-colon">:</div>
                <div class="cb-item"><span>{{downTT[('tt' + item.id)]['arr'][4]}}</span></div>
                <div class="cb-item"><span>{{downTT[('tt' + item.id)]['arr'][5]}}</span></div>
              </div>
            </div>
            <div class="mv-lb2">
              <div class="mv-p1 ellipsis">{{item.prizeObj.title}}</div>
              <div class="mv-p2 ellipsis">开奖时间：{{timeFormtFn(item.issueObj.drawTime).substr(2, 14)}}</div>
              <div class="mv-p2 ellipsis">奖　　等：{{item.prizeObj.name}}</div>
              <div class="mv-p2 ellipsis">参与票数：{{item.issueObj.totalSaleTick || 0}}</div>
              <div class="mv-p2 ellipsis">奖品个数：{{item.prizeObj.prizeCount || 0}}个</div>
              <div class="mv-p2 ellipsis">参与条件：10积分兑换奖券</div>
              <button class="mv-lb-btn" @click="goToLucky">查看</button>
            </div>
          </div>
        </div>
        <div class="mv-btn-box">
          <mu-raised-button label="进入我的奖券中查看" @click="goToLucky" class="mv-btn"/>
        </div>
      </div>
      <div class="mv-m2">
        <div class="mv-title">活动说明</div>
        <div class="mv-p">活动期内参与评选的票数是所在城市的排名前三，均有现金奖励。另外所得的票数每达到1111票还可以获得抽奖机会。粉丝参与投票及其好友投票达到1111票通用获得抽奖机会，周周抽检，精彩奖品等你拿！</div>
      </div>
    </div>
  </div>
</template>
<script>
import mvbg1 from '@/assets/image/img/lucky_icon1.png';
import mvbg2 from '@/assets/image/img/lucky_icon3.png';
export default {
  data () {
    return {
      mvbg1,
      mvbg2,
      luckyList: [],
      subordinates: '', // 粉丝数量
      canvasses: '', // 拉票数量(粉丝投票数)
      votes: '', // 总投票数量
      nowTT: 0,
      downTT: {},
      tdata: {}
    }
  },
  mounted () {
    let that = this;
    // 页面数据初始化
    that.pageInit();
  },
  computed: {
  },
  methods: {
    pageInit () {
      let that = this,
          adata = that.$xljs.actSession(),
          params = adata.pobj,
          udata = adata.userVote;
      if ( !udata ) {
        that.$xljs.toast('活动未到投票时间！');
        return false;
      }
      that.subordinates = udata.subordinates;
      that.votes = udata.votes;
      that.canvasses = udata.canvasses;
      if ( !params.pLid ) {
        that.$xljs.toast('配置错误，没有抽奖ID');
        return false;
      }
      that.getUserLucky(params.pLid);
    },
    // 去到抽奖游戏界面
    goToLucky () {
      let that = this,
          ourl = `../../lucky_draw/lucky_mylist.html?gameId=${that.$xljs.lcid}`;
      that.$xljs.openPage(ourl);
    },
    // 获取用户抽奖票数数据
    getUserLucky (lid) {
      let that = this,
          adata = that.$xljs.actSession(),
          _url = '/ushop-api-merchant/api/lotto/ticket/user/listBy',
          _param = {
            page: 1,
            gameId: lid,
            status: 1, // 全部=100 未开奖=1 未中奖=2 已中奖-3 已弃奖=6
            date: ''
          };
      that.$xljs.ajaxAll([
        {url: `/ushop-api-merchant/api/lotto/issue/visible/listBy/1/${lid}`},
        {url: _url, data: _param}
      ], function (idata, tdata) { // 期次数据，票据数据
        if ( tdata.recordList.length > 5 ) {
          tdata.recordList.length = 5;
        }
        that.$xljs.each(tdata.recordList, (i, o) => {
          that.downTT[('tt' + o.id)] = {
            arr: [0,0,0,0,0,0],
            istrue: false
          };
          o.prizeObj = {};
          o.issueObj = {};
          that.$xljs.each(adata.lcobj.prizesArr, (pi, po) => {
            if ( o.prizeId === po.index ) {
              o.prizeObj = po;
            }
          });
          that.$xljs.each(idata.recordList, (ii, io) => {
            if ( o.issue === io.id ) {
              o.issueObj = io;
            }
          });
        });
        that.tdata = tdata;
        that.$xljs.getTT(function (tt) {
          that.nowTT = tt;
          that.ttDown(that.tdata.recordList);
          setInterval(() => {
            that.nowTT += 1000;
            that.ttDown(that.tdata.recordList);
          }, 1000);
        }, false);
        that.luckyList = tdata.recordList;
      });
    },
    ttDown ( arr ) {
      let that = this,
          aobj = {};
      that.$xljs.each(arr, (index, o) => {
        let endtt = +new Date(that.timeFormtFn(o.issueObj.drawTime)),
            timeDif = endtt - that.nowTT;
        let d = parseInt((timeDif%8553600000)/(86400000)),
            h = parseInt((timeDif%86400000)/(3600000)),
            i = parseInt((timeDif%3600000)/(60000)),
            s = parseInt((timeDif%60000)/1000),
            ms = parseInt((timeDif%1000)/100);
        d = fa(d);
        h = fa(h);
        i = fa(i);
        s = fa(s);
        aobj[('tt' + o.id)] = {
            arr: [h[0],h[1],i[0],i[1],s[0],s[1]],
            istrue: !!(timeDif > 1000)
          };
      });
      that.downTT = aobj;
      function fa ( n ) {
        return (n > 9 ? (n + '').split('') : ['0', (n + '')])
      }
    },
    //时间格式化，20170506101010
    //这种时间的格式化为 2017-05-06 10:10:10
    timeFormtFn ( a ) {
      if ( !a ) {return ''};
      let y = a.substr(0, 4),
          m = a.substr(4, 2),
          d = a.substr(6, 2),
          h = a.substr(8, 2),
          i = a.substr(10, 2),
          s = a.substr(12, 2);
      return y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;
    }
  }
}
</script>
<style scoped>
.mv-litem {
  position: relative;
  width: 100%;
  background-color: #fff6cb;
  border-radius: 20px 0 20px 0;
  padding: 10px;
  border: solid 1px #fec600;
  font-size: 13px;
  margin-top: 10px;
}
.mv-lb1 {
  width: 100px;
  text-align: center;
  color: #ff8500;
}
.mv-limg {
  position: relative;
}
.mv-limg img {
  width: 100%;
}
.mv-limg .mv-limg-img {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
}
.countdown-box {
  display: table;
}
.cb-colon {
  display: table-cell;
  width: 1%;
}
.cb-item {
  width: 3%;
  display: table-cell;
  padding: 0 1px;
}
.cb-item span {
  display: block;
  position: relative;
  background-color: #ff8500;
  color: #fff;
  border-radius: 3px;
}
.cb-item span:before,
.cb-item span:after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  width: 2px;
  height: 2px;
  background: #fff;
  margin-top: -1px;
}
.cb-item span:before {
  right: auto;
  left: 0;
}
.mv-p3 {
  margin-top: -6px;
}
.mv-lb2 {
  position: absolute;
  left: 120px;
  top: 10px;
  right: 10px;
}
.mv-p1,
.mv-p2 {
  line-height: 1.4;
  color: #975002;
}
.mv-p1 {
  color: #ff8500;
  font-weight: bold;
}
.mv-lb-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 5px;
  color: #fff;
  background-color: #ff4a00;
  padding: 6px 12px;
  font-size: 14px;
  border: 0;
}
.mv-head {
  display: flex;
  padding: 10px;
}
.mvh-item {
  flex-grow: 1;
  text-align: center;
  font-size: 16px;
  color: #959595;
}
.mvh-num {
  font-size: 28px;
  color: #434343;
}
.mv-m1 {
  padding: 15px;
  background-color: #fff;
}
.mv-title {
  color: #434343;
  font-size: 15px;
}
.mv-btn-box {
  text-align: center;
  padding: 15px 0;
}
.mv-btn {
  background-color: #ff5534;
  font-size: 16px;
  color: #fff;
  border-radius: 8px;
}
.mv-m2 {
  padding: 15px;
}
.mv-p {
  color: #707070;
  text-align: justify;
}
</style>