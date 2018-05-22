package com.genlot.ushop.api.merchant.spellbuy.person.controller;

import java.util.ArrayList;
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
import com.genlot.ushop.facade.order.service.OrderQueryFacade;
import com.genlot.ushop.facade.lottery.entity.LatestLottery;
import com.genlot.ushop.facade.lottery.exceptions.LotteryBizException;
import com.genlot.ushop.facade.lottery.service.LatestLotteryFacade;
import com.genlot.ushop.facade.product.service.ProductCacheFacade;
import com.genlot.ushop.facade.product.service.ProductImageFacade;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.product.service.RandomNumberFacade;
import com.genlot.ushop.facade.product.service.SpellBuyProductQueryFacade;
import com.genlot.ushop.facade.product.service.SpellBuyRecordFacade;
import com.genlot.ushop.facade.product.entity.ProductImage;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.entity.RandomNumber;
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;
import com.genlot.ushop.facade.product.entity.SpellBuyProductRecord;
import com.genlot.ushop.facade.product.entity.SpellBuyRecord;
import com.genlot.ushop.facade.product.enums.ProductStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductStyleEnum;
import com.genlot.ushop.facade.product.enums.SpellBuyStatusEnum;
import com.genlot.ushop.facade.product.exceptions.ProductBizException;

@Controller
@RequestMapping(value = "/api/spellbuy/person/record")
public class RecordController {
	
	private static final Logger log = LoggerFactory.getLogger(RecordController.class);
			
	@Autowired
	private LatestLotteryFacade latestLotteryFacade;
	
	@Autowired
	private SpellBuyProductQueryFacade spellBuyProductQueryFacade;
	
	@Autowired
	private OAuthManagementFacade oauthManagementFacade;
	
	@Autowired
	private SpellBuyRecordFacade spellBuyRecordFacade;
	
	@Autowired
	private RandomNumberFacade randomNumberFacade;
		
	@Autowired
	private ProductCacheFacade productCacheFacade;
	
	@Autowired
	private OrderQueryFacade orderQueryFacade;
	
	/**
	 * 获得用户已中奖的.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/record/public/listUserLatestLottery/页数/每页多少个/用户id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个
	 * @param userId 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/public/listUserLatestLottery/{page}/{count}/{userId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listUserLatestLottery(
			@PathVariable Integer page,
    		@PathVariable Integer count,
    		@PathVariable String userId,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);

		try
		{
			pageBean = latestLotteryFacade.listPageByUserId(pageParam,userId);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("userId", userId);
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		return uiModel;
	}
	
	
	/**
	 * 获得用户夺宝记录.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/record/public/listUserSpellBuyRecord/页数/每页多少个/拼购状态/用户id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个
	 * @param status
	 * 			拼购状态（0=全部,100=进行中,102=已揭晓)
	 * @param userId 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/public/listUserSpellBuyRecord/{page}/{count}/{status}/{userId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listUserSpellBuyRecord(
			@PathVariable Integer page,
    		@PathVariable Integer count,
    		@PathVariable Integer status,
    		@PathVariable String userId,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);
		try
		{
			if(status == SpellBuyStatusEnum.BUYABLE.getValue() || status == SpellBuyStatusEnum.LOTABLE.getValue())
			{
				pageBean = spellBuyRecordFacade.listPageByUserId_spellbuyStatus(pageParam, userId, status);
			}
			else
			{
				pageBean = spellBuyRecordFacade.listPageByUserId_spellbuyStatus(pageParam, userId, null);
			}
			
			List<Long> productIdList = new ArrayList<Long>();
			for(int index = 0; index < pageBean.getRecordList().size(); ++index)
			{
				SpellBuyProductRecord record = (SpellBuyProductRecord)pageBean.getRecordList().get(index);
				productIdList.add(record.getProductId());
			}
			
			if (productIdList.size() > 0)
			{
				List<Product> products = productCacheFacade.listByIds(productIdList);
				
				if (products.size() != pageBean.getRecordList().size())
				{
					throw ProductBizException.PRODUCT_STYLE_INVALID;
				}
				
				for(int index = 0; index < pageBean.getRecordList().size(); ++index)
				{
					SpellBuyProductRecord record = (SpellBuyProductRecord)pageBean.getRecordList().get(index);
					Product product = products.get(index);
					record.setObject(product);
				}
			}
			
			uiModel.put("userId", userId);
			uiModel.put("status", status);
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
	
	/**
	 * 获得用户拼购号码.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/record/public/listUserSpellBuyRandomNumber/用户id/拼购id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userId 
	 * 			用户id.
	 * @param spellbuyId 
	 * 			拼购id
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/public/listUserSpellBuyRandomNumber/{userId}/{spellbuyId}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listUserSpellBuyRandomNumber(
			@PathVariable String userId,
			@PathVariable Long spellbuyId,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		List<String> numberList = new ArrayList<String>();
		try
		{
			List<RandomNumber> randomNumbers = randomNumberFacade.listByUserId_spellbuyId(userId, spellbuyId);
			for(final RandomNumber entity: randomNumbers)
			{
				final String[] numbers = entity.getRandomNumber().split(",");
			    for(int index = 0; index < numbers.length; ++index)
			    {
			    	numberList.add(numbers[index]);
			    }
			}
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("userId", userId);
		uiModel.put("spellbuyId", spellbuyId);
		uiModel.put("recordList", numberList);
		
		return uiModel;
	}

	/**
	 * 获得用户已中奖的.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/spellbuy/person/record/private/listUserLatestLottery/页数/每页多少个/用户id
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param page 
	 * 			第几页.
	 * @param count 
	 * 			每页多少个
	 * @param userId 
	 * 			用户id.
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/private/listUserRechargeRecord/{page}/{count}"}, method = RequestMethod.GET)
	@ResponseBody
	public Object listUserRechargeRecord(
			@PathVariable Integer page,
    		@PathVariable Integer count,
			HttpServletRequest request,
			HttpServletResponse response)
	{
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,count);
		String userId = null;
			
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			pageBean = orderQueryFacade.listRechargeOrderPaymentByUserId(pageParam,userId);
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("userId", userId);
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
