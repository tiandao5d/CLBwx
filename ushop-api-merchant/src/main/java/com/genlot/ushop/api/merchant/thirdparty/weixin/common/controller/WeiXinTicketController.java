package com.genlot.ushop.api.merchant.thirdparty.weixin.common.controller;

import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

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
import com.genlot.common.enums.PlatformEnum;
import com.genlot.common.exceptions.BizException;
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
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.uplatform.facade.frontend.weixin.service.WeiXinFacade;
import com.genlot.ushop.api.merchant.thirdparty.weixin.entity.WeiXinParam;



@Controller
@RequestMapping(value = "/api/weixin/client/ticket")
public class WeiXinTicketController {
	
	
	private static final Logger log = LoggerFactory.getLogger(WeiXinTicketController.class);
	
	
	@Autowired
	private WeiXinFacade weiXinFacade;
	
	/**
	 * 获得客户端访问票据
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/weixin/client/ticket/get
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 * @throws UnsupportedEncodingException 
	 */
	@RequestMapping(value = {"/get"}, method = RequestMethod.GET)
	@ResponseBody
    public Object get(
    		HttpServletRequest request,
    		HttpServletResponse response) throws UnsupportedEncodingException
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		String type = StringTools.stringToTrim(request.getParameter("type")); 
		String url = StringTools.stringToTrim(request.getParameter("url"));
		
		try
		{
			String base = "abcdefghijklmnopqrstuvwxyz0123456789";
		    Random random = new Random();
		    StringBuffer sb = new StringBuffer();
		    for (int i = 0; i < 16; i++) { 
		    	int number = random.nextInt(base.length());
		        sb.append(base.charAt(number));
		    }
			Long timestamp = System.currentTimeMillis() / 1000;
			String ticket = weiXinFacade.getAPITicket(type,url,timestamp.toString(),sb.toString());
			uiModel.put("sign", ticket);
			uiModel.put("noncestr", sb.toString());
			uiModel.put("timestamp", timestamp.toString());
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
