/**
 * 
 * IntegralConfig.js
 * 积分管理-积分配置
 * 作者：xulin
 * 
 * */


jQuery(function($) {
	
	//菜单面包屑导航等配置显示
	Common.menuNavContent('积分管理', '积分配置','积分管理后台');
	
	//只能选择到月份
//	$(".form_datetime.mm").datetimepicker({
//		format:'yyyy-mm-dd',
//		autoclose:true,
//		language: 'zh-CN',
//		startView: 3,
//		maxView: 4,
//		minView:3
//	});	
	jeDate({
		dateCell:"#xlgridBox .start",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	jeDate({
		dateCell:"#xlgridBox .end",
		format:"YYYY-MM-DD",
		isTime:false //isClear:false,
	});
	
	$('#integralSave').on('click', function(){
		var url = Common.DOMAIN_NAME + '/ushop-web-admin/admin/pointsTask/save',
			isNull = false,
			data = {},
			form = $('#integralForm');
		form.find('.integralControl').each(function(index, obj){
			if(!$(obj).val()){
				$(obj).after('<div class="formValidation">不能为空</div>')
				isNull = true;
			}
			data[obj.name] = obj.value;
		});
		if(isNull == false){
			$.ajax({
				type: "post",
				url: url,
				data: data,
				success: function(data){
					var obj = JSON.parse(data);
					if (obj.status != undefined && obj.status == "success") {
						alert('配置成功！');
					} else {
						alert('配置失败！');
					}
					
				}
			});
		}
		return false;
	});
	
	
	//下拉框数据填写
	typeFn();
});


//下拉框数据填写
function typeFn(callback){
	var url = Common.DOMAIN_NAME + '/ushop-web-admin/task/getConstants',
		str = '',
		formatData = [];
	callback = callback ? callback : function(){};
	Common.dataAjax(url, function(data){
		str = '';
		$.each(data['taskConditionList'], function(index, obj) {
			str += '<option value="' + obj.id + '">' + obj.val + '</option>';
			$('.taskConditionList').html(str);
		});
		str = '';
		$.each(data['fundTypeList'], function(index, obj) {
			str += '<option value="' + obj.id + '">' + obj.val + '</option>';
			$('.fundTypeList').html(str);
		});
		str = '';
		$.each(data['fundUsageList'], function(index, obj) {
			str += '<option value="' + obj.id + '">' + obj.val + '</option>';
			$('.fundUsageList').html(str);
		});
		callback.call(this, data);
	})
}

