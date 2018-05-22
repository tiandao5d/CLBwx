package com.genlot.ushop.api.merchant.sns.controller;

import java.util.ArrayList;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.ushop.facade.sns.entity.Banner;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;

/** 
* @author  kangds 
* @date 2016年7月12日 下午1:49:21 
* @version 1.0 
* @parameter  
* @since  
* @return 
 */
@Controller
@RequestMapping(value = "/api/sns/notify/banner")
public class BannerController {

private static final Logger log = LoggerFactory.getLogger(BannerController.class);
	
	@Autowired
	private BannerCacheFacade bannerCacheFacade;
		
	/**
	 * 横幅获得.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/banner/list/类型/省份
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param bannerType 所属模块
	 * @param province   省份
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/list/{bannerType}/{province}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			@PathVariable Integer bannerType,
			@PathVariable Integer province,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		List<Banner> recordList = null;
		try
		{
			recordList = new ArrayList<Banner>();
			if (province != 0) {
				List<Banner> provinceList = bannerCacheFacade.listBannerByType(bannerType,province);
				recordList.addAll(provinceList);
			}
			List<Banner> nationwideList = bannerCacheFacade.listBannerByType(bannerType,0);
			recordList.addAll(nationwideList);	
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("recordList", recordList);
		
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