/**
 * 作用：默认每个页面都直接执行的函数，包括一些常用数据
 * 日期：2017-04-05
 * 作者：xulin
 **/
"use strict";
//页面全局变量
var globalData = {
	
	//储存页面参数
	pageParam: {},
	delayScroll: true,//用来判断滚动到底部
	requestNum: 0,//用来记录有多少次用户请求
	refreshComplete: 0,//用来记录请求完成次数
	//全局页面加载完成后执行
	loadReady: function(){
		//解析页面数据
		globalData.deCodeUrlFn();//解析URL
		globalData.menuLoadFn();//初始化菜单
		globalData.faviconInit();//初始化小图标
		
	},
	
	faviconInit: function(){
		$('<link rel="shortcut icon" href="../../image/icon/logoicon.png" />').appendTo('head');
	},
	
	//解析URL
	deCodeUrlFn: function(dataStr){
		var str = dataStr || (document.URL + '').split('?')[1] || '';
		str = str.split('#')[0] || '';
		if(str){
			var a = {},
				b = str.split('&'),
				i = 0, s;
			while(s = b[i++]){
				s = (s + '').split('=');
				a[s[0]] = decodeURIComponent(s[1]);
			}
			if(!dataStr){globalData.pageParam = a;}
			return a;
		}
		return {};
	},
	//是否需要底部菜单
	menuLoadFn: function(){
		var strArr = [
				{str: 'weixinmp/home.html', eq: 0},
				{str: 'weixinmp/shopping_ds.html', eq: 1},
				{str: 'discover/dis_frame.html', eq: 2},
				{str: 'weixinmp/mine.html', eq: 3}
			],
			urlStr = document.URL,
			i = 0, o, isTrue = false,
			box = $('<div id="menu_tpl_box"></div>');
		while(o = strArr[i++]){
			if(urlStr.indexOf(o.str) >= 0){
				isTrue = true;
				break;
			}
		}
		if(isTrue === false){return false;};
		box.load('../template/menu_tpl.html', function(){
			var aEle = $('#foot_menu_box').find('.xlmenu-item').eq(o.eq);
			aEle.addClass('active');
			aEle.find('img').attr('src', aEle.attr('asrc'));
			try{
				if((typeof menuLoadAfterFn) === 'function'){
					menuLoadAfterFn();
				}
			}catch(err){}
		}).appendTo('body');
	}
};


//注册账号验证=1 忘记密码验证=2 绑定手机验证=3 更换手机验证=4
var userCodeNote = {
	register     : '1',//注册账号验证
	findPwd      : '2',//忘记密码验证
	bindPhone    : '3',//绑定手机验证
	changePhone  : '4' //更换手机验证
}

//banner图链接地址，后台ID对比
// 关联类型 relationType
// 1 活动类型, 2 游戏类型, 3 商品类型, 4 H5页面
// 关联ID relationWebId
// 活动配置方式		活动ID|活动任务ID|活动货币类型 1012|1|1001 积分专场才需要货币类型
// 游戏配置方式		直接配置游戏ID
// 商品配置方式		1|34 商品ID为34的拼购商品 2|34 商品ID为34的电商商品
// H5配置方式		  暂无，应该可以配置为H5的地址
var globalActivity = [
	{id: '1001', pageName: 'perfectInfo', url: '../activity/perfect_info.html', text: '完善个人信息活动-1001', textName: '完善信息有好礼'},
//	{id: '1002', pageName: 'recharge', url: 'recharge.html', text: '充值活动-1002', textName: '充值返利'},
//	{id: '1003', pageName: 'buy1Activity', url: 'buy1Activity.html', text: '彩购活动1-1003', textName: '彩购有礼'},
//	{id: '1004', pageName: 'vipProduct', url: 'vipProduct.html', text: '彩购活动-1004', textName: '99元以下专享好商品'},
//	{id: '1005', pageName: 'recruit', url: 'recruit.html', text: '推广员活动详情1-1005', textName: '招广员招募令'},
//	{id: '1006', pageName: 'feedback', url: 'feedback.html', text: '推广员活动详情2-1006', textName: '推广有礼'},
//	{id: '1007', pageName: 'gameActivity1', url: 'gameActivity1.html', text: '游戏活动1-1007', textName: '游戏在线有礼'},
//	{id: '1008', pageName: 'gameActivity2', url: 'gameActivity2.html', text: '游戏活动2-1008', textName: '游戏首充有礼'},
//	{id: '1009', pageName: 'paiLottery', url: 'paiLottery.html', text: '拍彩票活动-1009', textName: '拍彩票送彩豆'},
	{id: '1010', pageName: 'qiandao', url: '../activity/sign_in.html', text: '每日签到-1010', textName: '签到送好礼'},
	//关联方式 '页面关联ID|活动ID'
//	{id: '1011', pageName: 'turntable_win', url: 'widget://html/ecommerce/activity/turntable_win.html', text: '转盘抽奖-1011', textName: '转盘抽奖'},
	//关联方式 '页面关联ID|活动ID|彩豆类型fundType'
	{id: '1012', pageName: 'product_int_win', url: '../activity/integral_sp.html', text: '专场活动列表-1012', textName: '专场活动列表'},
	//关联方式 '页面关联ID|游戏ID|lucky'
	{id: '1013', pageName: 'lucky_home', url: '../lucky_draw/lucky_home.html', text: '抽奖活动-1013', textName: '抽奖活动'},
	//关联方式 '页面关联ID|商品ID'
	{id: '1014', pageName: 'fiction_p', url: '../fiction/fiction_p.html', text: '虚拟物品-1014', textName: '虚拟物品'},
	//关联方式 '页面关联ID|活动ID|用户ID'
	{id: '1015', pageName: 'beauty_shop', url: '../weixinmp/bs/index.html#/totalTable', text: '最美投注站-1015', textName: '最美投注站'}
];


//彩票省份对比
var commonProvinceData = [
	// {id: '00', name: '全国'},
	{id: '11', name: '北京市'},
	{id: '12', name: '天津市'},
	{id: '13', name: '河北省'},
	{id: '14', name: '山西省'},
	{id: '15', name: '内蒙古'},
	{id: '21', name: '辽宁省'},
	{id: '22', name: '吉林省'},
	{id: '23', name: '黑龙江'},
	{id: '31', name: '上海市'},
	{id: '32', name: '江苏省'},
	{id: '33', name: '浙江省'},
	{id: '34', name: '安徽省'},
	{id: '35', name: '福建省'},
	{id: '36', name: '江西省'},
	{id: '37', name: '山东省'},
	{id: '41', name: '河南省'},
	{id: '42', name: '湖北省'},
	{id: '43', name: '湖南省'},
	{id: '44', name: '广东省'},
	{id: '45', name: '广西省'},
	{id: '46', name: '海南省'},
	{id: '50', name: '重庆市'},
	{id: '51', name: '四川省'},
	{id: '52', name: '贵州省'},
	{id: '53', name: '云南省'},
	{id: '54', name: '西藏'},
	{id: '61', name: '陕西省'},
	{id: '62', name: '甘肃省'},
	{id: '63', name: '青海省'},
	{id: '64', name: '宁夏'},
	{id: '65', name: '新疆'}
];
