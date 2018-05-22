package com.genlot.ushop.web.admin.account.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.string.StringUtil;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.entity.AccountBill;
import com.genlot.ucenter.facade.account.entity.AccountCoupons;
import com.genlot.ucenter.facade.account.entity.AccountCouponsType;
import com.genlot.ucenter.facade.account.enums.AccountBillStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountTransferStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountCouponsStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundUsageEnum;
import com.genlot.ucenter.facade.account.enums.AccountStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountTypeEnum;
import com.genlot.ucenter.facade.account.enums.CouponsTypeEnum;
import com.genlot.ucenter.facade.account.enums.AccountTradeTypeEnum;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
import com.genlot.ucenter.facade.account.service.AccountBillFacade;
import com.genlot.ucenter.facade.account.service.AccountCouponsFacade;
import com.genlot.ucenter.facade.account.service.AccountTransferFacade;
import com.genlot.ucenter.facade.account.service.CouponsCacheFacade;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.promotion.entity.PromoterInfo;
import com.genlot.ucenter.facade.promotion.enums.PromoterTypeEnum;
import com.genlot.ucenter.facade.promotion.exceptions.PromotionBizException;
import com.genlot.ucenter.facade.promotion.service.PromoterFacade;

@Controller
@RequestMapping("/account/transfer")
public class AccountTransferController {
	
	private static final Logger log = LoggerFactory.getLogger(AccountTransferController.class);
	
	@Autowired
	private AccountTransferFacade accountTransferFacade;
	
	@Autowired
	private PmsFacade pmsFacade;
	
	/**
	 * 转账列表
	 * @param	
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/listBy")
	@ResponseBody
	public Object listBy(
			Integer page,
			Integer rows,
			String startDate,
			String endDate,
			String userNo,
			String trxNo,
			HttpServletRequest request,
			HttpServletResponse response) {
		PageParam pageParam = null;	
		if(page == null || rows == null){
			 pageParam = new PageParam(1,10); 
		}else{
			 pageParam = new PageParam(page,rows); 
		}
		Map<String,Object> uiModel = new HashMap<String,Object>();
		Map<String,Object> paramMap = new HashMap<String,Object>();
		PageBean pageBean = null;
		try
		{
			paramMap.put("beginDate", startDate);
			paramMap.put("endDate", endDate);
			paramMap.put("userNo", userNo);
			paramMap.put("trxNo", trxNo);
			pageBean = accountTransferFacade.listPage(pageParam,paramMap);	
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}				
		// 成功
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		return uiModel;
	}
	
	@ResponseBody
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		List accountFundDirectionList = AccountFundDirectionEnum.toList();
		List accountTransferStatusList = AccountTransferStatusEnum.toList();
		List accountTradeTypeList = AccountTradeTypeEnum.toList();
		uiModel.put("accountFundDirectionList", accountFundDirectionList);
		uiModel.put("accountTransferStatusList", accountTransferStatusList);
		uiModel.put("accountTradeTypeList", accountTradeTypeList);
		
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
