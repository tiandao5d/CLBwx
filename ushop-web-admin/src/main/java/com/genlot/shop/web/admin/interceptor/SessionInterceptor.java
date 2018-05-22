package com.genlot.shop.web.admin.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.genlot.ucenter.facade.pms.entity.PmsOperator;

public class SessionInterceptor extends HandlerInterceptorAdapter {

	public boolean preHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler) throws Exception {
		String url = request.getRequestURI();
		
		PmsOperator admin = (PmsOperator) request.getSession().getAttribute(
				"admin");
		if (null == admin && url.indexOf("login") == -1
				&&url.indexOf("register") == -1
				&&url.indexOf("assets") == -1){
			
			response.sendRedirect(request.getContextPath() + "/html/loginRegister.html"); 
			return false;
		} else {
			return true;
		}

	}
}
