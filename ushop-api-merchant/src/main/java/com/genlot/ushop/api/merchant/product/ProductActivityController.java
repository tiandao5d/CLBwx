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
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.ucenter.facade.account.entity.AccountFundType;
import com.genlot.ucenter.facade.account.service.AccountFundTypeFacade;
import com.genlot.ushop.facade.product.entity.ProductActivity;
import com.genlot.ushop.facade.product.entity.ProductType;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductUsageEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;
import com.genlot.ushop.facade.product.service.ProductActivityFacade;
import com.genlot.ushop.facade.product.service.ProductCacheFacade;
/**
 * 商品活动专场控制类
 * @author hsz
 */
@Controller
@RequestMapping(value = "/api/product/activity")
public class ProductActivityController {
	
	private static final Logger log = LoggerFactory.getLogger(ProductActivityController.class);
	
	@Autowired
	private ProductActivityFacade productActivityFacade;
	
	@Autowired
	private AccountFundTypeFacade accountFundTypeFacade;
	
	/**
	 * 根据活动ID获得详情.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/product/activity/get/{id}
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param style 
	 * 			查询风格(新品=1 销量=3 价格=4).
	 * @param page 
	 * 			第几页.
	 * @param sort 
	 * 			排序规则(1=升序 2=降序)
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/get/{id}"}, method = RequestMethod.GET)
    @ResponseBody
    public Object listByActivityId(
    		@PathVariable Long id,
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		try
		{
			
			ProductActivity entity = productActivityFacade.getById(id);
			AccountFundType fundType = accountFundTypeFacade.getById(entity.getFundType().longValue());
			entity.setObject(fundType);
			uiModel.putAll(BeanMapUtil.convertBean(entity));
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
