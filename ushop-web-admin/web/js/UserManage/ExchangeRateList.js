/**
 * 
 * NoticeManage.js
 * 订单管理-通告栏
 * 作者：xulin
 * 
 * */

//硬性数据
var globalData = {};
globalData.regDotFourNumber = /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,4})?$/;
jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('用户管理', '货币汇率', '用户管理后台');
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
//			if(index == 0){
//				optionStr += '<option value="">全部</option>';
//			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.firstMoney').html(optionStr);
		$('.secondMoney').html(optionStr);
			
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
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/account/fundType/list';	
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.fundType = data.recordList;
			callback.call(this, data);
		}else{
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
}

//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/new/banner/AnnounceList
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		firstMoneyId = $.trim(box.find('.firstMoney').val()),
		secondMoneyId = $.trim(box.find('.secondMoney').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		firstMoneyId: firstMoneyId,
		secondMoneyId: secondMoneyId
		
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
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/account/exchangeRate/delete';
		Common.dataAjaxPost(_url, {id: id}, function(){
			//console.log(arguments)
			$('#itemsTable1').delRowData(rowId);
			$('#pageModal').modal('hide');
		});
		return false;
	}
	var firstMoneyId = $('#pageModal [name="firstMoney"]').val(),
	    secondMoneyId = $('#pageModal [name="secondMoney"]').val(),
	    firstMoney = $('#pageModal [name="firstMoney"] option:checked').html(),
	    secondMoney = $('#pageModal [name="secondMoney"] option:checked').html(),
	    rate = $('#pageModal input[name="rate"]').val(),
		provinceId = $('#pageModal .selectClassType1').val(),
		platfromTypeId = $('#pageModal .selectClassType2').val();
//		provinceId = $(' #pageModal [name="provinceId"]').val();
		//console.log(bannerType);
        rate -= 0;
	if(!firstMoneyId){
		Common.jBoxNotice('消耗资金类型不能为空','red');
		return false;
	}
	if(!secondMoneyId){
		Common.jBoxNotice('生成资金类型不能为空','red');
		return false;
	}	
	if(firstMoneyId == secondMoneyId){
		Common.jBoxNotice('消耗资金类型不能与生成资金相同','red');
		return false;
	}
	if(rate<0){
		Common.jBoxNotice('汇率为正数','red');
		return false;
	}
	if(!globalData.regDotFourNumber.test(rate)){
		Common.jBoxNotice('汇率最多四位小数','red');
		return false;
	}
	
	_param = {
		//URL: pictureAddress,
			firstMoneyId :　firstMoneyId,
			secondMoneyId :　secondMoneyId,
			firstMoney : firstMoney,
			secondMoney : secondMoney,
			rate : rate
	}
	console.log(_param);

	if(typeName == 'add'){
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/account/exchangeRate/add';
	}else if(typeName == 'edit'){
		_param.id = id;
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/account/exchangeRate/update';
	}
	Common.dataAjaxPost(_url, _param, function(data){
		//console.log(arguments)
		//$('#itemsTable1').addRowData(rowId);
		if(data.data == 'SUCCESS'){
			Common.jBoxNotice('操作成功','green');
			fundTypeList('#itemsTable1', '#itemsPager1');
//			window.location.reload();
		}else if(data.data == 'EXISTED'){
			Common.jBoxNotice('操作失败,相同汇率转换已存在','red');
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
//http://10.35.0.66:8080/ushop-web-admin/new/announce/announceList
function fundTypeList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/account/exchangeRate/list'
		colModel = [
			{label: '消耗货币',name:'firstMoney',index:'firstMoney',width:140, align: 'center'},
			{label: '生成货币',name:'secondMoney',index:'secondMoney',width:140, align: 'center'},			
			{label: '汇率',name:'rate',index:'rate',width:100, align: 'center'},
			{label: '创建时间',name:'createTime',index:'createTime',width:100, align: 'center',
				formatter: function(val, cellval, colpos, rwdat){
				    var str = '';
				    if(val){str=Common.msToTime(val);}
				    return str
				 }
		},
			{label: '操作', name:'operation',index:'', width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
                    var str = '';
						str += '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'edit\', ' + cellval.rowId + ')">编辑</button> '+
							'<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'delete\', ' + cellval.rowId + ')">删除</button>';
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
//http://10.35.0.66:8080/ushop-web-admin/new/announce/getAnnounceById?Id=1
function pageModalFn(id, typeName, rowId){
	rowId = rowId || '';
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/account/exchangeRate/getById?id=' + id;
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	modal.modal('show');
	pageModalTitle.attr({'typeName' : typeName, 'typeId' : id, 'rowId' : rowId});
	if(typeName == 'edit'){
		Common.dataAjax(_url, function(data){
			pageModalTitle.html('编辑');
			strHtmlFn(data.exchangeRate, id);
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
	console.log(fund);
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	var optionStr1 = '',optionStr2 = '';
	var firstMoneyId = fund.firstMoneyId || 997,
	    secondMoneyId = fund.secondMoneyId || 997,
        rate = fund.rate || 0;
	$.each(globalData.fundType, function(index, obj){
		if(firstMoneyId == obj.value){
			optionStr1 += '<option value="' + obj.value + '" selected desc="'+obj.desc+'">' + obj.desc + '</option>';
		}else{ 
			optionStr1 += '<option value="' + obj.value + '" desc="'+obj.desc+'">' + obj.desc + '</option>';
		}
	});
	$.each(globalData.fundType, function(index, obj){
		if(secondMoneyId == obj.value){
			optionStr2 += '<option value="' + obj.value + '" selected desc="'+obj.desc+'">' + obj.desc + '</option>';
		}else{ 
			optionStr2 += '<option value="' + obj.value + '" desc="'+obj.desc+'">' + obj.desc + '</option>';
		}
	});
	str =   '<div class="form-horizontal">'+
      			'<div class="form-group">'+
      				'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>消耗资金名称</label>'+
      				'<div class="col-xs-8">'+
      					'<select class="form-control" name="firstMoney">' + optionStr1 + '</select>'+
      				'</div>'+
      			'</div>'+
      			'<div class="form-group">'+
      				'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>生成资金名称</label>'+
      				'<div class="col-xs-8">'+
      					'<select class="form-control" name="secondMoney" >' + optionStr2 + '</select>'+
      				'</div>'+
      			'</div>'+				
      			'<div class="form-group">'+
      				'<label class="col-xs-4 control-label"><i style="color: #f00;">* </i>汇率</label>'+
      				'<div class="col-xs-8">'+
      					'<input type="text" name="rate">'+
      				'</div>'+
      		'</div>';
	pageModalItem1.html(str);
	if(id){
    	pageModalItem1.find('[name=rate]').val(rate);
    	pageModalItem1.find('[name=firstMoney]').attr('disabled',true);
    	pageModalItem1.find('[name=secondMoney]').attr('disabled',true);
	}
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'货币汇率'});
}