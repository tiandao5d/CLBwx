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
import com.genlot.ushop.facade.sns.entity.Advertisement;
import com.genlot.ushop.facade.sns.service.BannerCacheFacade;

/**
 * @author hsz
 * @date 2016年12月26日
 * @version 1.0
 * @parameter
 * @since
 * @return
 */
@Controller
@RequestMapping(value = "/api/sns/notify/advert")
public class AdvertController {

	private static final Logger log = LoggerFactory
			.getLogger(AdvertController.class);

	@Autowired
	private BannerCacheFacade bannerCacheFacade;

	/**
	 * 广告位获得.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/notify/advert
	 *          /list
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = { "/list/{province}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			@PathVariable Integer province,
			HttpServletRequest request, 
			HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		List<Advertisement> advertisementList = new ArrayList<Advertisement>();
		try {
			
			if (province != 0) {
				List<Advertisement> provinceList = bannerCacheFacade.listAdvertisementByType(province);
				advertisementList.addAll(provinceList);
			}
			List<Advertisement> nationwideList = bannerCacheFacade.listAdvertisementByType(0);
			advertisementList.addAll(nationwideList);	
	
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		uiModel.put("recordList", advertisementList);

		return uiModel;
	}

	protected void setErrorMessage(Exception exception,
			Map<String, Object> uiModel) {
		uiModel.clear();
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