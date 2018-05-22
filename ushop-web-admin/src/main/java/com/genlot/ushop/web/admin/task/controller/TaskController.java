package com.genlot.ushop.web.admin.task.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.account.entity.AccountCouponsType;
import com.genlot.ucenter.facade.account.enums.AccountFundUsageEnum;
import com.genlot.ucenter.facade.account.service.CouponsFacade;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.uplatform.facade.application.entity.UploadFile;
import com.genlot.uplatform.facade.application.enums.FileTypeEnum;
import com.genlot.uplatform.facade.application.service.UploadFileFacade;
import com.genlot.uplatform.facade.channel.service.ChannelInterfaceFacade;
import com.genlot.ushop.facade.task.entity.Task;
import com.genlot.ushop.facade.task.entity.TaskRewardValue;
import com.genlot.ushop.facade.task.enums.ActivityTypeEnum;
import com.genlot.ushop.facade.task.enums.AwardTypeEnum;
import com.genlot.ushop.facade.task.enums.ParticipateTypeEnum;
import com.genlot.ushop.facade.task.enums.StockLimitTypeEnum;
import com.genlot.ushop.facade.task.enums.TaskAuditStatusEnum;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;
import com.genlot.ushop.facade.task.enums.TaskTargetTypeEnum;
import com.genlot.ushop.facade.task.enums.WinLimitTypeEnum;
import com.genlot.ushop.facade.task.service.TaskFacade;
import com.genlot.ushop.web.admin.util.Binder;

/**
 * @author jml
 * @date 2016年7月4日 下午1:46:22
 * @version 1.0
 * @parameter
 * @since
 * @return
 */

@Controller
@RequestMapping(value = "/task")
public class TaskController {
 
	private static final Logger log = LoggerFactory.getLogger(TaskController.class);

	
	@Autowired
	private TaskFacade taskFacade;
	
	@Autowired
	private CouponsFacade couponsFacade;
	
	@Autowired
	private UploadFileFacade uploadFileFacade;
	
	@Autowired
	private ChannelInterfaceFacade channelInterfaceFacade;

	@Autowired
	private PmsFacade pmsFacade;
	

	/**
	 * 获取
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/task/get
	 *          /任务条件ID
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/get/{id}", method = RequestMethod.GET)
	@ResponseBody
	public Object get(@PathVariable Long id, HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Task task;
		String userid = request.getParameter("userid");
		try {

			task = taskFacade.getById(id);
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("task", task);

		String json = JSON.toJSONString(uiModel);

		return json;
	}

	// 审核活动
	@ResponseBody
	@RequestMapping(value = { "/audit" }, method = RequestMethod.POST)
	public Object audit(Integer id, Integer auditStatus) {

		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			Task task = taskFacade.getById(id.longValue());
			
			task.setAuditStatus(auditStatus);

			taskFacade.update(task);
		} catch (Exception e) {
			setErrorMessage(e, uiModel);
			return uiModel;
		}
		uiModel.put("result", "SUCCESS");
		return uiModel;
	}

	/**
	 * 获取活动列表
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/task/listBy
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/listBy", method = RequestMethod.GET)
	@ResponseBody
	public Object listBy(
			HttpServletRequest request, 
			HttpServletResponse response,
			Integer page, 
			Integer rows,
			Integer type, 
			String name,
			Integer conditionType, 
			Integer status, 
			Integer auditStatus, 
			Integer isChannel,
			String channelId) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = new PageBean();
		
		try {
			Map<String, Object> paramMap = new HashMap<String, Object>();
			paramMap.put("type", type);
			paramMap.put("name", name);
			paramMap.put("conditionType", conditionType);
			paramMap.put("status", status);
			paramMap.put("auditStatus", auditStatus);
			paramMap.put("channelId", channelId);
			paramMap.put("isChannel", (isChannel != null && isChannel == 1) ? true:false);
			
			PageParam pageParam = new PageParam(1, 10);

			if (page != null) {
				pageParam.setPageNum(page);
			}

			if (rows != null) {
				pageParam.setNumPerPage(rows);
			}

			pageBean = taskFacade.listPage(pageParam, paramMap);

		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		
		uiModel.put("recordList", pageBean.getRecordList());
		uiModel.put("currentPage", pageBean.getCurrentPage());
		uiModel.put("totalCount", pageBean.getTotalCount());
		uiModel.put("pagePage", pageBean.getPageCount());	
		String json = JSON.toJSONString(uiModel);
		return json;
	}

	/**
	 * 保存任务条件.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/task/save
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = { "/save" }, method = RequestMethod.POST)
	@ResponseBody
	public Object save(
			Task task, 
			HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {

			task.setAuditStatus(TaskAuditStatusEnum.WAIT_AUDIT.getValue());
			if (task.getType() == ActivityTypeEnum.DRAW.getValue()) {
				task.setRewardPoolRefreshTime(DateUtils.getTimeStampStr(task.getCreateTime()));
			} 
			
			if (task.getRandomMode() == null) {
				task.setRandomMode(2);
			}
			
			taskFacade.insert(task);

			if (task != null && StringUtils.isNotBlank(task.getImage())) {
				UploadFile uploadFile = uploadFileFacade.getByUrl(task.getImage());
				if (uploadFile != null) {
					uploadFileFacade.deleteById(uploadFile.getId());
				}
			}

			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.SUCCESS, "添加活动任务", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.ADD,
					PmsOperatorLogStatusEnum.ERROR, "添加活动任务", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("result", "SUCCESS");

		String json = JSON.toJSONString(uiModel);

		return json;
	}

	/**
	 * 编辑
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/task/edit
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/edit", method = RequestMethod.POST)
	@ResponseBody
	public Object edit(
			HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {
			
			Task task = taskFacade.getById(Long.parseLong(request.getParameter("id")));
			String origImage = task.getImage();
			List<String> discardFiles = new ArrayList<String>(); 
			List<String> tempFiles = new ArrayList<String>(); 
			List<String> oldFiles = new ArrayList<String>(); 
			
			Binder.bind(request, task);
			
			if (StringUtils.isNotBlank(origImage) 		&& 
				StringUtils.isNotBlank(task.getImage()) && 
				!origImage.equals(task.getImage())) {
				discardFiles.add(origImage.substring(origImage.lastIndexOf("/") + 1));
			}
			
			task.setAuditStatus(TaskAuditStatusEnum.WAIT_AUDIT.getValue());
			if (task.getRandomMode() == null) {
				task.setRandomMode(2);
			}
			
			if (task != null && StringUtils.isNotBlank(task.getImage())) {
				tempFiles.add(task.getImage().substring(task.getImage().lastIndexOf("/") + 1));
			}
			discardFiles.addAll(oldFiles);
			uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), discardFiles, new Date());
			taskFacade.update(task);
			uploadFileFacade.deleteByURL(tempFiles);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.SUCCESS, "编辑活动任务", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
					PmsOperatorLogStatusEnum.ERROR, "编辑活动任务", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("result", "SUCCESS");

		String json = JSON.toJSONString(uiModel);

		return json;
	}

	/**
	 * 删除活動
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-web-admin/task/delete
	 *          /活动ID
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 */
	@RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
	@ResponseBody
	public Object delete(@PathVariable Integer id, HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		String userid = request.getParameter("userid");
		PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
		try {

			Task task = taskFacade.getById(id.longValue());
			List<String> discardFiles = new ArrayList<String>(); 
			if (task != null) {
				if (StringUtils.isNotBlank(task.getImage())) {
					discardFiles.add(task.getImage().substring(task.getImage().lastIndexOf("/") + 1));
				}
			}
			
			if (!discardFiles.isEmpty()) {
				uploadFileFacade.create(Integer.valueOf(FileTypeEnum.IMAGE.getValue()), Integer.valueOf(0), discardFiles, new Date());
			}
			
			taskFacade.delete(id);
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.SUCCESS, "删除活动任务", admin,
					WebUtils.getIpAddr(request));
		} catch (Exception exception) {
			pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.DELETE,
					PmsOperatorLogStatusEnum.ERROR, "删除活动任务", admin,
					WebUtils.getIpAddr(request));
			setErrorMessage(exception, uiModel);
			String json = JSON.toJSONString(uiModel);
			return json;
		}
		uiModel.put("result", "SUCCESS");
		String json = JSON.toJSONString(uiModel);

		return json;
	}

	

	/**
	 * 获取任务类型&目标类型
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-web-admin/task/getConstants
	 * 
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * 
	 * @return JSON
	 */
	@RequestMapping(value = { "/getConstants" }, method = RequestMethod.GET)
	@ResponseBody
	public Object constants(HttpServletRequest request,
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			List channelList = channelInterfaceFacade.listBy(new HashMap<String, Object>());
			uiModel.put("channelList", channelList);
			uiModel.put("participateTypeList", ParticipateTypeEnum.toList());
			uiModel.put("taskTargetTypeList", TaskTargetTypeEnum.toList());
			uiModel.put("awardTypeList", AwardTypeEnum.toList());
			uiModel.put("stockLimitTypeList", StockLimitTypeEnum.toList());
			uiModel.put("winLimitTypeList", WinLimitTypeEnum.toList());
			uiModel.put("activityTypeList", ActivityTypeEnum.toList());
			uiModel.put("taskAuditStatusList", TaskAuditStatusEnum.toList());
			uiModel.put("fundUsageList", AccountFundUsageEnum.toList());
			uiModel.put("taskConditionList", TaskConditionTypeEnum.toList());
			uiModel.put("taskTypeList", ActivityTypeEnum.toList());
			
		} catch (Exception exception) {
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

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
