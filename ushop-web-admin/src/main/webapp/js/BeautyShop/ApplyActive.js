/**
 * 
 * ApplyActive.js
 * 最美投注站-活动列表
 * 作者：xulin
 * 
 * */


"use strict";
var globalData = {};
$(function() {
	var urlObj = deCodeUrlFn();
	globalData.pageType = urlObj.type || '1';
	//菜单面包屑导航等配置显示
	Common.menuNavContent('投票活动管理', (
		(globalData.pageType === '1') ? '报名活动' :
		(globalData.pageType === '2') ? '投票活动' :
		(globalData.pageType === '3') ? '下架活动' : ''
	),'运营管理后台');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
		pageTabsShown(e);//标签页显示之后执行
	});
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	
	pageDataInit();//页面数据初始化
	domEventFn();//dom初始化事件绑定
	reloadDataFn();//所有需要从服务器加载的数据请求
});
//页面启动时，数据初始化
function pageDataInit(){
	//活动列表操作按键数据
	globalData.activeOperation = {
		// 编辑
		edit: {btntxt: '编辑', fn: activeEdit},
		// 删除
		del: {btntxt: '删除', fn: function ( id ) {
			
		}},
		// 发布
		issue: {btntxt: '发布', fn: function ( id ) {
			var $box = $('#beautyList'),
				$aa = $box.find('.active [data-tabdata]'),
				tabdata = $aa.attr('data-tabdata').split('|,|');
			var _url = '/ushop-web-admin/vote/election/publish/' + id;
			Common.ajax(_url, 'post', {}, function ( data ) {
				if ( data.result === 'SUCCESS' ) {
					beautyList(tabdata[0], tabdata[1], {status: getBLstatus(tabdata)});
					Common.jBoxNotice( '发布成功', 'green' );
				} else {
					Common.jBoxNotice( (data.error_description || '发布失败，未知错误'), 'red' );
				}
			});
		}},
		// 下架
		soldout: {btntxt: '下架', fn: function ( id ) {
			var $box = $('#beautyList'),
				$aa = $box.find('.active [data-tabdata]'),
				tabdata = $aa.attr('data-tabdata').split('|,|');
			var _url = '/ushop-web-admin/vote/election/down/' + id;
			Common.ajax(_url, 'post', {}, function ( data ) {
				if ( data.result === 'SUCCESS' ) {
					beautyList(tabdata[0], tabdata[1], {status: getBLstatus(tabdata)});
					Common.jBoxNotice( '下架成功', 'green' );
				} else {
					Common.jBoxNotice( (data.error_description || '下架失败，未知错误'), 'red' );
				}
			});
		}},
		// 作品管理
		works: {btntxt: '作品管理', fn: function ( id ) {
			// 进入作品列表
			// status 98 待审 99 不通过 100 通过
			var queryData = {
				status: '',
				district: '', //地区
				serialNo: '', //站点号
				electionId: id//活动ID
			}
			pageSH('#worksList', '.pageBox');
			$('#worksList').data('electionId', id);
			worksList('#worksTable', '#worksPager', queryData);
		}},
		// 投票记录
		votere: {btntxt: '投票记录', fn: function ( id ) {
			// 进入投票记录列表
			var queryData = {
				electionId: id,
				userName: '',
				nickName: ''
			}
			pageSH('#votereList', '.pageBox');
			votereList('#votereTable', '#voterePager', queryData);
		}},
	}
	// 作品管理列表操作
	globalData.worksOperation = {
		// 审核不通过
		audit99: {btntxt: '不通过', fn: function ( id ) {
			var _url = '/ushop-web-admin/vote/candidate/audit/' + id + '/99';
			Common.ajax(_url, 'post', {}, function ( data ) {
				if ( data.result === 'SUCCESS' ) {
					Common.jBoxNotice( '操作成功', 'green' );
				} else {
					Common.jBoxNotice( (data.error_description || '操作失败，未知错误'), 'red' );
				}
			});
		}},
		// 审核通过
		audit100: {btntxt: '通过', fn: function ( id ) {
			var _url = '/ushop-web-admin/vote/candidate/audit/' + id + '/100';
			Common.ajax(_url, 'post', {}, function ( data ) {
				if ( data.result === 'SUCCESS' ) {
					Common.jBoxNotice( '操作成功', 'green' );
				} else {
					Common.jBoxNotice( (data.error_description || '操作失败，未知错误'), 'red' );
				}
			});
		}},
		// 编辑
		edit: {btntxt: '编辑', fn: worksEdit}
	}
}
//dom事件绑定
function domEventFn(){
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
}

//所有需要从服务器加载的数据请求
function reloadDataFn(){
//	Common.ajaxAll([
//		//初始数据请求
//	], function(){
//	});
}

// 标签页显示之后执行
function pageTabsShown ( e ) {
	var $a = $(e.target),
		tabdata = $a.attr('data-tabdata').split('|,|');
	// 限时刷新，防止短时间多次请求
	var att = $a.data('att') || 0,
		ntt = +(new Date()),
		ival = 300000; // 短时间，单位ms
	if ( !( ntt - att > ival ) ) {
		return false;
	}
	$a.data('att', ntt);
	//省份请求初始化
	Common.ajax('../../js/provinces.json', 'get', {}, function(data) {
		globalData.provincesData = data;
		selectInitFn(data, 'desc', 'value', '.province'); //省份的select
		// 报名列表请求
		// status 报名未发布100 报名已发布101 投票未发布102 投票已发布103 结束104 下架105
		beautyList(tabdata[0], tabdata[1], {status: getBLstatus(tabdata)});
	});
}

// 获取活动的状态
function getBLstatus ( tabdata ) {
	var type = parseInt(globalData.pageType) - 1,
		status = parseInt(tabdata[2]) - 1,
		arr = [['100', '101'], ['102', '103'], ['104', '105']];
	return arr[type][status];
}

//活动列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
//status 报名未发布100 报名已发布101 投票未发布102 投票已发布103 结束104 下架105
function beautyList(tableId, pagerId, postData){
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/vote/election/listBy',
		colModel = [
			{label: '活动ID', name:'id', index:'id', fixed: true, width:50, align: 'center'},
			{label: '活动名称', name:'name', index:'name', align: 'center'},
			{label: '报名时间', name:'enrollTime', index:'enrollTime', fixed: true, width:150, align: 'center',
			formatter: function(cellVal, cellData , rowData){
				return (rowData.enrollTime + '<br/>' + rowData.cutOffTime);
			}},
			{label: '投票时间', name:'voteTime', index:'voteTime', fixed: true, width:150 , align: 'center',
			formatter: function(cellVal, cellData , rowData){
				return (rowData.voteTime + '<br/>' + rowData.endTime);
			}},
			{label: '报名数量', name:'targetTotal', index:'targetTotal', fixed: true, width:80 , align: 'center',
			formatter: function(cellVal, cellData , rowData){
				if ( cellVal === -1 ) {
					return '无限';
				} else {
					return cellVal;
				}
			}},
			{label: '省份', name:'province', index:'province', fixed: true, width:80 , align: 'center',
			formatter: function(cellVal, cellData , rowData){
				var p = ''
				$.each(globalData.provincesData, function(index, obj){
					if ( obj.value === cellVal ) {
						p = obj.desc;
						return false;
					}
				})
				return p;
			}},
			{label: '投票数量', name:'voteTotal', index:'voteTotal', fixed: true, width:60 , align: 'center',
			formatter: function(cellVal, cellData , rowData){
				if ( cellVal === -1 ) {
					return '无限';
				} else {
					return cellVal;
				}
			}},
			{label: '操作', name:'operation', index:'', fixed: true, width:300, align: 'center',
			formatter: function(cellVal, cellData , rowData){
				// status 报名未发布100 报名已发布101 投票未发布102 投票已发布103 结束104 下架105
				var status = postData.status;
				// 记录列表数据
				if ( !globalData.beautyListData ) {
					globalData.beautyListData = {}
				}
				globalData.beautyListData[('rowid' + rowData.id)] = rowData;
				if ( status === '100' ) { // 报名未发布100
					return getBtnStr ( 'activeOperation', ['edit', 'issue'], rowData.id );
				} else if ( status === '101' ) { // 报名已发布101
					return getBtnStr ( 'activeOperation', ['edit', 'soldout', 'works'], rowData.id );
				} else if ( status === '102' ) { // 投票未发布102
					return getBtnStr ( 'activeOperation', ['edit', 'issue', 'works'], rowData.id );
				} else if ( status === '103' ) { // 投票已发布103
					return getBtnStr ( 'activeOperation', ['edit', 'soldout', 'votere', 'works'], rowData.id );
				} else if ( status === '104' ) { // 结束104
					return getBtnStr ( 'activeOperation', ['votere', 'works'], rowData.id );
				} else if ( status === '105' ) { // 下架105
					return getBtnStr ( 'activeOperation', ['edit', 'votere', 'works'], rowData.id );
				}
			}}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}


//作品列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
function worksList(tableId, pagerId, postData){
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/vote/candidate/listBy',
		colModel = [
			{label: '活动ID', name:'id', index:'id', fixed: true, width:50, align: 'center'},
			{label: '站点号', name:'serialNo', index:'serialNo', align: 'center'},
			{label: '站主名字', name:'name', index:'name', align: 'center'},
			{label: '得票数', name:'score', index:'score', align: 'center'},
			{label: '地址', name:'address', index:'address', fixed: true, width:120, align: 'center'},
			{label: '电话', name:'phone', index:'phone', fixed: true, width:120 , align: 'center'},
			{label: '省份', name:'province', index:'province', fixed: true, width:60 , align: 'center'},
			{label: '图片', name:'url', index:'url', fixed: true, width:60 , align: 'center',
			formatter: function(cellVal, cellData , rowData){
				// 记录列表数据
				if ( cellVal ) {
					return '<img width="50" height="50" src="' + cellVal + '">';	
				} else {
					return '';
				}
			}},
			{label: '站点介绍', name:'remark', index:'remark', fixed: true, width:60 , align: 'center'},
			{label: '操作', name:'operation', index:'', fixed: true, width:200, align: 'center',
			formatter: function(cellVal, cellData , rowData){
				// 记录列表数据
				if ( !globalData.worksListData ) {
					globalData.worksListData = {}
				}
				globalData.worksListData[('rowid' + rowData.id)] = rowData;
				if ( rowData.status === 98 ) {
					return getBtnStr ( 'worksOperation', ['edit', 'audit99', 'audit100'], rowData.id );
				} else {
					return getBtnStr ( 'worksOperation', ['edit'], rowData.id );
				}
			}}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}


//投票记录列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//postData    传给服务器的参数
function votereList(tableId, pagerId, postData){
	var listTitle = $('[href=#' + $(tableId).parents('.tabPane').attr('id') + ']').html();
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/vote/record/listBy',
		colModel = [
			{label: '活动ID', name:'relation', index:'relation', fixed: true, width:50, align: 'center'},
			{label: '用户ID', name:'userNo', index:'userNo', align: 'center'},
			{label: '名称', name:'userName', index:'userName', align: 'center'},
			{label: '昵称', name:'nickName', index:'nickName', fixed: true, width:120, align: 'center'},
			{label: '联系方式', name:'phone', index:'phone', fixed: true, width:120 , align: 'center'},
			{label: '投票目标', name:'target', index:'target', fixed: true, width:80 , align: 'center',
			formatter: function(cellVal, cellData , rowData){
				// 记录列表数据
				if ( !globalData.votereListData ) {
					globalData.votereListData = {}
				}
				globalData.votereListData[('rowid' + rowData.id)] = rowData;
				return cellVal;
			}}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, listTitle);
}

//活动列表点击事件
function activeBtnClickFn ( gk, k, id ) {
	globalData[gk][k].fn(id);
}

//获取按键的字符串
function getBtnStr ( gk, arr, id ) {
	var str = '', obj = null;
	$.each(arr, function ( index, val ) {
		obj = globalData[gk][val];
		str += '<button class="btn btn-xs btn-primary" onclick="activeBtnClickFn(\'' + gk + '\', \'' + val + '\', \'' + id + '\')">' + obj.btntxt + '</button> ';
	});
	return str;
}

//活动编辑
function activeEdit ( id ) {
	var rowData = globalData.beautyListData[('rowid' + id)];	
	delete rowData.createTime;
	Common.storageL('ls_partly_bsData', rowData);
	var openurl = 'AddActive.html?editobj=true';
	window.open(openurl, '_self');
}
//作品编辑
function worksEdit ( id ) {
	pageSH('#worksEdit', '.pageBox');
	$('#worksEdit').data('editid', id);
}

// 作品编辑保存提交
function worksEditSave () {
	var $box = $('#worksEdit'),
		id = $box.data('editid');
	var _url = '/ushop-web-admin/vote/candidate/edit',
		_param = getWorksData();
	// 验证表单
	if ( !paramValid( _param, $('#worksEdit') ) ) {
		return false;
	}
	var rowData = globalData.worksListData[('rowid' + id)];
	_param = $.extend({}, rowData, _param);
	delete _param.createTime;
	Common.ajax(_url, 'post', _param, function (data) {
		if ( data.result === 'SUCCESS' ) {
			Common.jBoxNotice( '编辑成功', 'green' );
			pageSH('#worksList', '.pageBox');
		} else {
			Common.jBoxNotice( (data.error_description || '编辑失败，未知错误'), 'red' );
		}
	})
}

// 获取作品表单数据
function getWorksData () {
	var $box = $('#worksEdit'),
		obj = {}, $me, k, v;
	$box.find('.add_form_ipt').each(function(){
		$me = $(this);
		k = $me.attr('name');
		v = $me.val();
		obj[k] = v;
	});
	return obj;
}

// 验证表单数据
function paramValid( p, $box ) {
	var isvalid = 'true', // 是否需要验证
		$me, txt, istrue = true;
	$.each(p, function(k, v) {
		$me = $box.find('[name="' + k + '"]');
		isvalid = $me.attr('data-valid');
		if(!v && (isvalid === 'true')) {
			txt = $me.attr('placeholder') || '请输入正确内容';
			bootsToast($me, '<span style="color: #ff961a">' + txt + '</span>');
			istrue = false;
			return false;
		}
	});
	return istrue;
}

// 作品列表搜索
function worksSearch ( me ) {
	var $me = $(me),
		$box = $me.parent(),
		province = $box.find('[name="province"]').val(),
		electionId = $('#worksList').data('electionId'),
		orderByScore = $box.find('[name="orderByScore"]').val(),
		serialNo = $box.find('[name="serialNo"]').val();
	var queryData = {
		status: '',
		district: province, //地区
		serialNo: serialNo, //站点号
		electionId: electionId,//活动ID
		orderByScore: orderByScore // 排序
	}
	worksList('#worksTable', '#worksPager', queryData);
}

// 模块显示隐藏
// sp 需要显示的元素选择器
// hc 需要隐藏的元素选择器
function pageSH ( sp, hc ) {
	$(hc).addClass('hide');
	$(sp).removeClass('hide');
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
		before_remove: function() {
			$ele
				.removeData('file_url')//删除记录的服务器图片URL数据
				.data('ace_file_input').reset_input();//重置元素
		},
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

//解析URL
function deCodeUrlFn(dataStr){
	var str = dataStr || (document.URL + '').split('?')[1];
	if(str){
		var a = {},
			b = str.split('&'),
			i = 0, s;
		while(s = b[i++]){
			s = (s + '').split('=');
			a[s[0]] = s[1];
		}
		return a;
	}
	return {};
}

//导出为Excel
function toExcel( id, txt ){
	$(('#gview_' + id)).tableExport({
		type:'excel',
		escape: 'false',
		fileName: txt
	});
}