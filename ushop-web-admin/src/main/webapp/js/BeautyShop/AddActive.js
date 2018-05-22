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
	var urlObj = deCodeUrlFn();
	globalData.localobj = Common.storageL('ss_partly_addBS', undefined, true);
	try {
		if ( urlObj.editobj ) {
			globalData.editobj = Common.storageL('ls_partly_bsData');
		}
	} catch(err) {}
	//菜单面包屑导航等配置显示
	Common.menuNavContent('投票活动管理', (urlObj.editobj ? '编辑活动' : '新增活动'), '运营管理后台');
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

	//日期选择器绑定
	$('.form_datetime.dd').datetimepicker({
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


	//次数上限表单设置
	$('.limited_radio').on('change', function() {
		var $this = $(this),
			ipt = $this.parents('.form-group').find('.limited');
		if($this.val() === '0') {
			ipt[0].disabled = false;
			ipt.val(ipt.attr('oldval') || '');
		} else {
			ipt[0].disabled = true;
			ipt.attr('oldval', ipt.val());
			ipt.val('');
		}
	});
	
	// 正整数限制
	$('.numzz').on('change', function(){
		var $me = $(this),
			v = Math.abs(parseInt($me.val()));
		if ( !(v > 0) ) {
			v = '';
		}
		$me.val(v);
	});
	// 奖等选择渲染
	$('.level_ps').on('change', function() {
		var v = parseInt(this.value);
		$('#level_ps_vote').html(getLevelStr(v));
	}).trigger('change');
	
	endingFileFn();
	//图片上传
	bindFileInput($('.url'));
}


// 添加结束公告页面，事件绑定等
function endingFileFn() {
	var ed = $('[name="ending"]'), // 显示框
		ef = $('[name="ending_file"]'); // 文件选择框
	ef.on('change', function() {
		var me = this,
			rf = new FileReader(),
			_file = this.files[0];
		if(_file) {
			rf.readAsDataURL(_file);
			rf.onload = function() {
				// result是图片的base64数据，可以用img标签显示
				var b64 = rf.result || '';
				if ( b64.toLowerCase().indexOf('data:text/htm') === 0 ) {
					ed.val(rf.result);
				} else {
					Common.jBoxNotice('不是HTML文件', 'red');
				}
			}
		}
	});
}

//所有需要从服务器加载的数据请求
function reloadDataFn() {
	//省份请求初始化
	Common.ajax('../../js/provinces.json', 'get', {}, function(data) {
		globalData.provincesData = data;
		selectInitFn(data, 'desc', 'value', '.province'); //省份的select
		if(globalData.editobj) {
			assignFrom(globalData.editobj);
		} else if ( globalData.localobj ) {
			assignFrom(globalData.localobj);
		}
	});
}

//添加banner图片
function addBannerImg() {
	var ibox = $('#banner_img_show'),
		$box = $('#active_banner'),
		fileEle = $box.find('[name="url"]'),
		oEle = $box.find('[name="options"]');
	var obj = {
		'key': oEle.val(),
		'value': fileEle.data('file_url')
	}
	if ( !(obj['value']) ) {
		Common.jBoxNotice('请选择图片！', 'red');
		return false
	}
	if ( !(obj['key']) ) {
		Common.jBoxNotice('请输入banner关键字！', 'red');
		return false
	}
	ibox.html((ibox.html() + getImgStr(obj)));
	fileEle.data('ace_file_input').reset_input();
	oEle.val('');
	$box.modal('hide');
}

// 添加自定义参数
function addParamsImg () {
	var $box = $('#active_params'),
		pbox = $('#params_list'),
		arr = [
			{'key': '玩法', 'value': '1'}
		],
		k, v, $me, i, str = '';
	for ( i = 1; i < 9; i++ ) {
		$me = $(('[data-val="value' + i + '"]'));
		k = $me.attr('data-key');
		v = $me.val();
		arr[i] = {'key': k, 'value': v}
	}
	str = getParamsStr(arr);
	if ( str ) {
		$('#params_list').data('paramObj', arr).html(str);
		$box.modal('hide');
	}
}

// 获取奖等的HTML字符串
function getLevelStr ( num ) {
	function afn ( s, i ) {
		return ('<div class="form-group">'+
				'<label class="col-sm-4 control-label">' + s + '</label>'+
				'<div class="col-sm-8">'+
					'<input type="text" data-key="' + s + '" data-val="value' + i + '" class="form-control" placeholder="例如0|1|2">'+
				'</div>'+
			'</div>');
	}
	function bfn ( s, i ) {
		return ('<input class="hide" type="text" value="0" data-key="' + s + '" data-val="value' + i + '">');
	}
	var b = '', i = 0;
	for ( i = 0; i < 3; i++ ) {
		if ( i < num ) {
			b += afn(('被投票者参与条件' + (i + 1)), (i + 3));
		} else {
			b += bfn(('被投票者参与条件' + (i + 1)), (i + 3));
		}
	}
	for ( i = 0; i < 3; i++ ) {
		if ( i < num ) {
			b += afn(('投票者参与条件' + (i + 1)), (i + 6));
		} else {
			b += bfn(('投票者参与条件' + (i + 1)), (i + 6));
		}
	}
	return b;
}

// 自定义参数添加
function getParamsStr ( arr ) {
	var str = '', istrue = true;
	$.each(arr, function ( index, obj ) {
		if ( !obj['value'] ) {
			istrue = false;
			Common.jBoxNotice((obj['key'] + '不能为空'), 'red');
			return false;
		}
		str += '<tr><td>' + obj['key'] + '</td><td>' + obj['value'] + '</td></tr>';
	});
	if ( !istrue ) {
		return '';
	}
	str = 	'<table class="table table-striped table-bordered text-center table-hover">'+
				'<thead>'+
					'<tr><td>key值</td><td>value值</td></tr>'+
				'</thead>'+
				'<tbody>'+
					str+
				'</tbody>'+
			'</table>';
	return str;
}

//获取图片排版的str
function getImgStr(obj) {
	var str =
		'<div class="alert alert-success alert-dismissible banner_item_img" role="alert">' +
		'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><i class="ace-icon fa fa-times"></i></button>' +
		'<img width="50" height="50" src="' + obj['value'] + '">' +
		'<span>　' + obj['key'] + '</span>' +
		'</div>';
	return str;
}

//添加和编辑活动
function addEditActive() {
	var _url = '/ushop-web-admin/vote/election/add',
		_param = getParam(),
		txt = '新增成功';
	if(!paramValid(_param)) {
		return false;
	}
	if(globalData.editobj) {
		_url = '/ushop-web-admin/vote/election/edit';
		_param = $.extend({}, globalData.editobj, _param);
		txt = '编辑成功'
	}
	Common.ajax(_url, 'post', _param, function(data) {
		if(data.result === 'SUCCESS') {
			Common.jBoxNotice(txt, 'green');
		} else {
			Common.jBoxNotice((data.error_description || '未知错误'), 'red');
		}
	});
}
//获取表单数据
function getParam() {
	var box = $('#form_box'),
		o = {},
		$me, k, v;
	box.find('.add_form_ipt, .add_form_radio:checked').each(function() {
		$me = $(this);
		k = $me.attr('name');
		v = $me.val();
		// 正整数约束
		if ( $me.hasClass('numzz') ) {
			v = Math.abs(parseInt(v));
		}
		o[k] = v;
	});
	box.find('.add_form_limit').each(function() {
		$me = $(this);
		var l = $me.find('.limited_radio:checked').val(),
			ipt = $me.find('.limited');
		k = ipt.attr('name');
		v = '';
		if(l === '0') {
			v = parseInt(ipt.val());
		} else if(l === '1') {
			v = -1
		}
		o[k] = v;
	});
	o.header = (function() {
		var arr = [],
			$me, k, v;
		box.find('.banner_item_img').each(function() {
			$me = $(this);
			k = $me.find('span').text(),
				v = $me.find('img').attr('src');
			arr[arr.length] = {
				"key": k,
				"value": v
			}
		});
		if ( arr.length > 0 ) {
			return JSON.stringify(arr);
		} else {
			return '';
		}
	})();
	o.params = $('#params_list').data('paramObj') || [];
	o.params = JSON.stringify(o.params);
	
	try {
		var noRepArr = []; // 数组去重
		$.each(o.blacklist.split(' '), function(v, i) {
			if(v && !noRepArr.indexOf(v)) {
				noRepArr[noRepArr.length] = v;
			}
		});
		o.blacklist = JSON.stringify(noRepArr);
	} catch(err) {
		o.blacklist = '';
	}
	return o;
}

//表单赋值
function assignFrom(o) {
	if(!(o instanceof Object)) {
		Common.jBoxNotice('参数错误', 'red');
		return false;
	}
	var box = $('#form_box'),
		$me, psele, str;
	$.each(o, function(k, v) {
		$me = box.find('[name="' + k + '"]');
		if($me.hasClass('limited')) {
			psele = $me.parents('.add_form_limit');
			if((v + '') === '-1') { // 无限
				psele.find('.limited_radio[value="1"]')[0].checked = true;
			} else { // 有限
				psele.find('.limited_radio[value="0"]')[0].checked = true;
				psele.find('.limited').val(v)[0].disabled = false;
			}
		} else if($me.attr('type') === 'radio') {
			box.find('[name="' + k + '"][value="' + v + '"]')[0].checked = true;
		} else if(k === 'header') {
			try {
				str = '';
				$.each(JSON.parse(v), function(index, obj) {
					str += getImgStr(obj);
				});
				$('#banner_img_show').html(str);
			} catch (err) {}
		} else if ( k === 'params' ) {
			try {
				$('#params_list').html(getParamsStr(JSON.parse(v)));
			} catch (err) {}
		} else if ( k === 'blacklist' ) {
			try {
				$me.val(JSON.parse(v).join(' '));
			} catch (err) {}
		} else {
			$me.val(v);
		}
	});
}

// 验证表单数据
function paramValid(p) {
	var box = $('#form_box'),
		isvalid = 'true', // 是否需要验证
		$me, txt, istrue = true;
	Common.storageL('ss_partly_addBS', p, true);
	$.each(p, function(k, v) {
		$me = box.find('[name="' + k + '"]');
		isvalid = $me.attr('data-valid');
		if(!v && (isvalid === 'true')) {
			txt = $me.attr('placeholder') || '请输入正确内容';
			bootsToast($me, '<span style="color: #ff961a">' + txt + '</span>');
			istrue = false;
		} else if ( (k === 'name') && !( v.length < 16 )  ) {
			bootsToast($me, '<span style="color: #ff961a">16个字符以内</span>');
			istrue = false;
		} else if ( (k === 'cutOffTime') && !( ttValid(p.enrollTime, p.cutOffTime) )  ) {
			bootsToast($me, '<span style="color: #ff961a">报名结束时间必须大于报名开始时间</span>');
			istrue = false;
		} else if ( (k === 'voteTime') && !( ttValid(p.cutOffTime, p.voteTime) )  ) {
			bootsToast($me, '<span style="color: #ff961a">投票开始时间必须大于报名结束时间</span>');
			istrue = false;
		} else if ( (k === 'endTime') && !( ttValid(p.voteTime, p.endTime) )  ) {
			bootsToast($me, '<span style="color: #ff961a">投票结束时间必须大于投票开始时间</span>');
			istrue = false;
		} else if ( (k === 'settTime') && !( ttValid(p.voteTime, p.settTime, p.endTime) )  ) {
			bootsToast($me, '<span style="color: #ff961a">清算时间必须在投票时间之间</span>');
			istrue = false;
		} else if ( $me.hasClass('numzz') && !( v > 0 ) && $me.parents('.add_form_limit').find('.limited_radio:checked').val() === '0' ) {
			bootsToast($me, '<span style="color: #ff961a">必须是大于0的整数</span>');
			istrue = false;
		}
		if ( !istrue ) {
			return false;
		}
	});
	return istrue;
}

// 时间验证
function ttValid ( t1, t2, t3 ) {
	t1 = +new Date(t1);
	t2 = +new Date(t2);
	t3 = t3 ? +new Date(t3) : false;
	if ( t3 ) {
		if ( t1 < t2 && t2 < t3 ) {
			return true;
		}
	} else {
		if ( t1 < t2 ) {
			return true;
		}
	}
	return false;
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
				size = 300,
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
				.removeData('file_url') //删除记录的服务器图片URL数据
				.data('ace_file_input').reset_input(); //重置元素
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
function deCodeUrlFn(dataStr) {
	var str = dataStr || (document.URL + '').split('?')[1];
	if(str) {
		var a = {},
			b = str.split('&'),
			i = 0,
			s;
		while(s = b[i++]) {
			s = (s + '').split('=');
			a[s[0]] = s[1];
		}
		return a;
	}
	return {};
}

//导出为Excel
function toExcel() {
	$('#gview_itemsTable1').tableExport({
		type: 'excel',
		escape: 'false',
		fileName: '常规活动任务列表'
	});
}