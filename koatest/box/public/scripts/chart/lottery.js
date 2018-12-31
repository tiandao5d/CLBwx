
var items = new Array();
var tatalBetCount = 0;
function PlanItem(_childType, _content, _betNum) {
	this.childType = _childType;
	this.content = _content;
	this.betNum = _betNum;
}
function removeItem(_childType, _content, _betNum) {
	for (i = 0; i < items.length; i++) {
		if (_childType == items[i].childType && _content == items[i].content) {
			this.items.splice(i, 1);
		}
	}
	tatalBetCount -= _betNum;
}
function removeIndex(index) {
	var item = items[index];
	this.items.splice(index, 1);
	tatalBetCount -= item.betNum;
}
function updateItem(index, _childType, _content, _betNum) {
	var item = items[index];
	tatalBetCount -= item.betNum;
	tatalBetCount += _betNum;
	var item = new PlanItem(_childType, _content, _betNum);
	items[index] = item;
}

function addItem(item) {
	items.push(item);
	tatalBetCount += item.betNum;
}
function clearItem() {
	items.length = 0;
	tatalBetCount = 0;
}
function Set() {
	this.elements = new Array();
	this.size = function () {
		return this.elements.length;
	}
	this.showAll = function () {
		var result = "";
		for (i = 0; i < this.elements.length; i++) {
			result += this.elements[i];
		}
		return result;
	}
	this.isEmpty = function () {
		return (this.elements.length < 1);
	}

	this.clear = function () {
		this.elements = new Array();
	}
	this.add = function (value) {
		if (!this.contain(value)) {
			this.elements.push(value);
			this.elements.sort();
		}
	}
	this.push = function (value) {
		if (!this.contain(value)) {
			this.elements.push(value);
		}
	}
	this.remove = function (value) {
		var bln = false;
		try {
			for (i = 0; i < this.elements.length; i++) {
				if (this.elements[i] == value) {
					this.elements.splice(i, 1);
					return true;
				}
			}
		} catch (e) {
			bln = false;
		}
		return bln;
	}
	this.contain = function (value) {
		for (i = 0; i < this.elements.length; i++) {
			if (this.elements[i] == value) {
				return true;
			}
		}
		return false;
	}
}
/**
 * 数组的indexOf方法，解决IE兼容性问题
 */
Array.prototype.indexOf = function (item) {
	var len = this.length;
	for (var i = len; i >= 0; i--) {
		if (this[i] === item) {
			return len - i;
		}
	}
	return -1;
}
/**
* 时间对象的格式化;
*/
Date.prototype.format = function (format) {
	var o = {
		"M+": this.getMonth() + 1,  //month
		"d+": this.getDate(),     //day
		"h+": this.getHours(),    //hour
		"m+": this.getMinutes(),  //minute
		"s+": this.getSeconds(), //second
		"q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
		"S": this.getMilliseconds() //millisecond
	}
	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
}
function comb(m, n) {
	if (m < 0 || n < 0 || m < n) {
		return 0;
	}
	n = n < (m - n) ? n : m - n;
	if (n == 0) {
		return 1;
	}
	var result = m;
	for (var i = 2, j = result - 1; i <= n; i++, j--) {
		result = result * j / i;// 得到C(m,i)
	}
	return result;
}

function random(m, n, isAdd0, iscover0, withOutSort, repeat) {
	var a = [];
	var b = [];
	var i = 1;
	if (iscover0) i = 0;
	for (; i <= m; i++) {
		if (isAdd0) a.push(i < 10 ? "0" + i : i);
		else a.push(i);
	}
	for (var k = 0; k < n; k++) {
		var j;
		if (!repeat) j = a.splice(Math.floor(Math.random() * a.length), 1);
		else j = Math.floor(Math.random() * a.length);
		b.push(j);
	}
	if (withOutSort) return b;
	return b.sort();
}
function initZst(_game, _child, count) {
	$("#top_zst").addClass("current");
	$("#head_" + _game).addClass("zs_now");

	$("#byday").val(count);
	changeHeandTab(_game);
	$('.child_' + _child).addClass("cz_on");
}

function getDateAnalysis(_e, root, lotteryType, childType) {
	var sel = $(_e).val();
	if (sel == null) {
		sel = 0;
	}
	var childVal = childType.replace("-","");
	var filename = "top=" + sel;
	window.document.location = childVal + "?" + filename ;
}

function changeHeandTab(_game) {
	$(".zst_cz_b_top_tab").hide();
	var tab_inx = 1;
	switch (_game) {
		case "gd11x5":
		case "sd11x5":
		case "jx11x5":
		case "sckl12":
			tab_inx = 1;
			break;
		case "hbk3":
			tab_inx = 2;
			break;
		case "jxssc":
			tab_inx = 3;
			break;
		case "ssq":
			tab_inx = 4;
			break;
		case "dlt":
			tab_inx = 5;
			break;
		case "pl3":
			tab_inx = 6;
			break;
		case "fc3d":
			tab_inx = 7;
			break;
		case "pl5":
			tab_inx = 8;
			break;
		case "qxc":
			tab_inx = 9;
			break;
		case "qlc":
			tab_inx = 10;
			break;
	}
	$("#top_tab_" + tab_inx).show();
}

//前往投注
function goToBuy(lotteryType) {
	var format = new Set();
	var content = getAllContent();
	var temp = 1, betCount, betNum;
	var yxqFormat = '';
	var childType = '', betContent = '';

	document.location.href = "http://www.domain.com/" + lotteryType + "/index.shtml";
}
