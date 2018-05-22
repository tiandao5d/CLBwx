/**
 * 
 * UserList.js
 * 用户管理-用户列表
 * 作者：roland
 * 
 * */
var globalData=[];
globalData.regExpPhone = /^1(3|4|5|7|8)\d{9}$/;
globalData.regExpCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
//硬性数据
var searchTypeList1 = [
		{desc: '站点编号', value: 'stationNo'},
		{desc: '用户名', value: 'userName'},
		{desc: '姓名', value: 'name'},   
		{desc: '身份证号', value: 'cardNo'},
		{desc: '手机号码', value: 'phone'}
	];
var searchTypeList2 = [
		{desc: '绑定站点', value: 'stationNo'},
		{desc: '用户名', value: 'userName'},
		{desc: '归属省份', value: 'stationProvince'},
		{desc: '手机号码', value: 'phone'}
	];
var rebateDateList = [
		{desc: '一周以内', value: 1},
		{desc: '一个月以内', value: 2},
		{desc: '三个月以内', value: 3},
		{desc: '半年以内', value: 4}
	];
var rebateLimitList = [
		{desc: '0', value: 0},
		{desc: '0~100彩分', value: 1},
		{desc: '100~500彩分', value: 2},
		{desc: '500~5000彩分', value: 3},
		{desc: '5000彩分以上', value: 4}
	];
var promoterRelationshipTypeList = [
		{desc: '直属', value: 1},
		{desc: '次级', value: 2}
]
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
	Common.menuNavContent('推广员管理', '推广员列表','运营管理后台');
	
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
//	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
//		$(window).trigger('resize.jqGrid');
//		onSearch();
//	});
	$("#city").citySelect({prov:"北京", city:"东城区"});
	
	
	//搜索栏选择框赋值
	$.each(searchTypeList1, function(index, obj){
		if(index == 0){
			optionStr += '<option value="">请选择</option>';
		}
		optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
	});
	$('.selectClassType').html(optionStr);
    $('.xltab-box').on('click', 'a[href*=itemTab]' , function(e){
    	var searchTypeList = e.target.href.slice(-1);
        if( searchTypeList==1 ){
	    	optionStr = '';
	    	$.each(searchTypeList1, function(index, obj){
				if(index == 0){
					optionStr += '<option value="">请选择</option>';
				}
				optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
			});
			OwnerList('#itemsTable1', '#itemsPager1');		
	    }else if(searchTypeList == 2){
	    	optionStr = '';
	    	$.each(searchTypeList2, function(index, obj){
				if(index == 0){
					optionStr += '<option value="">请选择</option>';
				}
				optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
			});
			PromoterList('#itemsTable2', '#itemsPager2');
			
	    }
		$('.selectClassType').html(optionStr);
	    
    });
    
    //用于删除模态框显示时的ID内容，用于编辑和新增推广员的判断
    $('#pageModal').on('show.bs.modal', function(){
    	$(this).data('id', '');
    });
	
	//查询按键
	$('.itemSearch').on('click', onSearch);
	
	//用户数据列表显示
	OwnerList('#itemsTable1', '#itemsPager1');
//	PromoterList('#itemsTable2', '#itemsPager2');
	
	$('.tabbable').addClass('hide');
	//用户列表编辑点击确定事件绑定
	//$('#determineClick').on('click', determineClick);
});



//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/new/banner/bannerList
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		userName = $.trim(box.find('[name="userName"]').val()),
		selectClassType = $.trim(box.find('.selectClassType').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var status = $('.nav-tabs .active a').attr('href').slice(-1);
	var postData = {
		keywords: userName,
		searchType: selectClassType
	};
	if(status == 1){
		OwnerList('#itemsTable1', '#itemsPager1', postData);
	}else if(status == 2){
		PromoterList('#itemsTable2', '#itemsPager2', postData);
	}
}



//站主列表
function OwnerList(tableId, pagerId, postData, reload){
		var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/promoter/list?type=1';
		var tableId = '#itemsTable1',
		    pagerId = '#itemsPager1';
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '用户名',name:'userName',index:'userName',width:140, align: 'center'},
			{label: '手机号码',name:'phone',index:'phone',width:100 , align: 'center'},
			{label: '站点编号',name:'stationNo',index:'stationNo',width:100, align: 'center'},
			{label: '归属省份',name:'stationProvince',index:'stationProvince',width:60, align: 'center'},
//			{label: '站点下线',name:'stationBind',index:'stationBind',width:100, align: 'center'},
			{label: '下家总数',name:'totalSubordinate',index:'totalSubordinate',width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var subordinate = colpos.subordinate?colpos.subordinate:0;
					var secondary = colpos.secondary?colpos.secondary:0;
					var total = subordinate-0+secondary;
					return total;
				}
			},
			{label: '一级好友',name:'subordinate',index:'subordinate',width:80, align: 'center'},
			{label: '二级好友',name:'secondary',index:'secondary',width:80, align: 'center'},
			{label: '总收入',name:'rebates',index:'rebates',width:120, align: 'center'},
			//{label: '本月业绩',name:'createTime',index:'createTime',width:120, align: 'center'},
			{label: '操作', name:'operation',index:'', width:180, fixed:true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					str= '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'watch\',\'owner\''  + ')">查看</button> '+
						 '<button class="btn btn-xs btn-primary" onclick="editPromoterFn(' + colpos.id + ')">编辑</button> ';
					return str;
				}
			}

		];
	$('#gbox_itemsTable1').removeClass('hide');
	$('#gbox_itemsTable2').addClass('hide');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '站主');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	
}
//推官员列表
function PromoterList(tableId, pagerId, postData, reload){
		var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/promoter/list?type=2';
		var tableId = '#itemsTable2',
		    pagerId = '#itemsPager2';
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '用户名',name:'userName',index:'userName',width:140, align: 'center'},
			{label: '手机号码',name:'phone',index:'phone',width:80 , align: 'center'},
			{label: '邀请人',name:'fundTypeName',index:'fundTypeName',width:100, align: 'center'},
//			{label: '绑定站点',name:'stationNo',index:'stationNo',width:100, align: 'center'},
//			{label: '归属省份',name:'stationProvince',index:'stationProvince',width:60, align: 'center'},
			{label: '下家总数',name:'totalSubordinate',index:'totalSubordinate',width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var subordinate = colpos.subordinate?colpos.subordinate:0;
					var secondary = colpos.secondary?colpos.secondary:0;
					var total = subordinate-0+secondary;
					return total;
				}
			},
			{label: '一级好友',name:'subordinate',index:'subordinate',width:80, align: 'center'},
			{label: '二级好友',name:'secondary',index:'secondary',width:80, align: 'center'},
			{label: '总收入',name:'rebates',index:'rebates',width:120, align: 'center'},
//			{label: '本月业绩',name:'createTime',index:'createTime',width:120, align: 'center'},
			{label: '操作', name:'operation',index:'', width:180, fixed:true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					str= '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id+ ',\'watch\',\'promoter\''  + ')">查看</button> '+'<button class="btn btn-xs btn-primary" onclick="setPromoterFn(' + colpos.id+ ')">设置站点推广员</button> ';
					return str;
				}
			}

		];
	$('#gbox_itemsTable1').addClass('hide');
	$('#gbox_itemsTable2').removeClass('hide');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '彩民');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	
}
//收入明细
function BounsDetail(tableId, pagerId, postData, reload){
		var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/promoter/listByRebateSubsidiary';
		var tableId = '#itemsTable3',
		    pagerId = '#itemsPager3';
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '用户名',name:'userName',index:'userName',width:140, align: 'center'},
			{label: '关系类型',name:'relation',index:'relation',width:80 , align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					switch(val){
						case 1:str = '直属';break;
						case 2:str = '次级';break;
					}
					return str;
				}
			},
			{label: '是否推广员',name:'type',index:'type',width:100, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					switch(val){
						case 100:str = '是';break;
						case 101:str = '否';break;
					}
					return str;
				}
			},
			{label: '消费时间',name:'createTime',index:'createTime',width:120, align: 'center'},
			{label: '消费额',name:'money',index:'money',width:100, align: 'center'},
			{label: '返利额',name:'rebates',index:'rebates',width:120, align: 'center'},
			/*{label: '返利类型',name:'rebateType',index:'rebateType',width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					switch(val){
						case '1':str = '直属';break;
						case '2':str = '次级';break;
					}
					return val;
				}
			},*/
			{label: '操作', name:'operation',index:'', width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					if(colpos.rebateType == 1){
						str= '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'watch\',\'promoter\''  + ')">查看</button> ';
					}
					return str;
				}
	}  

		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '返利明细');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	
}
//好友明细
function MyNext(tableId, pagerId, postData, reload){
		var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/promoter/listBySubordinate';
		var tableId = '#itemsTable4',
		    pagerId = '#itemsPager4';
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '用户名',name:'userName',index:'userName',width:140, align: 'center'},
			{label: '关系类型',name:'relation',index:'relation',width:80 , align: 'center'/*,
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					switch(val){
						case 1:str = '直属';break;
						case 2:str = '次级';break;
					}
					return str;
				}*/
			},
			{label: '是否推广员',name:'type',index:'type',width:100, align: 'center'/*,
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					switch(val){
						case 100:str = '是';break;
						case 101:str = '否';break;
					}
					return str;
				}*/
			},
			{label: '绑定时间',name:'createTime',index:'createTime',width:120, align: 'center'},
			{label: '总消费额',name:'expenditure',index:'expenditure',width:100, align: 'center'},
			{label: '总返利额',name:'rebates',index:'rebates',width:120, align: 'center'},
			/*{label: '返利类型',name:'rebateType',index:'rebateType',width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					switch(val){
						case '1':str = '直属';break;
						case '2':str = '次级';break;
					}
					return str;
				}
			},*/
			{label: '操作', name:'operation',index:'', width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					if(colpos.rebateType == 1){
					 	str= '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'watch\',\'promoter\''  + ')">查看</button> ';
					}
					return str;
				}
	}  

		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '返利明细');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	
}
//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/new/banner/getBannerById?Id=1
function pageModalFn(userId, typeName,type){
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/promoter/get/' + userId ;
	var tabbable = $('.tabbable'),
		tabContent = tabbable.find('#secondPage');
	$('.row').addClass('hide');
	tabbable.removeClass('hide');
	if(typeName == 'watch'){
		Common.dataAjax(url, function(data){
			strHtmlFn(data.promoterInfo, userId,type);
		});
	}
}

function formatterTime(val){
	var createTime = new Date( val );
	var year = createTime.getFullYear(),
		month = parseInt( createTime.getMonth() )+1,
		day = createTime.getDate(),
		hour = createTime.getHours(),
		minute = createTime.getMinutes(),
		second = createTime.getSeconds();
	return year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;
}
function strHtmlFn(user, id,type){
	//user = user ? user : {};
	if(!user){
		Common.jBoxNotice('数据请求错误，请稍候重试','red');
		return false;
	}
	var userName = user.userName ||'',
	    phone = user.phone ||'',
	    name = user.name ||'',
	    cardNo = user.cardNo ||'',
	    alipayAccount = user.alipayAccount ||'',
	    bankNo = user.bankNo ||'',
	    bankName = user.bankName ||'',
	    bankNo = user.bankNo ||'',
	    bankName = user.bankName || '',
	    bankCity = user.bankAddress ||'',
	    stationNo = user.stationNo ||'',
	    stationBind = user.stationBind ||'',
	    totalSubordinate = user.totalSubordinate || '',
	    level = user.level ||'',
	    exp = user.exp ||'',
	    balance = user.balance ||'',
	    inviter = user.inviter ||'',
	    rebates = user.rebates ||'',
	    rewards = user.rewards ||'',
	    subordinate = user.subordinate ||'',
	    secondary = user.secondary ||'',
	    monthlyRebates = user.umonthlyRebates ||'',
	    stationBind = user.stationBind ||'',
	    totalRebates = user.totalRebates ||'',
	    stationProvince=user.stationProvince ||'',
	    stationAddress = user.stationAddress ||'';
	var tabbable = $('.tabbable'),
		tabContent = tabbable.find('.tab-content');
	/*var _userInfo = '<div id="userInfo" class="clearfix">'+
			            '<div class="form-horizontal" style="float:left;">'+
			      			'<div class="form-group">'+
			      				'<table style="width:100%;text-align:center">'+
			      				  '<tr>'+
			      				  	'<td>推广等级: '+level+'</td>'+
			      				  	'<td>成长值: '+exp+'</td>'+
			      				  	'<td>彩分余额: '+balance+'</td>'+
			      				  '</tr>'+
			      				  '<tr>'+
			      				  	'<td>总返利: '+totalRebates+'</td>'+
			      				  	'<td>一级返利: '+rebates+'</td>'+
			      				  	'<td>二级返利: '+rewards+'</td>'+
			      				  '</tr>'+
			      				  '<tr>'+
			      				  	'<td>下家总数: '+totalSubordinate+'</td>'+
			      				  	'<td>直属下家: '+subordinate+'</td>'+
			      				  	'<td>次级下家: '+secondary+'</td>'+
			      				  '</tr>'+
			      				  '<tr>'+
			      				  	'<td>本月业绩: '+monthlyRebates+'</td>'+
			      				  	'<td>站点下线数: '+stationBind+'</td>'+
			      				  '</tr>'+
			      				'</table>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">用户名：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+userName+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">绑定手机：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+phone+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">姓名：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+name+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">身份证号码：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+cardNo+'</span>'+
			      				'</div>'+
			      			'</div>';
				_userInfo +='<div class="form-group">'+
							    '<label class="col-xs-4 control-label">银行卡号：</label>'+
							    '<div class="col-xs-8">'+
							      	'<span class="form-control" style="border:0">'+bankNo+'</span>'+
							    '</div>'+
							'</div>'+
							'<div class="form-group">'+
							    '<label class="col-xs-4 control-label">开户银行：</label>'+
							    '<div class="col-xs-8">'+
							      	'<span class="form-control" style="border:0">'+bankName+'</span>'+
							    '</div>'+
							'</div>'+
							'<div class="form-group">'+
							    '<label class="col-xs-4 control-label">开户城市：</label>'+
							    '<div class="col-xs-8">'+
							      	'<span class="form-control" style="border:0">'+bankCity+'</span>'+
							    '</div>'+
							'</div>'+
							'<div class="form-group">'+
							    '<label class="col-xs-4 control-label">站点编号：</label>'+
							    '<div class="col-xs-8">'+
							      	'<span class="form-control" style="border:0">'+stationNo+'</span>'+
							    '</div>'+
							'</div>'+
							'<div class="form-group">'+
							    '<label class="col-xs-4 control-label">站点地址：</label>'+
							    '<div class="col-xs-8">'+
							      	'<span class="form-control" style="border:0">'+stationAddress+'</span>'+
							    '</div>'+
							'</div>';
		_userInfo +='</div></div>';*/
	var _userInfo = '<div id="userInfo" style="display:flex;" >'+
			            '<div class="form-horizontal" style="flex:1;">'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">用户名：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+userName+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">手机号码：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+phone+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">好友总数：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+totalSubordinate+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">总收入：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+totalRebates+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">一级好友数：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+subordinate+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">一级好友收入：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+rebates+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">二级好友数：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+secondary+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      			'<div class="form-group">'+
			      				'<label class="col-xs-4 control-label">二级好友收入：</label>'+
			      				'<div class="col-xs-8">'+
			      					'<span class="form-control" style="border:0">'+rewards+'</span>'+
			      				'</div>'+
			      			'</div>'+
			      		'</div>';
			    if(type=="promoter"){
				    _userInfo +='<div class="form-horizontal" style="flex:1;">'+
					      			'<div class="form-group">'+
					      				'<label class="col-xs-4 control-label">推广员身份：</label>'+
					      				'<div class="col-xs-8">'+
					      					'<span class="form-control" style="border:0">'+'普通推广员'+'</span>'+
					      				'</div>'+
					      			'</div>'+
					      			'<div class="form-group">'+
					      				'<label class="col-xs-4 control-label">邀请人用户名：</label>'+
					      				'<div class="col-xs-8">'+
					      					'<span class="form-control" style="border:0">'+inviter+'</span>'+
					      				'</div>'+
					      			'</div>'+
//					      			'<div class="form-group">'+
//					      				'<label class="col-xs-4 control-label">邀请人昵称：</label>'+
//					      				'<div class="col-xs-8">'+
//					      					'<span class="form-control" style="border:0">'+name+'</span>'+
//					      				'</div>'+
//					      			'</div>'+
				      		'</div>';
			    }else if(type=='owner'){
			    	_userInfo +='<div class="form-horizontal" style="flex:1;">'+
				      				'<div class="form-group">'+
					      				'<label class="col-xs-4 control-label">推广员身份：</label>'+
					      				'<div class="col-xs-8">'+
					      					'<span class="form-control" style="border:0">'+'站点推广员'+'</span>'+
					      				'</div>'+
					      			'</div>'+
					      			'<div class="form-group">'+
					      				'<label class="col-xs-4 control-label">站点编号：</label>'+
					      				'<div class="col-xs-8">'+
					      					'<span class="form-control" style="border:0">'+stationNo+'</span>'+
					      				'</div>'+
					      			'</div>'+
					      			'<div class="form-group">'+
					      				'<label class="col-xs-4 control-label">站主姓名：</label>'+
					      				'<div class="col-xs-8">'+
					      					'<span class="form-control" style="border:0">'+name+'</span>'+
					      				'</div>'+
					      			'</div>'+
					      			'<div class="form-group">'+
					      				'<label class="col-xs-4 control-label">身份证号：</label>'+
					      				'<div class="col-xs-8">'+
					      					'<span class="form-control" style="border:0">'+cardNo+'</span>'+
					      				'</div>'+
					      			'</div>'+
					      			'<div class="form-group">'+
					      				'<label class="col-xs-4 control-label">开户行：</label>'+
					      				'<div class="col-xs-8">'+
					      					'<span class="form-control" style="border:0">'+bankName+'</span>'+
					      				'</div>'+
					      			'</div>'+
					      			'<div class="form-group">'+
					      				'<label class="col-xs-4 control-label">银行卡号：</label>'+
					      				'<div class="col-xs-8">'+
					      					'<span class="form-control" style="border:0">'+bankNo+'</span>'+
					      				'</div>'+
					      			'</div>'+
					      			'<div class="form-group">'+
					      				'<label class="col-xs-4 control-label">支付号账号：</label>'+
					      				'<div class="col-xs-8">'+
					      					'<span class="form-control" style="border:0">'+alipayAccount+'</span>'+
					      				'</div>'+
					      			'</div>'+
					      			'<div class="form-group">'+
					      				'<label class="col-xs-4 control-label">所在地区：</label>'+
					      				'<div class="col-xs-8">'+
					      					'<span class="form-control" style="border:0">'+stationProvince+'</span>'+
					      				'</div>'+
					      			'</div>'+
					      			'<div class="form-group">'+
					      				'<label class="col-xs-4 control-label">详细地址：</label>'+
					      				'<div class="col-xs-8">'+
					      					'<span class="form-control" style="border:0">'+stationAddress+'</span>'+
					      				'</div>'+
					      			'</div>'+
				      		'</div>';
			    }
		_userInfo +='</div>';
	var _search = '<div class="form-inline xltab-nav-box">'+
						'<div class="form-group">'+
							'<label>返利时间：</label>'+
							'<select class="form-control selectClassType1"></select>'+
						'</div>'+
						'<div class="form-group">'+
							'<label>返利额：</label>'+
							'<select class="form-control selectClassType2"></select>'+
						'</div>'+
						'<div class="form-group">'+
							'<label>用户类型：</label>'+
							'<select class="form-control selectClassType3"></select>'+
						'</div>'+
						'<div class="form-group">'+
							'<label>用户名：</label>'+
							'<input type="text"  name="userName" class="form-control">'+
						'</div>'+
						'<button class="btn btn-info btn-sm itemSearch1">查询</button> ';
	var exportBtn3 = '<a class="btn btn-sm btn-info" onclick="toExcel(3)" id="exportExcel3">导出excel表格</a>';					
	var exportBtn4 = '<a class="btn btn-sm btn-info" onclick="toExcel(4)" id="exportExcel4">导出excel表格</a>';					
	var _searchEnd = '</div>';
	var _bounsDetail = '<div id="bounsDetail" role="tabpanel" class="tab-pane tabPane">'+_search+exportBtn3+_searchEnd+
							'<table class="itemGridTable" id="itemsTable3"></table>'+
							'<div class="itemGridPager" id="itemsPager3"></div>';
		_bounsDetail += '</div>';
	var _myNext = '<div id="myNext" role="tabpanel" class="tab-pane tabPane">'+_search+exportBtn4+_searchEnd+
							'<table class="itemGridTable" id="itemsTable4"></table>'+
							'<div class="itemGridPager" id="itemsPager4"></div>';
		_myNext += '</div>';
	var str =  ''; 
	    str += _userInfo + _bounsDetail + _myNext;
	tabContent.html(str);
	var optionStr = '';
	$.each(rebateDateList, function(index, obj){
		if(index == 0){
			optionStr += '<option value="">请选择</option>';
		}
		optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
	});
	$('.selectClassType1').html(optionStr);
	optionStr = '';
	$.each(rebateLimitList, function(index, obj){
		optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
	});
	$('.selectClassType2').html(optionStr);
	optionStr = '';
	$.each(promoterRelationshipTypeList, function(index, obj){
		if(index == 0){
			optionStr += '<option value="">请选择</option>';
		}
		optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
	});
	$('.selectClassType3').html(optionStr);
	$('#secondPage>div').addClass('hide');
	$('#secondPage>div:first-child').removeClass('hide');
	var paramBouns = {
		  rootNo : user.userNo
	};
	var paramNext = {
		  parentNo : user.userNo
	};
	BounsDetail("#itemsTable3","#itemsPager3",paramBouns);
	MyNext("#itemsTable4","#itemsPager4",paramNext);
	$(document).on('click','#myTab a',function(){
	   $('#secondPage>div').addClass('hide');
	   $('#secondPage>div.active').removeClass('hide');
   });
//  modal.modal(show);
    $('.goBack').click(function(){
    	$('.row').removeClass('hide');
    	tabbable.find('ul li.active').removeClass('active');
    	tabbable.find('ul li:first-child').addClass('active');
		tabbable.addClass('hide');
    });
    $('.itemSearch1').click(function(){
    	var me = $(this),
			box = me.parents('.tabPane'),
			id = box.attr('id'),
			userName = $.trim(box.find('[name="userName"]').val()),
			time = $.trim(box.find('.selectClassType1').val()),
			bouns = $.trim(box.find('.selectClassType2').val()),
			type = $.trim(box.find('.selectClassType3').val()),
			table = box.find('.itemGridTable'),
			pager = box.find('.itemGridPager');
		var status = id.slice(-1);
		var postData = {
			userName : userName,
			rebateDate : time,
			rebateLimit : bouns,
			relation : type 
		};
		if(status == 'l'){
			postData.rootNo = user.userNo;			
			BounsDetail('#itemsTable3', '#itemsPager3', postData);
		}else if(status == 't'){
			postData.parentNo = user.userNo;
			MyNext('#itemsTable4', '#itemsPager4', postData);
		}
    });
}
//新增站点推广员
function addPromoterFn(type){
	var modal = $("#pageModal");
	modal.modal('show');
	modal.find('input').val('');

	modal.find(".phone").attr("disabled",false);
}
//编辑站主推广员
function editPromoterFn(id){
	var modal = $("#pageModal");
	modal.modal('show');
	modal.data('id', id);
	var url = '/ushop-web-admin/promoter/get/' + id ;
	Common.ajax(url, 'get', {}, function(data){
		$.each(data.promoterInfo, function(key, val){
			modal.find('[name="' + key + '"]').val(val);
		});
		var addr = data.promoterInfo.stationAddress,
			arr = addr.split('|');
		$('#city').citySelect(arr);
		modal.find('[name="stationAddress"]').val(arr[3]);
		modal.find(".phone").attr("disabled",true);
	});
}
//设置站点推广员
function setPromoterFn(userId,type){
	var modal = $("#pageModal");
	modal.modal('show');
	modal.find('input').val('');

	var url = Common.DOMAIN_NAME + '/ushop-web-admin/promoter/get/' + userId ;
	Common.dataAjax(url, function(data){
			modal.find(".phone").val(data.promoterInfo.phone).attr("disabled",true);
		});
}
function determinePromoter(){
	var modal = $("#pageModal"),
	    _param = {},
	    phone = modal.find('.phone').val(),
	    stationNo = modal.find('.stationNo').val(),
	    name = modal.find('.name').val(),
	    cardNo = modal.find('.cardNo').val(),
	    bankName = modal.find('[name="bankName"]').val(),
	    bankNo = modal.find('[name="bankNo"]').val(),
	    alipayAccount = modal.find('[name="alipayAccount"]').val(),
	    stationProvince = modal.find('.stationProvince').val(),
	    stationCity = modal.find('.stationCity').val(),
	    stationArea = modal.find('.stationArea').val(),
	    stationAddress = modal.find('.stationAddress').val();
	    _param={
	    	phone:phone,
	    	stationNo:stationNo,
	    	name:name,
	    	cardNo:cardNo,
	    	bankName: bankName,
	    	bankNo: bankNo,
	    	alipayAccount: alipayAccount,
	    	stationProvince:stationProvince,
	    	stationCity:stationCity,
	    	stationArea:stationArea,
	    	stationAddress:stationAddress,
	    
	    }
	if(!globalData.regExpPhone.test(_param.phone)) {
			Common.jBoxNotice('请输入正确的手机号', 'red');
			return false;
		}
	if(!globalData.regExpCard.test(_param.cardNo)) {
			Common.jBoxNotice('请输入合法的身份证号', 'red');
			return false;
		}
	if(!_param.bankName) {
			Common.jBoxNotice('请输入开户行名称', 'red');
			return false;
		}
	if(!_param.bankNo) {
			Common.jBoxNotice('请输入银行卡号', 'red');
			return false;
		}
	if(!_param.alipayAccount) {
			Common.jBoxNotice('请输入支付宝账号', 'red');
			return false;
		}
	if(!_param.stationNo) {
			Common.jBoxNotice('请输入站点编号', 'red');
			return false;
		}
	if(!_param.name) {
			Common.jBoxNotice('请输入站主姓名', 'red');
			return false;
		}
	if(!_param.stationAddress) {
			Common.jBoxNotice('请输入详细地址', 'red');
			return false;
		}
	var id = modal.data('id'),
		_url = '/ushop-web-admin/promoter/add';
	if(id){
		_param.id = id;
		_url = '/ushop-web-admin/promoter/update';
	}
	Common.ajax(_url, 'post', _param, function(data) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice('操作成功', 'green');
			modal.find('input').val('');
			modal.modal('hide');
			$('.xltab-box').find('li.active').find('[data-toggle="tab"]').trigger('click');
		} else {
			Common.jBoxNotice((data.error_description || '未知错误'), 'red');
			return false
		}
	});

}
//导出excel表格
function toExcel(n){
	var param = {
		type:'excel',
		escape:'false'
	}
	switch(n){
		case 1:param.fileName = '站主列表';param.aId = 'exportExcel1';break;
		case 2:param.fileName = '彩民列表';param.aId = 'exportExcel2';break;
		case 3:param.fileName = '返利明细';param.aId = 'exportExcel3';break;
		case 4:param.fileName = '我的下家';param.aId = 'exportExcel4';break;
	}
	$('#gview_itemsTable' +n).tableExport(param);
}