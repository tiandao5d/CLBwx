/**
 * 作用：全局使用的属性和方法
 * 日期：2017-09-06
 * 作者：xulin
 **/
//全局共用方法和属性
var globalData = {};
var Common = {
	ready: function(callback){
		if('onreadystatechange' in document){
			document.onreadystatechange = function(){
				if(document.readyState === 'complete'){
					callback();
				}
			}
		}else{
			window.onload = function(){
				callback();
			}
		}
	},
	
	//数组和对象遍历
	each: function (obj, callback) {
		if(typeof obj != 'object'){return obj;}
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
	//解析URL
	deCodeUrlFn: function(dataStr){
		var str = location.search.substr(1);
		if(str){
			var a = {},
				b = str.split('&'),
				i = 0, s;
			while(s = b[i++]){
				s = (s + '').split('=');
				a[s[0]] = decodeURIComponent(s[1]);
			}
			if(!dataStr){globalData.pageParam = a;}
			return a;
		}
		return {};
	}
};
(function(){
	var urlObj = Common.deCodeUrlFn();
	Common.domainUrl = urlObj.domainUrl || 'http://clb.lotplay.cn';
})();
