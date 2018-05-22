/**
 * 
 * MerchantStatistics.js
 * 夺宝统计-商家统计
 * 作者：xulin
 * 
 * */
var globalData = {};
$(function(){
//  var ua = window.navigator.userAgent;
//  var isChrome = ua.indexOf('Chrome')>-1?true:false;
//  if(isChrome){
//  	Common.jBoxNotice('当前页面请在ie浏览器或火狐浏览器打开','red');
//  }
	//菜单面包屑导航等配置显示
	Common.menuNavContent('夺宝统计', '商家统计','夺宝管理后台');
	globalDataFn(function(data){
		var optionStr = '';
		$.each(globalData.listMerchantInfo, function(index, obj){
			if(index == 0){
				optionStr += '<option value="0">全部商家</option>';
			}
			optionStr += '<option value="' + obj.merchantNo + '">' + obj.merchantName + '</option>';
		});
		$('.merchantNo').html(optionStr);
		//查询按键
		$('.itemSearch').on('click', function(e){
			onSearch.call(this, e);
		});
	});
	var _url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT001';
	renderReport(_url);
});



//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/getConstants';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.merchantTypeList = data.merchantTypeList;
			globalData.MerchantStatusList = data.MerchantStatusList;
			var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/list';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.listMerchantInfo = data.recordList;
			callback.call(this, data);
		}else{
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
		}else{
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
}
function onSearch(){
	var me = $(this),
		box = $('#xlgridBox'),
		searchType = box.find('.searchType').val(),
		merchantNo = $.trim(box.find('.merchantNo').val()),
		searchKey = box.find('.searchKey').val(),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
//	if(!merchantNo){
//		Common.jBoxNotice('请选择商家','red');
//		return false;
//	}
	var _url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT001&MerNo=' +merchantNo;
	console.log(_url)
	renderReport(_url)
}
function renderReport(_url){
	var _html = '<iframe src="'+_url+'" frameborder="0" width="100%" height="900px"></iframe>';
	$('#iframe').html(_html)
}