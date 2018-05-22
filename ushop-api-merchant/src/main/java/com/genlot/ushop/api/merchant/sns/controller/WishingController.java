package com.genlot.ushop.api.merchant.sns.controller;

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
import com.genlot.ushop.facade.task.exceptions.TaskBizException;
import com.genlot.ushop.facade.task.service.TaskCacheFacade;
import com.genlot.ushop.facade.task.service.TaskDailyFacade;
import com.genlot.ushop.facade.task.service.TaskRecordFacade;
import com.genlot.ushop.facade.task.service.TaskWishingFacade;

@Controller
@RequestMapping(value = "/api/sns/task/wishing")
public class WishingController {

	private static final Logger log = LoggerFactory.getLogger(WishingController.class);

	@Autowired
	private TaskEventProducer taskEventProducer;

	@Autowired
	private TaskWishingFacade taskWishingFacade;

	@Autowired
	private MemberInfoFacade memberInfoFacade;

	/**
	 * 获得任务货获得的参与次数.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/task/wishing/done/get/任务或活动ID
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
			Integer count = taskWishingFacade.isCompleted(userId, id);

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
	 * 抽奖.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/task/wishing/draw/抽奖活动id
	 * @param 请求参数
	 *            访问令牌.
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = { "/draw/{id}" }, method = RequestMethod.POST)
	@ResponseBody
	public Object draw(
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

			// 判断次数
			Integer count = taskWishingFacade.isCompleted(userId, id);
			if (count <= 0) {
				throw TaskBizException.TASK_RECORD_REPEAT;
			}

			// 创建抽奖号
			String requestNo = taskWishingFacade.create(userId, id);

			// 获得会员信息
			MemberInfo member = memberInfoFacade.getMemberByUserNo(userId);

			// 抽奖
			taskEventProducer.sendEventTaskFinishing(
					userId,
					member.getNickName(), 
					member.getHeadImage(),
					member.getTelNo(), id,
					TaskConditionTypeEnum.LOTTERY_DRAW.getValue(), 
					0.0, 
					0.0,
					requestNo);
			
			// 返回
			uiModel.put("requestNo", requestNo);
			uiModel.put("id", id);
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		return uiModel;
	}

	/**
	 * 抽奖结果.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/task/wishing/result/get/流水号
	 * @param 请求参数
	 *            访问令牌.
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = { "/result/get/{requestNo}" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getResult(
			@PathVariable String requestNo,
			HttpServletRequest request,
			HttpServletResponse response) {
		// Model View
		Map<String, Object> uiModel = new HashMap<String, Object>();
		// 用户ID
		String userId = null;
		try {
			// 由于前面有拦截器，已经确定判断这个访问
			userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);

			// 获得结果
			TaskRecord record = taskWishingFacade.getByRequestNo(requestNo);
			if (record == null || !record.getUserNo().equals(userId)) {
				throw TaskBizException.TASK_RECORD_NOT_EXIST;
			}
			
			// 重置数据
			TaskRewardValue reward = JSON.parseObject(record.getRewardValue(), TaskRewardValue.class);
			if (reward != null) {
				reward.setProbability(null);
				reward.setWinLimitType(null);
				reward.setWinLimitValue(null);
				reward.setStockLimitType(null);
				reward.setStockLimitValue(null);
				reward.setTimeLimitValue(null);
				reward.setUnitPrice(null);
			}
			
			// 返回
			uiModel.put("requestNo", requestNo);
			uiModel.put("status", record.getStatus());
			uiModel.put("result", reward);
			uiModel.put("id", record.getTaskId());
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}

		return uiModel;
	}
	
	/**
	 * 获得.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/sns/task/wishing/winner/listBy
	 * @param 请求参数
	 *            访问令牌.
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = { "/winner/listBy" }, method = RequestMethod.GET)
	@ResponseBody
	public Object listByWinner(
			Long id,
			Integer page, 
			Integer rows, 
			Integer self,
			HttpServletRequest request, 
			HttpServletResponse response) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		PageBean pageBean = null;
		// 用户ID
		String userId = null;
		try
		{
			// 由于前面有拦截器，已经确定判断这个访问
			if (self != null) {
				userId = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
			}
			PageParam pageParam = new PageParam(page, rows);
			pageBean = taskWishingFacade.listByWinner(pageParam, id, userId);
			uiModel.put("currentPage", pageBean.getCurrentPage());
			uiModel.put("pagePage", pageBean.getPageCount());
			uiModel.put("totalCount", pageBean.getTotalCount());
			uiModel.put("recordList", pageBean.getRecordList());
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
