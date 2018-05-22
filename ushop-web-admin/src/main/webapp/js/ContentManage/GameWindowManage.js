/**
 * 
 * GameWindowManage.js
 * 内容管理-广告栏
 * 作者：roland
 * 
 * */

//硬性数据
var relationTypeList = [
		{desc:'商品',value:1},
		{desc:'页面',value:2}
    ];
var bannerPositionList = [
		{desc:'1号位',value:1},
		{desc:'2号位',value:2},
		{desc:'3号位',value:3},
		{desc:'4号位',value:4},
		{desc:'5号位',value:5},
		{desc:'6号位',value:6}
];
var globalData = {};
//var dropzoneBase = {//默认配置
//	previewTemplate: $('#preview-template').html(),
//  addRemoveLinks: true,//上传文件可以删除
//  dictDefaultMessage: '<div>请点击或拖拽上传</div><div>只接受200*200的图片</div>',
//  dictFallbackMessage: '您的浏览器版本太旧',
//  dictInvalidFileType: '文件类型被拒绝',
//  dictFileTooBig: '文件大小{{filesize}}M，限制最大为{{maxFilesize}}M',
//  dictCancelUpload: '取消上传链接',
//  dictResponseError: '服务器错误，错误代码{ { statusCode } }',
//  dictCancelUploadConfirmation: '是否取消',
//  dictMaxFilesExceeded: '文件数量超出',
//  dictRemoveFile: '删除文件'
//}, dropzoneIcon;
jQuery(function($) {
	var optionStr = '';
	//菜单面包屑导航等配置显示
	Common.menuNavContent('广告图管理', '游戏橱窗','运营管理后台');
	
	globalDataFn(function(data){
		
		//列表呈现
		GameWindowList('#itemsTable1', '#itemsPager1');
		
		//广告栏所属模块下拉框赋值
		optionStr = '<option value="">请选择</option>';
		$.each(bannerPositionList, function(index, obj){
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.bannerPosition').html(optionStr);
		//关联id类型
		optionStr = '<option value="">请选择</option>';
		$.each(relationTypeList, function(index, obj){
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.relationIdType').html(optionStr);
		
	});
	
	//模态框消失之后，格式化模态框的相关元素或属性
	$('#pageModal').on('hide.bs.modal', function (e) {
		var modal = $(this);
		$('#saveAddEdit')[0].disabled = false;
		modal.find('input, select').val('');
		globalData.pictureAddress = '';
		globalData.rowId = '';
		modal.find('.gameId').addClass('hide');
	})
	
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
//	$("#pageModal .pageModalItem1 .form_datetime.hh").datetimepicker({	
//		format:'yyyy-mm-dd hh:ii',
//		autoclose:true,
//		language: 'zh-CN',
//		startView: 2,//头部是年月日时
//		maxView: 2,
//		minView:0
//	}).on('changeDate', function(ev) {}).on('hide', function(event) {
//		event.preventDefault();
//		event.stopPropagation();
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
	
	
	//查询按键
	$('.itemSearch').on('click', function(){
		onSearch.call(this);
	});
	
	//点击添加广告栏事件绑定
	$('.itemAdd').on('click', function(){
		addRow.call(this);
	});
	
	
	//广告栏编辑点击确定事件绑定
	$('#saveAddEdit').on('click', function(){
		saveAddEdit.call(this);
	});
});

//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/list';
	Common.dataAjax(_url, function(data){
//		globalData.bannerTypeList = data.bannerTypeList;
//		globalData.relationTypeList = data.relationTypeList;
		callback.call(this, data);
	});
}

//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给后台的参数
//http://10.35.0.66:8080/ushop-web-admin/banner/bannerList
function GameWindowList(tableId, pagerId, postData){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/list?relationType=3'
		colModel = [
			{label: '所属广告位',name:'position',index:'position',width:100, align: 'center',
				formatter: function(cellVal, cellData , rowData){
					$.each(bannerPositionList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
		},
			{label: '游戏ID',name:'relationId',index:'relationId',width:100, align: 'center'},
			{label: '发布者',name:'creator',index:'creator',width:100 , align: 'center'},
			{label: '开始时间',name:'beginTime',index:'beginTime',width:120, align: 'center'},
			{label: '结束时间',name:'endTime',index:'endTime',width:120, align: 'center'},
			{label: '状态',name:'status',index:'status',width:120, align: 'center',
				formatter: function(cellVal, cellData , rowData){
//					$.each(globalData.bannerEffcetList, function(index, obj) {
//						if(cellVal == obj.value){
//							cellVal = obj.desc;
//							return false;
//						}
//					});
//					return cellVal;
					switch(cellVal){
						case 1 : return '已启用';
						case 2 : return '未启用';
						case 3 : return '已过期';
					}
				}
			},
			{label: '操作', name:'operation',index:'', fixed: true, width:110, align: 'center',
				formatter: function(cellVal, cellData , rowData){
					var str = '<button rowStr=\'' + JSON.stringify(rowData) + '\' class="btn btn-xs btn-primary" onclick="editorRow(this)">编辑</button> ';
					if(rowData.status !=1){
						str += '<button class="btn btn-xs btn-primary" onclick="deleteRow(' + rowData.id + ',' + cellData.rowId + ')">删除</button>';
					}		 
					return str;
				}
			}

		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '彩购橱窗列表');
}



//
//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/banner/bannerList
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		startDate = $.trim(box.find('.form_datetime.start').val()),
		endDate = $.trim(box.find('.form_datetime.end').val()),
		position = $.trim(box.find('.bannerPosition').val()),
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
		position: position,
		relationType:3
	};
	GameWindowList('#itemsTable1', '#itemsPager1', postData);
}

//添加行
function addRow(){
	var modal = $('#pageModal');
	modal.find('.modalTitle').html('新增');
	modal.modal('show');//显示模态框    
}

//编辑行
function editorRow(me){
	var rowData = JSON.parse($(me).attr('rowStr'));
	var modal = $('#pageModal');
	console.log(rowData);
	//内容赋值
	modal.find('.modalTitle').html('编辑');
	globalData.rowId = rowData.id;
	modal.find('[name=bannerPosition]').val(rowData.position||'');
	modal.find('[name=relationIdType]').val(rowData.relationType||'');
	modal.find('[name=relationId]').val(rowData.relationId||'');
	modal.find('.startDate').val(rowData.beginTime||'');
	modal.find('.endDate').val(rowData.endTime||'');
	modal.modal('show');
	
}

//保存编辑和添加
//http://10.35.0.66:8080/ushop-web-admin/banner/addBanner
//http://10.35.0.66:8080/ushop-web-admin/banner/editBanner
function saveAddEdit(){
	var modal = $('#pageModal');
	var type = modal.find('.modalTitle').html();
	var _param = {
			position : modal.find('[name=bannerPosition]').val(),
			relationId : modal.find('[name=relationId]').val(),
			relationType : 3,
			beginTime : modal.find('.startDate').val(),
			endTime : modal.find('.endDate').val(),
		};

	if(globalData.rowId){
		_param.id = globalData.rowId;
	}
	if(!_param.position){
		Common.jBoxNotice('请选择所属广告位', 'red');
		return false;
	}
	if(!_param.relationId){
		Common.jBoxNotice('请输入游戏ID', 'red');
		return false;
	}
	if(!_param.beginTime){
		Common.jBoxNotice('请输入开始时间', 'red');
		return false;
	}
	if(!_param.endTime){
		Common.jBoxNotice('请输入结束时间', 'red');
		return false;
	}
	if(_param.beginTime && _param.endTime){
		if(new Date(_param.endTime).getTime() <= new Date(_param.beginTime).getTime()){
			Common.jBoxNotice('结束时间要大于起始时间', 'red');	
			return false;
		}
	}
	//dz-complete
	globalData._param = _param;
	upLoadGameAjax();
	
}
//上传请求
function upLoadGameAjax(){
	var modal = $('#pageModal');
	var _url, doneStr, errorStr;
	var _param = globalData._param;
	if(_param.id){
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/edit';
		doneStr = '编辑成功';
		errorStr = '编辑失败';
	}else{
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/add';
		doneStr = '新增成功';
		errorStr = '新增失败';
	}
	Common.dataAjaxPost(_url, _param, function(data, status){
		$('#saveAddEdit')[0].disabled = false;
			if(data.data == 'SUCCESS'){
				Common.jBoxNotice(doneStr, 'green');
				GameWindowList('#itemsTable1', '#itemsPager1');
				modal.modal('hide');
			}else if(data.error){
				Common.jBoxNotice(data.error_description, 'red');
			}else{
				Common.jBoxNotice(errorStr, 'red');
			}
	});
}

//删除行
//http://10.35.0.66:8080/ushop-web-admin/banner/deleteBanner
function deleteRow(id, rowId){
	var delUrl = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/delete',
		_param = {
			id : id
		};
	Common.jBoxConfirm('确认信息', '是否确定删除', function(index){
		if(index == 1){
			Common.dataAjaxPost(delUrl, _param, function(ret, status){
				if(status == 'success'){
					if(ret.data == 'SUCCESS'){
						Common.jBoxNotice('删除成功', 'green');
						GameWindowList('#itemsTable1', '#itemsPager1');
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
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'游戏橱窗'});
}