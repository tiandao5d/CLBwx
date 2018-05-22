/**
 * 
 * RobotList.js
 * 用户管理-机器人配置列表
 * 作者：roland
 * 
 * */
var globalData = {};
globalData.regExpName = /^[0-9A-Za-z]{3,20}$/;
globalData.regExpPhone = /^1(3|4|5|7|8)\d{9}$/;
globalData.regNumber = /^\d+?$/;
globalData.regFloatNumber = /^\d*(\.\d{0,2})?$/;
globalData.regExpPwd = /^[\s\S]{6,20}$/;
globalData.regExpEmail = /(^[a-zA-Z0-9_-]+\.?[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$)|(^$)/;
globalData.regExpChinese = /[\u4E00-\u9FA5]/g;
var oldVal = [];
jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('商品管理', '拼购机器人配置' , '夺宝管理后台');
	
	//标签页显示事件
	$('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
	//标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		$(window).trigger('resize.jqGrid');
		onSearch();
	});
	
	
	globalDataFn(function(data){
		//搜索栏选择框赋值
//		$.each(globalData.playerStatusList, function(index, obj){
//			if(index == 0){
//				optionStr += '<option value="">请选择</option>';
//			}
//			optionStr += '<option value="' + obj.value + '">' + obj.desc + '</option>';
//		});
//		$('.selectClassType').html(optionStr);
		
		
		//查询按键
		$('.itemSearch').on('click', onSearch);
		
		//用户数据列表显示
		RobotConfigList('#itemsTable1', '#itemsPager1');
		
		
		
		//用户列表编辑点击确定事件绑定
		$('#determineClick').on('click', determineClickFn);
	});
});
//全局参数
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
		productId = $.trim(box.find('.productId').val()),
		status = $.trim(box.find('.robotStatus').val()),
		table = box.find('.itemGridTable'),
		pager = box.find('.itemGridPager');
	
	var postData = {
		status: status,
		productId: productId
	};
	RobotConfigList('#itemsTable1', '#itemsPager1', postData);
}
//去除悬浮框
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
function determineClickFn(){
	var errStr = '',
		_url = '',
		_param = {};
	var pageModalTitle = $('#pageModalTitle'),
		addAccount = $('#addAccount')
		typeName = pageModalTitle.attr('typeName');
	var buyInputs = addAccount.find('[name=initBuyInputs]').val(),
		minNumber = addAccount.find('[name=minNumber]').val(),
		maxNumber = addAccount.find('[name=maxNumber]').val(),
		upperLimit = addAccount.find('[name=upperLimit]').val(),
		status = globalData.status,
		lowerLimit = addAccount.find('[name=lowerLimit]').val();
	var validTime = globalData.durationArr;	
//	if(typeName == 'addAccount'){	
		if(!buyInputs || !globalData.regNumber.test(buyInputs)){
			Common.jBoxNotice('机器人购买投入不能为空，且为正整数','red');
			return false;
		};
		if(!minNumber || !globalData.regNumber.test(minNumber)){
			Common.jBoxNotice('最少参与数为正整数','red');
			return false;
		};
		if(!maxNumber || !globalData.regNumber.test(maxNumber)){
			Common.jBoxNotice('最大参与数为正整数','red');
			return false;
		};
		if(!(maxNumber-minNumber>0)){
			Common.jBoxNotice('最大参与数大于最小参与数','red');
			return false;
		}
		if(!(buyInputs-maxNumber>-1)){
			Common.jBoxNotice('最大参与数不大于机器人购买投入','red');
			return false;
		}
		if(!upperLimit || !globalData.regNumber.test(upperLimit)){
			Common.jBoxNotice('参与间隔上限为正整数','red');
			return false;
		};
		if(!lowerLimit || !globalData.regNumber.test(lowerLimit)){
			Common.jBoxNotice('参与间隔下限为正整数','red');
			return false;
		};
		if(!(upperLimit-lowerLimit>0)){
			Common.jBoxNotice('参与间隔上限大于参与间隔下限','red');
			return false;
		}
		if(validTime.length==0){
			Common.jBoxNotice('请选择服务时间','red');
			return false;
		}
		validTime = JSON.stringify(validTime);
		addLoadingFn();
		_param.robotConfig = {	
				id : globalData.id,			
				productId : globalData.productId ,			
				robotIds : globalData.robotIds,
				maxNumber : maxNumber,
				minNumber : minNumber,
				validTime : validTime,
				upperLimit : upperLimit,
				buyInputs :buyInputs,
				lowerLimit : lowerLimit,
				version :globalData.version,
				status : status	
		}
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/update';
		Common.dataAjaxPost(_url ,_param.robotConfig,function(data){
			if(data.data == 'SUCCESS'){
				Common.jBoxNotice('新增成功','green');				
				RobotConfigList('#itemsTable1', '#itemsPager1');
				$('#pageModal').modal('hide');
			}else{
				Common.jBoxNotice('新增失败','red');								
			}
			removeLoadingFn();
		})
//	}else{
//		window.location.reload();	
//	}
}

//机器人配置列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//orderNo     订单号 字符串类型
//userID   	     用户ID字符串类型
//reload      是否是刷新列表，默认为false，布尔值
//http://10.35.0.66:8080/ushop-web-admin/new/banner/bannerList
function RobotConfigList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/listBy',
		colModel = [
//			{label: '序号',name:'id',index:'id',width:40, align: 'center'},
			{label: '商品ID',name:'productId',index:'productId',width:140, align: 'center'},
			{label: '参与机器人ID数组',name:'robotIds',index:'robotIds',width:140, align: 'center'},
			{label: '机器人购买投入',name:'initBuyInputs',index:'initBuyInputs',width:90 , align: 'center'},
			{label: '机器人剩余投入',name:'buyInputs',index:'buyInputs',width:90 , align: 'center'},
			{label: '最大参与人数',name:'maxNumber',index:'maxNumber',width:80 , align: 'center'},
			{label: '最少参与人数',name:'minNumber',index:'minNumber',width:80 , align: 'center'},
			{label: '参与间隔下限',name:'lowerLimit',index:'lowerLimit',width:100, align: 'center'},
			{label: '参与间隔上限',name:'upperLimit',index:'upperLimit',width:100, align: 'center'},
			{label: '状态',name:'status',index:'status',width:60, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '';
					if(val==100){
						str = '激活';
					}else if(val==101){
						str = '冻结';
					}
					return str;
				}
			},
			{label: '操作',name:'operator',index:'operator',width:150, align: 'center',fixed:true,
				formatter: function(val, cellval , colpos, rwdat){
					var str = '<button class="btn btn-xs btn-primary" onclick="setRobotFn(' + colpos.id + ',\'edit\')">编辑</button> ';
					if(colpos.status == 100){
						str += '<button class="btn btn-xs btn-primary" onclick="closeRobotFn(' + colpos.id + ')">冻结</button> ';
					}else if(colpos.status == 101){						
						str += '<button class="btn btn-xs btn-primary" onclick="chooseRobotFn(' + colpos.id +',' + colpos.robotIds + ')">挑选</button> ';
						str += '<button class="btn btn-xs btn-primary" onclick="startRobotFn(' + colpos.id + ')">激活</button> ';
					}
					return str;
				}
			}
		];
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '机器人配置列表');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
	
}
//机器人列表
function RobotList(tableId, pagerId, postData, reload){
	globalData.newRobotIds = [];
	 if(!postData){
    	postData = {};
    }
    postData.rowNum = 100;
    postData.usage = 1;
    postData.multiboxonly =10;
	var gridUrl = Common.DOMAIN_NAME +'/ushop-web-admin/user/robot/listBy';
		colModel = [
			{label: '序号',name:'id',index:'id',width:40, align: 'center'},
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
			    	if(globalData.newRobotIds.length>99){
						globalData.newRobotIds = [];
					}
					globalData.newRobotIds.push(colpos.id);
					globalData.hadChoose = false;
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
   
	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '拼购机器人列表');
	//$('#gview_itemsTable1 #itemsTable1_rn').css('display','none');
	//$('#gview_itemsTable1 td[title]').css('display','none');
//	$('#determineClick').css('display','none');、
	
}
//设置机器人
function setRobotFn(id,type){
	var modal = $('#pageModal');
	modal.modal('show');
	var modal = $('#pageModal'),
		pageModalTitle = $('#pageModalTitle'),
		pageModalItem1 = modal.find('.pageModalItem1');
	var determineClick = $('#determineClick');
//	if(typeName == 'addTxtAccount'){
//		$('#addTxtAccount').removeClass('hide');
//		$('#addAccount').addClass('hide');
//	}else if(typeName == 'addAccount'){
//		$('#addTxtAccount').addClass('hide');
//		$('#addAccount').removeClass('hide');
//	}
	if(type == 'edit'){			
		var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/getById?id=' + id;
		Common.dataAjax(_url,function(data){
			if(data.error_description){
				Common.jBoxNotice('请求机器人配置数据错误','red');
				return false
			}
			if(data.robotConfig){
				var recordList = data.robotConfig;
				$.each(recordList,function(key,val){
					if(pageModalItem1.find('[name='+key+']').length>0){
						pageModalItem1.find('[name='+key+']').val(val);
					}
				});
				if(recordList.status==101){
					determineClick.removeClass('hide');
				}else{
					determineClick.addClass('hide');
				}
				globalData.durationArr = JSON.parse(data.robotConfig.validTime);
				globalData.id = recordList.id;
				globalData.productId = recordList.productId;
				globalData.robotIds = recordList.robotIds;
				globalData.status = recordList.status;
				globalData.version = recordList.version;
				globalData.isSubmit = false;
				checkedDurationFn(type)
			}
			modal.modal('show');
		})
	}else{
		pageModalItem1.find('input').val('');
		globalData.isSubmit = true;
		modal.modal('show');
		determineClick.removeClass('hide');
	}
}
//挑选时间段
function checkedDurationFn(type){
	var checkedDuration = $('#checkedDuration');
	var checkedAll = $('#checkedAll');
		if(type=='add'){			
			globalData.checkedAll = false;
			globalData.durationArr = [];
			checkedDuration.find('[name=checkedDuration]').removeAttr('checked')
			checkedAll.removeAttr('checked');
		}else if(type=='edit'){
			if(globalData.durationArr.length==24){
				checkedAll.prop('checked',true)
				globalData.checkedAll = true;
			}else{
				checkedAll.removeAttr('checked');
				checkedDuration.find('[name=checkedDuration]').removeAttr('checked')
				globalData.checkedAll = false;
			}
			$.each(globalData.durationArr,function(i,o){
				checkedDuration.find('#'+o).prop('checked',true)
			})
		}
	
	checkedAll.unbind('change').on('change',function(){
		globalData.checkedAll = !globalData.checkedAll;
		if(globalData.checkedAll){
			checkedDuration.find('[name=checkedDuration]').prop('checked',true)
			globalData.durationArr = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
//			globalData.checkedAll = false;
		}else{
			checkedDuration.find('[name=checkedDuration]').removeAttr('checked')
			globalData.durationArr = [];
//			globalData.checkedAll = true;
		}
	});
	checkedDuration.unbind('change').on('change','[name=checkedDuration]',function(e){
		var target = e.target;
		var val = $(target).prop('id');
		var checkedDurationList = checkedDuration.find('[name=checkedDuration]');
		globalData.hasChecked = false;
		$.each(checkedDurationList,function(i,o){
			if($(o).prop('checked')){
				globalData.hasChecked = true
			}
		})
		if(!globalData.hasChecked){
			checkedAll.removeAttr('checked');
			globalData.checkedAll=false;
		}
		if($(target).prop('checked')){
			globalData.durationArr.push(val);
		}else{
			//var index = globalData.durationArr.indexOf(Number(val),0);
			var length = globalData.durationArr.length,index=0;
			for(var i=0;i<length;i++){
				if(val==globalData.durationArr[i]){
					index = i;
				}
			}		
			globalData.durationArr.splice(index,1);
		}
	});
}

function chooseRobotFn(id,robotIds){
	globalData.id = id;
	if(robotIds){		
		robotIds = robotIds.join(',')
		robotIds = robotIds.split(',');
	}else{
		globalData.robotIds = [];
		robotIds = [];
	}
	globalData.robotIds = [];
	var length = robotIds.length;
	for(var i=0;i<length;i++){
		globalData.robotIds.push(parseInt(robotIds[i]))
	}
	$('#lotteryProduct').addClass('hide');
	$('#lotteryRobot').addClass('hide');
	$('#chooseRobot').removeClass('hide');
	var chooseRobotIds = $('#chooseRobotIds');
	chooseRobotIds.html('['+globalData.robotIds+']')
	var postData ={
		playerStatus : 100
	}
	RobotList('#itemsTable2', '#itemsPager2', postData);
	$('#itemsTable2.itemGridTable').on('click','tr',function(){
		var id = $(this).prop('id');
		var checked = $('#jqg_itemsTable2_'+id).prop('checked');
		
		id = parseInt(id);
		var index = globalData.robotIds.indexOf(id);
		if(checked){
			if(index<0){
				globalData.robotIds.push(id);
			}
		}else{
			globalData.robotIds.splice(index,1)
		}		
		chooseRobotIds.html('['+globalData.robotIds+']');
	});
}
//提交
function submitRobotIds(){
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/insert';
	var robotIds = [],length = globalData.robotIds.length;
	for(var i=0;i<length;i++){
		robotIds.push(parseInt(globalData.robotIds[i]))
	}
	if(robotIds.length==0){
		Common.jBoxNotice('请选择机器人','red');
		return false
	}
	robotIds = JSON.stringify(robotIds);
	Common.dataAjaxPost(_url,{id:globalData.id,robotIds:robotIds},function(data){
		if(data.data=='SUCCESS'){
			Common.jBoxNotice('添加机器人数组成功','green');
			goBack()
		}else{
			Common.jBoxNotice('添加机器人数组失败','red');
		}
	})
}
//清空机器人
function clearRobotIds(){
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/clear';
	Common.dataAjaxPost(_url,{id:globalData.id},function(data){
		if(data.data=='SUCCESS'){
			globalData.robotIds = [];
			globalData.hadChoose = false;
			$('#chooseRobotIds').html('');
			Common.jBoxNotice('清空机器人数组成功','green');
			goBack()
		}else{
			Common.jBoxNotice('清空机器人数组失败','red');
		}
	})
}
//激活机器人
function startRobotFn(id){
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/start';
	Common.dataAjaxPost(_url,{id:id},function(data){
		if(data.data=='SUCCESS'){
			Common.jBoxNotice('激活机器人成功','green');
			goBack();
		}else{
			Common.jBoxNotice('激活机器人失败','red');
		}
	})
}
//冻结机器人
function closeRobotFn(id){
	var _url = Common.DOMAIN_NAME + '/ushop-web-admin/spellBuy/robot/close';
	Common.dataAjaxPost(_url,{id:id},function(data){
		if(data.data=='SUCCESS'){
			Common.jBoxNotice('冻结机器人成功','green');
			goBack();
		}else{
			Common.jBoxNotice('冻结机器人失败','red');
		}
	})
}
//随机挑选机器人
function randomRobert(type){
	if(type==2){
		if(globalData.hadChoose){
			Common.jBoxNotice('该页机器人已全部选完，请在其他页面挑选','green');
			return false;
		}
		var length = globalData.newRobotIds.length;
		for(var i=0;i<length;i++){
			var id = globalData.newRobotIds[i];
			var index = globalData.robotIds.indexOf(id);
			var checked = $('#jqg_itemsTable2_'+id).prop('checked');
			if(!checked){
				if(index<0){
					$('#jqg_itemsTable2_'+id).trigger('click')
				}
			}
		}
		globalData.hadChoose = true;
		$('#chooseRobotIds').html('['+globalData.robotIds+']');
		return false;
	}
	var n = Math.floor(Math.random()*globalData.newRobotIds.length);
	var length = '';
	var robertArr = globalData.newRobotIds;
	var robertIds = [],s='';
	for(var i=0;i<n;i++){
		s =	Math.floor(Math.random()*robertArr.length);
		robertIds.push(parseInt(robertArr.splice(s,1)));
	}
	robertIds = [].concat.apply([],robertIds);
	var length = robertIds.length;
	if(length==0){
		Common.jBoxNotice('该页机器人已全部选完，请在其他页面挑选','green');
		if(robertArr.length==0){return false}
		robertIds=robertArr;
		robertArr = [];
		length = robertIds.length;
	}
	for(var i=0;i<length;i++){
		var id = robertIds[i];
		var index = globalData.robotIds.indexOf(id);
		var checked = $('#jqg_itemsTable2_'+id).prop('checked');
		if(!checked){
			if(index<0){
				$('#jqg_itemsTable2_'+id).trigger('click')
			}
		}
	}
	$('#chooseRobotIds').html('['+globalData.robotIds+']');
}
//返回
function goBack(n){
		$('#lotteryRobot').removeClass('hide');
		$('#chooseRobot').addClass('hide');
		RobotConfigList('#itemsTable1', '#itemsPager1');
}
//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'机器人配置列表'});
}
//文本输入限制两位小数
function limitNum(e){
	var id = $(e).attr('id');
	if(!id){
		throw new Error('调用方法时，输入框须有ID')
	}
	var newVal = $('#'+id).val();
	if(globalData.regFloatNumber.test(newVal)||!newVal){
		 oldVal[id] = newVal;
	}else{
		$('#'+id).val(oldVal[id]||'');
	}
}