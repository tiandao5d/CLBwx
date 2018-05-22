package com.genlot.ushop.api.merchant.user.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.oltu.oauth2.common.OAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.string.StringTools;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.user.entity.UserAddress;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.UserAddressFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;


@Controller
@RequestMapping(value = "/api/user/address")
public class AddressController {
	
	private static final Logger log = LoggerFactory.getLogger(AddressController.class);
	
	@Autowired
	private UserAddressFacade userAddressFacade;
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;
	
	/**
	 * 添加地址.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/address/create
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * 			.
	 * @body  json data 
	 * 			Content-Type: application/json;charset=UTF-8 
	 * 			格式:{"province":"省","city":"市","district":"区","address":"地址","zipCode":"邮编","consignee":"收货人","phone":"电话","status":"默认"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/create", method = RequestMethod.POST)
    @ResponseBody
    public Object create(
    		@RequestBody UserAddress address,
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		// 用户ID
		String userId = null;		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		long id = 0;
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			address.setUserNo(userId);
			id = userAddressFacade.create(address);
			address.setId(id);
			
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		// 成功返回
		uiModel.put("address", address);
        return uiModel;
    }
	
	/**
	 * 更新地址.
	 * @example http://xxx.xxx.xxx.xxx:port/ucenter-api-merchant/api/user/address/update
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @body  json data 
	 * 			Content-Type: application/json;charset=UTF-8 
	 * 			格式:{"id":"id", "province":"省","city":"市","district":"区","address":"地址","zipCode":"邮编","consignee":"收货人","phone":"电话","status":"默认"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/update", method = RequestMethod.POST)
    @ResponseBody
    public Object update(
    		@RequestBody UserAddress address,
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		
		// 用户ID
		String userId = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			UserAddress old = userAddressFacade.getById(address.getId());
			if (old == null || !old.getUserNo().equals(userId))
			{
				throw new UserBizException(UserBizException.ADDRESS_NOT_EXIST, "地址不存在");
			}
			
			address.setVersion(old.getVersion());
			address.setUserNo(userId);
			userAddressFacade.update(address);
			
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		// 成功发送地址
		uiModel.put("address", address);
        return uiModel;
    }
	
	/**
	 * 删除地址.
	 * @example http://xxx.xxx.xxx.xxx:port/ucenter-api-merchant/api/user/address/delete/地址id
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param id 		
	 * 			地址id
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
    @ResponseBody
    public Object delete(
    		@PathVariable Integer id,
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		
		// 用户ID
		String userId = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			UserAddress old = userAddressFacade.getById(id);
			if (old == null || !old.getUserNo().equals(userId))
			{
				throw new UserBizException(UserBizException.ADDRESS_NOT_EXIST, "地址不存在");
			}
			
			userAddressFacade.deleteById(id);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		// 成功
		uiModel.put("id", id);
        return uiModel;
    }  
	
	/**
	 * 地址列表.
	 * @example http://xxx.xxx.xxx.xxx:port/ucenter-api-merchant/api/user/address/list/页数/每页多少个
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/list/{page}/{count}"}, method = RequestMethod.GET)
    @ResponseBody
    public Object listByStyle(
    		@PathVariable Integer page,
    		@PathVariable Integer count,
    		HttpServletRequest request,HttpServletResponse response) {  
		// 用户ID
		String userId = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
				
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("userNo", userId);
			pageBean = userAddressFacade.listPage(pageParam, params);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
				
		// 成功
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
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
