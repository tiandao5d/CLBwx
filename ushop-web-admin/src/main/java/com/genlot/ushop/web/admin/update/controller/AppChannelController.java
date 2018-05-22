package com.genlot.ushop.web.admin.update.controller;

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
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.ushop.facade.update.entity.AppChannel;
import com.genlot.ushop.facade.update.service.AppChannelFacade;

/**
 * @author szg
 * @date 2017年9月6日
 * @version 1.0
 * @parameter
 * @since
 * @return
 */
@Controller
@RequestMapping(value = "/update/channel")
public class AppChannelController {

	private static final Logger log = LoggerFactory.getLogger(AppChannelController.class);

	@Autowired
	private AppChannelFacade appChannelFacade;

	/**
	 * 渠道列表
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop.web.admin/channel/listBy
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = { "/listBy" }, method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(Integer page, Integer count, HttpServletRequest request,
			HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = null;
		PageParam pageParam = null;
		try {
			if (page == null || count == null) {
				pageParam = new PageParam(1, 10);
			} else {
				pageParam = new PageParam(page, count);
			}
			pageBean = appChannelFacade.listPage(pageParam);
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
	 * 渠道信息更新
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/channel/update
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = { "/update" }, method = RequestMethod.POST)
	@ResponseBody
	public Object update(AppChannel appChannel, HttpServletRequest request,
			HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			appChannelFacade.update(appChannel);
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
	
	/**
	 * 根据渠道信息ID获得详情.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/channel/get/id
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
			AppChannel entity = appChannelFacade.getById(id);
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
	 * 新增渠道信息
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/channel/add
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/add"}, method = RequestMethod.POST)
    @ResponseBody
    public Object add(AppChannel appChannel, HttpServletRequest request,
    		HttpServletResponse response) {  
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		try
		{
			appChannelFacade.insert(appChannel);
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
	
	/**
	 * 获取渠道下拉列表
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/channel/list
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/list"}, method = RequestMethod.GET)
    @ResponseBody
    public Object list(HttpServletRequest request, HttpServletResponse response) {  
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		List<AppChannel> recordList = null;
		try
		{
			recordList = appChannelFacade.listBy();
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