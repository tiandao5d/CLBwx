/**
 * 
 * BannerManage.js
 * 内容管理-广告栏
 * 作者：xulin
 * 
 * */

"use strict";
var globalData = {};
$(function() {
	//菜单面包屑导航等配置显示
	Common.menuNavContent('广告图管理', '广告列表', '运营管理后台');
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');

	pageDataInit(); //页面数据初始化
	domEventFn(); //dom初始化事件绑定
	reloadDataFn(); //所有需要从服务器加载的数据请求
});

//页面启动时，数据初始化
function pageDataInit() {}
//dom事件绑定
function domEventFn() {
	//日期选择器绑定
	$('.form_datetime').datetimepicker({
		format: 'yyyy-mm-dd hh:ii:00',
		autoclose: true,
		language: 'zh-CN',
		startDate: new Date(),
		startView: 2,
		maxView: 4,
		minView: 0,
		minuteStep: 1
	}).on('changeDate', function(e) {
		var $this = $(this),
			tn = $this.attr('name');
		if($this.hasClass('start')) {
			$this.parent().find('.end').datetimepicker('setStartDate', e.date);
		} else if($this.hasClass('end')) {
			$this.parent().find('.start').datetimepicker('setEndDate', e.date);
		}
	});
	modalEventFn(); // 添加弹窗中事件绑定
	bindFileInput($('.url')); // 图片上传事件绑定
}

// 添加弹窗中事件绑定
function modalEventFn () {
	var $box = $('#banner_form'),
		$rc = $box.find('.rel_cf'),
		$ac = $box.find('.active_config'),
		$pc = $box.find('.product_config'),
		$df = $box.find('.default_config');
	$box.find('[name="relationType"]').on('change', function () {
		var val = $(this).val();
		$rc.addClass('hide'); // 隐藏配置
		if ( val === '1' ) { // 活动配置
			$ac.removeClass('hide'); // 显示活动配置
		}else if ( val === '3' ) { // 商品配置
			$pc.removeClass('hide'); // 显示商品配置
		} else {
			$df.removeClass('hide'); // 隐藏商品配置
		}
	});
	$box.on('hidden.bs.modal', function () {
		// 编辑数据重置
		$box.find('form')[0].reset();
		$box.removeData('id');
		$box.find('.imgShow').html('');
		$box.find('[name="relationType"]').trigger('change');
		$box.find('.url').removeData('file_url').data('ace_file_input').reset_input();
	});
}

//所有需要从服务器加载的数据请求
function reloadDataFn() {
	Common.ajaxAll([
		{url: '/ushop-web-admin/sns/banner/getConstants'},
		{url: '../../js/active.config.json'},
		{url: '../../js/provinces.json'},
		{url: '/ushop-web-admin/account/fundType/list'}
	], function(arg0, arg1, arg2, arg3) {
		globalData.bShowPageArr = arg0.typeList; // 定义banner图可以显示的页面，比如：微信公众号首页
		globalData.bEffcetArr = arg0.effcetList; // 定义banner图的动效方式，暂时不做处理，比如：左右切换
		globalData.bOpenPageArr = arg0.relationList; // 定义banner图跳转页面，需要配对应参数，比如：游戏
		globalData.actConfigArr = arg1; // 定义banner图活动页面跳转参数配置，比如：页面关联ID等数据
		globalData.provinceArr = arg2; // 省份数据
		globalData.fundTypeArr = arg3.recordList; // 积分类型
		selectInitFn(globalData.bShowPageArr, 'desc', 'value', '.bannerType'); // 可以显示的页面
		selectInitFn(globalData.bOpenPageArr, 'desc', 'value', '.relationType'); // 跳转页面
		selectInitFn(globalData.actConfigArr, 'textName', 'id', '.actConfig'); // 跳转页面参数配置
		selectInitFn(globalData.provinceArr, 'desc', 'value', '.province'); // 省份的select
		selectInitFn(globalData.fundTypeArr, 'desc', 'value', '.fundType'); // 积分类型
		//列表呈现
		bannerList('#itemsTable1', '#itemsPager1');
	});
}

//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给后台的参数
function bannerList(tableId, pagerId, postData) {
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/sns/banner/list',
		colModel = [{
				label: '图片缩略图',
				name: 'pictureAddress',
				index: 'pictureAddress',
				fixed: true,
				width: 140,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					return('<img width="100" src="' + cellVal + '">');
				}
			},
			{
				label: '所属模块',
				name: 'bannerType',
				index: 'bannerType',
				fixed: true,
				width: 120,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.bShowPageArr, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
			},
			{
				label: '所在省份',
				name: 'province',
				index: 'province',
				fixed: true,
				width: 80,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					$.each(globalData.provinceArr, function(index, obj) {
						if(cellVal == obj.value) {
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
			},
			{
				label: '广告名称',
				name: 'bannerName',
				index: 'bannerName',
				align: 'center'
			},
			{
				label: '开始时间',
				name: 'beginTime',
				index: 'beginTime',
				fixed: true,
				width: 150,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					return Common.msToTime(cellVal);
				}
			},
			{
				label: '结束时间',
				name: 'endTime',
				index: 'endTime',
				fixed: true,
				width: 150,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					return Common.msToTime(cellVal);
				}
			},
			{
				label: '活动状态',
				name: 'status',
				index: 'status',
				fixed: true,
				width: 80,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					var str = '';
					var now = new Date().getTime();
					if(now > rowData.endTime) {
						str = '已结束';
					}
					if(now < rowData.endTime) {
						str = '进行中';
					}
					if(now < rowData.beginTime) {
						str = '未开始';
					}
					return str
				}
			},
			{
				label: '操作',
				name: 'operation',
				index: '',
				fixed: true,
				width: 110,
				align: 'center',
				formatter: function(cellVal, cellData, rowData) {
					var rid = rowData.id;
					if ( !globalData.bannerListArr ) {
						globalData.bannerListArr = {};
					}
					globalData.bannerListArr[('rowid' + rid)] = rowData;
					var str = '<button class="btn btn-xs btn-primary" onclick="editorRow(' + rid + ')">编辑</button> ' +
						'<button class="btn btn-xs btn-primary" onclick="deleteRow(' + rid + ')">删除</button>';
					return str;
				}
			}

		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '广告列表');
}

//查询按键点击事件
function onSearch(me) {
	var $me = $(me),
		bannerType = $me.parent().find('.bannerType').val();
	var postData = {
		bannerType: bannerType
	};
	bannerList('#itemsTable1', '#itemsPager1', postData);
}

//新增banner图
function addBannerFn() {
	var $box = $('#banner_form');
	$box.find('.modalTitle').html('新增');
	$box.data('bid', '').modal('show'); //显示模态框
}

//编辑行
function editorRow ( id ) {
	var $box = $('#banner_form'),
		data = globalData.bannerListArr[('rowid' + id)];
	$box.data('id', id);
	bannerDataVal(data);
	$box.find('.modalTitle').html('编辑');
	$box.data('bid', '').modal('show'); //显示模态框
}

// 获取banner图数据
function getBannerData () {
	var $box = $('#banner_form'),
		_param = {},
		k, v, $me;
	$box.find('.add_form_ipt').each(function(){
		$me = $(this);
		k = $me.attr('name');
		v = $me.val();
		_param[k] = v;
	});
	_param['effect'] = '1'; // 切换效果，固定值
	_param['URL'] = (function(){
		return ($box.find('.url').data('file_url') ||
			$box.find('.imgShow').find('img').attr('src') || '')
	})();
	_param['relationWebId'] = (function(){
		var a = _param.relationType, b = [];
		if ( a === '1' ) { // 活动配置
			b[0] = $box.find('[name="ac_ipt1"]').val(); // 页面配置ID
			b[1] = $box.find('[name="ac_ipt2"]').val(); // 活动ID
			b[2] = $box.find('[name="ac_ipt3"]').val(); // 积分类型
		} else if ( a === '3' ) { // 商品配置
			b[0] = $box.find('[name="pc_ipt1"]').val(); // 商品类型
			b[1] = $box.find('[name="pc_ipt2"]').val(); // 商品ID
		} else {
			b[0] = $box.find('[name="df_ipt"]').val();
		}
		b = $.map(b, function( n ) {
			return n ? n : null;
		});
		return b.join('|');
	})();
	return _param;
}
// 验证banner图数据
function bannerDataValid ( p ) {
	var $box = $('#banner_form'),
		$me, dnull, istrue = true;
	var rela;
	$.each(p, function ( k, v ) {
		$me = $box.find('[name="' + k + '"]');
		if ( !v ) {
			dnull = $me.attr('data-null');
			if ( ($me.length > 0) && dnull ) {
				Common.jBoxNotice(dnull, 'red');
			} else if ( k === 'URL' ) {
				Common.jBoxNotice('请上传图片', 'red');
			} else if ( k === 'relationWebId' ) {
				Common.jBoxNotice('请输入关联参数', 'red');
			}
			istrue = false;
		} else if ( k === 'relationWebId' ) { // 前端关联ID
			rela = v.split('|');
			if ( p.relationType === '1' ) { // 活动配置
				if ( !rela[0] ) {
					Common.jBoxNotice('请选择活动', 'red');
					istrue = false;
				}
			} else if ( p.relationType === '3' ) { // 商品配置
				if ( !rela[0] ) {
					Common.jBoxNotice('请选择商品类型', 'red');
					istrue = false;
				} else if ( !rela[1] ) {
					Common.jBoxNotice('请输入商品ID', 'red');
					istrue = false;
				}
			}
		} else if ( k === 'endTime' ) { // 结束时间
			if ( !(+new Date(v) > +new Date(p.beginTime)) ) {
				Common.jBoxNotice('结束时间必须大于开始时间', 'red');
				istrue = false;
			}
		}
		if ( !istrue ) {
			return false;
		}
	});
	return istrue;
}

// banner图表单数据赋值
function bannerDataVal ( p ) {
	var $box = $('#banner_form'),
		$me, rela;
	p.relationType = p.relationType + '';
	$.each(p, function ( k, v ) {
		$me = $box.find('[name="' + k + '"]');
		if ( $me.length > 0 ) {
			if ( k === 'beginTime' || k === 'endTime' ) {
				$me.val(Common.msToTime(v));
			}else if ( k === 'relationType' ) {
				$me.val(v).trigger('change');
			} else {
				$me.val(v);
			}
		} else if ( k === 'relationWebId' ) { // 前端关联ID
			rela = v.split('|');
			if ( p.relationType === '1' ) { // 活动配置
				$box.find('[name="ac_ipt1"]').val((rela[0] || '')); // 页面配置ID
				$box.find('[name="ac_ipt2"]').val((rela[1] || '')); // 活动ID
				$box.find('[name="ac_ipt3"]').val((rela[2] || '')); // 积分类型
			} else if ( p.relationType === '3' ) { // 商品配置
				$box.find('[name="pc_ipt1"]').val((rela[0] || '')); // 商品类型
				$box.find('[name="pc_ipt2"]').val((rela[1] || '')); // 商品ID
			} else {
				$box.find('[name="df_ipt"]').val(v);
			}
		}else if ( k === 'pictureAddress' ) {
			$box.find('.imgShow').html(('<img style="margin-bottom: 5px;" width="100" src="' + v + '">'))
		}
	});
}

// 表单数据提交
function bannerDataSubmit () {
	var $box = $('#banner_form'),
		id = $box.data('id');
	var _param = getBannerData();
	if ( !bannerDataValid(_param) ) {
		return false;
	}
	var _url = '/ushop-web-admin/sns/banner/add',
		doneStr = '新增成功',
		errorStr = '新增失败';
	if ( id ) {
		_param.id = id;
		_url = '/ushop-web-admin/sns/banner/edit';
		doneStr = '编辑成功';
		errorStr = '编辑失败';
	}
	Common.ajax(_url, 'post', _param, function ( data ) {
		if(data.data == 'SUCCESS') {
			Common.jBoxNotice(doneStr, 'green');
			bannerList('#itemsTable1', '#itemsPager1');
			$box.modal('hide');
		} else {
			Common.jBoxNotice((data.error_description || errorStr), 'red');
		}
	});
}

//删除行
function deleteRow ( id ) {
	var _url = '/ushop-web-admin/sns/banner/delete',
		_param = {id: id};
	Common.jBoxConfirm('确认信息', '是否确定删除', function(index) {
		if(index == 1) {
			Common.ajax(_url, 'post', _param, function(data) {
				if(data.data == 'SUCCESS') {
					Common.jBoxNotice('删除成功', 'green');
					bannerList('#itemsTable1', '#itemsPager1');
				} else {
					Common.jBoxNotice((data.error_description || '删除失败'), 'red');
				}
			});
		}
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
		//删除之前执行
		before_remove: function() {
			$ele
				.removeData('file_url') //删除记录的服务器图片URL数据
				.data('ace_file_input').reset_input(); //重置元素
		},
		preview_error: function(filename, error_code) {}
	}).on('change', function() {
		var $me = $(this),
			_file = this.files[0] || '',
			size = 300,
			istrue = true,
			maxs = parseInt(size) * 1024;
		if ( !_file ) {
			return false;
		}
		var rf = new FileReader;
		rf.onload = function () {
			var img = new Image();
			img.onload = function () {
				var w = this.width,
					h = this.height,
					s = _file.size,
					t = (_file.name + '').split('\.').pop();
				if(!((t == 'png') || (t == 'jpg'))) {
					Common.jBoxNotice('必须是png,jpg格式的图片', 'red');
					istrue = false;
				}
				if( !(s < maxs) ) {
					Common.jBoxNotice(('限制图片大小为' + size + 'KB'), 'red');
					istrue = false;
				}
				if ( !(w === 720 && h === 240) ) {
					Common.jBoxNotice('图片的宽高必须是720*240', 'red');
					istrue = false;
				}
				if ( istrue ) {
					imageUpdataFn($me);
				} else {
					$me.removeData('file_url').data('ace_file_input').reset_input();
				}
			}
			img.src = rf.result;
		}
		rf.readAsDataURL(_file);
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
			Common.jBoxNotice('图片上传成功', 'green');
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