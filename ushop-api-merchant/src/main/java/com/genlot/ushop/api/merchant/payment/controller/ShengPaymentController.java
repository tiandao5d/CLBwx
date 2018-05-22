//package com.genlot.ushop.api.merchant.payment.controller;
//
//import java.util.Date;
//import java.util.HashMap;
//import java.util.Map;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//
//import org.apache.commons.lang3.StringUtils;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestMethod;
//import org.springframework.web.bind.annotation.ResponseBody;
//
//import com.genlot.common.exceptions.BizException;
//import com.genlot.common.utils.DateUtils;
//import com.genlot.common.utils.encrypt.MD5;
//import com.genlot.common.web.utils.WebUtils;
//import com.genlot.ucenter.facade.oauth.entity.AccessToken;
//import com.genlot.ucenter.facade.user.entity.MemberInfo;
//import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
//import com.genlot.ushop.facade.order.entity.OrderPayment;
//import com.genlot.ushop.facade.order.entity.vo.ShengPayQueryOrderResponseParamVo;
//import com.genlot.ushop.facade.order.entity.vo.ShengPayRefundResponseParamVo;
//import com.genlot.ushop.facade.order.entity.vo.ShengPayRequestParamVo;
//import com.genlot.ushop.facade.order.entity.vo.ShengPayResponseParamVo;
//import com.genlot.ushop.facade.order.exceptions.OrderBizException;
//import com.genlot.ushop.facade.order.service.OrderPayFacade;
//import com.genlot.ushop.facade.order.service.OrderQueryFacade;
//
//@Controller
//@RequestMapping(value = "/api/payment/shengpay")
//public class ShengPaymentController {
//
//	private static final Logger log = LoggerFactory.getLogger(ShengPaymentController.class);
//	
//	@Autowired
//	private OrderPayFacade orderPayFacade;
//
//	@Autowired
//	private OrderQueryFacade orderQueryFacade;
//
//	@Autowired
//	private MemberInfoFacade memberInfoFacade;
//
//
//	@RequestMapping(value = "/pay/{orderNo}", method = RequestMethod.POST)
//	@ResponseBody
//	public Object shengPay(@PathVariable String orderNo, HttpServletRequest request, HttpServletResponse response) {
//
//		// Model View
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//		// 用户ID
//		String userId = null;
//		// 订单
//		OrderPayment order = null;
//		
//		// 通过令牌获得用户ID
//		try {
//			
//			request.setCharacterEncoding("UTF-8");
//
//			// 由于前面有拦截器，已经确定判断这个访问
//			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
//
//			// 会员状态
//			MemberInfo member = memberInfoFacade.getMemberByUserNo(userId);
//			// 支付接口
//			ShengPayRequestParamVo param = orderPayFacade.shengPay(
//					userId, 
//					orderNo, 
//					member.getCardNo(), 
//					member.getRealName(), 
//					member.getTelNo());
//			
//			return param;
//		} catch (Exception e) {
//			log.error(e.toString());
//			setErrorMessage(e, uiModel);
//			return uiModel;
//		}
//	}
//
//	@RequestMapping(value = "/payCallback", method = RequestMethod.POST)
//	@ResponseBody
//	public Object payCallback(HttpServletRequest request, HttpServletResponse response) {
//		try {
//			request.setCharacterEncoding("UTF-8");
//			ShengPayResponseParamVo param = new ShengPayResponseParamVo();
//
//			param.setName(request.getParameter("Name"));
//			param.setVersion(request.getParameter("Version"));
//			param.setCharset(request.getParameter("Charset"));
//			param.setTraceNo(request.getParameter("TraceNo"));
//			param.setMsgSender(request.getParameter("MsgSender"));
//			param.setSendTime(request.getParameter("SendTime"));
//			param.setInstCode(request.getParameter("InstCode"));
//			param.setOrderNo(request.getParameter("OrderNo"));
//			param.setOrderAmount(request.getParameter("OrderAmount"));
//			param.setTransNo(request.getParameter("TransNo"));
//			param.setTransAmount(request.getParameter("TransAmount"));
//			param.setTransStatus(request.getParameter("TransStatus"));
//			param.setTransType(request.getParameter("TransType"));
//			param.setTransTime(request.getParameter("TransTime"));
//			param.setMerchantNo(request.getParameter("MerchantNo"));
//			param.setErrorCode(request.getParameter("ErrorCode"));
//			param.setErrorMsg(request.getParameter("ErrorMsg"));
//			param.setExt1(request.getParameter("Ext1"));
//			param.setExt2(request.getParameter("Ext2"));
//			param.setSignType(request.getParameter("SignType"));
//			param.setSignMsg(request.getParameter("SignMsg"));
//
//			orderPayFacade.shengPayCallBack(param);
//			// 盛付通后台通过notifyUrl通知商户,商户做业务处理后,需要以字符串(OK)的形式反馈处理结果处理成功,盛付通系统收到此结果后不再进行后续通知
//			return "OK";
//		} catch (Exception e) {
//			log.error(e.toString());
//			e.printStackTrace();
//			return "ERROR";
//		}
//	}
//	
//	@RequestMapping(value = "/refundCallback", method = RequestMethod.POST)
//	@ResponseBody
//	public Object refundCallback(HttpServletRequest request, HttpServletResponse response) {
//		try {
//			request.setCharacterEncoding("UTF-8");
//			ShengPayRefundResponseParamVo param = new ShengPayRefundResponseParamVo();
//
//			param.setName(request.getParameter("ServiceCode"));
//			param.setVersion(request.getParameter("Version"));
//			param.setCharset(request.getParameter("Charset"));
//			param.setSenderId(request.getParameter("SenderId"));
//			param.setSendTime(request.getParameter("SendTime"));
//			param.setRefundOrderNo(request.getParameter("RefundOrderNo"));
//			param.setOriginalOrderNo(request.getParameter("OriginalOrderNo"));
//			param.setStatus(request.getParameter("Status"));
//			param.setRefundAmount(request.getParameter("RefundAmount"));
//			param.setRefundTransNo(request.getParameter("RefundTransNo"));
//			param.setExt1(request.getParameter("Ext1"));
//			param.setTraceNo(request.getParameter("TraceNo"));
//			param.setSignType(request.getParameter("SignType"));
//			param.setSignMsg(request.getParameter("SignMsg"));
//
//			orderPayFacade.shengPayRefundCallBack(param);
//			// 盛付通后台通过notifyUrl通知商户,商户做业务处理后,需要以字符串(OK)的形式反馈处理结果处理成功,盛付通系统收到此结果后不再进行后续通知
//			return "OK";
//		} catch (Exception e) {
//			e.printStackTrace();
//			return "ERROR";
//		}
//	}
////
////	/**
////	 * 盛付通支付状态查询.
////	 * 
////	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/cart
////	 *          /settlement/queryOrder/订单id
////	 * @param 请求参数
////	 *            访问令牌
////	 * @error {"error":"错误代号","error_description":"内容描述"}
////	 * @param orderNo
////	 *            订单id
////	 * @return Model 视图对象.
////	 */
////	@RequestMapping(value = "/queryOrder/{orderNo}", method = RequestMethod.GET)
////	@ResponseBody
////	public Object queryOrder(@PathVariable String orderNo, HttpServletRequest request, HttpServletResponse response) {
////
////		// Model View
////				Map<String, Object> uiModel = new HashMap<String, Object>();
////				// 用户ID
////				String userId = null;
////				// 订单
////				OrderPayment order = null;
////				// 通过令牌获得用户ID
////				try {
////					request.setCharacterEncoding("UTF-8");
////
////					// 由于前面有拦截器，已经确定判断这个访问
////					userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
////
////					// 获得订单状态,判断是否能够支付
////					order = orderQueryFacade.getOrderPaymentByOrderNo(orderNo);
////					if (order == null || order.getUserId().equals(userId) == false) {
////						throw OrderBizException.ORDER_PAYMENT_ORDER_NOT_EXIST;
////					}
////					
////					ShengpayQueryOrderResponseParamVo param = new ShengpayQueryOrderResponseParamVo();
////					param.setName(shengPayMerchantVo.getVersionName());
////					param.setVersion(shengPayMerchantVo.getVersion());
////					param.setCharset(shengPayMerchantVo.getCharset());
////					param.setMsgSender(shengPayMerchantVo.getMsgSender());
////					param.setSendTime(DateUtils.formatDate(new Date(), "yyyyMMddHHmmss"));
////					param.setMerchantNo(shengPayMerchantVo.getMerchantNo());
////					param.setOrderNo(order.getOrderNo());
////					param.setTransNo(order.getTransactionId());
////					param.setExt1("query order");
////					param.setSignType(shengPayMerchantVo.getSignType());
////					param.setQueryUrl(shengPayMerchantVo.getQueryUrl());
////					
////					return param;
////				} catch (Exception e) {
////					log.error(e.toString());
////					setErrorMessage(e, uiModel);
////					return uiModel;
////				}
////	}
//
//	protected void setErrorMessage(Exception exception, Map<String, Object> uiModel) {
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
//}
