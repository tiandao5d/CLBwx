/**
 * 
 * PushMessage.js
 * 推送消息列表
 * 作者：zl
 * 
 * */
'use strict';
var globalData = {};
//初始数据
//设备类型
globalData.deviceTypeList = [{
	desc: '安卓',
	value: 2
}, {
	desc: 'IOS',
	value: 3
}, {
	desc: '微信',
	value: 4
}, {
	desc: 'H5版安卓',
	value: 5
}, {
	desc: 'H5版IOS',
	value: 6
}];
//平台类型
globalData.platformTypeList = [{
	desc: 'APICLOUD',
	value: 1
}, {
	desc: '信鸽',
	value: 2
}];
//消息类型
globalData.messageTypeList = [{
	desc: '通知',
	value: 1
}, {
	desc: '穿透消息',
	value: 2
}];
//状态类型
globalData.statusTypeList = [{
	desc: '准备中',
	value: 1
}, {
	desc: '发送完成',
	value: 2
}, {
	desc: '失败',
	value: 3
}];
//省份
globalData.provinceTypeList = [{
	val: '',
	key: '全国'
}, {
	val: '11',
	key: '北京市'
}, {
	val: '12',
	key: '天津市'
}, {
	val: '13',
	key: '河北省'
}, {
	val: '14',
	key: '山西省'
}, {
	val: '15',
	key: '内蒙古'
}, {
	val: '21',
	key: '辽宁省'
}, {
	val: '22',
	key: '吉林省'
}, {
	val: '23',
	key: '黑龙江省'
}, {
	val: '31',
	key: '上海市'
}, {
	val: '32',
	key: '江苏省'
}, {
	val: '33',
	key: '浙江省'
}, {
	val: '34',
	key: '安徽省'
}, {
	val: '35',
	key: '福建省'
}, {
	val: '36',
	key: '江西省'
}, {
	val: '37',
	key: '山东省'
}, {
	val: '41',
	key: '河南省'
}, {
	val: '42',
	key: '湖北省'
}, {
	val: '43',
	key: '湖南省'
}, {
	val: '44',
	key: '广东省'
}, {
	val: '45',
	key: '广西'
}, {
	val: '46',
	key: '海南省'
}, {
	val: '50',
	key: '重庆市'
}, {
	val: '51',
	key: '四川省'
}, {
	val: '52',
	key: '贵州省'
}, {
	val: '53',
	key: '云南省'
}, {
	val: '54',
	key: '西藏'
}, {
	val: '61',
	key: '陕西省'
}, {
	val: '62',
	key: '甘肃省'
}, {
	val: '63',
	key: '青海省'
}, {
	val: '64',
	key: '宁夏'
}, {
	val: '65',
	key: '新疆'
}];
jQuery(function($) {
		var optionStr = '';

		//菜单面包屑导航等配置显示
		Common.menuNavContent('消息管理', '推送消息', '运营管理后台');
		//	globalDataFn(function() {

		pushMessageList('#itemsTable1', '#itemsPager1');
		//省份
		$.each(globalData.provinceTypeList, function(index, obj) {
			optionStr += '<option value="' + obj.val + '">' + obj.key + '</option>';
		});
		$('#province').html(optionStr);
		//设备类型
		optionStr = '';
		$.each(globalData.deviceTypeList, function(index, obj) {
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.device').html(optionStr);
		//平台类型
		optionStr = '';
		$.each(globalData.platformTypeList, function(index, obj) {
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.platform').html(optionStr);
		//消息类型
		optionStr = '';
		$.each(globalData.messageTypeList, function(index, obj) {
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('#type').html(optionStr);

		//		})
		//标签页显示事件
		$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
		//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
			$(window).trigger('resize.jqGrid');
		});

		//	日期选择器绑定
		jeDate({
			dateCell: "#pageModal .sendTime",
			format: "YYYY-MM-DD hh:mm:ss",
			isTime: true
		});

		//	绑定只读的日期选择输入框一个双击清空的事件
		$(".form_datetime[readonly]").dblclick(function() {
			$(this).val('').blur();
		});

//		查询按键
			$('.itemSearch').on('click', function() {
				onSearch.call(this);
			});

	})
//function onSearch() {
//	var me = $(this),
//		box = me.parents('.tabPane'),
//		id = box.attr('id'),
//		platform = $.trim(box.find('[name="platform"]').val()),
//		device = $.trim(box.find('[name="device"]').val()),
//		table = box.find('.itemGridTable'),
//		pager = box.find('.itemGridPager');
//	var postData = {
//		platform: platform,
//		device: device
//};
//
//	pushMessageList('#itemsTable1', '#itemsPager1', postData);
//}
	//推送消息列表
	//tableId     表格ID，带有#的string类型
	//pagerId     操作栏ID，带有#的string类型
	//postData    传给服务器的参数
function pushMessageList(tableId, pagerId, postData) {
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/sns/push/message/listBy',
		colModel = [{
				label: '设备类型',
				name: 'device',
				index: 'device',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.deviceTypeList, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal || '';
				}

			}, {
				label: '平台类型',
				name: 'platform',
				index: 'platform',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.platformTypeList, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal || '';
				}

			}, {
				label: '省份',
				name: 'province',
				index: 'province',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.provinceTypeList, function(index, obj) {
						 if(cellVal == obj.val) {
							cellVal = obj.key;
                               return false;
						}else if(cellVal == null) {
							cellVal = '全国';
							return false;
						}
					});
					return cellVal || '';
				}
			}, {
				label: '发送时间',
				name: 'sendTime',
				index: 'sendTime',
				width: 100,
				align: 'center'
			}, {
				label: '标题',
				name: 'title',
				index: 'title',
				width: 100,
				align: 'center'
			}, {
				label: '内容',
				name: 'content',
				index: 'content',
				width: 100,
				align: 'center'
			}, {
				label: '消息类型',
				name: 'type',
				index: 'type',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.messageTypeList, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal || '';
				}
			}, {
				label: '活动状态',
				name: 'status',
				index: 'status',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.statusTypeList, function(index, obj) {
						 if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						} 
					});
					return cellVal || '';
				}
			}, {
				label: '操作',
				name: 'operation',
				index: '',
				width: 200,
				align: 'center',
				fixed: 'true',
				formatter: function(cellVal, cellData, rowData) {
					var str = '';
					if(rowData.status == 1) {
						str += '<button rowStr=\'' + JSON.stringify(rowData) + '\' class="btn btn-xs btn-primary" onclick="editRow(this)">编辑</button> '

					}
					str += '<button class="btn btn-xs btn-primary" onclick="deleteRow(' + rowData.id + ', ' + cellData.rowId + ')">删除</button>';
					return str;
				}
			}

		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}

//添加keyValue
function addKeyValue() {
	var modal = $("#pageModal");
	var str = '<div class="form-group xinge">' +
		'<label class="col-xs-3 control-label"></label>' +
		'<div class="col-xs-3">' +
		'<input class="form-control paramKey" name="paramKey" placeholder="请输入key">' +

		'</div>' +
		'<div class="col-xs-3">' +

		'<input class="form-control paramValue" name="paramValue" placeholder="请输入value">' +
		'</div>' +
		'<div class="col-xs-1">' +

		'<button type="button" class="btn "   onclick="addKeyValue()">+</button>' +
		'</div>' +
		'<div class="col-xs-1">' +

		'<button type="button" class="btn deleteBtn"   onclick="deleteKeyValue(this)">-</button>' +
		'</div>' +
		'</div>';
	$('#moadlMessage').append(str);
	
}
//删除keyValue
function deleteKeyValue(obj) {
	var modal = $("#pageModal");
	if(modal.find('.xinge').length<2){
		modal.find('.deleteBtn').attr('disabled',true);
		return false;
    }
	$(obj).parent().parent().remove();
	
}
//新增弹窗
function addMessageFn() {
	var modal = $("#pageModal");
	modal.modal('show');
	modal.find('input').val('');
	$('#editor1').html('');
	globalData.id = '';
	modal.find('.platform').on('change', function(e) {
		var typeId = modal.find('.platform').val();
		if(typeId == 2) {
			modal.find('.xinge').removeClass('hide');
		} else {
			modal.find('.xinge').addClass('hide');
		}
	});
	$(".xinge").nextAll(".xinge").remove();

}
//编辑弹窗
function editRow(me) {
	var modal = $("#pageModal"),
		str = '',
		btnstr;
	modal.modal('show');
	var rowData = JSON.parse($(me).attr('rowStr'));
	globalData.id = rowData.id;
	$.each(rowData, function(key, val) {
		if(modal.find('[name=' + key + ']').length > 0) {
			modal.find('[name=' + key + ']').val(val);
		}
	});

	$('#editor1').html(rowData.content || '');
	if(rowData.param){
		var param = JSON.parse(rowData.param);
	}
	if(rowData.platform == 2) {
		modal.find('.xinge').removeClass('hide');
		$.each(param, function(i, val) {
			btnstr = '<div class="col-xs-1"><button type="button" class="btn " onclick="addKeyValue()">+</button></div>'+'<div class="col-xs-1"><button type="button" class="btn deleteBtn"   onclick="deleteKeyValue(this)">-</button></div>';
				str +=
					'<div class="form-group xinge">' +
					'<label class="col-xs-3 control-label"></label>' +
					'<div class="col-xs-3">' +
					'<input class="form-control paramKey" name="paramKey" placeholder="请输入key" value="' + i + '">' +

					'</div>' +
					'<div class="col-xs-3">' +

					'<input class="form-control paramValue" name="paramValue" placeholder="请输入value" value="' + val + '">' +
					'</div>' + btnstr +
					'</div>';
		});

	$('#firstXinge').html(str);
	} else {
		modal.find('.xinge').addClass('hide');
	}
	modal.find('.platform').on('change', function(e) {
		var typeId = modal.find('.platform').val();
		if(typeId == 2) {
			modal.find('.xinge').removeClass('hide');
		} else {
			modal.find('.xinge').addClass('hide');
		}
	});
	

}
//新增推送确认
function updateMessage() {
	var _param = {},
		param = {},
		modal = $("#pageModal"),
		device = modal.find('[name=device]').val(), //设备类型
		type = modal.find('[name=type]').val(), //消息类型
		platform = modal.find('[name=platform]').val(), //平台类型
		sendTime = modal.find('[name=sendTime]').val(), //推送时间
		title = modal.find('[name=title]').val(), //标题
		content = modal.find('#editor1').html(), //内容
		province = modal.find('[name=province]').val(); //所属省份
	if(!sendTime) {
		Common.jBoxNotice('请填写推送时间', 'red');
		return false;
	}
	if(!title) {
		Common.jBoxNotice('请填写标题', 'red');
		return false;
	}
	if(!content) {
		Common.jBoxNotice('请填写推送内容', 'red');
		return false;
	}
	//param值
	$(".xinge").each(function(i, ele) {
		var paramKey = $(this).find(".paramKey").val();
		var paramValue = $(this).find(".paramValue").val();
		param[paramKey] = paramValue
	});
	//   console.log(param);
	param = JSON.stringify(param);
	if(platform == 2) {
		_param = {
			device: device,
			type: type,
			platform: platform,
			title: title,
			sendTime: sendTime,
			province: province,
			content: content,
			param: param
		};

	} else {
		_param = {
			device: device,
			type: type,
			platform: platform,
			title: title,
			sendTime: sendTime,
			province: province,
			content: content,
		};

	}
	if(globalData.id) { //编辑列表
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/push/message/update';
		_param.id = globalData.id;
		var successStr = '编辑成功',
			errorStr = '编辑失败';
	} else { //新建列表
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/push/message/add';
		successStr = '新增成功';
		errorStr = '新增失败';
	}
	Common.dataAjaxPost(_url, _param, function(data, status) {
		//		return false;
		if(data.result == 'SUCCESS') {
			Common.jBoxNotice(successStr, 'green')
			pushMessageList('#itemsTable1', '#itemsPager1');
			modal.modal('hide');

		} else {
			Common.jBoxNotice(errorStr, 'red');
		}

	});
}
//删除推送
function deleteRow(id, rowid) {
	var delUrl = Common.DOMAIN_NAME + '/ushop-web-admin/sns/push/message/delete?id=' + id,
		param = {};
	Common.jBoxConfirm('确认信息', '您确定要删除此任务吗？', function(index) {
		if(index == 1) {
			Common.dataAjaxPost(delUrl, param, function(ret, status) {
				if(ret.result == 'SUCCESS') {
					Common.jBoxNotice('删除成功', 'green');
					pushMessageList('#itemsTable1', '#itemsPager1');

				} else {
					Common.jBoxNotice('服务器请求失败', 'red');
				}
			});
		}
	});
}
//导出列表
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '消息推送列表'
	});
}