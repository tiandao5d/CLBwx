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
	Common.menuNavContent('渠道管理', '渠道列表','系统管理后台');
	
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
	});

		//广告栏数据列表显示
		channelInterfaceList('#itemsTable1', '#itemsPager1');
		
		//点击添加广告栏事件绑定
		$('.itemAdd').on('click', function(){
			pageModalFn('', 'add');
		});
//		var optionStr = '<option value="">请选择</option>';
//		$.each(globalData.announceTypeList, function(index, obj){
//			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
//		});
//		$('.announceTypeList').html(optionStr);
		
		//广告栏编辑点击确定事件绑定
		$('#determineClick').on('click', determineClick);
});

//广告栏编辑点击确定函数
//http://10.35.0.66:8080/ushop-web-admin/new/banner/editAnnounce
//http://10.35.0.66:8080/ushop-web-admin/new/banner/addAnnounce
//http://10.35.0.66:8080/ushop-web-admin/new/banner/deleteAnnounce
function determineClick(){
	var errStr = '',
		_url = '',
		_param = {};
	var pageModalTitle = $('#pageModalTitle'),
		typeName = pageModalTitle.attr('typeName'),
		rowId = pageModalTitle.attr('rowId'),
		id = pageModalTitle.attr('typeId');
	if(typeName == 'delete'){
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/channelInterface/delete/'+id;
		Common.dataAjaxPost(_url, {id: id}, function(data){
			//console.log(arguments)
			if(data.status == 'success'){
				Common.jBoxNotice('删除消息成功', 'green');
				$('#pageModal').modal('hide');
		    	channelInterfaceList('#itemsTable1', '#itemsPager1');
			}else{
				Common.jBoxNotice('删除消息失败', 'red');
			}
		});
		return false;
	}
	var name = $('#pageModal [name="name"]').val();
	if(!name||name.length>10){
		Common.jBoxNotice('渠道名称不能为空，不可超过十个字','red');
		return false;
		
	};
	_param = {
			name:name
	}
	if(typeName == 'edit'){
		_param.id = id;
		_url = Common.DOMAIN_NAME +'/ushop-web-admin/admin/channelInterface/edit';
	}else if(typeName == 'add'){
		_url = Common.DOMAIN_NAME +'/ushop-web-admin/admin/channelInterface/save';
	};
	Common.dataAjaxPost(_url, _param, function(data){
		if(data.status == 'success'){
			Common.jBoxNotice('操作成功', 'green');
		    channelInterfaceList('#itemsTable1', '#itemsPager1');
		}else{
			Common.jBoxNotice('操作失败', 'red');
		}
	});
	$('#pageModal').modal('hide');
}


function channelInterfaceList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/admin/channelInterface/list'
		colModel = [
			{label: '渠道ID',name:'channelId',index:'channelId',width:180, align: 'center'},
			{label: '记录ID',name:'id',index:'id',width:60, align: 'center'},
			{label: '渠道名称',name:'name',index:'name',width:100 , align: 'center'},
			{label: '创建时间',name:'createTime',index:'createTime',width:120, align: 'center',
				formatter: function(val,cellval,colpos,rwdat){
			   		var str = '';
			   		str = Common.msToTime(val);
			   		return str
			   }
			},
			{label: '操作', name:'operation',index:'', width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
//					var str = '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'edit\', ' + cellval.rowId + ')">编辑</button> '+
					var str = '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'delete\', ' + cellval.rowId + ')">删除</button>';
					return str;
				}
			}

		];
		//console.log(postData);
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '渠道列表');
}
//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/new/announce/getById?Id=1
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
	
	if(announce){		
		$.each(announce,function(key,val){
			if(modal.find('[name=' + key + ']').length > 0){
				modal.find('[name=' + key + ']').val(val);
			}
		})
	}	
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'渠道配置'});
}