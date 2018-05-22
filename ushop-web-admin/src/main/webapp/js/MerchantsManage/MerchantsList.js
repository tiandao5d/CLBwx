/**
 * 
 * MerchantsList.js
 * 商家管理-商家列表
 * 作者：xulin
 * 
 * */
//全局数据
var globalData = {};
globalData.searchArr = [{
	value: 'fullName',
	text: '商家名称'
}]
jQuery(function($) {

	//左侧菜单显示
	Common.menuNavContent('商家管理', '商家列表', '夺宝管理后台');

	//全局变量赋值，页面数据初始化完成后执行页面操作
	globalDataFn(function(data) {
		var str = '<option value="">请选择</option>';
		$.each(globalData.searchArr, function(index, obj) {
			str += '<option value="' + obj.value + '">' + obj.text + '</option>';
		});
		$('.adminType').html(str);
		var optionStr = '';
		$.each(globalData.listMerchantInfo, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">全部商家</option>';
			}
			optionStr += '<option value="' + obj.merchantName + '">' + obj.merchantName + '</option>';
		});
		$('.merchantName').html(optionStr);
		//查询按键
		$('.itemSearch').on('click', function(e) {
			onSearch.call(this, e);
		});
		//		$('.searchList').on('click', function(e){
		//			searchListFn.call(this, e);
		//		});

		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		MerchantsListFn('#itemsTable1', '#itemsPager1');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			$(window).trigger('resize.jqGrid');
		});
		$('.nav-tabs li a').on('click', function(e) {
			var statusId = $(this).attr('statusId');
			statusId || (statusId = '');
			var postData = {
				status: statusId
			};
			MerchantsListFn('#itemsTable1', '#itemsPager1', postData);
		});
	});
});

//全局参数请求
function globalDataFn(callback) {
	callback = callback || function() {};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/getConstants';
	Common.dataAjax(_url, function(data, status) {
		if(status == 'success') {
			globalData.merchantTypeList = data.merchantTypeList;
			globalData.MerchantStatusList = data.MerchantStatusList;
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

//查询函数
function onSearch() {
	var me = $(this),
		box = me.parents('.tabPane'),
		searchType = box.find('.searchType').val(),
		merchantName = $.trim(box.find('.merchantName').val()),
		searchKey = box.find('.searchKey').val(),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var status = $('.nav-tabs .active a').attr('href').slice(-1);
	var productStatus;
	switch(status) {
		case '2':
			status = '102';
			break;
		case '3':
			status = '106';
			break;
		case '5':
			status = '103';
			break;
		default:
			status = '';
	}
	var postData = {
		merchantName: merchantName,
		status: status
	}

	MerchantsListFn('#itemsTable1', '#itemsPager1', postData);
}

//搜索列表
//function searchListFn(){
//	var statusId = $(this).attr('statusId'),
//		postData = {
//			status : statusId
//		};
//	MerchantsListFn('#itemsTable1', '#itemsPager1', postData);
//}

//管理员列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    额外参数
//http://10.35.0.66:8080/ushop-web-admin/new/merchant/merchantList
function MerchantsListFn(tableId, pagerId, postData) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/listBy',
		colModel = [{
			label: 'ID',
			name: 'id',
			index: 'id',
			hidden: true
		}, {
			label: '商家名称',
			name: 'merchantName',
			index: 'merchantName',
			width: 120,
			align: 'center'
		}, {
			label: '商家登录名',
			name: 'loginName',
			index: 'loginName',
			width: 120,
			align: 'center'
		}, {
			label: '商家地址',
			name: 'address',
			index: 'address',
			width: 90,
			align: 'center'
		}, {
			label: '联系人',
			name: 'contactName',
			index: 'contactName',
			width: 90,
			align: 'center'
		}, {
			label: '邮箱',
			name: 'contactEmail',
			index: 'contactEmail',
			width: 90,
			align: 'center'
		}, {
			label: '手机',
			name: 'contactPhone',
			index: 'contactPhone',
			width: 90,
			align: 'center'
		}, {
			label: '银行卡号',
			name: 'bankNo',
			index: 'bankNo',
			width: 90,
			align: 'center'
		}, {
			label: '商家状态',
			name: 'status',
			index: 'status',
			width: 90,
			align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				$.each(globalData.MerchantStatusList, function(index, obj) {
					if(cellVal == obj.value) {
						cellVal = obj.desc;
						return false;
					}
				});
				return cellVal;
			}
		}, {
			label: '审核不通过原因',
			name: 'instructions',
			index: 'instructions',
			width: 90,
			align: 'center'
		}, {
			label: '操作',
			name: 'operation',
			index: '',
			align: 'center',
			width: 210,
			fixed: true,
			sortable: false,
			resize: false,
			formatter: function(cellVal, cellData, rowData) {
				var str = '<button rowStr=\'' + JSON.stringify(rowData) + '\' class="btn btn-xs btn-primary" onclick="detailsFn(this, ' + rowData.id + ')">详情</button> ';
				if(rowData.status == '102') {
					str += '<button class="btn btn-xs btn-primary" onclick="passStatus(' + rowData.id + ')">审核通过</button> ';
					str += '<button class="btn btn-xs btn-primary" onclick="notpassStatus(' + rowData.id + ')">审核不通过</button> ';
				}
				return str;
			}
		}];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '商家列表');
}

//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/new/merchant/merchantInfo
function detailsFn(me, id) {
	var modal = $('#detailsModal'),
		tbody = modal.find('tbody'),
		pageModalItem1 = modal.find('.pageModalItem1');
	var dUrl = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/getById?id=' + id;
	Common.dataAjax(dUrl, function(data) {
		var rowData = data.merchantInfo || {},
			merchantFile = data.merchantFile || {};
		var merchantName = rowData.merchantName || '',
			_url = rowData.url || '',
			province = rowData.province || '',
			city = rowData.city || '',
			_area = rowData.area || '',
			address = rowData.address || '',
			contactName = rowData.contactName || '',
			productPeriod = rowData.productPeriod || '',
			contactTel = rowData.contactTel || '',
			contactPhone = rowData.contactPhone || '',
			contactEmail = rowData.contactEmail || '',
			commercialQualityScore = rowData.commercialQualityScore || 0,
			deliveryspeedScore = rowData.deliveryspeedScore || 0,
			merchantServicesScore = rowData.merchantServicesScore || 0,
			bankNo = rowData.bankNo || '',
			tradeLicence = merchantFile.tradeLicence || '',
			cardNegative = merchantFile.cardNegative || '',
			cardPositive = merchantFile.cardPositive || '',
			taxRegisterImage = merchantFile.taxRegisterImage || '',
			orgCodeImage = merchantFile.orgCodeImage || '';
		var str = '';

		//		str = '<tr><td class="text-right">商家名称</td><td>' + merchantName + '</td></tr>'+
		//			  '<tr><td class="text-right">公司网址</td><td>' + _url + '</td></tr>'+
		//			  '<tr><td class="text-right">公司地址</td><td>' + province + city + _area + address + '</td></tr>'+
		//			  '<tr><td class="text-right">联系人姓名</td><td>' + contactName + '</td></tr>'+
		//			  '<tr><td class="text-right">联系人座机</td><td>' + contactTel + '</td></tr>'+
		//			  '<tr><td class="text-right">联系人手机</td><td>' + contactPhone + '</td></tr>'+
		//			  '<tr><td class="text-right">联系人邮箱</td><td>' + contactEmail + '</td></tr>'+
		//			  '<tr><td class="text-right">对公银行卡</td><td>' + bankNo + '</td></tr>'+
		//			  '<tr><td class="text-right">营业执照</td><td><img  src="' + (Common.IMAGE_URL + tradeLicence) + '"></td></tr>',
		//			  '<tr><td class="text-right">营业执照</td><td><img src="' + (Common.IMAGE_URL + tradeLicence) + '"></td></tr>',
		//			  '<tr><td class="text-right">营业执照</td><td><img src="' + (Common.IMAGE_URL + tradeLicence) + '"></td></tr>',
		//			  '<tr><td class="text-right">营业执照</td><td><img src="' + (Common.IMAGE_URL + tradeLicence) + '"></td></tr>';
		//		tbody.html(str);
		if(Common.oldImage.test(tradeLicence)) {
			tradeLicence = Common.IMAGE_URL + tradeLicence;
		}
		if(Common.oldImage.test(cardNegative)) {
			cardNegative = Common.IMAGE_URL + cardNegative;
		}
		if(Common.oldImage.test(cardPositive)) {
			cardPositive = Common.IMAGE_URL + cardPositive;
		}
		if(Common.oldImage.test(taxRegisterImage)) {
			taxRegisterImage = Common.IMAGE_URL + taxRegisterImage;
		}
		if(Common.oldImage.test(orgCodeImage)) {
			orgCodeImage = Common.IMAGE_URL + orgCodeImage;
		}
		str += '<div class="form-horizontal">' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">商家名称</label>' +
			'<div class="col-xs-9">' +
			'<input name="merchantName" value="' + merchantName + '" type="text" readonly="readonly">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">公司网址</label>' +
			'<div class="col-xs-9">' +
			'<input name="corUrl" value="' + _url + '" type="text" readonly="readonly">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">公司地址</label>' +
			'<div class="col-xs-9">' +
			'<input name="corAdress" value="' + province + city + _area + address + '" type="text" readonly="readonly">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">联系人姓名</label>' +
			'<div class="col-xs-9">' +
			'<input name="linkName" value="' + contactName + '" type="text" readonly="readonly">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">联系人座机</label>' +
			'<div class="col-xs-9">' +
			'<input name="contactTel" value="' + contactTel + '" type="text" readonly="readonly">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">联系人手机</label>' +
			'<div class="col-xs-9">' +
			'<input name="contactPhone" value="' + contactPhone + '" type="text" readonly="readonly">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">联系人邮箱</label>' +
			'<div class="col-xs-9">' +
			'<input name="contactEmail" value="' + contactEmail + '" type="text" readonly="readonly">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">对公银行卡</label>' +
			'<div class="col-xs-9">' +
			'<input name="bankNo" value="' + bankNo + '" type="text" readonly="readonly">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">商品质量评分</label>' +
			'<div class="col-xs-9">' +
			'<input name="bankNo" value="' + commercialQualityScore + '" type="text" readonly="readonly">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">发货速度评分</label>' +
			'<div class="col-xs-9">' +
			'<input name="bankNo" value="' + deliveryspeedScore + '" type="text" readonly="readonly">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">商家服务评分</label>' +
			'<div class="col-xs-9">' +
			'<input name="bankNo" value="' + merchantServicesScore + '" type="text" readonly="readonly">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">营业执照</label>' +
			'<div class="col-xs-9">' +
			'<img src="' + tradeLicence + '">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">组织机构</label>' +
			'<div class="col-xs-9">' +
			'<img src="' + orgCodeImage + '">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">税务登记证</label>' +
			'<div class="col-xs-9">' +
			'<img src="' + taxRegisterImage + '">' +
			'</div>' +
			'</div>' +
			'<div class="form-group">' +
			'<label class="col-xs-3 control-label">法人身份证 </label>' +
			'<div class="col-xs-9">' +
			'<img src="' + cardNegative + '">' +
			'<img src="' + cardPositive + '">' +
			'</div>' +
			'</div>' +
			'</div>';
		pageModalItem1.html(str);
		console.log(2)

	});
	modal.modal('show');
}

//审核通过
function passStatus(id) {
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/pass';
	Common.jBoxConfirm('商家审核', '确定要审核通过吗？', function() {
		if(arguments[0] == 1) {
			Common.dataAjaxPost(_url, {
				adminId: id
			}, function(data) {
				var autoClose = 3000,
					position = {
						x: 'center',
						y: 50
					};
				if(data.data == 'SUCCESS') {
					var content = '审核通过',
						color = 'blue';
					Common.jBoxNotice(content, 'green', autoClose, position);
					MerchantsListFn('#itemsTable1', '#itemsPager1');
				} else {
					Common.jBoxNotice('操作失败', 'red', autoClose, position);
				}
			})
		}
	});
}
//审核不通过
function notpassStatus(id) {
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/notpass';
	var title = '商家审核',
		content = '确定该商家审核不通过？';
	Common.jBoxConfirm(title, '<div style="margin-bottom:10px">确定要审核不通过吗？</div><input id="reason" type="text" placeholder="请输入不通过理由"/>', function() {
		if(arguments[0] == 1) {
			var reason = $.trim($('#reason').val());
			if(!reason) {
				Common.jBoxNotice('请填写审核不通过理由', 'red');
				return false;
			}
			if(reason.length > 100) {
				Common.jBoxNotice('审核不通过理由请少于100字', 'red');
				return false;
			}
			Common.dataAjaxPost(_url, {
				adminId: id,
				instructions: reason
			}, function(data, status) {
				//  	console.log(data);
				var autoClose = 3000,
					position = {
						x: 'center',
						y: 50
					};
				if(data.data == 'SUCCESS') {
					var content = '操作成功',
						color = 'blue';
					Common.jBoxNotice(content, 'green', autoClose, position);
					MerchantsListFn('#itemsTable1', '#itemsPager1');
				} else {
					Common.jBoxNotice('操作失败', 'red', autoClose, position);
				}
			});
		}
	});

}
//导出excel表格
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '商家列表'
	});
}