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
@RequestMapping("/account/coupons")
public class AccountCouponsController {
	
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
	 * 游戏券账户列表.
	 * @param	
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param status 
	 * 			 状态：0 可使用  1(已使用  或者 已过期)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByUserNo"}, method = RequestMethod.GET)
    @ResponseBody
    public Object listByUserNo(
    		Integer page,
   		    Integer rows,
    		//0 ：可用  1：不可用（过期或者已使用）
    		 Integer status,  
    		 String userNo,
    		HttpServletRequest request,HttpServletResponse response) {  
		PageParam pageParam = null;
		Map<String, Object> paramMap = new HashMap<String, Object>();	
	
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		PageBean pageBean = null;
		//获得当前时间
		String currentTime = DateUtils.formatDate(new Date(), DateUtils.DATE_FORMAT_DATETIME);
		 
		String userid = request.getParameter("userid");

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		try
		{ 
			if(status == 0 || status == null ){
				paramMap.put("deadline", currentTime);
				paramMap.put("status", AccountCouponsStatusEnum.USED.getValue());
			}else{
				//过期 当前日期大于有效期至
				paramMap.put("older", currentTime);	
				paramMap.put("status", AccountCouponsStatusEnum.USED.getValue());
				
			}
			
			Integer fundType = AccountFundTypeEnum.COUPONS.getValue();	
			
			paramMap.put("userNo", userNo);
			paramMap.put("fundType", fundType);
			paramMap.put("couponsType", CouponsTypeEnum.GAME.getValue());
			pageBean = accountCouponsFacade.listPage(pageParam, paramMap);
			
			
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
	
	
	/**
	 * 获得游戏券模板列表
	 * */
	
	@RequestMapping(value={"/list"},method= RequestMethod.GET)
	@ResponseBody
	public Object couponsList(){
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		List<AccountCouponsType>  accountCouponsType = couponsFacade.listBy(paramMap);
		
		uiModel.put("accountCouponsType", accountCouponsType);
		return accountCouponsType;
	}
	
	/**
	 * 添加 游戏券账户列表.
	 * @param	
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param status 
	 * 			 状态：0 可使用  1(已使用  或者 已过期)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/add"}, method = RequestMethod.POST)
    @ResponseBody
    public Object add(    		
    		 Long couponsId,  
    		 String userNo,
    		HttpServletRequest request,HttpServletResponse response) {  
		
		Map<String,Object> uiModel = new HashMap<String,Object>();		
		 
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		
		try
		{ 
			AccountCouponsType coupons = couponsFacade.getById(couponsId);	
			if(coupons == null){
				uiModel.put("data", "COUPONS_IS_EXIST");
				return uiModel;
			}
			AccountCoupons accountCoupons = new AccountCoupons();
			
			JSONObject json = new JSONObject(coupons.getRule());
			String appId = json.getString("appId");
			Double balance = json.getDouble("balance");
			
			accountCoupons.setAppId(appId);
			accountCoupons.setBalance(balance);
			accountCoupons.setCouponsId(couponsId.toString());
			accountCoupons.setCouponsType(String.valueOf(CouponsTypeEnum.GAME.getValue()));
			Date deadline =  DateUtils.addDay(new Date(),coupons.getValidPeriod());
			String deadDate =  DateUtils.formatDate(deadline, DateUtils.DATE_FORMAT_DATETIME);
			accountCoupons.setDeadline(deadDate);
			accountCoupons.setUserNo(userNo);
			accountCoupons.setFundType(AccountFundTypeEnum.COUPONS.getValue());
			accountCoupons.setFundTypeName(CouponsTypeEnum.GAME.getDesc());
			accountCoupons.setStatus(AccountCouponsStatusEnum.ACTIVE.getValue());;
			accountCoupons.setInitialAmount(balance);
			
			//插入游戏券账户 属性值
			log.debug("-----accountCoupons------");
			log.debug(accountCoupons.toString());
			//插入游戏券账户
			accountCouponsFacade.insert(accountCoupons);
			
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.SUCCESS, "新增用户游戏券账户", admin,
					WebUtils.getIpAddr(request));
			
		}
		catch (Exception exception)
		{
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.ERROR, "新增用户游戏券账户", admin,
					WebUtils.getIpAddr(request));
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
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
