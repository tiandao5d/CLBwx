/**
 * 
 * common.js
 * 全局共用，后台管理
 * 作者：xulin
 * 
 * */
"use strict";
var globalData = {};
var Common = {
	oldImage: /group1/, //检测是否老图片
	
	//本地储存数据命名方式（前缀）
	//localStorage 全局使用前缀ls_global_，局部使用前缀ls_partly_
	//sessionStorage 全局使用前缀ss_global_，局部使用前缀ss_partly_
	userId      : 'ls_global_user_id',//记录用户ID
	userName    : 'ls_global_user_name',//记录用户名
	token       : 'ls_global_token',//记录用户token值
	loginup     : 'ls_global_loginup',//记录用户登录时用的账号
	leftMenu    : 'ls_global_left_menu',//记录用户登录时用的账号
	// 格式化请求数据地址
	formatUrl: function(url, callback, domain) {
		callback = callback || function() {};
		domain = domain || Common.DOMAIN_NAME;
		Common.getSeaverTimeStamp(function(timestamp) {
			if(timestamp == 'error') {
				callback(timestamp);
				return false;
			}

			//此处应该加上判断是否登录
			var userid = Common.storageL(Common.userId),
				timestamp = timestamp,
				token = Common.storageL(Common.token),
				sign = md5(url + '?userid=' + userid + '&token=' + token + '&timestamp=' + timestamp).toUpperCase();
			var param = {
				url: url,
				userid: userid,
				timestamp: timestamp,
				token: token
			};
			url = Common.DOMAIN_NAME + url + '?userid=' + userid + '&timestamp=' + timestamp + '&sign=' + sign;
			callback(url);
		});
	},
	getSeaverTimeStamp: function(callback) {
		callback = callback || function() {};

		//近期有多次请求，在5秒以内将直接算出本地的时间差加上上次请求的时间戳返回
		var nowTime = (new Date()).getTime(),
			oldTime = Common.oldTimestamp || 0,
			ajaxTime = Common.ajaxTimestamp || 0,
			diffVal = nowTime - oldTime;
		if(ajaxTime && (diffVal < 5000)) {
			callback(ajaxTime + diffVal);
			return(ajaxTime + diffVal);
		}
		$.ajax({
			type: "get",
			url: Common.DOMAIN_NAME + '/ushop-web-admin/user/login/timestamp',
			//			data: _data,
			dataType: 'json',
			success: function(data) {
				if(data.timestamp) {
					Common.ajaxTimestamp = data.timestamp;
					Common.oldTimestamp = (new Date()).getTime();
					callback(data.timestamp);
				} else {
					callback('error');
				}
			},
			error: function(data) {
				callback('error');
			}
		});
	},
	//解析URL
	deCodeUrlFn: function(dataStr){
		var str = dataStr || (document.URL + '');
		str = str.split('?')[1] || '';
		str = str.split('#')[0] || '';
		if(str){
			var a = {},
				b = str.split('&'),
				i = 0, s;
			while(s = b[i++]){
				s = (s + '').split('=');
				a[s[0]] = decodeURIComponent(s[1]);
			}
			if( (!dataStr) && globalData ){globalData.pageParam = a;}
			return a;
		}
		return {};
	},
	//保留旧的请求方式
	dataAjax: function(_url, callback) {
		callback = callback || function() {};
		var that = this,
			_param = that.deCodeUrlFn(_url);
		_url = _url.split(that.DOMAIN_NAME)[1];
		_url = ( _url.indexOf('?') >= 0 ) ? _url.split('?')[0] : _url;
		that.ajax(_url, 'get', _param, function ( data ) {
			callback(data, 'success');
		});
	},
	//保留旧的请求方式
	dataAjaxPost: function(url, _data, callback) {
		callback = callback || function() {};
		var that = this,
			_param = that.deCodeUrlFn(_url);
		_url = _url.split(that.DOMAIN_NAME)[1];
		_url = ( _url.indexOf('?') >= 0 ) ? _url.split('?')[0] : _url;
		that.ajax(_url, 'post', _param, function ( data ) {
			callback(data, 'success');
		});
	},

	//ajax请求封装
	ajax: function(_url, type, dataS, callback, isProgress) {
		callback = callback || function() {};
		var param = {
			url: '',
			type: 'get',
			data: {},
			dataType: 'json',
			timeout: 20000,
			success: function(data) {
				if(isProgress !== false) {
					Common.jBoxLoading('hide')
				};
				callback((data || {}));
			},
			error: function(data) {
				if(isProgress !== false) {
					Common.jBoxLoading('hide')
				};
				var res = {},
					err = '',
					str;
				try {
					res = JSON.parse(data.responseText);
					err = res['error'] + '';
				} catch(err) {}
				if(param.url.indexOf('userid=null') >= 0) {
					str = '未登录，请登录';
				} else if(err.indexOf('1008000') === 0) {
					str = '令牌超时，请重新登录';
				}
				if(str) {
					Common.jBoxConfirm('提示', str, function(index) {
						if(index === 1) {
							Common.openPage('../loginRegister.html');
						}
					}, ['去登录', '取消']);
				} else {
					Common.jBoxNotice((res.error_description || '未知错误'), 'red');
				};
				callback({});
			}
		}
		if(typeof arguments[0] === 'string') {
			param.url = _url;
			param.type = type;
			param.data = dataS;
			if(typeof dataS === 'string') {
				param.processData = false;
				param.headers = {
					'Content-Type': 'application/json;charset=UTF-8'
				};
			}
		} else {
			callback = arguments[1] || function() {};
			$.extend(param, arguments[0]);
			isProgress = arguments[2];
		}
		if(dataS instanceof FormData) {
			param.contentType = false;
			param.processData = false;
		}
		//判断是否需要遮罩
		if(globalData.isProgress === false && isProgress === undefined) { //禁止全局加载进度
			isProgress = false;
		}
		if(isProgress !== false) {
			Common.jBoxLoading('show')
		};
		if(param.url.indexOf('/') === 0) { //说明请求地址需要签名
			var ttFn = function(tturl, timestamp) {
					var userid = Common.storageL(Common.userId),
						token = Common.storageL(Common.token),
						sign = md5(tturl + '?userid=' + userid + '&token=' + token + '&timestamp=' + timestamp).toUpperCase();
					return(Common.DOMAIN_NAME + tturl + '?userid=' + userid + '&timestamp=' + timestamp + '&sign=' + sign);
				},
				signFn = function() {
					if(Common.seaverTs && Common.localOs) { //短时间内不会多次请求时间戳
						var ds = Date.now() - Common.localOs;
						if(ds > 0 && ds < 60000) { //‘短时间’的时间ms
							param.url = ttFn(param.url, (Common.seaverTs + ds));
							$.ajax(param);
							return false;
						}
					}
					$.ajax({
						url: Common.DOMAIN_NAME + '/ushop-web-admin/user/login/timestamp',
						type: 'get',
						dataType: 'json',
						timeout: 20000,
						success: function(data) {
							if(data && data.timestamp) {
								Common.seaverTs = data.timestamp;
								Common.localOs = Date.now();
								param.url = ttFn(param.url, data.timestamp);
								$.ajax(param);
							} else {
								param.error();
							}
						},
						error: function() {
							param.error();
						}
					});
				};
			signFn();
		} else {
			$.ajax(param);
		}
	},

	//多次并发请求
	//arr参数为[{},[],function(){}]形式
	//参数为对象或者数组时，为ajax参数
	//参数为函数时，会直接执行此函数，并必须包含一个回调，否则无法判断执行完成
	ajaxAll: function(arr, callback) {
		callback = callback || function() {};
		var lgn = arr.length,
			rNum = 0,
			rArr = (function() {
				var a = lgn,
					b = [];
				while(a--) {
					b[b.length] = null;
				};
				return b;
			})(),
			rfn = function(i, data) {
				rNum++;
				rArr[i] = data;
				if(rNum === lgn) {
					Common.jBoxLoading('hide');
					callback.apply(null, rArr);
				};
			};
		if(lgn > 0) {
			Common.jBoxLoading('show');
		} else {
			return false;
		}
		$.each(arr, function(i, o) {
			if(o instanceof Array) {
				Common.ajax.apply(null, o.concat([function(data) {
					rfn(i, data)
				}, false]));
			} else if(o instanceof Function) {
				o(function(data) {
					rfn(i, (data || {}))
				});
			} else if(o instanceof Object) {
				Common.ajax(o, function(data) {
					rfn(i, data)
				}, false);
			} else {
				rfn(i, {});
			}
		});
	},
	//localStorage 全局使用前缀ls_global_，局部使用前缀ls_partly_
	//sessionStorage 全局使用前缀ss_global_，局部使用前缀ss_partly_
	storageL: function(key, val) {
		if(typeof(Storage) !== 'undefined') {
			if((val === undefined) || (val === null)) { //不存储undefined和null
				if(arguments[2] === true) {
					val = sessionStorage[key];
				} else {
					val = localStorage[key];
				}
				if(val && val.indexOf('obj-') === 0) {
					val = val.slice(4);
					return JSON.parse(val);
				} else {
					return val;
				}
			} else {
				var a = val;
				if(val instanceof Object) {
					val = 'obj-' + JSON.stringify(val);
				} else {
					val = val + '';
				}
				if(arguments[2] === true) {
					sessionStorage[key] = val;
				} else {
					localStorage[key] = val;
				}
				return a;
			}
		}
	},
	rmStorageL: function(key) {
		if(typeof(Storage) !== 'undefined' && key) {
			if(arguments[1] === true) {
				sessionStorage.removeItem(key);
			} else {
				localStorage.removeItem(key);
			}
		}
	},
	rmStorageLAll: function() {
		if(typeof(Storage) !== 'undefined') {
			if(arguments[0] === true) {
				sessionStorage.clear();
			} else {
				localStorage.clear();
			}
		}
	},
	//遮屏加载中
	jBoxLoading: function(status, str) {
		str = str || '';
		if(!document.getElementById('xl_loading_style')) {
			var a = $('<style id="xl_loading_style"></style>');
			a.html(
				'.xl_loading {position: fixed;left: 0;top: 0;width: 100%;height: 100%;background: rgba(0,0,0,0); z-index: 999999;}' +
				'.xl_loading.hide {display: none;}' +
				'.xl_loading.xl_loading_str {color: #333; font-size: 14px; margin-top: 15px; position: abaolute; left: 0; top: 50%; width: 100%; text-align: center;}' +
				'.xl_loading .jBox-spinner {width: 36px;height: 36px;margin: -15px 0 0 -15px;}' +
				'.xl_loading .jBox-spinner:not(:required):before {width: 100%;height: 100%;border: solid 3px rgba(0,0,0,.1);border-top-color: #ff9c00;}'
			)
			a.appendTo('head');
		}
		var box = $('.xl_loading');
		if(box.length === 0) {
			box = $('<div class="xl_loading hide"></div>');
			box.html('<div class="jBox-spinner"></div><div class="xl_loading_str"></div>');
			box.appendTo('body');
		}
		if(status === 'hide') {
			box.addClass('hide');
		} else if(status === 'show') {
			if(str) {
				box.find('.xl_loading_str').html(str);
			}
			box.removeClass('hide');
		}
	},

	//本地数据表格呈现
	//tableId     表格存放位置table的ID，带有#的string
	//pagerId    编辑栏容器的ID，带有#的string
	//data              需要呈现的数据，array
	//colModel          数据model，array
	//callback          回调函数，function
	goodsStatistical: function(tableId, pagerId, data, colModel, caption, groupingView) {
		var me = this, grouping;
		caption = caption ? caption : '数据呈现';
		if(groupingView) {
			grouping = true;
		} else {
			grouping = false;
			groupingView = {};
		}
		var $table = $(tableId),
			pwidth = function () {
				var $p = $table.parents('.control_gridw');
				$p = $p[0] ? $p : $('#xlgridBox');
				return ($p.is(':visible') ? $p.width() : 0);
			};
		//resize to fit page size
		$(window).on('resize.jqGrid', function() {
			var pw = pwidth();
			if ( pw ) {
				$table.jqGrid('setGridWidth', pw);
			}
		})
		//resize on sidebar collapse/expand
		$(document).on('settings.ace.jqGrid', function(ev, event_name, collapsed) {
			if(event_name === 'sidebar_collapsed' || event_name === 'main_container_fixed') {
				//setTimeout is for webkit only to give time for DOM changes and then redraw!!!
				setTimeout(function() {
					$table.jqGrid('setGridWidth', pwidth());
				}, 20);
			}
		})
		$.each(colModel, function(index, obj) {
			obj.align = 'center';
		});
		//表格呈现
		jQuery(tableId).jqGrid({
			data: data,
			datatype: "local",
			height: 'auto',
			editurl: 'clientArray',
			rownumbers: true, //是否需要显示序号
			colModel: colModel,
			viewrecords: true, //是否显示总行数和记录
			rowNum: 10, //每页显示的行数
			rowList: [10, 20, 30],
			pager: pagerId, //下面编辑栏放置的位置
			altRows: true, //斑马纹
			multiselect: true, //是否可以选择
			multiboxonly: true, //是否只能选择一条
			loadComplete: function() {
				var table = this;
				setTimeout(function() {
					me.updatePagerIcons(table); //分页小图标
					me.enableTooltips(table); //工具提示
				}, 0);
			},
			caption: caption,
			grouping: grouping,
			groupingView: groupingView
		});
		$(window).triggerHandler('resize.jqGrid'); //触发窗口调整网格得到正确的大小

	},
	// 网络请求数据表格呈现
	//tableId     表格存放位置table的ID，带有#的string
	//pagerId    编辑栏容器的ID，带有#的string
	//data              需要呈现的数据，array
	//colModel          数据model，array
	//callback          回调函数，function
	gridBackPaging: function(tableId, pagerId, url, colModel, postData, caption) {
		postData = postData ? postData : {};
		postData.rowNum ? postData.rowNum : (postData.rowNum = 10);
		postData.multiboxonly ? (postData.multiboxonly = false) : (postData.multiboxonly = true);
		//resize to fit page size
		var $table = $(tableId),
			pwidth = function () {
				var $p = $table.parents('.control_gridw');
				$p = $p[0] ? $p : $('#xlgridBox');
				return ($p.is(':visible') ? $p.width() : 0);
			};
		$(window).on('resize.jqGrid', function() {
			var pw = pwidth();
			if ( pw ) {
				$table.jqGrid('setGridWidth', pw);
			}
		})
		//resize on sidebar collapse/expand
		$(document).on('settings.ace.jqGrid', function(ev, event_name, collapsed) {
			if(event_name === 'sidebar_collapsed' || event_name === 'main_container_fixed') {
				//setTimeout is for webkit only to give time for DOM changes and then redraw!!!
				setTimeout(function() {
					$table.jqGrid('setGridWidth', pwidth());
				}, 20);
			}
		})
		if(url.indexOf(Common.DOMAIN_NAME) === 0) {
			var _url = url.split(Common.DOMAIN_NAME),
				url1 = _url[1].split('?'),
				urlParam = url1[1] ? ('&' + url1[1]) : '';
			_url = url1[0];
		} else {
			_url = url;
			urlParam = '';
		}
		var me = this,
		defOption = {
				mtype: "GET",
				datatype: "json",
				editurl: 'clientArray',
				rownumbers: true, //是否需要显示序号
				height: 'auto',
				viewrecords: true, //是否显示总行数和记录
				rowNum: postData.rowNum, //每页显示的行数
				rowList: [postData.rowNum, postData.rowNum * 2, postData.rowNum * 3],
				pager: pagerId, //下面编辑栏放置的位置
				altRows: true, //斑马纹
				multiselect: true, //是否可以选择
				multiboxonly: postData.multiboxonly, //false,//是否只能选择一条
				colModel: colModel,
				align: 'center',
				jsonReader: { //修改如何解析服务器返回的数据
					root: "recordList", //包含实际数据的数组
					page: "currentPage", //当前页
					total: "pagePage", //总页数
					records: "totalCount" //查询出的记录数
				},
				prmNames: { //修改向服务器传递参数
				},
				postData: postData, //额外向服务器传输数据
				loadComplete: function() {
					var table = this;
					setTimeout(function() {
						me.updatePagerIcons(table); //分页小图标
						me.enableTooltips(table); //工具提示
					}, 0);
				},
				pager: pagerId
			},
			extraOption = ((typeof caption) === 'object') ? caption : {
				caption: (caption || '数据呈现')
			};
		extraOption.caption ? '' : extraOption.caption = '数据呈现';
		$.extend(defOption, extraOption);
		Common.formatUrl(_url, function(newUrl) {
			defOption.url = newUrl + urlParam;
			$table.jqGrid(defOption);
			$(window).triggerHandler('resize.jqGrid'); //触发窗口调整网格得到正确的大小
		});
	},

	//分页小图标样式
	updatePagerIcons: function(table) {
		var replacement = {
			'ui-icon-seek-first': 'ace-icon fa fa-angle-double-left bigger-140',
			'ui-icon-seek-prev': 'ace-icon fa fa-angle-left bigger-140',
			'ui-icon-seek-next': 'ace-icon fa fa-angle-right bigger-140',
			'ui-icon-seek-end': 'ace-icon fa fa-angle-double-right bigger-140'
		};
		$('.ui-pg-table:not(.navtable) > tbody > tr > .ui-pg-button > .ui-icon').each(function() {
			var icon = $(this);
			var $class = $.trim(icon.attr('class').replace('ui-icon', ''));

			if($class in replacement) icon.attr('class', 'ui-icon ' + replacement[$class]);
		})
	},
	//工具提示
	enableTooltips: function(table) {
		$('.navtable .ui-pg-button').tooltip({
			container: 'body'
		});
		$(table).find('.ui-pg-div').tooltip({
			container: 'body'
		});
	},

	// 获取菜单数据
	getLeftMenu : function ( mtype, callback ) {
		mtype = mtype || '';
		callback = callback || function () {};
		var that = this,
			leftMenu = that.storageL(that.leftMenu, null, true), // 获取本地菜单数据
			userId = that.storageL(that.userId); // 获取用户ID
		if ( !userId ) {
			Common.jBoxNotice('未登录或登录失效！', 'red');
			return false;
		}
		// 可以使用本地菜单数据
		if ( leftMenu && (leftMenu.mtype === mtype) ) {
			callback(leftMenu.list);
			return false;
		}
		var _url = '/ushop-web-admin/user/login/getAuthority',
			_param = {
				operatorId: userId,
				menuType: mtype
			}
		that.ajax(_url, 'get', _param, function ( data ) {
			if ( data.lits && data.lits.childs ) {
				that.storageL(that.leftMenu, {mtype: mtype, list: data.lits.childs}, true);
				callback(data.lits.childs);
			}
		});
	},
	// 格式化菜单数据
	formatMenu: function ( p ) {
		var that = this,
			iconData = [
				'dashboard', 'briefcase', 'database',
				'plane', 'star', 'credit-card-alt',
				'user-secret', 'users', 'user-plus',
				'bar-chart', 'file-text', 'heart', 'file',
				'user-md', 'tasks'
			],
			iconStr = '', hstr = '',
			cunobj = {}; // 记录当前页面的菜单内容数据
		function ff ( arr ) {
			var str = '';
			$.each(arr, function ( index, obj ) {
				iconStr = iconData[index] ? iconData[index] : 'heart';
				hstr = ''; // 地址字符串
				// 全部用相对地址
				if ( (obj.isLeaf + '') === '1' ) { // 树叶数据
					if ( obj.self && obj.self.url ) {
						hstr = $.trim(obj.self.url);
						// 通过路径查找是否当前页面的菜单数据
						if ( document.URL.indexOf(hstr) > 0 ) {
							cunobj = obj.self;
						}
						hstr = obj.self.url.replace('/html/', '../');
					}
					hstr = hstr ? (' href="' + hstr + '" ') : '';
					str += '<li data-mid="' + obj.id + '" data-mname="' + obj.name + '">' +
						'<a ' + hstr + '>' +
						'<i class="menu-icon fa fa-caret-right"></i>' +
						'<span class="menu-text">' + obj.name + '</span>' +
						'</a>' +
						'<b class="arrow"></b>' +
						'</li>';
				} else { //　树干数据
					str += '<li data-mid="' + obj.id + '" data-mname="' + obj.name + '">' +
						'<a href="#" class="dropdown-toggle">' +
						'<i class="menu-icon fa fa-' + iconStr + '"></i>' +
						'<span class="menu-text">' + obj.name + '</span>' +
						'<b class="arrow fa fa-angle-down"></b>' +
						'</a>' +
						'<b class="arrow"></b>' +
						'<ul class="submenu">' +
						ff(obj.childs) +
						'</ul>' +
						'</li>';
				}
			});
			return str;
		}
		return {htmlstr: ff(p), cunobj: cunobj};
	},
	// 只需要一个参数，那个后台的数据，如：Common.menuNavContent('夺宝管理后台');
	// 为了兼容旧版本，也可以传给第三个参数，如：Common.menuNavContent('', '', '夺宝管理后台');
	menuNavContent: function() {
		var that = this,
			mtype = '',
			mtext = arguments[2] || arguments[0];
		switch( mtext ) {
			case '夺宝管理后台': mtype = '1';
			break;
			case '运营管理后台': mtype = '2';
			break;
			case '系统管理后台': mtype = '3';
			break;
			case '积分管理后台': mtype = '4';
			break;
			case '游戏管理后台': mtype = '5';
			break;
			case '用户管理后台': mtype = '6';
			break;
			case '统计管理后台': mtype = '7';
			break;
			case '抽奖游戏后台': mtype = '8';
			break;
		}
		that.getLeftMenu(mtype, function ( list ) {
			var $box = $('#leftMenuBox'),
				$this,
				fmenu = that.formatMenu(list), // 解析格式化菜单数据
				cunobj = fmenu.cunobj, // 当前页面的菜单数据
				pid = cunobj.parentId || (cunobj.parent && cunobj.parent.id), // 父id
				cid = cunobj.id; // 子id
			$box.html(fmenu.htmlstr); // 菜单赋值
			
			var pele = $box.find('[data-mid="' + pid + '"]'),
				cele = $box.find('[data-mid="' + cid + '"]'),
				ptext = pele.attr('data-mname') || '', // 父菜单文字
				ctext = cele.attr('data-mname') || ''; // 子菜单文字
			pele.addClass('active open'); // 展开父菜单
			cele.addClass('active'); // 选中子菜单
			//第一个导航条，带有主页字样的
			$('#breadcrumbsUl').html(
				'<li>' +
				'<i class="ace-icon fa fa-home home-icon"></i>' +
				'<a href="' + '../Index/Index.html">主页</a>' +
				'</li>' +
				'<li>' +
				'<a href="#">' + ptext + '</a>' +
				'</li>' +
				'<li class="active">' + ctext + '</li>'
			);
			//第二个导航条，蓝色大字体
			$('#menuPageHeader').html(
				'<h1>' +
				ptext +
				'<small>' +
				'<i class="ace-icon fa fa-angle-double-right"></i>' +
				ctext +
				'</small>' +
				'</h1>'
			);
			// 标签页抬头内容
			$('title').html(ptext + '-' + ctext);
		});
	},
	//jbox的自动消失的提示信息
	//content提示内容str
	//color背景颜色str    green, red
	//autoClose 自动关闭的时间num
	//position 定位
	jBoxNotice: function(content, color, autoClose, position) {
		var agt0 = arguments[0];
		//用户快速点击时把之前的弹框清除
		$('[id^=jBoxID]').remove();
		if(typeof agt0 == 'string') {
			content = content || '您没有给内容！';
			color = color || 'black';
			autoClose = autoClose || 7000;
			position = position || {
				x: 'center',
				y: 20
			};
			new jBox('Notice', {
				content: agt0,
				color: color,
				position: position,
				autoClose: autoClose,
				animation: {
					open: 'slide: bottom',
					close: 'move: top'
				}
			});
		} else {
			new jBox('Notice', agt0);
		}
	},

	//jbox的确认的提示框
	//title 信息抬头str
	//content提示内容str
	//callback 回调函数，参数为1表示确定2表示取消
	//btns数组，确定和取消的按键名 ['确定', '取消']
	jBoxConfirm: function(title, content, callback, btns) {
		callback = callback || function() {};
		title = title || '提示信息';
		content = content || '没有内容';
		btns = btns || ['确定', '取消']
		new jBox('Confirm', {
			title: title,
			content: content,
			confirmButton: btns[0],
			cancelButton: btns[1],
			confirm: function() {
				callback(1);
			},
			cancel: function() {
				callback(2);
			},
			onCloseComplete: function() {
				this.destroy();
			}
		}).open();
	},

	//打开新页面
	openPage: function(url, obj, fn){
		if(obj && (obj instanceof Object)){
			var a = [];
	    	$.each(obj, function(key, val){
	    		val = val || '';
	    		a[a.length] = (key + '=' + encodeURIComponent((val instanceof Object) ? JSON.stringify(val) : val))
	    	});
	    	if(url.indexOf('?') < 0){
	    		url = url + '?' + a.join('&');
	    	}else{
	    		url = url + '&' + a.join('&');
	    	}
		}
		//打开页面前，执行的函数，如果函数返回false则阻止跳转
		if(fn && (typeof fn) === 'function'){
			if(fn() === false){
				return false;
			}
		}
		window.location.href = url;
	},
	//时间戳转换为Y-m-d, Y-m-d H:i:s
	//ms为毫秒时间戳
	//format为true时将只返回Y-m-d，否则返回Y-m-d H:i:s
	msToTime: function(ms, format) {
		if(!ms) {
			return ''
		};
		ms = (ms instanceof Date) ? ms : new Date(ms);
		var _date = new Date(ms);
		var _y = _date.getFullYear(),
			_m = _date.getMonth() + 1,
			_d = _date.getDate(),
			_h = _date.getHours(),
			_i = _date.getMinutes(),
			_s = _date.getSeconds();
		var Y = (_y < 10) ? ('0' + _y) : _y,
			m = (_m < 10) ? ('0' + _m) : _m,
			d = (_d < 10) ? ('0' + _d) : _d,
			H = (_h < 10) ? ('0' + _h) : _h,
			i = (_i < 10) ? ('0' + _i) : _i,
			s = (_s < 10) ? ('0' + _s) : _s;
		if(format === true) {
			return(Y + '-' + m + '-' + d);
		} else {
			return(Y + '-' + m + '-' + d + ' ' + H + ':' + i + ':' + s);
		}
	},
	showStar: function(n) {
		var star = '';
		for(var i = 0; i < n; i++) {
			star += '<i class="star-on-png"></i> ';
		}
		for(var j = 5; j > n; j--) {
			star += '<i class="star-off-png"></i> ';
		}
		return star
	}
};
//域名地址判断，以便于以后不用发版本都去更改这个域名地址
(function() {
	var domainUrl = location.protocol + '//' + location.host;
	Common.DOMAIN_NAME = domainUrl; //生产环境的域名地址
	//项目域名地址重置，以便于本地使用
	if(domainUrl.indexOf('8020') > 0) {
		Common.DOMAIN_NAME = 'http://10.35.0.115';
//		Common.DOMAIN_NAME = 'http://183.62.200.201:6080';
//		Common.DOMAIN_NAME = 'http://10.35.0.166:8090';
//		Common.DOMAIN_NAME = 'http://10.35.0.134';
//		Common.DOMAIN_NAME = 'http://10.13.0.57';
//		Common.DOMAIN_NAME = 'http://clbtest.lotplay.cn';
//		Common.DOMAIN_NAME = 'http://10.13.0.170';
//		Common.DOMAIN_NAME = 'http://pay.lotplay.cn';
//		Common.DOMAIN_NAME = 'http://clb.lotplay.cn';
	}
	//图片地址（已经不用了）
	Common.IMAGE_URL = "http://clb.lotplay.cn:8080/";
	//统计线上地址
	if(Common.DOMAIN_NAME.indexOf('clb.lotplay.cn') > 0) {
		Common.STATICS_NAME = 'http://clb.lotplay.cn/uplatform-web-report'; //统计
	} else {
		Common.STATICS_NAME = 'http://10.13.0.70:9093/ReportServer'; //统计
	}
})();
(function () {
	// 欢迎字样
	$('#navbarUserInfo').html('<small>欢迎,</small>' + (Common.storageL(Common.userName) || '错误'));
	// 抬头logo
	$('#navbarHeaderLogo').html(
		'<a href="' + '../Index/Index.html" class="navbar-brand">' +
		'<small>' +
		'<i class="fa fa-leaf"></i>' +
		'彩乐宝后台管理' +
		'</small>' +
		'</a>'
	);
})()

//登陆退出
$('.dropdown-menu-right').on('click', 'li:last-child a', function() {
	Common.rmStorageL(Common.userId);
	Common.rmStorageL(Common.token);
	Common.rmStorageL(Common.userName);
	Common.openPage('../loginRegister.html');
});