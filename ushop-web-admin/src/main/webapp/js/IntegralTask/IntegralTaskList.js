/**
 * 
 * IntegralTaskList.js
 * 积分任务-积分任务列表
 * 作者：xulin
 * 
 * */


//硬性数据
var globalData = {};
jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('积分管理', '积分配置','积分管理后台');
	
	
	//全局参数请求
	globalDataFn(function(){
		//全局下拉框赋值
		optionStr = '<option value="">请选择</option>';
		$.each(globalData.fundUsageList, function(index, obj){
			optionStr += '<option value="' + obj.id + '">' + obj.val + '</option>';
		});
		$('.fundUsageList').html(optionStr);
		
		optionStr = '<option value="">请选择</option>';
		$.each(globalData.taskConditionList, function(index, obj){
			optionStr += '<option value="' + obj.id + '">' + obj.val + '</option>';
		});
		$('.taskConditionList').html(optionStr);
		
		optionStr = '<option value="">请选择</option>';
		$.each(globalData.fundTypeList, function(index, obj){
			optionStr += '<option value="' + obj.id + '">' + obj.val + '</option>';
		});
		$('.fundTypeList').html(optionStr);
		
		
		//活动任务列表
		activeTaskList('#itemsTable1', '#itemsPager1');
		
	})
	
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
	});
	
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
	
	
	$('.itemAdd').on('click', function(){
		addRow.call(this);
	});
	
	//查询按键
	$('.itemSearch').on('click', function(){
		onSearch.call(this);
	});
	
	//广告栏编辑点击确定事件绑定
	$('#saveAddEdit').on('click', function(){
		saveAddEdit.call(this);
	});

});

//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/task/getConstants';
	Common.dataAjax(_url, function(data){
		globalData.fundUsageList = data.fundUsageList;//积分用途列表
		globalData.taskConditionList = data.taskConditionList;//任务条件
		globalData.fundTypeList = data.fundTypeList;//积分类型
		globalData.taskTypeList = data.taskTypeList;//任务类型
		globalData.taskTargetTypeList = data.taskTargetTypeList;//目标类型
		callback.call(this, data);
	});
}


//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/new/banner/bannerList
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		startDate = $.trim(box.find('.form_datetime.start').val()),
		endDate = $.trim(box.find('.form_datetime.end').val()),
		selectClassType = $.trim(box.find('.selectClassType').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	if(startDate && endDate){
		if(new Date(endDate).getTime() <= new Date(startDate).getTime()){
			Common.jBoxNotice('结束时间要大于起始时间', 'red');
			return false;
		}
	}else{
		startDate = '';
		endDate = '';
	}
	var postData = {
		startDate: startDate,
		endDate: endDate,
		bannerType: selectClassType
	};
	activeTaskList('#itemsTable1', '#itemsPager1', postData);
}


//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
//http://10.35.0.66:8080/ushop-web-admin/admin/pointsTask/list
function activeTaskList(tableId, pagerId, postData){
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/admin/pointsTask/list'
		colModel = [
			{label: 'ID',name:'id',index:'id', hidden: true},
			{label: '任务名称',name:'name',index:'name',width:100, align: 'center'},
			{label: '开始时间',name:'startDate',index:'startDate',width:100, align: 'center'},
			{label: '结束时间',name:'endDate',index:'endDate',width:100 , align: 'center'},
			{label: '奖励类型',name:'rewardType',index:'rewardType',width:140, align: 'center',
				formatter: function(cellVal, cellData , rowData){
					$.each(globalData.fundTypeList, function(index, obj) {
						if(cellVal == obj.id){
							cellVal = obj.val;
							return false;
						}
					});
					return cellVal || '';
				}
			},
			{label: '奖励值',name:'rewardValue',index:'rewardValue',width:120, align: 'center'},
			{label: '用途',name:'usage',index:'usage',width:120, align: 'center',
				formatter: function(cellVal, cellData , rowData){
					$.each(globalData.fundUsageList, function(index, obj) {
						if(cellVal == obj.id){
							cellVal = obj.val;
							return false;
						}
					});
					return cellVal || '';
				}
			},
			{label: '操作', name:'operation',index:'', width:120, align: 'center',
				formatter: function(cellVal, cellData , rowData){
					var str = '<button rowStr=\'' + JSON.stringify(rowData) + '\' class="btn btn-xs btn-primary" onclick="editorRow(this)">编辑</button> '+
							  '<button class="btn btn-xs btn-primary" onclick="deleteRow(' + rowData.id + ', ' + cellData.rowId + ')">删除</button>';
					return str;
				}
			}

		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}

//新增
//http://10.35.0.66:8080/ushop-web-admin/admin/pointsTask/save
function addRow(){
	var modal = $('#pageModal');
	modal.find('input, select').val('');
	modal.modal('show').attr('typeId', '');
};

//编辑
//http://10.35.0.66:8080/ushop-web-admin/admin/pointsTask/edit
function editorRow(me){
	var rowData = JSON.parse($(me).attr('rowStr'));
	var modal = $('#pageModal');
	$.each(rowData, function(key, val){
		if(modal.find('[name=' + key + ']').length > 0){
			modal.find('[name=' + key + ']').val(val);
		}
	});
	modal.modal('show').attr('typeId', rowData.id);
}

//保存新增或编辑
function saveAddEdit(){
	var modal = $('#pageModal'),
		id = modal.attr('typeId');
	var _url = '',
		_param = {
			conditionType: modal.find('[name=conditionType]').val(),
			startDate: modal.find('[name=startDate]').val(),
			endDate: modal.find('[name=endDate]').val(),
			name: modal.find('[name=name]').val(),
			participateTime: modal.find('[name=participateTime]').val(),
			rewardType: modal.find('[name=rewardType]').val(),
			rewardValue: modal.find('[name=rewardValue]').val(),
			participateDaily : modal.find('[name=participateDaily]:checked').attr('id'),
			usage: modal.find('[name=usage]').val()
		};
		
	console.log(_param)
	if(!_param.conditionType){
		Common.jBoxNotice('请选择任务条件', 'red');
		return false;
	}
	if(!_param.startDate){
		Common.jBoxNotice('请选择开始时间', 'red');
		return false;
	}
	if(!_param.endDate){
		Common.jBoxNotice('请选择结束时间', 'red');
		return false;
	}
	if(!_param.name){
		Common.jBoxNotice('请输入任务名称', 'red');
		return false;
	}
	if(!(/^\d{1,}$/.test(_param.participateTime))){
		Common.jBoxNotice('请输入可参与次数，必须是数字', 'red');
		return false;
	}
	if(!_param.rewardType){
		Common.jBoxNotice('请选择奖励类型', 'red');
		return false;
	}
	if(!(/^\d{1,}$/.test(_param.rewardValue))){
		Common.jBoxNotice('请输入奖励值，必须是数字', 'red');
		return false;
	}
	if(!_param.usage){
		Common.jBoxNotice('请选择用途', 'red');
		return false;
	}
	var successStr = '',
		errorStr = '';
	if(id){//编辑列表
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/pointsTask/edit';
		_param.id = id;
		successStr = '编辑成功';
		errorStr = '编辑失败';
	}else{//新建列表
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/pointsTask/save';
		successStr = '新增成功';
		errorStr = '新增失败';
	}
	Common.dataAjaxPost(_url, _param, function(data, status){
		if(status == 'success'){
			if(data.status == 'success'){
				Common.jBoxNotice(successStr, 'green');
				activeTaskList('#itemsTable1', '#itemsPager1');
				modal.modal('hide');
			}else{
				Common.jBoxNotice(errorStr, 'red');
			}
		}else{
			Common.jBoxNotice('服务器请求失败', 'red');
		}
	});
}


//删除确定之后执行
//http://10.35.0.66:8080/ushop-web-admin/admin/pointsTask/delete/任务ID
function deleteRow(id, rowid){
	var delUrl = Common.DOMAIN_NAME + '/ushop-web-admin/admin/pointsTask/delete/' + id,
		param = {};
	Common.jBoxConfirm('确认信息', '您确定要删除此行吗？', function(index){
		if(index == 1){
			Common.dataAjaxPost(delUrl, param, function(ret, status){
				if(status == 'success'){
					if(ret.status == 'success'){
						Common.jBoxNotice('删除成功', 'green');
						activeTaskList('#itemsTable1', '#itemsPager1');
					}else{
						Common.jBoxNotice('删除失败', 'red');
					}
				}else{
					Common.jBoxNotice('服务器请求失败', 'red');
				}
			});
		}
	});
}