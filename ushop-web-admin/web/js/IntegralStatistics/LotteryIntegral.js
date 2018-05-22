/**
 * 
 * lotteryIntegral.js
 * 订单管理-充值订单列表
 * 作者：roland
 * 
 * */
//全局数据
var globalData = {};
//硬性数据
var provinceTypeList = [
		{desc: '全国', value: 0},
		{desc: '北京市', value: 1},
		{desc: '天津市', value: 2},
		{desc: '上海市', value: 3},
		{desc: '重庆市', value: 4},
		{desc: '河北省', value: 5},
		{desc: '山西省', value: 6},
		{desc: '辽宁省', value: 7},
		{desc: '吉林省', value: 10},
		{desc: '黑龙江省', value: 11},
		{desc: '江苏省', value: 12},
		{desc: '浙江省', value: 13},
		{desc: '安徽省', value: 14},
		
		{desc: '福建省', value: 15},
		{desc: '江西省', value: 16},
		{desc: '山东省', value: 17},
		{desc: '河南省', value: 18},
		{desc: '湖北省', value: 19},
		{desc: '湖南省', value: 20},
		{desc: '广东省', value: 21},
		
		{desc: '海南省', value: 22},
		{desc: '四川省', value: 23},
		{desc: '贵州省', value: 24},
		{desc: '云南省', value: 25},
		{desc: '山西省', value: 26},
		{desc: '甘肃省', value: 27},
		{desc: '青海省', value: 28},
		
		{desc: '台湾省', value: 29},
		{desc: '内蒙古自治区', value: 30},
		{desc: '广西壮族自治区', value: 31},
		{desc: '西藏自治区', value: 32},
		{desc: '宁夏回族自治区', value: 33},
		{desc: '新疆维吾尔自治区', value: 34}
	];
jQuery(function($) {
	
	//左侧菜单显示
	Common.menuNavContent('积分管理', '拍彩积分','积分管理后台');
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
	var opt = '';
	$.each(provinceTypeList,function(index,obj){
		opt += '<option value="' + obj.value + '">' + obj.desc + '</option>';
	});
	$('#province').html(opt);
	//全局变量赋值，页面数据初始化完成后执行页面操作
//	globalDataFn(function(data){
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
		lotteryRecord('#itemsTable1', '#itemsPager1');
//	});
});


//全局参数请求
//http://10.35.0.66:8080/ushop-web-admin/order/listRechargeOrderPaymentByUserId
//function globalDataFn(callback){
//	callback = callback || function(){};
//	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/order/listRechargeOrderPayment';
//	Common.dataAjax(_url, function(data, status){
//		if(status == 'success'){
//			globalData.payStatusList = data.payStatusList;
//			globalData.payTypeList = data.payTypeList;
//			callback.call(this, data);
//		}else{
//			Common.jBoxNotice('数据请求错误', 'red');
//			callback.call(this, data);
//		}
//	});
//}


//查询函数
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		provinceList = box.find('#province').val(),
		startDate = box.find('.startDate').val(),
		endDate = box.find('.endDate').val(),
		gameName = box.find('.gameName').val(),
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
	var postData = {
		provinceList: provinceList,
		gameName : gameName,
		startDate: startDate,
		endDate: endDate
	}
	console.log(postData);
	lotteryRecord('#itemsTable1', '#itemsPager1', postData);
}

//管理员列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    额外参数
//http://10.35.0.66:8080/ushop-web-admin/order/listRechargeOrderPaymentByUserId
function lotteryRecord(tableId, pagerId, postData){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/lotteryTickets/list',
		colModel = [
			{label: '游戏ID',name:'gameId',index:'gameId', width:90, align: 'center'},
			{label: '游戏名称',name:'gameName',index:'gameName',width:90, align: 'center'},
			{label: '所属省份',name:'province',index:'province',width:90, align: 'center',
			formatter: function(cellVal, cellData , rowData){
					$.each(provinceTypeList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
			},
			{label: '特征码',name:'characteristicCode',index:'characteristicCode',width:150, align: 'center'},
			{label: '期号',name:'gamePeriod',index:'gamePeriod',width:120, align: 'center'},
			{label: '玩法',name:'gameRule',index:'gameRule',width:90, align: 'center'},
			{label: '投注金额',name:'bettingAmount',index:'bettingAmount',width:90, align: 'center'},
			{label: '获得积分', name:'gainPoints',index:'gainPoints', align: 'center', width:60, fixed:true}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '拍彩积分');
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
		  '<tr><td class="text-right">用户名</td><td>' + userName + '</td></tr>'+
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
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'拍彩积分'});
}