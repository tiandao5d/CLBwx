package com.genlot.ushop.web.admin.permission.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

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
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.enums.AccountCouponsStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundDirectionEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundTypeEnum;
import com.genlot.ucenter.facade.account.enums.AccountFundUsageEnum;
import com.genlot.ucenter.facade.account.enums.AccountStatusEnum;
import com.genlot.ucenter.facade.account.enums.AccountTypeEnum;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.entity.PmsTreeNode;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorStatusEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;

@Controller
@RequestMapping(value = "/admin")
public class AdminController {

	private static final Logger log = LoggerFactory
			.getLogger(AdminController.class);

	@Autowired
	PmsFacade pmsFacade;

	@RequestMapping(value = "/list", method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			// 分页
			Integer page, Integer rows,
			// 管理员类型
			Integer adminType,
			// 管理员名称
			String adminName, String mobileNo, HttpServletRequest request,
			HttpSession session) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PageParam pageParam = null;
		PageBean pageBean = null;

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		try {
			if (adminName != null) {
				adminName = adminName.trim();
			}

			paramMap.put("adminType", adminType);
			paramMap.put("mobileNo", mobileNo);
			paramMap.put("adminName", adminName);
			log.debug(paramMap.toString());
			pageBean = pmsFacade.listOpertaorForPage(pageParam, paramMap);
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}


		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		String json = JSON.toJSONString(uiModel);
		return uiModel;
	}

	// 通过ID获得管理员
	@RequestMapping(value = "/getById", method = RequestMethod.GET)
	@ResponseBody
	public Object get(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String roleId = null;
		PmsOperator pmsOperator = null;
		String userid = request.getParameter("userid");
		try {
			roleId = pmsFacade.getRoleIdsByOperatorId(id);
			pmsOperator = pmsFacade.getOperatorVoById(id);
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		uiModel.put("admin", pmsOperator);
		uiModel.put("roleId", roleId);

		return uiModel;
	}

	// 新增管理员
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public Object add(PmsOperator admin, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		PmsOperator exist = pmsFacade.getOperatorByLoginName(admin
				.getLoginName());
		String userid = request.getParameter("userid");
		PmsOperator currAdmin = pmsFacade.getOperatorById(Long.valueOf(userid));
		if (exist != null) {
			uiModel.put("date", "EXISTED ");
			return uiModel;
		}

		try {
			String roleId = admin.getType();
			admin.setStatus(100);
			admin.setPwdErrorCount(0);
			admin.setIsChangedPwd(false);
			admin.setPwdErrorCount(0);
			admin.setLastLoginTime(new Date());
			admin.setType(roleId);
			long id = pmsFacade.createOperator(admin, Long.parseLong(roleId));

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.SUCCESS, "新增管理员", currAdmin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.ERROR, "新增管理员", currAdmin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		PmsOperator adminInfo = pmsFacade.getOperatorByLoginName(admin
				.getLoginName());
		uiModel.put("admin", adminInfo);
		return uiModel;
	}

	// 更新管理员
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public Object update(Long id, Long roleId, String remark,
			String mobileNo, String realName, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator currAdmin = pmsFacade.getOperatorById(Long.valueOf(userid));
		if (mobileNo == null || mobileNo == "") {
			return "mobileNo is null";
		}

		if (roleId == null || roleId == 0) {
			return "roleId is null";
		}
		try {

			PmsOperator admin = pmsFacade.getOperatorById(id);

			admin.setRealName(realName);
			admin.setRemark(remark);
			admin.setMobileNo(mobileNo);
			pmsFacade.updateOperator(admin, roleId);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "更新管理员", currAdmin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "更新管理员", currAdmin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 修改密码
	@ResponseBody
	@RequestMapping(value = "changePwd", method = RequestMethod.POST)
	public Object changePwd(
	// 用户id
			Long adminId,
			// 新密码
			String newPwd,
			// 旧密码
			String oldPwd, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String result;
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			result = pmsFacade.updateOperatorPwd(adminId, newPwd, oldPwd);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "修改密码", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "修改密码", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("result", result);
		return uiModel;
	}

	

	// 通过角色获得菜单列表
	@RequestMapping(value = "/adminRole", method = RequestMethod.GET)
	@ResponseBody
	public Object adminRole(String roleId) {

		Map<String, Object> uiModel = new HashMap<String, Object>();

		PmsTreeNode pmsTreeNode = null;
		List<Object> pmsTreeNodeList = null;



		if (roleId == null) {
			roleId = "1";
		}
		try {
			pmsTreeNode = pmsFacade.getPermissionTreeByRoleIds(roleId);
			pmsTreeNodeList = pmsTreeNode.getChilds();
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}


		uiModel.put("pmsTreeNode", pmsTreeNode);
		uiModel.put("pmsTreeNodeList", pmsTreeNodeList);
	
		return uiModel;
	}

	// 更新角色菜单
	@RequestMapping(value = "/adminRoleSubmit", method = RequestMethod.POST)
	public @ResponseBody
	Object adminRoleSubmit(Long roleIds, String menuIds,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			pmsFacade.assignPermission(roleIds, menuIds, null);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "更新角色菜单", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception e) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "更新角色菜单", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("data", true);
		return uiModel;
	}
	@ResponseBody
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 通告所属模块
		List adminStatusList = PmsOperatorStatusEnum.toList();
		// 管理员角色分组
		Map<String, String> adminTypeList = pmsFacade.getRoleIdAndRoleName();
		List adminLogTypeList = PmsOperatorLogTypeEnum.toList();
		List adminLogStatusList = PmsOperatorLogStatusEnum.toList();
		uiModel.put("adminLogTypeList", adminLogTypeList);
		uiModel.put("adminLogStatusList", adminLogStatusList);
		uiModel.put("adminStatusList", adminStatusList);
		uiModel.put("adminTypeList", adminTypeList);
		
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
