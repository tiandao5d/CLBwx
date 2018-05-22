package com.genlot.ushop.api.merchant.payment.controller;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

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
import com.genlot.common.enums.PlatformEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.order.event.component.OrderEventProducer;
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
import com.genlot.uplatform.facade.frontend.weixin.entity.vo.WeiXinPayRequestParamVo;
import com.genlot.uplatform.facade.frontend.weixin.entity.vo.WeixinPayResponseParamVo;
import com.genlot.uplatform.facade.frontend.weixin.service.WeiXinFacade;
import com.genlot.ushop.facade.order.entity.OrderPayment;
import com.genlot.ushop.facade.order.enums.PaymentBizTypeEnum;
import com.genlot.ushop.facade.order.exceptions.OrderBizException;
import com.genlot.ushop.facade.order.service.OrderManagementFacade;
import com.genlot.ushop.facade.order.service.OrderPayFacade;
import com.genlot.ushop.facade.order.service.OrderQueryFacade;
import com.genlot.ucenter.facade.user.entity.UserBindRelation;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
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
@RequestMapping(value = "/api/payment/weixinpay/")
public class WeiXinPaymentController {
	
	private static final Logger log = LoggerFactory.getLogger(WeiXinPaymentController.class);
	
	@Autowired
	private OrderPayFacade orderPayFacade;

	@Autowired
	private	UserBindRelationFacade userBindRelationFacade;
	
	@Autowired
	private WeiXinFacade weiXinFacade;
	
	@Autowired
	private OrderEventProducer orderEventProducer;
	
	/**
	 * 订单支付.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/payment/weixinpay/pay/订单id/
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
			log.info("Weixin pay" + userId);  
			
			// 判断是否判断微信账号
			UserBindRelation relation = userBindRelationFacade.getByUserNo(
					userId, 
					null, 
					PlatformEnum.WEIXIN.getValue(),
					0);
			if (relation == null) {
				throw UserBizException.USER_BIND_RELATION_IS_NOT_EXIST;
			}
			log.info("Weixin pay" + relation.getLoginId());  
			// 生成预支付数据
			OrderPayment order = orderPayFacade.weiXinPrePay(
					relation.getLoginId(), 
					userId, 
					orderNo);
			// 请求微信下单
			log.info("Weixin pay" + JSON.toJSONString(order));  
			WeiXinPayRequestParamVo param = weiXinFacade.prePay(
					relation.getLoginId(),
					order.getOrderNo(),
					order.getMoney(),
					order.getBuyIp());
			log.info("Weixin pay" + param.getPrepay_id());  
			// 设置预支付数据
			orderPayFacade.weiXinPay(param.getPrepay_id(),orderNo);
			log.info("Weixin pay" + param.getBody());  
			uiModel.put("orderNo",orderNo); 
			uiModel.put("appId",param.getAppId()); 
			uiModel.put("timeStamp",param.getTimeStamp().toString()); 
			uiModel.put("nonceStr",param.getNonceStr()); 
			uiModel.put("package",param.getBody()); 
			uiModel.put("signType",param.getSignType()); 
			uiModel.put("paySign",param.getPaySign()); 
		}
		catch (Exception exception)
		{
			log.error("Weixin pay" + exception.toString());  
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
	public String payCallback(
			HttpServletRequest request, 
			HttpServletResponse response) 
	{
		response.setContentType("text/xml;charset=UTF-8");
		String result = null;
		try 
		{
			InputStream is = request.getInputStream();
			result = readInputStream(is, "UTF-8");
			if (result == null || "".equals(result)) {
				throw BizException.PARAM_ERROR;
			}
			
			WeixinPayResponseParamVo param = weiXinFacade.verifyPaid(result);
			
			orderEventProducer.sendEventOrderWeixinPaid(
					param.getOut_trade_no(),
					param.getTotal_fee(), 
					param.getTransaction_id());
		}
		catch (Exception exception)
		{
		    // 去掉最后一个空格  
		    log.error("Weixin pay call back error: POST " + request.getRequestURL() + " " + result);  
			log.error(exception.toString());	
			return setResult("fail", exception.toString());
		}
		return setResult("SUCCESS", "OK");
	}
	
    public static String setResult(String return_code, String return_msg) {  
        SortedMap<String, String> parameters = new TreeMap<String, String>();  
        parameters.put("return_code", return_code);  
        parameters.put("return_msg", return_msg);  
        return "<xml><return_code><![CDATA[" + return_code + "]]>" +   
                "</return_code><return_msg><![CDATA[" + return_msg + "]]></return_msg></xml>";  
    }  
	
	public String readInputStream(InputStream inStream, String encoding) {
		String result = null;
		try {
			if(inStream != null) {
				ByteArrayOutputStream outStream = new ByteArrayOutputStream();
				byte[] tempBytes = new byte[1024];
				int count = -1;
				while((count = inStream.read(tempBytes, 0, 1024)) != -1) {
					outStream.write(tempBytes, 0, count);
				}
				tempBytes = null;
				outStream.flush();
				result = new String(outStream.toByteArray(), encoding);
			}
        }
		catch (Exception e) {
			result = null;
        }
		return result;
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
