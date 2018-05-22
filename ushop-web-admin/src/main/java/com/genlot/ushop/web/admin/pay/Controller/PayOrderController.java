package com.genlot.ushop.web.admin.pay.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.order.event.entity.OrderProductVo;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ucenter.facade.account.enums.AccountCouponsStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundUsageEnum;
import com.genlot.ucenter.facade.account.enums.AccountStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountTypeEnum;
import com.genlot.ucenter.facade.account.service.AccountFundTypeFacade;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.service.MerchantFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.ushop.facade.lottery.service.LatestLotteryFacade;
import com.genlot.ushop.facade.lottery.service.LotteryExpressFacade;
import com.genlot.ushop.facade.order.entity.OrderPayment;
import com.genlot.ushop.facade.order.enums.PaymentBizTypeEnum;
import com.genlot.ushop.facade.order.enums.PaymentRefundEnum;
import com.genlot.ushop.facade.order.enums.PaymentStatusEnum;
import com.genlot.ushop.facade.order.enums.PaymentTypeEnum;
import com.genlot.ushop.facade.order.service.OrderQueryFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyOrderFacade;

@Controller
@RequestMapping("/pay/order")
public class PayOrderController {

	@Autowired
	LatestLotteryFacade latestLotteryFacade;
	@Autowired
	SpellBuyOrderFacade spellBuyOrderFacade;
	
	@Autowired
	private AccountFundTypeFacade accountFundTypeFacade;
	
	@Autowired
	OrderQueryFacade orderQueryFacade;
	@Autowired
	ProductQueryFacade productQueryFacade;
	@Autowired
	LotteryExpressFacade lotteryExpressFacade;
	@Autowired
	UserQueryFacade userQueryFacade;
	@Autowired
	MerchantFacade merchantFacade;

	// 订单列表
	@RequestMapping(value = {"/list"}, method = RequestMethod.GET)
	@ResponseBody
	public Object orderlist(
			//页码
            Integer page,
            //一页条数
            Integer rows,
           //开始时间
            String startDate,
            //结束时间
            String endDate,
          //用户ID
            String userId,
           // 用户手机号码
          String  mobileNo,
            //订单号
            String orderNo,
            String userName,
			HttpServletRequest request,
			HttpSession session)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		Map<String, Object> paramMap = new HashMap<String,Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;
		
		if(page== null || rows == null){
			 pageParam = new PageParam(1,10); 
		}else{
			 pageParam = new PageParam(page,rows); 
		}
		
		
		paramMap.put("startDate", startDate);
		paramMap.put("endDate", endDate);
		paramMap.put("orderNo", orderNo);	
		paramMap.put("userName", userName);	
		//paramMap.put("payType", 1002);	
		//由于中奖记录中没有手机号码，所以最终还是利用userNo查找
		if(StringUtils.isNotBlank(mobileNo)){
			UserInfo userInfo  = userQueryFacade.getUserInfoByBindMobileNo(mobileNo);
			
			if (userInfo == null){
				paramMap.put("userId", "NOEXIST");
			}else{
				userId = userInfo.getUserNo();
				paramMap.put("userId", userId);
			}		
			
		}
		
		try{
		 
		 pageBean = orderQueryFacade.listOrderPayment(pageParam, paramMap);
		}
		catch (Exception exception) {
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		

		
				

		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		return uiModel;
	}

	// 订单详情
	@RequestMapping(value = { "/getByOrderNo" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getByOrderNo(String orderNo) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		OrderPayment orderPayment = orderQueryFacade.getOrderPaymentByOrderNo(orderNo);

		List<OrderProductVo> consumeList = new ArrayList<OrderProductVo>();

		if (StringUtils.isNotBlank(orderPayment.getWithold())) {
			if (isJsonStr(orderPayment.getWithold())) {
				try {
					JSONArray jsonArray = new JSONArray(orderPayment.getWithold());
					if (jsonArray != null) {
						for (int i = 0; i < jsonArray.length(); i++) {
							OrderProductVo vo = JSON.parseObject(jsonArray.get(i).toString(), OrderProductVo.class);
							consumeList.add(vo);
						}
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
		}

		uiModel.put("consumeList", consumeList);

		return uiModel;
	}

	private boolean isJsonStr(String str) {
		boolean result = true;
		try {
			new JSONArray(str);
		} catch (JSONException e) {
			result = false;
		}
		return result;
	}
	
	    // 更新订单状态
		@RequestMapping(value = "/updateStatus", method = RequestMethod.POST)
		@ResponseBody
		public Object updateStatus(String orderNo, Integer payStatus, HttpServletRequest request) {
			Map<String, Object> uiModel = new HashMap<String, Object>();
			String userid = request.getParameter("userid");
			try {

				OrderPayment orderPayment = orderQueryFacade.getOrderPaymentByOrderNo(orderNo);
				orderPayment.setPayStatus(payStatus);
				orderQueryFacade.changeOrderStatus(orderNo, payStatus);				
			} catch (Exception exception) {
				setErrorMessage(exception, uiModel);
				return uiModel;
			}

			uiModel.put("data", "SUCCESS");
			return uiModel;
		}
		@ResponseBody
		@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
		public Object constants() {
			Map<String, Object> uiModel = new HashMap<String, Object>();
			Map<String, String> fundTypeMap = accountFundTypeFacade
					.getIdAndFundName();

			List<Map> fundTypeMapList = new ArrayList<Map>();

			Set<Entry<String, String>> sets = fundTypeMap.entrySet();

			for (Entry<String, String> obj : sets) {
				Map<String, Object> typeMap = new HashMap<String, Object>();
				typeMap.put("value", obj.getKey());
				typeMap.put("desc", obj.getValue());
				fundTypeMapList.add(typeMap);
			}

			uiModel.put("fundTypeList", fundTypeMapList);
			uiModel.put("PaymentStatusList", PaymentStatusEnum.toList());
			//支付类型
			uiModel.put("OrderTypeList", PaymentBizTypeEnum.toList());
			uiModel.put("PaymentTypeList", PaymentTypeEnum.toList());
			uiModel.put("RefundList", PaymentRefundEnum.toList());
			
			return uiModel;
		}
		

	protected void setErrorMessage(Exception exception, Map<String, Object> uiModel) {
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
