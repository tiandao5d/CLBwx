package com.genlot.ushop.web.admin.account.controller;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.string.StringUtil;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.entity.AccountBill;
import com.genlot.ucenter.facade.account.entity.AccountCoupons;
import com.genlot.ucenter.facade.account.entity.AccountCouponsType;
import com.genlot.ucenter.facade.account.enums.AccountBillStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountCouponsStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.enums.CouponsTypeEnum;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
import com.genlot.ucenter.facade.account.service.AccountBillFacade;
import com.genlot.ucenter.facade.account.service.AccountCouponsFacade;
import com.genlot.ucenter.facade.account.service.CouponsCacheFacade;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.promotion.entity.PromoterInfo;
import com.genlot.ucenter.facade.promotion.enums.PromoterTypeEnum;
import com.genlot.ucenter.facade.promotion.exceptions.PromotionBizException;
import com.genlot.ucenter.facade.promotion.service.PromoterFacade;

@Controller
@RequestMapping("/account/bill")
public class AccountBillController {
	
	private static final Logger log = LoggerFactory.getLogger(AccountBillController.class);
	
	@Autowired
	private AccountBillFacade accountBillFacade;
	
	@Autowired
	private PmsFacade pmsFacade;
	
	@Autowired
	private PromoterFacade promoterFacade;
	
	@Autowired
	private AccountCouponsFacade accountCouponsFacade;
	
	@Autowired
	private CouponsCacheFacade couponsCacheFacade;
	
	
	/**
	 * 对账列表.(只查询审核中和已打款的对账信息)
	 * @param	
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/listBy")
	@ResponseBody
	public Object listBy(
			Integer page,
			Integer rows,
			Integer province,
			String month,
			String stationName,
			HttpServletRequest request,HttpServletResponse response) {
		PageParam pageParam = null;	
		if(page == null || rows == null){
			 pageParam = new PageParam(1,10); 
		}else{
			 pageParam = new PageParam(page,rows); 
		}
		Map<String,Object> uiModel = new HashMap<String,Object>();
		Map<String,Object> paramMap = new HashMap<String,Object>();
		PageBean pageBean = null;
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		List<Integer> statusList=new ArrayList<Integer>();
		try
		{	
			
			//审核中，打款中，打款成功，打款失败四种种状态
			statusList.add(AccountBillStatusEnum.AUDIT.getValue());
			statusList.add(AccountBillStatusEnum.REMITTING.getValue());
			statusList.add(AccountBillStatusEnum.REMIT.getValue());
			statusList.add(AccountBillStatusEnum.REMITFAIL.getValue());
			paramMap.put("statusList", statusList);
			paramMap.put("province", province);
			paramMap.put("month", month);
			paramMap.put("stationName", stationName);
			pageBean = accountBillFacade.listPage(pageParam,paramMap);	
		}
		catch (Exception exception)
		{
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
	 * 账单审核通过
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/account/bill/pass
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param LocalTransactionExecuter
	 * 			
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = {"/pass"}, method = RequestMethod.GET)
    @ResponseBody
    public Object pass(   	
    		 Long id,
    		HttpServletRequest request,HttpServletResponse response) {  
		Map<String,Object> uiModel = new HashMap<String,Object>();	

		try
		{	
			
			AccountBill accountBill = accountBillFacade.getById(id);
			if(accountBill.getStatus() == AccountBillStatusEnum.AUDIT.getValue()){//审核中			
			PromoterInfo promoterInfo = promoterFacade.getPromoterByUserNo(accountBill.getUserNo(), false);
			if (promoterInfo == null || promoterInfo.getType() != PromoterTypeEnum.STATION.getValue()) {
				throw PromotionBizException.PROMOTER_NOT_IS_EXIST;
			}
			accountBillFacade.transfer(accountBill,promoterInfo.getAlipayAccount());//支付宝转账
			}
		}
		catch (Exception exception)
		{
			log.error(exception.toString());
			setErrorMessage(exception,uiModel);
			return uiModel;
		}				
		// 成功
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
	
	

	
	/**
	 * 礼品券兑换流水. 
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @param userNo 
	 * 			 需要兑换的用户id
	 * @param couponsNo 
	 * 			 兑换劵码
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = {"/listByGift"}, method = RequestMethod.GET)
    @ResponseBody
    public Object listByGift(  	
                      Integer page,
    		          Integer rows,
    		          String beginTime,
    		          String endTime,
    		          String promoterNo,
    		HttpServletRequest request,
    		HttpServletResponse response) {
		
		Map<String,Object> uiModel = new HashMap<String,Object>();	
		PageParam pageParam = null;	
		if(page == null || rows == null){
			 pageParam = new PageParam(1,10); 
		}else{
			 pageParam = new PageParam(page,rows); 
		}
		PageBean pageBean = null;
		
		PromoterInfo promoter;
		try
		{
			promoter = promoterFacade.getPromoterByUserNo(promoterNo, false);
			if (promoter == null || promoter.getType() != PromoterTypeEnum.STATION.getValue()) {
				throw PromotionBizException.PROMOTER_NOT_IS_EXIST;
			}
			
			Integer fundType = AccountFundTypeEnum.COUPONS.getValue();	
			Integer couponsType = CouponsTypeEnum.GIFT_EXCHANGE.getValue();	
			pageBean = accountCouponsFacade.listPageByBills(
					pageParam, 
					couponsType, 
					fundType, 
					null, 
					promoterNo, 
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
		uiModel.put("province", promoter.getStationProvince());
		uiModel.put("stationName", promoter.getName());
		uiModel.put("recordList", pageBean.getRecordList());
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
