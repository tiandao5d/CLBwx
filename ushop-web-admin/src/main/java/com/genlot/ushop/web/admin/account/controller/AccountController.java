package com.genlot.ushop.web.admin.account.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.entity.Account;
import com.genlot.ucenter.facade.account.entity.AccountCoupons;
import com.genlot.ucenter.facade.account.enums.AccountCouponsStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundUsageEnum;
import com.genlot.ucenter.facade.account.enums.AccountStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountTypeEnum;
import com.genlot.ucenter.facade.account.enums.CouponsTypeEnum;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
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
@RequestMapping("/account")
public class AccountController {

	private static final Logger log = LoggerFactory
			.getLogger(AccountController.class);

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

	@RequestMapping(value = "/list")
	@ResponseBody
	public Object list(String userNo) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		List<Account> accountList = null;
		try {

			accountList = accountQueryFacade.listAccountByUserNo(userNo);

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		Map<String, String> fundTypeMap = accountFundTypeFacade.getIdAndFundName();
		for (Account account : accountList) {
			account.setFundTypeName(fundTypeMap.get(account.getFundType().toString()));
		}

		// 获得可用于抵扣游戏券金额
		Long fundType = Long.valueOf(AccountFundTypeEnum.COUPONS.getValue());
		String currentTime = DateUtils.formatDate(new Date(), DateUtils.DATE_FORMAT_DATETIME);
		List<AccountCoupons> accountCouponsList = accountCouponsFacade.listByUsable(CouponsTypeEnum.GAME.getValue(),currentTime, null, userNo, fundType.intValue());
		Double yue = Double.valueOf(0);
		if (accountCouponsList != null) {
			for (AccountCoupons accountCoupons : accountCouponsList) {
				yue = yue + accountCoupons.getBalance();
			}
		}

		Account coupons = new Account();
		coupons.setFundType(fundType);
		coupons.setFundTypeName(AccountFundTypeEnum.COUPONS.getDesc());
		coupons.setBalance(yue);
		coupons.setAccountNo(accountList.get(1).getAccountNo());
		coupons.setUserNo(accountList.get(1).getUserNo());
		coupons.setStatus(AccountStatusEnum.ACTIVE.getValue());
		accountList.add(0, coupons);
		uiModel.put("recordList", accountList);
		uiModel.put("userNo", userNo);
		return uiModel;
	}

	// 获取用户账号信息
	@RequestMapping(value = "/getByUserNo", method = RequestMethod.GET)
	@ResponseBody
	public Object getByUserNo(String userNo, Long fundType) throws Exception {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Account account = new Account();
		try {
			account = accountQueryFacade.getAccountByUserNo_fundType(userNo, fundType);
		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("account", account);

		return uiModel;
	}

	// 新增用户账户信息
	@RequestMapping("add")
	@ResponseBody
	public Object add(Account account, HttpServletRequest request, String userNo) {

		PmsOperator admin = null;
		Account isAccount = null;
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		try {
			admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			isAccount = accountQueryFacade.getAccountByUserNo_fundType(userNo, account.getFundType());
			if (isAccount != null) {
				throw AccountBizException.ACCOUNT_NOT_EXIT;
			} 
			else {
				String productNo = "10000";
				UserInfo userInfo = userQueryFacade.getUserInfoByUserNo(userNo);
				account.setAccountNo(userInfo.getAccountNo());
				account.setProductNo(productNo);
				accountManagementFacade.insert(account);
				pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
						PmsOperatorLogStatusEnum.SUCCESS, "新增账号", admin,
						WebUtils.getIpAddr(request));
				Account accountInfo = accountQueryFacade
						.getAccountByUserNo_fundType(account.getUserNo(),
								account.getFundType());
				uiModel.put("account", accountInfo);
			} 
		}
		catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.ERROR, "新增账号", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		return uiModel;
	}

	// 更新用户账户信息
	@RequestMapping("update")
	@ResponseBody
	public Object update(HttpServletRequest request, Account account) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Account entry = accountManagementFacade.getAccountInfoByid(account.getId());

		entry.setBalance(account.getBalance());
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			accountManagementFacade.updateAccountInfo(entry);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "编辑账号", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception e) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "编辑账号", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(e, uiModel);
			return uiModel;
		}

		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	@ResponseBody
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		List accountFundDirectionList = AccountFundDirectionEnum.toList();
		List accountFundTypeList = AccountFundTypeEnum.toList();
		List accountFundUsageList = AccountFundUsageEnum.toList();
		List accountCouponsStatusList = AccountCouponsStatusEnum.toAccountStatusList();
		List accountTypeList = AccountTypeEnum.toList();
		List accountStatusList = AccountStatusEnum.toList();

		uiModel.put("accountFundDirectionList", accountFundDirectionList);
		uiModel.put("accountFundTypeList", accountFundTypeList);
		uiModel.put("accountFundUsageList", accountFundUsageList);
		uiModel.put("accountCouponsStatusList", accountCouponsStatusList);
		uiModel.put("accountTypeList", accountTypeList);
		uiModel.put("accountStatusList", accountStatusList);
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
