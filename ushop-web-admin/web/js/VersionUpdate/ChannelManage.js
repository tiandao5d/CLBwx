/**
 * 
 * VersionUpdate.js
 * 推送消息列表
 * 作者：zl
 * 
 * */
'use strict';
var globalData=[];
jQuery(function($) {
	var optionStr = '';
   
	//菜单面包屑导航等配置显示
	Common.menuNavContent('版本更新', '渠道管理', '运营管理后台');
	//表格呈现
	channelUpdateList('#itemsTable1', '#itemsPager1');
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
		$(window).trigger('resize.jqGrid');
	});
	//	查询按键
	$('.itemSearch').on('click', function() {
		onSearch.call(this);
	});
})


	//版本更新列表
	//tableId     表格ID，带有#的string类型
	//pagerId     操作栏ID，带有#的string类型
	//postData    传给服务器的参数
function channelUpdateList(tableId, pagerId, postData) {
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/update/channel/list',
		colModel = [ {
				label: '渠道',
				name: 'channelName',
				index: 'channelName',
				width: 100,
				align: 'center',

			},  {
				label: '更新时间',
				name: 'createTime',
				index: 'createTime',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					cellVal = new Date(cellVal).toLocaleString().replace('/年|月/g', "-").replace('/日/g', " ");
					return cellVal;
				}
			},  {
				label: '操作',
				name: 'operation',
				index: '',
				width: 200,
				align: 'center',
				fixed: 'true',
				formatter: function(val, cellval, colpos, rwdat) {
					var str = '<button class="btn btn-xs btn-primary" onclick="editChannelFn(' + colpos.id + ')">编辑</button> ';
					return str;
				}
			}

		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}
//新增弹窗
function addChannelFn() {
	var modal = $("#pageModal");
	modal.modal('show');
	modal.find('input').val('');
	$("#determineClick").removeClass('hide');
	$("#editClick").addClass('hide');
  
}
//编辑弹窗
function editChannelFn(id) {
	globalData.id=id;
	var modal = $("#pageModal");
	$("#determineClick").addClass('hide');
	$("#editClick").removeClass('hide');
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/update/channel/get?id='+ id;
	  Common.dataAjax(_url, function(data){
			modal.find('.channel').val(data.channelName);
		})
	modal.modal('show');
  
}
//新增确定函数
function updateChannel(){
	var modal = $("#pageModal"),
	    _param = {},
	    channelName = modal.find('.channel').val(),
	    _param = {
	    	channelName:channelName,
	    };
	    if(!_param.channelName){
	    	Common.jBoxNotice('请填写渠道名称','red');
	    	return false;
	    }
	  
	    
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/update/channel/add';
	Common.dataAjaxPost(_url, _param, function(data) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice('操作成功', 'green');
			modal.modal('hide');
			channelUpdateList('#itemsTable1', '#itemsPager1');

		} else {
			Common.jBoxNotice(data.error_description, 'red');
			return false
		}
	});
	    modal.modal('hide');
	    
}
//编辑确定函数
function editChannel(){
	var modal = $("#pageModal"),
	    _param = {},
	    channelName = modal.find('.channel').val(),
	    _param = {
	    	channelName:channelName,
	    	id:globalData.id
	    };
	    if(!_param.channelName){
	    	Common.jBoxNotice('请填写渠道名称','red');
	    	return false;
	    }
	  
	    
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/update/channel/update';
	Common.dataAjaxPost(_url, _param, function(data) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice('操作成功', 'green');
			modal.modal('hide');
			channelUpdateList('#itemsTable1', '#itemsPager1');

		} else {
			Common.jBoxNotice(data.error_description, 'red');
			return false
		}
	});
	    modal.modal('hide');
	    
}
//导出列表
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '版本更新列表'
	});
}