/**
 * 
 * UserList.js
 * 用户管理-用户列表
 * 作者：roland
 * 
 * */

//硬性数据
var searchTypeList = [
		{desc: '站点编号', value: 'stationNo'},
		{desc: '用户名', value: 'userName'},
		{desc: '姓名', value: 'name'},   
		{desc: '身份证号', value: 'cardNo'}
	];
//操作失败信息
var handleError = {
		content : '操作失败，请稍后重试',
		color :'red',
		autoClose : 3000,
		position : {x:'center',y:50}
};
jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('推广员管理', '站点审核','运营管理后台');
	
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
		onSearch();
	});
	
	
	
	//搜索栏选择框赋值
	$.each(searchTypeList, function(index, obj){
		if(index == 0){
			optionStr += '<option value="">请选择</option>';
		}
		optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
	});
	$('.selectClassType').html(optionStr);
	
	//日期选择器绑定
	$(".form_datetime.dd").datetimepicker({
		format:'yyyy-mm-dd',
		autoclose:true,
		language: 'zh-CN',
		startView: 2,
		maxView: 4,
		minView:2
	});
	$(".form_datetime[readonly]").dblclick(function(){
		$(this).val('').blur();
	});
	
	//查询按键
	$('.itemSearch').on('click', onSearch);
	var postData = {
		status : 100
	};
	//用户数据列表显示
	UserList('#itemsTable1', '#itemsPager1', postData);
	
	
	
	//用户列表编辑点击确定事件绑定
	$('#determineClick').on('click', determineClick);
});



//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/new/banner/bannerList
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		seachInfo = $.trim(box.find('[name="searchInfo"]').val()),
		selectClassType = $.trim(box.find('.selectClassType').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var status = $('.nav-tabs .active a').attr('href').slice(-1);
	var playStatus;
		switch(status){
			case '3': playerStatus = 101;break;
			case '4': playerStatus = 102;break;
			case '2': playerStatus = 100;break;
			default: playerStatus = 100;
		}
	var postData = {
		searchType: selectClassType,
		status : playerStatus,
		keywords: seachInfo
	};
	UserList('#itemsTable1', '#itemsPager1', postData);
}


//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//orderNo     订单号 字符串类型
//userID   	     用户ID字符串类型
//reload      是否是刷新列表，默认为false，布尔值
//http://10.35.0.66:8080/ushop-web-admin/new/banner/bannerList
function UserList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/promoter/listByStation';
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '用户名',name:'userName',index:'userName',width:140, align: 'center'},
			{label: '站点编号',name:'stationNo',index:'stationNo',width:80 , align: 'center'},
			{label: '姓名',name:'name',index:'name',width:40, align: 'center'},
			{label: '身份证号',name:'cardNo',index:'cardNo',width:140, align: 'center'},
			{label: '状态',name:'status',index:'status',width:60, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					switch (val){
						case 100: return '审核中';
						case 101: return '审核通过';
						case 102: return '审核不通过';
						default : return '审核不通过'
					}
				}
			},
			{label: '操作', name:'operation',index:'', width:180, fixed: true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '<button class="btn btn-xs btn-primary" onclick="pageModalFn('+colpos.id+')">查看</button> ';
					if(colpos.status==100)
					  {
					  	str+='<button class="btn btn-xs btn-primary" onclick="openUserStatus('+colpos.id+')">通过</button>';
					    str+='<button class="btn btn-xs btn-danger" onclick="stopUserStatus('+colpos.id+')">不通过</button>';
					  }

					return str;
				}
			}

		];


	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '站点审核');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	$('#determineClick').css('display','none');
	
}

//启用用户
function openUserStatus(id){
	var _url = Common.DOMAIN_NAME+'/ushop-web-admin/promoter/audit';
	Common.dataAjaxPost(_url,{id:id,status:101},function(data){		
	    if(data.data == 'SUCCESS'){
		    var content = '审核通过',
		        color = 'green',
		        autoClose = 3000,
		        position = {x:'center',y:50};
			Common.jBoxNotice( content, color, autoClose ,position);
			UserList('#itemsTable1', '#itemsPager1');
		}else{
			Common.jBoxNotice( handleError.content, handleError.color, handleError.autoClose ,handleError.position);
		}

	});
}
//停用用户
function stopUserStatus(id){
	var _url=Common.DOMAIN_NAME+'/ushop-web-admin/promoter/audit';
	var title = '站主审批',
	    content = '确定该用户审核不通过吗？';
  Common.jBoxConfirm( title, content,function(){
    if(arguments[0] == 1){
    	Common.dataAjaxPost( _url,{id:id,status:102},function(data){
	    if(data.data == 'SUCCESS'){
		    var content = '审核不通过',
		        color = 'green',
		        autoClose = 3000,
		        position = {x:'center',y:50};
			Common.jBoxNotice( content, color, autoClose ,position);
			UserList('#itemsTable1', '#itemsPager1');
		}else{
			Common.jBoxNotice( handleError.content, handleError.color, handleError.autoClose ,handleError.position);
		}
     }  );
    }
  });
	
}

function pageModalFn(id, typeName){
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/promoter/get/' + id ;
	var modal = $('#pageModal'),  
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	modal.modal('show');
	pageModalTitle.attr({typeName : '查看'});
	Common.dataAjax(url, function(data){
		strHtmlFn(data, id);
	});
}
function strHtmlFn(user, id){
	var modal = $('#pageModal'),  
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	if(user.error_description){
		modal.modal('hide');
		var color = 'red',
			content = user.error_description;
		Common.jBoxNotice(content, color);
	};
	user = user.promoterInfo ? user.promoterInfo : {};
	var userName = user.userName ||'',
	    phone = user.phone ||'',
	    name = user.name ||'',
	    cardNo = user.cardNo ||'',
	    bankNo = user.bankNo ||'',
	    bankName = user.bankName || '',
	    bankCity = user.bankAddress ||'',
	    stationNo = user.stationNo ||'',
	    stationAddress = user.stationAddress ||'';
	    pageModalTitle.html('查看');
	var _userInfo = '<div id="userInfo" class="form-horizontal">'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-3 control-label">用户名：</label>'+
			      				'<div class="col-xs-9">'+
			      					'<span class="form-control" style="border:0">'+userName+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-3 control-label">绑定手机：</label>'+
			      				'<div class="col-xs-9">'+
			      					'<span class="form-control" style="border:0">'+phone+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-3 control-label">姓名：</label>'+
			      				'<div class="col-xs-9">'+
			      					'<span class="form-control" style="border:0">'+name+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-3 control-label">身份证号码：</label>'+
			      				'<div class="col-xs-9">'+
			      					'<span class="form-control" style="border:0">'+cardNo+'</span>'+
			      				'</div>'+
			      			'</div>'+
				 			'<div class="form-group">'+
							    '<label class="col-xs-3 control-label">银行卡号：</label>'+
							    '<div class="col-xs-9">'+
							      	'<span class="form-control" style="border:0">'+bankNo+'</span>'+
							    '</div>'+
							'</div>'+
							'<div class="form-group">'+
							    '<label class="col-xs-3 control-label">开户银行：</label>'+
							    '<div class="col-xs-9">'+
							      	'<span class="form-control" style="border:0">'+bankName+'</span>'+
							    '</div>'+
							'</div>'+
							'<div class="form-group">'+
							    '<label class="col-xs-3 control-label">开户城市：</label>'+
							    '<div class="col-xs-9">'+
							      	'<span class="form-control" style="border:0">'+bankCity+'</span>'+
							    '</div>'+
							'</div>'+
							'<div class="form-group">'+
							    '<label class="col-xs-3 control-label">站点编号：</label>'+
							    '<div class="col-xs-9">'+
							      	'<span class="form-control" style="border:0">'+stationNo+'</span>'+
							    '</div>'+
							'</div>'+
							'<div class="form-group">'+
							    '<label class="col-xs-3 control-label">站点地址：</label>'+
							    '<div class="col-xs-9">'+
							      	'<span class="form-control" style="border:0">'+stationAddress+'</span>'+
							    '</div>'+
							'</div>'+
					'</div></div>'		;
//		_userInfo +='</div></div>';
	var str =  ''; 
	    str += _userInfo;
	pageModalItem1.html(str);  
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'站点审核'});
}