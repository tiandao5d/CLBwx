/**
 * 
 * AdminPower.js
 * 管理员管理-操作权限
 * 作者：xulin
 * 
 * */


"use strict";
var globalData = {};
$(function() {
	//菜单面包屑导航等配置显示
	Common.menuNavContent('管理员管理', '操作权限', '系统管理后台');
	pageDataInit(); //页面数据初始化
	domEventFn(); //dom初始化事件绑定
	reloadDataFn(); //所有需要从服务器加载的数据请求
});

//页面启动时，数据初始化
function pageDataInit() {}
//dom事件绑定
function domEventFn() {
	$('.adminRoleList').on('change', function () {
		var v = $(this).val();
		if ( v ) {
			getRoleData(v);
		}
	});
}

//所有需要从服务器加载的数据请求
function reloadDataFn() {
	Common.ajaxAll([
		{url: '/ushop-web-admin/admin/menu/list'},
		{url: '/ushop-web-admin/admin/role/list'}
	], function ( treeD, roleD ) {
		if ( treeD.pmsTreeNodeList && roleD.recordList ) {
			if ( treeD.pmsTreeNodeList.length === 0 ) {
				Common.jBoxNotice('没有数据！', 'red');
				return false;
			}
			globalData.tree_original = treeD.pmsTreeNodeList;
			globalData.tree_alldata = formatTD(treeD.pmsTreeNodeList);
			testTree(globalData.tree_alldata);
			var roleArr = roleD.recordList.slice(0);
			selectInitFn(roleArr, 'roleName', 'id', '.adminRoleList'); // 菜单类型
		} else {
			Common.jBoxNotice('数据请求失败', 'red');
		}
	});
}

// 用户数据更新
function roleDataUd () {
	var _url = '/ushop-web-admin/admin/adminRoleSubmit',
		_param = getRoleNow();
	if ( !_param.roleIds ) {
		Common.jBoxNotice('请选择角色', 'red');
		return false;
	}
	Common.ajax( _url, 'post', _param, function ( data ) {
		if(data.data == true){
			Common.jBoxNotice('更新成功','green');
		}else{
			Common.jBoxNotice((data.error_description || '未知错误'), 'red');
		}
	});
}

// 打开所有
function openAll () {
	$('#tree_ul').tree('discloseAll');
}
// 关闭所有
function closeAll () {
	$('#tree_ul').tree('closeAll');
}

// 获取当前用户的数据，用于提交更新
function getRoleNow () {
	var id = $('#role_sele').val();
	if ( !id ) {
		return {};
	}
	// 此数据获取必须是展开过的叶子选中项，所以只能是数据默认展开
	var selectedItems = $('#tree_ul').tree('selectedItems'),
		arr = [], p, pid;
	$.each(selectedItems, function (index, obj) {
		pid = (obj.parentId || ( obj.parent && obj.parent.id ) || '');
		if ( pid && arr.indexOf(pid) < 0 ) {
			arr[arr.length] = pid;
		}
		arr[arr.length] = obj.id;
		
	});
	p = {
		roleIds: id,
		menuIds: arr.join(',')
	};
	return p;
}

// 获取用户数据
function getRoleData ( id, callback ) {
	callback = callback || function () {};
	var _url = '/ushop-web-admin/admin/adminRole';
	Common.ajax(_url, 'get', {roleId: id}, function ( data ) {
		if ( data.pmsTreeNodeList ) {
			var treeD = (function () {
				var leafIds = [],
					orgobj = JSON.parse(JSON.stringify(globalData.tree_alldata)); // 复制原数据
				recursiveTD(data.pmsTreeNodeList, function (obj) {
					leafIds[leafIds.length] = obj.id;
				});
				recursiveTD(orgobj, function (obj) {
					if ( leafIds.indexOf(obj.id) >= 0 ) {
						obj.additionalParameters['item-selected'] = true;
					}
				}, true);
				return orgobj;
			})();
			testTree(treeD);
		} else {
			Common.jBoxNotice((data.error_description || '未知错误'), 'red');
		}
	});
}

// 递归遍历数据树叶
function recursiveTD ( arr, callback, isf ) {
	callback = callback || function(){};
	function ff ( arr ) {
		$.each(arr, function ( index, obj ) {
			if ( (obj.isLeaf + '') === '1' ) { // 树叶数据
				if ( callback(obj) === false ) {
					return false;
				};
			} else { //　树干数据
				if ( isf ) {
					ff(obj.additionalParameters.children);
				} else {
					ff(obj.childs);
				}
			}
		})
	}
	ff(arr);
}



// 格式化树形参数
function formatTD ( data, isopen ) {
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
						'item-selected': (isopen ? true : false) // 是否选中
					};
				} else { //　树干数据
					return {
						'children': ff(obj.childs),
						'item-selected': true // 是否展开，默认展开以便于获取数据
					};
				}
			})();
			dobj[('key' + obj.id)] = kobj;
		})
		return dobj;
	}
	return ff(data);
}


// 树形结构初始化
function testTree ( tree_data ) {
	var $box = $('#tree_from');
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
	var $ul = $('<ul id="tree_ul"></ul>');
	$('#tree_box').html($ul)
	$ul.ace_tree({
		dataSource: dataSource,
		multiSelect: true, // 不能选中多个
		cacheItems: true,
		'open-icon': 'ace-icon tree-minus',
		'close-icon': 'ace-icon tree-plus',
		'itemSelect': true,
		'folderSelect': false,
		'selected-icon': 'ace-icon fa fa-check',
		'unselected-icon': 'ace-icon fa fa-times',
		loadingHTML: '<div class="tree-loading"><i class="ace-icon fa fa-refresh fa-spin blue"></i></div>'
	});
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
