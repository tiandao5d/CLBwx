/**
 * 
 * AddActive.js
 * 活动任务-添加活动
 * 作者：xulin
 * 
 * */

"use strict";
var globalData = {};
$(function() {
	//菜单面包屑导航等配置显示
	Common.menuNavContent('系统管理后台');
	pageDataInit(); //页面数据初始化
	domEventFn(); //dom初始化事件绑定
	reloadDataFn(); //所有需要从服务器加载的数据请求
});

//页面启动时，数据初始化
function pageDataInit() {}
//dom事件绑定
function domEventFn() {
	var $box = $('#form_widget'),
		$form = $('#tree_from');
	$box.find('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
		var type = $(this).attr('data-type');
  		$form.data('dataType', type);
		if ( type === 'add' ) {
		  	$box.find('.widget-title').text('新增');
			$form.find('.bole_ipt, .leaf_ipt').addClass('hide');
		} else if ( type === 'edit' ) {
		  	$box.find('.widget-title').text('编辑');
		  	if ( !($form.find('[name="isLeaf"]:checked')[0]) ) {
		  		$form.find('[name="isLeaf"]')[0].checked = true;
		  	}
		  	$form.find('[name="isLeaf"]:checked').trigger('change');
		}
	});
	$form.find('[name="isLeaf"]').on('change', function () {
	  	var v = $form.find('[name="isLeaf"]:checked').val();
		if ( !(($form.data('dataType') === 'edit') && v) ){return false}
		if ( v === '0' ) { // 树干
			$form.find('.bole_ipt').removeClass('hide');
			$form.find('.leaf_ipt').addClass('hide');
		} else if ( v === '1' ) { // 树叶
			$form.find('.leaf_ipt').removeClass('hide');
			$form.find('.bole_ipt').addClass('hide');
		}
	});
	$box.find('a[data-toggle="tab"]').eq(0).tab('show'); // 显示第一个标签
}

//所有需要从服务器加载的数据请求
function reloadDataFn() {
	Common.ajaxAll([
		{url: '/ushop-web-admin/admin/menu/list'},
		{url: '/ushop-web-admin/admin/menu/getConstants'}
	], function ( treeD, mtpD ) {
		if ( treeD.pmsTreeNodeList && mtpD.menuTypeList ) {
			if ( treeD.pmsTreeNodeList.length === 0 ) {
				Common.jBoxNotice('没有数据！', 'red');
				return false;
			}
			testTree(formatTD ( treeD.pmsTreeNodeList ));
			selectInitFn(globalData.boleData, 'text', 'id', '.bole_select'); // 树干数据赋值
			selectInitFn(globalData.leafData, 'text', 'id', '.leaf_select'); // 树叶数据赋值
			selectInitFn(mtpD.menuTypeList, 'desc', 'value', '.menuType'); // 菜单类型
		} else {
			Common.jBoxNotice('数据请求失败', 'red');
		}
	});
}

// 格式化树形参数
function formatTD ( data ) {
	globalData.boleData = {}; // 记录树干数据
	globalData.leafData = {}; // 记录树叶数据
	function ff ( arr ) {
		var dobj = {}, kobj;
		$.each(arr, function ( index, obj ) {
			kobj = {};
			obj.self.isLeaf = ((obj.self.isLeaf + '') === '1') ? '1' : '0';
			$.extend(kobj, obj.self);
			kobj['text'] = obj.name;
			kobj['type'] = (obj.isLeaf ? 'item' : 'folder');
			kobj['additionalParameters'] = (function () {
				if ( (obj.isLeaf + '') === '1' ) { // 树叶数据
					return {
						'item-selected': false // 是否选中
					};
				} else { //　树干数据
					return {
						'children': ff(obj.childs),
						'item-selected': false // 是否展开
					};
				}
			})();
			// 记录文件夹数据
			if ( (obj.isLeaf + '') === '1' ) { // 树叶数据
				globalData.leafData[('key' + obj.id)] = kobj;
			} else { //　树干数据
				globalData.boleData[('key' + obj.id)] = kobj;
			}
			dobj[('key' + obj.id)] = kobj;
		})
		return dobj;
	}
	globalData.treeData = ff(data); // 记录树形结构数据
	return globalData.treeData;
}

// 获取表单数据
function getTreeData () {
	var $form = $('#tree_from'),
		obj = {}, k, v, $me;
	$form.find('.add_form_ipt').each(function () {
		$me = $(this);
		k = $me.attr('name');
		v = $me.val();
		obj[k] = v;
	});
	obj['isLeaf'] = $form.find('[name="isLeaf"]:checked').val() || '';
	if ( $form.data('dataType') === 'edit' ) { // 编辑数据需要固定参数
		if ( (obj['isLeaf'] + '') === '1' ) { // 树叶
			$.extend(obj, getFp($form.find('[name="leaf"]').val(), globalData.leafData));
		} else if ( (obj['isLeaf'] + '') === '0' ) { // 树干
			$.extend(obj, getFp($form.find('[name="bole"]').val(), globalData.boleData));
		}
	}
	return obj;
}

// 获取编辑的固定值参数
function getFp ( v, arr ) {
	if ( !v ) {return {}}
	var cobj = null;
	$.each(arr, function ( k, o ) {
		if ( (o.id + '') === (v + '') ) {
			cobj = o;
			return false;
		}
	});
	return {
		id: cobj.id,
		version: cobj.version
	}
}

// 数据验证
function treeDataValid ( p ) {
	var $form = $('#tree_from'),
		istrue = true, $me, dnull = '';
	$form.find('[data-null]').each(function () {
		$me = $(this);
		if ( !$me.val() ) {
			bootsToast($me, '<span style="color: #ff961a">' + $me.attr('data-null') + '</span>');
			istrue = false;
		}
		if ( !istrue ) {
			return false;
		}
	});
	if ( $form.data('dataType') === 'edit' && !p.id ) { // 编辑数据时必须有对应ID
		if ( p.isLeaf === '1' ) { // 树叶
			$me = $form.find('[name="leaf"]');
		} else {
			$me = $form.find('[name="bole"]');
		}
		bootsToast($me, '<span style="color: #ff961a">请选择要编辑的菜单</span>');
		return false;
	}
	if ( p.isLeaf === '1' && !p.parentId ) { // 树叶，必须有父菜单
		bootsToast($form.find('[name="parentId"]'), '<span style="color: #ff961a">树叶必须有父菜单</span>');
		return false;
	} else if ( p.isLeaf === '0' && p.parentId ) { // 树干，不能有父菜单
		bootsToast($form.find('[name="parentId"]'), '<span style="color: #ff961a">树干不能有父菜单</span>');
		return false;
	}
	return istrue;
}

// 树形表单赋值
function treeEvalFn ( p ) {
	var $form = $('#tree_from'),
		obj = {}, k, v, $me;
	$form.find('.add_form_ipt').each(function () {
		$me = $(this);
		k = $me.attr('name');
		v = p[k];
		$me.val(v);
	});
	var ckIL = $form.find('[name="isLeaf"][value="' + p.isLeaf + '"]');
	if ( ckIL[0] ) {
		ckIL[0].checked = true;
		ckIL.trigger('change');
	}
	if ( (p.isLeaf + '') === '1' ) { // 树叶
		$form.find('[name="leaf"]').val(p.id);
	} else { // 树干
		$form.find('[name="bole"]').val(p.id);
	}
}

// 表单提交
function treeDataSubmit () {
	var _url = '/ushop-web-admin/admin/menu/add',
		_param = getTreeData(),
		$form = $('#tree_from'),
		_txt = '添加';
	if ( !treeDataValid(_param) ) {
		return false;
	}
	if ( $form.data('dataType') === 'edit' ) {
		_url = '/ushop-web-admin/admin/menu/update';
		_txt = '编辑';
	}
	Common.ajax(_url, 'post', _param, function ( data ) {
		if ( data.result === 'SUCCESS' ) {
			Common.jBoxNotice((_txt + '成功'), 'green');
			setTimeout(function(){
				location.reload();
			}, 500);
		} else {
			Common.jBoxNotice(((_txt + '失败：') + (data.error_description || '未知错误')), 'red');
		}
	});
}

// 树形结构初始化
function testTree ( tree_data ) {
	var $form = $('#tree_from');
	var dataSource = function(options, callback) {
		var $data = null;
		if( !( ('text' in options) && ('type' in options) ) ) {
			$data = tree_data;
			callback({
				data: $data
			});
			return;
		} else if ( ('type' in options) && (options.type === 'folder') ) {
			if ( ('additionalParameters' in options) && ('children' in options.additionalParameters) ) {
				$data = options.additionalParameters.children || {};
			} else {
				$data = {}
			}
		}
		
		if($data != null) {
			callback({
				data: $data
			});
		}
	}
	$('#tree2').ace_tree({
		dataSource: dataSource,
		multiSelect: false, // 不能选中多个
		cacheItems: true,
		'open-icon': 'ace-icon tree-minus',
		'close-icon': 'ace-icon tree-plus',
		'itemSelect': true,
		'folderSelect': false,
		'selected-icon': 'ace-icon fa fa-check',
		'unselected-icon': 'ace-icon fa fa-times',
		loadingHTML: '<div class="tree-loading"><i class="ace-icon fa fa-refresh fa-spin blue"></i></div>'
	}).on('disclosedFolder.fu.tree', function ( e, obj ) { // 打开文件夹
		treeEvalFn(menuObjFm(obj));
	}).on('selected.fu.tree', function ( e, obj ) { // 选中文件
		treeEvalFn(menuObjFm(obj.target));
	});
}

// 菜单数据格式化
function menuObjFm ( obj ) {
	if ( !obj ) {return {}};
	return ({
		id: obj.id,
		name: obj.name || '',
		menuType: obj.menuType || '',
		url: obj.url,
		isLeaf: obj.isLeaf,
		level: obj.level || '',
		targetName: obj.targetName || '',
		parentId: obj.parentId || ( obj.parent && obj.parent.id ) || ''
	});
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
