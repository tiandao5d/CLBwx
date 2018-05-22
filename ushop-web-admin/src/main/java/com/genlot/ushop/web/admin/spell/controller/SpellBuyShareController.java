package com.genlot.ushop.web.admin.spell.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.enums.OpeStatusEnum;
import com.genlot.common.enums.OpeTypeEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.user.entity.MerchantInfo;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.enums.MerchantStatusEnum;
import com.genlot.ucenter.facade.user.service.MerchantFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorLogFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.ushop.facade.lottery.entity.LatestLottery;
import com.genlot.ushop.facade.lottery.entity.LotteryExpress;
import com.genlot.ushop.facade.lottery.service.LatestLotteryFacade;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.enums.ProductUsageEnum;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.sns.entity.ShareInfo;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.sns.enums.ShareStatusEnum;
import com.genlot.ushop.facade.sns.service.ShareManagementFacade;
import com.genlot.ushop.facade.sns.service.ShareQueryFacade;

@Controller
@RequestMapping("/spellBuy/share")
public class SpellBuyShareController {

	@Autowired
	ShareQueryFacade shareQueryFacade;
	@Autowired
	ShareManagementFacade shareManagementFacade;

	@Autowired
	PmsFacade pmsFacade;

	@Autowired
	LatestLotteryFacade latestLotteryFacade;
	@Autowired
	UserQueryFacade userQueryFacade;
	@Autowired
	MerchantFacade merchantFacade;

	@Autowired
	ProductQueryFacade productQueryFacade;

	// 晒单列表(待审核、审核通过、审核不通过)
	@RequestMapping(value = { "/list" }, method = RequestMethod.GET)
	@ResponseBody
	public Object list(
	// 页码
			Integer page,
			// 一页条数
			Integer rows,
			// 状态(1、待审核 2、审核通过 3、审核不通过)
			Integer status,

			// 开始时间
			String startDate,
			// 结束时间
			String endDate,

			String userId,
			// 用户名
			String userName,
			// 用户手机号码
			String mobileNo,

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

		paramMap.put("status", status);
		paramMap.put("userName", userName);
		paramMap.put("startTime", startDate);
		paramMap.put("endTime", endDate);
		paramMap.put("productUsage", ProductUsageEnum.SPELLBUY.getValue());

		try {

			pageBean = shareQueryFacade.listPage(pageParam, paramMap);
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

	// 晒单详情
	@RequestMapping(value = { "/getById" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getById(Long id) {

		Map<String, Object> uiModel = new HashMap<String, Object>();

		Map<String, Object> paramMap = new HashMap<String, Object>();
		ShareInfo shareInfo = null;
		List shareStatus = null;
		Product productInfo = null;
		MerchantInfo merchantInfo = null;
		LatestLottery latestLottery = null;
		try {

			// 晒单详情记录
			shareInfo = shareQueryFacade.getById(id);
			if (shareInfo == null) {
				uiModel.put("data", "SHARE_IS_NULL");
				return uiModel;
			}

			latestLottery = latestLotteryFacade
					.getBySpellbuyId(shareInfo
							.getSpellbuyProductId());

			// 商品详情
			productInfo = productQueryFacade.getById(shareInfo.getProductId());
			// 商家详情
			merchantInfo = merchantFacade.getByMerchantNo(productInfo.getMerchantId());
			// 晒单状态枚举
			shareStatus = ShareStatusEnum.toList();

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		// 订单本身信息
		uiModel.put("shareInfo", shareInfo);
		// 状态信息
		uiModel.put("shareStatus", shareStatus);
		uiModel.put("productInfo", productInfo);
		uiModel.put("merchantInfo", merchantInfo);

		return uiModel;
	}

	// 未晒单、已晒单订单
	@RequestMapping(value = { "/listByLatest" }, method = RequestMethod.GET)
	@ResponseBody
	public Object listByLatest(
			// 分页
			Integer page, Integer rows,
			// 分享状态(-1未晒单，1已晒单)
			Integer shareStatus,
			// 商品期数
			String productPeriod,
			// 商品名称
			String productName,
			// 获奖人姓名
			String userId, String userName,
			// 开始时间
			String startDate,
			// 结束时间
			String endDate,
			// 结束时间
			String merchantNo, String mobileNo,
			// 商品质量评分
			String productQuality,
			// 商家服务评分
			String merchantServices,
			// 发货速度评分
			String deliverySpeed, HttpServletRequest request,
			HttpSession session) {

		Map<String, Object> paramMap = new HashMap<String, Object>();
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}

		// xstatus 表示 晒单状态等于的
		// NoShareStatus 表示晒单状态不等于，专用于未晒单
		if (shareStatus == 1) {
			paramMap.put("xstatus", 1);

			// 5表示订单状态是交易完成,也就是已经确认收货，并且晒单通过审核
			paramMap.put("status", 5);

		} else {
			//
			paramMap.put("xstatus", -1);

			// 4表示订单状态是已经确认收货，
			paramMap.put("status", 4);
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

		if (productName != null) {
			productName = productName.trim();
		}
		paramMap.put("productPeriod", productPeriod);

		paramMap.put("productName", productName);
		paramMap.put("userName", userName);
		paramMap.put("startTime", startDate);
		paramMap.put("endTime", endDate);
		paramMap.put("merchantId", merchantNo);

		paramMap.put("productQuality", productQuality);
		paramMap.put("merchantServices", merchantServices);
		paramMap.put("deliverySpeed", deliverySpeed);
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

	// 审核
	@RequestMapping(value = "auditShare", method = RequestMethod.GET)
	@ResponseBody
	public Object auditShare(Long id, HttpServletRequest request,
			Integer status) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			shareManagementFacade.audit(id, status);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "审核晒单", admin,
					WebUtils.getIpAddr(request));

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "审核晒单", admin,
					WebUtils.getIpAddr(request));
			return uiModel;
		}

		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		uiModel.put("shareStatusList", ShareStatusEnum.toList());
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
