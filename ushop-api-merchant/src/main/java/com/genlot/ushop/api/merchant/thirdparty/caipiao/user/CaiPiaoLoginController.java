package com.genlot.ushop.api.merchant.thirdparty.caipiao.user;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.UnknownAccountException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.config.PublicConfig;
import com.genlot.common.enums.PlatformEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.utils.validate.ValidateUtils;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.UserBindRelation;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.entity.UserOperator;
import com.genlot.ucenter.facade.user.enums.UserStatusEnum;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.uplatform.facade.frontend.hotline.caipiao.service.CaiPiaoFacade;
import com.genlot.uplatform.facade.frontend.exceptions.FrontEndBizException;
import com.genlot.uplatform.facade.frontend.entity.ThirdPartyUser;


@Controller
@RequestMapping(value = "/api/caipiao/user/login")
public class CaiPiaoLoginController {
	
	
	private static final Logger log = LoggerFactory.getLogger(CaiPiaoLoginController.class);
	
	@Autowired
	private UserManagementFacade userManagementFacade;
	
	@Autowired
	private UserQueryFacade userQueryFacade;
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;
	
	@Autowired
	private UserOperatorFacade userOperatorFacade;
	
	@Autowired
	private CaiPiaoFacade caiPiaoFacade;
	
	@Autowired
	private	UserBindRelationFacade userBindRelationFacade;

	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	/**
	 * 授权登录
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/caipiao/user/login/auth/省份/平台/游戏id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return
	 */
	@RequestMapping(value = {"/auth/{province}/{platform}/{game}"}, method = RequestMethod.POST)
    @ResponseBody
    public Object auth(
    		@PathVariable Integer province,
    		@PathVariable Integer platform,
    		@PathVariable Integer game,
    		HttpServletRequest request,
    		HttpServletResponse response) {		
			Map<String,Object> uiModel = new HashMap<String,Object>();
			String userNo = null;
			try
			{
				// 由于前面有拦截器，已经确定判断这个访问
				userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
				
				// 热线登录
				ThirdPartyUser remoteUser = caiPiaoFacade.auth(
						userNo, 
						province, 
						PlatformEnum.CAIPIAO.getValue(),
						game);
				
				// 判断是否已经绑定
				UserBindRelation relation = userBindRelationFacade.getByPlatform(
						remoteUser.getLoginId(), 
						province, 
						PlatformEnum.CAIPIAO.getValue(),
						game);
				
				if(relation == null)
				{
					//获取
//					MemberInfo info = memberInfoFacade.getMemberByUserNo(userNo);
//					if (!info.getLocation().equals(province)) {
//						throw FrontEndBizException.FRONTEND_ERROR_TICKET_PROVINCE;
//					}
						
					userNo = userManagementFacade.bindThirdPartyMember(
							PublicConfig.APP_ID,
							userNo,
							remoteUser.getLoginId(), 
							remoteUser.getLoginId(), 
							remoteUser.getRealName(), 
							remoteUser.getCardNo(), 
							remoteUser.getPhone(), 
							remoteUser.getLoginId(), 
							remoteUser.getLastLoginTime(), 
							remoteUser.getLastSession(), 
							province, 
							PlatformEnum.CAIPIAO.getValue(),
							game);			
				}
			}
			catch (Exception exception)
			{
				exception.printStackTrace();
				setErrorMessage(exception,uiModel);
				return uiModel;
			}
			uiModel.put("result", 1);
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
