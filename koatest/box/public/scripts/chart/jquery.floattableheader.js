jQuery.fn.floattableheader = function (options) {
	var settings = jQuery.extend({
		thead_id: "thead"
	}, options);
	this.each(function (i) {
		var TB = $(this);
		var TB_thead = $("#" + settings.thead_id);
		if (TB_thead.text() == '') return;
		if (TB_thead) {
			TB_thead.find("th").each(function () {
				//$(this).css("width", $(this).get(0).offsetWidth);
				$(this).css("width", $(this).width());
			});
			var clone_TB_head = TB_thead.clone();
			clone_TB_head.find("th").each(function () {
				$(this).removeAttr("onclick");
				$(this).find("em").remove();
			});
			clone_TB_head.attr("id", TB_thead.attr("id") + i);
			var TB_width = GetTblWidth(TB);

			var new_TB = $("<table/>");
			new_TB.addClass("table_box").addClass("odd_even");
			new_TB.attr("id", "fixedtableheader" + i)
				.css({ "position": "fixed", "z-index": "9999", "top": "0", "left": TB.offset().left })
				.append(clone_TB_head).width(TB_width).hide().appendTo($("body"));

			$(window).scroll(function () {
				if (jQuery.browser.msie && jQuery.browser.version == "6.0") {
					new_TB.css({ "position": "absolute", "top": $(window).scrollTop(), "left": TB.offset().left });
				} else {
					new_TB.css({ "position": "fixed", "top": "0", "left": TB.offset().left - $(window).scrollLeft() });
				}
				var sctop = $(window).scrollTop();
				var elmtop = TB_thead.offset().top;
				if (sctop > elmtop && sctop <= (elmtop + TB.height() - TB_thead.height())) {
					new_TB.show();
				} else {
					new_TB.hide();
				}
			});

			$(window).resize(function () {
				if (new_TB.outerWidth() != TB.outerWidth()) {
					TB_thead.find("th").each(function (index) {
						var w = $(this).width();
						$(this).css("width", w);
						new_TB.find("th").eq(index).css("width", w);
					});
					new_TB.width(TB.outerWidth());
				}
				new_TB.css("left", TB.offset().left);
			});
		}
	});
	function GetTblWidth(TB) {
		var tblwidth = TB.outerWidth();
		return tblwidth;
	}
};