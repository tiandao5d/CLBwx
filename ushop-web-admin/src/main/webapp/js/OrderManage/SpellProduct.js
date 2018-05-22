/**
 * 
 * UserList.js
 * 用户管理-用户列表
 * 作者：roland
 * 
 * */

var globalData = {};
globalData.regExpPhone = /^1(3|4|5|7|8)\d{9}$/;

jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('订单管理', '拼购列表' , '夺宝管理后台');
	
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
		onSearch();
	});
	$('.xltab-box a[data-toggle="tab"]').on('click',function(e){
		var href = e.target.href;
		var tabChoose = href.slice(-1);
//		var hideIt = $('.hideIt');
		if(tabChoose == 1){
//			$.each(globalData.integralHide,function(index,obj){
//				$(obj).addClass('hide');
//			});
			$('.hideIt').addClass('hide');
		}
	});
	
	globalDataFn(function(data){
		//搜索栏选择框赋值
		$.each(globalData.spellBuyStatusList, function(index, obj){
			if(index == 0){
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.selectClassType').html(optionStr);
		
		
		//查询按键
		$('.itemSearch').on('click', onSearch);
		
		//拼购产品数据列表显示
		SpellProduct('#itemsTable1', '#itemsPager1');
				
		//用户列表编辑点击确定事件绑定
		$('#determineClick').on('click', determineClick);
	});
});

function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/getConstants';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.spellBuyStatusList = data.spellBuyStatusList;
			globalData.spellBuyWinList = data.spellBuyWinList;
			callback.call(this, data);
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
		selectClassType = $.trim(box.find('.selectClassType').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		spellbuyStatus: selectClassType
	};
	SpellProduct('#itemsTable1', '#itemsPager1', postData);
}


//广告栏编辑点击确定函数
//http://10.35.0.66:8080/ushop-web-admin/new/banner/editBanner
//http://10.35.0.66:8080/ushop-web-admin/new/banner/addBanner
//http://10.35.0.66:8080/ushop-web-admin/new/banner/deleteBanner
function determineClick(){
	var errStr = '',
		_url = '',
		_param = {};
	var pageModalTitle = $('#pageModalTitle'),
		formHorizontal = $('.form-horizontal');
		typeName = pageModalTitle.attr('typeName');
	var spellBuyProductId = formHorizontal.find('.spellId').html(),
		spellBuyStatus = formHorizontal.find('.spellStatus').val(),
		spellbuyCount = formHorizontal.find('[name=spellbuyCount]').val();
		spellbuyCount = Number(spellbuyCount);
//	if(!spellBuyProductId){errStr += '<div>不能为空</div>'};
	if(!spellBuyStatus){errStr += '<div>请选择拼购状态</div>'};
	if(!spellbuyCount){errStr += '<div>拼购次数不能为空</div>'};
	if(spellbuyCount<1||!(/^\d+$/.test(spellbuyCount))){errStr += '<div>拼购次数为正整数</div>'};
	if(errStr){
		Common.jBoxNotice( errStr,'red');
		return false;
	}
	_param = {
			spellbuyCount : spellbuyCount,			
			spellBuyProductId : spellBuyProductId,			
			spellBuyStatus : spellBuyStatus
	}
	if(typeName == 'edit'){
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/update';
		Common.dataAjaxPost(_url, _param, function(data){
			if(data.data == 'success'){
				Common.jBoxNotice('编辑成功','green');
				SpellProduct('#itemsTable1', '#itemsPager1');			
			}else{
				Common.jBoxNotice('编辑失败','red');
			}
		});
	}
	
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
//http://10.35.0.66:8080/ushop-web-admin/new/banner/bannerList
function SpellProduct(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/listBy'
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '拼购个数',name:'spellbuyCount',index:'spellbuyCount',width:80, align: 'center'},
			{label: '拼购价格',name:'spellbuyPrice',index:'spellbuyPrice',width:80 , align: 'center'},
			{label: '拼购单价',name:'spellbuySinglePrice',index:'spellbuySinglePrice',width:80, align: 'center'},
			{label: '开奖期数',name:'productPeriod',index:'productPeriod',width:100, align: 'center'},
			{label: '状态',name:'spellbuyStatus',index:'spellbuyStatus',width:160, align: 'center',
			    formatter: function(val, cellval, colpos, rwdat){
			    	var str = '';
			    	$.each(globalData.spellBuyStatusList,function(i,o){
			    		if(val == o.value){
			    			str = o.desc;
			    		}
			    	});
			    	return str
			    }
			},
			{label: '幸运号码',name:'luckyNumber',index:'luckyNumber',width:140, align: 'center'},
			{label: '参与次数',name:'ownerCount',index:'ownerCount',width:140, align: 'center'},
			{label: '得奖者ID',name:'ownerId',index:'ownerId',width:140, align: 'center'},
			{label: '得奖者名称',name:'ownerName',index:'ownerName',width:140, align: 'center'},
			{label: '操作', name:'operation',index:'', width:180, fixed: true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '<button class="btn btn-xs btn-primary"  onclick="pageModalFn(' + colpos.spellbuyStatus + ',\'edit\','+colpos.id+','+colpos.spellbuyCount+')">编辑</button> ';
					    str +=' <button class="btn btn-xs btn-primary" onclick="SpellRecordList('+colpos.id+')">拼购记录</button>';
					return str;
				}
			}

		];

	$('#gbox_itemsTable2').addClass('hide');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '拼购产品列表');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
//	$('#determineClick').addClass('hide');
//	$('.dismissModal').removeClass('hide');
	
}
function SpellRecordList(spellbuyProductId){
	$('.hideIt').removeClass('hide');
	$('.xltab-box a[data-toggle="tab"]').eq(1).tab('show');
	globalData.spellbuyProductId = spellbuyProductId;
		var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuyRecord/list?spellBuyProductId='+spellbuyProductId;
		var tableId = '#itemsTable2',
		    postData = '',		    
		    pagerId = '#itemsPager2';
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '开奖期次',name:'productPeriod',index:'productPeriod',width:80, align: 'center'},
			{label: '得奖者ID',name:'buyer',index:'buyer',width:160 , align: 'center'},
			{label: '购买价格',name:'buyPrice',index:'buyPrice',width:100, align: 'center'},
			{label: '购买时间',name:'buyDate',index:'buyDate',width:100, align: 'center'},
			{label: '幸运号码',name:'randomNumber',index:'randomNumber',width:60, align: 'center'},
			{label: '中奖状态',name:'winStatus',index:'winStatus',width:120, align: 'center',
			    formatter: function(val, cellval, colpos, rwdat){
			    	var str = '';
			    	$.each(globalData.spellBuyWinList,function(i,o){
			    		if(val == o.value){
			    			str = o.desc;
			    		}
			    	});
			    	return str
			    }
			},
			{label: '购买状态',name:'buyStatus',index:'buyStatus',width:120, align: 'center',
			    formatter: function(val, cellval, colpos, rwdat){
			    	var str = '';
			    	$.each(globalData.spellBuyStatusList,function(i,o){
			    		if(val == o.value){
			    			str = o.desc;
			    		}
			    	});
			    	return str
			    }
			},
			{label: '操作', name:'operation',index:'', width:180, fixed:true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var rowData = JSON.stringify(colpos);					
					var	str = '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.buyer + ',\'random\','+colpos.spellbuyProductId+')">幸运号码</button> ';
						str += '<button class="btn btn-xs btn-primary" onclick="deleteSpell(' + colpos.id + ')">删除记录</button> '
					return str;
				}
			}

		];

	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '拼购记录列表');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');

	

	
}
//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/new/banner/getBannerById?Id=1
function pageModalFn(userNo, typeName, spellbuyProductId,spellbuyCount){
	spellbuyProductId = spellbuyProductId || '';
//	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/spellBuyRecordList?spellBuyProductId='+spellbuyProductId;
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	modal.modal('show');
	pageModalTitle.attr({'typeName' : typeName, 'spellbuyProductId' : spellbuyProductId});
	if(typeName == 'edit'){
//		Common.dataAjax(_url, function(data){
			pageModalTitle.html('编辑');
			strHtmlFn({}, typeName, userNo, spellbuyProductId, spellbuyCount);
//		});
	}else if(typeName == 'random'){
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/randomNumber/list?userNo='+userNo+'&spellBuyProductId='+spellbuyProductId;
		Common.dataAjax(_url,function(data){
			pageModalTitle.html('中奖号码');
			strHtmlFn(data, typeName);
		});
	}
}


function strHtmlFn(data, typeName, spellbuyStatus, spellbuyProductId, spellbuyCount){
    var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	modal.modal('show');
	var str = '';
	if(typeName == 'random'){
		$.each(data.recordList,function(i,o){
	        str += '<div class="form-group"><label class="col-xs-3 control-label">用户ID：</label><div class="col-xs-6">'+o.userId+'</div></div>';
	        str += '<div class="form-group"><label class="col-xs-3 control-label">购买时间：</label><div class="col-xs-6">'+o.buyDate+'</div></div>';
	        str += '<div class="form-group"><label class="col-xs-3 control-label">拼购ID：</label><div class="col-xs-6">'+o.productId+'</div></div>';
	        str += '<div class="form-group"><label class="col-xs-3 control-label">幸运码：</label><div class="col-xs-6">'+o.randomNumber+'</div></div>';
		});
		str ='<div class="form-horizontal" style="overflow:auto;max-height:600px;">'+str+'</div>';
		$('#determineClick').addClass('hide');
		$('.dismissModal').removeClass('hide');
	}else if(typeName == 'edit'){
		console.log(spellbuyProductId);
		var optionStr = '';
		$.each(globalData.spellBuyStatusList, function(index, obj){
			if(index == 0){
				optionStr += '<option value="">请选择</option>';
			}
			if(spellbuyStatus == obj.value){
				optionStr += '<option value="' + obj.value + '" selected>' + obj.desc + '</option>';				
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
	    str += '<div class="form-group"><label class="col-xs-3 control-label">拼购ID：</label><div class="col-xs-6 spellId">'+spellbuyProductId+'</div></div>';
	    str += '<div class="form-group"><label class="col-xs-3 control-label">拼购状态：</label><div class="col-xs-6"><select class="spellStatus">'+optionStr+'</select></div></div>';
	    str += '<div class="form-group"><label class="col-xs-3 control-label">拼购次数：</label><div class="col-xs-6"><input name="spellbuyCount" class="form-control"  type="text"  style="border:0" value="'+spellbuyCount+'"></div></div>';
		str = '<div class="form-horizontal">'+str+'</div>';
		$('#determineClick').removeClass('hide');
		$('.dismissModal').addClass('hide');
	}
	
	pageModalItem1.html(str);
}
function deleteSpell(id){
	var delUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuyRecord/delete',
		param = {
			id : id
		};
	Common.jBoxConfirm('确认信息', '您确定要删除此行吗？', function(index){
		if(index == 1){
			Common.dataAjaxPost(delUrl, param, function(ret, status){
				if(status == 'success'){
					if(ret.data == 'success'){
						Common.jBoxNotice('删除成功', 'green');
//						SpellProduct('#itemsTable1', '#itemsPager1');
						SpellRecordList(globalData.spellbuyProductId)
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
function goBack(){
	$('.hideIt').addClass('hide');
//	$('#gbox_itemsTable2').addClass('hide');
//	$('#gbox_itemsTable1').removeClass('hide');
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
}
//导出excel表格
function toExcel(n){
	var param = {
		type:'excel',
		escape:'false'
	}
	switch(n){
		case 1:param.fileName = '拼购产品列表';param.aId = 'exportExcel1';break;
		case 2:param.fileName = '拼购记录列表';param.aId = 'exportExcel2';break;	
	}
	$('#gview_itemsTable'+n).tableExport(param);
}