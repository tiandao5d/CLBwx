package com.genlot.ushop.api.merchant.sns.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.ushop.facade.update.entity.AppVersion;
import com.genlot.ushop.facade.update.service.AppChannelFacade;
import com.genlot.ushop.facade.update.service.AppVersionFacade;

/**
 * @author szg
 * @date 2017年9月7日
 * @version 1.0
 * @parameter
 * @since
 * @return
 */
@Controller
@RequestMapping(value = "/api/sns/version/update")
public class VersionUpdateController {

	private static final Logger log = LoggerFactory.getLogger(VersionUpdateController.class);

	@Autowired
	private AppVersionFacade appVersionFacade;
	
	@Autowired
	private AppChannelFacade appChannelFacade;
	
	/**
	 * 获取版本更新信息
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/version/update/get/versionNo/plat/channelId
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = { "/get/{versionNo}/{plat}/{channelId}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getForAndroid(@PathVariable String versionNo, @PathVariable Integer plat, @PathVariable Long channelId,  HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		AppVersion appVersion = null;
		try {
			appVersion = appVersionFacade.getLatestVersion(versionNo, plat, channelId);
			uiModel.putAll(BeanMapUtil.convertBean(appVersion));
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
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