<template>
  <div id="app">
    <!-- 必须等待相应的数据加载完成才能执行 -->
    <router-view v-if="!loading"></router-view>
  </div>
</template>

<script>
import awi008 from '@/assets/images/aw_008.png'
export default {
  name: 'app',
  data () {
    return {
      awi008,
      loading: true,
      txt: '加载中……',
      firstInit: false // 判断是否首次进入
    }
  },
  watch: {
    loading ( a ) {
      if ( !a ) {
        // 删除界面中的遮屏加载中，作为缓冲用的
        let ploading = document.getElementById('page_index_loading')
        if ( ploading ) {
          ploading.parentNode.removeChild(ploading)
        }
      }
    },
    txt ( t ) {
      let ploading = document.getElementById('page_index_loading'),
          tele = ploading.querySelector('.loader-txt')
      tele.innerHTML = t
    }
  },
  mounted () {
    // 页面数据初始化
    // 已经登录
    this.du = this.$xljs.deCodeUrl(); // 提前记录参数
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
      	this.loading = false // 解除遮屏
        this.init()
      }
    }
  },
  methods: {
    init () {
      var du = this.du, // 浏览器url记录的参数数据
          ds = this.$xljs.storageL(this.$xljs.sessionAct, null, true) || {}, // 本地储存的活动数据
          aid = du.id || ds.id
      if ( du.id ) { // 说明是首次进入此活动
        this.$xljs.storageL(this.$xljs.sessionAct, {id: du.id}, true) // 记录ID数据
        this.$router.replace('/') // 重置url，去掉id参数，以方便判断是否记录访问次数
        this.firstInit = true
      }
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
            {url: '/ushop-api-merchant/api/sns/task/wishing/winner/listBy', data: {id: aid, page: 1, rows: 50}, method: 'get'}
          ]
      // 记录访问次数
      if ( this.firstInit ) {
        aArr[aArr.length] = {
          url: `/ushop-api-merchant/api/sns/task/record/visit/${aid}`
        }
      }
      this.$xljs.ajaxAll(aArr, ( ...args ) => {
        let actData = args[0], // 活动详情数据
            winArr = args[1].recordList || [] // 中奖列表，用于弹幕
        if ( actData.id ) {
          if ( this.$xljs.isWeixin() ) {
            this.getShareData(actData.id, actData.url); // 获取分享的数据，并执行分享监听
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
      let arr = [], txt = '', rv = null
      try {
        this.$xljs.each( winArr, ( index, obj ) => {
          rv = JSON.parse(obj.rewardValue)
          if ( rv.index <= 3 ) {
            txt = `${obj.userName.length > 5 ? (obj.userName.substr(0, 3) + '...') : obj.userName} 获得 ${parseInt(rv.awardValue)}元`
            arr[arr.length] = {msg: txt, img: obj.userImage}
          }
        })
      } catch ( err ) {
        arr[arr.length] = {msg: '数据错误'}
      }
      return arr
    },
    // 微信分享事件监听初始化
    wxShareFn ( slink, ilink, title, desc ) {
      let that = this
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
            that.shareDone(1)
            that.$vux.toast.text('分享成功！')
          },
          cancel: function () {
            that.$vux.toast.text('用户取消！')
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
            that.shareDone(2)
            that.$vux.toast.text('分享成功！')
          },
          cancel: function () {
            that.$vux.toast.text('用户取消！')
          }
      });
    },
    // 用户执行分享之后
    shareDone ( type ) {
      // if ( type === 1 ) { // 分享到朋友圈
      // } else if ( type === 2 ) { // 分享到朋友
      // }
      // 埋点分享成功后
      let _url = `/ushop-api-merchant/api/sns/task/record/share/${this.$xljs.aid}`
      this.$xljs.ajax(_url, 'get', {}, () => {
        // 不需要任何处理
        // if ( data.result === 'SUCCESS' ) {
        // }
      }, false)
    },
    // 编码拼接goto页面，编译为发送到后台的数据字符串
    engoto ( str ) {
      str = str.replace(/\//g, '_xlw_')
            .replace(/\.html\?/g, '_xlp_')
            .replace(/\.html\#/g, '_xlj_')
            .replace(/\.html/g, '_xlht_')
            .replace(/\?/g, '_xlhw_')
            .replace(/\#/g, '_xlhj_')
            .replace(/\=/g, '_xld_')
            .replace(/\&/g, '_xll_');
        return str;
    },
    // 获取分享的数据，并执行分享监听
    getShareData ( aid, url ) {
      let that = this
      let slink = `${that.$xljs.domainUrl}/ushop-api-merchant/html/weixinmp/index.html?wxbtnGoto=${that.engoto('weixinmp/transit.html?gotox=drawred&id=' + aid)}&promoter=${that.$xljs.getUserId()}`,
          ilink = `${that.$xljs.domainUrl}/ushop-api-merchant/image/icon/logoicon.png`,
          title = '抽奖活动进行中，赶紧参与吧~',
          desc = '火热进行中....'
      if ( !url ) {
        slink = `${that.$xljs.domainUrl}/ushop-api-merchant/html/weixinmp/index.html?wxbtnGoto=${that.engoto('weixinmp/drawred/index.html#/?id=' + aid)}&promoter=${that.$xljs.getUserId()}`
      }
      that.wxShareFn(slink, ilink, title, desc) // 初始化事件监听
    },
    // 微信授权
    wxAuthoriseFn( callback = function () {}) {
      let that = this,
          purl = location.href.split('#')[0]//`${that.$xljs.domainUrl}/ushop-api-merchant/html/weixinmp/drawred/index.html`
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
  background: #282b2d;
}
</style>
