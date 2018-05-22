/**
 * 
 * luckydrawlist.js
 * 抽奖活动-抽奖活动列表
 * 作者：xulin
 * 
 * */

//硬性数据
"use strict";
var globalData = {};
//彩票省份对比
globalData.provinceArr = [
	// {val: '00', key: '全国'},
	{
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
	}
];
//期次和游戏的共用状态
globalData.gameStatusArr = [{
		val: -2,
		key: '废弃'
	}, {
		val: -1,
		key: '暂停'
	}, {
		val: 1,
		key: '准备中'
	}, //不可见
	{
		val: 2,
		key: '运行中'
	}, {
		val: 3,
		key: '揭晓中'
	}, {
		val: 4,
		key: '已揭晓'
	}, {
		val: 5,
		key: '无人中奖'
	}
];

//奖品类型
globalData.gameTypeArr = [{
	val: '1',
	key: '实体类'
}, {
	val: '2',
	key: '充值类'
}, {
	val: '3',
	key: '劵码类'
}];
//触发类型
globalData.triggerTypeArr = [{
	val: '1',
	key: '投注'
}, {
	val: '2',
	key: '注册'
}];
//票面状态
globalData.gameTicketSArr = [{
	val: '-1',
	key: '废弃'
}, {
	val: '1',
	key: '未开奖'
}, {
	val: '2',
	key: '未中奖'
}, {
	val: '3',
	key: '已中奖'
}, {
	val: '6',
	key: '已弃奖'
}];

$(function() {
	//菜单面包屑导航等配置显示
	Common.menuNavContent('抽奖游戏', '游戏列表', '抽奖游戏后台');

	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
		$(window).trigger('resize.jqGrid');
	});

	//富文本编辑框初始化
	$('#ace_wysiwyg_box').ace_wysiwyg({
		toolbar: [
			'fontSize',
			null,
			'bold',
			'italic',
			'strikethrough',
			'underline',
			null,
			'justifyleft',
			'justifycenter',
			'justifyright',
			'justifyfull',
			null,
			'unlink',
			null,
			'insertImage',
			null,
			'foreColor',
			null,
			'undo',
			'redo'
		]
	}).prev().addClass('wysiwyg-style2');

	//文本编辑模态框相关事件监听
	$('#ace_wysiwyg_modal').on('show.bs.modal', function(e) {
		var $me = e.relatedTarget ? $(e.relatedTarget) : $('input:focus'),
			val = $me.val() || '';
		globalData.showWysiwygEle = $me;
		//		$('#ace_wysiwyg_box').html(decodeURIComponent($me.val()));
		//注释中为html内容编译后返回，此处没有编译似乎不会有问题
		$('#ace_wysiwyg_box').html(val);
	}).find('.save_btn').on('click', function() {
		//		var str = encodeURIComponent($('#ace_wysiwyg_box').html());
		//如果上面为编译后的，那么这里就要先解码
		var str = $('#ace_wysiwyg_box').html();
		globalData.showWysiwygEle.val(str);
	});

	//点击新增，显示新增相应界面
	$('.addluckydraw').on('click', function() {

		globalData.localA = JSON.parse(localStorage.getItem("A")); //点击生成奖等保存的数据
		globalData.localB = JSON.parse(localStorage.getItem("B")); //点击下一步保存的数据
		globalData.localC = JSON.parse(localStorage.getItem("C")); //点击创建时保存的数据
		globalData.ctYz = true;
		pageChangeFn('luckydrawpage', 'newaddluckydraw');
		$('#createluckybox').find('.createlucky1').show();
		if(!globalData.localA) {
			$('#levelwidgetbox').html('');
			$('#issuewidgetbox').html('');
			$('#createluckybox').find('input').val('');
			$("#awardingTime").addClass('hide');
			$("#awardingTime").find('input').val('');
		} else {
			globalData.luckyDrawData = globalData.localA;
			bindDatePicker($("#awardingTime").find('[data-date-index]'), $("#awardingTime"));
			var box = $('#createluckybox');
			box.find('.name').val(globalData.localA.name || ''); //游戏名
			box.find('.remark').val(globalData.localA.remark || ''); //游戏描述
			box.find('.parvalue').val(globalData.localA.parValue.toString() || ''); //游戏投注金额
			box.find('.playtype').val(globalData.localA.playType.toString() || '');
			box.find('.prizecount').val(globalData.localA.prizeCount || ''); //游戏奖等数量
			box.find('.province').val(globalData.localA.province || '');
			box.find('.triggerType').val(globalData.localA.triggerType || '');
			box.find('.partype').val(globalData.localA.parType || '');
			var num = parseInt(globalData.localA.prizeCount);
			var str = '',
				i = 0,
				parent = $('#levelwidgetbox');

			if(!(num > 0)) {
				return false;
			}
			if(!globalData.localB) {
				
			} else {
				$('#awardingTime').removeClass('hide');
				globalData.luckyDrawData.prizes = globalData.localB;
				for(; i < num; i++) {
					str += getLevelStrFn((i + 1), globalData.localB[i], '');
				}
				str += '<div style="height: 20px;" class="col-xs-12"></div>' +
					'<div class="col-xs-12">' +
					'<div class="col-xs-offset-3 col-xs-3">' +
					'<button class="btn btn-info btn-block btn-lg" onclick="pageChangeFn(\'luckydrawpage\', \'luckydrawlist\')">返回</button>' +
					'</div>' +
					'<div class="col-xs-3">' +
					'<button class="btn btn-info btn-block btn-lg" onclick="levelDataFn()">下一步</button>' +
					'</div>' +
					'</div>';
				parent.html(str);
				bindDatePicker(parent.find('.datePicker'));
				bindFileInput(parent.find('.url'));
				parent.find('.url').each(function(index, ele) {
					var $me = $(ele);
					$me.data('file_url', $me.attr('file_url'));
				});
			}
			if(!globalData.localC) {
				
			} else {
				pageChangeFn('setwidgetbox', 'issuewidgetbox');
				createIssueWidget($('#issuewidgetbox'));
			}

		}

	});

	//省份显示
	getKeyValStr(globalData.provinceArr, $('.provinceSelect'));
	getKeyValStr(globalData.triggerTypeArr, $('.triggerTypeSelect'));
	//资金类型显示
	getFundType();

	//获取活动列表
	getLuckDrawListFn('#itemstable1', '#itemspager1');
});
//生成奖等
function createLuckyFn() {
	var box = $('#createluckybox');
	var a = { //游戏数据格式
		prizeCount: parseInt(box.find('.prizecount').val()), //游戏奖等数量
		parValue: box.find('.parvalue').val(),
		name: box.find('.name').val(),
		remark: box.find('.remark').val(),
		playType: box.find('.playtype').val()
	};
	globalData.luckyDrawData = a; //定义此数据对象为全局对象，以便于后期传输操作等
	if(!a.prizeCount || a.prizeCount <1) {
		bootsToast(box.find('.prizecount'), '<span style="color: #ff961a">请输入正确的奖等数量</span>');
		return false;
	}
	if(!a.name) {
		bootsToast(box.find('.name'), '<span style="color: #ff961a">请输入游戏名称</span>');
		return false;
	}
	if(!a.remark) {
		bootsToast(box.find('.remark'), '<span style="color: #ff961a">请输入游戏描述</span>');
		return false;
	}
	if(!a.playType || a.playType < 0) {
		bootsToast(box.find('.playtype'), '<span style="color: #ff961a">请输入玩法类型</span>');
		return false;
	}
	if(!a.parValue || a.parValue < 0 || a.parValue.length > 18) {
		bootsToast(box.find('.parvalue'), '<span style="color: #ff961a">请输入正确投注金额</span>');
		return false;
	}
	pageChangeFn('setwidgetbox', 'levelwidgetbox');
	$('#awardingTime').removeClass('hide');
	createLevelWidget(a.prizeCount, $('#levelwidgetbox'));
	bindDatePicker($("#awardingTime").find('[data-date-index]'), $("#awardingTime"));
	//本地保存生成奖等数据
	globalData.localCreate = { //游戏数据格式
		prizeCount: parseInt(box.find('.prizecount').val()), //游戏奖等数量
		parValue: box.find('.parvalue').val(),
		name: box.find('.name').val(),
		remark: box.find('.remark').val(),
		playType: box.find('.playtype').val(),
		triggerType: box.find('.triggerType').val(),
		province: box.find('.province').val(),
		parType: box.find('.partype ').val()

	};
	rmStorageLAll();
	storageL('A', JSON.stringify(globalData.localCreate));

	//	});
}

//抽奖游戏列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
//http://xxxx/ushop-web-admin/lotto/game/listBy
function getLuckDrawListFn(tableId, pagerId, postData) {
	var listTitle = $('[href=#' + $(tableId).parents('.tabpane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/lotto/game/listBy',
		colModel = [{
				label: 'ID',
				name: 'id',
				index: 'id',
				width: 100,
				align: 'center'
			}, {
				label: '名字',
				name: 'name',
				index: 'name',
				width: 100,
				align: 'center'
			},
			//			{label: '描述',name:'remark',index:'remark',width:100, align: 'center'},
			{
				label: '省份',
				name: 'province',
				index: 'province',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					var str = '';
					$.each(globalData.provinceArr, function(index, obj) {
						if(obj.val == cellVal) {
							str = obj.key;
							return false;
						}
					});
					return str;
				}
			}, {
				label: '游戏玩法',
				name: 'playType',
				index: 'playType',
				width: 140,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					return cellVal;
				}
			}, {
				label: '投注货币类型',
				name: 'parType',
				index: 'parType',
				width: 120,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					return cellVal;
				}
			}, {
				label: '投注金额',
				name: 'parValue',
				index: 'parValue',
				width: 120,
				align: 'center'
			}, {
				label: '奖等数量',
				name: 'prizeCount',
				index: 'prizeCount',
				width: 80,
				align: 'center'
			}, {
				label: '状态',
				name: 'status',
				index: 'status',
				width: 100,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					var str = '';
					$.each(globalData.gameStatusArr, function(index, obj) {
						if(obj.val == cellVal) {
							str = obj.key;
							return false;
						}
					});
					return str;
				}
			}, {
				label: '操作',
				name: 'operation',
				index: '',
				width: 200,
				align: 'center',
				fixed: 'true',
				formatter: function(cellVal, cellData, rowData) {
					var dd = encodeURIComponent(JSON.stringify(rowData)).replace(/\'/g, '');
					var str = '<button class="btn btn-xs btn-primary" onclick="editGameInit(\'' + dd + '\')">编辑</button> ';
					return str;
				}
			}
		];
	//数据重新呈现，先解除绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}

//游戏期次列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
//http://xxxx/ushop-web-admin/lotto/gameIssue/listBy
function getGameIssueListFn(tableId, pagerId, postData) {
	var listTitle = $('[href=#' + $(tableId).parents('.tabpane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/lotto/game/issue/listBy',
		colModel = [{
			label: 'ID',
			name: 'id',
			index: 'id',
			hidden: true
		}, {
			label: '游戏标识',
			name: 'prizeId',
			index: 'prizeId',
			width: 100,
			align: 'center'
		}, {
			label: '期号',
			name: 'issue',
			index: 'issue',
			width: 100,
			align: 'center'
		}, {
			label: '开售时间',
			name: 'startSaleTime',
			index: 'startSaleTime',
			width: 120,
			align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				return timeFormtFn(cellVal).substr(0, 13);
			}
		}, {
			label: '停售时间',
			name: 'endSaleTime',
			index: 'endSaleTime',
			width: 120,
			align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				return timeFormtFn(cellVal).substr(0, 13);
			}
		}, {
			label: '开奖时间',
			name: 'drawTime',
			index: 'drawTime',
			width: 120,
			align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				return timeFormtFn(cellVal).substr(0, 13);
			}
		}, {
			label: '状态',
			name: 'status',
			index: 'status',
			width: 120,
			align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				var str = '';
				$.each(globalData.gameStatusArr, function(index, obj) {
					if(obj.val == cellVal) {
						str = obj.key;
						return false;
					}
				});
				return str;
			}
		}, {
			label: '兑奖时间',
			name: 'cashTime',
			index: 'cashTime',
			width: 120,
			align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				return timeFormtFn(cellVal).substr(0, 13);
			}
		}, {
			label: '操作',
			name: 'operation',
			index: '',
			width: 200,
			align: 'center',
			fixed: 'true',
			formatter: function(cellVal, cellData, rowData) {
				var str = '<button class="btn btn-xs btn-primary"onclick="updataIssueFn(\'' + encodeURIComponent(JSON.stringify(rowData)) + '\')">编辑</button> ';
				if(rowData.status == 4) {
					str += '<button class="btn btn-xs btn-primary"onclick="getPaperFn(\'' + encodeURIComponent(JSON.stringify(rowData)) + '\')">查看票据</button> ';
				}
				return str;
			}
		}];
	//数据重新呈现，先解除绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}

//期次票据列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
//http://xxxx/ushop-web-admin/lotto/gameIssue/listBy
function getPaperListFn(tableId, pagerId, postData) {
	var listTitle = $('[href=#' + $(tableId).parents('.tabpane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/lotto/game/ticket/listBy',
		colModel = [{
			label: '期次ID',
			name: 'id',
			index: 'id',
			hidden: true
		}, {
			label: '游戏标识',
			name: 'prizeId',
			index: 'prizeId',
			width: 100,
			align: 'center'
		}, {
			label: '期号',
			name: 'issue',
			index: 'issue',
			width: 100,
			align: 'center'
		}, {
			label: '用户ID',
			name: 'userNo',
			index: 'userNo',
			width: 100,
			align: 'center'
		}, {
			label: '用户名',
			name: 'userName',
			index: 'userName',
			width: 100,
			align: 'center'
		}, {
			label: '物流状态',
			name: 'logistics',
			index: 'logistics',
			width: 120,
			align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				var str = '';
				$.each(globalData.gameStatusArr, function(index, obj) {
					if(obj.val == cellVal) {
						str = obj.key;
						return false;
					}
				});
				return str;
			}
		}, {
			label: '状态',
			name: 'status',
			index: 'status',
			width: 120,
			align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				var str = '';
				$.each(globalData.gameStatusArr, function(index, obj) {
					if(obj.val == cellVal) {
						str = obj.key;
						return false;
					}
				});
				return str;
			}
		}, {
			label: '兑奖时间',
			name: 'cashTime',
			index: 'cashTime',
			width: 120,
			align: 'center',
			formatter: function(cellVal, cellData, rowData) {
				return timeFormtFn(cellVal).substr(0, 13);
			}
		}, {
			label: '预留电话',
			name: 'phone',
			index: 'phone',
			width: 100,
			align: 'center'
		}, {
			label: '预留邮编',
			name: 'zipCode',
			index: 'zipCode',
			width: 100,
			align: 'center'
		}, {
			label: '预留收件人',
			name: 'consignee',
			index: 'consignee',
			width: 100,
			align: 'center'
		}, {
			label: '充值号/物流号',
			name: 'expressNo',
			index: 'expressNo',
			width: 100,
			align: 'center'
		}, {
			label: '物流流名称',
			name: 'expressCompany',
			index: 'expressCompany',
			width: 100,
			align: 'center'
		}, {
			label: '物流备注',
			name: 'expressRemarks',
			index: 'expressRemarks',
			width: 100,
			align: 'center'
		}, {
			label: '操作',
			name: 'operation',
			index: '',
			width: 200,
			align: 'center',
			fixed: 'true',
			formatter: function(cellVal, cellData, rowData) {
				var logistics = rowData.logistics,
					str = '';
				str = '<button class="btn btn-xs btn-primary"onclick="pageModalFn(\'' + encodeURIComponent(JSON.stringify(rowData)) + '\', this,\'watch\')">查看地址</button> ';
				if(logistics == 1) {
					str += '<button class="btn btn-xs btn-primary"onclick="pageModalFn(\'' + encodeURIComponent(JSON.stringify(rowData)) + '\', this)">发奖</button> '
				} else if(logistics == 2) {
					str += '<button class="btn btn-xs btn-success" disabled="disabled">已发奖</button> ';
				} else if(logistics == 0) {
					str += '<button class="btn btn-xs btn-default" disabled="disabled">未发奖</button> ';

				}
				//					else if(rowData.status == 3){
				//						str = '<button class="btn btn-xs btn-primary"onclick="pageModalFn(\'' + encodeURIComponent(JSON.stringify(rowData)) + '\', this)">发奖</button> ';
				//					}

				return str;
			}
		}];
	//数据重新呈现，先解除绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}

//获得一个奖等模块的HTML字符串
//index奖等标识符，为数字类型，最小值为1，值唯一
function getLevelStrFn(index, obj, data) {
	index = index || 1; //奖等的标识符，最小值为1
	obj = obj || {};
	var name = obj.name || '', //奖等名称
		title = obj.title || '', //奖等标题
		remark = obj.remark || '', //奖等描述
		about = obj.about || '', //奖等简介
		startTime = obj.startTime || '', //开售时间
		intervalTime = obj.intervalTime || '', //停售间隔开售的时间
		luckyInterval = obj.luckyInterval || '', //开奖间隔停售的时间
		prizeType = obj.prizeType || '', //奖品类型
		prizeCount = obj.prizeCount || '', //奖品个数
		issueCount = obj.issueCount || '', //期次个数
		url = obj.url || '', //图片地址
		urlStr = '', //如果是游戏编辑更新时记录原始的图片数据
		barStr = ''
	if(url) {
		urlStr =
			'<div class="form-group">' +
			'<label class="col-sm-4 control-label">原始图片</label>' +
			'<div class="col-sm-8">' +
			'<img style="height: 50px;" src="' + url + '">' +
			'</div>' +
			'</div>';
	}
	if(name) { //属于编辑界面，可以查看期次
		barStr =
			'<div class="widget-toolbar">' +
			'<button onclick="showIssueListFn(' + data.id + ', ' + obj.index + ',\'\',' + prizeType + ')" class="btn btn-xs btn-success bigger">查看期次</button>' +
			'</div>';
	}
	var str =
		'<div class="col-sm-6 col-lg-4">' +
		'<div class="widget-box levelindex">' +
		'<div class="widget-header">' +
		'<h4 class="widget-title">奖等模块</h4>' +
		barStr +
		'</div>' +
		'<div class="widget-body">' +
		'<div class="widget-main">' +
		'<form class="form-horizontal">' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">奖等名字</label>' +
		'<div class="col-sm-8">' +
		'<input type="text" class="form-control name" value="' + name + '" placeholder="">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">标题</label>' +
		'<div class="col-sm-8">' +
		'<input type="text" class="form-control title" value="' + title + '" placeholder="">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">描述</label>' +
		'<div class="col-sm-8">' +
		'<input type="text" data-toggle="modal" data-target="#ace_wysiwyg_modal" readonly class="form-control remark" value="' + remark + '" placeholder="点击编辑">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">简介</label>' +
		'<div class="col-sm-8">' +
		'<input type="text" class="form-control about" value="' + about + '" placeholder="">' +
		'</div>' +
		'</div>' +
		'<div class="form-group hide">' +
		'<label class="col-sm-4 control-label">索引</label>' +
		'<div class="col-sm-8">' +
		'<input type="text" class="form-control index" value="' + index + '">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">开售时间</label>' +
		'<div class="col-sm-8">' +
		'<input type="text" readonly class="form-control datePicker starttime" value="' + timeFormtFn(startTime).substr(0, 13) + '" placeholder="双击清空">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">停售间隔</label>' +
		'<div class="col-sm-8">' +
		'<input type="number" class="form-control intervaltime" value="' + intervalTime + '" placeholder="开售和停售的间隔（小时）">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">开奖间隔</label>' +
		'<div class="col-sm-8">' +
		'<input type="number" class="form-control luckyinterval" value="' + luckyInterval + '" placeholder="停售和开奖的间隔（小时）">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">奖品类型</label>' +
		'<div class="col-sm-8">' +
		'<select class="form-control provinceSelect prizetype">' +
		getKeyValStr(globalData.gameTypeArr, null, prizeType) +
		'</select>' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">奖品个数</label>' +
		'<div class="col-sm-8">' +
		'<input type="number" min="1" class="form-control prizecount" value="' + prizeCount + '" placeholder="">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">期次个数</label>' +
		'<div class="col-sm-8">' +
		'<input type="number" min="1" class="form-control issuecount" value="' + issueCount + '" placeholder="">' +
		'</div>' +
		'</div>' +
		urlStr +
		'<div class="form-group ace_file_img" style="height: 135px; margin-bottom: 0;">' +
		'<div class="col-xs-12">' +
		'<input multiple="" class="url" file_url="' + url + '" type="file">' +
		'</div>' +
		'</div>' +
		'</form>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'<div style="height: 10px;"></div>' +
		'</div>';
	return str;
}

//获得一个期次模块的HTML字符串
//obj为奖等对象
//st开售时间，et停售时间，dt开奖时间，ct兑奖时间，对应的时间戳，可以为空
function getIssueStrFn(obj, st, et, dt, ct) {
	var name = obj.name || '无奖等名',
		prizeId = obj.index || obj.id || '';
	var str =
		'<div class="col-sm-6 col-lg-4">' +
		'<div class="widget-box issueindex">' +
		'<div class="widget-header">' +
		'<h4 class="widget-title">' + name + '</h4>' +
		'</div>' +
		'<div class="widget-body">' +
		'<div class="widget-main">' +
		'<form class="form-horizontal">' +
		'<div class="form-group hidden">' +
		'<label class="col-sm-4 control-label">奖等标识</label>' +
		'<div class="col-sm-8">' +
		'<input type="text" class="form-control prizeid" value="' + prizeId + '" placeholder="">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">开售时间</label>' +
		'<div class="col-sm-8">' +
		'<input type="text" readonly data-date-index="1" class="form-control startsaletime" value="' + Common.msToTime(st).substr(0, 13) + '" placeholder="双击清空">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">停售时间</label>' +
		'<div class="col-sm-8">' +
		'<input type="text" readonly data-date-index="2" class="form-control endsaletime" value="' + Common.msToTime(et).substr(0, 13) + '" placeholder="双击清空">' +
		'</div>' +
		'</div>' +
		'<div class="form-group">' +
		'<label class="col-sm-4 control-label">开奖时间</label>' +
		'<div class="col-sm-8">' +
		'<input type="text" readonly data-date-index="3" class="form-control drawtime" value="' + Common.msToTime(dt).substr(0, 13) + '" placeholder="双击清空">' +
		'</div>' +
		'</div>' +
		//							'<div class="form-group">'+
		//								'<label class="col-sm-4 control-label">兑奖时间</label>'+
		//								'<div class="col-sm-8">'+
		//									'<input type="text" readonly data-date-index="4" class="form-control cashtime" value="' + Common.msToTime(ct).substr(0, 13) + '" placeholder="双击清空">'+
		//								'</div>'+
		//							'</div>'+
		'</form>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'<div style="height: 10px;"></div>' +
		'</div>';
	return str;
}

//创建奖等部件
//num 生成部件的数量
//parent HTML字符串放入进的元素，jq元素对象
function createLevelWidget(num, parent) {
	num = parseInt(num) || 1;
	var str = '',
		i = 0;
	for(; i < num; i++) {
		str += getLevelStrFn(i + 1);
	}
	str += '<div style="height: 20px;" class="col-xs-12"></div>' +
		'<div class="col-xs-12">' +
		'<div class="col-xs-offset-3 col-xs-3">' +
		'<button class="btn btn-info btn-block btn-lg" onclick="pageChangeFn(\'luckydrawpage\', \'luckydrawlist\')">返回</button>' +
		'</div>' +
		'<div class="col-xs-3">' +
		'<button class="btn btn-info btn-block btn-lg" onclick="levelDataFn()">下一步</button>' +
		'</div>' +
		'</div>';
	parent.html(str);
	bindDatePicker(parent.find('.datePicker'));
	bindFileInput(parent.find('.url'));
}

//创建期次部件
//下周有其他安排，这个暂时写到这里，暂停，给期次里的时间赋值问题
function createIssueWidget(parent) {
	var prizes = globalData.luckyDrawData.prizes;
	var str = '',
		estr, st, et, dt, ct, index, it, lt, preEt;
	$.each(prizes, function(i, o) {
		it = (parseInt(o.intervalTime) * 60 * 60 * 1000);
		lt = (parseInt(o.luckyInterval) * 60 * 60 * 1000);
		preEt = (new Date(timeFormtFn(o.startTime))).getTime();
		//		et = st + (parseInt(o.intervalTime)*60*60*1000);
		//		dt = et + (parseInt(o.luckyInterval)*60*60*1000);
		ct = parseInt($('#createluckybox').find('.cashInterval').val());
		ct = (ct && dt) ? (ct * 24 * 60 * 60 * 1000 + dt) : '';
		index = o.issueCount;
		estr = '';
		while(index--) {
			st = preEt;
			et = st + it;
			dt = et + lt;
			estr += getIssueStrFn(o, st, et, dt, ct);
			preEt = et
		}
		str += '<div style="line-height: 2em; font-size: 16px; color: #ff961a;" class="col-xs-12"><div class="col-xs-12">奖等：' + o.name + '</div></div>' +
			'<div class="col-xs-12">' +
			estr +
			'</div>';
	});
	str += '<div style="height: 20px;" class="col-xs-12"></div>' +
		'<div class="col-xs-12">' +
		'<div class="col-xs-offset-3 col-xs-3">' +
		'<button class="btn btn-info btn-block btn-lg" onclick="pageChangeFn(\'setwidgetbox\', \'levelwidgetbox\')">上一步</button>' +
		'</div>' +
		'<div class="col-xs-3">' +
		'<button class="btn btn-info btn-block btn-lg" onclick="createBeforeFn()">创建游戏</button>' +
		'</div>' +
		'</div>';
	parent.html(str);
	bindDatePicker(parent.find('[data-date-index]'), parent);
}

//页面切换
function pageChangeFn(eleClass, eleId) {
	$('.' + eleClass).addClass('hidden');
	if(eleId) {
		$('#' + eleId).removeClass('hidden');
	}
}

//显示期次列表
function showIssueListFn(gameId, prizeId, issue, prizeType) {
	var _param = {
		gameId: gameId,
		prizeId: prizeId,
		issue: issue
	};
	globalData.prizeType = prizeType;
	pageChangeFn('luckydrawpage', 'gameissuelist');
	getGameIssueListFn('#itemstable2', '#itemspager2', _param);
}

//时间格式化，20170506101010
//这种时间的格式化为 2017-05-06 10:10:10
function timeFormtFn(a) {
	if(!a) {
		return ''
	};
	var y = a.substr(0, 4),
		m = a.substr(4, 2),
		d = a.substr(6, 2),
		h = a.substr(8, 2),
		i = a.substr(10, 2),
		s = a.substr(12, 2);
	return y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;
}

//资金的类型请求
function getFundType(callback) {
	callback = callback || function() {};
	if(globalData.fundTypeList) {
		return globalData.fundTypeList;
	}
	var _url = '/ushop-web-admin/account/fundType/list';
	Common.ajax(_url, 'get', {}, function(data) {
		if(data.recordList) {
			var str = '',
				a = [];
			$.each(data.recordList, function(key, obj) {
				a[a.length] = {
					val: obj.value,
					key: obj.desc
				};
				str += '<option value="' + obj.value + '">' + obj.desc + '</option>';
			});
			globalData.fundTypeList = a;
			$('.fundtype').html(str);
			callback(a);
		}
	});
}

//工具提示
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

//根据数组参数arr中对象的key值val值为将option数据字符串放在此元素中，jq元素
function getKeyValStr(arr, $ele, selected) {
	var str = '';
	$.each(arr, function(index, obj) {
		if(selected && obj.val == selected) {
			str += '<option selected value="' + obj.val + '">' + obj.key + '</option>';
		} else {
			str += '<option value="' + obj.val + '">' + obj.key + '</option>';
		}
	});
	if($ele) {
		$ele.html(str);
	}
	return str;
}

//绑定日期
function bindDatePicker($ele, parent) {
	$ele.datetimepicker({
		format: 'yyyy-mm-dd hh',
		autoclose: true,
		language: 'zh-CN',
		startDate: (new Date()),
		startView: 2,
		maxView: 4,
		minView: 1
	}).off('dblclick').on('dblclick', function() {
		$(this).val('').blur();
	}).on('changeDate', function(e) {
		var index = parseInt($(this).attr('data-date-index'));
		if(index) {
			var a = parent.find('[data-date-index="' + (index - 1) + '"]'),
				b = parent.find('[data-date-index="' + (index + 1) + '"]'),
				curDate = e.date;
			if(a.length > 0) {
				a.datetimepicker('setEndDate', curDate);
			}
			if(b.length > 0) {
				b.datetimepicker('setStartDate', curDate);
				b.datetimepicker('setEndDate', null);
			}

		}
	});
}

//绑定ace的文件选择方法
//eleId input元素的ID
function bindFileInput($ele) {
	$ele.ace_file_input({
		style: 'well',
		btn_choose: '点击选择或者将图片拖入',
		btn_change: null,
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
//		before_remove: function() {
//			$me.removeData('file_url'); //删除记录的服务器图片URL数据
//		},
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

//奖等数据处理
function levelDataFn() {
	var a = [],
		box, st, b, isTrue = true;
	$('#levelwidgetbox').find('.levelindex').each(function(index, ele) {
		b = levelValidFn($(ele));
		if(!b) {
			return isTrue = false;
		}
		a[a.length] = b;
	});
	if(isTrue === false) {
		return false;
	}
	globalData.luckyDrawData.prizes = a;
	//奖等本地保存定义
	globalData.localLevel = JSON.stringify(globalData.luckyDrawData.prizes)
	storageL('B', globalData.localLevel);
	pageChangeFn('setwidgetbox', 'issuewidgetbox');
	createIssueWidget($('#issuewidgetbox'));

}

//创建游戏前数据处理
function createBeforeFn() {
	var a = [],
		b, isTrue = true,
		issue, oldId, c;
	$('#issuewidgetbox').find('.issueindex').each(function(index, ele) {
		c = issueValidFn($(ele));
		if(!c) {
			return isTrue = false;
		}
		if(c.prizeId == oldId) {
			issue++;
		} else {
			oldId = c.prizeId;
			issue = 1;
		}
		c.issue = issue;
		a[a.length] = c;
	});
	if(isTrue === false) {
		return false;
	}
	b = gameValidFn($('#createluckybox')); //游戏的主体数据验证
	if(!b) {
		return false;
	}
	$.extend(globalData.luckyDrawData, b);
	globalData.luckyDrawData.issues = a;
	createSubmitFn(globalData.luckyDrawData)
}

//创建游戏提交
function createSubmitFn(_param) {
	_param.issues = JSON.stringify(_param.issues);
	_param.prizes = JSON.stringify(_param.prizes);
	var _url = '/ushop-web-admin/lotto/game/add';
	Common.ajax(_url, 'post', _param, function(data) {
		if(data.result == 'SUCCESS') {
			backToHome();
			Common.jBoxNotice('创建成功！', 'green');
			rmStorageLAll();
		} else {
			Common.jBoxNotice('创建失败！', 'red');
			storageL('C', _param.issues);
		}
	});
}

//编辑游戏，初始化数据
function editGameInit(data) {
	try {
		data = JSON.parse(decodeURIComponent(data));
		data.prizes = JSON.parse(data.prizes);
	} catch(err) {};
	if((typeof data) != 'object') {
		return false;
	}
	pageChangeFn('luckydrawpage', 'newaddluckydraw');
	pageChangeFn('setwidgetbox', 'levelwidgetbox');
	$('#awardingTime').addClass('hide');
	var box = $('#createluckybox');
	box.show();
	box.find('.name').val(data.name || ''); //游戏名
	box.find('.remark').val(data.remark || ''); //游戏描述
	box.find('.province').val(data.province || ''); //游戏所属省份
	box.find('.triggerType').val(data.triggerType || ''); //游戏触发类型
	//	box.find('.playtype').val(data.playType || '');//游戏玩法类型
	box.find('.partype').val(data.parType || ''); //游戏投注类型
	box.find('.parvalue').val(data.parValue.toString() || ''); //游戏投注金额
	box.find('.playtype').val(data.playType.toString() || '');
	box.find('.prizecount').val(data.prizeCount || ''); //游戏奖等数量
	box.find('.createlucky1').hide();

	var num = parseInt(data.prizeCount);
	var str = '',
		i = 0,
		parent = $('#levelwidgetbox');

	if(!(num > 0)) {
		return false;
	}
	for(; i < num; i++) {
		str += getLevelStrFn((i + 1), data.prizes[i], data);
	}
	//这里是准备中状态，可以启动游戏
	if(data.status == 1) {
		str += '<div style="height: 20px;" class="col-xs-12"></div>' +
			'<div class="col-xs-12">' +
			'<div class="col-xs-offset-3 col-xs-2">' +
			'<button class="btn btn-info btn-block btn-lg" onclick="pageChangeFn(\'luckydrawpage\', \'luckydrawlist\')">返回</button>' +
			'</div>' +
			'<div class="col-xs-2">' +
			'<button class="btn btn-info btn-block btn-lg" onclick="submitUpLevelFn(\'' + data.id + '\')">提交更新</button>' +
			'</div>' +
			'<div class="col-xs-2">' +
			'<button class="btn btn-info btn-block btn-lg" onclick="gameStratFn(\'' + data.id + '\')">启动游戏</button>' +
			'</div>' +
			'</div>';
	} else if(data.status == 2) { //这里是进行中状态，可以暂停游戏
		str += '<div style="height: 20px;" class="col-xs-12"></div>' +
			'<div class="col-xs-12">' +
			'<div class="col-xs-offset-3 col-xs-3">' +
			'<button class="btn btn-info btn-block btn-lg" onclick="pageChangeFn(\'luckydrawpage\', \'luckydrawlist\')">返回</button>' +
			'</div>' +
			'<div class="col-xs-2">' +
			'<button class="btn btn-info btn-block btn-lg" onclick="submitUpLevelFn(\'' + data.id + '\')">提交更新</button>' +
			'</div>' +
			'<div class="col-xs-3">' +
			'<button class="btn btn-info btn-block btn-lg" onclick="gameStopFn(\'' + data.id + '\')">暂停游戏</button>' +
			'</div>' +
			'</div>';
	} else if(data.status == -1) { //这里是暂停状态，可以启动游戏
		str += '<div style="height: 20px;" class="col-xs-12"></div>' +
			'<div class="col-xs-12">' +
			'<div class="col-xs-offset-3 col-xs-3">' +
			'<button class="btn btn-info btn-block btn-lg" onclick="pageChangeFn(\'luckydrawpage\', \'luckydrawlist\')">返回</button>' +
			'</div>' +
			'<div class="col-xs-2">' +
			'<button class="btn btn-info btn-block btn-lg" onclick="submitUpLevelFn(\'' + data.id + '\')">提交更新</button>' +
			'</div>' +
			'<div class="col-xs-3">' +
			'<button class="btn btn-info btn-block btn-lg" onclick="gameStratFn(\'' + data.id + '\')">启动游戏</button>' +
			'</div>' +
			'</div>';
	}
	parent.html(str);
	bindDatePicker(parent.find('.datePicker'));
	bindFileInput(parent.find('.url'));
	parent.find('.url').each(function(index, ele) {
		var $me = $(ele);
		$me.data('file_url', $me.attr('file_url'));
	});

}

//提交游戏奖等主数据更新
function submitUpLevelFn(gameId) {
	var _url = '/ushop-web-admin/lotto/game/update',
	 box = $('#createluckybox'),
		a = [],
		b, isTrue;
	$('#levelwidgetbox').find('.levelindex').each(function(index, ele) {
		b = levelValidFn($(ele));
		if(!b) {
			return isTrue = false;
		}
		a[a.length] = b;
	});
	if(isTrue === false) {
		return false;
	}
	var _param = gameValidFn($('#createluckybox'));
	if(!_param) {
		return false;
	}
	if(!_param.prizeCount || _param.prizeCount <1) {
		Common.jBoxNotice('请输入正确的奖等数量！', 'red');
		return false;
	}
	if(!_param.name) {
		Common.jBoxNotice('请输入游戏名称！', 'red');
		return false;
	}
	if(!_param.remark) {
		Common.jBoxNotice('请输入游戏描述！', 'red');
		return false;
	}
	if(!_param.playType || _param.playType < 0) {
		Common.jBoxNotice('请输入正确的玩法类型！', 'red');
		return false;
	}
	if(!_param.parValue|| _param.parValue < 0 || _param.parValue.length > 18) {
		Common.jBoxNotice('请输入正确投注金额！', 'red');
		return false;
	}
	_param.id = gameId;
	_param.prizes = JSON.stringify(a);
	Common.ajax(_url, 'post', _param, function(data) {
		if(data.result == 'SUCCESS') {
			backToHome();
			Common.jBoxNotice('修改成功！', 'green');

		} else {
			Common.jBoxNotice('修改失败！', 'red');
		}
	});
}

//显示期次详情界面
function updataIssueFn(data) {
	globalData.ctYz2 = true;
	try {
		data = JSON.parse(decodeURIComponent(data))
	} catch(err) {}
	if((typeof data) != 'object') {
		Common.jBoxNotice('期次数据错误！', 'red');
		return false;
	}
	var st = (new Date(timeFormtFn(data.startSaleTime))).getTime(),
		et = (new Date(timeFormtFn(data.endSaleTime))).getTime(),
		dt = (new Date(timeFormtFn(data.drawTime))).getTime(),
		ct = (new Date(timeFormtFn(data.cashTime))).getTime(),
		str;
	$("#updataissue").find(".cashtime").val(Common.msToTime(ct).substr(0, 13));
	pageChangeFn('luckydrawpage', 'updataissue');
	str = getIssueStrFn(data, st, et, dt, ct);
	if(data.status == 1) {
		str += '<div style="height: 20px;" class="col-xs-12"></div>' +
			'<div class="col-xs-12">' +
			'<div class="col-xs-offset-3 col-xs-3">' +
			'<button class="btn btn-info btn-block btn-lg" onclick="pageChangeFn(\'luckydrawpage\', \'gameissuelist\')">返回</button>' +
			'</div>' +
			'<div class="col-xs-3">' +
			'<button class="btn btn-info btn-block btn-lg" onclick="submitUpIssueFn()">提交更新</button>' +
			'</div>' +
			'</div>';
	}
	$('#issueupdatabox').html(str);
	bindDatePicker($('#issueupdatabox').find('[data-date-index]'), parent);
	bindDatePicker($("#updataissue").find('[data-date-index]'), $("#updataissue"));
}

//提交期次更新
function submitUpIssueFn() {
	var box = $('#issueupdatabox'),
		_url = '/ushop-web-admin/lotto/game/issue/update',
		_param = issueValidFn(box);
	_param.id = _param.prizeId;
	delete _param.prizeId;
	if(!_param) { //期次内容验证
		return false;
	}
	Common.ajax(_url, 'post', _param, function(data) {
		if(data.result == 'SUCCESS') {
			pageChangeFn('luckydrawpage', 'gameissuelist');
			Common.jBoxNotice('修改成功！', 'green');
		} else {
			Common.jBoxNotice('修改失败！', 'red');
		}
	});
}

//期次数据验证方法，并返回
function issueValidFn(box) {
	var prizeId = box.find('.prizeid').val(),
		st = (box.find('.startsaletime').val() || '').replace(/\D/g, '') + '0000',
		et = (box.find('.endsaletime').val() || '').replace(/\D/g, '') + '0000',
		dt = (box.find('.drawtime').val() || '').replace(/\D/g, '') + '0000',
		ct;
	if(globalData.ctYz == true && !globalData.ctYz2) {

		ct = ($("#awardingTime").find('.cashtime').val() || '').replace(/\D/g, '') + '0000';
	} else if(globalData.ctYz2 == true) {

		ct = ($("#updataissue").find('.cashtime').val() || '').replace(/\D/g, '') + '0000';
	}

	if(st == '0000') {
		bootsToast(box.find('.startsaletime'), '<span style="color: #ff961a">开售时间不能为空！</span>');
		return false;
	}
	if(et == '0000') {
		bootsToast(box.find('.endsaletime'), '<span style="color: #ff961a">停售时间不能为空！</span>');
		return false;
	}
	if(dt == '0000') {
		bootsToast(box.find('.drawtime'), '<span style="color: #ff961a">开奖时间不能为空！</span>');
		return false;
	}
	if(ct == '0000') {
		if(globalData.ctYz == true && !globalData.ctYz2) {
			Common.jBoxNotice('兑奖时间不能为空！', 'red');
			return false;
		} else if(globalData.ctYz2 == true) {
			Common.jBoxNotice('兑奖时间不能为空！', 'red');
			return false;
		}

	}
	if(!(parseInt(ct) > parseInt(dt))) {
		if(globalData.ctYz == true && !globalData.ctYz2) {
			Common.jBoxNotice('兑奖时间不能小于开奖时间！', 'red');
			return false;
		} else if(globalData.ctYz2 == true) {
			Common.jBoxNotice('兑奖时间不能小于开奖时间！', 'red');
			return false;
		}
	}
	if(!(parseInt(dt) > parseInt(et))) {
		bootsToast(box.find('.drawtime'), '<span style="color: #ff961a">开奖时间必须大于停售时间！</span>');
		return false;
	}
	if(!(parseInt(et) > parseInt(st))) {
		bootsToast(box.find('.endsaletime'), '<span style="color: #ff961a">停售时间必须大于开售时间！</span>');
		return false;
	}
	return {
		prizeId: prizeId,
		startSaleTime: st,
		endSaleTime: et,
		drawTime: dt,
		cashTime: ct
	};
}

//游戏的主要数据验证，并返回
function gameValidFn(box) {
	var a = { //游戏数据格式
		name: box.find('.name').val(), //游戏名
		remark: box.find('.remark').val(), //游戏描述
		province: box.find('.province').val(), //游戏所属省份
		triggerType: box.find('.triggerType').val(), //游戏触发类型
		playType: box.find('.playtype').val(), //游戏玩法类型
		parType: box.find('.partype').val(), //游戏投注类型
		parValue:box.find('.parvalue').val(), //游戏投注金额
		prizeCount:box.find('.prizecount').val() //游戏奖等数量
	};
	return a;
}

//奖等的主要数据验证，并返回
function levelValidFn(box) {
	var st = (box.find('.starttime').val() || '').replace(/\D/g, '') + '0000',
		a = {
			name: box.find('.name').val(), //奖等名称
			title: box.find('.title').val(), //奖等标题
			remark: box.find('.remark').val(), //奖等描述
			about: box.find('.about').val(), //奖等简介
			index: box.find('.index').val(), //奖等索引
			startTime: st, //开售时间
			intervalTime: box.find('.intervaltime').val(), //停售间隔开售的时间
			luckyInterval: box.find('.luckyinterval').val(), //开奖间隔停售的时间
			prizeType: box.find('.prizetype').val(), //奖品类型
			prizeCount: box.find('.prizecount').val(), //奖品个数
			issueCount: parseInt(box.find('.issuecount').val()), //期次个数
			url: (box.find('.url').data('file_url') || box.find('.url').attr('file_url')) //图片地址
		};
	if(!a.name) {
		bootsToast(box.find('.name'), '<span style="color: #ff961a">请输入奖等名称</span>');
		return false;
	}
	if(a.startTime == '0000') {
		bootsToast(box.find('.starttime'), '<span style="color: #ff961a">请选择开售时间</span>');
		return false;
	}
	if(!(a.prizeCount > 0)) {
		bootsToast(box.find('.prizecount'), '<span style="color: #ff961a">请输入大于0的奖品个数</span>');
		return false;
	}
	if(!(a.issueCount > 0)) {
		bootsToast(box.find('.issuecount'), '<span style="color: #ff961a">请输入大于0的期次个数</span>');
		return false;
	}
	//	if(!a.url){
	//		bootsToast(box.find('.ace_file_img'), '<span style="color: #ff961a">图片未上传</span>');
	//		return false;
	//	}
	return a;
}

//启动游戏
function gameStratFn(gameId) {
	var _url = '/ushop-web-admin/lotto/game/start';
	Common.ajax(_url, 'post', {
		gameId: gameId
	}, function(data) {
		if(data.result == 'SUCCESS') {
			backToHome();
			Common.jBoxNotice('启动游戏成功！', 'green');
		} else {
			Common.jBoxNotice('启动游戏失败！', 'red');
		}
	});
}

//暂停游戏
function gameStopFn(gameId) {
	var _url = '/ushop-web-admin/lotto/game/pause';
	Common.ajax(_url, 'post', {
		gameId: gameId
	}, function(data) {
		if(data.result == 'SUCCESS') {
			backToHome();
			Common.jBoxNotice('暂停游戏成功！', 'green');
		} else {
			Common.jBoxNotice('暂停游戏失败！', 'red');
		}
	});
}

//回到列表界面，并刷新列表
//用于更新或添加页面数据时调用
//暂停启动游戏时也可以调用
function backToHome() {
	pageChangeFn('luckydrawpage', 'luckydrawlist'); //显示主页
	getLuckDrawListFn('#itemstable1', '#itemspager1'); //刷新界面
}

//查看票据
function getPaperFn(data) {
	data = JSON.parse(decodeURIComponent(data));
	var _param = {
		gameId: data.gameId,
		prizeId: data.prizeId,
		issue: data.id,
		ticketId: '',
		status: data.status
	};
	globalData._updateParam = _param;
	pageChangeFn('luckydrawpage', 'issuewinninglist');
	getPaperListFn('#itemstable3', '#itemspager3', _param);
}

//发奖模态框
function pageModalFn(data, me, typeName) {
	data = JSON.parse(decodeURIComponent(data));
	globalData.billId = data.id;
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem4 = modal.find('.pageModalItem4');
	modal.modal('show');
	if(typeName == 'watch') {
		pageModalTitle.html('个人信息');
		pageChangeFn('prizeTypeList', 'address');
		pageModalItem4.find('[name=zipCode]').val(data.zipCode || '');
		pageModalItem4.find('.phone').val(data.phone || '');
		pageModalItem4.find('[name=consignee]').val(data.consignee || '');
		pageModalItem4.find('[name=address]').val(data.address || '');
	} else {
		pageModalTitle.html('信息填写');
		if(globalData.prizeType == 1) {
			pageChangeFn('prizeTypeList', 'Material');
		} else if(globalData.prizeType == 2) {
			pageChangeFn('prizeTypeList', 'recharge');
		} else if(globalData.prizeType == 3) {
			pageChangeFn('prizeTypeList', 'fictitious');
		}
	}
}
//发奖确定函数
function determineClickFn() {
	var _param = {},
		modal = $('#pageModal'),
		pageModalItem1 = modal.find('.pageModalItem1'),
		pageModalItem2 = modal.find('.pageModalItem2'),
		pageModalItem3 = modal.find('.pageModalItem3');
	if(globalData.prizeType == 1) {
		_param = {
			id: globalData.billId,
			expressNo: pageModalItem1.find('.expressNo').val(),
			expressCompany: pageModalItem1.find('.expressCompany').val(),
			expressRemarks: pageModalItem1.find('.expressRemarks').val()
		};
	} else if(globalData.prizeType == 2) {
		_param = {
			id: globalData.billId,
			expressNo: pageModalItem2.find('.expressNo').val()
		};
	} else if(globalData.prizeType == 3) {
		_param = {
			id: globalData.billId,
			expressNo: pageModalItem3.find('.expressNo').val(),
			expressCompany: pageModalItem3.find('.expressCompany').val(),
			expressRemarks: pageModalItem3.find('.expressRemarks').val(),
			consignee: pageModalItem3.find('.consignee').val()
		};
	}
	var _url = '/ushop-web-admin/lotto/game/ticket/postDeliver';
	Common.ajax(_url, 'post', _param, function(data) {
		if(data.result === 'SUCCESS') {
			Common.jBoxNotice('发奖成功！', 'green');
			getPaperListFn('#itemstable3', '#itemspager3', globalData._updateParam);
			modal.modal('hide');
		} else {
			Common.jBoxNotice('操作失败！', 'red');
		}
	});
}
//本地保存

function storageL(key, val) {
	if(typeof(Storage) !== 'undefined') {
		if(val === undefined) {
			val = localStorage[key];
			if(val && val.indexOf('obj-') === 0) {
				val = val.slice(4);
				return JSON.parse(val);
			} else {
				return val;
			}
		} else {
			if(typeof val === 'object') {
				val = 'obj-' + JSON.stringify(val);
			} else {
				val = val + '';
			}
			localStorage[key] = val;
		}
	}
};

function rmStorageL(key) {
	if(typeof(Storage) !== 'undefined' && key) {
		localStorage.removeItem(key);
	}
};

function rmStorageLAll() {
	if(typeof(Storage) !== 'undefined') {
		localStorage.clear();
	}
};