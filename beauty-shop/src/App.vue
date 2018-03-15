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
      loader: true
    }
  },
  mounted() {
    // 页面数据初始化
    this.pageInit();
    if ( this.$xljs.isTest() ) {
      let data = {userId: "888200000002013", token: "88630169E97E8D0CFA3BEBEEC494A94A", timestamp: 1521017026478};
      this.$xljs.storageL('ls_global_user_id', data.userId);
      this.$xljs.storageL('ls_global_token', data.token);
    }
  },
  methods: {
    pageInit() {
      let that = this,
          ud = that.$xljs.actSession();
      ud = ud.id ? ud : that.deCodeUrlFn();
      if ( !ud.id ) {
        that.txt = '活动ID不存在！';
        return false;
      }
      let id = ud.id,
          userid = ud.userid,
          _param = [
            {url: `/ushop-api-merchant/api/sns/vote/election/get/${id}`} // 获取去活动详情
          ];
      // 说明是推广进来的，记录粉丝
      if ( userid ) {
        _param.push({url: `/ushop-api-merchant/api/sns/vote/canvassing/canvass/${id}/${userid}`})
      }
      // 说明不是本地数据，记录进入次数
      if ( ud.status === 103 && !that.$xljs.actSession() ) {
        _param.push({url: `/ushop-api-merchant/api/sns/vote/canvassing/visit/${id}`})
      }
      // 报名未发布100 报名已发布101 投票未发布102 投票已发布103 结束104 下架105
      that.$xljs.ajaxAll(_param, (adata) => {
        adata = adata || {};
        if ( !adata.id ) {
          that.$xljs.actSession('');
          that.txt = '未请求到相关活动数据！';
          return false;
        }

        // 将数据记录在本地
        that.$xljs.actSession(adata);
        if ( that.$xljs.isWeixin() ) {
          if ( window.wxIsTrue ) {
            that.loader = false;
          }
        } else {
          that.loader = false;
        }
      });
      // 微信授权
      if ( that.$xljs.isWeixin() ) {
        window.wx.ready(() => {
          window.wxIsTrue = true;
          if ( that.$xljs.actSession() ) {
            that.loader = false;
          }
        });
        that.wxAuthoriseFn(); // 微信授权jsSDK
      }
    },
    deCodeUrlFn(str = document.URL) {
      str = str.split('?')[1] || '';
      str = str.split('#')[0] || '';
      let a = {};
      if (str) {
        let b = str.split('&'),
          i = 0,
          s;
        while (s = b[i++]) {
          s = (s + '').split('=');
          a[s[0]] = s[1];
        }
      }
      return a;
    },
    // 微信授权
    wxAuthoriseFn() {
      let that = this;
      var _url = that.$xljs.domainUrl + '/ushop-api-merchant/api/weixin/client/ticket/get?' +
        'type=jsapi&url=' + document.URL;
      that.$xljs.ajax(_url, 'get', {}, function(data) {
        if (data.sign) {
          that.configFn(data.timestamp, data.noncestr, data.sign);
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
          'getLocalImgData' // 获取本地图片接口
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
