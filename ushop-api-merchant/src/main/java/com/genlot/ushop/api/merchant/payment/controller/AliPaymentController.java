package com.genlot.ushop.api.merchant.payment.controller;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.portlet.ModelAndView;

import com.alibaba.fastjson.JSONObject;
import com.genlot.common.enums.PlatformEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.order.event.component.OrderEventProducer;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.user.entity.UserBindRelation;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
import com.genlot.uplatform.facade.frontend.alipay.service.AliFacade;
import com.genlot.ushop.facade.order.entity.OrderPayment;
import com.genlot.ushop.facade.order.exceptions.OrderBizException;
import com.genlot.ushop.facade.order.service.OrderPayFacade;
import com.sun.tools.classfile.InnerClasses_attribute.Info;

//支付宝支付
@Controller
@RequestMapping(value = "/api/payment/alipay/")
public class AliPaymentController {

	private static final Logger log = LoggerFactory.getLogger(AliPaymentController.class);

	@Autowired
	private OrderPayFacade orderPayFacade;

	@Autowired
	private AliFacade aliFacade;
	
	@Autowired
	private UserBindRelationFacade userBindRelationFacade;
	
	@Autowired
	private OrderEventProducer orderEventProducer;

	/**
	 * 订单支付宝支付.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/payment/alipay
	 *          /pay/orderNo/
	 * @param
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/pay/{orderNo}", method = RequestMethod.POST)
	@ResponseBody
	public Object pay(@PathVariable String orderNo, HttpServletRequest request,
			HttpServletResponse response) {
		// 用户ID
		String userId = null;
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String signOrder = "";
		try {
			// 生成支付宝签名后的订单信息
			OrderPayment order = orderPayFacade.aliPay(orderNo);
			signOrder = aliFacade.pay(orderNo, order.getMoney());
		} catch (Exception exception) {
			log.error("AliPay pay" + exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("orderNo", orderNo);
		uiModel.put("paySign", signOrder);
		return uiModel;
	}

//	/**
//	 * 订单支付宝支付同步回调.
//	 * 
//	 * @example 
//	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/payment/alipay
//	 *          /payCallback
//	 * @param
//	 * @error {"error":"错误代号", "error_description":"内容描述"}
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = "/synPayCallback", method = RequestMethod.POST)
//	@ResponseBody
//	public Object synPayCallback(HttpServletRequest request,
//			HttpServletResponse response) {
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//		try {
//			// 获取GET过来的反馈信息
//			Map requestParams = request.getParameterMap();
//			String jsonString = JSONObject.toJSONString(requestParams);
//			log.info(jsonString);
//			// 把反馈信息转换成map
//			if (requestParams == null || "".equals(requestParams)) {
//				throw OrderBizException.ORDER_PAYMENT_ORDER_NOT_EXIST;
//			}
//			Map<String, String> params = getParamToMap(requestParams);
//			// 对返回的参数进行验签
//			boolean result = aliFacade.verifySign(params);
//			// 处理参数和业务(和异步回调做同样处理),返回结果fail，success
//			if (result == true) {
//				orderPayFacade.aliPayCallback(params);
//			}
//			return "success";
//		} catch (Exception exception) {
//			log.error("Alipay pay call back error: POST" + request.getRequestURL());
//			log.error(exception.toString());
//			return "failure";
//		}
//	}

	/**
	 * 订单支付宝支付异步回调.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/payment/alipay
	 *          /payCallback
	 * @param
	 * @error {"error":"错误代号", "error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/payCallback", method = RequestMethod.POST)
	@ResponseBody
	public String asynPayCallback(HttpServletRequest request,
			HttpServletResponse response) {
		response.setContentType("text/xml;charset=UTF-8");
		try {
			// 获取支付宝POST过来反馈信息
			Map requestParams = request.getParameterMap();
			if (requestParams == null || "".equals(requestParams)) {
				throw OrderBizException.ORDER_PAYMENT_ORDER_NOT_EXIST;
			}
			// 解析反馈信息
			Map<String, String> params = getParamToMap(requestParams);
			// 对返回的参数进行验签
			boolean result = aliFacade.verifySign(params);
			// 处理参数和业务(和同步回调做同样处理),返回结果fail，success
			if (result == true) {
				String outTradeNo = params.get("out_trade_no");
				String tradeNo = params.get("trade_no");
				String tradeStatus = params.get("trade_status");
				String totalAmount = params.get("total_amount");
				orderEventProducer.sendEventOrderAliPaid(outTradeNo, tradeNo, tradeStatus,totalAmount);
			}
			return "success";
		} catch (Exception exception) {
			log.error("Alipay pay call back error: POST" + request.getRequestURL());
			log.error(exception.toString());
			return "failure";
		}
	}

	public Map<String, String> getParamToMap(Map param) {
		Map<String, String> result = new HashMap<>();
		try {
			for (Iterator iter = param.keySet().iterator(); iter.hasNext();) {
				String name = (String) iter.next();
				String[] values = (String[]) param.get(name);
				String valueStr = "";
				for (int i = 0; i < values.length; i++) {
					valueStr = (i == values.length - 1) ? valueStr + values[i]
							: valueStr + values[i] + ",";
				}
				// 乱码解决，这段代码在出现乱码时使用。
				//valueStr = new String(valueStr.getBytes("ISO-8859-1"), "utf-8");
				result.put(name, valueStr);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return result;
	}

	protected void setErrorMessage(Exception exception,
			Map<String, Object> uiModel) {
		uiModel.clear();
		if (exception instanceof BizException) {
			BizException e = (BizException) exception;
			uiModel.put("error", e.getCode());
			uiModel.put("error_description", e.getMsg());
		} else {
			uiModel.put("error", 0);
			uiModel.put("error_description", "unknown error");
		}
	}

}
