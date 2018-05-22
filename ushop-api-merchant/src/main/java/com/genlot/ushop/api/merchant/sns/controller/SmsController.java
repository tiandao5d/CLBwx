package com.genlot.ushop.api.merchant.sns.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.sms.component.SmsEventProducer;
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.utils.validate.ValidateUtils;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.ushop.facade.sms.enums.SMSTypeEnum;
import com.genlot.ushop.facade.sms.service.SMSFacade;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;
import com.genlot.ushop.facade.task.exceptions.TaskBizException;

@Controller
@RequestMapping(value = "/api/sns/mobile/verify")
public class SmsController {

private static final Logger log = LoggerFactory.getLogger(SmsController.class);
	
	@Autowired
	private SMSFacade sMSFacade;
	
	@Autowired
	private SmsEventProducer smsEventProducer;
	
	@Autowired
	private UserQueryFacade userQueryFacade;
	
	/**
	 * 发送手机动态验证码.
	 * @example http://xxx.xxx.xxx.xxx:port/ucenter-api-merchant/api/sns/mobile/verify/sendCode/手机号码/功能类型
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param mobile 
	 * 			手机号码.
	 * @return
	 */
	@RequestMapping(value = {"/sendCode/{mobileNo}/{type}"}, method = RequestMethod.POST)
    @ResponseBody
    public Object sendCode(
    		@PathVariable String mobileNo,
    		@PathVariable Integer type,
    		HttpServletRequest request,
    		HttpServletResponse response)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		mobileNo = StringTools.stringToTrim(mobileNo); 			
		try
		{
			if (!ValidateUtils.isMobile(mobileNo))
			{
				throw new UserBizException(UserBizException.LOGIN_NAME_ILLEGAL, "登录名不合法");
			}
			SMSTypeEnum smsType = SMSTypeEnum.getEnum(type);
			if (smsType == null)
			{
				throw new UserBizException(UserBizException.LOGIN_NAME_ILLEGAL, "登录名不合法");
			}
				
			smsEventProducer.sendEventSms("",mobileNo, type, null);
			//sMSClientFacade.sendVerificationCode(mobileNo, smsType);		
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
			uiModel.put("result", 1);
	        return uiModel;
	}
	
	/**
	 * 检查动态验证码.
	 * @example http://xxx.xxx.xxx.xxx:port/ucenter-api-merchant/api/sns/mobile/verify/checkCode/手机号码/功能类型/验证码
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param mobile 
	 * 			手机号码.
	 * @return
	 */
	@RequestMapping(value = {"/checkCode/{mobileNo}/{type}/{code}"}, method = RequestMethod.POST)
    @ResponseBody
    public Object checkCode(
    		@PathVariable String mobileNo,
    		@PathVariable Integer type,
    		@PathVariable String code,
    		HttpServletRequest request,
    		HttpServletResponse response) 
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		mobileNo = StringTools.stringToTrim(mobileNo); 	
		code = StringTools.stringToTrim(code); 	
		try
		{
			if (!ValidateUtils.isMobile(mobileNo))
			{
				throw new UserBizException(UserBizException.LOGIN_NAME_ILLEGAL, "登录名不合法");
			}
			SMSTypeEnum smsType = SMSTypeEnum.getEnum(type);
			if (smsType == null)
			{
				throw new UserBizException(UserBizException.LOGIN_NAME_ILLEGAL, "登录名不合法");
			}
			sMSFacade.checkVerificationCode(mobileNo, smsType, code, 0);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("result", 1);
	    return uiModel;
	}
	
	/**
	 * 检查手机号是否已占用.
	 * @example http://xxx.xxx.xxx.xxx:port/ucenter-api-merchant/api/sns/mobile/verify/checkPhone/手机号码
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param mobile 
	 * 			手机号码.
	 * @return
	 */
	@RequestMapping(value = {"/checkPhone/{mobileNo}"}, method = RequestMethod.POST)
    @ResponseBody
    public Object checkPhone(
    		@PathVariable String mobileNo,
    		HttpServletRequest request,
    		HttpServletResponse response) 
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		mobileNo = StringTools.stringToTrim(mobileNo); 	
		try
		{
			if (!ValidateUtils.isMobile(mobileNo))
			{
				throw new UserBizException(UserBizException.LOGIN_NAME_ILLEGAL, "登录名不合法");
			}
			
			// 获得用户
			uiModel.put("mobile", mobileNo);
			if (ValidateUtils.isEmpty(userQueryFacade.getUserInfoByBindMobileNo(mobileNo)))
			{
				uiModel.put("result", 1);
			}
			else
			{
				uiModel.put("result", 0);
			}
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
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
