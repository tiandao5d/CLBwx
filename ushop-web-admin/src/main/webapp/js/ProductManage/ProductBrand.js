
var globalData = {};
jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('商品管理', '商品品牌列表','夺宝管理后台');
	
	//全局变量赋值，页面数据初始化完成后执行页面操作
	globalDataFn(function(data){
		//查询按键
		$('.itemSearch').on('click', function(e){
			onSearch.call(this, e);
		});
		
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			$(window).trigger('resize.jqGrid');
		});
		//用户数据列表显示
		ProductBrandList('#itemsTable1', '#itemsPager1');
		
		//点击添加用户列表事件绑定
		$('.itemAdd').on('click', function(){
			pageModalFn('', 'add');
		});
		
		//用户列表编辑点击确定事件绑定
		$('#determineClick').on('click', determineClick);

	});
	
	
});

//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/brand/getConstants';
	Common.dataAjax(_url, function(data, status) {
		if(status == 'success') {
//			globalData.bandList = data.bandList;
			globalData.productBrandStatusList = data.productBrandStatusList;

			var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/list';
			Common.dataAjax(_url, function(data, status) {
				if(status == 'success') {
					globalData.listMerchantInfo = data.recordList;
					var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/type/getMap';
					Common.dataAjax(_url, function(data, status) {
						if(status == 'success') {
							globalData.typeList = data.typeMap;
							var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/brand/getMap';
							Common.dataAjax(_url, function(data, status) {
								if(status == 'success') {
									globalData.bandList = data.bandMap;
									callback.call(this, data);
								} else {
									Common.jBoxNotice('数据请求错误', 'red');
									callback.call(this, data);
								}

							});
						} else {
							Common.jBoxNotice('数据请求错误', 'red');
							callback.call(this, data);
						}

					});
				} else {
					Common.jBoxNotice('数据请求错误', 'red');
					callback.call(this, data);
				}

			});
		} else {
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
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
function ProductBrandList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/product/brand/list'
	console.log(gridUrl);
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '商品品牌',name:'typeName',index:'typeName',width:120, align: 'center'},
			{label: '所属分类',name:'firstTypeId',index:'firstTypeId',width:120, align: 'center',
			    formatter: function(cellVal, cellData , rowData){
					$.each(globalData.typeList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;
							return false;
						}
						
					});
					return cellVal;
				}
			},
			{label: '状态',name:'status',index:'status',width:120, align: 'center',
				 formatter: function(cellVal, cellData , rowData){
				 	if(cellVal){
						$.each(globalData.productBrandStatusList, function(index, obj) {
							if(cellVal == obj.value){
								cellVal = obj.desc;
								return false;
							}
							
						});
				 	}
					return cellVal || '';
				}
			},
			{label: '操作', name:'operation',index:'', width:200, fixed: true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'edit\', ' + cellval.rowId + ')">编辑</button> ';
//							  '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'delete\', ' + cellval.rowId + ')">删除</button> ';
							  ;
					if(colpos.status == 1){
						str += '<button class="btn btn-xs btn-primary" onclick="auditPassOr(' + colpos.id + ',1)">审核通过</button> ';
						str += '<button class="btn btn-xs btn-primary" onclick="auditPassOr(' + colpos.id + ',2)">审核不通过</button> ';
					}
					return str;
				}
			}

		];

	$('#gbox_itemsTable2').css('display','none');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '商品品牌');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	
}

//第三方商品品牌审核
function auditPassOr(id,type){
	var _url = '',msg = '';
	if(type == 1){	
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/product/brand/audit';
		msg = '您确定要审核通过此商品品牌吗？';
	}else if(type == 2){
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/product/brand/noPass';
		msg = '<div style="margin-bottom:10px">确定要审核不通过吗？</div><input id="reason" type="text" placeholder="请输入不通过理由"/>';
	}
	var _param = {
		id : id
	}
	Common.jBoxConfirm('确认信息', msg, function(index){
		if(index == 1){
			var reason = '';
			if(type == 2){				
				reason = $.trim($('#reason').val());
				if(!reason){
				    Common.jBoxNotice('请填写审核不通过理由','red');
				    return false;
				}
				if(reason.length>100){
				    Common.jBoxNotice('审核不通过理由请少于100字','red');
				    return false;
				}
				_param.instructions = reason;
			}
			Common.dataAjaxPost(_url, _param, function(ret, status){
				if(status == 'success'){
					if(ret.data == 'SUCCESS'){
						Common.jBoxNotice('操作成功', 'green');
						ProductBrandList('#itemsTable1', '#itemsPager1');
					}else{
						Common.jBoxNotice('操作失败', 'red');
					}
				}else{
					Common.jBoxNotice('服务器请求失败', 'red');
				}
			});
		}
	});
	return false;
}
//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/product/getBrandById?Id=1
function pageModalFn(id, typeName, rowId){
	rowId = rowId || '';
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/brand/getById?id='+id ;
	var modal = $('#pageModal'),  
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	modal.modal('show');
	pageModalTitle.attr({'typeName' : typeName, 'typeId' : id, 'rowId' : rowId});
	if(typeName == 'edit'){
		Common.dataAjax(_url,function(data){
			pageModalTitle.html('编辑商品品牌');
			strHtmlFn(data.productBrand, id);
		});
	}else if(typeName == 'delete'){
		pageModalTitle.html('删除');
		pageModalItem1.html('是否删除此条');
	}else if(typeName == 'add'){
		pageModalTitle.html('添加商品品牌');
		strHtmlFn();
	}
	return false;
}

//添加列表
function strHtmlFn(brand, id){
	brand = brand ? brand : {};
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	var optionStr1 = '',
		optionStr2 = '',
		typeName = brand.typeName||'';
	var firstTypeId = brand.firstTypeId || 1;
	$.each(globalData.typeList, function(index, obj) {
		if(firstTypeId == obj.value){
			optionStr1 += '<option value="' + obj.value + '" selected>' + obj.desc + '</option>';
		}else{
			optionStr1 += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		}
	});

	str =   '<div class="form-horizontal">'+
      			'<div class="form-group">'+
      				'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>品牌名称</label>'+
      				'<div class="col-xs-9">'+
						'<input name="typeName" class="form-control" value="' + typeName + '" type="text">'+
      				'</div>'+
      			'</div>'+
      			'<div class="form-group">'+
      				'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>所属分类</label>'+
      				'<div class="col-xs-9">'+
      					'<select class="form-control" name="brandType">' + optionStr1 + '</select>'+
      				'</div>'+
      			'</div>'+
      		'</div>';
	pageModalItem1.html(str);

}
//确定按钮
function determineClick(){
	var errStr = '',
		_url = '',
		_param = {};
	var pageModalTitle = $('#pageModalTitle'),
		typeName = pageModalTitle.attr('typeName'),
		rowId = pageModalTitle.attr('rowId'),
		id = pageModalTitle.attr('typeId');
	if(typeName == 'delete'){
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/product/brand/delete';
		Common.dataAjaxPost(_url, {id: id}, function(data){
			//console.log(arguments)
			if(data.data == 'SUCCESS'){
				Common.jBoxNotice('商品类型删除成功', 'green');
				$('#itemsTable1').delRowData(rowId);
				$('#pageModal').modal('hide');				
			}else{
				Common.jBoxNotice('商品类型删除失败', 'red');
			}
		});
		return false;
	}
	var brandType = $('[name="brandType"]').val(),
		typesName = $('[name="typeName"]').val();
		//console.log(bannerType);
	if(!brandType){errStr += '<div>所属模块不能为空</div>'};
	if(!typeName){errStr += '<div>品牌名称不能为空</div>'};
	if(errStr){
		$.gritter.add({
			title: '信息填写有误',
			text: errStr,
			class_name: 'gritter-error'
		});
		return false;
	}
	_param = {
		firstTypeId : brandType,
		typeName : typesName
	};
	if(typeName == 'edit'){
		_param.id = id;
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/product/brand/update';
	}else if(typeName == 'add'){
		_url = Common.DOMAIN_NAME +'/ushop-web-admin/product/brand/add';
	};
	Common.dataAjaxPost(_url, _param, function(data){
		if(data.data == 'SUCCESS'){
			Common.jBoxNotice('操作成功', 'green');
			ProductBrandList('#itemsTable1', '#itemsPager1');		
		}else{
			Common.jBoxNotice('操作失败', 'red');
		}
	});
	$('#pageModal').modal('hide');
}
//导出excel表格 
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'商品品牌列表'});
}
