/**
 * 
 * AdminList.js
 * 管理员管理-管理员列表
 * 作者：xulin
 * 
 * */
//全局数据
var globalData = {};
jQuery(function($) {

	//左侧菜单显示
	Common.menuNavContent('管理员管理', '管理员分组', '系统管理后台');

	//全局变量赋值，页面数据初始化
	globalDataFn(function(data) {
		//查询按键
		$('.itemSearch').on('click', function(e) {
			onSearch.call(this, e);
		});

		//新增
		$('.addBtn').on('click', function(e) {
			addRow.call(this, e);
		});

		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			$(window).trigger('resize.jqGrid');
		});
		adminLogListFn('#itemsTable1', '#itemsPager1');
	});
});

//全局参数请求
function globalDataFn(callback) {
	callback = callback || function() {};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/getConstants';
	Common.dataAjax(_url, function(data) {
		globalData.adminLogTypeList = data.adminLogTypeList;
		globalData.adminLogStatusList = data.adminLogStatusList;
		callback.call(this, data);
	});
}

//查询函数
function onSearch() {
	var me = $(this),
		box = me.parents('.tabPane'),
		roleName = box.find('.roleName').val(),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		roleName: roleName
	}
	adminLogListFn('#itemsTable1', '#itemsPager1', postData);
}

//管理员列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    额外参数
//http://10.35.0.66:8080/ushop-web-admin/adminRole/adminRoleList
function adminLogListFn(tableId, pagerId, postData) {
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/admin/role/list',
		colModel = [{
				label: 'ID',
				name: 'id',
				index: 'id',
				hidden: true
			},
			{
				label: '分组名称',
				name: 'roleName',
				index: 'roleName',
				width: 90,
				align: 'center',
				editable: true
			},
			{
				label: '分组描述',
				name: 'remark',
				index: 'remark',
				width: 90,
				align: 'center',
				editable: true
			},
			{
				label: '创建时间',
				name: 'createTime',
				index: 'createTime',
				width: 90,
				align: 'center',
				formatter: function(val, cellval, colpos, rwdat) {
					if(val) {
						var createTime = new Date(val);
						var year = createTime.getFullYear(),
							month = parseInt(createTime.getMonth()) + 1,
							day = createTime.getDate(),
							hour = createTime.getHours(),
							minute = createTime.getMinutes(),
							second = createTime.getSeconds();
						return year + '/' + month + '/' + day + '<br/>' + hour + ':' + minute + ':' + second;
					} else {
						return ''
					}
				}
			},
			{
				label: '操作',
				name: 'operation',
				index: '',
				width: 120,
				fixed: true,
				sortable: false,
				resize: false,
				align: 'center',
				formatter: function(val, cellval, colpos, rwdat) {
					var str = '';
					if(colpos.roleName != '超级管理员角色') {
						str += '<button class="btn btn-xs btn-primary" onclick="editRow(' + colpos.id + ')">编辑</button> ';
						str += '<button class="btn btn-xs btn-danger" onclick="removeRow(' + colpos.id + ')">删除</button> ';
					}
					return str;
				}
			}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}

//添加分组按键点击函数
//http://10.35.0.66:8080/ushop-web-admin/adminRole/addAdminRole
function addRow() {
	var $me = $(this);
	var addModal = $('#pageModalAdd');
	addModal.modal('show');
	addModal.find('.pageModalTitle').html('新增');
	addModal.find('input').val('');
}

function editRow(rowid) {
	var addModal = $('#pageModalAdd');
	addModal.modal('show');
	addModal.find('.pageModalTitle').html('编辑');
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/role/getById?id=' + rowid;
	globalData.roleId = rowid;
	Common.dataAjax(_url, function(data) {
		if(data.adminRole) {
			addModal.find('[name=roleName]').val(data.adminRole.roleName),
				addModal.find('[name=remark]').val(data.adminRole.remark);
		}
	})
}

//保存添加的数据
//http://10.35.0.66:8080/ushop-web-admin/adminRole/addAdminRole
function saveAdd() {
	var addModal = $('#pageModalAdd'),
		roleName = addModal.find('[name=roleName]').val(),
		remark = addModal.find('[name=remark]').val();
	if(!roleName || !/^([\u4E00-\u9FA5]|\w){2,20}$/.test(roleName)) {
		Common.jBoxNotice('分组名为2-20位的中文、数字或字母', 'red');
		return false;
	}
	if(!remark || !/^([\u4E00-\u9FA5]|\w){2,20}$/.test(remark)) {
		Common.jBoxNotice('描述为2-20位的中文、数字或字母', 'red');
		return false;
	}
	var addEditParam = {
		roleName: roleName,
		remark: remark
	};
	var addEditUrl = '';
	var type = addModal.find('.pageModalTitle').html();
	if(type == '新增') {
		addEditUrl = Common.DOMAIN_NAME + '/ushop-web-admin/admin/role/add';

	} else if(type == '编辑') {
		addEditUrl = Common.DOMAIN_NAME + '/ushop-web-admin/admin/role/update';
		addEditParam.roleId = globalData.roleId;
	}

	Common.dataAjaxPost(addEditUrl, addEditParam, function(data) {
		if(data.data == 'SUCCESS' || data.adminRole.id) {
			Common.jBoxNotice(type + '成功', 'green');
			addModal.modal('hide');
			adminLogListFn('#itemsTable1', '#itemsPager1');
		} else {
			Common.jBoxNotice(type + '失败', 'red');
		}
	});
}

//编辑保存之后执行
//http://10.35.0.66:8080/ushop-web-admin/adminRole/updateAdminRole
function editorRow(rowid, res) {
	var rowData = $(this).getRowData(rowid),
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/role/update',
		_param = {
			roleId: rowData.id,
			roleName: rowData.roleName,
			remark: rowData.remark
		};
	if(rowData.roleType == 1) {
		Common.jBoxNotice('超级管理员无法编辑', 'red');
		return false;
	}
	Common.dataAjaxPost(_url, _param, function(data) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice('编辑成功', 'green');
		} else {
			Common.jBoxNotice('编辑失败', 'red');
		}
	});
}
//删除确定之后执行
//'http://10.35.0.66:8080/uplatform-web-admin/uplatform/gameType/deleteGameType/分类ID'
function removeRow(rowid) {
	_url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/role/delete',
		_param = {
			roleId: rowid
		};
	//	if(rowData.id == 1){
	//		Common.jBoxNotice('超级管理员无法删除', 'red');
	//		return false;
	//	}
	Common.jBoxConfirm('确认信息', '您确定要删除此行吗？', function(index) {
		if(index == 1) {
			Common.dataAjaxPost(_url, _param, function(data) {
				if(data.data == 'SUCCESS') {
					Common.jBoxNotice('删除成功', 'green');
					adminLogListFn('#itemsTable1', '#itemsPager1');
				} else {
					Common.jBoxNotice('删除失败', 'red')
				}
			});
		}
	});
}
//导出excel表格
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '管理员分组'
	});
}