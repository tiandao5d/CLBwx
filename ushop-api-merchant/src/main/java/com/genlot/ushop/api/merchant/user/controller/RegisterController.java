package com.genlot.ushop.api.merchant.user.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.config.PublicConfig;
import com.genlot.common.core.mq.DataMessage;
import com.genlot.common.enums.ProvinceEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.biz.component.BizEventProducer;
import com.genlot.common.message.lotto.component.LottoEventProducer;
import com.genlot.common.message.promotion.component.PromotionEventProducer;
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.message.task.event.TaskFinishingEvent;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.utils.validate.ValidateUtils;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ushop.facade.game.enums.LottoTriggerTypeEnum;
import com.genlot.ushop.facade.sms.enums.SMSTypeEnum;
import com.genlot.ushop.facade.sms.service.SMSFacade;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;

@Controller
@RequestMapping(value = "/api/user/login")
public class RegisterController {
	
	private static final Logger log = LoggerFactory.getLogger(RegisterController.class);
	
	@Autowired
	private UserManagementFacade userManagementFacade;
	
	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private SMSFacade sMSFacade;
	
	/**
	 * 用户注册.
	 * @example http://xxx.xxx.xxx.xxx:port/ucenter-api-merchant/api/user/login/register/appid/电话号码/登录密码(密文)/验证码
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param appCode 
	 * 			APP产品代号.
	 * @param mobile 
	 * 			登录名.
	 * @param password 
	 * 			登录密码(密文)
	 * @param 短信认证号码 
	 * 			登录密码(密文)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/register/{appCode}/{mobileNo}/{password}/{token}"}, method = RequestMethod.POST)
    @ResponseBody
    public Object register(
    		@PathVariable String appCode,
    		@PathVariable String mobileNo,
    		@PathVariable String password, 
    		@PathVariable String token, 
    		HttpServletRequest request,HttpServletResponse response) {  
		
		// 用户名
		String loginName = StringTools.stringToTrim(mobileNo); 
		// 密码
		String loginPwd = StringTools.stringToTrim(password);
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
//			String userNo = userManagementFacade.registerMember(
//					PublicConfig.APP_ID, 
//					loginName, 
//					loginPwd, 
//					loginPwd, 
//					"", "", "", 
//					loginName, 
//					"", "", "", 
//					loginName, 
//					"", 
//					loginName,
//					String.valueOf(ProvinceEnum.NATION.getValue()));
			
//			// 完成积分任务条件达成
//			taskEventProducer.sendEventTaskFinishing(
//					userNo, 
//					null, 
//					loginName, 
//					null, 
//					TaskConditionTypeEnum.FIRST_REGISTER.getValue() ,
//					0.0, 0.0, null);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		// 注册成功
		uiModel.put("loginName", loginName);
        return uiModel;
    }  
	
	
	@RequestMapping(value = {"/registerPhone"}, method = RequestMethod.POST)
    @ResponseBody
    public Object registerPhone(HttpServletRequest request,
    		HttpServletResponse response) {  
				
		// 用户名
		String loginName = StringTools.stringToTrim(request.getParameter("mobileNo")); 
		// 密码
		String loginPwd = StringTools.stringToTrim(request.getParameter("password"));
		// 动态码
		String randomCode = StringTools.stringToTrim(request.getParameter("code"));
		// 定位省份
		Integer location = Integer.parseInt(request.getParameter("location"));
	
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			if (!ValidateUtils.isMobile(loginName))
			{
				throw new UserBizException(UserBizException.LOGIN_NAME_ILLEGAL, "登录名不合法");
			}			
			// 验证码判断
			sMSFacade.checkVerificationCode(loginName, SMSTypeEnum.USER_REGISTER, randomCode, 1);
			
			// 推广员
			String promoter = null;
			if (request.getParameter("promoter") != null) {
				promoter = StringTools.stringToTrim(request.getParameter("promoter").toString());
			}
						
			// 注册
			UserInfo userInfo = userManagementFacade.registerMember(
					PublicConfig.APP_ID, 
					loginName, 
					loginPwd, 
					loginPwd, 
					"", "", "", 
					loginName, 
					"", "", "", 
					loginName, 
					"", 
					loginName,
					location.toString(),
					promoter);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
				
		// 注册成功
		uiModel.put("loginName", loginName);
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
