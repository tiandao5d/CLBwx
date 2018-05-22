package com.genlot.ushop.web.admin.permission.controller;

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
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.pms.entity.PmsMenu;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.entity.PmsRole;
import com.genlot.ucenter.facade.pms.entity.PmsTreeNode;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsRoleTypeEnum;
import com.genlot.ucenter.facade.pms.enums.PmsMenuTypeEnums;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;

@Controller
@RequestMapping(value = "/admin/menu")
public class AdminMenuController {

	@Autowired
	PmsFacade pmsFacade;

	private static final Logger log = LoggerFactory
			.getLogger(AdminMenuController.class);

	
	// 获得菜单列表
	@RequestMapping(value = "/list", method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			HttpServletRequest request, 
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {		
			PmsTreeNode pmsTreeNode = null;
			List<Object> pmsTreeNodeList = null;
			pmsTreeNode = pmsFacade.getPmsTreeMenu();
			pmsTreeNodeList = pmsTreeNode.getChilds();
			uiModel.put("pmsTreeNode", pmsTreeNode);
			uiModel.put("pmsTreeNodeList", pmsTreeNodeList);
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		return uiModel;
	}

	// 新增
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public Object add(
			PmsMenu menu, 
			HttpServletRequest request, 
			HttpServletResponse response) {
		
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = null;
		try {
			
			admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			if (admin == null) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}

			String roleId = admin.getType();
			if (!PmsRoleTypeEnum.SUPER_ADMIN.getValue().equals(roleId)) {
				throw UserBizException.PERMISSION_USER_NOT_MENU;
			}
			menu.setParent(new PmsMenu());
			menu.getParent().setId(menu.getParentId());
			pmsFacade.createMenu(menu);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.SUCCESS, "新增菜单", admin,
					WebUtils.getIpAddr(request));
			
		} catch (Exception exception) {
			
			if (admin != null) {
				pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
						PmsOperatorLogStatusEnum.ERROR, "新增菜单", admin,
						WebUtils.getIpAddr(request));
			}
			
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}

	// 更新
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public Object update(
			PmsMenu menu, 
			HttpServletRequest request, 
			HttpServletResponse response) {
		
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = null;
		try {
			
			admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			if (admin == null) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}

			String roleId = admin.getType();
			if (!PmsRoleTypeEnum.SUPER_ADMIN.getValue().equals(roleId)) {
				throw UserBizException.PERMISSION_USER_NOT_MENU;
			}
			menu.setParent(new PmsMenu());
			menu.getParent().setId(menu.getParentId());
			pmsFacade.updateMenu(menu);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "更新菜单", admin,
					WebUtils.getIpAddr(request));
			
		} catch (Exception exception) {
			
			if (admin != null) {
				pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
						PmsOperatorLogStatusEnum.ERROR, "更新菜单", admin,
						WebUtils.getIpAddr(request));
			}
			
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}
	
	@ResponseBody
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	public Object getConstants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		
		List menuTypeList = PmsMenuTypeEnums.toList();
		uiModel.put("menuTypeList", menuTypeList);
		
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
