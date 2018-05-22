package com.genlot.ushop.web.admin.spell.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.genlot.ucenter.facade.user.entity.MerchantInfo;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.enums.MerchantStatusEnum;
import com.genlot.ucenter.facade.user.service.MerchantFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.ushop.facade.lottery.entity.LatestLottery;
import com.genlot.ushop.facade.lottery.entity.LotteryExpress;
import com.genlot.common.enums.ExpressCompanyEnum;
import com.genlot.ushop.facade.lottery.enums.LotteryLogisticsStatusEnum;
import com.genlot.ushop.facade.lottery.service.LatestLotteryFacade;
import com.genlot.ushop.facade.lottery.service.LotteryExpressFacade;
import com.genlot.ushop.facade.order.enums.PaymentStatusEnum;
import com.genlot.ushop.facade.order.enums.PaymentTypeEnum;
import com.genlot.ushop.facade.order.service.OrderQueryFacade;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.entity.SpellBuyOrder;
import com.genlot.ushop.facade.product.enums.ProductOrderStatusEnum;
import com.genlot.ushop.facade.product.enums.SpellBuyOrderStatusEnum;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyOrderFacade;

@Controller
@RequestMapping("/order")
public class SpellBuyOrderController {

	@Autowired
	LatestLotteryFacade latestLotteryFacade;
	@Autowired
	SpellBuyOrderFacade spellBuyOrderFacade;

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
	@RequestMapping(value = { "/list" }, method = RequestMethod.GET)
	@ResponseBody
	public Object list(
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
			String orderNo, String userName, HttpServletRequest request,
			HttpSession session) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}

		paramMap.put("startDate", startDate);
		paramMap.put("endDate", endDate);
		paramMap.put("orderNo", orderNo);
		paramMap.put("userName", userName);
		// 由于中奖记录中没有手机号码，所以最终还是利用userNo查找
		paramMap.put("userId", userId);

		try {

			pageBean = spellBuyOrderFacade.listPage(pageParam, paramMap);
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

	// 获得所有枚举
	@RequestMapping(value = { "/getConstants" }, method = RequestMethod.GET)
	@ResponseBody
	public Object constants(){

		Map<String, Object> uiModel = new HashMap<String, Object>();



		// 交易状态
		List latestLotterysStatusList = LotteryLogisticsStatusEnum.toList();
		uiModel.put("latestLotterysStatusList", latestLotterysStatusList);

		List paymentStatusList = PaymentStatusEnum.toList();
		List paymentTypeList = PaymentTypeEnum.toList();

		uiModel.put("payTypeList", paymentTypeList);
		uiModel.put("payStatusList", paymentStatusList);

		// 交易状态
		List mallOrderStatusList = ProductOrderStatusEnum.toList();
		uiModel.put("mallOrderStatusList", mallOrderStatusList);

		uiModel.put("expressCompanyMap", ExpressCompanyEnum.toList());
		uiModel.put("spellBuyStatusList", SpellBuyOrderStatusEnum.toList());
		return uiModel;
	}

	// 订单详情
	@RequestMapping(value = { "/getById" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getById(String orderNo) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		SpellBuyOrder SpellBuyOrder = spellBuyOrderFacade.getByOrderNo(orderNo);

		List<OrderProductVo> consumeList = new ArrayList<OrderProductVo>();

		if (StringUtils.isNotBlank(SpellBuyOrder.getWithold())) {
			if (isJsonStr(SpellBuyOrder.getWithold())) {
				try {
					JSONArray jsonArray = new JSONArray(
							SpellBuyOrder.getWithold());
					if (jsonArray != null) {
						for (int i = 0; i < jsonArray.length(); i++) {
							OrderProductVo vo = JSON.parseObject(
									jsonArray.get(i).toString(),
									OrderProductVo.class);
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
