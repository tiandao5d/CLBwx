/**
 * 
 * GameList.js
 * 游戏列表
 * 作者：xulin
 * 
 * */
//硬性数据
//1：下架，2：上架，3：审核中，4：审核不通过，5：测试中
//1：查看，2：删除，3：通过，4：不通过，5：上架，6：下架，7：置顶，8：取消置顶，9：'提交审核'，10：'查询状态'
"use strict";
//用于显示列表中的按键
globalData.listBtn = [
	{val: '1', text: '下架', buttons: [{val: '1', text: '查看'}, {val: '11', text: '提交审核'}]},
	{val: '2', text: '上架', buttons: [{val: '1', text: '查看'}, {val: '6', text: '下架'}]},
	{val: '3', text: '审核中', cbtns: [{val: '1', text: '查看'}, {val: '9', text: '提交审核'}, {val: '4', text: '不通过'}], csbtns: [{val: '1', text: '查看'}, {val: '10', text: '查询状态'}], buttons: [{val: '1', text: '查看'}, {val: '3', text: '通过'}, {val: '4', text: '不通过'}]},
	{val: '4', text: '审核不通过', buttons: [{val: '1', text: '查看'}, {val: '3', text: '通过'}, {val: '4', text: '不通过'}]},
	{val: '5', text: '测试中', buttons: [{val: '1', text: '查看'}, {val: '5', text: '上架'}]}
];
globalData.listBtnType = [
	{val: '1', text: '查看'},
	{val: '2', text: '删除'},
	{val: '3', text: '通过'},
	{val: '4', text: '不通过'},
	{val: '5', text: '上架'},
	{val: '6', text: '下架'},
	{val: '7', text: '置顶'},
	{val: '8', text: '取消置顶'},
	{val: '9', text: '提交认证'},
	{val: '10', text: '查询状态'},
	{val: '11', text: '提交审核'}
];
//用于显示列表中的游戏状态
globalData.gameStatusArr = [
	{val: '1', txt: '下架'},
	{val: '2', txt: '上架'},
	{val: '3', txt: '审核中'},
	{val: '4', txt: '不通过'},
	{val: '5', txt: '测试中'}
];
//彩票游戏认证状态
globalData.gameStatusCArr = [
	{val: '1', txt: '待审'},
	{val: '2', txt: '通过'},
	{val: '3', txt: '审核中'},
	{val: '4', txt: '审核不通过'}
];
//认证状态:1=待审 2=通过 3=审核中 4=审核不通过
jQuery(function($) {
	//左侧菜单显示
	Common.menuNavContent('游戏管理', '游戏信息','游戏管理后台');
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
	});
	//以上为共用
	
	
	reloadInitFn();//数据初始化并发请求，并展现第一个列表
	eventBindFn();//页面元素事件绑定
});

//页面元素事件绑定
function eventBindFn(){
	//标签切换前数据呈现
	$('a[data-toggle="tab"]').on('show.bs.tab', function(e){
		var $a = $(e.target),
			status = $a.attr('data-status'),
			index = $a.attr('data-index');
		getGameListFn('#itemsTable' + index, '#itemsPager' + index, {status: status});
	});
	
	//查询数据
	$('.itemSearch').on('click', onSearchGameFn);
	//导出Excel
	$('.exportExcel').on('click', function(){
		
	});
}

//初始请求
function reloadInitFn(){
	Common.ajaxAll([
		{url: '/ushop-web-admin/account/fundType/list'},//货币数据
		{url: '../../js/provinces.json'},//省份获取
		{url: '/ushop-web-admin/platform/game/type/list'},//游戏分类获取
		{url: '/ushop-web-admin/user/merchant/list'}//厂商获取
	], function(){
		globalData.fundTypeArr = arguments[0].fundTypeList || [];//积分类型数据
		globalData.provincesArr = arguments[1] || [];//省份数据
		globalData.gameTypeArr = arguments[2].recordList || [];//游戏分类数据
		globalData.merchantArr = arguments[3].recordList || [];//商家数据
		selectEleFn(globalData.fundTypeArr, 'desc', 'value', $('[name="fundType"]'));
		selectEleFn(globalData.provincesArr, 'desc', 'value', $('[name="province"]'));
		selectEleFn(globalData.gameTypeArr, 'typeName', 'id', $('.gameAppType'));
		selectEleFn(globalData.merchantArr, 'merchantName', 'merchantNo', $('.gameMerchantName'));
		//游戏列表请求
		getGameListFn('#itemsTable1', '#itemsPager1', {status: '3'});
	});
}

//select元素赋值
function selectEleFn(arr, nstr, vstr, $ele){
	arr = arr || [];
	var str = '<option value="">请选择</option>';
	$.each(arr, function(index, obj){
		str += '<option value="' + obj[vstr] + '">' + obj[nstr] + '</option>';
	});
	$ele.html(str);
}


//查询
function onSearchGameFn(e){
	var $nav = $(e.target).parent(),
		$a = $('.tab_box_li.active').find('a'),
		status = $a.attr('data-status'),
		index = $a.attr('data-index'),
		param = {
			status: status,
			appName: $nav.find('.gameAppName').val(),
			merchantName: $nav.find('.gameMerchantName').val(),
			appType: $nav.find('.gameAppType').val()
		};
	getGameListFn(('#itemsTable' + index), ('#itemsPager' + index), param);
}


//请求游戏列表的数据，并且将下拉框填充
//tableId， 表格table的id，带有#
//pagerId， 表格工具栏的id，带有#
//data，请求过来的数据
function getGameListFn(tableId, pagerId, postData){
	globalData.gridParam = [tableId, pagerId, postData];
	var gridUrl = '/ushop-web-admin/platform/game/query/listBy',
		colModel = [
			{label: '游戏ID',name:'id',index:'id',hidden: true},
			{label: '游戏名称',name:'appName',index:'appName',width:120, align: 'center'},
			{label: '运行平台',name:'appRuntimeEnv',index:'appRuntimeEnv',width:70, fixed: true, align: 'center',
				formatter: function(val, options, re){
					switch(val){
						case 1: return '安卓';
						case 2: return 'IOS';
						case 3: return 'WEB';
						default : return '未知';
					}
				}
			},
			{label: '游戏厂商',name:'merchantName',index:'merchantName',width:120, align: 'center'},
			{label: '分组',name:'appType',index:'appType',width:70, fixed: true, align: 'center',
				formatter: function(val, options, re){
					$.each(globalData.gameTypeArr, function(index, obj) {
						if(val === obj.id){
							val = obj.typeName;
							return false;
						}
					});
					return val;
				}
			},
			{label: '状态',name:'status',index:'status',width:70, fixed: true, align: 'center',
				formatter: function(val, options, re){
					$.each(globalData.gameStatusArr, function(index, obj) {
						if((val + '') === obj.val){
							val = obj.txt;
							return false;
						}
					});
					return val;
				}
			},
			{label: '操作',name:'',index:'',width:200, fixed: true, align: 'center',
				formatter: function(val, col, row){
					var str = '';
					$.each(globalData.listBtn, function(index, obj){
						if(postData.status === obj.val){
							if((obj.val === '3') && (row.gameType === 4) && ((row.officialStatus === 1) || (row.officialStatus === 3))){//说明是彩票游戏
								if((row.officialStatus === 1) && obj.cbtns){//说明彩票游戏待审中
									$.each(obj.cbtns, function(i, o){
										str += '<button onclick="gridBtnClick(\'' + o.val + '\', \'' + row.id + '\')" class="btn btn-xs btn-primary">' + o.text + '</button> ';
									});
								}else if((row.officialStatus === 3) && obj.csbtns){//说明彩票游戏可以查询状态
									$.each(obj.csbtns, function(i, o){
										str += '<button onclick="gridBtnClick(\'' + o.val + '\', \'' + row.id + '\')" class="btn btn-xs btn-primary">' + o.text + '</button> ';
									});
								}
							}else{
								$.each(obj.buttons, function(i, o){
									str += '<button onclick="gridBtnClick(\'' + o.val + '\', \'' + row.id + '\')" class="btn btn-xs btn-primary">' + o.text + '</button> ';
								});
							}
						}
					});
					return str;
				}
			}
		];
	if(postData.status === '1'){
		colModel.splice(6, 0, {label: '不通过原因',name:'attribute',index:'attribute',width:120, align: 'center'});
	}

	//数据重新呈现，先解除绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, 'recordList', '游戏列表');
}


//表格中所有按键的点击事件
//1：查看，2：删除，3：通过，4：不通过，5：上架，6：下架，7：置顶，8：取消置顶，9：'提交审核'，10：'查询状态'
function gridBtnClick(btntype, id){
	switch(btntype){
		case '1': (window.open('GameUpload.html?gameId=' + id));
		break;
		case '2': onDeleteFn(id);//删除游戏，暂无此功能
		break;
		case '3': onThroughFn(id);//通过当前游戏
		break;
		case '4': onNotThroughFn(id);//不通过当前游戏
		break;
		case '5': onSoldUpFn(id);//上架当前游戏
		break;
		case '6': onSoldOutFn(id);//下架当前游戏
		break;
		case '7': onPlacedTopFn(id);//置顶当前游戏，暂无此功能
		break;
		case '8': onNoPlacedTopFn(id);//取消置顶当前游戏，暂无此功能
		break;
		case '9': onsubmitAuditFn(id);//提交审核
		break;
		case '10': onsearchStatusFn(id);//查询状态
		break;
		case '11': onResetAudit(id);//查询状态
		break;
	}
}

//通过当前游戏
function onThroughFn(id){
	var _url = '/ushop-web-admin/platform/game/manager/audit/' + id;
	Common.jBoxConfirm('确认操作', '您确定要通过此游戏吗！', function(index){
		if(index == 1){
			Common.ajax(_url, 'post', {}, function(data){
				if(data.result == 'SUCCESS'){
					Common.jBoxNotice('操作成功！', 'green');
					getGameListFn.apply(null, globalData.gridParam);//刷新界面数据
				}else{
					Common.jBoxNotice((data.error_description || '未知错误'), 'red');
				}
			});
		}
	});
}

//不通过当前游戏
function onNotThroughFn(id){
	Common.jBoxConfirm('请输入不通过原因', '<input type="text" id="confirmBoxInput">', function(index){
		if(index == 1){
			var val = $('#confirmBoxInput').val();
			if(!val){
				Common.jBoxNotice('不通过原因必须填写', 'red');
				return false;
			}
			if(val.length > 20){
				Common.jBoxNotice('不能超过20个字', 'red');
				return false;
			}
			var _url = '/ushop-web-admin/platform/game/manager/unAudited';
			Common.ajax(_url, 'post', {id: id, feedback: val}, function(data){
				if(data.result == 'SUCCESS'){
					Common.jBoxNotice('操作成功！', 'green');
					getGameListFn.apply(null, globalData.gridParam);//刷新界面数据
				}else{
					Common.jBoxNotice((data.error_description || '未知错误'), 'red');
				}
			});
		}
	});
}


//上架当前游戏
function onSoldUpFn(id){
	var _url = '/ushop-web-admin/platform/game/manager/up/' + id;
	Common.jBoxConfirm('确认操作', '您确定上架此游戏吗！', function(index){
		if(index == 1){
			Common.ajax(_url, 'post', {}, function(data){
				if(data.result == 'SUCCESS'){
					Common.jBoxNotice('操作成功！', 'green');
					getGameListFn.apply(null, globalData.gridParam);//刷新界面数据
				}else{
					Common.jBoxNotice((data.error_description || '未知错误'), 'red');
				}
			});
		}
	});
}


//下架当前游戏
function onSoldOutFn(id){
	var _url = '/ushop-web-admin/platform/game/manager/down/' + id;
	Common.jBoxConfirm('确认操作', '您确定用将此游戏下架吗！', function(index){
		if(index == 1){
			Common.ajax(_url, 'post', {}, function(data){
				if(data.result == 'SUCCESS'){
					Common.jBoxNotice('操作成功！', 'green');
					getGameListFn.apply(null, globalData.gridParam);//刷新界面数据
				}else{
					Common.jBoxNotice((data.error_description || '未知错误'), 'red');
				}
			});
		}
	});
}

//游戏下架状态重新审核
function onResetAudit(id){
	var _url = '/ushop-web-admin/platform/game/manager/commit/' + id;
	Common.jBoxConfirm('确认操作', '是否提交重新审核！', function(index){
		if(index == 1){
			Common.ajax(_url, 'post', {}, function(data){
				if(data.result === 'SUCCESS'){
					Common.jBoxNotice('操作成功！', 'green');
					getGameListFn.apply(null, globalData.gridParam);//刷新界面数据
				}else{
					Common.jBoxNotice((data.error_description || '未知错误'), 'red');
				}
			});
		}
	});
}

//彩票游戏提交到省积分后台审核
function onsubmitAuditFn(id){
	var _url = '/ushop-web-admin/platform/game/cert/submit/' + id;
	Common.jBoxConfirm('确认操作', '这是一款彩票游戏，是否确定将此游戏提交到省积分后台审核！', function(index){
		if(index == 1){
			Common.ajax(_url, 'post', {}, function(data){
				if(data.id){
					Common.jBoxNotice('操作成功！', 'green');
					getGameListFn.apply(null, globalData.gridParam);//刷新界面数据
				}else{
					Common.jBoxNotice((data.error_description || '未知错误'), 'red');
				}
			});
		}
	});
}

//查询状态，省积分后台审核状态
function onsearchStatusFn(id){
	var _url = '/ushop-web-admin/platform/game/cert/check/' + id;
	Common.ajax(_url, 'get', {}, function(data){
		if(data.id){
			Common.jBoxNotice('查询成功！', 'green');
			getGameListFn.apply(null, globalData.gridParam);//刷新界面数据
		}else{
			Common.jBoxNotice((data.error_description || '未知错误'), 'red');
		}
	});
}

//删除当前游戏
function onDeleteFn(id){
	
}

//置顶当前游戏
function onPlacedTopFn(id){
	
}


//取消置顶当前游戏
function onNoPlacedTopFn(id){
	
}