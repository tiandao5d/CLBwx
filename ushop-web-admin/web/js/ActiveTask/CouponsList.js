/**
 * 
 * ActiveTaskList.js
 * 活动任务-活动任务列表
 * 作者：xulin
 * 
 * */


//硬性数据
var globalData = {};
jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('消费券管理', '消费券列表','运营管理后台');
	
	
	//全局参数请求
	globalDataFn(function(){
		//全局下拉框赋值
		optionStr = '<option value="">请选择</option>';
		$.each(globalData.couponsTypeList, function(index, obj){
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.couponsTypeList').html(optionStr);
		optionStr = '<option value="">请选择</option>';
		optionStr += '<option value="3">3天</option>';
		optionStr += '<option value="7">7天</option>';
		optionStr += '<option value="15">半个月</option>';
		optionStr += '<option value="30" selected>一个月</option>';
		optionStr += '<option value="90">三个月</option>';
		optionStr += '<option value="180">半年</option>';
		optionStr += '<option value="365">一年</option>';
		$('.rangeTypeList').html(optionStr);

		optionStr = '<option value="">请选择游戏名称</option>';
		optionStr = '<option value="-1">通用游戏券</option>';
		$.each(globalData.appInfoList, function(index, obj){
			optionStr += '<option value="' + obj.appId + '">' + obj.appName + '游戏券</option>';
		});
		$('#appId').html(optionStr);
		//活动任务列表
		couponsList('#itemsTable1', '#itemsPager1');
		
	})
	
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
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
	var modal = $('#pageModal');
	$('#pageModal .couponsTypeList').on('change',function(e){
		var typeValue = modal.find('.couponsTypeList').val();
		var lotteryHide = modal.find('.lotteryHide'),couponsHide = $('.couponsHide');
		if(typeValue == 1){
			lotteryHide.addClass('hide');
			couponsHide.removeClass('hide');
		}else if(typeValue == 2){
			lotteryHide.removeClass('hide');
			couponsHide.addClass('hide');
		}
	});
	modal.on('hide.bs.modal', function (e) {
		var typeFund = modal.find('.typeFund'),typeFundHide = modal.find('.typeFundHide');
		$.each(typeFund,function(i,o){
				$(o).addClass('hide');
		});
		$.each(typeFundHide,function(i,o){
			$(o).removeClass('hide');
		});
		var lotteryHide = modal.find('.lotteryHide'),couponsHide = $('.couponsHide');
			lotteryHide.removeClass('hide');
			couponsHide.addClass('hide');
		
	});
	
});

//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
//	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/points/listTaskConditionAndFundUsageAndFundType';
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/account/coupons/type/getConstants';
	Common.dataAjax(_url, function(data,status){
//		globalData.fundUsageList = data.fundUsageList;//积分用途列表
//		globalData.taskConditionList = data.taskConditionList;//任务条件
//		globalData.fundTypeList = data.fundTypeList;//积分类型
//		globalData.taskTypeList = data.taskTypeList;//任务类型
//		globalData.taskTargetTypeList = data.taskTargetTypeList;//目标类型
		if(status == 'success'){
			globalData.couponsTypeList = data.couponsTypeList
			var _url = Common.DOMAIN_NAME + '/ushop-web-admin/platform/app/list';
			Common.dataAjax(_url, function(data,status){
				if(status == 'success'){
					globalData.appInfoList = data.recordList;
				}else{
					Common.jBoxNotice('数据请求错误', 'red');
				}
			callback.call(this, data);
			});
		}else{
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
}


//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/new/banner/bannerList
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		couponsType = $.trim(box.find('.couponsTypeList').val()),
		couponsName = $.trim(box.find('.couponsName').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		couponsType: couponsType,
		couponsName: couponsName
	};
	couponsList('#itemsTable1', '#itemsPager1', postData);
}


//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
//http://10.35.0.66:8080/ushop-web-admin/admin/activityTask/list
function couponsList(tableId, pagerId, postData){
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/account/coupons/type/listBy',
		colModel = [
			{label: 'ID',name:'id',index:'id', width:80, align: 'center'},
			{label: '消费券类型',name:'couponsType',index:'couponsType',width:100, align: 'center',
				formatter: function(val, cellData , rowData){
					var str = '';
					$.each(globalData.couponsTypeList,function(i,o){
						if(val == o.value){
							str = o.desc;
						}
					});
					return str
				}
			},
			{label: '消费券名称',name:'couponsName',index:'couponsName',width:100, align: 'center'},
			{label: '规则',name:'rule',index:'rule',width:100 , align: 'center',
				formatter: function(cellVal, cellData , rowData){
					var str = cellVal;

					if(rowData.couponsType == 1){
						var a = cellVal.split('"');
//						str = cellVal.split(',').split(':');
//						var appId = cellVal.split(',')[0].split(':')[1];
//						var balance = cellVal.split(',')[1].split(':')[1];
						var appId = a[3];
						var balance = a[7];
						if(appId == -1){
							str = '通用游戏券' + balance + '元'
						}else{
							$.each(globalData.appInfoList,function(i,o){
								if(appId == o.appId){
									str = o.appName +'游戏券'+ balance + '元'
								}
							})
						}
//						str = appId + balance +'元'
					}
					return str || '';
				}
			},
			{label: '创建时间',name:'createTime',index:'createTime',width:140, align: 'center',
				formatter: function(cellVal, cellData , rowData){
					var str = Common.msToTime(cellVal);
					return str || '';
				}
			},
			{label: '有效期',name:'validPeriod',index:'validPeriod',width:120, align: 'center',
				formatter: function(val, cellData , rowData){
					switch(val){
						case 7 : return '7天';
						case 15 : return '半个月';
						case 30 : return '一个月';
						case 90 : return '三个月';
						case 180 : return '半年';
						case 365 : return '一年';
						case 3 : return '3天';
						default : return ''
					}

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
//http://10.35.0.66:8080/ushop-web-admin/admin/activityTask/save
function addRow(){
	var modal = $('#pageModal');
	modal.find('input, select').val('');
	modal.modal('show').attr('typeId', '');
};

//编辑
//http://10.35.0.66:8080/ushop-web-admin/admin/activityTask/edit
function editorRow(me){
	var rowData = JSON.parse($(me).attr('rowStr')),
		ruleObj = {};
	var modal = $('#pageModal'),
		lotteryHide = modal.find('.lotteryHide'),
		couponsHide = modal.find('.couponsHide');
	$.each(rowData, function(key, val){
		if(modal.find('[name=' + key + ']').length > 0){
			modal.find('[name=' + key + ']').val(val);
		}
	});
	try{ruleObj = JSON.parse(rowData.rule)}catch(err){}
	if(rowData.couponsType == 1){
		lotteryHide.addClass('hide');
		couponsHide.removeClass('hide');
	    $('#appId').val(ruleObj.appId);
	    modal.find('[name=balance]').val(ruleObj.balance);
	}else if(rowData.couponsType == 2){
		lotteryHide.removeClass('hide');
		couponsHide.addClass('hide');
		modal.find('[name="lo_type"]').val(ruleObj.type),
		modal.find('[name="lo_value"]').val(ruleObj.value);
	}
	modal.modal('show').attr('typeId', rowData.id);
}

//保存新增或编辑
function saveAddEdit(){
	var modal = $('#pageModal'),
		id = modal.attr('typeId');
	var _url = '',
		_param = {
			couponsName: modal.find('[name=couponsName]').val(),
			couponsType: modal.find('[name=couponsType]').val(),
			validPeriod : modal.find('[name=validPeriod]').val()//有效期
		};
	if(!_param.couponsName){
		Common.jBoxNotice('请输入消费券名称', 'red');
		return false;
	}
	if(!_param.couponsType){
		Common.jBoxNotice('请选择消费券类型', 'red');
		return false;
	}
	if(!_param.validPeriod){
		Common.jBoxNotice('请选择有效期', 'red');
		return false;
	}
	if(_param.couponsType == 2){
		var lo_type = modal.find('[name="lo_type"]').val(),
			lo_value = modal.find('[name="lo_value"]').val();
		if(!lo_type){
			Common.jBoxNotice('请输入消费券类型', 'red');
			return false;
		}
		if(!lo_value){
			Common.jBoxNotice('请输入消费券金额', 'red');
			return false;
		}
		_param.rule = JSON.stringify({
			type: lo_type,
			value: lo_value
		});
	}else if(_param.couponsType == 1){
		var appId = modal.find('#appId').val();
		var balance = modal.find('[name=balance]').val();
		if(!appId){
			Common.jBoxNotice('请选择游戏名称', 'red');
			return false;
		}
		if(!(/^\d+$/.test(balance))){
			Common.jBoxNotice('请输入金额为正整数', 'red');
			return false;
		}
		if(!balance){
			Common.jBoxNotice('请输入金额', 'red');
			return false;
		}
		if(appId == -1){
			_param.couponsName = '通用游戏券' ;
		}else{
			$.each(globalData.appInfoList,function(i,o){
				if(appId == o.appId){
					_param.couponsName = o.appName +'游戏券';
				}
			})
		}
		_param.rule = {"appId" : appId,"balance" : balance};
		_param.rule = JSON.stringify(_param.rule);
	}
	var successStr = '',
		errorStr = '';
	if(id){//编辑列表
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/account/coupons/type/update';
		_param.id = id;
		successStr = '编辑成功';
		errorStr = '编辑失败';
	}else{//新建列表
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/account/coupons/type/add';
		successStr = '新增成功';
		errorStr = '新增失败';
	}
	Common.dataAjaxPost(_url, _param, function(data, status){
		if(status == 'success'){
			if(data.data == 'SUCCESS'){
				Common.jBoxNotice(successStr, 'green');
				couponsList('#itemsTable1', '#itemsPager1');
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
//http://10.35.0.66:8080/ushop-web-admin/admin/activityTask/delete/任务ID
function deleteRow(id, rowid){
	var delUrl = Common.DOMAIN_NAME + '/ushop-web-admin/account/coupons/type/delete',
		param = {id:id};
	Common.jBoxConfirm('确认信息', '您确定要删除此消费券吗？', function(index){
		if(index == 1){
			Common.dataAjaxPost(delUrl, param, function(ret, status){
				if(status == 'success'){
					if(ret.data == 'SUCCESS'){
						Common.jBoxNotice('删除成功', 'green');
						couponsList('#itemsTable1', '#itemsPager1');
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
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'消费券列表'});
}