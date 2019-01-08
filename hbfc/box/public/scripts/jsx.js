/**
 * 作用：全局使用的属性和方法
 * 日期：2017-04-05
 * 作者：xulin
 **/
//全局共用方法和属性
"use strict";
var jsx = {
	//本地储存数据命名方式（前缀）
	//localStorage 全局使用前缀ls_global_，局部使用前缀ls_partly_
	//sessionStorage 全局使用前缀ss_global_，局部使用前缀ss_partly_
	userId      : 'ls_global_user_id',//记录用户ID
	token       : 'ls_global_token',//记录用户token值
	userName    : 'ls_global_user_name',//记录用户登录时用的账号
	//获取用户ID，参数为返回一个带有str前缀ID字符串
	getUserId   : function(str){
		if(jsx.storageL(jsx.userId)){
			return (str || '') + jsx.storageL(jsx.userId);
		}else{
			return (str || '');
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
		jsx.loadingHide();
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

  ajax: function (_url, type, dataS, callback) {
		callback = callback || function(){};
		var param = {
			dataType: 'json',
			timeout: 20000,
			success: function(data){
				//页面初始请求完成
        jsx.loadingHide();
        if ( data.error ) {
          jsx.rmStorageL(jsx.userId);
          jsx.rmStorageL(jsx.token);
        }
				callback(data);
			},
			error: function(data){
				//页面初始请求完成
				jsx.loadingHide();
				callback();
				console.log('错误');
			}
		};
		if(typeof arguments[0] === 'string'){
			param.url = _url;
			param.type = type;
			param.data = dataS;
		}else{
			callback = arguments[1] || function(){};
			$.extend(param, arguments[0]);
		}
    jsx.loadingShow();
    $.ajax(param);
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

	// 提示工具
	toast: function ( txt, color ) {
		new jBox('Notice', {
	    content: (txt || '没有内容'),
	    color: (color || 'black'),
	    autoClose: 2000
	  });
	}
}
