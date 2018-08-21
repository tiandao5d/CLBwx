<template>
  <div id="app">
    <router-view v-if="!loader" />
    <div class="loader-box" v-if="loader">
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
  </div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {
      urlData: {},
      txt: '加载中……',
      loader: true,
      wxistrue: false
    }
  },
  mounted() {
    let that = this;
    // 页面数据初始化
    if ( that.$xljs.getUserId() ) {
      // 微信授权
      this.urlData = that.$xljs.deCodeUrlFn(); //提前记录url数据
      if ( that.$xljs.isWeixin() ) {
        that.wxAuthoriseFn( () => {
          that.pageInit();
        }); // 微信授权jsSDK
      } else {
        that.pageInit();
      }
    } else {
      if ( that.$xljs.isWeixin() ) {
        window.location.href = '../index.html?loginOverdue=yes';
      } else {
        that.txt = '未登录或登录失效！';
        if ( that.$xljs.isTest() ) {
          that.loader = false;
          that.$router.push('/login');
        }
      }
    }
  },
  // /index.html#/totalTable?id=1
  methods: {
    pageInit() {
      let that = this,
          sesData = that.$xljs.actSession(),
          urlData = this.urlData,
          bsid = urlData.id || sesData.id || '';
      if ( !bsid ) {
        that.txt = '活动ID不存在！';
        return false;
      }
      let lParam = [
        {url: `/ushop-api-merchant/api/sns/vote/election/get/${bsid}`} // 获取去活动详情
      ]
      // 说明是推广进来的，记录粉丝
      if ( urlData.userid ) {
        lParam.push({url: `/ushop-api-merchant/api/sns/vote/canvassing/canvass/${bsid}/${urlData.userid}`})
      }
      // 报名未发布100 报名已发布101 投票未发布102 投票已发布103 结束104 下架105
      that.$xljs.ajaxAll(lParam, (adata) => {
        if ( !adata.id ) {
          that.txt = '活动数据请求失败！';
          return false;
        }
        adata.pobj = that.formatPas(adata.params); // 自定义参数解析
        if ( !adata.pobj.pLid ) {
          that.txt = '没有抽奖数据ID！';
          return false;
        }
        // 已经到了投票时间
        if ( adata.status >= 103 ) {
          that.getUserVote(bsid); // 记录用户票据信息
          // 记录用户访问次数
          if ( sesData ) {
            that.recordUserVisit(bsid); // 记录用户访问次数
          }
        }
        that.getLCData(adata.pobj.pLid, (ldata) => {
          adata.lcobj = ldata; // 记录奖等数据
          that.$xljs.actSession(adata); // 将数据记录在本地
          that.$xljs.bsid = adata.id; // 活动的ID
          that.$xljs.lcid = adata.pobj.pLid; // 活动对应的抽奖ID
          that.loader = false; // 去掉遮屏加载
          if ( that.$xljs.isWeixin() ) {
            that.getShareData(); // 获取分享的数据，并执行分享监听
          }
        });
        that.$xljs.actSession(adata); // 数据记录在本地
      });
    },

    // 记录用户访问次数
    recordUserVisit ( bsid ) {
      let that = this,
          _url = `/ushop-api-merchant/api/sns/vote/canvassing/visit/${bsid}`;
      that.$xljs.ajax(_url, 'get', {}, () => {
        // 记录用户访问次数
      });
    },
    
    // 获取用户投票数据
    getUserVote ( bsid ) {
      let that = this,
          _url = `/ushop-api-merchant/api/sns/vote/voter/get/${bsid}`;
      that.$xljs.ajax(_url, 'get', {}, (data) => {
        try {
          data.experience = JSON.parse(data.experience);
        } catch ( err ) {
          data.experience = [];
        }
        that.$xljs.actSession({userVote: data}); // 记录用户票据信息
      });
    },
    // 自定义参数解析params
    formatPas (jsonstr) {
      function fa ( v ) {
        let arr = v.split('|');
        arr = arr.map((val, index) => {
          return (parseInt(val) || 0);
        });
        return arr;
      }
      try {
        let arr = JSON.parse(jsonstr);
        return {
          pPlayMed: arr[0].value, // 玩法
          pPlan: parseInt(arr[1].value), // 进度
          pLid: arr[2].value, // 抽奖游戏ID
          pPlanC: [
            fa(arr[3].value), // 候选者参加抽奖条件1
            fa(arr[4].value), // 候选者参加抽奖条件2
            fa(arr[5].value)  // 候选者参加抽奖条件3
          ],
          pPlanV: [
            fa(arr[6].value), // 投票者参加抽奖条件1
            fa(arr[7].value), // 投票者参加抽奖条件2
            fa(arr[8].value) // 投票者参加抽奖条件3
          ]
        }
      } catch ( err ) {
        return {};
      }
    },
    // 获取抽奖游戏的奖等数据
    getLCData ( lcid, callback = function () {} ) {
      let that = this,
          _url = `${that.$xljs.domainUrl}/ushop-api-merchant/api/lotto/game/get/${lcid}`;
      that.$xljs.ajax(_url, 'get', {}, (data) => {
        if ( data.id ) {
          try {
            data.prizesArr = JSON.parse(data.prizes);
          } catch ( err ) {
            data.prizesArr = [];
          }
          callback(data);
        } else {
          that.txt = '抽奖数据请求失败！';
        }
      }, false);
    },
    // 微信分享事件监听初始化
    wxShareFn ( slink, ilink, title, desc ) {
      let that = this;
      // 记录对应的数据，以便于其他地方使用
      that.slink = slink;
      that.ilink = ilink;
      that.title = title;
      that.desc = desc;
      // http://clb.lotplay.cn/ushop-api-merchant/html/weixinmp/index.html?wxbtnGoto=indiana_xlw_product_details_xlp_arr_xld_1015_xl_1
      //获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
      window.wx.onMenuShareTimeline({
          title: title, // 分享标题
          // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          link: slink,
          imgUrl: ilink, // 分享图标
          success: function () {
              that.$xljs.toast('分享成功！');
          },
          cancel: function () { 
              that.$xljs.toast('用户取消！');
          }
      });
      
      //获取“分享给朋友”按钮点击状态及自定义分享内容接口
      window.wx.onMenuShareAppMessage({
          title: title, // 分享标题
          desc: desc, // 分享描述
          // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          link: slink,
          imgUrl: ilink, // 分享图标
          type: 'link', // 分享类型,music、video或link，不填默认为link
          dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
          success: function () {
              that.$xljs.toast('分享成功！');
          },
          cancel: function () {
              that.$xljs.toast('用户取消！');
          }
      });
    },
    // 获取分享的数据，并执行分享监听
    getShareData () {
      let that = this;
      let slink = `${that.$xljs.domainUrl}/ushop-api-merchant/html/weixinmp/index.html?wxbtnGoto=weixinmp_xlw_bs_xlw_index_xlj_totalTable_xlhw_id_xld_${that.$xljs.actSession().id}_xll_userid_xld_${that.$xljs.getUserId()}`,
          ilink = `${that.$xljs.domainUrl}/ushop-api-merchant/image/icon/logoicon.png`,
          title = '最美投注站活动正在投票中，赶紧参与吧~',
          desc = '火热进行中....';
      that.wxShareFn(slink, ilink, title, desc); // 初始化事件监听
    },
    // 微信授权
    wxAuthoriseFn( callback = function () {}) {
      let that = this,
          purl = window.location.href.split('#')[0];//`${that.$xljs.domainUrl}/ushop-api-merchant/html/weixinmp/bs/index.html`;
      window.wx.ready(callback);
      that.txt = '每天要喝8杯水哦~';
      let _url = that.$xljs.domainUrl + '/ushop-api-merchant/api/weixin/client/ticket/get?' +
        'type=jsapi&url=' + purl;
      that.$xljs.ajax(_url, 'get', {}, function(data) {
        if (data.sign) {
          that.configFn(data.timestamp, data.noncestr, data.sign);
        } else {
          that.txt = '微信授权错误';
        }
      });
    },
    // 微信sdk配置
    // configFn(1495764791, 'Kmifefp2whjxfbst', '7ebdce4d83faadb22e3d0d277bcaefe0cd08514e');
    configFn(timestamp, nonceStr, signature) {
      let that = this;
      window.wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: that.$xljs.getAppId(), // 必填，公众号的唯一标识
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonceStr: nonceStr, // 必填，生成签名的随机串
        signature: signature, // 必填，签名，见附录1
        jsApiList: [ // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
          'chooseImage', // 拍照，从相册选择
          'getLocalImgData', // 获取本地图片接口
          'onMenuShareTimeline', // 获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
          'onMenuShareAppMessage' // 获取“分享给朋友”按钮点击状态及自定义分享内容接口
        ]
      });
    }
  }
}

</script>
<style scoped>
.loader-box {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #ed5565;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 999999999;
}
.loader-txt {
  color: #fff;
  font-size: 16px;
  padding-top: 10px;
}


/**
 * Lines
 */

@-webkit-keyframes line-scale {
  0% {
    -webkit-transform: scaley(1);
    transform: scaley(1);
  }

  50% {
    -webkit-transform: scaley(0.4);
    transform: scaley(0.4);
  }

  100% {
    -webkit-transform: scaley(1);
    transform: scaley(1);
  }
}

@keyframes line-scale {
  0% {
    -webkit-transform: scaley(1);
    transform: scaley(1);
  }

  50% {
    -webkit-transform: scaley(0.4);
    transform: scaley(0.4);
  }

  100% {
    -webkit-transform: scaley(1);
    transform: scaley(1);
  }
}
.line-scale>div:nth-child(1) {
  -webkit-animation: line-scale 1s 0.1s infinite cubic-bezier(.2, .68, .18, 1.08);
  animation: line-scale 1s 0.1s infinite cubic-bezier(.2, .68, .18, 1.08);
}

.line-scale>div:nth-child(2) {
  -webkit-animation: line-scale 1s 0.2s infinite cubic-bezier(.2, .68, .18, 1.08);
  animation: line-scale 1s 0.2s infinite cubic-bezier(.2, .68, .18, 1.08);
}

.line-scale>div:nth-child(3) {
  -webkit-animation: line-scale 1s 0.3s infinite cubic-bezier(.2, .68, .18, 1.08);
  animation: line-scale 1s 0.3s infinite cubic-bezier(.2, .68, .18, 1.08);
}

.line-scale>div:nth-child(4) {
  -webkit-animation: line-scale 1s 0.4s infinite cubic-bezier(.2, .68, .18, 1.08);
  animation: line-scale 1s 0.4s infinite cubic-bezier(.2, .68, .18, 1.08);
}

.line-scale>div:nth-child(5) {
  -webkit-animation: line-scale 1s 0.5s infinite cubic-bezier(.2, .68, .18, 1.08);
  animation: line-scale 1s 0.5s infinite cubic-bezier(.2, .68, .18, 1.08);
}

.line-scale>div {
  background-color: #fff;
  width: 4px;
  height: 35px;
  border-radius: 2px;
  margin: 2px;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  display: inline-block;
}

</style>
