package com.genlot.ushop.api.merchant.user.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.UnknownAccountException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.config.PublicConfig;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.utils.validate.ValidateUtils;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.entity.UserOperator;
import com.genlot.ucenter.facade.user.enums.UserStatusEnum;
import com.genlot.ucenter.facade.user.enums.UserTypeEnum;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.ushop.facade.sms.enums.SMSTypeEnum;
import com.genlot.ushop.facade.sms.service.SMSFacade;

@Controller
@RequestMapping(value = "/api/user/login")
public class LoginController {
	
	private static final Logger log = LoggerFactory.getLogger(LoginController.class);
	
	@Autowired
	private UserManagementFacade userManagementFacade;
	
	@Autowired
	private UserQueryFacade userQueryFacade;
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;
	
	@Autowired
	private UserOperatorFacade userOperatorFacade;
	
	@Autowired
	private SMSFacade sMSFacade;
	
	/**
	 * 获得服务器时间戳.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/login/timestamp
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 */
	@RequestMapping(value = {"/timestamp"}, method = RequestMethod.GET)
    @ResponseBody
    public Object getServerTimestamp(
    		HttpServletRequest request,
    		HttpServletResponse response) {		
			Map<String,Object> uiModel = new HashMap<String,Object>();
			long time = 0L;
			try
			{
				// 获得服务器时间
				time = oauthManagementFacade.getServerTimestamp();
			}
			catch (Exception exception)
			{
				log.error(exception.toString());
				setErrorMessage(exception,uiModel);
				return uiModel;
			}
			uiModel.put("timestamp", time);
	        return uiModel;
	}
	
	/**
	 * 登录认证
	 * @example http://xxx.xxx.xxx.xxx:port/ucenter-api-merchant/api/user/login/auth/APPID/电话号码或者用户名字/登录密码(密文)
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 */
	@RequestMapping(value = {"/auth/{appCode}/{loginName}/{password}"}, method = RequestMethod.POST)
    @ResponseBody
    public Object auth(
    		@PathVariable String appCode,
    		@PathVariable String loginName,
    		@PathVariable String password,
    		HttpServletRequest request,
    		HttpServletResponse response) {		
			Map<String,Object> uiModel = new HashMap<String,Object>();
			AccessToken token = null;
			UserInfo userInfo = null;
			long time = 0L;
			try
			{
				// 用户名
				loginName = StringTools.stringToTrim(loginName); 
				
				// 登录
				userInfo = userManagementFacade.memberLogin(
						loginName, 
						password, 
						PublicConfig.PWD_ERROR_LIMIT_TIMES,
	        			PublicConfig.PWD_ERROR_LIMIT_TIME);
				
				// 创建认证
				token = oauthManagementFacade.createAccessToken(PublicConfig.APP_ID, loginName, userInfo.getUserNo());
				
				// 获得服务器时间
				time = oauthManagementFacade.getServerTimestamp();
				
			}
			catch (Exception exception)
			{
				exception.printStackTrace();
				setErrorMessage(exception,uiModel);
				return uiModel;
			}
			uiModel.put("userId", userInfo.getUserNo());
			uiModel.put("token", token.getTokenId());
			uiModel.put("timestamp", time);
	        return uiModel;
	}
	
	/**
	 * 忘记密码
	 * @example http://xxx.xxx.xxx.xxx:port/ucenter-api-merchant/api/user/login/forgetPwd/电话号码/登录密码(密文)/手机验证码
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 */
	@RequestMapping(value = {"/forgetPwd/{loginName}/{password}/{code}"}, method = RequestMethod.POST)
    @ResponseBody
    public Object forgetPwd(
    		@PathVariable String loginName,
    		@PathVariable String password,
    		@PathVariable String code,
    		HttpServletRequest request,
    		HttpServletResponse response) 
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		UserInfo userInfo = null;
		try
		{
			// 用户名
			loginName = StringTools.stringToTrim(loginName); 
			// 验证号
			code = StringTools.stringToTrim(code); 
			// 密码
			password = StringTools.stringToTrim(password); 
			
			if (!ValidateUtils.isMobile(loginName))
			{
				throw new UserBizException(UserBizException.LOGIN_NAME_ILLEGAL, "登录名不合法");
			}
			
			// 验证
			sMSFacade.checkVerificationCode(loginName, SMSTypeEnum.USER_FORGET_PASSWORD, code, 1);
			
			// 获得用户
			userInfo = userQueryFacade.getUserInfoByBindMobileNo(loginName);
			if (ValidateUtils.isEmpty(userInfo)) {
				throw new UserBizException(UserBizException.LOGIN_LOGNAME_NOT_EXIST, "用户名或密码错误");
			}
			
			if (!userInfo.getUserType().equals(UserTypeEnum.CUSTOMER.getValue())) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}
			
			// 重至密码
			userOperatorFacade.resetPassword(userInfo.getLoginName(), password);
				
		}
		catch (Exception exception)
		{
			exception.printStackTrace();
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("result", 1);
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
