package com.genlot.ushop.api.merchant.payment.controller;

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

import com.genlot.common.config.PublicConfig;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.common.utils.DateUtils;
import com.genlot.ucenter.facade.account.entity.Account;
import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.enums.AccountTradeTypeEnum;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.account.vo.AccountTransactionVo;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ushop.facade.order.entity.OrderPayment;
import com.genlot.ushop.facade.order.enums.PaymentBizTypeEnum;
import com.genlot.ushop.facade.order.exceptions.OrderBizException;
import com.genlot.ushop.facade.order.service.OrderManagementFacade;
import com.genlot.ushop.facade.order.service.OrderPayFacade;
import com.genlot.ushop.facade.order.service.OrderQueryFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ushop.api.merchant.spellbuy.cart.entity.vo.ProductCartDetailVo;
import com.genlot.ushop.facade.lottery.entity.vo.GenerateNumberVo;
import com.genlot.ushop.facade.product.service.ProductImageFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyRecordFacade;
import com.genlot.ushop.facade.product.entity.ProductImage;
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductStyleEnum;
import com.genlot.ushop.facade.product.enums.SpellBuySourceEnum;
import com.genlot.ushop.facade.product.enums.SpellBuyStatusEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;
import com.genlot.ushop.facade.sns.service.VipLevelFacade;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;


@Controller
@RequestMapping(value = "/api/payment")
public class PaymentController {
	
	private static final Logger log = LoggerFactory.getLogger(PaymentController.class);
			
	@Autowired 
	private SpellBuyProductQueryFacade spellBuyProductQueryFacade;
	
	@Autowired 
	private SpellBuyProductFacade spellBuyProductFacade;
	
	@Autowired 
	private SpellBuyRecordFacade spellBuyRecordFacade;
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;
	
	@Autowired
	private OrderManagementFacade orderManagementFacade;
	
	@Autowired
	private OrderQueryFacade orderQueryFacade;
	
	@Autowired
	private OrderPayFacade orderPayFacade;
	
	@Autowired
	private AccountQueryFacade accountQueryFacade;
	
	@Autowired
	private VipLevelFacade vipLevelFacade;
	
	@Autowired
	private TaskEventProducer taskEventProducer;
	
	/**
	 * 购买商品清单(余额支付).
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/payment/balancepay/订单id/
	 * @param 	请求参数 访问令牌. 
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param orderNo 
	 * 			订单id
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/balancepay/{orderNo}",method = RequestMethod.POST)
	@ResponseBody
	public Object balancepay(
			@PathVariable String orderNo,
			HttpServletRequest request, 
			HttpServletResponse response) 
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		// 用户ID
		String userId = null;
		// 订单
		//OrderPayment order = null;
		// 通过令牌获得用户ID
		try
		{
			// 获得订单状态
			//order = orderQueryFacade.getOrderPaymentByOrderNo(orderNo);
						
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			// 余额支付
			orderPayFacade.directPay(userId, orderNo);
		
			// 返回
			uiModel.put("orderNo",orderNo); 
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
