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
	Common.menuNavContent('用户管理', '用户关联', '用户管理后台');

	
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
		$.each(globalData.provinceList, function(index, obj){
//			if(index == 0){
//				optionStr += '<option value="">全部</option>';
//			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.provinceList').html(optionStr);
		optionStr = '';
		$.each(globalData.platformList, function(index, obj){
//			if(index == 0){
//				optionStr += '<option value="">全部</option>';
//			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.platformList').html(optionStr);
			
		//查询按键
		$('.itemSearch').on('click', onSearch);
		
		//数据列表显示
		accountRelation('#itemsTable1', '#itemsPager1');
		
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
//	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/new/fundType/fundTypeList';
//	Common.dataAjax(_url, function(data, status){
//		if(status == 'success'){
			var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/relation/getConstants';	
			Common.dataAjax(_url, function(data, status){
				if(status == 'success'){
					globalData.provinceList = data.provinceList;
					globalData.platformList = data.platformList;
					callback.call(this, data);
				}else{
					Common.jBoxNotice('数据请求错误', 'red');
					callback.call(this, data);
				}
			});
//		}else{
//			Common.jBoxNotice('数据请求错误', 'red');
//			callback.call(this, data);
//		}
//	});
}

//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/new/banner/AnnounceList
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		province = $.trim(box.find('.provinceList').val()),
		platform = $.trim(box.find('.platformList').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		province: province,
		platform: platform
		
	};
	accountRelation('#itemsTable1', '#itemsPager1', postData);
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
function accountRelation(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/user/relation/listBy'
		colModel = [
			{label: '关联用户ID',name:'relationUserNo',index:'relationUserNo',width:140, align: 'center'},
			{label: '登录名',name:'loginName',index:'loginName',width:140, align: 'center'},			
			{label: '真实姓名',name:'realName',index:'realName',width:100, align: 'center'},
			{label: '手机号码',name:'phone',index:'phone',width:100, align: 'center'},
			{label: '身份证号',name:'cardNo',index:'cardNo',width:100, align: 'center'},
			{label: '登陆ID',name:'loginId',index:'loginId',width:100, align: 'center'},
			{label: '创建时间',name:'createTime',index:'createTime',width:100, align: 'center',
				formatter: function(val, cellval, colpos, rwdat){
				    var str = '';
				    if(val){str=Common.msToTime(val);}
				    return str
				 }
			},
			{label: '地区',name:'province',index:'province',width:100, align: 'center',
				formatter: function(val, cellval, colpos, rwdat){
				    var str = '';
				    $.each(globalData.provinceList,function(i,o){
				    	if(val == o.value){str = o.desc;}
				    });
				    return str
				 }
			},
			{label: '平台',name:'platform',index:'platform',width:100, align: 'center',
				formatter: function(val, cellval, colpos, rwdat){
				    var str = '';
				    $.each(globalData.platformList,function(i,o){
				    	if(val == o.value){str = o.desc;}
				    });
				    return str
				 }
			},
			{label: '操作', name:'operation',index:'', width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
                    var str = '';
						str += '<button class="btn btn-xs btn-primary" onclick="unBind(\'' + colpos.relationUserNo + '\','+ colpos.province+',' + colpos.platform + ')">解除绑定</button> ';
					return str;
				}
			}

		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '用户关联');
}
function unBind(relationUserNo, province, platform){
	var delUrl = Common.DOMAIN_NAME + '/ushop-web-admin/user/relation/unbind',
		param = {userNo:relationUserNo,province:province,platform:platform};
	Common.jBoxConfirm('确认信息', '您确定要解除绑定吗？', function(index){
		if(index == 1){
			Common.dataAjaxPost(delUrl, param, function(ret, status){
				if(status == 'success'){
					if(ret.data == 'success'){
						Common.jBoxNotice('解绑成功', 'green');
						accountRelation('#itemsTable1', '#itemsPager1');
					}else{
						Common.jBoxNotice('解绑失败', 'red');
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
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'用户关联'});
}