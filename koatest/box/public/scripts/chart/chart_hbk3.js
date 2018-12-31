
var yxq1 = new Set();
var yxq2 = new Set();
var yxq3 = new Set();
var yxq4 = new Set();
var yxq5 = new Set();

var ball_number = '';

//行点击样式
function mouseover(node) {
	$(node).addClass("tr_over");
}

function mouseout(node) {
	$(node).removeClass("tr_over");
}

function clickMe(node) {
	$(node).toggleClass("tr_click");
}
//添加一行
function addRow(playType) {
	var html = '', row = $(".xhq").length;
	if (row < 5) {
		html += '<tr id="yx_kj' + (row + 1) + '" class="xhq">';
		html += '<td class="line_r text_al_l"><a href="javascript:void(0);" class="delete" title="删除" onclick="delectColumn(this)"></a><strong>预选区</strong></td>';
		switch (playType) {
			case "normal": {
				html += '<td colspan="3" class="input_slt tab_slt">';
				html += '<select id="childType" onchange="clearNumberByChildType(this,' + (row + 1) + ')">';
				html += '<option value="K3THDX">三同号单选</option>';
				html += '<option value="K3ETFX">二同号复选</option>';
				html += '<option value="K3ETDX" selected="selected">二同号单选</option>';
				html += '<option value="K3SBT">三不同号</option>';
				html += '<option value="K3EBT">二不同号</option>';
				html += '</select>&nbsp;&nbsp;';
				html += '<a arg="clear_hm" href="javascript:void(0);" title="" onclick="clearNumber(this)">清</a>';
				html += '</td>';
				for (var i = 1; i <= 6; i++) {
					html += '<td class="light_ball" onclick="selectNumberCell(this,' + i + ',' + (row + 1) + ')">';
					html += i;
					html += '</td>';
				}
				html += '<td colspan="24" class="line_l">&nbsp;</td>';
				break;
			}
			case "hz": {
				html += '<td colspan="3" class="input_slt tab_slt">';
				html += '<input type="hidden" id="childType" value="K3HZ"/>和值 &nbsp;&nbsp;';
				html += '<a arg="clear_hm" href="javascript:void(0);" title="" onclick="clearNumber(this)">清</a>';
				html += '</td>';
				for (var i = 3; i <= 18; i++) {
					html += '<td class="light_ball" onclick="selectNumberCell(this,' + i + ',' + (row + 1) + ')">';
					html += i;
					html += '</td>';
				}
				html += '<td colspan="26" class="line_l">&nbsp;</td>';
				break;
			}
			case "multiple": {
				html += '<td colspan="3" class="input_slt tab_slt">';
				html += '<select id="childType" onchange="clearNumberByChildType(this,' + (row + 1) + ')">';
				html += '<option value="K3THDX">三同号单选</option>';
				html += '<option value="K3ETFX">二同号复选</option>';
				html += '<option value="K3ETDX" selected="selected">二同号单选</option>';
				html += '<option value="K3SBT">三不同号</option>';
				html += '<option value="K3EBT">二不同号</option>';
				html += '</select>';
				html += '<a arg="clear_hm" href="javascript:void(0);" title="" onclick="clearNumber(this)">清</a>';
				html += '</td>';
				for (var i = 1; i <= 6; i++) {
					html += '<td class="light_ball" onclick="selectNumberCell(this,' + i + ',' + (row + 1) + ')">';
					html += i;
					html += '</td>';
				}
				html += '<td colspan="26" class="line_l">&nbsp;</td>';
				break;
			}
			case "combination": {
				html += '<td colspan="3" class="input_slt tab_slt">';
				html += '<select id="childType" onchange="clearNumberByChildType(this,' + (row + 1) + ')">';
				html += '<option value="K3THDX">三同号单选</option>';
				html += '<option value="K3ETFX">二同号复选</option>';
				html += '<option value="K3ETDX" selected="selected">二同号单选</option>';
				html += '<option value="K3SBT">三不同号</option>';
				html += '<option value="K3EBT">二不同号</option>';
				html += '</select>&nbsp;&nbsp;';
				html += '<a arg="clear_hm" href="javascript:void(0);" title="" onclick="clearNumber(this)">清</a>';
				html += '</td>';
				for (var i = 1; i <= 6; i++) {
					html += '<td class="light_ball" onclick="selectNumberCell(this,' + i + ',' + (row + 1) + ')">';
					html += i;
					html += '</td>';
				}
				html += '<td colspan="28" class="line_l">&nbsp;</td>';
				break;
			}
			default:
				break;
		}
		html += '</tr>';
		$(".xhq:last").after(html);
	}
}

//删除当前行
function delectColumn(id) {
	var row = $("tr.xhq").find(".delete").length;
	if (row > 1) {
		var par = $(id).parent().parent();
		var yxNum = $(par).attr("id").substring(5);
		$(par).find(".ball02").each(function () {
			removeBalls(yxNum, this);
		});
		$(par).find(".ball03").each(function () {
			removeBalls(yxNum, this);
		});
		$(par).find(".ball_yel").each(function () {
			removeBalls(yxNum, this);
		});
		par.remove();
	}
}

//清除选号
function clearNumber(id, index) {
	var par = $(id).parent().parent();
	var yxNum = $(par).attr("id").substring(5);
	if (index == undefined) {
		index = yxNum;
	}
	switch (index) {
		case "1":
			yxq1.clear();
			break;
		case "2":
			yxq2.clear();
			break;
		case "3":
			yxq3.clear();
			break;
		case "4":
			yxq4.clear();
			break;
		case "5":
			yxq5.clear();
			break;
		default:
			break;
	}

	$(par).find(".ball02").removeClass("ball02").children("div").remove();
	$(par).find(".ball03").removeClass("ball03").children("div").remove();
	$(par).find(".ball_yel").removeClass("ball_yel").children("div").remove();
}

//玩法改变时清除选号区
function clearNumberByChildType(id, index) {
	clearNumber(id, index);
}

/**
@desc 预选区函数
tdCell 点击事件对象
number 点击显示的号码
index 预选区下标 如 预选区一 下标为yx_kj1,以此类推
**/
function selectNumberCell(tdCell, number, index) {
	var _childType = $("#yx_kj" + index).find("select#childType").val();
	ball_number = getBallNumberSet("yx_kj" + index);

	switch (_childType) {
		case "K3THDX": {
			$(tdCell).toggleClass("ball03");
			if ($(tdCell).hasClass("ball03")) {
				$(tdCell).html(number);
				ball_number.add(number);
			} else {
				$(tdCell).attr("class", "light_ball");
				$(tdCell).children("div").remove();
				ball_number.remove(number);
			}
			$.each($("#yx_kj" + index).find("td.ball03"), function (td) {
				$(this).prepend("<div class='absolute'><div class='smallball'>3</div></div>");
			});
			break;
		}
		case "K3ETFX": {
			$(tdCell).toggleClass("ball_yel");
			if ($(tdCell).hasClass("ball_yel")) {
				$(tdCell).html(number);
				ball_number.add(number);
			} else {
				$(tdCell).attr("class", "light_ball");
				$(tdCell).children("div").remove();
				ball_number.remove(number);
			}
			$.each($("#yx_kj" + index).find("td.ball_yel"), function () {
				$(this).prepend("<div class='absolute'><div class='smallball'>2</div></div>");
			});
			break;
		}
		case "K3ETDX": {
			$(tdCell).toggleClass("ball02");
			if ($(tdCell).attr("class") == "light_ball") {
				$(tdCell).toggleClass("ball_yel");
				$(tdCell).html(number);
				ball_number.add(number);
				$.each($("#yx_kj" + index).find("td.ball_yel"), function () {
					$(this).prepend("<div class='absolute'><div class='smallball'>2</div></div>");
				});
				break;
			} else if ($(tdCell).attr("class") == 'light_ball ball_yel ball02') {
				$(tdCell).attr("class", "light_ball");
				$(tdCell).children("div").remove();
				ball_number.remove(number);
				break;
			} else {
				$(tdCell).html(number);
				ball_number.add(number);
				break;
			}
			break;
		}
		default:
			$(tdCell).toggleClass("ball02");
			if ($(tdCell).hasClass("ball02")) {
				$(tdCell).addClass("ball02");
				$(tdCell).html(number);
				ball_number.add(number);
			} else {
				$(tdCell).addClass("light_ball");
				ball_number.remove(number);
			}
			break;
	}
}

//投注
function buyPlan_hbk3(lotteryType) {
	var format = new Set();
	var content = getAllContent();
	var temp = 1, betCount, betNum;
	var yxqFormat = '';
	var childType = '', betContent = '';

	for (var i = 0; i < content.size() ; i++) {
		betNum = content.elements[i].split(":");
		betCount = betNum[2];
		if (betNum[1] != "") {
			if (betCount == 0) {
				format.add(temp);
			}
		}
		temp++;
	}

	if (content.size() == 0) {
		alert("请您选择一注!");
		return;
	}
	if (content.elements == "3thdx_error" || content.contain("3thdx_error")) {
		alert("三同号单选最多只能选择一个选号!");
		return;
	}
	if (content.elements == "etdx_error" || content.contain("etdx_error")) {
		alert("二同号单选预选区选号有错误哦!");
		return;
	}
	yxqFormat = format.elements.join(",");
	if (yxqFormat != '') {
		alert("预选区有号码不足哦!");
		return;
	}
	var zstContent = "";
	for (var i = 0; i < content.size() ; i++) {
		betNum = content.elements[i].split(":");
		childType = betNum[0];
		betContent = betNum[1];
		betCount = betNum[2];
		zstContent += childType + ":" + betContent + ":" + betCount + ";"
	}
	//alert(zstContent);
	document.location.href = "http://www.kuaicaile.com/" + lotteryType + "/index.shtml?zstContent=" + zstContent;
}
//投注
function goToBuy_k3(lotteryType) {
	var format = new Set();
	var content = getAllContent();
	var temp = 1, betCount, betNum;
	var yxqFormat = '';
	var childType = '', betContent = '';

	document.location.href = "http://www.kuaicaile.com/" + lotteryType + "/index.shtml";
}

function getAllContent() {
	var result = new Set();
	var childType = $("tr.xhq").find("#childType");
	var content = '';
	var num = 1;
	var betCount = 0;
	$("tr.xhq").each(function (i) {
		switch ($(childType[i]).val()) {
			case "K3THDX": {
				var str = showBuy_sub("yx_kj" + num);
				if (str != '') {
					content = str + "" + str + "" + str;
					if (content.length >= 4) {
						result.push("3thdx_error");
						break;
					}
					betCount = contentBetNum($(childType[i]).val(), content);
					result.elements.push($(childType[i]).val() + ":" + content + ":" + betCount);
				}
				break;
			}
			case "K3ETFX": {
				var str = showBuy_sub("yx_kj" + num);
				var format = '', content = '';
				if (str != '') {
					for (var j = 0; j < str.length; j++) {
						content += format + str[j] + "" + str[j] + "*";
						if (format == '') format = ",";
					}
					betCount = contentBetNum($(childType[i]).val(), content);
					result.elements.push($(childType[i]).val() + ":" + content + ":" + betCount);
				}
				break;
			}
			case "K3SBT": {
				var content = showBuy_sub("yx_kj" + num);
				if (content != '') {
					betCount = contentBetNum($(childType[i]).val(), content);
					result.elements.push($(childType[i]).val() + ":" + content + ":" + betCount);
				}
				break;
			}
			case "K3EBT": {
				var content = showBuy_sub("yx_kj" + num);
				if (content != '') {
					betCount = contentBetNum($(childType[i]).val(), content);
					result.elements.push($(childType[i]).val() + ":" + content + ":" + betCount);
				}
				break;
			}
			case "K3ETDX": {
				var etdx_th = '', etdx_bth = '';
				var th_format = '', bth_format = '';
				$("#yx_kj" + num).find(".ball_yel").each(function (i) {
					etdx_th += th_format + "" + $(this).attr("lastChild").data + "" + $(this).attr("lastChild").data;
					if (th_format == '') th_format = ",";
				});

				$("#yx_kj" + num).find(".ball02").each(function (i) {
					etdx_bth += bth_format + "" + $(this).text();
					if (bth_format == '') bth_format = ",";
				});
				if (etdx_th != '' && etdx_bth != '') {
					content = etdx_th + "#" + etdx_bth;
					betCount = contentBetNum($(childType[i]).val(), content);
					result.elements.push($(childType[i]).val() + ":" + content + ":" + betCount);
				}
				if ((etdx_th == '' && etdx_bth != '') || (etdx_th != '' && etdx_bth == '')) {
					result.push("etdx_error");
				}
				break;
			}
			case "K3HZ": {
				var content = showBuy_sub("yx_kj" + num);
				var temp = '', format = '';
				if (content != '') {
					for (var j = 0; j < content.length; j++) {
						if (content[j] == "3") {
							result.elements.push("K3THDX" + ":" + "111" + ":" + "1");
						} else if (content[j] == "18") {
							result.elements.push("K3THDX" + ":" + "666" + ":" + "1");
						} else {
							temp += format + "" + content[j];
							if (format == '') format = ",";
						}
					}
					var number = temp.split(",");
					betCount = contentBetNum($(childType[i]).val(), number);
					result.elements.push($(childType[i]).val() + ":" + number + ":" + betCount);
				}
				break;
			}
			default:
				break;
		}
		num++;
	});
	return result;
}

function contentBetNum(childType, content) {
	var result = 0;
	switch (childType) {
		case "K3THDX": {
			result = 1;
			break;
		}
		case "K3ETFX": {
			var temp = content.split(",");
			result = comb(temp.length, 1);;
			break;
		}
		case "K3SBT": {
			result = comb(content.length, 3);
			break;
		}
		case "K3EBT": {
			result = comb(content.length, 2);
			break;
		}
		case "K3ETDX": {
			var etdx = content.split("#");
			var th = etdx[0].split(",");
			var bth = etdx[1].split(",");
			result = th.length * bth.length;
			for (var i = 0; i < th.length; i++) {
				for (var j = 0; j < bth.length; j++) {
					var a = th[i];
					var b = bth[j];
					if (a == b) {
						result--;
					}
				}
			}
			break;
		}
		case "K3HZ": {
			result = comb(content.length, 1);
			break;
		}
		default:
			break;
	}
	return result;
}

function removeBalls(yxNum, number) {
	switch (yxNum) {
		case "1":
			yxq1.remove($(number).text());
			break;
		case "2":
			yxq2.remove($(number).text());
			break;
		case "3":
			yxq3.remove($(number).text());
			break;
		case "4":
			yxq4.remove($(number).text());
			break;
		case "5":
			yxq5.remove($(number).text());
			break;
		default:
			break;
	}
}

function showBuy_sub(id) {
	var ball = getBallNumberSet(id);
	if (ball.size() > 0) {
		return ball.elements;
	}
	return "";
}

function getBallNumberSet(id) {
	if (id == "yx_kj1") return yxq1;
	else if (id == "yx_kj2") return yxq2;
	else if (id == "yx_kj3") return yxq3;
	else if (id == "yx_kj4") return yxq4;
	else if (id == "yx_kj5") return yxq5;
}
function toTodayAndYesterday(day, root, lotteryType, childType) {
	var childVal = childType.split("-");
	var filename = day == 0 ? childVal[1] : childVal[1] + "_" + day;
	window.document.location = root + "/chart/" + lotteryType + "/" + childVal[0] + "/" + filename + ".html";
}
function initK3Zst(lottery, chidType, count) {
	if (count == "-99") {//今天
		$("#today").addClass("pageOn");
	} else if (count == "-1") {//昨天
		$("#yesterday").addClass("pageOn");
	}
	initZst(lottery, chidType, Math.abs(count));
}