package com.genlot.ushop.web.admin.spell.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

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
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ucenter.facade.user.enums.UserStatusEnum;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ushop.facade.product.entity.SpellBuyRobot;
import com.genlot.ushop.facade.product.service.SpellBuyRobotFacade;

/**
 * ClassName:RobotConfigController
 * 
 * @Function: 机器人配置控制类
 * @Date: 2017年4月26日 下午5:14:46
 * @author KDS
 */

@Controller
@RequestMapping("/spellBuy/robot")
public class SpellBuyRobotController {

	@Autowired
	SpellBuyRobotFacade robotConfigFacade;

	@Autowired
	PmsFacade pmsFacade;


	@RequestMapping(value = { "/listBy" }, method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			// 页码
			Integer page,
			// 一页条数
			Integer rows,
			// 商品ID
			Integer productId, Integer status, HttpServletRequest request,
			HttpSession session) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;

		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		// 商品ID
		paramMap.put("productId", productId);
		paramMap.put("status", status);
		try {
			pageBean = robotConfigFacade.listPage(pageParam, paramMap);
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

	// 通过ID获得管理员
	@RequestMapping(value = "/getById", method = RequestMethod.GET)
	@ResponseBody
	public Object getById(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		SpellBuyRobot robotConfig = new SpellBuyRobot();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {

			robotConfig = robotConfigFacade.getById(id);

		
		} catch (Exception exception) {

			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("robotConfig", robotConfig);
		return uiModel;
	}

	// 新增
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public Object add(SpellBuyRobot robotConfig,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();

		String userid = request.getParameter("userid");
		PmsOperator currAdmin = pmsFacade.getOperatorById(Long.valueOf(userid));
		long id;
		try {

			robotConfig.setInitBuyInputs(robotConfig.getBuyInputs());
			robotConfig.setStatus(UserStatusEnum.INACTIVE.getValue());
			id = robotConfigFacade.create(robotConfig);

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.SUCCESS, "新增机器人配置", currAdmin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.ERROR, "新增机器人配置", currAdmin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		uiModel.put("id", id);
		return uiModel;
	}

	// 激活
	@RequestMapping(value = "/start", method = RequestMethod.POST)
	@ResponseBody
	public Object start(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator currAdmin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			SpellBuyRobot entity = robotConfigFacade.getById(id);
			if (entity == null) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}
			if (entity.getInitBuyInputs() == null || entity.getInitBuyInputs() == 0) {
				throw UserBizException.USER_STATUS_IS_NOT_EXIST;
			}
			if (entity.getRobotIds() == null) {
				throw UserBizException.USER_STATUS_IS_NOT_EXIST;
			}
			entity.setCreateTime(new Date());
			entity.setStatus(UserStatusEnum.ACTIVE.getValue());
			robotConfigFacade.update(entity);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "激活机器人配置"+id, currAdmin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "激活机器人配置"+id, currAdmin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 冻结
	@RequestMapping(value = "/close", method = RequestMethod.POST)
	@ResponseBody
	public Object close(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator currAdmin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			SpellBuyRobot entity = robotConfigFacade.getById(id);
			if (entity == null) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}
			if (entity.getRobotIds() == null) {
				throw UserBizException.USER_STATUS_IS_NOT_EXIST;
			}
			entity.setStatus(UserStatusEnum.INACTIVE.getValue());
			robotConfigFacade.update(entity);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "冻结机器人配置"+id, currAdmin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "冻结机器人配置"+id, currAdmin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 更新
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public Object update(SpellBuyRobot robotConfig,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator currAdmin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			SpellBuyRobot entity = robotConfigFacade.getById(robotConfig
					.getId());
			if (entity == null) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}
			if (entity.getStatus() == UserStatusEnum.ACTIVE.getValue()) {
				throw UserBizException.USER_STATUS_IS_NOT_EXIST;
			}
			if(robotConfig.getBuyInputs() != entity.getBuyInputs() ){
				robotConfig.setInitBuyInputs(robotConfig.getBuyInputs());
			}
			robotConfigFacade.update(robotConfig);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "更新机器人配置"+robotConfig.getId(), currAdmin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "更新机器人配置"+robotConfig.getId(), currAdmin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 删除
	@RequestMapping(value = "/delete", method = RequestMethod.POST)
	@ResponseBody
	public Object delete(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator currAdmin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			robotConfigFacade.deleteById(id);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "删除机器人配置", currAdmin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "删除机器人配置", currAdmin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 添加机器人
	@RequestMapping(value = "/insert", method = RequestMethod.POST)
	@ResponseBody
	public Object insert(Long id, String robotIds,
			HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator currAdmin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			SpellBuyRobot entiry = robotConfigFacade.getById(id);
			if (entiry == null) {
				return "ROBOTCONFIG_IS_NOT_EXIST";
			}
			robotIds = robotIds.substring(1,robotIds.length()-1);
			List<String> result = new ArrayList<>();
			String[] array = robotIds.split(",");// 分割字符串得到数组

			boolean flag;
			for (int i = 0; i < array.length; i++) {
				flag = false;
				for (int j = 0; j < result.size(); j++) {
					if (array[i].equals(result.get(j))) {
						flag = true;
						break;
					}
				}
				if (!flag) {
					result.add(array[i]);
				}
			}
			String[] arrayResult = (String[]) result.toArray(new String[result
					.size()]);
			StringBuffer sb = new StringBuffer();
			for(int i = 0; i < arrayResult.length; i++){
				if(i < arrayResult.length-1){
					sb. append(arrayResult[i]+",");
				}else{
					sb. append(arrayResult[i]);
				}				 
				}
				String s = sb.toString();
				s = "["+s+"]";

			entiry.setRobotIds(s);
			robotConfigFacade.update(entiry);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "添加机器人", currAdmin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "添加机器人", currAdmin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		uiModel.put("data", "SUCCESS");
		return uiModel;
	}

	// 清除机器人
	@RequestMapping(value = "/clear", method = RequestMethod.POST)
	@ResponseBody
	public Object clear(Long id, HttpServletRequest request) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator currAdmin = pmsFacade.getOperatorById(Long.valueOf(userid));

		try {
			SpellBuyRobot entiry = robotConfigFacade.getById(id);
			if (entiry == null) {
				throw UserBizException.USERINFO_IS_NOT_EXIST;
			}
			entiry.setRobotIds(null);
			robotConfigFacade.update(entiry);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "清空机器人", currAdmin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "清空机器人", currAdmin,
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
