//package com.genlot.ushop.api.merchant.thirdparty.caipiao2.user.controller;
//
//import java.util.HashMap;
//import java.util.Map;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//
//import org.apache.shiro.authc.SimpleAuthenticationInfo;
//import org.apache.shiro.authc.UnknownAccountException;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Controller;
//import org.springframework.ui.Model;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestMethod;
//import org.springframework.web.bind.annotation.ResponseBody;
//
//import com.genlot.common.config.PublicConfig;
//import com.genlot.common.enums.PlatformEnum;
//import com.genlot.common.exceptions.BizException;
//import com.genlot.common.utils.string.StringTools;
//import com.genlot.common.utils.validate.ValidateUtils;
//import com.genlot.ucenter.facade.oauth.entity.AccessToken;
//import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
//import com.genlot.ucenter.facade.user.entity.MemberInfo;
//import com.genlot.ucenter.facade.user.entity.UserBindRelation;
//import com.genlot.ucenter.facade.user.entity.UserInfo;
//import com.genlot.ucenter.facade.user.entity.UserOperator;
//import com.genlot.ucenter.facade.user.enums.UserStatusEnum;
//import com.genlot.ucenter.facade.user.exceptions.UserBizException;
//import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
//import com.genlot.ucenter.facade.user.service.UserManagementFacade;
//import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
//import com.genlot.ucenter.facade.user.service.UserQueryFacade;
//import com.genlot.uplatform.facade.frontend.exceptions.FrontEndBizException;
//import com.genlot.uplatform.facade.frontend.entity.ThirdPartyUser;
//import com.genlot.uplatform.facade.frontend.hotline.caipiao2.service.CaiPiao2Facade;
//
//
//
//@Controller
//@RequestMapping(value = "/api/caipiao2/user/login")
//public class CaiPiao2LoginController {
//	
//	
//	private static final Logger log = LoggerFactory.getLogger(CaiPiao2LoginController.class);
//	
//	@Autowired
//	private UserManagementFacade userManagementFacade;
//	
//	@Autowired
//	private UserQueryFacade userQueryFacade;
//	
//	@Autowired
//	private OAuthManagementFacade oauthManagementFacade;
//	
//	@Autowired
//	private UserOperatorFacade userOperatorFacade;
//	
//	@Autowired
//	private CaiPiao2Facade caiPiao2Facade;
//	
//	@Autowired
//	private	UserBindRelationFacade userBindRelationFacade;
//
//	
//	
//	/**
//	 * 账户验证
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/jikaipiao/user/login/check
//	 * @error   {"error":"错误代号","error_description":"内容描述"}
//	 * @return
//	 */
//	@RequestMapping(value = {"/check"}, method = RequestMethod.POST)
//    @ResponseBody
//    public Object check(
//    		HttpServletRequest request,
//    		HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();
//		try
//		{
//			
//			String loginName = request.getParameter("loginName");
//			String password = request.getParameter("password");
//			if (loginName == null || password == null) {
//				throw FrontEndBizException.FRONTEND_ERROR_LOGIN_PASSWOD;
//			}
//			Integer province = null;
//			if (request.getParameter("province") == null) {
//				throw FrontEndBizException.FRONTEND_ERROR_LOGIN_PASSWOD;
//			}
//			province = Integer.parseInt(request.getParameter("province"));
//			// 用户名
//			loginName = StringTools.stringToTrim(loginName); 
//			password = StringTools.stringToTrim(password); 
//			// 热线登录
//			ThirdPartyUser remoteUser = caiPiao2Facade.auth(
//					loginName, 
//					password, 
//					province, 
//					PlatformEnum.CAIPIAO2.getValue());
//			// 判断是否已经在本平台绑定过
//			UserBindRelation relation1 = userBindRelationFacade.getByPlatform(
//					remoteUser.getLoginId(), 
//					province, 
//					PlatformEnum.CAIPIAO2.getValue(),
//					0);
//			
//			uiModel.put("loginName", loginName);
//			uiModel.put("loginId", remoteUser.getLoginId());
//			if (relation1!= null) {
//				uiModel.put("relation1", relation1.getRelationUserNo());
//			}
//			
//			String userNo = request.getParameter("userNo");
//			if (userNo == null) {
//				// 判断是否已经在本平台绑定过
//				UserBindRelation relation2 = userBindRelationFacade.getByUserNo(
//						userNo, 
//						province, 
//						PlatformEnum.CAIPIAO2.getValue(),
//						0);
//				if (relation2!= null) {
//					uiModel.put("relation2", relation1.getLoginId());
//				}
//			}
//		}
//		catch (Exception exception)
//		{
//			exception.printStackTrace();
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		
//        return uiModel;
//		
//	}
//	
//	
//	/**
//	 * 授权登录
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/jikaipiao/user/login/auth/省份/用户名字/登录密码(密文)
//	 * @error   {"error":"错误代号","error_description":"内容描述"}
//	 * @return
//	 */
//	@RequestMapping(value = {"/auth/{province}/{loginName}/{password}"}, method = RequestMethod.POST)
//    @ResponseBody
//    public Object auth(
//    		@PathVariable Integer province,
//    		@PathVariable String loginName,
//    		@PathVariable String password,
//    		HttpServletRequest request,
//    		HttpServletResponse response) {		
//			Map<String,Object> uiModel = new HashMap<String,Object>();
//			AccessToken token = null;
//			String userNo = null;
//			long time = 0L;
//			try
//			{
//				// 用户名
//				loginName = StringTools.stringToTrim(loginName); 
//				password = StringTools.stringToTrim(password); 
//				
//				// 热线登录
//				ThirdPartyUser remoteUser = caiPiao2Facade.auth(
//						loginName, 
//						password, 
//						province, 
//						PlatformEnum.CAIPIAO2.getValue());
//				
//				// 判断是否已经绑定
//				UserBindRelation relation = userBindRelationFacade.getByPlatform(
//						remoteUser.getLoginId(), 
//						province, 
//						PlatformEnum.CAIPIAO2.getValue(),
//						0);	
//				
//				if(relation == null)
//				{
//					userNo = userManagementFacade.registerThirdPartyMember(
//							PublicConfig.APP_ID,
//							loginName, 
//							password, 
//							loginName, 
//							remoteUser.getCardNo(), 
//							loginName, 
//							null,
//							null,
//							remoteUser.getLoginId(), 
//							remoteUser.getLastLoginTime(), 
//							remoteUser.getLastSession(), 
//							null,
//							province.toString(),
//							null,
//							province, 
//							PlatformEnum.CAIPIAO2.getValue(),
//							null);
//				}
//				else
//				{
//					userNo = relation.getRelationUserNo();
//					userManagementFacade.memberLogin(userNo);
//				}
//
//				// 创建认证
//				token = oauthManagementFacade.createAccessToken(PublicConfig.APP_ID, loginName, userNo);
//				
//				// 获得服务器时间
//				time = oauthManagementFacade.getServerTimestamp();
//			}
//			catch (Exception exception)
//			{
//				exception.printStackTrace();
//				setErrorMessage(exception,uiModel);
//				return uiModel;
//			}
//			uiModel.put("userId", userNo);
//			uiModel.put("token", token.getTokenId());
//			uiModel.put("timestamp", time);
//	        return uiModel;
//	}
//	
//	
//	protected void setErrorMessage(Exception exception, Map<String,Object> uiModel)
//	{
//		uiModel.clear();
//		if (exception instanceof BizException)
//		{
//			BizException e = (BizException)exception;
//			uiModel.put("error", e.getCode());
//			uiModel.put("error_description", e.getMsg());
//		}
//		else
//		{
//			uiModel.put("error", 0);
//			uiModel.put("error_description", "unknown error");
//		}
//	}
//	
//	
//}
