package com.genlot.ushop.api.merchant.user.controller;

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
import com.genlot.ucenter.facade.account.entity.AccountHistory;
import com.genlot.ucenter.facade.account.entity.ExchangeRate;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
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
@RequestMapping(value = "/api/user/vip")
public class VIPController {
	
public static final int ACTIVE = 100;

	private static final Logger log = LoggerFactory.getLogger(VIPController.class);
	
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
	private VipLevelFacade vipLevelFacade;
	
	@Autowired
	private VipInfoFacade vipInfoFacade;
	
	@Autowired
	private VipInfoCacheFacade vipInfoCacheFacade;

	/**
	 * 获得所有VIP等级详情.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/listVipInfo
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 * 
	 * 
	 */
	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listVipInfo(
			HttpServletRequest request,
	  		HttpServletResponse response) {
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 获得VIP的全部等级信息
			List<VipInfo> recordList = vipInfoCacheFacade.listVipInfo(null);
			
			// 成功返回
			uiModel.put("recordList", recordList);
		}
		catch (Exception exception)
		{
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
