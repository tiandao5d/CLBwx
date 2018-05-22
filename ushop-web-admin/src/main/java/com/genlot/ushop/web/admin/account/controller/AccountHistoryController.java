package com.genlot.ushop.web.admin.account.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
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
import com.genlot.common.utils.DateUtils;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.entity.Account;
import com.genlot.ucenter.facade.account.entity.AccountCoupons;
import com.genlot.ucenter.facade.account.entity.AccountCouponsType;
import com.genlot.ucenter.facade.account.enums.AccountCouponsStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundUsageEnum;
import com.genlot.ucenter.facade.account.enums.AccountStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountTypeEnum;
import com.genlot.ucenter.facade.account.enums.CouponsTypeEnum;
import com.genlot.ucenter.facade.account.service.AccountCouponsFacade;
import com.genlot.ucenter.facade.account.service.AccountFundTypeFacade;
import com.genlot.ucenter.facade.account.service.AccountManagementFacade;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.account.service.CouponsFacade;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;

@Controller
@RequestMapping("/account/history")
public class AccountHistoryController {
	
	private static final Logger log = LoggerFactory.getLogger(AccountController.class);

	@Autowired
	private AccountQueryFacade accountQueryFacade;

	@Autowired
	private AccountFundTypeFacade accountFundTypeFacade;

	@Autowired
	private UserQueryFacade userQueryFacade;

	@Autowired
	private PmsFacade pmsFacade;
	
	@Autowired
	private AccountCouponsFacade accountCouponsFacade;

	@Autowired
	private AccountManagementFacade accountManagementFacade;
	
	@Autowired
	private CouponsFacade couponsFacade;


		

	/**
	 * 查看账号流水.
	 * @param	
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByUserNo"}, method = RequestMethod.GET)
    @ResponseBody
    public Object historyListByUserNo(    		    	
    		 Integer page,
    		 Integer rows,
    		 String userNo,
    		 int fundType,
    		HttpServletRequest request,HttpServletResponse response) {  
		PageParam pageParam = null;
		Map<String, Object> paramMap = new HashMap<String, Object>();	
		
		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		PageBean pageBean = null;
		 
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		String fundTypeName = AccountFundTypeEnum.getEnum(fundType).getDesc();
		try
		{ 	
			paramMap.put("userNo", userNo);
			paramMap.put("fundType", fundType);	
			pageBean = accountQueryFacade.listPageAccountHistory(pageParam, paramMap);

		}
		catch (Exception exception)
		{
			log.error(exception.toString());
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
