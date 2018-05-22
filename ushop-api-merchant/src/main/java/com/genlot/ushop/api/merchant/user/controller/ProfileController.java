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
@RequestMapping(value = "/api/user/profile")
public class ProfileController {
	
public static final int ACTIVE = 100;
	
	private static final int IMAGE_MAX_WIDTH  = 200;
	private static final int IMAGE_MAX_HEIGHT = 200;
	private static final Logger log = LoggerFactory.getLogger(ProfileController.class);
	
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
	private QiniuCloudUtil qiniuCloutUtil;
	
	@Autowired
	private TaskEventProducer taskEventProducer;
	
	@Autowired
	private PromoterFacade promoterFacade;
	
	@Autowired
	private PromoterSubordinateFacade promoterSubordinateFacade;
	
	@Autowired
	private SMSFacade sMSFacade;
	
	@Autowired
	private	UserBindRelationFacade userBindRelationFacade;
	
	@Autowired
	private ExchangeRateFacade exchangeRateFacade;

	@Autowired
	private VipInfoCacheFacade vipInfoCacheFacade;
	
	@Autowired
	private UploadFileFacade uploadFileFacade;
		
	/**
	 * 更新信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/update
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param   请求参数 访问令牌.
	 * 			
	 * @param name 
	 * 			名称.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public Object update(
		@RequestBody(required=true) Map<String,Object> parMap,
  		HttpServletRequest request,
  		HttpServletResponse response) {
		// 用户ID
		String userNo = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			//name = new String(name.getBytes("ISO-8859-1"),"utf-8");
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			MemberInfo info = memberInfoFacade.getMemberByUserNo(userNo);
			UserInfo userInfo = userQueryFacade.getUserInfoByUserNo(userNo);
			if (parMap.get("address") != null) {
				info.setAddress(parMap.get("address").toString());
			}
			if (parMap.get("nickName") != null) {
				info.setNickName(parMap.get("nickName").toString());
			}
			if (parMap.get("age") != null) {
				info.setAge(parMap.get("age").toString());
			}
			if (parMap.get("sex") != null) {
				info.setSex(parMap.get("sex").toString());
			}
			if (parMap.get("cardNo") != null) {
				info.setCardNo(parMap.get("cardNo").toString());
				userInfo.setCardNo(parMap.get("cardNo").toString());
			}
			if (parMap.get("realName") != null) {
				info.setRealName(parMap.get("realName").toString());
				userInfo.setRealName(parMap.get("realName").toString());
			}
			
			userManagementFacade.updateUserInfo(userInfo);
			memberInfoFacade.update(info);
			
			if (info.getSex() 		!= null 		&&
				info.getAge() 		!= null 		&&
				info.getAddress() 	!= null 		&&
				info.getHeadImage() != null			&&
				!info.getSex().equals("") 			&&
				!info.getAge().equals("") 			&&
				!info.getAddress().equals("") 		&&
				!info.getHeadImage().equals(""))
			{
				taskEventProducer.sendEventTaskFinishing(
						userNo, 
						info.getMemberName(),
						null,
						info.getTelNo(),
						null, 
						TaskConditionTypeEnum.COMPLETE_PROFILE.getValue(), 
						0.0, 0.0, null);
			}
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		// 成功返回
		uiModel.put("userNo", userNo);
        return uiModel;
	}
	
	
	/**
	 * 设置密码.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/editPwd
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param   请求参数 访问令牌.
	 * @param file 
	 * 			文件.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/editPwd", method = RequestMethod.POST)
	@ResponseBody
	public Object editPwd(
			@RequestBody(required=true) Map<String,Object> parMap,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// 用户ID
		String userNo = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			String oldPwd = StringTools.stringToTrim(parMap.get("old").toString());
			String newPwd = StringTools.stringToTrim(parMap.get("new").toString());
			
			userOperatorFacade.changePwdByUserNo(userNo, newPwd, oldPwd);
			
			uiModel.put("userNo", userNo);
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
	 * 设置头像.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/setAvatar
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param   请求参数 访问令牌.
	 * @param file 
	 * 			文件.
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unused")
	@RequestMapping(value = "/setAvatar", method = RequestMethod.POST)
	@ResponseBody
	public Object setAvatar(
			String file,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// 用户ID
		String userNo = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			MemberInfo info = memberInfoFacade.getMemberByUserNo(userNo);
			
			List<String> tmpFiles = new ArrayList<String>(); 
			List<String> delFiles = new ArrayList<String>(); 
			
			if (!StringUtil.isEmpty(info.getHeadImage())) {
				delFiles.add(info.getHeadImage().substring(info.getHeadImage().lastIndexOf("/") + 1));
			}
			
			memberInfoFacade.updateHeadImage(userNo, file);
				
			file = file.substring(file.lastIndexOf("/") + 1);
			tmpFiles.add(file);
			uploadFileFacade.createAndDelete(
					Integer.valueOf(FileTypeEnum.IMAGE.getValue()), 
					Integer.valueOf(0), 
					delFiles, 
					new Date(), 
					tmpFiles);
			
			if (info.getSex() 		!= null 		&&
				info.getAge() 		!= null 		&&
				info.getAddress() 	!= null 		&&
				info.getHeadImage() != null 		&&
				!info.getSex().equals("") 			&&
				!info.getAge().equals("") 			&&
				!info.getAddress().equals("") 		&&
				!info.getHeadImage().equals(""))
			{
				taskEventProducer.sendEventTaskFinishing(
						userNo, 
						info.getMemberName(),
						null,
						info.getTelNo(),
						null, 
						TaskConditionTypeEnum.COMPLETE_PROFILE.getValue(), 
						0.0, 0.0, null);
			}
			
			// 成功返回
			uiModel.put("userNo", userNo);
			uiModel.put("headImage", file);
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
	 * 获得会员信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/get/用户id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userNo 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/get/{userNo}", method = RequestMethod.GET)
	@ResponseBody
	public Object get(
			@PathVariable String userNo,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			//获取基本用户信息，包括电话、昵称、头像、ID
			MemberInfo info = memberInfoFacade.getMemberByUserNo(userNo);
			
			//获得用户彩钻余额
			Account account = accountQueryFacade.getAccountByUserNo_fundType(userNo, Long.valueOf(AccountFundTypeEnum.RMB.getValue()));
			
			// VIP 等级
			//VipLevel vipLevel = vipLevelFacade.getLevel(userNo);
			
			// 推广员
			Integer promoterStatus = promoterFacade.getPromoterStatusByUserNo(userNo);
			
			// 被推广标志
			Integer subordinateStatus = promoterSubordinateFacade.getSubordinateStatusByUserNo(userNo);
			
			// 成功返回
			uiModel.put("userNo", userNo);
			uiModel.put("loginName", info.getMemberName());
			uiModel.put("telNo", null);
			if (ValidateUtils.isMobile(info.getTelNo())) {
				uiModel.put("telNo", info.getTelNo());
			}
			uiModel.put("nickName", info.getNickName());
			uiModel.put("headImage", info.getHeadImage());
			uiModel.put("diamond", account.getBalance());
			uiModel.put("address", info.getAddress());
			uiModel.put("age", info.getAge());
			uiModel.put("sex", info.getSex());
			//uiModel.put("vip", vipLevel);
			uiModel.put("promoter", null);
			uiModel.put("cardNo", info.getCardNo());
			uiModel.put("realName", info.getRealName());
			if (promoterStatus != null) {
				uiModel.put("promoter", promoterStatus);
			}
			if (subordinateStatus != null) {
				uiModel.put("subordinate", subordinateStatus);
			}
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
	 * 获得会员定位的信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/location/get
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userNo 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/location/get", method = RequestMethod.GET)
	@ResponseBody
	public Object getLocation(
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
						
			//获取基本用户信息，包括电话、昵称、头像、ID
			MemberInfo info = memberInfoFacade.getMemberByUserNo(userNo);
			
			// 成功返回
			uiModel.put("location", info.getLocation());
			
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
	 * 设置会员定位的信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/location/set/省份编号
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param province 
	 * 			省份编号.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/location/set/{province}", method = RequestMethod.POST)
	@ResponseBody
	public Object setLocation(
			@PathVariable Integer province,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
						
			//获取
			MemberInfo info = memberInfoFacade.getMemberByUserNo(userNo);
			info.setLocation(province.toString());
			memberInfoFacade.update(info);
			
			// 成功返回
			uiModel.put("location", info.getLocation());
			
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
	 * 会员绑定手机.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/bindPhone/手机号码/验证码
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userNo 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/bindPhone/{mobileNo}/{code}", method = RequestMethod.POST)
	@ResponseBody
	public Object bindPhone(
			@PathVariable String mobileNo,
			@PathVariable String code,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// 用户ID
		String userNo = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 用户名
			mobileNo = StringTools.stringToTrim(mobileNo); 
			// 验证号
			code = StringTools.stringToTrim(code); 
			// 验证
			sMSFacade.checkVerificationCode(mobileNo, SMSTypeEnum.USER_BIND_PHONE, code, 1);
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			// 判断是否已经判断手机
			UserInfo userInfo = userQueryFacade.getUserInfoByUserNo(userNo);
			if (ValidateUtils.isEmpty(userInfo)) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}
			if(userInfo.getBindMobileNo() != null || ValidateUtils.isMobile(userInfo.getBindMobileNo()))
			{
				throw new UserBizException(UserBizException.USERINFO_REPEAT_BINDMOBILENO, "重复绑定手机号");
			}
			
			// 判定手机
			userManagementFacade.bindMobileNo(userNo, mobileNo);	
			// 成功返回
			uiModel.put("userNo", userNo);
			uiModel.put("mobileNo", mobileNo);
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
	 * 会员绑定手机并且添加密码.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/bindPhone/手机号码/验证码/加密后密码
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userNo 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/bindPhonePassword/{mobileNo}/{code}/{password}", method = RequestMethod.POST)
	@ResponseBody
	public Object bindPhonePassword(
			@PathVariable String mobileNo,
			@PathVariable String code,
			@PathVariable String password,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// 用户ID
		String userNo = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 用户名
			mobileNo = StringTools.stringToTrim(mobileNo); 
			// 验证号
			code = StringTools.stringToTrim(code); 
			// 验证
			sMSFacade.checkVerificationCode(mobileNo, SMSTypeEnum.USER_BIND_PHONE, code, 1);
			
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			// 判断是否已经判断手机
			UserInfo userInfo = userQueryFacade.getUserInfoByUserNo(userNo);
			if (ValidateUtils.isEmpty(userInfo)) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}
			if(StringUtils.isBlank(userInfo.getBindMobileNo()) || !(ValidateUtils.isMobile(userInfo.getBindMobileNo())) )
			{
				// 判定手机
				userManagementFacade.bindMobileNoPassword(userNo, mobileNo, password);	
				// 成功返回
				uiModel.put("userNo", userNo);
				uiModel.put("mobileNo", mobileNo);
				
			}else{
				throw new UserBizException(UserBizException.USERINFO_REPEAT_BINDMOBILENO, "重复绑定手机号");
			}			
			
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
	 * 会员改变手机.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/changePhone/新手机号码/密码验证/验证码
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userNo 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/changePhone/{mobileNo}/{password}/{code}", method = RequestMethod.POST)
	@ResponseBody
	public Object changePhone(
			@PathVariable String mobileNo,
			@PathVariable String password,
			@PathVariable String code,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// 用户ID
		String userNo = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 手机号
			mobileNo = StringTools.stringToTrim(mobileNo); 
			// 密码
			password = StringTools.stringToTrim(password); 
			// 验证号
			code = StringTools.stringToTrim(code); 
			// 验证手机号码合法性
			if (!ValidateUtils.isMobile(mobileNo))
			{
				throw new UserBizException(UserBizException.LOGIN_NAME_ILLEGAL, "登录名不合法");
			}
			// 验证
			sMSFacade.checkVerificationCode(mobileNo, SMSTypeEnum.USER_CHANGE_PHONE, code, 1);
			
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			// 判断是否已经判断手机
			// 做登录验证
			UserInfo userInfo = userQueryFacade.getUserInfoByUserNo(userNo);
			// 验证用户是否重复绑定
			if (ValidateUtils.isEmpty(userInfo)) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}
			UserOperator userOperator = userOperatorFacade.getByLoginName(userInfo.getLoginName());
			if (ValidateUtils.isEmpty(userOperator)) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}
			if (!userOperator.getLoginPwd().equals(password))
			{
				throw UserBizException.LOGIN_PWD_ERROR;
			}
			
			// 判定手机
			userManagementFacade.bindMobileNo(userNo, mobileNo);	
			// 成功返回
			uiModel.put("userNo", userNo);
			uiModel.put("mobileNo", mobileNo);
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
	 * 获得所有VIP等级详情.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/listVipInfo
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 * 
	 * 
	 */
	@RequestMapping(value = "/listVipInfo", method = RequestMethod.GET)
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
	
	/**
	 * 获得对应平台是否已经关系账号.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/profile/getBindRelation/省份/平台
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param   请求参数 访问令牌.
	 * @param province 
	 * 			省份类型.
	 * @param platform 
	 * 			平台类型.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/getBindRelation/{province}/{platform}", method = RequestMethod.GET)
	@ResponseBody
	public Object getBindRelation(
			@PathVariable Integer province,
			@PathVariable Integer platform,
	  		HttpServletRequest request,
	  		HttpServletResponse response)
	{
		// 用户ID
		String userNo = null;
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
									
			UserBindRelation relation = userBindRelationFacade.getByUserNo(userNo, province, platform, 0);
			if (relation != null && !relation.getRelationUserNo().equals(userNo)) {
				relation = null;
			}
			uiModel.put("userNo", userNo);
			uiModel.put("relation", null);
			if (relation != null) {
				uiModel.put("relation", relation.getLoginId());
			}
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
