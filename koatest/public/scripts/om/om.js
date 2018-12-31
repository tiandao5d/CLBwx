function g(id) {
	return document.getElementById(id);
}
function setNavigation(lottery, sub, item) {
	g("top_om").className = "current";
	g("head_" + lottery).className = "zs_now";
	g(sub).className = "cz_on";
	var radio = g(item)
	if (radio) {
		radio.checked = true;
	}
}

function mouseover(node) {
	$(node).addClass("tr_over");
}

function mouseout(node) {
	$(node).removeClass("tr_over");
}

function mouseoverImg(node) {
	$(node).addClass("img_many");
}

function mouseoutImg(node) {
	$(node).removeClass("img_many");
}

function clickMe(node) {
	$(node).toggleClass("tr_click");
	if (hasFastBet(getChildName())) {
		showFastTable(node);
	}
}

function onsort() {
	$("#loading").show();
}

$(document).ready(function () {
	//setNavigation(lottery, catalog, radioItem);

	$(":radio").click(function () {
		var radioId = $(this).attr("id");
		var last = radioId.substring(5, radioId.length);
		document.location = catalog + last + ".html";
	});

	$("#loading").hide();
	if (hasFastBet(getChildName())) {
		$(".fast").show();
	}
})
$("#om_table").ready(function () {
	$("#om_table").floattableheader({ thead_id: "om_table_head" });
	$("#om_table").tablesorter({
		cssHeader: "normal", cssAsc: "down", cssDesc: "up", sortInitialOrder: "desc",
		headers: { 3: { sorter: false }, 4: { sorter: false } }
	});

	$("#om_table").bind("sortEnd", function () {
		$("#loading").hide();
	});
});

function fastSmall(node) {
	$(".fast").show();
	$(".fast_show").slideDown();
	$(".fast_small").hide();
}
function fastClost() {
	$(".fast_show").slideUp(function () { $(".fast_small").show(); });
}

var clickTRtimer;
var shakeBasketTimer;
var clickTR;
function showFastTable(e) {
	var isExistImgClass = $(e).find("#gdfxzl").hasClass("img_many");
	if (isExistImgClass) return;

	if (clickTRtimer && e == clickTR) {
		clearTimeout(clickTRtimer);
	}
	clickTR = e;
	clickTRtimer = setTimeout(function () {
		//行是否选中，如果没有选中清空号码
		if (!$(e).hasClass("tr_click")) {
			dropNumberFormBasket(e);
		} else {
			//如果选中了，显示悬浮框，飞到号码蓝，添加号码，抖动号码篮
			setTimeout(function () { showFloatPocket(e) }, 200);
			setTimeout(function () {
				flyFloatPocket(e);
				openBasket();
				putNumberIntoBasket(e);
				if (shakeBasketTimer) {
					clearTimeout(shakeBasketTimer);
				}
				shakeBasketTimer = setTimeout("shakeBasket()", 800);
			}, 300);
		}
	}, 200);
}

//从篮子中拿出号码丢掉
function dropNumberFormBasket(tr) {
	//获取tr的内容
	var target = $(tr).find("#content").text();
	//遍历篮子里面的号码
	$(".num_text").find("dl").each(function (i) {
		var temp = $(this).find("dd");
		var childType = $(temp[0]).text();
		var betNum = $(temp[1]).text();
		var content = $(temp[2]).find("span").text();
		if (isBasketContainsNumber(getChildName(), target, content)) {
			removeItem(childType, content, betNum);
			$("#tatalBetCount").text(tatalBetCount);
			$("#totalMoney").text(tatalBetCount * 2);
			$(this).remove();
		}
	});
}

//清空选号
function clearAll() {
	$(".table_box tr").removeClass("tr_click");
	$(".num_text").find("dl").each(function (i) {
		var temp = $(this).find("dd");
		var childType = $(temp[0]).text();
		var betNum = $(temp[1]).text();
		var content = $(temp[2]).find("span").text();
		removeItem(childType, content, betNum);
		$("#tatalBetCount").text(tatalBetCount);
		$("#totalMoney").text(tatalBetCount * 2);
		$(this).remove();
	});
}

function getChildName() {
	var last = radioItem.substring(5, radioItem.length);
	return catalog + last;
}

//浮动口袋
function showFloatPocket(node) {
	$(node).find(".open").show();
	$(node).find(".open").css("opacity", "1");
}

//放飞浮动口袋
function flyFloatPocket(node) {
	$(node).find(".open").animate({ left: "+=800px", top: "+=150px", opacity: 0 }, 500, function () {
		$(this).animate({ left: "60px", top: "-33px" }, 10, function () {
			$(this).css("display", "none");
		});
	});
}

//打开篮子
function openBasket() {
	$(".fast").show();
	$(".fast_small").hide();
	$(".fast_show").slideDown();
}

//放号码进篮子
function putNumberIntoBasket(node) {
	var content = $(node).find("#content").text();
	addToBasket(getChildName(), content);
}

//晃动篮子
function shakeBasket() {
	$(".fast").animate({ right: "8px" }, 100).animate({ right: "0" }, 200);
}

function addToBasket(childName, content) {
	var legalBetRows = obtainLegalBetRows(childName, content);
	for (var i = 0; i < legalBetRows.size() ; i++) {
		var bet = legalBetRows.elements[i];
		var _childType = replaceChildType(catalog, childName, content);
		var betCount = contentBetNum(_childType, content, getChildName());
		addToPlan(_childType, legalBetRows.elements[i], betCount);
	}
}

function addToPlan(_childType, _content, _betNum) {
	var item = new PlanItem(_childType, _content, _betNum);
	addItem(item);
	var html = '';
	html += '<dl>';
	html += '<dt>' + getDescription(_childType) + '</dt>';
	html += '<dd style="display:none">' + _childType + '</dd>';
	html += '<dd style="display:none">' + _betNum + '</dd>';
	html += '<dd><span>' + _content + '</span><a href="javascript:void(0)" onclick="deleteItem(this)">删除</a></dd>';
	html += '</dl>';
	$(".num_text").append(html);
	$("#tatalBetCount").text(tatalBetCount);
	$("#totalMoney").text(tatalBetCount * 2);
}

function goOmBuy(lotteryType) {
	var omContent = '';
	if (items.length == 0) {
		alert("请您选择一注!");
		return;
	}
	$(".num_text").find("dl").each(function (i) {
		var temp = $(this).find("dd");
		var _childType = $(temp[0]).text();
		var _betNum = $(temp[1]).text();
		var _content = $(temp[2]).find("span").text();
		omContent += _childType + ":" + _content + ":" + _betNum + ";";
	});
	document.location.href = "http://www.kuaicaile.com/" + lotteryType + "/index.shtml?zstContent=" + omContent;
}

function chgMenu() {
	//排序期号功能，暂时不开放
}
