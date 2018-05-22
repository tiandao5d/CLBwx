/**
 * 
 * PayOrder.js
 * 订单管理-充值订单列表
 * 作者：xulin
 * 
 * */
//全局数据
var globalData = {};
globalData.regExpPhone = /^1(3|4|5|7|8)\d{9}$/;
jQuery(function($) {
	
	//左侧菜单显示
	Common.menuNavContent('用户记录', '充值记录','用户管理后台');
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
	//全局变量赋值，页面数据初始化完成后执行页面操作
	globalDataFn(function(data){
		//查询按键
		$('.itemSearch').on('click', function(e){
			onSearch.call(this, e);
		});
		
		
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			$(window).trigger('resize.jqGrid');
		});
		payOrder('#itemsTable1', '#itemsPager1');
	});
});


//全局参数请求
//http://10.35.0.66:8080/ushop-web-admin/new/order/listRechargeOrderPaymentByUserId
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/pay/recharge/order/getConstants';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.payStatusList = data.payStatusList;
			globalData.payTypeList = data.payTypeList;
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
		userName = $.trim(box.find('.userName').val()),
		userTel = $.trim(box.find('.userTel').val()),
		startDate = box.find('.startDate').val(),
		endDate = box.find('.endDate').val(),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	if(startDate && endDate){
				if(new Date(endDate).getTime() <= new Date(startDate).getTime()){
					Common.jBoxNotice('结束时间要大于起始时间', 'red');
					return false;
				}
			}else if(startDate){
				Common.jBoxNotice('请选择结束时间', 'red');
				return false;
			}else if(endDate){
				Common.jBoxNotice('请选择开始时间', 'red');
				return false;
			}else{
				startDate = '';
				endDate = '';
			}
		if(userTel && !globalData.regExpPhone.test(userTel)){Common.jBoxNotice('请输入有效手机号','red');return false}
	
	var postData = {
		userName: userName,
		mobileNo :userTel,
		startDate: startDate,
		endDate: endDate
	}
	payOrder('#itemsTable1', '#itemsPager1', postData);
}

//管理员列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    额外参数
//http://10.35.0.66:8080/ushop-web-admin/new/order/listRechargeOrderPaymentByUserId
function payOrder(tableId, pagerId, postData){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/pay/recharge/order/list',
		colModel = [
			{label: '用户ID',name:'userId',index:'userId', width:170, align: 'center', fixed:true},
			{label: '用户昵称',name:'userName',index:'userName', align: 'center'},
//			{label: '用户手机号',name:'userTel',index:'userTel',width:140, fixed:true, align: 'center'},
			{label: '金额',name:'money',index:'money',width:90, align: 'center'},
			{label: '购买数量',name:'buyCount',index:'buyCount',width:90, align: 'center'},
			{label: '订单编号',name:'orderNo',index:'orderNo',width:170, align: 'center', fixed:true},
			{label: '支付类型',name:'payType',index:'payType',width:90, align: 'center',
				formatter: function(cellVal){
					$.each(globalData.payStatusList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
			},
			{label: '交易状态',name:'payStatus',index:'payStatus',width:90, align: 'center',
				formatter: function(cellVal){
					$.each(globalData.payStatusList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
			},
			{label: '交易时间',name:'date',index:'date',width:90, align: 'center'},
			{label: '操作', name:'operation',index:'', align: 'center', width:60, fixed:true, sortable:false, resize:false,
				formatter: function(cellVal, cellData , rowData, rwdat){
					var cellStr = JSON.stringify(cellData),
						rowStr = JSON.stringify(rowData);
					var str = '<button cellStr=\'' + cellStr + '\' rowStr=\'' + rowStr + '\' class="btn btn-xs btn-primary" onclick="detailsFn(this)">详情</button> ';
					return str;
				}
			}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '管理员列表');
}



//显示详情
//参数为数据的订单号
function detailsFn(me){
	var rowData = JSON.parse($(me).attr('rowStr'));
	var modal = $('#detailsModal'),
		detailsItemZj = modal.find('.detailsItemZj'),
		tbody = detailsItemZj.find('tbody'),
		str = '';
	var money = rowData.money,//金额
		_date = rowData.date,//交易时间
		buyCount = rowData.buyCount || '',//购买数量
		userId = rowData.userId || '',//用户ID
		userName = rowData.userName || '',//用户名
		orderNo = rowData.orderNo || '',//订单编号
		payType = rowData.payType || '',//支付类型
		interfaceType = rowData.interfaceType || '',//接口类型
		withold = rowData.withold || '',//商品购买数量预扣明细
		payStatus = rowData.payStatus || '';//交易状态
		balance = rowData.balance || '';//余额支付额
		point = rowData.point || '';//积分抵扣额
		integral = rowData.integral || '';//红包抵扣额
		bankMoney = rowData.bankMoney || '';//网银支付额
	
	$.each(globalData.payTypeList, function(index, obj) {
		if(payType == obj.value){
			payType = obj.desc;
			return false;
		}
	});
	$.each(globalData.payStatusList, function(index, obj) {
		if(payStatus == obj.value){
			payStatus = obj.desc;
			return false;
		}
	});
	
	str = '<tr><td class="text-right">金额</td><td>' + money + '</td></tr>'+
		  '<tr><td class="text-right">交易时间</td><td>' + _date + '</td></tr>'+
		  '<tr><td class="text-right">购买数量</td><td>' + buyCount + '</td></tr>'+
		  '<tr><td class="text-right">用户ID</td><td>' + userId + '</td></tr>'+
		  '<tr><td class="text-right">用户昵称</td><td>' + userName + '</td></tr>'+
		  '<tr><td class="text-right">订单编号</td><td>' + orderNo + '</td></tr>'+
		  '<tr><td class="text-right">支付类型</td><td>' + payType + '</td></tr>'+
		  '<tr><td class="text-right">接口类型</td><td>' + interfaceType + '</td></tr>'+
		  '<tr><td class="text-right">商品购买数量预扣明细</td><td>' + withold + '</td></tr>'+
		  '<tr><td class="text-right">交易状态</td><td>' + payStatus + '</td></tr>'+
		  '<tr><td class="text-right">余额支付额</td><td>' + balance + '</td></tr>'+
		  '<tr><td class="text-right">积分抵扣额</td><td>' + point + '</td></tr>'+
		  '<tr><td class="text-right">红包抵扣额</td><td>' + integral + '</td></tr>'+
		  '<tr><td class="text-right">网银支付额</td><td>' + bankMoney + '</td></tr>';
	tbody.html(str);
	modal.modal('show');
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'充值记录'});
}