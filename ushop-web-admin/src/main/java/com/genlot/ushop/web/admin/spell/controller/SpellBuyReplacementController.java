package com.genlot.ushop.web.admin.spell.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ucenter.facade.user.entity.MerchantInfo;
import com.genlot.ucenter.facade.user.entity.UserInfo;
import com.genlot.ucenter.facade.user.enums.MerchantStatusEnum;
import com.genlot.ucenter.facade.user.enums.UserStatusEnum;
import com.genlot.ucenter.facade.user.enums.UserTypeEnum;
import com.genlot.ucenter.facade.user.service.MerchantFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.ushop.facade.lottery.entity.LatestLottery;
import com.genlot.ushop.facade.lottery.entity.LotteryExpress;
import com.genlot.ushop.facade.lottery.entity.LotteryReplacement;
import com.genlot.ushop.facade.lottery.enums.LotteryLogisticsStatusEnum;
import com.genlot.ushop.facade.lottery.enums.LotteryReplacementEnum;
import com.genlot.ushop.facade.lottery.service.LatestLotteryFacade;
import com.genlot.ushop.facade.lottery.service.LotteryExpressFacade;
import com.genlot.ushop.facade.lottery.service.LotteryReplacementFacade;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;



/**
 * @author Kds
 * 
 * @date 2016-12-13 17:23:20
 * 
 * 后台换货流程 控制类 
 */

@Controller
@RequestMapping( value= "/spellBuy/replacement")
public class SpellBuyReplacementController {
	
	private static final Logger log = LoggerFactory.getLogger(SpellBuyReplacementController.class);
	
	@Autowired
	LotteryReplacementFacade  lotteryReplacementFacade;
	
	@Autowired
	LatestLotteryFacade  latestLotteryFacade;
	
	@Autowired
	ProductQueryFacade  productQueryFacade;
	
	@Autowired
	LotteryExpressFacade  lotteryExpressFacade;
	
	@Autowired
	MerchantFacade merchantFacade;
	
	@Autowired
	UserQueryFacade userQueryFacade;
	
	@RequestMapping(value="/listBy" ,method= RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			//分页
             Integer page,
             Integer rows,             
             //商品名称
             String  productName,             
             //商品期数
             String productPeriod,               
             //状态
             String  status,             
             //获奖者
             String userName, 
             String merchantNo,
             String mobileNo,
			 HttpServletRequest request,
			 HttpSession session
			) {
		
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;	
		 
		
		
		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		
		if(StringUtils.isNotBlank(mobileNo)){
			UserInfo userInfo  = userQueryFacade.getUserInfoByBindMobileNo(mobileNo);
			
			if (userInfo == null){
				paramMap.put("userNo", "NOEXIST");
			}else{
				String userId = userInfo.getUserNo();
				paramMap.put("userNo", userId);
			}		
			
		}
		
		try {	
			paramMap.put("productName", productName);	
			paramMap.put("productPeriod", productPeriod);
			paramMap.put("status", status);	
			paramMap.put("userName", userName);
			
			paramMap.put("merchantNo", merchantNo);
			log.debug(paramMap.toString());
			
		    pageBean = lotteryReplacementFacade.listPage(pageParam, paramMap);  
		    
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}	
		
	
		
	
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());

		return uiModel;
	}


	//订单详情
	@RequestMapping(value = {"/getBySpellBuyId"}, method = RequestMethod.GET)
	@ResponseBody
	public Object getBySpellBuyId(Long spellbuyProductId)
	{		
		Map<String,Object> uiModel = new HashMap<String,Object>();
		LatestLottery latestLottery =null;
		Product productInfo = null;
		LotteryExpress lotteryExpress = null;
		LotteryReplacement lotteryReplacement = null;
		try{
			 latestLottery = latestLotteryFacade.getBySpellbuyId(spellbuyProductId);				
			 productInfo = productQueryFacade.getById(latestLottery.getProductId());
			 lotteryExpress = lotteryExpressFacade.getById(latestLottery.getId());
			 lotteryReplacement = lotteryReplacementFacade.getById(latestLottery.getLotteryReplacementId().longValue());
		} 
		catch(Exception exception){
			setErrorMessage(exception,uiModel);
			return uiModel;
		}	
		
		//订单本身信息
		uiModel.put("lotteryReplacement", lotteryReplacement);
				
		//订单本身信息
		uiModel.put("latestLottery", latestLottery);
		//订单商品信息
		uiModel.put("productInfo", productInfo);
		//快递发货信息
		uiModel.put("orderExpress", lotteryExpress);

		
		return uiModel;
	}
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		uiModel.put("LotteryReplacementStatus",  LotteryReplacementEnum.toList());	
		uiModel.put("lotteryStatusList", LotteryLogisticsStatusEnum.toList());
	
		return uiModel;
	}
	
	protected void setErrorMessage(Exception exception,
			Map<String, Object> uiModel) {
		if (exception instanceof BizException) {
			BizException e = (BizException) exception;
			uiModel.put("error", e.getCode());
			uiModel.put("error_description", e.getMsg());
		} else {
			uiModel.put("error", 0);
			uiModel.put("error_description", "unknown error");
		}
	}
	

}
