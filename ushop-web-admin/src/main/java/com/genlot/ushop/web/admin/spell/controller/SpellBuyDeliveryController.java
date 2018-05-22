package com.genlot.ushop.web.admin.spell.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
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
import com.genlot.ucenter.facade.user.service.MerchantFacade;
import com.genlot.ucenter.facade.user.service.UserQueryFacade;
import com.genlot.ushop.facade.lottery.entity.LatestLottery;
import com.genlot.ushop.facade.lottery.entity.LotteryExpress;
import com.genlot.common.enums.ExpressCompanyEnum;
import com.genlot.ushop.facade.lottery.enums.LotteryLogisticsStatusEnum;
import com.genlot.ushop.facade.lottery.service.LatestLotteryFacade;
import com.genlot.ushop.facade.lottery.service.LotteryExpressFacade;
import com.genlot.ushop.facade.product.entity.Product;
import com.genlot.ushop.facade.product.service.ProductQueryFacade;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;

@Controller
@RequestMapping("/spellBuy/delivery")
public class SpellBuyDeliveryController {
	
	@Autowired
	LatestLotteryFacade latestLotteryFacade;	
	@Autowired
	ProductQueryFacade productQueryFacade;
	@Autowired
	LotteryExpressFacade lotteryExpressFacade;
	@Autowired
	UserQueryFacade userQueryFacade;
	@Autowired
	MerchantFacade merchantFacade;

	// 发货、未发货列表(两者之和等于中奖)
	@RequestMapping(value = { "/listBy" }, method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			// 页码
			Integer page,
			// 一页条数
			Integer rows,
			// 商品期数
			String productPeriod,
			// 商品名称
			String productName,
			// 商家名称
			String merchantName,
			String merchantNo,
			// 获奖者
			String userId,
			String userName,
			String mobileNo,
			//发货状态(-1表示请求未发货状态  1表示请求已发货状态)
			Integer isDelivery,			
			String status,			
			HttpServletRequest request,
			HttpSession session) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;
		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		/*("揭晓中", 0),
		("已开奖，未填写收货地址", 1), 
		("已填写地址，未发货", 2),
		("已发货，未确认收货", 3),
		("已收货，未晒单", 4),
		("交易完成", 5),
		("弃奖",6);*/
		
		// 状态1 (为2表示未发货,5表示已发货)  小于等于status
		String lessStatus = null;
		// 状态2(1表示未发货，为3表示已发货)  大于等于status
		String olderStatus = null;
		
		//弃奖状态归属在未发货列表中
		String abandonStatus = null;
				
		if(status == null || status == ""){
			//未发货是大于等1，小于等于2
			//已发货是大于等于3，小于等于5
			if(isDelivery == 1){
				lessStatus = "5";
				olderStatus= "3";
			}else{
				lessStatus = "2";
				olderStatus= "1";
				abandonStatus = "6";
			}
		}	
		
		//由于中奖记录中没有手机号码，所以最终还是利用userNo查找
		if(StringUtils.isNotBlank(mobileNo)){
			UserInfo userInfo  = userQueryFacade.getUserInfoByBindMobileNo(mobileNo);
			
			if (userInfo == null){
				paramMap.put("userId", "NOEXIST");
			}else{
				 userId = userInfo.getUserNo();
				 paramMap.put("userId", userId);
				
			}		
			
		}		
		paramMap.put("productPeriod", productPeriod);
		paramMap.put("productName", productName);
		paramMap.put("merchantName", merchantName);
		paramMap.put("merchantId", merchantNo);		
		paramMap.put("userName", userName);
		paramMap.put("lessStatus", lessStatus);
		paramMap.put("olderStatus", olderStatus);
		paramMap.put("status", status);
		paramMap.put("abandonStatus", abandonStatus);

		try {

			pageBean = latestLotteryFacade.listPage(pageParam,
					paramMap);
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
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		uiModel.put("statusList", LotteryLogisticsStatusEnum.toList());
		uiModel.put("expressCompanyList", ExpressCompanyEnum.toList());

		return uiModel;
	}
	
	//订单详情
			@RequestMapping(value = {"/getById"}, method = RequestMethod.GET)
			@ResponseBody
			public Object getById(Long id)
			{		
				Map<String,Object> uiModel = new HashMap<String,Object>();
				LatestLottery latestLottery =null;
				Product productInfo = null;
				LotteryExpress lotteryExpress = null;
				try{
					 latestLottery = latestLotteryFacade.getBySpellbuyId(id);				
					 productInfo = productQueryFacade.getById(latestLottery.getProductId());
					 lotteryExpress = lotteryExpressFacade.getByOrderNo(latestLottery.getSpellbuyProductId());
				} 
				catch(Exception exception){
					setErrorMessage(exception,uiModel);
					return uiModel;
				}			
				
				//订单本身信息
				uiModel.put("latestLottery", latestLottery);
				//订单商品信息
				uiModel.put("productInfo", productInfo);
				//快递发货信息
				uiModel.put("orderExpress", lotteryExpress);
				
			
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
