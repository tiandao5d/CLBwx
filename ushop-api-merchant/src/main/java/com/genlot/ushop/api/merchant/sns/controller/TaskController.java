package com.genlot.ushop.api.merchant.sns.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.utils.DateUtils;
import com.genlot.common.utils.map.BeanMapUtil;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ucenter.facade.user.entity.MemberInfo;
import com.genlot.ucenter.facade.user.exceptions.UserBizException;
import com.genlot.ucenter.facade.user.service.MemberInfoFacade;
import com.genlot.ushop.facade.sns.entity.VipInfo;
import com.genlot.ushop.facade.sns.entity.VipLevel;
import com.genlot.ushop.facade.sns.exceptions.VipBizException;
import com.genlot.ushop.facade.sns.service.VipInfoFacade;
import com.genlot.ushop.facade.sns.service.VipLevelFacade;
import com.genlot.ushop.facade.task.entity.Task;
import com.genlot.ushop.facade.task.entity.TaskRecord;
import com.genlot.ushop.facade.task.entity.TaskRewardValue;
import com.genlot.ushop.facade.task.enums.TaskAuditStatusEnum;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;
import com.genlot.ushop.facade.task.enums.TaskStatusEnum;
import com.genlot.ushop.facade.task.exceptions.TaskBizException;
import com.genlot.ushop.facade.task.service.TaskCacheFacade;
import com.genlot.ushop.facade.task.service.TaskDailyFacade;
import com.genlot.ushop.facade.task.service.TaskRecordFacade;

@Controller
@RequestMapping(value = "/api/sns/task")
public class TaskController {

	private static final Logger log = LoggerFactory.getLogger(TaskController.class);

	@Autowired
	private TaskEventProducer taskEventProducer;

	@Autowired
	private TaskDailyFacade taskDailyFacade;

	@Autowired
	private TaskCacheFacade taskCacheFacade;

	@Autowired
	private MemberInfoFacade memberInfoFacade;

	/**
	 * 获得指定类型的有效任务列表.
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/task/list
	 * @param 请求参数
	 *            访问令牌.
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @body json data Content-Type: application/json;charset=UTF-8
	 *       格式:{"type":"活动类型"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = { "/list/{type}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			@PathVariable 
			int type,
			HttpServletRequest request,
			HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {

			List<Task> list = taskCacheFacade.listByType(type,null);
			uiModel.put("recordList", list);
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		return uiModel;
	}

//	/**
//	 * 完成指定条件的积分任务.
//	 * 
//	 * @example 
//	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/task/point
//	 *          /submit
//	 * @param 请求参数
//	 *            访问令牌.
//	 * @error {"error":"错误代号","error_description":"内容描述"}
//	 * @body json data Content-Type: application/json;charset=UTF-8
//	 *       格式:{"condition":"任务条件","param":"扩展参数"}
//	 * @return Model 视图对象.
//	 */
//	@RequestMapping(value = { "/point/submit" }, method = RequestMethod.POST)
//	@ResponseBody
//	public Object pointSubmit(
//			@RequestBody(required = true) Map<String, Object> paramMap,
//			HttpServletRequest request, HttpServletResponse response) {
//		// Model View
//		Map<String, Object> uiModel = new HashMap<String, Object>();
//		// 用户ID
//		String userId = null;
//		try {
//			// 由于前面有拦截器，已经确定判断这个访问
//			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
//
//			// 获得会员信息
//			MemberInfo member = memberInfoFacade.getMemberByUserNo(userId);
//
//			if (paramMap.get("condition") != null) {
//				Integer condition = Integer.valueOf(paramMap.get("condition").toString());
//				if (condition != TaskConditionTypeEnum.PURCHASE_PROMOTE.getValue() &&
//					condition != TaskConditionTypeEnum.PRODUCT_PROMOTE.getValue()) {
//					throw TaskBizException.TASK_NOT_EXIST;
//				}
//				String uniqueId = null;
//				if (condition == TaskConditionTypeEnum.PURCHASE_PROMOTE.getValue()) {
//					uniqueId = paramMap.get("param").toString();
//				}
//				taskEventProducer.sendEventTaskFinishing(userId,
//						member.getMemberName(), member.getTelNo(), null,
//						condition, 0.0, 0.0, uniqueId);
//			}
//
//			// 返回
//			uiModel.put("succeed", 1);
//		} catch (Exception exception) {
//			log.error(exception.toString());
//			setErrorMessage(exception, uiModel);
//			return uiModel;
//		}
//
//		return uiModel;
//	}

	/**
	 * 获得任务货获得的参与次数.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/task/done/get/任务或活动ID
	 * @param 请求参数
	 *            访问令牌.
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = { "/done/get/{id}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getDone(
			@PathVariable Long id, 
			HttpServletRequest request,
			HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 用户ID
		String userId = null;
		try {
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);

			// 获得签到是否已经完成
			Integer count = taskDailyFacade.isCompleted(userId, id);

			uiModel.put("id", id);
			uiModel.put("date", DateUtils.SHORT_DATE_FORMAT.format(new Date()));
			uiModel.put("count", count);
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		return uiModel;
	}
	
	/**
	 * 获得任务货获得的当前参与进度.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/task/progress/get/任务或活动ID
	 * @param 请求参数
	 *            访问令牌.
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = { "/progress/get/{id}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getProgress(
			@PathVariable Long id, 
			HttpServletRequest request,
			HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 用户ID
		String userId = null;
		try {
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			Task task = taskCacheFacade.getTaskById(id);
			List<Task> tasks = new ArrayList<Task>();		
			tasks.add(task);
			List<TaskRecord> records = taskDailyFacade.listByProgress(userId, tasks);
			if (records.isEmpty()) {
				TaskRecord record = new TaskRecord();
				record.setTaskId(id);
				record.setStatus(TaskStatusEnum.INCOMPLETE.getValue());
				record.setTaskValue(0.0);
				record.setUserNo(userId);
				uiModel.put("record", record);
			}
			else {
				uiModel.put("record", records.get(0));
			}
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		return uiModel;
	}

	/**
	 * 获得任务详情.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/task/detail/get/任务或活动ID
	 * @param 请求参数
	 *            访问令牌.
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = { "/detail/get/{id}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getDetail(
			@PathVariable Long id,
			HttpServletRequest request, 
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		try {
			Task task = taskCacheFacade.getTaskById(id);
			Task view = new Task();
			view.setId(task.getId());
			view.setRemark(task.getRemark());
			view.setAssistanceId(task.getAssistanceId());
			view.setConditionType(task.getConditionType());
			view.setConditionValue(task.getConditionValue());
			view.setTargetType(task.getTargetType());
			view.setButtonName(task.getButtonName());
			view.setName(task.getName());
			view.setStartDate(task.getStartDate());
			view.setEndDate(task.getEndDate());
			view.setTemplate(task.getTemplate());
			view.setImage(task.getImage());
			view.setUrl(task.getUrl());
			view.setParticipateTime(task.getParticipateTime());
			view.setParticipateType(task.getParticipateType());
			view.setRewardValue(task.getRewardValue());
			view.setRewardPool(task.getRewardPool());
			uiModel.putAll(BeanMapUtil.convertBean(view));
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		return uiModel;
	}

	protected void setErrorMessage(Exception exception,
			Map<String, Object> uiModel) {
		uiModel.clear();
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
