package com.genlot.ushop.web.admin.task.controller;

import java.util.HashMap;
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

import com.genlot.common.exceptions.BizException;
import com.genlot.common.page.PageBean;
import com.genlot.common.page.PageParam;
import com.genlot.common.web.utils.WebUtils;
import com.genlot.ucenter.facade.pms.entity.PmsOperator;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogStatusEnum;
import com.genlot.ucenter.facade.pms.enums.PmsOperatorLogTypeEnum;
import com.genlot.ucenter.facade.pms.service.PmsFacade;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.task.entity.TaskRecord;
import com.genlot.ushop.facade.task.enums.AwardTypeEnum;
import com.genlot.ushop.facade.task.enums.TaskStatusEnum;
import com.genlot.ushop.facade.task.service.TaskRecordFacade;

/**
 * 任务记录控制类

 * @author Kangds
 *         E-mail:dongsheng.kang@lotplay.cn
 * @version 创建时间：2017年3月27日 上午9:49:10
 * 
 */

@Controller
@RequestMapping(value = "/task/record")
public class TaskRecordController {

	private static final Logger log = LoggerFactory.getLogger(TaskRecordController.class);
	
	@Autowired
	private TaskRecordFacade taskRecordFacade;
	
	@Autowired
	PmsFacade  pmsFacade;
	
	// 任务记录列表
		@RequestMapping(value = { "/listBy" }, method = RequestMethod.GET)
		@ResponseBody
		public Object listBy(
		        // 页码
				Integer page,
				// 一页条数
				Integer rows,
				Integer status,				
				//开始时间
	            String startDate,
	            //结束时间
	            String endDate,
	            //用户编码
	            String userNo,	          
				HttpServletRequest request, 
				HttpSession session) {
			Map<String, Object> uiModel = new HashMap<String, Object>();
			Map<String, Object> paramMap = new HashMap<String, Object>();
			PageParam pageParam = null;
			PageBean pageBean = null;

			String userid = request.getParameter("userid");
			PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			
			if (page == null || rows == null) {
				pageParam = new PageParam(1, 10);
			} else {
				pageParam = new PageParam(page, rows);
			}
			paramMap.put("status", status);
			paramMap.put("userNo", userNo);
			paramMap.put("startTime", startDate);
			paramMap.put("endTime", endDate);
			try {

				pageBean = taskRecordFacade.listPage(pageParam, paramMap);
				
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
			TaskRecord taskRecord= new TaskRecord();
			String userid = request.getParameter("userid");
			PmsOperator admin = pmsFacade.getOperatorById(Long.valueOf(userid));
			try {
				
				taskRecord = taskRecordFacade.getById(id);
			} catch (Exception exception) {
				setErrorMessage(exception, uiModel);
				return uiModel;
			}

			uiModel.put("taskRecord", taskRecord);

			return uiModel;
		}
		
		// 更新管理员
		@RequestMapping(value = "/update", method = RequestMethod.POST)
		@ResponseBody
		public Object update(
				Long id, Integer status,  String taskValue,
				HttpServletRequest request) {
			Map<String, Object> uiModel = new HashMap<String, Object>();
			String userid = request.getParameter("userid");
			PmsOperator currAdmin = pmsFacade.getOperatorById(Long.valueOf(userid));		

			TaskRecord taskRecord = taskRecordFacade.getById(id);
			try {

				taskRecord.setStatus(status);
				taskRecord.setTaskValue(Double.valueOf(taskValue));
				taskRecordFacade.update(taskRecord);
				
				pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
						PmsOperatorLogStatusEnum.SUCCESS, "更新任务记录", currAdmin,
						WebUtils.getIpAddr(request));
			} catch (Exception exception) {
				pmsFacade.createOperatorLog(PmsOperatorLogTypeEnum.EDIT,
						PmsOperatorLogStatusEnum.ERROR, "更新任务记录", currAdmin,
						WebUtils.getIpAddr(request));
				setErrorMessage(exception, uiModel);
				return uiModel;
			}

			uiModel.put("result", "SUCCESS");
			return uiModel;
		}

		@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
		@ResponseBody
		public Object constants() {
			Map<String, Object> uiModel = new HashMap<String, Object>();
			uiModel.put("taskStatusList", TaskStatusEnum.toList());
			uiModel.put("awardTypeList", AwardTypeEnum.toList());		
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
