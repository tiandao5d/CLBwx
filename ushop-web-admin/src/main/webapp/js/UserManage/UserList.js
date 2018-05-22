/**
 * 
 * UserList.js
 * 用户管理-用户列表
 * 作者：roland
 * 
 * */

//硬性数据
var userTypeList = [{
		desc: '商户',
		value: 1
	},
	{
		desc: '个人/会员',
		value: 2
	},
	{
		desc: '机器人',
		value: 3
	}
];
var accountTypeList = [{
		desc: '商户',
		value: 1
	},
	{
		desc: '个人/会员',
		value: 2
	},
	{
		desc: '内部账户',
		value: 4
	}
];
var accountStatusList = [{
		desc: '激活',
		value: 100
	},
	{
		desc: '冻结',
		value: 101
	},
	{
		desc: '冻结止收',
		value: 102
	},
	{
		desc: '冻结止付',
		value: 103
	},
	{
		desc: '注销',
		value: 104
	}
];
var fundTypeList = [{
		desc: '平台积分',
		value: 1001
	},
	{
		desc: '平台游戏券',
		value: 998
	},
	{
		desc: '平台红包',
		value: 1000
	},
	{
		desc: '平台人民币',
		value: 999
	}
];
var globalData = {};
globalData.regExpPhone = /^1(3|4|5|7|8)\d{9}$/;
globalData.regExpFloat = /^\d+(.\d{1,2})?$/;
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
	Common.menuNavContent('用户管理', '用户列表', '用户管理后台');

	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
		$(window).trigger('resize.jqGrid');
		onSearch();
	});

	globalDataFn(function(data) {
		//搜索栏选择框赋值
		$.each(globalData.playerTypeList, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.selectClassType').html(optionStr);

		//日期选择器绑定
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

		//查询按键
		$('.itemSearch').on('click', onSearch);

		//用户数据列表显示
		UserList('#itemsTable1', '#itemsPager1');

		//点击添加用户列表事件绑定
		$('.itemAdd').on('click', function() {
			pageModalFn('', 'add');
		});

		//用户列表编辑点击确定事件绑定
		$('#determineClick').on('click', determineClick);
	});
});

function globalDataFn(callback) {
	callback = callback || function() {};
	Common.ajaxAll([
		{url: '/ushop-web-admin/user/player/getConstants'},
		{url: '/ushop-web-admin/account/getConstants'}
	], function () {
		globalData.playerStatusList = arguments[0].playerStatusList;
		globalData.playerTypeList = arguments[0].playerTypeList;
		
		globalData.accountFundDirectionList = arguments[1].accountFundDirectionList;
		globalData.accountFundUsageList = arguments[1].accountFundUsageList;
		globalData.accountFundTypeList = arguments[1].accountFundTypeList;
		callback();
	})
}

//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/banner/bannerList
function onSearch() {
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		userName = $.trim(box.find('[name="userName"]').val()),
		userTel = $.trim(box.find('.userTel').val()),
		selectClassType = $.trim(box.find('.selectClassType').val()),
		startDate = $.trim(box.find('.form_datetime.start').val()),
		endDate = $.trim(box.find('.form_datetime.end').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var status = $('.nav-tabs .active a').attr('href').slice(-1);
	var playStatus;
	switch(status) {
		case '2':
			playerStatus = 101;
			break;
		case '3':
			playerStatus = 100;
			break;
		default:
			playerStatus = '';
	}
	if(userTel && !globalData.regExpPhone.test(userTel)) {
		Common.jBoxNotice('请输入有效手机号', 'red');
		return false
	}
	if(startDate && endDate) {
		if(new Date(endDate).getTime() < new Date(startDate).getTime()) {
			Common.jBoxNotice('起始时间不大于结束时间', 'red');
			return false;
		}
	} else if(startDate && !endDate) {
		Common.jBoxNotice('请输入结束时间', 'red');
		return false;
	} else if(endDate && !startDate) {
		Common.jBoxNotice('请输入开始时间', 'red');
		return false;
	} else {
		startDate = '';
		endDate = '';
	}
	var postData = {
		loginName: userName,
		mobileNo: userTel,
		playerType: selectClassType,
		beginTime: startDate,
		endTime: endDate,
		playerStatus: playerStatus
	};
	UserList('#itemsTable1', '#itemsPager1', postData);
}

//广告栏编辑点击确定函数
//http://10.35.0.66:8080/ushop-web-admin/banner/editBanner
//http://10.35.0.66:8080/ushop-web-admin/banner/addBanner
//http://10.35.0.66:8080/ushop-web-admin/banner/deleteBanner
function determineClick() {
	var errStr = '',
		_url = '',
		_param = {};
	var pageModalTitle = $('#pageModalTitle'),
		typeName = pageModalTitle.attr('typeName'),
		rowId = pageModalTitle.attr('rowId'),
		id = pageModalTitle.attr('typeId'),
		modal = $('#pageModal'),
		accountId = pageModalTitle.attr('accountId');
	if(typeName == 'delete') {
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/banner/deleteBanner';
		Common.dataAjaxPost(_url, {
			id: id
		}, function() {
			$('#itemsTable1').delRowData(rowId);
			$('#pageModal').modal('hide');
		});
		return false;
	}
	globalData.userNo = $('#userNo input').val();

	if(typeName == 'addCoupons') {
		var couponsType = modal.find('[name=couponsType]').val();
		if(!couponsType) {
			Common.jBoxNotice('请选择游戏类型', 'red');
			return false;
		}
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/account/coupons/add';
		Common.dataAjaxPost(_url, {
			userNo: globalData.userNo,
			couponsId: couponsType
		}, function(data) {
			if(data.data == 'SUCCESS') {
				Common.jBoxNotice('添加用户游戏券成功', 'green');
				$('#pageModal').modal('hide');
			} else {
				Common.jBoxNotice('添加用户游戏券失败', 'red');
			}
			couponsList(globalData.userNo, '998');
		});
		return false;
	}
	var balance = $('[name=balance]').val(),
		fundType = $('[name=fundType]').val(),
		status = $('[name=accountStatus]').val(),
		accountType = $('[name=accountType]').val();
	if(!balance) {
		errStr = '<div>账户余额不能为空</div>';
		Common.jBoxNotice(errStr, 'red');
		return false;
	};
	if(!globalData.regExpFloat.test(balance)) {
		errStr = '<div>账户余额为正数，可包含两位小数</div>';
		Common.jBoxNotice(errStr, 'red');
		return false;
	};
	if(!fundType) {
		errStr = '<div>资金类型不能为空</div>';
		Common.jBoxNotice(errStr, 'red');
		return false;
	};
	if(!status) {
		errStr = '<div>账户状态不能为空</div>';
		Common.jBoxNotice(errStr, 'red');
		return false;
	};
	if(!accountType) {
		errStr = '<div>账户类型不能为空</div>';
		Common.jBoxNotice(errStr, 'red');
		return false;
	};
	_param = {

		userNo: globalData.userNo,
		fundType: fundType,
		balance: balance,
		status: status,
		accountType: accountType

	}
	if(typeName == 'addAccount') {
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/account/add';
	} else if(typeName == 'editAccount') {
		_param = {
			balance: balance
		}
		_param.id = accountId;
		console.log(_param);
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/account/update';
	}
	console.log(globalData.userNo);

	Common.dataAjaxPost(_url, _param, function() {
		userAccountList(globalData.userNo);
		//		$('#itemsTable1').addRowData(rowId);

	})
	$('#pageModal').modal('hide');
}

//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//orderNo     订单号 字符串类型
//userID   	     用户ID字符串类型
//reload      是否是刷新列表，默认为false，布尔值
//http://10.35.0.66:8080/ushop-web-admin/banner/bannerList
function UserList(tableId, pagerId, postData, reload) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/user/player/list'

	colModel = [
		//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
		{
			label: '用户ID',
			name: 'userNo',
			index: 'userNo',
			width: 140,
			align: 'center'
		},
		{
			label: '用户类型',
			name: 'userType',
			index: 'userType',
			width: 80,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				var str = '';
				$.each(globalData.playerTypeList, function(i, o) {
					if(o.value == val) {
						str = o.desc;
						return str;
					}
				});
				return str;
			}
		},
		{
			label: '手机号码',
			name: 'bindMobileNo',
			index: 'bindMobileNo',
			width: 100,
			align: 'center'
		},
		{
			label: '用户登录名',
			name: 'loginName',
			index: 'loginName',
			width: 100,
			align: 'center'
		},
		{
			label: '注册时间',
			name: 'createTime',
			index: 'createTime',
			width: 120,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				return Common.msToTime(val)
			}
		},
		{
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
		},
		{
			label: '操作',
			name: 'operation',
			index: '',
			width: 180,
			fixed: true,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				var str = '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.userNo + ',\'watch\', ' + cellval.rowId + ')">查看</button> ';
				if(colpos.status == 100) {
					str += '<button class="btn btn-xs btn-danger" onclick="stopUserStatus(' + colpos.userNo + ')">禁用</button>';
				} else if(colpos.status == 101) {
					str += '<button class="btn btn-xs btn-primary" onclick="openUserStatus(' + colpos.userNo + ')">启用</button>';
				}
				str += ' <button class="btn btn-xs btn-primary" onclick="userAccountList(' + colpos.userNo + ')">账户信息</button>';
				return str;
			}
		}

	];
	$('#searchHide').removeClass('hide');
	$('#gbox_itemsTable2').addClass('hide');
	$('#gbox_itemsTable3').addClass('hide');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '用户列表');
	$('#determineClick').addClass('hide');
	$('.dismissModal').removeClass('hide');

}

function userAccountList(userNo) {

	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/account/list?userNo=' + userNo;
	$('#userNo').removeClass('hide').find('input').val(userNo);
	var tableId = '#itemsTable2',
		postData = '',
		pagerId = '#itemsPager2';
	colModel = [
		{
			label: '用户ID',
			name: 'userNo',
			index: 'userNo',
			width: 140,
			align: 'center'
		},
		{
			label: '账户类型',
			name: 'accountType',
			index: 'accountType',
			width: 80,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				var str = '';
				$.each(globalData.playerTypeList, function(i, o) {
					if(val == o.value) {
						str = o.desc;
					}
				});
				return str;
			}
		},
		{
			label: '资金类型',
			name: 'fundTypeName',
			index: 'fundTypeName',
			width: 100,
			align: 'center'
		},
		{
			label: '余额',
			name: 'balance',
			index: 'balance',
			width: 100,
			align: 'center'
		},
		{
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
		},
		{
			label: '注册时间',
			name: 'createTime',
			index: 'createTime',
			width: 120,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				return Common.msToTime(val)

			}
		},
		{
			label: '最后修改时间',
			name: 'lastTime',
			index: 'lastTime',
			width: 120,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				return Common.msToTime(val)
			}
		},
		{
			label: '操作',
			name: 'operation',
			index: '',
			width: 160,
			fixed: true,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				var str = '';
				if(colpos.fundType == 998) {
					str += '<button class="btn btn-xs btn-primary" onclick="couponsList(' + colpos.userNo + ',' + colpos.fundType + ')">游戏券详情</button> ';
				} else {
					str += '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.userNo + ',\'editAccount\', ' + colpos.fundType + ',' + colpos.id + ')">编辑</button> ';
				}
				str += '<button class="btn btn-xs btn-primary" onclick="accountHistory(' + colpos.userNo + ',' + colpos.fundType + ')">账户流水</button> ';
				return str;
			}
		}

	];
	$('#searchHide').addClass('hide');
	$('#gbox_itemsTable1').addClass('hide');
	$('#gbox_itemsTable2').removeClass('hide');
	$('#gbox_itemsTable3').addClass('hide');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '账户信息列表');

}
//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/banner/getBannerById?Id=1
function pageModalFn(userNo, typeName, rowId, accountId) {
	rowId = rowId || '';
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/user/player/getByUserNo?userNo=' + userNo;
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	modal.modal('show');
	pageModalTitle.attr({
		'typeName': typeName,
		'userNo': userNo,
		'rowId': rowId,
		'accountId': accountId
	});
	if(typeName == 'edit') {
		Common.dataAjax(url, function(data) {
			pageModalTitle.html('编辑');
			strHtmlFn(data, userNo);
		});
	} else if(typeName == 'delete') {
		pageModalTitle.html('删除');
		pageModalItem1.html('是否删除此条');
	} else if(typeName == 'add') {
		pageModalTitle.html('添加');
		strHtmlFn();
	} else if(typeName == 'watch') {
		Common.dataAjax(url, function(data) {
			pageModalTitle.html('查看');
			strHtmlFn(data, userNo);
		});
	} else if(typeName == 'editAccount') {
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/account/getByUserNo?userNo=' + userNo + '&fundType=' + rowId;
		Common.dataAjax(_url, function(data) {
			pageModalTitle.html('编辑账户信息');
			strHtmlFnAccount(data.account, userNo, typeName);
		});
	} else if(typeName == 'addAccount') {
		pageModalTitle.html('新增账户信息');
		var userNo = $('#userNo input').val();
		strHtmlFnAccount('', userNo, typeName);
	} else if(typeName == 'addCoupons') {
		pageModalTitle.html('新增用户游戏券');
		var userNo = $('#userNo input').val();
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/account/coupons/list';
		Common.dataAjax(_url, function(data, status) {
			if(status == 'success') {
				strHtmlFnCoupons(data, userNo, typeName);
			} else {
				Common.jBoxNotice('请求数据错误', 'red');
			}
		});
	}
}

function strHtmlFn(user, id) {
	user = user ? user : {};
	var delImgUrl = Common.DOMAIN_NAME + '/ushop-web-admin/file/delete';
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	var imgStr = '';
	var userOperator = user.userOperator || '',
		memberInfo = user.memberInfo || '',
		vipLevel = user.vipLevel || '',
		userInfo = user.userInfo || '';
	var userStatus,
		userType,
		bindEmail = userInfo.bindEmail || '',
		rewardUploadCount = vipLevel.rewardUploadCount || '',
		//参数化开关用户昵称，头像
		userExists = false;
	$.each(globalData.playerStatusList, function(i, o) {
		if(userInfo.status == o.value) {
			userStatus = o.desc;
		}
	});
	$.each(globalData.playerTypeList, function(i, o) {
		if(userInfo.userType == o.value) {
			userType = o.desc;
		}
	});
	if(userInfo.userType == 2) {
		userExists = true;
	}
	imgStr = memberInfo ? '<div style="padding-top: 10px;"><img style="width: 100px;" src="' + memberInfo.headImage + '"></div>' : '';
	var _userInfo = '<div id="userInfo">' +
		'<div class="form-horizontal">' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label">用户ID：</label>' +
		'<div class="col-xs-9">' +
		'<span class="form-control" style="border:0">' + id + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label">用户状态：</label>' +
		'<div class="col-xs-9">' +
		'<span class="form-control" style="border:0">' + userStatus + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label">用户类型：</label>' +
		'<div class="col-xs-9">' +
		'<span class="form-control" style="border:0">' + userType + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>用户登录名：</label>' +
		'<div class="col-xs-9">' +
		'<span class="form-control" style="border:0">' + (userInfo.loginName || '') + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label">用户真实姓名：</label>' +
		'<div class="col-xs-9">' +
		'<span class="form-control" style="border:0">' + (userInfo.realName || '') + '</span>' +
		'</div>' +
		'</div>';
	if(userExists) {
		_userInfo += '<div class="form-group">' +
			'<label class="col-xs-3 control-label">用户昵称：</label>' +
			'<div class="col-xs-9">' +
			'<span class="form-control" style="border:0">' + (memberInfo.nickName || '') + '</span>' +
			'</div>' +
			'</div>'
	};
	_userInfo += '<div class="form-group">' +
		'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>手机号码：</label>' +
		'<div class="col-xs-9">' +
		'<span class="form-control" style="border:0">' + (userInfo.bindMobileNo || '') + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>用户邮箱：</label>' +
		'<div class="col-xs-9">' +
		'<span class="form-control" style="border:0">' + bindEmail + '</span>' +
		'</div>' +
		'</div>';
	if(userExists) {
		if(Common.oldImage.test(memberInfo.headImage)) {
			memberInfo.headImage = Common.IMAGE_URL + memberInfo.headImage;
		}
		var headImg = memberInfo.headImage ? '<img src="' + memberInfo.headImage + '"alt="缩略图" style="width:54px">' : '';
		_userInfo += '<div class="form-group">' +
			'<label class="col-xs-3 control-label"><div><i style="color: #f00;">* </i>头像：</div>' + headImg + '</label>' +
			'<div class="col-xs-9">' +
			'<input name="pictureAddress" value="' + memberInfo.headImage + '" type="text" class="hide">' +
			'<div>' +
			'<form class="dropzone well" id="dropzoneModalImg">' +
			'<div class="fallback">' +
			'<input name="file" type="file">' +
			'</div>' +
			'</form>' +
			'</div>' +
			'</div>' +
			'</div>'
	}
	_userInfo += '</div></div>';
	var _vipLevel = '<div id="vipLevel">' +
		'<div class="form-horizontal">' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label">等级：</label>' +
		'<div class="col-xs-9">' +
		'<span class="form-control" style="border:0" name="level">' + (vipLevel.level || 1) + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label">经验：</label>' +
		'<div class="col-xs-9">' +
		'<span class="form-control" style="border:0" name="exp">' + (vipLevel.exp || 0) + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<div class="col-xs-12 btn btn-xs btn-primary" style="text-align:center" onClick="showEditLevel()">' +
		'编辑等级信息' +
		'</div>' +
		'</div>' +
		'</div>' +
		'</div>';
	var _userOperator = '<div id="userOperator">' +
		'<div class="form-horizontal">' +
		'<div class="form-group">' +
		'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>注册时间：</label>' +
		'<div class="col-xs-8">' +
		'<span class="form-control" style="border:0">' + Common.msToTime(userOperator.createTime) + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>修改密码次数：</label>' +
		'<div class="col-xs-8">' +
		'<span class="form-control" style="border:0">' + (userOperator.isChangedPwd || 0) + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>最后登录时间：</label>' +
		'<div class="col-xs-8">' +
		'<span class="form-control" style="border:0">' + Common.msToTime(userOperator.lastLoginTime) + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>登陆密码错误次数：</label>' +
		'<div class="col-xs-8">' +
		'<span class="form-control" style="border:0">' + userOperator.pwdErrorTimes + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>最后修改密码时间：</label>' +
		'<div class="col-xs-8">' +
		'<span class="form-control" style="border:0">' + Common.msToTime(userOperator.lastAlertPwdTime) + '</span>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'</div>';
	var _editLevel = '<div id="editLevel">' +
		'<div class="form-horizontal">' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label">用户ID：</label>' +
		'<div class="col-xs-9">' +
		'<span class="form-control" style="border:0">' + id + '</span>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label">增加经验：</label>' +
		'<div class="col-xs-9">' +
		'<input name="exp" class="form-control" value="" type="text">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<div class="col-xs-12 btn btn-xs btn-primary" style="text-align:center" onClick = "editVipLevel(' + id + ')">' +
		'保存修改' +
		'</div>' +
		'</div>' +
		'</div>' +
		'</div>';
	str = '<div class="tabbable">' +
		'<ul class="nav nav-tabs" id="myTab4">' +
		'<li class="active">' +
		'<a data-toggle="tab" href="#userInfo">' +
		'基本信息' +
		'</a>' +
		'</li>' +
		'<li>' +
		'<a data-toggle="tab" href="#vipLevel">' +
		'等级信息' +
		'</a>' +
		'</li>' +
		'<li>' +
		'<a data-toggle="tab" href="#userOperator">' +
		'登录信息' +
		'</a>' +
		'</li>' +
		'</ul>' +
		'<div class="tab-content">' +
		_userInfo + _vipLevel + _userOperator + _editLevel +
		'</div>' +
		'</div>';
	pageModalItem1.html(str);
	$('.pageModalItem1 .tab-content>div').css('display', 'none');
	$('.pageModalItem1 .tab-content>div:first-child').css('display', 'block');
	$(document).on('click', '#myTab4 a', function() {
		$('.tab-content>div').css('display', 'none');
		$('.tab-content>div.active').css('display', 'block');
	});
	if(userExists) {
		//上传游戏图标
		var dropzoneBase = { //默认配置
			previewTemplate: $('#preview-template').html(),
			addRemoveLinks: true, //上传文件可以删除
			dictDefaultMessage: '<div>请点击或拖拽上传</div><div>只接受200*200以下的图片</div>',
			dictFallbackMessage: '您的浏览器版本太旧',
			dictInvalidFileType: '文件类型被拒绝',
			dictFileTooBig: '文件大小{{filesize}}M，限制最大为{{maxFilesize}}M',
			dictCancelUpload: '取消上传链接',
			dictResponseError: '服务器错误，错误代码{ { statusCode } }',
			dictCancelUploadConfirmation: '是否取消',
			dictMaxFilesExceeded: '文件数量超出',
			dictRemoveFile: '删除文件'
		}
		Dropzone.autoDiscover = false;
		var url1 = '/ushop-web-admin/user/player/addImg';
		Common.formatUrl(url1, function(newUrl) {
			//上传图标
			var memberId = memberInfo.id;
			var dropzoneIcon = new Dropzone('#dropzoneModalImg', $.extend(dropzoneBase, {
				url: newUrl + '&userNo=' + id + '&memberId=' + memberId,
				method: 'post',
				maxFiles: 1, //最大上传文件数量
				maxFilesize: 0.5, //最大上传文件大小
				acceptedFiles: '.png,.jpg,.gif', //文件格式限制
				paramName: "myFile",
				removedfile: function(_file) {
					var imgUrl = $.parseJSON(_file.xhr.response).url;

					Common.dataAjaxPost(delImgUrl, {
						URL: imgUrl
					}, function(data) {
						if(data.data == 'SUCCESS') {
							$(_file.previewElement).remove();
						} else {
							Common.jBoxNotice('删除失败', 'red');
						}
					});
				},
				success: function(_file, ret) {
					var imgUrl = ret.url;
					if(_file.width > 200 || _file.height > 200) {
						Common.jBoxNotice('图片宽高必须是200*200以下', 'red');
						this.removeFile(_file);
						Common.dataAjaxPost(delImgUrl, {
							URL: imgUrl
						});
						return false;
					}
					var imgIpt = $('[name=pictureAddress]'),
						val = imgIpt.val();
					$(_file.previewElement).attr('imgUrl', imgUrl);
					imgIpt.val(imgUrl + ',' + val);
				}
			}));
		});
	}
}

function strHtmlFnAccount(account, id, typeName) {
	account = account ? account : {};
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	var optionStr1 = '',
		optionStr2 = '',
		optionStr3 = '',
		fundType = account.fundType || '',
		accountType = account.accountType || '',
		status = account.status || '',
		lastTime = account.lastTime || '',
		balance = account.balance || '';
	$.each(fundTypeList, function(index, obj) {
		if(fundType == obj.value) {
			optionStr1 += '<option value="' + obj.value + '" selected>' + obj.desc + '</option>';
		} else {
			optionStr1 += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		}
	});
	$.each(globalData.playerStatusList, function(index, obj) {
		if(status == obj.value) {
			optionStr2 += '<option value="' + obj.value + '" selected>' + obj.desc + '</option>';
		} else {
			optionStr2 += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		}
	});
	$.each(globalData.playerTypeList, function(index, obj) {
		if(accountType == obj.value) {
			optionStr3 += '<option value="' + obj.value + '" selected>' + obj.desc + '</option>';
		} else {
			optionStr3 += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		}
	});
	var lastTimeHtml = '';
	if(typeName == 'editAccount') {
		lastTimeHtml = '<div class="form-group">' +
			'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>最后修改时间</label>' +
			'<div class="col-xs-9 ">' +
			'<input type="text" name="startTime" readonly class="form-control"  style="border:0" value="' + Common.msToTime(lastTime) + '">' +
			'</div>' +
			'</div>';
	}
	//imgStr = pictureAddress ? '<div style="padding-top: 10px;"><img style="width: 100px;" src="' + (Common.IMAGE_URL + pictureAddress) + '"></div>' : '';
	str = '<div class="form-horizontal">' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>用户ID</label>' +
		'<div class="col-xs-9">' +
		'<input name="userNo" class="form-control" readonly style="border:0" value="' + id + '" type="text">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>资金类型：</label>' +
		'<div class="col-xs-9">' +
		'<select class="form-control" name="fundType">' + optionStr1 + '</select>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>账户余额</label>' +
		'<div class="col-xs-9">' +
		'<input type="text" name="balance"  class="form-control" value="' + balance + '">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>账户状态：</label>' +
		'<div class="col-xs-9">' +
		'<select class="form-control" name="accountStatus">' + optionStr2 + '</select>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>账户类型</label>' +
		'<div class="col-xs-9">' +
		'<select class="form-control" name="accountType">' + optionStr3 + '</select>' +
		'</div>' +
		'</div>' +
		lastTimeHtml +
		'</div>';
	pageModalItem1.html(str);
	if(typeName == 'editAccount') {
		$('.pageModalItem1 select').attr('disabled', true);
	}
	if(typeName == 'editAccount' || typeName == 'addAccount') {
		$('#determineClick').removeClass('hide').css('float', 'right');
		$('.dismissModal').addClass('hide');
	} else {
		$('#determineClick').addClass('hide');
		$('.dismissModal').removeClass('hide');
	}
}

function strHtmlFnCoupons(data, id, typeName) {
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	var optionStr1 = '<option>请选择</option>';
	var couponsStr = '';
	$.each(data, function(index, obj) {
		var rule = JSON.parse(obj.rule);
		if(rule.appId == -1) {
			couponsStr = '通用游戏券' + rule.balance + '元'
		}
		optionStr1 += '<option value="' + obj.id + '">' + obj.couponsName + '-' + couponsStr + '</option>';
	});
	str = '<div class="form-horizontal">' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>用户ID</label>' +
		'<div class="col-xs-9">' +
		'<input name="userNo" class="form-control" readonly style="border:0" value="' + id + '" type="text">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>游戏券类型：</label>' +
		'<div class="col-xs-9">' +
		'<select class="form-control" name="couponsType">' + optionStr1 + '</select>' +
		'</div>' +
		'</div>' +
		'</div>';
	pageModalItem1.html(str);
	$('#determineClick').removeClass('hide').css('float', 'right');
	$('.dismissModal').addClass('hide');
}
//账户流水
function accountHistory(userNo, fundType) {
	$('#userNo').addClass('hide');
	$('#fundType').removeClass('hide').find('.couponsHide').addClass('hide');
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/account/history/listByUserNo?userNo=' + userNo + '&fundType=' + fundType;
	var tableId = '#itemsTable3',
		postData = '',
		pagerId = '#itemsPager3';
	colModel = [
		{
			label: '用户ID',
			name: 'userNo',
			index: 'userNo',
			width: 140,
			align: 'center'
		},
		{
			label: '请求号',
			name: 'requestNo',
			index: 'requestNo',
			width: 100,
			align: 'center'
		},
		{
			label: '资金类型',
			name: 'fundType',
			index: 'fundType',
			width: 100,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				var str = '';
				$.each(globalData.accountFundTypeList, function(i, o) {
					if(val == o.value) {
						str = o.desc;
					}
				});
				return str;
			}
		},
		{
			label: '变动金额',
			name: 'amount',
			index: 'amount',
			width: 100,
			align: 'center'
		},
		{
			label: '余额',
			name: 'balance',
			index: 'balance',
			width: 100,
			align: 'center'
		},
		{
			label: '手续费',
			name: 'fee',
			index: 'fee',
			width: 100,
			align: 'center'
		},
		{
			label: '资金变动方向',
			name: 'fundDirection',
			index: 'fundDirection',
			width: 100,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				var str = '';
				$.each(globalData.accountFundDirectionList, function(i, o) {
					if(val == o.value) {
						str = o.desc;
					}
				});
				return str;
			}
		},
		{
			label: '资金用途',
			name: 'fundUsage',
			index: 'fundUsage',
			width: 100,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				var str = '';
				$.each(globalData.accountFundUsageList, function(i, o) {
					if(val == o.value) {
						str = o.desc;
					}
				});
				return str;
			}
		},
		{
			label: '注册时间',
			name: 'createTime',
			index: 'createTime',
			width: 120,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				return Common.msToTime(val)

			}
		},
		{
			label: '余额支付',
			name: 'formatTrxTypeEnumDesc',
			index: 'formatTrxTypeEnumDesc',
			width: 100,
			align: 'center'
		}
	];
	$('#gbox_itemsTable1').addClass('hide');
	$('#gbox_itemsTable2').addClass('hide');
	$('#gbox_itemsTable3').removeClass('hide');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '账户流水列表');
}

//游戏券详情
function couponsList(userNo, fundType, status) {
	$('#userNo').addClass('hide');
	$('#fundType').removeClass('hide').find('.couponsHide').removeClass('hide');
	if(!status) {
		status = 0;
	}
	globalData.userNo = userNo;
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/account/coupons/listByUserNo?userNo=' + userNo + '&status=' + status;
	var tableId = '#itemsTable3',
		postData = '',
		pagerId = '#itemsPager3';
	colModel = [
		{
			label: '用户ID',
			name: 'userNo',
			index: 'userNo',
			width: 140,
			align: 'center'
		},
		{
			label: '游戏券ID',
			name: 'couponsId',
			index: 'couponsId',
			width: 100,
			align: 'center'
		},
		{
			label: 'appID',
			name: 'appId',
			index: 'appId',
			width: 100,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				if(val == -1) {
					val = '通用券'
				}
				return val;
			}
		},
		{
			label: '资金类型',
			name: 'fundType',
			index: 'fundType',
			width: 100,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				var str = '游戏券';
				return str;
			}
		},
		{
			label: '状态',
			name: 'status',
			index: 'status',
			width: 100,
			align: 'center',
			formatter: function(val, cellval, colpos, rwdat) {
				var str = '';
				if(status == 0) {
					str = '可用';
				} else if(status == 1) {
					str = '已使用/已过期';
				}
				return str;
			}
		},
		{
			label: '账户初始金额',
			name: 'initialAmount',
			index: 'initialAmount',
			width: 100,
			align: 'center'
		},
		{
			label: '可用余额',
			name: 'balance',
			index: 'balance',
			width: 100,
			align: 'center'
		},
		{
			label: '有效期至',
			name: 'deadline',
			index: 'deadline',
			width: 100,
			align: 'center'
		}
	];
	$('#gbox_itemsTable1').addClass('hide');
	$('#gbox_itemsTable2').addClass('hide');
	$('#gbox_itemsTable3').removeClass('hide');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '游戏券账户列表');
}
//启用用户
function openUserStatus(userNo) {
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/player/opening';
	Common.dataAjaxPost(_url, {
		userNo: userNo
	}, function(data) {
		if(data.data == 'SUCCESS') {
			var content = '启用成功',
				color = 'green',
				autoClose = 3000,
				position = {
					x: 'center',
					y: 50
				};
			Common.jBoxNotice(content, color, autoClose, position);
			UserList('#itemsTable1', '#itemsPager1');
		} else {
			Common.jBoxNotice(handleError.content, handleError.color, handleError.autoClose, handleError.position);
		}

	});
}
//停用用户
function stopUserStatus(userNo) {
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/player/stopping';
	var title = '禁用用户',
		content = '确定要禁用该用户吗？';
	Common.jBoxConfirm(title, content, function() {
		if(arguments[0] == 1) {
			Common.dataAjaxPost(_url, {
				userNo: userNo
			}, function(data) {
				if(data.data == 'SUCCESS') {
					var content = '禁用成功',
						color = 'green',
						autoClose = 3000,
						position = {
							x: 'center',
							y: 50
						};
					Common.jBoxNotice(content, color, autoClose, position);
					UserList('#itemsTable1', '#itemsPager1');
				} else {
					Common.jBoxNotice(handleError.content, handleError.color, handleError.autoClose, handleError.position);
				}
			});
		}
	});

}
//显示用户等级信息修改页面
function showEditLevel(vipLevel, id) {
	$('.pageModalItem1 .tab-content>div').css('display', 'none');
	$('.pageModalItem1 .tab-content>div#editLevel').css('display', 'block');
}
//提交用户等级信息的修改
function editVipLevel(id) {
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/player/vipLevelSubmit';
	var rewardUploadCount = $('#editLevel [name="rewardUploadCount"]').val(),
		rewardSmsCount = $('#editLevel [name="rewardUploadCount"]').val(),
		rewardCouponCount = $('#editLevel [name="rewardCouponCount"]').val(),
		exp = $('#editLevel [name="exp"]').val();
	var err = '';
	if(!/^\d+$/.test(exp)) {
		err += '经验值只能为正整数';
	}
	if(err != '') {
		Common.jBoxNotice(err, 'red');
		return false;
	}
	var params = {
		userNo: id,
		exp: exp
	};
	Common.dataAjaxPost(_url, params, function() {
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/player/getByUserNo?userNo=' + id;
		Common.dataAjax(_url, function(data) {
			$('.pageModalItem1 .tab-content>div').css('display', 'none');
			vipLevelContent = $('.pageModalItem1 .tab-content>div#vipLevel');
			vipLevelContent.find('[name="level"]').html(data.vipLevel.level);
			vipLevelContent.find('[name="exp"]').html(data.vipLevel.exp);
			vipLevelContent.find('[name="upgradeCoupons"]').html(data.vipLevel.upgradeCoupons);
			vipLevelContent.find('[name="monthlyCoupons"]').html(data.vipLevel.monthlyCoupons);
			vipLevelContent.find('[name="reward"]').html(data.vipLevel.reward.replace('|', '~'));
			vipLevelContent.find('[name="rewardCouponCount"]').html(data.vipLevel.rewardCouponCount);
			vipLevelContent.css('display', 'block');
		}, function(data) {
			Common.jBoxNotice(data[error_description], 'red');
			return false;
		});
	}, function(data) {
		Common.jBoxNotice(data[error_description], 'red');
		return false;
	});
}

function goBack(n) {
	if(n == 2) {
		$('#userNo').removeClass('hide');
		$('#fundType').addClass('hide');
		$('#gbox_itemsTable1').addClass('hide');
		$('#gbox_itemsTable2').removeClass('hide');
		$('#gbox_itemsTable3').addClass('hide');
	} else {
		$('#userNo').addClass('hide');
		$('#searchHide').removeClass('hide');
		$('#determineClick').addClass('hide');
		$('.dismissModal').removeClass('hide');
		$('#gbox_itemsTable1').removeClass('hide');
		$('#gbox_itemsTable2').addClass('hide');
		$('#gbox_itemsTable3').addClass('hide');
	}
}
//导出excel表格
function toExcel(n) {
	var param = {
		type: 'excel',
		escape: 'false'
	}
	var b = $('#fundType .couponsHide').hasClass('hide');
	b && (n = 4);
	switch(n) {
		case 1:
			param.fileName = '用户列表';
			param.aId = 'exportExcel1';
			break;
		case 2:
			param.fileName = '账户信息列表';
			param.aId = 'exportExcel2';
			break;
		case 3:
			param.fileName = '游戏券账户列表';
			param.aId = 'exportExcel3';
			break;
		case 4:
			param.fileName = '账户流水';
			param.aId = 'exportExcel3';
			break;
	}
	$('#gview_itemsTable' + n).tableExport(param);
}

function couponsListStatus(status) {
	couponsList(globalData.userNo, 998, status);
}