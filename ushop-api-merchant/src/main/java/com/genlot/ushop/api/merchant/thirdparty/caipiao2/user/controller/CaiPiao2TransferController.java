//	package com.genlot.ushop.api.merchant.thirdparty.caipiao2.user.controller;
//
//import java.awt.image.BufferedImage;
//import java.util.ArrayList;
//import java.util.Date;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//import javax.imageio.ImageIO;
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//
//import org.apache.oltu.oauth2.common.OAuth;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.ApplicationEvent;
//import org.springframework.context.ApplicationEventPublisher;
//import org.springframework.context.ApplicationEventPublisherAware;
//import org.springframework.context.ApplicationListener;
//import org.springframework.scheduling.annotation.Async;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestMethod;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.ResponseBody;
//import org.springframework.web.multipart.commons.CommonsMultipartFile;
//
//import com.genlot.common.config.PublicConfig;
//import com.genlot.common.enums.PlatformEnum;
//import com.genlot.common.exceptions.BizException;
//import com.genlot.common.message.task.component.TaskEventProducer;
//import com.genlot.common.page.PageBean;
//import com.genlot.common.page.PageParam;
//import com.genlot.common.utils.DateUtils;
//import com.genlot.common.utils.string.StringTools;
//import com.genlot.common.utils.validate.ValidateUtils;
//import com.genlot.common.web.file.FastDFSClient;
//import com.genlot.ucenter.facade.account.entity.Account;
//import com.genlot.ucenter.facade.account.entity.AccountFundType;
//import com.genlot.ucenter.facade.account.entity.AccountHistory;
//import com.genlot.ucenter.facade.account.entity.ExchangeRate;
//import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
//import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
//import com.genlot.ucenter.facade.account.service.AccountFundTypeFacade;
//import com.genlot.ucenter.facade.account.service.AccountManagementFacade;
//import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
//import com.genlot.ucenter.facade.account.service.AccountTransferFacade;
//import com.genlot.ucenter.facade.account.service.ExchangeRateFacade;
//import com.genlot.ucenter.facade.account.vo.StatisticsResultVO;
//import com.genlot.ucenter.facade.oauth.entity.AccessToken;
//import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
//import com.genlot.ucenter.facade.promotion.entity.PromoterInfo;
//import com.genlot.ucenter.facade.promotion.service.PromoterFacade;
//import com.genlot.ucenter.facade.user.entity.MemberInfo;
//import com.genlot.ucenter.facade.user.entity.UserBindRelation;
//import com.genlot.ucenter.facade.user.entity.UserInfo;
//import com.genlot.ucenter.facade.user.entity.UserOperator;
//import com.genlot.ucenter.facade.user.entity.UserTradePwd;
//import com.genlot.ucenter.facade.user.exceptions.UserBizException;
//import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
//import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
//import com.genlot.ucenter.facade.user.service.UserManagementFacade;
//import com.genlot.ucenter.facade.user.service.UserOperatorFacade;
//import com.genlot.ucenter.facade.user.service.UserQueryFacade;
//import com.genlot.ucenter.facade.user.service.UserTradePwdFacade;
//import com.genlot.ucenter.facade.account.enums.AccountTradeTypeEnum;
//import com.genlot.ucenter.facade.account.entity.AccountTransferOrder;
//import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
//import com.genlot.ucenter.facade.account.enums.AccountTransferStatusEnum;
//import com.genlot.uplatform.facade.frontend.hotline.caipiao2.service.CaiPiao2Facade;
//import com.genlot.ushop.api.merchant.thirdparty.caipiao2.action.entity.CaiPiao2TransferAction;
//import com.genlot.ushop.api.merchant.thirdparty.caipiao2.entity.CaiPiao2Param;
//import com.genlot.ushop.facade.product.entity.SpellBuyProductRecord;
//import com.genlot.ushop.facade.sns.entity.VipInfo;
//import com.genlot.ushop.facade.sns.entity.VipLevel;
//import com.genlot.ushop.facade.sns.enums.VipRewardTypeEnum;
//import com.genlot.ushop.facade.sns.service.VipInfoFacade;
//import com.genlot.ushop.facade.sns.service.VipLevelFacade;
//import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;
//
//
//@Controller
//@RequestMapping(value = "/api/caipiao2/user/transfer")
//public class CaiPiao2TransferController implements ApplicationEventPublisherAware{
//	
//	private static final Logger log = LoggerFactory.getLogger(CaiPiao2TransferController.class);
//			
//	private ApplicationEventPublisher applicationEventPublisher;
//			
//	@Autowired
//	private OAuthManagementFacade oauthManagementFacade;
//	
//	@Autowired
//	private UserManagementFacade userManagementFacade;
//	
//	@Autowired
//	private MemberInfoFacade memberInfoFacade;
//	
//	@Autowired
//	private AccountQueryFacade accountQueryFacade;
//	
//	@Autowired
//	private UserOperatorFacade userOperatorFacade;
//	
//	@Autowired
//	private UserQueryFacade userQueryFacade;
//		
//	@Autowired
//	private CaiPiao2Facade caiPiao2Facade;
//	
//	@Autowired
//	private	UserBindRelationFacade userBindRelationFacade;
//	
//	@Autowired
//	private AccountFundTypeFacade accountFundTypeFacade;
//	
//	@Autowired
//	private	AccountManagementFacade accountManagementFacade;
//	
//	@Autowired
//	private ExchangeRateFacade exchangeRateFacade;
//	
//	@Autowired
//	private AccountTransferFacade accountTransferFacade;
//	
//	@Autowired
//	private CaiPiao2Param caiPiao2Param;
//	
//	
//	
//	@Override
//	public void setApplicationEventPublisher(
//			ApplicationEventPublisher applicationEventPublisher)
//	{
//		this.applicationEventPublisher = applicationEventPublisher;
//	}
//
//	public void sendActionTransfer(String trxNo)
//	{
//		CaiPiao2TransferAction action = new CaiPiao2TransferAction(this);
//		action.setTrxNo(trxNo);
//		applicationEventPublisher.publishEvent(action);
//	}
//
//	/**
//	* 兑换
//	* @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/jikaipiao/user/transfer/submit/来源/目标/金额
//	* @error   {"error":"错误代号","error_description":"内容描述"}
//	* @return
//	*/
//	@RequestMapping(value = {"/submit/{fromFundType}/{toFundType}/{money}"}, method = RequestMethod.POST)
//	@ResponseBody
//	public Object submit(
//	    		@PathVariable Long fromFundType,
//	    		@PathVariable Long toFundType,
//	    		@PathVariable Integer money,
//	    		HttpServletRequest request,
//	    		HttpServletResponse response) {		
//		
//		Map<String,Object> uiModel = new HashMap<String,Object>();
//		String userNo = null;
//		
//		try
//		{
//			// 由于前面有拦截器，已经确定判断这个访问
//			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
//			
//			// 转账的必要条件
//			// 1.存在兑换率
//			// 2.转账逻辑
//			//   a.本地账户 ->  即开账户
//			//   b.即开账户 <-  本地账户
//			//   c.即开账户 <-> 即开账户(必须是同省份)
//			// 3.是否绑定了该平台
//			// 4.必须账户都属于同一个人
//		
//			// 汇率
//			ExchangeRate rate = exchangeRateFacade.getBy(fromFundType, toFundType);
//			if (rate == null) {
//				throw AccountBizException.ACCOUNT_TRANSFER_ERROR;
//			}
//			
//			if (money <= 0.0f || rate.getRate() <= 0.0f)
//			{
//				throw AccountBizException.ACCOUNT_TRANSFER_AMOUNT_ERROR;
//			}
//			
//			// 货币类型
//			AccountFundType sourceFundType = accountFundTypeFacade.getById(fromFundType);
//			AccountFundType targetFundType = accountFundTypeFacade.getById(toFundType);
//			if (sourceFundType == null || targetFundType == null) {
//				throw AccountBizException.ACCOUNT_NOT_EXIT;
//			}
//			Integer province = 0;
//			Integer platform = PlatformEnum.CAIPIAO2.getValue();
//			Integer type     = 0;
//			if (sourceFundType.getPlatformId().equals(PlatformEnum.CAIPIAO2.getValue()) &&
//				targetFundType.getPlatformId().equals(PlatformEnum.CAIPIAO2.getValue())) {
//				if (!sourceFundType.getProvinceId().equals(targetFundType.getProvinceId())) {
//					throw AccountBizException.ACCOUNT_TRANSFER_ERROR;
//				}		
//				province = sourceFundType.getProvinceId();
//				type     = AccountTradeTypeEnum.ACCOUNT_TRANSFER.getValue();
//			}
//				
//			if (sourceFundType.getPlatformId().equals(PlatformEnum.CAIPIAO2.getValue())  &&
//				!targetFundType.getPlatformId().equals(PlatformEnum.CAIPIAO2.getValue()) &&
//				targetFundType.getAgent().equals(0) 									  &&
//				sourceFundType.getAgent().equals(1)) {
//				type 	 = AccountTradeTypeEnum.ACCOUNT_DEPOSIT.getValue();
//				province = sourceFundType.getProvinceId();
//			}
//			
//			if (!sourceFundType.getPlatformId().equals(PlatformEnum.CAIPIAO2.getValue()) &&
//				targetFundType.getPlatformId().equals(PlatformEnum.CAIPIAO2.getValue())  &&
//				targetFundType.getAgent().equals(1) 									  &&
//				sourceFundType.getAgent().equals(0)) {
//				type 	 = AccountTradeTypeEnum.ATM.getValue();
//				province = targetFundType.getProvinceId();
//			}
//			
//			if (type == 0) {
//				throw AccountBizException.ACCOUNT_TRANSFER_ERROR;
//			}
//			
//			// 获得绑定关系
//			UserBindRelation relation = userBindRelationFacade.getByUserNo(
//					userNo, 
//					province, 
//					platform,
//					0);
//			if (relation == null) {
//				throw UserBizException.USER_BIND_RELATION_IS_NOT_EXIST;
//			}
//			
//			// 获得本地账号
//			Account source = accountQueryFacade.getAccountByUserNo_fundType(userNo, fromFundType.intValue());
//			Account target = accountQueryFacade.getAccountByUserNo_fundType(userNo, toFundType.intValue());
//			if (source == null || target == null) {
//				throw AccountBizException.ACCOUNT_NOT_EXIT;
//			}
//			
//			// 本地先验证
//			if(source.getBalance() < money) {
//				throw AccountBizException.ACCOUNT_AVAILABLEBALANCE_IS_NOT_ENOUGH;
//			}
//			// 需要转换后也是整数
//			if (source.getBalance() * rate.getRate() < 1.0f) {
//				throw AccountBizException.ACCOUNT_AVAILABLEBALANCE_IS_NOT_ENOUGH;
//			}
//			
//			AccountTransferOrder order = new AccountTransferOrder();
//			order.setTrxNo(accountTransferFacade.buildTrxNo());
//			order.setSourceFund(fromFundType.intValue());
//			order.setTargetFund(toFundType.intValue());
//			order.setTargetUserNo(userNo);
//			order.setSourceUserNo(userNo);
//			order.setTargetAgentUserNo(relation.getLoginId());
//			order.setSourceAgentUserNo(relation.getLoginId());
//			order.setRate(rate.getRate());
//			order.setStatus(AccountTransferStatusEnum.CREATED.getValue());
//			order.setAmount(money.doubleValue());
//			
//			if (type.equals(AccountTradeTypeEnum.ACCOUNT_DEPOSIT.getValue())) {
//				order.setUrl(caiPiao2Param.getDepositReturnUrl());
//				order.setTrxType(AccountTradeTypeEnum.ACCOUNT_DEPOSIT.getValue());
//				order.setRemark(AccountTradeTypeEnum.ACCOUNT_DEPOSIT.getDesc());	
//				order.setFundDirection(AccountFundDirectionEnum.ADD.getValue());
//			}
//			else if (type.equals(AccountTradeTypeEnum.ATM.getValue())) {
//				order.setUrl(caiPiao2Param.getWithdrawReturnUrl());
//				order.setTrxType(AccountTradeTypeEnum.ATM.getValue());
//				order.setRemark(AccountTradeTypeEnum.ATM.getDesc());	
//				order.setFundDirection(AccountFundDirectionEnum.SUB.getValue());
//			}
//			else if (type.equals(AccountTradeTypeEnum.ACCOUNT_TRANSFER.getValue())) {
//				order.setUrl(caiPiao2Param.getExchangeReturnUrl());
//				order.setTrxType(AccountTradeTypeEnum.ACCOUNT_TRANSFER.getValue());
//				order.setRemark(AccountTradeTypeEnum.ACCOUNT_TRANSFER.getDesc());	
//				order.setFundDirection(AccountFundDirectionEnum.EXCHANGE.getValue());
//			}
//			else {
//				throw AccountBizException.ACCOUNT_TRANSFER_ERROR;
//			}			
//			
//			// 创建订单
//			accountTransferFacade.create(order);
//			
//			// 异步执行,执行完毕再行通知
//			sendActionTransfer(order.getTrxNo());
//			
//			// 返回转账流水号
//			uiModel.put("trxNo", order.getTrxNo());
//			uiModel.put("status", AccountTransferStatusEnum.CREATED.getValue());
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
//	* 兑换订单查询
//	* @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/jikaipiao/user/transfer/status/get/流水号
//	* @error   {"error":"错误代号","error_description":"内容描述"}
//	* @return
//	*/
//	@RequestMapping(value = {"/status/get/{trxNo}"}, method = RequestMethod.GET)
//	@ResponseBody
//	public Object getStatus(
//		    		@PathVariable String trxNo,
//		    		HttpServletRequest request,
//		    		HttpServletResponse response) {		
//		
//		Map<String,Object> uiModel = new HashMap<String,Object>();
//		String userNo = null;
//		
//		try
//		{
//			// 由于前面有拦截器，已经确定判断这个访问
//			userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
//			
//			// 获得订单
//			AccountTransferOrder order = accountTransferFacade.getByTrxNo(trxNo);
//			
//			// 返回转账流水号
//			uiModel.put("trxNo", order.getTrxNo());
//			uiModel.put("status", order.getStatus());
//		}
//		catch (Exception exception)
//		{
//			exception.printStackTrace();
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}
//		
//        return uiModel;
//	}
//	
//	/**
//	 * 兑换回调.
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/jikaipiao/user/transfer/depositCallback
//	 * @param   
//	 * @error   {"error":"错误代号","error_description":"内容描述"}
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = "/depositCallback",method = RequestMethod.POST)
//	@ResponseBody
//	public void depositCallback(
//			HttpServletRequest request, 
//			HttpServletResponse response) 
//	{
//		Map<String, String[]> params = request.getParameterMap();  
//	    String queryString = "";  
//	    for (String key : params.keySet()) {
//	    	String[] values = params.get(key);
//	    	for (int i = 0; i < values.length; i++) {
//	    		String value = values[i];
//	    		queryString += key + "=" + value + "&";  
//	        }  
//	    }
//	    if (queryString.isEmpty())
//	    {
//	    	log.info("JiKaiPiao deposit illegal call back: POST " + request.getRequestURL() + " " + queryString);  
//	    }
//	    
//	    queryString = queryString.substring(0, queryString.length() - 1);  
//	    log.info("JiKaiPiao deposit call back: POST " + request.getRequestURL() + " " + queryString);  
//	    		
//	    String trxNo     = request.getParameter("trxNo");
//	    String requestNo = request.getParameter("requestNo");
//	
//	    accountTransferFacade.transferCompleted(requestNo,trxNo,1);
//	}
//	
//	/**
//	 * 兑换回调.
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/jikaipiao/user/transfer/withdrawCallback
//	 * @param   
//	 * @error   {"error":"错误代号","error_description":"内容描述"}
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = "/withdrawCallback",method = RequestMethod.POST)
//	@ResponseBody
//	public void withdrawCallback(
//			HttpServletRequest request, 
//			HttpServletResponse response) 
//	{
//		Map<String, String[]> params = request.getParameterMap();  
//	    String queryString = "";  
//	    for (String key : params.keySet()) {
//	    	String[] values = params.get(key);
//	    	for (int i = 0; i < values.length; i++) {
//	    		String value = values[i];
//	    		queryString += key + "=" + value + "&";  
//	        }  
//	    }
//	    if (queryString.isEmpty())
//	    {
//	    	log.info("JiKaiPiao withdraw illegal call back: POST " + request.getRequestURL() + " " + queryString);  
//	    }
//	    
//	    queryString = queryString.substring(0, queryString.length() - 1);  
//	    log.info("JiKaiPiao withdraw call back: POST " + request.getRequestURL() + " " + queryString);  
//	    		
//	    String trxNo     = request.getParameter("trxNo");
//	    String requestNo = request.getParameter("requestNo");
//	
//	    accountTransferFacade.transferCompleted(requestNo,trxNo,2);
//	}
//	
//	
//	/**
//	 * 兑换回调.
//	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/jikaipiao/user/transfer/exchangeCallback
//	 * @param   
//	 * @error   {"error":"错误代号","error_description":"内容描述"}
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = "/exchangeCallback",method = RequestMethod.POST)
//	@ResponseBody
//	public void dinpay(
//			HttpServletRequest request, 
//			HttpServletResponse response) 
//	{
//		Map<String, String[]> params = request.getParameterMap();  
//	    String queryString = "";  
//	    for (String key : params.keySet()) {
//	    	String[] values = params.get(key);
//	    	for (int i = 0; i < values.length; i++) {
//	    		String value = values[i];
//	    		queryString += key + "=" + value + "&";  
//	        }  
//	    }
//	    if (queryString.isEmpty())
//	    {
//	    	log.info("JiKaiPiao exchange illegal call back: POST " + request.getRequestURL() + " " + queryString);  
//	    }
//	    
//	    queryString = queryString.substring(0, queryString.length() - 1);  
//	    log.info("JiKaiPiao exchange call back: POST " + request.getRequestURL() + " " + queryString);  
//	    
//	    String trxNo     = request.getParameter("trxNo");
//	    String requestNo = request.getParameter("requestNo");
//	
//	    accountTransferFacade.transferCompleted(requestNo,trxNo,4);
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
//
//
//	
//	
//}
