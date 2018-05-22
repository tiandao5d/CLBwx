/**
 * 
 * UserAnalysis.js
 * 夺宝统计-商品统计
 * 作者：roland
 * 
 * */
$(function(){
//  var ua = window.navigator.userAgent;
//  var isChrome = ua.indexOf('Chrome')>-1?true:false;
//  if(isChrome){
//  	Common.jBoxNotice('当前页面请在ie浏览器或火狐浏览器打开','red');
//  }
	//菜单面包屑导航等配置显示
	Common.menuNavContent('夺宝统计', '用户分析','夺宝管理后台');
	var _url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT011';
	$('.xltab-box .nav-tabs a').click(function(e){
		var target =e.target;
		var id=$(target).attr('href');
		if(id == '#itemYhrc'){//参与人次
			_url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT011';
		}else if(id == '#itemYhsd'){//消费时段
			_url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT010';
		}else if(id == '#itemYhrj'){//人均ARPU
			_url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT003';
		}
		renderReport(_url);
	});
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	renderReport(_url)
});
function renderReport(_url){
	var _html = '<iframe src="'+_url+'" frameborder="0" width="100%" height="900px"></iframe>';
	$('#xlgridBox').html(_html)
}