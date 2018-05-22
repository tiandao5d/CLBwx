/**
 * 
 * BaskOrderList.js
 * 晒单管理-晒单列表
 * 作者：xulin
 * 
 * */

var globalData = {};
var oldImage = /group1/;
globalData.regExpPhone = /^1(3|4|5|7|8)\d{9}$/;
jQuery(function($) {
	//菜单面包屑导航等配置显示
	Common.menuNavContent('晒单管理', '晒单审核','夺宝管理后台');
	//日期选择器绑定
//	$(".form_datetime.dd").datetimepicker({
//		format:'yyyy-mm-dd',
//		autoclose:true,
//		language: 'zh-CN',
//		startView: 2,
//		maxView: 4,
//		minView:2
//	});
	jeDate({
		dateCell:"#xlgridBox .startDate",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#xlgridBox .endDate",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	//绑定只读的日期选择输入框一个双击清空的事件
	$(".form_datetime[readonly]").dblclick(function(){
		$(this).val('').blur();
	});
	globalDataFn(function(data){
	
		$('.nav-tabs li a').on('click',function(e){
			var typeIndex = $(this).attr('typeIndex');
				typeIndex ||(typeIndex = '');
			var postData = {
					status : typeIndex
				};
			baskOrderList('#itemsTable1', '#itemsPager1', postData);
		});
		
		//查询按键
		$('.itemSearch').on('click', function(){
			onSearch.call(this);
		});
		
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			$(window).trigger('resize.jqGrid');
		});
		baskOrderList('#itemsTable1', '#itemsPager1');
	});
});
//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/share/getConstants';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.shareStatusList = data.shareStatusList;
			callback.call(this, data);
		}else{
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
}

//搜索函数
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		shareTime = $.trim(box.find('.form_datetime.startDate').val()),
		startDate = $.trim(box.find('.form_datetime.startDate').val()),
		endDate = $.trim(box.find('.form_datetime.endDate').val()),
//		productPeriod = $.trim(box.find('.productPeriod').val()),
//		productName = $.trim(box.find('.productName').val()),
		userName = $.trim(box.find('.userName').val()),
		shareStatus = 
		userTel = $.trim(box.find('.userTel').val()),
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
		if(userTel && !globalData.regExpPhone.test(userTel)){Common.jBoxNotice('请输入有效手机号','red');return false}
	
	var postData = {
		startDate: startDate,
		endDate: endDate,
//		productPeriod: productPeriod,
//		productName: productName,
		userName: userName,
		mobileNo :userTel,
		shareStatus: $('.nav-tabs li.active a').attr('typeindex')
	};
	baskOrderList('#itemsTable1', '#itemsPager1', postData);
}

//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    需要传递给服务器的参数，一个对象
//http://10.35.0.66:8080/ushop-web-admin/share/list
function baskOrderList(tableId, pagerId, postData){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/share/list'
		colModel = [
//			{label: '标题',name:'title',index:'title',width:180, align: 'center'},
			{label: '内容',name:'content',index:'content',width:220, align: 'center'},
			{label: '商家质量',name:'1',index:'1',width:140, align: 'center',fixed:true,
				formatter: function(val, cellval , colpos, rwdat){
					var star =colpos.score.split(',');
					var star0 = star[0].split('[');
					var str = Common.showStar(star0[1]);
					return str
				}
			},
			{label: '商家服务',name:'2',index:'2',width:140, align: 'center',fixed:true,
				formatter: function(val, cellval , colpos, rwdat){
					var star =colpos.score.split(',');
					var str = Common.showStar(star[1]);
					return str
				}
			},
			{label: '发货速度',name:'3',index:'3',width:140, align: 'center',fixed:true,
				formatter: function(val, cellval , colpos, rwdat){
					var star =colpos.score.split(',');
					var star2 = star[2].split(']');
					var str = Common.showStar(star2[0]);
					return str
				}
			},
			{label: '晒单时间',name:'date',index:'date',width:120, align: 'center'},
			{label: '中奖者',name:'userName',index:'userName',width:120, align: 'center'},
			{label: '状态',name:'status',index:'status',width:120, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					$.each(globalData.shareStatusList,function(index,obj){
						if(val == obj.value){
							str = obj.desc;
						}
					});
					return str
				}
			},
			{label: '操作', name:'',index:'', width:240,fixed:true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					str += '<button class="btn btn-xs btn-primary" onclick="detailsFn(' + colpos.spellbuyProductId + ')">晒单详情</button> ';
					if(colpos.status == 1){
					str +=	'<button class="btn btn-xs btn-primary" onclick="statusFn(' + colpos.id +',2' +')">审核通过</button> ';
					str +=	'<button class="btn btn-xs btn-primary" onclick="statusFn(' + colpos.id +',3' +')">审核不通过</button> ';
					}
					return str;
				}
			}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '晒单列表');
}


//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/share/shareInfo?id=2
function detailsFn(id, type){
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/share/getById?id=' + id,
		str = '', imgStr = '';
	var modal = $('#detailsModal'),
		detailsItemSd = modal.find('.detailsItemSd'),
		tbody = detailsItemSd.find('tbody');
	modal.modal('show');
	Common.dataAjax(url, function(data){
		data.shareInfo = data.shareInfo || {};
		data.productInfo = data.productInfo || {};
		data.merchantInfo = data.merchantInfo || {};
		var title = data.shareInfo.title || '',//标题
			content = data.shareInfo.content || '',//内容
			upCount = data.shareInfo.upCount || '',//赞
			replyCount = data.shareInfo.replyCount || '',//回复
			_date = data.shareInfo.date || '',//时间
			userId = data.shareInfo.userId || '',//用户ID
			userName = data.shareInfo.userName || '',//用户ID
			productName = data.productInfo.productName || '',//商品名称
			merchantName = data.merchantInfo.merchantName || '',//商家名称
			score = data.shareInfo.score || '[0,0,0]',//好评分
			image1 = data.shareInfo.image1,//图片1
			image2 = data.shareInfo.image2,//图片2
			image3 = data.shareInfo.image3;//图片3
		var starScore = score.split(',');
		var star1 = starScore[0].split('[');
		var star3 = starScore[2].split(']');
		var star1 = Common.showStar(star1[1]);
		    star2 = Common.showStar(starScore[1]);
			star3 = Common.showStar(star3[0]);
		var imgArr = [image1,image2,image3];
		for(var i=0;i<imgArr.length;i++){
			if(imgArr[i]&&Common.oldImage.test(imgArr[i])){
				imgStr += '<img width="80" src="' + (Common.IMAGE_URL + imgArr[i]) + '"> ';
			}else if(imgArr[i]){
				imgStr += '<img width="80" src="' + imgArr[i] + '"> ';
			}
		}
		str = //'<tr><td class="text-right">标题</td><td>' + title + '</td></tr>'+
			  '<tr><td class="text-right">内容</td><td>' + content + '</td></tr>'+
			  '<tr><td class="text-right">获赞数</td><td>' + upCount + '</td></tr>'+
			  '<tr><td class="text-right">回复数</td><td>' + replyCount + '</td></tr>'+
//			  '<tr><td class="text-right">幸运编号</td><td>' + _date + '</td></tr>'+
			  '<tr><td class="text-right">揭晓时间</td><td>' + _date + '</td></tr>'+
			  '<tr><td class="text-right">中奖者</td><td>' + userName + '</td></tr>'+
			  '<tr><td class="text-right">商家名称</td><td>' + merchantName + '</td></tr>'+
			  '<tr><td class="text-right">商品名称</td><td>' + productName + '</td></tr>'+
			  '<tr><td class="text-right">商家质量</td><td>' + star1 + '</td></tr>'+
			  '<tr><td class="text-right">商家速度</td><td>' + star2 + '</td></tr>'+
			  '<tr><td class="text-right">发货速度</td><td>' + star3 + '</td></tr>'+
			  '<tr><td class="text-right">晒单图片</td><td>' + imgStr + '</td></tr>';
		tbody.html(str);
	});
}
function statusFn(id,status){
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/share/auditShare?id=' + id + '&status=' + status;
	var content = '';
	if(status == 2){
		content = '确定要审核通过吗？';
	}else if(status == 3){
		content = '确定要审核不通过吗？';
	}
	Common.jBoxConfirm('晒单审核',content,function(){
	    if(arguments[0] == 1){
			Common.dataAjax(_url, function(data){
				if(data.data == 'SUCCESS'){
					Common.jBoxNotice('操作成功', 'green');
					baskOrderList('#itemsTable1', '#itemsPager1');
				}else{
					Common.jBoxNotice('操作失败，请稍后重试', 'red');
				}		          
			});
		}
	});
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'晒单审核'});
}