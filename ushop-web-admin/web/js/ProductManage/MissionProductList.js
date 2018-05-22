/**
 * 
 * productList.js
 * 用户管理-用户列表
 * 作者：roland
 * 
 * */
"use strict";
//硬性数据
var globalData = {};
globalData.productStatus = '';
globalData.productType = 2;
globalData.regFloatNumber = /^\d*(\.\d{0,2})?$/;
globalData.provinceList = [{
	desc: '全国',
	value: '0'
}, {
	desc: '北京市',
	value: 11
}, {
	desc: '天津市',
	value: 12
}, {
	desc: '河北省',
	value: 13
}, {
	desc: '山西省',
	value: 14
}, {
	desc: '内蒙古自治区',
	value: 15
}, {
	desc: '辽宁省',
	value: 21
}, {
	desc: '吉林省',
	value: 22
}, {
	desc: '黑龙江省',
	value: 23
}, {
	desc: '上海市',
	value: 31
}, {
	desc: '江苏省',
	value: 32
}, {
	desc: '浙江省',
	value: 33
}, {
	desc: '安徽省',
	value: 34
}, {
	desc: '福建省',
	value: 35
}, {
	desc: '江西省',
	value: 36
}, {
	desc: '山东省',
	value: 37
}, {
	desc: '河南省',
	value: 41
}, {
	desc: '湖北省',
	value: 42
}, {
	desc: '湖南省',
	value: 43
}, {
	desc: '广东省',
	value: 44
}, {
	desc: '广西壮族自治区',
	value: 45
}, {
	desc: '海南省',
	value: 46
}, {
	desc: '重庆市',
	value: 50
}, {
	desc: '四川省',
	value: 51
}, {
	desc: '贵州省',
	value: 52
}, {
	desc: '云南省',
	value: 53
}, {
	desc: '西藏自治区',
	value: 54
}, {
	desc: '陕西省',
	value: 61
}, {
	desc: '甘肃省',
	value: 62
}, {
	desc: '青海省',
	value: 63
}, {
	desc: '宁夏回族自治区',
	value: 64
}, {
	desc: '新疆维吾尔自治区',
	value: 65
}];
//globalData.fundTypeList = [{
//	desc: '现金',
//	value: 999
//}, {
//	desc: '全国积分',
//	value: 1001
//}];
var oldVal = {};
var modal = $('#pageModal'),
	missionAdd = $('.missionAdd'),
	editPay = $('.editPay'),
	productBox = $('#productBox'),
	missionBox = $('#missionBox'),
	productInfo = $('#productInfo'),
	pageModalTitle = $('#pageModalTitle'),
	pageModalItem1 = $('.pageModalItem1'),
	pageModalItem2 = $('.pageModalItem2'),
	pageModalItem3 = $('.pageModalItem3'),
	nthUseBtn = $('#nthUseBtn'),
	missionProductTab = $('#missionProductTab'),
	determineClick = $('#determineClick'),
	editPayClick = $('#editPayClick'),
	addPayClick = $('#addPayClick');

jQuery(function($) {
	var optionStr = '';
	//菜单面包屑导航等配置显示
	Common.menuNavContent('商品管理', '活动列表', '夺宝管理后台');
	jeDate({
		dateCell: "#pageModal .start",
		format: "YYYY-MM-DD hh:mm",
		isTime: true //isClear:false,
	});
	jeDate({
		dateCell: "#pageModal .end",
		format: "YYYY-MM-DD hh:mm",
		isTime: true //isClear:false,
	});
	jeDate({
		dateCell: "#pageModal .deadline",
		format: "YYYY-MM-DD hh:mm",
		isTime: true //isClear:false,
	});
	globalData.menuTitile = $('#menuPageHeader h1').html();
	globalData.menuTitileDetail = globalData.menuTitile + '<small><i class="ace-icon fa fa-angle-double-right"></i>商品详情</small>';
	//全局变量赋值，页面数据初始化完成后执行页面操作
	globalDataFn(function(data) {
		//查询按键
		$('.item1Search').on('click', function(e) {
			onSearch1.call(this, e);
		});
		$('.item2Search').on('click', function(e) {
			onSearch2.call(this, e);
		});
		$.each(globalData.productActivityStatusList, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.missionStatus').html(optionStr);
		optionStr = '';
		$.each(globalData.listMerchantInfo, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">全部商家</option>';
			}
			optionStr += '<option value="' + obj.merchantNo + '">' + obj.merchantName + '</option>';
		});
		$('.merchantName').html(optionStr);
		optionStr = '';
		$.each(globalData.typeList, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.productType').html(optionStr);
		optionStr = '';
		$.each(globalData.bandList, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.productBrand').html(optionStr);
		optionStr = '';
		$.each(globalData.productActivityTypeList, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.ActivityType').html(optionStr);
		optionStr = '';
		$.each(globalData.provinceList, function(index, obj) {
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.province').html(optionStr);
		optionStr = '';
		$.each(globalData.fundTypeList, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">积分类型</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.fund').html(optionStr);
		$(window).trigger('resize.jqGrid');
		missionBox.addClass('blocked');
		MissionList('#itemsTable1', '#itemsPager1')
			//		$('#productBox').addClass('blocked');
			//		//标签页显示事件
			//		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
			//		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
			//		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			//			$(window).trigger('resize.jqGrid');
			//		});
			//用户数据列表显示
			//		ProductList('#itemsTable2', '#itemsPager2');

		//点击添加用户列表事件绑定
		$('.itemAdd').on('click', function() {
			pageModalFn('', 'add');
		});
		$('.nav-tabs li a').on('click', function(e) {
			var target = e.target;
			var status = target.href.slice(-1);
			var productStatus = '';
			switch(status) {
				case '1':
					productStatus = '3';
					break;
				case '2':
					productStatus = '7';
					break;
				case '3':
					productStatus = '4';
					break;
			}
			var postData = {
				productStatus: productStatus,
				activityId: globalData.activityId
			};
			ProductList('#itemsTable2', '#itemsPager2', postData);
		});
		//用户列表编辑点击确定事件绑定
		determineClick.on('click', determineClickFn);
		missionAdd.on('click', missionAddFn);
		$('.item1Search').on('click', function(e) {
			onSearch1.call(this, e);
		});
		$('.item2Search').on('click', function(e) {
			onSearch2.call(this, e);
		});
	});

});

//全局参数请求
function globalDataFn(callback) {
	callback = callback || function() {};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/activity/getConstants';
	Common.dataAjax(_url, function(data, status) {
		if(status == 'success') {
			if(!data.error_description) {
				globalData.productActivityStatusList = data.productActivityStatusList;
				globalData.productActivityTypeList = data.productActivityTypeList;
				var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/getConstants';
				Common.dataAjax(_url, function(data, status) {
					if(status == 'success') {
						//			globalData.bandList = data.bandList;
						globalData.productStatusList = data.productStatusList;

						var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/list';
						Common.dataAjax(_url, function(data, status) {
							if(status == 'success') {
								globalData.listMerchantInfo = data.recordList;
								var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/type/getMap';
								Common.dataAjax(_url, function(data, status) {
									if(status == 'success') {
										globalData.typeList = data.typeMap;
										var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/brand/getMap';
										Common.dataAjax(_url, function(data, status) {
											if(status == 'success') {
												globalData.bandList = data.bandMap;
												var _url = Common.DOMAIN_NAME + '/ushop-web-admin/account/fundType/list';
												Common.dataAjax(_url, function(data, status) {
													if(status == 'success') {
														globalData.fundTypeList = data.recordList;
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
					} else {
						Common.jBoxNotice('数据请求错误', 'red');
						callback.call(this, data);
					}
				});
			} else {
				Common.jBoxNotice('数据请求错误', 'red');
				callback.call(this, data);
			}
		} else {
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
}

//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/new/banner/bannerList
function onSearch1() {
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		name = $.trim(box.find('[name="missionName"]').val()),
		status = $.trim(box.find('[name="missionStatus"]').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		name: name,
		status: status
	};
	console.log(status);
	MissionList('#itemsTable1', '#itemsPager1', postData);
}

function onSearch2() {
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		merchantName = $.trim(box.find('[name="merchantName"]').val()),
		productName = $.trim(box.find('[name="productName"]').val()),
		productType = $.trim(box.find('.productType').val()),
		productBrand = $.trim(box.find('.productBrand').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var status = $('.nav-tabs .active a').attr('href').slice(-1);
	var productStatus;
	switch(status) {
		case '1':
			productStatus = '7';
			break; //已审核
		case '2':
			productStatus = '3';
			break; //
		case '3':
			productStatus = '4';
			break; //审核不通过
		default:
			productStatus = '7';
	}
	var postData = {
		merchantNo: merchantName,
		productName: productName,
		productType: productType,
		activityId: globalData.activityId,
		productStatus: productStatus
	};
	ProductList('#itemsTable2', '#itemsPager2', postData);
}

//活动列表
function MissionList(tableId, pagerId, postData, reload) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/product/activity/listBy',
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{
				label: '活动ID',
				name: 'id',
				index: 'id',
				width: 40,
				align: 'center'
			}, {
				label: '活动名称',
				name: 'name',
				index: 'name',
				width: 160,
				align: 'center'
			}, {
				label: '开始时间',
				name: 'beginTime',
				index: 'beginTime',
				width: 120,
				align: 'center'
			}, {
				label: '结束时间',
				name: 'endTime',
				index: 'endTime',
				width: 120,
				align: 'center'
			}, {
				label: '报名截止',
				name: 'deadline',
				index: 'deadline',
				width: 120,
				align: 'center'
			}, {
				label: '个人报名上限',
				name: 'upperLimit',
				index: 'upperLimit',
				width: 100,
				align: 'center'
			}, {
				label: '活动状态',
				name: 'status',
				index: 'status',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					var str = '';
					switch(cellVal) {
						case 1:
							str = '报名中';
							break;
						case 2:
							str = '未开始';
							break;
						case 3:
							str = '进行中';
							break;
						case 4:
							str = '已结束';
							break;
					}
					return str;
				}

			}, {
				label: '操作',
				name: 'operation',
				index: '',
				width: 180,
				fixed: true,
				align: 'center',
				formatter: function(val, cellval, colpos, rwdat) {
					var beginTime = new Date(colpos.beginTime).getTime(),
						endTime = new Date(colpos.endTime).getTime(),
						deadline = new Date(colpos.deadline).getTime();
					var now = new Date().getTime();
					var str = '<button class="btn btn-xs btn-primary" onclick="missionInfo(' + colpos.id + ',\'watch\' ' + ')">查看</button> ';
					str += '<button class="btn btn-xs btn-primary" onclick="missionInfo(' + colpos.id + ',\'watchJoin\',\'' + colpos.name + '\')">查看报名</button> ';
					if(!(beginTime < now && now < endTime)) {
						str += '<button class="btn btn-xs btn-primary" onclick="missionInfo(' + colpos.id + ',\'delete\' ' + ')">删除</button> ';
					}
					return str;
				}
			}
		];

	productBox.addClass('hide');
	missionBox.removeClass('hide');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '活动列表');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	determineClick.addClass('hide');
}

//活动商品列表
function ProductList(tableId, pagerId, postData, reload) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/product/list',
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{
				label: '商家ID',
				name: 'merchantId',
				index: 'merchantId',
				width: 160,
				align: 'center'
			}, {
				label: '商家名称',
				name: 'merchantName',
				index: 'merchantName',
				width: 160,
				align: 'center'
			}, {
				label: '商品ID',
				name: 'id',
				index: 'id',
				width: 100,
				align: 'center'
			}, {
				label: '商品名称',
				name: 'productName',
				index: 'productName',
				width: 160,
				align: 'center'
			}, {
				label: '商品原价',
				name: 'productPrice',
				index: 'productPrice',
				width: 100,
				align: 'center'
			}, {
				label: '活动价',
				name: 'rule',
				index: 'rule',
				width: 100,
				align: 'center',
				formatter: function(val) {
					if(val.indexOf('{') > -1) {
						var rule = JSON.parse(val);
						if(rule && rule[0] && rule[0].currencys[0]) {
							return rule[0].currencys[0].value
						}
					} else {
						return ''
					}
				}
			}, {
				label: '库存数',
				name: 'stock',
				index: 'stock',
				width: 100,
				align: 'center'
			}, {
				label: '商品图片',
				name: 'headImage',
				index: 'headImage',
				width: 120,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					if(Common.oldImage.test(cellVal)) {
						var str = '<img width="100" src="' + (Common.IMAGE_URL + cellVal) + '">'
					} else {
						var str = '<img width="100" src="' + cellVal + '">'
					}
					return str;
				}
			}, {
				label: '商品类型',
				name: 'productType',
				index: 'productType',
				width: 120,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.typeList, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}

					});
					return cellVal;
				}
			}, {
				label: '商品品牌',
				name: 'productBrand',
				index: 'productBrand',
				width: 60,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.bandList, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
						if(!cellVal) {
							cellVal = '';
							return false;
						}
					});
					return cellVal;
				}
			}, {
				label: '所属状态',
				name: 'status',
				index: 'status',
				width: 60,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.productStatusList, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}

					});
					return cellVal;
				}
			}, {
				label: '操作',
				name: 'operation',
				index: '',
				width: 180,
				fixed: true,
				align: 'center',
				formatter: function(val, cellval, colpos, rwdat) {
					var str = '<button class="btn btn-xs btn-primary" onclick="productInfoFn(' + colpos.id + ',\'watch\' ' + ')">查看</button> ';
					if(colpos.status == 7) {
						str += '<button class="btn btn-xs btn-primary" onclick="unAuditedProduct(' + colpos.id + ',\'unselled\' ' + ')">强制下架</button> ';
					} else if(colpos.status == 2) {
						str += '<button class="btn btn-xs btn-primary" onclick="unAuditedProduct(' + colpos.id + ',\'unselled\' ' + ')">强制下架</button> ';
					} else if(colpos.status == 3) {
						str += '<button class="btn btn-xs btn-primary" onclick="productInfoFn(' + colpos.id + ',\'edit\' ' + ')">审核</button> ';
						str += '<button rowStr=\'' + JSON.stringify(colpos.rule) + '\' class="btn btn-xs btn-primary" onclick="unAuditedProduct(' + colpos.id + ',\'notpass\',this)">不通过</button> ';
					} else if(colpos.status == 4) {
						str += '<button class="btn btn-xs btn-primary" onclick="getReason(' + colpos.instructionp + ')">查看原因</button> ';
					}
					return str;
				}
			}

		];
	if(!postData) {
		var postData = {
			productStatus: 7
		}
	}
	productBox.removeClass('hide');
	missionBox.addClass('hide');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '活动商品列表');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	determineClick.addClass('hide');
}

function formatterTime(val) {
	var createTime = new Date(val);
	var year = createTime.getFullYear(),
		month = parseInt(createTime.getMonth()) + 1,
		day = createTime.getDate(),
		hour = createTime.getHours(),
		minute = createTime.getMinutes(),
		second = createTime.getSeconds();
	return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
}
//新增活动
function determineClickFn() {
	var _param = {
		type: pageModalItem1.find('.ActivityType').val(),
		name: pageModalItem1.find('[name=name]').val(),
		beginTime: pageModalItem1.find('[name=beginTime]').val(),
		endTime: pageModalItem1.find('[name=endTime]').val(),
		deadline: pageModalItem1.find('[name=deadline]').val(),
		upperLimit: pageModalItem1.find('[name=upperLimit]').val(),
		province: pageModalItem1.find('.province').val(),
		fundType: pageModalItem1.find('.fund').val()
	}

	if(!_param.type) {
		Common.jBoxNotice('请选择所属活动', 'red');
		return false
	}
	if(!_param.name) {
		Common.jBoxNotice('请输入活动名称', 'red');
		return false
	}
	if(_param.name.length > 10) {
		Common.jBoxNotice('活动名称少于10个字', 'red');
		return false
	}
	if(!_param.beginTime) {
		Common.jBoxNotice('请选择活动开始时间', 'red');
		return false
	}
	if(!_param.endTime) {
		Common.jBoxNotice('请选择活动结束时间', 'red');
		return false
	}
	if(new Date(_param.endTime).getTime() <= new Date(_param.beginTime).getTime()) {
		Common.jBoxNotice('活动结束时间要大于活动开始时间', 'red');
		return false;
	}
	if(!_param.deadline) {
		Common.jBoxNotice('请选择报名截止时间', 'red');
		return false
	}
	if(new Date(_param.beginTime).getTime() <= new Date(_param.deadline).getTime()) {
		Common.jBoxNotice('活动开始时间要大于报名截止时间', 'red');
		return false;
	}
	if(!_param.upperLimit || !/^\d+$/.test(_param.upperLimit) || _param.upperLimit < 1) {
		Common.jBoxNotice('报名上线次数为正整数', 'red');
		return false
	}
	if(_param.upperLimit > 999) {
		Common.jBoxNotice('报名上线次数请少于1000次（不含1000次）', 'red');
		return false
	}
	_param.beginTime = _param.beginTime + ':00';
	_param.endTime = _param.endTime + ':00';
	_param.deadline = _param.deadline + ':00';
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/activity/add';
	Common.dataAjaxPost(_url, _param, function(data) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice('新增成功', 'green');
			modal.find('input').val('');
			modal.find('select').val('');
			modal.modal('hide');
			MissionList('#itemsTable1', '#itemsPager1')
		} else {
			Common.jBoxNotice('新增失败', 'red');
			return false
		}
	});
}
//商品详情
function productInfoFn(id, typeName) {

	$('#menuPageHeader h1').html(globalData.menuTitileDetail);
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/getById?id=' + id;
	Common.dataAjax(_url, function(data) {
		//	   var productInfo = $('#productInfo');
		data.product = data.product || {};
		var productName = data.product.productName || '',
			productTitle = data.product.productTitle || '',
			productRealPrice = data.product.productRealPrice || '',
			productPrice = data.product.productPrice || '',
			singlePrice = data.product.singlePrice || '',
			spellbuyCount = data.product.spellbuyCount || '',
			winner = data.product.winner || '',
			productStyle = data.product.style || '',
			productType = data.product.productType || '',
			productDetails = data.product.productDetails || '',
			productBrand = data.product.productBrand || '',
			rule = data.product.rule,
			headImage = data.product.headImage,
			productLimit = data.product.productLimit || 0,
			stock = data.product.stock || 0;
		var scrollImage = '';
		var bigImage = '';
		/*if(rule){	   		
		   	var a = rule.split(',');
		   if(a[5]){
		   		$('#buyStyleHide').removeClass('hide');
		   		var b = a[5].split(':');
		   		var c = b[1].split('}');
		   		$('#systemPrice').val(c[0]);
		   		b = a[7].split(':');
		   		c = b[1].split('}');
		   		$('#systemPoint').val(c[0]);
		   }
	   	}*/
		if(rule.indexOf('{') > -1) {
			rule = JSON.parse(rule);
			if(rule && rule[0] && rule[0].currencys[0]) {
				productRealPrice = rule[0].currencys[0].value
			}
			/*$('#buyStyleHide').removeClass('hide');
			$('#systemPrice').val(c[0]);
			$('#systemPoint').val(c[0]);*/
		}
		productInfo.find('[name=productName]').val(productName).attr('readonly', 'true');
		productInfo.find('[name=productTitle]').val(productTitle).attr('readonly', 'true');
		productInfo.find('[name=productRealPrice]').val(productRealPrice).attr('readonly', 'true');
		productInfo.find('[name=amountOfMoney]').val(productRealPrice).attr('readonly', 'true');
		productInfo.find('[name=productPrice]').val(productPrice).attr('readonly', 'true');
		productInfo.find('[name=productLimit]').val(productLimit).attr('readonly', 'true');
		productInfo.find('[name=singlePrice]').val(singlePrice).attr('readonly', 'true');
		productInfo.find('[name=spellbuyCount]').val(spellbuyCount).attr('readonly', 'true');
		productInfo.find('[name=winner]').val(winner).attr('readonly', 'true');
		productInfo.find('[name=stock]').val(stock).attr('readonly', 'true');
		productInfo.find('[name=productStyle]').val(productStyle).attr('readonly', 'true');
		productInfo.find('.productType').val(productType);
		productInfo.find('.productBrand').val(productBrand);
		if(Common.oldImage.test(headImage)) {
			headImage = Common.IMAGE_URL + headImage;
		}
		var headImg = '<img src="' + headImage + '"alt="缩略图" style="width:54px">';
		$.each(data.productImgList, function(index, obj) {
			if(obj.imageType == 1) {
				if(Common.oldImage.test(obj.imagePath)) {
					obj.imagePath = Common.IMAGE_URL + obj.imagePath;
				}
				scrollImage += '<img src="' + obj.imagePath + '"alt="缩略图" style="width:54px">';
			} else if(obj.imageType == 2) {
				if(Common.oldImage.test(obj.imagePath)) {
					obj.imagePath = Common.IMAGE_URL + obj.imagePath;
				}
				bigImage += '<img src="' + obj.imagePath + '"alt="缩略图">';
			}
		});
		productInfo.find('.imgShow').html('');
		productInfo.find('.scrollImageShow').html('');
		productInfo.find('.bigImageShow').html('');
		productInfo.find('.imgShow').append(headImg);
		productInfo.find('.scrollImageShow').append(scrollImage);
		productInfo.find('.bigImageShow').append(bigImage);
		productInfo.find('.productDetails').html(productDetails);
		$('.row').addClass('hide');
		productInfo.removeClass('hide');
		if(typeName == 'edit') {
			$('#buyStyleHide').removeClass('hide');
			$('#submit').removeClass('hide').unbind('click').click(function() {
				var rule = [];

				//				var currency = [];
				//				$('.pageModalItem3').find('.modalPay').each(function(index, me) {
				//					currency[currency.length] = {
				//						'type': parseInt(($(me).find('.fundType').val())),
				//						'value': parseFloat(($(me).find('.money').val()))
				//					}
				//				});
				//         var currency = [];
				//                $(me).find(".watchMoney").each(function(index, me) {
				//				  currency[currency.length] = {
				//					'type': parseInt(($(me).find('.modeOfPayment').val())),
				//					'value': parseFloat(($(me).find('.amountOfMoney').val()))
				//				    }
				//			});

				productInfo.find('.buyStyleHide').each(function(index, me) {
					var currency = [];

					$(me).find(".watchMoney").each(function(i, ele) {
						var modeOfPayment = $(ele).find('.modeOfPayment').val()
						$.each(globalData.fundTypeList, function(j, obj) {
							if(modeOfPayment == obj.desc) {
								modeOfPayment = obj.value
							}
						});
						currency[currency.length] = {
							'type': parseInt(modeOfPayment),
							'value': parseFloat($(ele).find('.amountOfMoney').val())
						}

					});

					rule.push({
						'currencys': currency,
						'flag': 0
					});
					rule[0].flag = 1;
				});
				rule = JSON.stringify(rule);
				console.log(rule);
				var _param = {
					id: id,
					rule: rule,
					productPrice: data.product.productPrice,
					productRealPrice: data.product.productRealPrice
				};
				globalData._param = _param;
				AuditedProduct(_param);
				//     	    	Common.jBoxConfirm('商品审核','确定要审核通过吗？',function(){
				//	    			if(arguments[0] == 1){
				//		       	    	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/new/product/auditProductToSell';
				//		       	    	var productPrice = productInfo.find('[name=productPrice]').val();
				//		       	    	Common.dataAjaxPost(_url, _param, function(data){
				//							if(data.data == 'SUCCESS'){
				//								Common.jBoxNotice( '商品上架成功', 'green');
				//								$('#submit').css('display','none');
				//								goBack();
				////								var postData = {
				////									productStatus:3
				////								}
				//								$('#buyStyleHide').addClass('hide');
				//								ProductCheck('#itemsTable1', '#itemsPager1',postData);
				//							}else if(data.error){
				//								Common.jBoxNotice('商品上架失败,'+ data.error_description, 'red');
				//							}else{
				//								Common.jBoxNotice('商品上架失败，请稍后重试', 'red');
				//							}
				//				       	});
				//				    }
				//	    		});
			});
		}
	});
}

function missionAddFn() {
	modal.modal('show');
	pageModalTitle.html('新增活动');
	pageModalItem1.find('input').val('');
	pageModalItem1.find('select').val('');
	pageModalItem1.removeClass('hide');
	pageModalItem2.addClass('hide');
	pageModalItem3.addClass('hide');
	determineClick.removeClass('hide');
	editPayClick.addClass('hide');
	addPayClick.addClass('hide');
	nthUseBtn.addClass('hide');
	pageModalItem1.find('.fundd').addClass('hide');
	pageModalItem1.find('.ActivityType').on('change', function(e) {
		var typeId = pageModalItem1.find('.ActivityType').val();
		console.log(typeId);
		if(typeId == 2) {
			pageModalItem1.find('.fundd').removeClass('hide');
		} else {
			pageModalItem1.find('.fundd').addClass('hide');
		}
	});
}

//查看下架原因
function getReason(reason) {
	modal.modal('show');
	pageModalItem1.addClass('hide');
	pageModalItem2.removeClass('hide');
	determineClick.addClass('hide');
	nthUseBtn.removeClass('hide');
	pageModalTitle.html('查看原因');
	pageModalItem2.find('.reason').val(reason);
}
//活动操作
function missionInfo(id, type, activeName) {
	var _url = '';
	if(!id) {
		Common.jBoxNotice('数据请求错误，请刷新后重试', 'red');
		return false;
	}
	globalData.activityId = id;
	if(type == 'delete') {
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/product/activity/deleteById';
		Common.jBoxConfirm('确认信息', '您确定要删除此任务吗？', function(index) {
			if(index == 1) {
				Common.dataAjaxPost(_url, {
					id: id
				}, function(ret, status) {
					if(status == 'success') {
						if(ret.data == 'SUCCESS') {
							Common.jBoxNotice('删除成功', 'green');
							MissionList('#itemsTable1', '#itemsPager1');
						} else {
							Common.jBoxNotice('删除失败', 'red');
						}
					} else {
						Common.jBoxNotice('服务器请求失败', 'red');
					}
				});
			}
		});
	} else if(type == 'watch') {
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/product/activity/getById?id=' + id;
		Common.dataAjax(_url, function(data) {
			if(data.error_description) {
				Common.jBoxNotice('查看失败，请重试');
				return false;
			} else {
				$.each(data.productActivity, function(key, val) {
					if(pageModalItem1.find('[name=' + key + ']').length > 0) {
						pageModalItem1.find('[name=' + key + ']').val(val);
					}
				});
				modal.modal('show');
				pageModalItem1.find('.ActivityType').on('change', function(e) {
					var typeId = pageModalItem1.find('.ActivityType').val();
					console.log(typeId);
					if(typeId == 2) {
						pageModalItem1.find('.fundd').removeClass('hide');
					} else {
						pageModalItem1.find('.fundd').addClass('hide');
					}
				});
				if(data.productActivity.type == 2) {
						pageModalItem1.find('.fundd').removeClass('hide');
					} else {
						pageModalItem1.find('.fundd').addClass('hide');
					}
				pageModalTitle.html('查看活动');
				pageModalItem1.removeClass('hide');
				determineClick.addClass('hide');
				nthUseBtn.removeClass('hide');
			}
		})
	} else if(type == 'watchJoin') {
		productBox.addClass('blocked');
		missionProductTab.removeClass('hide').find('li.active').removeClass('active');
		missionProductTab.find('li.firstLi').addClass('active');
		productBox.find('[name=activeName]').val(activeName);
		var postData = {
				productStatus: 3,
				activityId: globalData.activityId
			}
			//		$('.firstLi').addClass
		ProductList('#itemsTable2', '#itemsPager2', postData);
	}
}
//强制下架
function unAuditedProduct(id, type, me) {
	var msg = '',
		_url = '';
	var param = {
		id: id
	}
	if(me) {
		var rowStr = JSON.parse($(me).attr('rowStr'));
		var rule = rowStr.slice(1, rowStr.length - 1);
		if(rule.indexOf('{') > -1) {
			param.rule = rule;
		}
	}
	if(type == 'unselled') {
		msg = '强制下架';
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/product/forcedOff';
	} else {
		msg = '审核不通过';
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/product/unAuditedProduct';
	}
	Common.jBoxConfirm(msg, '<div style="margin-bottom:10px">确定' + msg + '吗？</div><input id="reason" type="text" placeholder="请输入' + msg + '理由"/>', function() {
		if(arguments[0] == 1) {

			var reason = $.trim($('#reason').val());
			if(!reason) {
				Common.jBoxNotice('请填写下架理由', 'red');
				return false;
			}
			if(reason.length > 100) {
				Common.jBoxNotice('下架理由请少于100字', 'red');
				return false;
			}
			param.instructionp = reason;
			Common.dataAjaxPost(_url, param, function(data) {
				if(data.data == 'SUCCESS') {
					Common.jBoxNotice('商品' + msg + '成功', 'green');
					var postData = {
						productStatus: 7,
						activityId: globalData.activityId
					};
					ProductList('#itemsTable2', '#itemsPager2', postData);
				} else if(data.error) {
					Common.jBoxNotice('操作失败,' + data.error_description, 'red');
				} else {
					Common.jBoxNotice('操作失败，请稍后重试', 'red');
				}
			});
		}
	});
}

//审核通过
function AuditedProduct(_param) {
	Common.jBoxConfirm('商品审核通过', '<div style="margin-bottom:10px">确定商品审核通过吗？</div>', function(index) {
		if(index == 1) {
			var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/auditProduct';
			Common.dataAjaxPost(_url, _param, function(data) {
				if(data.data == 'SUCCESS') {
					Common.jBoxNotice('商品审核通过成功', 'green');
					var postData = {
						productStatus: 3,
						activityId: globalData.activityId
					};
					goBack()
					ProductList('#itemsTable2', '#itemsPager2', postData);
				} else if(data.error) {
					Common.jBoxNotice('操作失败,' + data.error_description, 'red');
				} else {
					Common.jBoxNotice('操作失败，请稍后重试', 'red');
				}
			});
		}
	});
}

function goBack() {
	$('#menuPageHeader h1').html(globalData.menuTitile);
	productInfo.addClass('hide');
	$('.row').removeClass('hide');
	$('#buyStyleHide').addClass('hide');
}

function goBackTo() {
	productBox.addClass('hide');
	missionProductTab.addClass('hide');
	missionBox.removeClass('hide');
}
//导出excel表格
function toExcel(n) {
	var param = {
		type: 'excel',
		escape: 'false'
	}
	switch(n) {
		case 1:
			param.fileName = '活动';
			param.aId = 'exportExcel1';
			break;
		case 2:
			param.fileName = '活动商品';
			param.aId = 'exportExcel2';
			break;
	}
	$('#gview_itemsTable' + n).tableExport(param);
}
//文本输入限制两位小数
function limitNum(e) {
	var id = $(e).attr('id');
	var newVal = $('#' + id).val();
	if(globalData.regFloatNumber.test(newVal) || !newVal) {
		oldVal[id] = newVal;
	} else {
		$('#' + id).val(oldVal[id] || '');
	}
}
//支付类型请求
getFundTypeFn(function(fundTypeList) {
	var optionStr = '';
	fundTypeList = fundTypeList || []
	$.each(fundTypeList, function(index, obj) {
		if(index == 0) {
			optionStr += '<option value="">价格类型</option>';
		}
		optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
	});
	$('.fundType').html(optionStr);

});

function getFundTypeFn(callback) {
	var _fundUrl = Common.DOMAIN_NAME + '/ushop-web-admin/account/fundType/list';
	callback = callback || function() {};
	var fundTypeList = globalData.fundTypeList;
	if(fundTypeList) {
		callback(fundTypeList);
		return fundTypeList;
	} else {
		Common.dataAjax(_fundUrl, function(data, status) {
			if(status == 'success') {
				if(!data.error_description) {
					globalData.fundTypeList = data.recordList;
					callback(data.fundTypeList);
				} else {
					Common.jBoxNotice('数据请求错误', 'red');
				}
			} else {
				Common.jBoxNotice('数据请求错误', 'red');
			}
		});
	}
}
//支付方式编辑弹窗
function editPayFn(event) {
	globalData.ipttarget = $(event.target);
	modal.modal('show');
	pageModalTitle.html('支付方式编辑');
	pageModalItem1.addClass('hide');
	pageModalItem2.addClass('hide');
	pageModalItem3.removeClass('hide');
	determineClick.addClass('hide');
	editPayClick.removeClass('hide');
	addPayClick.addClass('hide');
	nthUseBtn.addClass('hide');
	var payInfo = [];

	var watchMoney = globalData.ipttarget.parent().parent().find(".watchMoney")
	watchMoney.each(function() {
		payInfo[payInfo.length] = {
			modeOfPayment: $(this).find(".modeOfPayment").val(),
			amountOfMoney: $(this).find(".amountOfMoney").val()
		}
	});
	var str = '',
		btnstr;
	for(var i = 0; i < payInfo.length; i++) {
		if(i == 0) {
			btnstr = '<div class="col-xs-3"><input type="button" value="+" onclick="addPayFn()" class="form-control btn" style="width: 60px; outline: none;"></div>';
		} else {
			btnstr = '<div class="col-xs-3"><input type="button" value="-" onclick="deletePayFn(this)" class="form-control btn" style="width: 60px; outline: none;"></div>';
		}
		str +=
			'<div class="form-group modalPay">' +
			'<label class="col-xs-3 control-label">价格类型</label>' +
			'<div class="col-xs-6 editMoney">' +
			'<select class="form-control fundType" name="fundType"  style="width: 190px;display: inline-block;margin-right:10px;">' + returnOptionStr(payInfo[i].modeOfPayment) + '</select>' +
			'<input type="number" name="money" value="' + payInfo[i].amountOfMoney + '" class="from-control money" onkeyup="limitNum(this)" style="width: 60px;height: 34px; outline: none;">' +
			'</div>' +
			btnstr +
			'</div>';
	}
	$('#modalPayTypeStr').html(str);
	//pageModalItem3.find('[name=fundType]').val(globalData.payInfo.modeOfPayment).attr('true');
	//pageModalItem3.find('[name=money]').val(globalData.payInfo.amountOfMoney).attr('true');

}
//编辑select值
function returnOptionStr(modeOfPayment) {
	var optionStr = '';
	$.each(globalData.fundTypeList, function(index, obj) {
		if(modeOfPayment == obj.desc) {
			optionStr += '<option selected value="' + obj.value + '">' + obj.desc + '</option>';
		} else {
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		}
	})
	return optionStr;
}
//页面显示fundType值
function optionStrFn(fundeType) {
	var optionStr = '';
	$.each(globalData.fundTypeList, function(index, obj) {
		if(fundeType == obj.value) {
			optionStr += obj.desc
		}
	})
	return optionStr;
}

//新增支付方式弹窗
function addbuyStyleFn() {
	modal.modal('show');
	pageModalTitle.html('支付方式新增');
	pageModalItem1.addClass('hide');
	pageModalItem2.addClass('hide');
	pageModalItem3.removeClass('hide');
	determineClick.addClass('hide');
	editPayClick.addClass('hide');
	addPayClick.removeClass('hide');
	nthUseBtn.addClass('hide');
	$(".modalPay").nextAll(".modalPay").remove();

}
//添加支付方式组合
function addPayFn() {
	var str = '<div class="form-group modalPay">' +
		'<label class="col-xs-3 control-label">价格类型</label>' +
		'<div class="col-xs-6">' +
		'<select class="form-control fundType" name="fundType"  style="width: 190px;display: inline-block;margin-right:10px;">' + returnOptionStr() + '</select>' +
		'<input type="number" name="money"  class="from-control money" onkeyup="limitNum(this)" style="width: 60px;height: 34px; outline: none;">' +
		'</div>' + '<div class="col-xs-3"><input type="button" value="-" onclick="deletePayFn(this)"  class="form-control btn" style="width: 60px; outline: none;"></div>'
	'</div>';
	$('#modalPayTypeStr').append(str);

}
//删除支付方式组合
function deletePayFn(obj) {
	$(obj).parent().parent().remove();
	addNum();
}
//保存支付方式组合

function savePayStyleFn() {
	var savePay = [],
		str = '';

	$(".modalPay").each(function() {
		savePay[savePay.length] = {
			fundeType: $(this).find(".fundType").val(),
			money: $(this).find(".money").val()
		}
	});

	for(var i = 0; i < savePay.length; i++) {
		str +=
			'<div style="margin-bottom:10px" class="watchMoney">' +
			'<input type="text" value="' + optionStrFn(savePay[i].fundeType) + '" readonly="" class="modeOfPayment" style="margin:0 10px 0 0;"/>' +
			'<input type="text" value="' + savePay[i].money + '" readonly="" class="amountOfMoney"/>' + '</div>';

		if(!savePay[i].fundeType) {
			Common.jBoxNotice('请选择积分类型', 'red');
			return false
		}
		if(!savePay[i].money || savePay[i].money < 0) {
			Common.jBoxNotice('请填写正确的金额', 'red');
			return false
		}
		if(!checkSelectFn()) {
			Common.jBoxNotice('请选择不同的积分类型', 'red');
			return false
		}
	};

	globalData.ipttarget.parent().prev().html(str);
	$('#pageModal').modal('hide');
	$(".pageModalItem3").addClass("hide");
	$("#editPayClick").addClass("hide");

}

//保存支付方式
function savePayFn() {
	var save = [],
		str = '';
	$(".modalPay").each(function() {
		save[save.length] = {
			fundeType: $(this).find(".fundType").val(),
			money: $(this).find(".money").val()
		}

	});
	for(var i = 0; i < save.length; i++) {
		str +=
			'<div style="margin-bottom:10px" class="watchMoney">' +
			'<input type="text" value="' + optionStrFn(save[i].fundeType) + '" readonly="" class="modeOfPayment" name="modeOfPayment" style="margin:0 10px 0 0;"/>' +
			'<input type="text" value="' + save[i].money + '" readonly="" class="amountOfMoney" name="modeOfPayment"/>' + '</div>';
		if(!save[i].fundeType) {
			Common.jBoxNotice('请选择积分类型', 'red');
			return false
		}
		if(!save[i].money || save[i].money < 0) {
			Common.jBoxNotice('请填写正确的金额', 'red');
			return false
		}
		if(!checkSelectFn()) {
			Common.jBoxNotice('请选择不同的积分类型', 'red');
			return false
		}
	};
	var payStr =
		'<div class="form-group buyStyleHide">' +
		'<label class="control-label col-xs-3"><span class="red">*</span>支付方式<span class="num">1</span>：</label>' +
		'<div class="col-lg-4  col-xs-7 watchAll">' +
		str +
		'</div>' +
		'<div class="col-xs-2" style="width:20%;">' +
		'<input type="button" value="编辑"  class="form-control btn editPay" onclick="editPayFn(event)" style="width: 60px;outline: none;">' +
		'<input type="button" value="-" onclick="deletePayFn(this)" class="form-control btn" style="width: 60px; outline: none;">' +
		'</div>' +
		'</div>';

	$('#purchasing').before(payStr);
	$('#pageModal').modal('hide');
	addNum();
}
//数字递增
function addNum() {
	$('.buyStyleHide').each(function(index, me) {
		$(me).find('.num').html(index + 1);
	});
}
//检验下拉框的值
function checkSelectFn() {
	var selectArr = []
	$(".fundType option:selected").each(function() {
		selectArr.push($(this).val());

	});
	console.log(selectArr);
	for(var i = 0; i < selectArr.length; i++) {
		if(selectArr[i] == selectArr[i + 1]) {
			return false;
		} else {
			return true;
		}
	}
};