package com.genlot.ushop.api.merchant.payment.controller;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
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
import com.alibaba.fastjson.TypeReference;
import com.genlot.common.config.PublicConfig;
import com.genlot.common.enums.PlatformEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.order.event.component.OrderEventProducer;
import com.genlot.common.message.order.event.entity.OrderCurrencyVo;
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.common.utils.DateUtils;
import com.genlot.ucenter.facade.account.entity.Account;
import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundUsageEnum;
import com.genlot.ucenter.facade.account.enums.AccountTradeTypeEnum;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.account.vo.AccountTransactionVo;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.uplatform.facade.frontend.hotline.caipiao.service.CaiPiaoFacade;
import com.genlot.uplatform.facade.frontend.weixin.service.WeiXinFacade;
import com.genlot.ushop.facade.order.entity.OrderPayment;
import com.genlot.ushop.facade.order.entity.vo.CaiPiaoPayRequestParamVo;
import com.genlot.ushop.facade.order.enums.PaymentBizTypeEnum;
import com.genlot.ushop.facade.order.exceptions.OrderBizException;
import com.genlot.ushop.facade.order.service.OrderManagementFacade;
import com.genlot.ushop.facade.order.service.OrderPayFacade;
import com.genlot.ushop.facade.order.service.OrderQueryFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.UserBindRelation;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ushop.api.merchant.spellbuy.cart.entity.vo.ProductCartDetailVo;
import com.genlot.ushop.facade.lottery.entity.vo.GenerateNumberVo;
import com.genlot.ushop.facade.product.service.ProductImageFacade;
import com.genlot.ushop.facade.product.service.ProductOrderFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyRecordFacade;
import com.genlot.ushop.facade.product.entity.ProductCurrency;
import com.genlot.ushop.facade.product.entity.ProductImage;
import com.genlot.ushop.facade.product.entity.ProductOrder;
import com.genlot.ushop.facade.product.entity.ProductOrderDetail;
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductStyleEnum;
import com.genlot.ushop.facade.product.enums.SpellBuySourceEnum;
import com.genlot.ushop.facade.product.enums.SpellBuyStatusEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;
import com.genlot.ushop.facade.sns.service.VipLevelFacade;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;


@Controller
@RequestMapping(value = "/api/payment/caipiaopay/")
public class CaiPiaoPaymentController {
	
	private static final Logger log = LoggerFactory.getLogger(CaiPiaoPaymentController.class);
	
	@Autowired
	private OrderPayFacade orderPayFacade;

	@Autowired
	private	UserBindRelationFacade userBindRelationFacade;
	
	@Autowired
	private CaiPiaoFacade caiPiaoFacade;
	
	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private ProductOrderFacade productOrderFacade;
	
	@Autowired
	private OrderEventProducer orderEventProducer;
		
	/**
	 * 订单支付.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/payment/caipiaopay/pay/订单id/
	 * @param   请求参数 访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/pay/{orderNo}",method = RequestMethod.POST)
	@ResponseBody
	public Object pay(
			@PathVariable String orderNo,
			HttpServletRequest request, 
			HttpServletResponse response) 
	{
		// 用户ID
		String userId = null;		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			log.info("Caipiao pay" + userId);  
			
			// 会员状态
			MemberInfo member = memberInfoFacade.getMemberByUserNo(userId);
			// 支付接口
			CaiPiaoPayRequestParamVo param = orderPayFacade.caiPiaoPay(
								userId, 
								orderNo, 
								member.getCardNo(), 
								member.getRealName(), 
								member.getTelNo());
			
			// 判断是否判断微信账号
			UserBindRelation relation = userBindRelationFacade.getByUserNo(
					userId, 
					param.getProvince(), 
					param.getPlatformId(),
					param.getGameId());
			if (relation == null) {
				throw UserBizException.USER_BIND_RELATION_IS_NOT_EXIST;
			}
			String withold = null;
			ProductOrder order = productOrderFacade.getByNo(param.getWithold());
			if (order == null) {
				throw OrderBizException.ORDER_PAYMENT_ORDER_NOT_EXIST;
			}
			else {
				List<ProductOrderDetail> items = JSON.parseArray(order.getWithold(), ProductOrderDetail.class);
				List<ProductOrderDetail> details = new ArrayList<ProductOrderDetail>();
				for(ProductOrderDetail item:items)   {
					
					ProductOrderDetail detail = new ProductOrderDetail();
					detail.setProductId(item.getProductId());
					detail.setProductName(item.getProductName());
					detail.setNumber(item.getNumber());
					List<ProductCurrency> priceRules = JSON.parseArray(item.getPrice(), ProductCurrency.class);
					if (priceRules.size() > 1) {
						throw OrderBizException.ORDER_PAYMENT_ORDER_FUND_TYPE_FAILED;
					}
					if (!priceRules.get(0).getType().equals(param.getFundType1())) {
						throw OrderBizException.ORDER_PAYMENT_ORDER_FUND_TYPE_FAILED;
					}
					detail.setProductPrice(priceRules.get(0).getValue());
				}
				withold = JSON.toJSONString(details);
			}
			
			log.info("Caipiao pay" + relation.getLoginId());  
			// 调用支付接口
			String trxNo = caiPiaoFacade.pay(
					param.getMerchantOrderNo(), 
					relation.getLoginId(), 
					param.getAmount(), 
					param.getFundType2(), 
					AccountFundUsageEnum.SHOPPING.getValue(),
					param.getProvince(), 
					param.getPlatformId(), 
					param.getGameId(), 
					param.getMemberId(), 
					param.getMemberCard(), 
					param.getMemberName(), 
					param.getMerchantOrderNo(), 
					withold,
					null);
			
			uiModel.put("orderNo",orderNo); 	
			uiModel.put("trxNo",trxNo); 	
		}
		catch (Exception exception)
		{
			log.error("Caipiao pay" + exception.toString());  
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
	
        return uiModel;
	}
	
	/**
	 * 订单支付回调.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/payment/weixinpay/payCallback
	 * @param   请求参数 访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/payCallback",method = RequestMethod.POST)
	@ResponseBody
	public String payCallback(
			HttpServletRequest request, 
			HttpServletResponse response) 
	{
		try {
			
			Map<String, String[]> params = request.getParameterMap();  
		    String queryString = "";  
		    for (String key : params.keySet()) {
		    	String[] values = params.get(key);
		    	for (int i = 0; i < values.length; i++) {
		    		String value = values[i];
		    		queryString += key + "=" + value + "&";  
		        }  
		    }
		    
		    if (queryString.isEmpty()) {
		    	log.error("CaiPiao pay illegal call back: POST " + request.getRequestURL() + " " + queryString);  
		    	throw OrderBizException.ORDER_PAYMENT_ORDER_NOT_EXIST;
		    }
	
		    queryString = queryString.substring(0, queryString.length() - 1);  
		    log.info("CaiPiao pay call back: POST " + request.getRequestURL() + " " + queryString);  
		    		
		    String trxNo     = request.getParameter("trxNo");
		    String requestNo = request.getParameter("requestNo");
		    String totalAmount = request.getParameter("totalAmount");
	    	
			if (trxNo == null || "".equals(trxNo) || requestNo == null || "".equals(requestNo) ) {
				throw OrderBizException.ORDER_PAYMENT_ORDER_NOT_EXIST;
			}
			
			orderEventProducer.sendEventOrderCaiPaioPaid(requestNo, trxNo, "01", totalAmount);
			return "success";
		} 
		catch (Exception exception) {
		    log.error("Caipiao pay call back error: POST " + request.getRequestURL() + " " + exception.toString()); 
		    return "failure";
		}
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
