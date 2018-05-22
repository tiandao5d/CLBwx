package com.genlot.ushop.api.merchant.user.bill.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ucenter.facade.account.entity.AccountBill;
import com.genlot.ucenter.facade.account.enums.AccountBillStatusEnum;
import com.genlot.ucenter.facade.account.service.AccountBillFacade;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;

/**
 * 账单控制类

 * @author Ygx
 * 
 * 
 */
@Controller
@RequestMapping(value = "/api/user/bill")
public class BillController {

	private static final Logger log = LoggerFactory.getLogger(BillController.class);
	
	@Autowired
	private AccountBillFacade accountBillFacade;
	
	
	/**
	 * 对账列表.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/bill/listBy
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param 
	 * 			
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listBy/{page}/{rows}"}, method = RequestMethod.GET)
    @ResponseBody
    public Object listBy(   	
    		@PathVariable Integer page,
    		@PathVariable Integer rows,
    		HttpServletRequest request,HttpServletResponse response) {  
		PageParam pageParam = null;	
		if(page.intValue()== 0 || rows.intValue() == 0){
			 pageParam = new PageParam(1,10); 
		}else{
			 pageParam = new PageParam(page,rows); 
		}
		Map<String,Object> paramMap = new HashMap<String,Object>();	
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		PageBean pageBean = null;
		
		try
		{
     		String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			pageBean = accountBillFacade.listPageByUserNo(pageParam, userNo);

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
	 * 账单提现
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/bill/deposit
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param 
	 * 			
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/deposit/{id}"}, method = RequestMethod.GET)
    @ResponseBody
    public Object deposit(   	
    		@PathVariable Long id,
    		HttpServletRequest request,HttpServletResponse response) {  
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		
		try
		{	
			AccountBill accountBill = accountBillFacade.getById(id);
			accountBill.setStatus(AccountBillStatusEnum.AUDIT.getValue());//把状态设置为审核中
			accountBillFacade.update(accountBill);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}				
		// 成功
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
	
	protected void setErrorMessage(Exception exception, Map<String,Object> uiModel)
	{
		uiModel.clear();
		if (exception instanceof BizException)
		{
			BizException e = (BizException)exception;
			uiModel.put("error", e.getCode());
			uiModel.put("error_description", e.getMsg());
		}
		else
		{
			uiModel.put("error", 0);
			uiModel.put("error_description", "unknown error");
		}
	}
	
	
	
	
	
	
}
