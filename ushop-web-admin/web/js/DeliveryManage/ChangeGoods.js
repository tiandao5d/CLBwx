/**
 * 
 * changeGoods.js
 * 发货管理-换货管理
 * 作者：roland
 * 
 * */

var globalData = {},
	optionStr = '';
globalData.regExpPhone = /^1(3|4|5|7|8)\d{9}$/;
jQuery(function($) {
	//菜单面包屑导航等配置显示
	Common.menuNavContent('发货管理', '换货管理', '夺宝管理后台');

	//全局变量赋值，页面数据初始化完成后执行页面操作
	globalDataFn(function(data) {

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
				productPeriod = $.trim(box.find('[name=productPeriod]').val()),
				productName = $.trim(box.find('[name=productName]').val()),
				merchantNo = $.trim(box.find('[name="merchantName"]').val()),
				currentStatus = box.find('[name=currentStatus]').val(),
				userTel = $.trim(box.find('.userTel').val()),
				userName = $.trim(box.find('[name=userName]').val()),
				table = box.find('.itemGridTable'),
				pager = box.find('.itemGridPager');
			var postData = {};
			if(userTel && !globalData.regExpPhone.test(userTel)) {
				Common.jBoxNotice('请输入有效手机号', 'red');
				return false
			}

			//		if(new Date(endDate).getTime() > new Date(startDate).getTime()){
			postData = {
				productPeriod: productPeriod,
				productName: productName,
				status: currentStatus,
				mobileNo: userTel,
				merchantNo: merchantNo,
				userName: userName
			};
			changeGoods('#itemsTable1', '#itemsPager1', postData);
			//		}else{
			//			alert('结束时间要大于起始时间！');
			//		}
		});
		optionStr = '';
		$.each(globalData.LotteryReplacementStatus, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('[name=currentStatus]').html(optionStr);

		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			$(window).trigger('resize.jqGrid');
		});
		changeGoods('#itemsTable1', '#itemsPager1');
	});
});

//全局参数请求
function globalDataFn(callback) {
	callback = callback || function() {};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/replacement/getConstants';
	Common.dataAjax(_url, function(data, status) {
		if(status == 'success') {
			globalData.LotteryReplacementStatus = data.LotteryReplacementStatus;
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

//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//orderNo     订单号 字符串类型
//userID   	     用户ID字符串类型
//reload      是否是刷新列表，默认为false，布尔值
//http://10.35.0.66:8080/ushop-web-admin/new/delivery/deliveryList
function changeGoods(tableId, pagerId, postData, reload) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/replacement/list';
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
		width: 140,
		align: 'center'
	}, {
		label: '商家名称',
		name: 'merchantName',
		index: 'merchantName',
		width: 140,
		align: 'center'
	}, {
		label: '申请换货时间',
		name: 'createTime',
		index: 'createTime',
		width: 140,
		align: 'center',
		formatter: function(val, cellval, colpos, rwdat) {
			var str = Common.msToTime(val);
			return str
		}
	}, {
		label: '用户ID',
		name: 'userNo',
		index: 'userNo',
		width: 140,
		align: 'center'
	}, {
		label: '中奖者',
		name: 'userName',
		index: 'userName',
		width: 140,
		align: 'center'
	}, {
		label: '换货原因',
		name: 'reason',
		index: 'reason',
		width: 120,
		align: 'center'
	}, {
		label: '交易状态',
		name: 'status',
		index: 'status',
		width: 120,
		align: 'center',
		formatter: function(val, cellval, colpos, rwdat) {
			var str = '';
			$.each(globalData.LotteryReplacementStatus, function(i, o) {
				if(val == o.value) {
					str = o.desc;
				}
			});
			return str
		}
	}, {
		label: '操作',
		name: '',
		index: '',
		width: 130,
		align: 'center',
		formatter: function(val, cellval, colpos, rwdat) {
			var str = '<button class="btn btn-xs btn-primary" onclick="detailsFn(' + colpos.spellbuyProductId + ')">查看</button> ';
			return str;
		}
	}];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '换货列表');
}

//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/new/share/shareInfo?id=1
function detailsFn(id, type) {
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/replacement/lotteryReplacementOrderInfo?spellbuyProductId=' + id,
		str = '',
		imgStr = '';
	var modal = $('#detailsModal'),
		detailsItemSd = modal.find('.detailsItemSd'),
		modalTitle = modal.find('.modal-title'),
		tbody = detailsItemSd.find('tbody');
	modalTitle.html('详情');
	modal.find('.expressInfo').css('display', 'none');
	modal.modal('show');
	Common.dataAjax(url, function(data) {

		data.orderExpress = data.orderExpress || {},
			data.latestLottery = data.latestLottery || {};
		data.lotteryReplacement = data.lotteryReplacement || {};
		var productImage = data.latestLottery.productImage || '', //商品图片
			consignee = data.orderExpress.consignee || '', //收货人
			userName = data.latestLottery.userName || '', //中奖者姓名
			userId = data.latestLottery.userId || '', //用户ID
			phone = data.orderExpress.phone || '', //电话
			announcedTime = data.latestLottery.announcedTime || '', //开奖时间
			productPrice = data.latestLottery.productPrice || '', //市场价格
			buyNumberCount = data.latestLottery.buyNumberCount || '', //数量
			productName = data.latestLottery.productName || '', //商品名称
			address = data.orderExpress.address || '', //收货地址
			orderRemarks = data.orderExpress.orderRemarks || '', //订单备注
			productPeriod = data.latestLottery.productPeriod || '', //期号
			deliverNumber = data.latestLottery.deliverNumber || 0, //换货次数
			buyNumberCount = data.latestLottery.buyNumberCount || 0, //购买次数
			randomNumber = data.latestLottery.randomNumber || ''; //幸运编号
		var expressNo = data.orderExpress.expressNo || '', //快递单号
			expressCompany = data.orderExpress.expressCompany || '', //快递公司
			deliverTime = data.orderExpress.deliverTime || '', //发货时间
			postDate = data.orderExpress.postDate || ''; //配送时间
		var reason = data.lotteryReplacement.reason || ''; //换货原因
		var expressCompanyMap = data.expressCompanyMap || '';
		if(expressCompanyMap) {
			$.each(expressCompanyMap, function(i, o) {
				if(o.code == expressCompany) {
					expressCompany = o.value;
				}
			});
		}

		if(Common.oldImage.test(productImage)) {
			productImage = Common.IMAGE_URL + productImage;
		}
		str = '<tr><td class="text-right">收货人</td><td>' + consignee + '</td></tr>' +
			'<tr><td class="text-right">电话</td><td>' + phone + '</td></tr>' +
			'<tr><td class="text-right">中奖者</td><td>' + userName + '</td></tr>' +
			'<tr><td class="text-right">用户ID</td><td>' + userId + '</td></tr>' +
			'<tr><td class="text-right">开奖时间</td><td>' + announcedTime + '</td></tr>' +
			'<tr><td class="text-right">幸运编号</td><td>' + randomNumber + '</td></tr>' +
			'<tr><td class="text-right">期号</td><td>' + productPeriod + '</td></tr>' +
			'<tr><td class="text-right">商品名称</td><td>' + productName + '</td></tr>' +
			'<tr><td class="text-right">市场价格</td><td>' + productPrice + '</td></tr>' +
			'<tr><td class="text-right">数量</td><td>' + buyNumberCount + '</td></tr>' +
			'<tr><td class="text-right">收货地址</td><td>' + address + '</td></tr>' +
			'<tr><td class="text-right">快递单号</td><td>' + expressNo + '</td></tr>' +
			'<tr><td class="text-right">快递公司</td><td>' + expressCompany + '</td></tr>' +
			'<tr><td class="text-right">发货时间</td><td>' + deliverTime + '</td></tr>' +
			'<tr><td class="text-right">配送时间</td><td>' + postDate + '</td></tr>' +
			'<tr><td class="text-right">订单备注</td><td>' + orderRemarks + '</td></tr>' +
			'<tr><td class="text-right">换货次数</td><td>' + deliverNumber + '</td></tr>' +
			'<tr><td class="text-right">换货原因</td><td>' + reason + '</td></tr>' +
			'<tr><td class="text-right">已购买次数</td><td>' + buyNumberCount + '</td></tr>' +
			'<tr><td class="text-right">图片</td><td><img width="80" src="' + productImage + '"></td></tr>';
		tbody.html(str);
	});
}
//导出excel表格
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '换货管理'
	});
}