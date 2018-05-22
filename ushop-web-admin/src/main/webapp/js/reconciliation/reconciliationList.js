/**
 * 
 * ActiveTaskList.js
 * 活动任务-活动任务列表
 * 作者：xulin
 * 
 * */


//硬性数据
var globalData = {};
jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('对账管理', '站点对账','统计管理后台');
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
	});
	
	
	//日期选择器绑定
	$(".form_datetime.dd").datetimepicker({
		format:'yyyy-mm',
		autoclose:true,
		language: 'zh-CN',
		startView: 3,
		maxView: 4,
		minView: 3
	});
	//绑定只读的日期选择输入框一个双击清空的事件
	$(".form_datetime[readonly]").dblclick(function(){
		$(this).val('').blur();
	});
	
	//省份获取
	$('.provinces').load('../../js/provinces.json', function(data){
		globalData.provinceArr = JSON.parse(data);
		var str = '<option value="">请选择</option>';
		$.each(globalData.provinceArr, function(index, obj){
			str += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		this.innerHTML = str;
	});
	
	//列表呈现
	pageListItems1('#itemsTable1', '#itemsPager1');
});

//查询
function onSearchFn(me){
	var tabPane = $(me).parents('.tabPane'),
		param = {
			province: tabPane.find('.provinces').val(),
			month: tabPane.find('.month').val(),
			stationName: tabPane.find('.stationName').val()
		};
	pageListItems1('#itemsTable1', '#itemsPager1', param);
}

//对账列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
function pageListItems1(tableId, pagerId, postData){
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = '/ushop-web-admin/account/bill/listBy',
		colModel = [
			{label: 'ID',name:'id',index:'id',hidden: true},
			{label: '用户',name:'userNo',index:'userNo',hidden: true},
			{label: '省份',name:'province',index:'province',width:100, align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				$.each(globalData.provinceArr, function(index, obj){
					if(obj.value === cellVal){
						cellVal = obj.desc
						return false;
					}
				});
				return cellVal;
			}},
			{label: '站点名',name:'stationName',index:'stationName',width:100, align: 'center'},
			{label: '站点号',name:'stationNo',index:'stationNo',width:80, align: 'center'},
			{label: '名称',name:'month',index:'month',width:100, align: 'center'},
			{label: '结算金额',name:'total',index:'total',width:100 , align: 'center'},
			{label: '创建日期',name:'createTime',index:'createTime',width:80,fixed:'true', align: 'center',
			formatter: function(cellVal, cellData, rowData){
				return Common.msToTime(cellVal, true);
			}},
			{label: '付款状态',name:'status',index:'status',width:60,fixed:'true', align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				switch(cellVal){
					case 1: return '未提现';
					case 2: return '审核中';
					case 3: return '打款中';
					case 4: return '已打款';
					case 5: return '打款失败';
				}
			}},
			{label: '打款日期',name:'remitDate',index:'remitDate',width:160, align: 'center',
			formatter: function(cellVal, cellData, rowData){
				//已经打款才会有打款日期
				return (rowData.status === 4 ? Common.msToTime(cellVal) : '');
			}},
			{label: '操作', name:'',index:'', width:140, align: 'center',fixed:'true',
			formatter: function(cellVal, cellData, rowData) {
				var str = '<button class="btn btn-xs btn-primary" onclick="billDetail(' + rowData.id + ', this)">明细</button>';
				if(rowData.status === 2){
					str += ' <button class="btn btn-xs btn-primary" onclick="passGame(' + rowData.id + ')">通过验证</button>';
				}
				return str;
			}}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}


//当月账单明细
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
function detailListItems(tableId, pagerId, postData, prd){
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = '/ushop-web-admin/account/bill/listByGift',
		totalNum = 0,
		colModel = [
			{label: '省份',name:'province',index:'province',width:100, align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				return prd.province;
			}},
			{label: '站点',name:'stationName',index:'stationName',width:100, align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				return prd.stationName;
			}},
			{label: '账号',name:'consumerNo',index:'consumerNo',width:100, align: 'center'},
			{label: '兑换类别',name:'couponsType',index:'couponsType',width:140, align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				switch(rowData.couponsType){
					case '1': return '游戏券';
					case '2': return '礼品兑换券';
				}
			}},
			{label: '名称',name:'couponsName',index:'couponsName',width:140, align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				return rowData.object.couponsName;
			}},
			{label: '金额',name:'balance',index:'balance',width:120, align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				if(cellData.rowId === ''){
					return '总计：' + cellVal + '元';
				}else{
					totalNum += cellVal;
					return cellVal
				}
			}}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, 
		{
			footerrow : true,
			gridComplete: function(){
				$(this).footerData('set', {balance: totalNum});
			}
		}
	);
}

//当月账单明细
function billDetail(id, me){
	if(!id){
		Common.jBoxNotice('数据错误！', 'red');
		return false;
	}
	var rowData = $(me).parents('table').jqGrid('getRowData', id);
	var param = {
		beginTime: (rowData.month + '-01'),
		endTime: (rowData.month + '-31'),
		promoterNo: rowData.userNo
	};
	pageSH('bill_detail', 'page_box');
	//列表呈现
	detailListItems('#detailTable', '#detailPager', param, rowData);
}

//审核通过
function passGame(id){
	var _url = '/ushop-web-admin/account/bill/pass';
	Common.ajax(_url, 'get', {id: id}, function(data){
		if(data.result === 'SUCCESS'){
			Common.jBoxNotice('操作成功', 'green');
			pageListItems1('#itemsTable1', '#itemsPager1');
		}else{
			Common.jBoxNotice((data.error_description || '未知错误'), 'red');
		}
	});
}

//显示或隐藏界面
function pageSH(id, cn){
	$('.' + cn).addClass('hide');
	$('#' + id).removeClass('hide');
}
//导出Excel表格
//按键点击元素的ID
function toExcel(eleid, filename){
	$('#' + eleid).tableExport({
		type: 'excel',
		escape: 'false',
		fileName: filename,
		aId: (eleid + 'aid')
	});
}