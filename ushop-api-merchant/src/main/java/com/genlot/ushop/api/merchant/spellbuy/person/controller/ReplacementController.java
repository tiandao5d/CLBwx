package com.genlot.ushop.api.merchant.spellbuy.person.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.user.entity.UserAddress;
import com.genlot.ushop.facade.lottery.entity.LatestLottery;
import com.genlot.ushop.facade.lottery.entity.LotteryReplacement;
import com.genlot.ushop.facade.lottery.enums.LotteryLogisticsStatusEnum;
import com.genlot.ushop.facade.lottery.enums.LotteryReplacementEnum;
import com.genlot.ushop.facade.lottery.exceptions.LotteryBizException;
import com.genlot.ushop.facade.lottery.service.LatestLotteryFacade;
import com.genlot.ushop.facade.lottery.service.LotteryReplacementFacade;


/** 
* @author  kangds 
* @date 2016-12-13 18:39:11
* @version 1.0 
* @parameter  
* @since  
* @return 
 */
@Controller 
@RequestMapping(value = "/api/spellbuy/person/replacement")
public class ReplacementController {
	
	private static final Logger log = LoggerFactory.getLogger(ReplacementController.class);
	
	@Autowired
	LotteryReplacementFacade lotteryReplacementFacade;
	
	@Autowired
	LatestLotteryFacade latestLotteryFacade;
	/**
	 * 新增换货记录.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/replacement/submit
	 * @param 	请求参数 访问令牌.
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/create"}, method = RequestMethod.POST)
	@ResponseBody
	public Object create(
	
		    //  新增换货记录
			//两个字段，一个原因，一个换购ID
			@RequestBody LotteryReplacement body ,
			HttpServletRequest request,
			HttpServletResponse response) 
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		// 用户ID
		String userId = null;		
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);				
			
			//获得拼购ID
			Long spellbuyProductId = body.getSpellbuyProductId();
			//获得中奖订单信息
			LatestLottery latestLottery  = latestLotteryFacade.getBySpellbuyId(spellbuyProductId);
			
			if(!userId.equals(latestLottery.getUserId())){
				 throw LotteryBizException.LOTTERY_EXPRESS_ORDER_NOT_EXIST;				
			}
					
			body.setMerchantName(latestLottery.getMerchantName());					
			body.setMerchantNo(latestLottery.getMerchantId());
			body.setSpellbuyProductId(latestLottery.getSpellbuyProductId().longValue());
			body.setProductId(latestLottery.getProductId());
			body.setProductName(latestLottery.getProductName());
			body.setProductPeriod(latestLottery.getProductPeriod());
			body.setUserName(latestLottery.getUserName());
			body.setUserNo(latestLottery.getUserId());			
			//第一次的发货状态
			body.setStatus(LotteryReplacementEnum.WAITREPLACE.getValue());
			
			Long id = lotteryReplacementFacade.create(body);	
			body.setId(id);
			
			// 返回 换货记录对象
			uiModel.put("lotteryReplacement", body);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
				
		return uiModel;
	}
	
	
	//获得当前换货
	@RequestMapping(value = {"/get"}, method = RequestMethod.GET)
	@ResponseBody
	public Object get(
			long id,			
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		try
		{			
			LotteryReplacement  lotteryReplacement  =lotteryReplacementFacade.getById(id);
			// 返回
			uiModel.put("lotteryReplacement",lotteryReplacement);
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
	 * 客户端发货.  (2016-12-15 20:50:38  袁金华说不需要)
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/replacement/postDeliver
	 * @param 	请求参数 访问令牌.
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
/*	@RequestMapping(value = {"/postDeliver"}, method = RequestMethod.POST)
	@ResponseBody
	public Object postDeliver(
			Integer spellbuyProductId,
			
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		try
		{					
			//获得中奖订单信息
			LatestLottery latestLottery  = latestLotteryFacade.getLatestLotteryBySpellbuyId(spellbuyProductId);
			
			LotteryReplacement  lotteryReplacement  =lotteryReplacementFacade.getById(latestLottery.getLotteryReplacementId().longValue());
			// 修改状态
			lotteryReplacement.setStatus(LotteryReplacementEnum.MERCHANTRECEIVING.getValue());
			
			lotteryReplacementFacade.postDeliver(lotteryReplacement);
			// 返回
			uiModel.put("date", "SUCCESS");
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
				
		return uiModel; 
	}*/
	
	
	
	/**
	 * 客户端取消换货申请
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/replacement/cancel
	 * @param 	请求参数 访问令牌.
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/cancel/{spellbuyProductId}"}, method = RequestMethod.POST)
	@ResponseBody
	public Object cancel(
			@PathVariable Long spellbuyProductId,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		
		// 用户ID
		String userId = null;	
				
		try
		{	
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);	
			
			//获得中奖订单信息
			LatestLottery latestLottery  = latestLotteryFacade.getBySpellbuyId(spellbuyProductId);
			
				if(!userId.equals(latestLottery.getUserId())){
					 throw LotteryBizException.LOTTERY_EXPRESS_ORDER_NOT_EXIST;				
				}
			
			
			// 只有申请待审核状态的才可以取消换货申请
			if(latestLottery.getStatus() != LotteryLogisticsStatusEnum.WAITREPLACE.getValue()){
				throw LotteryBizException.LOTTERY_STATUS_IS_WRONG;	
			}
			
			LotteryReplacement  lotteryReplacement  =lotteryReplacementFacade.getById(latestLottery.getLotteryReplacementId().longValue());
			// 修改状态
			lotteryReplacement.setStatus(LotteryReplacementEnum.CANCEL.getValue());
			
			lotteryReplacementFacade.cancel(lotteryReplacement);
			// 返回
			uiModel.put("date", "SUCCESS");
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
