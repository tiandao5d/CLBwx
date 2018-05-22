/**
 * 
 * AdminList.js
 * 管理员管理-管理员列表
 * 作者：xulin
 * 
 * */
//全局数据
var globalData = {};
globalData.hasSubmit = false;
jQuery(function($) {
	
	//左侧菜单显示
	Common.menuNavContent('管理员管理', '管理员列表','系统管理后台');
	
	//全局变量赋值，页面数据初始化完成后执行页面操作
	globalDataFn(function(data){
		var str = '<option value="">请选择</option>';
		$.each(data.adminTypeList, function(key, val) {
			str += '<option value="' + key + '">' + val + '</option>';
		});
		$('.adminType').html(str);
		
		//查询按键
		$('.itemSearch').on('click', function(e){
			onSearch.call(this, e);
		});
		
		
		//新增按键点击事件
		$('.addAdmin').on('click', function(){
			addEditor();
		});
		
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			$(window).trigger('resize.jqGrid');
		});
		adminListFn('#itemsTable1', '#itemsPager1');
	});
});


//全局参数请求
function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/getConstants';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.adminStatusList = data.adminStatusList;
			globalData.adminTypeList = data.adminTypeList;
			callback.call(this, data);
		}else{
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
}


//查询函数
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		adminType = box.find('.adminType').val(),
		adminName = $.trim(box.find('.adminName').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		adminType: adminType,
		adminName: adminName
	}
	adminListFn('#itemsTable1', '#itemsPager1', postData);
}

//管理员列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    额外参数
//http://10.35.0.66:8080/ushop-web-admin/admin/adminList
function adminListFn(tableId, pagerId, postData){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/admin/list',
		colModel = [
			{label: 'ID',name:'id',index:'id', hidden: true},
			{label: '登录名',name:'loginName',index:'loginName',width:90, align: 'center'},
			{label: '类型',name:'roleName',index:'roleName',width:90, align: 'center'},
			{label: '管理员名称',name:'realName',index:'realName',width:90, align: 'center'},
			{label: '手机号',name:'mobileNo',index:'mobileNo',width:90, align: 'center'},
			{label: '注册时间',name:'createTime',index:'createTime',width:90, align: 'center',
				formatter: function(val, cellval, colpos, rwdat){
				    if(val){
					    var createTime = new Date( val );
					    var year = createTime.getFullYear(),
					        month = parseInt( createTime.getMonth() )+1,
					        day = createTime.getDate(),
					    	hour = createTime.getHours(),
					    	minute = createTime.getMinutes(),
					    	second = createTime.getSeconds();
					    return year+'/'+month+'/'+day+'<br/>'+hour+':'+minute+':'+second;
					    }
				    else{return ''}
				 }
			},
			{label: '描述',name:'remark',index:'remark',width:90, align: 'center'},
			{label: '状态',name:'status',index:'status',width:90, align: 'center',
				formatter: function(val){
					switch (val){
						case '100': return '激活';
						break;
						case '101': return '冻结';
						default : return '错误'
					}
				}
			},
			{label: '操作', name:'operation',index:'', align: 'center', width:140, fixed:true, sortable:false, resize:false,
				formatter: function(val, cellval , colpos, rwdat){
					var str = '<button class="btn btn-xs btn-primary" onclick="addEditor(' + colpos.id + ', ' + cellval.rowId + ')">编辑</button> '+
							  '<button class="btn btn-xs btn-primary" onclick="changePwd(' + colpos.id + ', ' + cellval.rowId + ')">修改密码</button>';
					return str;
				}
			}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '管理员列表');
}

//开关模拟
//function aceSwitch( cellvalue, options, cell ) {
//	setTimeout(function(){
//		$(cell) .find('input[type=checkbox]')
//			.addClass('ace ace-switch ace-switch-5')
//			.after('<span class="lbl"></span>');
//	}, 0);
//}


//编辑和新增
//http://10.35.0.66:8080/ushop-web-admin/admin/getById
function addEditor(id, rowId){
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/getById?id=' + id
	var addModal = $('#pageModalAdd'),
		modalTitle = addModal.find('.pageModalTitle'),
		saveBtn = addModal.find('.saveBtn');
		globalData.hasSubmit = false;
	if(id){
		modalTitle.html('编辑');
		saveBtn.attr('dataId', id);
		addModal.find('[name=loginName]').attr('disabled', 'disabled');
		addModal.find('.editShowIpt').show();
		addModal.find('.addShowIpt').hide();
		Common.dataAjax(_url, function(data){
			$.each(data.admin, function(key, val) {
				if(addModal.find('[name=' + key + ']').length > 0){
					if(key == 'lastLoginTime'){
						var createTime = new Date( val );
					    var year = createTime.getFullYear(),
					        month = parseInt( createTime.getMonth() )+1,
					        day = createTime.getDate(),
					    	hour = createTime.getHours(),
					    	minute = createTime.getMinutes(),
					    	second = createTime.getSeconds();
					    var time = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;
						addModal.find('[name=' + key + ']').val(time);
					    
					}
					else{
						addModal.find('[name=' + key + ']').val(val);
					}
				}
			});
			$.each(globalData.adminTypeList, function(key, val){
				if(val == data.admin.type){
					$('[name=type]').val(key);
				}
			});
		});
	}else{
		modalTitle.html('新增');
		addModal.find('[name=loginName]').removeAttr('disabled');
		saveBtn.attr('dataId', '');
		addModal.find('.editShowIpt').hide();
		addModal.find('.addShowIpt').show();
		addModal.find('input, select').val('');
	}
	addModal.modal('show');
	
}
//保存编辑和添加
//http://10.35.0.66:8080/ushop-web-admin/admin/addAdmin
//http://10.35.0.66:8080/ushop-web-admin/admin/updateAdmin
function addEditorSave(me){
		

	var dataId = $(me).attr('dataId');
	var addModal = $('#pageModalAdd'),
		loginName = addModal.find('[name=loginName]').val(),
		loginPwd = addModal.find('[name=loginPwd]').val(),
		confirmPwd = addModal.find('[name=confirmPwd]').val(),
		type = addModal.find('[name=type]').val(),
		remark = addModal.find('[name=remark]').val(),
		realName = addModal.find('[name=realName]').val(),
		mobileNo = addModal.find('[name=mobileNo]').val();
	if(dataId){
		if(!type){
			Common.jBoxNotice('请选择管理员类型', 'red');
			return false;
		}
		if(!mobileNo || !/^1(3|4|5|7|8)\d{9}$/.test(mobileNo)){
			Common.jBoxNotice('请输入正确的手机号', 'red');
			return false;
		}if(realName.length>12){
			Common.jBoxNotice('真实姓名请少于12个汉字', 'red');
			return false;
		}
		var editUrl = Common.DOMAIN_NAME + '/ushop-web-admin/admin/update',
			editParam = {
				id: dataId,
				roleId: type,
				realName: realName,
				mobileNo: mobileNo,
				remark: remark
			};
		Common.dataAjaxPost(editUrl, editParam, function(data){
			if(data.data == 'SUCCESS'){
				Common.jBoxNotice('编辑成功', 'green');
				addModal.modal('hide');
				adminListFn('#itemsTable1', '#itemsPager1');
			}else{
				Common.jBoxNotice('编辑失败', 'red');
			}
		});
	}else{
		if(!loginName || !/^[0-9A-Za-z]{6,20}$/.test(loginName)){
			Common.jBoxNotice('请输入6-20位字母或数字的登录名', 'red');
			return false;
		}
		if(!loginPwd || !/^[0-9A-Za-z]{6,20}$/.test(loginPwd)){
			Common.jBoxNotice('请输入6-20位的登录密码,不支持中文', 'red');
			return false;
		}
		if(confirmPwd != loginPwd){
			Common.jBoxNotice('两次密码输入不一致', 'red');
			return false;
		}
		if(!type){
			Common.jBoxNotice('请选择管理员类型', 'red');
			return false;
		}
		if(!mobileNo || !/^1(3|4|5|7|8)\d{9}$/.test(mobileNo)){
			Common.jBoxNotice('请输入正确的手机号', 'red');
			return false;
		}
		var addUrl = Common.DOMAIN_NAME + '/ushop-web-admin/admin/add',
			addParam = {
				loginName: loginName,
				loginPwd: md5(loginPwd),
				type: type,
				realName: realName,
				mobileNo: mobileNo,
				remark: remark
			};
		if(globalData.hasSubmit){return false;}
		Common.dataAjaxPost(addUrl, addParam, function(data){
			if(data.admin){
				if(data.admin.id){
					Common.jBoxNotice('新增成功', 'green');
					globalData.hasSubmit = true;
					addModal.modal('hide');
					adminListFn('#itemsTable1', '#itemsPager1');
				}
			}else{
				Common.jBoxNotice('新增失败', 'red');
			}
			if($.trim(data.date) == 'EXISTED'){
				Common.jBoxNotice('该管理员已存在，请重新命名', 'red');				
			}
		});
	}

}

//修改密码
//http://10.35.0.66:8080/ushop-web-admin/admin/getById
function changePwd(id, rowId){
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/getById?id=' + id
	var pwdModal = $('#pageModalPwd'),
		saveBtn = pwdModal.find('.saveBtn');
	saveBtn.attr('dataId', id);
	pwdModal.find('input').val('');
	Common.dataAjax(_url, function(data){
		$.each(data.admin, function(key, val) {
			if(pwdModal.find('[name=' + key + ']').length > 0){
				pwdModal.find('[name=' + key + ']').val(val);
			}
		});
	});
	pwdModal.modal('show');
}

//保存修改密码
//http://10.35.0.66:8080/ushop-web-admin/admin/alertPwdSubmit
function savePwd(me){
	var dataId = $(me).attr('dataId');
	var pwdModal = $('#pageModalPwd'),
		oldPwd = pwdModal.find('[name=oldPwd]').val(),
		newPwd = pwdModal.find('[name=newPwd]').val(),
		confirmPwd = pwdModal.find('[name=confirmPwd]').val();
	if(!oldPwd || !/^[0-9A-Za-z]{4,20}$/.test(oldPwd)){
		Common.jBoxNotice('请输入4-20位旧的登录密码', 'red');
		return false;
	}
	if(!newPwd || !/^[0-9A-Za-z]{4,20}$/.test(newPwd)){
		Common.jBoxNotice('请输入4-20位新的登录密码', 'red');
		return false;
	}
	if(oldPwd == newPwd){
		Common.jBoxNotice('新密码和旧密码不能一样', 'red');
		return false;
	}
	if(confirmPwd != newPwd){
		Common.jBoxNotice('两次密码输入不一致', 'red');
		return false;
	}
	var pwdUrl = Common.DOMAIN_NAME + '/ushop-web-admin/admin/changePwd',
		pwdParam = {
			adminId: dataId,
			newPwd: md5(newPwd),
			oldPwd: md5(oldPwd)
		};
	Common.dataAjaxPost(pwdUrl, pwdParam, function(data){
		if(data.result == 'SUCCESS'){
			Common.jBoxNotice('修改成功', 'green');
			pwdModal.modal('hide');
			adminListFn('#itemsTable1', '#itemsPager1');
		}else{
			Common.jBoxNotice('修改失败', 'red');
		}
	});
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'管理员列表'});
}