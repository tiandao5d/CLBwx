package com.genlot.ushop.web.admin.permission.controller;

import java.util.HashMap;
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
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.entity.PmsRole;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;

@Controller
@RequestMapping(value = "/admin/role")
public class AdminRoleController {

	@Autowired
	PmsFacade pmsFacade;

	private static final Logger log = LoggerFactory
			.getLogger(AdminRoleController.class);

	
	// 获得管理员分组列表
	@RequestMapping(value = "/list", method = RequestMethod.GET)
	@ResponseBody
	public Object list(
	// 分页
			Integer page, Integer rows,
			// 角色名称
			String roleName, HttpServletRequest request) {
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
			if (roleName != null) {
				roleName = roleName.trim();
			}

			paramMap.put("roleName", roleName);
			log.debug(paramMap.toString());
			pageBean = pmsFacade.listRoleForPage(pageParam, paramMap);
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

	// 通过ID获得adminRole
	@ResponseBody
	@RequestMapping(value = "/getById", method = RequestMethod.GET)
	public Object getById(Long id) {

		Map<String, Object> uiModel = new HashMap<String, Object>();

		PmsRole adminRole = pmsFacade.getRoleById(id);

		uiModel.put("adminRole", adminRole);

		return uiModel;
	}

	// 新增管理员角色
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public Object add(PmsRole adminRole, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			PmsRole roleType = pmsFacade.getMaxRoleType();
			int a = Integer.valueOf(roleType.getRoleType()).intValue() + 1;
			adminRole.setRoleType(a + "");
			pmsFacade.saveRole(adminRole);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.SUCCESS, "新增管理员角色", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.ERROR, "新增管理员角色", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		PmsRole adminRoleInfo = pmsFacade
				.getByRoleName(adminRole.getRoleName());
		uiModel.put("adminRole", adminRoleInfo);
		return uiModel;
	}

	// 更新管理员角色
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public Object update(Long roleId, String roleName, String remark, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
//		if (roleId.intValue() == 1) {
//			uiModel.put("data", "超级管理员不能编辑");
//			return uiModel;
//		}
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		PmsRole pmsRole = pmsFacade.getRoleById(roleId);
		try {

			pmsRole.setRemark(remark);
			pmsRole.setRoleName(roleName);
			pmsFacade.updateRole(pmsRole);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "编辑管理员角色", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "编辑管理员角色", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 删除管理员角色
	@ResponseBody
	@RequestMapping(value = "/delete", method = RequestMethod.POST)
	public Object delete(Long roleId, HttpServletRequest request) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			pmsFacade.deleteRoleById(roleId);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.SUCCESS, "删除管理员角色", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.ERROR, "删除管理员角色", admin,
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
