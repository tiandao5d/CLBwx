/**
 * 
 * NotOrder.js
 * 对账管理-未出账单
 * 作者：xulin
 * 
 * */

var globalData = {};
jQuery(function($) {
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('对账管理', '未出账单','统计管理后台');
	
	
	//只能选择到月份
//	$(".form_datetime.mm").datetimepicker({
//		format:'yyyy-mm',
//		autoclose:true,
//		language: 'zh-CN',
//		startView: 3,
//		maxView: 3,
//		minView:3
//	});
	jeDate({
		dateCell:"#xlgridBox .start",
		format:"YYYY-MM",
		isTime:false //isClear:false,
	});
	//绑定只读的日期选择输入框一个双击清空的事件
	$(".form_datetime[readonly]").dblclick(function(){
		$(this).val('').blur();
	});
	globalDataFn(function(data){
		var str = '';
		var formatData = data.recordList;
		if(formatData && formatData.length > 0){
			$.each(formatData, function(index, obj) {
				if(index == 0){
					str += '<option value="">' + '请选择'+ '</option>';
				}
				str += '<option value="' + obj.merchantNo + '">' + (obj.merchantName?obj.merchantName:'') + '</option>';
			});
			$('.merchantNameSele').html(str);
		}
		
		
		//查询按键
		$('.itemSearch').on('click', function(){
			var me = $(this),
				box = me.parents('.tabPane'),
				startDate = box.find('.form_datetime.start').val(),
				merchantId = box.find('.merchantNameSele').val();
			startDate = startDate ? startDate:end;
			haveOrderFn('#itemDzwclTable', '#itemDzwcPager', startDate , merchantId, true);
		});
		$('.chuzhang').on('click', function(){
			var me = $(this),
				box = me.parents('.tabPane'),
				startDate = box.find('.form_datetime.start').val(),
				merchantId = box.find('.merchantNameSele').val();
			startDate = startDate ? startDate:end;
			chuzhangFn(startDate,merchantId);
		});
		var currentDate = new Date();
		var endm =currentDate.getMonth() +1;
		var endy = currentDate.getFullYear();
		var endd = currentDate.getDate();
		var start = '';
		var end= '';
		if(endm<10){
			end += endy + '-0' + endm;
		}else{
			end += endy + '-' + endm;		
		}
//		if(endd<10){
//			end += '-0' + endd;
//		}else{
//			end +=  '-' + endd;		
//		}
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		haveOrderFn('#itemDzwclTable', '#itemDzwcPager', end, formatData[0].merchantNo, false)
		
	})

	
	
});

//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/merchant/list'
	Common.dataAjax(_url,function(data,status){
		if(status == 'success'){
			globalData.listMerchantInfo = data.recordList;
		}else{
			Common.jBoxNotice('数据错误','red');
		}
		callback.call(this, data);
	})	
}

//出账
function chuzhangFn(startDate,merchantId){
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/checkAccount/settCreate',
		param = {
			date : startDate,
			merchantId : merchantId
		};
	Common.jBoxConfirm('确认信息', '您确定要出账当前订单吗？', function(index){
		if(index == 1){
			Common.dataAjaxPost(_url, param, function(data){
					if(data.data == 'SUCCESS'){
						haveOrderFn('#itemDzwclTable', '#itemDzwcPager', startDate, merchantId, true)
						Common.jBoxNotice('出账成功', 'green');
					}else{
						Common.jBoxNotice('出账失败', 'red');
					}
			});
		}
	});
}
//http://10.35.0.66:8080/ushop-web-admin/admin/checkAccount/noHaveAccount/2016-09-01/888100000000004
function haveOrderFn(tableId, pagerId, startDate, merchantId, reload){

	var dataCon = [], str = '', url, formatData, colModel, classData;
	url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/settlement/listByUnSettlement?date=' + startDate + '&merchantId=' + merchantId;
		colModel = [
			{label: '商家ID',name:'merchantId',index:'merchantId',width:120,align: 'center'},
			{label: '商家名称',name:'merchantName',index:'merchantName',width:120,align: 'center'},
			{label: '商品名称',name:'productName',index:'productName',width:120,align: 'center'},
			{label: '商品数量',name:'count',index:'count',width:120,align: 'center',
				formatter: function(val, opts, rwdat, act){
					return val + '个';
				}
			},
			{label: '商品成本价格',name:'realPrice',index:'realPrice',width:120,align: 'center', 
				formatter: function(val, opts, rwdat, act){
					return parseFloat(val).toFixed(2) + '元';
				}
			},
			{label: '商品销售价格',name:'price',index:'price',width:120, align: 'center',
				formatter: function(val, opts, rwdat, act){
					return parseFloat(val).toFixed(2) + '元';
				}
			},
			{label: '商品利润',name:'profit',index:'profit',width:120, align: 'center',
				formatter: function(val, opts, rwdat, act){
					return parseFloat(val).toFixed(2) + '元';
				}
			}
		];	 
		$.jgrid.gridUnload(tableId);
		Common.gridBackPaging(tableId, pagerId, url,colModel, '','未出账单统计');
}

//导出excel表格
function toExcel(){
	$('#gview_itemDzwclTable').tableExport({type:'excel',escape:'false',fileName:'未出账单'});
}
