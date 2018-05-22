package com.genlot.ushop.api.merchant.game.controller;

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
import com.genlot.uplatform.facade.application.entity.AppImage;
import com.genlot.uplatform.facade.application.entity.AppInfo;
import com.genlot.uplatform.facade.application.entity.AppType;
import com.genlot.uplatform.facade.application.service.AppImageFacade;
import com.genlot.uplatform.facade.application.service.AppQueryFacade;
import com.genlot.uplatform.facade.application.service.AppTypeFacade;

/** 
* @author  kangds 
* @date 2016年7月4日 下午1:46:22 
* @version 1.0 
* @parameter  
* @since  
* @return 
 */


@Controller
@RequestMapping(value = "/api/game")
public class GameController {

private static final Logger log = LoggerFactory.getLogger(GameController.class);

       
       @Autowired
       AppQueryFacade   appQueryFacade;
       
       @Autowired
       AppTypeFacade   appTypeFacade;
      
       @Autowired
       AppImageFacade appImageFacade;
		      
	
      
    /**
   	 * 获得上架游戏列表.
   	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/game/listPageByUp/{page}/{rows}/{appRuntimeEnv}/{province}
   	 * @error   {"error":"错误代号","error_description":"内容描述"}
   	 * @param appName 
   	 * 			游戏名称
   	 *  @param 
   	 * 			
   	 * @return Model 视图对象.
   	 */
       
    @RequestMapping(value = {"/listPageByUp/{page}/{rows}/{appRuntimeEnv}/{province}"}, method = RequestMethod.GET)
   	@ResponseBody
   	public Object getUpApplistPage(
   			
   			@PathVariable Integer page,
    		@PathVariable Integer rows,
    		@PathVariable Integer appRuntimeEnv,
    		@PathVariable Integer province,
			HttpServletRequest request,
			HttpServletResponse response)
   	{
   		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		List<AppType> appTypeList = null;
		PageParam pageParam = null;
		
		if(page.intValue()== 0 || rows.intValue() == 0){
			 pageParam = new PageParam(1,10); 
		}else{
			 pageParam = new PageParam(page,rows); 
		}
		try
		{
			pageBean = appQueryFacade.listPageByUp(pageParam, appRuntimeEnv, province);
			//获得游戏分类
			appTypeList = appTypeFacade.listCategory();
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("appTypeList", appTypeList); 
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		return uiModel;			
	}
  	
    
    /**
   	 * 获得测试中游戏列表.
   	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/game/listPageByTest/页数/一页记录数
   	 * @error   {"error":"错误代号","error_description":"内容描述"}
   	 * @param appName 
   	 * 			游戏名称
   	 *  @param 
   	 * 			
   	 * @return Model 视图对象.
   	 */
       
    @RequestMapping(value = {"/listPageByTest/{page}/{rows}"}, method = RequestMethod.GET)
   	@ResponseBody
   	public Object listPageByTest(
   			
   			@PathVariable Integer page,
    		@PathVariable Integer rows,
    		
			HttpServletRequest request,
			HttpServletResponse response)
   	{
   		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		List<AppType> appTypeList = null;
		PageParam pageParam = null;
		List appStatusList = null;
		
		if(page.intValue()== 0 || rows.intValue() == 0){
			 pageParam = new PageParam(1,10); 
		}else{
			 pageParam = new PageParam(page,rows); 
		}
		
		Map<String, Object> paramMap = new HashMap<String, Object>();
		
		try
		{
			pageBean = appQueryFacade.listPageByTest(pageParam, paramMap);
			//获得游戏分类
			appTypeList = appTypeFacade.listCategory();
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("appTypeList", appTypeList); 
		uiModel.put("appStatusList", appStatusList);
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		return uiModel;			
	}

	
   	/**
   	 * 根据参数获得游戏详情.
   	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/game/getById/游戏ID
   	 * @error   {"error":"错误代号","error_description":"内容描述"}
   	 * @param id 
   	 * 			游戏ID
   	 *  @param 
   	 * 			
   	 * @return Model 视图对象.
   	 */
   	@RequestMapping(value = {"/getById/{id}"}, method = RequestMethod.GET)
   	@ResponseBody
   	public Object getGameInfo(
   			@PathVariable int id,
			HttpServletRequest request,
			HttpServletResponse response)
   	{
   		Map<String,Object> uiModel = new HashMap<String,Object>();
   		AppInfo appInfo = null;
   		List<AppImage> appImageList =null ;
		try
		{
			appInfo = appQueryFacade.getById(id);
			appImageList = appImageFacade.listByProductId(id);
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("appInfo", appInfo);
		uiModel.put("appImageList", appImageList);
		return uiModel;			
	}
   	
   	/**
   	 * 根据参数获得游戏详情.
   	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/game/getByAppID/APPID
   	 * @error   {"error":"错误代号","error_description":"内容描述"}
   	 * @param id 
   	 * 			游戏ID
   	 *  @param 
   	 * 			
   	 * @return Model 视图对象.
   	 */
   	@RequestMapping(value = {"/getByAppID/{APPID}"}, method = RequestMethod.GET)
   	@ResponseBody
   	public Object getGameInfoByAppID(
   			@PathVariable String APPID,
			HttpServletRequest request,
			HttpServletResponse response)
   	{
   		Map<String,Object> uiModel = new HashMap<String,Object>();
   		AppInfo appInfo = null;
   		List<AppImage> appImageList =null ;
		try
		{
			appInfo = appQueryFacade.getByAppId(APPID);
			appImageList = appImageFacade.listByProductId(appInfo.getId().intValue());
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("appInfo", appInfo);
		uiModel.put("appImageList", appImageList);
		return uiModel;			
	}
   	
	protected void setErrorMessage(Exception exception, Map<String,Object> uiModel)
	{
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

