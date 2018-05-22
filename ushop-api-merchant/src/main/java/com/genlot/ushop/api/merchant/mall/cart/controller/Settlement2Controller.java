package com.genlot.ushop.api.merchant.mall.cart.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.oltu.oauth2.common.OAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSON;
import com.genlot.common.config.PublicConfig;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.order.event.entity.OrderCurrencyVo;
import com.genlot.common.message.order.event.entity.OrderProductVo;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.number.AmountUtil;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.entity.Account;
import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundUsageEnum;
import com.genlot.ucenter.facade.account.enums.AccountTradeTypeEnum;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.account.service.AccountTradeFacade;
import com.genlot.ucenter.facade.account.vo.AccountTransactionVo;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ushop.facade.inventory.entity.InventoryAmount;
import com.genlot.ushop.facade.inventory.service.InventoryManagementFacade;
import com.genlot.ushop.facade.order.entity.OrderPayment;
import com.genlot.ushop.facade.order.enums.PaymentBizTypeEnum;
import com.genlot.ushop.facade.order.enums.PaymentStatusEnum;
import com.genlot.ushop.facade.order.exceptions.OrderBizException;
import com.genlot.ushop.facade.order.service.OrderManagementFacade;
import com.genlot.ushop.facade.order.service.OrderQueryFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.UserAddress;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserAddressFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ushop.api.merchant.spellbuy.cart.entity.vo.ProductCartDetailVo;
import com.genlot.ushop.facade.product.service.ProductCacheFacade;
import com.genlot.ushop.facade.product.service.ProductImageFacade;
import com.genlot.ushop.facade.product.service.ProductOrderFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.entity.ProductCurrency;
import com.genlot.ushop.facade.product.entity.ProductImage;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.entity.ProductOrder;
import com.genlot.ushop.facade.product.entity.ProductOrderDetail;
import com.genlot.ushop.facade.product.entity.ProductPriceRule;
import com.genlot.ushop.facade.product.enums.ProductDeliveryEnum;
import com.genlot.ushop.facade.product.enums.ProductOrderStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductStyleEnum;
import com.genlot.ushop.facade.product.exceptions.MallBizException;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;

@Controller
@RequestMapping(value = "/api/mall/cart/settlement")
public class Settlement2Controller {
	
	private static final Logger log = LoggerFactory.getLogger(Settlement2Controller.class);
		
	@Autowired 
	private ProductCacheFacade productCacheFacade;
	
	@Autowired
	private ProductQueryFacade productQueryFacade;
	
	@Autowired
	private ProductOrderFacade productOrderFacade;
				
	@Autowired
	private OrderManagementFacade orderManagementFacade;
	
	@Autowired
	private OrderQueryFacade orderQueryFacade;
	
	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private AccountQueryFacade accountQueryFacade;
	
	@Autowired
	private AccountTradeFacade accountTradeFacade;
	
	@Autowired
	private UserAddressFacade userAddressFacade;
	
	@Autowired
	private InventoryManagementFacade inventoryManagementFacade;
	
	/**
	 * 商品结算请求.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/cart/settlement/check
	 * @param   请求参数 访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @body  json data 
	 * 			Content-Type: application/json;charset=UTF-8 
	 * 			格式:[{"productId":"商品id","buyCount":"个数"},...]
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/check",method = RequestMethod.POST)
	@ResponseBody
	public Object check(
			@RequestBody List<OrderProductVo> productList,
			HttpServletRequest request, 
			HttpServletResponse response) 
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		// 购物车数据
		List<ProductCartDetailVo> productCartList = new ArrayList<ProductCartDetailVo>();
		// 余额 积分
		double balance = 0;
		double point   = 0;
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			String userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			for (int index = 0; index < productList.size(); ++index) 
			{
				// 获得购物车上的购买信息
				OrderProductVo cartBuy = productList.get(index);
				// 返回给前端的购物车的购买信息
				ProductCartDetailVo cartDetail = new ProductCartDetailVo();
				if (cartBuy.getBuyCount() <= 0) {
					throw ProductBizException.PRODUCT_NOT_EXIST;
				}
				Product product = productQueryFacade.getById(cartBuy.getProductId());
				if (product.getStatus() != ProductStatusEnum.UP.getValue())
				{
					cartDetail.setCurrentBuyCount(0);
				}
				else 
				{
					// 获得拼购商品信息，进行购买数量检查
					if (inventoryManagementFacade.check(
							cartBuy.getProductId().toString(), 
							cartBuy.getBuyCount())) {
						cartDetail.setCurrentBuyCount(1);
					}
					else {
						cartDetail.setCurrentBuyCount(0);
					}
				}
				
				// 整理信息
				cartDetail.setBuyCount(cartBuy.getBuyCount());
				cartDetail.setProductId(cartBuy.getProductId());
				cartDetail.setProductStyle(Integer.valueOf(0));
				productCartList.add(cartDetail);
			}
			
			Account pointAccount = accountQueryFacade.getAccountByUserNo_fundType(
					userId, 
					Long.valueOf(AccountFundTypeEnum.POINT.getValue()));
			
			Account balanceAccount = accountQueryFacade.getAccountByUserNo_fundType(
					userId,
					Long.valueOf(AccountFundTypeEnum.RMB.getValue()));
			

			balance = balanceAccount.getBalance();
			point   = pointAccount.getBalance();
			
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("recordList", productCartList);
		uiModel.put("balance", balance);
		uiModel.put("point", point);
		return uiModel;
	}
	
	/**
	 * 商品下单请求.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/cart/settlement/order/地址id
	 * @param   请求参数 访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @body  json data 
	 * 			Content-Type: application/json;charset=UTF-8 
	 * 			格式:[{"productId":"商品id","buyCount":"个数", "buyPrice":"购买价格规则"},...]
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/order/{address}",method = RequestMethod.POST)
	@ResponseBody
	public Object order(	
			@PathVariable Integer address,
			@RequestBody List<OrderProductVo> productList,
			HttpServletRequest request, 
			HttpServletResponse response) 
	{	
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		// 用户ID
		String userNo = null;
		// 通过令牌获得用户ID
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			MemberInfo member = memberInfoFacade.getMemberByUserNo(userNo);
			UserAddress userAddress = userAddressFacade.getById(address);
			
			// 生成订单
			ProductOrder order = buildUserOrder(
					userNo, 
					member, 
					userAddress, 
					WebUtils.getIpAddr(request), 
					productList);
			
			// 创建支付订单
			OrderPayment pay = buildPayOrder(
					userNo, 
					order.getOrderNo(),
					order.getMoney() + order.getFee(),
					order.getPoint(),
					WebUtils.getIpAddr(request),
					member);
			
			// 关联
			order.setPayNo(pay.getOrderNo());
			// 创建订单,并进行预扣库存
			productOrderFacade.createOrder(order);
			// 创建支付订单
			orderManagementFacade.createOrder(pay);
			// 用户订单可见
			productOrderFacade.changeStatus(order.getOrderNo(),ProductOrderStatusEnum.PRODUCT_ORDER_STAT_NOT_PAID);
			// 返回订单号
			uiModel.put("orderNo",order.getOrderNo());
			uiModel.put("payNo",pay.getOrderNo()); 
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		return uiModel;
	}
	
	public ProductOrder buildUserOrder(String userNo, MemberInfo member,UserAddress userAddress, String ip, List<OrderProductVo> productList) {
		
		// 初始化订单支付对象
		ProductOrder order = new ProductOrder();
		order.setUserName(member.getNickName());
		order.setUserNo(userNo);
		order.setBuyDate(DateUtils.LONG_DATE_FORMAT.format(new Date()));
		order.setEndDate(DateUtils.LONG_DATE_FORMAT.format(DateUtils.addHour(new Date(),2)));
		// 初始化订单支付对象
		String orderNo = productOrderFacade.buildOrderNo();
		order.setStatus(ProductOrderStatusEnum.PRODUCT_ORDER_STAT_INVISIBLE.getValue());
		order.setOrderNo(orderNo);
		if (userAddress != null) {
			order.setAddress(JSON.toJSONString(userAddress));
		}
		order.setRefund(0);
		order.setParent(orderNo);
		order.setBuyIp(ip);
	
		// 结算商品
		Double totalValue = Double.valueOf(0);
		Double totalMoney = Double.valueOf(0);
		Double totalFee   = Double.valueOf(0);	
		Map<String, Double> merchantFeeMap = new HashMap<String, Double>();
		List<ProductOrderDetail> items = new ArrayList<ProductOrderDetail>();
		Map<Integer,OrderCurrencyVo> totalPoints = new HashMap<Integer,OrderCurrencyVo>();
		
		Boolean cash = false;
		Boolean point = false;
		
		for (int index = 0; index < productList.size(); ++index) 
		{
			// 获得购物车上的购买信息
			OrderProductVo cartBuy = productList.get(index);
			Product info = productQueryFacade.getById(cartBuy.getProductId());
			if (info.getStatus() != ProductStatusEnum.UP.getValue()) {
				throw ProductBizException.PRODUCT_STATUS_DOWN_ACTIVE;
			}
			if (cartBuy.getBuyCount() <= 0) {
				throw ProductBizException.PRODUCT_NOT_EXIST;
			}
			
			ProductOrderDetail item = new ProductOrderDetail();
			item.setIndex(index + 1);
			item.setMerchantId(info.getMerchantId());
			item.setMerchantName(info.getMerchantName());
			item.setProductId(cartBuy.getProductId());
			item.setProductName(info.getProductName());
			item.setHeadImage(info.getHeadImage());
			item.setNumber(cartBuy.getBuyCount());
			item.setProductPrice(info.getProductPrice());
			item.setProductRealPrice(info.getProductRealPrice());
			item.setProductType(info.getProductType());
			item.setProductDelivery(info.getProductDelivery());
			
			// 根据支付方式计算金额
			List<ProductCurrency> priceRules = info.getProductPriceRuleById(cartBuy.getBuyPrice());
			if (priceRules == null || priceRules.size() == 0) {
				throw ProductBizException.PRODUCT_STATUS_DOWN_ACTIVE;
			}
			
			for(int count = 0; count < priceRules.size(); ++count) {
				ProductCurrency price = priceRules.get(count);
				if (price.getType() >= AccountFundTypeEnum.POINT.getValue()) {
					
					if(price.getType() == AccountFundTypeEnum.POINT.getValue()) {
						cash = true;
					}
					if(price.getType() > AccountFundTypeEnum.POINT.getValue()) {
						point = true;
					}
					
					OrderCurrencyVo totalPoint = null;
					if (totalPoints.containsKey(price.getType())) {
						totalPoint = totalPoints.get(price.getType());
					}
					else {
						totalPoint = new OrderCurrencyVo();
						totalPoint.setType(price.getType());
						totalPoint.setValue(0.0);
						totalPoints.put(price.getType(), totalPoint);
					}
					totalPoint.setValue(totalPoint.getValue() + (AmountUtil.mul(price.getValue(),cartBuy.getBuyCount())));
				}
				else if (price.getType().equals(AccountFundTypeEnum.RMB.getValue())) {
					totalMoney += AmountUtil.mul(price.getValue(),cartBuy.getBuyCount());
					cash = true;
				}
				else {
					// 暂时不支持的货币
					throw ProductBizException.PRODUCT_STATUS_DOWN_ACTIVE;
				}
			}
			
			if (cash.equals(point)) {
				throw ProductBizException.PRODUCT_PRICE_USAGE_NOT_ACTIVE;
			}
			
			item.setPrice(JSON.toJSONString(priceRules));
			item.setFee(info.getFreight());
			
			if (merchantFeeMap.containsKey(info.getMerchantId())) {
				if (merchantFeeMap.get(info.getMerchantId()) < info.getFreight()) {
					merchantFeeMap.put(info.getMerchantId(), info.getFreight());
				}
			}
			else {
				merchantFeeMap.put(info.getMerchantId(), info.getFreight());
			}
			
			items.add(item);
			totalValue += AmountUtil.mul(info.getProductPrice(),cartBuy.getBuyCount());
		}
		
		for (Double value : merchantFeeMap.values()) {
			totalFee += value;
		}
		order.setTotal(totalValue);
		order.setMoney(totalMoney);
		order.setFee(totalFee);
		order.setPoint(JSON.toJSONString(totalPoints));
		order.setWithold(JSON.toJSONString(items));
		order.setBuyDate(DateUtils.LONG_DATE_FORMAT.format(new Date()));
		
		// 判断平台积分抵扣
		if (totalPoints.containsKey(AccountFundTypeEnum.POINT.getValue())) {
			Account pointAccount = accountQueryFacade.getAccountByUserNo_fundType(
					order.getUserNo(), 
					Long.valueOf(AccountFundTypeEnum.POINT.getValue()));
			OrderCurrencyVo totalPoint = totalPoints.get(AccountFundTypeEnum.POINT.getValue());
			if (pointAccount.getBalance() < totalPoint.getValue()) {	
				throw AccountBizException.ACCOUNT_AVAILABLEBALANCE_IS_NOT_ENOUGH;
			}
		}
		
		return order;
	}
	
	public OrderPayment buildPayOrder(String userNo, String orderNo, Double money, String point, String ip, MemberInfo member) {
		// 初始化订单支付对象
		OrderPayment order = new OrderPayment();
		order.setUserImage(member.getHeadImage());
		order.setUserName(member.getNickName());
		// 初始化订单支付对象
		String payNo = orderManagementFacade.buildOrderNo();
		order.setPayStatus(PaymentStatusEnum.PAY_STAT_INVISIBLE.getValue());
		order.setPayType(0);
		order.setIntegral(0.0);
		order.setBankMoney(0.0);
		order.setBuyIp(ip);
		order.setMoney(money.doubleValue());
		order.setPayType(PaymentBizTypeEnum.SHOPPING.getValue());
		order.setBuyCount(1);	
		order.setDate(DateUtils.LONG_DATE_FORMAT.format(new Date()));
		order.setOrderNo(payNo);
		order.setUserId(userNo);
		order.setWithold(orderNo);
		order.setPoint(point);
		return order;
	}
	
	/**
	 * 订单状态请求.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/cart/settlement/status/订单id
	 * @param   请求参数 访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param orderNo 
	 * 			订单id
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/status/{orderNo}",method = RequestMethod.GET)
	@ResponseBody
	public Object status(
			@PathVariable String orderNo,
			HttpServletRequest request, 
			HttpServletResponse response) 
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		// 用户ID
		String userId = null;
		// 通过令牌获得用户ID
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
					
			// 获得订单状态,判断是否能够支付
			ProductOrder order = productOrderFacade.getByNo(orderNo);
			if(order == null || order.getUserNo().equals(userId) == false)
			{
				throw MallBizException.PRODUCT_ORDER_NOT_EXIST;
			}
			
			uiModel.put("orderNo",orderNo); 
			uiModel.put("status",order.getStatus()); 
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
				
		return uiModel;
	}
	
	
	protected void setErrorMessage(Exception exception, Map<String,Object> uiModel)
	{
		uiModel.clear();
		if (exception instanceof BizException)
		{
			BizException e = (BizException)exception;
			uiModel.put("error", e.getCode());
			uiModel.put("error_description", e.getMsg());
		}
		else
		{
			uiModel.put("error", 0);
			uiModel.put("error_description", "unknown error");
		}
	}
	
	
}
