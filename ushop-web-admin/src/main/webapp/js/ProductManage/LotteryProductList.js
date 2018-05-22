/**
 * 
 * productList.js
 * 用户管理-用户列表
 * 作者：roland
 * 
 * */

//硬性数据
var globalData = {};
var oldImage = /group1/;
var oldVal = [];
var globalRobertArr = [];
globalData.productStatus = '';
globalData.regFloatNumber = /^\d*(\.\d{0,2})?$/;
globalData.regNumber = /^\d+?$/;
//操作失败信息
var handleError = {
	content: '操作失败，请稍后重试',
	color: 'red',
	autoClose: 3000,
	position: {
		x: 'center',
		y: 50
	}
};
jQuery(function($) {
	var optionStr = '';

	//菜单面包屑导航等配置显示
	Common.menuNavContent('商品管理', '积分抽奖商品列表', '夺宝管理后台');
	globalData.menuTitile = $('#menuPageHeader h1').html();
	globalData.menuTitileDetail = globalData.menuTitile + '<small><i class="ace-icon fa fa-angle-double-right"></i>商品详情</small>';
	//全局变量赋值，页面数据初始化完成后执行页面操作
	globalDataFn(function(data) {
		//查询按键
		$('.itemSearch').on('click', function(e) {
			onSearch.call(this, e);
		});

		$.each(globalData.typeList, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.selectClassType1').html(optionStr);
		optionStr = '';
		$.each(globalData.listMerchantInfo, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">全部商家</option>';
			}
			optionStr += '<option value="' + obj.merchantNo + '">' + obj.merchantName + '</option>';
		});
		$('.merchantName').html(optionStr);
		optionStr = '';
		$.each(globalData.bandList, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.selectClassType2').html(optionStr);
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			$(window).trigger('resize.jqGrid');
		});
		//用户数据列表显示
		ProductList('#itemsTable1', '#itemsPager1');

		//点击添加用户列表事件绑定
		$('.itemAdd').on('click', function() {
			pageModalFn('', 'add');
		});
		$('.nav-tabs li a').on('click', function(e) {
			var target = e.target;
			var status = target.href.slice(-1);
			var productStatus = '';
			switch(status) {
				case '5':
					productStatus = '2';
					break;
				case '6':
					productStatus = '1';
					break;
				case '7':
					productStatus = '5';
					break;
				case '1':
					productStatus = '';
					break;
				default:
					productStatus = '';
			}
			var postData = {
				productStatus: productStatus
			};
			goBack(2);
			ProductList('#itemsTable1', '#itemsPager1', postData);
		});
		//用户列表编辑点击确定事件绑定
		$('#determineClick').on('click', determineClickFn);

	});

});

//全局参数请求
function globalDataFn(callback) {
	callback = callback || function() {};
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
									var thisUrl = Common.DOMAIN_NAME + '/ushop-web-admin/user/robot/getConstants';
									Common.dataAjax(thisUrl, function(data) {
										if(data.playerStatusList) {
											globalData.playerStatusList = data.playerStatusList
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
}

//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/new/banner/bannerList
function onSearch() {
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		merchantName = $.trim(box.find('[name="merchantName"]').val()),
		productName = $.trim(box.find('[name="productName"]').val()),
		productType = $.trim(box.find('.selectClassType1').val()),
		productBrand = $.trim(box.find('.selectType2').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var status = $('.nav-tabs .active a').attr('href').slice(-1);
	var productStatus;
	switch(status) {
		case '5':
			productStatus = '2';
			break; //上架
		case '6':
			productStatus = '1';
			break; //下架
		case '7':
			productStatus = '5';
			break; //下架中商品
		case '4':
			productStatus = '';
			break; //审核不通过
		default:
			productStatus = '';
	}
	var postData = {
		merchantNo: merchantName,
		productName: productName,
		productType: productType,
		productBrand: productBrand,
		productStatus: productStatus
	};
	ProductList('#itemsTable1', '#itemsPager1', postData);
}

//积分商品列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
function ProductList(tableId, pagerId, postData, reload) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/product/list'
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
			label: '商品成本价格',
			name: 'productRealPrice',
			index: 'productRealPrice',
			width: 100,
			align: 'center'
		}, {
			label: '商品销售价格',
			name: 'productPrice',
			index: 'productPrice',
			width: 100,
			align: 'center'
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
		},
		//			{label: '机器人投入',name:'robert',index:'robert',width:100, align: 'center'},
		{
			label: '操作',
			name: 'operation',
			index: '',
			width: 180,
			fixed: true,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				var str = '<button class="btn btn-xs btn-primary" onclick="productInfo(' + colpos.id + ',\'watch\' ' + ')">查看</button> ';
				if(colpos.status == 2) {
					//						if(colpos.robertStatus==1){
					str += '<button class="btn btn-xs btn-primary" onclick="watchRobotFn(' + colpos.id + ',\'watch\' ' + ')">查看机器人</button> ';
					//						}else{
					//							str += '<button class="btn btn-xs btn-primary" onclick="setRobertFn('+colpos.id+',\'watch\' ' +')">编辑机器人</button> ';
					//						}
				}
				return str;
			}
		}

	];
	if(!postData) {
		postData = {};
	}
	postData.usage = 1; //积分商品
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '积分抽奖商品列表');
	//	$('#determineClick').css('display','none');

}
//机器人列表
function RobotList(tableId, pagerId, postData, reload) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/user/robot/listBy';
	globalData.newRobotIds = [];
	if(!postData) {
		postData = {};
	}
	postData.rowNum = 100;
	postData.usage = 1;
	postData.multiboxonly = 10;
	colModel = [
		//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
		{
			label: '用户ID',
			name: 'userNo',
			index: 'userNo',
			width: 140,
			align: 'center'
		}, {
			label: '账户ID',
			name: 'accountNo',
			index: 'accountNo',
			width: 140,
			align: 'center'
		}, {
			label: '用户类型',
			name: 'userType',
			index: 'userType',
			width: 80,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				return '机器人'
			}
		}, {
			label: '手机号码',
			name: 'bindMobileNo',
			index: 'bindMobileNo',
			width: 100,
			align: 'center'
		}, {
			label: '机器人登录名',
			name: 'loginName',
			index: 'loginName',
			width: 100,
			align: 'center'
		}, {
			label: '注册时间',
			name: 'createTime',
			index: 'createTime',
			width: 120,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				if(globalData.newRobotIds.length > 99) {
					globalData.newRobotIds = [];
				}
				globalData.newRobotIds.push(colpos.id);
				globalData.hadChoose = false;
				return Common.msToTime(val)
			}
		}, {
			label: '状态',
			name: 'status',
			index: 'status',
			width: 60,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				var str = '';
				$.each(globalData.playerStatusList, function(i, o) {
					if(val == o.value) {
						str = o.desc;
					}
				});
				return str;
			}
		}
	];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '积分抽奖商品列表');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	//	$('#determineClick').css('display','none');

}
//格式化时间
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

//商品详情
function productInfo(id, typeName) {
	$('#menuPageHeader h1').html(globalData.menuTitileDetail);
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/getById?id=' + id;
	Common.dataAjax(_url, function(data) {
		var productInfo = $('#productInfo');
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
			headImage = data.product.headImage,
			productLimit = data.product.productLimit || 0,
			stock = data.product.stock || 0;
		var scrollImage = '';
		var bigImage = '';
		productInfo.find('[name=productName]').val(productName).attr('readonly', 'true');
		productInfo.find('[name=productTitle]').val(productTitle).attr('readonly', 'true');
		productInfo.find('[name=productRealPrice]').val(productRealPrice).attr('readonly', 'true');
		productInfo.find('[name=productPrice]').val(productPrice).attr('readonly', 'true');
		productInfo.find('[name=productLimit]').val(productLimit).attr('readonly', 'true');
		productInfo.find('[name=singlePrice]').val(singlePrice).attr('readonly', 'true');
		productInfo.find('[name=spellbuyCount]').val(spellbuyCount).attr('readonly', 'true');
		productInfo.find('[name=winner]').val(winner).attr('readonly', 'true');
		productInfo.find('[name=stock]').val(stock).attr('readonly', 'true');
		productInfo.find('[name=productStyle]').val(productStyle).attr('readonly', 'true');
		productInfo.find('.selectClassType1').val(productType);
		productInfo.find('.selectClassType2').val(productBrand);
		if(Common.oldImage.test(headImage)) {
			headImage = Common.IMAGE_URL + headImage;
		}
		headImg = '<img src="' + headImage + '"alt="缩略图" style="width:54px">';
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
		$('#productInfo').removeClass('hide');
	});
}
//查看机器人
function watchRobotFn(productId) {
	productId && (globalData.productId = productId);
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/listBy?productId=' + globalData.productId;
	var tableId = '#itemsTable2',
		pagerId = '#itemsPager2',
		postData = {};

	var colModel = [{
		label: '序号',
		name: 'id',
		index: 'id',
		width: 40,
		align: 'center'
	}, {
		label: '商品ID',
		name: 'productId',
		index: 'productId',
		width: 140,
		align: 'center'
	}, {
		label: '参与机器人ID数组',
		name: 'robotIds',
		index: 'robotIds',
		width: 140,
		align: 'center'
	}, {
		label: '机器人购买投入',
		name: 'initBuyInputs',
		index: 'initBuyInputs',
		width: 90,
		align: 'center'
	}, {
		label: '机器人剩余投入',
		name: 'buyInputs',
		index: 'buyInputs',
		width: 90,
		align: 'center'
	}, {
		label: '最大参与人数',
		name: 'maxNumber',
		index: 'maxNumber',
		width: 80,
		align: 'center'
	}, {
		label: '最少参与人数',
		name: 'minNumber',
		index: 'minNumber',
		width: 80,
		align: 'center'
	}, {
		label: '参与间隔下限',
		name: 'lowerLimit',
		index: 'lowerLimit',
		width: 100,
		align: 'center'
	}, {
		label: '参与间隔上限',
		name: 'upperLimit',
		index: 'upperLimit',
		width: 100,
		align: 'center'
	}, {
		label: '状态',
		name: 'status',
		index: 'status',
		width: 60,
		align: 'center',
		formatter: function(val, cellval, colpos, rwdat) {
			var str = '';
			if(val == 100) {
				str = '激活';
			} else if(val == 101) {
				str = '冻结';
			}
			return str;
		}
	}, {
		label: '操作',
		name: 'operator',
		index: 'operator',
		width: 150,
		align: 'center',
		fixed: true,
		formatter: function(val, cellval, colpos, rwdat) {
			var str = '<button class="btn btn-xs btn-primary" onclick="setRobotFn(' + colpos.id + ',\'edit\')">编辑</button> ';
			if(colpos.status == 100) {
				str += '<button class="btn btn-xs btn-primary" onclick="closeRobotFn(' + colpos.id + ')">冻结</button> ';
			} else if(colpos.status == 101) {
				str += '<button class="btn btn-xs btn-primary" onclick="chooseRobotFn(' + colpos.id + ',' + colpos.robotIds + ')">挑选</button> ';
				str += '<button class="btn btn-xs btn-primary" onclick="startRobotFn(' + colpos.id + ')">激活</button> ';
			}
			return str;
		}
	}];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	//	postData.rowNum = 10;multiboxonly
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '机器人配置列表');
	$('#lotteryProduct').addClass('hide');
	$('#lotteryRobot').removeClass('hide');
	$('#chooseRobot').addClass('hide');
	$('.nav-tabs.nav').addClass('hide');
}
//设置机器人
function setRobotFn(id, type) {
	var modal = $('#pageModal');
	modal.modal('show');
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	var determineClick = $('#determineClick');
	//	if(typeName == 'addTxtAccount'){
	//		$('#addTxtAccount').removeClass('hide');
	//		$('#addAccount').addClass('hide');
	//	}else if(typeName == 'addAccount'){
	//		$('#addTxtAccount').addClass('hide');
	//		$('#addAccount').removeClass('hide');
	//	}
	if(type == 'edit') {
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/getById?id=' + id;
		Common.dataAjax(_url, function(data) {
			if(data.error_description) {
				Common.jBoxNotice('请求机器人配置数据错误', 'red');
				return false
			}
			if(data.robotConfig) {
				var recordList = data.robotConfig;
				$.each(recordList, function(key, val) {
					if(pageModalItem1.find('[name=' + key + ']').length > 0) {
						pageModalItem1.find('[name=' + key + ']').val(val);
					}
				});
				if(recordList.status == 101) {
					//					pageModalItem1.find('.statusActive').prop('checked','checked');
					determineClick.removeClass('hide');
				} else {
					//					pageModalItem1.find('.statusFreeze').prop('checked','checked');
					determineClick.addClass('hide');
				}
				if(data.robotConfig.validTime) {
					globalData.durationArr = JSON.parse(data.robotConfig.validTime);
				} else {
					globalData.durationArr = [];
				}
				globalData.id = recordList.id;
				globalData.productId = recordList.productId;
				globalData.robotIds = recordList.robotIds;
				globalData.version = recordList.version;
				globalData.status = recordList.status;
				globalData.isSubmit = false;
				checkedDurationFn(type)
			}
			modal.modal('show');
		})
	} else {
		pageModalItem1.find('input').val('');
		globalData.isSubmit = true;
		determineClick.removeClass('hide');
		modal.modal('show');
		checkedDurationFn(type)
	}
}
//挑选时间段
function checkedDurationFn(type) {
	var checkedDuration = $('#checkedDuration');
	var checkedAll = $('#checkedAll');
	if(type == 'add') {
		globalData.checkedAll = false;
		globalData.durationArr = [];
		checkedDuration.find('[name=checkedDuration]').removeAttr('checked')
		checkedAll.removeAttr('checked');
	} else if(type == 'edit') {
		if(globalData.durationArr.length == 24) {
			checkedAll.prop('checked', true)
			globalData.checkedAll = true;
		} else {
			checkedAll.removeAttr('checked');
			checkedDuration.find('[name=checkedDuration]').removeAttr('checked')
			globalData.checkedAll = false;
		}
		$.each(globalData.durationArr, function(i, o) {
			checkedDuration.find('#' + o).prop('checked', true)
		})
	}

	checkedAll.unbind('change').on('change', function() {
		globalData.checkedAll = !globalData.checkedAll;
		if(globalData.checkedAll) {
			checkedDuration.find('[name=checkedDuration]').prop('checked', true)
			globalData.durationArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
			//			globalData.checkedAll = false;
		} else {
			checkedDuration.find('[name=checkedDuration]').removeAttr('checked')
			globalData.durationArr = [];
			//			globalData.checkedAll = true;
		}
	});
	checkedDuration.unbind('change').on('change', '[name=checkedDuration]', function(e) {
		var target = e.target;
		var val = $(target).prop('id');
		var checkedDurationList = checkedDuration.find('[name=checkedDuration]');
		globalData.hasChecked = false;
		$.each(checkedDurationList, function(i, o) {
			if($(o).prop('checked')) {
				globalData.hasChecked = true
			}
		})
		if(!globalData.hasChecked) {
			checkedAll.removeAttr('checked');
			globalData.checkedAll = false;
		}
		if($(target).prop('checked')) {
			globalData.durationArr.push(val);
		} else {
			//var index = globalData.durationArr.indexOf(Number(val),0);
			var length = globalData.durationArr.length,
				index = 0;
			for(var i = 0; i < length; i++) {
				if(val == globalData.durationArr[i]) {
					index = i;
				}
			}
			globalData.durationArr.splice(index, 1);
		}
	});
}

//挑选机器人
function chooseRobotFn(id, robotIds) {
	globalData.id = id;
	if(robotIds) {
		robotIds = robotIds.join(',')
		robotIds = robotIds.split(',');
	} else {
		robotIds = [];
	}
	globalData.robotIds = [];
	var length = robotIds.length;
	for(var i = 0; i < length; i++) {
		globalData.robotIds.push(parseInt(robotIds[i]))
	}
	$('#lotteryProduct').addClass('hide');
	$('#lotteryRobot').addClass('hide');
	$('#chooseRobot').removeClass('hide');
	var chooseRobotIds = $('#chooseRobotIds');
	chooseRobotIds.html('[' + globalData.robotIds + ']')
	var postData = {
		playerStatus: 100
	}
	RobotList('#itemsTable3', '#itemsPager3', postData);
	$('#itemsTable3.itemGridTable').on('click', 'tr', function() {
		var id = $(this).prop('id');
		var checked = $('#jqg_itemsTable3_' + id).prop('checked');

		id = parseInt(id);
		var index = globalData.robotIds.indexOf(id);
		if(checked) {
			if(index < 0) {
				globalData.robotIds.push(id);
			}
		} else {
			globalData.robotIds.splice(index, 1)
		}
		chooseRobotIds.html('[' + globalData.robotIds + ']');
	});
}
//提交机器人
function submitRobotIds() {
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/insert';
	var robotIds = [],
		length = globalData.robotIds.length;
	for(var i = 0; i < length; i++) {
		robotIds.push(parseInt(globalData.robotIds[i]))
	}
	if(robotIds.length == 0) {
		Common.jBoxNotice('请选择机器人', 'red');
		return false;
	}
	robotIds = JSON.stringify(robotIds);
	Common.dataAjaxPost(_url, {
		id: globalData.id,
		robotIds: robotIds
	}, function(data) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice('添加机器人数组成功', 'green');
			goBack(3)
		} else {
			Common.jBoxNotice('添加机器人数组失败', 'red');
		}
	})
}
//清空机器人
function clearRobotIds() {
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/clear';
	Common.dataAjaxPost(_url, {
		id: globalData.id
	}, function(data) {
		if(data.data == 'SUCCESS') {
			globalData.robotIds = [];
			globalData.hadChoose = false;
			$('#chooseRobotIds').html('');
			Common.jBoxNotice('清空机器人数组成功', 'green');
			goBack(3)
		} else {
			Common.jBoxNotice('清空机器人数组失败', 'red');
		}
	})
}
//激活机器人
function startRobotFn(id) {
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/start';
	Common.dataAjaxPost(_url, {
		id: id
	}, function(data) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice('激活机器人成功', 'green');
			watchRobotFn(globalData.productId);
		} else {
			Common.jBoxNotice('激活机器人失败', 'red');
		}
	})
}
//冻结机器人
function closeRobotFn(id) {
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/close';
	Common.dataAjaxPost(_url, {
		id: id
	}, function(data) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice('冻结机器人成功', 'green');
			watchRobotFn(globalData.productId);
		} else {
			Common.jBoxNotice('冻结机器人失败', 'red');
		}
	})
}
//随机挑选机器人
function randomRobert(type) {
	if(type == 2) {
		if(globalData.hadChoose) {
			Common.jBoxNotice('该页机器人已全部选完，请在其他页面挑选', 'green');
			return false;
		}
		var length = globalData.newRobotIds.length;
		for(var i = 0; i < length; i++) {
			var id = globalData.newRobotIds[i];
			var index = globalData.robotIds.indexOf(id);
			var checked = $('#jqg_itemsTable3_' + id).prop('checked');
			if(!checked) {
				if(index < 0) {
					$('#jqg_itemsTable3_' + id).trigger('click');
				}
			}
		}
		globalData.hadChoose = true;
		$('#chooseRobotIds').html('[' + globalData.robotIds + ']');
		return false;
	}
	var n = Math.floor(Math.random() * globalData.newRobotIds.length);
	var length = '';
	var robertArr = globalData.newRobotIds;
	var robertIds = [],
		s = '';
	for(var i = 0; i < n; i++) {
		s = Math.floor(Math.random() * robertArr.length);
		robertIds.push(parseInt(robertArr.splice(s, 1)));
	}
	robertIds = [].concat.apply([], robertIds);
	//	globalData.robotIds = globalData.robotIds.concat(robertIds);
	var length = robertIds.length;

	if(length == 0) {
		Common.jBoxNotice('该页机器人已全部选完，请在其他页面挑选', 'green');
		if(robertArr.length == 0) {
			return false
		}
		robertIds = robertArr;
		robertArr = [];
		length = robertIds.length;
	}
	for(var i = 0; i < length; i++) {
		var id = robertIds[i];
		var index = globalData.robotIds.indexOf(id);
		var checked = $('#jqg_itemsTable3_' + id).prop('checked');
		if(!checked) {
			if(index < 0) {
				$('#jqg_itemsTable3_' + id).trigger('click')
			}
		}
	}
	$('#chooseRobotIds').html('[' + globalData.robotIds + ']');
}
//确定按钮
function determineClickFn() {
	var _url = '',
		_param = {};
	var pageModalTitle = $('#pageModalTitle'),
		addAccount = $('#setRobert')
	typeName = pageModalTitle.attr('typeName');
	var buyInputs = addAccount.find('[name=initBuyInputs]').val(),
		minNumber = addAccount.find('[name=minNumber]').val(),
		maxNumber = addAccount.find('[name=maxNumber]').val(),
		upperLimit = addAccount.find('[name=upperLimit]').val(),
		status = globalData.status,
		lowerLimit = addAccount.find('[name=lowerLimit]').val();
	var validTime = globalData.durationArr;
	if(!buyInputs || !globalData.regNumber.test(buyInputs)) {
		Common.jBoxNotice('机器人购买投入不能为空，且为正整数', 'red');
		return false;
	};
	if(!minNumber || !globalData.regNumber.test(minNumber)) {
		Common.jBoxNotice('最少参与数为正整数', 'red');
		return false;
	};
	if(!maxNumber || !globalData.regNumber.test(maxNumber)) {
		Common.jBoxNotice('最大参与数为正整数', 'red');
		return false;
	};
	if(!(maxNumber - minNumber > 0)) {
		Common.jBoxNotice('最大参与数大于最小参与数', 'red');
		return false;
	}
	if(!(buyInputs - maxNumber > -1)) {
		Common.jBoxNotice('最大参与数不大于机器人购买投入', 'red');
		return false;
	}
	if(!upperLimit || !globalData.regNumber.test(upperLimit)) {
		Common.jBoxNotice('参与间隔上限为正整数', 'red');
		return false;
	};
	if(!lowerLimit || !globalData.regNumber.test(lowerLimit)) {
		Common.jBoxNotice('参与间隔下限为正整数', 'red');
		return false;
	};
	if(!(upperLimit - lowerLimit > 0)) {
		Common.jBoxNotice('参与间隔上限大于参与间隔下限', 'red');
		return false;
	}
	if(validTime.length == 0) {
		Common.jBoxNotice('请选择服务时间', 'red');
		return false;
	}
	validTime = JSON.stringify(validTime);
	_param.robotConfig = {
		productId: globalData.productId,
		maxNumber: maxNumber,
		minNumber: minNumber,
		upperLimit: upperLimit,
		lowerLimit: lowerLimit,
		validTime: validTime,
		status: status,
		buyInputs: buyInputs
	}
	addLoadingFn();
	if(globalData.isSubmit) {
		_param.robotConfig.robotIds = [];
		_param.robotConfig.status = 101;
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/add';
		Common.dataAjaxPost(_url, _param.robotConfig, function(data) {
			if(data.data == 'SUCCESS') {
				Common.jBoxNotice('新增成功', 'green');
				watchRobotFn(globalData.productId);
				$('#pageModal').modal('hide');
			} else {
				Common.jBoxNotice('新增失败', 'red');
			}
			removeLoadingFn();
		})
	} else {
		_param.robotConfig.id = globalData.id;
		_param.robotConfig.robotIds = globalData.robotIds;
		_param.robotConfig.version = globalData.version;
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/update';
		Common.dataAjaxPost(_url, _param.robotConfig, function(data) {
			if(data.data == 'SUCCESS') {
				Common.jBoxNotice('编辑成功', 'green');
				watchRobotFn(globalData.productId);
				$('#pageModal').modal('hide');
			} else {
				Common.jBoxNotice('编辑失败', 'red');
			}
			removeLoadingFn();
		})
	}
}
//返回
function goBack(n) {
	if(n == 1) {
		$('#menuPageHeader h1').html(globalData.menuTitile);
		$('#productInfo').addClass('hide');
		$('.row').removeClass('hide');
	} else if(n == 2) {
		$('#lotteryProduct').removeClass('hide');
		$('#lotteryRobot').addClass('hide');
		$('#chooseRobot').addClass('hide');
		$('.nav-tabs.nav').removeClass('hide');
	} else if(n == 3) {
		$('#lotteryProduct').addClass('hide');
		$('#lotteryRobot').removeClass('hide');
		watchRobotFn(globalData.productId, 'watch')
		$('#chooseRobot').addClass('hide');
	}

}
//导出excel表格
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '积分抽奖商品列表'
	});
}
//文本输入限制两位小数
function limitNum(e) {
	var id = $(e).attr('id');
	if(!id) {
		throw new Error('调用方法时，输入框须有ID')
	}
	var newVal = $('#' + id).val();
	if(globalData.regFloatNumber.test(newVal) || !newVal) {
		oldVal[id] = newVal;
	} else {
		$('#' + id).val(oldVal[id] || '');
	}
}

function removeLoadingFn() {
	$('.loadingEle').remove();
}
//加载进度
function addLoadingFn() {
	var div = $('<div class="loadingEle"></div>'),
		bg = $('<div></div>'),
		con = $('<div></div>'),
		p = $('<p>可能需要1-3分钟，请耐心等待</p>'),
		span = $('<span class="ace-icon fa fa-spin fa-spinner"></span>');
	con.css({
		'position': 'absolute',
		'left': '50%',
		'top': '50%',
		'width': '410px',
		'height': '120px',
		'text-align': 'center',
		'font-size': '30px',
		'color': '#fff',
		'margin': '-60px 0 0 -205px'
	});
	span.css({
		'font-size': '60px',
		'color': '#fff'
	});
	con.append(span).append(p);
	bg.css({
		'width': '100%',
		'height': '100%',
		'background': '#000',
		'opacity': '.6'
	});
	div.css({
		'position': 'fixed',
		'left': '0',
		'top': '0',
		'right': '0',
		'bottom': '0',
		'zIndex': '99999'
	}).append(bg).append(con);
	$('body').append(div)
}