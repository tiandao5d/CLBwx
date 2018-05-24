/**
  作用：共用脚本
  作者：xulin
*/
import md5 from 'js-md5'
import axios from 'axios'

let globaljs = {}
// 判断是否是测试界面
function isTest () {
  let domainUrl = location.protocol + '//' + location.host;
  if(domainUrl.indexOf('8080') > 0 || domainUrl.indexOf('8020') > 0 || domainUrl === 'file://'){
    return true
  }else{
    return false
  }
}
function getDm () {
  let domainUrl = location.protocol + '//' + location.host
  if(isTest()){
    // domainUrl = 'http://10.35.0.115'
    // domainUrl = 'http://10.35.0.134'
    domainUrl = 'http://10.13.0.57'
    // domainUrl = 'http://clbtest.lotplay.cn'
    // domainUrl = 'http://10.13.0.170'
    // domainUrl = 'http://pay.lotplay.cn'
    // domainUrl = 'http://clb.lotplay.cn'
  }
  return domainUrl
}
globaljs.install = function (Vue, options) {
  Vue.prototype.$xljs = {
    regExpPhone: /^1(3|4|5|7|8)\d{9}$/, // 手机正则表达式
    regExpPwd: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,15}$/, // 密码正则表达式，6-15位字母数字混合
    regExpName: /^[\u4E00-\u9FA5]{2,15}$/, // 人名正则表达式，只能是汉字
    regExpIDNO: /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/, // 身份证正则表达式，二代身份证
    regExpUser: /^[A-Za-z]{3}1(3|4|5|7|8)\d{9}$/, // 用户名正则表达式，手机号前面配三个字母
    regExpBank: /^(\d{16}|\d{19})$/, // 银行卡正则表达式，只验证位数
    regExpCode: /^\d{6}$/, // 手机验证码，只验证六位数字
    
    // 本地储存数据命名方式（前缀）
    // localStorage 全局使用前缀ls_global_，局部使用前缀ls_partly_
    // sessionStorage 全局使用前缀ss_global_，局部使用前缀ss_partly_
    userId: 'ls_global_user_id', // 记录用户ID
    token: 'ls_global_token', // 记录用户token值
    userName: 'ls_global_user_name', // 记录用户登录时用的账号
    bindPhone: 'ls_global_user_phone', // 记录用户绑定的手机号
    localPay: 'ls_global_pay_list', // 用于支付流程使用的存储内容
    userData: 'ls_global_user_info', // 记录用户的全面信息
    localLot: 'ls_global_lottery_data', // 彩票数据
    localPro: 'ls_global_province_data', // 本地省份数据
    localGen: 'ls_global_generalize_data', // 本地推广员数据
    sessionAct: 'ls_global_active_session', // 本活动的数据
    domainUrl: getDm(),
    // 获取用户ID，参数为返回一个带有str前缀ID字符串
    getUserId (str) {
      let that = this
      if (that.storageL(that.userId)) {
        return (str || '') + that.storageL(that.userId)
      } else {
        return (str || '')
      }
    },
    // 获取为写APPid
    getAppId () {
      let that = this
      // 外网正式公众号
      if (that.domainUrl === 'http://clb.lotplay.cn') {
        return 'wx7eaf9a2e612db7b4'
      // 内网测试公众号
      } else if(that.domainUrl === 'http://clbtest.lotplay.cn') {
        return 'wxdbf0e9e22aa336a6'
      }
    },
    extend (...ags) {
      Object.assign(...ags)
    },
    //数组和对象遍历
    each ( obj, callback ) {
      if (!(obj && obj instanceof Object)) {
        return obj
      }
      let value, i = 0, length = obj.length
      if (length === 0) {
        return obj
      }
      if (obj instanceof Array || obj[0]) {
        for (; i < length; i++) {
          value = callback.call(obj[i], i, obj[i])
          if (value === false) {
            break
          }
        }
      } else {
        for (i in obj) {
          value = callback.call(obj[i], i, obj[i])
          if (value === false) {
            break
          }
        }
      }
      return obj
    },
    // 判断是否是空对象
    isEmptyObject ( obj ) {
      if ( !(obj instanceof Object) ) {
        return false
      }
      for ( let v in obj ) {
        return false
      }
      return true
    },
    // 获取或修改储存在本地的用户信息
    // agr0为函数时，则此函数的参数为用户信息
    // agr0为对象或者字符串，则将此数据储存
    userInfoL ( agr0, ispros ) {
      let that = this

      if ( !that.getUserId() || !agr0 ) {
        return false;
      }
      let x = that.storageL(that.userData) || {}

      if ( (typeof agr0) === 'function' ) { // 请求用户数据
        let interval = (+new Date()) - x.tt
        // 已经有用户数据，而且就是当前登录的用户，并且会缓存相应时间单位ms
        if ( ((x.userNo + '') === that.getUserId()) && (interval < 600000) && (interval >= 0) ) {
          agr0(x)
        } else {
          let _url = '/ushop-api-merchant/api/user/profile/get/' + that.getUserId()
          that.ajax(_url, 'get', {}, function(data){
            if(!data.userNo){data = {}}
            data.tt = +new Date()
            that.storageL(that.userData, data)
            agr0(data)
          }, ispros)
        }
      } else if( agr0 instanceof Object ) { // 设置用户数据
        let k
        for( k in agr0 ){
          x[k] = agr0[k]
        }
        that.storageL(that.userData, x)
      }
    },
    // 获取或修改储存在本地的用户推广员数据信息
    // agr0为函数时，则此函数的参数为用户信息
    // agr0为对象或者字符串，则将此数据储存
    generalL (agr0, ispros) {
      let that = this
      if ( !(that.getUserId() && agr0) ) {
        return false
      }
      let x = that.storageL(that.localGen) || {}
      if ( (typeof agr0) === 'function' ) { // 请求用户数据
        let interval = (+new Date()) - x.timeStamp
        // 已经有用户数据，而且就是当前登录的用户，并且会缓存相应时间单位ms
        if (((x.userNo + '') === that.getUserId()) && (interval < 600000)) {
          agr0(x)
        } else {
          that.userInfoL((data) => {
            if (data.promoter === 101) {//审核通过
              let _url = '/ushop-api-merchant/api/user/promotion/promoter/get',
                  obj = {}, k

              that.ajax(_url, 'post', {}, (data) => {
                if (!(data.promoter && data.promoter.id)) {
                  obj = {}
                }

                for (k in data.promoter) {
                  obj[k] = data.promoter[k];
                }

                obj.tt = +new Date()
                that.storageL(that.localGen, obj)
                agr0(obj)
              }, ispros)
            }else{
              agr0({})
            }
          }, ispros)
        }
      } else if (agr0 instanceof Object) {//设置用户数据
        let k;
        for ( k in agr0 ) {
          x[k] = agr0[k]
        }
        that.storageL(that.localGen, x)
      }
    },
    // 储存数据，有第三个参数，布尔值表示是否是session储存，默认为local储存
    // 不存储undefined和null
    storageL (key, val) {
      if ( typeof(Storage) !== 'undefined' ) {
        if ( (val === undefined) || (val === null) ) { // 不存储undefined和null
          if ( arguments[2] === true ) {
            val = sessionStorage[key]
          } else {
            val = localStorage[key]
          }
          if ( val && val.indexOf('obj-') === 0 ) {
            val = val.slice(4)
            return JSON.parse(val)
          } else {
            return val
          }
        } else {
          let a = val
          if ( val instanceof Object ) {
            val = 'obj-' + JSON.stringify(val)
          } else {
            val = val + ''
          }
          if ( arguments[2] === true ) {
            sessionStorage[key] = val
          } else {
            localStorage[key] = val
          }
          return a
        }
      }
    },
    rmStorageL (key) {
      if ( typeof(Storage) !== 'undefined' && key ) {
        if ( arguments[1] === true ) {
          sessionStorage.removeItem(key)
        } else {
          localStorage.removeItem(key)
        }
      }
    },
    rmStorageLAll () {
      if ( typeof(Storage) !== 'undefined' ) {
        if ( arguments[0] === true ) {
          sessionStorage.clear()
        } else {
          localStorage.clear()
        }
      }
    },
    //是否是在微信中
    isWeixin () {
      let ua = navigator.userAgent.toLowerCase()
      if ( ua.indexOf('micromessenger') >= 0 ) {
        return true
      }
      return false
    },
    //是否是测试环境
    isTest () {
      return isTest()
    },
    // 获取服务器时间戳
    getTT (callback = function () {}, ispros) {

      let that = this, st = that.seaverTs, lt = that.localOs, ds

      if ( st && lt ) { // 短时间内不会多次请求时间戳
        ds = (+new Date()) - lt // 本地的时间差
        if ( ds >= 0 && ds < 60000 ) { // ‘短时间’的时间ms
          callback( ( st + ds ) )
          return false
        }
      }

      if ( that.ispros === false && ispros === undefined ) {
        ispros = false
      }

      if ( ispros !== false ) {
        that.loading('show')
      }

      axios.get( ( that.domainUrl + '/ushop-api-merchant/api/user/login/timestamp/' ) )
      .then((res) => {
        let tt = res && res.data && res.data.timestamp
        that.seaverTs = tt
        that.localOs = +new Date()
        callback((tt || 0))
        if ( ispros !== false ) {
          that.loading('hide')
        }
      })
      .catch((res) => {
        callback(0)
        if ( ispros !== false ) {
          that.loading('hide')
        }
      })
    },
    // 格式化请求地址，需要令牌的地方使用，用到了MD5加密；
    // url 不带有域名的请求地址比如:下面是订单支付的url
    // '/ushop-api-merchant/api/cart/payment/balancepay/orderNo'
    // callback 回调函数，参数为新的url，带有了域名参数
    formatUrl ( url, tt, domain ) {
        let that = this,
            userid = that.storageL(that.userId),
            token = that.storageL(that.token),
            sign = md5(url + '?userid=' + userid + '&token=' + token + '&timestamp=' + tt).toUpperCase()

        domain = domain || that.domainUrl
        url = domain + url + '?userid=' + userid + '&timestamp=' + tt + '&sign=' + sign

        return url
    },
    // 单独的ajax请求（包括签字）
    ajax (_url, _method, _data, callback = function () {}, ispros) {
      let that = this,
        _param = {
          method: 'get',
          data: {},
          timeout: 10000
        }
      function sendaxios (p) {
        axios(p)
        .then(function (res) {

          if (ispros !== false) {
            that.loading('hide')
          }

          let data = res && res.data,
              errstr = data.error + ''

          // 表示签字错误
          if ( errstr.indexOf('1008000') >= 0 ) {
            that.rmStorageL(that.userId)
            that.rmStorageL(that.token)
            window.location.reload() // 刷新界面
          }
          callback((data || {}), res)
        })
        .catch(function (res) {
          if ( ispros !== false ) {
            that.loading('hide')
          }
          callback({}, res)
        })
      }
      function purl () {
        if ( _param.method.toLowerCase() === 'get' && !that.isEmptyObject( _param.data ) ) {
          let a = []
          that.each(_param.data, ( k, v ) => {
            a[a.length] = (encodeURIComponent(k) + '=' + encodeURIComponent(v))
          })
          _param.url = _param.url.indexOf('?') ? (_param.url + '&' + a.join('&')) : (_param.url + '?' + a.join('&'))
        }
      }
      if (typeof arguments[0] === 'string') {
        _param.url = _url
        _param.method = _method || 'get'
        _param.data = _data || {}
        if(typeof _data === 'string'){
          _param.headers = {'Content-Type' : 'application/json;charset=UTF-8'}
        }
      } else {
        callback = arguments[1] || function () {}
        that.extend(_param, arguments[0])
        ispros = arguments[2]
      }
      if (that.ispros === false && ispros === undefined) {
        ispros = false
      }
      if (ispros !== false) {
        that.loading('show')
      }
      // 说明需要签字
      if (_param.url.indexOf('/') === 0) {
        that.getTT((tt) => {
          _param.url = that.formatUrl(_param.url, tt)
          purl()
          sendaxios(_param)
        }, false)
      } else {
        purl()
        sendaxios(_param)
      }
    },
    //多次并发请求
    //arr参数为[{},[],function(){}]形式
    //参数为对象或者数组时，为ajax参数
    //参数为函数时，会直接执行此函数，并必须包含一个回调，否则无法判断执行完成
    ajaxAll (arr, callback = function () {}, ispros) {
      let that = this,
          lgn = arr.length,
          rNum = 0,
          rArr = new Array(lgn).fill(null),
          rfn = function(i, data){
            rNum++
            rArr[i] = data
            if(rNum === lgn){
              that.loading('hide')
              callback.apply(null, rArr)
            }
          }

      if ( lgn > 0 ) {
        if ( ispros !== false ) {
          that.loading('show')
        }
      } else {
        return false
      }
      that.each(arr, function(i, o){
        if(o instanceof Object){
          that.ajax(o, function(data){rfn(i, data)}, false)
        }else{
          rfn(i, {})
        }
      })
    },
    loading ( status, txt = '' ) {
      let box = document.querySelector('.loading_box_show')

      if ( box ) {
        if ( status === 'show' ) {
          box.classList.remove('hide')
          if ( typeof txt === 'string' ) {
            box.querySelector('.loading-box-text').innerHTML = txt
          }
        } else if (status === 'hide') {
          box.classList.add('hide')
        }
        return false
      }
      let str = 
          `<div class="loading-con">
            <div class="loading-rotate-img"></div>
            <div class="loading-box-text">${txt}</div>
          </div>`
      box = document.createElement('div')
      box.className = 'loading_box_show loading-box'
      box.innerHTML = str
      document.body.appendChild(box)
    },
    deCodeUrl (str = document.URL) {
      str = str.split('?')[1] || ''
      str = str.split('#')[0] || ''
      let a = {}
      if ( str ) {
        let b = str.split('&'),
          i = 0, s
        while (s = b[i++]) {
          s = (s + '').split('=')
          a[s[0]] = s[1]
        }
      }
      return a
    },
    // 时间格式化
    msToTime: function(ms){
      if(!ms){return ''}
      let _date = (ms instanceof Date) ? ms : new Date(ms)
      let _y = _date.getFullYear(),
          _m = _date.getMonth() + 1,
          _d = _date.getDate(),
          _h = _date.getHours(),
          _i = _date.getMinutes(),
          _s = _date.getSeconds()
      let a = {
            _y: (_y < 10) ? ('0' + _y) : (_y + ''),
            _m: (_m < 10) ? ('0' + _m) : (_m + ''),
            _d: (_d < 10) ? ('0' + _d) : (_d + ''),
            _h: (_h < 10) ? ('0' + _h) : (_h + ''),
            _i: (_i < 10) ? ('0' + _i) : (_i + ''),
            _s: (_s < 10) ? ('0' + _s) : (_s + '')
          }
      a.em = (a._y + '-' + a._m)
      a.ed = (a.em + '-' + a._d)
      a.eh = (a.ed + ' ' + a._h)
      a.ei = (a.eh + ':' + a._i)
      a.es = (a.ei + ':' + a._s)
      a.ms = _date.getTime()
      a['date'] = _date
      return a
    },
    openPage ( url ) {
      if ( url ) {
        window.location.href = url
      }
    }
  }
}
export default globaljs
