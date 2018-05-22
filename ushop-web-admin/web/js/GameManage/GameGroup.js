/**
 * 
 * GameGroup.js
 * 游戏分组
 * 作者：xulin
 * 
 * */
"use strict";
jQuery(function($) {
	//左侧菜单显示
	Common.menuNavContent('游戏管理', '游戏分类','游戏管理后台');
	//查询按键
	$('.itemSearch').on('click', function(){
		var me = $(this),
			box = me.parents('.tabPane'),
			id = box.attr('id'),
			gameClassName = box.find('.gameClassName').val(),
			table = box.find('.itemGridTable'),
			pager = box.find('.itemGridPager');
		var postData = {
			appTypeName: gameClassName
		}
		gameGroupFn('#itemsTable1', '#itemsPager1', postData);
	});
	
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
	});
	gameGroupFn('#itemsTable1', '#itemsPager1');
});



//游戏分类列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    额外参数
function gameGroupFn(tableId, pagerId, postData){
	var gridUrl = '/ushop-web-admin/platform/game/type/listBy',
		colModel = [
			{label: 'ID',name:'id',index:'id', hidden: true},
			{label: '分类',name:'typeName',index:'typeName',width:90, align: 'center', editable: true, edittype:"text"},
			{label: '操作', name:'operation',index:'', width:120, align: 'center', fixed:true, sortable:false, resize:false,
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					var cellStr = JSON.stringify(colpos),
						rowStr = JSON.stringify(rwdat);
					 	str += '<button class="btn btn-xs btn-primary" onclick="pageModalFn('+colpos.id+',\''+colpos.typeName+'\')">编辑</button> ';
					 	str += '<button class="btn btn-xs btn-primary" onclick="removeRow('+colpos.id+')">删除</button> ';
					return str;
				}
			}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, 'recordList', '游戏分类');
}
//编辑分类
function pageModalFn(id,typeName){
	if(id){	
		$('#myModalLabel').html('编辑分类');
	}else{
		$('#myModalLabel').html('新增分类');
	}
	var modal = $('#addGroupForm');
	modal.modal('show');
	$('#groupName').val(typeName||'');	
	$('#addEditRow').unbind('click').on('click',function(){
		addEditRow(id);
	})
}


//新增或编辑分类的函数
function addEditRow(id){
	var typeName = $('#groupName').val(),
	_url = '/ushop-web-admin/platform/game/type/update';
	var _param = {
		id: id,
		typeName : typeName
	};
	if(id){
		_param.id = id;
		Common.ajax(_url, 'post', _param, function(data){
			if(data.result === 'SUCCESS'){
				Common.jBoxNotice('编辑成功', 'green');
				gameGroupFn('#itemsTable1', '#itemsPager1');
			}else{
				Common.jBoxNotice((data.error_description || '未知错误'), 'red');
			}
		});
	}else{
		_url = '/ushop-web-admin/platform/game/type/add';
		Common.ajax(_url, 'post', {typeName: typeName}, function(data){
			if(data.id){
				Common.jBoxNotice('新增成功', 'green');
				gameGroupFn('#itemsTable1', '#itemsPager1');
			}else{
				Common.jBoxNotice((data.error_description || '未知错误'), 'red');
			}
		});
	}
}

//删除确定之后执行
function removeRow(id){
	var _url = '/ushop-web-admin/platform/game/type/delete/' + id;
	Common.jBoxConfirm('确认信息', '您确定要删除此任务吗？', function(index){
		if(index == 1){
			Common.ajax(_url, 'post', {}, function(data){
				if(data.result == 'SUCCESS'){
					Common.jBoxNotice('删除成功', 'green');
					gameGroupFn('#itemsTable1', '#itemsPager1');
				}else{
					Common.jBoxNotice((data.error_description || '未知错误'), 'red');
				}
			})
		}
	});
}
