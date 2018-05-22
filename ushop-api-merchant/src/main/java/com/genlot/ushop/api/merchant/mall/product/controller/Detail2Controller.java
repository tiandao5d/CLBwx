package com.genlot.ushop.api.merchant.mall.product.controller;

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
import com.genlot.ushop.facade.product.entity.ProductActivity;
import com.genlot.ushop.facade.product.entity.ProductImage;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;
import com.genlot.ushop.facade.product.service.ProductActivityFacade;
import com.genlot.ushop.facade.product.service.ProductCacheFacade;
import com.genlot.ushop.facade.product.service.ProductImageFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;

@Controller
@RequestMapping(value = "/api/mall/product/detail")
public class Detail2Controller {
	
	private static final Logger log = LoggerFactory.getLogger(Detail2Controller.class);
	
	@Autowired
	private ProductQueryFacade productQueryFacade;
	
	@Autowired
	private ProductImageFacade productImageFacade;
	
	@Autowired
	private ProductCacheFacade productCacheFacade;
	
	@Autowired
	private ProductActivityFacade productActivityFacade;
			
	/**
	 * 商品信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/product/detail/getProductById/商品ID/
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
			if(vo.getActivityId()!=null){
			
				ProductActivity productActivity = productActivityFacade.getById(vo.getActivityId().longValue());

				uiModel.put("productActivity",productActivity);
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
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/product/detail/getProductImageById/商品ID/
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
