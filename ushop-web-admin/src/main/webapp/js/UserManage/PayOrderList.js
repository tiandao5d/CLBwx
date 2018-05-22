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
	Common.menuNavContent('用户管理', '支付订单列表','用户管理后台');

	
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
	globalDataFn(function(data){
		var opt = '<option value="">请选择</option>'
		$.each(globalData.PaymentStatusList,function(i,o){
			opt += '<option value="'+o.value+'">'+o.desc+'</option>'
		})
		$('#changeStatusHtml [name=payStatus]').html(opt);
		//查询按键
		$('.itemSearch').on('click', function(){
			var me = $(this),
				box = me.parents('.tabPane'),
				id = box.attr('id'),
				startDate = $.trim(box.find('.form_datetime.start').val()),
				endDate = $.trim(box.find('.form_datetime.end').val()),
				orderNo = $.trim(box.find('.orderNo').val()),
				userName = $.trim(box.find('.userName').val()),
				userTel = $.trim(box.find('.userTel').val()),
				table = box.find('.itemGridTable'),
				pager = box.find('.itemGridPager');
			var postData = {};
			if(userTel && !globalData.regExpPhone.test(userTel)){Common.jBoxNotice('请输入有效手机号','red');return false}
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
	//		if(new Date(endDate).getTime() > new Date(startDate).getTime()){
				postData = {
					startDate: startDate,
					endDate: endDate,
					userName: userName,
					mobileNo :userTel,
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
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			$(window).trigger('resize.jqGrid');
		});
		orderList('#itemsTable1', '#itemsPager1');
	});
});

//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/pay/order/getConstants';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.PaymentStatusList = data.PaymentStatusList;
			globalData.PaymentTypeList = data.PaymentTypeList;
			globalData.OrderTypeList = data.OrderTypeList;
			globalData.RefundList = data.RefundList;
			var _url = Common.DOMAIN_NAME + '/ushop-web-admin/account/fundType/list';
			Common.dataAjax(_url, function(data, status){
				if(status == 'success'){
					globalData.fundTypeList = data.recordList;
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
}

//订单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//orderNo     订单号 字符串类型
//userID   	     用户ID字符串类型
//reload      是否是刷新列表，默认为false，布尔值
//http://10.13.0.170:30005/ushop-web-admin/new/order/orderList
function orderList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/pay/order/list'
		colModel = [
			{label: '交易时间',name:'date',index:'date',width:200, align: 'center'},
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
			{label: '支付类型',name:'interfaceType',index:'interfaceType',width:80, align: 'center'},
			{label: '支付状态',name:'payStatus',index:'payStatus',width:120, fixed:true, align: 'center',
				formatter: function(cellVal){
					$.each(globalData.PaymentStatusList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
			},	
			{label: '交易状态',name:'payType',index:'payType',width:80, align: 'center',
				formatter: function(val){
					var str = '';
					$.each(globalData.OrderTypeList,function(index,obj){
						if(val == obj.value){
							str = obj.desc;
						}
					});
					return str;
				}
			},
			{label: '退单状态',name:'refund',index:'refund',width:100, align: 'center',
				formatter: function(val){
					var str = '';
					$.each(globalData.RefundList,function(index,obj){
						if(val == obj.value){
							str = obj.desc;
						}
					});
					return str;
				}
			},
			{label: '用户ID',name:'userId',index:'userId',width:160, align: 'center'},
			{label: '用户昵称',name:'userName',index:'userName', align: 'center'},
//			{label: '用户手机号',name:'userTel',index:'userTel',width:140, fixed:true, align: 'center'},
			{label: '积分详情', name:'point',index:'point', width:120, align: 'center',
//				formatter: function(val, cellval , colpos, rwdat){
//					
//					var arr=val; 
//					var  str='';
//                  $.each(globalData.fundTypeList,function(i,o){
//                  	if(o.value == arr.type){
//                  		str = parseInt(arr.value) +' '+ o.desc;
//                  	}
//                  })
//					return str;
//				}
			},
			{label: '支付状态更改', name:'orderNo',index:'orderNo', width:120, align: 'center',fixed:true,
				formatter: function(val, cellval , colpos, rwdat){
					val = val+'';
					var str = '<button class="btn btn-xs btn-primary" onclick="showStatus(\'' + colpos.orderNo + '\','+colpos.payStatus+')">更改支付状态</button> ';
					return str;
				}
			}
		];
	
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '订单列表');
}
function showStatus(orderNo,payStatus){
	if(!orderNo){
		Common.jBoxNotice('参数错误，请刷新重新请求');
		return false;
	}
	globalData.orderNo = orderNo;
	var modal = $('#detailsModal');
	modal.modal('show');
	modal.find('[name=orderNo]').val(orderNo);
	modal.find('[name=payStatus]').val(payStatus);
}
//更改支付状态
function changeStatus(){
	var changeStatusHtml = $('#changeStatusHtml');
	var payStatus = changeStatusHtml.find('[name=payStatus]').val();
	if(!payStatus){
		Common.jBoxNotice('请选择更改后的支付状态','red');
		return false;
	}
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/pay/order/updateStatus',
		param = {orderNo:globalData.orderNo,payStatus:payStatus};
	Common.jBoxConfirm('确认信息', '您确定要改变此订单交易状态吗？', function(index){
		if(index == 1){
			Common.dataAjaxPost(_url, param, function(data, status){
				if(data.data == 'SUCCESS'){
					Common.jBoxNotice('操作成功', 'green');
					orderList('#itemsTable1', '#itemsPager1');
				}else{
					Common.jBoxNotice('操作失败', 'red');
				}
			});
		}
	});
}
//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/new/order/orderInfo?orderNo=201609211722061311025
//http://10.35.0.66:8080/ushop-web-admin/new/order/winnerOrderInfo?spellbuyId=77
function detailsFn(orderNo){
	orderNo = orderNo ? orderNo : '';
	var model = $('#detailsModal'),
		detailsItemDd = model.find('.detailsItemDd'),
		str = '';
	//订单列表详情
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/pay/order/getByOrderNo?orderNo=' + orderNo,
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
	model.on('shown.bs.modal', function (e) {
	  $('#detailsTable').jqGrid( 'setGridWidth', detailsItemDd.width());
	});
	$.jgrid.gridUnload('#detailsTable');
	model.modal('show');
	Common.dataAjax(url, function(data){
		$('#detailsTable').jqGrid({
			data: data.consumeList,
			datatype: "local",
			height: 'auto',
			colModel: colModel,
			rowNum:10,//每页显示的行数
			altRows: true//斑马纹
		});
		model.trigger('shown.bs.modal');
	});
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'支付订单列表'});
}