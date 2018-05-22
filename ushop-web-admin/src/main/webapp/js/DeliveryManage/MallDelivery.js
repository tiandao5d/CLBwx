/**
 * 
 * OrderList.js
 * 订单管理-订单列表
 * 作者：xulin
 * 
 * */

var globalData = {};
globalData.regExpPhone = /^1(3|4|5|7|8)\d{9}$/;
globalData.status = 101;
jQuery(function($) {
	//菜单面包屑导航等配置显示
	Common.menuNavContent('发货管理', '商城发货','夺宝管理后台');

	
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
		dateCell:"#itemTab1 .start",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#itemTab1 .end",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	//绑定只读的日期选择输入框一个双击清空的事件
	$(".form_datetime[readonly]").dblclick(function(){
		$(this).val('').blur();
	});
	globalDataFn(function(data){
	
		//查询按键
		$('.itemSearch').on('click', function(){
			var me = $(this),
				box = me.parents('.tabPane'),
				id = box.attr('id'),
				startDate = $.trim(box.find('.form_datetime.start').val()),
				endDate = $.trim(box.find('.form_datetime.end').val()),
				orderNo = $.trim(box.find('.orderNo').val()),
				userName = $.trim(box.find('.userName').val()),
				userTel = $.trim(box.find('.userTel').val()),
				table = box.find('.itemGridTable'),
				pager = box.find('.itemGridPager');
			var postData = {};
			if(userTel && !globalData.regExpPhone.test(userTel)){Common.jBoxNotice('请输入有效手机号','red');return false}
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
				postData = {
					startDate: startDate,
					endDate: endDate,
					userName: userName,
					mobileNo :userTel,
					orderNo: orderNo,
					status : globalData.status
				};
				orderList('#itemsTable1', '#itemsPager1', postData);
		});
		
		
		
		
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			$(window).trigger('resize.jqGrid');
		});
		var postData = {};
		postData.status = globalData.status;
		$('.xltab-box a[data-toggle="tab"]').on('click',function(e){
			var href = e.target.href;
			var tabChoose = href.slice(-1);
			if(tabChoose == 1){
				globalData.status = 101;
			}else if(tabChoose == 2){
				globalData.status = 102;
			}else if(tabChoose == 3){
				globalData.status = 104;
			}
			postData.status = globalData.status;
			if(tabChoose == 3){
				returnList('#itemsTable1', '#itemsPager1',postData);
			}else{				
				orderList('#itemsTable1', '#itemsPager1',postData);
			}
		});
		orderList('#itemsTable1', '#itemsPager1',postData);
	});
});

//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/order/getConstants';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.payStatusList = data.payStatusList;
			globalData.payTypeList = data.payTypeList;
			globalData.spellBuyStatusList = data.spellBuyStatusList;
			globalData.latestLotterysStatusList = data.latestLotterysStatusList;
			globalData.mallOrderStatusList = data.mallOrderStatusList;
			
			globalData.expressCompanyMap = data.expressCompanyMap;
			var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/list';
			Common.dataAjax(_url, function(data, status){
				if(status == 'success'){
					  globalData.listMerchantInfo = data.recordList;
				     callback.call(this, data);
				}else{
					Common.jBoxNotice('数据请求错误', 'red');
					callback.call(this, data);
				}
			 
			});
			
		}else{
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
}

//发货列表

function orderList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/mall/order/list'
		colModel = [
			{label: '下单时间',name:'payDate',index:'payDate',width:180, align: 'center'},
			{label: '订单号',name:'orderNo',index:'orderNo',width:220, align: 'center'},

			{label: '订单状态',name:'status',index:'status',width:120, fixed:true, align: 'center',
				formatter: function(cellVal){
					$.each(globalData.mallOrderStatusList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
			},	
{label: '商品名称',name:'withold',index:'withold',width:380, align: 'center',
				formatter: function(val){
					var str = '';
					var a=JSON.parse(val),
					    productNameAll=[];
					
					$.each(a,function(i,o){
						productNameAll[productNameAll.length]=o.productName
						
						
					})
					str += productNameAll.join(",");
					return str;
				}
			},
			{label: '商品种类',name:'withold',index:'withold',width:80, align: 'center',
				formatter: function(val){
					var str = '';
					var a=JSON.parse(val),
					    productNameAll=[];
					
					$.each(a,function(i,o){
						productNameAll[productNameAll.length]=o.productName
						
						
					})
					str += productNameAll.length;
					return str;
				}
			},
			{label: '商品数量',name:'withold',index:'withold',width:80, align: 'center',
				formatter: function(val){
					var str = '';
					var a=JSON.parse(val),
					    numberAll=[];
					$.each(a,function(i,o){
						numberAll[numberAll.length]=o.number
						
					})
					str += numberAll.join(",");
					return str;
				}
			},
			{label: '单价',name:'withold',index:'withold',width:100, align: 'center',
				formatter: function(val){
					var str = '',
					    priceAll=[];
					var a=JSON.parse(val);
					var index = val.indexOf('price');
					if(index==-1){return str}
					var priceArr = JSON.parse(val);
//					console.log(priceArr);
					$.each(priceArr,function(i,o){
						var a = o.price.slice('"');
						a= JSON.parse(a);
						if(a.length==2){
								priceAll[priceAll.length] = a[0].value+'元+' + a[1].value+'积分'
									
							}else{
								priceAll[priceAll.length] =a[0].value+'元'
									
							}
					})
					
					str += priceAll.join(",");
					return str;
				}
			},
			{label: '订单总额',name:'withold',index:'withold',width:100, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					var a=JSON.parse(val);
					var index = val.indexOf('price'), productPrice, productPoint;
					if(index==-1){return str}
					var priceArr = JSON.parse(val),sumPoint=0,sumPrice=0;
					var fee = (colpos.fee?colpos.fee.toFixed(2):0)-0;
					$.each(priceArr,function(i,o){
						var a = o.price.slice('"');
						a= JSON.parse(a);
						$.each(a,function(j,k){
							switch(k.type){
								case 999 : productPrice = k.value;break;
								case 1001 : productPoint = k.value;break;
							}
						})						
						productPoint && (sumPoint += productPoint*o.number);
						productPrice && (sumPrice += productPrice*o.number);
					})
					sumPrice += fee;
					str = sumPrice + '元+' + sumPoint + '积分<br/>(含快递:￥'+fee+')';
					return str;
				}
			},
			{label: '收货地址',name:'address',index:'address',width:200, align: 'center',
				formatter: function(val){
					var str = '';
					var a=JSON.parse(val);
					/*$.each(a,function(i,o){
						str += '<p>'+o.number||'' + '</p>'
					})*/
					str = a.province + ' ' + a.city + ' ' + a.district + ' ' + a.address;
					return str;
				}
			},
			{label: '收件人',name:'address',index:'address',width:80, align: 'center',
				formatter: function(val){
					var str = '';
					var a=JSON.parse(val);
					str = a.consignee;
					return str;
				}
			},
			{label: '用户ID',name:'userNo',index:'userNo',width:160, align: 'center'},
			{label: '用户昵称',name:'userName',index:'userName', align: 'center'},
//			{label: '用户手机号',name:'userTel',index:'userTel',width:140, fixed:true, align: 'center'},
			{label: '操作', name:'',index:'', width:80, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					return '<button class="btn btn-xs btn-primary" onclick="detailsFn(\'' + colpos.orderNo + '\',1)">详情</button>';
				}
			}
		];
	
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '订单列表');
}

function returnList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/mall/order/list'
		colModel = [
			{label: '退货退款时间',name:'createTime',index:'createTime',width:180, align: 'center',
				formatter: function(cellVal){
					var str = Common.msToTime(cellVal);
					return str;
				}
			},
			{label: '退货退款原因',name:'withold',index:'withold',width:180, align: 'center',
				formatter: function(cellVal){
					var str = JSON.parse(cellVal);
					str = str[0].comment;
					return str;
				}
			},
			{label: '订单号',name:'orderNo',index:'orderNo',width:220, align: 'center'},
			{label: '订单状态',name:'status',index:'status',width:120, fixed:true, align: 'center',
				formatter: function(cellVal){
					$.each(globalData.mallOrderStatusList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;
							return false;
						}
					});
					if(cellVal==2){
						cellval = '退款中';
					}
					return cellVal;
				}
			},	
			{label: '用户ID',name:'userNo',index:'userNo',width:160, align: 'center'},
			{label: '用户昵称',name:'userName',index:'userName', align: 'center'},
//			{label: '用户手机号',name:'userTel',index:'userTel',width:140, fixed:true, align: 'center'},
			{label: '操作', name:'',index:'', width:80, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					return '<button class="btn btn-xs btn-primary" onclick="detailsFn(\'' + colpos.orderNo + '\',2)">详情</button>';
				}
			}
		];
	
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '订单列表');
}


//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/new/order/orderInfo?orderNo=201609211722061311025
//http://10.35.0.66:8080/ushop-web-admin/new/order/winnerOrderInfo?spellbuyId=77
function detailsFn(orderNo,type){
	orderNo = orderNo ? orderNo : '';
	var modal = $('#detailsModal'),
		detailsItemDd = modal.find('.detailsItemDd'),
		modalBody = modal.find('.modal-body'),
		tbody = modal.find('tbody'),
		str = '';
	//订单列表详情
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/mall/order/getByOrderNo/' + orderNo;
	modal.modal('show');
	Common.dataAjax(url, function(data){
		var withold = JSON.parse(data.productOrder.withold);
//		$('#detailsTable').jqGrid({
//			data: withold,
//			datatype: "local",
//			height: 'auto',
//			colModel: colModel,
//			rowNum:10,//每页显示的行数
//			altRows: true//斑马纹
//		});
		var witholdLength = withold.length;
		var trStr = '';
		var status = data.productOrder.status;
		var statusName = '';
		var sumPrice = 0 , sumPoint = 0;
		$.each(globalData.mallOrderStatusList,function(i,o){
			if(status == o.value){
				statusName = o.desc;
			}
		})
		$.each(withold,function(i,o){
			var a = o.price.slice('"'),str='',productPoint=productPrice=0;
			a= JSON.parse(a);
			$.each(a,function(j,k){
				switch(k.type){
					case 999 : str += k.value+'元';productPrice=k.value;break;
					case 1001 : str += '+' +k.value+'积分';productPoint=k.value;break;
				}
			})
			if(i>0){
				trStr += '<tr><td>'+o.merchantName+'</td><td>'+(o.productName||'')+'</td><td>'+o.number+'</td><td>￥'+str+'</td></tr>';
			}else{				
				trStr += '<tr><td>'+o.merchantName+'</td><td>'+(o.productName||'')+'</td><td>'+o.number+'</td><td>￥'+str+'</td><td class="witholdStatus"></td><td class="sumTotal"></td></tr>';
			}
			productPoint && (sumPoint += productPoint*o.number);
			productPrice && (sumPrice += productPrice*o.number);
		});
		tbody.html(trStr);
		tbody.find('.witholdStatus').attr('rowspan',witholdLength).html(statusName);
		tbody.find('.sumTotal').attr('rowspan',witholdLength).html('￥'+sumPrice +'+'+ sumPoint+'积分<br/>(含快递:￥'+(data.fee?data.fee.toFixed(2):0)+')');
		$.each(data.productOrder,function(key,val){
			if(modalBody.find('[name='+key+']').length){
				modalBody.find('[name='+key+']').val(val);
			}
		});
		$.each(data.memberInfo,function(key,val){
			if(modalBody.find('[name='+key+']').length){
				modalBody.find('[name='+key+']').val(val);
			}
		});
		if(data.orderPayment){
			var payType = data.orderPayment.interfaceType;
			$.each(globalData.payTypeList,function(i,o){
				if(o.value==payType) payType=o.desc;
			})
			modalBody.find('[name=payType]').val(payType)
		}
		if(data.productOrder&&data.productOrder.address){
			var addressInfo = JSON.parse(data.productOrder.address);
			$.each(addressInfo,function(key,val){
				if(modalBody.find('[name='+key+']').length){
					modalBody.find('[name='+key+']').val(val);
				}
			});
			var address = addressInfo.province+addressInfo.city+addressInfo.district+addressInfo.address;
			modal.find('[name=address]').val(address);
		}
		if(data.productOrder&&data.productOrder.expressCompany){
			var expressCompany = data.productOrder.expressCompany;
			$.each(globalData.expressCompanyMap,function(i,o){
				if(o.value == data.productOrder.expressCompany){
					expressCompany = o.desc;
				}
			});
			modalBody.find('[name=expressCompany]').val(expressCompany );
		}
		var thisReturn = $('.return');
		if(type==2){
			thisReturn.removeClass('hide');
			thisReturn.find('[name=returnTime]').val(Common.msToTime(data.orderPayment.createTime));
			thisReturn.find('[name=returnReason]').val(withold[0].comment)	
			console.log(withold)
		}else{
			thisReturn.addClass('hide');
		}
		modal.trigger('shown.bs.modal');
	});
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'订单列表'});
}