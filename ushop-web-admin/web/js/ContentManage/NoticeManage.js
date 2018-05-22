/**
 * 
 * NoticeManage.js
 * 内容管理-通告栏
 * 作者：xulin
 * 
 * */

var globalData = {};
jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('消息管理', '消息列表','运营管理后台');
	
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
	});
	
	
	
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
	jeDate({
		dateCell:"#pageModal .startDate",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#pageModal .endDate",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	//绑定只读的日期选择输入框一个双击清空的事件
	$(".form_datetime[readonly]").dblclick(function(){
		$(this).val('').blur();
	});
	globalDataFn(function(data){	
		
		//搜索栏选择框赋值
		$.each(globalData.announceTypeList, function(index, obj){
			if(index == 0){
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.selectClassType').html(optionStr);
		//查询按键
		$('.itemSearch').on('click', onSearch);
		
		//广告栏数据列表显示
		AnnounceList('#itemsTable1', '#itemsPager1');
		
		//点击添加广告栏事件绑定
		$('.itemAdd').on('click', function(){
			pageModalFn('', 'add');
		});
		var optionStr = '<option value="">请选择</option>';
		$.each(globalData.announceTypeList, function(index, obj){
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.announceTypeList').html(optionStr);
		
		//广告栏编辑点击确定事件绑定
		$('#determineClick').on('click', determineClick);
	});
	var modal = $('#pageModal');
	modal.on('hide.bs.modal', function (e) {
		modal.find('input').val('');
		modal.find('select').val('');
		modal.find('textarea').val('');
	})
});

//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/announce/getConstants';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.announceTypeList = data.announceTypeList;
			callback.call(this, data);
		}else{
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}

	});
}

//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/banner/AnnounceList
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		startDate = $.trim(box.find('.form_datetime.start').val()),
		endDate = $.trim(box.find('.form_datetime.end').val()),
		selectClassType = $.trim(box.find('.selectClassType').val()),
		title = $.trim(box.find('[name="title1"]').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
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
	var postData = {
		startDate: startDate,
		endDate: endDate,
		announceType: selectClassType,
		title: title
		
	};
	AnnounceList('#itemsTable1', '#itemsPager1', postData);
}


//广告栏编辑点击确定函数
//http://10.35.0.66:8080/ushop-web-admin/banner/editAnnounce
//http://10.35.0.66:8080/ushop-web-admin/banner/addAnnounce
//http://10.35.0.66:8080/ushop-web-admin/banner/deleteAnnounce
function determineClick(){
	var errStr = '',
		_url = '',
		_param = {};
	var pageModalTitle = $('#pageModalTitle'),
		typeName = pageModalTitle.attr('typeName'),
		rowId = pageModalTitle.attr('rowId'),
		id = pageModalTitle.attr('typeId');
	if(typeName == 'delete'){
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/announce/delete';
		Common.dataAjaxPost(_url, {id: id}, function(data){
			//console.log(arguments)
			if(data.data == 'SUCCESS'){
				Common.jBoxNotice('删除消息成功', 'green');
				window.location.reload();
//				$('#itemsTable1').delRowData(rowId);
//				$('#pageModal').modal('hide');
			}else{
				Common.jBoxNotice('删除消息失败', 'red');
			}
		});
		return false;
	}
	var announceType = $('[name="announceType"]').val(),
		title = $('[name="title"]').val(),
		content = $('[name="content"]').val(),
		startTime = $('.startDate').val(),
		sender = $('[name="sender"]').val(),
		endTime = $('.endDate').val();
	if(!announceType){
		Common.jBoxNotice('所属模块不能为空','red');
		return false;
	}
	if(!title){
		Common.jBoxNotice('标题不能为空','red');
		return false;
	}
	if(!content){
		Common.jBoxNotice('内容不能为空','red');
		return false;
	}
	if(!startTime){
		Common.jBoxNotice('开始时间不能为空','red');
		return false;
	}
	if(!endTime){
		Common.jBoxNotice('结束时间不能为空','red');
		return false;
	}
	if(new Date(startTime).getTime()>new Date(endTime).getTime()){
	  	Common.jBoxNotice('结束时间要大于起始时间','red');
		return false;
	}
	_param = {
		title :　title,
		content :　content,
		valid: '123',
		type : announceType,
		sender : sender,
		endTime : endTime,
		beginTime : startTime
	};
	if(typeName == 'edit'){
		_param.id = id;
		_url = Common.DOMAIN_NAME +'/ushop-web-admin/sns/announce/edit';
	}else if(typeName == 'add'){
		_url = Common.DOMAIN_NAME +'/ushop-web-admin/sns/announce/add';
	};
	Common.dataAjaxPost(_url, _param, function(data){
		if(data.data == 'SUCCESS'){
			Common.jBoxNotice('操作成功', 'green');
		    AnnounceList('#itemsTable1', '#itemsPager1');
		}else{
			Common.jBoxNotice('操作失败', 'red');
		}
		//$('#itemsTable1').addRowData(rowId);
	});
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
function AnnounceList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/sns/announce/list'
		colModel = [
			{label: '标题',name:'title',index:'title',width:100, align: 'center'},
			{label: '内容',name:'content',index:'content',width:140, align: 'center'},
			{label: '发布者',name:'sender',index:'sender',width:100 , align: 'center'},
			{label: '发布时间',name:'createTime',index:'createTime',width:100, align: 'center',
				formatter: function(val,cellval,colpos,rwdat){
			   		var str = '';
			   		str = Common.msToTime(val);
			   		return str
			   }
			},
			{label: '所属功能模块',name:'type',index:'type',width:120, align: 'center',
			   formatter: function(val,cellval,colpos,rwdat){
			   	 switch(val){
			   	 	case 1 : return '通知公告';
			   	 	case 2 : return '最新活动';
			   	 	case 3 : return '最新消息';
			   	 	default : return '错误';
			   	 }
			   }
			},
			{label: '开始时间',name:'beginTime',index:'beginTime',width:120, align: 'center'},
			{label: '结束时间',name:'endTime',index:'endTime',width:120, align: 'center'},
			{label: '操作', name:'operation',index:'', width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
//					console.log(arguments);
					var str = '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'edit\', ' + cellval.rowId + ')">编辑</button> '+
							  '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'delete\', ' + cellval.rowId + ')">删除</button>';
					return str;
				}
			}

		];
		//console.log(postData);
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '通告列表');
}
//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/announce/getById?Id=1
function pageModalFn(id, typeName, rowId){
	rowId = rowId || '';
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/announce/getById?id='+id ;
	var modal = $('#pageModal'),  
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	modal.modal('show');
	pageModalTitle.attr({'typeName' : typeName, 'typeId' : id, 'rowId' : rowId});
	if(typeName == 'edit'){
		Common.dataAjax(_url,function(data){
			pageModalTitle.html('编辑');
			strHtmlFn(data.announce, id);
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
function strHtmlFn(announce, id){
	announce = announce ? announce : {};
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	var optionStr1 = '',
		optionStr2 = '',
		content = announce.content || '',
		title = announce.title || '',
		sender = announce.sender || '',
		beginTime = announce.beginTime || '',
		endTime = announce.endTime || '',
		imgStr = '';
	
//	if(!id){
//		sender = Common.getCookie('xlStorageUserName');
//    	senderStr = '<input type="text" name="sender"  class="form-control"  readonly value="' + sender + '">';		
//	}else{
//    	senderStr = '<input type="text" name="sender"  class="form-control"  value="' + sender + '">';
//	}
//	var announceType = announce.type || 1;
//	$.each(globalData.announceTypeList, function(index, obj) {
//		if(announceType == obj.value){
//			optionStr1 += '<option value="' + obj.value + '" selected>' + obj.desc + '</option>';
//		}else{
//			optionStr1 += '<option value="' + obj.value + '">' + obj.desc + '</option>';
//		}
//	});
	//imgStr = pictureAddress ? '<div style="padding-top: 10px;"><img style="width: 100px;" src="' + (Common.IMAGE_URL + pictureAddress) + '"></div>' : '';
	if(announce){		
		$.each(announce,function(key,val){
			if(modal.find('[name=' + key + ']').length > 0){
				modal.find('[name=' + key + ']').val(val);
			}
		})
		modal.find('.announceTypeList').val(announce.type);
	}	
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'消息列表'});
}