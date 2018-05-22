package com.genlot.ushop.api.merchant.spellbuy.cart.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
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
import com.genlot.common.utils.net.IPSeeker;
import com.genlot.common.utils.number.AmountUtil;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.entity.Account;
import com.genlot.ucenter.facade.account.entity.ExchangeRate;
import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundUsageEnum;
import com.genlot.ucenter.facade.account.enums.AccountTradeTypeEnum;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.account.service.AccountTradeFacade;
import com.genlot.ucenter.facade.account.service.ExchangeRateFacade;
import com.genlot.ucenter.facade.account.vo.AccountTransactionVo;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ushop.facade.order.entity.OrderPayment;
import com.genlot.ushop.facade.order.enums.PaymentBizTypeEnum;
import com.genlot.ushop.facade.order.enums.PaymentStatusEnum;
import com.genlot.ushop.facade.order.exceptions.OrderBizException;
import com.genlot.ushop.facade.order.service.OrderManagementFacade;
import com.genlot.ushop.facade.order.service.OrderPayFacade;
import com.genlot.ushop.facade.order.service.OrderQueryFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ushop.api.merchant.spellbuy.cart.entity.vo.ProductCartDetailVo;
import com.genlot.ushop.facade.product.service.ProductCacheFacade;
import com.genlot.ushop.facade.product.service.ProductImageFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyOrderFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;
import com.genlot.ushop.facade.product.entity.ProductImage;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.entity.ProductOrder;
import com.genlot.ushop.facade.product.entity.SpellBuyOrder;
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
import com.genlot.ushop.facade.product.entity.vo.SpellBuyProductRemainVo;
import com.genlot.ushop.facade.product.enums.ProductOrderStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductStyleEnum;
import com.genlot.ushop.facade.product.enums.SpellBuyOrderStatusEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;
import com.genlot.ushop.facade.product.exceptions.SpellBuyBizException;

@Controller
@RequestMapping(value = "/api/spellbuy/cart/settlement")
public class SettlementController {
	
	private static final Logger log = LoggerFactory.getLogger(SettlementController.class);
		
	@Autowired 
	private ProductCacheFacade productCacheFacade;
	
	@Autowired
	private ProductQueryFacade productQueryFacade;
	
	@Autowired 
	private SpellBuyProductQueryFacade spellBuyProductQueryFacade;
	
	@Autowired 
	private SpellBuyProductFacade spellBuyProductFacade;
	
	@Autowired 
	private SpellBuyOrderFacade spellBuyOrderFacade;
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;
		
	@Autowired
	private OrderManagementFacade orderManagementFacade;
	
	@Autowired
	private OrderQueryFacade orderQueryFacade;
	
	@Autowired
	private OrderPayFacade orderPayFacade;
	
	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private AccountQueryFacade accountQueryFacade;
	
	@Autowired
	private ExchangeRateFacade exchangeRateFacade;
	
	@Autowired
	private IPSeeker iPSeeker; 
	
	/**
	 * 商品结算请求.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/cart/settlement/check
	 * @param   请求参数 访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @body  json data 
	 * 			Content-Type: application/json;charset=UTF-8 
	 * 			格式:[{"spellbuyProductId":"商品拼购(索引期数)","buyCount":"个数"},...]
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
				// 最终确定购买的个数
				Integer buyMoney = Integer.valueOf(0);
				if (cartBuy.getBuyCount() <= 0) {
					throw ProductBizException.PRODUCT_NOT_EXIST;
				}
				// 获得拼购商品信息，进行购买数量检查
				SpellBuyProductRemainVo remainVo = spellBuyProductFacade.checkCount(
						userId, 
						cartBuy.getSpellbuyProductId(), 
						cartBuy.getBuyCount());
				SpellBuyProduct spellbuy = spellBuyProductQueryFacade.getByProductId(cartBuy.getProductId());
				Product product = productQueryFacade.getById(cartBuy.getProductId());
				if (product.getStatus() != ProductStatusEnum.UP.getValue()) {
					throw ProductBizException.PRODUCT_STATUS_DOWN_ACTIVE;
				}
				// 整理信息
				buyMoney = Integer.valueOf(buyMoney.intValue() + remainVo.getRemainCount());
				cartDetail.setMerchantNo(product.getMerchantId());
				cartDetail.setBuyLimit(remainVo.getRemainLimit());
				cartDetail.setBuyCount(remainVo.getRemainCount());
				cartDetail.setBuyMoney(buyMoney);
				cartDetail.setCurrentBuyCount(spellbuy.getSpellbuyCount());
				cartDetail.setProductId(spellbuy.getProductId());
				cartDetail.setProductPrice(spellbuy.getSpellbuyPrice());
				cartDetail.setSinglePrice(spellbuy.getSpellbuySinglePrice());
				cartDetail.setProductLimit(spellbuy.getSpellbuyLimit());
				cartDetail.setProductStyle(Integer.valueOf(0));
				cartDetail.setProductPeriod(spellbuy.getProductPeriod());
				cartDetail.setSpellbuyProductId(cartBuy.getSpellbuyProductId());
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
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/cart/settlement/order/是否积分抵扣
	 * @param   请求参数 访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @body  json data 
	 * 			Content-Type: application/json;charset=UTF-8 
	 * 			格式:[{"spellbuyProductId":"商品拼购(索引期数)","buyCount":"个数"},...]
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/order/{isPoint}",method = RequestMethod.POST)
	@ResponseBody
	public Object order(	
			@PathVariable Integer isPoint,
			@RequestBody List<OrderProductVo> productList,
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
			// 获得会员信息
			MemberInfo member = memberInfoFacade.getMemberByUserNo(userId);
			// 创建用户订单
			SpellBuyOrder order = buildUserOrder(
					userId,
					member,
					productList,
					isPoint,
					WebUtils.getIpAddr(request));
			// 创建支付订单
			OrderPayment pay = buildPayOrder(
					userId, 
					order.getOrderNo(),
					order.getMoney(),
					order.getPoint(),
					WebUtils.getIpAddr(request),
					member);
			// 关联
			order.setTransactionId(pay.getOrderNo());
			// 创建订单
			spellBuyOrderFacade.createOrder(order);
			// 创建支付订单
			orderManagementFacade.createOrder(pay);
			// 用户订单可见
			spellBuyOrderFacade.changeStatus(order.getOrderNo(),SpellBuyOrderStatusEnum.SPELLBUY_ORDER_STAT_NOT_PAID);
			uiModel.put("orderNo",order.getOrderNo()); 
			uiModel.put("payNo",order.getTransactionId()); 
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		return uiModel;
	}
	
	
	public SpellBuyOrder buildUserOrder(String userNo,MemberInfo member,List<OrderProductVo> productList,Integer isPoint,String ip) {
		
		// 初始化订单支付对象
		SpellBuyOrder order = new SpellBuyOrder();
		order.setUserImage(member.getHeadImage());
		order.setUserName(member.getNickName());
		// 初始化订单支付对象
		order.setStatus(SpellBuyOrderStatusEnum.SPELLBUY_ORDER_STAT_INVISIBLE.getValue());
		order.setBuyIp(ip);
		order.setBuyLocal(iPSeeker.getAddress(ip));
		{
			Double totalMoney = Double.valueOf(0);
			Integer totalProduct = Integer.valueOf(0);
			// 结算金额
			for (int index = 0; index < productList.size(); ++index) 
			{
				// 获得购物车上的购买信息
				OrderProductVo cartBuy = productList.get(index);
				Product info = productQueryFacade.getById(cartBuy.getProductId());
				if (info.getStatus() != ProductStatusEnum.UP.getValue())
				{
					throw ProductBizException.PRODUCT_STATUS_DOWN_ACTIVE;
				}
				if (cartBuy.getBuyCount() <= 0) {
					throw ProductBizException.PRODUCT_NOT_EXIST;
				}
				SpellBuyProduct prodcut = spellBuyProductQueryFacade.getById(cartBuy.getSpellbuyProductId());
				
				// 数量添加
				totalMoney = totalMoney + cartBuy.getBuyCount().doubleValue() * prodcut.getSpellbuySinglePrice();
				totalProduct = Integer.valueOf(totalProduct.intValue() + 1);
				cartBuy.setProductPrice(prodcut.getSpellbuyPrice());
				cartBuy.setProductPeriod(prodcut.getProductPeriod());
				cartBuy.setProductSinglePrice(prodcut.getSpellbuySinglePrice());
				cartBuy.setProductName(info.getProductName());
				cartBuy.setBoughtCount(0);
			}
						
			// 把订单添加到订单系统中
			order.setWithold(JSON.toJSONString(productList));		
			order.setBuyCount(totalProduct);	
			order.setDate(DateUtils.LONG_DATE_FORMAT.format(new Date()));
			order.setMoney(Double.valueOf(totalMoney));
			order.setUserId(userNo);
		}
		
		ExchangeRate rate = exchangeRateFacade.getBy(
				(long)AccountFundTypeEnum.RMB.getValue(),
				(long)AccountFundTypeEnum.POINT.getValue());
		if (rate == null) {
			throw OrderBizException.ORDER_PAYMENT_ORDER_STATUS_FAILED;
		}
				
		OrderCurrencyVo currencyVo = new OrderCurrencyVo();
		currencyVo.setType(AccountFundTypeEnum.POINT.getValue());
		currencyVo.setValue(0.0);
		Map<Integer,OrderCurrencyVo> totalPoints = new HashMap<Integer,OrderCurrencyVo>();

		if (isPoint == 1)
		{
			Double totalMoney = Double.valueOf(order.getMoney());
			Account pointAccount = accountQueryFacade.getAccountByUserNo_fundType(
					order.getUserId(), 
					Long.valueOf(AccountFundTypeEnum.POINT.getValue()));
			Double credit = Double.valueOf(0);
			Double spend  = AmountUtil.mul(totalMoney,rate.getRate());
			credit = pointAccount.getBalance();
			if (credit > 0)
			{
				if (credit >= spend)
				{
					credit   = spend;
					spend	 = 0.0;
				}
				else
				{
					spend = AmountUtil.sub(spend,credit);
				}
								
				currencyVo.setValue(credit);
				order.setMoney(AmountUtil.div(spend,rate.getRate()));
			}
			totalPoints.put(AccountFundTypeEnum.POINT.getValue(), currencyVo);
		}
		
		if (order.getMoney() > 0.0) {
			throw AccountBizException.ACCOUNT_AVAILABLEBALANCE_IS_NOT_ENOUGH;
		}
		
		order.setPoint(JSON.toJSONString(totalPoints));
		String orderNo = spellBuyOrderFacade.buildOrderNo();
		order.setOrderNo(orderNo);
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
		order.setPayType(PaymentBizTypeEnum.SPELLBUY.getValue());
		order.setBuyCount(1);	
		order.setDate(DateUtils.LONG_DATE_FORMAT.format(new Date()));
		order.setOrderNo(payNo);
		order.setUserId(userNo);
		order.setWithold(orderNo);
		order.setPoint(point);
		return order;
	}
	
	/**
	 * 充值下单请求.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/cart/settlement/recharge/金额
	 * @param   请求参数 访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/recharge/{money}",method = RequestMethod.POST)
	@ResponseBody
	public Object recharge(
			@PathVariable Integer money,
			HttpServletRequest request, 
			HttpServletResponse response) 
	{
		// 用户ID
		String userId = null;		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		String orderNo;
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			MemberInfo member = memberInfoFacade.getMemberByUserNo(userId);
			// 初始化订单支付对象
			OrderPayment order = new OrderPayment();
			order.setUserImage(member.getHeadImage());
			order.setUserName(member.getNickName());
			// 初始化订单支付对象
			orderNo = orderManagementFacade.buildOrderNo();
			order.setPayStatus(PaymentStatusEnum.PAY_STAT_NOT_PAID.getValue());
			order.setPayType(0);
			order.setIntegral(0.0);
			order.setBankMoney(0.0);
			order.setBuyIp(WebUtils.getIpAddr(request));
			order.setMoney(money.doubleValue());
			order.setPayType(PaymentBizTypeEnum.RECHARGE.getValue());
			order.setBuyCount(1);	
			order.setDate(DateUtils.LONG_DATE_FORMAT.format(new Date()));
			order.setOrderNo(orderNo);
			order.setUserId(userId);
			order.setWithold(JSON.toJSONString(money));
			order.setPoint(null);
			if (money.doubleValue() < 1)
			{
				throw OrderBizException.ORDER_PAYMENT_ORDER_NOT_EXIST;
			}
			orderManagementFacade.createOrder(order);
			
			uiModel.put("orderNo",orderNo); 
		} catch (Exception exception) {
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		// 成功返回
        return uiModel;
	}
	
	
	/**
	 * 充值订单状态请求.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/cart/settlement/recharge/status/订单id
	 * @param   请求参数 访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param orderNo 
	 * 			订单id
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/recharge/status/{orderNo}",method = RequestMethod.GET)
	@ResponseBody
	public Object rechargeStatus(
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
			OrderPayment order = orderQueryFacade.getOrderPaymentByOrderNo(orderNo);
			if(order == null || order.getUserId().equals(userId) == false)
			{
				throw OrderBizException.ORDER_PAYMENT_ORDER_NOT_EXIST;
			}
			
			uiModel.put("orderNo",orderNo); 
			uiModel.put("status",order.getPayStatus()); 
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
				
		return uiModel;
	}
	
	/**
	 * 拼购订单状态请求.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/cart/settlement/status/订单id
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
			SpellBuyOrder order = spellBuyOrderFacade.getByOrderNo(orderNo);
			if(order == null || order.getUserId().equals(userId) == false)
			{
				throw SpellBuyBizException.ORDER_NOT_EXIST;
			}
				
			uiModel.put("recordList", JSON.parseArray(order.getWithold(), OrderProductVo.class));
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
