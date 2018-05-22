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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductUsageEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;
import com.genlot.ushop.facade.product.service.ProductCacheFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;

@Controller
@RequestMapping(value = "/api/mall/product/search")
public class Search2Controller {
	
	private static final Logger log = LoggerFactory.getLogger(Search2Controller.class);
	
	@Autowired
	private ProductQueryFacade productQueryFacade;
	
	@Autowired
	private ProductCacheFacade productCacheFacade;
		
	/**
	 * 首页风格查询.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/product/search/listByStyle/风格/页数/排序
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param style 
	 * 			查询风格(新品=1 销量=3 价格=4).
	 * @param page 
	 * 			第几页.
	 * @param sort 
	 * 			排序规则(1=升序 2=降序)
	 * @param type 
	 * 			类型(1=全部分类   其他)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByStyle/{type}/{style}/{page}/{sort}"}, method = RequestMethod.GET)
    @ResponseBody
    public Object listByStyle(
    		@PathVariable Integer type,
    		@PathVariable Integer style,
    		@PathVariable Integer page,
    		@PathVariable Integer sort,
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,10);
		// 由于考虑到两个系统的数据一致性，可以日后在这里做一次查询校验是否商品上架		
		try
		{
			pageBean  = productCacheFacade.listPageByParam(
					pageParam,
					null,
					ProductUsageEnum.MALLSALE.getValue(),
					type,
					style,
					sort,
					ProductStatusEnum.UP.getValue());
			
			
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
	 * 商品详情.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/product/search/listByStyle/风格/页数/排序
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param style 
	 * 			查询风格(新品=1 销量=3 价格=4).
	 * @param page 
	 * 			第几页.
	 * @param sort 
	 * 			排序规则(1=升序 2=降序)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/getById/{id}"}, method = RequestMethod.GET)
    @ResponseBody
    public Object getById(
    		@PathVariable Long id,
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();		
		Product productInfo = null;
		try
		{
			productInfo = productQueryFacade.getById(id);
			if(productInfo == null){
				throw ProductBizException.PRODUCT_NOT_EXIST;
			}
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}		
		uiModel.put("productInfo",productInfo);		
        return uiModel;
    }  
	
	/**
	 * 商品类型查询.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/product/search/listByType/类型/页数
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param type 
	 * 			查询类型 由于类型可以动态添加的，所以这里只能添加后把ID类型给前端,因为前端的UI也是需要制作更新
	 * 			按正常运营角度，这些分类查询是不常吧变化的
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个(前后端商定一个固定数据方便日后缓存数据有用)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByType/{type}/{page}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listByType(@PathVariable Integer type,
			@PathVariable Integer page,
			HttpServletRequest request,HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,10);
		try
		{
			pageBean = productQueryFacade.listPageByParam(
					pageParam,
					null,
					ProductUsageEnum.MALLSALE.getValue(),
					type,
					1,
					2,
					null,
					ProductStatusEnum.UP.getValue(),
					null);
			
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
	 * 商品商家查询.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/product/search/listByMerchant/商家id/页数
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param merchantId 
	 * 			商家ID.
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个(前后端商定一个固定数据方便日后缓存数据有用).
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByMerchant/{merchantId}/{style}/{sort}/{page}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listByMerchant(
			@PathVariable String merchantId,
			@PathVariable Integer page,
			@PathVariable Integer style,
			@PathVariable Integer sort,
			HttpServletRequest request,HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,10);
		try
		{
			
			pageBean = productCacheFacade.listPageByParam(
					pageParam,
					merchantId,
					ProductUsageEnum.MALLSALE.getValue(),
					0,
					style,
					sort,
					ProductStatusEnum.UP.getValue());
			
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
	 * 商品名字模糊查询.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/product/search/listLikeName
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @body  json data 
	 * 			Content-Type: application/json;charset=UTF-8 
	 * 			格式:{"name":"查询的文字","page":"第几页"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/listLikeName", method = RequestMethod.POST)
	@ResponseBody
	public Object listLikeName(
			@RequestBody(required=true) Map<String,Object> parMap,
			HttpServletRequest request,HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		Integer page = Integer.valueOf(0);
		String name;
		if (parMap.get("name") != null && parMap.get("page") != null)
		{
			page = Integer.valueOf(parMap.get("page").toString());
			name = parMap.get("name").toString();
		}
		else
		{
			throw ProductBizException.PRODUCT_NOT_EXIST;
		}
		
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,10);
		try
		{
			pageBean = productQueryFacade.listPageBylikeName(
					pageParam, 
					name,
					ProductUsageEnum.MALLSALE.getValue(),
					ProductStatusEnum.UP.getValue());
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
	 * 首页限时特惠商品显示
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/product/search/listByFlashSale/页数
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByFlashSale/{page}"}, method = RequestMethod.GET)
    @ResponseBody
    public Object listByFlashSale(
    		@PathVariable Integer page,
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		PageBean pageBean = null;
		
		// 由于考虑到两个系统的数据一致性，可以日后在这里做一次查询校验是否商品上架
		try
		{
			if(page != 0){
				PageParam pageParam = new PageParam(page,10);
				pageBean = productQueryFacade.listPageByParam(
						pageParam,
						null,
						ProductUsageEnum.FLASHSALE.getValue(),
						null,
						null,
						null,
						null,
						ProductStatusEnum.UP.getValue(),
						null);
				uiModel.put("currentPage", pageBean.getCurrentPage());
				uiModel.put("pagePage", pageBean.getPageCount());
				uiModel.put("totalCount", pageBean.getTotalCount());
				uiModel.put("recordList", pageBean.getRecordList());
			}
			else {
				Map<String, Object> paramMap = new HashMap<String, Object>();
				paramMap.put("usage", ProductUsageEnum.FLASHSALE.getValue());
				paramMap.put("status",ProductStatusEnum.UP.getValue());
				List<Product>  productInfoList= productQueryFacade.listBy(paramMap);
				uiModel.put("productInfoList", productInfoList);
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
	 * 首页风格查询.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/mall/product/search/listByActivityId/风格/排序/页数/任务id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param style 
	 * 			查询风格(新品=1 销量=3 价格=4).
	 * @param page 
	 * 			第几页.
	 * @param sort 
	 * 			排序规则(1=升序 2=降序)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByActivityId/{style}/{page}/{sort}/{id}"}, method = RequestMethod.GET)
    @ResponseBody
    public Object listByActivityId(
    		@PathVariable Integer style,
    		@PathVariable Integer page,
    		@PathVariable Integer sort,
    		@PathVariable Integer id,
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		
		try
		{
			PageParam pageParam = new PageParam(page,10);
			pageBean = productQueryFacade.listPageByParam(
					pageParam,
					null,
					ProductUsageEnum.SPECIALSALE.getValue(),
					null,
					style,
					sort,
					id,
					ProductStatusEnum.UP.getValue(),
					null);
			uiModel.put("currentPage", pageBean.getCurrentPage());
			uiModel.put("pagePage", pageBean.getPageCount());
			uiModel.put("totalCount", pageBean.getTotalCount());
			uiModel.put("recordList", pageBean.getRecordList());
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
