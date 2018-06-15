/**
 * 
 * SendSystemMsg.js
 * 发送系统消息
 * 作者：xulin
 * 
 * */

"use strict";
var globalData = {};
$(function() {
	//菜单面包屑导航等配置显示，新的传参方式，只需要传入最大的分类
//	Common.menuNavContent('运营管理后台');
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
	//日期选择器绑定
	$('.form_datetime').each(function () {
		var $me = $(this);
		laydate.render({
		  elem: $me[0],
		  type: 'datetime',
		  done: function (val) {
		  	var st, et;
		  	if ( $me.hasClass('start') ) {
	  			st = val;
	  			et = $me.parent().find('.end').val();
		  	} else if ( $me.hasClass('end') ) {
	  			st = $me.parent().find('.start').val();
	  			et = val;
		  	}
	  		if ( st && et ) {
	  			st = Common.msToTime(st).ms;
	  			et = Common.msToTime(et).ms;
	  			if ( !(et > st) ) {
	  				Common.jBoxNotice('结束时间必须大于开始时间！', 'red');
	  				setTimeout(function () {$me.val('')}, 0)
	  			}
	  		}
		  }
		});
	});
}

//所有需要从服务器加载的数据请求
function reloadDataFn() {
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

//导出为Excel
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '常规活动任务列表'
	});
}
