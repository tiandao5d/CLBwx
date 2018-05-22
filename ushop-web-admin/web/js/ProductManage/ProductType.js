
//全局信息
var globalData = {};
jQuery(function($) {
	var optionStr = '';
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('商品管理', '商品分类列表','夺宝管理后台');
    //标签页显示事件
    $('.xltab-box a[data-toggle="tab"]').eq(0).tab('show');
    //标签切换时，触发页面宽度改变事件，以便使得表格能够适应新标签的宽度
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        $(window).trigger('resize.jqGrid');
    });
    
    
	getTypeNameFn(function(){
		//用户数据列表显示
		ProductTypeList('#itemsTable1', '#itemsPager1');
	});
		
});

//晒单列表
//tableId     表格ID，带有#的string类型
//pagerId     操作栏ID，带有#的string类型
//startDate   起始日期  日期字符串如 '2016-09-06'
//endDate     结束日期  日期字符串如 '2016-09-06'
//orderNo     订单号 字符串类型
//userID   	     用户ID字符串类型
//reload      是否是刷新列表，默认为false，布尔值
//http://10.35.0.66:8080/ushop-web-admin/new/banner/bannerList
function ProductTypeList(tableId, pagerId, postData, reload){
	var gridUrl = Common.DOMAIN_NAME + '/ushop-web-admin/product/type/list'
		colModel = [
			{label: '分类ID',name:'id',index:'id',width:120, align: 'center'},
			{label: '分类名称',name:'typeName',index:'typeName',width:120, align: 'center'},
			{label: '父分类ID',name:'firstTypeId',index:'firstTypeId',width:120, align: 'center'},
			{label: '父分类',name:'firstTypeId',index:'firstTypeId',width:120, align: 'center',
			     formatter: function(cellVal, cellData , rowData){
					$.each(globalData.typeList, function(index, obj) {
						if(cellVal == obj.value){
							cellVal = obj.desc;
							return false;
						}
					});
					return cellVal;
				}
			},
			{label: '排序值',name:'sort',index:'sort',width:120, align: 'center'},
			{label: '商品类型图片',name:'pictureAddress',index:'pictureAddress',width:120, align: 'center',
				formatter: function(val){
					return (val ? '<img height="30" src="' + val + '">' : '没有图片');
				}
			},
			{label: '操作', name:'operation',index:'', width:130, fixed: true, align: 'center',
				formatter: function(val, cellval , colpos, rwdat){
					var str = '<button class="btn btn-xs btn-primary" onclick="editTypeFn(\'' + encodeURIComponent(JSON.stringify(colpos)) + '\')">编辑</button> '+
							  '<button class="btn btn-xs btn-danger" onclick="deleteTypeFn(' + colpos.id + ', ' + cellval.rowId + ')">删除</button> ';
					if(colpos.firstTypeId === 0){ str= '';}
					return str;
				}
			}

		];

	//数据重新呈现，先接触绑定
	$.jgrid.gridUnload(tableId);
	Common.gridBackPaging(tableId, pagerId, gridUrl, colModel, postData, '商品分类');
}

//获取分类名称
function getTypeNameFn(callback){
	callback = callback || function(){};
	var _url = '/ushop-web-admin/product/type/getMap';
	Common.ajax(_url, 'get', {}, function(data){
		globalData.typeList = data.typeMap || [];
		callback();
	});
}

//导出excel表格
function toExcel(){
	$('#gview_itemsTable1').tableExport({type:'excel',escape:'false',fileName:'商品分类列表'});
}

//删除分类
function deleteTypeFn(did, rid){
	Common.jBoxConfirm('提示', '是否删除此条分类', function(index){
		if(index === 1){
			var _url = '/ushop-web-admin/product/type/delete';
			Common.ajax(_url, 'post', {id: did}, function(data){
				if(data.data == 'SUCCESS'){
					Common.jBoxNotice('商品类型删除成功', 'green');
					$('#itemsTable1').delRowData(rid);
				}else{
					Common.jBoxNotice((data.error_description || '商品类型删除失败'), 'red');
				}
			});
		}
	});
}

//添加事件执行
function addTypeFn(){
	var molBox = $('#product_class_m');
	modalContent(molBox.find('.modal-content'), '添加', aeModalStr(), 'onclick="submitDataFn()"');
	bindFileInput(molBox.find('[name="url"]'));
	molBox.modal('show');
}

//编辑事件执行
function editTypeFn(data){
	try{
		data = JSON.parse(decodeURIComponent(data))
	}catch(err){
		data = '';
	};
	if(data){
		var molBox = $('#product_class_m');
		modalContent(molBox.find('.modal-content'), '编辑', aeModalStr(data), 'onclick="submitDataFn(' + data.id + ')"');
		bindFileInput(molBox.find('[name="url"]'));
		molBox.modal('show');
	}else{
		Common.jBoxNotice('数据错误', 'red');
	}
}

//提交编辑和添加
function submitDataFn(id){
	var molBox = $('#product_class_m'),
		_url = '';
	if(molBox.find('.ace-file-overlay').length > 0){
		Common.jBoxNotice('图片上传中，请稍后……', 'red');
		return false;
	}
	var _param = {
		firstTypeId: molBox.find('[name="brandType"]').val(),
		typeName: molBox.find('[name="typeName"]').val(),
		sort: parseInt(molBox.find('[name="sort"]').val()),
		URL: molBox.find('[name="url"]').data('file_url') || molBox.find('[old_img]').attr('old_img')
	};
	if(!_param.typeName){
		Common.jBoxNotice('请输入分类名称', 'red');
		return false;
	}
	if(!(_param.sort > 0)){
		Common.jBoxNotice('请输入正整数的排序值', 'red');
		return false;
	}
	if(!_param.URL){
		Common.jBoxNotice('选择图片', 'red');
		return false;
	}
	if(id){
		_param.id = id;
		_url = '/ushop-web-admin/product/type/update';
	}else{
		_url = '/ushop-web-admin/product/type/add';
	};
	molBox.modal('hide');
	Common.ajax(_url, 'post', _param, function(data){
		if(data.data == 'SUCCESS'){
			Common.jBoxNotice('操作成功', 'green');
			ProductTypeList('#itemsTable1', '#itemsPager1');
		}else{
			Common.jBoxNotice((data.error_description || '操作失败'), 'red');
		}
	})
}

//模态框内容
function modalContent($ele, hStr, bStr, btnFn){
	hStr = hStr || '提示';
	bStr = bStr || '提示';
	btnFn = btnFn || '';
	var str = 
	    '<div class="modal-header">'+
	    	'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
	    	'<h4 class="modal-title">' + hStr + '</h4>'+
	    '</div>'+
	    '<div class="modal-body">' + bStr + '</div>'+
	    '<div class="modal-footer">'+
		'<button type="button" class="btn btn-default" data-dismiss="modal">取消</button>'+
        '<button type="button" class="btn btn-primary" ' + btnFn + '>确定</button>'+
	    '</div>';
    $ele.html(str);
}

//初始化添加或者编辑分类的模态框内容
function aeModalStr(data){
	data = data || {};
	var typeName = data.typeName || '',
		sort = data.sort || '',
		oldImg = data.pictureAddress ? '<img width="60%" old_img="' + data.pictureAddress + '" src="' + data.pictureAddress + '">' : '';
  	var str = 
  		'<div class="form-horizontal">'+
  			'<div class="form-group">'+
  				'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>分类名称</label>'+
  				'<div class="col-xs-8">'+
					'<input name="typeName" class="form-control" value="' + typeName + '" type="text">'+
  				'</div>'+
  			'</div>'+
  			'<div class="form-group">'+
  				'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>父分类</label>'+
  				'<div class="col-xs-8">'+
  					'<select name="brandType" class="form-control" disabled>'+
  						'<option value="1">全部分类</option>'+
  					'</select>'+
  				'</div>'+
  			'</div>'+
  			'<div class="form-group">'+
  				'<label class="col-xs-3 control-label"><i style="color: #f00;">* </i>排序值</label>'+
  				'<div class="col-xs-8">'+
  					'<input name="sort" class="form-control" value="' + sort + '" type="number">'+
  				'</div>'+
  			'</div>'+
  			'<div class="form-group">'+
  				'<div class="col-xs-3 control-label">'+
      				'<label ><i style="color: #f00;">* </i>类型图</label>'+
      				'<div>' + oldImg + '</div>'+
  				'</div>'+
      			'<div class="col-xs-8">'+
      				'<input name="url" type="file">'+
				'</div>'+
			'</div>'+
  		'</div>';
    return str;
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
			$ele.data('ace_file_input').loading();
			var _file = ((files || [])[0]) || {},
				_size = _file.size || 0,
				_name = _file.name || '',
				_type = _name.split('\.').pop(),
				size = 50,
				sizeb = parseInt(size) * 1024;
			if(!((_type == 'png') || (_type == 'jpg'))) {
				Common.jBoxNotice('必须是png,jpg格式的图片', 'red');
				$ele.data('ace_file_input').loading(false);
				return false;
			}
			if(size && !(_size < sizeb)) {
				Common.jBoxNotice(('限制图片大小为' + size + 'KB'), 'red');
				$ele.data('ace_file_input').loading(false);
				return false;
			}
			return true;
		},
		before_remove: function(){
			$ele.removeData('file_url').data('ace_file_input').reset_input();
		},
		preview_error: function(filename, error_code) {}
	}).on('change', function() {
		imageUpdataFn($ele);
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
		$me.data('ace_file_input').loading(false);
		if(data.url) {
			$me.data('file_url', data.url); //记录服务器图片URL数据
			Common.jBoxNotice('上传成功！', 'green');
			callback(data.url);
		} else {
			$me.removeData('file_url').data('ace_file_input').reset_input();
			Common.jBoxNotice((data.error_description || '上传失败'), 'red');
		}
	}, false);
}