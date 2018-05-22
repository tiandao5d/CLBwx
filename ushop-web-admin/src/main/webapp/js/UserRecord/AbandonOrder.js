/**
 * 
 * AbandonOrder.js
 * 订单管理-弃奖列表
 * 作者：xulin
 * 
 * */

var globalData = {};
globalData.regExpPhone = /^1(3|4|5|7|8)\d{9}$/;
jQuery(function($) {
	//菜单面包屑导航等配置显示
	Common.menuNavContent('用户记录', '弃奖记录', '用户管理后台');

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
		dateCell: "#xlgridBox .start",
		format: "YYYY-MM-DD",
		isTime: false //isClear:false,
	});
	jeDate({
		dateCell: "#xlgridBox .end",
		format: "YYYY-MM-DD",
		isTime: false //isClear:false,
	});
	//绑定只读的日期选择输入框一个双击清空的事件
	$(".form_datetime[readonly]").dblclick(function() {
		$(this).val('').blur();
	});
	globalDataFn(function(data) {
		var optionStr = '';
		$.each(globalData.listMerchantInfo, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">全部商家</option>';
			}
			optionStr += '<option value="' + obj.merchantNo + '">' + obj.merchantName + '</option>';
		});
		$('.merchantName').html(optionStr);
		//查询按键
		$('.itemSearch').on('click', function() {
			var me = $(this),
				box = me.parents('.tabPane'),
				id = box.attr('id'),
				startDate = $.trim(box.find('.form_datetime.start').val()),
				endDate = $.trim(box.find('.form_datetime.end').val()),
				orderNo = $.trim(box.find('.orderNo').val()),
				merchantNo = $.trim(box.find('[name="merchantName"]').val()),
				product = $.trim(box.find('.productName').val()),
				userName = $.trim(box.find('.userName').val()),
				userTel = $.trim(box.find('.userTel').val()),
				table = box.find('.itemGridTable'),
				pager = box.find('.itemGridPager');
			var postData = {};
			if(userTel && !globalData.regExpPhone.test(userTel)) {
				Common.jBoxNotice('请输入有效手机号', 'red');
				return false
			}
			if(startDate && endDate) {
				if(new Date(endDate).getTime() <= new Date(startDate).getTime()) {
					Common.jBoxNotice('结束时间要大于起始时间', 'red');
					return false;
				}
			} else if(startDate) {
				Common.jBoxNotice('请选择结束时间', 'red');
				return false;
			} else if(endDate) {
				Common.jBoxNotice('请选择开始时间', 'red');
				return false;
			} else {
				startDate = '';
				endDate = '';
			}
			//		if(new Date(endDate).getTime() > new Date(startDate).getTime()){
			postData = {
				startDate: startDate,
				endDate: endDate,
				userName: userName,
				merchantNo: merchantNo,
				product: product,
				mobileNo: userTel,
				orderNo: orderNo
			};
			orderList('#itemsTable1', '#itemsPager1', postData);
			//		}else{
			//			alert('结束时间要大于起始时间！');
			//		}
		});

		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			$(window).trigger('resize.jqGrid');
		});
		orderList('#itemsTable1', '#itemsPager1');
	});
});

//全局参数请求
function globalDataFn(callback) {
	callback = callback || function() {};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/unclaimed/getConstants';
	Common.dataAjax(_url, function(data, status) {
		if(status == 'success') {
			globalData.latestLotterysStatusList = data.latestLotterysStatusList;

			var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/list';
			Common.dataAjax(_url, function(data, status) {
				if(status == 'success') {

					globalData.listMerchantInfo = data.recordList;
					callback.call(this, data);
				} else {
					Common.jBoxNotice('数据请求错误', 'red');
					callback.call(this, data);
				}
			});
		} else {
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
}

//订单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//orderNo     订单号 字符串类型
//userID   	     用户ID字符串类型
//reload      是否是刷新列表，默认为false，布尔值
//http://10.13.0.170:30005/ushop-web-admin/new/order/unclaimedLottery
function orderList(tableId, pagerId, postData, reload) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/unclaimed/listBy'
	colModel = [{
			label: '商品期数',
			name: 'productPeriod',
			index: 'productPeriod',
			width: 80,
			align: 'center'
		}, {
			label: '商品名称',
			name: 'productName',
			index: 'productName',
			width: 120,
			align: 'center'
		}, {
			label: '商家名称',
			name: 'merchantName',
			index: 'merchantName',
			width: 100,
			align: 'center'
		}, {
			label: '幸运号码',
			name: 'randomNumber',
			index: 'randomNumber',
			align: 'center'
		}, {
			label: '用户ID',
			name: 'userId',
			index: 'userId',
			align: 'center',
			width: 150,
			fixed: true
		}, {
			label: '中奖者',
			name: 'userName',
			index: 'userName',
			width: 120,
			align: 'center'
		}, {
			label: '揭晓时间',
			name: 'announcedTime',
			index: 'announcedTime',
			width: 140,
			align: 'center'
		},
		//			{label: '购买总数',name:'buyCount',index:'buyCount',width:100, align: 'center'},
		//			{label: '购买金额',name:'money',index:'money', align: 'center',
		//				formatter: 'currency',
		//				formatoptions: {
		//					decimalPlaces: 2,
		//					prefix : '￥'
		//				}
		//			},
		//			{label: '交易状态', name:'status',index:'status', width:140, align: 'center',
		//				formatter: function(val, cellval , colpos, rwdat){
		//					var str = '';
		//					$.each(globalData.latestLotterysStatusList,function(i,o){
		//						if(val == o.value){
		//							str = o.desc;
		//						}
		//					});
		//					return str
		//				}
		//			},
		//			{label: '支付类型',name:'payType',index:'payType',width:120, fixed:true, align: 'center',
		//				formatter: function(cellVal){
		//					$.each(globalData.PaymentTypeList, function(index, obj) {
		//						if(cellVal == obj.value){
		//							cellVal = obj.desc;
		//							return false;
		//						}
		//					});
		//					return cellVal;
		//				}
		//			},			
		{
			label: '操作',
			name: '',
			index: '',
			width: 80,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				return '<button class="btn btn-xs btn-primary" onclick="detailsFn(\'' + colpos.id + '\')">详情</button>';
			}
		}
	];

	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '弃奖列表');
}

//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/new/order/orderInfo?orderNo=201609211722061311025
//http://10.35.0.66:8080/ushop-web-admin/new/order/winnerOrderInfo?spellbuyId=77
function detailsFn(orderNo) {
	//	orderNo = orderNo ? orderNo : '';
	//	var model = $('#detailsModal'),
	//		detailsItemDd = model.find('.detailsItemDd'),
	//		str = '';
	//	//订单列表详情
	//	var url = Common.DOMAIN_NAME + '/ushop-web-admin/new/order/unclaimedLottery?orderNo=' + orderNo,
	//		colModel = [
	//			{label: '本期商品ID',name:'spellbuyProductId',index:'spellbuyProductId',width:160, align: 'center'},
	//			{label: '商品ID',name:'productId',index:'productId',width:200, align: 'center'},
	//			{label: '购买数量',name:'buyCount',index:'buyCount',width:120, align: 'center'},
	//			{label: '商品期数',name:'productPeriod',index:'productPeriod', align: 'center'},
	//			{label: '商品价格',name:'productPrice',index:'productPrice', align: 'center',
	//				formatter: 'currency',
	//				formatoptions: {
	//					decimalPlaces: 2,
	//					prefix : '￥'
	//				}
	//			},
	//			{label: '商品名称',name:'productName',index:'productName',width:160, align: 'center'}
	//		];
	//	model.on('shown.bs.modal', function (e) {
	//	  $('#detailsTable').jqGrid( 'setGridWidth', detailsItemDd.width());
	//	});
	//	$.jgrid.gridUnload('#detailsTable');
	//	model.modal('show');
	//	Common.dataAjax(url, function(data){
	//		console.log(url, data)
	//		$('#detailsTable').jqGrid({
	//			data: data.recordList,
	//			datatype: "local",
	//			height: 'auto',
	//			colModel: colModel,
	//			rowNum:10,//每页显示的行数
	//			altRows: true//斑马纹
	//		});
	//		model.trigger('shown.bs.modal');
	//	});
	orderNo = orderNo ? orderNo : '';
	var model = $('#detailsModal'),
		detailsItemZj = model.find('.detailsItemZj'),
		tbody = detailsItemZj.find('tbody'),
		str = '';
	//弃奖订单列表详情
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/unclaimed/getById?spellbuyProductId=' + orderNo;
	model.modal('show');
	Common.dataAjax(url, function(data) {
		data.orderExpress = data.orderExpress || {},
			data.unclaimedLottery = data.unclaimedLottery || {};
		var latestLotterysStatusList = data.latestLotterysStatusList || {};
		var productImage = data.unclaimedLottery.productImage, //商品图片
			consignee = data.orderExpress.consignee || '', //收货人
			phone = data.orderExpress.phone || '', //电话
			userName = data.unclaimedLottery.userName || '', //中奖者姓名
			userId = data.unclaimedLottery.userId || '', //用户ID
			announcedTime = data.unclaimedLottery.announcedTime || '', //开奖时间
			productPrice = data.unclaimedLottery.productPrice || '', //市场价格
			buyNumberCount = data.unclaimedLottery.buyNumberCount || '', //数量
			status = data.unclaimedLottery.status || 0, //数量
			merchantName = data.unclaimedLottery.merchantName || '', //商家名称
			productName = data.unclaimedLottery.productName || '', //商品名称
			address = data.orderExpress.address || '', //收货地址
			orderRemarks = data.orderExpress.orderRemarks || '', //订单备注
			productPeriod = data.unclaimedLottery.productPeriod || ''; //期号
		randomNumber = data.unclaimedLottery.randomNumber || ''; //幸运编号
		console.log(status);
		var statusValue = '';
		$.each(latestLotterysStatusList, function(index, obj) {
			if(status == obj.value) {
				statusValue = obj.desc;
			}
		});
		if(Common.oldImage.test(productImage)) {
			productImage = Common.IMAGE_URL + productImage;;
		}
		str = '<tr><td class="text-right">收货人</td><td>' + consignee + '</td></tr>' +
			'<tr><td class="text-right">中奖者</td><td>' + userName + '</td></tr>' +
			'<tr><td class="text-right">用户ID</td><td>' + userId + '</td></tr>' +
			'<tr><td class="text-right">电话</td><td>' + phone + '</td></tr>' +
			'<tr><td class="text-right">揭晓时间</td><td>' + announcedTime + '</td></tr>' +
			'<tr><td class="text-right">幸运编号</td><td>' + randomNumber + '</td></tr>' +
			'<tr><td class="text-right">期号</td><td>' + productPeriod + '</td></tr>' +
			'<tr><td class="text-right">交易状态</td><td>' + statusValue + '</td></tr>' +
			'<tr><td class="text-right">商家名称</td><td>' + merchantName + '</td></tr>' +
			'<tr><td class="text-right">商品名称</td><td>' + productName + '</td></tr>' +
			'<tr><td class="text-right">市场价格</td><td>' + productPrice + '</td></tr>' +
			'<tr><td class="text-right">数量</td><td>' + buyNumberCount + '</td></tr>' +
			'<tr><td class="text-right">收货地址</td><td>' + address + '</td></tr>' +
			'<tr><td class="text-right">订单备注</td><td>' + orderRemarks + '</td></tr>' +
			'<tr><td class="text-right">图片</td><td><img src="' + productImage + '"></td></tr>';
		tbody.html(str);
	});
}
//导出excel表格
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '弃奖记录'
	});
}