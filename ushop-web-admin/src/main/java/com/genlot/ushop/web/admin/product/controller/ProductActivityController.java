package com.genlot.ushop.web.admin.product.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

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
import com.genlot.ucenter.facade.account.entity.AccountFundType;
import com.genlot.ucenter.facade.account.exceptions.AccountBizException;
import com.genlot.ucenter.facade.account.service.AccountFundTypeFacade;
import com.genlot.ushop.facade.product.entity.ProductActivity;
import com.genlot.ushop.facade.product.enums.ProductActivityStatusEnum;
import com.genlot.ushop.facade.product.enums.ProductActivityTypeEnum;
import com.genlot.ushop.facade.product.service.ProductActivityFacade;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;

/** 
 * Project Name:ushop-web-admin 
 * 说明 ：商品活动控制类
 * @Date:2017年4月13日下午2:11:44 
 * @author: KDS
 *     dongsheng.kang@lotplay.cn 
 * 
 */  
@Controller
@RequestMapping(value = "/product/activity")
public class ProductActivityController {
	
	private static final Logger log = LoggerFactory.getLogger(ProductActivityController.class);
	
	@Autowired
	private ProductActivityFacade productActivityFacade;
	
	@Autowired
	private AccountFundTypeFacade accountFundTypeFacade;

	// 获得商品获得列表
	@SuppressWarnings("rawtypes")
	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			Integer page,
			Integer rows,
			String name,
			Integer status,
			Integer province,
			HttpServletRequest request) {
		
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;
			
		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} 
		else {
			pageParam = new PageParam(page, rows);
		}
		try {
			paramMap.put("name", name);
			paramMap.put("status", status);
			paramMap.put("province", province);
			//log.debug(paramMap.toString());
			pageBean = productActivityFacade.listPage(pageParam, paramMap);
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
			
	@ResponseBody
	@RequestMapping(value = "/getById", method = RequestMethod.GET)
	public Object getById(Long id) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		ProductActivity productActivity = productActivityFacade.getById(id);
		uiModel.put("productActivity", productActivity);
		return uiModel;
	}
				
			
	// 新增活动
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public Object add(
			String name,
			Integer type, 
			String beginTime, 
			String endTime,
			String deadline,
			Integer upperLimit,
			Integer fundType,
			Integer province) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		ProductActivity productActivity = new ProductActivity();
		try {
			
			productActivity.setName(name);
			productActivity.setFundType(fundType);
			productActivity.setType(type);
			productActivity.setBeginTime(beginTime);
			productActivity.setEndTime(endTime);
			productActivity.setDeadline(deadline);
			productActivity.setUpperLimit(upperLimit);
			productActivity.setStatus(ProductActivityStatusEnum.SIGNUP.getValue());
			productActivity.setProvince(province);
//			if (activityType.equals(ProductActivityTypeEnum.SPECIAL_POINT)) {
//				if (fundType == null || province == null) {
//					throw BizException.PARAM_ERROR;
//				}
//				AccountFundType payFund = accountFundTypeFacade.getById(fundType.longValue());
//				if (payFund == null) {
//					throw AccountBizException.ACCOUNT_FUND_TYPE_EXIT;
//				}
//				if (payFund.getProvinceId().equals(province)) {
//					throw AccountBizException.ACCOUNT_FUND_TYPE_EXIT;
//				}
//				
//				productActivity.setFundType(fundType);
//				
//			}
		
			productActivityFacade.insert(productActivity);		
			
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
			
	// 更新
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public Object update(
			Long id,
			String name,
			String type, 
			String beginTime, 
			String endTime,
			String deadline,
			Integer upperLimit,
			Integer fundType,
			Integer province) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
//			ProductActivity productActivity = productActivityFacade.getById(id);
//			productActivity.setName(name);
//			productActivity.setType(type);
//			productActivity.setBeginTime(beginTime);
//			productActivity.setEndTime(endTime);
//			productActivity.setDeadline(deadline);
//			productActivity.setUpperLimit(upperLimit);
//			productActivityFacade.insert(productActivity);
		}
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
			
	// 删除	
	@ResponseBody
	@RequestMapping(value = "/deleteById", method = RequestMethod.POST)
	public Object deleteById(Long id) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			productActivityFacade.deleteById(id);		
		}
		catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}
	
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		List productActivityTypeList = ProductActivityTypeEnum.toList();
		List productActivityStatusList = ProductActivityStatusEnum.toList();
			        
		uiModel.put("productActivityTypeList", productActivityTypeList);			        
		uiModel.put("productActivityStatusList", productActivityStatusList);
		return uiModel;
	}
			
	protected void setErrorMessage(Exception exception, Map<String, Object> uiModel) {
		if (exception instanceof BizException) {
			BizException e = (BizException) exception;
			uiModel.put("error", e.getCode());
			uiModel.put("error_description", e.getMsg());
		} 
		else {
			uiModel.put("error", 0);
			uiModel.put("error_description", "unknown error");
		}
	}
}
