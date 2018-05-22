package com.genlot.ushop.web.admin.spell.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
import com.genlot.ucenter.facade.user.entity.MerchantInfo;
import com.genlot.ucenter.facade.user.enums.MerchantStatusEnum;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.MerchantFacade;
import com.genlot.ushop.facade.product.service.SpellBuySettlementFacade;

/** 
* @author  kangds 
* @date 2016年7月4日 下午1:46:22 
* @version 1.0 
* @parameter  
* @since  
* @return 
 */


@Controller
@RequestMapping(value = "/spellBuy/settlement")
public class SpellBuySettlementController {

private static final Logger log = LoggerFactory.getLogger(SpellBuySettlementController.class);

    @Autowired
    private MerchantFacade merchantFacade;
	
    @Autowired
    private SpellBuySettlementFacade spellBuySettlementFacade;
	
    /**
   	 * 按商品ID统计已结算的商品销量情况.
   	 * 
   	 * @param date
   	 *            时间(年月)例如:2016-07.
   	 * @param merchantIds
   	 *            商家ID.
   	 * @return List<StatisticsResultVO>
   	 * 			  id=商品ID name=商品名字 value=商品数量 param=商品单价格 
   	 * @throws StatisticsBizException
   	 */
	@RequestMapping(value = {"/listBySettlement"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listBySettlement(
    		String date,
    		String merchantId,
            Integer page,            
            Integer rows,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();		
		PageBean pageBean = null;
		try
		{	
			PageParam pageParam = new PageParam(page,rows);
			pageBean = spellBuySettlementFacade.listPageBySettlement(pageParam, date, merchantId);
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("recordList", pageBean.getRecordList());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		String json = JSON.toJSONString(uiModel);
		return json;
	}
	
	
	/**
	 * 按商品ID统计未结算的商品销量情况.
	 * 
	 * @param date
	 *            时间(年月)例如:2016-07-01.
	 * @param merchantId
	 *            商家ID.
	 * @return List<StatisticsResultVO>
	 * 			  id=商品ID name=商品名字 value=商品数量 param=商品单价格 
	 * @throws StatisticsBizException
	 */
	@RequestMapping(value = {"/listByUnSettlement"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listByUnSettlement(
    		String date,
    		String merchantId,
    		Integer page,            
            Integer rows,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		Map<String,Object> uiModel = new HashMap<String,Object>();		
		PageBean pageBean = null;
		try
		{		    
			PageParam pageParam = new PageParam(page,rows);
			pageBean = spellBuySettlementFacade.listPageByUnSettlement(pageParam, date, merchantId);
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("recordList", pageBean.getRecordList());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		String json = JSON.toJSONString(uiModel);
		return json;
	}
	
//	/**
//	 * 出账
//	 * 
//	 * @param date
//	 *            时间(年月)例如:2016-07-01.
//	 * @param merchantId
//	 *            商家ID.
//	 * @return  
//	 * @throws StatisticsBizException
//	 */
//	@RequestMapping(value = {"/settCreate"}, method = RequestMethod.POST)
//	@ResponseBody
//	public Object settCreate(
//    		String date,
//    		String merchantId,
//			HttpServletRequest request,
//			HttpServletResponse response)
//	{
//		Map<String,Object> uiModel = new HashMap<String,Object>();		
//		try
//		{		   
//			if (merchantId == null) {
//				throw UserBizException.MERCHANT_USERINFO_NOT_EXIST;
//			}
//			
//			salesSettlementFacade.settCreate(date, merchantId);			
//		}
//		catch (Exception exception)
//		{
//			setErrorMessage(exception,uiModel);
//			return uiModel;
//		}		
//		uiModel.put("data", "SUCCESS");		
//		return uiModel;
//	}
	
	
	protected void setErrorMessage(Exception exception, Map<String,Object> uiModel)
	{
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