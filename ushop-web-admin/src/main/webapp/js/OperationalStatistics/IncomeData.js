/**
 * 
 * IncomeData.js
 * 运营统计-通用-收入数据
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
	Common.menuNavContent('运营统计', '通用-收入数据','夺宝管理后台');
	var _url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT101';
	$('.xltab-box .nav-tabs a').click(function(e){
		var target =e.target;
		var id=$(target).attr('href');
		if(id == '#currencyOutputUsed'){//货币产出消耗
			_url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT101';
		}else if(id == '#currencyOutputDetail'){//货币产出明细
			_url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT102';
		}else if(id == '#currencyUsedDetail'){//货币消耗明细
			_url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT103';
		}else if(id == '#payRange'){//付费等级
			_url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT104';
		}else if(id == '#areaIncomeRate'){//地区收入比
			_url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT105';
		}else if(id == '#channelIncomeRate'){//渠道收入比
			_url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT106';
		}else if(id == '#ageIncomeRate'){//年龄收入比
			_url = Common.STATICS_NAME + '/Pages/ReportViewer.aspx?%2fSSRS_CLB%2fRPT107';
		}
		renderReport(_url);
	});
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	renderReport(_url)
});
//嵌入徐超统计页面
function renderReport(_url){
	var _html = '<iframe src="'+_url+'" frameborder="0" width="100%" height="900px"></iframe>';
	$('#xlgridBox').html(_html)
}