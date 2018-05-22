/**
 * 
 * TransferRecord.js
 * 转账记录
 * 作者：xulin
 * 
 * */
"use strict";
var globalData = {};
$(function() {
	//菜单面包屑导航等配置显示，新的传参方式，只需要传入最大的分类
	Common.menuNavContent('用户管理后台');
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
		$(window).trigger('resize.jqGrid');
	});

	pageDataInit(); //页面数据初始化
	domEventFn(); //dom初始化事件绑定
	reloadDataFn(); //所有需要从服务器加载的数据请求
});

//页面启动时，数据初始化
function pageDataInit() {
	//日期选择器绑定
	$('.form_datetime').each(function() {
		var _this = this;
		laydate.render({
			elem: _this,
			type: 'datetime',
			done: function(val) {
				$(_this).attr('title', val);
			}
		});
	})
}

//dom事件绑定
function domEventFn() {}

//所有需要从服务器加载的数据请求
function reloadDataFn() {
	var ajaxArr = [
		//初始数据请求
		{url: '/ushop-web-admin/account/transfer/getConstants'},
		{url: '/ushop-web-admin/account/fundType/list'}
	];
	Common.ajaxAll(ajaxArr, function() {
		globalData.fundDirection = arguments[0].accountFundDirectionList; // 资金变动方向
		globalData.transferStatus = arguments[0].accountTransferStatusList; // 转账状态
		globalData.tradeType = arguments[0].accountTradeTypeList; // 交易类型
		
		globalData.fundType = arguments[1].recordList; // 货币类型
		
		selectInitFn(globalData.fundDirection, 'desc', 'value', '.fundDirection'); // 资金变动方向
		selectInitFn(globalData.transferStatus, 'desc', 'value', '.transferStatus'); // 转账状态
		selectInitFn(globalData.tradeType, 'desc', 'value', '.tradeType'); // 交易类型
		selectInitFn(globalData.fundType, 'desc', 'value', '.fundType'); // 货币类型
		
		TaskRecordList('#itemsTable1', '#itemsPager1');
	});
}

//查询函数
function onSearch() {
	var $box = $('#itemTab1'),
		_param = (function() {
			var $me, k, v, p = {};
			$box.find('.add_form_ipt').each(function() {
				$me = $(this);
				k = $me.attr('name');
				v = $me.val();
				p[k] = v;
			});
			return p;
		})();
	if(_param.startDate && _param.endDate) {
		if(!(parseInt(_param.endDate.replace(/\D/g, '')) > parseInt(_param.startDate.replace(/\D/g, '')))) {
			Common.jBoxNotice('结束时间要大于起始时间', 'red');
			return false;
		}
	} else if(_param.startDate) {
		Common.jBoxNotice('请选择结束时间', 'red');
		return false;
	} else if(_param.endDate) {
		Common.jBoxNotice('请选择开始时间', 'red');
		return false;
	}
	TaskRecordList('#itemsTable1', '#itemsPager1', _param);
}

//任务记录列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    额外参数
function TaskRecordList(tableId, pagerId, postData) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/account/transfer/listBy',
		colModel = [{
			label: '交易号',
			name: 'trxNo',
			index: 'trxNo',
			fixed: true,
			width: 150,
			align: 'center'
		}, {
			label: '金额',
			name: 'amount',
			index: 'amount',
			align: 'center'
		}, {
			label: '付款方ID',
			name: 'sourceUserNo',
			index: 'sourceUserNo',
			fixed: true,
			width: 150,
			align: 'center'
		}, {
			label: '收款方ID',
			name: 'targetUserNo',
			index: 'targetUserNo',
			fixed: true,
			width: 150,
			align: 'center'
		}, {
			label: '创建时间',
			name: 'createTime',
			index: 'createTime',
			fixed: true,
			width: 150,
			align: 'center',
			formatter: function(cellVal, cellData, rowData, rwdat) {
				return Common.msToTime(cellVal);
			}
		}, {
			label: '汇率',
			name: 'amount',
			index: 'amount',
			align: 'center'
		}, {
			label: '状态',
			name: 'status',
			index: 'status',
			fixed: true,
			width: 80,
			align: 'center',
			formatter: function(cellVal, cellData, rowData, rwdat) {
				var str = cellVal;
				$.each(globalData.transferStatus, function(i, o) {
					if(cellVal == o.value) {
						str = o.desc;
					}
				})
				return str;
			}
		}, {
			label: '操作',
			name: 'operation',
			index: '',
			fixed: true,
			width: 80,
			align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				if ( !globalData.transferRecordList ) {
					globalData.transferRecordList = {};
				}
				globalData.transferRecordList[('key' + rowData.id)] = rowData;
				var str = 	'<button class="btn btn-xs btn-primary" onclick="detailRowFn(' + rowData.id + ')">详情</button>';
				return str;
				
			}
		}];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '转账记录');
}

// 详情查看
function detailRowFn ( id ) {
	var rdata = globalData.transferRecordList[('key' + id)],
		$box = $('#transfer_form'),
		$form = $box.find('form'),
		$me, k, v;
	$box.find('.add_form_ipt').each(function () {
		$me = $(this);
		k = $me.attr('name');
		v = rdata[k];
		$me.val(v);
	})
	$box.find('[name="createTime"]').val(Common.msToTime(rdata.createTime))
	pageSH('.page_box', '#transfer_form');
}

//容器显示隐藏
function pageSH(cn, id) {
	$(cn).addClass('hide');
	$(id).removeClass('hide');
}


//select标签初始化
//list列表数据，k显示值字段，v数据值字段，d默认值
function selectInitFn(list, k, v, ele, d, n) {
	if(!list) {
		return ''
	};
	var str = (typeof n === 'string') ? n : '<option value="">请选择</option>';
	if(d) {
		$.each(list, function(index, obj) {
			if(d === obj[v]) {
				str += '<option selected value="' + obj[v] + '">' + obj[k] + '</option>';
			} else {
				str += '<option value="' + obj[v] + '">' + obj[k] + '</option>';
			}
		});
	} else {
		$.each(list, function(index, obj) {
			str += '<option value="' + obj[v] + '">' + obj[k] + '</option>';
		});
	}
	if(ele) {
		var $ele = (ele instanceof jQuery) ? ele : $(ele);
		$ele.html(str);
	} else {
		return str;
	}
}

//导出excel表格
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '拍彩记录'
	});
}