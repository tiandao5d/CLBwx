package com.genlot.ushop.api.merchant.spellbuy.person.controller;

import java.util.ArrayList;
import java.util.Date;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.string.StringTools;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.user.entity.UserAddress;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.UserAddressFacade;
import com.genlot.ushop.facade.lottery.entity.LatestLottery;
import com.genlot.ushop.facade.lottery.entity.LotteryExpress;
import com.genlot.ushop.facade.lottery.enums.LotteryLogisticsStatusEnum;
import com.genlot.ushop.facade.lottery.exceptions.LotteryBizException;
import com.genlot.ushop.facade.lottery.service.LatestLotteryFacade;
import com.genlot.ushop.facade.lottery.service.LotteryExpressFacade;
import com.genlot.ushop.facade.product.service.ProductImageFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyRecordFacade;
import com.genlot.ushop.facade.product.entity.ProductImage;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductStyleEnum;
import com.genlot.ushop.facade.product.enums.SpellBuyStatusEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;

@Controller
@RequestMapping(value = "/api/spellbuy/person/express")
public class ExpressController {
	
	private static final Logger log = LoggerFactory.getLogger(ExpressController.class);
	
	@Autowired
	private LatestLotteryFacade latestLotteryFacade;
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;	
	
	@Autowired
	private UserAddressFacade userAddressFacade;
	
	@Autowired
	private LotteryExpressFacade lotteryExpressFacade;
	
	/**
	 * 提交快递收货地址.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/express/submit/拼购id/地址id
	 * @param   请求参数 访问令牌.		
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param spellbuyId 
	 * 			拼购id.
	 * @param addressId 
	 * 			地址id

	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/submit/{spellbuyId}/{addressId}"}, method = RequestMethod.POST)
	@ResponseBody
	public Object submit(
			@PathVariable Long spellbuyId,
			@PathVariable Integer addressId,
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
			
			LatestLottery lottery = latestLotteryFacade.getBySpellbuyId(spellbuyId);
			if (lottery == null)
			{
				throw LotteryBizException.LOTTERY_NOT_EXIST;
			}
			if (lottery.getStatus() != LotteryLogisticsStatusEnum.ADDRESS.getValue())
			{
				throw LotteryBizException.LOTTERY_NOT_EXIST;
			}
			UserAddress address = userAddressFacade.getById(addressId);
			if (address == null)
			{
				throw new UserBizException(UserBizException.ADDRESS_NOT_EXIST, "地址不存在");
			}
			LotteryExpress order = new LotteryExpress();
			order.setOrderId(spellbuyId); 
			order.setDate(DateUtils.LONG_DATE_FORMAT.format(new Date()));
			order.setUserNo(userId);
			order.setConsignee(address.getConsignee()); 
			order.setPhone(address.getPhone());
			order.setProductId(lottery.getProductId());
			order.setProductName(lottery.getProductName());
			order.setProductPeriod(lottery.getProductPeriod());
			order.setUserName(lottery.getUserName());
			order.setAddress(address.getProvince() + " " + address.getCity() + " " + address.getDistrict() + " " + address.getAddress());
			lotteryExpressFacade.create(order);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("spellbuyId", spellbuyId);
		uiModel.put("status", LotteryLogisticsStatusEnum.EXPRESS.getValue());
		return uiModel;
	}
	
	/**
	 * 确认收货.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/express/confirm/拼购id
	 * @param   请求参数 访问令牌.
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param spellbuyId 
	 * 			拼购id.		
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/confirm/{spellbuyId}"}, method = RequestMethod.POST)
	@ResponseBody
	public Object confirm(
			@PathVariable Long spellbuyId,
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
			lotteryExpressFacade.receive(spellbuyId,userId);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("spellbuyId", spellbuyId);
		uiModel.put("status", LotteryLogisticsStatusEnum.SHARE.getValue());
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
