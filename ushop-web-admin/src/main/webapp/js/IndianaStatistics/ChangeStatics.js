$(function(){
//  var ua = window.navigator.userAgent;
//  var isChrome = ua.indexOf('Chrome')>-1?true:false;
//  if(isChrome){
//  	Common.jBoxNotice('当前页面请在ie浏览器或火狐浏览器打开','red');
//  }
	//菜单面包屑导航等配置显示
	Common.menuNavContent('夺宝统计', '换货统计','夺宝管理后台');
	var _url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT012';
	var _html = '<iframe src="'+_url+'" frameborder="0" width="100%" height="900px"></iframe>';
	$('#xlgridBox').html(_html)
});