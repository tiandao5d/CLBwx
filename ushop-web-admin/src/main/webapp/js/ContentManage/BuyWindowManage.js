/**
 * 
 * BuyWindowManage.js
 * 内容管理-广告栏
 * 作者：roland
 * 
 * */
//硬性数据
var relationTypeList = [{
	desc: '商品',
	value: 1
}, {
	desc: '游戏',
	value: 2
}];
var bannerPositionList = [{
	desc: '1号位',
	value: 1
}, {
	desc: '2号位',
	value: 2
}, {
	desc: '3号位',
	value: 3
}, {
	desc: '4号位',
	value: 4
}, {
	desc: '5号位',
	value: 5
}];
var globalData = {};
globalData.deleteImg = true;
globalData.windowTypeList = [{
	desc: '商品',
	value: 1
}, {
	desc: '游戏',
	value: 2
}];
//globalData.fundTypeList=[{
//	desc: '现金',
//	value: 999
//},{
//	desc: '平台积分',
//	value: 1001
//}]
globalData.moreRelationTypeList = [{
	desc: '彩购商城',
	value: '001'
}, {
	desc: '积分专场',
	value: '002'
}, {
	desc: '彩豆抽奖',
	value: '003'
}, {
	desc: '限时特惠',
	value: '004'
}, {
	desc: '热门游戏',
	value: '005'
}];
globalData.morePagesList = [{
	desc: '有',
	value: 1
}, {
	desc: '无',
	value: 2
}];
globalData.provinceList = [{
	desc: '全国',
	value: 00
}, {
	desc: '北京市',
	value: 11
}, {
	desc: '天津市',
	value: 12
}, {
	desc: '河北省',
	value: 13
}, {
	desc: '山西省',
	value: 14
}, {
	desc: '内蒙古自治区',
	value: 15
}, {
	desc: '辽宁省',
	value: 21
}, {
	desc: '吉林省',
	value: 22
}, {
	desc: '黑龙江省',
	value: 23
}, {
	desc: '上海市',
	value: 31
}, {
	desc: '江苏省',
	value: 32
}, {
	desc: '浙江省',
	value: 33
}, {
	desc: '安徽省',
	value: 34
}, {
	desc: '福建省',
	value: 35
}, {
	desc: '江西省',
	value: 36
}, {
	desc: '山东省',
	value: 37
}, {
	desc: '河南省',
	value: 41
}, {
	desc: '湖北省',
	value: 42
}, {
	desc: '湖南省',
	value: 43
}, {
	desc: '广东省',
	value: 44
}, {
	desc: '广西壮族自治区',
	value: 45
}, {
	desc: '海南省',
	value: 46
}, {
	desc: '重庆市',
	value: 50
}, {
	desc: '四川省',
	value: 51
}, {
	desc: '贵州省',
	value: 52
}, {
	desc: '云南省',
	value: 53
}, {
	desc: '西藏自治区',
	value: 54
}, {
	desc: '陕西省',
	value: 61
}, {
	desc: '甘肃省',
	value: 62
}, {
	desc: '青海省',
	value: 63
}, {
	desc: '宁夏回族自治区',
	value: 64
}, {
	desc: '新疆维吾尔自治区',
	value: 65
}];
var dropzoneBase = { //默认配置
		previewTemplate: $('#preview-template').html(),
		addRemoveLinks: true, //上传文件可以删除
		dictDefaultMessage: '<div>请点击或拖拽上传</div><div>只接受200*200的图片</div>',
		dictFallbackMessage: '您的浏览器版本太旧',
		dictInvalidFileType: '文件类型被拒绝',
		dictFileTooBig: '文件大小{{filesize}}M，限制最大为{{maxFilesize}}M',
		dictCancelUpload: '取消上传链接',
		dictResponseError: '服务器错误，错误代码{ { statusCode } }',
		dictCancelUploadConfirmation: '是否取消',
		dictMaxFilesExceeded: '文件数量超出',
		dictRemoveFile: '删除文件'
	},
	dropzoneIcon;
jQuery(function($) {
	var optionStr = '';
	//不自动配置Dropzone
	Dropzone.autoDiscover = false;
	//配置图标上传Dropzone
	dropzoneIconFn();
	//菜单面包屑导航等配置显示
	Common.menuNavContent('广告图管理', '广告橱窗', '运营管理后台');
	globalDataFn(function(data) {
		//列表呈现
		windowList('#itemsTable1', '#itemsPager1');

		//广告栏所属模块下拉框赋值
		optionStr = '<option value="">请选择</option>';
		$.each(globalData.bannerPositionList, function(index, obj) {
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.bannerPosition').html(optionStr);
		//关联id类型
		optionStr = '<option value="">请选择</option>';
		$.each(globalData.relationTypeList, function(index, obj) {
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.relationIdType').html(optionStr);
		//省份类型
		optionStr = '<option value="">请选择</option>';
		$.each(globalData.provinceList, function(index, obj) {

			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.province').html(optionStr);
		//橱窗类型
		optionStr = '';
		$.each(globalData.windowTypeList, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.windowType').html(optionStr);
		//更多页面
		optionStr = '';
		$.each(globalData.morePagesList, function(index, obj) {
			if(index == 0) {
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.morePages').html(optionStr);
		//更多关联页面
		optionStr = '<option value="">请选择</option>';
		$.each(globalData.moreRelationTypeList, function(index, obj) {
		
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.moreRelation').html(optionStr);
     //积分类型
		optionStr = '<option value="">请选择</option>';
		$.each(globalData.fundTypeList, function(index, obj) {
		
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.fundType').html(optionStr);
	});

	//模态框消失之后，格式化模态框的相关元素或属性
	$('#pageModal').on('hide.bs.modal', function() {
		var modal = $('.pageModalItem1');
		modal.find('input, select').val('');

		dropzoneIcon.removeAllFiles();

		globalData.imageUrl = '';
		globalData.rowId = '';
		modal.find('.imgShow').html('');
		modal.find('.imgShowd').addClass('hide');
		$('#pageModal [name=Url]').val('');
	})

	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
		$(window).trigger('resize.jqGrid');
	});

	jeDate({
		dateCell: "#province .start",
		format: "YYYY-MM-DD hh:mm",
		isTime: true //isClear:false,
	});
	jeDate({
		dateCell: "#province .end",
		format: "YYYY-MM-DD hh:mm",
		isTime: true //isClear:false,
	});
	jeDate({
		dateCell: "#pageModal .start",
		format: "YYYY-MM-DD hh:mm",
		isTime: true //isClear:false,
	});
	jeDate({
		dateCell: "#pageModal .end",
		format: "YYYY-MM-DD hh:mm",
		isTime: true //isClear:false,
	});
	//绑定只读的日期选择输入框一个双击清空的事件
	$(".form_datetime[readonly]").dblclick(function() {
		$(this).val('').blur();
	});

	//橱窗查询
	$('.item1Search').on('click', function() {
		onSearch1.call(this);
	});
	//广告位查询
	$('.item2Search').on('click', function() {
		onSearch2.call(this);
	});

	//橱窗增加
	$('.item1Add').on('click', function() {
		pageModalFn('', 'add');
	});
	//广告位增加
	$('.item2Add').on('click', function() {
		windowModalFn('', 'add');
	});
	//广告位编辑确定
	$('#saveAddEdit').on('click', saveAddEditFn);
	//橱窗列表编辑点击确定事件绑定
	$('#determineClick').on('click', determineClickFn);
	$('#sync').on('click', syncFn);

});

//全局参数请求
function globalDataFn(callback) {
	callback = callback || function() {};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/getConstants';
	Common.dataAjax(_url, function(data) {
		globalData.bannerPositionList = data.postitionTypeList;
		globalData.relationTypeList = data.relationTypeList;
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/account/fundType/list';
		Common.dataAjax(_url, function(data, status) {
			if(status == 'success') {
				globalData.fundTypeList = data.recordList;
				callback.call(this, data);
			} else {
				Common.jBoxNotice('数据请求错误', 'red');
				callback.call(this, data);
			}

		});
	});
}
//
//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/banner/bannerList
//橱窗查询
function onSearch1() {
	var me = $(this),
		box = me.parents('#province'),
		id = box.attr('id'),
		province = $.trim(box.find('.province').val()),
		startDate = $.trim(box.find('.form_datetime.start').val()),
		endDate = $.trim(box.find('.form_datetime.end').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	if(startDate && endDate) {
		if(new Date(endDate).getTime() < new Date(startDate).getTime()) {
			Common.jBoxNotice('结束时间不能小于起始时间', 'red');
			return false;
		}
	} else if(startDate) {
		Common.jBoxNotice('请选择结束时间', 'red');
		return false;
	} else if(endDate) {
		Common.jBoxNotice('请选择开始时间', 'red');
		return false;
	} else {
		startDate = '';
		endDate = '';
	}
	var postData = {
		startDate: startDate,
		endDate: endDate,
		province: province
	};
	windowList('#itemsTable1', '#itemsPager1', postData);
}
//广告位查询
function onSearch2() {
	var me = $(this),
		box = me.parents('#adPosition'),
		id = box.attr('id'),
		position = $.trim(box.find('.bannerPosition').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	var postData = {
		position: position,
		isLeaf: globalData.isLeaf
	};
	BuyWindowList('#itemsTable2', '#itemsPager2', postData);
}
//橱窗列表
function windowList(tableId, pagerId, postData, reload) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/list',
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{
				label: '橱窗类型',
				name: 'windowType',
				index: 'windowType',
				width: 80,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.windowTypeList, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
			}, {
				label: '橱窗名称',
				name: 'name',
				index: 'name',
				width: 160,
				align: 'center'
			}, {
				label: '开始时间',
				name: 'beginTime',
				index: 'beginTime',
				width: 120,
				align: 'center'
			}, {
				label: '结束时间',
				name: 'endTime',
				index: 'endTime',
				width: 120,
				align: 'center'
			}, {
				label: '所属省份',
				name: 'province',
				index: 'province',
				width: 80,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.provinceList, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
			}, {
				label: '更多页面',
				name: 'morePages',
				index: 'morePages',
				width: 40,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					switch(cellVal) {
						case 1:
							return '是';
						case 2:
							return '否';
					}
				}
			}, {
				label: '橱窗排序值',
				name: 'sort',
				index: 'sort',
				width: 60,
				align: 'center'
			}, {
				label: '状态',
				name: 'status',
				index: 'status',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					switch(cellVal) {
						case 1:
							return '已启用';
						case 2:
							return '未启用';
						case 3:
							return '已过期';
					}
				}
			}, {
				label: '操作',
				name: 'operation',
				index: '',
				width: 220,
				fixed: true,
				align: 'center',
				formatter: function(val, cellval, colpos, rwdat) {
					var str = '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'window\' ' + ')">广告配置</button> ';
					str += '<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'edit\' ' + ')">编辑</button> ' +
						'<button class="btn btn-xs btn-primary" onclick="pageModalFn(' + colpos.id + ',\'delete\' ' + ')">删除</button> ';
					return str;

				}
			}
		];
	$('#gbox_itemsTable2').addClass('hide');

	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '橱窗列表');
}
//橱窗操作功能
function pageModalFn(id, typeName, rowId) {
	rowId = rowId || '';
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/get?Id=' + id;
	var modal = $('#pageModal'),
		pageModalTitle = $('.modalTitle'),
		pageModalItem2 = modal.find('.pageModalItem2'),
		pageModalItem1 = modal.find('.pageModalItem1');

	pageModalTitle.attr({
		'typeName': typeName,
		'id': id,
		'rowId': rowId
	});
	if(typeName == 'window') {
		Common.dataAjax(_url, function(data) {
			globalData.isLeaf = id;
			var postData = {
				isLeaf: globalData.isLeaf
			}
			BuyWindowList('#itemsTable2', '#itemsPager2', postData);
			strHtmlFn(data.advertisement);
		});

	}

	if(typeName == 'edit') {
		Common.dataAjax(_url, function(data) {
			pageModalTitle.html('编辑');
			strHtmlFn(data.advertisement, typeName);
			$(".delete").addClass("hide");
			$(".editMain").removeClass("hide");
		});
	} else if(typeName == 'add') {
		pageModalTitle.html('新增');
		strHtmlFn('', typeName);
		$(".delete").addClass("hide");
		$(".editMain").removeClass("hide");
		pageModalItem2.find('input').val('');

	} else if(typeName == 'delete') {
		pageModalTitle.html('删除');
		$(".delete").removeClass("hide");
		$(".editMain").addClass("hide");
		strHtmlFn();
	}
	if(typeName == 'delete' || typeName == 'add' || typeName == 'edit') {
		modal.modal('show');
		pageModalItem1.addClass('hide');
		pageModalItem2.removeClass('hide');

	}

}
//橱窗编辑赋值
function strHtmlFn(data, typeName) {

	data = data ? data : {};
	$('#determineClick').removeClass('hide');
	$('#saveAddEdit').addClass('hide');
	var modal = $('#pageModal'),
		pageModalTitle = $('.modalTitle'),
		pageModalItem2 = modal.find('.pageModalItem2'),
		windowType = data.windowType || '',
		name = data.name || '',
		morePages = data.morePages || '',
		province = data.province,
		moreRelation = data.moreRelation || '',
		pointsSpecial = data.pointsSpecial,
		sort = data.sort || '',
		beginTime = data.beginTime || '',
		endTime = data.endTime || '',
		relationId = data.relationId || '',
		fundType = data.fundType || '';
	//判断积分专场
	if(moreRelation == '002') {
		pageModalItem2.find('.morePointsSpecial').removeClass('hide');
		pageModalItem2.find('.fundTypeList').removeClass('hide');
	} else {
		pageModalItem2.find('.morePointsSpecial').addClass('hide');
		pageModalItem2.find('.fundTypeList').addClass('hide');
	}
	//判断积分专场
	pageModalItem2.find('[name=moreRelation]').on('change', function(e) {
		var pointsId = pageModalItem2.find('[name=moreRelation]').val();
		 var desc=$(".moreRelation").find("option:selected").text();
		 pageModalItem2.find('[name="name"]').val(desc);
		if(pointsId == '002') {
			pageModalItem2.find('.morePointsSpecial').removeClass('hide');
			pageModalItem2.find('.fundTypeList').removeClass('hide');
			
		} else {
			pageModalItem2.find('.morePointsSpecial').addClass('hide');
			pageModalItem2.find('.fundTypeList').addClass('hide');
		}
	});

	//判断省份给专场类型赋值
	if(province != null) {
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/activity/listBy?province=' + province;
		Common.dataAjax(_url, function(data) {
			globalData.recordList = data.recordList || '';
			typeFn();
			if(globalData.pointsSpecialType != null) {
				pageModalItem2.find('.pointsSpecial').val(pointsSpecial);
			}
		})

	}
	//查询活动列表
	pageModalItem2.find('[name=province]').on('change', function(e) {
		var provinceId = pageModalItem2.find('[name=province]').val();

		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/product/activity/listBy?province=' + provinceId;
		Common.dataAjax(_url, function(data) {
			globalData.recordList = data.recordList || '';
			typeFn();
		})

	});

	pageModalItem2.find('[name="windowType"]').val(windowType);
	pageModalItem2.find('[name="morePages"]').val(morePages);
	pageModalItem2.find('[name="name"]').val(name);
	pageModalItem2.find('[name="province"]').val(province);
	pageModalItem2.find('[name="moreRelation"]').val(moreRelation);

	pageModalItem2.find('[name="relationId"]').val(relationId);
	pageModalItem2.find('[name=beginTime]').val(beginTime);
	pageModalItem2.find('[name=endTime]').val(endTime);
	pageModalItem2.find('[name=sort]').val(sort);
	pageModalItem2.find('[name=fundType]').val(fundType);

	//获取时间传给广告位
	var _param = {
		beginTime: pageModalItem2.find('[name="beginTime"]').val(),
		endTime: pageModalItem2.find('[name="endTime"]').val(),
		windowType: pageModalItem2.find('[name="windowType"]').val(),
		province: pageModalItem2.find('[name="province"]').val()
	}
	globalData.beginTime = _param.beginTime;
	globalData.endTime = _param.endTime;
	globalData.windowType = _param.windowType;
	globalData.province = _param.province;
}
//橱窗确定功能
function determineClickFn() {
	var _url = '',
		_param = {},
		pageModalTitle = $('.modalTitle'),
		typeName = pageModalTitle.attr('typeName'),
		id = pageModalTitle.attr('id'),
		rowId = pageModalTitle.attr('rowId'),
		modal = $('#pageModal'),
		pageModalItem2 = modal.find('.pageModalItem2');
	if(typeName == 'delete') {
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/delete';
		var title = '提示',
			content = '此删除会将该橱窗所有广告位删除，确定删除吗？';
		Common.jBoxConfirm(title, content, function() {
			if(arguments[0] == 1) {
				Common.dataAjaxPost(_url, {
					id: id
				}, function(data) {
					if(data.data == 'SUCCESS') {
						Common.jBoxNotice('删除成功', 'green');
						$('#itemsTable1').delRowData(rowId);
						modal.modal('hide');
						windowList('#itemsTable1', '#itemsPager1');
					} else {
						Common.jBoxNotice('删除失败', 'red');

						modal.modal('hide');
					}
				});
			}
		});
		return false;
	}
	_param = {
		windowType: pageModalItem2.find('.windowType').val(),
		name: pageModalItem2.find('[name=name]').val(),
		beginTime: pageModalItem2.find('[name=beginTime]').val(),
		endTime: pageModalItem2.find('[name=endTime]').val(),
		relationId: pageModalItem2.find('[name=relationId]').val(),
		province: pageModalItem2.find('.province').val(),
		moreRelation: pageModalItem2.find('.moreRelation').val(),
		pointsSpecial: pageModalItem2.find('.pointsSpecial').val(),
		sort: pageModalItem2.find('.sort').val(),
		relationType: 0,
		fundType:pageModalItem2.find('.fundType').val(),
		morePages: pageModalItem2.find('.morePages').val()
	}
	console.log(_param);
	if(!_param.windowType) {
		Common.jBoxNotice('请选择所属橱窗类型', 'red');
		return false;
	}

	if(!_param.name) {
		Common.jBoxNotice('请输入橱窗名称', 'red');
		return false;
	}
	if(!_param.province) {
		Common.jBoxNotice('请选择省份', 'red');
		return false;
	}
	if(!/^\+?[1-9]\d*$/.test(_param.sort)) {
		Common.jBoxNotice('橱窗排序值为正整数', 'red');
		return false;
	}
	if(!_param.morePages) {
		Common.jBoxNotice('请选择有无更多页面', 'red');
		return false;
	}
	//	if(!/^\+?[1-9]\d*$/.test(_param.relationId)) {
	//		Common.jBoxNotice('更多关联ID为正整数', 'red');
	//		return false;
	//	}
	if(!_param.beginTime) {
		Common.jBoxNotice('请输入开始时间', 'red');
		return false;
	}
	if(!_param.endTime) {
		Common.jBoxNotice('请输入结束时间', 'red');
		return false;
	}
	if(_param.beginTime && _param.endTime) {
		if(new Date(_param.endTime).getTime() < new Date(_param.beginTime).getTime()) {
			Common.jBoxNotice('结束时间不能小于起始时间', 'red');
			return false;
		}
	}
	if(typeName == 'edit') {
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/edit?id=' + id;
	} else if(typeName == 'add') {
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/add';
	}
	Common.dataAjaxPost(_url, _param, function(data) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice('操作成功', 'green');
			modal.find('input').val('');
			modal.find('select').val('');
			modal.modal('hide');
			windowList('#itemsTable1', '#itemsPager1')
		} else {
			Common.jBoxNotice('操作失败', 'red');
			return false
		}
	});
}
//广告位列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给后台的参数
//http://10.35.0.66:8080/ushop-web-admin/banner/bannerList
function BuyWindowList(tableId, pagerId, postData, reload) {

	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/list',

		colModel = [{
				label: '所属广告位',
				name: 'position',
				index: 'position',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.bannerPositionList, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
			}, {
				label: '商品图片',
				name: 'imageUrl',
				index: 'imageUrl',
				width: 140,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					if(Common.oldImage.test(cellVal)) {
						var str = '<img width="100" src="' + (Common.IMAGE_URL + cellVal) + '">';
					} else {
						var str = '<img width="100" src="' + cellVal + '">';
					}
					return str;
				}
			}, {
				label: '商品名称',
				name: 'name',
				index: 'name',
				width: 100,
				align: 'center'
			}, {
				label: '广告语',
				name: 'content',
				index: 'content',
				width: 100,
				align: 'center'
			}, {
				label: '关联ID',
				name: 'relationId',
				index: 'relationId',
				width: 60,
				align: 'center'
			}, {
				label: '操作',
				name: 'operation',
				index: '',
				fixed: true,
				width: 140,
				align: 'center',
				formatter: function(val, cellval, colpos, rowData) {

					var str = '<button class="btn btn-xs btn-primary" onclick="windowModalFn(' + colpos.id + ',\'edit\' ' + ')">编辑</button> ';
					if(colpos.status != 1) {
						str += '<button class="btn btn-xs btn-primary" onclick="windowModalFn(' + colpos.id + ',\'delete\' ' + ')">删除</button> ';
					}
					return str;

				}
			}

		];
	$('#gbox_itemsTable1').addClass('hide');
	$('#gbox_itemsTable2').removeClass('hide');
	$('#adPosition').removeClass('hide');
	$('#province').addClass('hide');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '广告位列表');
}
//广告位操作
function windowModalFn(id, typeName, rowId) {
	rowId = rowId || '';
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/get?Id=' + id;
	var modal = $('#pageModal'),
		pageModalTitle = $('.modalTitle'),
		pageModalItem2 = modal.find('.pageModalItem2'),
		pageModalItem1 = modal.find('.pageModalItem1');
	modal.modal('show');
	pageModalItem1.removeClass('hide');
	pageModalItem2.addClass('hide');
	pageModalTitle.attr({
		'typeName': typeName,
		'id': id,
		'rowId': rowId
	});
	if(typeName == 'edit') {
		Common.dataAjax(_url, function(data) {
			var id = data.id;
			pageModalTitle.html('编辑');
			strHtmlWindowFn(data.advertisement, typeName);
			$(".delete").addClass("hide");
			$(".editMain").removeClass("hide");
		});
	} else if(typeName == 'add') {
		pageModalTitle.html('新增');
		strHtmlWindowFn('', typeName);
		$(".delete").addClass("hide");
		$(".editMain").removeClass("hide");
		//		if(globalData.windowType == 2) {
		//			pageModalItem1.find('.imgChange').removeClass('hide');
		//			pageModalItem1.find('.imgshow').addClass('hide');
		//		} else {
		//			pageModalItem1.find('.imgChange').addClass('hide');
		//			pageModalItem1.find('.imgshow').removeClass('hide');
		//		}
		pageModalItem1.find('.relationIdType').on('change', function(e) {
			var typeId = pageModalItem1.find('.relationIdType').val();
			if(typeId == 2) {
				pageModalItem1.find('.imgChange').removeClass('hide');
				pageModalItem1.find('.imgshow').addClass('hide');
			} else {
				pageModalItem1.find('.imgChange').addClass('hide');
				pageModalItem1.find('.imgshow').removeClass('hide');
			}
		});
	} else if(typeName == 'delete') {
		pageModalTitle.html('删除');
		$(".delete").removeClass("hide");
		$(".editMain").addClass("hide");
		strHtmlWindowFn();
	}

}
//广告位编辑内容赋值
function strHtmlWindowFn(data, typeName) {
	data = data ? data : {};
	$('#determineClick').addClass('hide');
	$('#saveAddEdit').removeClass('hide');
	var modal = $('#pageModal'),
		pageModalTitle = $('.modalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	globalData.rowId = data.id;

	pageModalItem1.find('[name=productName]').val(data.name || '');
	pageModalItem1.find('[name=content]').val(data.content || '');
	pageModalItem1.find('[name=bannerPosition]').val(data.position || '');
	var color = data.colorValue || '';
	color = color.replace('#', '');
	pageModalItem1.find('.jscolor').val(color);
	pageModalItem1.find('[name=relationIdType]').val(data.relationType || '');
	pageModalItem1.find('[name=relationId]').val(data.relationId || '');
	pageModalItem1.find('[name=relationIdType]').on('change', function(e) {
		var typeId = pageModalItem1.find('[name=relationIdType]').val();
		if(typeId == 2) {
			pageModalItem1.find('.imgShowd').removeClass('hide');
			pageModalItem1.find('.imgChange').removeClass('hide');
			pageModalItem1.find('.imgShow').addClass('hide');
			$("#sync").addClass("hide");
			$(".shopPrice").addClass("hide");
		} else if(typeId == 3) {
			pageModalItem1.find('.imgChange').addClass('hide');
			$("#sync").removeClass("hide");
			$(".shopPrice").removeClass("hide");
			pageModalItem1.find('.imgShow').removeClass('hide');
			pageModalItem1.find('.imgShowd').removeClass('hide');
		} else {
			pageModalItem1.find('.imgShowd').addClass('hide');
			$("#sync").addClass("hide");
			$(".shopPrice").addClass("hide");
		}
	});
	if(data.relationType == 2) {
		pageModalItem1.find('.imgShowd').removeClass('hide');
		pageModalItem1.find('.imgChange').removeClass('hide');
		pageModalItem1.find('.imgShow').addClass('hide');
		$("#sync").addClass("hide");
		$(".shopPrice").addClass("hide");
	} else if(data.relationType == 3) {
		pageModalItem1.find('.imgChange').addClass('hide');
		$("#sync").removeClass("hide");
		$(".shopPrice").removeClass("hide");
		pageModalItem1.find('.imgShow').removeClass('hide');
		pageModalItem1.find('.imgShowd').removeClass('hide');
	} else {
		pageModalItem1.find('.imgShowd').addClass('hide');
		$("#sync").addClass("hide");
		$(".shopPrice").addClass("hide");
	}
	pageModalItem1.find('.imgShow').html('');
	pageModalItem1.find('.price').val('');
	pageModalItem1.find('.points').val('');

}
//广告位确定按钮
function saveAddEditFn() {
	var _url = '',
		_param = {},
		pageModalTitle = $('.modalTitle'),
		typeName = pageModalTitle.attr('typeName'),
		id = pageModalTitle.attr('id'),
		rowId = pageModalTitle.attr('rowId'),
		modal = $('#pageModal'),
		pageModalItem1 = modal.find('.pageModalItem1'),
		color = '#' + pageModalItem1.find('.jscolor').val();
	if(typeName == 'delete') {
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/delete';
		Common.dataAjaxPost(_url, {
			id: id
		}, function(data) {
			if(data.data == 'SUCCESS') {
				Common.jBoxNotice('删除成功', 'green');
				$('#itemsTable2').delRowData(rowId);
				modal.modal('hide');
				var postData = {
					isLeaf: globalData.isLeaf
				}
				BuyWindowList('#itemsTable2', '#itemsPager2', postData);
			}

		});
		return false;
	}
	if(typeName == 'edit') {
		_param = {
			imageUrl: '',
			sort: 0,
			position: pageModalItem1.find('[name=bannerPosition]').val(),
			relationId: pageModalItem1.find('[name=relationId]').val(),
			name: pageModalItem1.find('[name=productName]').val(),
			colorValue: color,
			relationType: pageModalItem1.find('[name=relationIdType]').val(),
			content: pageModalItem1.find('[name=content]').val(),
			rule: ''

		}
	} else if(typeName == 'add') {
		_param = {
			imageUrl: '',
			sort: 0,
			position: pageModalItem1.find('[name=bannerPosition]').val(),
			relationId: pageModalItem1.find('[name=relationId]').val(),
			name: pageModalItem1.find('[name=productName]').val(),
			colorValue: color,
			relationType: pageModalItem1.find('[name=relationIdType]').val(),
			content: pageModalItem1.find('[name=content]').val(),
			beginTime: globalData.beginTime,
			endTime: globalData.endTime,
			windowType: globalData.windowType,
			province: globalData.province,
			rule: ''

		}
	}
	if(_param.relationType == 2) {
		_param.imageUrl = $('#pageModal [name=URL]').val();
		_param.rule = '';
	} else if(_param.relationType == 3) {
		_param.imageUrl = globalData.imageUrl;
		_param.rule = globalData.rule;
	}
	if(!_param.position) {
		Common.jBoxNotice('请选择所属广告位', 'red');
		return false;
	}
	if(!_param.name) {
		Common.jBoxNotice('请输入商品名称', 'red');
		return false;
	}

	if(!_param.content) {
		Common.jBoxNotice('请输入广告语', 'red');
		return false;
	}
	if(_param.content.length > 6) {
		Common.jBoxNotice('广告语不超过6个字', 'red');
		return false;
	}
	if(_param.colorValue == '#') {
		Common.jBoxNotice('请选择广告语颜色', 'red');
		return false;
	}
	if(!_param.relationId) {
		Common.jBoxNotice('请输入关联ID', 'red');
		return false;
	}
	if(typeName == 'edit') {
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/edit?id=' + id;
	} else if(typeName == 'add') {
		_url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/add?isLeaf=' + globalData.isLeaf;
	}
	Common.dataAjaxPost(_url, _param, function(data) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice('操作成功', 'green');
			modal.find('input').val('');
			modal.find('select').val('');
			modal.modal('hide');
			var postData = {
				isLeaf: globalData.isLeaf
			}
			BuyWindowList('#itemsTable2', '#itemsPager2', postData);
		} else {
			Common.jBoxNotice('操作失败', 'red');
			return false
		}
	});
}
//同步功能
function syncFn() {
	var modal = $('#pageModal'),
		pageModalTitle = $('.modalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1'),
		relationId = pageModalItem1.find('[name=relationId]').val();
	if(!relationId) {
		Common.jBoxNotice('请输入关联ID', 'red');
		return false;
	}
	_url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/sync?relationId=' + relationId;
	Common.ajax(_url, 'get', {}, function(data) {
		if(data.data == 'SUCCESS' && data.imageUrl) {
			//上传缩略图，获取新的图片地址
			copyImgFn([{oldimg: data.imageUrl}], function(urlArr){
				console.log(urlArr)
				globalData.imageUrl = urlArr[0] || '';
				if(data.rule) {
					globalData.rule = data.rule || '';
					var ruleDetail = '',
						ruleList = [];
					ruleDetail = JSON.parse(data.rule);
					$.each(ruleDetail, function(index, obj) {
						if(obj.flag == 1) {
							if(obj.currencys.length == 2) {
	
								ruleList[ruleList.length] = {
									price: obj.currencys[0].value,
									points: obj.currencys[1].value
								}
							} else {
								if(obj.currencys[0].type == 999) {
									ruleList[ruleList.length] = {
										price: obj.currencys[0].value,
										points: 0
									}
								} else {
									ruleList[ruleList.length] = {
										price: 0,
										points: obj.currencys[0].value
									}
								}
	
							}
	
						}
					})
					pageModalItem1.find('[name=price]').val(ruleList[0].price);
					pageModalItem1.find('[name=points]').val(ruleList[0].points);
				} else {
					globalData.rule = data.productPrice;
					pageModalItem1.find('[name=price]').val(data.productPrice);
					pageModalItem1.find('[name=points]').val(0);
				}
				if(globalData.imageUrl) {
					var imageShow = '<span class="fa-stack fa-lg bigger-150">' +
						'<i class="fa fa-circle fa-stack-2x white"></i>' +
						'</span>' + '<img width="100" src="' + globalData.imageUrl + '">';
					pageModalItem1.find('.imgShow').html(imageShow);
				}
			});
		} else if(data.failed == "can't find the goods") {
			Common.jBoxNotice('找不到该商品或图片', 'red');
			return false;
		}
	});

}
//图标上传
function dropzoneIconFn() {
	var delImgUrl = Common.DOMAIN_NAME + '/ushop-web-admin/file/delete';
	var url1 = '/ushop-web-admin/file/add';
	Common.formatUrl(url1, function(newUrl) {
		//上传图标
		dropzoneIcon = new Dropzone('#dropzoneModalImg', $.extend(dropzoneBase, {
			url: newUrl, //Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/addPicture',
			method: 'post',
			maxFiles: 1, //最大上传文件数量
			maxFilesize: 0.5, //最大上传文件大小
			dictDefaultMessage: '<div>请点击或拖拽上传</div><div>只接受720*145的0.5M以内的图片</div>',
			acceptedFiles: '.png,.jpg', //文件格式限制
			paramName: "file",
			autoQueue: false
		}));
		dropzoneIcon.on('success', function(_file, ret) {
			var me = this,
				acceptedFiles = me.getAcceptedFiles();
			imgUrlArr = [];
			$.each(acceptedFiles, function(index, obj) {
				imgUrlArr.push($.parseJSON(obj.xhr.response).url);
			});
			$('#pageModal [name=URL]').val(imgUrlArr.join(''));
			Common.jBoxNotice('上传成功', 'green');
		});
		dropzoneIcon.on('removedfile', function(_file) {
			var _fileXhr = _file.xhr || '';
			if(_fileXhr) {
				var imgUrl = $.parseJSON(_fileXhr.response).url;
				Common.dataAjaxPost(delImgUrl, {
					url: imgUrl
				}, function(data) {
					if(data.data == 'SUCCESS') {
						Common.jBoxNotice('删除成功', 'green');
					}
				});
			}
		});
		dropzoneIcon.on("addedfile", function(_file) {
			dropzoneIcon.options.url = newUrl; //Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/addPicture';
			var me = this,
				acceptedFiles = me.getAcceptedFiles();
			if(acceptedFiles.length < 1) {
				$(_file.previewElement).find('.dz-image img').on('load', function() {
					if(_file.width == 720 && _file.height == 145) {
						me.enqueueFile(_file);
					} else {
						Common.jBoxNotice('图片的宽高必须是720*145', 'red');
						me.removeFile(_file);
					};
				});
			} else {
				Common.jBoxNotice('图标只能上传一张', 'red');
				me.removeFile(_file);
			}
		});
	});
}
//删图
//function deleteIconImg(e){
//	var iconUrl=$(e).parent().next('img').attr('src');
//	var imageUrl = iconUrl;//.replace(Common.IMAGE_URL,'');
//	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/sns/advertisement/deletePicture';
//	if(globalData.imgurlde){return false;}
//	Common.jBoxConfirm('确认信息', '您确定要删除此图片吗？', function(index){
//		if(index == 1){
//			Common.dataAjaxPost(_url,{URL:imageUrl},function(data){
//				if(data.data == 'SUCCESS'){
//					Common.jBoxNotice('该图标删除成功','green');
//					$(e).parent().parent().remove();
//					globalData.imgurlde = true;
//				}else{
//					Common.jBoxNotice('该图标删除失败','red');	
//					globalData.imgurlde = false;
//				}
//			});
//		}
//	});
//}
//返回
function goBackTo() {
	$("#adPosition").addClass('hide');
	$("#province").removeClass('hide');
	windowList('#itemsTable1', '#itemsPager1');
}
//导出excel表格
function toExcel(n) {
	var param = {
		type: 'excel',
		escape: 'false'
	}
	var b = $('#fundType .couponsHide').hasClass('hide');
	b && (n = 2);
	switch(n) {
		case 1:
			param.fileName = '橱窗列表';
			param.aId = 'exportExcel2';
			break;
		case 2:
			param.fileName = '广告位列表';
			param.aId = 'exportExcel';
			break;
	}
	$('#gview_itemsTable' + n).tableExport(param);
}

function typeFn() {
	globalData.pointsSpecialType = [];
	var optionStr = '';
	$.each(globalData.recordList, function(index, obj) {

		globalData.pointsSpecialType[globalData.pointsSpecialType.length] = {
			desc: obj.name,
			value: obj.id
		}
	})
	$.each(globalData.pointsSpecialType, function(index, obj) {
		optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
	});
	$('.pointsSpecial').html(optionStr);
}


//复制网络图片
//_url 网络图片的地址
function copyImgFn(urlArr, callback){
	callback = callback || function(){};
	if(!($.isArray(urlArr) && urlArr.length > 0)){
		callback([]);//直接返回空数组
		return false;
	}
	var arr = new Array(urlArr.length).fill(null);
	//上传一张图片
	function upimg(imgurl, cb){
		cb = cb || function(){};
		convertImgToBase64(imgurl, 0, 0, 200, function(imgB64){
			var _url = Common.DOMAIN_NAME + '/ushop-web-admin/file/add';
			var fd = new FormData();
			fd.append('file', convertBase64UrlToBlob(imgB64), 'img.jpg');
			Common.ajax({
				url: _url,
				type: 'post',
				data: fd,
				processData: false,
				contentType: false
			}, function(data){
				cb((data['url'] || ''));
			});
		});
	}
	//判断是否上传完成
	function cbfn(){
		var istrue = true;
		$.each(arr, function(index, imgurl){
			if(imgurl === null){
				istrue = false;
				return false;
			}
		});
		if(istrue){
			callback(arr);
		}
	}
	//循环上传图片
	$.each(urlArr, function(index, obj){
		if(obj.newimg){//已经被转换过了
			arr[index] = obj.newimg;
			cbfn();
		}else if(obj.oldimg){
			upimg(obj.oldimg, function(newIu){
				arr[index] = newIu;
				cbfn();
			});
		}else{
			arr[index] = '';
			cbfn();
		}
	});
}
//将指定地址的图片转为base64文件，只会转为jpeg，不支持png，png图片文件太大，无法压缩
//url: 图片地址
//newWidth: 缩放后新图片的宽度，单位px
//newHeight: 缩放后新图片的高度，单位px
//如果只有宽或者高，将按给出的宽或高等比缩放，如果都没有则不缩放
//maxSize：新图片的最大内存大小，单位kb
//callback：回调函数，参数为新图片的base64字符串
//图片传输方法的示例
//convertImgToBase64('images/115.jpg', 100, 100, 10, function(imgB64){
//	var fd = new FormData();
//	fd.append('file', convertBase64UrlToBlob(imgB64), 'img.jpeg');
//	ajax({
//		url: _url,
//		type: 'post',
//		data: fd,
//		processData: false
//	}, function(){
//		console.log(arguments)
//	});
//});
function convertImgToBase64(url, newWidth, newHeight, maxSize, callback) {
	var img = new Image;
	img.crossOrigin = 'Anonymous';
	img.src = url;
	img.onload = function() {
		var cw = parseInt(newWidth),//表示画布宽度，也就是新图片的宽度
			ch = parseInt(newHeight),//表示画布的高度，也就是新图片的高度
			cw_ch,
			iw = this.width,//记录图片的宽度
			ih = this.height,//记录图片的高度
			iw_ih = iw/ih,
			canvas = document.createElement('canvas'),//创建canvas元素
			ctx = canvas.getContext('2d'),
			quality = 0.8,//保存图片质量，如果超出限制，将会循环减小质量直到0
			dataURL,//用来记录base64的字符串
			isTrue = true,//用来判断是否超出最大KB数
			sw = iw, sh = ih,//用来记录最大能够裁剪的宽高
			ix = 0, iy = 0;//规定裁剪的位置
		maxSize = parseInt(maxSize);//最大限制的kb
		if(!cw && !ch){//没有指定新的宽高
			cw = iw;
			ch = ih;
		}else if(cw && !ch){//没有指定新的高度
			ch = cw/iw_ih;
		}else if(!cw && newHeight){//没有指定新的宽度
			cw = ch*iw_ih;
		}
		cw_ch = cw/ch;
		canvas.width = cw;
		canvas.height = ch;
		if(iw_ih > cw_ch){
			sw = ih*cw_ch;
		}else{
			sh = iw/cw_ch;
		}
		ix = (iw - sw)/2;
		iy = (ih - sh)/2;
		ctx.drawImage(img, ix, iy, sw, sh, 0, 0, cw, ch);
		dataURL = canvas.toDataURL('image/jpeg', quality);
		if(maxSize){
			while(isTrue){
				if(imgSizeFn(dataURL)/1024 > maxSize){
					quality -= 0.1;
					dataURL = canvas.toDataURL('image/jpeg', quality);
				}else{
					isTrue = false;
				}
				if(quality <= 0){
					isTrue = false;
				}
			}
		}
		callback.call(this, dataURL);
		canvas = null;
	};
}

//将base64文件转为文件流
function convertBase64UrlToBlob(base64Url){
	//去掉url的头，并转换为byte
    var bytes = window.atob(base64Url.indexOf(',') > 0 ? base64Url.split(',')[1] : base64Url);
    //处理异常,将ascii码小于0的转换为大于0  
    var ab = new ArrayBuffer(bytes.length);  
    var ia = new Uint8Array(ab);  
    for (var i = 0; i < bytes.length; i++) {  
        ia[i] = bytes.charCodeAt(i);  
    }
    return new Blob( [ab] , {type : 'image/jpeg'});  
}
//获取base64文件大小，返回值为字节(b)
function imgSizeFn(base64Url){
    var str = base64Url.indexOf(',') > 0 ? base64Url.split(',')[1] : base64Url,
		equalIndex = str.indexOf('=');
	if(equalIndex > 0){
	    str = str.substring(0, equalIndex);
	}
	var strLength = str.length,
		fileLen = parseInt(strLength - (strLength/8)*2);
	return fileLen;
}
