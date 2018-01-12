/**
 * 文件名：xlku.js
 * 作者：xulin
 * 日期：2017-04-17
 **/
//ajax方法封装，可独立使用，不依赖任何库，和上面也没有关系
function xlkuajax(_param, callback){
	callback = _param.callback || callback || function(){};
	var _a = {
		url: '',//请求地址
		type: 'get',//请求方式
		dataType: 'json',//返回数据类型
		timeout: 20000,//超时终止
		data: {},//需要传递的参数
		async: true,//默认异步请求
		headers: {},//请求的头信息
		processData: true//是否处理数据，以form传输
	},
	parseObj = function(obj){//序列化对象
		var s = [], k, v;
		for(k in obj){
			v = obj[k];
			v = typeof v === 'function' ? (v() + '') : ((v + '') || '');
			s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
		}
		return s.join( '&' ).replace(/%20/g, '+');
	};
	for(var pn in _param){//合并对象
		_a[pn] = _param[pn];
	}
	var xhr = new XMLHttpRequest(),
		headers = _a.headers || {},
		data = _a.data || {},
		tt;//计时器ID
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4) {
			clearTimeout(tt);
			if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
				if((_a.dataType).toLocaleLowerCase() === 'json'){
					var rdata = JSON.parse(xhr.responseText + '');
					callback(rdata);
				}else{
					callback(xhr.responseText + '');
				}
			} else {
				callback(xhr, xhr.status);
			}
		}
	};
	if (_a.async && _a.timeout > 0) {//设置timeout
		tt = setTimeout(function(){
			xhr.abort();
		}, _a.timeout);
	}
	xhr.open(_a.type, _a.url, _a.async);//初始化xhr
	if (_a.processData) {
		xhr.setRequestHeader(//默认发送的数据类型
			'content-type',
			'application/x-www-form-urlencoded; charset=UTF-8'
		);
		data = parseObj(data);
	}else{
		if(typeof data === 'object'){
			if(Object.prototype.toString.call(data) != '[object FormData]'){
				data = JSON.stringify(data);
			}
		}else{
			data = (data + '');
		}
	}
	for(var hn in headers){//设置头信息
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
	img.onload = function() {
		var cw = parseInt(newWidth),//表示画布宽度，也就是新图片的宽度
			ch = parseInt(newHeight),//表示画布的高度，也就是新图片的高度
			cw_ch,
			iw = this.width,//记录图片的宽度
			ih = this.height,//记录图片的高度
			iw_ih = iw/ih,
			canvas = document.createElement('canvas'),//创建canvas元素
			ctx = canvas.getContext('2d'),
			quality = 0.8,//保存图片质量，如果超出限制，将会循环减小质量直到0
			dataURL,//用来记录base64的字符串
			isTrue = true,//用来判断是否超出最大KB数
			sw = iw, sh = ih,//用来记录最大能够裁剪的宽高
			ix = 0, iy = 0;//规定裁剪的位置
		maxSize = parseInt(maxSize);//最大限制的kb
		if(!cw && !ch){//没有指定新的宽高
			cw = iw;
			ch = ih;
		}else if(cw && !ch){//没有指定新的高度
			ch = cw/iw_ih;
		}else if(!cw && newHeight){//没有指定新的宽度
			cw = ch*iw_ih;
		}
		cw_ch = cw/ch;
		canvas.width = cw;
		canvas.height = ch;
		if(iw_ih > cw_ch){
			sw = ih*cw_ch;
		}else{
			sh = iw/cw_ch;
		}
		ix = (iw - sw)/2;
		iy = (ih - sh)/2;
		ctx.drawImage(img, ix, iy, sw, sh, 0, 0, cw, ch);
		dataURL = canvas.toDataURL('image/jpeg', quality);
		if(maxSize){
			while(isTrue){
				if(imgSizeFn(dataURL)/1024 > maxSize){
					quality -= 0.1;
					dataURL = canvas.toDataURL('image/jpeg', quality);
				}else{
					isTrue = false;
				}
				if(quality <= 0){
					isTrue = false;
				}
			}
		}
		callback.call(this, dataURL);
		canvas = null;
	};
}

//将base64文件转为文件流
function convertBase64UrlToBlob(base64Url){
	//去掉url的头，并转换为byte
    var bytes = window.atob(base64Url.indexOf(',') > 0 ? base64Url.split(',')[1] : base64Url);
    //处理异常,将ascii码小于0的转换为大于0  
    var ab = new ArrayBuffer(bytes.length);  
    var ia = new Uint8Array(ab);  
    for (var i = 0; i < bytes.length; i++) {  
        ia[i] = bytes.charCodeAt(i);  
    }
    return new Blob( [ab] , {type : 'image/jpeg'});  
}
//获取base64文件大小，返回值为字节(b)
function imgSizeFn(base64Url){
    var str = base64Url.indexOf(',') > 0 ? base64Url.split(',')[1] : base64Url,
		equalIndex = str.indexOf('=');
	if(equalIndex > 0){
	    str = str.substring(0, equalIndex);
	}
	var strLength = str.length,
		fileLen = parseInt(strLength - (strLength/8)*2);
	return fileLen;
}

//复制到剪贴板
function copyClipboardFn(val){
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
function testBtnFn(){
//	此接口获取access_token
	var url1 = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxdbb5b2437bd5ed69&secret=95ea4492af55397f57c33c4ea3b7fe8c';
	Common.ajax(url1, 'get', {}, function(data1){
		console.log(data1);
		//此接口获取jsapi_ticket
		if(!data1.access_token){return false;}
		var url2 = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + data1.access_token + '&type=jsapi';
		Common.ajax(url2, 'get', {}, function(data2){
			console.log(data2);
			if(data2.ticket){
				var timestamp = parseInt((new Date()).getTime()/1000);
				var curUrl = 'pay.lotplay.cn/ushop-api-merchant/html/weixinmp/home.html';
				var signatureMin = 'jsapi_ticket=' + data2.ticket +
									'&noncestr=CGFXkC7hC6ThdefN'+
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
	var signatureMin = 'jsapi_ticket=' + jsapi_ticket+
						'&noncestr=CGFXkC7hC6ThdefN'+
						'&timestamp=1493366680'+
						'&url=' + curUrl;
	console.log(signatureMin);
	console.log(sha1(signatureMin));
	var _url = '/uplatform-api-merchant/api/user/oauth2/authorize';
	Common.formatUrl(_url, function(newUrl){
		if(newUrl != 'error'){
			newUrl += '&state=xxy&secret=' + globalData.secret + '&appid=' + globalData.appid + '&scope=ssx&response_type=code';
		}
	});
	Common.ajax(_url, 'get', {}, function(){
		console.log(arguments)
	});
}

//生成随机字符串
function randomString(len) {
　　len = len || 32;
	//默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
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

//创建元素
//createFn('<div>123</div>')
function createFn(str){
	var div = document.createElement('div'),
		ele;
	div.innerHTML = str;
	var cs1 = div.childNodes,
		cs = [],
		i = 0;
	while(ele = cs1[i++]){
		if(ele.nodeType === 1){
			cs[cs.length] = ele;
		}
	};
	if(cs.length > 1){
		return cs;
	}else if(cs.length == 1){
		return cs[0];
	}else{
		return {};
	}
}

//只能是用户操作调用(比如用onclick执行),无法直接只用JS执行
function launchFullscreen(element) {
	if(element.requestFullscreen) {
		element.requestFullscreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if(element.msRequestFullscreen) {
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
	if(window.opera) {
		engine.ver = browser.ver = window.opera.version();
		engine.opera = browser.opera = parseFloat(engine.ver);
	} else if(/AppleWebKit\/(\S+)/.test(ua)) {
		engine.ver = RegExp["$1"];
		engine.webkit = parseFloat(engine.ver);
		//确定是 Chrome 还是 Safari
		if(/Chrome\/(\S+)/.test(ua)) {
			browser.ver = RegExp["$1"];
			browser.chrome = parseFloat(browser.ver);
		} else if(/Version\/(\S+)/.test(ua)) {
			browser.ver = RegExp["$1"];
			browser.safari = parseFloat(browser.ver);
		} else {
			//近似地确定版本号
			var safariVersion = 1;
			if(engine.webkit < 100) {
				safariVersion = 1;
			} else if(engine.webkit < 312) {
				safariVersion = 1.2;
			} else if(engine.webkit < 412) {
				safariVersion = 1.3;
			} else {
				safariVersion = 2;
			}
			browser.safari = browser.ver = safariVersion;
		}
	} else if(/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)) {
		engine.ver = browser.ver = RegExp["$1"];
		engine.khtml = browser.konq = parseFloat(engine.ver);
	} else if(/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)) {
		engine.ver = RegExp["$1"];
		engine.gecko = parseFloat(engine.ver);
		//确定是不是 Firefox
		if(/Firefox\/(\S+)/.test(ua)) {
			browser.ver = RegExp["$1"];
			browser.firefox = parseFloat(browser.ver);
		}
	} else if(/MSIE ([^;]+)/.test(ua)) {
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
	if(system.win) {
		if(/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
			if(RegExp["$1"] == "NT") {
				switch(RegExp["$2"]) {
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
			} else if(RegExp["$1"] == "9x") {
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
	if(system.win == "CE") {
		system.winMobile = system.win;
	} else if(system.win == "Ph") {
		if(/Windows Phone OS (\d+.\d+)/.test(ua)) {;
			system.win = "Phone";
			system.winMobile = parseFloat(RegExp["$1"]);
		}
	}
	//检测 iOS 版本
	if(system.mac && ua.indexOf("Mobile") > -1) {
		if(/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)) {
			system.ios = parseFloat(RegExp.$1.replace("_", "."));
		} else {
			system.ios = 2; //不能真正检测出来，所以只能猜测
		}
	}
	//检测 Android 版本
	if(/Android (\d+\.\d+)/.test(ua)) {
		system.android = parseFloat(RegExp.$1);
	}
	//游戏系统
	system.wii = ua.indexOf("Wii") > -1;
	system.ps = /playstation/i.test(ua);
	//返回这些对象
	return {
		engine: engine,//呈现引擎
		browser: browser,//浏览器
		system: system//平台、设备和操作系统
	};
};


//touch的封装可用于PC 基于jQuery
function touchXL($me){
	if(!$me){return false;}
	if(($me.nodeType === 1) || (typeof $me === 'string')){
		$me =  $($me);
	}else if(!($me instanceof jQuery)){
		return false;
	}
	if(!($me.length > 0)){return false;}
	var nt = $me.data('bindt');
	var cbObj = {
		tap: function(){},//单击事件
		moveend: function(){},//滑动完成事件
		longTouch: function(){},//长按事件
		tbSlideFn: function(){},//上下滑动事件
		lrSlideFn: function(){}//左右滑动事件
	};
	var isTouch = 'ontouchstart' in window,
    	start = isTouch ? 'touchstart' : 'mousedown',
    	move = isTouch ? 'touchmove' : 'mousemove',
    	end = isTouch ? 'touchend' : 'mouseup',
    	dstart = 'dragstart',
    	longt = 1000,//长按的时间
    	tapt = 200,//单机的时间
    	moves = 10;//滑动的最短距离
	if(nt){
		if(arguments[1] === 'logout'){
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
	$me.on(start, function(e){
    	var hobj = isTouch ? e.originalEvent.targetTouches[0] : e.originalEvent,
    		touchXL = {
	    		s: {
		    		x: hobj.pageX,
		    		y: hobj.pageY,
		    		t: Date.now()
	    		},
	    		type: 'start'
    		};
    	touchXL.s1000 = setTimeout(function(){
    		touchXL = $me.data('touchXL');
    		touchXL.s.lt = longt;
    		touchXL.type = 'long';
    		$me.data('touchXL', touchXL);
    		cbObj.longTouch(touchXL, e);
    	}, longt);
    	$me.data('touchXL', touchXL);
    }).on(move, function(e){
    	var hobj = isTouch ? e.originalEvent.targetTouches[0] : e.originalEvent,
    		touchXL = $me.data('touchXL') || {},
    		s = touchXL.s,
    		type = touchXL.type,
    		m;
    	clearTimeout(touchXL.s1000);
    	//未经过start
    	if(!s || s.lt){
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
    	if(type === 'move_tb'){
    		touchXL.type = 'move_tb';
    		cbObj.tbSlideFn(touchXL, e);
    	}else if(type === 'move_lr'){
    		touchXL.type = 'move_lr';
	    	cbObj.lrSlideFn(touchXL, e);
    	}else if(Math.abs(y_y) > moves){
    		touchXL.type = 'move_tb';
    		cbObj.tbSlideFn(touchXL, e);
    	}else if(Math.abs(x_x) > moves){
    		touchXL.type = 'move_lr';
	    	cbObj.lrSlideFn(touchXL, e);
    	}else{
    		return false;//不保存move事件
    	}
    	$me.data('touchXL', touchXL);
    }).on(dstart, function(){
    	return false;//阻止元素拖拽
    });
    $(document).on(end, function(e){
    	var touchXL = $me.data('touchXL') || {},
    		nt = Date.now(),
    		type = touchXL.type || '',
    		s = touchXL.s,
    		m = touchXL.m;
    	touchXL.e = {t: nt};
    	clearTimeout(touchXL.s1000);//清除初始用于检测长按的计时
    	if((s && (nt - s.t < tapt)) && type === 'start'){
    		touchXL.type = 'tap';
    		cbObj.tap(touchXL, e);
    	}else if(s && m){
    		cbObj.moveend(touchXL, e);
    	}
    	$me.removeData('touchXL');
    });
    return cbObj;
}