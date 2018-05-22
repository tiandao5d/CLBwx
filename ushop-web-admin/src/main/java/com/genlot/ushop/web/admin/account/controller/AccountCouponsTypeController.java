package com.genlot.ushop.web.admin.account.controller;

import java.util.ArrayList;
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

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.ucenter.facade.account.entity.AccountCouponsType;
import com.genlot.ucenter.facade.account.enums.CouponsTypeEnum;
import com.genlot.ucenter.facade.account.service.CouponsCacheFacade;
import com.genlot.ucenter.facade.account.service.CouponsFacade;
import com.genlot.uplatform.facade.application.entity.AppInfo;
import com.genlot.uplatform.facade.application.enums.AppStatusEnum;
import com.genlot.uplatform.facade.application.service.AppQueryFacade;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;


/**
 * @author Kangds
 *         E-mail:dongsheng.kang@lotplay.cn
 * @version 创建时间：2017年2月22日 下午5:05:13
 *  消费券 控制类
 */

@Controller
@RequestMapping(value = "/account/coupons/type")
public class AccountCouponsTypeController {

	@Autowired
	private CouponsFacade couponsFacade;
	
	@Autowired
	private CouponsCacheFacade couponsCacheFacade;
	
	@Autowired
	private AppQueryFacade appQueryFacade;

	private static final Logger log = LoggerFactory.getLogger(AccountCouponsTypeController.class);
	
	/**
	 * 获取游戏券列表
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/admin/coupons/list
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/list", method = RequestMethod.GET)
	@ResponseBody
	public Object couponsList(HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		List<AccountCouponsType> list = null;
		try {
			
			Map<String, Object> paramMap = new HashMap<String, Object>();
			list = couponsFacade.listBy(paramMap);

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}

		uiModel.put("recordList", list);
		String json = JSON.toJSONString(uiModel);
		return json;
	}
	

	// 获得管理员分组列表
	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
	         // 分页
			Integer page, Integer rows,
			// 消费券名称
			String couponsName,
			// 类型
			String couponsType,
			HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		try {
			paramMap.put("couponsName", couponsName);
			paramMap.put("couponsType", couponsType);
			log.debug(paramMap.toString());
			pageBean = couponsFacade.listPage(pageParam, paramMap);
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

		AccountCouponsType AccountCouponsType = couponsFacade.getById(id);

		uiModel.put("coupons", AccountCouponsType);

		return uiModel;
	}	

	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		List couponsTypeList = CouponsTypeEnum.toList();

		uiModel.put("couponsTypeList", couponsTypeList);

		return uiModel;
	}

	// 新增消费券
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public Object add(
			String couponsName,
			String rule, 
			String couponsType, 
			Integer validPeriod) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		AccountCouponsType AccountCouponsType = new AccountCouponsType();
		try {
			AccountCouponsType.setCouponsName(couponsName);
			AccountCouponsType.setRule(rule);
			AccountCouponsType.setCouponsType(couponsType);
			AccountCouponsType.setValidPeriod(validPeriod);
			couponsFacade.insert(AccountCouponsType);

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}		
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 更新消费券
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public Object update(
			Long id,
			String couponsName,
			String rule,
			String couponsType, 
			Integer validPeriod) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			AccountCouponsType AccountCouponsType = couponsFacade.getById(id);
			AccountCouponsType.setCouponsName(couponsName);
			AccountCouponsType.setRule(rule);
			AccountCouponsType.setCouponsType(couponsType);
			AccountCouponsType.setValidPeriod(validPeriod);
			couponsFacade.update(AccountCouponsType);
			
			//清除缓存
			couponsCacheFacade.clearCouponType(id);
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}


	@ResponseBody
	@RequestMapping(value = "/delete", method = RequestMethod.POST)
	public Object delete(Long id) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			couponsFacade.deleteById(id);
			//清除缓存
			couponsCacheFacade.clearCouponType(id);			
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
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
