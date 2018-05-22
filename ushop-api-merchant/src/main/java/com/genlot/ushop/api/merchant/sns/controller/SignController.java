package com.genlot.ushop.api.merchant.sns.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.genlot.common.exceptions.BizException;
import com.genlot.common.message.task.component.TaskEventProducer;
import com.genlot.common.utils.DateUtils;
import com.genlot.ucenter.facade.oauth.entity.AccessToken;
import com.genlot.ushop.facade.task.entity.Task;
import com.genlot.ushop.facade.task.entity.TaskRecord;
import com.genlot.ushop.facade.task.enums.TaskConditionTypeEnum;
import com.genlot.ushop.facade.task.service.TaskCacheFacade;
import com.genlot.ushop.facade.task.service.TaskFacade;
import com.genlot.ushop.facade.task.service.TaskRecordFacade;
import com.genlot.ushop.facade.task.service.TaskSignFacade;

@Controller
@RequestMapping(value = "/api/sns/task/sign")
public class SignController {

	private static final Logger log = LoggerFactory.getLogger(SignController.class);
	
	@Autowired
	private TaskEventProducer taskEventProducer;

	@Autowired
	private TaskSignFacade taskSignFacade;
	
	@Autowired
	private TaskCacheFacade taskCacheFacade;
	
	@Autowired
	private TaskFacade taskFacade;

	
	/**
	 * 签到.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/task/sign/
	 *          submit
	 * @param 请求参数
	 *            访问令牌.
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = { "/submit" }, method = RequestMethod.GET)
	@ResponseBody
	public Object sign(HttpServletRequest request, HttpServletResponse response) {
		// Model View
		// 由于前面有拦截器，已经确定判断这个访问
		String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
	
		Map<String, Object> uiModel = new HashMap<String, Object>();
		TaskRecord taskRecord=null;

		try {	
			taskRecord = taskSignFacade.sign(userNo);
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		// 返回
		uiModel.put("succeed", 1);
		uiModel.put("reward", taskRecord.getRewardValue());

		return uiModel;
	}
	/**
	 * 签到次数.
	 * 
	 * @example 
	 *          http://xxx.xxx.xxx.xxx:port/ushop-api-merchant/api/task/sign/getSign
	 *          
	 * @param 请求参数
	 *            访问令牌.
	 * @error {"error":"错误代号","error_description":"内容描述"}
	 * @return Model 视图对象.
	 */
	@RequestMapping(value = { "/getSign" }, method = RequestMethod.GET)
	@ResponseBody
	public Object getSign(HttpServletRequest request, HttpServletResponse response) {
		// Model View
		// 由于前面有拦截器，已经确定判断这个访问
		String userNo = request.getParameter(AccessToken.OAUTH_PARAM_USERID);
		
		String rewards;
		Map<String, Object> uiModel = new HashMap<String, Object>();
		TaskRecord taskRecord=null;

		try {	
			Task task=taskFacade.getByConditionType(TaskConditionTypeEnum.SIGN.getValue());
			rewards = task.getRewardValue();
			taskRecord = taskSignFacade.getSign(userNo);
			
		} catch (Exception exception) {
			log.error(exception.toString());
			setErrorMessage(exception, uiModel);
			return uiModel;
		}
		
		// 返回
		uiModel.put("succeed", 1);
		uiModel.put("dayNumber", taskRecord.getTaskUniqueid());
		uiModel.put("date", DateUtils.LONG_DATE_FORMAT.format(taskRecord.getFinishTime()));//签到时间
		uiModel.put("rewards",rewards);

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
