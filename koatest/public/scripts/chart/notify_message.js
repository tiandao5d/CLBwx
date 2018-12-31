
function notify_refresh(){
	window.location.reload();
}

Notify = {};
Notify.create = function(){
	var html = "<div class='notify_message'>"
					+ "<p>开奖数据已过期，请<a href='javascript:notify_refresh();'><strong>点击刷新</strong></a>。</p>"
					+ "<div class='notify_message_bg'></div>"
				+ "</div>"
	$("body").prepend(html)
}

function refreshPage(periods) {
	if ($.countdown.periodsToSeconds(periods) == 0) {
		Notify.create();
	}
}

function startTimer(lottery){
	var type = "";
	if(lottery=="sd11x5"){
		type = "SD11Y";
	} else if(lottery=="jx11x5") {
		type = "JXDLC";	
	}else if(lottery=="gd11x5") {
		type = "GD11X5";	
	}else{
		type = lottery.toUpperCase();
	}
	
	var url="/lottery/indexAction.jhtml?jsonCallback=?&lotteryType="+type;
	/*$.getJSON(url,function(json){
		if(json){
			$("#timer").countdown({until: json.openSecond+15, compact: true,format: 'HMS',onTick: refreshPage});
		}
	});*/
}
$(document).ready(function(){
	startTimer(lottery);
});