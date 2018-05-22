/**
 * 
 * OrderList.js
 * 订单管理-订单列表
 * 作者：xulin
 * 
 * */

var globalData = {};
globalData.regExpPhone = /^1(3|4|5|7|8)\d{9}$/;
jQuery(function($) {
	//菜单面包屑导航等配置显示
	Common.menuNavContent('订单管理', '积分抽奖订单列表','夺宝管理后台');

	
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
		dateCell:"#itemTab1 .start",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#itemTab1 .end",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#itemTab2 .start",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#itemTab2 .end",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#itemTab3 .start",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#itemTab3 .end",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	//绑定只读的日期选择输入框一个双击清空的事件
	$(".form_datetime[readonly]").dblclick(function(){
		$(this).val('').blur();
	});
	globalDataFn(function(data){
	    //下拉框
	    var optionStr = '';
	    $.each(globalData.listMerchantInfo, function(index, obj){
			if(index == 0){
				optionStr += '<option value="">全部商家</option>';
			}
			optionStr += '<option value="' + obj.merchantNo + '">' + obj.merchantName + '</option>';
		});
		$('.merchantName').html(optionStr);
		optionStr = '';
	    $.each(globalData.spellBuyStatusList, function(index, obj){
			if(index == 0){
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.selectClassType').html(optionStr);
		//查询按键
		$('.item1Search').on('click',onSearch1);
		$('.item2Search').on('click',onSearch2);
		$('.item3Search').on('click',onSearch3);
		$('.item4Search').on('click',onSearch4);

		
		
		
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			$(window).trigger('resize.jqGrid');
		});
		$('.xltab-box a[data-toggle="tab"]').on('click',function(e){
			var href = e.target.href;
			var tabChoose = href.slice(-1);
			if(!(tabChoose == 5)){
				$('.hideIt').addClass('hide');
			}
			if(tabChoose == 1){
				orderList('#itemsTable1', '#itemsPager1');
			}else if(tabChoose == 2){
				zjOrderList('#itemsTable2', '#itemsPager2');
			}else if(tabChoose == 3){
				abandonOrderList('#itemsTable3', '#itemsPager3');
			}else if(tabChoose == 4){
				SpellProduct('#itemsTable4', '#itemsPager4');
			}else if(tabChoose == 5){
				SpellRecordList('#itemsTable5', '#itemsPager5');
			}
		});
		orderList('#itemsTable1', '#itemsPager1');
	});
});

//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/order/getConstants';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.payStatusList = data.payStatusList;
			globalData.payTypeList = data.payTypeList;
			globalData.spellBuyStatusList = data.spellBuyStatusList;
			globalData.latestLotterysStatusList = data.latestLotterysStatusList;
			var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/getConstants';
			Common.dataAjax(_url, function(data, status){
				if(status == 'success'){
					globalData.spellBuyStatusList = data.spellBuyStatusList;
					globalData.spellBuyWinList = data.spellBuyWinList;
					var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/list';
				Common.dataAjax(_url, function(data, status){
				if(status == 'success'){
					  globalData.listMerchantInfo = data.recordList;
				     callback.call(this, data);
				}else{
					Common.jBoxNotice('数据请求错误', 'red');
					callback.call(this, data);
				}
			 
			});
				}else{
					Common.jBoxNotice('数据请求错误', 'red');
					callback.call(this, data);
				}
			});
		}else{
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
}
function onSearch1(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		startDate = $.trim(box.find('.form_datetime.start').val()),
		endDate = $.trim(box.find('.form_datetime.end').val()),
		orderNo = $.trim(box.find('.orderNo').val()),
		userName = $.trim(box.find('.userName').val()),
		userId = $.trim(box.find('.userId').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {};
	//if(userTel && !globalData.regExpPhone.test(userTel)){Common.jBoxNotice('请输入有效手机号','red');return false}
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
	postData = {
		startDate: startDate,
		endDate: endDate,
		userName: userName,
		//mobileNo :userTel,
		userId:userId,
		orderNo: orderNo
	};
	orderList('#itemsTable1', '#itemsPager1', postData);
}
function onSearch2(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		startDate = $.trim(box.find('.form_datetime.start').val()),
		endDate = $.trim(box.find('.form_datetime.end').val()),
		merchantNo = $.trim(box.find('[name="merchantName"]').val()),
		productName = $.trim(box.find('.productName').val()),
		userName = $.trim(box.find('.userName').val()),
		userId = $.trim(box.find('.userId').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	//if(userTel && !globalData.regExpPhone.test(userTel)){Common.jBoxNotice('请输入有效手机号','red');return false}
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
	var postData = {};
		postData = {
			startDate: startDate,
			endDate: endDate,
			userName: userName,
			merchantNo : merchantNo,
			//mobileNo :userTel,
			userId:userId,
			productName: productName
		};
	zjOrderList('#itemsTable2', '#itemsPager2', postData);
}
function onSearch3(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		startDate = $.trim(box.find('.form_datetime.start').val()),
		endDate = $.trim(box.find('.form_datetime.end').val()),
		merchantNo = $.trim(box.find('[name="merchantName"]').val()),
		orderNo = $.trim(box.find('.orderNo').val()),
		userName = $.trim(box.find('.userName').val()),
		productName = $.trim(box.find('[name="productName"]').val()),
		userId = $.trim(box.find('.userId').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {};
	//if(userTel && !globalData.regExpPhone.test(userTel)){Common.jBoxNotice('请输入有效手机号','red');return false}
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
	postData = {
		startDate: startDate,
		endDate: endDate,
		userName: userName,
		merchantNo : merchantNo,
		productName : productName,
		//mobileNo :userTel,
		userId:userId,
		orderNo: orderNo
	};
	abandonOrderList('#itemsTable3', '#itemsPager3', postData);
}
function onSearch4(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		selectClassType = $.trim(box.find('.selectClassType').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		spellbuyStatus: selectClassType
	};
	SpellProduct('#itemsTable4', '#itemsPager4', postData);
}
//订单列表
function orderList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/order/list'
		colModel = [
			{label: '交易时间',name:'date',index:'date',width:180, align: 'center'},
			{label: '夺宝订单号',name:'orderNo',index:'orderNo',width:220, align: 'center'},
			{label: '第三方交易号',name:'transactionId',index:'transactionId',width:180, align: 'center'},
//			{label: '预购买数量',name:'buyCount',index:'buyCount',width:100, align: 'center'},
			{label: '金额',name:'money',index:'money', align: 'center',
				formatter: 'currency',
				formatoptions: {
					decimalPlaces: 2,
					prefix : '￥'
				}
			},
			{label: '支付类型',name:'payType',index:'payType',width:80, align: 'center',
				formatter: function(val){
					var str = '';
					$.each(globalData.payTypeList,function(index,obj){
						if(val == obj.value){
							str = obj.desc;
						}
					});
					return str;
				}
			},
			{label: '支付状态',name:'status',index:'status',width:120, fixed:true, align: 'center',
				formatter: function(cellVal){
					$.each(globalData.payStatusList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;

						}
					});
					return cellVal;
				}
			},	
			{label: '用户ID',name:'userId',index:'userId',width:160, align: 'center'},
			{label: '用户昵称',name:'userName',index:'userName', align: 'center'},
//			{label: '用户手机号',name:'userTel',index:'userTel',width:140, fixed:true, align: 'center'},
			{label: '操作', name:'',index:'', width:80, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					return '<button class="btn btn-xs btn-primary" onclick="detailsFn(\'' + colpos.orderNo + '\')">详情</button>';
				}
			}
		];
	
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '订单列表');
}
//订单显示详情
function detailsFn(orderNo){
	orderNo = orderNo ? orderNo : '';
	var modal = $('#detailsModal'),
		detailsItemDd = modal.find('.detailsItemDd'),
		str = '';
		modal.find('.pageModalItem1').addClass('hide');
		modal.find('.detailsItem').addClass('hide');
		$('#determineClick').addClass('hide');
		$('.dismissModal').removeClass('hide');
		detailsItemDd.removeClass('hide');
	//订单列表详情
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/order/getById?orderNo=' + orderNo,
		colModel = [
			{label: '本期商品ID',name:'spellbuyProductId',index:'spellbuyProductId',width:160, align: 'center'},
			{label: '商品ID',name:'productId',index:'productId',width:200, align: 'center'},
			{label: '预购买数量',name:'buyCount',index:'buyCount',width:120, align: 'center'},
			{label: '已购买数量',name:'boughtCount',index:'boughtCount',width:120, align: 'center'},
			{label: '商品期数',name:'productPeriod',index:'productPeriod', align: 'center'},
			{label: '商品价格',name:'productPrice',index:'productPrice', align: 'center',
				formatter: 'currency',
				formatoptions: {
					decimalPlaces: 2,
					prefix : '￥'
				}
			},
			{label: '商品名称',name:'productName',index:'productName',width:160, align: 'center'}
		];
	modal.on('shown.bs.modal', function (e) {
	  $('#detailsTable').jqGrid( 'setGridWidth', detailsItemDd.width());
	});
	$.jgrid.gridUnload('#detailsTable');
	modal.modal('show');
	Common.dataAjax(url, function(data){
		$('#detailsTable').jqGrid({
			data: data.consumeList,
			datatype: "local",
			height: 'auto',
			colModel: colModel,
			rowNum:10,//每页显示的行数
			altRows: true//斑马纹
		});
		modal.trigger('shown.bs.modal');
	});
}
//中奖列表
function zjOrderList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/winner/listBy'
		colModel = [
			{label: '商家名称',name:'merchantName',index:'merchantName',width:100, align: 'center'},
			{label: '商品期数',name:'productPeriod',index:'productPeriod',width:80, align: 'center'},
			{label: '商品名称',name:'productName',index:'productName',width:120, align: 'center'},
//			{label: '商品价格',name:'productPrice',index:'productPrice', align: 'center',
//				formatter: 'currency',
//				formatoptions: {
//					decimalPlaces: 2,
//					prefix : '￥'
//				}
//			},
			{label: '幸运号码',name:'randomNumber',index:'randomNumber', align: 'center'},
			{label: '用户ID',name:'userId',index:'userId', align: 'center'},
			{label: '中奖者',name:'userName',index:'userName',width:120, align: 'center'},
//			{label: '用户手机号',name:'userTel',index:'userTel',width:140, fixed:true, align: 'center'},
			{label: '揭晓时间',name:'announcedTime',index:'announcedTime',width:140, align: 'center'},
			{label: '交易状态', name:'status',index:'status', width:140, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					$.each(globalData.latestLotterysStatusList,function(i,o){
						if(val == o.value){
							str = o.desc;
						}
					});
					return str
				}
			},
			{label: '操作', name:'',index:'', width:80, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					return '<button class="btn btn-xs btn-primary" onclick="zjOrderDetailsFn(' + colpos.spellbuyProductId + ')">详情</button>';
				}
			}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '中奖订单列表');
}

//中奖订单显示详情
//参数为数据的订单号

function zjOrderDetailsFn(orderNo){
	orderNo = orderNo ? orderNo : '';
	var modal = $('#detailsModal'),
		detailsItemZj = modal.find('.detailsItem'),
		tbody = detailsItemZj.find('tbody'),
		str = '';
		modal.find('.pageModalItem1').addClass('hide');
		modal.find('.detailsItemDd').addClass('hide');
		detailsItemZj.removeClass('hide');
		$('#determineClick').addClass('hide');
		$('.dismissModal').removeClass('hide');
		tbody.html('');
	//中奖订单列表详情
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/winner/getById?spellbuyProductId=' + orderNo;
	modal.modal('show');
	Common.dataAjax(url, function(data){
			data.orderExpress = data.orderExpress || {},
			data.latestLottery = data.latestLottery || {};
		var	latestLotterysStatusList = data.latestLotterysStatusList || {};
		var productImage = data.latestLottery.productImage,//商品图片
			consignee = data.orderExpress.consignee || '',//收货人
			phone = data.orderExpress.phone || '',//电话
			userName = data.latestLottery.userName || '',//中奖者姓名
			userId = data.latestLottery.userId || '',//用户ID
			announcedTime = data.latestLottery.announcedTime || '',//开奖时间
			productPrice = data.latestLottery.productPrice || '',//市场价格
			buyNumberCount = data.latestLottery.buyNumberCount || '',//数量
			status = data.latestLottery.status || 0,//数量
			merchantName = data.latestLottery.merchantName || '',//商家名称
			productName = data.latestLottery.productName || '',//商品名称
			address = data.orderExpress.address || '',//收货地址
			orderRemarks = data.orderExpress.orderRemarks || '',//订单备注
			productPeriod = data.latestLottery.productPeriod || '';//期号
			randomNumber = data.latestLottery.randomNumber || '';//幸运编号
		var statusValue = '';
		$.each(latestLotterysStatusList,function(index,obj){
			if(status == obj.value){
				statusValue = obj.desc;
			}
		});
		if(Common.oldImage.test(productImage)){
			productImage = Common.IMAGE_URL + productImage;
		}
		str = '<tr><td class="text-right">收货人</td><td>' + consignee + '</td></tr>'+
			  '<tr><td class="text-right">中奖者</td><td>' + userName + '</td></tr>'+
			  '<tr><td class="text-right">用户ID</td><td>' + userId + '</td></tr>'+
			  '<tr><td class="text-right">电话</td><td>' + phone + '</td></tr>'+
			  '<tr><td class="text-right">揭晓时间</td><td>' + announcedTime + '</td></tr>'+
			  '<tr><td class="text-right">幸运编号</td><td>' + randomNumber + '</td></tr>'+
			  '<tr><td class="text-right">期号</td><td>' + productPeriod + '</td></tr>'+
			  '<tr><td class="text-right">交易状态</td><td>' + statusValue + '</td></tr>'+
			  '<tr><td class="text-right">商家名称</td><td>' + merchantName + '</td></tr>'+
			  '<tr><td class="text-right">商品名称</td><td>' + productName + '</td></tr>'+
			  '<tr><td class="text-right">市场价格</td><td>' + productPrice + '</td></tr>'+
			  '<tr><td class="text-right">数量</td><td>' + buyNumberCount + '</td></tr>'+
			  '<tr><td class="text-right">收货地址</td><td>' + address + '</td></tr>'+
			  '<tr><td class="text-right">订单备注</td><td>' + orderRemarks + '</td></tr>'+
			  '<tr><td class="text-right">图片</td><td><img src="' + productImage + '"></td></tr>';
		tbody.html(str).addClass('tableLottery');
	});
}
//弃奖列表
function abandonOrderList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/unclaimed/listBy'
		colModel = [
			{label: '商家名称',name:'merchantName',index:'merchantName',width:100, align: 'center'},
			{label: '商品期数',name:'productPeriod',index:'productPeriod', align: 'center'},
			{label: '商品名称',name:'productName',index:'productName',width:100, align: 'center'},
			{label: '商品价格',name:'productPrice',index:'productPrice', align: 'center',
				formatter: 'currency',
				formatoptions: {
					decimalPlaces: 2,
					prefix : '￥'
				}
			},
			{label: '幸运号码',name:'randomNumber',index:'randomNumber', align: 'center'},
			{label: '用户ID',name:'userId',index:'userId',width:160, align: 'center',fixed:true},
			{label: '中奖者',name:'userName',index:'userName', align: 'center'},
//			{label: '用户手机号',name:'userTel',index:'userTel',width:140, fixed:true, align: 'center'},
			{label: '揭晓时间',name:'announcedTime',index:'announcedTime',width:180, align: 'center'},
//			{label: '交易状态', name:'status',index:'status', width:140, align: 'center',
//				formatter: function(val, cellval , colpos, rwdat){
//					var str = '';
//					$.each(globaldata.unclaimedLotterysStatusList,function(i,o){
//						if(val == o.value){
//							str = o.desc;
//						}
//					});
//					return str
//				}
//			},
			{label: '操作', name:'',index:'', width:80, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					return '<button class="btn btn-xs btn-primary" onclick="abandonDetailsFn(\'' + colpos.id + '\')">详情</button>';
				}
			}
		];
	
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '弃奖列表');
}
//弃奖详情
function abandonDetailsFn(orderNo){
	orderNo = orderNo ? orderNo : '';
	var modal = $('#detailsModal'),
		detailsItemZj = modal.find('.detailsItemZj'),
		tbody = detailsItemZj.find('tbody'),
		str = '';
		modal.find('.pageModalItem1').addClass('hide');
		modal.find('.detailsItemDd').addClass('hide');
		detailsItemZj.removeClass('hide');
		$('#determineClick').addClass('hide');
		$('.dismissModal').removeClass('hide');
		tbody.html('');
	//弃奖订单列表详情
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/unclaimed/getById?spellbuyProductId=' + orderNo;
	modal.modal('show');
	Common.dataAjax(url, function(data){
			data.orderExpress = data.orderExpress || {},
			data.unclaimedLottery = data.unclaimedLottery || {};
		var	latestLotterysStatusList = data.latestLotterysStatusList || {};
		var productImage = data.unclaimedLottery.productImage,//商品图片
			consignee = data.orderExpress.consignee || '',//收货人
			phone = data.orderExpress.phone || '',//电话
			userName = data.unclaimedLottery.userName || '',//中奖者姓名
			userId = data.unclaimedLottery.userId || '',//用户ID
			announcedTime = data.unclaimedLottery.announcedTime || '',//开奖时间
			productPrice = data.unclaimedLottery.productPrice || '',//市场价格
			buyNumberCount = data.unclaimedLottery.buyNumberCount || '',//数量
			status = data.unclaimedLottery.status || 0,//数量
			merchantName = data.unclaimedLottery.merchantName || '',//商家名称
			productName = data.unclaimedLottery.productName || '',//商品名称
			address = data.orderExpress.address || '',//收货地址
			orderRemarks = data.orderExpress.orderRemarks || '',//订单备注
			productPeriod = data.unclaimedLottery.productPeriod || '';//期号
			randomNumber = data.unclaimedLottery.randomNumber || '';//幸运编号
		console.log(status);
		var statusValue = '';
		$.each(latestLotterysStatusList,function(index,obj){
			if(status == obj.value){
				statusValue = obj.desc;
			}
		});
		if(Common.oldImage.test(productImage)){
			productImage = Common.IMAGE_URL + productImage;
		}
		str = '<tr><td class="text-right">收货人</td><td>' + consignee + '</td></tr>'+
			  '<tr><td class="text-right">中奖者</td><td>' + userName + '</td></tr>'+
			  '<tr><td class="text-right">用户ID</td><td>' + userId + '</td></tr>'+
			  '<tr><td class="text-right">电话</td><td>' + phone + '</td></tr>'+
			  '<tr><td class="text-right">揭晓时间</td><td>' + announcedTime + '</td></tr>'+
			  '<tr><td class="text-right">幸运编号</td><td>' + randomNumber + '</td></tr>'+
			  '<tr><td class="text-right">期号</td><td>' + productPeriod + '</td></tr>'+
			  '<tr><td class="text-right">交易状态</td><td>' + statusValue + '</td></tr>'+
			  '<tr><td class="text-right">商家名称</td><td>' + merchantName + '</td></tr>'+
			  '<tr><td class="text-right">商品名称</td><td>' + productName + '</td></tr>'+
			  '<tr><td class="text-right">市场价格</td><td>' + productPrice + '</td></tr>'+
			  '<tr><td class="text-right">数量</td><td>' + buyNumberCount + '</td></tr>'+
			  '<tr><td class="text-right">收货地址</td><td>' + address + '</td></tr>'+
			  '<tr><td class="text-right">订单备注</td><td>' + orderRemarks + '</td></tr>'+
			  '<tr><td class="text-right">图片</td><td><img src="' + productImage + '"></td></tr>';
		tbody.html(str);
	});
}
/*
//充值记录列表
function payOrder(tableId, pagerId, postData){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/order/listRechargeOrderPayment',
		colModel = [
			{label: '用户ID',name:'userId',index:'userId', width:170, align: 'center', fixed:true},
			{label: '用户名称',name:'userName',index:'userName',width:90, align: 'center'},
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
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '充值订单列表');
}


//充值记录显示详情
//参数为数据的订单号
function payDetailsFn(me){
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
*/
//拼购产品相关
function determineClick(){
	var errStr = '',
		_url = '',
		_param = {};
	var pageModalTitle = $('#pageModalTitle'),
		formHorizontal = $('.form-horizontal');
		typeName = pageModalTitle.attr('typeName');
	var spellBuyProductId = formHorizontal.find('.spellId').html(),
		spellBuyStatus = formHorizontal.find('.spellStatus').val(),
		spellbuyCount = formHorizontal.find('[name=spellbuyCount]').val();
		spellbuyCount = Number(spellbuyCount);
//	if(!spellBuyProductId){errStr += '<div>不能为空</div>'};
	if(!spellBuyStatus){errStr += '<div>请选择拼购状态</div>'};
	if(!spellbuyCount){errStr += '<div>拼购次数不能为空</div>'};
	if(spellbuyCount<1||!(/^\d+$/.test(spellbuyCount))){errStr += '<div>拼购次数为正整数</div>'};
	if(errStr){
		Common.jBoxNotice( errStr,'red');
		return false;
	}
	_param = {
			spellbuyCount : spellbuyCount,			
			spellBuyProductId : spellBuyProductId,			
			spellBuyStatus : spellBuyStatus
	}
	if(typeName == 'edit'){
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/update';
		Common.dataAjaxPost(_url, _param, function(data){
			if(data.data == 'success'){
				Common.jBoxNotice('编辑成功','green');
				SpellProduct('#itemsTable1', '#itemsPager1');			
			}else{
				Common.jBoxNotice('编辑失败','red');
			}
		});
	}
	
	$('#pageModal').modal('hide');
}

//拼购产品列表
function SpellProduct(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/listBy'
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '拼购个数',name:'spellbuyCount',index:'spellbuyCount',width:80, align: 'center'},
			{label: '拼购价格',name:'spellbuyPrice',index:'spellbuyPrice',width:80 , align: 'center'},
			{label: '拼购单价',name:'spellbuySinglePrice',index:'spellbuySinglePrice',width:80, align: 'center'},
			{label: '开奖期数',name:'productPeriod',index:'productPeriod',width:100, align: 'center'},
			{label: '状态',name:'spellbuyStatus',index:'spellbuyStatus',width:160, align: 'center',
			    formatter: function(val, cellval, colpos, rwdat){
			    	var str = '';
			    	$.each(globalData.spellBuyStatusList,function(i,o){
			    		if(val == o.value){
			    			str = o.desc;
			    		}
			    	});
			    	return str
			    }
			},
			{label: '幸运号码',name:'luckyNumber',index:'luckyNumber',width:140, align: 'center'},
			{label: '参与次数',name:'ownerCount',index:'ownerCount',width:140, align: 'center'},
			{label: '得奖者ID',name:'ownerId',index:'ownerId',width:140, align: 'center'},
			{label: '得奖者名称',name:'ownerName',index:'ownerName',width:140, align: 'center'},
			{label: '操作', name:'operation',index:'', width:180, fixed: true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '<button class="btn btn-xs btn-primary"  onclick="pageModalFn(' + colpos.spellbuyStatus + ',\'edit\','+colpos.id+','+colpos.spellbuyCount+')">编辑</button> ';
					    str +=' <button class="btn btn-xs btn-primary" onclick="SpellRecordList('+colpos.id+')">拼购记录</button>';
					return str;
				}
			}

		];

	$('#gbox_itemsTable2').addClass('hide');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '拼购产品列表');	
}
//拼购记录列表
function SpellRecordList(spellbuyProductId){
	$('.hideIt').removeClass('hide');
	$('.xltab-box a[data-toggle="tab"]').eq(4).tab('show');
	globalData.spellbuyProductId = spellbuyProductId;
		var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/record/listBy?spellBuyProductId='+spellbuyProductId;
		var tableId = '#itemsTable5',
		    postData = '',		    
		    pagerId = '#itemsPager5';
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '开奖期次',name:'productPeriod',index:'productPeriod',width:80, align: 'center'},
			{label: '得奖者ID',name:'buyer',index:'buyer',width:160 , align: 'center'},
			{label: '购买价格',name:'buyPrice',index:'buyPrice',width:100, align: 'center'},
			{label: '购买时间',name:'buyDate',index:'buyDate',width:100, align: 'center'},
			{label: '幸运号码',name:'randomNumber',index:'randomNumber',width:60, align: 'center'},
			{label: '中奖状态',name:'winStatus',index:'winStatus',width:120, align: 'center',
			    formatter: function(val, cellval, colpos, rwdat){
			    	var str = '';
			    	$.each(globalData.spellBuyWinList,function(i,o){
			    		if(val == o.value){
			    			str = o.desc;
			    		}
			    	});
			    	return str
			    }
			},
			{label: '购买状态',name:'buyStatus',index:'buyStatus',width:120, align: 'center',
			    formatter: function(val, cellval, colpos, rwdat){
			    	var str = '';
			    	$.each(globalData.spellBuyStatusList,function(i,o){
			    		if(val == o.value){
			    			str = o.desc;
			    		}
			    	});
			    	return str
			    }
			},
			{label: '操作', name:'operation',index:'', width:180, fixed:true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var rowData = JSON.stringify(colpos);					
					var	str = '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.buyer + ',\'random\','+colpos.spellbuyProductId+')">幸运号码</button> ';
						str += '<button class="btn btn-xs btn-primary" onclick="deleteSpell(' + colpos.id + ')">删除记录</button> '
					return str;
				}
			}

		];

	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '拼购记录列表');	
}
//拼购显示详情
function pageModalFn(userNo, typeName, spellbuyProductId,spellbuyCount){
	spellbuyProductId = spellbuyProductId || '';
//	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/spellBuyRecordList?spellBuyProductId='+spellbuyProductId;
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
		modal.find('.detailsItemDd').addClass('hide');
		modal.find('.detailsItem').addClass('hide');
		pageModalItem1.removeClass('hide');
	modal.modal('show');
	pageModalTitle.attr({'typeName' : typeName, 'spellbuyProductId' : spellbuyProductId});
	if(typeName == 'edit'){
//		Common.dataAjax(_url, function(data){
			pageModalTitle.html('编辑');
			strHtmlFn({}, typeName, userNo, spellbuyProductId, spellbuyCount);
//		});
	}else if(typeName == 'random'){
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/randomNumber/list?userNo='+userNo+'&spellBuyProductId='+spellbuyProductId;
		Common.dataAjax(_url,function(data){
			pageModalTitle.html('中奖号码');
			strHtmlFn(data, typeName);
		});
	}
}
function strHtmlFn(data, typeName, spellbuyStatus, spellbuyProductId, spellbuyCount){
    var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	modal.modal('show');
	var str = '';
	if(typeName == 'random'){
		$.each(data.recordList,function(i,o){
	        str += '<div class="form-group"><label class="col-xs-3 control-label">用户ID：</label><div class="col-xs-6">'+o.userId+'</div></div>';
	        str += '<div class="form-group"><label class="col-xs-3 control-label">购买时间：</label><div class="col-xs-6">'+o.buyDate+'</div></div>';
	        str += '<div class="form-group"><label class="col-xs-3 control-label">拼购ID：</label><div class="col-xs-6">'+o.productId+'</div></div>';
	        str += '<div class="form-group"><label class="col-xs-3 control-label">幸运码：</label><div class="col-xs-6">'+o.randomNumber+'</div></div>';
		});
		str ='<div class="form-horizontal" style="overflow:auto;max-height:600px;">'+str+'</div>';
		$('#determineClick').addClass('hide');
		$('.dismissModal').removeClass('hide');
	}else if(typeName == 'edit'){
		var optionStr = '';
		$.each(globalData.spellBuyStatusList, function(index, obj){
			if(index == 0){
				optionStr += '<option value="">请选择</option>';
			}
			if(spellbuyStatus == obj.value){
				optionStr += '<option value="' + obj.value + '" selected>' + obj.desc + '</option>';				
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
	    str += '<div class="form-group"><label class="col-xs-3 control-label">拼购ID：</label><div class="col-xs-6 spellId">'+spellbuyProductId+'</div></div>';
	    str += '<div class="form-group"><label class="col-xs-3 control-label">拼购状态：</label><div class="col-xs-6"><select class="spellStatus">'+optionStr+'</select></div></div>';
	    str += '<div class="form-group"><label class="col-xs-3 control-label">拼购次数：</label><div class="col-xs-6"><input name="spellbuyCount" class="form-control"  type="text"  style="border:0" value="'+spellbuyCount+'"></div></div>';
		str = '<div class="form-horizontal">'+str+'</div>';
		$('#determineClick').removeClass('hide');
		$('.dismissModal').addClass('hide');
	}
	
	pageModalItem1.html(str);
}
function deleteSpell(id){
	var delUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/Record/delete',
		param = {
			id : id
		};
	Common.jBoxConfirm('确认信息', '您确定要删除此行吗？', function(index){
		if(index == 1){
			Common.dataAjaxPost(delUrl, param, function(ret, status){
				if(status == 'success'){
					if(ret.data == 'success'){
						Common.jBoxNotice('删除成功', 'green');
//						SpellProduct('#itemsTable1', '#itemsPager1');
						SpellRecordList(globalData.spellbuyProductId)
					}else{
						Common.jBoxNotice('删除失败', 'red');
					}
				}else{
					Common.jBoxNotice('服务器请求失败', 'red');
				}
			});
		}
	});
}
//导出excel表格
function toExcel(n){
	var param = {
		type:'excel',
		escape:'false'
	}
	switch(n){
		case 1:param.fileName = '全部订单';param.aId = 'exportExcel1';break;
		case 2:param.fileName = '中奖订单';param.aId = 'exportExcel2';break;	
		case 3:param.fileName = '弃奖列表';param.aId = 'exportExcel3';break;	
		case 4:param.fileName = '拼购产品列表';param.aId = 'exportExcel4';break;	
		case 5:param.fileName = '拼购记录列表';param.aId = 'exportExcel5';break;	
	}
	$('#gview_itemsTable'+n).tableExport(param);
}
function goBack(){
	$('.hideIt').addClass('hide');
	$('.xltab-box a[data-toggle="tab"]').eq(3).tab('show');
}