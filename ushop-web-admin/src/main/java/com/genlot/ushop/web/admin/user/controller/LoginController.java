package com.genlot.ushop.web.admin.user.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.config.PublicConfig;
import com.genlot.common.enums.OpeStatusEnum;
import com.genlot.common.enums.OpeTypeEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.entity.PmsRole;
import com.genlot.ucenter.facade.pms.entity.PmsTreeNode;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.service.UserOperatorLogFacade;


@Controller
@RequestMapping("/user/login")
public class LoginController {

	private static final Logger log = LoggerFactory.getLogger(LoginController.class);
	
	@Autowired
	PmsFacade pmsFacade;
	
	@Autowired
	OAuthManagementFacade oauthManagementFacade;
	
	
	/**
	 * 获得服务器时间戳.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/new/user/timestamp
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 */
	@RequestMapping(value = {"/timestamp"}, method = RequestMethod.GET)
    @ResponseBody
    public Object getServerTimestamp(
    		HttpServletRequest request,
    		HttpServletResponse response) {		
			Map<String,Object> uiModel = new HashMap<String,Object>();
			long timestamp = 0L;
			try
			{
				// 获得服务器时间
				timestamp = oauthManagementFacade.getServerTimestamp();
			}
			catch (Exception exception)
			{
				log.error(exception.toString());
				setErrorMessage(exception,uiModel);
				return uiModel;
			}
			uiModel.put("timestamp", timestamp);
	        return uiModel;
	}
	
	
	@RequestMapping(value="/auth", method=RequestMethod.POST)
	@ResponseBody
	public  Object auth (HttpServletRequest request, String loginName, String loginPwd)
	{
		Map<String, Object> uiModel = new HashMap<String, Object>();
		
		PmsOperator pmsOperator = new PmsOperator();		
		pmsOperator.setLoginName(loginName);
		pmsOperator.setLoginPwd(loginPwd);
		AccessToken token = null;
		Long time = 0L;
		try{
			PmsOperator admin = pmsFacade.operatorLogin(pmsOperator);	
			//获得当前角色ID
			String roleId = pmsFacade.getRoleIdsByOperatorId(admin.getId());
			//获得该用户当前角色
			 PmsRole pmsRole = pmsFacade.getRoleById( Long.valueOf(roleId).longValue());
			
			 
			// 获得服务器时间
				time = oauthManagementFacade.getServerTimestamp();
				
			// 创建认证
				token = oauthManagementFacade.createAccessToken(time.toString(), loginName, admin.getId().toString());
				
				
			 
			// request.getSession().setAttribute("admin", admin);
			uiModel.put("admin", admin);
			uiModel.put("pmsRole", pmsRole);
			uiModel.put("time", time);
			uiModel.put("token", token);
			
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.LOGIN,
					PmsOperatorLogStatusEnum.SUCCESS, "用户登录", admin,
					WebUtils.getIpAddr(request));
			
			return uiModel;
		}
		catch(Exception e){
			setErrorMessage(e, uiModel);
			return uiModel;
		}
}
	
	//获得登录用户账号信息
	@RequestMapping(value="/getAdmin",method=RequestMethod.GET)
	@ResponseBody
	public Object getAdmin(
			HttpSession session)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		PmsOperator admin = (PmsOperator) session.getAttribute("admin");

		//获得当前角色ID
		String roleId = pmsFacade.getRoleIdsByOperatorId(admin.getId());
		//获得该用户当前角色
		 PmsRole pmsRole = pmsFacade.getRoleById( Long.valueOf(roleId).longValue());
		
		uiModel.put("admin",admin);
		uiModel.put("role",pmsRole);
		
		return uiModel;
	}
	
	
	/**
	 * 获得菜单权限.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/basic/getAuthority/operatorId
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param operatorId 
	 * 			当前用户ID
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/getAuthority"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getAuthority(
    	    long operatorId,
    	    //菜单类型
    	    String menuType,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		String roleId;
		PmsOperator pmsOperator;
		PmsRole pmsRole;
		PmsTreeNode lits;
		
		try
		{

		   //利用操作员ID获得当前操作员角色
			 roleId = pmsFacade.getRoleIdsByOperatorId(operatorId);
			//利用操作员ID获得当前操作员对象
			 pmsOperator = pmsFacade.getOperatorById(operatorId);
			 pmsRole = pmsFacade.getRoleById(Long.valueOf(roleId));
			 lits = pmsFacade.getMenuListByOperator(pmsOperator ,menuType);
			
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("pmsOperator", pmsOperator);
		uiModel.put("pmsRole", pmsRole);
		uiModel.put("lits", lits);
		
//		String json = JSON.toJSONString(uiModel);
//		
//		return json;
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
