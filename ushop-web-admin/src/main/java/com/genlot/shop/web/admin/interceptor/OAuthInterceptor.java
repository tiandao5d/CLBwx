package com.genlot.shop.web.admin.interceptor;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.utils.encrypt.MD5;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.exceptions.OAuthBizException;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;

public class OAuthInterceptor implements HandlerInterceptor {

	private static final Logger log = LoggerFactory.getLogger(OAuthInterceptor.class);
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;
	
	@Override
	public boolean preHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler) throws Exception {
		
		final String userNo 	= request.getParameter(AccessToken.OAUTH_PARAM_USERID);
		final String clientSign = request.getParameter(AccessToken.OAUTH_PARAM_SIGN);
		final String clientTime = request.getParameter(AccessToken.OAUTH_PARAM_TIME);
		final String clientURI 	= request.getRequestURI();
		try
		{
			
			// 判断时间是否延迟很多
			long serverTime  = oauthManagementFacade.getServerTimestamp();
			long diff = serverTime - Long.parseLong(clientTime);
			if (diff < AccessToken.ACCESS_SYNC_OVER_TIME || diff > AccessToken.ACCESS_SYNC_DELAY_TIME)
			{
				throw OAuthBizException.OAUTH_TOKEN_TIME_OUT;
			}
			// 判断sign
			AccessToken token = oauthManagementFacade.getAccessTokenByUserNo(userNo);
			if (!userNo.equals(token.getUserNo()))
			{
				throw OAuthBizException.OAUTH_TOKEN_INVALID;
			}
			String uri = clientURI
					 + "?userid="    + userNo
					 + "&token="     + token.getTokenId() 
					 + "&timestamp=" + clientTime;
			String serverSign = MD5.getMD5Str(uri);
								
			if (!serverSign.equals(clientSign))
			{
				throw OAuthBizException.OAUTH_TOKEN_INVALID;
			}
						
			return true;
		}
		catch (Exception exception)
		{
			sendErrorMessage(response, exception);
			return false;
		}
	}

	@Override
	public void postHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {		
	}

	@Override
	public void afterCompletion(HttpServletRequest request,
			HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
	}

	protected void sendErrorMessage(HttpServletResponse response, Exception exception)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
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
		
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        PrintWriter out;
		try 
		{
			out = response.getWriter();
			out.print(JSON.toJSONString(uiModel));
		    out.flush();
		} catch (IOException e) {
			e.printStackTrace();
			log.error("OAuthInterceptor send error message exception:", e);
		}
       
	}
	
}
