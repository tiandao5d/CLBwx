package com.genlot.ushop.web.admin.platform.app.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ucenter.facade.account.entity.AccountCouponsType;
import com.genlot.ucenter.facade.account.enums.CouponsTypeEnum;
import com.genlot.ucenter.facade.account.service.CouponsCacheFacade;
import com.genlot.ucenter.facade.account.service.CouponsFacade;
import com.genlot.uplatform.facade.application.entity.AppInfo;
import com.genlot.uplatform.facade.application.enums.AppStatusEnum;
import com.genlot.uplatform.facade.application.service.AppQueryFacade;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;


@Controller
@RequestMapping(value = "/platform/app")
public class AppController {

	
	@Autowired
	private AppQueryFacade appQueryFacade;

	private static final Logger log = LoggerFactory.getLogger(AppController.class);
	
	@ResponseBody
	@RequestMapping(value = "/list", method = RequestMethod.GET)
	public Object getApp() {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String,Object> paramMap = new HashMap<>();

		paramMap.put("status", AppStatusEnum.UP.getValue());		
		List<AppInfo> appInfoList = appQueryFacade.listBy(paramMap);

		List<Map> MapList = new ArrayList<Map>();

		for (AppInfo app : appInfoList) {
			Map<String, Object> typeMap = new HashMap<String, Object>();
			typeMap.put("appId", app.getAppId());
			typeMap.put("appName", app.getAppName());
			MapList.add(typeMap);
		}
		
		uiModel.put("recordList", MapList);

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
