/**
 * 
 * productList.js
 * 用户管理-用户列表
 * 作者：roland
 * 
 * */
"use strict";
//硬性数据
var globalData = {};
globalData.regNumber = /^[0-9]+?$/;
globalData.regFloatNumber = /^\d*(.\d{0,2})$/;
globalData.buyStyle = 0;
var oldVal = {};
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
	Common.menuNavContent('商品管理', '商城商品审核','夺宝管理后台');
	globalData.menuTitile = $('#menuPageHeader h1').html();
	globalData.menuTitileDetail = globalData.menuTitile + '<small><i class="ace-icon fa fa-angle-double-right"></i>商品详情</small>';
	//搜索栏选择框赋值
	
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
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			$(window).trigger('resize.jqGrid');
		});
		//用户数据列表显示
		ProductCheck('#itemsTable1', '#itemsPager1');
		
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
				case '3': productStatus = '3';break;
				case '4': productStatus = '4';break;
				default: productStatus = '';
			}
			var postData = {
				productStatus: productStatus
			};
			ProductCheck('#itemsTable1', '#itemsPager1', postData);
		});
		//用户列表编辑点击确定事件绑定
		$('#determineClick').on('click', determineClick);
		$('#buyStyle').on('click',chooseBuyStyle);
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
		userName = $.trim(box.find('[name="userName"]').val()),
		productType = $.trim(box.find('.selectClassType1').val()),
		merchantNo = $.trim(box.find('[name="merchantName"]').val()),
		productBrand = $.trim(box.find('.selectClassType2').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var status = $('.nav-tabs .active a').attr('href').slice(-1);
	var productStatus;
		switch(status){
			case '2': productStatus = '2';break;
			case '3': productStatus = '3';break;
			case '4': productStatus = '4';break;
			default: productStatus = '';
		}
	var postData = {
		productName: userName,
		productType: productType,
		productBrand: productBrand,
		merchantNo : merchantNo,
		productStatus: productStatus
	};
	ProductCheck('#itemsTable1', '#itemsPager1', postData);
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
function ProductCheck(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/product/list',
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '商家ID',name:'merchantId',index:'merchantId',width:160 , align: 'center'},
			{label: '商家名称',name:'merchantName',index:'merchantName',width:160 , align: 'center'},
			{label: '商品名称',name:'productName',index:'productName',width:160 , align: 'center'},
			{label: '商品成本价格',name:'productRealPrice',index:'productRealPrice',width:100, align: 'center'},
			{label: '商品销售价格',name:'productPrice',index:'productPrice',width:100, align: 'center'},
			{label: '商品图片',name:'headImage',index:'headImage',width:120, align: 'center',
				formatter: function(cellVal, cellData , rowData){
					if(Common.oldImage.test(cellVal)){					
						var str = '<img width="100" src="' + (Common.IMAGE_URL + cellVal) + '">'
					}else{
						var str = '<img width="100" src="' + cellVal + '">'
					}
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
			{label: '操作', name:'operation',index:'', width:240, fixed: true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '<button class="btn btn-xs btn-primary" onclick="productInfo('+colpos.id+',\'watch\' ' +')">查看</button> ';
					if(colpos.status == 3){
						str += '<button class="btn btn-xs btn-primary" onclick="productInfo('+colpos.id+',\'edit\' ' +')">审核并上架</button> ';
						str += '<button class="btn btn-xs btn-primary" onclick="unAuditedProduct('+colpos.id+')">拒绝并下架</button>';						
					}
					return str;
				}
			}

		];
	 if(!postData){
    	postData = {productStatus : 3};
    }
    postData.usage = 2;
	$('#gbox_itemsTable2').css('display','none');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '商城商品审核');
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

function chooseBuyStyle(){
	var buyStyle = $('#buyStyle');
	var systemPrice = $('#systemPrice');
	var systemPoint = $('#systemPoint');
	if(!globalData.buyStyle){
		buyStyle.prop('checked',true);
		systemPrice.removeAttr('readonly')
		systemPoint.removeAttr('readonly')		
		globalData.buyStyle = 1;
	}else{
		buyStyle.prop('checked',false);
		systemPrice.prop('readonly',true)
		systemPoint.prop('readonly',true)
		globalData.buyStyle = 0;
	}
}

function unAuditedProduct(id){
	Common.jBoxConfirm('商品审核','<div style="margin-bottom:10px">确定要审核不通过吗？</div><input id="reason" type="text" placeholder="请输入不通过理由"/>',function(){
	    if(arguments[0] == 1){
		    var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/unAuditedProduct';
		    var reason = $.trim($('#reason').val());
		    if(!reason){
		    	Common.jBoxNotice('请填写审核不通过理由','red');
		    	return false;
		    }
		    if(reason.length>100){
			    Common.jBoxNotice('审核不通过理由请少于100字','red');
			    return false;
			}
		    Common.dataAjaxPost(_url, {id : id,instructionp:reason}, function(data){
				if(data.data == 'SUCCESS'){
					Common.jBoxNotice( '商品下架成功', 'green');
					var productStatus = '';
					switch(status){
						case '2': productStatus = '2';break;
						case '3': productStatus = '3';break;
						case '4': productStatus = '4';break;
						default: productStatus = '';
					}
					var postData = {
						productStatus: productStatus
					};
								ProductCheck('#itemsTable1', '#itemsPager1',postData);
							}else if(data.error){
								Common.jBoxNotice('商品下架失败,'+ data.error_description, 'red');
							}else{
								Common.jBoxNotice('商品下架失败，请稍后重试', 'red');
							}
				       	});
				    }
	});
}
//商品详情
function productInfo(id, typeName){
	$('#menuPageHeader h1').html(globalData.menuTitileDetail);
	var _url = Common.DOMAIN_NAME+'/ushop-web-admin/product/getById?id=' + id;
	Common.dataAjax(_url,function(data){
	   var productInfo = $('#productInfo');
	   var productName = data.product.productName ||'',
	   	   productTitle = data.product.productTitle ||'',
	   	   productRealPrice = data.product.productRealPrice ||'',
	   	   productPrice = data.product.productPrice ||'',
	   	   singlePrice = data.product.singlePrice || '',
	   	   winner = data.product.winner || '',
	   	   productStyle = data.product.style || '',
	   	   spellbuyCount = data.product.spellbuyCount || '',
	   	   point= data.product.point || 0,
	   	   freight = data.product.freight || 0,
	   	   productDetails = data.product.productDetails || '',
	   	   headImage = data.product.headImage,
	   	   productLimit = data.product.productLimit || 0,
	       rule = data.product.rule ||'', 	   
	   	   stock = data.product.stock || 0;
	   	var scrollImage = '';
	   	var bigImage = '';
	   	var productType = '',productBrand = '';
	   	$.each(globalData.typeList, function(index, obj) {
			if(data.product.productType == obj.value){
				productType = obj.desc;
			}						
		});
		$.each(globalData.bandList, function(index, obj) {
			if(data.product.productBrand == obj.value){
				productBrand = obj.desc;
			}						
		});
		
	   productInfo.find('[name=productName]').val(productName).attr('readonly','true');
	   productInfo.find('[name=productTitle]').val(productTitle).attr('readonly','true');
	   productInfo.find('[name=productRealPrice]').val(productRealPrice).attr('readonly','true');
	   productInfo.find('[name=productPrice]').val(productPrice);
	   productInfo.find('[name=productLimit]').val(productLimit).attr('readonly','true');
	   productInfo.find('[name=stock]').val(stock).attr('readonly','true');
	   productInfo.find('[name=point]').val(point).attr('readonly','true');
	   productInfo.find('[name=freight]').val(freight).attr('readonly','true');
	   productInfo.find('[name=singlePrice]').val(singlePrice).attr('readonly','true');
	   productInfo.find('[name=spellbuyCount]').val(spellbuyCount).attr('readonly','true');
	   productInfo.find('[name=winner]').val(winner).attr('readonly','true');
	   productInfo.find('[name=productStyle]').val(productStyle).attr('readonly','true');
	   productInfo.find('.selectClassType1').val(productType).attr('readonly','true');
	   productInfo.find('.selectClassType2').val(productBrand).attr('readonly','true');
	  if(Common.oldImage.test(headImage)){
	   	headImage = Common.IMAGE_URL + headImage;
	   }
	 var headImg = '<img src="' + headImage + '"alt="缩略图" style="width:54px">';
	   $.each(data.productImgList, function(index,obj) {
	   	if(obj.imageType == 1){
	   		if(Common.oldImage.test(obj.imagePath)){
	   			obj.imagePath = Common.IMAGE_URL+ obj.imagePath;
	   		}
	   		scrollImage += '<img src="' + obj.imagePath + '"alt="缩略图" style="width:54px">';
	   	}else if(obj.imageType == 2){
	   		if(Common.oldImage.test(obj.imagePath)){
	   			obj.imagePath = Common.IMAGE_URL+ obj.imagePath;
	   		}
	   		bigImage += '<img src="' +obj.imagePath + '"alt="缩略图">';
	   	}
	   });
	   if(rule){
	   		var ruleDetail = '';
	   		if(/:+/.test(rule)){ruleDetail = JSON.parse(rule);}
	   		if(ruleDetail&&ruleDetail.length>1){	   			
		   		var systemPrice = ruleDetail[ruleDetail.length-1].currencys[0].value||'';
		   		var systemPoint = ruleDetail[ruleDetail.length-1].currencys[1].value||'';
		   	 	$('#buyStyleHide').removeClass('hide');
		   	 	$('#buyStyle').prop('checked','checked');
		   	 	$('#systemPrice').val(systemPrice);
		   	 	$('#systemPoint').val(systemPoint);
	   		}else{
	   			$('#buyStyleHide').addClass('hide');
	   			$('#buyStyle').removeAttr('checked');
		   	 	$('#systemPrice').val('');
		   	 	$('#systemPoint').val('');
	   		}   	 	
	   }
	   productInfo.find('.imgShow').html('');
	   productInfo.find('.scrollImageShow').html('');
	   productInfo.find('.bigImageShow').html('');
	   productInfo.find('.imgShow').append(headImg);
	   productInfo.find('.scrollImageShow').append(scrollImage);
	   productInfo.find('.bigImageShow').append(bigImage);
	   productInfo.find('.productDetails').html(productDetails);
       $('.row').css('display','none');
       $('#productInfo').css('display','block');
       if(typeName == 'edit'){
       		$('#buyStyleHide').removeClass('hide');
       	    $('#submit').css('display','block').unbind('click').click(function(){
       	    	var price = productInfo.find('#systemPrice').val();
       	    	var point = productInfo.find('#systemPoint').val();
				var rule = data.product.rule;
				if(/:+/.test(rule)){
					rule = JSON.parse(rule);
				}else{
					rule = [];
					rule.push({'currencys':[{'type':999,'value':productPrice}],'flag':1});
				}
				
       	    	if(globalData.buyStyle==1){
       	    		if(!price){
       	    			Common.jBoxNotice('请输入现金价格','red');
       	    			return false
       	    		}
       	    		if(price<0||!globalData.regFloatNumber.test(price)){
       	    			Common.jBoxNotice('现金价格为正数','red');
       	    			return false
       	    		}
       	    		if(!point||point<0){
       	    			Common.jBoxNotice('请输入积分价格，为正整数','red');
       	    			return false
       	    		}
				   	rule[0].flag=0;
				   	var a = {'currencys':[{'type':999,'value':price},{'type':1001,'value':point}],'flag':1};
				   	var b=[];
				   	b.push(rule[0]);
				   	b.push(a);
				   	//b = JSON.stringify(b)
				   	rule = b;
       	    	}
       	    	rule = JSON.stringify(rule)
       	    	var _param = {
       	    		id:id,
       	    		rule:rule,
       	    		singlePrice :0,
       	    		spellbuyCount :0,
       	    		usage:2
       	    	}
       	    	Common.jBoxConfirm('商品审核','确定要审核通过吗？',function(){
	    			if(arguments[0] == 1){
		       	    	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/auditProductToSell';
		       	    	var productPrice = productInfo.find('[name=productPrice]').val();
		       	    	Common.dataAjaxPost(_url, _param, function(data){
							if(data.data == 'SUCCESS'){
								Common.jBoxNotice( '商品上架成功', 'green');
								$('#submit').css('display','none');
								goBack();
//								var productStatus = '';
//								switch(status){
//									case '2': productStatus = '2';break;
//									case '3': productStatus = '3';break;
//									case '4': productStatus = '4';break;
//									default: productStatus = '';
//								}
								var postData = {
									productStatus: 3
								};
								$('#buyStyleHide').addClass('hide');
								ProductCheck('#itemsTable1', '#itemsPager1',postData);
							}else if(data.error){
								Common.jBoxNotice('商品上架失败,'+ data.error_description, 'red');
							}else{
								Common.jBoxNotice('商品上架失败，请稍后重试', 'red');
							}
				       	});
				    }
	    		});
		    });
		}
	});
}
function goBack(){
	var buyStyle = $('#buyStyle');
	var systemPrice = $('#systemPrice');
	var systemPoint = $('#systemPoint');
	$('#menuPageHeader h1').html(globalData.menuTitile);
    $('#productInfo').css('display','none');
    $('#submit').css('display','none');
    $('#buyStyleHide').addClass('hide');
	$('.row').css('display','block');
	buyStyle.prop('checked',false);
	systemPrice.prop('readonly',true);
	systemPoint.prop('readonly',true);
	globalData.buyStyle = 0;
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'商城商品审核'});
}
//文本输入限制两位小数
function limitNum(e){
	var id = $(e).attr('id');
	var newVal = $('#'+id).val();
	if(globalData.regFloatNumber.test(newVal)||!newVal){
		 oldVal[id] = newVal;
	}else{
		$('#'+id).val(oldVal[id]||'');
	}
}