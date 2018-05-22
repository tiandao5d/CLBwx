/**
 * 
 * OutputSales.js
 * 积分管理-产销比
 * 作者：xulin
 * 
 * */


jQuery(function($) {
	//左侧菜单显示
	Common.menuNavContent('积分管理', '产销比','积分管理后台')
//	 var ua = window.navigator.userAgent;
//  var isChrome = ua.indexOf('Chrome')>-1?true:false;
//  if(isChrome){
//  	Common.jBoxNotice('当前页面请在ie浏览器或火狐浏览器打开','red');
//  }
    var _url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT009';
    var _html = '<iframe src="'+_url+'" frameborder="0" width="100%" height="900px"></iframe>';
	$('#xlgridBox').html(_html)
})