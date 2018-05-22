/**
 * 作用：购物车数据，基于Common.js文件
 * 作者：xulin
 * 日期：2017-08-15
 */
"use strict";
var OrderData = {
	//获取本地存储的购物车数据的字符串，用于本地储存的localStorage的相应字段
	getLocalStr: function(){
		return 'storgeOrderDataDS' + Common.getUserId();
	},
	
	//获取当前的订单数据，就是购物车数据，
	//参数为回调函数，和是否高级获取，高级获取会重新去服务器请求数据
	getOrderData: function(callback, senior){
		callback = callback || function(){};
		var curData = Common.storageL(OrderData.getLocalStr()) || [],
			lgn = curData.length;
		curData.sort(function(a1, a2){
			return parseInt(a1.productId) - parseInt(a2.productId);
		});
		callback(curData);
		return curData;
	},
	
	//获取商品详情数据
	//参数为 商品ID，回调函数
	getProductData: function(productId, callback){
		if(!productId){return false;};
		callback = callback || function(){};
		var _url = Common.domainUrl + '/ushop-api-merchant/api/mall/product/detail/getProductById/' + productId + '.json',
			itemData, ruleObj;
		Common.ajax(_url, 'get', {}, function(data){
			if(data.productId && data.detail && data.detail.status == 2){
				ruleObj = OrderData.formatRule(data.detail.rule);
				data.ruleArr = ruleObj.ruleArr;
				data.checkedRule = ruleObj.checkedRule;
				itemData = {
					productId: data.productId,//商品ID
					ruleArr: ruleObj.ruleArr,//支付方式数据
					checkedRule: ruleObj.checkedRule || {},//默认选中的支付方式数据
					buyCount: parseInt(data.buyCount) || 0,//购买的数量
					merchantName: data.detail.merchantName,//商家名称
					merchantId: data.detail.merchantId,//商家ID
					productTitle: data.detail.productTitle,//商品说明
					productName: data.detail.productName,//商品名称
					headImage: data.detail.headImage,//商品缩略图
					stock: parseInt(data.detail.stock) || 0,//商品库存
					usage: data.detail.usage,//商品类型
					freight: parseFloat(data.detail.freight) || 0//运费
				};
				callback(itemData, 'success', data);
			}else{
				callback(data, 'error');
			}
		});
	},
	
	
	//支付方式格式化
	formatRule: function(rule){
		var ruleArr, checkedRule;
		try{
			ruleArr = JSON.parse(rule);
		}catch(err){}
		if((typeof ruleArr === 'object') && ruleArr[0]){
			checkedRule = ruleArr[0];
			Common.each(ruleArr, function(ri, ro){
				ro.ruleMoney = 0;//金钱
				ro.ruleIntegral = 0;//平台积分
				ro.pIntegral = 0;//其他积分，省级分之类的
				ro.intType = [];
				if(ro.flag == 1){
					checkedRule = ro;
				}
				Common.each(ro.currencys, function(rindex, robj){
					if((robj.value > 0) && (ro.intType.indexOf(robj.type) < 0)){//整理此种支付方式需要的货币类型
						ro.intType.push(robj.type);
					}
					if(robj.type == 999){
						ro.ruleMoney += (robj.value ? robj.value : 0);
					}else if(robj.type == 1001){
						ro.ruleIntegral += (robj.value ? robj.value : 0);
					}else{
						ro.pIntegral += (robj.value ? robj.value : 0);
					}
				});
				ro.payTypeText =    OrderData.getTotalCr([{
										num: 1,//必须是数字
										cr: ro//当前的rule对象（整理后的）
									}]);
			});
		}else{
			ruleArr = [];
			checkedRule = parseInt(rule) || 0;
		}
		return {
			ruleArr: ruleArr,
			checkedRule: checkedRule
		}
	},
	
	//总统计
	//参数为一个数字，可以统计多个产品
//	getTotalCr([{
//		num: num,//必须是数字
//		cr: cr//当前的rule对象（整理后的）
//	}])
	getTotalCr: function(arr){
		//人民币,平台积分，彩豆,省级分等其他积分
		var mi = 0, ii = 0, pi = 0;
		$.each(arr, function(index, obj){
			mi += obj.num*obj.cr.ruleMoney;//人民币
			ii += obj.num*obj.cr.ruleIntegral;//平台积分，彩豆
			pi += obj.num*obj.cr.pIntegral;//省级分等其他积分
		});
		
		var txt = (mi ? ('<small>￥</small>' + mi) : '');
		if(txt){
			txt += (ii ? ('<small>+</small>' + ii + '<small>彩豆</small>') : '');
		}else{
			txt = (ii ? (ii + '<small>彩豆</small>') : '');
		}
		if(txt){
			txt += (pi ? ('<small>+</small>' + pi + '<small>积分</small>') : '');
		}else{
			txt = (pi ? (pi + '<small>积分</small>') : '');
		}
		return txt;
	},
	//添加到购物车
	//productId商品Id
	//buyCount增加的数量
	addOrder: function(productId, buyCount, callback){
		productId = +productId;
		buyCount = +buyCount;
		if(!productId){return false;};
		callback = callback || function(){};
		var curData = OrderData.getOrderData(),
			lgn = curData.length,
			i, isTrue = true;
		Common.each(curData, function(index, obj){
			if(obj.productId === parseInt(productId)){
				var stockNum = parseInt(obj.stock);
				buyCount = obj.buyCount + (parseInt(buyCount) || 1);
				obj.buyCount = buyCount > stockNum ? stockNum : buyCount;
				Common.storageL(OrderData.getLocalStr(), curData);
				callback('success', curData, obj);
				isTrue = false;
				return false;
			}
		});
		if(isTrue === false){return false;};
		OrderData.getProductData(productId, function(data, status){
			if(status === 'success'){
				var stockNum = parseInt(data.stock) || 0;
				if(stockNum > 0){
					buyCount = parseInt(buyCount) || 1,
					data.buyCount = buyCount > stockNum ? stockNum : buyCount;
					curData[curData.length] = data;
					Common.storageL(OrderData.getLocalStr(), curData);
					OrderData.changeAfterFn();
					callback('success', curData, data);
					return false;
				}
			}
			callback('error', curData);
		});
	},
	
	//更新购物车中的商品数量
	//商品的ID
	//buyCount 对应ID的商品数量
	updataBuynum: function(productId, buyCount, callback){
		if(!productId || !buyCount){return false;};
		callback = callback || function(){};
		var curData = OrderData.getOrderData();
		Common.each(curData, function(index, obj){
			if(obj.productId === parseInt(productId)){
				obj.buyCount = parseInt(buyCount);
				Common.storageL(OrderData.getLocalStr(), curData);
				callback('success', curData);
				return false;
			}
		});
	},
	
	//更新购物车的选中支付方式
	//ruleId 支付方式的id
	updataRule: function(productId, ruleId, callback){
		if(!productId || !ruleId){return false;};
		callback = callback || function(){};
		var curData = OrderData.getOrderData();
		Common.each(curData, function(index, obj){
			if(obj.productId === parseInt(productId)){
				Common.each(obj.ruleArr, function(ri, ro){
					if(ro.id === parseInt(ruleId)){
						obj.checkedRule = ro;
						return false;
					}
				});
				Common.storageL(OrderData.getLocalStr(), curData);
				callback('success', curData);
				return false;
			}
		});
	},
	
	//更新购物车的选中支付方式
	//selectlist 1表示选中状态，2表示未选中状态
	updataSelect: function(productId, selectlist, callback){
		if(!productId || !selectlist){return false;};
		callback = callback || function(){};
		var curData = OrderData.getOrderData();
		Common.each(curData, function(index, obj){
			if(obj.productId === parseInt(productId)){
				obj.selectlist = selectlist;
				Common.storageL(OrderData.getLocalStr(), curData);
				callback('success', curData);
				return false;
			}
		});
	},
	
	//删除购物车中的商品
	//productId商品的id
	deleteData: function(proArr, callback){
		if(proArr && !(proArr.length > 0)){return false;};
		callback = callback || function(){};
		var curData = OrderData.getOrderData(),
			newData = [];
		Common.each(curData, function(index, obj){
			if(proArr.indexOf(obj.productId) < 0){
				newData[newData.length] = obj;
			}
		});
		Common.storageL(OrderData.getLocalStr(), newData);
		OrderData.changeAfterFn();
		callback('success', newData);
	},

	//重置购物车
	//可以传一个参数新的购物车数组，否则将全部清空
	resetOrder: function(){
		var curData = arguments[0] || [];
		Common.storageL(OrderData.getLocalStr(), curData);
		OrderData.changeAfterFn();
	},
	//数据改变之后执行的函数
	changeAfterFn: function(){
		
	},

	//订单数据整理
	//orderList 为商品详情数组
	splitOrderFn: function(orderList){
		var totalFreight = 0,//总需运费
			totalMoney = 0,//总需金额
			totalIntegral = 0,//总需积分
			totalMF = 0,//总计金额加运费
			totalPIntegral = 0,//总需其他积分
			totalText = '',//统计字符串不包含运费
			totalTextFM = '';//统计字符串包括运费
		var merArr = [],//按商家分类
			isTrue,//用于判断
			tm, ti, tf, tp,
			proIdArr = [],//所有的商品ID
			intArr = [];//支付的所有货币类型
		Common.each(orderList, function(index, obj){
			proIdArr[proIdArr.length] = obj.productId;
			intArr = intArr.concat(obj.checkedRule.intType);
			isTrue = true;
			tm = (obj.buyCount*obj.checkedRule.ruleMoney || 0);//金额
			ti = (obj.buyCount*obj.checkedRule.ruleIntegral || 0);//积分
			tp = (obj.buyCount*obj.checkedRule.pIntegral || 0);//其他积分
			tf = obj.freight;//运费
			Common.each(merArr, function(mi, mo){
				if(mo.merchantId === obj.merchantId){
					tf = ((tf < mo.totalFreight) ? mo.totalFreight : tf);
					mo.totalMoney += tm;
					mo.totalIntegral += ti;
					mo.totalPIntegral += tp;
					mo.totalFreight = tf;
					mo.totalMF = (mo.totalMoney + tf);
					mo.proArr.push(obj);
					isTrue = false;
					return false;
				}
			});
			if(isTrue === true){
				merArr.push({
					merchantId: obj.merchantId,//商家ID
					merchantName: obj.merchantName,//商家名称
					totalMoney: tm,//商家金额
					totalIntegral: ti,//商家总计彩豆
					totalPIntegral: tp,
					totalFreight: tf,//商家总计运费
					totalMF: (tm + tf),//金额加运费
					proArr: [obj]
				});
			};
		});
		Common.each(merArr, function(index, obj){
			totalMoney += obj.totalMoney;
			totalIntegral += obj.totalIntegral;
			totalPIntegral += obj.totalPIntegral;
			totalFreight += obj.totalFreight;
			totalMF += obj.totalMF;
			
			obj.totalMoney = parseFloat(obj.totalMoney.toFixed(2));
			obj.totalIntegral = parseFloat(obj.totalIntegral.toFixed(2));
			obj.totalPIntegral = parseFloat(obj.totalPIntegral.toFixed(2));
			obj.totalMF = parseFloat(obj.totalMF.toFixed(2));
			
			//不含运费数据展现
			obj.totalText = (obj.totalMoney ? ('<small>￥</small>' + obj.totalMoney) : '');
			if(obj.totalText){
				obj.totalText += (obj.totalIntegral ? ('<small>+</small>' + obj.totalIntegral + '<small>彩豆</small>') : '');
			}else{
				obj.totalText = (obj.totalIntegral ? (obj.totalIntegral + '<small>彩豆</small>') : '');
			}
			if(obj.totalText){
				obj.totalText += (obj.totalPIntegral ? ('<small>+</small>' + obj.totalPIntegral + '<small>积分</small>') : '');
			}else{
				obj.totalText = (obj.totalPIntegral ? (obj.totalPIntegral + '<small>积分</small>') : '');
			}
			
			//含运费数据展现
			obj.totalTextFM = (obj.totalMF ? ('<small>￥</small>' + obj.totalMF) : '');
			if(obj.totalTextFM){
				obj.totalTextFM += (obj.totalIntegral ? ('<small>+</small>' + obj.totalIntegral + '<small>彩豆</small>') : '');
			}else{
				obj.totalTextFM = (obj.totalIntegral ? (obj.totalIntegral + '<small>彩豆</small>') : '');
			}
			if(obj.totalTextFM){
				obj.totalTextFM += (obj.totalPIntegral ? ('<small>+</small>' + obj.totalPIntegral + '<small>积分</small>') : '');
			}else{
				obj.totalTextFM = (obj.totalPIntegral ? (obj.totalPIntegral + '<small>积分</small>') : '');
			}
			
		});
		
		totalMoney = parseFloat((totalMoney || 0).toFixed(2));
		totalIntegral = parseFloat((totalIntegral || 0).toFixed(2));
		totalPIntegral = parseFloat((totalPIntegral || 0).toFixed(2));
		totalFreight = parseFloat((totalFreight || 0).toFixed(2));
		totalMF = parseFloat((totalMF || 0).toFixed(2));
		
		//不含运费数据展现
		totalText = (totalMoney ? ('<small>￥</small>' + totalMoney) : '');
		if(totalText){
			totalText += (totalIntegral ? ('<small>+</small>' + totalIntegral + '<small>彩豆</small>') : '');
		}else{
			totalText = (totalIntegral ? (totalIntegral + '<small>彩豆</small>') : '');
		}
		if(totalText){
			totalText += (totalPIntegral ? ('<small>+</small>' + totalPIntegral + '<small>积分</small>') : '');
		}else{
			totalText = (totalPIntegral ? (totalPIntegral + '<small>积分</small>') : '');
		}
		
		//含运费数据展现
		totalTextFM = (totalMF ? ('<small>￥</small>' + totalMF) : '');
		if(totalTextFM){
			totalTextFM += (totalIntegral ? ('<small>+</small>' + totalIntegral + '<small>彩豆</small>') : '');
		}else{
			totalTextFM = (totalIntegral ? (totalIntegral + '<small>彩豆</small>') : '');
		}
		if(totalTextFM){
			totalTextFM += (totalPIntegral ? ('<small>+</small>' + totalPIntegral + '<small>积分</small>') : '');
		}else{
			totalTextFM = (totalPIntegral ? (totalPIntegral + '<small>积分</small>') : '');
		}
		
		return {
			totalMoney: totalMoney,//总计商品金额
			totalIntegral: totalIntegral,//总计商品积分
			totalPIntegral: totalPIntegral,//总计商品积分（非平台积分）
			totalFreight: totalFreight,//总计商品运费
			totalMF: totalMF,//总计商品金额，包含运费
			totalText: totalText,//总计字符串，不包含运费
			totalTextFM: totalTextFM,//总计字符串，包含运费
			merchantArr: merArr,//按商家拆单
			proIdArr: proIdArr,//所有商品的ID
			intArr: removeRepeatFn(intArr)//所有需要使用的货币类型
		}
	}
}


//数据去重复
function removeRepeatFn(arr){
	if(arr.length > 1){
		var a = [];
		Common.each(arr, function(i, n){
			if(a.indexOf(n) < 0){
				a[a.length] = n;
			};
		});
		return a;
	}else{
		return arr;
	}
}
