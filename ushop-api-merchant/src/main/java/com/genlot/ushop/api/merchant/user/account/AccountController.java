package com.genlot.ushop.api.merchant.user.account;

import java.awt.image.BufferedImage;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
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
import org.springframework.web.multipart.MultipartFile;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.string.StringTools;
import com.genlot.common.utils.string.StringUtil;
import com.genlot.common.utils.validate.ValidateUtils;
import com.genlot.common.web.file.MyPutRet;
import com.genlot.common.web.file.QiniuCloudUtil;
import com.genlot.ucenter.facade.account.entity.Account;
import com.genlot.ucenter.facade.account.entity.AccountFundType;
import com.genlot.ucenter.facade.account.entity.AccountHistory;
import com.genlot.ucenter.facade.account.entity.ExchangeRate;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.service.AccountFundTypeFacade;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.account.service.ExchangeRateFacade;
import com.genlot.ucenter.facade.account.vo.StatisticsResultVO;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.promotion.exceptions.PromotionBizException;
import com.genlot.ucenter.facade.promotion.service.PromoterFacade;
import com.genlot.ucenter.facade.promotion.service.PromoterSubordinateFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.UserBindRelation;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.entity.UserOperator;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.ushop.facade.sms.enums.SMSTypeEnum;
import com.genlot.ushop.facade.sms.service.SMSFacade;
import com.genlot.ushop.facade.sns.entity.VipInfo;
import com.genlot.ushop.facade.sns.entity.VipLevel;
import com.genlot.ushop.facade.sns.service.VipInfoCacheFacade;
import com.genlot.ushop.facade.sns.service.VipInfoFacade;
import com.genlot.ushop.facade.sns.service.VipLevelFacade;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;


@Controller
@RequestMapping(value = "/api/user/account")
public class AccountController {
	
	private static final Logger log = LoggerFactory.getLogger(AccountController.class);
	
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
	private	UserBindRelationFacade userBindRelationFacade;
	
	@Autowired
	private ExchangeRateFacade exchangeRateFacade;
	
	@Autowired
	private AccountFundTypeFacade accountFundTypeFacade;
		
	/**
	 * 获得账号余额.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/account/balance/get
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param 用户id 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/balance/get/{fundType}", method = RequestMethod.GET)
	@ResponseBody
	public Object getBalance(
			@PathVariable Long fundType,
	  		HttpServletRequest request,
	  		HttpServletResponse response) {
		// 用户ID
		String userNo = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);		
			Account balance = accountQueryFacade.getAccountByUserNo_fundType(userNo, fundType);
			if (balance != null) {
				uiModel.put("balance", balance.getBalance());
			}	
			uiModel.put("userNo", userNo);
			uiModel.put("fundType", fundType);
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
	 * 获得账号类型.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/account/type/get
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param 用户id 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/type/{fundType}", method = RequestMethod.GET)
	@ResponseBody
	public Object getType(
			@PathVariable Long fundType,
	  		HttpServletRequest request,
	  		HttpServletResponse response) {
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try	{
			// 由于前面有拦截器，已经确定判断这个访问
			AccountFundType entity = accountFundTypeFacade.getById(fundType);
			uiModel.put("fundType", entity);
		}
		catch (Exception exception) {
			log.error(exception.toString());
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
