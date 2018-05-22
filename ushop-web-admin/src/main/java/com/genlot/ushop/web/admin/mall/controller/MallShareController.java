package com.genlot.ushop.web.admin.mall.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.user.entity.MerchantInfo;
import com.genlot.ucenter.facade.user.service.MerchantFacade;
import com.genlot.ushop.facade.lottery.service.LotteryExpressFacade;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.entity.ProductOrder;
import com.genlot.ushop.facade.product.enums.ProductOrderStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductUsageEnum;
import com.genlot.ushop.facade.product.service.ProductOrderFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.sns.entity.ShareInfo;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.sns.enums.ShareStatusEnum;
import com.genlot.ushop.facade.sns.service.ShareManagementFacade;
import com.genlot.ushop.facade.sns.service.ShareQueryFacade;

@Controller
@RequestMapping("/mall/share")
public class MallShareController {

	@Autowired
	ShareQueryFacade shareQueryFacade;
	@Autowired
	ShareManagementFacade shareManagementFacade;
	@Autowired
	PmsFacade pmsFacade;
	@Autowired
	MerchantFacade merchantFacade;
	@Autowired
	ProductQueryFacade productQueryFacade;
	@Autowired
	LotteryExpressFacade lotteryExpressFacade;
	@Autowired
	ProductOrderFacade productOrderFacade;

	// 晒单列表(待审核、审核通过、审核不通过)
	@RequestMapping(value = { "/list" }, method = RequestMethod.GET)
	@ResponseBody
	public Object list(
	// 页码
			Integer page,
			// 一页条数
			Integer rows,
			// 状态(1、待审核 2、审核通过 3、审核不通过)
			Integer status, HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}

		paramMap.put("status", status);
		paramMap.put("mallUsage", ProductUsageEnum.SPELLBUY.getValue());
		try {

			pageBean = shareQueryFacade.listPage(pageParam, paramMap);

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		for(int index = 0; index < pageBean.getRecordList().size(); ++index)
		{
			ShareInfo info = (ShareInfo)pageBean.getRecordList().get(index);
			Product object = productQueryFacade.getById(info.getProductId());
			info.setObject(object);
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
	public Object getById(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		Map<String, Object> paramMap = new HashMap<String, Object>();
		ShareInfo shareInfo = null;
		Product productInfo = null;
		MerchantInfo merchantInfo = null;
		ProductOrder productOrder = null;
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			// 晒单详情记录
			shareInfo = shareQueryFacade.getById(id);
			// 商品详情
			productInfo = productQueryFacade.getById(shareInfo
					.getProductId());
			// 商家详情
			merchantInfo = merchantFacade.getByMerchantNo(productInfo
					.getMerchantId());

			productOrder = productOrderFacade.getByNo(shareInfo.getOrderNo());

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA,
					PmsOperatorLogStatusEnum.SUCCESS, "查看晒单详情", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA,
					PmsOperatorLogStatusEnum.ERROR, "查看晒单详情", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		// 订单本身信息
		uiModel.put("shareInfo", shareInfo);
		uiModel.put("productOrder", productOrder);

		uiModel.put("productInfo", productInfo);
		uiModel.put("merchantInfo", merchantInfo);

		return uiModel;
	}

	// 订单详情
	@RequestMapping(value = { "/getByOrderNo" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getByOrderNo(HttpServletRequest request, String orderNo) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		ProductOrder productOrder = null;
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			productOrder = productOrderFacade.getByNo(orderNo);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA,
					PmsOperatorLogStatusEnum.SUCCESS, "查看晒单详情", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA,
					PmsOperatorLogStatusEnum.ERROR, "查看晒单详情", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}


		// 订单商品信息
		uiModel.put("productOrder", productOrder);
	
		return uiModel;
	}

	// 审核通过
	@RequestMapping(value = "auditPassShare", method = RequestMethod.GET)
	@ResponseBody
	public Object auditPassShare(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			shareManagementFacade.audit(id, ShareStatusEnum.UP.getValue());

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "商城审核通过晒单", admin,
					WebUtils.getIpAddr(request));

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "商城审核通过晒单", admin,
					WebUtils.getIpAddr(request));
			return uiModel;
		}

		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
	

	// 审核不通过
	@RequestMapping(value = "auditNoPassShare", method = RequestMethod.GET)
	@ResponseBody
	public Object auditShare(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			shareManagementFacade.audit(id, ShareStatusEnum.ILLEGAL.getValue());

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "商城审核不通过晒单", admin,
					WebUtils.getIpAddr(request));

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "商城审核不通过晒单", admin,
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
		List productoListStatusList = ProductOrderStatusEnum.toList();
		// 状态信息
		uiModel.put("shareStatus", ShareStatusEnum.toList());
		uiModel.put("shareStatusList", ShareStatusEnum.toList());
		// 交易状态
		uiModel.put("productoListStatusList", productoListStatusList);
		
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
