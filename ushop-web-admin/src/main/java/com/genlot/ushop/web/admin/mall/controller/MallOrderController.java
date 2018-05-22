package com.genlot.ushop.web.admin.mall.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.MerchantInfo;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.MerchantFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.common.enums.ExpressCompanyEnum;
import com.genlot.ushop.facade.lottery.enums.LotteryLogisticsStatusEnum;
import com.genlot.ushop.facade.order.entity.OrderPayment;
import com.genlot.ushop.facade.order.enums.PaymentStatusEnum;
import com.genlot.ushop.facade.order.enums.PaymentTypeEnum;
import com.genlot.ushop.facade.order.service.OrderQueryFacade;
import com.genlot.ushop.facade.product.entity.ProductOrder;
import com.genlot.ushop.facade.product.enums.ProductOrderStatusEnum;
import com.genlot.ushop.facade.product.enums.SpellBuyOrderStatusEnum;
import com.genlot.ushop.facade.product.service.ProductOrderFacade;

/**
 * ClassName:MallOrderController Function: 商城商品订单控制类
 * 
 * @Date: 2017年4月14日 下午3:14:55
 * @author KDS
 */

@Controller
@RequestMapping("/mall/order")
public class MallOrderController {

	@Autowired
	ProductOrderFacade productOrderFacade;

	@Autowired
	MerchantFacade merchantFacade;

	@Autowired
	UserQueryFacade userQueryFacade;

	@Autowired
	MemberInfoFacade memberInfoFacade;
	
	@Autowired
	OrderQueryFacade orderQueryFacade;

	// 订单列表
	@RequestMapping(value = { "/list" }, method = RequestMethod.GET)
	@ResponseBody
	public Object orderlist(
			// 页码
			Integer page,
			// 一页条数
			Integer rows,
			// 开始时间
			String startDate,
			// 结束时间
			String endDate,
			// 用户ID
			String userId,
			// 订单号
			String orderNo, String userName, Integer status,
			HttpServletRequest request, HttpSession session) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		if (status != 0) {
			if(status == 104){
				paramMap.put("backStatus", status);
				
			}else if(status == 102){
				paramMap.put("deliveryStatus", status);
			}else{
				paramMap.put("status", status);
			}
			
		}
		paramMap.put("startDate", startDate);
		paramMap.put("endDate", endDate);
		paramMap.put("orderNo", orderNo);
		paramMap.put("userName", userName);

		try {

			pageBean = productOrderFacade.listPage(pageParam, paramMap);
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		

		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());

		return uiModel;
	}

	// 用户订单详情
	@RequestMapping(value = {"/getByOrderNo/{orderNo}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getOrderByOrderNo(
			// 页码
			@PathVariable String orderNo, HttpServletRequest request,
			HttpSession session) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		try {
			
			ProductOrder productOrder = productOrderFacade.getByNo(orderNo);
			UserInfo userInfo = userQueryFacade.getUserInfoByUserNo(productOrder.getUserNo());
			MerchantInfo  merchantInfo = new MerchantInfo();
			if(!StringUtils.isBlank(productOrder.getMerchantId())){
				 merchantInfo  = merchantFacade.getByMerchantNo(productOrder.getMerchantId());
			}
			MemberInfo memberInfo = memberInfoFacade.getMemberByUserNo(productOrder.getUserNo());
			
			OrderPayment  orderPayment = new OrderPayment();
			if(productOrder.getPayNo() != null){
				  orderPayment = orderQueryFacade.getOrderPaymentByOrderNo(productOrder.getPayNo());
			}
			uiModel.put("orderPayment", orderPayment);
			
			//订单信息
			uiModel.put("productOrder", productOrder);
			//用户信息
			uiModel.put("userInfo", userInfo);
			//商家信息
			uiModel.put("merchantInfo", merchantInfo);
			
			//会员信息
			uiModel.put("memberInfo", memberInfo);

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		
		return uiModel;
	}

	// 获得所有枚举
	@RequestMapping(value = { "/getConstants" }, method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {

		Map<String, Object> uiModel = new HashMap<String, Object>();


		// 交易状态
		List orderStatusList = LotteryLogisticsStatusEnum.toList();
		uiModel.put("latestLotterysStatusList", orderStatusList);

		List paymentStatusList = PaymentStatusEnum.toList();
		List paymentTypeList = PaymentTypeEnum.toList();

		uiModel.put("payTypeList", paymentTypeList);
		uiModel.put("payStatusList", paymentStatusList);

		// 交易状态
		List spellBuyStatusList = SpellBuyOrderStatusEnum.toList();
		uiModel.put("spellBuyStatusList", spellBuyStatusList);

		uiModel.put("expressCompanyMap", ExpressCompanyEnum.toList());

		uiModel.put("ProductOrderStatusList", ProductOrderStatusEnum.toList());
		return uiModel;
	}

	protected void setErrorMessage(Exception exception,
			Map<String, Object> uiModel) {
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
