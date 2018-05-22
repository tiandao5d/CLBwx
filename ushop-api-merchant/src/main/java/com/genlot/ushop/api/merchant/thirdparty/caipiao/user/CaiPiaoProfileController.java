	package com.genlot.ushop.api.merchant.thirdparty.caipiao.user;

import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.oltu.oauth2.common.OAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import com.genlot.common.config.PublicConfig;
import com.genlot.common.enums.PlatformEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.utils.validate.ValidateUtils;
import com.genlot.common.web.file.FastDFSClient;
import com.genlot.ucenter.facade.account.entity.Account;
import com.genlot.ucenter.facade.account.entity.AccountFundType;
import com.genlot.ucenter.facade.account.entity.AccountHistory;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
import com.genlot.ucenter.facade.account.service.AccountFundTypeFacade;
import com.genlot.ucenter.facade.account.service.AccountManagementFacade;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.account.vo.StatisticsResultVO;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.promotion.entity.PromoterInfo;
import com.genlot.ucenter.facade.promotion.service.PromoterFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.UserBindRelation;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.entity.UserOperator;
import com.genlot.ucenter.facade.user.entity.UserTradePwd;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.ucenter.facade.user.service.UserTradePwdFacade;
import com.genlot.uplatform.facade.frontend.hotline.caipiao.service.CaiPiaoFacade;
import com.genlot.uplatform.facade.frontend.exceptions.FrontEndBizException;
import com.genlot.uplatform.facade.frontend.entity.ThirdPartyAccount;
import com.genlot.uplatform.facade.frontend.entity.ThirdPartyUser;
import com.genlot.ushop.facade.product.entity.SpellBuyProductRecord;


import com.genlot.ushop.facade.sns.entity.VipInfo;
import com.genlot.ushop.facade.sns.entity.VipLevel;
import com.genlot.ushop.facade.sns.enums.VipRewardTypeEnum;
import com.genlot.ushop.facade.sns.service.VipInfoFacade;
import com.genlot.ushop.facade.sns.service.VipLevelFacade;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;


@Controller
@RequestMapping(value = "/api/caipiao/user/profile")
public class CaiPiaoProfileController {
	
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;
	
	@Autowired
	private UserManagementFacade userManagementFacade;
	
	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private AccountQueryFacade accountQueryFacade;
	
	@Autowired
	private UserOperatorFacade userOperatorFacade;
	
	@Autowired
	private UserQueryFacade userQueryFacade;
		
	@Autowired
	private CaiPiaoFacade caiPiaoFacade;
	
	@Autowired
	private	UserBindRelationFacade userBindRelationFacade;
	
	@Autowired
	private AccountFundTypeFacade accountFundTypeFacade;
	
	@Autowired
	private	AccountManagementFacade accountManagementFacade;
	
	/**
	* 查询余额
	* @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/caipiao/user/profile/balance/get/货币类型
	* @error   {"error":"错误代号","error_description":"内容描述"}
	* @return
	*/
	@RequestMapping(value = {"/balance/get/{type}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getBalance(
	    		@PathVariable Long type,
	    		HttpServletRequest request,
	    		HttpServletResponse response) {	
		
		Map<String,Object> uiModel = new HashMap<String,Object>();
		String userNo = null;
		
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			// 根据货币验证是否是该平台的
			AccountFundType fundType = accountFundTypeFacade.getById(type.longValue());
			if (fundType == null || !fundType.getPlatformId().equals(PlatformEnum.CAIPIAO.getValue())) {
				throw AccountBizException.ACCOUNT_NOT_EXIT;
			}
			
			// 获得绑定关系
			UserBindRelation relation = userBindRelationFacade.getByUserNo(
					userNo, 
					fundType.getProvinceId(), 
					fundType.getPlatformId(),
					Integer.parseInt(fundType.getGameId()));
			if (relation == null) {
				throw UserBizException.USER_BIND_RELATION_IS_NOT_EXIST;
			}
			
			// 获得本地账号
			Account local = accountQueryFacade.getAccountByUserNo_fundType(userNo, type);
			if (local == null) {
				throw AccountBizException.ACCOUNT_NOT_EXIT;
			}
			
			// 然后调用平台接口进行查询
			ThirdPartyAccount remote = caiPiaoFacade.getAccount(
					relation.getLoginId(), 
					fundType.getProvinceId(), 
					fundType.getPlatformId(), 
					Integer.parseInt(fundType.getGameId()),
					Integer.parseInt(fundType.getParentId()));
						
			// 同步到本地账号
			local.setBalance(remote.getCash());
			accountManagementFacade.updateAccountInfo(local);
			uiModel.put("fundType", type);
			uiModel.put("balance", remote.getCash());
		}
		catch (Exception exception)
		{
			exception.printStackTrace();
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		
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
