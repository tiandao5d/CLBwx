/**
 * 
 * GameUpload.js
 * 游戏列表
 * 作者：xulin
 * 
 * */
//硬性数据
"use strict";
var dropzoneBase = {//默认配置
	previewTemplate: $('#preview-template').html(),
    addRemoveLinks: true,//上传文件可以删除
    dictFallbackMessage: '您的浏览器版本太旧',
    dictInvalidFileType: '文件类型被拒绝',
    dictFileTooBig: '文件大小{{filesize}}M，限制最大为{{maxFilesize}}M',
    dictCancelUpload: '取消上传链接',
    dictResponseError: '服务器错误，错误代码{ { statusCode } }',
    dictCancelUploadConfirmation: '是否取消',
    dictMaxFilesExceeded: '文件数量超出',
    dictRemoveFile: '删除文件'
},
dropzoneIcon, dropzoneImg, dropzoneRar;

jQuery(function($) {
	var urlData = deCodeUrlFn();//获取链接地址参数
	//左侧菜单显示
	if(urlData.gameId){
		Common.menuNavContent('游戏管理', '游戏详情','游戏管理后台');
	}else{
		Common.menuNavContent('游戏管理', '游戏上传','游戏管理后台');
	}
	
	
	//文件上传初始化
	Dropzone.autoDiscover = false;//不允许自动检测上传
	gameUpload();//游戏包上传
	iconUpload();//游戏图标上传
	imageUpload();//游戏简介图片上传
	
	//json文件上传
	bindFileInput($('#page_form').find('.cp_file'));
	
	
	reloadInitFn(urlData);//数据初始化并发请求，并展现第一个列表
	eventBindFn();//页面元素事件绑定
});


//绑定ace的文件选择方法
//eleId input元素的ID
function bindFileInput($ele) {
	$ele.ace_file_input({
		btn_choose: '上传',
		btn_change: '更换',
		no_file: '没有文件',
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
			if(!(_type == 'json')) {
				Common.jBoxNotice('必须是json格式的文件', 'red');
				return false;
			}
			if(size && !(_size < sizeb)) {
				Common.jBoxNotice(('限制图片大小为' + size + 'KB'), 'red');
				return false;
			}
			return true;
		},
		before_remove: function(){
			$('#page_form').find('[name="extraParam"]').val('');
			$('#levelModal').html('');
			return true;
		},
		preview_error: function(filename, error_code) {}
	}).on('change', function() {
		var $me = $(this);
		Common.jBoxLoading('show', '', $('#page_form').find('.extraParam'), 20);
		imageUpdataFn($me, function(_url){
			if(!_url){
				$me.removeData('file_url').data('ace_file_input').reset_input();
				Common.jBoxNotice('上传失败！', 'red');
				Common.jBoxLoading('hide', '', $('#page_form').find('.extraParam'));
				return false;
			}
			Common.ajax({//这里不解析返回内容
				url: _url,
				type: 'get',
				dataType: 'text'
			}, function(data){
				Common.jBoxLoading('hide', '', $('#page_form').find('.extraParam'));
				formatLMStr(data);//整理数据
			}, false);
		});
	});
}

//整理奖等数据
function formatLMStr(data){
	var dobj, arr,
		box = $('#page_form'),
		astr = '', bstr = '', cstr = '';
	try{
		dobj = JSON.parse(data);
	}catch(e){
		Common.jBoxNotice('数据无法解析！', 'red');
		return false;
	}
	if(!(dobj && dobj.prizeLevels)){
		Common.jBoxNotice('数据格式不正确！', 'red');
		return false;
	}
	$.each(dobj.prizeLevels, function(index, obj){
		$.each(obj.levels, function(i, o){
			astr += '<tr><td>' + o.level + '</td><td>' + (o.name || '') + '</td><td>' + o.multiple + '</td><td>' + o.number + '</td></tr>';
		});
	});
	arr = [
		{txt: '中奖面', val: (dobj.winArea*100 + '%')},
		{txt: '最大投注额', val: dobj.maxBetMoney},
		{txt: '发行费用比例', val: (dobj.publishPercent*100 + '%')},
		{txt: '公益金比例', val: (dobj.welfarePercent*100 + '%')},
		{txt: '最小投注额', val: dobj.minBetMoney},
		{txt: '返奖率', val: (dobj.returnRate*100 + '%')}
	];
	if(dobj.drawPattern && dobj.drawPattern.numbers){
		$.each(dobj.drawPattern.numbers, function(index, obj){
			cstr += '<tr><td>' + obj.level + '</td><td>' + obj.boxSize + '</td><td>' + obj.number + '</td></tr>';
		});
	}
	$.each(arr, function(i, o){
		bstr += 
			'<div class="col-xs-6" style="margin-bottom: 5px">'+
				'<label class="control-label col-xs-7 bolder">' + o.txt + '：</label>'+
				'<div class="col-xs-5 no-padding">'+
					'<input type="text" disabled class="form-control" value="' + o.val + '" />'+
				'</div>'+
			'</div>';
	});
	
	bstr = '<div class="form-horizontal row" style="padding: 10px 0;">'+
				bstr+
			'</div>';
	if(cstr){
		cstr =  '<table class="table table-striped table-bordered table-hover">'+
					'<thead>'+
						'<tr><th>开奖号码</th><th>开奖个数</th><th>开出多少个</th></tr>'+
					'</thead>'+
					'<tbody>' + cstr + '</tbody>'+
				'</table>';
	}
	astr =  '<table class="table table-striped table-bordered table-hover">'+
				'<thead>'+
					'<tr><th>奖等编号</th><th>奖等名称</th><th>中奖倍数</th><th>中奖个数</th></tr>'+
				'</thead>'+
				'<tbody>' + astr + '</tbody>'+
			'</table>';
	box.find('[name="extraParam"]').val(data);
	$('#levelModal').html(bstr + cstr + astr);
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
			callback('');
		}
	}, false);
}


//页面元素事件绑定
function eventBindFn(){
	var box = $('#page_form');
	//web游戏不需要上传游戏包
	box.find('[name="appRuntimeEnv"]').on('change', function(){
		if(this.value === '3'){
			box.find('.game_file_box').addClass('hide');
		}else{
			box.find('.game_file_box').removeClass('hide');
		}
	})
}

//初始请求
function reloadInitFn(urlData){
	var ajaxArr = [
			{url: '/ushop-web-admin/account/fundType/list'},//货币数据
			{url: '../../js/provinces.json'},//省份获取
			{url: '/ushop-web-admin/platform/game/type/list'},//游戏分类获取
			{url: '/ushop-web-admin/user/merchant/list'}//厂商获取
		];
	if(urlData.gameId){//编辑游戏
		ajaxArr.push({
			url: ('/ushop-web-admin/platform/game/query/get/' + urlData.gameId)
		});
	}else{//新增游戏
		showAddFormFn();
	}
	Common.ajaxAll(ajaxArr, function(){
		globalData.fundTypeArr = [];//积分类型数据
		globalData.provincesArr = arguments[1] || [];//省份数据
		globalData.gameTypeArr = arguments[2].recordList || [];//游戏分类数据
		globalData.merchantArr = arguments[3].recordList || [];//商家数据
		$.each((arguments[0].recordList || []), function(index, obj){
			if(parseInt(obj.value) > 1001){
				globalData.fundTypeArr.push(obj);
			}
		});
		selectEleFn(globalData.fundTypeArr, 'desc', 'value', $('[name="fundType"]'));
		selectEleFn(globalData.provincesArr, 'desc', 'value', $('[name="province"]'));
		selectEleFn(globalData.gameTypeArr, 'typeName', 'id', $('[name="appType"]'));
		selectEleFn(globalData.merchantArr, 'merchantName', 'merchantNo', $('[name="merchantId"]'));
		
		if(urlData.gameId){
			showDetailsFn(arguments[4]);
		}
	});
}

//select元素赋值
function selectEleFn(arr, nstr, vstr, $ele){
	arr = arr || [];
	var str = '<option value="">请选择</option>';
	$.each(arr, function(index, obj){
		str += '<option value="' + obj[vstr] + '">' + obj[nstr] + '</option>';
	});
	$ele.html(str);
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
			a[s[0]] = decodeURIComponent(s[1]);
		}
		if(!dataStr){globalData.pageParam = a;}
		return a;
	}
	return {};
}

//呈现上传游戏的form模式
function showAddFormFn(){
	var box = $('#page_form');
	$('.hideParam').hide();
	box.find('.submit_btn_box').html('<button class="btn btn-block btn-primary" onclick="submitAddFn()">提交</button>');
}

//显示详情数据
//1：下架，2：上架，3：审计中，4：审核不通过，5：测试中
function showDetailsFn(data){
	if(!(data && data.app && data.images)){
		Common.jBoxNotice('数据错误', 'red');
		return false;
	}
	var box = $('#page_form');
	box.find('.uploadFile').addClass('sheltered');//禁止上传文件
	//切换按键，下架状态才能编辑
	if(data.app.status === 1){
		box.find('.submit_btn_box').html('<button class="btn btn-block btn-primary" onclick="formEditFn()">编辑</button>');
	}

	globalData.gameData = data;
	//隐藏游戏包上传，H5游戏不用传游戏包
	if(data.app.appRuntimeEnv === 3){
		box.find('.game_file_box').hide();
	}else{
		box.find('.game_file_box').show();
	}
	//详情数据赋值
	$.each(data.app, function(key, val){
		if((key === 'appRuntimeEnv') || (key === 'gameType')){
			box.find('[name="' + key + '"]').attr('disabled', true);
			box.find('[value="' + val + '"][name="' + key + '"]').attr('checked', true);
		}else{
			box.find('[name="' + key + '"]').val(val).attr('disabled', true);
		}
		if(key === 'appIcon'){
			box.find('.fileBoxAppIcon').html(
				'<div class="itemImg">'+
					'<img class="iconImage" src="' + val + '"/>'+
				'</div>'
			);
		}
	});
	
	//详情显示
	formatLMStr(data.app.extraParam);
	
	//截图图片赋值
	var str = '';
	$.each(data.images, function(index, obj){
		str +=  '<div class="itemImg">'+
					'<img class="imgImage" src="' + obj.imagePath + '"/>'+
				'</div>';
	});
	box.find('.fileBoxGameImage').html(str);
}

//进入编辑状态
function formEditFn(){
	var box = $('#page_form');
	box.find('.inputEditor').attr('disabled', false);//可以编辑的字段
	box.find('.uploadFile').removeClass('sheltered');//开放上传文件
	box.find('.submit_btn_box').html('<button class="btn btn-block btn-primary" onclick="submitEditFn()">提交</button>');
}

//提交编辑状态
function submitEditFn(){
	var qf = dropzoneIcon.getQueuedFiles().concat(
			dropzoneImg.getQueuedFiles(),
			dropzoneRar.getQueuedFiles()
		),//所有列队中的文件
		uf = dropzoneIcon.getUploadingFiles().concat(
			dropzoneImg.getUploadingFiles(),
			dropzoneRar.getUploadingFiles()
		);//所有上传中的文件
	if(qf > 0 || uf > 0){
		Common.jBoxNotice('您有正在上传的文件', 'red');
		return false;
	}
	var gameData = globalData.gameData || {},
		param = gameData.app || {},//原游戏数据赋值
		box = $('#page_form'),
		$me, mn, mv, imgArr;
	param.appImages = (function(){
		imgArr = [];
		$.each(gameData.images, function(index, obj){
			imgArr[imgArr.length] = obj.imagePath;
		});
		return (imgArr.join('|,|'));
	})();
	var iconFile = dropzoneIcon.getAcceptedFiles(),
		imgFile = dropzoneImg.getAcceptedFiles(),
		rarFile = dropzoneRar.getAcceptedFiles();
	box.find('.inputEditor').each(function(){
		$me = $(this);
		mn = $me.attr('name');
		mv = $me.val();
		if(mn){
			if(mn === 'merchantId'){//商家名和商家ID在同一个元素中
				param['merchantId'] = mv;
				param['merchantName'] = $me.find('option:checked').text().trim();
			}else{
				param[mn] = mv;
			}
		}
	});
	
	
	//图标数据赋值
	if(iconFile.length > 0){
		try{
			param.appIcon = JSON.parse(iconFile[0].xhr.responseText)['url'];
		}catch(e){}
	}
	
	//图片数据赋值
	if(imgFile.length > 0){
		imgArr = [];
		$.each(imgFile, function(index, obj){
			if(index < 5){
				try{
					imgArr[imgArr.length] = JSON.parse(obj.xhr.responseText)['url'];
				}catch(e){}
			}
		});
		param.appImages = imgArr.join('|,|');
	}
	
	
	//文件包地址赋值
	if(rarFile.length > 0){
		try{
			param.downloadUrl = JSON.parse(rarFile[0].xhr.responseText)['url'];
		}catch(e){}
	}
	
	//数据验证
	if(!gameValidaFn(param)){
		return false;
	}
	var _url = '/ushop-web-admin/platform/game/manager/update';
	Common.ajax(_url, 'post', JSON.stringify(param), function(data){
		if(data.result === 'SUCCESS'){
			Common.openPage('GameList.html');
		}else{
			Common.jBoxNotice((data.error_description || '未知错误'), 'red');
		}
	});
}

//提交新上传的游戏
function submitAddFn(){
	var qf = dropzoneIcon.getQueuedFiles().concat(
			dropzoneImg.getQueuedFiles(),
			dropzoneRar.getQueuedFiles()
		),//所有列队中的文件
		uf = dropzoneIcon.getUploadingFiles().concat(
			dropzoneImg.getUploadingFiles(),
			dropzoneRar.getUploadingFiles()
		);//所有上传中的文件
	if(qf > 0 || uf > 0){
		Common.jBoxNotice('您有正在上传的文件', 'red');
		return false;
	}
	var param = {},
		box = $('#page_form'),
		$me, mn, mv, imgArr;
	var iconFile = dropzoneIcon.getAcceptedFiles(),
		imgFile = dropzoneImg.getAcceptedFiles(),
		rarFile = dropzoneRar.getAcceptedFiles();
		
	box.find('.form-control[name]').each(function(){
		$me = $(this);
		mn = $me.attr('name');
		mv = $me.val();
		if(mn && mv){
			if(mn === 'merchantId'){//商家名和商家ID在同一个元素中
				param['merchantId'] = mv;
				param['merchantName'] = $me.find('option:checked').text().trim();
			}else{
				param[mn] = mv;
			}
		}
	});
	
	//其他数据赋值
	param.gameType = box.find('[name="gameType"]:checked').val() || '';
	param.appRuntimeEnv = box.find('[name="appRuntimeEnv"]:checked').val() || '';
	
	
	//图标数据赋值
	if(iconFile.length > 0){
		try{
			param.appIcon = JSON.parse(iconFile[0].xhr.responseText)['url'];
		}catch(e){}
	}
	
	//图片数据赋值
	if(imgFile.length > 0){
		imgArr = [];
		$.each(imgFile, function(index, obj){
			if(index < 5){
				try{
					imgArr[imgArr.length] = JSON.parse(obj.xhr.responseText)['url'];
				}catch(e){}
			}
		});
		param.appImages = imgArr.join('|,|');
	}
	
	//文件包地址赋值
	if(rarFile.length > 0){
		try{
			var rarData = JSON.parse(rarFile[0].xhr.responseText);
			param.downloadUrl = rarData['url'];
			param.size = rarData['size'];
		}catch(e){}
	}
	
	//数据验证
	if(!gameValidaFn(param)){
		return false;
	}
	var _url = '/ushop-web-admin/platform/game/manager/add';
	Common.ajax(_url, 'post', JSON.stringify(param), function(data){
		if(data.result === 'SUCCESS'){
			Common.openPage('GameList.html');
		}else{
			Common.jBoxNotice((data.error_description || '未知错误'), 'red');
		}
	});
}

//游戏图标上传
function iconUpload(){
	var url1 = '/ushop-web-admin/platform/game/file/uploadPicture';
	dropzoneIcon = new Dropzone('#dropzoneIcon', $.extend(dropzoneBase, {
        url: url1,
	    method: 'post',
	    maxFiles: 1,//最大上传文件数量
	    maxFilesize: 0.5,//最大上传文件大小
	    dictDefaultMessage: '<div>请点击或拖拽上传</div><div>只接受512*512的0.5M以内的图片</div><div>只能上传一张游戏图标</div>',
	    acceptedFiles: '.png,.jpg',//文件格式限制
	    paramName : "picture",
	    autoQueue: false
	}));
	dropzoneIcon.on("addedfile", function(_file) {
		var me = this,
			acceptedFiles = me.getAcceptedFiles();
		if(acceptedFiles.length < 1){
			$(_file.previewElement).find('.dz-image img').on('load', function(){
				if(!(_file.width === 512 && _file.height === 512)){
					Common.jBoxNotice('图片的宽高必须是512*512', 'red');
					me.removeFile(_file);
					return false;
				}
				//url为临时切换，需要临时签字，动态执行上传
				Common.formatUrl(url1, function(newUrl){
					dropzoneIcon.options.url = newUrl;
					setTimeout(function(){
						me.enqueueFile(_file);
					}, 0);
				});
			});
		}else{
			Common.jBoxNotice('图标只能上传一张', 'red');
			me.removeFile(_file);
		}
	});
	dropzoneIcon.on("error", function(_file) {
		Common.jBoxNotice('上传失败,请重新上传', 'red');
		this.removeFile(_file);
	});
}

//游戏简介图片上传
function imageUpload(){
	//上传图片
	var url1 = '/ushop-web-admin/platform/game/file/uploadPicture';
	dropzoneImg = new Dropzone('#dropzoneImg', $.extend(dropzoneBase, {
        url: url1,
        method: 'post',
        maxFiles: 5,//最大上传文件数量
        maxFilesize: 1,//最大上传文件大小
        dictDefaultMessage: '<div>请点击或拖拽上传</div><div>只接受480*320或320*480的1M以内的图片</div><div>最多上传五张游戏简介图片</div>',
        acceptedFiles: '.png,.jpg',//文件格式限制
        paramName : "picture",
    	autoQueue: false
	}));
	dropzoneImg.on("addedfile", function(_file) {
		var me = this,
			acceptedFiles = me.getAcceptedFiles();
		if(acceptedFiles.length < 5){
			$(_file.previewElement).find('.dz-image img').on('load', function(){
				if(acceptedFiles.length < 1){
					if(!((_file.width === 480 && _file.height === 320) || (_file.width === 320 && _file.height === 480))){
						Common.jBoxNotice('图片的宽高必须是480*320或320*480', 'red');
						me.removeFile(_file);
						return false;
					}
				}else{
					if(!((acceptedFiles[0].width === _file.width) && (acceptedFiles[0].height === _file.height))){
						Common.jBoxNotice('所有图片尺寸必须一致', 'red');
						me.removeFile(_file);
						return false;
					}
				}
				//url为临时切换，需要临时签字
				Common.formatUrl(url1, function(newUrl){
					dropzoneImg.options.url = newUrl;
					setTimeout(function(){
						me.enqueueFile(_file);
					}, 0);
				});
			});
		}else{
			Common.jBoxNotice('最多上传5张图片', 'red');
			me.removeFile(_file);
		}
	});
	dropzoneImg.on("error", function(_file) {
		Common.jBoxNotice('上传失败,请重新上传', 'red');
		this.removeFile(_file);
	});
}

//游戏包上传
function gameUpload(){
	//上传图标
	var url1 = '/ushop-web-admin/platform/game/file/uploadPackage';
	dropzoneRar = new Dropzone('#dropzoneRar', $.extend(dropzoneBase, {
        url: url1,
	    method: 'post',
	    maxFiles: 1,//最大上传文件数量
	    maxFilesize: 100,//最大上传文件大小
	    dictDefaultMessage: '<div>请点击或拖拽上传</div><div>只接受100M以内apk或ipa的文件</div><div>只能上传一个游戏包</div>',
	    paramName : "gameApp",
    	autoQueue: false
	}));
	dropzoneRar.on("addedfile", function(_file) {
		var me = this,
			acceptedFiles = me.getAcceptedFiles();
		var system = _file.name.split('.').pop();
		if(!(system === 'apk' || system === 'ipa')){
			Common.jBoxNotice('只接受apk或ipa文件', 'red');
			me.removeFile(_file);
			return false;
		}
		if(!(acceptedFiles.length < 1)){
			Common.jBoxNotice('只能上传个文件', 'red');
			me.removeFile(_file);
			return false;
		}
		//url为临时切换，需要临时签字
		Common.formatUrl(url1, function(newUrl){
			dropzoneRar.options.url = newUrl;
			setTimeout(function(){
				me.enqueueFile(_file);
			}, 0);
		});
	});
	dropzoneRar.on("error", function(_file) {
		Common.jBoxNotice('上传失败,请重新上传', 'red');
		this.removeFile(_file);
	});
}


//表单验证
function gameValidaFn(param){
	var box = $('#page_form');
	if(!param.appName){
		bootsToast(box.find('[name="appName"]'), '<span style="color: #ff961a">请输入游戏名称！</span>');
		return false;
	}
	if(!param.appType){
		bootsToast(box.find('[name="appType"]'), '<span style="color: #ff961a">请选择游戏类型！</span>');
		return false;
	}
	if(!param.appContent){
		bootsToast(box.find('[name="appContent"]'), '<span style="color: #ff961a">请输入游戏描述！</span>');
		return false;
	}
	if(!param.appBrief){
		bootsToast(box.find('[name="appBrief"]'), '<span style="color: #ff961a">请输入一句话简介！</span>');
		return false;
	}
	if(!param.appIcon){
		bootsToast($('#dropzoneIcon'), '<span style="color: #ff961a">请传入游戏图片！</span>');
		return false;
	}
	if(!param.appImages){
		bootsToast($('#dropzoneImg'), '<span style="color: #ff961a">请传入游戏图片！</span>');
		return false;
	}
	if(!param.downloadUrl && ((param.appRuntimeEnv + '') !== '3')){
		bootsToast($('#dropzoneRar'), '<span style="color: #ff961a">请传入游戏包！</span>');
		return false;
	}
	if(!param.packageName){
		bootsToast(box.find('[name="packageName"]'), '<span style="color: #ff961a">请输入包名或H5地址！</span>');
		return false;
	}
	if(!param.extraParam){
		bootsToast(box.find('.extraParam'), '<span style="color: #ff961a">请上传奖组！</span>');
		return false;
	}
	if(!param.appVersion && ((param.appRuntimeEnv + '') !== '3')){
		bootsToast(box.find('[name="appVersion"]'), '<span style="color: #ff961a">请输入游戏版本号！</span>');
		return false;
	}
	if(!param.merchantId){
		bootsToast(box.find('[name="merchantId"]'), '<span style="color: #ff961a">请选择商家！</span>');
		return false;
	}
	if(!param.province){
		bootsToast(box.find('[name="province"]'), '<span style="color: #ff961a">请选择省份！</span>');
		return false;
	}
	if(!param.fundType){
		bootsToast(box.find('[name="fundType"]'), '<span style="color: #ff961a">请选择货币类型！</span>');
		return false;
	}
	if(!param.phone){
		bootsToast(box.find('[name="phone"]'), '<span style="color: #ff961a">请输入客服电话！</span>');
		return false;
	}
	return true;
}


//工具提示
//bootsToast(box.find('.drawtime'), '<span style="color: #ff961a">开奖时间不能为空！</span>');
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
