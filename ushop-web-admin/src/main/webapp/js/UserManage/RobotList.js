/**
 * 
 * RobotList.js
 * 用户管理-用户列表
 * 作者：roland
 * 
 * */

var dropzoneBase = {//默认配置
	previewTemplate: $('#preview-template').html(),
    addRemoveLinks: true,//上传文件可以删除
    dictDefaultMessage: '<div>请点击或拖拽上传</div><div>只接受200*200的图片</div>',
    dictFallbackMessage: '您的浏览器版本太旧',
    dictInvalidFileType: '文件类型被拒绝',
    dictFileTooBig: '文件大小{{filesize}}M，限制最大为{{maxFilesize}}M',
    dictCancelUpload: '取消上传链接',
    dictResponseError: '服务器错误，错误代码{ { statusCode } }',
    dictCancelUploadConfirmation: '是否取消',
    dictMaxFilesExceeded: '文件数量超出',
    dictRemoveFile: '删除文件'
}, dropzoneTxt;
var globalData = {};
globalData.regExpName = /^[0-9A-Za-z]{3,20}$/;
globalData.regExpPhone = /^1(3|4|5|7|8)\d{9}$/;
globalData.regNumber = /^\d+?$/;
globalData.regFloatNumber = /^\d*(\.\d{0,2})?$/;
globalData.regExpPwd = /^[\s\S]{6,20}$/;
globalData.regExpEmail = /(^[a-zA-Z0-9_-]+\.?[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$)|(^$)/;
globalData.regExpChinese = /[\u4E00-\u9FA5]/g;
//操作失败信息
var handleError = {
		content : '操作失败，请稍后重试',
		color :'red',
		autoClose : 3000,
		position : {x:'center',y:50}
};
jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('用户管理', '机器人列表' , '用户管理后台');
	
	//不自动配置Dropzone
	Dropzone.autoDiscover = false;
	//配置图标上传Dropzone
	dropzoneTxtFn();
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
		onSearch();
	});
	
	
	globalDataFn(function(data){
		//搜索栏选择框赋值
		$.each(globalData.playerStatusList, function(index, obj){
			if(index == 0){
				optionStr += '<option value="">请选择</option>';
			}
			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
		});
		$('.selectClassType').html(optionStr);
		
		//日期选择器绑定
		$(".form_datetime.dd").datetimepicker({
			format:'yyyy-mm-dd',
			autoclose:true,
			language: 'zh-CN',
			startView: 2,
			maxView: 4,
			minView:2
		});
		$(".form_datetime[readonly]").dblclick(function(){
			$(this).val('').blur();
		});
		
		//查询按键
		$('.itemSearch').on('click', onSearch);
		
		//用户数据列表显示
		RobotList('#itemsTable1', '#itemsPager1');
		
		
		
		//用户列表编辑点击确定事件绑定
		$('#determineClick').on('click', determineClick);
	});
});

function globalDataFn(callback){
	callback = callback || function(){};
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/player/getConstants';
	Common.dataAjax(_url, function(data, status){
		if(status == 'success'){
			globalData.playerStatusList = data.playerStatusList;
			globalData.playerTypeList = data.playerTypeList;
			callback.call(this, data);
		}else{
			Common.jBoxNotice('数据请求错误', 'red');
			callback.call(this, data);
		}
	});
}

//查询按键点击事件
//http://10.35.0.66:8080//ushop-web-admin/new/banner/bannerList
function onSearch(){
	var me = $(this),
		box = me.parents('.tabPane'),
		id = box.attr('id'),
		userName = $.trim(box.find('[name="userName"]').val()),
		userTel = $.trim(box.find('.userTel').val()),
		selectClassType = $.trim(box.find('.selectClassType').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	
	var postData = {
		loginName: userName,
		playerStatus: selectClassType
	};
	RobotList('#itemsTable1', '#itemsPager1', postData);
}

function removeLoadingFn(){
	$('.loadingEle').remove();
}
//加载进度
function addLoadingFn(){
	var div = $('<div class="loadingEle"></div>'),
		bg = $('<div></div>'),
		con = $('<div></div>'),
		p = $('<p>可能需要1-3分钟，请耐心等待</p>'),
		span = $('<span class="ace-icon fa fa-spin fa-spinner"></span>');
	con.css({
		'position': 'absolute',
		'left': '50%',
		'top': '50%',
		'width': '410px',
		'height': '120px',
		'text-align': 'center',
		'font-size': '30px',
		'color': '#fff',
		'margin': '-60px 0 0 -205px'
	});
	span.css({
		'font-size': '60px',
		'color': '#fff'
	});
	con.append(span).append(p);
	bg.css({
		'width': '100%',
		'height': '100%',
		'background': '#000',
		'opacity': '.6'
	});
	div.css({
		'position': 'fixed',
		'left': '0',
		'top': '0',
		'right': '0',
		'bottom': '0',
		'zIndex': '99999'
	}).append(bg).append(con);
	$('body').append(div)
}
//广告栏编辑点击确定函数
//http://10.35.0.66:8080/ushop-web-admin/new/banner/editBanner
//http://10.35.0.66:8080/ushop-web-admin/new/banner/addBanner
//http://10.35.0.66:8080/ushop-web-admin/new/banner/deleteBanner
function determineClick(){
	var errStr = '',
		_url = '',
		_param = {};
	var pageModalTitle = $('#pageModalTitle'),
		addAccount = $('#addAccount')
		typeName = pageModalTitle.attr('typeName');
	var balance = addAccount.find('[name=balance]').val(),
		loginName = addAccount.find('[name=loginName]').val(),
		pwd = addAccount.find('[name=password]').val(),
		pwdcon = addAccount.find('[name=passwordConfirm]').val(),
		number = addAccount.find('[name=number]').val();
	if(typeName == 'addAccount'){		
		if(!loginName || !globalData.regExpName.test(loginName)){
			Common.jBoxNotice('登录名不能为空,3-20位字符','red');
			return false;
		};
		if(!pwd || globalData.regExpChinese.test(pwd)){
			Common.jBoxNotice('密码不能为空,不可包含汉字','red');
			return false;
		};
		if(!(pwdcon == pwd)){
			Common.jBoxNotice('密码不一致','red');
			return false;
		};
		if(!number || !globalData.regNumber.test(number)){
			Common.jBoxNotice('生成个数为正整数','red');
			return false;
		};
		if(!balance){
			Common.jBoxNotice('账户余额不能为空','red');
			return false;
		};
		if(!globalData.regFloatNumber.test(balance)){
			Common.jBoxNotice('账户余额保留小数点后两位','red');
			return false;
		};
		addLoadingFn();
		_param = {
	
				loginName : loginName,			
				password : pwd ,			
				balance : balance,
				number : number
	
		}
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/user/player/tester/batch/create';
		Common.dataAjaxPost(_url ,_param,function(data){
			if(data.data == 'success'){
				Common.jBoxNotice('新增成功','green');				
				RobotList('#itemsTable1', '#itemsPager1');
				$('#pageModal').modal('hide');
			}else{
				Common.jBoxNotice('新增失败','red');								
			}
			removeLoadingFn();
		})
	}else{
		window.location.reload();	
	}
}

//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//orderNo     订单号 字符串类型
//userID   	     用户ID字符串类型
//reload      是否是刷新列表，默认为false，布尔值
//http://10.35.0.66:8080/ushop-web-admin/new/banner/bannerList
function RobotList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/user/player/listByTester'
	console.log(gridUrl);
		colModel = [
			//{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '用户ID',name:'userNo',index:'userNo',width:140, align: 'center'},
			{label: '账户ID',name:'accountNo',index:'accountNo',width:140, align: 'center'},
			{label: '用户类型',name:'userType',index:'userType',width:80 , align: 'center',
			    formatter: function(val, cellval , colpos, rwdat){
					return '机器人'
				}
			},
			{label: '手机号码',name:'bindMobileNo',index:'bindMobileNo',width:100, align: 'center'},
			{label: '机器人登录名',name:'loginName',index:'loginName',width:100, align: 'center'},
			{label: '注册时间',name:'createTime',index:'createTime',width:120, align: 'center',
			    formatter: function(val, cellval, colpos, rwdat){
			    	return Common.msToTime(val)
			    }
			},
			{label: '状态',name:'status',index:'status',width:60, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					$.each(globalData.playerStatusList,function(i,o){
						if(val == o.value){
							str = o.desc;
						}
					});
					return str;
				}
			}
		];

	$('#gbox_itemsTable2').css('display','none');
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '机器人列表');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	
}

//显示详情
//参数为数据的订单号
//http://10.35.0.66:8080/ushop-web-admin/new/banner/getBannerById?Id=1
function pageModalFn(typeName){
//	rowId = rowId || '';
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	if(typeName == 'addTxtAccount'){
		$('#addTxtAccount').removeClass('hide');
		$('#addAccount').addClass('hide');
	}else if(typeName == 'addAccount'){
		$('#addTxtAccount').addClass('hide');
		$('#addAccount').removeClass('hide');
	}
	modal.modal('show');
	pageModalTitle.attr({'typeName' : typeName});

}
//图标上传
function dropzoneTxtFn(){
//	var delImgUrl = Common.DOMAIN_NAME + '/ushop-web-admin/new/advertisement/deletePicture';
	var url1 = '/ushop-web-admin/user/player/tester/batch/import';
	Common.formatUrl(url1, function(newUrl){
		var noticed = false;
		//上传图标
		dropzoneTxt = new Dropzone('#dropzoneTxt', $.extend(dropzoneBase, {
	        url: newUrl,//Common.DOMAIN_NAME + '/ushop-web-admin/new/advertisement/addPicture',
		    method: 'post',
		    maxFiles: 1,//最大上传文件数量
		    maxFilesize: 0.5,//最大上传文件大小
		    dictDefaultMessage: '<div>请点击或拖拽上传</div><div>只接受0.5M以下文本文档</div>',
//		    acceptedFiles: '.txt',//文件格式限制
		    paramName : "myFile",
		    autoQueue: false
		}));
		dropzoneTxt.on('success', function(_file, ret){
			var me = this,
				acceptedFiles = me.getAcceptedFiles(),
				imgUrlArr = [];
			$.each(acceptedFiles, function(index, obj) {
				imgUrlArr.push($.parseJSON(obj.xhr.response).url);
			});
			noticed = true;
			Common.jBoxNotice('上传成功', 'green');
			me.removeFile(_file);
			$('#pageModal').modal('hide');
			RobotList('#itemsTable1', '#itemsPager1');
		});
		dropzoneTxt.on('removedfile', function(_file){
			
	    	var _fileXhr = _file.xhr || '';
//	    	if(_fileXhr){
//	    		var imgUrl = $.parseJSON(_fileXhr.response).url;
//				Common.dataAjaxPost(delImgUrl, {URL: imgUrl},function(data){
//					if(data.data == 'SUCCESS'){
//						Common.jBoxNotice('删除成功', 'green');
//					}
//				});
			if(!noticed){
				
				Common.jBoxNotice('删除成功', 'green');
			}
				
//	    	}
		});
		dropzoneTxt.on("addedfile", function(_file) {
			noticed = false;
			dropzoneTxt.options.url = newUrl;//Common.DOMAIN_NAME + '/ushop-web-admin/new/advertisement/addPicture';
		var me = this,
				acceptedFiles = me.getAcceptedFiles();
			var system = _file.name.split('.').pop();
			if(system == 'txt'){
				setTimeout(function(){
					dropzoneTxt.enqueueFile(_file);
				},0);
			}else{
				Common.jBoxNotice('只接受TXT文件', 'red');
//				me.removeFile(_file);
			}
		});
		dropzoneTxt.on("error", function(_file) {
			noticed = false;
			var me = this;
			Common.jBoxNotice('上传失败,请更改登录名重新上传', 'red');
//				me.removeFile(_file);
				return false
		});
	});
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'机器人列表'});
}