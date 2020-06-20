/**
 * 文件名：xlku.js
 * 作者：xulin
 * 日期：2017-04-17
 **/

// 判断元素属性
// gettype([]) // array
function gettype(arg0) {
  var str = Object.prototype.toString.call(arg0).slice(8, -1).toLocaleLowerCase();
  if ((arg0 + '' === 'NaN') && (str === 'number')) {
    return 'NaN'
  }
  return str;
}

// 随机值，包含最大和最小值
// 参数为最小和最大数
function randommm(min, max) {
  min = parseInt(min) || 0;
  max = parseInt(max) || 9;
  return parseInt(Math.random() * (max - min + 1) + min);
}

// 去掉首尾空格
function trim(str) {
  return (str + '').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}

// 判断是否是空对象
function isEmptyObject(obj) {
  if (!(obj instanceof Object)) {
    return false
  }
  for (let v in obj) {
    return false
  }
  return true
}

// 简单版本的防抖节流函数
// 不传intval时，就是按照一定的间隔执行
function debounce(method, delay, intval) {
  let timer = null;
  return function () {
    if (intval === true) { // 只执行最后一次的
      clearTimeout(timer);
    } else if (timer) { // 按一定的间隔执行
      return;
    }
    let context = this;
    let args = arguments;
    timer = setTimeout(function () {
      timer = null;
      method.apply(context, args);
    }, delay);
  }
}
// 只执行最后一次
function throttle(method, delay) {
  return debounce(method, delay, true);
}

// 用于浏览器缓存
// val存在就是赋值，为null，undefined则是获取
// 默认存储方式为localstorage，如果传入第三个参数为true，则可以切换为sessionStorage
function storageL(key, val) {
  if (typeof (Storage) !== 'undefined') {
    if ((val === undefined) || (val === null)) { //不存储undefined和null
      if (arguments[2] === true) {
        val = sessionStorage[key];
      } else {
        val = localStorage[key];
      }
      if (val && val.indexOf('obj-') === 0) {
        val = val.slice(4);
        return JSON.parse(val);
      } else {
        return val;
      }
    } else {
      var a = val;
      if (val instanceof Object) {
        val = 'obj-' + JSON.stringify(val);
      } else {
        val = val + '';
      }
      if (arguments[2] === true) {
        sessionStorage[key] = val;
      } else {
        localStorage[key] = val;
      }
      return a;
    }
  }
}

// 用于浏览器缓存的删除
// 默认存储方式为localstorage，如果传入第二个参数为true，则可以切换为sessionStorage
function rmStorageL(key) {
  if (typeof (Storage) !== 'undefined' && key) {
    if (arguments[1] === true) {
      sessionStorage.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
  }
}

// 用于浏览器缓存，清空数据
// 默认存储方式为localstorage，如果传入第二个参数为true，则可以切换为sessionStorage
function rmStorageLAll() {
  if (typeof (Storage) !== 'undefined') {
    if (arguments[0] === true) {
      sessionStorage.clear();
    } else {
      localStorage.clear();
    }
  }
}


// eventType 事件名称， eventKey 事件名称空间， eventFn 事件绑定的函数，
// mode 事件绑定的模式, on 正常监听 once 只执行一次的监听 
// mode ronce 只能绑定一个函数的监听， eventKey下数组只能有一个绑定函数后面的会覆盖前面的
// data结构 {eventType: {eventKey: [ { eventFn, mode } ]}}
class XLEvents {
  constructor() {
    // 数据函数存储
    this.data = {};
    // 可用的事件监听模式
    this.modeArr = ['on', 'once', 'ronce'];
    // 如果碰巧名称一样，那抱歉了，bug
    this.dkey = '$xl_default_ll';
  }
  formatType(type, isd) {
    let arr = type.split('.');
    let eventType = arr[0] || this.dkey; // 事件名称
    let eventKey = arr[1] === '' ? this.dkey : ''; // 事件命名空间

    // 直接补默认值
    if (isd === true && !eventType) {
      eventKey = this.dkey;
    }
    let tItem = this.data[eventType] ? { ...this.data[eventType] } : {};
    let kItem = tItem[eventKey] ? [...tItem[eventKey]] : [];
    return { eventType, eventKey, tItem, kItem };
  }
  // 监听时如果没有事件名称或命名空间，都会给默认值
  on(type, eventFn, mode = 'on') {
    let { eventType, eventKey, tItem, kItem } = this.formatType(type, true);
    if (!this.modeArr.includes(mode)) {
      mode = 'on';
    }
    if (typeof eventFn === 'function' && !kItem.some(fn => eventFn === fn)) {
      let eItem = { eventFn, mode };
      // 只会监听一个函数，后面的函数监听会覆盖前面的
      if (mode === 'ronce') {
        kItem = [eItem];
      } else {
        kItem.push(eItem);
      }
    }
    tItem[eventKey] = kItem;
    this.data[eventType] = tItem;
    return this;
  }
  once(type, eventFn) {
    return this.on(type, eventFn, 'once');
  }
  emitKItem(kItem, args) {
    kItem = kItem.filter(eItem => {
      let fn = eItem.eventFn;
      fn(...args);
      // 只监听一次的，之后会直接删除
      if (eItem.mode === 'once') {
        return false;
      }
      return true;
    });
    return kItem;
  }

  // 触发时，如果没有命名空间
  // 会触发此事件下所有的事件绑定
  emit(type, ...args) {
    let { eventType, eventKey, tItem, kItem } = this.formatType(type);
    // 触发此事件下所有的事件绑定
    if (!eventKey) {
      for (let k in tItem) {
        if (tItem[k] && tItem[k].length) {
          tItem[k] = this.emitKItem(tItem[k], args);
        }
      }
      this.data[eventType] = tItem;
      return this;
    }
    if (kItem && kItem.length) {
      kItem = this.emitKItem(kItem, args);
      tItem[eventKey] = kItem;
      this.data[eventType] = tItem;
    }
    return this;
  }

  // 解除绑定时， 如果没有命名空间
  // 则清空此事件下所有的监听
  off(type, eventFn) {
    let { eventType, eventKey, tItem, kItem } = this.formatType(type);
    // 清空此事件下所有的事件绑定
    if (!eventKey) {
      this.data[eventType] = {};
      return this;
    }
    if (kItem && kItem.length) {
      if (typeof eventFn === 'function') { // 删掉单个监听
        kItem = kItem.filter(fn => fn !== eventFn);
      } else { // 删除整个组的
        kItem = [];
      }
      tItem[eventKey] = kItem;
      this.data[eventType] = tItem;
    }
    return this;
  }
}

// 时间格式化
function msToTime(ms) {
  if (!ms) {
    return ''
  };
  var _date = (ms instanceof Date) ? ms : new Date(ms);
  var _y = _date.getFullYear(),
    _m = _date.getMonth() + 1,
    _d = _date.getDate(),
    _h = _date.getHours(),
    _i = _date.getMinutes(),
    _s = _date.getSeconds();
  var a = {
    _y: (_y < 10) ? ('0' + _y) : (_y + ''),
    _m: (_m < 10) ? ('0' + _m) : (_m + ''),
    _d: (_d < 10) ? ('0' + _d) : (_d + ''),
    _h: (_h < 10) ? ('0' + _h) : (_h + ''),
    _i: (_i < 10) ? ('0' + _i) : (_i + ''),
    _s: (_s < 10) ? ('0' + _s) : (_s + '')
  }
  a.em = (a._y + '-' + a._m);
  a.ed = (a.em + '-' + a._d);
  a.eh = (a.ed + ' ' + a._h);
  a.ei = (a.eh + ':' + a._i);
  a.es = (a.ei + ':' + a._s);
  a.ms = _date.getTime();
  a['date'] = _date;
  return a;
}

// num要处理的数字，dec保留小数位数 2
// cho舍入方法'u,d,r'上、下、四舍五入 'u'
// sep 千分位分隔符 ','
// dot 小数点字符 '.'
function nf(num, dec, sep, cho, dot) {
  num = parseFloat(num);
  if (!num) {
    return '';
  }
  var pre = 7; // 计算精度，小数点后七位

  dec = dec <= pre && dec >= 0 ? parseInt(dec) : pre; //保留小数位数 默认pre
  cho = cho || 'u'; // 舍入方法'u,d,r'上、下、四舍五入 默认'u'
  dot = dot || '.'; // 小数点字符 默认'.'

  var arr = (num + '').split('.');
  var re = /(\d+)(\d{3})/;
  var a0 = arr[0];
  var a1 = (arr[1] && arr[1].substr(0, dec)) || '0';
  var a2 = parseInt((arr[1] && arr[1].substr(dec, 1))) || 0;
  var a3 = dec - a1.length;

  if (a3 > 0) {
    a1 += new Array(a3).join('0'); // 补充足够多的0
  }
  if (dec > 0) {
    a1 = a1.substr(0, dec);
  }
  if (!(cho === 'd' || (cho === 'r' && a2 < 5) || a2 === 0)) {
    if (dec > 0) {
      a1 = (parseInt(a1) + 1) + '';
    } else {
      a0 = (parseInt(a0) + 1) + '';
    }
  }
  if (!!sep && parseInt(a0) > 999) {
    while (re.test(a0)) {
      a0 = a0.replace(re, ('$1' + sep + '$2'))
    }
  }
  if (typeof sep !== 'string') {
    return (dec > 0 ? parseFloat(a0 + dot + a1) : parseInt(a0));
  }
  return (dec > 0 ? (a0 + dot + a1) : a0);
}

//生成随机字符串
function randomString(len) {
  len = len || 32;
  //默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
  // var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  var maxPos = $chars.length;
  var pwd = '';
  for (i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

//字母汉字排序
var a = ['武汉', 'deed', 'eee', 'box', '北京', '上海', '天津'];
a = a.sort(
  function compareFunction(param1, param2) {
    return param1.localeCompare(param2);
  }
);

//ajax方法封装，可独立使用，不依赖任何库，和上面也没有关系
function xlkuajax(_param, callback) {
  callback = _param.callback || callback || function () { };
  var _a = {
    url: '', //请求地址
    type: 'get', //请求方式
    dataType: 'json', //返回数据类型
    timeout: 20000, //超时终止
    data: {}, //需要传递的参数
    async: true, //默认异步请求
    headers: {}, //请求的头信息
    processData: true //是否处理数据，以form传输
  },
    parseObj = function (obj) { //序列化对象
      var s = [],
        k, v;
      for (k in obj) {
        v = obj[k];
        v = typeof v === 'function' ? (v() + '') : ((v + '') || '');
        s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
      }
      return s.join('&').replace(/%20/g, '+');
    };
  for (var pn in _param) { //合并对象
    _a[pn] = _param[pn];
  }
  var xhr = new XMLHttpRequest(),
    headers = _a.headers || {},
    data = _a.data || {},
    tt; //计时器ID
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      clearTimeout(tt);
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
        if ((_a.dataType).toLocaleLowerCase() === 'json') {
          var rdata = JSON.parse(xhr.responseText + '');
          callback(rdata);
        } else {
          callback(xhr.responseText + '');
        }
      } else {
        callback(xhr, xhr.status);
      }
    }
  };
  if (_a.async && _a.timeout > 0) { //设置timeout
    tt = setTimeout(function () {
      xhr.abort();
    }, _a.timeout);
  }
  xhr.open(_a.type, _a.url, _a.async); //初始化xhr
  if (_a.processData) {
    xhr.setRequestHeader( //默认发送的数据类型
      'content-type',
      'application/x-www-form-urlencoded; charset=UTF-8'
    );
    data = parseObj(data);
  } else {
    if (typeof data === 'object') {
      if (Object.prototype.toString.call(data) != '[object FormData]') {
        data = JSON.stringify(data);
      }
    } else {
      data = (data + '');
    }
  }
  for (var hn in headers) { //设置头信息
    xhr.setRequestHeader(hn, headers[hn]);
  }
  xhr.send(data);
}

//将指定地址的图片转为base64文件，只会转为jpeg，不支持png，png图片文件太大，无法压缩
//url: 图片地址
//newWidth: 缩放后新图片的宽度，单位px
//newHeight: 缩放后新图片的高度，单位px
//如果只有宽或者高，将按给出的宽或高等比缩放，如果都没有则不缩放
//maxSize：新图片的最大内存大小，单位kb
//callback：回调函数，参数为新图片的base64字符串
//图片传输方法的示例
//convertImgToBase64('images/115.jpg', 100, 100, 10, function(imgB64){
//	var fd = new FormData();
//	fd.append('file', convertBase64UrlToBlob(imgB64), 'img.jpeg');
//	ajax({
//		url: _url,
//		type: 'post',
//		data: fd,
//		processData: false
//	}, function(){
//		console.log(arguments)
//	});
//});
function convertImgToBase64(url, newWidth, newHeight, maxSize, callback) {
  var img = new Image;
  img.crossOrigin = 'Anonymous';
  img.src = url;
  img.onload = function () {
    var cw = parseInt(newWidth), //表示画布宽度，也就是新图片的宽度
      ch = parseInt(newHeight), //表示画布的高度，也就是新图片的高度
      cw_ch,
      iw = this.width, //记录图片的宽度
      ih = this.height, //记录图片的高度
      iw_ih = iw / ih,
      canvas = document.createElement('canvas'), //创建canvas元素
      ctx = canvas.getContext('2d'),
      quality = 0.8, //保存图片质量，如果超出限制，将会循环减小质量直到0
      dataURL, //用来记录base64的字符串
      isTrue = true, //用来判断是否超出最大KB数
      sw = iw,
      sh = ih, //用来记录最大能够裁剪的宽高
      ix = 0,
      iy = 0; //规定裁剪的位置
    maxSize = parseInt(maxSize); //最大限制的kb
    if (!cw && !ch) { //没有指定新的宽高
      cw = iw;
      ch = ih;
    } else if (cw && !ch) { //没有指定新的高度
      ch = cw / iw_ih;
    } else if (!cw && newHeight) { //没有指定新的宽度
      cw = ch * iw_ih;
    }
    cw_ch = cw / ch;
    canvas.width = cw;
    canvas.height = ch;
    if (iw_ih > cw_ch) {
      sw = ih * cw_ch;
    } else {
      sh = iw / cw_ch;
    }
    ix = (iw - sw) / 2;
    iy = (ih - sh) / 2;
    ctx.drawImage(img, ix, iy, sw, sh, 0, 0, cw, ch);
    dataURL = canvas.toDataURL('image/jpeg', quality);
    if (maxSize) {
      while (isTrue) {
        if (imgSizeFn(dataURL) / 1024 > maxSize) {
          quality -= 0.1;
          dataURL = canvas.toDataURL('image/jpeg', quality);
        } else {
          isTrue = false;
        }
        if (quality <= 0) {
          isTrue = false;
        }
      }
    }
    callback.call(this, dataURL);
    canvas = null;
  };
}

//将base64文件转为文件流
function convertBase64UrlToBlob(base64Url) {
  //去掉url的头，并转换为byte
  var bytes = window.atob(base64Url.indexOf(',') > 0 ? base64Url.split(',')[1] : base64Url);
  //处理异常,将ascii码小于0的转换为大于0
  var ab = new ArrayBuffer(bytes.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i);
  }
  return new Blob([ab], {
    type: 'image/jpeg'
  });
}
//获取base64文件大小，返回值为字节(b)
function imgSizeFn(base64Url) {
  var str = base64Url.indexOf(',') > 0 ? base64Url.split(',')[1] : base64Url,
    equalIndex = str.indexOf('=');
  if (equalIndex > 0) {
    str = str.substring(0, equalIndex);
  }
  var strLength = str.length,
    fileLen = parseInt(strLength - (strLength / 8) * 2);
  return fileLen;
}

//复制到剪贴板
function copyClipboardFn(val) {
  var ipt = document.createElement('textarea');
  ipt.value = val || '没有内容';
  ipt.style.position = 'absolute';
  ipt.style.left = '999999px';
  document.body.appendChild(ipt);
  ipt.select();
  document.execCommand("Copy"); // 执行浏览器复制命令
  alert("已复制好，可贴粘。");
  document.body.removeChild(ipt);
}



//	正式版appid: wx7eaf9a2e612db7b4
//	正式版ApppSecret: 034d997cb96424674d0ef37633e7f07e
//
//	测试版appid: wxdbb5b2437bd5ed69
//	测试版ApppSecret: 95ea4492af55397f57c33c4ea3b7fe8c
//$('<button class="xl-btn xl-btn-block" onclick="testBtnFn()">测试按键</button>').prependTo('body');
//微信jsd授权
function testBtnFn() {
  //	此接口获取access_token
  var url1 = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxdbb5b2437bd5ed69&secret=95ea4492af55397f57c33c4ea3b7fe8c';
  Common.ajax(url1, 'get', {}, function (data1) {
    console.log(data1);
    //此接口获取jsapi_ticket
    if (!data1.access_token) {
      return false;
    }
    var url2 = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + data1.access_token + '&type=jsapi';
    Common.ajax(url2, 'get', {}, function (data2) {
      console.log(data2);
      if (data2.ticket) {
        var timestamp = parseInt((new Date()).getTime() / 1000);
        var curUrl = 'pay.lotplay.cn/ushop-api-merchant/html/weixinmp/home.html';
        var signatureMin = 'jsapi_ticket=' + data2.ticket +
          '&noncestr=CGFXkC7hC6ThdefN' +
          '&timestamp=' + timestamp +
          '&url=' + curUrl;
        console.log('signatureMin = ' + signatureMin);
        console.log('timestamp = ' + timestamp);
        console.log(sha1(signatureMin));
      }
    });
  });
  var jsapi_ticket = 'kgt8ON7yVITDhtdwci0qeTJm_y3N9OWpUP3suL8gpSj1vE_vMt1_EwARbViOAqaihYabYB6tQCnLm4KGyE83tA';
  var curUrl = 'pay.lotplay.cn/ushop-api-merchant/html/weixinmp/home.html';
  var signatureMin = 'jsapi_ticket=' + jsapi_ticket +
    '&noncestr=CGFXkC7hC6ThdefN' +
    '&timestamp=1493366680' +
    '&url=' + curUrl;
  console.log(signatureMin);
  console.log(sha1(signatureMin));
  var _url = '/uplatform-api-merchant/api/user/oauth2/authorize';
  Common.formatUrl(_url, function (newUrl) {
    if (newUrl != 'error') {
      newUrl += '&state=xxy&secret=' + globalData.secret + '&appid=' + globalData.appid + '&scope=ssx&response_type=code';
    }
  });
  Common.ajax(_url, 'get', {}, function () {
    console.log(arguments)
  });
}


//创建元素
//createFn('<div>123</div>')
function createFn(str) {
  var div = document.createElement('div'),
    ele;
  div.innerHTML = str;
  var cs1 = div.childNodes,
    cs = [],
    i = 0;
  while (ele = cs1[i++]) {
    if (ele.nodeType === 1) {
      cs[cs.length] = ele;
    }
  };
  if (cs.length > 1) {
    return cs;
  } else if (cs.length == 1) {
    return cs[0];
  } else {
    return {};
  }
}

//只能是用户操作调用(比如用onclick执行),无法直接只用JS执行
function launchFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

//浏览器客户端数据检测
function clientData() {
  //呈现引擎
  var engine = {
    ie: 0,
    gecko: 0,
    webkit: 0,
    khtml: 0,
    opera: 0,
    //完整的版本号
    ver: null
  };
  //浏览器
  var browser = {
    //主要浏览器
    ie: 0,
    firefox: 0,
    safari: 0,
    konq: 0,
    opera: 0,
    chrome: 0,
    //具体的版本号
    ver: null
  };
  //平台、设备和操作系统
  var system = {
    win: false,
    mac: false,
    x11: false,
    //移动设备
    iphone: false,
    ipod: false,
    ipad: false,
    ios: false,
    android: false,
    nokiaN: false,
    winMobile: false,
    //游戏系统
    wii: false,
    ps: false
  };
  //检测呈现引擎和浏览器
  var ua = navigator.userAgent;
  if (window.opera) {
    engine.ver = browser.ver = window.opera.version();
    engine.opera = browser.opera = parseFloat(engine.ver);
  } else if (/AppleWebKit\/(\S+)/.test(ua)) {
    engine.ver = RegExp["$1"];
    engine.webkit = parseFloat(engine.ver);
    //确定是 Chrome 还是 Safari
    if (/Chrome\/(\S+)/.test(ua)) {
      browser.ver = RegExp["$1"];
      browser.chrome = parseFloat(browser.ver);
    } else if (/Version\/(\S+)/.test(ua)) {
      browser.ver = RegExp["$1"];
      browser.safari = parseFloat(browser.ver);
    } else {
      //近似地确定版本号
      var safariVersion = 1;
      if (engine.webkit < 100) {
        safariVersion = 1;
      } else if (engine.webkit < 312) {
        safariVersion = 1.2;
      } else if (engine.webkit < 412) {
        safariVersion = 1.3;
      } else {
        safariVersion = 2;
      }
      browser.safari = browser.ver = safariVersion;
    }
  } else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)) {
    engine.ver = browser.ver = RegExp["$1"];
    engine.khtml = browser.konq = parseFloat(engine.ver);
  } else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)) {
    engine.ver = RegExp["$1"];
    engine.gecko = parseFloat(engine.ver);
    //确定是不是 Firefox
    if (/Firefox\/(\S+)/.test(ua)) {
      browser.ver = RegExp["$1"];
      browser.firefox = parseFloat(browser.ver);
    }
  } else if (/MSIE ([^;]+)/.test(ua)) {
    engine.ver = browser.ver = RegExp["$1"];
    engine.ie = browser.ie = parseFloat(engine.ver);
  }
  //检测浏览器
  browser.ie = engine.ie;
  browser.opera = engine.opera;
  //检测平台
  var p = navigator.platform;
  system.win = p.indexOf("Win") == 0;
  system.mac = p.indexOf("Mac") == 0;
  system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);
  //检测 Windows 操作系统
  if (system.win) {
    if (/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
      if (RegExp["$1"] == "NT") {
        switch (RegExp["$2"]) {
          case "5.0":
            system.win = "2000";
            break;
          case "5.1":
            system.win = "XP";
            break;
          case "6.0":
            system.win = "Vista";
            break;
          case "6.1":
            system.win = "7";
            break;
          default:
            system.win = "NT";
            break;
        }
      } else if (RegExp["$1"] == "9x") {
        system.win = "ME";
      } else {
        system.win = RegExp["$1"];
      }
    }
  }
  //移动设备
  system.iphone = ua.indexOf("iPhone") > -1;
  system.ipod = ua.indexOf("iPod") > -1;
  system.ipad = ua.indexOf("iPad") > -1;
  system.nokiaN = ua.indexOf("NokiaN") > -1;
  //windows mobile
  if (system.win == "CE") {
    system.winMobile = system.win;
  } else if (system.win == "Ph") {
    if (/Windows Phone OS (\d+.\d+)/.test(ua)) {
      ;
      system.win = "Phone";
      system.winMobile = parseFloat(RegExp["$1"]);
    }
  }
  //检测 iOS 版本
  if (system.mac && ua.indexOf("Mobile") > -1) {
    if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)) {
      system.ios = parseFloat(RegExp.$1.replace("_", "."));
    } else {
      system.ios = 2; //不能真正检测出来，所以只能猜测
    }
  }
  //检测 Android 版本
  if (/Android (\d+\.\d+)/.test(ua)) {
    system.android = parseFloat(RegExp.$1);
  }
  //游戏系统
  system.wii = ua.indexOf("Wii") > -1;
  system.ps = /playstation/i.test(ua);
  //返回这些对象
  return {
    engine: engine, //呈现引擎
    browser: browser, //浏览器
    system: system //平台、设备和操作系统
  };
};


//touch的封装可用于PC 基于jQuery
function touchXL($me) {
  if (!$me) {
    return false;
  }
  if (($me.nodeType === 1) || (typeof $me === 'string')) {
    $me = $($me);
  } else if (!($me instanceof jQuery)) {
    return false;
  }
  if (!($me.length > 0)) {
    return false;
  }
  var nt = $me.data('bindt');
  var cbObj = {
    tap: function () { }, //单击事件
    moveend: function () { }, //滑动完成事件
    longTouch: function () { }, //长按事件
    tbSlideFn: function () { }, //上下滑动事件
    lrSlideFn: function () { } //左右滑动事件
  };
  var isTouch = 'ontouchstart' in window,
    start = isTouch ? 'touchstart' : 'mousedown',
    move = isTouch ? 'touchmove' : 'mousemove',
    end = isTouch ? 'touchend' : 'mouseup',
    dstart = 'dragstart',
    longt = 1000, //长按的时间
    tapt = 200, //单机的时间
    moves = 10; //滑动的最短距离
  if (nt) {
    if (arguments[1] === 'logout') {
      var offe = (start + '.start' + nt) + ' ' + (move + '.move' + nt) + ' ' + (dstart + '.dstart' + nt);
      console.log(offe);
      $me.removeData(['bindt', 'touchXL']).off(offe);
      $(document).off((end + '.end' + nt));
    }
    return false;
  }
  nt = Date.now();
  start += ('.start' + nt);
  move += ('.move' + nt);
  end += ('.end' + nt);
  dstart += ('.dstart' + nt);
  $me.data('bindt', nt);
  $me.on(start, function (e) {
    var hobj = isTouch ? e.originalEvent.targetTouches[0] : e.originalEvent,
      touchXL = {
        s: {
          x: hobj.pageX,
          y: hobj.pageY,
          t: Date.now()
        },
        type: 'start'
      };
    touchXL.s1000 = setTimeout(function () {
      touchXL = $me.data('touchXL');
      touchXL.s.lt = longt;
      touchXL.type = 'long';
      $me.data('touchXL', touchXL);
      cbObj.longTouch(touchXL, e);
    }, longt);
    $me.data('touchXL', touchXL);
  }).on(move, function (e) {
    var hobj = isTouch ? e.originalEvent.targetTouches[0] : e.originalEvent,
      touchXL = $me.data('touchXL') || {},
      s = touchXL.s,
      type = touchXL.type,
      m;
    clearTimeout(touchXL.s1000);
    //未经过start
    if (!s || s.lt) {
      return false;
    }
    m = {
      x: hobj.pageX,
      y: hobj.pageY,
      t: Date.now()
    };
    var sx = s.x,
      sy = s.y,
      mx = m.x,
      my = m.y,
      x_x = mx - sx,
      y_y = my - sy;
    m.x_x = x_x;
    m.y_y = y_y;
    touchXL.m = m;
    touchXL.type = 'move';
    if (type === 'move_tb') {
      touchXL.type = 'move_tb';
      cbObj.tbSlideFn(touchXL, e);
    } else if (type === 'move_lr') {
      touchXL.type = 'move_lr';
      cbObj.lrSlideFn(touchXL, e);
    } else if (Math.abs(y_y) > moves) {
      touchXL.type = 'move_tb';
      cbObj.tbSlideFn(touchXL, e);
    } else if (Math.abs(x_x) > moves) {
      touchXL.type = 'move_lr';
      cbObj.lrSlideFn(touchXL, e);
    } else {
      return false; //不保存move事件
    }
    $me.data('touchXL', touchXL);
  }).on(dstart, function () {
    return false; //阻止元素拖拽
  });
  $(document).on(end, function (e) {
    var touchXL = $me.data('touchXL') || {},
      nt = Date.now(),
      type = touchXL.type || '',
      s = touchXL.s,
      m = touchXL.m;
    touchXL.e = {
      t: nt
    };
    clearTimeout(touchXL.s1000); //清除初始用于检测长按的计时
    if ((s && (nt - s.t < tapt)) && type === 'start') {
      touchXL.type = 'tap';
      cbObj.tap(touchXL, e);
    } else if (s && m) {
      cbObj.moveend(touchXL, e);
    }
    $me.removeData('touchXL');
  });
  return cbObj;
}
/*
浏览器渲染流程
先将HTML解析为树形数据结构，将CSS解析为树形数据结构，结合DOM树和CSS树渲染到浏览器中

性能问题
1.文档简洁有效，css，js文件放置位置
2.优化你的CSS，不要使用@import，会阻止浏览器并行下载
3.减少外部HTTP请求，不必要的图片，js，css等文件，将文件压缩，减少重绘重排
4.使用CDN和缓存

安全问题
1. XSS，浏览器错误的讲用户输入数据当成JS代码执行了
对用户数据进行编码输出，告诉浏览器这是普通字符串
2.如果可以不要使用iframe
如果要用，要对iframe进行sendbox限制比如能否执行提交表单，能否执行JS代码，能否弹窗等
3.点击劫持，被第三方将我们的网页放在frame中设为透明后引起用户错误点击
设置告诉浏览器不要把档期的HTTP响应在frame中显示出来

跨域
jsonp,
window.name,
window.postMessage（获取frame的win使用此方法可以在frame中onmessage事件event参数获取数据）
*/


// 完整版本的节流函数，防抖函数
// 从lodash中复制过来的
function debounce(func, wait, options) {
  var lastArgs,
    lastThis,
    maxWait,
    result,
    timerId,
    lastCallTime,
    lastInvokeTime = 0,
    leading = false,
    maxing = false,
    trailing = true;
  var nativeMax = Math.max,
    nativeMin = Math.min;
  var FUNC_ERROR_TEXT = "Expected a function";
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing
      ? nativeMax(toNumber(options.maxWait) || 0, wait)
      : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }

  function toNumber(num) {
    return +num || 0;
  }

  function now() {
    return +new Date();
  }

  function isObject(obj) {
    let s = Object.prototype.toString.call(obj);
    return s.slice(8, -1).toLocaleLowerCase() === "object";
  }

  function invokeFunc(time) {
    var args = lastArgs,
      thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
      timeSinceLastInvoke = time - lastInvokeTime,
      timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
      timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
      isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

function throttle(func, wait, options) {
  var leading = true,
    trailing = true;

  var FUNC_ERROR_TEXT = "Expected a function";
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }

  function isObject(obj) {
    let s = Object.prototype.toString.call(obj);
    return s.slice(8, -1).toLocaleLowerCase() === "object";
  }
  if (isObject(options)) {
    leading = "leading" in options ? !!options.leading : leading;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    leading: leading,
    maxWait: wait,
    trailing: trailing
  });
}

// nodejs 遍历文件夹
// const fs = require('fs');
// const path = require('path');
function eachDir(dirstr) {
  let arr = [];
  aa(dirstr);
  function aa(dirs) {
    let list = fs.readdirSync(dirs);
    list.forEach(s => {
      s = path.join(dirs, s);
      let stat = fs.statSync(s);
      if (stat.isDirectory()) { // 文件夹
        aa(s);
      } else {
        arr.push(s);
      }
    })
  }
  return arr;
}