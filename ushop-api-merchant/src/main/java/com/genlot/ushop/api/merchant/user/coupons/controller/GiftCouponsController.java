package com.genlot.ushop.api.merchant.user.coupons.controller;

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

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.ucenter.facade.account.entity.AccountCoupons;
import com.genlot.ucenter.facade.account.entity.AccountCouponsType;
import com.genlot.ucenter.facade.account.enums.AccountCouponsStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.enums.CouponsTypeEnum;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
import com.genlot.ucenter.facade.account.service.AccountCouponsFacade;
import com.genlot.ucenter.facade.account.service.CouponsCacheFacade;
import com.genlot.ucenter.facade.account.service.CouponsFacade;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.promotion.entity.PromoterInfo;
import com.genlot.ucenter.facade.promotion.enums.PromoterTypeEnum;
import com.genlot.ucenter.facade.promotion.exceptions.PromotionBizException;
import com.genlot.ucenter.facade.promotion.service.PromoterFacade;
import com.genlot.ucenter.facade.promotion.service.PromotionQueryFacade;
/**
 * 获得当前账户消费券账户列表信息控制类

 * @author Kangds
 *         E-mail:dongsheng.kang@lotplay.cn
 * @version 创建时间：2017年2月28日 下午3:35:06
 * 
 */
@Controller
@RequestMapping(value = "/api/user/coupons/gift")
public class GiftCouponsController {

	private static final Logger log = LoggerFactory.getLogger(GiftCouponsController.class);
	
	@Autowired
	private AccountCouponsFacade accountCouponsFacade;
	
	@Autowired
	private CouponsCacheFacade couponsCacheFacade;
	
	@Autowired
	private PromoterFacade promoterFacade;
	
	/**
	 * 礼品券列表.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/coupons/gift/listBy
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param status 
	 * 			 状态：0 可使用  2(已使用) 3(已过期)
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/listBy/{status}/{page}/{rows}"}, method = RequestMethod.GET)
    @ResponseBody
    public Object listBy(
    		//0 ：可用  1：不可用（过期或者已使用）
    		@PathVariable Integer status,    	
    		@PathVariable Integer page,
    		@PathVariable Integer rows,
    		HttpServletRequest request,HttpServletResponse response) {  
		PageParam pageParam = null;	
		if(page.intValue()== 0 || rows.intValue() == 0){
			 pageParam = new PageParam(1,10); 
		}else{
			 pageParam = new PageParam(page,rows); 
		}
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		PageBean pageBean = null;
		//获得当前时间
		String currentTime = DateUtils.formatDate(new Date(), DateUtils.DATE_FORMAT_DATETIME);
		try
		{
			String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			Integer fundType = AccountFundTypeEnum.COUPONS.getValue();	
			Integer couponsType = CouponsTypeEnum.GIFT_EXCHANGE.getValue();	
			pageBean = accountCouponsFacade.listPageByUser(pageParam, couponsType, fundType, userNo, status, currentTime);
			
			//获得当前券账户券ID列表
			List<Integer> couponsIdList = new ArrayList<Integer>();
			if(pageBean.getTotalCount() != 0) {
				for(int index = 0; index < pageBean.getRecordList().size(); ++index) {
					AccountCoupons accountCoupons = (AccountCoupons)pageBean.getRecordList().get(index);
					couponsIdList.add(Integer.valueOf(accountCoupons.getCouponsId()));
				}
				//根据券ID获得券对象列表
				List<AccountCouponsType> coupons = new  ArrayList<AccountCouponsType>();
				coupons = couponsCacheFacade.listCouponTypeByIds(couponsIdList);
				if (coupons.size() != pageBean.getRecordList().size()) {
					throw AccountBizException.COUPONS_TYPE_IS_NOT_EXIT;
				}			
				
				//根据券对象实例券账户Object字段
				for(int index = 0; index < pageBean.getRecordList().size(); ++index) {
					AccountCoupons accountCoupons = (AccountCoupons)pageBean.getRecordList().get(index);
					AccountCouponsType info = coupons.get(index);
					accountCoupons.setObject(info);
				}	
			}
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}				
		// 成功
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		return uiModel;
	}
	
	/**
	 * 礼品券兑换(站点推广员限定).
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/coupons/gift/use
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userNo 
	 * 			 需要兑换的用户id
	 * @param couponsNo 
	 * 			 兑换劵码
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/use"}, method = RequestMethod.POST)
    @ResponseBody
    public Object use(
    		String ownerNo,
    		String couponsNo,
    		HttpServletRequest request,
    		HttpServletResponse response) {
		
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		
		try
		{
			String promoterNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			PromoterInfo promoter = promoterFacade.getPromoterByUserNo(promoterNo, false);
			if (promoter == null || promoter.getType() != PromoterTypeEnum.STATION.getValue()) {
				throw PromotionBizException.PROMOTER_NOT_IS_EXIST;
			}
			
			// 使用劵
			AccountCoupons coupons = accountCouponsFacade.use(promoterNo, ownerNo, couponsNo);
			uiModel.putAll(BeanMapUtil.convertBean(coupons));
			
			// 记录提成值
			promoter.increaseCash(coupons.getBalance());
			promoterFacade.update(promoter);
			
			uiModel.put("result", "SUCCESS");
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
	 * 礼品券兑换总额(站点推广员限定).
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/coupons/gift/use/bills/total/get
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userNo 
	 * 			 需要兑换的用户id
	 * @param couponsNo 
	 * 			 兑换劵码
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/use/bills/total/get"}, method = RequestMethod.GET)
    @ResponseBody
    public Object getByTotal(
    		HttpServletRequest request,
    		HttpServletResponse response) {
		
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		
		try
		{
			String promoterNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			PromoterInfo promoter = promoterFacade.getPromoterByUserNo(promoterNo, false);
			if (promoter == null || promoter.getType() != PromoterTypeEnum.STATION.getValue()) {
				throw PromotionBizException.PROMOTER_NOT_IS_EXIST;
			}
			
			uiModel.put("daily", promoter.getDailyCash());
			uiModel.put("monthly", promoter.getMonthlyCash());
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
	 * 礼品券兑换流水(站点推广员限定).
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/coupons/gift/use/bills/listBy
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userNo 
	 * 			 需要兑换的用户id
	 * @param couponsNo 
	 * 			 兑换劵码
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/use/bills/listBy/{page}/{rows}/{beginTime}/{endTime}"}, method = RequestMethod.GET)
    @ResponseBody
    public Object listByBills(  	
    		@PathVariable Integer page,
    		@PathVariable Integer rows,
    		@PathVariable String beginTime,
    		@PathVariable String endTime,
    		HttpServletRequest request,
    		HttpServletResponse response) {
		
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		PageParam pageParam = null;	
		if(page.intValue()== 0 || rows.intValue() == 0){
			 pageParam = new PageParam(1,10); 
		}else{
			 pageParam = new PageParam(page,rows); 
		}
		PageBean pageBean = null;
		try
		{
			String promoterNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			PromoterInfo promoter = promoterFacade.getPromoterByUserNo(promoterNo, false);
			if (promoter == null || promoter.getType() != PromoterTypeEnum.STATION.getValue()) {
				throw PromotionBizException.PROMOTER_NOT_IS_EXIST;
			}
			
			String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			Integer fundType = AccountFundTypeEnum.COUPONS.getValue();	
			Integer couponsType = CouponsTypeEnum.GIFT_EXCHANGE.getValue();	
			pageBean = accountCouponsFacade.listPageByBills(
					pageParam, 
					couponsType, 
					fundType, 
					null, 
					userNo, 
					AccountCouponsStatusEnum.USED.getValue(), 
					beginTime, 
					endTime);
			
			//获得当前券账户券ID列表
			List<Integer> couponsIdList = new ArrayList<Integer>();
			if(pageBean.getTotalCount() != 0) {
				for(int index = 0; index < pageBean.getRecordList().size(); ++index) {
					AccountCoupons accountCoupons = (AccountCoupons)pageBean.getRecordList().get(index);
					couponsIdList.add(Integer.valueOf(accountCoupons.getCouponsId()));
				}
				//根据券ID获得券对象列表
				List<AccountCouponsType> coupons = new  ArrayList<AccountCouponsType>();
				coupons = couponsCacheFacade.listCouponTypeByIds(couponsIdList);
				if (coupons.size() != pageBean.getRecordList().size()) {
					throw AccountBizException.COUPONS_TYPE_IS_NOT_EXIT;
				}			
				
				//根据券对象实例券账户Object字段
				for(int index = 0; index < pageBean.getRecordList().size(); ++index) {
					AccountCoupons accountCoupons = (AccountCoupons)pageBean.getRecordList().get(index);
					AccountCouponsType info = coupons.get(index);
					accountCoupons.setObject(info);
				}	
			}
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}		
		
		// 成功
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
