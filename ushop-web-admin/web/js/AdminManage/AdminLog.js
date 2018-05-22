/**
 * 
 * AdminList.js
 * 管理员管理-管理员列表
 * 作者：xulin
 * 
 * */
//全局数据
var globalData = {};
jQuery(function($) {
	
	//左侧菜单显示
	Common.menuNavContent('管理员管理', '操作日志','系统管理后台');
	
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
		start += starty + '-0' + startm + '-01';
	}else{
		start += starty + '-' + startm + '-01';		
	}
	if(endm<10){
		endm = '-0' + endm;
	}else{
		endm = '-' + endm;		
	}
	if(endd<10){
		end = endy + endm + '-0' + endd;
	}else{
		end = endy + endm + '-' + endd;		
	}
	var postData = {
		startDate: start,
		endDate: end
	}
	
	//全局变量赋值，页面数据初始化
	globalDataFn(function(data){
		//查询按键
		$('.itemSearch').on('click', function(e){
			onSearch.call(this, e);
		});
		//日期选择器绑定
//		$(".form_datetime.dd").datetimepicker({
//			format:'yyyy-mm-dd',
//			autoclose:true,
//			language: 'zh-CN',
//			startView: 2,
//			maxView: 4,
//			minView:2
//		});
		jeDate({
		dateCell:"#xlgridBox .startDate",
			format:"YYYY-MM-DD",
			isTime:false //isClear:false,
		});
		jeDate({
			dateCell:"#xlgridBox .endDate",
			format:"YYYY-MM-DD",
			isTime:false //isClear:false,
		});	
		//绑定只读的日期选择输入框一个双击清空的事件
		$(".form_datetime[readonly]").dblclick(function(){
			$(this).val('').blur();
		});
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			$(window).trigger('resize.jqGrid');
		});
		adminLogListFn('#itemsTable1', '#itemsPager1',postData);
	});
});


//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/getConstants';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.adminLogTypeList = data.adminLogTypeList;
			globalData.adminLogStatusList = data.adminLogStatusList;
			globalData.adminTypeList = data.adminTypeList;
			callback.call(this, data);
		}else{
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
}

//查询函数
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		startDate = box.find('.startDate').val(),
		endDate = box.find('.endDate').val(),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		startDate: startDate,
		endDate: endDate
	}
	adminLogListFn('#itemsTable1', '#itemsPager1', postData);
}

//管理员列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    额外参数
//http://10.35.0.66:8080/ushop-web-admin/admin/adminLogList
function adminLogListFn(tableId, pagerId, postData){
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/admin/operaotr/log/list',
		colModel = [
//			{label: '编号',name:'userNo',index:'userNo',width:90, align: 'center'},
			{label: '登录名',name:'loginName',index:'loginName',width:90, align: 'center'},
//			{label: '类型',name:'operatorType',index:'operatorType',width:90, align: 'center',
//				formatter: function(cellVal, cellData, rowData){
//					var newVal;
//					$.each(globalData.adminTypeMap, function(key, val) {
//						if(cellVal == key){
//							newVal = val;
//							return false;
//						}
//					});
//					return newVal || '';
//				}
//			},
			{label: '操作时间',name:'createTime',index:'createTime',width:90, align: 'center',
				formatter: function(cellVal, cellData, rowData){
					var str = '';
					str = Common.msToTime(cellVal);
					return str;
				} 
			},
			{label: '操作类型',name:'operatorType',index:'operatorType',width:90, align: 'center',
				formatter: function(cellVal, cellData, rowData){
					var newVal;
					$.each(globalData.adminLogTypeList, function(index, obj) {
						if(cellVal == obj.value){
							newVal = obj.desc;
							return false;
						}
					});
					return newVal || '';
				}
			},
			{label: '操作状态',name:'status',index:'status',width:90, align: 'center',
				formatter: function(cellVal, cellData, rowData){
					var newVal;
					$.each(globalData.adminLogStatusList, function(index, obj) {
						if(cellVal == obj.value){
							newVal = obj.desc;
							return false;
						}
					});
					return newVal || '';
				}
			},
			{label: 'IP地址',name:'ip',index:'ip',width:90, align: 'center'},
			{label: '操作内容',name:'content',index:'content',width:90, align: 'center'}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	var postData = {
		rowNum : 100
	}
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'操作日志'});
}