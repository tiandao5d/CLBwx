<template>
  <div id="app">
    <router-view v-if="!loading"></router-view>
    <div class="loader-box" v-if="!!loading">
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
  name: 'app',
  data () {
    return {
      loading: true,
      txt: '加载中……'
    }
  },
  mounted () {
    // 页面数据初始化
    // 已经登录
    if ( this.$xljs.getUserId() ) {
      // 微信授权
      if ( this.$xljs.isWeixin() ) {
        this.wxAuthoriseFn( () => {
          this.init()
        }) // 微信授权jsSDK
      } else {
        this.init()
      }
    // 未登录
    } else {
      this.$vux.toast.text('未登录或登录失效！')
      if ( this.$xljs.isWeixin() && !this.$xljs.isTest() ) {
        this.$xljs.openPage('../index.html?loginOverdue=yes')
      } else {
        this.init()
      }
    }
  },
  methods: {
    init () {
      var du = this.$xljs.deCodeUrl(), // 浏览器url记录的参数数据
          ds = this.$xljs.storageL(this.$xljs.sessionAct, null, true) || {}, // 本地储存的活动数据
          aid = du.id || ds.id
      if ( aid ) {
        this.$xljs.aid = aid
        this.getInitData()
      } else {
        this.txt = '没有ID'
      }
    },
    // 获取初始基本数据
    getInitData ( callback = function () {} ) {
      let aid = this.$xljs.aid,
          aArr = [
            {url: `/ushop-api-merchant/api/sns/task/detail/get/${aid}`}, // 活动详情
            {url: '/ushop-api-merchant/api/sns/task/wishing/winner/listBy', data: {id: aid, page: 1, rows: 10}, method: 'get'}
          ]
      this.$xljs.ajaxAll(aArr, ( ...args ) => {
        let actData = args[0], // 活动详情数据
            winArr = args[1].recordList || [] // 中奖列表，用于弹幕
        if ( actData.id ) {
          if ( this.$xljs.isWeixin() ) {
            this.getShareData(actData.id); // 获取分享的数据，并执行分享监听
          }
          // 获取助力任务数据
          this.getAssActDa(actData.assistanceId, (zdata) => {
            if ( zdata.id ) {
              actData.zdata = zdata;
              this.$xljs.storageL(this.$xljs.sessionAct, actData, true)
            } else {
              this.$vux.toast.text('助力数据请求失败')
            }
            this.loading = false // 解除遮屏
          });
          this.$xljs.winprizearr = this.paraFormat ( winArr )
        } else {
          this.$vux.toast.text('活动数据请求失败')
        }
      });
    },
    // 获取助力任务数据
    getAssActDa ( zid, callback = function () {} ) {
      let _url = `/ushop-api-merchant/api/sns/task/detail/get/${zid}`
      this.$xljs.ajax(_url, 'get', {}, ( data ) => {
        callback(data)
      });
    },
    // 弹幕数据格式化
    paraFormat ( winArr = [] ) {
      let arr = [], txt = ''
      try {
        this.$xljs.each( winArr, ( index, obj ) => {
          txt = `${obj.userName} 获得 ${JSON.parse(obj.rewardValue).awardName}`
          arr[arr.length] = {msg: txt}
        })
      } catch ( err ) {
        arr[arr.length] = {msg: '数据错误'}
      }
      return arr
    },
    // 微信分享事件监听初始化
    wxShareFn ( slink, ilink, title, desc ) {
      let that = this;
      // 记录对应的数据，以便于其他地方使用
      that.slink = slink
      that.ilink = ilink
      that.title = title
      that.desc = desc
      // http://clb.lotplay.cn/ushop-api-merchant/html/weixinmp/index.html?wxbtnGoto=indiana_xlw_product_details_xlp_arr_xld_1015_xl_1
      //获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
      window.wx.onMenuShareTimeline({
          title: title, // 分享标题
          // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          link: slink,
          imgUrl: ilink, // 分享图标
          success: function () {
              that.$xljs.toast('分享成功！')
          },
          cancel: function () { 
              that.$xljs.toast('用户取消！')
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
              that.$xljs.toast('分享成功！')
          },
          cancel: function () {
              that.$xljs.toast('用户取消！')
          }
      });
    },
    // 获取分享的数据，并执行分享监听
    getShareData ( aid ) {
      let that = this
      let slink = `${that.$xljs.domainUrl}/ushop-api-merchant/html/weixinmp/index.html?wxbtnGoto=weixinmp_xlw_drawred_xlw_index_xlj__xlw__xlhw_id_xld_${aid}_xll_promoter_xld_${that.$xljs.getUserId()}`,
          ilink = `${that.$xljs.domainUrl}/ushop-api-merchant/image/icon/logoicon.png`,
          title = '最美投注站活动正在投票中，赶紧参与吧~',
          desc = '火热进行中....'
      that.wxShareFn(slink, ilink, title, desc) // 初始化事件监听
    },
    // 微信授权
    wxAuthoriseFn( callback = function () {}) {
      let that = this,
          purl = `${that.$xljs.domainUrl}/ushop-api-merchant/html/weixinmp/drawred/index.html`
      window.wx.ready(callback);
      var _url = `${that.$xljs.domainUrl}/ushop-api-merchant/api/weixin/client/ticket/get?type=jsapi&url=${purl}`
      that.$xljs.ajax(_url, 'get', {}, function(data) {
        if (data.sign) {
          that.configFn(data.timestamp, data.noncestr, data.sign)
        }
      });
    },
    // 微信sdk配置
    // configFn(1495764791, 'Kmifefp2whjxfbst', '7ebdce4d83faadb22e3d0d277bcaefe0cd08514e');
    configFn(timestamp, nonceStr, signature) {
      let that = this
      window.wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: that.$xljs.getAppId(), // 必填，公众号的唯一标识
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonceStr: nonceStr, // 必填，生成签名的随机串
        signature: signature, // 必填，签名，见附录1
        jsApiList: [ // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
          'onMenuShareTimeline', // 获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
          'onMenuShareAppMessage' // 获取“分享给朋友”按钮点击状态及自定义分享内容接口
        ]
      });
    }
  }
}
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';

body {
  background-color: #fbf9fe;
}
#app {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.loader-box {
  position: absolute;
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
