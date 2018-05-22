/**
 * 
 * VersionUpdate.js
 * 推送消息列表
 * 作者：zl
 * 
 * */
'use strict';
var globalData = [];
globalData.reg=/^[0-9]\.[0-9]\.[0-9]{1}$/;
globalData.forceUpdateType = [{
	desc: '强制更新',
	value: 1

}, {
	desc: '建议更新',
	value: 2
}];
globalData.updateModeType = [{
	desc: '渠道更新',
	value: 1

}, {
	desc: '官方更新',
	value: 2
}];
globalData.platformType = [{
	desc: 'IOS',
	value: 3

}, {
	desc: '安卓',
	value: 2
}];
//var dropzoneBase = {//默认配置
//	previewTemplate: $('#preview-template').html(),
//  addRemoveLinks: true,//上传文件可以删除
//  dictDefaultMessage: '<div>请点击或拖拽上传</div><div>只接受720*240的图片</div>',
//  dictFallbackMessage: '您的浏览器版本太旧',
//  dictInvalidFileType: '文件类型被拒绝',
//  dictFileTooBig: '文件大小{{filesize}}M，限制最大为{{maxFilesize}}M',
//  dictCancelUpload: '取消上传链接',
//  dictResponseError: '服务器错误，错误代码{ { statusCode } }',
//  dictCancelUploadConfirmation: '是否取消',
//  dictMaxFilesExceeded: '文件数量超出',
//  dictRemoveFile: '删除文件'
//}, dropzoneRar;
jQuery(function($) {
	var optionStr = '';
	//  //不自动配置Dropzone
	//	Dropzone.autoDiscover = false;
	//	//配置图标上传Dropzone
	//	dropzoneRarFn();
	//菜单面包屑导航等配置显示
	Common.menuNavContent('版本更新', '版本管理', '运营管理后台');
	//表格呈现
	versionUpdateList('#itemsTable1', '#itemsPager1');
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
		$(window).trigger('resize.jqGrid');
	});
	//	查询按键
	$('.itemSearch').on('click', function() {
		onSearch.call(this);
	});
	//模态框消失初始化数据
	//	$('#pageModal').on('hide.bs.modal', function (){
	//   dropzoneRar.removeAllFiles();
	// 
	//  })
	//强制更新下拉框
	optionStr = '';
	$.each(globalData.forceUpdateType, function(index, obj) {
		optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
	});
	$('.updateType').html(optionStr);
	//渠道更新下拉框
	optionStr = '';
	$.each(globalData.updateModeType, function(index, obj) {
		optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
	});
	$('.updateMode').html(optionStr);
	//设备类型下拉框
	optionStr = '<option value="">请选择 </option>';
	$.each(globalData.platformType, function(index, obj) {
		optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
	});
	$('.platform').html(optionStr);
})

function onSearch() {
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		platform = $.trim(box.find('[name="platform"]').val()),

		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		platform: platform
	}
	versionUpdateList('#itemsTable1', '#itemsPager1', postData);
};

//}
//版本更新列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
function versionUpdateList(tableId, pagerId, postData) {
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/update/version/listBy',
		colModel = [{
				label: '版本号',
				name: 'versionNo',
				index: 'versionNo',
				width: 100,
				align: 'center'
			}, {
				label: '更新状态',
				name: 'updateType',
				index: 'updateType',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.forceUpdateType, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal || '';
				}

			}, {
				label: '渠道名称',
				name: 'channelName',
				index: 'channelName',
				width: 100,
				align: 'center'
			}, {
				label: '操作系统',
				name: 'platform',
				index: 'platform',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.platformType, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal || '';
				}

			}, {
				label: '更新时间',
				name: 'createTime',
				index: 'createTime',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					cellVal = new Date(cellVal).toLocaleString().replace('/年|月/g', "-").replace('/日/g', " ");
					return cellVal;
				}
			}, {
				label: '是否强制更新',
				name: 'operation',
				index: '',
				width: 140,
				align: 'center',
				fixed: 'true',
				formatter: function(val, cellval, colpos, rwdat) {
					if(colpos.updateType == 1) {
						var str = '<input id="id-button-borders"  type="checkbox"  class="ace ace-switch ace-switch-4 " onclick="isForceFn(' + colpos.id + ',this)"/><span class="lbl middle"></span>';
					} else if(colpos.updateType == 2) {
						var str = '<input id="id-button-borders" checked type="checkbox"  class="ace ace-switch ace-switch-4 " onclick="isForceFn(' + colpos.id + ',this)"/><span class="lbl middle"></span>';
					}

					return str;
				}
			}, {
				label: '是否更新渠道',
				name: 'operation',
				index: '',
				width: 140,
				align: 'center',
				fixed: 'true',
				formatter: function(val, cellval, colpos, rwdat) {

					
						
					if(colpos.channelId == 1 || colpos.channelId == 2){
						var str = '';
					}else{
						if(colpos.updateMode==1){
							var str = '<input id="id-button-borders" checked type="checkbox"  class="ace ace-switch ace-switch-4 " onclick="isChannelFn(' + colpos.id + ',this)"/><span class="lbl middle"></span>';
						}else if(colpos.updateMode==2){
							var str = '<input id="id-button-borders"  type="checkbox"  class="ace ace-switch ace-switch-4 " onclick="isChannelFn(' + colpos.id + ',this)"/><span class="lbl middle"></span>';
						}
						
					}
					return str;
				
			}

		}];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}
//新增弹窗
function addVersionFn() {
	var modal = $("#pageModal");
	modal.modal('show');
	modal.find('input').val('');
	$('#editor1').html('');
	modal.find('[name=platform]').on('change', function(e) {
		var platId = modal.find('[name=platform]').val();
		if(platId == 2) {
			modal.find('.channelNameType').removeClass('hide');
			modal.find('.updateModeType').removeClass('hide');
			var _url = Common.DOMAIN_NAME + '/ushop-web-admin/update/channel/list';
			Common.dataAjax(_url, function(data) {
				globalData.recordList = data.recordList || '';
				globalData.channelNameType = [];
				var optionStr = '';
				$.each(globalData.recordList, function(index, obj) {

					globalData.channelNameType[globalData.channelNameType.length] = {
						desc: obj.channelName,
						value: obj.id
					}
				})
				$.each(globalData.channelNameType, function(index, obj) {
					optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
				});
				$('.channelName').html(optionStr);
			})

		} else {
			modal.find('.channelNameType').addClass('hide');
			modal.find('.updateModeType').addClass('hide');
		}
	});

}
//弹窗确定
function updateVersion() {
	var modal = $("#pageModal"),
		_param = {},
		updateType = modal.find('.updateType').val(),
		platform = modal.find('.platform').val(),
		versionNo = modal.find('.versionNo').val(),
		packetName = modal.find('.packetName').val(),
		updateMode = modal.find('.updateMode').val(),
		channelId = modal.find('.channelName').val(),
		updateUrl = modal.find('.updateUrl').val(),
		notifyInfo = modal.find('#editor1').html();
	_param = {
		updateType: updateType,
		platform: platform,
		versionNo: versionNo,
		notifyInfo: notifyInfo,
		packetName: packetName,
		channelId: channelId,
		updateMode: updateMode,
		updateUrl: updateUrl
	};
	if(!_param.packetName) {
		Common.jBoxNotice('请填写包名', 'red');
		return false;
	}
	if(!_param.platform) {
		Common.jBoxNotice('请选择操作系统', 'red');
		return false;
	}
	if(!_param.versionNo || !globalData.reg.test(_param.versionNo)) {
		Common.jBoxNotice('请填写正确的版本号', 'red');
		return false;
	}
	if(!_param.notifyInfo) {
		Common.jBoxNotice('请填写通知信息', 'red');
		return false;
	}
	if(!_param.updateUrl) {
		Common.jBoxNotice('请填写文件路径', 'red');
		return false;
	}
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/update/version/add';
	Common.dataAjaxPost(_url, _param, function(data) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice('操作成功', 'green');
			modal.modal('hide');
			versionUpdateList('#itemsTable1', '#itemsPager1');

		} else {
			Common.jBoxNotice(data.error_description, 'red');
			return false
		}
	});

}
//强制更新开关
function isForceFn(id, me) {
var modal = $("#pageModal");
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/update/version/get?id=' + id;
	Common.dataAjax(_url, function(data) {
		var _param={};
		if($(me).is(':checked') == true) {
			_param.updateType = 2;

		} else if($(me).is(':checked') == false) {
			_param.updateType = 1;

		}
		_param.updateMode=data.updateMode;
		_param.packetName=data.packetName;
		_param.id=data.id;

		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/update/version/update';
		Common.dataAjaxPost(_url, _param, function(obj) {
			if(obj.data == 'SUCCESS') {
				Common.jBoxNotice('操作成功', 'green');
				modal.modal('hide');
				versionUpdateList('#itemsTable1', '#itemsPager1');

			} else {
				Common.jBoxNotice(obj.error_description, 'red');
				return false
			}
		});
	})

}
//渠道更新
function isChannelFn(id, me) {
	var modal = $("#pageModal");
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/update/version/get?id=' + id;
	Common.dataAjax(_url, function(data) {
		var _param={};
		if($(me).is(':checked') == true) {

			_param.updateMode = 1;

		} else if($(me).is(':checked') == false) {

			_param.updateMode = 2;

		}
		_param.updateType=data.updateType;
		_param.packetName=data.packetName;
		_param.id=data.id;
		
		console.log(_param);
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/update/version/update';
		Common.dataAjaxPost(_url, _param, function(obj) {
			if(obj.data == 'SUCCESS') {
				Common.jBoxNotice('操作成功', 'green');
				modal.modal('hide');
				versionUpdateList('#itemsTable1', '#itemsPager1');

			} else {
				Common.jBoxNotice(obj.error_description, 'red');
				return false
			}
		});
	})

}

//导出列表
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '版本更新列表'
	});
}