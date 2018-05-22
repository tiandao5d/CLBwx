package com.genlot.ushop.api.merchant.spellbuy.product.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
import com.genlot.common.utils.string.StringTools;
import com.genlot.ushop.facade.product.service.ProductCacheFacade;
import com.genlot.ushop.facade.product.service.ProductImageFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductCacheFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyRecordFacade;
import com.genlot.ushop.facade.product.entity.ProductImage;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductStyleEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;

@Controller
@RequestMapping(value = "/api/spellbuy/product/detail")
public class DetailController {
	
	private static final Logger log = LoggerFactory.getLogger(DetailController.class);
	
	@Autowired
	private ProductQueryFacade productQueryFacade;
	
	@Autowired
	private ProductImageFacade productImageFacade;
	
	@Autowired 
	private SpellBuyProductQueryFacade spellBuyProductQueryFacade;
	
	@Autowired 
	private SpellBuyRecordFacade spellBuyRecordFacade;
	
	@Autowired
	private ProductCacheFacade productCacheFacade;
	
	@Autowired 
	private SpellBuyProductCacheFacade spellBuyProductCacheFacade;
	
	/**
	 * 商品信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/detail/getSpellBuyProductByProductId/商品ID
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param productId 
	 * 			商品ID.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/getSpellBuyProductByProductId/{productId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getSpellBuyProductByProductId(
			@PathVariable Long productId,
			HttpServletRequest request,
			HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
				
		try
		{
			// 查询商品拼购信息
			Product object = productCacheFacade.getById(productId);
			if (object == null)
			{
				throw ProductBizException.PRODUCT_NOT_EXIST;
			}
			
			SpellBuyProduct sp = spellBuyProductCacheFacade.getByProductId(productId);
			if (sp == null)
			{
				throw ProductBizException.PRODUCT_NOT_EXIST;
			}
			
			sp.setObject(object);
			uiModel.put("productId",productId);
			uiModel.put("detail",sp);
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
	 * 商品信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/detail/getSpellBuyProductBySpellBuyId/商品ID
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param productId 
	 * 			商品ID.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/getSpellBuyProductBySpellBuyId/{id}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getSpellBuyProductBySpellBuyId(
			@PathVariable Long id,
			HttpServletRequest request,
			HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
				
		try
		{
			SpellBuyProduct sp = spellBuyProductCacheFacade.getById(id);
			if (sp == null)
			{
				throw ProductBizException.PRODUCT_NOT_EXIST;
			}
			
			// 查询商品拼购信息
			Product object = productCacheFacade.getById(sp.getProductId());
			if (object == null)
			{
				throw ProductBizException.PRODUCT_NOT_EXIST;
			}
						
			sp.setObject(object);
			uiModel.put("productId",sp.getProductId());
			uiModel.put("detail",sp);
		}
		catch (Exception exception)
		{
			log.error(exception.getMessage());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
				
		return uiModel;
	}
	
	/**
	 * 商品信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/detail/getProductById/商品ID/
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param productId 
	 * 			商品ID.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/getProductById/{productId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getProductById(
			@PathVariable Long productId,
			HttpServletRequest request,
			HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
				
		try
		{
			// 查询商品拼购信息
			Product vo = productQueryFacade.getById(productId);
			if (vo == null)
			{
				throw ProductBizException.PRODUCT_NOT_EXIST;
			}
			uiModel.put("productId",productId);
			uiModel.put("detail",vo);
		}
		catch (Exception exception)
		{
			log.error(exception.getMessage());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
				
		return uiModel;
	}
	
	/**
	 * 商品图片信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/detail/getProductImageById/商品ID/
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param productId 
	 * 			商品ID.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/getProductImageById/{productId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getProductImageById(
			@PathVariable Long productId,
			HttpServletRequest request,
			HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
				
		try
		{
			List<ProductImage> images = productCacheFacade.listImageByProductId(productId);
			if (images == null ||  images.size() == 0)
			{
				throw ProductBizException.PRODUCT_NOT_EXIST;
			}
			uiModel.put("productId",productId);
			uiModel.put("images",images);
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
	 * 商品拼购信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/detail/getSpellBuyByProductId/商品ID/
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param productId 
	 * 			商品ID.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/getSpellBuyByProductId/{productId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getSpellBuyByProductId(
			@PathVariable Long productId,
			HttpServletRequest request,
			HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		try
		{
			// 查询商品拼购信息
			SpellBuyProduct vo = spellBuyProductQueryFacade.getByProductId(productId);
			if (vo == null)
			{
				throw ProductBizException.PRODUCT_NOT_EXIST;
			}
			uiModel.put("productId",productId);
			uiModel.put("detail",vo);
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
	 * 商品拼购信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/detail/getSpellBuyById/拼购ID/
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param spellbuyId 
	 * 			拼购ID.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/getSpellBuyById/{spellbuyId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getSpellBuyById(
			@PathVariable Long spellbuyId,
			HttpServletRequest request,
			HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		try
		{
			// 查询商品拼购信息
			SpellBuyProduct vo = spellBuyProductQueryFacade.getById(spellbuyId);
			if (vo == null)
			{
				throw ProductBizException.PRODUCT_NOT_EXIST;
			}
			uiModel.put("spellbuyId",spellbuyId);
			uiModel.put("detail",vo);
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
	 * 分页获得商品拼购记录.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/detail/listParticipatorBySpellBuyId/拼购商品ID/页数/每页个数
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param spellBuyId 
	 * 			拼购ID.
	 * @param page 
	 * 			页数.
	 * @param count 
	 * 			每页个数.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listParticipatorBySpellBuyId/{spellbuyId}/{page}/{count}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listParticipatorById(
			@PathVariable Long spellbuyId,
			@PathVariable Integer page,
    		@PathVariable Integer count,
	  		HttpServletRequest request,
	  		HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
				
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);
		try
		{
			pageBean = spellBuyRecordFacade.listPageOrderByBuyDate(pageParam, spellbuyId);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("spellbuyId", spellbuyId);
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		return uiModel;
	}
	
	/**
	 * 指定拼购商品获得用户的购买次数.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/detail/getUserSpellBuyCountById/拼购商品ID/用户ID
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param spellBuyId 
	 * 			拼购ID.
	 * @param userId 
	 * 			用户ID.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/getUserSpellBuyCountBySpellBuyId/{spellbuyId}/{userId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getUserSpellBuyCountBySpellBuyId(
			@PathVariable Integer spellbuyId,
			@PathVariable String userId,
	  		HttpServletRequest request,
	  		HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		Double buyCount = Double.valueOf(0);
		try
		{
			buyCount = spellBuyRecordFacade.getSpellBuyCountByUserId_spellbuyId(userId, spellbuyId);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		uiModel.put("userId", userId);
		uiModel.put("spellbuyId", spellbuyId);
		if(buyCount == null){
			buyCount = Double.valueOf(0);
		}
		uiModel.put("spellbuyCount", buyCount);
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
