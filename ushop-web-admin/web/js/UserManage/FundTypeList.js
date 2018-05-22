/**
 * 
 * NoticeManage.js
 * 订单管理-通告栏
 * 作者：xulin
 * 
 * */

//硬性数据
var globalData = {};
jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('用户管理', '资金类型列表', '用户管理后台');
	//日期选择器绑定
	$(".form_datetime.dd").datetimepicker({
		format:'yyyy-mm-dd',
		autoclose:true,
		language: 'zh-CN',
		startView: 2,
		maxView: 4,
		minView:2 
	});
	//绑定只读的日期选择输入框一个双击清空的事件
	$(".form_datetime[readonly]").dblclick(function(){
		$(this).val('').blur();
	});
	//全局变量赋值，页面数据初始化完成后执行页面操作
	globalDataFn(function(data){
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			$(window).trigger('resize.jqGrid');
		});
		
		
		//搜索栏选择框赋值
//		$.each(globalData.accountProvince, function(index, obj){
//			if(index == 0){
//				optionStr += '<option value="">请选择</option>';
//			}
//			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
//		});
//		$('.selectClassType').html(optionStr);
		$.each(globalData.fundType, function(index, obj){
			if(index == 0){
				optionStr += '<option value="">全部</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.fundName').html(optionStr);
			
		//查询按键
		$('.itemSearch').on('click', onSearch);
		
		//数据列表显示
		fundTypeList('#itemsTable1', '#itemsPager1');
		
		//点击添加事件绑定
		$('.itemAdd').on('click', function(){
			pageModalFn('', 'add');
		});
		
		
		//编辑点击确定事件绑定
		$('#determineClick').on('click', determineClick);
	});
});

//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	Common.ajaxAll([
		{url: '/ushop-web-admin/account/fundType/getConstants'},
		{url: '/ushop-web-admin/account/fundType/list'} // 货币类型请求
	], function () {
		globalData.accountProvince = arguments[0].accountProvince; // 省份列表
		globalData.platfromList = arguments[0].platfromList; // 平台列表
		
		globalData.fundType = arguments[1].recordList; // 积分列表
		callback();
	})
}

//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/banner/AnnounceList
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		fundName = $.trim(box.find('[name="fundName"]').val()),
		comments = $.trim(box.find('[name="comments"]').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		fundName: fundName,
		comments: comments
		
	};
	fundTypeList('#itemsTable1', '#itemsPager1', postData);
}


//资金类型编辑点击确定函数
function determineClick(){
	var errStr = '',
		_url = '',
		_param = {};
	var pageModalTitle = $('#pageModalTitle'),
		typeName = pageModalTitle.attr('typeName'),
		rowId = pageModalTitle.attr('rowId'),
		id = pageModalTitle.attr('typeId');
	if(typeName == 'delete'){
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/account/fundType/deleteById';
		Common.dataAjaxPost(_url, {id: id}, function(){
			$('#itemsTable1').delRowData(rowId);
			$('#pageModal').modal('hide');
		});
		return false;
	}
	var fundName = $('#pageModal [name="fundName"]').val(),
	    comments = $('#pageModal [name="comments"]').val(),
	    parentId = $('#pageModal [name="parentId"]').val(),
	    gameId = $('#pageModal [name="gameId"]').val(),
	    agent = $('#pageModal input[name="agent"]:checked').val(),
		provinceId = $('#pageModal .selectClassType1').val(),
		platfromTypeId = $('#pageModal .selectClassType2').val();
	if(!fundName){
		Common.jBoxNotice('资金类型不能为空','red');
		return false;
	}
	if(!comments){
		Common.jBoxNotice('备注不能为空','red');
		return false;
	}
	if(!provinceId){
		Common.jBoxNotice('省份不能为空','red');
		return false;
	}
	if(!platfromTypeId){
		Common.jBoxNotice('平台不能为空','red');
		return false;
	}
	if(!/^\d+$/.test(parentId)){
		Common.jBoxNotice('代理编号为整数','red');
		return false;
	}
	if(!/^\d+$/.test(gameId)){
		Common.jBoxNotice('彩种为整数','red');
		return false;
	}
	_param = {
		//URL: pictureAddress,
			fundName :　fundName,
			comments :　comments,
			agent : agent,
			gameId : gameId,
			parentId :parentId,
			platfromTypeId : platfromTypeId,
			provinceId : provinceId
	}
	if(typeName == 'add'){
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/account/fundType/add';
	}else if(typeName == 'edit'){
		_param.id = id;
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/account/fundType/update';
	}
	Common.dataAjaxPost(_url, _param, function(data){
		if(data.data == 'SUCCESS'){
			Common.jBoxNotice('操作成功','green');
//			fundTypeList('#itemsTable1', '#itemsPager1');
			window.location.reload();
		}else{
			Common.jBoxNotice('操作失败','red');
		}
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
//http://10.35.0.66:8080/ushop-web-admin/announce/announceList
function fundTypeList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/account/fundType/listBy'
		colModel = [
			{label: '资金类型名称',name:'fundName',index:'fundName',width:100, align: 'center'},
			{label: '备注',name:'comments',index:'comments',width:140, align: 'center'},
			{label: '代理编号',name:'parentId',index:'parentId',width:80, align: 'center'},
			{label: '彩种',name:'gameId',index:'gameId',width:80, align: 'center'},
			{label: '省份',name:'provinceId',index:'provinceId',width:100 , align: 'center',
			formatter: function(val){
				    val = val || 0;
					$.each(globalData.accountProvince, function(index, obj) {
						if(val == obj.value){
							val = obj.desc;
							return false;
						}
					});
					return val;
				}
			},
			{label: '代理',name:'agent',index:'agent',width:100 , align: 'center',
			formatter: function(val){
					var str = val ? '代理':'非代理'
					return str
				}
			},
			{label: '发布时间',name:'createTime',index:'createTime',width:100, align: 'center',
				formatter: function(val, cellval, colpos, rwdat){
				    var str = '';
				    if(val){str=Common.msToTime(val);}
				    return str
				 }
			},
			{label: '最后修改时间',name:'lastTime',index:'lastTime',width:120, align: 'center',
				formatter: function(val, cellval, colpos, rwdat){
				    var str = '';
				    if(val){str=Common.msToTime(val);}
				    return str
				 }
			},
			{label: '操作', name:'operation',index:'', width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
                    var str = '';
                    if(colpos.id>1001){
						 str += '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'edit\', ' + cellval.rowId + ')">编辑</button> '+
								  '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'delete\', ' + cellval.rowId + ')">删除</button>';
                    }
					return str;
				}
			}

		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '资金类型列表');
}
//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/announce/getAnnounceById?Id=1
function pageModalFn(id, typeName, rowId){
	rowId = rowId || '';
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/account/fundType/getById?id=' + id;
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	modal.modal('show');
	pageModalTitle.attr({'typeName' : typeName, 'typeId' : id, 'rowId' : rowId});
	if(typeName == 'edit'){
		Common.dataAjax(url, function(data){
			pageModalTitle.html('编辑');
			strHtmlFn(data.accountFundType, id);
		});
	}else if(typeName == 'delete'){
		pageModalTitle.html('删除');
		pageModalItem1.html('是否删除此条');
	}else if(typeName == 'add'){
		pageModalTitle.html('添加');
		strHtmlFn();
	}
}

//添加列表
function strHtmlFn(fund, id){
	fund = fund ? fund : {};
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	var optionStr1 = '',
		optionStr2 = '',
		optionStr3 = '',
		imgStr = '';
	var provinceId = fund.provinceId || 0,
	    fundName = fund.fundName || '',
	    parentId = fund.parentId || 0,//代理编号
	    gameId = fund.gameId || 0,//彩种
	    platfromTypeId = fund.platfromTypeId || 10,
	    agent = fund.agent || 0,
	    comments = fund.comments || '';
	$.each(globalData.accountProvince, function(index, obj) {
		if(provinceId == obj.value){
			optionStr1 += '<option value="' + obj.value + '" selected>' + obj.desc + '</option>';
		}else{ 
			optionStr1 += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		}
	});
	$.each(globalData.platfromList, function(index, obj) {
		if(platfromTypeId == obj.value){
			optionStr2 += '<option value="' + obj.value + '" selected>' + obj.desc + '</option>';
		}else{ 
			optionStr2 += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		}
	});
	$.each(globalData.fundType, function(index, obj){
		if(fundName == obj.desc){
			optionStr3 += '<option value="' + obj.value + '" selected desc="'+obj.desc+'">' + obj.desc + '</option>';
			fundName = obj.desc;
		}else{ 
			optionStr3 += '<option value="' + obj.value + '" desc="'+obj.desc+'">' + obj.desc + '</option>';
		}
	});
	var fundNameBox = '';
//	if(id){
//		fundNameBox = '<select class="form-control fundType1" name="fundName" id="fundName">' + optionStr3 + '</select>'
//	}else{
		fundNameBox = '<input type="text" class="form-control" name="fundName">'
//	}
	str =   '<div class="form-horizontal">'+
      			'<div class="form-group">'+
      				'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>资金类型名称</label>'+
      				'<div class="col-xs-8">'+
      					fundNameBox+
      				'</div>'+
      			'</div>'+
      			'<div class="form-group">'+
      				'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>备注</label>'+
      				'<div class="col-xs-8">'+
						'<input name="comments" class="form-control" value="' + comments + '" type="text">'+
      				'</div>'+
      			'</div>'+
      			'<div class="form-group" >'+
					'<label class="control-label col-xs-4"><i style="color: #f00;">* </i>可代理</label>'+
					'<div class="col-xs-8">'+
						'<div style="border-radius: 0!important;color: #858585;padding: 5px 4px 6px;font-size: 14px;">'+
						'<input type="radio" name="agent" value="1"> 是'+
						'<input type="radio" name="agent" value="0" checked> 否</div>'+
					'</div>'+
				'</div>'+
				
      			'<div class="form-group">'+
      				'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>省份</label>'+
      				'<div class="col-xs-8">'+
      					'<select class="form-control selectClassType1" name="provinceId">' + optionStr1 + '</select>'+
      				'</div>'+
      			'</div>'+
      			'<div class="form-group">'+
      				'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>平台</label>'+
      				'<div class="col-xs-8">'+
      					'<select class="form-control selectClassType2" name="platfromTypeId">' + optionStr2 + '</select>'+
      				'</div>'+
      			'</div>'+
      			'<div class="form-group">'+
      				'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>代理编号</label>'+
      				'<div class="col-xs-8">'+
      					'<input type="text" class="form-control" name="parentId" val="'+parentId+'">'+
      				'</div>'+
      			'</div>'+
      			'<div class="form-group">'+
      				'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>彩种</label>'+
      				'<div class="col-xs-8">'+
      					'<input type="text" class="form-control" name="gameId" val="'+gameId+'">'+
      				'</div>'+
      			'</div>'+
      		'</div>';
	pageModalItem1.html(str);
	if(id){
	    pageModalItem1.find('[name=fundName]').val(fundName);
	    pageModalItem1.find('[name=platfromTypeId]').val(platfromTypeId);
	    pageModalItem1.find('[name=provinceId]').val(provinceId);
	    pageModalItem1.find('[name=agent][value='+agent+']').attr('checked',true);
	    pageModalItem1.find('[name=gameId]').val(gameId);
	    pageModalItem1.find('[name=parentId]').val(parentId);
	}
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'资金类型列表'});
}