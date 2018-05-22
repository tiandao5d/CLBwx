package com.genlot.ushop.web.admin.account.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.enums.PlatformEnum;
import com.genlot.common.enums.ProvinceEnum;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.entity.AccountFundType;
import com.genlot.ucenter.facade.account.service.AccountFundTypeFacade;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.web.admin.permission.controller.AdminRoleController;

@Controller
@RequestMapping(value = "/account/fundType")
public class AccountFundTypeController {

	@Autowired
	AccountFundTypeFacade accountFundTypeFacade;
	
	@Autowired
	private PmsFacade pmsFacade;

	private static final Logger log = LoggerFactory
			.getLogger(AccountFundTypeController.class);

	// 获得全部货币列表
	@ResponseBody
	@RequestMapping(value = "/list", method = RequestMethod.GET)
		public Object list() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, String> fundTypeMap = accountFundTypeFacade.getIdAndFundName();
		List<Map> fundTypeMapList = new ArrayList<Map>();
		Set<Entry<String, String>> sets = fundTypeMap.entrySet();
		for (Entry<String, String> obj : sets) {
			Map<String, Object> typeMap = new HashMap<String, Object>();
			typeMap.put("value", obj.getKey());
			typeMap.put("desc", obj.getValue());
			fundTypeMapList.add(typeMap);
		}
		uiModel.put("recordList", fundTypeMapList);
		return uiModel;
	}
		
	// 获得货币列表
	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			Integer page,
			Integer rows,
			String fundName,
			String id,
			String comments, 
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
			paramMap.put("id", id);
			paramMap.put("fundName", fundName);
			paramMap.put("comments", comments);
			log.debug(paramMap.toString());
			pageBean = accountFundTypeFacade.listPage(pageParam, paramMap);
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

		AccountFundType accountFundType = accountFundTypeFacade.getById(id);

		uiModel.put("accountFundType", accountFundType);

		return uiModel;
	}
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		List accountProvince = ProvinceEnum.toList();
		List platfromList = PlatformEnum.toList();
		uiModel.put("accountProvince", accountProvince);
		uiModel.put("platfromList", platfromList);
		return uiModel;
	}

	// 新增管理员角色
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public Object add(
			String fundName,
			String comments, 
			Integer provinceId, 
			Integer platfromTypeId, 
			Integer agent, 
			String parentId,
			String gameId,
			HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		AccountFundType accountFundType = new AccountFundType();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			accountFundType.setFundName(fundName);
			accountFundType.setComments(comments);
			accountFundType.setProvinceId(provinceId);
			accountFundType.setPlatformId(platfromTypeId);
			accountFundType.setAgent(agent);
			accountFundType.setParentId(parentId);
			accountFundType.setGameId(gameId);
			accountFundTypeFacade.insert(accountFundType);
			
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.SUCCESS, "添加资金类型", admin,
					WebUtils.getIpAddr(request));

		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.ERROR, "添加资金类型", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		
		
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 更新资金类型
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public Object update(Long id,
			String fundName,
			String comments,
			Integer provinceId, 
			Integer platfromTypeId, 
			Integer agent, 
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		if (id.intValue() < 1002) {
			uiModel.put("data", "THIS FUNDTYPE CANNOT BY UPDATE");
			return uiModel;
		}
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			AccountFundType accountFundType = accountFundTypeFacade.getById(id);
			accountFundType.setFundName(fundName);
			accountFundType.setComments(comments);
			accountFundType.setProvinceId(provinceId);
			accountFundType.setPlatformId(platfromTypeId);
			accountFundType.setAgent(agent);
			accountFundTypeFacade.update(accountFundType);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "编辑资金类型", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "编辑资金类型", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 删除
	@ResponseBody
	@RequestMapping(value = "/delete", method = RequestMethod.POST)
	public Object delete(Long id, HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			accountFundTypeFacade.deleteById(id);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.SUCCESS, "添加资金类型", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.ERROR, "删除资金类型", admin,
					WebUtils.getIpAddr(request));
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
