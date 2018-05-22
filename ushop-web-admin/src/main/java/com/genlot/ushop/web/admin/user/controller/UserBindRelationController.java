package com.genlot.ushop.web.admin.user.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
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
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.user.service.UserBindRelationFacade;
import com.genlot.ucenter.facade.user.service.UserManagementFacade;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;

@Controller
@RequestMapping(value = "/user/relation")
public class UserBindRelationController {
	
	@Autowired
	private UserBindRelationFacade userBindRelationFacade;
	
	@Autowired
	private UserManagementFacade userManagementFacade;
	
	@Autowired
	private PmsFacade pmsFacade;
	
	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object list(HttpServletRequest request,Integer page, Integer rows, Integer province, Integer platform,String keywords){
		
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		
		if (null != province) {
			paramMap.put("province", province);
		}
		
		if (null != platform) {
			paramMap.put("platform", platform);
		}
		
		if (StringUtils.isNotBlank(keywords)) {
			paramMap.put("keywords", keywords);
		}
		
		try {
			pageBean = userBindRelationFacade.listPage(pageParam, paramMap);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA,
					PmsOperatorLogStatusEnum.SUCCESS, "查看绑定用户列表", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.QUERYA,
					PmsOperatorLogStatusEnum.ERROR, "查看绑定用户列表", admin,
					WebUtils.getIpAddr(request));
			exception.printStackTrace();
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		

		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("pagePage", pageBean.getPageCount());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("recordList", pageBean.getRecordList());
		
		return uiModel;
	}
	
	
	@RequestMapping(value = "/unbind", method = RequestMethod.POST)
	@ResponseBody
	public Object unbind(HttpServletRequest request,String userNo, Integer province, Integer platform, Integer game){
		
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		
		if (StringUtils.isBlank(userNo)) {
			return "userNo is null";
		}
		
		if (province == null) {
			return "province is null";
		}
		
		if (platform == null) {
			return "platform is null";
		}
		
		try {
			
			userManagementFacade.unbindThirdPartyMember(userNo, province, platform, game);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "解绑用户", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "解绑用户", admin,
					WebUtils.getIpAddr(request));
			exception.printStackTrace();
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		
		uiModel.put("data", "success");
		
		return uiModel;
	}
	@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
	@ResponseBody
	public Object constants() {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		List provinceList = ProvinceEnum.toList();
		
		List platformList = PlatformEnum.toList();
		
		uiModel.put("provinceList", provinceList);
		uiModel.put("platformList", platformList);
		return uiModel;
	}
	protected void setErrorMessage(Exception exception,
			Map<String, Object> uiModel) {
		exception.printStackTrace();
		
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
