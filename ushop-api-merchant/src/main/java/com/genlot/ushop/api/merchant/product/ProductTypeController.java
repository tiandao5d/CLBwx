package com.genlot.ushop.api.merchant.product;

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
import com.genlot.ushop.facade.product.entity.ProductType;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;
import com.genlot.ushop.facade.product.service.ProductCacheFacade;
/**
 * 客户端商品分类控制类
 * @author Kangds
 *         E-mail:dongsheng.kang@lotplay.cn
 * @version 创建时间：2017年3月10日 下午3:14:39
 * 
 */
@Controller
@RequestMapping(value = "/api/product")
public class ProductTypeController {
	
	private static final Logger log = LoggerFactory.getLogger(ProductTypeController.class);
	
	@Autowired
	private ProductCacheFacade productCacheFacade;
	
	
	/**
	 * 商品拼购信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/product/detail/getSpellBuyById/拼购ID/
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param spellbuyId 
	 * 			拼购ID.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listProductType"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listProductType(
			HttpServletRequest request,
			HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		
		try
		{
			// 查询商品拼购信息
			List<ProductType> vo = productCacheFacade.listProductType();
			if (vo == null)
			{
				throw ProductBizException.PRODUCT_TYPE_NOT_EXIST;
			}

			uiModel.put("productType",vo);
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
