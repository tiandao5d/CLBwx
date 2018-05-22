package com.genlot.ushop.web.admin.update.controller;

import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.ushop.facade.update.entity.AppVersion;
import com.genlot.ushop.facade.update.service.AppVersionFacade;

/**
 * @author szg
 * @date 2017年9月6日
 * @version 1.0
 * @parameter
 * @since
 * @return
 */
@Controller
@RequestMapping(value = "/update/version")
public class AppVersionController {

	private static final Logger log = LoggerFactory.getLogger(AppVersionController.class);

	@Autowired
	private AppVersionFacade appVersionFacade;

	/**
	 * 版本更新列表
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/version/listBy?plat=
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = { "/listBy" }, method = RequestMethod.GET)
	@ResponseBody
	public Object list(String platform, Integer page, Integer rows, HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<>();
		PageBean pageBean = null;
		PageParam pageParam = null;
		try {
			if (page == null || rows == null) {
				pageParam = new PageParam(1, 10);
			} else {
				pageParam = new PageParam(page, rows);
			}
			paramMap.put("platform", platform);
			pageBean = appVersionFacade.listPage(pageParam, paramMap);
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pageSize", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		return uiModel;
	}

	/**
	 * 版本信息更新
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/version/update    	
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = { "/update" }, method = RequestMethod.POST)
	@ResponseBody
	public Object update(AppVersion appVersion, HttpServletRequest request,
			HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			appVersionFacade.update(appVersion);
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
	
	/**
	 * 根据版本信息ID获得详情.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/version/get?id=
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/get"}, method = RequestMethod.GET)
    @ResponseBody
    public Object getById(Long id, HttpServletRequest request,
    		HttpServletResponse response) {  
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		try
		{
			AppVersion entity = appVersionFacade.getById(id);
			uiModel.putAll(BeanMapUtil.convertBean(entity));
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
	    return uiModel;
	}
	
	/**
	 * 新增版本更新信息
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/version/add
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/add"}, method = RequestMethod.POST)
    @ResponseBody
    public Object add(AppVersion appVersion, HttpServletRequest request,
    		HttpServletResponse response) {  
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		try
		{
			appVersionFacade.insert(appVersion);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
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