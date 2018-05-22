//package com.genlot.ushop.api.merchant.root.controller;
//
//import java.util.Date;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//
//import org.apache.shiro.authc.SimpleAuthenticationInfo;
//import org.apache.shiro.authc.UnknownAccountException;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Controller;
//import org.springframework.ui.Model;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestMethod;
//import org.springframework.web.bind.annotation.ResponseBody;
//
//import com.alibaba.fastjson.JSON;
//import com.genlot.common.config.PublicConfig;
//import com.genlot.common.exceptions.BizException;
//import com.genlot.common.message.order.event.entity.OrderProductVo;
//import com.genlot.common.utils.DateUtils;
//import com.genlot.common.utils.string.StringTools;
//import com.genlot.common.utils.validate.ValidateUtils;
//import com.genlot.common.web.utils.WebUtils;
//import com.genlot.ucenter.facade.oauth.entity.AccessToken;
//import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
//import com.genlot.ucenter.facade.user.entity.MemberInfo;
//import com.genlot.ucenter.facade.user.entity.UserInfo;
//import com.genlot.ucenter.facade.user.entity.UserOperator;
//import com.genlot.ucenter.facade.user.enums.UserStatusEnum;
//import com.genlot.ucenter.facade.user.exceptions.UserBizException;
//import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
//import com.genlot.ucenter.facade.user.service.UserManagementFacade;
//import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
//import com.genlot.ucenter.facade.user.service.UserQueryFacade;
//import com.genlot.ushop.facade.order.entity.OrderPayment;
//import com.genlot.ushop.facade.order.enums.PaymentBizTypeEnum;
//import com.genlot.ushop.facade.order.enums.PaymentStatusEnum;
//import com.genlot.ushop.facade.order.service.OrderManagementFacade;
//import com.genlot.ushop.facade.order.service.OrderPayFacade;
//import com.genlot.ushop.facade.order.service.OrderQueryFacade;
//import com.genlot.ushop.facade.product.entity.ProductInfo;
//import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
//import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
//import com.genlot.ushop.facade.product.exceptions.ProductBizException;
//import com.genlot.ushop.facade.product.service.ProductCacheFacade;
//import com.genlot.ushop.facade.product.service.ProductQueryFacade;
//import com.genlot.ushop.facade.product.service.SpellBuyProductCacheFacade;
//import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;
//import com.genlot.ushop.facade.sms.enums.SmsTypeEnum;
//import com.genlot.ushop.facade.sms.service.SMSClientFacade;
//import com.genlot.ushop.facade.sns.entity.Advertisement;
//
//@Controller
//@RequestMapping(value = "/api/root")
//public class rootController {
//
//	private static final Logger log = LoggerFactory
//			.getLogger(rootController.class);
//
//	@Autowired
//	private UserManagementFacade userManagementFacade;
//	
//	@Autowired
//	private ProductQueryFacade productQueryFacade;
//
//	@Autowired
//	private UserOperatorFacade userOperatorFacade;
//	
//	@Autowired
//	private OrderManagementFacade orderManagementFacade;
//	
//	@Autowired
//	private OAuthManagementFacade oauthManagementFacade;
//	
//	@Autowired
//	private OrderQueryFacade orderQueryFacade;
//	
//	@Autowired 
//	private SpellBuyProductQueryFacade spellBuyProductQueryFacade;
//	
//	@Autowired
//	private MemberInfoFacade memberInfoFacade;
//	
//	@Autowired
//	private OrderPayFacade orderPayFacade;
//	
//	@Autowired
//	private ProductCacheFacade productCacheFacade;
//	
//	@Autowired 
//	private SpellBuyProductCacheFacade spellBuyProductCacheFacade;
//
//	/**
//	 * 随机获得机器人账号.
//	 * 
//	 * @example 
//	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/root/getRobotAccount
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = { "/getRobotAccount" }, method = RequestMethod.GET)
//	@ResponseBody
//	public Object getRobotAccount() {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//
//		UserOperator userOperator = null;
//		try {
//			userOperator = userManagementFacade.getUserInfoByRand();
//		} catch (Exception exception) {
//			log.error(exception.toString());
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//
//		uiModel.put("loginName", userOperator.getLoginName());
//		uiModel.put("password", userOperator.getLoginPwd());
//		
//		return uiModel;
//	}
//	
//	
//	/**
//	 * 机器人登录.
//	 * 
//	 * @example 
//	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/root/login
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = { "/login" }, method = RequestMethod.POST)
//	@ResponseBody
//	public Object login(HttpServletRequest request) {
//		Map<String,Object> uiModel = new HashMap<String,Object>();
//		AccessToken token = null;
//		UserInfo userInfo = null;
//		
//		String loginName = StringTools.stringToTrim(request.getParameter("loginName"));
//		String password = StringTools.stringToTrim(request.getParameter("password"));
//		
//		loginName = loginName.replace("\"", "");
//		password = password.replace("\"", "");
//		log.debug("root login:" + loginName + " " + password);
//		
//		long time = 0L;
//		try
//		{
//			// 用户名
//			loginName = StringTools.stringToTrim(loginName); 
//			
//			// 登录
//			userInfo = userManagementFacade.robotMemberLogin(
//					loginName, 
//					password, 
//					PublicConfig.PWD_ERROR_LIMIT_TIMES,
//        			PublicConfig.PWD_ERROR_LIMIT_TIME);
//			
//			// 创建认证
//			token = oauthManagementFacade.createAccessToken(PublicConfig.APP_ID, loginName, userInfo.getUserNo());
//			
//			// 获得服务器时间
//			time = oauthManagementFacade.getServerTimestamp();
//			
//		}
//		catch (Exception exception)
//		{
//			exception.printStackTrace();
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		uiModel.put("userId", userInfo.getUserNo());
//		uiModel.put("token", token.getTokenId());
//		uiModel.put("timestamp", time);
//        return uiModel;
//	}
//
//	protected void setErrorMessage(Exception exception,
//			Map<String, Object> uiModel) {
//		uiModel.clear();
//		if (exception instanceof BizException) {
//			BizException e = (BizException) exception;
//			uiModel.put("error", e.getCode());
//			uiModel.put("error_description", e.getMsg());
//		} else {
//			uiModel.put("error", 0);
//			uiModel.put("error_description", "unknown error");
//		}
//	}
//	
//	
//	/**
//	 * 商品下单请求.
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/cart/settlement/order/是否积分抵扣
//	 * @param   请求参数 访问令牌
//	 * @error   {"error":"错误代号","error_description":"内容描述"}
//	 * @body  json data 
//	 * 			Content-Type: application/json;charset=UTF-8 
//	 * 			格式:[{"spellbuyProductId":"商品拼购(索引期数)","buyCount":"个数"},...]
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = "/order",method = RequestMethod.POST)
//	@ResponseBody
//	public Object order(
//			HttpServletRequest request, 
//			HttpServletResponse response) 
//	{
//		
//		String userId = StringTools.stringToTrim(request.getParameter("userNo"));
//		String products = StringTools.stringToTrim(request.getParameter("products"));
//
//		// Model View
//		Map<String,Object> uiModel = new HashMap<String,Object>();
//		// 通过令牌获得用户ID
//		log.debug("root order:" + userId + " " + products);
//		try
//		{
//			MemberInfo member = memberInfoFacade.getMemberByUserNo(userId);
//			// 初始化订单支付对象
//			OrderPayment order = new OrderPayment();
//			order.setUserImage(member.getHeadImage());
//			order.setUserName(member.getNickName());
//			// 初始化订单支付对象
//			String orderNo = orderManagementFacade.buildOrderNo();
//			order.setPayStatus(PaymentStatusEnum.PAY_STAT_NOT_PAID.getValue());
//			order.setPayType(0);
//			order.setIntegral(0.0);
//			order.setBankMoney(0.0);
//			order.setBuyIp(WebUtils.getIpAddr(request));
//			Double totalMoney = Double.valueOf(0);
//			Double credit = Double.valueOf(0);
//			Integer totalProduct = Integer.valueOf(0);
//			
//			List<OrderProductVo> productlist = JSON.parseArray(products, OrderProductVo.class);
//			
//			// 结算金额
//			for (int index = 0; index < productlist.size(); ++index) 
//			{
//				// 获得购物车上的购买信息
//				OrderProductVo cartBuy = productlist.get(index);
//				// 数量添加
//				totalMoney = totalMoney + cartBuy.getBuyCount();
//				totalProduct = Integer.valueOf(totalProduct.intValue() + 1);
//				
//				ProductInfo info = productCacheFacade.getProductInfoById(cartBuy.getProductId());
////				if (info.getStatus() != ProductStatusEnum.UP.getValue())
////				{
////					throw ProductBizException.PRODUCT_STATUS_DOWN_ACTIVE;
////				}
//				SpellBuyProduct prodcut = spellBuyProductCacheFacade.getSpellBuyProductByProductId(cartBuy.getProductId());
//				cartBuy.setProductPrice(prodcut.getSpellbuyPrice());
//				cartBuy.setProductPeriod(prodcut.getProductPeriod());
//				cartBuy.setProductName(info.getProductName());
//				cartBuy.setBoughtCount(0);
//				cartBuy.setSpellbuyProductId(prodcut.getId().intValue());
//			}
//			
//			// 把订单添加到订单系统中
//			order.setPayType(PaymentBizTypeEnum.SPELLBUY.getValue());
//			order.setWithold(JSON.toJSONString(productlist));
//			order.setPoint(JSON.toJSONString(0));
//			order.setBuyCount(totalProduct);	
//			order.setDate(DateUtils.LONG_DATE_FORMAT.format(new Date()));
//			order.setMoney(Double.valueOf(totalMoney));
//			order.setOrderNo(orderNo);
//			order.setUserId(userId);
//			Long elapsedTime = System.currentTimeMillis();
//			orderManagementFacade.createOrder(order);
//			// 彩购余额支付
//			orderPayFacade.shopPay(userId, orderNo);
//			elapsedTime = System.currentTimeMillis() - elapsedTime;
//			uiModel.put("elapsedTime",elapsedTime); 
//			uiModel.put("orderNo",orderNo); 
//			uiModel.put("userNo",userId); 
//			
//		}
//		catch (Exception exception)
//		{
//			log.error(exception.toString());
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		
//		return uiModel;
//	}
//	
//	/**
//	 * 购买商品清单(余额支付).
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/cart/payment/balancepay
//	 * @param 	请求参数 访问令牌. 
//	 * @error   {"error":"错误代号","error_description":"内容描述"}
//	 * @param orderNo 
//	 * 			订单id
//	 * @param isIntegral 
//	 * 			是否红包抵扣(0不使用，1使用)
//	 * @param isPoint 
//	 * 			是否红包抵扣(0不使用，1使用)
//	 * @return Model 视图对象.
//	 */
////	@RequestMapping(value = "/balancepay",method = RequestMethod.POST)
////	@ResponseBody
////	public Object balancepay(
////			HttpServletRequest request, 
////			HttpServletResponse response) 
////	{
////		String userId = StringTools.stringToTrim(request.getParameter("userNo"));
////		String orderNo = StringTools.stringToTrim(request.getParameter("orderNo"));
////		
////		userId = userId.replace("\"", "");
////		orderNo = orderNo.replace("\"", "");
////		log.debug("root pay:" + userId + " " + orderNo);
////		
////		// Model View
////		Map<String,Object> uiModel = new HashMap<String,Object>();
////		// 订单
////		OrderPayment order = null;
////		// 通过令牌获得用户ID
////		try
////		{
////			// 获得订单状态
////			order = orderQueryFacade.getOrderPaymentByOrderNo(orderNo);
////			
////			// 彩购余额支付
////			orderPayFacade.shopPay(userId, orderNo);
////		
////			// 返回
////			uiModel.put("orderNo",orderNo); 
////		}
////		catch (Exception exception)
////		{
////			log.error(exception.toString());
////			setErrorMessage(exception,uiModel);
////			return uiModel;
////		}
////		
////		return uiModel;
////	}
//
//}
