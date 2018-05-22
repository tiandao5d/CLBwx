/**
 * 
 * TaskRecord.js
 * 任务记录
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
	$('.form_datetime').each(function () {
		var _this = this;
		laydate.render({
		  elem: _this,
		  type: 'datetime',
		  done: function ( val ) {
		  	$(_this).attr('title', val);
		  }
		});
	})
}

//dom事件绑定
function domEventFn() {
}

//所有需要从服务器加载的数据请求
function reloadDataFn() {
	var ajaxArr = [
		//初始数据请求
		{url: '/ushop-web-admin/task/record/getConstants'}
	];
	Common.ajaxAll(ajaxArr, function () {
		globalData.awardTypeList = arguments[0].awardTypeList;
		globalData.taskStatusList = arguments[0].taskStatusList;
		selectInitFn(globalData.awardTypeList, 'desc', 'value', '.awardType');
		selectInitFn(globalData.taskStatusList, 'desc', 'value', '.taskStatus');
		TaskRecordList('#itemsTable1', '#itemsPager1');
	});
}

//查询函数
function onSearch() {
	var $box = $('#itemTab1'),
		_param = {
			userNo: $box.find('[name="userNo"]').val(),
			status: $box.find('[name="status"]').val(),
			startDate: $box.find('[name="startDate"]').val(),
			endDate: $box.find('[name="endDate"]').val()
		};
	if ( _param.startDate && _param.endDate ) {
		if( !(parseInt(_param.endDate.replace(/\D/g, '')) > parseInt(_param.startDate.replace(/\D/g, ''))) ) {
			Common.jBoxNotice('结束时间要大于起始时间', 'red');
			return false;
		}
	} else if ( _param.startDate ) {
		Common.jBoxNotice('请选择结束时间', 'red');
		return false;
	} else if ( _param.endDate ) {
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
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/task/record/listBy',
		colModel = [{
				label: '用户编码',
				name: 'userNo',
				index: 'userNo',
				fixed: true,
				width: 140,
				align: 'center'
			},
			{
				label: '任务ID',
				name: 'taskId',
				index: 'taskId',
				fixed: true,
				width: 60,
				align: 'center'
			},
			{
				label: '任务记录值',
				name: 'taskValue',
				index: 'taskValue',
				align: 'center'
			},
			{
				label: '完成时间',
				name: 'finishTime',
				index: 'finishTime',
				fixed: true,
				width: 140,
				align: 'center',
				formatter: function(cellVal, cellData, rowData, rwdat) {
					var str = Common.msToTime(cellVal);
					return str;
				}
			},
			{
				label: '状态',
				name: 'status',
				index: 'status',
				fixed: true,
				width: 80,
				align: 'center',
				formatter: function(cellVal, cellData, rowData, rwdat) {
					var str = '';
					$.each(globalData.taskStatusList, function(i, o) {
						if(cellVal == o.value) {
							str = o.desc;
						}
					})
					return str;
				}
			},
			{
				label: '流水号',
				name: 'requestNo',
				index: 'requestNo',
				fixed: true,
				width: 220,
				align: 'center'
			},
			{
				label: '操作',
				name: 'operation',
				index: '',
				align: 'center',
				width: 120,
				fixed: true,
				sortable: false,
				resize: false,
				formatter: function(cellVal, cellData, rowData, rwdat) {
					if ( !globalData.taskRecordList ) {
						globalData.taskRecordList = {};
					}
					globalData.taskRecordList[('key' + rowData.id)] = rowData;
					var str =   '<button  class="btn btn-xs btn-primary" onclick="detailsTaskRe(' + rowData.id + ')">详情</button> '+
								'<button  class="btn btn-xs btn-primary" onclick="editTaskRe(' + rowData.id + ')">编辑</button>';
					return str;
				}
			}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '任务记录');
}

// 编辑任务
function editTaskRe ( id ) {
	var rdata = globalData.taskRecordList[('key' + id)],
		$box = $('#edit_task'),
		$form = $box.find('form'),
		$me, k, v;
	$form.data('eid', id)[0].reset();
	$box.find('.add_form_ipt').each(function () {
		$me = $(this);
		k = $me.attr('name');
		v = rdata[k];
		$me.val(v);
	});
	$box.modal('show');
}

// 查看详情
function detailsTaskRe ( id ) {
	var rdata = globalData.taskRecordList[('key' + id)],
		$box = $('#task_form'),
		$form = $box.find('form'),
		$me, k, v;
	$form.data('eid', id)[0].reset();
	$box.find('.add_form_ipt').each(function () {
		$me = $(this);
		k = $me.attr('name');
		v = rdata[k];
		$me.val(v);
	});
	try {
		var rvlobj = JSON.parse(rdata.rewardValue);
		$box.find('[name="rewardType"]').val(rvlobj.awardType);
		$box.find('[name="rewardValue"]').val(rvlobj.awardValue.split('|')[0]);
		$box.find('.rvlobj').val(rdata.rewardValue);
	} catch ( err ) {}
	$box.find('[name="finishTime"]').val(Common.msToTime(rdata.finishTime))
	pageSH('.page_box', '#task_form');
}

//容器显示隐藏
function pageSH(cn, id) {
	$(cn).addClass('hide');
	$(id).removeClass('hide');
}

function saveSubmit () {
	var $box = $('#edit_task'),
		$form = $box.find('form'),
		eid = $form.data('eid'), // 用于判断是编辑或者是添加
		_url = '',
		errobj = null, // 用于提示
		istrue = true, // 用于验证
		_param = (function () {
			var $me, k, v, p = {}, dnull = '';
			$box.find('.add_form_ipt').each(function () {
				$me = $(this);
				k = $me.attr('name');
				v = $me.val();
				dnull = $me.attr('data-null');
				if ( !v ) {
					if ( dnull ) {
						Common.jBoxNotice(dnull, 'red');
						istrue = false;
						return false;
					}
				}
				p[k] = v;
			});
			return p;
		})();
	if ( !istrue ) {
		return false;
	}
	if ( eid ) {
		_url = '/ushop-web-admin/task/record/update';
		errobj = {a: '编辑成功', b: '编辑失败'};
		_param.id = eid;
	}
	Common.ajax(_url, 'post', _param, function ( data ) {
		if ( data.result === 'SUCCESS' ) {
			Common.jBoxNotice(errobj.a, 'green');
			$box.modal('hide');
		} else {
			Common.jBoxNotice((errobj.b + ' ' + ( data.error_description || '' )), 'red');
		}
	})
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