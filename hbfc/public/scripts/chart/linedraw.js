
/* 连线类  --------------------------------------------------------------------*/
JoinLine = function (color, size) {
	this.color = color || "#000000";
	this.size = size || 1;
	this.lines = [];
	this.tmpDom = null;
	this.visible = true;
	this.topOffset = true;
	var cenbox = document.getElementById('container');//for center div
	this.box = document.getElementById('chartsBox');
	if (!this.box) {
		this.box = document.body;
	}

	if (cenbox) {//兼容居中div
		this.wrap = cenbox.getElementsByTagName('DIV')[0];
		if (this.wrap) {
			this.box = this.wrap
			this.wrap.style.position = 'relative';
		}
	};
};
JoinLine.prototype = {
	show: function (yes) {
		for (var i = 0; i < this.lines.length; i++)
			this.lines[i].style.visibility = yes ? "visible" : "hidden";
	},
	remove: function () {
		for (var i = 0; i < this.lines.length; i++)
			this.lines[i].parentNode.removeChild(this.lines[i]);
		this.lines = [];
	},
	join: function (objArray, hide, fn) {
		this.remove();
		this.visible = hide ? "visible" : "hidden";
		this.tmpDom = document.createDocumentFragment();

		for (var i = 0; i < objArray.length - 1; i++) {
			var a = this.pos(objArray[i]);
			var b = this.pos(objArray[i + 1]);
			/* 通过比对两个值来决策绘制与否 */
			if (fn && fn(a, b) === false) continue;
			if (document.all) {
				var browser = navigator.appName;
				var version = navigator.appVersion.split(";");
				var trim_Version = version[1].replace(/[ ]/g, "");
				if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE9.0")
					this.FFLine(a.x, a.y, b.x, b.y);
				else
					this.IELine(a.x, a.y, b.x, b.y);

			} else {
				this.FFLine(a.x, a.y, b.x, b.y);
			};
		};
		this.box.appendChild(this.tmpDom);
	},
	pos: function (obj) {
		if (obj.nodeType == undefined) return obj;// input {x:x,y:y} return;
		var pos = { x: 0, y: 0 }, a = obj;
		var odiv = document.getElementById('chartsBox');
		for (; a; a = a.offsetParent) { pos.x += a.offsetLeft; pos.y += a.offsetTop; if (this.wrap && a.offsetParent === this.wrap) break };// 兼容居中div
		if (document.getElementById('chartsBox')) {
			pos.x -= odiv.offsetLeft;
			pos.y -= odiv.offsetTop;
		}
		pos.x += parseInt(obj.offsetWidth / 2);
		pos.y += parseInt(obj.offsetHeight / 2);
		return pos;
	},
	_oldDot: function (x, y, color, size) {
		var dot = document.createElement("DIV");
		dot.style.cssText = "position: absolute; left: " + x + "px; top: " + y + "px;background: " + color + ";width:" + size + "px;height:" + size + "px;font-size:1px;overflow:hidden";
		dot.style.visibility = this.visible;
		this.lines.push(this.tmpDom.appendChild(dot));
	},
	_oldLine: function (x1, y1, x2, y2) {
		var r = Math.floor(Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));
		var theta = Math.atan((x2 - x1) / (y2 - y1));
		if (((y2 - y1) < 0 && (x2 - x1) > 0) || ((y2 - y1) < 0 && (x2 - x1) < 0)) theta = Math.PI + theta;
		var dx = Math.sin(theta), dy = Math.cos(theta), i = 0;
		do { this.FFDot(x1 + i * dx, y1 + i * dy, this.color, this.size) } while (i++ < r);
	},
	FFLine: function (x1, y1, x2, y2) {
		if (y1 == y2) return;//同行的不连线或Math.abs(y1-y2)<5
		if (Math.abs(y1 - y2) < (JoinLine.indent * 2) && x1 == x2) return;//自动确定同列的是否连线
		var np = this.nPos(x1, y1, x2, y2, JoinLine.indent);//两端缩减函数（防止覆盖球）
		x1 = np[0]; y1 = np[1]; x2 = np[2]; y2 = np[3];
		var cvs = document.createElement("canvas");
		cvs.style.position = "absolute";
		cvs.style.visibility = this.visible;
		cvs.width = Math.abs(x1 - x2) || this.size;
		cvs.height = Math.abs(y1 - y2) || this.size;
		var newY = Math.min(y1, y2);
		var newX = Math.min(x1, x2);
		cvs.style.top = newY + "px";
		cvs.style.left = newX + "px";
		var FG = cvs.getContext("2d");
		FG.save();//缓存历史设置
		FG.strokeStyle = this.color;
		FG.lineWidth = 1;
		//FG.globalAlpha=0.5;//透明度；
		FG.beginPath();
		FG.moveTo(x1 - newX, y1 - newY);
		FG.lineTo(x2 - newX, y2 - newY);
		FG.closePath();
		FG.stroke();
		FG.restore();//恢复历史设置
		this.lines.push(cvs);
		this.tmpDom.appendChild(cvs);
	},
	IELine: function (x1, y1, x2, y2) {
		if (y1 == y2) return;//同行的不连线或Math.abs(y1-y2)<5
		if (Math.abs(y1 - y2) < (JoinLine.indent * 2) && x1 == x2) return;//自动确定同列的是否连线
		var np = this.nPos(x1, y1, x2, y2, JoinLine.indent);//两端缩减函数（防止覆盖球）
		x1 = np[0]; y1 = np[1]; x2 = np[2]; y2 = np[3];
		var line = document.createElement("esun:line");
		line.from = x1 + "," + y1;
		line.to = x2 + "," + y2;
		line.strokeColor = this.color;
		line.strokeWeight = this.size + "px";
		line.style.cssText = "position:absolute;z-index:999;top:0;left:0";
		line.style.visibility = this.visible;
		line.coordOrigin = "0,0";
		this.lines.push(line);
		this.tmpDom.appendChild(line);
	},
	nPos: function (x1, y1, x2, y2, r) {
		var a = x1 - x2, b = y1 - y2;
		var c = Math.round(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
		var x3, y3, x4, y4;
		var _a = Math.round((a * r) / c);
		var _b = Math.round((b * r) / c);
		return [x2 + _a, y2 + _b, x1 - _a, y1 - _b];
	}
};

JoinLine.indent = 8;

/* 过滤搜索连线操纵类 --------------------------------------------------------------------*/
LG = function (table, _x, _y, width, margin_bottom, fn_check) {
	var rect = { x: _x || 0, y: _y || 0, w: width || 0, oh: margin_bottom || 0 };
	if (!document.getElementById(table)) return;
	var trs = document.getElementById(table).rows;
	var row_start = rect.y < 0 ? (trs.length + rect.y) : rect.y;
	var row_end = trs.length - rect.oh;
	var col_start = rect.x < 0 ? (trs[row_start].cells.length + rect.x) : rect.x;
	var col_end = col_start + rect.w;
	if (col_end > trs[row_start].cells.length) col_end = trs[row_start].cells.length;
	if (rect.w == 0) col_end = trs[row_start].cells.length;
	this.g = [];
	//alert([row_start,row_end,col_start,col_end])
	for (var i = row_start; i < row_end; i++) {/* each and grouping */
		var tr = trs[i].cells;
		for (var j = col_start; j < col_end; j++) {
			var td = tr[j];
			/* 检测器返回绝对真时，单元格才被添加到组 */
			if (td) {
				if (fn_check(td, j, i) === true) this.g.push(td);
			}
		};
	};
	if (LG.autoDraw) this.draw();
};
LG.color = '#E4A8A8';
LG.size = 2;
LG.autoDraw = true;/* 默认自动绘线 */
LG.isShow = true;
LG.filter = function () { };
LG.prototype = {
	draw: function (color, size, fn) {
		this.line = new JoinLine(color || LG.color, size || LG.size);
		if (!fn) fn = LG.filter;
		this.line.join(this.g, LG.isShow, fn);
	},
	clear: function () {
		this.line.remove();
	},
	show: function (yes) { this.line.show(yes) }
}

/* 批量绘线对象 -----------------------------------------------------------------------------------
设置表格；
设置开关；
设置检测函数；
添加块；x坐标从0开始
显示；
修改模式；
添加；
再显示；
error:如果检测函数第一次显示无效，第二次会被覆盖掉
*/
oZXZ = {
	vg: [],
	lg: [],
	_vg: [],
	_lg: [],
	table: false,
	check: function (td) {
		return /^(chartBall|cbg)/i.test(td.className);
	},
	on_off: true,
	_on: true,/* 开关反作用 */
	novl: false,/* 忽略垂直线 */
	bind: function (tid, _on_off) {
		this.table = tid;
		this.on_off = _on_off;
		return this;
	},
	color: function (c) {
		LG.color = c;
		return this;
	},
	newCheck: function (fn) {
		this.check = fn;
		return this;
	},
	draw: function (yes) {
		if (!this.table) return;
		if (yes) {
			var qL = this.vg.length;
			for (var i = 0; i < qL; i++) {
				var it = this.vg[i];
				LG.color = it.color;
				JoinLine.indent = it.indent;
				this.novl = it.novl;
				if (this.novl) LG.filter = function (a, b) { return !(a.x == b.x) };
				this.lg.push(new LG(this.table, it[0], it[1], it[2], it[3], this.check));
			}
		}
		if (this.on_off) {
			var _this = this;
			var ss = document.getElementById(this.on_off);
			if (ss) ss.onclick = function () {
				var yes = _this._on ? this.checked : !this.checked;
				_this.show(yes);
			};
		}
		/* 转移与清空历史记录，等待下一次添加 */
		this._vg = this._vg.concat(this.vg);
		this.vg = [];
		this._lg = this._lg.concat(this.lg);
		this.lg = [];
		//alert(this._vg.length)
		return this;
	},
	show: function (yes) {
		/* 如果没有线则重绘一次 */
		if (this._lg.length == 0) this.redraw();
		var qL = this._lg.length;
		for (var i = 0; i < qL; i++) { this._lg[i].show(yes) };
	},
	/*
	x,y,w,-bottom
	*/
	add: function (x, y, w, mb) {//把每一块封成组加上属性
		this.vg.push([x, y, w, mb]);
		/* 记录本组缩进与颜色 */
		this.vg[this.vg.length - 1].color = LG.color;
		this.vg[this.vg.length - 1].indent = JoinLine.indent;
		this.vg[this.vg.length - 1].novl = this.novl;
		return this;
	},
	clear: function () {
		for (var i = 0; i < this._lg.length; i++)
			this._lg[i].clear();
		return this;
	},
	redraw: function () {
		this.clear();
		this.vg = this.vg.concat(this._vg);
		this._vg = [];
		this.draw(true);
	},
	newCheck: function (fn) {
		this.check = fn;
		return this;
	},
	setvl: function (v) {
		this.novl = v;
		return this;
	},
	indent: function (v) {
		JoinLine.indent = v;
		return this;
	}
}
/*

遗漏柱状标亮器
Object yl_Histogram

PHP:
<script>
	//设置柱状图的当前期号与起始方向
	Histogram_expect=<?=$expect?>;
	Histogram_sort=<?=$ssort?>;
</script>

*/

yl_Histogram = {
	list: []
	, ini: {
		table: null,
		checkBox: null,
		sort: 0,
		left: 1,
		right: 0,
		//beginLine:0,
		defaultShow: false
	}
	, bind: function (ini) {
		for (var k in ini || {}) this.ini[k] = ini[k];
		var ctrl = document.getElementById(this.ini.checkBox);
		if (ctrl) {
			this.ini.defaultShow = !!ctrl.checked;
			ctrl.onclick = function () {
				yl_Histogram.hide(!this.checked)
			}
		}
		this.show(this.ini);
	}
	, show: function (ini) {
		// 如果没有参数,直接从缓存中检索td操作。
		if (!ini) return this.hide(false);
		if (!document.getElementById(ini.table)) return;
		this.Map = document.getElementById(ini.table);
		//var curLine=(this.Map.rows.length-1)-ini.beginLine-1;
		var curLine = (this.Map.rows.length - 1) - 1;
		try { cells = this.Map.rows[curLine].cells; } catch (e) { return };
		// draw
		for (var i = ini.left; i < cells.length - ini.right; i++) {
			if (!/cbg|chartBall/i.test(cells[i].className))
				this.setColor(cells[i], ini.sort || -1)
		}
	}
	, hide: function (isHide) {
		for (var i = 0; i < this.list.length; i++) {
			var $ = this.list[i];
			$.className = isHide === false ? $.newClass : $.oldClass;
		}
	}
	, getVCell: function (table, cell, dir) {
		try {
			var vcell = table.rows[cell.parentNode.sectionRowIndex + dir].cells[cell.cellIndex];
			if (undefined == vcell) return this.getVCell(table, cell, dir * 2);
			return table.rows[cell.parentNode.sectionRowIndex + dir].cells[cell.cellIndex]
		} catch (e) {
			return null;
		}
	}

	, getClassName: function (cell) {
		//var n=parseInt(cell.innerHTML);
		//if(n>10)return ' yl_color2';
		//if(n>5)return ' cbg6';
		return ' yl_color2';
	}

	, setColor: function (cell, dir) {
		var s = this.getClassName(cell)
			, nextCell = cell;
		try {
			for (var i = 0; i < this.Map.rows.length; i++) {
				if (nextCell.className.indexOf("text") == -1) break;
				nextCell.oldClass = nextCell.className;
				nextCell.newClass = nextCell.oldClass + s;
				if (this.ini.defaultShow)
					nextCell.className = nextCell.newClass;
				this.list.push(nextCell);
				nextCell = this.getVCell(this.Map, nextCell, dir);

			}
			//			do{
			//				if(nextCell.innerHTML!=''){
			//					nextCell.oldClass=nextCell.className;
			//					nextCell.newClass=nextCell.oldClass+s;
			//					if(this.ini.defaultShow)
			//						nextCell.className=nextCell.newClass;
			//				}
			//				this.list.push(nextCell);
			//				nextCell=this.getVCell(this.Map,nextCell,dir);
			//			}while(
			//				chartBall/i.test(nextCell.className)
			//				)
		} catch (e) { }
	}

}

/*
help: yl_Histogram.show(表格ID,当前期号,排序方式(1为向下,0为向上));
yl_Histogram.show('chartsTable',expect,1);
*/
function show(name1, name2) {
	$("td[name='" + name1 + "']").show();
	$("td[name='" + name2 + "']").hide();
	oZXZ.bind("chartsTable", "has_line").indent(8)
	.clear();

	$("td.zxshow").each(function (i, td) {
		if ($(td).is(":hidden")) return;
		var name = $(td).attr("name");
		showLine(name);
	});
}

function show_k3(name1, name2) {
	$("td[name='" + name1 + "']").show();
	$("td[name='" + name2 + "']").hide();
	oZXZ.bind("chartsTable", "has_line").indent(8)
	.clear();

	$("td.zxshow").each(function (i, td) {
		if ($(td).is(":hidden")) return;
		var name = $(td).attr("name");
		showLine_k3(name);
	});
}

function showLine_k3(name) {
	var only_dx = function (td) {
		return !!(td.className.indexOf("text") == -1 && td.innerHTML != "&nbsp;" && td.innerHTML != "")
	};
	switch (name) {
		case "even":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(14, 3, 4, 6)
			.newCheck(only_dx).color("#619DD9").add(26, 3, 16, 6)
			.draw(true);
			break;
		case "odd":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(10, 3, 4, 6)
			.newCheck(only_dx).color("#619DD9").add(26, 3, 16, 6)
			.draw(true);
			break;
		case "big":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(22, 3, 4, 6)
			.newCheck(only_dx).color("#619DD9").add(26, 3, 16, 6)
			.draw(true);
			break;
		case "small":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(18, 3, 4, 6)
			.newCheck(only_dx).color("#619DD9").add(26, 3, 16, 6)
			.draw(true);
			break;
		default:
			break;
	}
}

function showLine(name) {
	var only_dx = function (td) {
		return !!(td.className.indexOf("text") == -1 && td.innerHTML != "&nbsp;" && td.innerHTML != "")
	};
	switch (name) {
		case "even":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(23, 3, 6, 6)
			.draw(true);
			break;
		case "odd":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(17, 3, 6, 6)
			.draw(true);
			break;
		case "big":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(35, 3, 6, 6)
			.draw(true);
			break;
		case "small":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(29, 3, 6, 6)
			.draw(true);
			break;
		case "composite":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(47, 3, 6, 6)
			.draw(true);
			break;
		case "prime":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(41, 3, 6, 6)
			.draw(true);
			break;
		default:
			break;
	}
}

function show_kl12(name1, name2) {
	$("td[name='" + name1 + "']").show();
	$("td[name='" + name2 + "']").hide();
	oZXZ.bind("chartsTable", "has_line").indent(8)
	.clear();

	$("td.zxshow").each(function (i, td) {
		if ($(td).is(":hidden")) return;
		var name = $(td).attr("name");
		showLine_kl12(name);
	});
}

function showLine_kl12(name) {
	var only_dx = function (td) {
		return !!(td.className.indexOf("text") == -1 && td.innerHTML != "&nbsp;" && td.innerHTML != "")
	};
	switch (name) {
		case "even":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(24, 3, 6, 6)
			.draw(true);
			break;
		case "odd":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(18, 3, 6, 6)
			.draw(true);
			break;
		case "big":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(36, 3, 6, 6)
			.draw(true);
			break;
		case "small":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(30, 3, 6, 6)
			.draw(true);
			break;
		case "composite":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(48, 3, 6, 6)
			.draw(true);
			break;
		case "prime":
			oZXZ.bind("chartsTable", "has_line").indent(8)
			.newCheck(only_dx).color("#619DD9").add(42, 3, 6, 6)
			.draw(true);
			break;
		default:
			break;

	}
}
//遗漏
function yilou() {
	if ($("#c_yl").attr("checked") == true) {
		$(".text_g").css("color", "white");
		$(".text_01").css("color", "white");
		$(".text_02").css("color", "white");
		$(".text_03").css("color", "white");

	} else {
		$(".text_g").css("color", "");
		$(".text_01").css("color", "");
		$(".text_02").css("color", "");
		$(".text_03").css("color", "");
	}
}

//连号
function lianhao() {
	if ($("#c_h").attr("checked") == true) {
		$(".ball02").prev(".ball02").addClass("ball_yel");
		$(".ball02").next(".ball02").addClass("ball_yel");

		$(".ballBlue_b").prev(".ballBlue_b").addClass("ball_yel_b");
		$(".ballBlue_b").next(".ballBlue_b").addClass("ball_yel_b");
	} else {
		$(".ball02").prev(".ball02").removeClass("ball_yel");
		$(".ball02").next(".ball02").removeClass("ball_yel");

		$(".ballBlue_b").prev(".ballBlue_b").removeClass("ball_yel_b");
		$(".ballBlue_b").next(".ballBlue_b").removeClass("ball_yel_b");
	}
}

//分短线(通用)
function segmentedLine() {
	if ($("#yl_fd").attr("checked") == true) {
		$("td[name='hid']").show();
		// if ($("#has_line").attr("checked") == true) {
		// 	oZXZ.bind("chartsTable", "has_line").indent(8)
    // 		.clear();
		// 	nolines();
		// }
	} else {
		$("td[name='hid']").hide();
		// if ($("#has_line").attr("checked") == true) {
		// 	oZXZ.bind("chartsTable", "has_line").indent(8)
    // 		.clear();
		// 	nolines();
		// }
	}
}

//分短线(特殊)
function segmentedLine_dist(type) {
	if ($("#yl_fd").attr("checked") == true) {
		$("td[name='hid']").show();
		dist_line(type);
	} else {
		$("td[name='hid']").hide();
		dist_line(type);
	}
}

function dist_line(type) {
	if ($("#has_line").attr("checked") == true) {
		oZXZ.bind("chartsTable", "has_line").indent(8)
		.clear();
		$("td.zxshow").each(function (i, td) {
			if ($(td).is(":hidden")) return;
			var name = $(td).attr("name");
			switch (type) {
				case "hbk3":
					showLine_k3(name);
					break;
				case "sckl12":
					showLine_kl12(name);
					break;
				default:
					showLine(name);
					break;
			}
		});
	}
}

function chgMenu() {
	//排序期号功能，暂时不开放
}
//屏幕低时隐藏右侧GO
document.ready = function () {
	var rightGo = document.getElementById("rightGo");
	if (screen.width <= 1100) {
		rightGo.style.display = "none";
	}
}
