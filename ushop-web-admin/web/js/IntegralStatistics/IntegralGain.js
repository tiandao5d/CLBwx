/**
 * 
 * IntegralGain.js
 * 积分管理-积分获取
 * 作者：xulin
 * 
 * */


jQuery(function($) {
	
	//左侧菜单显示
	Common.menuNavContent('积分管理', '积分获取','积分管理后台');
	
	//只能选择到月份
//	$(".form_datetime.mm").datetimepicker({
//		format:'yyyy-mm',
//		autoclose:true,
//		language: 'zh-CN',
//		startView: 3,
//		maxView: 4,
//		minView:3
//	});	
	jeDate({
		dateCell:"#itemjfgs .start",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#itemjfgs .end",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#itemjfqg .start",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#itemjfqg .end",
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
			classVal = box.find('.classValSele').val(),
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
			if(id == 'itemjfqg'){
				IntegralGrid('#itemjfqgTable', '#itemjfqgPager', startDate, endDate, classVal, true);
			}else if(id == 'itemjfgs'){
				IntegralGrid('#itemjfgsTable', '#itemjfgsPager', startDate, endDate, classVal, true);
			}
//				box.find('.classValSele [value='+classVal+']').attr('checked');
//				console.log(classVal);
	});
	var currentDate = new Date();
	var endm =currentDate.getMonth() +1;
	var endy = currentDate.getFullYear();
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
	if(endm<10){
		end += endy + '-0' + endm;
	}else{
		end += endy + '-' + endm;		
	}
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	IntegralGrid('#itemjfqgTable', '#itemjfqgPager', start, end, '1001', false);
	IntegralGrid('#itemjfgsTable', '#itemjfgsPager', start, end, '1001', false);
	
});



//积分数据呈现
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//type        查询类型1表示销量， 2表示销售额，string类型
//reload      是否是刷新列表，默认为false，布尔值
//http://10.35.0.134/ushop-web-admin/admin/points/listPointsGroupByMonthlyFundType_ByMonthlyFundType/2016-06-01/2016-10-31/1001
function IntegralGrid(tableId, pagerId, startDate, endDate, fundType, reload){
	var dataCon = [], typeStr = '', url, formatData, colModel, optionData, optionStr = '';
	reload = reload ? reload : false;
	
	typeStr = 'listPointsGroupByMonthlyFundType_ByMonthlyFundType';
	url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/points/' + typeStr + '?begin=' + startDate + '&end=' + endDate + '&fundType=' + fundType;
	Common.dataAjax(url, function(data){
		dataCon = data.list;
		if(!dataCon || dataCon.length <= 0){
			$(tableId).clearGridData();
			Common.jBoxNotice('没有查询到相关数据！','red');
//			return false;
		}
		formatData = data.list[0];
		optionData = data.fundTypeList;

		$.each(optionData, function(index, obj) {
			if(fundType == obj.id){
				optionStr += '<option value="' + obj.id + '" selected>' + obj.val + '</option>';
			}else{ 
				optionStr += '<option value="' + obj.id + '">' + obj.val + '</option>';
			}
			$(tableId).parents('.tabPane').find('.classValSele').html(optionStr);
		});
		
		colModel = [
//			{label: '序号',name:'rownumbers',index:'rownumbers',width:60},
			{label: '积分归属',name:'val',index:'val',width:120}
		];
		for(i in formatData){
			if(i.substr(0,1) == 'k'){
				colModel.push({
					label: i.substr(1, 4) + '-' + i.substr(5, 2),
					name: i,
					index: i,
					formatter: function(val){
						return val + '分';
					}
				})
			}
		}
		if(reload == true){
			$.jgrid.gridUnload(tableId);
		}
		Common.goodsStatistical(tableId, pagerId, dataCon, colModel,'积分获取');
	});
}

//导出excel表格
function toExcel(n){
	var param = {
		type:'excel',
		escape:'false'
	}
	var id  = 'itemjfqgTable';
	switch(n){
		case 1:param.fileName = '全国积分';param.aId = 'exportExcel1';id='itemjfqgTable';break;
		case 2:param.fileName = '各省积分';param.aId = 'exportExcel2';id='itemjfgsTable';break;
	}
	$('#gview_'+id).tableExport(param);
}