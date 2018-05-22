package com.genlot.ushop.api.merchant.spellbuy.product.controller;

import java.util.ArrayList;
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
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductStyleEnum;
import com.genlot.ushop.facade.product.enums.ProductUsageEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;
import com.genlot.ushop.facade.product.service.ProductCacheFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductCacheFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;

@Controller
@RequestMapping(value = "/api/spellbuy/product/search")
public class SearchController {
	
	private static final Logger log = LoggerFactory.getLogger(SearchController.class);
	
	@Autowired
	private ProductQueryFacade productQueryFacade;
	
	@Autowired
	private ProductCacheFacade productCacheFacade;
	
	@Autowired 
	private SpellBuyProductQueryFacade spellBuyProductQueryFacade;
	
	@Autowired 
	private SpellBuyProductCacheFacade spellBuyProductCacheFacade;
	
	/**
	 * 首页风格查询.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/search/listByStyle/风格/页数
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param style 
	 * 			查询风格(新品=1 最快=2  人气=3 总需=4).
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个(前后端商定一个固定数据方便日后缓存数据有用)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByStyle/{style}/{page}"}, method = RequestMethod.GET)
    @ResponseBody
    public Object listByStyle(@PathVariable Integer style,
    		@PathVariable Integer page,

    		HttpServletRequest request,HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,10);
		// 由于考虑到两个系统的数据一致性，可以日后在这里做一次查询校验是否商品上架
		try
		{
			// 暂时对于人气和快开只是简单的查询，日后会在后台定时去查询出这样的排序结果放入缓存
			if(style.equals(ProductStyleEnum.POPULARITY.getValue()))
			{
				// 查询最后一期拼购记录(按期数来排序)
				pageBean = spellBuyProductCacheFacade.listPageOrderByLastPeriod(pageParam);
			}
			else if(style.equals(ProductStyleEnum.RECOMMEND.getValue()))
			{
				// 查询最快开奖排名
				pageBean = spellBuyProductCacheFacade.listPageOrderByUpComing(pageParam);
			}
			else if(style.equals(ProductStyleEnum.PRICE.getValue()))
			{
				// 查询已价格排名
				pageBean = spellBuyProductCacheFacade.listPageOrderByPrice(pageParam);
			}
			else if(style.equals(ProductStyleEnum.NEW.getValue()))
			{
				// 查询最新上架排名
				pageBean = spellBuyProductCacheFacade.listPageOrderByDate(pageParam);
			}
			else
			{
				throw ProductBizException.PRODUCT_STYLE_INVALID;
			}
			
			List<Long> productIdList = new ArrayList<Long>();
			for(int index = 0; index < pageBean.getRecordList().size(); ++index)
			{
				SpellBuyProduct spellbuy = (SpellBuyProduct)pageBean.getRecordList().get(index);
				productIdList.add(spellbuy.getProductId());
			}
			
			Boolean result = false;
			
			if (pageBean.getRecordList().size() > 0)
			{
				List<Product> products = productCacheFacade.listByIds(productIdList);
				if (products.size() == pageBean.getRecordList().size())
				{
					for(int index = 0; index < pageBean.getRecordList().size(); ++index)
					{
						SpellBuyProduct spellbuy = (SpellBuyProduct)pageBean.getRecordList().get(index);
						Product product = products.get(index);
						spellbuy.setObject(product);
					}
					result = true;
				}
			}
			
			if (result == false)
			{
				pageBean.setRecordList(null);
				pageBean.setTotalCount(0);
				pageBean.setPageCount(0);
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
	 * 商品类型查询.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/search/listByType/类型/页数
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param type 
	 * 			查询类型 由于类型可以动态添加的，所以这里只能添加后把ID类型给前端,因为前端的UI也是需要制作更新
	 * 			按正常运营角度，这些分类查询是不常吧变化的
	 * 			目前存在的类型是:(手机数码=2 电脑办公=3  家用电器=4 化妆首饰=5).
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个(前后端商定一个固定数据方便日后缓存数据有用)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listByType/{type}/{page}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listByType(
			@PathVariable Integer type,
			@PathVariable Integer page,
			HttpServletRequest request,HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,10);
		try
		{
			pageBean = productCacheFacade.listPageByType(pageParam, type, ProductUsageEnum.SPELLBUY.getValue());
			List<Long> productIds = new ArrayList<Long>();
			Map<Long,Product> products = new HashMap<Long,Product>();
			
			for(int index = 0; index < pageBean.getRecordList().size(); ++index)
			{
				Product product = (Product)pageBean.getRecordList().get(index);
				productIds.add(product.getId());
				products.put(product.getId(), product);
			}
			
			Boolean result = false;
			if (productIds.size() > 0)
			{
				List<Object> spellbuys = spellBuyProductCacheFacade.listByProductIds(productIds);
				
				if (products.size() == pageBean.getRecordList().size())
				{
					for(int index = 0; index < spellbuys.size(); ++index)
					{
						SpellBuyProduct spellbuy = (SpellBuyProduct)spellbuys.get(index);
						Product product = products.get(spellbuy.getProductId());
						if (product != null)
						{
							spellbuy.setObject(product);
						}
					}
					pageBean.setRecordList(spellbuys);
					result = true;
				}
			}
			
			if (result == false)
			{
				pageBean.setRecordList(null);
				pageBean.setTotalCount(0);
				pageBean.setPageCount(0);
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
	 * 商品名字模糊查询.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/product/search/listLikeName
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
					ProductUsageEnum.SPELLBUY.getValue(),
					ProductStatusEnum.UP.getValue());
			List<Long> productIds = new ArrayList<Long>();
			Map<Long,Product> products = new HashMap<Long,Product>();
			
			for(int index = 0; index < pageBean.getRecordList().size(); ++index)
			{
				Product product = (Product)pageBean.getRecordList().get(index);
				productIds.add(product.getId());
				products.put(product.getId(), product);
			}
			
			Boolean result = false;
			if (productIds.size() > 0)
			{
				List<Object> spellbuys = spellBuyProductCacheFacade.listByProductIds(productIds);
				
				if (products.size() == pageBean.getRecordList().size())
				{
					for(int index = 0; index < spellbuys.size(); ++index)
					{
						SpellBuyProduct spellbuy = (SpellBuyProduct)spellbuys.get(index);
						Product product = products.get(spellbuy.getProductId());
						if (product != null)
						{
							spellbuy.setObject(product);
						}
					}
					pageBean.setRecordList(spellbuys);
					result = true;
				}
			}
			
			if (result == false)
			{
				pageBean.setRecordList(null);
				pageBean.setTotalCount(0);
				pageBean.setPageCount(0);
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
