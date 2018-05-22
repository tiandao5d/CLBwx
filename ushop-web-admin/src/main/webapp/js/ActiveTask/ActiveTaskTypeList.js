/**
 * 
 * ActiveTaskTypeList.js
 * 活动任务
 * 作者：xulin
 * 
 * */

"use strict";
var globalData = {};
$(function() {
	//菜单面包屑导航等配置显示，新的传参方式，只需要传入最大的分类
	Common.menuNavContent('运营管理后台');
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
	// 当前的活动类型，所有的数据和表单从此出来
	globalData.cunType = Common.deCodeUrlFn().type || '-1';
}

//dom事件绑定
function domEventFn() {
	//富文本编辑框初始化
	$('#ace_wysiwyg_box').ace_wysiwyg({
		toolbar: ['fontSize', null, 'bold', 'italic', 'strikethrough', 'underline', null,
			'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', null, 'unlink',
			null, 'insertImage', null, 'foreColor', null, 'undo', 'redo'
		]
	}).prev().addClass('wysiwyg-style2');
	//文本编辑模态框相关事件监听
	$('#ace_wysiwyg_modal').on('show.bs.modal', function(e) {
		var $me = e.relatedTarget ? $(e.relatedTarget) : $('input:focus'),
			val = $me.val() || '';
		globalData.showWysiwygEle = $me;
		//注释中为html内容编译后返回，此处没有编译似乎不会有问题
		$('#ace_wysiwyg_box').html(val);
	}).find('.save_btn').on('click', function() {
		//如果上面为编译后的，那么这里就要先解码
		var str = $('#ace_wysiwyg_box').html();
		globalData.showWysiwygEle.val(str);
	});

	//随机奖励内容表单，modal
	$('#reward_value').on('hidden.bs.modal', function(e) {
		var $modal = $(this);
		$modal.find('form')[0].reset();
		$modal.find('[name="awardType"]').trigger('change');
	});

}

//所有需要从服务器加载的数据请求
function reloadDataFn() {
	var ajaxArr = [
		//初始数据请求
		{url: '../../js/provinces.json'},
		{url: '../../js/ActiveTask/active_form_type.json'},
		{url: '/ushop-web-admin/task/getConstants'},
		{url: '/ushop-web-admin/account/fundType/list'},
		{url: '/ushop-web-admin/account/coupons/type/list'},
		{url: './ActT1.html', dataType: 'text'},
		{url: './ActT3.html', dataType: 'text'},
		{url: './ActT5.html', dataType: 'text'}
	];
	Common.ajaxAll(ajaxArr, function () {
		var data = arguments[2];
		globalData.fundUsageList = data.fundUsageList; //积分用途列表
		globalData.taskConditionList = data.taskConditionList; //活动类型
		globalData.taskTypeList = data.taskTypeList; //任务类型
		globalData.taskTargetTypeList = data.taskTargetTypeList; //目标类型
		globalData.participateTypeList = data.participateTypeList; //参与类型
		globalData.winLimitTypeList = data.winLimitTypeList; //中奖限制类型
		globalData.stockLimitTypeList = data.stockLimitTypeList; //库存限制类型
		globalData.awardTypeList = data.awardTypeList; //奖励货币类型
		globalData.taskAuditStatusList = data.taskAuditStatusList; //审核状态
		
		globalData.fundTypeList = arguments[3].recordList; //积分类型
		globalData.couponsList = arguments[4].recordList; //游戏券
		globalData.templateList = [
			{val: '1', txt: '平台充值模板'},
			{val: '2', txt: '通用模板'},
			{val: '3', txt: '采购活动模板'}
		];
		globalData.provinceList = arguments[0];
		globalData.activeType = arguments[1]; // 活动类型数据，用来渲染表单
		globalData.fromDataStr = {
			t1: arguments[5],
			t3: arguments[6],
			t5: arguments[7]
		}; // 表单字符串内容
		if(!$.isEmptyObject(data)) {
			//列表数据请求
			activeTaskList('#itemsTable1', '#itemsPager1');
			//下拉框赋值
			selectInitFn(globalData.taskConditionList, 'desc', 'value', '.taskConditionList'); //任务条件的select
			selectInitFn(globalData.awardTypeList, 'desc', 'value', '.awardTypeList'); //任务条件的select
			$('.awardTypeList').trigger('change');
			selectInitFn(globalData.winLimitTypeList, 'desc', 'value', '.winLimitTypeList'); //任务条件的select
			selectInitFn(globalData.stockLimitTypeList, 'desc', 'value', '.stockLimitTypeList'); //任务条件的select
		} else {
			Common.jBoxNotice('数据错误', 'red');
		}
	});
}
// 获取当前的活动表单数据
function getActiveType ( type ) {
	var a = {};
	$.each(globalData.activeType, function ( index, obj ) {
		if ( obj.type === type ) {
			a = obj;
		}
	});
	return a;
}

// 查询
function onSearch () {
	var $box = $('#itemTab1'),
		p = {
			status: $box.find('[name="status"]'),
			conditionType: $box.find('[name="conditionType"]'),
			name: $box.find('[name="name"]')
		};
	activeTaskList('#itemsTable1', '#itemsPager1', p);
}

//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
function activeTaskList(tableId, pagerId, postData) {
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/task/listBy?' + getActiveType(globalData.cunType).listP,
		colModel = [{
				label: '活动ID',
				name: 'id',
				index: 'id',
				fixed: true,
				width: 50,
				align: 'center'
			},
			{
				label: '活动名称',
				name: 'name',
				index: 'name',
				align: 'center'
			},
			{
				label: '任务条件',
				name: 'conditionType',
				index: 'conditionType',
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.taskConditionList, function(index, obj) {
						if((cellVal + '') === (obj.value + '')) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal || '';
				}
			},
			{
				label: '开始时间',
				name: 'startDate',
				index: 'startDate',
				fixed: true,
				width: 140,
				align: 'center'
			},
			{
				label: '结束时间',
				name: 'endDate',
				index: 'endDate',
				fixed: true,
				width: 140,
				align: 'center'
			},
			{
				label: '审核状态',
				name: 'auditStatus',
				index: 'auditStatus',
				fixed: true,
				width: 80,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.taskAuditStatusList, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal || '';
				}
			},
			{
				label: '活动状态',
				name: 'status',
				index: 'status',
				fixed: true,
				width: 60,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					var str = '';
					switch(cellVal) {
						case '1':
							str = '启动中';
							break;
						case '2':
							str = '未开启';
							break;
						case '3':
							str = '已结束';
							break;
					}
					return str;
				}
			},
			{
				label: '操作',
				name: 'operation',
				index: '',
				fixed: true,
				width: ((globalData.cunType === '-1') ? 240 : 120),
				align: 'center',
				fixed: 'true',
				formatter: function(cellVal, cellData, rowData) {
					if ( !globalData.activeTaskList ) {
						globalData.activeTaskList = {};
					}
					globalData.activeTaskList[('key' + rowData.id)] = rowData;
					if ( globalData.cunType === '-1' ) {
						var str = 	'<button class="btn btn-xs btn-primary" onclick="editorRowFn(' + rowData.id + ', true)">查看</button> ';
						if ( rowData.auditStatus === 100 ) {
							str +=
								'<button class="btn btn-xs btn-primary" onclick="auditTaskFn(' + rowData.id + ', 101)">审核通过</button> ' +
								'<button class="btn btn-xs btn-primary" onclick="auditTaskFn(' + rowData.id + ', 102)">审核不通过</button>'
						}
					} else {
						var str = 	'<button class="btn btn-xs btn-primary" onclick="editorRowFn(' + rowData.id + ')">编辑</button> ' +
									'<button class="btn btn-xs btn-primary" onclick="deleteRowFn(' + rowData.id + ')">删除</button>';
					}
					return str;
					
				}
			}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}

//新增任务列表，一行
function addRowFn() {
	var str = '';
	if ( globalData.cunType === '-1' ) {
		Common.jBoxNotice('此处不能新增', 'red');
		return false;
	}
	if ( globalData.cunType === '5' ) {
		str = globalData.fromDataStr.t5;
	} else if ( globalData.cunType === '3' ) {
		str = globalData.fromDataStr.t3;
	} else {
		str = globalData.fromDataStr.t1;
	}
	$('#html_fragment').html(str);
	$('#task_from_box').data('eid', ''); // 判断是编辑还是添加
	pageSH('.page_box', '#add_edit'); //显示新增编辑的表单
}

//编辑任务列表，一行，表单赋值
function editorRowFn( id ) {
	var data = globalData.activeTaskList[('key' + id)],
		str = '';
	if ( (data.type + '') === '5' ) {
		str = globalData.fromDataStr.t5;
	} else if ( (data.type + '') === '3' ) {
		str = globalData.fromDataStr.t3;
	} else {
		str = globalData.fromDataStr.t1;
	}
	$('#html_fragment').html(str);
	$('#task_from_box').data('eid', id); // 判断是编辑还是添加
	fromAssignment(data);
	if ( globalData.cunType === '-1' ) {
		$('#html_fragment').find('.from_btn_box').hide();
	}
	pageSH('.page_box', '#add_edit'); //显示新增编辑的表单
}


//任务条件选择变化
function ctypeChangeFn(ag0) {
	var ctype = (ag0.nodeType === 1) ? (ag0.value + '') : (ag0 + ''),
		$form = $('#task_from_box'),
		$prob = $form.find('[name="province"]').parents('.form-group').show(), //省份
		$cid = $form.find('[name="conditionId"]'), //目标ID
		$cidb = $cid.parents('.form-group').show(); //目标ID
	if(ctype === '19') {
		$cid.attr('placeholder', '请输入彩种ID');
		$cidb.find('label').html('<span class="red">*</span>彩种ID：');
	} else if((ctype === '4') || (ctype === '6')) {
		$prob.hide();
	} else {
		$cidb.hide();
		$prob.hide();
		$cid.attr('placeholder', '请输入游戏ID');
		$cidb.find('label').html('<span class="red">*</span>目标ID：');
	}
}

//删除任务列表，一行
function deleteRowFn(id) {
	if(!id) {
		Common.jBoxNotice('任务ID不存在', 'red');
		return false;
	}
	var _url = '/ushop-web-admin/task/delete/' + id;
	Common.jBoxConfirm('确认信息', '您确定要删除此任务吗？', function(index) {
		if(index == 1) {
			Common.ajax(_url, 'post', {}, function(data) {
				if(data.status === 'success') {
					Common.jBoxNotice('删除成功', 'green');
					activeTaskList('#itemsTable1', '#itemsPager1');
				} else {
					Common.jBoxNotice(data.error_description || '删除失败', 'red');
				}
			});
		}
	});
}

//添加或编辑提交
function onAESubmit() {
	var $form = $('#task_from_box'),
		_param = getFromVal(), // 表单值
		cunTobj = getActiveType(globalData.cunType); // 当前的活动表单数据，用于获取表单字段内容，和一些固定值
	$.extend(_param, cunTobj.fp); // 固定参数，不同类型有不同的固定参数
	if(!fromValid(_param)) {
		return false;
	}
	_param['type'] = cunTobj.type; //固定值，提交的任务类型
	_param['rewardValue'] = JSON.stringify(_param['rewardValue']); //转为字符串
	var _url = '/ushop-web-admin/task/save',
		eid = $form.data('eid'),
		sstr = '添加成功',
		estr = '添加失败';
	if(eid) {
		_param.id = eid;
		_url = '/ushop-web-admin/task/edit';
		sstr = '编辑成功';
		estr = '编辑失败';
	}
	Common.ajax(_url, 'post', _param, function(data) {
		if(data.result === 'SUCCESS') {
			Common.jBoxNotice(sstr, 'green');
			activeTaskList('#itemsTable1', '#itemsPager1');
			pageSH('.page_box', '#task_list'); //返回列表界面
		} else {
			Common.jBoxNotice((estr + (data.error_description || '未知错误')), 'red');
		}
	});
}

//奖励类型更改
function awardTypeChange(me, ev) {
	var $me = (me instanceof jQuery) ? me : $(me),
		str = '',
		ev = ev || '', //方便编辑时赋值
		k = $me.find('option:selected').text().trim(),
		v = $me.val(),
		ftlarr = []; // 可选择的货币类型
	if(v === '3') { //游戏券奖励
		str =
			'<select class="form-control awardValue">' +
			selectInitFn(globalData.couponsList, 'couponsName', 'id', '', ev, '') +
			'</select>';
	} else if(v === '') {
		str = '<input type="number" placeholder="先选择奖励类型" readonly class="form-control" />';
	} else if ( (v === '1') || (v === '2') ) {
		$.each(globalData.awardTypeList, function(index, obj) {
			if(obj.value === v) {
				ftlarr = [];
				if ( v === '1' ) { // 积分
					$.each(globalData.fundTypeList, function ( fi, fo ) {
						if ( parseInt(fo.value) >= 1001 ) {
							ftlarr[ftlarr.length] = fo;
						}
					});
				} else if ( v === '2' ) { // 现金，有可能显示的是彩钻
					$.each(globalData.fundTypeList, function ( fi, fo ) {
						if ( parseInt(fo.value) <= 999 ) {
							ftlarr[ftlarr.length] = fo;
						}
					});
				}
				ev = ev.split('|');
				str =
					'<div class="input-group">' +
						'<div class="input-group-addon">' + obj.desc + '值为：</div>'+
						'<input type="number" value="' + (ev[0] || '') + '" min="0" placeholder="请输入' + obj.desc + '奖励值" class="form-control awardValue" />' +
					'</div>'+
					'<div style="height: 5px;"></div>'+
					'<div class="input-group">' +
						'<div class="input-group-addon">类型为：</div>'+
						'<select class="form-control awardValue">' +
						selectInitFn(ftlarr, 'desc', 'value', '', (ev[1] || '')) +
						'</select>'+
					'</div>';
				return false;
			}
		});
	} else if(v === '4') {
		ev = ev.split('|');
		str =
			'<div class="input-group">' +
				'<div class="input-group-addon">参与</div>'+
				'<input type="number" value="' + (ev[0] || '') + '" min="0" placeholder="活动可参与的次数" class="form-control awardValue" />' +
				'<div class="input-group-addon">次</div>'+
			'</div>'+
			'<div style="height: 5px;"></div>'+
			'<div class="input-group">' +
				'<div class="input-group-addon">活动ID：</div>'+
				'<input type="text" readonly onclick="selectActId(this, 1)" value="' + (ev[1] || '') + '" placeholder="对应的活动ID" class="form-control act_aaval awardValue" />' +
			'</div>';
	} else {
		str = '<input type="number" placeholder="请输入奖励值" class="form-control awardValue" />';
	}
	$me.parents('.form-group')
		.next('.form-group').eq(0)
		.find('.col-xs-8').html(str);
}

// 奖励类型为活动奖励
// 在元素的顶级form元素后面添加一个表格项目
function selectActId ( me, status ) {
	var $me = $(me),
		$form = $me.parents('form'),
		$tbox = $form.next('.act_reward');
	$tbox.remove();
	$tbox = $('<div class="act_reward control_gridw"></div>');
	var str = 
		'<div><button type="button" class="btn btn-primary" onclick="closeAvtSe(this)">返回</button></div>'+
		'<table class="itemGridTable" id="act_rtable"></table>'+
		'<div class="itemGridPager" id="act_rpager"></div>';
	$tbox.html(str);
	$form.after($tbox).hide();
	// 绑定表格，并添加选中事件
	actSelectTab('#act_rtable', '#act_rpager', status);
}

// 关闭任务任务列表的id选择
function closeAvtSe ( me ) {
	var $me = $(me),
		$tbox = $me.parents('.act_reward'),
		$form = $tbox.prev('form');
	$tbox.remove();
	// 显示form并给活动ID的input元素赋值
	$form.show();
	return $form;
}


//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
function actSelectTab(tableId, pagerId, status) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/task/listBy',
		colModel = [
			{
				label: '活动ID',
				name: 'id',
				index: 'id',
				fixed: true,
				width: 50,
				align: 'center'
			}, {
				label: '活动名称',
				name: 'name',
				index: 'name',
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					var listdata = $(tableId).data('listdata') || {};
					listdata[( 'key' + rowData.id )] = rowData;
					$(tableId).data('listdata', listdata);
					return cellVal;
				}
			}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, null, {
		onSelectRow: function ( id, s, e ) {
			var listdata = $(tableId).data('listdata') || {},
				rdata = listdata[( 'key' + id )],
				$form = closeAvtSe(e.target);
			if ( status === 1 ) { // 奖励值选择活动ID
				rwSidAfter($form, rdata);
			} else if ( status === 2 ) { // 抽奖任务选择助力任务ID
				atSidAfter($form, rdata);
			}
		}
	});
}
// 奖励值选择活动ID
function rwSidAfter ( $form, rdata ) {
	// 显示form并给活动ID的input元素赋值
	$form.find('.act_aaval')
	.val(rdata.id)
	.data('rdata', rdata)
	.attr('title', ('活动名为：' + rdata.name));
}

// 抽奖任务选择助力任务ID
function atSidAfter ( $form, rdata ) {
	// 显示form并给活动ID的input元素赋值
	$form.find('[name="assistanceId"]')
	.val(rdata.id)
	.data('rdata', rdata)
	.attr('title', ('活动名为：' + rdata.name));
}


//审核活动确定之后执行
function auditTaskFn ( id, auditStatus ){
	var _url = '/ushop-web-admin/task/audit',
		_param = {
			id: id,
			auditStatus: auditStatus
		};
	var msg = ( auditStatus === 102 ) ? '审核不通过' : '审核通过';
	Common.jBoxConfirm('确认信息', '您确定要' + msg +'此活动吗？', function(index){
		if (index === 1 ) {
			Common.ajax(_url, 'post', _param, function(data, status){
				if(data.result == 'SUCCESS'){
					Common.jBoxNotice( (msg + '成功'), 'green' );
					activeTaskList( '#itemsTable1', '#itemsPager1' );
				}else{
					Common.jBoxNotice( (msg + '失败 ' + ( data.error_description || '未知错误' )), 'red' );
				}
			});
		}
	});
}

//容器显示隐藏
function pageSH(cn, id) {
	$(cn).addClass('hide');
	$(id).removeClass('hide');
}

//工具提示，用于form表单内容太多时
//bootsToast(box.find('.prizecount'), '<span style="color: #ff961a">请输入正确内容</span>');
function bootsToast($ele, content) {
	content = content || '没有给内容';
	$ele.popover({
		content: content,
		placement: 'bottom',
		trigger: 'none',
		html: true
	}).on('hidden.bs.popover', function() {
		$(this).popover('destroy');
	}).on('shown.bs.popover', function() {
		var $me = $(this);
		setTimeout(function() {
			$me.popover('hide');
		}, 3000);
	}).popover('show');
	$('body, html').scrollTop($ele.offset().top - 50);
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

//绑定ace的文件选择方法
//eleId input元素的ID
function bindFileInput($ele) {
	$ele.ace_file_input({
		//		style: 'well',
		btn_choose: '点击或拖入',
		btn_change: null,
		no_file: '请选择图片文件',
		btn_change: '修改',
		no_icon: 'ace-icon fa fa-picture-o',
		droppable: true,
		thumbnail: 'small',
		//文件展现之前的操作
		before_change: function(files) {
			var _file = ((files || [])[0]) || {},
				_size = _file.size || 0,
				_name = _file.name || '',
				_type = _name.split('\.').pop(),
				size = 50,
				sizeb = parseInt(size) * 1024;
			if(!((_type == 'png') || (_type == 'jpg'))) {
				Common.jBoxNotice('必须是png,jpg格式的图片', 'red');
				return false;
			}
			if(size && !(_size < sizeb)) {
				Common.jBoxNotice(('限制图片大小为' + size + 'KB'), 'red');
				return false;
			}
			return true;
		},
		//删除之前执行
		before_remove: function() {
			$ele
				.removeData('file_url') //删除记录的服务器图片URL数据
				.data('ace_file_input').reset_input(); //重置元素
		},
		preview_error: function(filename, error_code) {}
	}).on('change', function() {
		imageUpdataFn($(this));
	});
}

//ace_file_input方法图片上传
//$me，绑定ace_file_input对象的input元素
function imageUpdataFn($me, callback) {
	callback = callback || function() {};
	var _url = '/ushop-web-admin/file/add',
		_file = ($me.data('ace_input_files') || [])[0],
		fd = new FormData();
	if(!_file) {
		return false;
	};
	fd.append('file', _file);
	Common.ajax(_url, 'post', fd, function(data) {
		if(data.url) {
			$me.data('file_url', data.url); //记录服务器图片URL数据
			callback(data.url);
		} else {
			$me.removeData('file_url').data('ace_file_input').reset_input();
			Common.jBoxNotice('上传失败！', 'red');
		}
	});
}

//导出为Excel
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '常规活动任务列表'
	});
}