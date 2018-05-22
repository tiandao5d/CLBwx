package com.genlot.ushop.web.admin.sns.controller;

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
import com.genlot.ushop.facade.sns.entity.AnnounceInfo;
import com.genlot.ushop.facade.sns.enums.AdvertPostitionTypeEnum;
import com.genlot.ushop.facade.sns.enums.AnnounceTypeEnum;
import com.genlot.ushop.facade.sns.enums.BannerRelationTypeEnum;
import com.genlot.ushop.facade.sns.service.NotifyManagementFacade;

@Controller
@RequestMapping( value ="/sns/announce")
public class AnnounceController {
	
	private static final Logger log = LoggerFactory.getLogger(AnnounceController.class);
	
	@Autowired
	NotifyManagementFacade notifyManagementFacade;	
	
	@RequestMapping(value="/list" ,method= RequestMethod.GET)
	@ResponseBody
	public Object list(
			//分页
             Integer page,
             Integer rows,
             Integer announceType,
             String  title,
             String startDate,
             String endDate,             
			 HttpServletRequest request,
			 HttpSession session
			) {
		Map<String, Object> uiModel = new HashMap<String, Object>();
		Map<String, Object> paramMap = new HashMap<String, Object>();
		PageParam pageParam = null;
		PageBean pageBean = null;

		
		if (page == null || rows == null) {
			pageParam = new PageParam(1, 10);
		} else {
			pageParam = new PageParam(page, rows);
		}
		try {
			if(title != null){
				title = title.trim();
			}
			
			paramMap.put("type", announceType);	
			paramMap.put("beginTime", startDate);
			paramMap.put("endTime", endDate);
			paramMap.put("title", title);
		    pageBean = notifyManagementFacade.listPageAnnounce(pageParam, paramMap);
		    
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
	
	
	//添加通告
		@ResponseBody
		@RequestMapping(value="/add", method = RequestMethod.POST)
		public Object add(
				String beginTime,
				String content,
				Integer type,
				Integer valid,
				String endTime,
				String title,
				String sender,
				
				HttpServletRequest request)
		{
			Map<String, Object> uiModel = new HashMap<String, Object>();
			AnnounceInfo announceInfo = new AnnounceInfo();
			
			try{
				announceInfo.setBeginTime(beginTime);
				announceInfo.setContent(content);
				announceInfo.setEndTime(endTime);
				announceInfo.setType(type);
				announceInfo.setValid(valid);
				announceInfo.setSender(sender);
				announceInfo.setTitle(title);
				notifyManagementFacade.insert(announceInfo);
			}catch(Exception exception)
			{
				setErrorMessage(exception, uiModel);
				String json = JSON.toJSONString(uiModel);
				return json;				
			}
			uiModel.put("data", "SUCCESS");
			return uiModel;
		}
		
		
		//编辑通告
			@ResponseBody
			@RequestMapping(value="/edit", method = RequestMethod.POST)
			public Object edit(
					Integer id,
					String beginTime,
					String content,
					Integer type,
					Integer valid,
					String endTime,
					String title,
					String sender,
					HttpServletRequest request)
			{
				Map<String, Object> uiModel = new HashMap<String, Object>();
				AnnounceInfo announceInfo = notifyManagementFacade.getById(id);
				
				try{
					announceInfo.setBeginTime(beginTime);
					announceInfo.setContent(content);
					announceInfo.setEndTime(endTime);
					announceInfo.setType(type);
					announceInfo.setValid(valid);
					announceInfo.setSender(sender);
					announceInfo.setTitle(title);
					notifyManagementFacade.update(announceInfo);
				}catch(Exception exception)
				{
					setErrorMessage(exception, uiModel);
					String json = JSON.toJSONString(uiModel);
					return json;				
				}
				uiModel.put("data", "SUCCESS");
				return uiModel;
			}
			
			//删除通告
			@ResponseBody
			@RequestMapping(value="/delete", method = RequestMethod.POST)
			public Object delete(
					Integer id,
					HttpServletRequest request)
			{
				Map<String, Object> uiModel = new HashMap<String, Object>();
				
				try{	
					notifyManagementFacade.deleteAnnounceById(id);
				}catch(Exception exception)
				{
					setErrorMessage(exception, uiModel);
					String json = JSON.toJSONString(uiModel);
					return json;				
				}
				uiModel.put("data", "SUCCESS");
				return uiModel;
			}
			
			//通过ID获得对象
			@ResponseBody
			@RequestMapping(value = "/getById", method = RequestMethod.GET)
			public Object getById(
					Long id){
				Map<String,Object> uiModel = new HashMap<String,Object>();
				if(id==null || id.intValue() == 0){
					
					return "id IS NULL";
					
				}
				
				AnnounceInfo announce = notifyManagementFacade.getById(id.intValue());
				uiModel.put("announce", announce);
				return uiModel;
			}
			@RequestMapping(value = "/getConstants", method = RequestMethod.GET)
			@ResponseBody
			public Object constants() {
				Map<String, Object> uiModel = new HashMap<String, Object>();
				//通告所属模块
				List announceTypeList =AnnounceTypeEnum.toList();
				uiModel.put("announceTypeList", announceTypeList);
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
