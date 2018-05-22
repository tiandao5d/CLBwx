package com.genlot.ushop.api.merchant.thirdparty.weixin.user.controller;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
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
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.genlot.common.config.PublicConfig;
import com.genlot.common.core.mq.DataMessage;
import com.genlot.common.enums.PlatformEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.biz.component.BizEventProducer;
import com.genlot.common.message.lotto.component.LottoEventProducer;
import com.genlot.common.message.promotion.component.PromotionEventProducer;
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.encrypt.MD5;
import com.genlot.common.utils.http.HttpUtils;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.utils.validate.ValidateUtils;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.exceptions.OAuthBizException;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.UserBindRelation;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.entity.UserOperator;
import com.genlot.ucenter.facade.user.enums.UserStatusEnum;
import com.genlot.ucenter.facade.user.enums.UserTypeEnum;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.uplatform.facade.frontend.weixin.service.WeiXinFacade;
import com.genlot.ushop.api.merchant.thirdparty.weixin.entity.WeiXinParam;
import com.genlot.ushop.facade.sms.enums.SMSTypeEnum;
import com.genlot.ushop.facade.sms.service.SMSFacade;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;

@Controller
@RequestMapping(value = "/api/weixin/user/login")
public class WeiXinLoginController {
	
	private static final Logger log = LoggerFactory.getLogger(WeiXinLoginController.class);
	
	@Autowired
	private UserManagementFacade userManagementFacade;
	
	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private UserQueryFacade userQueryFacade;
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;
	
	@Autowired
	private UserOperatorFacade userOperatorFacade;
	
	@Autowired
	private	UserBindRelationFacade userBindRelationFacade;
	
	@Autowired
	private WeiXinFacade weiXinFacade;
	
	@Autowired
	private SMSFacade sMSFacade;
	
	@Autowired
	private WeiXinParam weiXinParam;
	
	/**
	 * 授权登录
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/weixin/user/login/auth/
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 * @throws UnsupportedEncodingException 
	 */
	@RequestMapping(value = {"/auth/{view}/{promoter}"}, method = RequestMethod.GET)
    public ModelAndView auth(
    		@PathVariable String view,
    		@PathVariable String promoter,
    		HttpServletRequest request,
    		HttpServletResponse response,
    		RedirectAttributes ra) throws UnsupportedEncodingException
	{
		Map<String, String[]> params = request.getParameterMap();  
	    String queryString = "";  
	    for (String key : params.keySet()) {
	    	String[] values = params.get(key);
	    	for (int i = 0; i < values.length; i++) {
	    		String value = values[i];  
	            queryString += key + "=" + value + "&";  
	        }  
	    }
	    // 去掉最后一个空格 
	    if (queryString.isEmpty())
	    {
	    	log.info("Weixin illegal auth: POST " + request.getRequestURL() + " " + queryString);  
	    }
	    else {
	    	log.info("Weixin auth call back: POST " + request.getRequestURL() + " " + queryString);
	    }
	    
		request.setCharacterEncoding("utf-8");
	    response.setCharacterEncoding("utf-8");

	    // 用户同意授权后，能获取到code
	    String code = request.getParameter("code");
	    String state = request.getParameter("state");
	    ModelAndView modelAndView = null;
	    MemberInfo member = null;
	    try {
		    // 同意授权
		    if (code == null) {
		    	throw OAuthBizException.OAUTH_CODE_TIME_OUT;
		    }
		    if (state == null) {
		    	throw OAuthBizException.OAUTH_CODE_TIME_OUT;
		    }
			 
		    AccessToken token = weiXinFacade.getUserAccessToken(code);
	    	if (token == null) {
	    		throw OAuthBizException.OAUTH_TOKEN_INVALID;
	    	}
	    	
	    	log.info("Weixin auth get user access token " + token.getTokenId() + ":" + token.getAuthenticationId());
	    	
	    	member = weiXinFacade.getUserInfo(token.getTokenId(),token.getAuthenticationId());
    		if (member == null) {
    			throw OAuthBizException.OAUTH_TOKEN_INVALID;
    		}
    		
    		log.info("Weixin auth get user info " + JSON.toJSONString(member));
    		 
			// 判断是否已经绑定
			UserBindRelation relation = userBindRelationFacade.getByPlatform(
					token.getAuthenticationId(), 
					null, 
					PlatformEnum.WEIXIN.getValue(),
					0);
			String userNo = null;
			String phone = null;
			AccessToken userToken = null;
			long time = 0L;
			if(relation == null)
			{
				userNo = userManagementFacade.registerThirdPartyMember(
						PublicConfig.APP_ID,
						member.getNickName(), 
						MD5.getMD5Str(member.getNickName().getBytes("UTF-8")), 
						member.getNickName(), 
						null, 
						null, 
						member.getSex(),
						member.getHeadImage(),
						member.getMemberNo(), 
						DateUtils.LONG_DATE_FORMAT.format(new Date()), 
						token.getTokenId(), 
						member.getCountry(),
						null,
						member.getLocation() + member.getAddress(),
						null, 
						PlatformEnum.WEIXIN.getValue(),
						promoter);
				
				log.info("Weixin auth create new user info " + userNo);
			}
			else
			{
				userNo = relation.getRelationUserNo();
				log.info("Weixin auth login user " + userNo + ":" + token.getAuthenticationId());
				UserInfo info = userManagementFacade.memberLogin(userNo);
				if (info.getBindMobileNo() != null && ValidateUtils.isMobile(info.getBindMobileNo())) {
					phone = info.getBindMobileNo();
				}
			}
			// 创建认证
			userToken = oauthManagementFacade.createAccessToken(PublicConfig.APP_ID, member.getNickName(), userNo);
			// 获得服务器时间
			time = oauthManagementFacade.getServerTimestamp();
			// 转发到另外的页面附带参数
			ra.addAttribute("userId", userNo);
			ra.addAttribute("token", userToken.getTokenId());
			ra.addAttribute("timestamp", time);
			if (phone != null) {
				ra.addAttribute("phone", phone);
			}
			ra.addAttribute("view", view);
	        modelAndView = new ModelAndView(weiXinParam.getAuthorizedUrl());  
	        
	       
	    }
		catch (Exception exception) {
			exception.printStackTrace();
			modelAndView = new ModelAndView(weiXinParam.getUnauthorizedUrl()); 
		}

	    return modelAndView;
	}
	
	/**
	 * 绑定
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/weixin/user/login/bind/手机号/验证码
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 * @throws UnsupportedEncodingException 
	 */
	@RequestMapping(value = {"/bind/{mobileNo}/{code}"}, method = RequestMethod.POST)
	@ResponseBody
    public Object bind(
    		@PathVariable String mobileNo,
    		@PathVariable String code, 
    		HttpServletRequest request,
    		HttpServletResponse response) {
		// 用户ID
		String userNo = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		AccessToken token = null;
		long time = 0L;
		try {
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			mobileNo = StringTools.stringToTrim(mobileNo); 
			code = StringTools.stringToTrim(code); 
			
			// 验证手机号码合法性
			if (!ValidateUtils.isMobile(mobileNo)) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}
			
			// 用户信息
			UserInfo former = userQueryFacade.getUserInfoByBindMobileNo(mobileNo);
			if (former != null && former.getUserNo().equals(userNo)) {
				throw UserBizException.USER_BIND_REPEAT_RELATION;
			}
			
			// 验证
			sMSFacade.checkVerificationCode(mobileNo, SMSTypeEnum.USER_BIND_PHONE, code, 1);
			
			if (former == null) {
				// 直接绑定手机
				userManagementFacade.bindMobileNo(userNo, mobileNo);	
			}
			else {
				UserBindRelation relation = userBindRelationFacade.getByUserNo(userNo, null, PlatformEnum.WEIXIN.getValue(), 0);
				if (relation == null) {
					throw UserBizException.USER_BIND_RELATION_IS_NOT_EXIST;
				}
				if (!former.getUserType().equals(UserTypeEnum.CUSTOMER.getValue())) {
					throw UserBizException.USER_BIND_RELATION_IS_EXIST;
				}
				// 重关联
				userNo = former.getUserNo();
				userBindRelationFacade.rebind(relation.getLoginId(), null, PlatformEnum.WEIXIN.getValue(), userNo);
			}
			
			// 创建认证
			token = oauthManagementFacade.createAccessToken(PublicConfig.APP_ID, mobileNo, userNo);
			
			// 获得服务器时间
			time = oauthManagementFacade.getServerTimestamp();
			
		}
		catch (Exception exception) {
			exception.printStackTrace();
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("userId", userNo);
		uiModel.put("token", token.getTokenId());
		uiModel.put("timestamp", time);
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
