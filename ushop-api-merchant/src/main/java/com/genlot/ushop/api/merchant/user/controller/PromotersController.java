package com.genlot.ushop.api.merchant.user.controller;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.string.StringTools;
import com.genlot.ucenter.facade.account.entity.Account;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.service.AccountQueryFacade;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.oauth.service.OAuthManagementFacade;
import com.genlot.ucenter.facade.promotion.entity.PromoterInfo;
import com.genlot.ucenter.facade.promotion.entity.PromoterSubordinateInfo;
import com.genlot.ucenter.facade.promotion.entity.PromotionRebatesHistory;
import com.genlot.ucenter.facade.promotion.enums.PromoterRelationshipTypeEnum;
import com.genlot.ucenter.facade.promotion.enums.PromoterTypeEnum;
import com.genlot.ucenter.facade.promotion.exceptions.PromotionBizException;
import com.genlot.ucenter.facade.promotion.service.PromoterFacade;
import com.genlot.ucenter.facade.promotion.service.PromoterSubordinateFacade;
import com.genlot.ucenter.facade.promotion.service.PromotionQueryFacade;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.entity.UserAddress;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ucenter.facade.user.service.UserAddressFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ushop.api.merchant.entity.vo.PromoterDetailVo;
import com.genlot.ushop.api.merchant.entity.vo.PromoterRegisterDetailVo;
import com.genlot.ushop.api.merchant.entity.vo.PromoterSubordinateDetailVo;
import com.genlot.ushop.api.merchant.entity.vo.PromotionStationDetailVo;
import com.genlot.ushop.facade.product.entity.SpellBuyProduct;


@Controller
@RequestMapping(value = "/api/user/promotion")
public class PromotersController {
	
	private static final Logger log = LoggerFactory.getLogger(PromotersController.class);
	

	@Autowired
	private PromoterFacade promoterFacade;
	
	@Autowired
	private PromoterSubordinateFacade promoterSubordinateFacade;
	
	@Autowired
	private PromotionQueryFacade promotionQueryFacade;
	
	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private AccountQueryFacade accountQueryFacade;
	
	/**
	 * 申请推广员.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/promotion/promoter/register
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * 			.
	 * @body  json data 
	 * 			Content-Type: application/json;charset=UTF-8 
	 * 			格式:{"type":"推广类型","name":"姓名","cardNo":"身份证 ","bankNo":"银行卡号","bankName":"开户银行","bankProvince":"开户省份","bankCity":"开户城市","bankArea":"开户区域","stationAddress":"站点详细地址","stationId":"绑定站主id","stationNo":"站点编号","stationProvince":"站点省份","stationCity":"站点城市","stationArea":"站点区/县"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "promoter/register", method = RequestMethod.POST)
    @ResponseBody
    public Object promoterRegister(
    		@RequestBody PromoterRegisterDetailVo info,
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		// 用户ID
		String userId = null;		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		long id = 0;
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			// 获得会员信息
			MemberInfo member = memberInfoFacade.getMemberByUserNo(userId);
			
			// 申请推广员
			if (info.getType().equals(PromoterTypeEnum.PERSONAL.getValue()))
			{
				id = promoterFacade.registerPromoter(
						userId, 
						member.getMemberName(), 
						info.getName(), 
						info.getCardNo(), 
						info.getBankNo(), 
						info.getBankName(), 
						info.getBankProvince(), 
						info.getBankCity(), 
						info.getStationArea(), 
						info.getStationId());
			}
			else if (info.getType().equals(PromoterTypeEnum.STATION.getValue()))
			{
				id = promoterFacade.registerStation(
						userId,
						member.getMemberName(), 
						info.getName(), 
						info.getCardNo(), 
						info.getBankNo(), 
						info.getBankName(), 
						info.getBankProvince(), 
						info.getBankCity(), 
						info.getStationArea(),
						info.getStationNo(), 
						info.getStationProvince(), 
						info.getStationCity(), 
						info.getStationArea(), 
						info.getStationAddress(),
						info.getAlipayAccount());
			}
			else
			{
				throw PromotionBizException.PROMOTER_STATUS_TYPE_INVALID; 
			}
			
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		// 成功返回
		uiModel.put("succeed", id);
        return uiModel;
    }
	
	/**
	 * 推广员信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/promotion/promoter/get
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/promoter/get", method = RequestMethod.POST)
    @ResponseBody
    public Object getPromoter(
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		// 用户ID
		String userId = null;		
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			PromoterInfo info = promoterFacade.getPromoterByUserNo(userId,true);
			if (info == null)
			{
				throw PromotionBizException.PROMOTER_NOT_IS_EXIST;
			}
					
			Account account = accountQueryFacade.getAccountByUserNo_fundType(userId, Long.valueOf(AccountFundTypeEnum.POINT.getValue()));
			if (account == null)
			{
				throw PromotionBizException.PROMOTER_NOT_IS_EXIST;
			}
			
			uiModel.put("promoter", info);
			uiModel.put("balance", account.getBalance());
									
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		return uiModel;
	}
	
	/**
	 * 邀请者信息.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/promotion/inviter/get
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/inviter/get", method = RequestMethod.GET)
    @ResponseBody
    public Object getInviter(
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		// 用户ID
		String userId = null;		
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
						
			PromoterInfo info = promoterFacade.getInviterByUserNo(userId);
			if (info != null)
			{
				PromoterDetailVo vo = new PromoterDetailVo();
				vo.setStationAddress(info.getStationAddress());
				vo.setStationArea(info.getStationArea());
				vo.setStationCity(info.getStationCity());
				vo.setStationId(info.getStationId());
				vo.setStationNo(info.getStationNo());
				vo.setStationProvince(info.getStationProvince());
				vo.setType(info.getType());
				vo.setUserName(info.getUserName());
				vo.setUserNo(info.getUserNo());
				uiModel.put("inviter", vo);
			}
			else
			{
				uiModel.put("inviter", 0);
			}
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		return uiModel;
	}
	
	/**
	 * 查询站点列表.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/promotion/station/list/页数
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * 			.
	 * @body  json data 
	 * 			Content-Type: application/json;charset=UTF-8 
	 * 			格式:{"stationProvince":"站点省份","stationCity":"站点城市","stationArea":"站点区/县"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/station/list/{page}", method = RequestMethod.POST)
    @ResponseBody
    public Object listByStation(
    		@PathVariable Integer page,
    		@RequestBody PromotionStationDetailVo info,
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		
		PageBean pageBean = null;
		PageParam pageParam = new PageParam(page,10);
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		List<PromotionStationDetailVo> records = new ArrayList<PromotionStationDetailVo>();
		try
		{
			pageBean = promoterFacade.listPageStationByAddress(
					pageParam,
					info.getStationProvince(),
					info.getStationCity(),
					info.getStationArea());
			
			for(int index = 0; index < pageBean.getRecordList().size(); ++index)
			{
				PromoterInfo promoter = (PromoterInfo)pageBean.getRecordList().get(index);
				PromotionStationDetailVo vo = new PromotionStationDetailVo();
				vo.setStationId(promoter.getId().intValue());
				vo.setStationArea(promoter.getStationArea());
				vo.setStationCity(promoter.getStationCity());
				vo.setStationProvince(promoter.getStationProvince());
				vo.setStationNo(promoter.getStationNo());
				records.add(vo);
			}
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", records);
		return uiModel;
	}
	
	/**
	 * 查询我的下家列表.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/promotion/subordinater/list/排序方式
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/subordinater/list/{type}", method = RequestMethod.GET)
    @ResponseBody
    public Object listBySubordinater(
    		@PathVariable Integer type,
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		// 用户ID
		String userId = null;		
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			List<Object> records = promoterSubordinateFacade.listSubordinateByUserNo(userId,type);
			List<PromoterSubordinateDetailVo> entitys = new ArrayList<PromoterSubordinateDetailVo>();
			for(int index = 0; index < records.size(); ++index)
			{
				PromoterSubordinateInfo info = (PromoterSubordinateInfo)records.get(index);
				PromoterSubordinateDetailVo vo = new PromoterSubordinateDetailVo();
				vo.setExpenditure(info.getExpenditure());
				vo.setType(info.getType());
				vo.setUserName(info.getUserName());
				vo.setCreateTime(info.getCreateTime());
				if(info.getParent().equals(userId))
				{
					vo.setRelationship(PromoterRelationshipTypeEnum.FIRST.getValue());
					vo.setRebates(info.getRebates());
				}
				else if(info.getSecondary().equals(userId))
				{
					vo.setRelationship(PromoterRelationshipTypeEnum.SECONDARY.getValue());
					vo.setRebates(info.getRewards());
				}
				else
				{
					continue;
				}
				entitys.add(vo);
			}
			uiModel.put("recordList", entitys);
		}
		catch (Exception exception)
		{
			setErrorMessage(exception,uiModel);
			return uiModel;
		}
		
		return uiModel;
	}
	
	/**
	 * 查询我的福利列表.
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/user/promotion/welfare/list
	 * @param	请求参数访问令牌
	 * @error   {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = "/welfare/list", method = RequestMethod.GET)
    @ResponseBody
    public Object listByWelfare(
    		HttpServletRequest request,
    		HttpServletResponse response) {  
		
		// Model View
		Map<String,Object> uiModel = new HashMap<String,Object>();
		// 用户ID
		String userId = null;		
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			List<Object> entitys = promotionQueryFacade.listRebatesHistoryOrderByTime_userNo(userId);
			
			uiModel.put("recordList", entitys);
		}
		catch (Exception exception)
		{
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
