/**
 * 作用：全局使用的属性和方法
 * 日期：2017-04-05
 * 作者：xulin
 **/
//全局共用方法和属性
var Common = {
//	domainUrl     : 'http://10.35.0.115',
//	domainUrl     : 'http://183.62.200.201:6080',
//	domainUrl     : 'http://10.35.0.66:8080',
//	domainUrl     : 'http://10.35.0.134',
	
//	domainUrl     : 'http://10.13.0.170',
//	imageUrl      : 'http://10.13.0.122:28888/',

	domainUrl     : 'http://pay.lotplay.cn',
	imageUrl      : 'http://10.13.0.122:28888/',
	
//	domainUrl     : 'http://clb.lotplay.cn',
//	imageUrl      : 'http://clb.lotplay.cn:8080/',
	
	regExpPhone : /^1(3|4|5|7|8)\d{9}$/,//手机正则表达式
	regExpPwd   : /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,15}$/,//密码正则表达式，6-15位字母数字混合
	regExpName  : /^([A-Za-z]|[\u4E00-\u9FA5]){2,20}$/,//人名正则表达式，只能是字母或者汉字
	regExpIDNO  : /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,//身份证正则表达式，二代身份证
	regExpUser  : /^[A-Za-z]{3}1(3|4|5|7|8)\d{9}$/,//用户名正则表达式，手机号前面配三个字母
	regExpBank  : /^(\d{16}|\d{19})$/,//银行卡正则表达式，只验证位数
	regExpCode  : /^\d{6}$/,//手机验证码，只验证六位数字
	userId      : 'userId',//记录用户ID
	token       : 'token',//记录用户token值
	isLoginFor  : 'isLoginForTrue',//记录用户登录情况
	userName    : 'userName',//记录用户登录时用的账号
	getUserId   : function(str){
		str = str || '';
		return str + Common.storageL(Common.userId);
	},
	getCurUrl: function(){
		return document.URL;
	},
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
		isProgress = isProgress === true ? true : false;
		Common.getSeaverTimeStamp(function(timestamp){
			if(timestamp == 'error'){
				callback.call(this, 'error');
				return false;
			}
			//此处应该加上判断是否登录
			//888100000003201
			//888100000000140
			var userid = Common.storageL(Common.userId),
				timestamp = timestamp,
				token = Common.storageL(Common.token),
				sign = hex_md5(url + '?userid=' + userid + '&token=' + token + '&timestamp=' + timestamp).toUpperCase();
			url = domain + url + '?userid=' + userid + '&timestamp=' + timestamp + '&sign=' + sign;
			callback.call(this, url);
		}, isProgress);
	},
	//获取服务器时间戳
	//callback 获取完成后回调参数为时间戳
	getSeaverTimeStamp : function(callback, isProgress){
		callback = callback ? callback : function(){};
		//判断是否需要遮罩
		if(globalData.isProgress != false && isProgress === undefined){//禁止全局加载进度
			isProgress = true;
		}
		if(isProgress === true){//开启单个加载进度
			Common.loadingShow();
		}
		$.ajax({
			url: Common.domainUrl + '/ushop-api-merchant/api/user/login/timestamp/',
			type: 'get',
			dataType: 'json',
			timeout: 20000,
			success: function(data){
				if(data && data.timestamp){
					callback.call(this, data.timestamp);
				}else{
					callback.call(this, 'error');
				}
			},
			error: function(){
				callback.call(this, 'error');
			}
		});
	},
	ajax: function(_url, type, dataS, callback, isProgress){
		callback = callback || function(){};
		var param = {
			dataType: 'json',
			timeout: 20000,
			success: function(data){
//				if(_url.indexOf('/ushop-api-merchant/api/payment/weixinpay/pay/') >= 0){
//					console.log(param.url, data);
//				}
				globalData.refreshComplete++;
				if(typeof refreshAfterFn === 'function'){
					refreshAfterFn();//如果页面有此函数将执行
				}
				if(globalData.refreshComplete >= globalData.requestNum){
					if(isProgress === true){Common.loadingHide();}
				}
				var dataError = (data && data.error) ? (data.error + '') : '';
				if(dataError && dataError.indexOf('1008000') >= 0){
					//注销登录数据
					Common.rmStorageL(Common.isLoginFor);
					Common.rmStorageL(Common.userId);
					Common.rmStorageL(Common.token);
					//进入登录界面
//					location.href = '../login/login.html';
//					location.href = '../weixinmp/home.html?errorMsg=unauthorized';
					return false;
				};
				if(data.error_description) {
					if(data.error == 0){
						data.error_description = '系统错误';
					}
					Common.toast(data.error_description);
				}
				data = data || {};
				callback.call(this, data);
			},
			error: function(){
				var data = arguments || {};
				globalData.refreshComplete++;
				if(typeof refreshAfterFn === 'function'){
					refreshAfterFn();//如果页面有此函数将执行
				}
				if(globalData.refreshComplete >= globalData.requestNum){
					if(isProgress === true){Common.loadingHide();}
				}
				Common.toast('错误的请求');
				callback.call(this, data);
			}
		}
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
		if(globalData.isProgress != false && isProgress === undefined){//禁止全局加载进度
			isProgress = true;
		}
		if(isProgress === true){//开启单个加载进度
			Common.loadingShow();
		}
		globalData.requestNum++;
		if(_url.indexOf('/') === 0){//说明请求地址需要签名
			Common.formatUrl(_url, function(newUrl){//请求地址签名
				if(newUrl === 'error'){
					globalData.refreshComplete++;
					if(isProgress === true){Common.loadingHide();}
					if(typeof refreshAfterFn === 'function'){
						refreshAfterFn();//如果页面有此函数将执行
					}
					Common.toast('服务器时间错误！');
					callback.call(this, {});
				}else{
					param.url = newUrl;
					$.ajax(param);
				}
			});
		}else{
			$.ajax(param);
		}
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
		return  '<div class="isLoadingTrue">用来判断是否在加载中，默认隐藏</div>'+
				'<div class="xl-refresh-loading">'+
		    		'<img src="../../image/loading.gif"/>'+
		    		'<span>' + str + '</span>'+
		    	'</div>';
	},
    //显示加载图标
    //返回对应的ID，提供给隐藏loadingHide使用，隐藏对应的加载图标
	loadingShow: function(str){
		str = str || '';
		Common.loadingHide();
		var loadingBg = $('<div class="loading-bg loadingBgShow"></div>'),
			loadingBox = $('<div class="loadingBoxShow loading-box"></div>');
		loadingBox.html('<img src="../../image/loading.gif"><div class="loading-box-text">' + str + '</div>');
		$('body').append(loadingBg);
		$('body').append(loadingBox);
	},
	
	//隐藏加载图标
	//隐藏对应的加载图标
	loadingHide: function(){
		$('.loadingBgShow').remove();
		$('.loadingBoxShow').remove();
	},
	
	//打开新页面
	openPage: function(url, obj){
		if(obj && typeof obj === 'object'){
			url = url + '?' + $.param(obj);
		}
		window.location.href = url;
	},
	storageL: function(key, val){
		if(typeof(Storage) !== 'undefined'){
			if(val === undefined){
				val = localStorage[key];
				if(val && val.indexOf('obj-') === 0){
					val = val.slice(4);
					return JSON.parse(val);
				}else{
					return val;
				}
			}else{
				if(typeof val === 'object'){
					val = 'obj-' + JSON.stringify(val);
				}else{
					val = val + '';
				}
			    localStorage[key] = val;
			}
		}
	},
	rmStorageL: function(key){
		if(typeof(Storage) !== 'undefined' && key){
			localStorage.removeItem(key);
		}
	},
	rmStorageLAll: function(){
		if(typeof(Storage) !== 'undefined'){
			localStorage.clear();
		}
	},

	//jbox的自动消失的提示信息
	//content提示内容str
	//color背景颜色str    green, red
	//autoClose 自动关闭的时间num
	//position 定位
	toast : function(content){
		content = content || '没有内容';
		$('.modal-toast').remove();
		var toastEle = $('<div class="modal-toast"></div>');
		toastEle.html('<span>' + content + '</span>');
		$('body').append(toastEle);
		toastEle.css({
			'margin-top': (-(toastEle.height()/2 - 30)) + 'px',
			'margin-left': (-toastEle.width()/2) + 'px'
		});
		toastEle.animate({
			'margin-top': (-toastEle.height()/2) + 'px'
		}, 100);
		clearTimeout(this.toastTimeOut);
		this.toastTimeOut = setTimeout(function(){
			toastEle.remove();
		},3000);
	},
	
	//滚动到底部监听
	scrollBottom: function (callback){
		callback = callback || function(){};
		$(window).off('scroll.scrollBottom');
		$(window).on('scroll.scrollBottom', function(){
			if(globalData.delayScroll === true){
				if($(window).scrollTop() + $(window).height() === $(document).height()){
					globalData.delayScroll = false;
					setTimeout(function(){
						globalData.delayScroll = true;
					}, 1000);
					callback();
				}
			}
		});
	},
	
	
	//jbox的确认的提示框
	//title 信息抬头str
	//content提示内容str
	//callback 回调函数，参数为1表示取消2表示确定
	//btns数组，确定和取消的按键名 ['确定', '取消']
	confirm: function(title, content, callback, btns){
		callback = callback || function(){};
		title = title || '提示信息';
		content = content || '没有内容';
		btns = btns || ['取消', '确定'];
		var wrapStr = '', btnStr  = '',
			bgStr   = '<div class="modal-bg"></div>';
		if(typeof btns === 'string'){
			btnStr =    '<div class="modal-btn modal-btn-confirm modal-btn-only">' + btns + '</div>';
		}else if(btns.length === 1){
			btnStr =    '<div class="modal-btn modal-btn-confirm modal-btn-only">' + btns[0] + '</div>';
		}else{
			btnStr =    '<div class="modal-btn modal-btn-cancel">' + btns[0] + '</div>'+
						'<div class="modal-btn modal-btn-confirm">' + btns[1] + '</div>';
		}
		wrapStr =   '<div class="modal-wrapper">'+
						'<div class="modal-container">'+
							'<div class="modal-header">' + title + '</div>'+
							'<div class="modal-content">' + content + '</div>'+
							'<div class="modal-fotter">'+
							btnStr+
							'</div>'+
						'</div>'+
					'</div>'+
					bgStr;
		$('.modal-bg, .modal-wrapper').remove();
		$('body').append(wrapStr);
		var wrapper = $('.modal-wrapper');
		wrapper.css({
			'margin-top': (-wrapper.height()/2) + 'px',
			'margin-left': (-wrapper.width()/2) + 'px'
		});
		$(window).on('resize', function(){
			wrapper.css({
				'margin-top': (-wrapper.height()/2) + 'px',
				'margin-left': (-wrapper.width()/2) + 'px'
			});
		});
		$('.modal-btn-cancel').on('click', function(){
			$('.modal-bg, .modal-wrapper').remove();
			callback(0);
		});
		$('.modal-btn-confirm').on('click', function(){
			if(callback(1) != false){
				$('.modal-bg, .modal-wrapper').remove();
			}
		});
	}
}
