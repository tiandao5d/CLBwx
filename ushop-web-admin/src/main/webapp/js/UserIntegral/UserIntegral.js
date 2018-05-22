/**
 * 
 * UserIntegral.js
 * 用户积分
 * 作者：xulin
 * 
 * */

var globalData = {};
 globalData.integralHide = $('.integralHide');
jQuery(function($) {
	
	//左侧菜单显示
	Common.menuNavContent('积分管理', '用户积分', '积分管理后台')
	//日期选择器绑定
//	$(".form_datetime.dd").datetimepicker({
//		format:'yyyy-mm-dd',
//		autoclose:true,
//		language: 'zh-CN',
//		startView: 2,
//		maxView: 4,
//		minView:2
//	});
	jeDate({
		dateCell:"#xlgridBox .start",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#xlgridBox .end",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	//绑定只读的日期选择输入框一个双击清空的事件
	$(".form_datetime[readonly]").dblclick(function(){
		$(this).val('').blur();
	});
	
	//查询按键
	$('.itemSearch').on('click', function(){
		var me = $(this),
			box = me.parents('.tabPane'),
			id = box.attr('id'),
			startDate = box.find('.form_datetime.start').val(),
			endDate = box.find('.form_datetime.end').val(),
			userNo = box.find('.userIdSele').val(),
			table = box.find('.itemGridTable'),
			pager = box.find('.itemGridPager');
		if(startDate && endDate){
			if(new Date(endDate).getTime() <= new Date(startDate).getTime()){
				Common.jBoxNotice('结束时间要大于起始时间', 'red');
				return false;
			}
		}else if(startDate == endDate){
			startDate = start;
			endDate = end;
		}else{
			Common.jBoxNotice('结束时间要大于起始时间', 'red');
			return false;
		}
		userIntegral('#itemjfyhjfTable', '#itemjfyhjfPager', startDate, endDate, userNo, true);
	});
	var currentDate = new Date();
	var endm =currentDate.getMonth() +1;
	var endy = currentDate.getFullYear();
	var endd = currentDate.getDate();
	var startm = endm -6;
	var starty =endy;
	var start = '';
	var end= '';
	if(startm<1){
		startm += 12;
		starty = endy - 1;
	}
	if(startm<10){
		start += starty + '-0' + startm;
	}else{
		start += starty + '-' + startm;		
	}
	start += '-01';
	globalData.start = start;
	if(endm<10){
		end += endy + '-0' + endm;
	}else{
		end += endy + '-' + endm;		
	}
	if(endd<10){
		end += '-0' + endd;
	}else{
		end += '-' + endd;		
	}
	globalData.end = end;
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	$('.xltab-box a[data-toggle="tab"]').on('click',function(e){
		var href = e.target.href;
		var tabChoose = href.split('#')[1];
		if(tabChoose == 'itemjfyhjf'){
			$.each(globalData.integralHide,function(index,obj){
				$(obj).addClass('hide');
			});
		}
	});
	userIntegral('#itemjfyhjfTable', '#itemjfyhjfPager', start, end, '', false);
	
});


//用户积分数据呈现
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//merchantId      是否是刷新列表，默认为false，布尔值
//reload      是否是刷新列表，默认为false，布尔值
//http://10.35.0.134/ushop-web-admin/admin/points/listByMonthlyUserNo/2016-01-01/2016-10-30/0
function userIntegral(tableId, pagerId, startDate, endDate, merchantId, reload){
	var dataCon, typeStr = '', optionStr = '', optionData = [],
		url = '', formatData, colModel = [];
	reload = reload ? reload : false;
	typeStr = 'listByMonthlyUserNo';
	url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/points/' + typeStr + '?begin=' + startDate + '&end=' + endDate + '&userNo=' + merchantId;
	Common.dataAjax(url, function(data){
		dataCon = data.list;
		colModel = [
			{label: '用户ID',name:'userNo',index:'userNo',width:120},
			{label: '积分',name:'amount',index:'amount',width:120},
			{label: '日期',name:'date',index:'date',width:120},
			{label: '资金动向',name:'fundDirection',index:'fundDirection',width:120},
			{label: '积分类型',name:'fundType',index:'fundType',width:120},
			{label: '积分用途',name:'fundUsage',index:'fundUsage',width:120},
			{label: '操作',name:'',index:'',width:120, 
				formatter: function(val, options, rowObj){
					return '<button onclick="integralDetail(\'' + rowObj.userNo + '\',\'' + rowObj.date + '\',\'' + rowObj.fundTypeId + '\')" class="btn btn-xs btn-primary">积分明细</button>';
				}
			}
		];
		if(reload == true){
			$(tableId).setGridParam({ data: dataCon }).trigger("reloadGrid");
		}else{
			Common.goodsStatistical(tableId, pagerId, dataCon, colModel);
		}
	});
}

//查看明细按钮点击事件
function integralDetail(userNo, dateStr, fundTypeId){
	$('.xltab-box a[data-toggle="tab"]').eq(1).tab('show');
	
	$.each(globalData.integralHide,function(index,obj){
		$(obj).removeClass('hide');
	});
	
	integralUse('#itemjfhdmxTableN', '#itemjfhdmxPagerN', userNo, globalData.start, globalData.end, fundTypeId, '用户全国积分获得');
	integralUse('#itemjfhdmxTableP', '#itemjfhdmxPagerP', userNo, globalData.start, globalData.end, fundTypeId, '用户各省积分获得');
	integralGain('#itemjfsymxTableN', '#itemjfsymxPagerN', userNo, globalData.start, globalData.end, fundTypeId, '用户全国积分使用');
	integralGain('#itemjfsymxTableP', '#itemjfsymxPagerP', userNo, globalData.start, globalData.end, fundTypeId, '用户各省积分使用');
}



//积分使用明细数据呈现
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//belong      归属地  归属地ID字符串  字符串类型
//reload      是否是刷新列表，默认为false，布尔值
//http://10.35.0.134/ushop-web-admin/admin/points/listByGroupByMonthly_fundUsage_byMonthlyUserNoFundTypeFundDirection/obtain/888100000000078/2016-01-01/2016-10-30/1001
function integralUse(tableId, pagerId, merchantId, startDate, endDate, fundType, np, reload){
	var dataCon = [], typeStr = '', url, formatData, colModel;
	reload = reload ? reload : false;
	typeStr = 'listByGroupByMonthly_fundUsage_byMonthlyUserNoFundTypeFundDirection';
	url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/points/' + typeStr + '/obtain?userNo=' +merchantId + '&begin=' +startDate + '&end=' +endDate + '&fundType=' + fundType;
	Common.dataAjax(url, function(data){
		dataCon = data.list;
		colModel = [
			{label: '日期',name:'date',index:'date',width:120},
			{label: '注册',name:'register',index:'register',width:120, formatter:function(val){return val + '个'}},
			{label: '个人资料',name:'profile',index:'profile',width:120, formatter:function(val){return val + '个'}},
			{label: '彩购消费',name:'shopping',index:'shopping',width:120, formatter:function(val){return val + '个'}},
			{label: '游戏消费',name:'game',index:'game',width:120, formatter:function(val){return val + '个'}},
//			{label: '游戏时长',name:'numData',index:'numData',width:120, formatter:function(val){return val + '个'}},
			{label: '中奖晒单',name:'share',index:'share',width:120, formatter:function(val){return val + '个'}},
			{label: '社交分享',name:'promotion',index:'promotion',width:120, formatter:function(val){return val + '个'}},
			{label: '合计',name:'',index:'',width:120,
				formatter: function(val, obj, re){
					return parseInt(re.register) + 
						   parseInt(re.profile) + 
						   parseInt(re.shopping) + 
						   parseInt(re.game) + 
						   parseInt(re.share) +
						   parseInt(re.promotion)
				}
			}
		];
		if(reload == true){
			$(tableId).setGridParam({ data: dataCon }).trigger("reloadGrid");
		}else{
			Common.goodsStatistical(tableId, pagerId, dataCon, colModel, np);
		}
		
	});
	
}
//积分获取明细数据呈现
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//reload      是否是刷新列表，默认为false，布尔值
//http://10.35.0.134/ushop-web-admin/admin/points/listByGroupByMonthly_fundUsage_byMonthlyUserNoFundTypeFundDirection/use/888100000000078/2016-01-01/2016-10-30/1001
function integralGain(tableId, pagerId, merchantId, startDate, endDate, fundType, np, reload){
	var dataCon = [], typeStr = '', url, formatData, colModel;
	reload = reload ? reload : false;
	typeStr = 'listByGroupByMonthly_fundUsage_byMonthlyUserNoFundTypeFundDirection';
	url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/points/' + typeStr + '/obtain?userNo=' +merchantId + '&begin=' +startDate + '&end=' +endDate + '&fundType=' + fundType;
	Common.dataAjax(url, function(data){
		dataCon = data.list;
		colModel = [
			{label: '日期',name:'date',index:'date',width:120},
			{label: '彩购',name:'shopping',index:'shopping',width:120},
			{label: '游戏',name:'game',index:'game',width:120},
			{label: '活动',name:'activity',index:'activity',width:120},
			{label: '合计',name:'',index:'',width:120,
				formatter: function(val, obj, re){
					return parseInt(re.register) + 
						   parseInt(re.shopping) + 
						   parseInt(re.activity)
				}
			}
		];
		if(reload == true){
			$(tableId).setGridParam({ data: dataCon }).trigger("reloadGrid");
		}else{
			Common.goodsStatistical(tableId, pagerId, dataCon, colModel, np);
		}
	});
}
function goBack(){
	$('.nav.nav-tabs').find('[href=#itemjfyhjf]').trigger('click');
}
//导出excel表格
function toExcel(n){
	var param = {
		type:'excel',
		escape:'false'
	}
	var id  = 'itemjfyhjfTable';
	switch(n){
		case 1:param.fileName = '用户积分';param.aId = 'exportExcel1';id='itemjfyhjfTable';break;
		case 2:param.fileName = '用户全国积分获得';param.aId = 'exportExcel2';id='itemjfhdmxTableN';break;
		case 3:param.fileName = '用户各省积分获得';param.aId = 'exportExcel3';id='itemjfhdmxTableP';break;
		case 4:param.fileName = '用户全国积分使用';param.aId = 'exportExcel4';id='itemjfsymxTableN';break;
		case 5:param.fileName = '用户各省积分使用';param.aId = 'exportExcel5';id='itemjfsymxTableP';break;
	}
	$('#gview_'+id).tableExport(param);
}