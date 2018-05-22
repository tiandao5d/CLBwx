/**
 * 
 * productList.js
 * 用户管理-用户列表
 * 作者：roland
 * 
 * */

//硬性数据
var globalData = {};
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
	Common.menuNavContent('商品管理', '商品列表','夺宝管理后台');
	globalData.menuTitile = $('#menuPageHeader h1').html();
	globalData.menuTitileDetail = globalData.menuTitile + '<small><i class="ace-icon fa fa-angle-double-right"></i>商品详情</small>';
	//全局变量赋值，页面数据初始化完成后执行页面操作
	globalDataFn(function(data){
		//查询按键
		$('.itemSearch').on('click', function(e){
			onSearch.call(this, e);
		});
		
		$.each(globalData.typeList, function(index, obj){
			if(index == 0){
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.selectClassType1').html(optionStr);
		optionStr = '';
		$.each(globalData.listMerchantInfo, function(index, obj){
			if(index == 0){
				optionStr += '<option value="">全部商家</option>';
			}
			optionStr += '<option value="' + obj.merchantNo + '">' + obj.merchantName + '</option>';
		});
		$('.merchantName').html(optionStr);
		optionStr = '';
		$.each(globalData.bandList, function(index, obj){
			if(index == 0){
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.selectClassType2').html(optionStr);
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			$(window).trigger('resize.jqGrid');
		});
		//用户数据列表显示
		ProductList('#itemsTable1', '#itemsPager1');
		
		//点击添加用户列表事件绑定
		$('.itemAdd').on('click', function(){
			pageModalFn('', 'add');
		});
		$('.nav-tabs li a').on('click',function(e){
			var target = e.target;
			var status = target.href.slice(-1);
			var productStatus = '';
			switch(status){
				case '2': productStatus = '2';break;
				case '3': productStatus = '1';break;
				case '5': productStatus = '5';break;
				default: productStatus = '';
			}
			var postData = {
				productStatus: productStatus
			};
			ProductList('#itemsTable1', '#itemsPager1', postData);
		});
		//用户列表编辑点击确定事件绑定
		$('#determineClick').on('click', determineClick);

	});
	
});

//全局参数请求
function globalDataFn(callback){
	callback = callback || function() {};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/getConstants';
	Common.dataAjax(_url, function(data, status) {
		if(status == 'success') {
//			globalData.bandList = data.bandList;
			globalData.productStatusList = data.productStatusList;

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

//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/new/banner/bannerList
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		merchantName = $.trim(box.find('[name="merchantName"]').val()),
		productName = $.trim(box.find('[name="productName"]').val()),
		productType = $.trim(box.find('.selectClassType1').val()),
		productBrand = $.trim(box.find('.selectType2').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var status = $('.nav-tabs .active a').attr('href').slice(-1);
	var productStatus;
		switch(status){
			case '2': productStatus = '2';break;
			case '3': productStatus = '1';break;
			case '5': productStatus = '5';break;
			default: productStatus = '';
		}
    var postData = {
    	merchantNo: merchantName,
		productName: productName,
		productType: productType,
		productBrand: productBrand,
		productStatus: productStatus
	};
	ProductList('#itemsTable1', '#itemsPager1', postData);
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
function ProductList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/product/list'
	console.log(gridUrl);
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '商家ID',name:'merchantId',index:'merchantId',width:160 , align: 'center'},
			{label: '商家名称',name:'merchantName',index:'merchantName',width:160 , align: 'center'},
			{label: '商品ID',name:'id',index:'id',width:100 , align: 'center'},
			{label: '商品名称',name:'productName',index:'productName',width:160 , align: 'center'},
			{label: '商品成本价格',name:'productRealPrice',index:'productRealPrice',width:100, align: 'center'},
			{label: '商品销售价格',name:'productPrice',index:'productPrice',width:100, align: 'center'},
			{label: '商品图片',name:'headImage',index:'headImage',width:120, align: 'center',
				formatter: function(cellVal, cellData , rowData){
					var str = '<img width="100" src="' + (Common.IMAGE_URL + cellVal) + '">'
					return str;
				}
			},
			{label: '商品类型',name:'productType',index:'productType',width:120, align: 'center',
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
			{label: '商品品牌',name:'productBrand',index:'productBrand',width:60, align: 'center',
				formatter: function(cellVal, cellData , rowData){
					$.each(globalData.bandList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;
							return false;
						}
						if(!cellVal){
							cellVal = '';
							return false;
						}
					});
					return cellVal;
				}
			},
			{label: '所属状态',name:'status',index:'status',width:60, align: 'center',
				formatter: function(cellVal, cellData , rowData){
					$.each(globalData.productStatusList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;
							return false;
						}
						
					});
					return cellVal;
				}
			},
			{label: '操作', name:'operation',index:'', width:180, fixed: true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '<button class="btn btn-xs btn-primary" onclick="productInfo('+colpos.id+',\'watch\' ' +')">查看</button> ';
					return str;
				}
			}

		];

	$('#gbox_itemsTable2').css('display','none');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '用户列表');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	$('#determineClick').css('display','none');
	
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

//商品详情
function productInfo(id, typeName){
	$('#menuPageHeader h1').html(globalData.menuTitileDetail);
	var _url = Common.DOMAIN_NAME+'/ushop-web-admin/product/getById?id=' + id;
	Common.dataAjax(_url,function(data){
	   var productInfo = $('#productInfo');
	   	   data.product = data.product || {};
	   var productName = data.product.productName ||'',
	   	   productTitle = data.product.productTitle ||'',
	   	   productRealPrice = data.product.productRealPrice ||'',
	   	   productPrice = data.product.productPrice ||'',
	   	   singlePrice = data.product.singlePrice || '',
	   	   spellbuyCount = data.product.spellbuyCount || '',
	   	   winner = data.product.winner || '',
	   	   productStyle = data.product.style || '',
	   	   productType = data.product.productType || '',
	   	   productDetails = data.product.productDetails || '',
	   	   productBrand = data.product.productBrand || '',
	   	   headImage = data.product.headImage?(Common.IMAGE_URL+data.product.headImage):'',
	   	   productLimit = data.product.productLimit || 0,
	   	   stock = data.product.stock || 0;
	   	var scrollImage = '';
	   	var bigImage = '';
	   productInfo.find('[name=productName]').val(productName).attr('readonly','true');
	   productInfo.find('[name=productTitle]').val(productTitle).attr('readonly','true');
	   productInfo.find('[name=productRealPrice]').val(productRealPrice).attr('readonly','true');
	   productInfo.find('[name=productPrice]').val(productPrice).attr('readonly','true');
	   productInfo.find('[name=productLimit]').val(productLimit).attr('readonly','true');
	   productInfo.find('[name=singlePrice]').val(singlePrice).attr('readonly','true');
	   productInfo.find('[name=spellbuyCount]').val(spellbuyCount).attr('readonly','true');
	   productInfo.find('[name=winner]').val(winner).attr('readonly','true');
	   productInfo.find('[name=stock]').val(stock).attr('readonly','true');
	   productInfo.find('[name=productStyle]').val(productStyle).attr('readonly','true');
	   productInfo.find('.selectClassType1').val(productType);
	   productInfo.find('.selectClassType2').val(productBrand);
	   headImg = '<img src="' + headImage + '"alt="缩略图" style="width:54px">';
	   $.each(data.productImgList, function(index,obj) {
	   	if(obj.imageType == 1){
	   		scrollImage += '<img src="' + Common.IMAGE_URL+obj.imagePath + '"alt="缩略图" style="width:54px">';
	   	}else if(obj.imageType == 2){
	   		bigImage += '<img src="' + Common.IMAGE_URL+obj.imagePath + '"alt="缩略图">';
	   	}
	   });
	   productInfo.find('.imgShow').html('');
	   productInfo.find('.scrollImageShow').html('');
	   productInfo.find('.bigImageShow').html('');
	   productInfo.find('.imgShow').append(headImg);
	   productInfo.find('.scrollImageShow').append(scrollImage);
	   productInfo.find('.bigImageShow').append(bigImage);
	   productInfo.find('.productDetails').html(productDetails);
       $('.row').css('display','none');
       $('#productInfo').css('display','block');
	});
}
function goBack(){
	$('#menuPageHeader h1').html(globalData.menuTitile);
    $('#productInfo').css('display','none');
	$('.row').css('display','block');
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'商品列表'});
}