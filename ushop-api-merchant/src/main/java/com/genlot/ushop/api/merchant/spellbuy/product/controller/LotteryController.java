package com.genlot.ushop.api.merchant.spellbuy.product.controller;

import java.util.ArrayList;
import java.util.Date;
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

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ushop.facade.lottery.entity.LatestLottery;
import com.genlot.ushop.facade.lottery.enums.LotteryLogisticsStatusEnum;
import com.genlot.ushop.facade.lottery.exceptions.LotteryBizException;
import com.genlot.ushop.facade.lottery.service.LatestLotteryCacheFacade;
import com.genlot.ushop.facade.lottery.service.LatestLotteryFacade;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
import com.genlot.ushop.facade.product.entity.SpellBuyRecord;
import com.genlot.ushop.facade.product.enums.SpellBuyStatusEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;
import com.genlot.ushop.facade.product.exceptions.SpellBuyBizException;
import com.genlot.ushop.facade.product.service.ProductCacheFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyRecordFacade;

@Controller
@RequestMapping(value = "/api/spellbuy/product/lottery")
public class LotteryController {
	
	private static final Logger log = LoggerFactory.getLogger(LotteryController.class);
	
	@Autowired
	private LatestLotteryFacade latestLotteryFacade;
	
	@Autowired
	private LatestLotteryCacheFacade latestLotteryCacheFacade;
	
	@Autowired
	private SpellBuyProductQueryFacade spellBuyProductQueryFacade;
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;
		
	@Autowired
	private ProductCacheFacade productCacheFacade;
	
	@Autowired 
	private SpellBuyRecordFacade spellBuyRecordFacade;
	
	/**
	 * 获得揭晓中的.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/lottery/listByAnnouncing/页数/个数
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByAnnouncing/{page}/{count}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listByAnnouncing(
			@PathVariable Integer page,
    		@PathVariable Integer count,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);

		try
		{
			// 获得揭晓中开奖商品信息
			final Date endDate = new Date(System.currentTimeMillis());
			final String endTime = DateUtils.LONG_DATE_FORMAT.format(endDate);
			pageBean = spellBuyProductQueryFacade.listPageByCanLottery(pageParam,endTime);
			
			List<Long> productIdList = new ArrayList<Long>();
			for(int index = 0; index < pageBean.getRecordList().size(); ++index)
			{
				SpellBuyProduct spellbuy = (SpellBuyProduct)pageBean.getRecordList().get(index);
				productIdList.add(spellbuy.getProductId());
			}
			
			if (pageBean.getRecordList().size() > 0)
			{			
				List<Product> products = productCacheFacade.listByIds(productIdList);
				if (products.size() != pageBean.getRecordList().size())
				{
					throw ProductBizException.PRODUCT_NOT_EXIST;
				}
				
				for(int index = 0; index < pageBean.getRecordList().size(); ++index)
			    {
					SpellBuyProduct product = (SpellBuyProduct)pageBean.getRecordList().get(index);;
//					Long nowDate = Long.valueOf(System.currentTimeMillis());
//					Long endDate = Long.valueOf(DateUtils.getDateByStr(product.getAnnounceEndDate()).getTime());
//					if(endDate.longValue() - nowDate.longValue() <= 0)
//						product.setAnnounceEndDate("0");
//					else
//						product.setAnnounceEndDate(((endDate.longValue() - nowDate.longValue())) + "");
					
					Product info = products.get(index);
					product.setObject(info);
			    }
			}
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		return uiModel;
	}
	
	
	/**
	 * 获得已揭晓的.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/product/lottery/listByAnnounced/页数/每页多少个
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个(前后端商定一个固定数据方便日后缓存数据有用)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByAnnounced/{page}/{count}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listByAnnounced(
			@PathVariable Integer page,
    		@PathVariable Integer count,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);
		Map<String, Object> paramMap = new HashMap<String, Object>();
		try
		{
			pageBean = latestLotteryCacheFacade.listPage(pageParam);
			//pageBean = latestLotteryFacade.listPageLatestLottery(pageParam,paramMap);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		return uiModel;
	}
	
	/**
	 * 根据商品id获得已揭晓的.
	 * @example http://xxx.xxx.xxx.xxx/ushop-api-merchant/api/product/lottery/listByAnnouncedProductId/商品id/页数/每页多少个
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByAnnouncedProductId/{productId}/{page}/{count}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listByAnnouncedProductId(
			@PathVariable Long productId,
    		@PathVariable Integer page,
    		@PathVariable Integer count,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);
		Map<String, Object> paramMap = new HashMap<String, Object>();
		try
		{
			pageBean = latestLotteryCacheFacade.listPageByProductId(pageParam,productId);
			//pageBean = latestLotteryFacade.listPageLatestLotteryByProductId(pageParam, productId);
			
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		return uiModel;
	}
	
	/**
	 * 根据拼购id获得揭晓中的.
	 * @example http://xxx.xxx.xxx.xxx/ushop-api-merchant/api/product/lottery/getAnnouncingBySpellBuyId/拼购id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param spellbuyId 
	 * 			拼购id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/getAnnouncingBySpellBuyId/{spellbuyId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getAnnouncingById(
			@PathVariable Long spellbuyId,
			HttpServletRequest request,
			HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		SpellBuyProduct entity = null;
		try
		{
			entity = spellBuyProductQueryFacade.getById(spellbuyId);
			if (entity == null || entity.getSpellbuyStatus() != SpellBuyStatusEnum.ANNABLE.getValue()) {
				throw SpellBuyBizException.SPELL_BUY_NOT_EXIST;
			}
				
//			Long nowDate = Long.valueOf(System.currentTimeMillis());
//			Long endDate = Long.valueOf(DateUtils.getDateByStr(entity.getAnnounceEndDate()).getTime());
//			if(endDate.longValue() - nowDate.longValue() <= 0)
//				entity.setAnnounceEndDate("0");
//			else
//				entity.setAnnounceEndDate(((endDate.longValue() - nowDate.longValue())) + "");
			
			Product product = productCacheFacade.getById(entity.getProductId());
			if (product == null)
			{
				throw ProductBizException.PRODUCT_NOT_EXIST;
			}
			
			entity.setObject(product);
			
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("spellbuyId",spellbuyId);
		uiModel.put("detail",entity);
		
		return uiModel;
	}
	
	/**
	 * 根据拼购id获得已揭晓的.
	 * @example http://xxx.xxx.xxx.xxx/ushop-api-merchant/api/product/lottery/getAnnouncedBySpellBuyId/拼购id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param spellbuyId 
	 * 			拼购id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/getAnnouncedBySpellBuyId/{spellbuyId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getAnnouncedById(
			@PathVariable Long spellbuyId,
			HttpServletRequest request,
			HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		LatestLottery entity = null;
		try
		{
			entity = latestLotteryCacheFacade.getBySpellbuyId(spellbuyId);
			
			if (entity == null) {
				throw LotteryBizException.LOTTERY_NOT_EXIST;
			}
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("spellbuyId",spellbuyId);
		uiModel.put("detail",entity);
		return uiModel;
	}
	
	/**
	 * 获得参与计算中奖号码的拼购记录(最多50个).
	 * @example http://xxx.xxx.xxx.xxx/ushop-api-merchant/api/product/lottery/listParticipatorBySpellBuyId/拼购id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param spellbuyId 
	 * 			拼购id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listParticipatorBySpellBuyId/{spellbuyId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listParticipatorById(
			@PathVariable Long spellbuyId,
	  		HttpServletRequest request,
	  		HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		List<SpellBuyRecord> records = null;
		LatestLottery entity = null;
		try
		{
			entity = latestLotteryCacheFacade.getBySpellbuyId(spellbuyId);
			
			if (entity == null) {
				throw LotteryBizException.LOTTERY_NOT_EXIST;
			}
			records = spellBuyRecordFacade.listByTime(entity.getSrcBegDate(),entity.getSrcEndDate(),50);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("spellbuyId", spellbuyId);
		uiModel.put("recordList", records);
		return uiModel;
	}
	
	
	/**
	 * 获得个人未晒单.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/product/lottery/listNoshare/页数/每页多少个
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个(前后端商定一个固定数据方便日后缓存数据有用)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listNoshare/{userId}/{page}/{count}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listNoshare(
			@PathVariable String  userId,
			@PathVariable Integer page,
    		@PathVariable Integer count,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);
		Map<String, Object> paramMap = new HashMap<String, Object>();
		try
		{
			String status = String.valueOf(LotteryLogisticsStatusEnum.SHARE.getValue());
			paramMap.put("userId", userId);
			pageBean = latestLotteryFacade.listPageByUserId_Status(pageParam,userId,status);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		return uiModel;
	}
	
	/**
	 * 获得未填写地址订单.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/product/lottery/listNoshare/页数/每页多少个
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个(前后端商定一个固定数据方便日后缓存数据有用)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listNoAddress/{userId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listNoAddress(
			@PathVariable String  userId,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(1,30);
		Map<String, Object> paramMap = new HashMap<String, Object>();
		try
		{
			paramMap.put("status", LotteryLogisticsStatusEnum.ADDRESS.getValue());
			paramMap.put("userId", userId);
			pageBean = latestLotteryFacade.listPage(pageParam,paramMap);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("totalCount", pageBean.getTotalCount());
		
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
