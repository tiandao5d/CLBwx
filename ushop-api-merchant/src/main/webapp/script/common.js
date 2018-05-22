/**
 * 作用：全局使用的属性和方法
 * 日期：2017-04-05
 * 作者：xulin
 **/
//全局共用方法和属性
"use strict";
var Common = {
	regExpPhone : /^1(3|4|5|7|8)\d{9}$/,//手机正则表达式
	regExpPwd   : /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,15}$/,//密码正则表达式，6-15位字母数字混合
//	regExpName  : /^([A-Za-z]|[\u4E00-\u9FA5]){2,20}$/,//人名正则表达式，只能是字母或者汉字
	regExpName  : /^[\u4E00-\u9FA5]{2,15}$/,//人名正则表达式，只能是汉字
	regExpIDNO  : /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,//身份证正则表达式，二代身份证
	regExpUser  : /^[A-Za-z]{3}1(3|4|5|7|8)\d{9}$/,//用户名正则表达式，手机号前面配三个字母
	regExpBank  : /^(\d{16}|\d{19})$/,//银行卡正则表达式，只验证位数
	regExpCode  : /^\d{6}$/,//手机验证码，只验证六位数字
	
	//本地储存数据命名方式（前缀）
	//localStorage 全局使用前缀ls_global_，局部使用前缀ls_partly_
	//sessionStorage 全局使用前缀ss_global_，局部使用前缀ss_partly_
	userId      : 'ls_global_user_id',//记录用户ID
	token       : 'ls_global_token',//记录用户token值
	userName    : 'ls_global_user_name',//记录用户登录时用的账号
	bindPhone   : 'ls_global_user_phone',//记录用户绑定的手机号
	localPay    : 'ls_global_pay_list',//用于支付流程使用的存储内容
	userData    : 'ls_global_user_info',//记录用户的全面信息
	localLot    : 'ls_global_lottery_data',//彩票数据
	localPro    : 'ls_global_province_data',//本地省份数据
	localGen    : 'ls_global_generalize_data',//本地推广员数据
	messageG    : function(){//全局消息通知数据，配合用户名，区分用户
		return 'ls_global_message_g_data' + Common.storageL(Common.userId);
	},
	//获取用户ID，参数为返回一个带有str前缀ID字符串
	getUserId   : function(str){
		if(Common.storageL(Common.userId)){
			return (str || '') + Common.storageL(Common.userId);
		}else{
			return (str || '');
		}
	},
	//获取当前页面的URL地址，全部地址包括?后面的参数
	getCurUrl: function(){
		return document.URL;
	},
	//获取为写APPid
	getAppId: function(){
		if(Common.domainUrl === 'http://clb.lotplay.cn'){//外网正式公众号
			return 'wx7eaf9a2e612db7b4';
		}else if(Common.domainUrl === 'http://clbtest.lotplay.cn'){//内网测试公众号
			return 'wxdbb5b2437bd5ed69';
		}
	},
	
	//获取或修改储存在本地的用户信息
	//agr0为函数时，则此函数的参数为用户信息
	//agr0为对象或者字符串，则将此数据储存
	userInfoL: function(agr0, isProgress){
		if(!Common.getUserId()){
			Common.toast('未登录');
			return false;
		}
		if(!agr0){return false};
		var x = Common.storageL(Common.userData) || {};
		if((typeof agr0) === 'function'){//请求用户数据
			var interval = (+new Date()) - x.timeStamp;
			//已经有用户数据，而且就是当前登录的用户，并且会缓存相应时间单位ms
			if((x.userNo == Common.getUserId()) && (interval < 600000)){
				agr0(x);
			}else{
				var _url = Common.domainUrl + '/ushop-api-merchant/api/user/profile/get/' + Common.getUserId();
				Common.ajax(_url, 'get', {}, function(data){
					if(!data.userNo){data = {}};
					data.timeStamp = +new Date();
					Common.storageL(Common.userData, data);
					agr0(data);
				}, isProgress);
			}
		}else if(agr0 instanceof Object){//设置用户数据
			for(var _key in agr0){
				x[_key] = agr0[_key];
			}
			Common.storageL(Common.userData, x);
		}
	},
	
	
	//获取或修改储存在本地的用户推广员数据信息
	//agr0为函数时，则此函数的参数为用户信息
	//agr0为对象或者字符串，则将此数据储存
	generalL: function(agr0, isProgress){
		if(!Common.getUserId()){
			Common.toast('未登录');
			return false;
		}
		if(!agr0){return false};
		var x = Common.storageL(Common.localGen) || {};
		if((typeof agr0) === 'function'){//请求用户数据
			var interval = (+new Date()) - x.timeStamp;
			//已经有用户数据，而且就是当前登录的用户，并且会缓存相应时间单位ms
			if((x.userNo == Common.getUserId()) && (interval < 600000)){
				agr0(x);
			}else{
				Common.userInfoL(function(data){
					if(data.promoter === 101){//审核通过
						var _url = '/ushop-api-merchant/api/user/promotion/promoter/get';
						Common.ajax(_url, 'post', {}, function(data){
							if(!(data.promoter && data.promoter.id)){data = {}};
							for(var _key in data.promoter){
								data[_key] = data.promoter[_key];
							}
							delete data.promoter;
							data.timeStamp = +new Date();
							Common.storageL(Common.localGen, data);
							agr0(data);
						}, isProgress);
					}else{
						agr0({});
					}
				}, isProgress);
			}
		}else if(agr0 instanceof Object){//设置用户数据
			for(var key in agr0){
				x[key] = agr0[key];
			}
			Common.storageL(Common.localGen, x);
		}
	},
	
	//将省份定位储存在本地
	localProL: function(obj){
		var o = Common.storageL(Common.localPro) || {};
		if(obj instanceof Object){
			$.extend(o, obj);
			Common.storageL(Common.localPro, o);
		}
		return o;
	},
	//将彩票数据储存在本地
	localLotL: function(obj){
		var o = Common.storageL(Common.localLot) || {};
		if(obj instanceof Object){
			$.extend(o, obj);
			Common.storageL(Common.localLot, o);
		}
		return o;
	},
	//根据传入的图片地址判断，以返回正确可使用的地址
	getImageUrl: function(imgUrl){
		if((imgUrl + '').indexOf('group1') >= 0){
			return (Common.imageUrl + imgUrl);
		}else{
			return imgUrl;
		}
	},
	
	//格式化请求地址，需要令牌的地方使用，用到了MD5加密；
	//url 不带有域名的请求地址比如:下面是订单支付的url
	//'/ushop-api-merchant/api/cart/payment/balancepay/orderNo'
	//callback 回调函数，参数为新的url，带有了域名参数
	formatUrl : function(url, callback, domain, isProgress){
		callback = callback || function(){};
		if(typeof domain === 'string'){
			domain = domain || Common.domainUrl;
		}else{
			domain = Common.domainUrl;
			isProgress = domain;
		}
		Common.getServiceTT(function(timestamp){
			var userid = Common.storageL(Common.userId),
				timestamp = timestamp,
				token = Common.storageL(Common.token),
				sign = hex_md5(url + '?userid=' + userid + '&token=' + token + '&timestamp=' + timestamp).toUpperCase();
			url = domain + url + '?userid=' + userid + '&timestamp=' + timestamp + '&sign=' + sign;
			callback.call(this, url);
		}, isProgress);
	},
	
	goLogin: function(){
		window.location.replace('../weixinmp/index.html');
	},
	
	//某些页面的某些规则需要阻止请求
	precludeFn: function(_url){
		_url = ((typeof _url) === 'string') ? _url : (_url.url + '');
		if(_url.indexOf('/ushop-api-merchant/api/mall/cart/settlement/check') >= 0){
			if(Common.phoneValid() === false){
				return false;
			}
		}
	},
	getServiceTT: function(callback, isProgress){
		callback = callback ? callback : function(){};
		if(Common.seaverTs && Common.localOs){//短时间内不会多次请求时间戳
			var ds = Date.now() - Common.localOs;
			if(ds > 0 && ds < 60000){//‘短时间’的时间ms
				callback(Common.seaverTs + ds);
				return false;
			}
		}
		//判断是否需要遮罩
		if(globalData.isProgress === false && isProgress === undefined){//禁止全局加载进度
			isProgress = false;
		}
		//开启单个加载进度
		if(isProgress !== false){Common.loadingShow();}
		$.ajax({
			url: Common.domainUrl + '/ushop-api-merchant/api/user/login/timestamp/',
			type: 'get',
			dataType: 'json',
			timeout: 20000,
			success: function(data){
				if(data && data.timestamp){
					Common.seaverTs = data.timestamp;
					Common.localOs = Date.now();
					callback(data.timestamp);
				}else{
					callback(0);
				}
				if(isProgress !== false){Common.loadingHide();};
			},
			error: function(){
				callback(0);
				if(isProgress !== false){Common.loadingHide();};
			}
		});
	},
	//单独的ajax请求（包括签字）
	ajax: function(_url, type, dataS, callback, isProgress){
		callback = callback || function(){};
		var param = {
			dataType: 'json',
			timeout: 20000,
			success: function(data){
				//页面初始请求完成
				if(isProgress !== false){Common.loadingHide()};
				var dataError = (data && data.error) ? (data.error + '') : '';
				if(dataError && dataError.indexOf('1008000') >= 0){
					//注销登录数据
					Common.rmStorageL(Common.userId);
					Common.rmStorageL(Common.token);
					//进入登录界面
					if(Common.isWeixin()){
						Common.openPage('../weixinmp/index.html?loginOverdue=yes');
					}else{
						if(Common.isTest()){
							Common.openPage('../login/login.html');
						}
					}
				};
				if(data.error_description) {
					if(data.error == 0){
						data.error_description = '系统错误';
					}
				}
				callback((data || {}));
			},
			error: function(data){
				//页面初始请求完成
				if(isProgress !== false){Common.loadingHide()};
				callback((data || {}));
			}
		};
		if(typeof arguments[0] === 'string'){
			param.url = _url;
			param.type = type;
			param.data = dataS;
			if(typeof dataS === 'string'){
				param.processData = false;
				param.headers = {'Content-Type' : 'application/json;charset=UTF-8'};
			}
		}else{
			callback = arguments[1] || function(){};
			$.extend(param, arguments[0]);
			isProgress = arguments[2];
		}
		//判断是否需要遮罩
		if(globalData.isProgress === false && isProgress === undefined){//禁止全局加载进度
			isProgress = false;
		}
		if(isProgress !== false){Common.loadingShow()};
		if(param.url.indexOf('/') === 0){//说明请求地址需要签名
			var ttFn = function(tturl, timestamp){
					var userid = Common.storageL(Common.userId),
						token = Common.storageL(Common.token),
						sign = hex_md5(tturl + '?userid=' + userid + '&token=' + token + '&timestamp=' + timestamp).toUpperCase();
					return (Common.domainUrl + tturl + '?userid=' + userid + '&timestamp=' + timestamp + '&sign=' + sign);
				},
				signFn = function(){
					if(Common.seaverTs && Common.localOs){//短时间内不会多次请求时间戳
						var ds = Date.now() - Common.localOs;
						if(ds > 0 && ds < 60000){//‘短时间’的时间ms
							param.url = ttFn(param.url, (Common.seaverTs + ds));
							$.ajax(param);
							return false;
						}
					}
					$.ajax({
						url: Common.domainUrl + '/ushop-api-merchant/api/user/login/timestamp/',
						type: 'get',
						dataType: 'json',
						timeout: 20000,
						success: function(data){
							if(data && data.timestamp){
								Common.seaverTs = data.timestamp;
								Common.localOs = Date.now();
								param.url = ttFn(param.url, data.timestamp);
								$.ajax(param);
							}else{
								param.error();
							}
						},
						error: function(){
							param.error();
						}
					});
				};
			signFn();
		}else{
			$.ajax(param);
		}
	},
	//多次并发请求
	//arr参数为[{},[],function(){}]形式
	//参数为对象或者数组时，为ajax参数
	//参数为函数时，会直接执行此函数，并必须包含一个回调，否则无法判断执行完成
	ajaxAll: function(arr, callback){
		callback = callback || function(){};
		var lgn = arr.length,
			rNum = 0,
			rArr = (function(){
				var a = lgn, b = [];
				while(a--){
					b[b.length] = null;
				};
				return b;
			})(),
			rfn = function(i, data){
				rNum++;
				rArr[i] = data;
				if(rNum === lgn){
					callback.apply(null, rArr);
					Common.loadingHide();
				};
			};
		if(lgn > 0){
			Common.loadingShow();
		}else{
			return false;
		}
		$.each(arr, function(i, o){
			if(o){
				if(o instanceof Array){
					Common.ajax.apply(null, o.concat(function(data){rfn(i, data), false}));
				}else if(o instanceof Function){//函数的参数是一个回调函数，而且只能是一个参数
					o(function(data){rfn(i, (data || {}))});
				}else if(o instanceof Object){
					Common.ajax(o, function(data){rfn(i, data)}, false);
				}else{
					rfn(i, {});
				}
			}else{
				rfn(i, {});
			}
		});
	},
	
	//手机号加密
    phoneEncryption: function(phone){
    	if(Common.regExpPhone.test(phone + '')){
    		phone = phone + '';
	    	return (phone.substr(0, 3) + '****' + phone.substr(-4))
    	}else{
    		return phone;
    	}
    },
    
	//列表加载HTML
	listLoadingHTML: function(str){
		str = str || '加载中……';
		var rotateStr = ('animation' in document.documentElement.style)?
						'<div class="loading-rotate-img"></div>':
						'<img src="../../image/loading.gif">';
		return  '<div class="isLoadingTrue">用来判断是否在加载中，默认隐藏</div>'+
				'<div class="xl-refresh-loading">'+
		    		rotateStr+
		    		'<span>' + str + '</span>'+
		    	'</div>';
	},
    //显示加载图标
    //返回对应的ID，提供给隐藏loadingHide使用，隐藏对应的加载图标
	loadingShow: function(str){
		str = str || '';
		Common.loadingHide();
		var loadingBg = $('<div class="loading-bg loading_bg_show"></div>'),
			loadingBox = $('<div class="loading_box_show loading-box"></div>'),
			rotateStr = ('animation' in document.documentElement.style)?
						'<div class="loading-rotate-img"></div>':
						'<img src="../../image/loading.gif">';
		loadingBox.html(rotateStr + '<div class="loading-box-text">' + str + '</div>');
		$('body').append(loadingBg).append(loadingBox);
	},
	
	//隐藏加载图标
	//隐藏对应的加载图标
	loadingHide: function(){
		$('.loading_bg_show').remove();
		$('.loading_box_show').remove();
	},
	
	//弹窗，可以设置从四个方向出现
	//dir有五个可选项，表示出现方向的'left','top','right','bottom'和表示隐藏的'hide'
	tmodal: function(dir, str, className, re) {
		dir = (dir || 'bottom') + '';
		str = (str || '没有任何数据') + '';
		className = (className || '') + '';
		var $box = $('.tmodal-box'),
			$con,
			s = document.body.style,
			tend = (
				'transition' in s ? 'transitionend' :
				'webkitTransition' in s ? 'webkitTransitionEnd' :
				'mozTransition' in s ? 'mozTransitionEnd' : ''
			);
		if(dir === 'hide') {
			if(tend){
				$box.removeClass('active').one(tend, function(){
					$(this).hide();
				});
			}else{
				$box.removeClass('active').hide();
			}
			return false;
		}else if(($box.length > 0) && (re !== true)){
			$box.show()
			.removeClass().addClass(('tmodal-box ' + className))//重置添加的类名
			.find('.tmodal-con')
			.removeClass().addClass(('tmodal-con ' + dir))//重置方向类名
			.find('.tmodal-html').html(str);
		}else{
			var str =
				'<div class="tmodal-box ' + className + '">'+
					'<div class="tmodal-bg" onclick="Common.tmodal(\'hide\')"></div>'+
					'<div class="tmodal-con ' + dir + '">'+
						'<div class="tmodal-bg" onclick="Common.tmodal(\'hide\')"></div>' +
						'<div class="tmodal-html">' + str + '</div>'+
					'</div>'+
				'</div>';
			$('body').append(str);
		}
		setTimeout(function() {
			$('.tmodal-box').addClass('active');
		}, 0);
	},
	
	//数组和对象遍历
	each: function (obj, callback) {
		if(!(obj && obj instanceof Object)){return obj;}
		var value, i = 0, length = obj.length;
		if(length === 0){return obj;}
		if (obj instanceof Array || obj[0]) {
			for (; i < length; i++) {
				value = callback.call(obj[i], i, obj[i]);
				if (value === false) {break;}
			}
		} else {
			for (i in obj) {
				value = callback.call(obj[i], i, obj[i]);
				if (value === false) {break;}
			}
		}
		return obj;
	},
	
	//打开新页面
	openPage: function(url, obj, fn){
		if(obj && (obj instanceof Object)){
			var a = [];
	    	$.each(obj, function(key, val){
	    		val = val || '';
	    		a[a.length] = (key + '=' + encodeURIComponent((val instanceof Object) ? JSON.stringify(val) : val))
	    	});
	    	if(url.indexOf('?') < 0){
	    		url = url + '?' + a.join('&');
	    	}else{
	    		url = url + '&' + a.join('&');
	    	}
		}
		//打开页面前，执行的函数，如果函数返回false则阻止跳转
		if(fn && (typeof fn) === 'function'){
			if(fn() === false){
				return false;
			}
		//微信账号的手机认证
		}else if(fn === 'phone_valid'){
			if(Common.phoneValid() === false){
				return false;
			};
		}
		window.location.href = url;
	},
	
	//微信账号的手机认证
	phoneValid: function(){
		//未绑定手机号，不是本地测试，不是微信
		if(Common.isWeixin() && !Common.isTest() && !Common.storageL(Common.bindPhone)){
			window.location.href = '../mine/phone_valid.html';
			return false;
		}
	},
	storageL: function(key, val){
		if(typeof(Storage) !== 'undefined'){
			if((val === undefined) || (val === null)){//不存储undefined和null
				if(arguments[2] === true){
					val = sessionStorage[key];
				}else{
					val = localStorage[key];
				}
				if(val && val.indexOf('obj-') === 0){
					val = val.slice(4);
					return JSON.parse(val);
				}else{
					return val;
				}
			}else{
				var a = val;
				if(val instanceof Object){
					val = 'obj-' + JSON.stringify(val);
				}else{
					val = val + '';
				}
				if(arguments[2] === true){
					sessionStorage[key] = val;
				}else{
					localStorage[key] = val;
				}
				return a;
			}
		}
	},
	rmStorageL: function(key){
		if(typeof(Storage) !== 'undefined' && key){
			if(arguments[1] === true){
				sessionStorage.removeItem(key);
			}else{
				localStorage.removeItem(key);
			}
		}
	},
	rmStorageLAll: function(){
		if(typeof(Storage) !== 'undefined'){
			if(arguments[0] === true){
				sessionStorage.clear();
			}else{
				localStorage.clear();
			}
		}
	},

	//jbox的自动消失的提示信息
	//content提示内容str
	//color背景颜色str    green, red
	//autoClose 自动关闭的时间num
	//position 定位
	toast: function(content){
		content = content || '没有内容';
		$('.modal-toast').remove();
		var toastEle = $('<div class="modal-toast"></div>'),
			$win = $(window);
		toastEle.html(content);
		$('body').append(toastEle);
		toastEle.css({
			'top': (($win.height() - toastEle.outerHeight())/2 - 30) + 'px',
			'left': (($win.width() - toastEle.outerWidth())/2) + 'px'
		});
		toastEle.animate({
			'top': (($win.height() - toastEle.outerHeight())/2) + 'px'
		}, 100);
		clearTimeout(this.toastTimeOut);
		this.toastTimeOut = setTimeout(function(){
			toastEle.remove();
		},3000);
	},
	msToTime: function(ms){
		if(!ms){return ''};
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
	},
	
	//滚动到底部监听
	scrollBottom: function (callback){
		callback = callback || function(){};
		var sStart = 'mousedown.start',
			sEnd = 'mouseup.end',
			sScroll = 'scroll.bottom',
			$win = $(window),
			$dom = $(document);
		if('ontouchstart' in document){
			sStart = 'touchstart.start';
			sEnd = 'touchend.end';
		}
		var x1, y1, x2, y2,
			sdh, swh, sws,
			mdh, mwh, mws,
			edh, ewh, ews;
		$win.off(sStart).on(sStart, function(e){
			sdh = $dom.height(), swh = $win.height(), sws = $win.scrollTop();
			if((sdh <= swh) || (sws + swh === sdh)){
				var tc = e;
				if('ontouchstart' in document){
					tc = e.originalEvent.targetTouches[0];
				}
				x1 = tc.clientX;
				y1 = tc.clientY;
			}
		}).off(sEnd).on(sEnd, function(e){
			edh = $dom.height(), ewh = $win.height(), ews = $win.scrollTop();
			if((sdh <= swh) || (sws + swh === sdh)){
				var tc = e;
				if('ontouchstart' in document){
					tc = e.originalEvent.changedTouches[0];
				}
				x2 = tc.clientX;
				y2 = tc.clientY;
				if((Math.abs(y2 - y1) > Math.abs(x2 - x1)) && (y2 < y1)){
					callback();
				}
			}
		}).off(sScroll).on(sScroll, function(e){
			mdh = $dom.height(), mwh = $win.height(), mws = $win.scrollTop();
			if((sws + swh < sdh) && (ews + ewh < edh) && (mws + mwh === mdh)){
				callback();
			}
		});
	},
	
	
	//jbox的确认的提示框
	//title 信息抬头str
	//content提示内容str
	//callback 回调函数，参数为0表示取消1表示确定
	//btns数组，确定和取消的按键名 ['确定', '取消']
	confirm: function(title, content, callback, btns){
		callback = callback || function(){};
		title = title || '提示信息';
		content = content || '没有内容';
		btns = btns || ['取消', '确定'];
		var wrapStr = '', btnStr  = '';
		if(typeof btns === 'string'){
			btnStr =    '<div class="modal-btn modal-btn-confirm modal-btn-only">' + btns + '</div>';
		}else if(btns.length === 1){
			btnStr =    '<div class="modal-btn modal-btn-confirm modal-btn-only">' + btns[0] + '</div>';
		}else{
			btnStr =    '<div class="modal-btn modal-btn-cancel">' + btns[0] + '</div>'+
						'<div class="modal-btn modal-btn-confirm">' + btns[1] + '</div>';
		}
		wrapStr =   '<div class="modal-wrapper">'+
						'<div class="modal-wrapper-bg"></div>'+
						'<div class="modal-container">'+
							'<div class="modal-header">' + title + '</div>'+
							'<div class="modal-content">' + content + '</div>'+
							'<div class="modal-fotter">'+
							btnStr+
							'</div>'+
						'</div>'+
					'</div>';
		$('.modal-wrapper').remove();
		$('body').append(wrapStr);
		var $box = $('.modal-wrapper'),
			$con = $box.find('.modal-container'),
			s = document.body.style,
			tend = (
				'transition' in s ? 'transitionend' :
				'webkitTransition' in s ? 'webkitTransitionEnd' :
				'mozTransition' in s ? 'mozTransitionEnd' : ''
			);
		//重置主体位置
		function conReset(){
			$con.css({
				'margin-top': '-' + ($con.height()/2) + 'px',
				'margin-left': '-' + ($con.width()/2) + 'px'
			});
		}
		conReset();
		$(window).on('resize.modalContainer', function(){
			conReset();
		});
		setTimeout(function(){
			$box.addClass('active');
		}, 0);
		//注销提示框
		function wraphide(){
			if(tend){
				$box.removeClass('active').one(tend, function(){
					$box.remove();
				});
			}else{
				$box.remove();
			}
		}
		$box.find('.modal-btn-cancel').on('click', function(){
			callback(0);
			wraphide();
		});
		$box.find('.modal-wrapper-bg').on('click', function(){
			wraphide();
		});
		$box.find('.modal-btn-confirm').on('click', function(){
			if(callback(1) != false){
				wraphide();
			}
		});
	},
	
	//空白元素界面
	//$ele 空白元素的父元素，可以是查询字符串，可以是dom对象，可以是jq对象
	//obj 空白元素的css，可以有txt属性为空白的文字说明，或按键
	blankPageFn: function($ele, obj, txt){
		var txtstr = (txt === undefined) ? '这里啥也没有' : txt,
			str;
		str =
			'<div class="blank-box blank_box">'+
				'<div class="blank-con">'+
					'<div><img src="../../image/img/xingxiangtu.png"/></div>'+
					txtstr+
				'</div>'+
			'</div>';
		if($ele){
			if((typeof($ele) === 'string') || ($ele.nodeType === 1)){
				$ele = $($ele);
			}else if(!($ele instanceof jQuery)){
				return false;
			}
		}else{
			return str;
		}
		var blank_box = $ele.children('.blank_box'),
			cssobj = {top: ($ele.offset().top + 'px')},
			status = '';
		if((typeof obj === 'string')){
			status = obj;//状态控制显示隐藏问题
		}else{
			$.extend(cssobj, (obj || {}));
		}
		if(status === 'hide'){
			blank_box.hide();
			return false;
		}
		if(blank_box.length > 0){
			blank_box.show();
		}else{
			$ele.append(str);
			blank_box = $ele.children('.blank_box');
		}
		var bw = blank_box.width(),
			bh = blank_box.height();
		if(bw > bh){
			blank_box.find('.blank-con').width(bh);
		}
		blank_box.css(cssobj);
	},
	//是否是在微信中
	isWeixin: function(){
		var ua = navigator.userAgent.toLowerCase();
		if(ua.match(/MicroMessenger/i) == "micromessenger") {
			return true;
		} else {
			return false;
		}
	},
	//是否是测试环境
	isTest: function(){
		var domainUrl = location.protocol + '//' + location.host;
		if(domainUrl.indexOf('8020') > 0){
			return true;
		}else{
			return false;
		}
	}
}

//域名地址判断，以便于以后不用发版本都去更改这个域名地址
;(function(){
	var domainUrl = location.protocol + '//' + location.host;
	Common.domainUrl = domainUrl;
	if(Common.isTest()){
//		Common.domainUrl = 'http://10.35.0.115';
//		Common.domainUrl = 'http://10.35.0.136:8080';
//		Common.domainUrl = 'http://10.35.0.66:8080';
//		Common.domainUrl = 'http://10.35.0.166:8090';
//		Common.domainUrl = 'http://10.35.0.134';
//		Common.domainUrl = 'http://10.13.0.57';
//		Common.domainUrl = 'http://clbtest.lotplay.cn';
		Common.domainUrl = 'http://10.13.0.170';
//		Common.domainUrl = 'http://pay.lotplay.cn';
//		Common.domainUrl = 'http://clb.lotplay.cn';
	}
})();
