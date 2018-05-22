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
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
/**
 * 中奖Controller
 * 
 * */
@Controller
@RequestMapping("/spellBuy/winner")
public class SpellBuyWinnerController {

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



	private boolean isJsonStr(String str) {
		boolean result = true;
		try {
			new JSONArray(str);
		} catch (JSONException e) {
			result = false;
		}
		return result;
	}

	// 中奖列表
	@RequestMapping(value = { "/listBy" }, method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
	// 页码
			Integer page,
			// 一页条数
			Integer rows,
			// 商品期数
			String productPeriod,
			// 商品名称
			String productName,
			// 商家名称
			String merchantName,
			// 获奖者
			String userId, String userName,
			// 开始时间
			String startDate,
			// 结束时间
			String endDate,

			// 手机号码
			String mobileNo,

			String merchantNo,

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
		if (productName != null) {
			productName = productName.trim();
		}

		if (merchantName != null) {

			merchantName = merchantName.trim();
		}
		// 由于中奖记录中没有手机号码，所以最终还是利用userNo查找
		if (StringUtils.isNotBlank(mobileNo)) {
			UserInfo userInfo = userQueryFacade
					.getUserInfoByBindMobileNo(mobileNo);

			if (userInfo == null) {
				paramMap.put("userId", "NOEXIST");
			} else {
				userId = userInfo.getUserNo();
				paramMap.put("userId", userId);
			}

		}

		paramMap.put("productPeriod", productPeriod);
		paramMap.put("productName", productName);
		paramMap.put("merchantName", merchantName);
		paramMap.put("userId", userId);
		paramMap.put("userName", userName);
		paramMap.put("merchantId", merchantNo);
		paramMap.put("startTime", startDate);
		paramMap.put("endTime", endDate);

		try {

			pageBean = latestLotteryFacade.listPage(pageParam,
					paramMap);
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

	// 中奖订单详情
	@RequestMapping(value = { "/getById" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getById(Long spellbuyProductId) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		LatestLottery latestLottery = null;
		Product productInfo = null;
		LotteryExpress lotteryExpress = null;
		SpellBuyOrder spellBuyOrder = null;
		try {
			latestLottery = latestLotteryFacade
					.getBySpellbuyId(spellbuyProductId);
			productInfo = productQueryFacade.getById(latestLottery
					.getProductId());
			lotteryExpress = lotteryExpressFacade
					.getByOrderNo(latestLottery
							.getSpellbuyProductId());

//			spellBuyOrder = spellBuyOrderFacade.getOrder(spellbuyProductId
//					.toString());
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		// 订单本身信息
		uiModel.put("latestLottery", latestLottery);
		// 订单商品信息
		uiModel.put("productInfo", productInfo);
		// 快递发货信息
		uiModel.put("orderExpress", lotteryExpress);

//
//		// 该中奖订单对应拼购订单信息
//		uiModel.put("spellBuyOrder", spellBuyOrder);


		return uiModel;
	}

	
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		List latestLotterysStatusList = LotteryLogisticsStatusEnum.toList();
		// 交易状态
		uiModel.put("latestLotterysStatusList", latestLotterysStatusList);
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
