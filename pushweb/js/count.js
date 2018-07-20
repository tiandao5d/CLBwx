$(function(){
	$.ajax({
		url			: counturl,
		type		: 'POST',
		data		: {"classname" : classname},
		dataType	: "jsonp",
		cache		: false,
		done		: function(){

		}
	});
});