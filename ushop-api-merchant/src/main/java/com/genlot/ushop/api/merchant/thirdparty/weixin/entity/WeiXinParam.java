package com.genlot.ushop.api.merchant.thirdparty.weixin.entity;

import java.util.ArrayList;
import java.util.List;

import org.springframework.context.ApplicationEvent;


public class WeiXinParam{

	String authorizedUrl;
	String unauthorizedUrl;
	
	public String getAuthorizedUrl() {
		return authorizedUrl;
	}
	public void setAuthorizedUrl(String authorizedUrl) {
		this.authorizedUrl = authorizedUrl;
	}
	public String getUnauthorizedUrl() {
		return unauthorizedUrl;
	}
	public void setUnauthorizedUrl(String unauthorizedUrl) {
		this.unauthorizedUrl = unauthorizedUrl;
	}	
	
}
