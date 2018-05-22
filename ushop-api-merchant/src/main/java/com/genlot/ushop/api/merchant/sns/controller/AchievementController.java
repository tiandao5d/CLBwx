package com.genlot.ushop.api.merchant.sns.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
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
import com.genlot.ucenter.facade.promotion.entity.PromoterInfo;
import com.genlot.ucenter.facade.promotion.service.PromoterFacade;
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
import com.genlot.ushop.facade.task.enums.ActivityTypeEnum;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;
import com.genlot.ushop.facade.task.exceptions.TaskBizException;
import com.genlot.ushop.facade.task.service.TaskCacheFacade;
import com.genlot.ushop.facade.task.service.TaskDailyFacade;
import com.genlot.ushop.facade.task.service.TaskRecordFacade;

@Controller
@RequestMapping(value = "/api/sns/task/achievement")
public class AchievementController {

	private static final Logger log = LoggerFactory.getLogger(AchievementController.class);

	@Autowired
	private TaskEventProducer taskEventProducer;

	@Autowired
	private TaskDailyFacade taskDailyFacade;

	@Autowired
	private TaskCacheFacade taskCacheFacade;

	@Autowired
	private MemberInfoFacade memberInfoFacade;
	
	@Autowired
	private PromoterFacade promoterFacade;
	
	/**
	 * 获得指定类型的有效任务列表.
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/achievement/list
	 * @param 请求参数
	 *          访问令牌.
	 * @param 
	 * 			type 成就类型
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = { "/list/{type}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object list(
			@PathVariable Integer type,
			HttpServletRequest request, 
			HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 用户ID
		String userId = null;	
		
		try {
			
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
						
			if (!type.equals(TaskConditionTypeEnum.SCAN_TICKET.getValue()) && 
				!type.equals(TaskConditionTypeEnum.BEEN_SCAN_TICKET.getValue())) {
				throw TaskBizException.TASK_NOT_EXIST;
			}
			
			// 如果是被扫票则需要从推广员中确定是否站主推广员
			if (type.equals(TaskConditionTypeEnum.BEEN_SCAN_TICKET.getValue())) {
				PromoterInfo station = promoterFacade.getStationByUserNo(userId);
				if (station == null || StringUtils.isEmpty(station.getStationNo())) {
					throw TaskBizException.TASK_NOT_EXIST;
				}
				userId = station.getStationNo();
			}
			
			// 查找有效成就任务对象
			List<Task> tasks = taskCacheFacade.listByType(ActivityTypeEnum.ACHIEVEMENT.getValue(), type);
			// 根据成就查找用户对应任务完成情况
			List<TaskRecord> records = taskDailyFacade.listByProgress(userId, tasks);
			for(int index = 0; index < tasks.size(); ++index) {
				Task task = tasks.get(index);
				task.setObject(records.get(index));
			}			
			uiModel.put("recordList", tasks);
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		return uiModel;
	}

	/**
	 * 领取指定成就奖励.
	 * 
	 * @example http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/achievement/reward/take
	 * @param 请求参数
	 *          访问令牌.
	 * @param 
	 * 			type 成就类型
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = { "/reward/take/{taskId}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object takeReward(
			@PathVariable Long taskId,
			HttpServletRequest request, 
			HttpServletResponse response) {
		
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 用户ID
		String userId = null;	
		String agentId = null;
		try {
			
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			
			Task task = taskCacheFacade.getTaskById(taskId);
			if (task == null) {
				throw TaskBizException.TASK_NOT_EXIST;
			}
			// 如果是被扫票则需要从推广员中确定是否站主推广员
			if (task.getType().equals(TaskConditionTypeEnum.BEEN_SCAN_TICKET.getValue())) {
				PromoterInfo station = promoterFacade.getStationByUserNo(userId);
				if (station == null || StringUtils.isEmpty(station.getStationNo())) {
					throw TaskBizException.TASK_NOT_EXIST;
				}
				agentId = station.getStationNo();
			}
			
			TaskRecord record = taskDailyFacade.take(userId, agentId, taskId);
			uiModel.putAll(BeanMapUtil.convertBean(record));
			
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
